import { AppShell } from "@/components/layout/AppShell";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageIntro } from "@/components/ui/PageIntro";

export function NotesPage() {
  return <AppShell activePage="notes"><PageIntro code="NOTES / DAILY" title="学习记录" description="QUESTION、BUG 与 NOTE 的页面入口。" /><EmptyState code="NO ENTRIES" title="还没有学习记录" description="Notes 的数据接口已预留；创建、编辑和删除功能不属于 Milestone 1。" /></AppShell>;
}
