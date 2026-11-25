"use client";

import { motion } from "framer-motion";
import type { MenuCategory } from "@/lib/data/menu";

interface CategoryChipsProps {
  categories: { id: MenuCategory | "all"; label: string }[];
  active: MenuCategory | "all";
  onChange: (id: MenuCategory | "all") => void;
}

export function CategoryChips({ categories, active, onChange }: CategoryChipsProps) {
  return (
    <div className="scrollbar-hide flex gap-2 overflow-x-auto px-4">
      {categories.map((cat) => {
        const isActive = cat.id === active;
        return (
          <motion.button
            key={cat.id}
            type="button"
            onClick={() => onChange(cat.id)}
            whileTap={{ scale: 0.94 }}
            className="relative shrink-0 rounded-pill px-4 py-2 text-sm font-medium"
          >
            {isActive && (
              <motion.span
                layoutId="active-chip"
                transition={{ type: "spring", stiffness: 400, damping: 32 }}
                className="absolute inset-0 rounded-pill bg-maroon"
              />
            )}
            <span
              className={`relative z-10 ${
                isActive ? "text-cream" : "text-ink-muted"
              }`}
            >
              {cat.label}
            </span>
          </motion.button>
        );
      })}
    </div>
  );
}
