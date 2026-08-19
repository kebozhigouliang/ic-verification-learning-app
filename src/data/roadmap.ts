import type { RoadmapStage } from "@/types/roadmap";

export const roadmap: RoadmapStage[] = [
  {
    id: "stage01", stage: 1, title: "Digital Logic + Verilog",
    items: [
      { id: "week01", weekStart: 1, weekEnd: 1, title: "基础RTL", status: "available" },
      { id: "week02", weekStart: 2, weekEnd: 2, title: "时序逻辑与FSM", status: "coming_later" },
      { id: "week03", weekStart: 3, weekEnd: 3, title: "FIFO", status: "coming_later" },
      { id: "week04", weekStart: 4, weekEnd: 4, title: "UART", status: "coming_later" },
    ],
  },
  {
    id: "stage02", stage: 2, title: "SystemVerilog",
    items: [
      { id: "week05", weekStart: 5, weekEnd: 5, title: "SV基础", status: "coming_later" },
      { id: "week06", weekStart: 6, weekEnd: 6, title: "OOP", status: "coming_later" },
      { id: "week07", weekStart: 7, weekEnd: 7, title: "Constraint Random", status: "coming_later" },
      { id: "week08", weekStart: 8, weekEnd: 8, title: "FIFO Verification", status: "coming_later" },
    ],
  },
  { id: "stage03", stage: 3, title: "UVM", items: [{ id: "weeks09-12", weekStart: 9, weekEnd: 12, title: "UVM", status: "coming_later" }] },
  { id: "stage04", stage: 4, title: "AMBA", items: [{ id: "weeks13-16", weekStart: 13, weekEnd: 16, title: "AMBA", status: "coming_later" }] },
  { id: "stage05", stage: 5, title: "综合项目", items: [{ id: "weeks17-20", weekStart: 17, weekEnd: 20, title: "综合项目", status: "coming_later" }] },
  { id: "stage06", stage: 6, title: "工程化 + 求职", items: [{ id: "weeks21-24", weekStart: 21, weekEnd: 24, title: "工程化 + 求职", status: "coming_later" }] },
];
