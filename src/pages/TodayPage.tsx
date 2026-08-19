import { AppShell } from "@/components/layout/AppShell";
import { Section } from "@/components/ui/Section";
import { week01 } from "@/data/weeks/week01";

export function TodayPage() {
  const day = week01.days[0];

  return (
    <AppShell activePage="today">
      <header className="page-header">
        <div>
          <p className="eyebrow">STAGE 01 · DIGITAL LOGIC + VERILOG</p>
          <p className="day-code">W01 / D01</p>
          <h1>{day.title}</h1>
        </div>
        <span className="status-badge">TODO</span>
      </header>
      <section className="summary-panel" aria-label="今日学习概览">
        <div><span>ESTIMATED</span><strong>NOT SET</strong></div>
        <div><span>TASK PROGRESS</span><strong>0 / {day.practice.length + day.build.length}</strong></div>
        <div className="progress-track" aria-label="今日进度 0%"><span /></div>
      </section>
      <Section title="LEARN" count={day.learn.length}>
        {day.learn.map((item) => (
          <article className="learning-row" key={item.id}>
            <div><span className="item-type">{item.type.toUpperCase()}</span><h2>{item.title}</h2><p>{item.scope}</p></div>
            <span className="time-label">-- MIN</span>
          </article>
        ))}
      </Section>
      <Section title="PRACTICE" count={day.practice.length}>
        {day.practice.map((item) => (
          <article className="task-row" key={item.id}><span className="task-marker" aria-hidden="true" /><div><h2>{item.title}</h2><p>{item.target}</p></div><span className="row-status">TODO</span></article>
        ))}
      </Section>
      <Section title="BUILD" count={day.build.length}>
        {day.build.map((item) => (
          <article className="task-row" key={item.id}><span className="task-marker" aria-hidden="true" /><div><h2>{item.title}</h2><p>{item.deliverables.join(" · ")}</p></div><span className="row-status">TODO</span></article>
        ))}
      </Section>
      <Section title="PASS CRITERIA" count={day.passCriteria.length}>
        {day.passCriteria.map((item) => (
          <article className="task-row criterion-row" key={item.id}><span className="task-marker" aria-hidden="true" /><h2>{item.label}</h2></article>
        ))}
      </Section>
      <p className="scope-note">MILESTONE 01 · STATIC STRUCTURE ONLY</p>
    </AppShell>
  );
}
