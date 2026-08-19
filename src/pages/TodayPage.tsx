import { AppShell } from "@/components/layout/AppShell";
import { Section } from "@/components/ui/Section";
import type { LearningDay } from "@/types/learning";
import type { DailyStudyTime, StudyCategory, TaskStatus } from "@/types/progress";
import {
  calculateMasteryProgress,
  calculateStudyTimeTotal,
  calculateTaskProgress,
} from "@/utils/progress";

interface TodayPageProps {
  availableDays: readonly number[];
  canGoPrevious: boolean;
  canGoNext: boolean;
  day: LearningDay;
  getPassCriterionState: (criterionId: string) => boolean;
  getTaskStatus: (taskId: string) => TaskStatus;
  updateTaskStatus: (taskId: string, status: TaskStatus) => void;
  onSelectDay: (day: number) => void;
  onPreviousDay: () => void;
  onNextDay: () => void;
  studyTime: DailyStudyTime;
  togglePassCriterion: (criterionId: string) => void;
  updateStudyTime: (category: StudyCategory, minutes: number) => void;
}

function formatCode(prefix: string, value: number) {
  return `${prefix}${String(value).padStart(2, "0")}`;
}

const taskStatusOptions: { value: TaskStatus; label: string }[] = [
  { value: "todo", label: "TODO" },
  { value: "doing", label: "DOING" },
  { value: "pass", label: "PASS" },
];

const studyCategories: { value: StudyCategory; label: string }[] = [
  { value: "learn", label: "LEARN" },
  { value: "practice", label: "PRACTICE" },
  { value: "build", label: "BUILD" },
  { value: "debug", label: "DEBUG" },
];

interface TaskStatusSelectProps {
  taskTitle: string;
  value: TaskStatus;
  onChange: (status: TaskStatus) => void;
}

function TaskStatusSelect({ taskTitle, value, onChange }: TaskStatusSelectProps) {
  return (
    <select
      aria-label={`${taskTitle} status`}
      className={`task-status-select status-${value}`}
      onChange={(event) => onChange(event.target.value as TaskStatus)}
      value={value}
    >
      {taskStatusOptions.map((option) => (
        <option key={option.value} value={option.value}>{option.label}</option>
      ))}
    </select>
  );
}

