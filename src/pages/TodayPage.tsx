import { AppShell } from "@/components/layout/AppShell";
import { Section } from "@/components/ui/Section";
import type { LearningDay } from "@/types/learning";

interface TodayPageProps {
  day: LearningDay;
}

function formatCode(prefix: string, value: number) {
  return `${prefix}${String(value).padStart(2, "0")}`;
}

export function TodayPage({ day }: TodayPageProps) {
  const stageCode = formatCode("STAGE ", day.stage.number);
  const weekCode = formatCode("W", day.week);
  const dayCode = formatCode("D", day.day);
  const estimatedTime = day.estimatedMinutes === undefined
    ? "NOT SET"
    : `${day.estimatedMinutes} MIN`;

  return (
    <AppShell activePage="today">
      <header className="page-header">
        <div>
          <p className="eyebrow">{stageCode} · {day.stage.title.toUpperCase()}</p>
          <p className="day-code">{weekCode} / {dayCode}</p>
          <h1>{day.title}</h1>
        </div>
        <span className="status-badge">TODO</span>
      </header>
      <section className="summary-panel" aria-label="今日学习概览">
        <div><span>ESTIMATED</span><strong>{estimatedTime}</strong></div>
        <div><span>TASK PROGRESS</span><strong>0 / {day.practice.length + day.build.length}</strong></div>
        <div className="progress-track" aria-label="今日进度 0%"><span /></div>
      </section>
      <Section title="LEARN" count={day.topics.length + day.learn.length}>
        <div className="learning-group">
          <h2 className="learning-group-title">LEARNING TOPICS</h2>
          <ul className="topic-list">
            {day.topics.map((topic) => <li key={topic}>{topic}</li>)}
          </ul>
        </div>
        <div className="learning-group">
          <h2 className="learning-group-title">RESOURCES</h2>
          {day.learn.length > 0 ? day.learn.map((item) => (
            <article className="learning-row" key={item.id}>
              <div><span className="item-type">{item.type.toUpperCase()}</span><h2>{item.title}</h2><p>{item.scope}</p></div>
              <span className="time-label">{item.estimatedMinutes === undefined ? "-- MIN" : `${item.estimatedMinutes} MIN`}</span>
            </article>
          )) : <p className="empty-resource-note">NO RESOURCES ADDED</p>}
        </div>
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
