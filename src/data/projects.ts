import type { ProjectRecord } from "@/types/projects";

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
