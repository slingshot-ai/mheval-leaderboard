import Link from "next/link";
import type { Benchmark } from "@/lib/data";
import { GROUPS, HARNESS, REPO, SUBMIT } from "@/lib/site";

export function SiteFooter({ benchmarks }: { benchmarks: Pick<Benchmark, "id" | "name" | "group">[] }) {
  const columns = [
    ...GROUPS.map((g) => ({
      title: g.title,
      links: benchmarks.filter((b) => b.group === g.id).map((b) => ({ href: `/${b.id}/`, label: b.name })),
    })),
    {
      title: "Project",
      links: [
        { href: HARNESS, label: "Harness" },
        { href: SUBMIT, label: "Submit results" },
        { href: REPO, label: "Source and data" },
      ],
    },
  ];
  return (
    <footer className="site-footer">
      <div className="footer-main">
        <div className="footer-brand">
          <Link href="/" className="wordmark">
            mheval
          </Link>
          <p>An open leaderboard for how language models support people with their mental health.</p>
        </div>
        {columns.map((c) => (
          <nav key={c.title} aria-label={c.title}>
            <p className="overline">{c.title}</p>
            <ul>
              {c.links.map((l) => (
                <li key={l.href}>
                  {l.href.startsWith("/") ? <Link href={l.href}>{l.label}</Link> : <a href={l.href}>{l.label}</a>}
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>
      <p className="footer-legal">MIT License</p>
    </footer>
  );
}
