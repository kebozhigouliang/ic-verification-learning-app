interface EmptyStateProps {
  code: string;
  title: string;
  description: string;
  readOnlyNote?: string;
}

export function EmptyState({ code, title, description, readOnlyNote }: EmptyStateProps) {
  return (
    <section className="empty-state">
      <span className="empty-code">{code}</span>
      <h2>{title}</h2>
      <p>{description}</p>
      {readOnlyNote ? <div className="constraint-note">{readOnlyNote}</div> : null}
    </section>
  );
}
