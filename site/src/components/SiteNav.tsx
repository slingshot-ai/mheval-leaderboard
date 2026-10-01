"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import type { Group } from "@/lib/data";
import { GROUPS } from "@/lib/site";

type Item = { id: string; name: string; group: Group };

// The "Benchmarks" menu, the site's way to each benchmark page (/<id>/): opens on hover with a mouse and on click or
// tap; closes on Escape, an outside click or choosing a benchmark. The panel stays
// mounted so it can fade both ways; while closed it is hidden from pointers, keyboard and screen readers.
export function SiteNav({ benchmarks }: { benchmarks: Item[] }) {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const outside = (e: PointerEvent) => !root.current?.contains(e.target as Node) && setOpen(false);
    const escape = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("pointerdown", outside);
    document.addEventListener("keydown", escape);
    return () => {
      document.removeEventListener("pointerdown", outside);
      document.removeEventListener("keydown", escape);
    };
  }, [open]);

  const hover = (next: boolean) => (e: React.PointerEvent) => e.pointerType === "mouse" && setOpen(next);

  return (
    <div ref={root} className="menu" onPointerEnter={hover(true)} onPointerLeave={hover(false)}>
      <button
        type="button"
        className={benchmarks.some((b) => path === `/${b.id}/`) ? "menu-trigger active" : "menu-trigger"}
        aria-expanded={open}
        aria-controls="benchmarks-menu"
        onClick={() => setOpen((o) => !o)}
      >
        <span className="link">Benchmarks</span>
        <svg viewBox="0 0 16 16" width="12" height="12" aria-hidden="true">
          <path d="M3.5 6l4.5 4.5L12.5 6" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      <div id="benchmarks-menu" className="menu-panel" data-open={open}>
        {GROUPS.map((g) => (
          <section key={g.id}>
            <p className="overline">{g.title}</p>
            <ul>
              {benchmarks
                .filter((b) => b.group === g.id)
                .map((b) => {
                  const href = `/${b.id}/`;
                  return (
                    <li key={b.id}>
                      <Link href={href} aria-current={path === href ? "page" : undefined} onClick={() => setOpen(false)}>
                        {b.name}
                      </Link>
                    </li>
                  );
                })}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}
