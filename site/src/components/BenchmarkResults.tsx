"use client";

import type { Benchmark, Model } from "@/lib/data";
import { AccessFilter } from "./AccessFilter";
import { BarChart } from "./BarChart";
import { Figure } from "./Figure";
import { ScoreTable } from "./ScoreTable";

export function BenchmarkResults({ benchmark: b, models }: { benchmark: Benchmark; models: Model[] }) {
  const [lo, hi] = b.range;
  return (
    <AccessFilter models={models.filter((m) => b.id in m.scores)}>
      {(visible) => (
        <section className="block first">
          <Figure
            title="Headline score"
            caption={`Bars span the metric's full ${lo}–${hi} scale; ${b.higher_is_better ? "higher" : "lower"} is better. Model settings used for each run are listed under its name.`}
          >
            <BarChart benchmark={b} models={visible} />
          </Figure>
          {b.views.map((view, i) =>
            view.columns.length === 0 ? null : (
              <Figure
                key={view.title}
                title={view.title}
                caption={
                  view.higher_is_better === null
                    ? "Descriptive traits with no better or worse direction, so cells are not shaded."
                    : undefined
                }
              >
                <ScoreTable
                  models={visible}
                  columns={view.columns.map((c) => ({
                    ...c,
                    higher_is_better: view.higher_is_better,
                    value: (m: Model) => m.views[b.id]?.[i]?.[c.key],
                  }))}
                />
              </Figure>
            ),
          )}
        </section>
      )}
    </AccessFilter>
  );
}
