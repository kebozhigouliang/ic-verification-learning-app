import type { LearningStage, RoadmapStage } from "@/types/roadmap";

export const learningRoadmap: LearningStage[] = [
  {
    id: "stage01",
    title: "数字逻辑 + Verilog基础",
    description: "从数字逻辑、Verilog语法和Testbench基础逐步进入RTL设计、仿真与调试。",
    duration: "Week 1-4",
    skills: ["数字逻辑基础", "Verilog基础", "Testbench基础", "Debug与综合实践"],
    weeks: [
      {
        id: "week01",
        title: "数字逻辑基础",
        goal: "理解数字系统基础，为 Verilog 学习准备。",
        days: [
          {
            id: "roadmap-week01-plan",
            title: "数字逻辑基础",
            topics: [
              "Binary",
              "Boolean Algebra",
              "Logic Gates",
              "Combinational Logic",
              "Sequential Logic",
              "Flip Flop",
              "FSM",
            ],
            resources: [],
            tasks: [
              {
                id: "roadmap-week01-learn-binary-logic",
                category: "learn",
                title: "学习二进制和逻辑运算",
              },
              {
                id: "roadmap-week01-learn-combinational-sequential",
                category: "learn",
                title: "理解组合逻辑和时序逻辑",
              },
              {
                id: "roadmap-week01-practice-hdlbits-basic",
                category: "practice",
                title: "HDLBits基础题",
              },
              {
                id: "roadmap-week01-build-basic-logic-library",
                category: "build",
                title: "Basic Logic Library",
                deliverables: [
                  "AND Gate",
                  "OR Gate",
                  "XOR Gate",
                  "MUX",
                  "Decoder",
                  "Encoder",
                  "Counter",
                ],
              },
            ],
            passCriteria: [],
          },
        ],
      },
      {
        id: "week02",
        title: "Verilog基础",
        goal: "掌握 Verilog 基本语法，并完成 UART Transmitter。",
        days: [
          {
            id: "roadmap-week02-plan",
            title: "Verilog基础",
            topics: [
              "module",
              "input/output",
              "wire",
              "reg",
              "assign",
              "always block",
              "parameter",
              "generate",
            ],
            resources: [],
            tasks: [
              {
                id: "roadmap-week02-learn-verilog-syntax",
                category: "learn",
                title: "Verilog基本语法",
              },
              {
                id: "roadmap-week02-practice-hdlbits-verilog",
                category: "practice",
                title: "HDLBits Verilog基础",
              },
              {
                id: "roadmap-week02-build-uart-transmitter",
                category: "build",
                title: "UART Transmitter",
              },
            ],
            passCriteria: [],
          },
        ],
      },
      {
        id: "week03",
        title: "Testbench基础",
        goal: "掌握基础验证流程，并完成 UART Verification Environment。",
        days: [
          {
            id: "roadmap-week03-plan",
            title: "Testbench基础",
            topics: ["stimulus", "monitor", "checker", "waveform", "simulation"],
            resources: [
              {
                id: "roadmap-week03-tool-iverilog",
                title: "iverilog",
                type: "document",
                scope: "Tool",
              },
              {
                id: "roadmap-week03-tool-gtkwave",
                title: "GTKWave",
                type: "document",
                scope: "Tool",
              },
              {
                id: "roadmap-week03-tool-vscode",
                title: "VSCode",
                type: "document",
                scope: "Tool",
              },
            ],
            tasks: [
              {
                id: "roadmap-week03-build-uart-verification-environment",
                category: "build",
                title: "UART Verification Environment",
              },
            ],
            passCriteria: [],
          },
        ],
      },
      {
        id: "week04",
        title: "Debug与综合实践",
        goal: "通过波形和逻辑调试改进 Testbench，并完成 FIFO RTL + Testbench。",
        days: [
          {
            id: "roadmap-week04-plan",
            title: "Debug与综合实践",
            topics: [
              "waveform debugging",
              "logic bug",
              "timing bug",
              "testbench improvement",
            ],
            resources: [],
            tasks: [
              {
                id: "roadmap-week04-build-fifo-rtl-testbench",
                category: "build",
                title: "FIFO RTL + Testbench",
              },
            ],
            passCriteria: [],
          },
        ],
      },
    ],
  },
];

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
