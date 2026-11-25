import { NextResponse } from "next/server";
import Razorpay from "razorpay";
import { createClient } from "@supabase/supabase-js";
import { menuItems } from "@/lib/data/menu";
import { getOrderTotals } from "@/lib/pricing";

interface CartItemPayload {
  menuItemId: string;
  quantity: number;
}

interface CreateOrderBody {
  items: CartItemPayload[];
  guestName: string;
  guestPhone: string;
  deliveryAddress: string;
  notes?: string;
}

const PHONE_REGEX = /^[6-9]\d{9}$/;

export async function POST(request: Request) {
  let body: CreateOrderBody;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const { items, guestName, guestPhone, deliveryAddress, notes } = body;

  // --- Validate guest details -------------------------------------------------
  if (!guestName?.trim()) {
    return NextResponse.json({ error: "Name is required." }, { status: 400 });
  }
  if (!guestPhone || !PHONE_REGEX.test(guestPhone.trim())) {
    return NextResponse.json(
      { error: "Enter a valid 10-digit phone number." },
      { status: 400 }
    );
  }
  if (!deliveryAddress?.trim()) {
    return NextResponse.json(
      { error: "Delivery address is required." },
      { status: 400 }
    );
  }
  if (!Array.isArray(items) || items.length === 0) {
    return NextResponse.json({ error: "Cart is empty." }, { status: 400 });
  }

  // --- Recompute the order server-side from trusted menu data -----------------
  // Never trust cart totals sent from the client — look every item up by id
  // and price it from `menuItems`, the same data the menu screen reads from.
  let subtotal = 0;
  const resolvedItems: {
    menuItemId: string;
    name: string;
    price: number;
    quantity: number;
  }[] = [];

  for (const raw of items) {
    const quantity = Number(raw?.quantity);
    if (!Number.isInteger(quantity) || quantity <= 0 || quantity > 50) {
      return NextResponse.json(
        { error: "Invalid item quantity." },
        { status: 400 }
      );
    }

    const menuItem = menuItems.find((m) => m.id === raw.menuItemId);
    if (!menuItem) {
      return NextResponse.json(
        { error: `Unknown item in cart: ${raw?.menuItemId}` },
        { status: 400 }
      );
    }

    subtotal += menuItem.price * quantity;
    resolvedItems.push({
      menuItemId: menuItem.id,
      name: menuItem.name,
      price: menuItem.price,
      quantity,
    });
  }

  const { deliveryFee, total } = getOrderTotals(subtotal);

  // --- Create the Razorpay order (test mode) -----------------------------------
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    return NextResponse.json(
      {
        error:
          "Razorpay is not configured yet. Add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET to .env.local (test mode keys from the Razorpay dashboard).",
      },
      { status: 500 }
    );
  }

  const razorpay = new Razorpay({ key_id: keyId, key_secret: keySecret });

  let razorpayOrder;
  try {
    razorpayOrder = await razorpay.orders.create({
      amount: Math.round(total * 100), // paise
      currency: "INR",
      receipt: `andra_${Date.now()}`,
      notes: { guestName, guestPhone },
    });
  } catch (err) {
    console.error("[create-order] Razorpay order creation failed:", err);
    return NextResponse.json(
      { error: "Could not start payment. Please try again." },
      { status: 502 }
    );
  }

  // --- Persist a pending order in Supabase -------------------------------------
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return NextResponse.json(
      {
        error:
          "Supabase is not configured yet. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to .env.local.",
      },
      { status: 500 }
    );
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert({
      guest_name: guestName.trim(),
      guest_phone: guestPhone.trim(),
      delivery_address: deliveryAddress.trim(),
      notes: notes?.trim() || null,
      subtotal,
      delivery_fee: deliveryFee,
      total_amount: total,
      payment_status: "pending",
      razorpay_order_id: razorpayOrder.id,
      order_status: "placed",
    })
    .select("id")
    .single();

  if (orderError || !order) {
    console.error("[create-order] Supabase order insert failed:", orderError);
    return NextResponse.json(
      { error: "Could not save your order. Please try again." },
      { status: 500 }
    );
  }

  const { error: itemsError } = await supabase.from("order_items").insert(
    resolvedItems.map((item) => ({
      order_id: order.id,
      menu_item_id: item.menuItemId,
      item_name: item.name,
      item_price: item.price,
      quantity: item.quantity,
    }))
  );

  if (itemsError) {
    console.error("[create-order] Supabase order_items insert failed:", itemsError);
    return NextResponse.json(
      { error: "Could not save your order items. Please try again." },
      { status: 500 }
    );
  }

  return NextResponse.json({
    orderId: order.id,
    razorpayOrderId: razorpayOrder.id,
    amount: razorpayOrder.amount,
    currency: razorpayOrder.currency,
    total,
  });
}
