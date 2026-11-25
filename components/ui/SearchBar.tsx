"use client";

import { Search } from "lucide-react";

export function SearchBar() {
  return (
    <div className="flex items-center gap-2 rounded-pill border border-border bg-white px-4 py-2.5">
      <Search size={17} className="shrink-0 text-ink-muted" />
      <input
        type="text"
        placeholder="Search for idli, dosa, meals..."
        className="w-full bg-transparent text-sm text-ink placeholder:text-ink-muted focus:outline-none"
      />
    </div>
  );
}