export function TodayPage({
  availableDays,
  canGoPrevious,
  canGoNext,
  day,
  getPassCriterionState,
  getTaskStatus,
  updateTaskStatus,
  onSelectDay,
  onPreviousDay,
  onNextDay,
  studyTime,
  togglePassCriterion,
  updateStudyTime,
}: TodayPageProps) {
  const stageCode = formatCode("STAGE ", day.stage.number);
  const weekCode = formatCode("W", day.week);
  const dayCode = formatCode("D", day.day);
  const estimatedTime = day.estimatedMinutes === undefined
    ? "NOT SET"
    : `${day.estimatedMinutes} MIN`;

  const taskIds = [
    ...day.learn,
    ...day.practice,
    ...day.build,
    ...day.debug,
  ].map((task) => task.id);
  const taskProgress = calculateTaskProgress(taskIds.map(getTaskStatus));
  const masteryProgress = calculateMasteryProgress(
    day.passCriteria.map((criterion) => getPassCriterionState(criterion.id)),
  );
  const totalStudyTime = calculateStudyTimeTotal(studyTime);
  const dayStatus: TaskStatus = taskProgress.total > 0 && taskProgress.passed === taskProgress.total
    ? "pass"
    : taskIds.some((taskId) => getTaskStatus(taskId) !== "todo")
      ? "doing"
      : "todo";

  return (
    <AppShell activePage="today">
      <header className="page-header">
        <div>
          <p className="eyebrow">{stageCode} · {day.stage.title.toUpperCase()}</p>
          <p className="day-code">{weekCode} / {dayCode}</p>
          <h1>{day.title}</h1>
        </div>
        <span className={`status-badge status-${dayStatus}`}>TASK {dayStatus.toUpperCase()}</span>
      </header>
      <section className="day-selector" aria-label="Day Selector">
        <div>
          <span>DAY SELECTOR</span>
          <strong>{weekCode} / {dayCode}</strong>
        </div>
        <select
          aria-label="Select learning day"
          onChange={(event) => onSelectDay(Number(event.target.value))}
          value={day.day}
        >
          {availableDays.map((dayNumber) => (
            <option key={dayNumber} value={dayNumber}>Day {dayNumber}</option>
          ))}
        </select>
      </section>
      <section className="summary-panel" aria-label="今日学习概览">
        <div className="estimated-summary"><span>ESTIMATED</span><strong>{estimatedTime}</strong></div>
        <div className="study-total-summary"><span>TOTAL STUDY TIME</span><strong>{totalStudyTime} MIN</strong></div>
        <div className="progress-summary">
          <span>TASK PROGRESS</span>
          <strong>{taskProgress.passed} / {taskProgress.total} · {taskProgress.percentage}%</strong>
          <div className="metric-track task-track" aria-label={`任务进度 ${taskProgress.percentage}%`}><span style={{ width: `${taskProgress.percentage}%` }} /></div>
        </div>
        <div className="progress-summary mastery-summary">
          <span>MASTERY PROGRESS</span>
          <strong>{masteryProgress.completed} / {masteryProgress.total} · {masteryProgress.percentage}%</strong>
          <div className="metric-track mastery-track" aria-label={`掌握进度 ${masteryProgress.percentage}%`}><span style={{ width: `${masteryProgress.percentage}%` }} /></div>
        </div>
      </section>
      <section className="study-time-panel" aria-labelledby="study-time-title">
        <header>
          <div>
            <p>SESSION DATA</p>
            <h2 id="study-time-title">STUDY TIME</h2>
          </div>
          <strong>{totalStudyTime} MIN</strong>
        </header>
        <div className="study-time-grid">
          {studyCategories.map((category) => (
            <div className="study-time-row" key={category.value}>
              <label htmlFor={`study-time-${category.value}`}>{category.label}</label>
              <div className="study-time-controls">
                <button
                  aria-label={`Subtract 10 minutes from ${category.label}`}
                  onClick={() => updateStudyTime(category.value, studyTime[category.value] - 10)}
                  type="button"
                >−10</button>
                <input
                  id={`study-time-${category.value}`}
                  inputMode="decimal"
                  min="0"
                  onChange={(event) => updateStudyTime(category.value, event.currentTarget.valueAsNumber)}
                  step="1"
                  type="number"
                  value={studyTime[category.value]}
                />
                <span>MIN</span>
                <button
                  aria-label={`Add 10 minutes to ${category.label}`}
                  onClick={() => updateStudyTime(category.value, studyTime[category.value] + 10)}
                  type="button"
                >+10</button>
              </div>
            </div>
          ))}
        </div>
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
              <div className="task-actions">
                <span className="time-label">{item.estimatedMinutes === undefined ? "-- MIN" : `${item.estimatedMinutes} MIN`}</span>
                <TaskStatusSelect taskTitle={item.title} value={getTaskStatus(item.id)} onChange={(status) => updateTaskStatus(item.id, status)} />
              </div>
            </article>
          )) : <p className="empty-resource-note">NO RESOURCES ADDED</p>}
        </div>
      </Section>
      <Section title="PRACTICE" count={day.practice.length}>
        {day.practice.map((item) => (
          <article className="task-row" key={item.id}><span className={`task-marker status-${getTaskStatus(item.id)}`} aria-hidden="true" /><div><h2>{item.title}</h2><p>{item.target ?? "NO DESCRIPTION PROVIDED"}</p></div><TaskStatusSelect taskTitle={item.title} value={getTaskStatus(item.id)} onChange={(status) => updateTaskStatus(item.id, status)} /></article>
        ))}
        {day.practice.length === 0 ? <p className="empty-resource-note">NO TASKS</p> : null}
      </Section>
      <Section title="BUILD" count={day.build.length}>
        {day.build.map((item) => (
          <article className="task-row" key={item.id}><span className={`task-marker status-${getTaskStatus(item.id)}`} aria-hidden="true" /><div><h2>{item.title}</h2><p>{item.deliverables.join(" · ")}</p></div><TaskStatusSelect taskTitle={item.title} value={getTaskStatus(item.id)} onChange={(status) => updateTaskStatus(item.id, status)} /></article>
        ))}
        {day.build.length === 0 ? <p className="empty-resource-note">NO TASKS</p> : null}
      </Section>
      <Section title="DEBUG" count={day.debug.length}>
        {day.debug.map((item) => (
          <article className="task-row" key={item.id}><span className={`task-marker status-${getTaskStatus(item.id)}`} aria-hidden="true" /><div><h2>{item.title}</h2><p>{item.prompt}</p><p className="expected-outcome">EXPECTED: {item.expectedOutcome}</p></div><TaskStatusSelect taskTitle={item.title} value={getTaskStatus(item.id)} onChange={(status) => updateTaskStatus(item.id, status)} /></article>
        ))}
        {day.debug.length === 0 ? <p className="empty-resource-note">NO TASKS</p> : null}
      </Section>
      <Section title="PASS CRITERIA" count={day.passCriteria.length}>
        {day.passCriteria.map((item) => (
          <label className={`mastery-row${getPassCriterionState(item.id) ? " mastered" : ""}`} key={item.id}>
            <input
              checked={getPassCriterionState(item.id)}
              onChange={() => togglePassCriterion(item.id)}
              type="checkbox"
            />
            <span>{item.label}</span>
            <strong>{getPassCriterionState(item.id) ? "MASTERED" : "PENDING"}</strong>
          </label>
        ))}
        {day.passCriteria.length === 0 ? <p className="empty-resource-note">NO PASS CRITERIA</p> : null}
      </Section>
      <nav className="day-step-navigation" aria-label="Previous and next learning day">
        <button disabled={!canGoPrevious} onClick={onPreviousDay} type="button">← PREVIOUS DAY</button>
        <span>{weekCode} / {dayCode}</span>
        <button disabled={!canGoNext} onClick={onNextDay} type="button">NEXT DAY →</button>
      </nav>
      <p className="scope-note">MILESTONE 2.4 · SESSION STUDY TIME</p>
    </AppShell>
  );
}
