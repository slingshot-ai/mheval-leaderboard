"use client";

import type { Benchmark, Model } from "@/lib/data";
import { GROUPS } from "@/lib/site";
import { AccessFilter } from "./AccessFilter";
import { Figure } from "./Figure";
import { type ScoreColumn, ScoreTable } from "./ScoreTable";

const CAPTIONS = {
  quality:
    "Win rate is the share of head-to-head comparisons a model wins across these benchmarks. Cells are shaded by rank within each column and the best score is in bold; arrows show which direction is better. Select a column to sort.",
  safety: "Read as above. SIM-VAIL measures harm, so lower is better.",
};

// HELM-style mean win rate: the share of head-to-head comparisons a model wins (ties count half) across the
// benchmarks it has results for. Comparable across benchmarks with different scales and directions.
function winRates(benchmarks: Benchmark[], models: Model[]): Map<string, number> {
  const out = new Map<string, number>();
  for (const m of models) {
    let won = 0;
    let played = 0;
    for (const b of benchmarks) {
      const x = m.scores[b.id];
      if (x === undefined) continue;
      for (const o of models) {
        const y = o.scores[b.id];
        if (o === m || y === undefined) continue;
        played += 1;
        won += x === y ? 0.5 : (x > y) === b.higher_is_better ? 1 : 0;
      }
    }
    if (played) out.set(m.id, won / played);
  }
  return out;
}

// The leaderboard: one table per group, ranked by win rate, filterable by model access. Win rates are computed
// over all models so that filtering does not change them.
export function LeaderboardTables({ benchmarks, models }: { benchmarks: Benchmark[]; models: Model[] }) {
  return (
    <AccessFilter models={models}>
      {(visible) =>
        GROUPS.map((g) => {
          const group = benchmarks.filter((b) => b.group === g.id);
          const wins = winRates(group, models);
          const columns: ScoreColumn[] = [
            {
              key: "win_rate",
              label: "Win rate",
              title: "Share of head-to-head comparisons won across this group's benchmarks",
              higher_is_better: true,
              value: (m) => wins.get(m.id),
              format: (v) => `${Math.round(v * 100)}%`,
            },
            ...group.map((b) => ({
              key: b.id,
              label: b.name,
              title: `${b.metric_name}, ${b.higher_is_better ? "higher" : "lower"} is better`,
              higher_is_better: b.higher_is_better,
              value: (m: Model) => m.scores[b.id],
            })),
          ];
          return (
            <section key={g.id} className="block overview">
              <h2 className="display">{g.title}</h2>
              <p className="prose">{g.blurb}</p>
              <Figure caption={CAPTIONS[g.id]}>
                <ScoreTable models={visible.filter((m) => wins.has(m.id))} columns={columns} />
              </Figure>
            </section>
          );
        })
      }
    </AccessFilter>
  );
}
