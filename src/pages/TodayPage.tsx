import { useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { Section } from "@/components/ui/Section";
import { useStudyTimer } from "@/hooks/useStudyTimer";
import type { BuildTask, LearningDay, LearningTask } from "@/types/learning";
import type {
  BuildVerification,
  DailyStudyTime,
  DayProgress,
  ResourceProgress,
  TaskStatus,
} from "@/types/progress";
import type { StudySession, StudyType } from "@/types/study-session";
import {
  calculateDayCompletion,
  calculateMasteryProgress,
  calculateStudyTimeTotal,
  calculateTaskProgress,
} from "@/utils/progress";

interface TodayPageProps {
  availableDays: readonly number[];
  canGoPrevious: boolean;
  canGoNext: boolean;
  day: LearningDay;
  dayProgress: DayProgress;
  completeBuildTask: (buildId: string) => void;
  getBuildVerification: (buildId: string) => BuildVerification;
  getPassCriterionState: (criterionId: string) => boolean;
  getResourceProgress: (resourceId: string) => ResourceProgress;
  getSoftwareStatus: (softwareId: string) => TaskStatus;
  getTaskStatus: (taskId: string) => TaskStatus;
  markResourceOpened: (resourceId: string) => void;
  setResourceCompleted: (resourceId: string, completed: boolean) => void;
  updateTaskStatus: (taskId: string, status: TaskStatus) => void;
  onSelectDay: (day: number) => void;
  onPreviousDay: () => void;
  onNextDay: () => void;
  onStudySessionSaved: (session: StudySession) => void;
  studyTime: DailyStudyTime;
  togglePassCriterion: (criterionId: string) => void;
  updateBuildVerification: (buildId: string, simulationSuccess: boolean) => void;
  updateSoftwareStatus: (softwareId: string, status: TaskStatus) => void;
}

function formatCode(prefix: string, value: number) {
  return `${prefix}${String(value).padStart(2, "0")}`;
}

const taskStatusOptions: { value: TaskStatus; label: string }[] = [
  { value: "todo", label: "TODO" },
  { value: "doing", label: "DOING" },
  { value: "pass", label: "PASS" },
];

const studyTypes: StudyType[] = ["LEARN", "PRACTICE", "BUILD", "DEBUG"];

type FocusTaskKind = "resource" | "practice" | "build" | "debug";
type FocusCompletionGate = "none" | "practice" | "build";

interface FocusTask {
  id: string;
  title: string;
  type: StudyType;
  kind: FocusTaskKind;
  completionGate: FocusCompletionGate;
  url?: string;
  optional?: boolean;
}

interface PendingTaskCompletion {
  session: StudySession;
  task: FocusTask;
}

function formatElapsedTime(totalSeconds: number): string {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return [hours, minutes, seconds].map((value) => String(value).padStart(2, "0")).join(":");
}

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

interface PracticeCardProps {
  index: number;
  item: LearningTask;
  status: TaskStatus;
  total: number;
  onStatusChange: (status: TaskStatus) => void;
}

function PracticeCard({ index, item, status, total, onStatusChange }: PracticeCardProps) {
  const [selectedOptionId, setSelectedOptionId] = useState("");
  const [feedback, setFeedback] = useState<"correct" | "incorrect">();
  const completed = status === "pass";
  const result = completed ? "correct" : feedback;
  const correctOption = item.options?.find((option) => option.id === item.correctOptionId);

  const submitAnswer = () => {
    if (!selectedOptionId || completed || !item.correctOptionId) return;
    const isCorrect = selectedOptionId === item.correctOptionId;
    setFeedback(isCorrect ? "correct" : "incorrect");
    onStatusChange(isCorrect ? "pass" : "doing");
  };

  return (
    <article className={`practice-card${completed ? " completed" : ""}`} id={`task-${item.id}`}>
      <header>
        <span>QUESTION {index + 1} / {total}</span>
        <strong className={`practice-status status-${status}`}>
          {completed ? "PASS" : status.toUpperCase()}
        </strong>
      </header>
      <h2>{item.title}</h2>
      <fieldset aria-label={`Answer options for ${item.title}`} disabled={completed}>
        {item.options?.map((option) => (
          <label className={selectedOptionId === option.id ? "selected" : ""} key={option.id}>
            <input
              checked={selectedOptionId === option.id}
              name={`practice-${item.id}`}
              onChange={() => {
                setSelectedOptionId(option.id);
                setFeedback(undefined);
              }}
              type="radio"
              value={option.id}
            />
            <strong>{option.id}</strong>
            <span>{option.label}</span>
          </label>
        ))}
      </fieldset>
      <button
        className="practice-submit"
        disabled={completed || !selectedOptionId}
        onClick={submitAnswer}
        type="button"
      >
        {completed ? "COMPLETED" : "SUBMIT"}
      </button>
      {result ? (
        <section className={`practice-feedback ${result}`} aria-live="polite">
          <strong>{result === "correct" ? "✓ CORRECT" : "✗ INCORRECT"}</strong>
          {result === "incorrect" && correctOption ? (
            <p><span>CORRECT ANSWER</span>{correctOption.id}. {correctOption.label}</p>
          ) : null}
          <p><span>EXPLANATION</span>{item.explanation ?? "No explanation provided."}</p>
        </section>
      ) : null}
    </article>
  );
}

interface BuildTaskCardProps {
  item: BuildTask;
  status: TaskStatus;
  verification: BuildVerification;
  onComplete: () => void;
  onStatusChange: (status: TaskStatus) => void;
  onVerificationChange: (simulationSuccess: boolean) => void;
}

function BuildTaskCard({
  item,
  status,
  verification,
  onComplete,
  onStatusChange,
  onVerificationChange,
}: BuildTaskCardProps) {
  const guidedBuild = Boolean(item.verificationMethod && item.steps?.length);
  const completed = status === "pass" && verification.simulationSuccess;
  const visibleStatus: TaskStatus = completed ? "pass" : status === "todo" ? "todo" : "doing";

  return (
    <article className={`task-row build-task-card${completed ? " completed" : ""}`} id={`task-${item.id}`}>
      <span className={`task-marker status-${visibleStatus}`} aria-hidden="true" />
      <div>
        <div className="build-task-heading">
          <div>
            <h2>{item.title}</h2>
            <p>{item.requirements.join(" · ")}</p>
          </div>
          {guidedBuild
            ? <strong className={`build-status status-${visibleStatus}`}>{visibleStatus.toUpperCase()}</strong>
            : <TaskStatusSelect taskTitle={item.title} value={status} onChange={onStatusChange} />}
        </div>
        {item.verificationMethod ? <p className="verification-method">VERIFY WITH: {item.verificationMethod.toUpperCase()}</p> : null}
        {(item.steps?.length ?? 0) > 0 ? (
          <div className="execution-block">
            <h3>STEPS</h3>
            <ol className="build-step-list">
              {item.steps?.map((step) => (
                <li key={step.stepNumber}>
                  <span>{String(step.stepNumber).padStart(2, "0")}</span>
                  <div>
                    <h4>{step.title}</h4>
                    <p>{step.description}</p>
                    {step.command ? <code className="command-line">{step.command}</code> : null}
                    {step.expectedResult ? <p className="step-expected"><strong>EXPECTED</strong>{step.expectedResult}</p> : null}
                  </div>
                </li>
              ))}
            </ol>
          </div>
        ) : null}
        {item.starterCode ? (
          <div className="execution-block">
            <h3>STARTER CODE</h3>
            <pre><code>{item.starterCode}</code></pre>
          </div>
        ) : null}
        {(item.commands?.length ?? 0) > 0 ? (
          <div className="execution-block">
            <h3>COMMANDS</h3>
            {item.commands?.map((command) => <code className="command-line" key={command}>{command}</code>)}
          </div>
        ) : null}
        {(item.expectedOutput?.length ?? 0) > 0 ? (
          <div className="execution-block">
            <h3>EXPECTED OUTPUT</h3>
            <ul className="execution-list">{item.expectedOutput?.map((output) => <li key={output}>{output}</li>)}</ul>
          </div>
        ) : null}
        <div className="execution-block">
          <h3>DELIVERABLES</h3>
          <ul className="execution-list">{item.deliverables.map((deliverable) => <li key={deliverable}>{deliverable}</li>)}</ul>
        </div>
        {guidedBuild ? (
          <div className="build-verification" aria-live="polite">
            <label>
              <input
                checked={verification.simulationSuccess}
                onChange={(event) => onVerificationChange(event.currentTarget.checked)}
                type="checkbox"
              />
              <span>代码运行成功</span>
            </label>
            <button
              disabled={!verification.simulationSuccess || completed}
              onClick={onComplete}
              type="button"
            >
              {completed ? "BUILD COMPLETED" : "COMPLETE BUILD"}
            </button>
            {completed ? <strong>✓ BUILD COMPLETED</strong> : null}
          </div>
        ) : null}
      </div>
    </article>
  );
}

export function TodayPage({
  availableDays,
  canGoPrevious,
  canGoNext,
  day,
  dayProgress,
  completeBuildTask,
  getBuildVerification,
  getPassCriterionState,
  getResourceProgress,
  getSoftwareStatus,
  getTaskStatus,
  markResourceOpened,
  setResourceCompleted,
  updateTaskStatus,
  onSelectDay,
  onPreviousDay,
  onNextDay,
  onStudySessionSaved,
  studyTime,
  togglePassCriterion,
  updateBuildVerification,
  updateSoftwareStatus,
}: TodayPageProps) {
  const [selectedStudyType, setSelectedStudyType] = useState<StudyType>("LEARN");
  const [activeFocusTask, setActiveFocusTask] = useState<FocusTask>();
  const [pendingTaskCompletion, setPendingTaskCompletion] = useState<PendingTaskCompletion>();
  const studyTimer = useStudyTimer({
    type: selectedStudyType,
    relatedDayId: day.id,
    onSessionSaved: onStudySessionSaved,
  });
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
  const dayCompletion = calculateDayCompletion(day, dayProgress);
  const dayStatus: TaskStatus = dayCompletion.complete
    ? "pass"
    : dayCompletion.hasActivity ? "doing" : "todo";
  const incompleteFocusTasks: FocusTask[] = [
    ...day.learn.flatMap((resource): FocusTask[] => (
      getResourceProgress(resource.id).resourceCompleted ? [] : [{
        id: resource.id,
        title: resource.title,
        type: "LEARN",
        kind: "resource",
        completionGate: "none",
        url: resource.url,
        optional: resource.required === false,
      }]
    )),
    ...day.practice.flatMap((task): FocusTask[] => (
      getTaskStatus(task.id) === "pass" ? [] : [{
        id: task.id,
        title: task.title,
        type: "PRACTICE",
        kind: "practice",
        completionGate: task.options && task.correctOptionId ? "practice" : "none",
      }]
    )),
    ...day.build.flatMap((task): FocusTask[] => (
      getTaskStatus(task.id) === "pass" ? [] : [{
        id: task.id,
        title: task.title,
        type: "BUILD",
        kind: "build",
        completionGate: task.verificationMethod && task.steps?.length ? "build" : "none",
      }]
    )),
    ...day.debug.flatMap((task): FocusTask[] => (
      getTaskStatus(task.id) === "pass" ? [] : [{
        id: task.id,
        title: task.title,
        type: "DEBUG",
        kind: "debug",
        completionGate: "none",
      }]
    )),
  ];

  const startFocusedStudy = (task: FocusTask) => {
    if (studyTimer.status !== "idle") return;
    setSelectedStudyType(task.type);
    setActiveFocusTask(task);
    studyTimer.actions.start({
      type: task.type,
      relatedDayId: day.id,
      relatedTaskId: task.id,
    });
  };

  const stopAndSaveStudy = () => {
    const session = studyTimer.actions.stop();
    const completedFocusTask = activeFocusTask;
    setActiveFocusTask(undefined);
    if (session && completedFocusTask) {
      setPendingTaskCompletion({ session, task: completedFocusTask });
    }
  };

  const confirmTaskCompletion = () => {
    if (!pendingTaskCompletion) return;
    const task = pendingTaskCompletion.task;
    if (task.kind === "resource") {
      setResourceCompleted(task.id, true);
    } else if (task.completionGate === "practice") {
      updateTaskStatus(task.id, "doing");
    } else if (task.completionGate === "build") {
      if (getBuildVerification(task.id).simulationSuccess) completeBuildTask(task.id);
      else updateTaskStatus(task.id, "doing");
    } else {
      updateTaskStatus(task.id, "pass");
    }
    setPendingTaskCompletion(undefined);
    if (task.completionGate !== "none") {
      window.setTimeout(() => {
        document.getElementById(`task-${task.id}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 0);
    }
  };

  return (
    <AppShell activePage="today">
      <header className="page-header">
        <div>
          <p className="eyebrow">{stageCode} · {day.stage.title.toUpperCase()}</p>
          <p className="day-code">{weekCode} / {dayCode}</p>
          <h1>{day.title}</h1>
        </div>
        <span className={`status-badge status-${dayStatus}`}>DAY {dayStatus.toUpperCase()}</span>
      </header>
      <section className="day-selector" aria-label="Day Selector">
        <div>
          <span>DAY SELECTOR</span>
          <strong>{weekCode} / {dayCode}</strong>
        </div>
        <select
          aria-label="Select learning day"
          disabled={studyTimer.status !== "idle"}
          onChange={(event) => onSelectDay(Number(event.target.value))}
          value={day.day}
        >
          {availableDays.map((dayNumber) => (
            <option key={dayNumber} value={dayNumber}>Day {dayNumber}</option>
          ))}
        </select>
      </section>
      <section className="today-focus" aria-labelledby="today-focus-title">
        <header>
          <div>
            <p>{weekCode} / {dayCode}</p>
            <h2 id="today-focus-title">TODAY&apos;S FOCUS</h2>
          </div>
          <strong>{incompleteFocusTasks.length} OPEN</strong>
        </header>
        <div className="today-focus-goal">
          <span>GOAL</span>
          <p>{day.description ?? day.topics.join(" · ")}</p>
        </div>
        <div className="focus-task-list">
          {incompleteFocusTasks.map((task) => (
            <article key={`${task.kind}-${task.id}`}>
              <div>
                <span>{task.type}{task.optional ? " · OPTIONAL" : ""}</span>
                <strong>{task.title}</strong>
              </div>
              <div className="focus-task-actions">
                {task.url ? (
                  <a
                    href={task.url}
                    onClick={() => {
                      if (task.kind === "resource") markResourceOpened(task.id);
                    }}
                    rel="noreferrer"
                    target="_blank"
                  >OPEN ↗</a>
                ) : null}
                <button
                  disabled={studyTimer.status !== "idle"}
                  onClick={() => startFocusedStudy(task)}
                  type="button"
                >START STUDY</button>
              </div>
            </article>
          ))}
          {incompleteFocusTasks.length === 0 ? <p className="focus-complete">✓ ALL TASKS COMPLETED</p> : null}
        </div>
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
        <div className="progress-summary day-completion-summary">
          <span>DAY COMPLETION</span>
          <strong>{dayCompletion.completedRequirements} / {dayCompletion.totalRequirements} · {dayCompletion.percentage}%</strong>
          <div className="metric-track" aria-label={`今日闭环完成度 ${dayCompletion.percentage}%`}><span style={{ width: `${dayCompletion.percentage}%` }} /></div>
        </div>
      </section>
      <section className="study-time-panel" aria-labelledby="study-time-title">
        <header>
          <div>
            <p>FOCUSED SESSION</p>
            <h2 id="study-time-title">STUDY TIMER</h2>
          </div>
          <strong>{totalStudyTime} MIN</strong>
        </header>
        <div className="study-timer-body">
          {activeFocusTask ? (
            <div className="active-focus-task">
              <span>ACTIVE TASK</span>
              <strong>{activeFocusTask.title}</strong>
            </div>
          ) : null}
          <label className="study-type-field" htmlFor="study-session-type">
            <span>SESSION TYPE</span>
            <select
              disabled={studyTimer.status !== "idle"}
              id="study-session-type"
              onChange={(event) => setSelectedStudyType(event.currentTarget.value as StudyType)}
              value={selectedStudyType}
            >
              {studyTypes.map((type) => <option key={type} value={type}>{type}</option>)}
            </select>
          </label>
          <div className="study-timer-display" aria-live="polite">
            <span>{studyTimer.status.toUpperCase()}</span>
            <strong>{formatElapsedTime(studyTimer.elapsedTime)}</strong>
          </div>
          <div className="study-timer-actions">
            <button
              disabled={studyTimer.status !== "idle"}
              onClick={() => studyTimer.actions.start()}
              type="button"
            >START</button>
            {studyTimer.status === "paused" ? (
              <button onClick={studyTimer.actions.resume} type="button">RESUME</button>
            ) : (
              <button
                disabled={studyTimer.status !== "running"}
                onClick={studyTimer.actions.pause}
                type="button"
              >PAUSE</button>
            )}
            <button
              disabled={studyTimer.status === "idle"}
              onClick={stopAndSaveStudy}
              type="button"
            >STOP &amp; SAVE</button>
          </div>
        </div>
      </section>
      {(day.softwareRequirements?.length ?? 0) > 0 ? (
        <Section title="今日软件准备" count={day.softwareRequirements?.length ?? 0}>
          {day.softwareRequirements?.map((software) => (
            <article className="software-row" key={software.id}>
              <div className="software-heading">
                <div>
                  <span className={`requirement-label ${software.required ? "required" : "optional"}`}>
                    {software.required ? "REQUIRED" : "OPTIONAL"}
                  </span>
                  <h2>{software.name}</h2>
                  <p>{software.purpose}</p>
                </div>
                <TaskStatusSelect
                  taskTitle={software.name}
                  value={getSoftwareStatus(software.id)}
                  onChange={(status) => updateSoftwareStatus(software.id, status)}
                />
              </div>
              <div className="software-actions">
                <a href={software.installUrl} rel="noreferrer" target="_blank">OPEN INSTALL GUIDE ↗</a>
              </div>
              <ol className="execution-list">
                {software.verificationSteps.map((step) => <li key={step}>{step}</li>)}
              </ol>
            </article>
          ))}
        </Section>
      ) : null}
      <Section title="LEARN" count={day.topics.length + day.learn.length}>
        <div className="learning-group">
          <h2 className="learning-group-title">LEARNING TOPICS</h2>
          <ul className="topic-list">
            {day.topics.map((topic) => <li key={topic}>{topic}</li>)}
          </ul>
        </div>
        <div className="learning-group">
          <h2 className="learning-group-title">RESOURCES</h2>
          {day.learn.length > 0 ? day.learn.map((item) => {
            const resourceProgress = getResourceProgress(item.id);
            return (
              <article className={`learning-row resource-card${resourceProgress.resourceCompleted ? " completed" : ""}`} id={`task-${item.id}`} key={item.id}>
                <div>
                  <div className="resource-meta">
                    <span className="item-type">{item.type}</span>
                    <span className="resource-platform">{item.platform}</span>
                    <span className={`requirement-label ${item.required === false ? "optional" : "required"}`}>
                      {item.required === false ? "OPTIONAL" : "REQUIRED"}
                    </span>
                    <span className="time-label">{item.duration} MIN</span>
                  </div>
                  <h2>{item.title}</h2>
                  <p>{item.description}</p>
                  {(item.learningObjectives?.length ?? 0) > 0 ? (
                    <ul className="resource-objectives">
                      {item.learningObjectives?.map((objective) => <li key={objective}>{objective}</li>)}
                    </ul>
                  ) : null}
                </div>
                <div className="resource-actions">
                  <a href={item.url} onClick={() => markResourceOpened(item.id)} rel="noreferrer" target="_blank">
                    {resourceProgress.resourceOpened ? "OPEN AGAIN ↗" : "OPEN RESOURCE ↗"}
                  </a>
                  <label>
                    <input
                      checked={resourceProgress.resourceCompleted}
                      onChange={(event) => setResourceCompleted(item.id, event.currentTarget.checked)}
                      type="checkbox"
                    />
                    <span>{resourceProgress.resourceCompleted ? "COMPLETED" : "MARK COMPLETE"}</span>
                  </label>
                </div>
              </article>
            );
          }) : <p className="empty-resource-note">NO RESOURCES ADDED</p>}
        </div>
      </Section>
      <Section title="PRACTICE" count={day.practice.length}>
        <div className="practice-list">
          {day.practice.map((item, index) => (
            item.options && item.correctOptionId
              ? (
                <PracticeCard
                  index={index}
                  item={item}
                  key={item.id}
                  onStatusChange={(status) => updateTaskStatus(item.id, status)}
                  status={getTaskStatus(item.id)}
                  total={day.practice.length}
                />
              )
              : (
                <article className="task-row" id={`task-${item.id}`} key={item.id}>
                  <span className={`task-marker status-${getTaskStatus(item.id)}`} aria-hidden="true" />
                  <div><h2>{item.title}</h2><p>{item.target ?? "NO DESCRIPTION PROVIDED"}</p></div>
                  <TaskStatusSelect taskTitle={item.title} value={getTaskStatus(item.id)} onChange={(status) => updateTaskStatus(item.id, status)} />
                </article>
              )
          ))}
        </div>
        {day.practice.length === 0 ? <p className="empty-resource-note">NO TASKS</p> : null}
      </Section>
      <Section title="BUILD" count={day.build.length}>
        {day.build.map((item) => (
          <BuildTaskCard
            item={item}
            key={item.id}
            onComplete={() => completeBuildTask(item.id)}
            onStatusChange={(status) => updateTaskStatus(item.id, status)}
            onVerificationChange={(simulationSuccess) => updateBuildVerification(item.id, simulationSuccess)}
            status={getTaskStatus(item.id)}
            verification={getBuildVerification(item.id)}
          />
        ))}
        {day.build.length === 0 ? <p className="empty-resource-note">NO TASKS</p> : null}
      </Section>
      <Section title="DEBUG" count={day.debug.length}>
        {day.debug.map((item) => (
          <article className="task-row" id={`task-${item.id}`} key={item.id}><span className={`task-marker status-${getTaskStatus(item.id)}`} aria-hidden="true" /><div><h2>{item.title}</h2><p>{item.prompt}</p><p className="expected-outcome">EXPECTED: {item.expectedOutcome}</p></div><TaskStatusSelect taskTitle={item.title} value={getTaskStatus(item.id)} onChange={(status) => updateTaskStatus(item.id, status)} /></article>
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
        <button disabled={!canGoPrevious || studyTimer.status !== "idle"} onClick={onPreviousDay} type="button">← PREVIOUS DAY</button>
        <span>{weekCode} / {dayCode}</span>
        <button disabled={!canGoNext || studyTimer.status !== "idle"} onClick={onNextDay} type="button">NEXT DAY →</button>
      </nav>
      <p className="scope-note">V2.1 · DAY 1 LEARNING LOOP</p>
      {pendingTaskCompletion ? (
        <div className="session-completion-overlay">
          <section aria-labelledby="session-completion-title" aria-modal="true" className="session-completion-dialog" role="dialog">
            <p>SESSION SAVED</p>
            <h2 id="session-completion-title">COMPLETE THIS TASK?</h2>
            <strong>{pendingTaskCompletion.task.title}</strong>
            <dl>
              <div><dt>DURATION</dt><dd>{formatElapsedTime(pendingTaskCompletion.session.duration)}</dd></div>
              <div><dt>TYPE</dt><dd>{pendingTaskCompletion.session.type}</dd></div>
            </dl>
            {pendingTaskCompletion.task.completionGate === "practice" ? (
              <p className="completion-gate-note">Practice仍需提交正确答案；确认后将带你回到练习。</p>
            ) : null}
            {pendingTaskCompletion.task.completionGate === "build" ? (
              <p className="completion-gate-note">Build仍需确认代码运行成功；确认后将带你回到Build验证。</p>
            ) : null}
            <footer>
              <button onClick={confirmTaskCompletion} type="button">COMPLETE</button>
              <button onClick={() => setPendingTaskCompletion(undefined)} type="button">NOT YET</button>
            </footer>
          </section>
        </div>
      ) : null}
    </AppShell>
  );
}
