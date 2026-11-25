"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion, type PanInfo } from "framer-motion";
import { banners } from "@/lib/data/banners";

const AUTO_ROTATE_MS = 4500;
const SWIPE_CONFIDENCE_THRESHOLD = 6000;
const SWIPE_DISTANCE_THRESHOLD = 80;

function wrap(min: number, max: number, value: number) {
  const range = max - min;
  return ((((value - min) % range) + range) % range) + min;
}

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? "100%" : "-100%",
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction > 0 ? "-100%" : "100%",
    opacity: 0,
  }),
};

export function BannerCarousel() {
  const [[page, direction], setPage] = useState<[number, number]>([0, 0]);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const activeIndex = wrap(0, banners.length, page);
  const activeBanner = banners[activeIndex];

  const paginate = useCallback((newDirection: number) => {
    setPage(([prev]) => [prev + newDirection, newDirection]);
  }, []);

  const goTo = useCallback(
    (target: number) => {
      setPage(([prev]) => {
        const prevWrapped = wrap(0, banners.length, prev);
        return [prev + (target - prevWrapped), target > prevWrapped ? 1 : -1];
      });
    },
    []
  );

  const clearTimer = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
  }, []);

  const resetTimer = useCallback(() => {
    clearTimer();
    timerRef.current = setTimeout(() => paginate(1), AUTO_ROTATE_MS);
  }, [clearTimer, paginate]);

  // Auto-rotate; restarts whenever the active slide changes (auto or manual).
  useEffect(() => {
    resetTimer();
    return clearTimer;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const handleDragEnd = (
    _event: MouseEvent | TouchEvent | PointerEvent,
    info: PanInfo
  ) => {
    const swipePower = Math.abs(info.offset.x) * info.velocity.x;

    if (swipePower < -SWIPE_CONFIDENCE_THRESHOLD || info.offset.x < -SWIPE_DISTANCE_THRESHOLD) {
      paginate(1);
    } else if (
      swipePower > SWIPE_CONFIDENCE_THRESHOLD ||
      info.offset.x > SWIPE_DISTANCE_THRESHOLD
    ) {
      paginate(-1);
    } else {
      // Not a decisive swipe — just restart the auto-rotate countdown.
      resetTimer();
    }
  };

  return (
    <div className="flex flex-col gap-2.5">
      <div className="relative mx-4 aspect-[12/5] overflow-hidden rounded-card bg-cream-dark">
        <AnimatePresence initial={false} custom={direction}>
          <motion.div
            key={activeBanner.id}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: "spring", stiffness: 320, damping: 34 },
              opacity: { duration: 0.2 },
            }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.7}
            onDragStart={clearTimer}
            onDragEnd={handleDragEnd}
            className="absolute inset-0"
          >
            <Image
              src={activeBanner.image}
              alt={activeBanner.alt}
              fill
              sizes="430px"
              className="pointer-events-none object-cover"
              priority={activeIndex === 0}
            />
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="flex items-center justify-center gap-1.5">
        {banners.map((b, i) => {
          const isActive = i === activeIndex;
          return (
            <button
              key={b.id}
              type="button"
              aria-label={`Go to slide ${i + 1}`}
              onClick={() => goTo(i)}
              className="p-1"
            >
              <motion.span
                animate={{
                  width: isActive ? 18 : 6,
                  opacity: isActive ? 1 : 0.45,
                }}
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
                className={`block h-1.5 rounded-pill ${
                  isActive ? "bg-mustard" : "bg-ink-muted"
                }`}
              />
            </button>
          );
        })}
      </div>
    </div>
  );
}
