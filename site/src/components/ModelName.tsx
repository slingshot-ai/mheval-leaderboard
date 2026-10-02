import type { Access, Model } from "@/lib/data";

export const ACCESS_LABEL: Record<Access, string> = {
  "open-weights": "Open weights",
  "public-api": "Public API",
  private: "Private",
};

export function ModelName({ model, detail }: { model: Model; detail?: string }) {
  return (
    <>
      <a href={model.url} className="model-name" title={model.name}>
        {model.displayName}
      </a>
      <span className="model-meta">
        {model.organization} · {ACCESS_LABEL[model.access]}
        {detail ? ` · ${detail}` : ""}
      </span>
    </>
  );
}
