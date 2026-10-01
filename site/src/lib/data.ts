// Build-time loader for the repository's data: benchmarks.yaml, models/*.yaml and results/<model>/<task>.json.
import fs from "node:fs";
import path from "node:path";
import { parse } from "yaml";

const ROOT = path.join(process.cwd(), "..");

export type Group = "quality" | "safety";
export type Access = "open-weights" | "public-api" | "private";

export interface Benchmark {
  id: string;
  name: string;
  group: Group;
  metric: string;
  higher_is_better: boolean;
  url: string;
  description: string;
}

export interface Model {
  id: string;
  name: string;
  organization: string;
  access: Access;
  url: string;
  submittedBy: string;
  scores: Record<string, number>; // benchmark id -> headline metric
}

export interface Leaderboard {
  benchmarks: Benchmark[];
  models: Model[];
}

function readYaml<T>(file: string): T {
  return parse(fs.readFileSync(file, "utf8")) as T;
}

export function loadLeaderboard(): Leaderboard {
  const benchmarks = readYaml<Benchmark[]>(path.join(ROOT, "benchmarks.yaml"));
  const byId = new Map(benchmarks.map((b) => [b.id, b]));
  const modelsDir = path.join(ROOT, "models");
  const resultsDir = path.join(ROOT, "results");

  const models: Model[] = fs
    .readdirSync(modelsDir)
    .filter((f) => f.endsWith(".yaml"))
    .map((file) => {
      const id = file.replace(/\.yaml$/, "");
      const card = readYaml<Record<string, string>>(path.join(modelsDir, file));
      const scores: Record<string, number> = {};
      const dir = path.join(resultsDir, id);
      if (fs.existsSync(dir)) {
        for (const result of fs.readdirSync(dir).filter((f) => f.endsWith(".json"))) {
          const task = result.replace(/\.json$/, "");
          const benchmark = byId.get(task);
          const value = JSON.parse(fs.readFileSync(path.join(dir, result), "utf8"))?.metrics?.[benchmark?.metric ?? ""];
          if (benchmark && typeof value === "number") scores[task] = value;
        }
      }
      return {
        id,
        name: card.name,
        organization: card.organization,
        access: card.access as Access,
        url: card.url,
        submittedBy: card.submitted_by,
        scores,
      };
    })
    .filter((m) => Object.keys(m.scores).length > 0);

  return { benchmarks, models };
}
