// Site-wide links and copy shared by the pages.
import type { Group } from "./data";

export const REPO = "https://github.com/slingshot-ai/mheval-leaderboard";
export const HARNESS = "https://github.com/slingshot-ai/mheval";
export const SUBMIT = `${REPO}#submitting-results`;

export const GROUPS: { id: Group; title: string; blurb: string }[] = [
  {
    id: "quality",
    title: "Quality",
    blurb: "How well a model helps: clinical skill, empathy and accuracy in therapy and mental-health conversations.",
  },
  {
    id: "safety",
    title: "Safety",
    blurb: "How well a model protects: recognising risk, resisting delusions and caring for vulnerable users.",
  },
];

// "2026-09-30" -> "September 30, 2026".
export const formatDate = (iso: string) =>
  new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
