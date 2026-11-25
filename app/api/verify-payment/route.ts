import { NextResponse } from "next/server";
import { createHmac, timingSafeEqual } from "node:crypto";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

interface VerifyPaymentBody {
  orderId: string; // our Supabase orders.id
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

export async function POST(request: Request) {
  let body: VerifyPaymentBody;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const { orderId, razorpay_order_id, razorpay_payment_id, razorpay_signature } =
    body;

  if (!orderId || !razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    return NextResponse.json(
      { error: "Missing payment verification fields." },
      { status: 400 }
    );
  }

  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keySecret) {
    return NextResponse.json(
      { error: "Razorpay is not configured on the server." },
      { status: 500 }
    );
  }

  // Razorpay's documented signature check:
  // hmac_sha256(razorpay_order_id + "|" + razorpay_payment_id, key_secret)
  const expectedSignature = createHmac("sha256", keySecret)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest("hex");

  const expected = Buffer.from(expectedSignature, "utf8");
  const actual = Buffer.from(razorpay_signature, "utf8");
  const isValid =
    expected.length === actual.length && timingSafeEqual(expected, actual);

  const supabaseAdmin = getSupabaseAdmin();

  if (!isValid) {
    await supabaseAdmin
      .from("orders")
      .update({ payment_status: "failed" })
      .eq("id", orderId)
      .eq("razorpay_order_id", razorpay_order_id);

    return NextResponse.json(
      { error: "Payment verification failed." },
      { status: 400 }
    );
  }

  const { error } = await supabaseAdmin
    .from("orders")
    .update({
      payment_status: "paid",
      order_status: "confirmed",
      razorpay_payment_id,
    })
    .eq("id", orderId)
    .eq("razorpay_order_id", razorpay_order_id);

  if (error) {
    console.error("[verify-payment] Supabase update failed:", error);
    return NextResponse.json(
      { error: "Payment verified, but we couldn't update your order. Contact support." },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true, orderId });
}
