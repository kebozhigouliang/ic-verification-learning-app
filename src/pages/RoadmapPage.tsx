import { AppShell } from "@/components/layout/AppShell";
import { PageIntro } from "@/components/ui/PageIntro";
import { roadmap } from "@/data/roadmap";

function weekLabel(start: number, end: number) {
  return start === end ? `W${String(start).padStart(2, "0")}` : `W${String(start).padStart(2, "0")}–W${String(end).padStart(2, "0")}`;
}

export function RoadmapPage() {
  return (
    <AppShell activePage="roadmap">
      <PageIntro code="ROADMAP / 24 WEEKS" title="学习路线" description="仅展示用户提供的阶段与主题；Week 1 已建立数据接口。" />
      <div className="roadmap-list">
        {roadmap.map((stage) => (
          <section className="roadmap-stage" key={stage.id}>
            <header><span>STAGE {stage.stage}</span><h2>{stage.title}</h2></header>
            <div>
              {stage.items.map((item) => (
                <article className="roadmap-item" key={item.id}>
                  <span className="roadmap-week">{weekLabel(item.weekStart, item.weekEnd)}</span>
                  <strong>{item.title}</strong>
                  <span className={`roadmap-status ${item.status}`}>{item.status === "available" ? "AVAILABLE" : "COMING LATER"}</span>
                </article>
              ))}
            </div>
          </section>
        ))}
      </div>
    </AppShell>
  );
}
