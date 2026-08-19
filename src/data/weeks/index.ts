import type { LearningDay, LearningWeek } from "@/types/learning";
import { week01 } from "./week01";

export const weeks: Readonly<Record<number, LearningWeek>> = {
  1: week01,
};

export const initialLearningSelection = {
  week: 1,
  day: 1,
} as const;

export function getLearningDay(week: number, day: number): LearningDay | undefined {
  return weeks[week]?.days.find((learningDay) => learningDay.day === day);
}
