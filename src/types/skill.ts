export type SkillCategory =
  | "foundation"
  | "language"
  | "verification"
  | "methodology"
  | "protocol";

export interface Skill {
  id: string;
  name: string;
  category: SkillCategory;
  relatedRoadmapIds: string[];
  relatedProjectIds: string[];
}

export interface SkillProgress {
  skillId: string;
  completion: number;
  evidence: string[];
}
