import type { ReactNode } from "react";

interface SectionProps { title: string; count?: number; children: ReactNode; }

export function Section({ title, count, children }: SectionProps) {
  return <section className="section"><h2 className="section-heading">{title}{typeof count === "number" ? <span>[{count}]</span> : null}</h2><div className="section-body">{children}</div></section>;
}
