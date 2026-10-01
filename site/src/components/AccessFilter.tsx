"use client";

import { useState } from "react";
import type { Access, Model } from "@/lib/data";
import { ACCESS_LABEL } from "./ModelName";

const OPTIONS = ["all", "open-weights", "public-api", "private"] as const;

// Access filter chips, then `children` rendered with the matching models.
export function AccessFilter({
  models,
  children,
}: {
  models: Model[];
  children: (visible: Model[]) => React.ReactNode;
}) {
  const [access, setAccess] = useState<Access | "all">("all");
  const visible = access === "all" ? models : models.filter((m) => m.access === access);
  return (
    <>
      <div className="filters" role="group" aria-label="Filter by model access">
        {OPTIONS.map((a) => (
          <button
            key={a}
            type="button"
            className={access === a ? "chip active" : "chip"}
            aria-pressed={access === a}
            onClick={() => setAccess(a)}
          >
            {a === "all" ? "All models" : ACCESS_LABEL[a]}
          </button>
        ))}
      </div>
      {visible.length ? (
        children(visible)
      ) : (
        <p className="empty-state">
          {models.length
            ? `No ${ACCESS_LABEL[access as Access].toLowerCase()} models yet.`
            : "No results yet. Be the first to submit a model."}
        </p>
      )}
    </>
  );
}
