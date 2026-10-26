"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const LINKS = [
  { href: "/graveyard", label: "Graveyard" },
  { href: "/mine", label: "My graveyard" },
];

export function SiteHeader() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-30 border-b border-white/10 bg-[#140818]/85 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3">
        <Link href="/" className="font-display text-xl tracking-tight text-foreground">
          Rest In Pump
          <span className="sr-only"> home</span>
        </Link>
        <nav aria-label="Primary">
          <ul className="flex items-center gap-1">
            {LINKS.map((link) => {
              const active = pathname === link.href;
              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "inline-flex h-11 items-center rounded-full px-4 text-sm font-semibold",
                      active ? "bg-primary text-primary-foreground" : "text-foreground hover:bg-white/10",
                    )}
                  >
                    {link.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
    </header>
  );
}

export function SiteHeaderFallback() {
  return (
    <header className="sticky top-0 z-30 border-b border-white/10 bg-[#140818]/85">
      <div className="mx-auto flex h-[68px] max-w-6xl items-center px-4">
        <span className="font-display text-xl">Rest In Pump</span>
      </div>
    </header>
  );
}
