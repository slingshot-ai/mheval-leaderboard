// Build-time loader for the repository's data: benchmarks.yaml, models/*.yaml and results/<model>/<task>.json.
import fs from "node:fs";
import path from "node:path";
import { cache } from "react";
import { parse } from "yaml";

const ROOT = path.join(process.cwd(), "..");

export type Group = "quality" | "safety";
export type Access = "open-weights" | "public-api" | "private";

export interface Column {
  key: string;
  label: string;
}

export interface View {
  title: string;
  higher_is_better: boolean | null; // null: descriptive, no better direction
  columns: Column[];
}

export interface Benchmark {
  id: string;
  name: string;
  group: Group;
  metric: string;
  metric_name: string;
  higher_is_better: boolean;
  range: [number, number];
  url: string;
  description: string;
  quote: string;
  quote_source: string;
  views: View[];
}

export interface Model {
  id: string;
  name: string;
  organization: string;
  access: Access;
  url: string;
  scores: Record<string, number>; // benchmark id -> headline metric
  settings: Record<string, string>; // benchmark id -> target model params, e.g. "reasoning_effort=high"
  views: Record<string, Record<string, number>[]>; // benchmark id -> per view, column key -> value
}

export interface Leaderboard {
  benchmarks: Benchmark[];
  models: Model[];
  updated: string;
}

interface ViewSpec {
  title: string;
  path: string;
  value?: string;
  higher_is_better?: boolean | null;
  columns?: Record<string, string>;
}

type Json = Record<string, unknown>;

const readYaml = <T,>(file: string): T => parse(fs.readFileSync(file, "utf8")) as T;

// "high_acuity" -> "High acuity", "DEPRESSION" -> "Depression", "OCD" stays; labels that already read well are kept.
function label(key: string): string {
  const text = key
    .replace(/[_-]+/g, " ")
    .trim()
    .replace(/\b[A-Z]{4,}\b/g, (word) => word.toLowerCase());
  return text.charAt(0).toUpperCase() + text.slice(1);
}

// The categories at `spec.path`, each reduced to a number (directly, or via its `spec.value` field).
function extract(result: Json, spec: ViewSpec): Record<string, number> {
  let node: unknown = result;
  for (const part of spec.path.split(".")) node = (node as Json | undefined)?.[part];
  const out: Record<string, number> = {};
  for (const [key, entry] of Object.entries((node as Json) ?? {})) {
    const value = spec.value ? (entry as Json)?.[spec.value] : entry;
    if (typeof value === "number" && (!spec.columns || key in spec.columns)) out[key] = value;
  }
  return out;
}

// Memoised: every page and its metadata read the same files.
export const loadLeaderboard = cache((): Leaderboard => {
  const specs = readYaml<(Omit<Benchmark, "views"> & { breakdowns?: ViewSpec[] })[]>(path.join(ROOT, "benchmarks.yaml"));
  const modelsDir = path.join(ROOT, "models");
  let updated = "";

  const models: Model[] = fs
    .readdirSync(modelsDir)
    .filter((f) => f.endsWith(".yaml"))
    .map((file) => {
      const id = file.replace(/\.yaml$/, "");
      const card = readYaml<Record<string, string>>(path.join(modelsDir, file));
      const model: Model = {
        id,
        name: card.name,
        organization: card.organization,
        access: card.access as Access,
        url: card.url,
        scores: {},
        settings: {},
        views: {},
      };
      for (const spec of specs) {
        const file = path.join(ROOT, "results", id, `${spec.id}.json`);
        if (!fs.existsSync(file)) continue;
        const result = JSON.parse(fs.readFileSync(file, "utf8")) as Json;
        const score = (result.metrics as Json | undefined)?.[spec.metric];
        if (typeof score !== "number") continue;
        const meta = (result.meta ?? {}) as { date?: string; roles?: { target?: { params?: Json } } };
        model.scores[spec.id] = score;
        model.settings[spec.id] = Object.entries(meta.roles?.target?.params ?? {})
          .map(([k, v]) => `${k}=${v}`)
          .join(", ");
        model.views[spec.id] = (spec.breakdowns ?? []).map((view) => extract(result, view));
        if (meta.date && meta.date > updated) updated = meta.date;
      }
      return model;
    })
    .filter((m) => Object.keys(m.scores).length > 0);

  // Columns: as listed in the spec, else every category any model reports, in first-seen order.
  const benchmarks: Benchmark[] = specs.map(({ breakdowns = [], ...spec }) => ({
    ...spec,
    views: breakdowns.map((view, i) => {
      const keys = view.columns
        ? Object.keys(view.columns)
        : [...new Set(models.flatMap((m) => Object.keys(m.views[spec.id]?.[i] ?? {})))];
      return {
        title: view.title,
        higher_is_better: view.higher_is_better === undefined ? spec.higher_is_better : view.higher_is_better,
        columns: keys.map((key) => ({ key, label: view.columns?.[key] ?? label(key) })),
      };
    }),
  }));

  return { benchmarks, models, updated };
});
