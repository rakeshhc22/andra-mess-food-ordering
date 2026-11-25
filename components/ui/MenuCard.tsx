"use client";

import { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Heart, Minus, Plus, Star } from "lucide-react";
import type { MenuItem } from "@/lib/data/menu";
import { useCartStore } from "@/store/useCartStore";

interface MenuCardProps {
  item: MenuItem;
}

export function MenuCard({ item }: MenuCardProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [liked, setLiked] = useState(false);

  const quantity = useCartStore((s) => s.quantityOf(item.id));
  const addItem = useCartStore((s) => s.addItem);
  const incrementQty = useCartStore((s) => s.incrementQty);
  const decrementQty = useCartStore((s) => s.decrementQty);

  const handleAdd = () =>
    addItem({
      menuItemId: item.id,
      name: item.name,
      image: item.image,
      price: item.price,
    });

  return (
    <motion.article
      variants={{
        hidden: { opacity: 0, y: 16 },
        show: { opacity: 1, y: 0 },
      }}
      className="flex flex-col overflow-hidden rounded-card border border-border bg-white"
    >
      <div className="relative aspect-[4/3] w-full bg-cream-dark">
        {!imageLoaded && (
          <div className="absolute inset-0 animate-pulse bg-cream-dark" />
        )}
        <Image
          src={item.image}
          alt={item.name}
          fill
          sizes="(max-width: 430px) 50vw, 215px"
          className={`object-cover transition-opacity duration-500 ${
            imageLoaded ? "opacity-100" : "opacity-0"
          }`}
          onLoad={() => setImageLoaded(true)}
        />

        {/* Veg indicator */}
        <div className="absolute left-2 top-2 flex h-4 w-4 items-center justify-center rounded-[3px] border border-emerald-600 bg-white">
          <span className="h-2 w-2 rounded-full bg-emerald-600" />
        </div>

        {/* Wishlist */}
        <button
          type="button"
          aria-label={liked ? "Remove from wishlist" : "Add to wishlist"}
          onClick={() => setLiked((v) => !v)}
          className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-white/90 backdrop-blur-sm"
        >
          <motion.span whileTap={{ scale: 1.3 }} className="flex">
            <Heart
              size={15}
              className={liked ? "fill-maroon text-maroon" : "text-ink-muted"}
            />
          </motion.span>
        </button>
      </div>

      <div className="flex flex-1 flex-col gap-1 p-3">
        <div className="flex items-center gap-1 text-xs font-medium text-ink-muted">
          <Star size={12} className="fill-mustard text-mustard" />
          <span className="text-ink">{item.rating}</span>
          <span>({item.reviewCount})</span>
        </div>

        <h3 className="font-display text-[15px] font-semibold leading-snug text-ink">
          {item.name}
        </h3>

        <p className="line-clamp-2 text-xs leading-relaxed text-ink-muted">
          {item.description}
        </p>

        <div className="mt-1.5 flex items-center justify-between">
          <span className="font-display text-base font-bold text-maroon-dark">
            ₹{item.price}
          </span>

          {quantity === 0 ? (
            <motion.button
              type="button"
              aria-label={`Add ${item.name}`}
              whileTap={{ scale: 0.85 }}
              onClick={handleAdd}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-maroon text-cream shadow-sm"
            >
              <Plus size={16} strokeWidth={2.5} />
            </motion.button>
          ) : (
            <div className="flex h-8 items-center gap-2 rounded-full bg-maroon px-1 text-cream shadow-sm">
              <motion.button
                type="button"
                aria-label={`Remove one ${item.name}`}
                whileTap={{ scale: 0.85 }}
                onClick={() => decrementQty(item.id)}
                className="flex h-6 w-6 items-center justify-center rounded-full"
              >
                <Minus size={13} strokeWidth={2.5} />
              </motion.button>
              <span className="w-3 text-center text-xs font-semibold tabular-nums">
                {quantity}
              </span>
              <motion.button
                type="button"
                aria-label={`Add one more ${item.name}`}
                whileTap={{ scale: 0.85 }}
                onClick={() => incrementQty(item.id)}
                className="flex h-6 w-6 items-center justify-center rounded-full"
              >
                <Plus size={13} strokeWidth={2.5} />
              </motion.button>
            </div>
          )}
        </div>
      </div>
    </motion.article>
  );
}
