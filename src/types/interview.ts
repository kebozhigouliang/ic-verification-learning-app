export type InterviewCategory =
  | "VERILOG"
  | "SYSTEMVERILOG"
  | "UVM"
  | "PROTOCOL"
  | "DEBUG"
  | "PROJECT";

export type InterviewDifficulty = "BEGINNER" | "INTERMEDIATE" | "ADVANCED";
export type UserAnswerStatus = "TODO" | "LEARNING" | "MASTERED";

export interface InterviewQuestion {
  id: string;
  category: InterviewCategory;
  difficulty: InterviewDifficulty;
  question: string;
  answer: string;
  relatedSkillIds: string[];
  relatedProjectIds: string[];
  tags: string[];
}

export interface UserAnswer {
  questionId: string;
  myAnswer: string;
  status: UserAnswerStatus;
  updatedAt: string;
}

export type InterviewProgress = Record<string, UserAnswer>;
