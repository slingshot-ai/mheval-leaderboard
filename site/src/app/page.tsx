import { LeaderboardTables } from "@/components/LeaderboardTables";
import { PageHeader } from "@/components/PageHeader";
import { loadLeaderboard } from "@/lib/data";
import { formatDate, HARNESS } from "@/lib/site";

export default function LeaderboardPage() {
  const { benchmarks, models, updated } = loadLeaderboard();
  return (
    <>
      <PageHeader
        title="Mental Health Evaluation Leaderboard"
        lede="People increasingly turn to AI for support with their mental health. This leaderboard puts the field's clinician-designed benchmarks side by side, run exactly as their authors published them, so models can be compared on the quality of their care and on their safety."
        facts={[
          { label: "Harness", value: <a href={HARNESS}>mheval ↗</a> },
          ...(updated ? [{ label: "Updated", value: formatDate(updated) }] : []),
        ]}
      />
      <LeaderboardTables benchmarks={benchmarks} models={models} />
    </>
  );
}
