export interface RoadmapItem {
  id: string;
  weekStart: number;
  weekEnd: number;
  title: string;
  status: "available" | "coming_later";
}

export interface RoadmapStage {
  id: string;
  stage: number;
  title: string;
  items: RoadmapItem[];
}
