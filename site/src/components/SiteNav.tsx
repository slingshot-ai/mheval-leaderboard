"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import type { Group } from "@/lib/data";
import { GROUPS } from "@/lib/site";

type Item = { id: string; name: string; group: Group };

// Benchmarks menu: hover opens it for a mouse, the button toggles it for touch and keyboard. The panel stays mounted
// so it can fade out; CSS hides it from pointers and assistive tech while closed.
export function SiteNav({ benchmarks }: { benchmarks: Item[] }) {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const outside = (e: PointerEvent) => !root.current?.contains(e.target as Node) && setOpen(false);
    const escape = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      setOpen(false);
      trigger.current?.focus();
    };
    document.addEventListener("pointerdown", outside);
    document.addEventListener("keydown", escape);
    return () => {
      document.removeEventListener("pointerdown", outside);
      document.removeEventListener("keydown", escape);
    };
  }, [open]);

  const hover = (next: boolean) => (e: React.PointerEvent) => e.pointerType === "mouse" && setOpen(next);
  // A mouse has already opened the menu by hovering, so its click must not close it.
  const click = (e: React.MouseEvent) =>
    setOpen((o) => ((e.nativeEvent as PointerEvent).pointerType === "mouse" ? true : !o));
  const blur = (e: React.FocusEvent) => !root.current?.contains(e.relatedTarget as Node) && setOpen(false);

  return (
    <div ref={root} className="menu" onPointerEnter={hover(true)} onPointerLeave={hover(false)} onBlur={blur}>
      <button
        ref={trigger}
        type="button"
        className={benchmarks.some((b) => path === `/${b.id}/`) ? "menu-trigger active" : "menu-trigger"}
        aria-expanded={open}
        aria-controls="benchmarks-menu"
        onClick={click}
      >
        <span className="link">Benchmarks</span>
        <svg viewBox="0 0 16 16" width="12" height="12" aria-hidden="true">
          <path
            d="M3.5 6l4.5 4.5L12.5 6"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
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
                      <Link
                        href={href}
                        aria-current={path === href ? "page" : undefined}
                        onClick={() => setOpen(false)}
                      >
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
