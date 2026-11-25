"use client";

import { useRouter, usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { ShoppingBag } from "lucide-react";
import { useCartStore } from "@/store/useCartStore";

// Pages where the cart itself is already the focus — the bar would be
// redundant (or actively in the way) here.
const HIDDEN_ON = ["/cart", "/checkout"];

export function FloatingCartBar() {
  const router = useRouter();
  const pathname = usePathname();

  const totalItems = useCartStore((s) => s.totalItems());
  const totalAmount = useCartStore((s) => s.totalAmount());

  const shouldHideForRoute =
    HIDDEN_ON.some((p) => pathname?.startsWith(p)) ||
    Boolean(pathname?.startsWith("/order-confirmed"));

  const visible = totalItems > 0 && !shouldHideForRoute;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 72, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 72, opacity: 0 }}
          transition={{ type: "spring", stiffness: 380, damping: 34 }}
          className="fixed inset-x-0 bottom-0 z-40 flex justify-center px-4 pb-[calc(env(safe-area-inset-bottom)+1rem)]"
        >
          <button
            type="button"
            onClick={() => router.push("/cart")}
            className="flex w-full max-w-[398px] items-center justify-between gap-3 rounded-pill bg-maroon px-3 py-2.5 text-cream shadow-lg shadow-maroon-dark/30"
          >
            <span className="flex items-center gap-2.5">
              <span className="relative flex h-9 w-9 items-center justify-center rounded-full bg-white/15">
                <ShoppingBag size={17} />
                <span className="absolute -right-1 -top-1 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-mustard px-1 text-[10px] font-bold text-maroon-dark">
                  {totalItems}
                </span>
              </span>
              <span className="text-sm font-medium">
                {totalItems} {totalItems === 1 ? "item" : "items"} |{" "}
                <span className="font-semibold">₹{totalAmount}</span>
              </span>
            </span>

            <span className="flex items-center gap-1 rounded-pill bg-mustard px-3.5 py-1.5 text-xs font-bold text-maroon-dark">
              View Cart →
            </span>
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
