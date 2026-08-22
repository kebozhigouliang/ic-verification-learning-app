export type ResourceType = "VIDEO" | "ARTICLE" | "DOCUMENT" | "PRACTICE";

export interface LearningResource {
  id: string;
  title: string;
  type: ResourceType;
  url: string;
  platform: string;
  duration: number;
  description: string;
  learningObjectives?: string[];
  required?: boolean;
}
