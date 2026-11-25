"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { CheckCircle2, Clock, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { useCartStore } from "@/store/useCartStore";

interface OrderItemRow {
  id: string;
  item_name: string;
  item_price: number;
  quantity: number;
}

interface OrderRow {
  id: string;
  guest_name: string;
  delivery_address: string;
  subtotal: number;
  delivery_fee: number;
  total_amount: number;
  payment_status: "pending" | "paid" | "failed";
  order_status: string;
  created_at: string;
}

export default function OrderConfirmedPage({
  params,
}: PageProps<"/order-confirmed/[orderId]">) {
  const { orderId } = use(params);
  const clearCart = useCartStore((s) => s.clearCart);

  const [order, setOrder] = useState<OrderRow | null>(null);
  const [items, setItems] = useState<OrderItemRow[]>([]);
  const [status, setStatus] = useState<"loading" | "ready" | "error">(
    "loading"
  );

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const [{ data: orderData, error: orderError }, { data: itemsData }] =
        await Promise.all([
          supabase.from("orders").select("*").eq("id", orderId).single(),
          supabase
            .from("order_items")
            .select("id, item_name, item_price, quantity")
            .eq("order_id", orderId),
        ]);

      if (cancelled) return;

      if (orderError || !orderData) {
        setStatus("error");
        return;
      }

      setOrder(orderData as OrderRow);
      setItems((itemsData as OrderItemRow[]) ?? []);
      setStatus("ready");
      // Order is confirmed on screen now — safe to clear the guest's cart.
      clearCart();
    }

    load();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId]);

  if (status === "loading") {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-3">
        <Loader2 size={24} className="animate-spin text-maroon" />
        <p className="text-sm text-ink-muted">Loading your order…</p>
      </main>
    );
  }

  if (status === "error" || !order) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-3 px-8 text-center">
        <p className="font-display text-base font-bold text-ink">
          We couldn&apos;t find that order
        </p>
        <p className="text-sm text-ink-muted">
          The link may be incorrect, or the order no longer exists.
        </p>
        <Link
          href="/"
          className="mt-2 rounded-pill bg-mustard px-6 py-2.5 text-sm font-bold text-maroon-dark"
        >
          Back to Home
        </Link>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center gap-6 px-6 pb-10 pt-12 text-center">
      <motion.div
        initial={{ scale: 0.6, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 18 }}
        className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100"
      >
        <CheckCircle2 size={40} className="text-emerald-600" />
      </motion.div>

      <div className="flex flex-col gap-1">
        <h1 className="font-display text-xl font-bold text-ink">
          Order placed!
        </h1>
        <p className="text-sm text-ink-muted">
          Thanks{order.guest_name ? `, ${order.guest_name.split(" ")[0]}` : ""}
          — your Andhra meal is on its way.
        </p>
      </div>

      <div className="flex w-full flex-col gap-3 rounded-card border border-border bg-white p-4 text-left">
        <div className="flex items-center justify-between border-b border-border pb-2">
          <span className="text-xs text-ink-muted">Order ID</span>
          <span className="text-xs font-semibold text-ink">
            {order.id.slice(0, 8).toUpperCase()}
          </span>
        </div>

        <div className="flex flex-col gap-1.5">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between text-xs text-ink-muted"
            >
              <span>
                {item.item_name} × {item.quantity}
              </span>
              <span className="text-ink">
                ₹{item.item_price * item.quantity}
              </span>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between border-t border-border pt-2 font-display text-base font-bold text-ink">
          <span>Total paid</span>
          <span>₹{order.total_amount}</span>
        </div>

        <p className="text-xs text-ink-muted">
          Delivering to: <span className="text-ink">{order.delivery_address}</span>
        </p>
      </div>

      <div className="flex w-full items-center gap-2 rounded-card bg-cream-dark p-3.5 text-left">
        <Clock size={18} className="shrink-0 text-maroon" />
        <p className="text-xs text-ink-muted">
          Estimated delivery in <span className="text-ink">35–45 minutes</span>.
          Save this page&apos;s link to track your order status.
        </p>
      </div>

      <Link
        href="/"
        className="w-full max-w-[398px] rounded-pill bg-mustard py-3 text-center text-sm font-bold text-maroon-dark shadow-lg"
      >
        Back to Home
      </Link>
    </main>
  );
}
