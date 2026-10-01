export function PageHeader({
  eyebrow,
  title,
  lede,
  facts,
  children,
}: {
  eyebrow?: React.ReactNode;
  title: string;
  lede: string;
  facts: { label: string; value: React.ReactNode }[];
  children?: React.ReactNode;
}) {
  return (
    <section className="page-header">
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
