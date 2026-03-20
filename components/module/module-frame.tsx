export function ModuleFrame({
  title,
  description,
  actions,
  children
}: {
  title: string;
  description: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-6">
      <div className="page-hero page-hero--module">
        <div>
          <p className="page-hero__eyebrow">Module</p>
          <h1 className="page-hero__title">{title}</h1>
          <p className="page-hero__description">{description}</p>
        </div>
        {actions ? <div className="page-hero__actions">{actions}</div> : null}
      </div>
      {children}
    </section>
  );
}
