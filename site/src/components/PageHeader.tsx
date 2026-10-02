import Link from "next/link";

export function PageHeader({
  back,
  eyebrow,
  title,
  lede,
  facts,
  children,
}: {
  back?: { href: string; label: string };
  eyebrow?: React.ReactNode;
  title: string;
  lede: string;
  facts: { label: string; value: React.ReactNode }[];
  children?: React.ReactNode;
}) {
  return (
    <section className="page-header">
      {back && (
        <Link href={back.href} className="back" aria-label={back.label}>
          <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true">
            <path
              d="M19 12H5m6-7-7 7 7 7"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </Link>
      )}
      {eyebrow && <p className="overline eyebrow">{eyebrow}</p>}
      <h1 className="display">{title}</h1>
      <p className="lede">{lede}</p>
      {children}
      <dl className="facts">
        {facts.map((f) => (
          <div key={f.label}>
            <dt className="overline">{f.label}</dt>
            <dd>{f.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
