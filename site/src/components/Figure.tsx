export function Figure({ title, caption, children }: { title?: string; caption?: string; children: React.ReactNode }) {
  return (
    <figure className="figure">
      {title && <h3>{title}</h3>}
      {children}
      {caption && <figcaption>{caption}</figcaption>}
    </figure>
  );
}
