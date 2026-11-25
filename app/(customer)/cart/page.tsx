"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { useCartStore } from "@/store/useCartStore";
import { getOrderTotals, FREE_DELIVERY_THRESHOLD } from "@/lib/pricing";

export default function CartPage() {
  const router = useRouter();
  const items = useCartStore((s) => s.items);
  const incrementQty = useCartStore((s) => s.incrementQty);
  const decrementQty = useCartStore((s) => s.decrementQty);
  const removeItem = useCartStore((s) => s.removeItem);

  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const { deliveryFee, total } = getOrderTotals(subtotal);
  const isEmpty = items.length === 0;

  return (
    <main className="flex min-h-screen flex-col">
      <header className="flex items-center gap-3 px-4 pb-2 pt-5">
        <button
          type="button"
          aria-label="Go back"
          onClick={() => router.back()}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-cream-dark text-ink"
        >
          <ArrowLeft size={17} />
        </button>
        <h1 className="font-display text-lg font-bold text-ink">Your Cart</h1>
      </header>

      {isEmpty ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-4 px-8 pb-24 text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-cream-dark">
            <ShoppingBag size={32} className="text-ink-muted" />
          </div>
          <div className="flex flex-col gap-1">
            <h2 className="font-display text-base font-bold text-ink">
              Your cart is empty
            </h2>
            <p className="text-sm text-ink-muted">
              Add a few Andhra favourites from the menu to get started.
            </p>
          </div>
          <Link
            href="/"
            className="mt-2 rounded-pill bg-mustard px-6 py-2.5 text-sm font-bold text-maroon-dark"
          >
            Browse Menu
          </Link>
        </div>
      ) : (
        <>
          <section className="flex flex-col gap-3 px-4 pb-4">
            <AnimatePresence initial={false}>
              {items.map((item) => (
                <motion.article
                  key={item.menuItemId}
                  layout
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                  transition={{ duration: 0.25 }}
                  className="flex gap-3 rounded-card border border-border bg-white p-3"
                >
                  <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-[0.875rem] bg-cream-dark">
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      sizes="64px"
                      className="object-cover"
                    />
                  </div>

                  <div className="flex flex-1 flex-col justify-between">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-display text-sm font-semibold leading-snug text-ink">
                        {item.name}
                      </h3>
                      <button
                        type="button"
                        aria-label={`Remove ${item.name} from cart`}
                        onClick={() => removeItem(item.menuItemId)}
                        className="shrink-0 text-ink-muted"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-xs text-ink-muted">
                        ₹{item.price} each
                      </span>

                      <div className="flex items-center gap-2">
                        <div className="flex h-7 items-center gap-2 rounded-full bg-maroon px-1 text-cream">
                          <button
                            type="button"
                            aria-label={`Remove one ${item.name}`}
                            onClick={() => decrementQty(item.menuItemId)}
                            className="flex h-5 w-5 items-center justify-center rounded-full"
                          >
                            <Minus size={12} strokeWidth={2.5} />
                          </button>
                          <span className="w-3 text-center text-xs font-semibold tabular-nums">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            aria-label={`Add one more ${item.name}`}
                            onClick={() => incrementQty(item.menuItemId)}
                            className="flex h-5 w-5 items-center justify-center rounded-full"
                          >
                            <Plus size={12} strokeWidth={2.5} />
                          </button>
                        </div>

                        <span className="w-12 text-right font-display text-sm font-bold text-maroon-dark">
                          ₹{item.price * item.quantity}
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.article>
              ))}
            </AnimatePresence>
          </section>

          <section className="mx-4 mb-32 flex flex-col gap-2 rounded-card border border-border bg-white p-4">
            <h2 className="font-display text-sm font-bold text-ink">
              Order Summary
            </h2>

            <div className="flex items-center justify-between text-sm text-ink-muted">
              <span>Subtotal</span>
              <span className="text-ink">₹{subtotal}</span>
            </div>

            <div className="flex items-center justify-between text-sm text-ink-muted">
              <span>Delivery fee</span>
              <span className="text-ink">
                {deliveryFee === 0 ? "Free" : `₹${deliveryFee}`}
              </span>
            </div>

            {deliveryFee > 0 && (
              <p className="text-[11px] text-ink-muted">
                Free delivery on orders above ₹{FREE_DELIVERY_THRESHOLD}.
              </p>
            )}

            <div className="mt-1 flex items-center justify-between border-t border-border pt-2 font-display text-base font-bold text-ink">
              <span>Total</span>
              <span>₹{total}</span>
            </div>
          </section>

          <div className="fixed inset-x-0 bottom-0 z-40 flex justify-center bg-gradient-to-t from-cream via-cream/95 to-transparent px-4 pb-[calc(env(safe-area-inset-bottom)+1rem)] pt-6">
            <button
              type="button"
              onClick={() => router.push("/checkout")}
              className="w-full max-w-[398px] rounded-pill bg-mustard py-3 text-center text-sm font-bold text-maroon-dark shadow-lg"
            >
              Proceed to Checkout
            </button>
          </div>
        </>
      )}
    </main>
  );
}
