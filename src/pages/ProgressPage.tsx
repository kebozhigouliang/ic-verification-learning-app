import { AppShell } from "@/components/layout/AppShell";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageIntro } from "@/components/ui/PageIntro";

export function ProgressPage() {
  return <AppShell activePage="progress"><PageIntro code="PROGRESS / READ ONLY" title="学习进度" description="后续将汇总任务、Checkpoint、HDLBits 与学习时间。" /><EmptyState code="AWAITING DATA" title="暂无可统计进度" description="统计接口已预留，Milestone 1 不生成模拟进度。" readOnlyNote="学习时间只能在 Today 页面修改；Progress 始终只读。" /></AppShell>;
}
