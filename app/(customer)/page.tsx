"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Header } from "@/components/ui/Header";
import { BannerCarousel } from "@/components/ui/BannerCarousel";
import { SearchBar } from "@/components/ui/SearchBar";
import { CategoryChips } from "@/components/ui/CategoryChip";
import { MenuCard } from "@/components/ui/MenuCard";
import { categories, menuItems, type MenuCategory } from "@/lib/data/menu";

const chipCategories: { id: MenuCategory | "all"; label: string }[] = [
  { id: "all", label: "All" },
  ...categories,
];

const gridVariants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.06 },
  },
};

export default function HomePage() {
  const [active, setActive] = useState<MenuCategory | "all">("all");

  const visibleItems = useMemo(
    () =>
      active === "all"
        ? menuItems
        : menuItems.filter((item) => item.category === active),
    [active]
  );

  return (
    <main className="flex min-h-screen flex-col gap-5 pb-28">
      <Header />
      <BannerCarousel />

      <div className="px-4">
        <SearchBar />
      </div>

      <CategoryChips
        categories={chipCategories}
        active={active}
        onChange={setActive}
      />

      <section className="flex flex-col gap-3 px-4">
        <div className="flex items-baseline justify-between">
          <h2 className="font-display text-lg font-bold text-ink">
            Popular Dishes
          </h2>
          <span className="text-xs text-ink-muted">
            {visibleItems.length} items
          </span>
        </div>

        <motion.div
          key={active}
          variants={gridVariants}
          initial="hidden"
          animate="show"
          className="grid grid-cols-2 gap-3"
        >
          {visibleItems.map((item) => (
            <MenuCard key={item.id} item={item} />
          ))}
        </motion.div>
      </section>
    </main>
  );
}
