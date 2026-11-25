"use client";

import { Bell, MapPin, User } from "lucide-react";

export function Header() {
  return (
    <header className="flex flex-col gap-3 px-4 pt-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-maroon">
            <span className="font-display text-lg font-bold text-cream">A</span>
          </div>
          <div className="flex flex-col leading-tight">
            <span className="font-display text-lg font-bold text-maroon">
              ANDRA MESS
            </span>
            <span className="text-[11px] text-ink-muted">
              Andhra food, home-style
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            aria-label="Notifications"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-cream-dark text-ink"
          >
            <Bell size={16} />
          </button>
          <button
            type="button"
            aria-label="Profile"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-cream-dark text-ink"
          >
            <User size={16} />
          </button>
        </div>
      </div>

      <button
        type="button"
        className="flex items-center gap-1.5 self-start text-xs font-medium text-ink-muted"
      >
        <MapPin size={13} className="text-maroon" />
        Deliver to: <span className="text-ink">Home</span>
      </button>
    </header>
  );
}
