import { loadAppData, saveAppData } from "@/storage/repository";
import type {
  InterviewProgress,
  UserAnswer,
  UserAnswerStatus,
} from "@/types/interview";

interface UserAnswerUpdate {
  myAnswer?: string;
  status?: UserAnswerStatus;
}

function nextUpdatedAt(previousUpdatedAt?: string): string {
  const previousTime = previousUpdatedAt ? Date.parse(previousUpdatedAt) : Number.NaN;
  const timestamp = Number.isFinite(previousTime)
    ? Math.max(Date.now(), previousTime + 1)
    : Date.now();
  return new Date(timestamp).toISOString();
}

export function updateUserAnswer(
  questionId: string,
  update: UserAnswerUpdate,
): InterviewProgress {
  const normalizedQuestionId = questionId.trim();
  if (!normalizedQuestionId) throw new Error("Question ID is required.");

  const appData = loadAppData();
  const current = appData.interviewProgress[normalizedQuestionId];
  const answer: UserAnswer = {
    questionId: normalizedQuestionId,
    myAnswer: update.myAnswer ?? current?.myAnswer ?? "",
    status: update.status ?? current?.status ?? "TODO",
    updatedAt: nextUpdatedAt(current?.updatedAt),
  };
  const interviewProgress = {
    ...appData.interviewProgress,
    [normalizedQuestionId]: answer,
  };

  return saveAppData({
    ...appData,
    interviewProgress,
  }).interviewProgress;
}
