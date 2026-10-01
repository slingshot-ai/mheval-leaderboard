import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BenchmarkResults } from "@/components/BenchmarkResults";
import { PageHeader } from "@/components/PageHeader";
import { loadLeaderboard } from "@/lib/data";

type Props = { params: Promise<{ id: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return loadLeaderboard().benchmarks.map((b) => ({ id: b.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const b = loadLeaderboard().benchmarks.find((x) => x.id === id);
  return b ? { title: b.name, description: b.description } : {};
}

export default async function BenchmarkPage({ params }: Props) {
  const { id } = await params;
  const { benchmarks, models } = loadLeaderboard();
  const b = benchmarks.find((x) => x.id === id);
  if (!b) notFound();
  return (
    <>
      <PageHeader
        eyebrow={b.group === "quality" ? "Quality benchmark" : "Safety benchmark"}
        title={b.name}
        lede={b.description}
        facts={[
          { label: "Metric", value: <span title={b.metric}>{b.metric_name}</span> },
          { label: "Scale", value: `${b.range[0]}–${b.range[1]}` },
          {
            label: "Source",
            value: <a href={b.url}>{b.url.includes("github.com") ? "GitHub ↗" : "Paper ↗"}</a>,
          },
        ]}
      >
        <figure className="quote">
          <blockquote>“{b.quote}”</blockquote>
          <figcaption>{b.quote_source}</figcaption>
        </figure>
      </PageHeader>
      <BenchmarkResults benchmark={b} models={models} />
    </>
  );
}
