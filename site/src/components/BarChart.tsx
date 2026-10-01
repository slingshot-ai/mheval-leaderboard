import type { Benchmark, Model } from "@/lib/data";
import { formatScore } from "@/lib/format";
import { ModelName } from "./ModelName";

// Ranked horizontal bars of a benchmark's headline metric (for models with a result), drawn on the metric's full
// scale. Bars grow in on mount, staggered by rank.
export function BarChart({ benchmark, models }: { benchmark: Benchmark; models: Model[] }) {
  const [lo, hi] = benchmark.range;
  const rows = [...models].sort((a, b) => (b.scores[benchmark.id] - a.scores[benchmark.id]) * (benchmark.higher_is_better ? 1 : -1));
  const scale = Math.max(...rows.map((m) => Math.abs(m.scores[benchmark.id]))); // same decimals as the tables

  return (
    <div className="bars">
      <ol>
        {rows.map((m, i) => {
          const v = m.scores[benchmark.id];
          const share = Math.min(1, Math.max(0, (v - lo) / (hi - lo)));
          return (
            <li key={m.id} className={i === 0 ? "best" : undefined} style={{ "--i": i } as React.CSSProperties}>
              <div className="bar-label">
                <ModelName model={m} detail={m.settings[benchmark.id]} />
              </div>
              <div className="bar-track" role="img" aria-label={`${formatScore(v, scale)} on a ${lo}–${hi} scale`}>
                <div className="bar-fill" style={{ "--share": share } as React.CSSProperties} />
              </div>
              <span className="bar-value">{formatScore(v, scale)}</span>
            </li>
          );
        })}
      </ol>
      <div className="bar-axis" aria-hidden>
        <span>{lo}</span>
        <span>{hi}</span>
      </div>
    </div>
  );
}
