"use client";

import { useState } from "react";
import type { Model } from "@/lib/data";
import { formatScore } from "@/lib/format";
import { ModelName } from "./ModelName";

export interface ScoreColumn {
  key: string;
  label: string;
  title?: string;
  higher_is_better: boolean | null; // null: descriptive, so no shading, bold or direction
  value: (m: Model) => number | undefined;
  format?: (v: number, scale: number) => string;
}


// Sortable model x column table. Cells are shaded by rank within their column (a heatmap, in each column's own
// direction) and the best value is bold, so the ordering never relies on color alone. Descriptive columns
// (no better direction) are left plain and sort high to low.
export function ScoreTable({ models, columns }: { models: Model[]; columns: ScoreColumn[] }) {
  const [sort, setSort] = useState({ key: columns[0].key, flip: false });

  const stats = new Map(
    columns.map((c) => {
      const values = models.map(c.value).filter((v): v is number => v !== undefined);
      return [c.key, { min: Math.min(...values), max: Math.max(...values), scale: Math.max(...values.map(Math.abs)) }];
    }),
  );
  // 0 = worst in column, 1 = best (for descriptive columns: 0 = lowest, 1 = highest).
  const show = (c: ScoreColumn, v: number) => (c.format ?? formatScore)(v, stats.get(c.key)!.scale);
  const rank = (c: ScoreColumn, v: number) => {
    const { min, max } = stats.get(c.key)!;
    if (max === min) return 1;
    const t = (v - min) / (max - min);
    return c.higher_is_better === false ? 1 - t : t;
  };

  const active = columns.find((c) => c.key === sort.key) ?? columns[0];
  const rows = [...models].sort((a, b) => {
    const x = active.value(a);
    const y = active.value(b);
    if (x === undefined) return y === undefined ? 0 : 1; // missing results always last
    if (y === undefined) return -1;
    return (rank(active, y) - rank(active, x)) * (sort.flip ? -1 : 1);
  });

  return (
    <div className="table-scroll">
      <table className="scores">
        <thead>
          <tr>
            <th className="model-col">Model</th>
            {columns.map((c) => (
              <th key={c.key} className="num" title={c.title} aria-sort={c.key === sort.key ? (sort.flip ? "ascending" : "descending") : undefined}>
                <button type="button" className="link" onClick={() => setSort((s) => ({ key: c.key, flip: s.key === c.key && !s.flip }))}>
                  {c.label.replace(/-/g, "\u2011")}
                  {c.higher_is_better !== null && <span className="dir" aria-hidden>{c.higher_is_better ? "\u00a0↑" : "\u00a0↓"}</span>}
                </button>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((m) => (
            <tr key={m.id}>
              <td className="model-col">
                <ModelName model={m} />
              </td>
              {columns.map((c) => {
                const v = c.value(m);
                if (v === undefined) return <td key={c.key} className="num empty">–</td>;
                if (c.higher_is_better === null) return <td key={c.key} className="num">{show(c, v)}</td>;
                const r = rank(c, v);
                return (
                  <td key={c.key} className={r === 1 ? "num best" : "num"} style={{ "--heat": `${Math.round(r * 100)}%` } as React.CSSProperties}>
                    {show(c, v)}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
