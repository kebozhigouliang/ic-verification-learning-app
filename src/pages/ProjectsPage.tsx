import { AppShell } from "@/components/layout/AppShell";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageIntro } from "@/components/ui/PageIntro";

export function ProjectsPage() {
  return <AppShell activePage="projects"><PageIntro code="PROJECTS / LOCAL" title="项目" description="用于长期追踪 IC 验证项目。" /><EmptyState code="INTERFACE RESERVED" title="项目面板将在后续 Milestone 启用" description="V1 数据接口仅预留项目名称、状态、日期、Git 仓库链接和当前问题备注。" /></AppShell>;
}
