import { useCallback, useState } from "react";
import { updateUserAnswer } from "@/storage/interviewRepository";
import { loadAppData } from "@/storage/repository";
import type {
  InterviewProgress,
  UserAnswerStatus,
} from "@/types/interview";

export function useInterviewProgress() {
  const [answers, setAnswers] = useState<InterviewProgress>(() => (
    loadAppData().interviewProgress
  ));

  const updateMyAnswer = useCallback((questionId: string, myAnswer: string) => {
    setAnswers(updateUserAnswer(questionId, { myAnswer }));
  }, []);

  const updateStatus = useCallback((questionId: string, status: UserAnswerStatus) => {
    setAnswers(updateUserAnswer(questionId, { status }));
  }, []);

  return {
    answers,
    updateMyAnswer,
    updateStatus,
  };
}
