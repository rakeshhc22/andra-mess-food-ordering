"use client";

import { useState } from "react";
import Script from "next/script";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useCartStore } from "@/store/useCartStore";
import { getOrderTotals } from "@/lib/pricing";
import type { RazorpayCheckoutResponse } from "@/types/razorpay";

const PHONE_REGEX = /^[6-9]\d{9}$/;

interface FormState {
  name: string;
  phone: string;
  address: string;
  notes: string;
}

interface FormErrors {
  name?: string;
  phone?: string;
  address?: string;
}

export default function CheckoutPage() {
  const router = useRouter();
  const items = useCartStore((s) => s.items);

  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const { deliveryFee, total } = getOrderTotals(subtotal);

  const [scriptReady, setScriptReady] = useState(false);
  const [form, setForm] = useState<FormState>({
    name: "",
    phone: "",
    address: "",
    notes: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const updateField = (field: keyof FormState, value: string) => {
    setForm((f) => ({ ...f, [field]: value }));
    setErrors((e) => ({ ...e, [field]: undefined }));
  };

  const validate = (): boolean => {
    const next: FormErrors = {};
    if (!form.name.trim()) next.name = "Enter your name.";
    if (!PHONE_REGEX.test(form.phone.trim()))
      next.phone = "Enter a valid 10-digit mobile number.";
    if (!form.address.trim()) next.address = "Enter a delivery address.";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handlePay = async () => {
    setServerError(null);
    if (items.length === 0) {
      setServerError("Your cart is empty.");
      return;
    }
    if (!validate()) return;

    setSubmitting(true);
    try {
      const res = await fetch("/api/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((i) => ({
            menuItemId: i.menuItemId,
            quantity: i.quantity,
          })),
          guestName: form.name,
          guestPhone: form.phone,
          deliveryAddress: form.address,
          notes: form.notes,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setServerError(data.error ?? "Something went wrong. Please try again.");
        setSubmitting(false);
        return;
      }

      if (!scriptReady || typeof window === "undefined" || !window.Razorpay) {
        setServerError(
          "Payment couldn't start — the Razorpay checkout script hasn't loaded. Check your connection and try again."
        );
        setSubmitting(false);
        return;
      }

      const razorpay = new window.Razorpay({
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID ?? "",
        amount: data.amount,
        currency: data.currency,
        name: "ANDRA MESS",
        description: `Order for ${form.name}`,
        order_id: data.razorpayOrderId,
        prefill: {
          name: form.name,
          contact: form.phone,
        },
        theme: { color: "#8b1e2b" },
        handler: async (response: RazorpayCheckoutResponse) => {
          try {
            const verifyRes = await fetch("/api/verify-payment", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                orderId: data.orderId,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }),
            });

            if (!verifyRes.ok) {
              const verifyData = await verifyRes.json();
              setServerError(
                verifyData.error ?? "Payment verification failed."
              );
              setSubmitting(false);
              return;
            }

            // Cart is cleared on the confirmation page once it has
            // successfully loaded the paid order, not here — that way a
            // reload or a flaky navigation never loses the cart before
            // the order is confirmed on screen.
            router.push(`/order-confirmed/${data.orderId}`);
          } catch {
            setServerError(
              "Payment went through, but we couldn't confirm it. Please contact support with your payment ID."
            );
            setSubmitting(false);
          }
        },
        modal: {
          ondismiss: () => setSubmitting(false),
        },
      });

      razorpay.open();
    } catch {
      setServerError("Something went wrong. Please try again.");
      setSubmitting(false);
    }
  };

  return (
    <main className="flex min-h-screen flex-col pb-32">
      <Script
        src="https://checkout.razorpay.com/v1/checkout.js"
        strategy="lazyOnload"
        onLoad={() => setScriptReady(true)}
      />

      <header className="flex items-center gap-3 px-4 pb-2 pt-5">
        <button
          type="button"
          aria-label="Go back"
          onClick={() => router.back()}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-cream-dark text-ink"
        >
          <ArrowLeft size={17} />
        </button>
        <h1 className="font-display text-lg font-bold text-ink">Checkout</h1>
      </header>

      <section className="flex flex-col gap-3 px-4 pt-3">
        <h2 className="font-display text-sm font-bold text-ink">
          Delivery Details
        </h2>

        <label className="flex flex-col gap-1">
          <span className="text-xs font-medium text-ink-muted">Full name</span>
          <input
            type="text"
            value={form.name}
            onChange={(e) => updateField("name", e.target.value)}
            placeholder="e.g. Priya Reddy"
            className="rounded-chip border border-border bg-white px-3.5 py-2.5 text-sm text-ink placeholder:text-ink-muted focus:outline-none focus:ring-1 focus:ring-maroon"
          />
          {errors.name && (
            <span className="text-xs text-maroon">{errors.name}</span>
          )}
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-xs font-medium text-ink-muted">
            Phone number
          </span>
          <input
            type="tel"
            inputMode="numeric"
            value={form.phone}
            onChange={(e) =>
              updateField("phone", e.target.value.replace(/[^\d]/g, "").slice(0, 10))
            }
            placeholder="10-digit mobile number"
            className="rounded-chip border border-border bg-white px-3.5 py-2.5 text-sm text-ink placeholder:text-ink-muted focus:outline-none focus:ring-1 focus:ring-maroon"
          />
          {errors.phone && (
            <span className="text-xs text-maroon">{errors.phone}</span>
          )}
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-xs font-medium text-ink-muted">
            Delivery address
          </span>
          <textarea
            value={form.address}
            onChange={(e) => updateField("address", e.target.value)}
            placeholder="House / flat no., street, area, landmark"
            rows={3}
            className="resize-none rounded-chip border border-border bg-white px-3.5 py-2.5 text-sm text-ink placeholder:text-ink-muted focus:outline-none focus:ring-1 focus:ring-maroon"
          />
          {errors.address && (
            <span className="text-xs text-maroon">{errors.address}</span>
          )}
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-xs font-medium text-ink-muted">
            Order notes (optional)
          </span>
          <input
            type="text"
            value={form.notes}
            onChange={(e) => updateField("notes", e.target.value)}
            placeholder="e.g. less spicy, ring the bell"
            className="rounded-chip border border-border bg-white px-3.5 py-2.5 text-sm text-ink placeholder:text-ink-muted focus:outline-none focus:ring-1 focus:ring-maroon"
          />
        </label>
      </section>

      <section className="mx-4 mt-5 flex flex-col gap-2 rounded-card border border-border bg-white p-4">
        <h2 className="font-display text-sm font-bold text-ink">
          Order Summary
        </h2>

        <div className="flex flex-col gap-1.5">
          {items.map((item) => (
            <div
              key={item.menuItemId}
              className="flex items-center justify-between text-xs text-ink-muted"
            >
              <span>
                {item.name} × {item.quantity}
              </span>
              <span className="text-ink">₹{item.price * item.quantity}</span>
            </div>
          ))}
        </div>

        <div className="mt-1 flex items-center justify-between border-t border-border pt-2 text-sm text-ink-muted">
          <span>Subtotal</span>
          <span className="text-ink">₹{subtotal}</span>
        </div>
        <div className="flex items-center justify-between text-sm text-ink-muted">
          <span>Delivery fee</span>
          <span className="text-ink">
            {deliveryFee === 0 ? "Free" : `₹${deliveryFee}`}
          </span>
        </div>
        <div className="mt-1 flex items-center justify-between border-t border-border pt-2 font-display text-base font-bold text-ink">
          <span>Total</span>
          <span>₹{total}</span>
        </div>
      </section>

      {serverError && (
        <p className="mx-4 mt-4 rounded-chip bg-maroon/10 px-3.5 py-2.5 text-xs text-maroon-dark">
          {serverError}
        </p>
      )}

      <div className="fixed inset-x-0 bottom-0 z-40 flex justify-center bg-gradient-to-t from-cream via-cream/95 to-transparent px-4 pb-[calc(env(safe-area-inset-bottom)+1rem)] pt-6">
        <button
          type="button"
          onClick={handlePay}
          disabled={submitting || items.length === 0}
          className="flex w-full max-w-[398px] items-center justify-center gap-2 rounded-pill bg-mustard py-3 text-center text-sm font-bold text-maroon-dark shadow-lg disabled:opacity-60"
        >
          {submitting ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Processing…
            </>
          ) : (
            `Pay ₹${total}`
          )}
        </button>
      </div>
    </main>
  );
}
