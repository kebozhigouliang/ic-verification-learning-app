import { useEffect, useState } from "react";
import type { PageId } from "@/components/layout/AppShell";
import { NotesPage } from "@/pages/NotesPage";
import { ProgressPage } from "@/pages/ProgressPage";
import { ProjectsPage } from "@/pages/ProjectsPage";
import { RoadmapPage } from "@/pages/RoadmapPage";
import { TodayPage } from "@/pages/TodayPage";

const routePages: Record<string, PageId> = {
  "/": "today",
  "/roadmap": "roadmap",
  "/projects": "projects",
  "/notes": "notes",
  "/progress": "progress",
};

function getPageFromHash(): PageId {
  const path = window.location.hash.slice(1) || "/";
  return routePages[path] ?? "today";
}

export function App() {
  const [page, setPage] = useState<PageId>(getPageFromHash);

  useEffect(() => {
    const onHashChange = () => setPage(getPageFromHash());
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  switch (page) {
    case "roadmap": return <RoadmapPage />;
    case "projects": return <ProjectsPage />;
    case "notes": return <NotesPage />;
    case "progress": return <ProgressPage />;
    default: return <TodayPage />;
  }
}
