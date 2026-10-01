"use client";

import { useMemo, useState } from "react";
import type { Access, Benchmark, Group, Model } from "@/lib/data";

const ACCESS_LABEL: Record<Access, string> = {
  "open-weights": "Open weights",
  "public-api": "Public API",
  private: "Private",
};

const GROUPS: { id: Group; title: string }[] = [
  { id: "quality", title: "Quality" },
  { id: "safety", title: "Safety" },
];

function format(value: number): string {
  return Math.abs(value) >= 10 ? value.toFixed(1) : value.toFixed(3);
}

interface Sort {
  benchmark: string;
  ascending: boolean;
}

function GroupTable({ benchmarks, models, total }: { benchmarks: Benchmark[]; models: Model[]; total: number }) {
  const [sort, setSort] = useState<Sort>({ benchmark: benchmarks[0].id, ascending: !benchmarks[0].higher_is_better });

  // Best displayed value per column (ties all bolded), in each metric's own direction.
  const best = useMemo(() => {
    const out: Record<string, string> = {};
    for (const b of benchmarks) {
      const values = models.map((m) => m.scores[b.id]).filter((v): v is number => v !== undefined);
      if (values.length) out[b.id] = format(b.higher_is_better ? Math.max(...values) : Math.min(...values));
    }
    return out;
  }, [benchmarks, models]);

  const rows = useMemo(() => {
    const key = sort.benchmark;
    return [...models].sort((a, b) => {
      const x = a.scores[key];
      const y = b.scores[key];
      if (x === undefined) return y === undefined ? 0 : 1; // empty cells always last
      if (y === undefined) return -1;
      return sort.ascending ? x - y : y - x;
    });
  }, [models, sort]);

  const toggle = (b: Benchmark) =>
    setSort((s) => (s.benchmark === b.id ? { ...s, ascending: !s.ascending } : { benchmark: b.id, ascending: !b.higher_is_better }));

  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th className="model-col">Model</th>
            {benchmarks.map((b) => (
              <th key={b.id} className="num" title={b.description}>
                <button type="button" onClick={() => toggle(b)} aria-sort={sort.benchmark === b.id ? (sort.ascending ? "ascending" : "descending") : "none"}>
                  <span className="bench-name">{b.name}</span>
                  <span className="metric">
                    {b.metric} {b.higher_is_better ? "↑" : "↓"}
                    {sort.benchmark === b.id ? (sort.ascending ? " ▲" : " ▼") : ""}
                  </span>
                </button>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((m) => (
            <tr key={m.id}>
              <td className="model-col">
                <a href={m.url} target="_blank" rel="noreferrer" className="model-name">{m.name}</a>
                <span className="model-meta">
                  {m.organization} · <span className={`badge ${m.access}`}>{ACCESS_LABEL[m.access]}</span> ·{" "}
                  <span title="Benchmarks with results">{Object.keys(m.scores).length}/{total}</span>
                </span>
              </td>
              {benchmarks.map((b) => {
                const v = m.scores[b.id];
                const shown = v === undefined ? "–" : format(v);
                return (
                  <td key={b.id} className={`num${v === undefined ? " empty" : ""}${shown === best[b.id] ? " best" : ""}`}>
                    {shown}
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

export default function LeaderboardTable({ benchmarks, models }: { benchmarks: Benchmark[]; models: Model[] }) {
  const [access, setAccess] = useState<Access | "all">("all");
  const visible = access === "all" ? models : models.filter((m) => m.access === access);

  return (
    <>
      <div className="filters" role="group" aria-label="Filter by model access">
        {(["all", "open-weights", "public-api", "private"] as const).map((a) => (
          <button key={a} type="button" className={access === a ? "chip active" : "chip"} onClick={() => setAccess(a)}>
            {a === "all" ? "All models" : ACCESS_LABEL[a]}
          </button>
        ))}
      </div>
      {GROUPS.map((g) => {
        const cols = benchmarks.filter((b) => b.group === g.id);
        return (
          <section key={g.id}>
            <h2>{g.title}</h2>
            {visible.length ? (
              <GroupTable benchmarks={cols} models={visible} total={benchmarks.length} />
            ) : (
              <p className="empty-state">{models.length ? "No models match this filter." : "No results yet. Be the first to submit."}</p>
            )}
          </section>
        );
      })}
    </>
  );
}
