import type { Project } from "@/types/project";
import type { ProjectRecord } from "@/types/projects";

export const projects: readonly Project[] = [
  {
    id: "project-basic-logic-library",
    title: "Basic Logic Library",
    description: "实现基础组合逻辑模块：AND、OR、XOR、MUX、Decoder、Encoder、Counter。",
    level: "basic",
    status: "todo",
    skills: ["Digital Logic", "Verilog"],
    relatedRoadmapId: "roadmap-week01-build-basic-logic-library",
    milestones: ["AND", "OR", "XOR", "MUX", "Decoder", "Encoder", "Counter"],
    progress: 0,
  },
  {
    id: "project-uart-verification",
    title: "UART Verification",
    description: "UART RTL + Verification Environment",
    level: "intermediate",
    status: "todo",
    skills: ["Verilog", "SystemVerilog", "Testbench"],
    relatedRoadmapId: "roadmap-week03-build-uart-verification-environment",
    milestones: ["UART RTL", "Verification Environment"],
    progress: 0,
  },
  {
    id: "project-fifo-verification",
    title: "FIFO Verification",
    description: "FIFO RTL验证项目",
    level: "intermediate",
    status: "todo",
    skills: ["SystemVerilog", "Coverage", "Debug"],
    relatedRoadmapId: "roadmap-week04-build-fifo-rtl-testbench",
    milestones: ["FIFO RTL验证项目"],
    progress: 0,
  },
  {
    id: "project-apb-slave-verification",
    title: "APB Slave Verification",
    description: "完整协议验证项目",
    level: "advanced",
    status: "todo",
    skills: ["UVM", "APB", "Scoreboard"],
    relatedRoadmapId: "stage04",
    milestones: ["完整协议验证项目"],
    progress: 0,
  },
];

export type DefaultProject = Omit<ProjectRecord, "updatedAt">;

export const defaultProjects: readonly DefaultProject[] = [
  {
    id: "project-sync-fifo",
    name: "Synchronous FIFO",
    status: "not_started",
  },
  {
    id: "project-uart",
    name: "UART",
    status: "not_started",
  },
  {
    id: "project-sv-fifo-verification",
    name: "SystemVerilog FIFO Verification",
    status: "not_started",
  },
  {
    id: "project-spi-uvm",
    name: "SPI UVM Verification",
    status: "not_started",
  },
  {
    id: "project-axi-apb-spi",
    name: "AXI/APB/SPI Subsystem Verification",
    status: "not_started",
  },
];
