import LeaderboardTable from "@/components/LeaderboardTable";
import { loadLeaderboard } from "@/lib/data";

const REPO = "https://github.com/slingshot-ai/mheval-leaderboard";
const HARNESS = "https://github.com/slingshot-ai/mheval";

export default function Page() {
  const { benchmarks, models } = loadLeaderboard();
  return (
    <main>
      <header>
        <h1>Mental Health Evaluation Leaderboard</h1>
        <p className="lead">
          Language models on {benchmarks.length} published therapy and mental-health benchmarks, each run from its
          original code with the <a href={HARNESS}>Mental Health Evaluation Harness</a>. Results are submitted by the
          community and validated automatically; click a column to sort.
        </p>
        <nav>
          <a className="button primary" href={`${REPO}#submitting-results`}>Submit results</a>
          <a className="button" href={HARNESS}>Run the harness</a>
        </nav>
      </header>

      <LeaderboardTable benchmarks={benchmarks} models={models} />

      <section className="about">
        <h2>Benchmarks</h2>
        <dl>
          {benchmarks.map((b) => (
            <div key={b.id}>
              <dt>
                <a href={b.url}>{b.name}</a> <span className="metric">{b.metric} {b.higher_is_better ? "↑" : "↓"}</span>
              </dt>
              <dd>{b.description}</dd>
            </div>
          ))}
        </dl>
      </section>

      <footer>
        Bold marks the best score per benchmark; “–” means not yet submitted. Results are self-reported and checked
        against the released task configurations and default judges. <a href={REPO}>Source and data</a>.
      </footer>
    </main>
  );
}
