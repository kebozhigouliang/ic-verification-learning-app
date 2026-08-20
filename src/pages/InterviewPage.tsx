import { useMemo, useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { PageIntro } from "@/components/ui/PageIntro";
import { interviewQuestions } from "@/data/interview";
import { skills } from "@/data/skills";
import { useInterviewProgress } from "@/hooks/useInterviewProgress";
import type {
  InterviewCategory,
  InterviewDifficulty,
  UserAnswerStatus,
} from "@/types/interview";

type CategoryFilter = "ALL" | InterviewCategory;
type DifficultyFilter = "ALL" | InterviewDifficulty;

const categories: CategoryFilter[] = [
  "ALL",
  "VERILOG",
  "SYSTEMVERILOG",
  "UVM",
  "PROTOCOL",
  "DEBUG",
  "PROJECT",
];
const difficulties: DifficultyFilter[] = [
  "ALL",
  "BEGINNER",
  "INTERMEDIATE",
  "ADVANCED",
];
const answerStatuses: UserAnswerStatus[] = ["TODO", "LEARNING", "MASTERED"];

function skillName(skillId: string): string {
  return skills.find((skill) => skill.id === skillId)?.name ?? skillId;
}

export function InterviewPage() {
  const { answers, updateMyAnswer, updateStatus } = useInterviewProgress();
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>("ALL");
  const [difficultyFilter, setDifficultyFilter] = useState<DifficultyFilter>("ALL");
  const [expandedQuestionId, setExpandedQuestionId] = useState<string>();
  const [message, setMessage] = useState("");

  const visibleQuestions = useMemo(() => interviewQuestions.filter((question) => (
    (categoryFilter === "ALL" || question.category === categoryFilter)
    && (difficultyFilter === "ALL" || question.difficulty === difficultyFilter)
  )), [categoryFilter, difficultyFilter]);

  const saveMyAnswer = (questionId: string, myAnswer: string) => {
    try {
      updateMyAnswer(questionId, myAnswer);
      setMessage("");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Answer could not be saved.");
    }
  };

  const saveStatus = (questionId: string, status: UserAnswerStatus) => {
    try {
      updateStatus(questionId, status);
      setMessage("");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Status could not be saved.");
    }
  };

  return (
    <AppShell activePage="interview">
      <PageIntro
        code="INTERVIEW / PRACTICE"
        title="Interview Practice"
        description="按主题练习 IC Verification 面试题，记录自己的回答和掌握状态。"
      />

      <section className="interview-toolbar" aria-label="Interview question filters">
        <label>
          <span>CATEGORY</span>
          <select
            onChange={(event) => setCategoryFilter(event.target.value as CategoryFilter)}
            value={categoryFilter}
          >
            {categories.map((category) => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </label>
        <label>
          <span>DIFFICULTY</span>
          <select
            onChange={(event) => setDifficultyFilter(event.target.value as DifficultyFilter)}
            value={difficultyFilter}
          >
            {difficulties.map((difficulty) => (
              <option key={difficulty} value={difficulty}>{difficulty}</option>
            ))}
          </select>
        </label>
        <div>
          <span>QUESTIONS</span>
          <strong>{visibleQuestions.length}</strong>
        </div>
      </section>

      {message && <p className="interview-message" role="alert">{message}</p>}

      <section className="interview-list" aria-label="Interview questions">
        {visibleQuestions.map((question) => {
          const answer = answers[question.id];
          const currentStatus = answer?.status ?? "TODO";
          const expanded = expandedQuestionId === question.id;

          return (
            <article className={`interview-card status-${currentStatus.toLowerCase()}`} key={question.id}>
              <button
                aria-expanded={expanded}
                className="interview-question-toggle"
                onClick={() => setExpandedQuestionId(expanded ? undefined : question.id)}
                type="button"
              >
                <div>
                  <div className="interview-question-badges">
                    <span>{question.category}</span>
                    <span>{question.difficulty}</span>
                    <span>{currentStatus}</span>
                  </div>
                  <h2>{question.question}</h2>
                  <p>
                    RELATED SKILLS / {question.relatedSkillIds.map(skillName).join(" / ") || "NONE"}
                  </p>
                </div>
                <span aria-hidden="true">{expanded ? "−" : "+"}</span>
              </button>

              {expanded && (
                <div className="interview-answer-panel">
                  <section className="standard-answer" aria-label="Standard answer">
                    <span>STANDARD ANSWER</span>
                    <p>{question.answer}</p>
                  </section>

                  <label className="my-answer-field">
                    <span>MY ANSWER</span>
                    <textarea
                      onChange={(event) => saveMyAnswer(question.id, event.target.value)}
                      placeholder="用自己的语言组织答案……"
                      rows={6}
                      value={answer?.myAnswer ?? ""}
                    />
                  </label>

                  <div className="interview-status-control">
                    <span>STATUS</span>
                    <div>
                      {answerStatuses.map((status) => (
                        <button
                          aria-pressed={currentStatus === status}
                          className={currentStatus === status ? "active" : ""}
                          key={status}
                          onClick={() => saveStatus(question.id, status)}
                          type="button"
                        >
                          {status}
                        </button>
                      ))}
                    </div>
                  </div>

                  <footer>
                    <div className="interview-tags">
                      {question.tags.map((tag) => <span key={tag}>#{tag}</span>)}
                    </div>
                    {answer?.updatedAt && (
                      <time dateTime={answer.updatedAt}>
                        UPDATED {new Date(answer.updatedAt).toLocaleString()}
                      </time>
                    )}
                  </footer>
                </div>
              )}
            </article>
          );
        })}
      </section>
    </AppShell>
  );
}
