import { useId } from "react";
import type { Access, Model } from "@/lib/data";

export const ACCESS_LABEL: Record<Access, string> = {
  "open-weights": "Open weights",
  "public-api": "Public API",
  private: "Private",
};

const humanize = (key: string) => key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, " ");

export function ModelName({ model, settings = {} }: { model: Model; settings?: Record<string, string> }) {
  const id = useId();
  const entries = Object.entries(settings);
  return (
    <>
      <a href={model.url} className="model-name" title={model.name}>
        {model.displayName}
      </a>
      <span className="model-meta">
        {model.organization} · {ACCESS_LABEL[model.access]}
        {entries.length > 0 && (
          <span className="info">
            <button type="button" className="info-trigger" aria-label="Run settings" aria-describedby={id}>
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                aria-hidden
              >
                <circle cx="12" cy="12" r="10" />
                <path d="M12 16v-4m0-4h.01" />
              </svg>
            </button>
            <span role="tooltip" id={id} className="tooltip">
              <span className="overline">Run settings</span>
              <dl>
                {entries.map(([k, v]) => (
                  <div key={k}>
                    <dt>{humanize(k)}</dt>
                    <dd>{v}</dd>
                  </div>
                ))}
              </dl>
            </span>
          </span>
        )}
      </span>
    </>
  );
}
