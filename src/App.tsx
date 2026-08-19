import { useEffect, useState } from "react";
import type { PageId } from "@/components/layout/AppShell";
import { AppShell } from "@/components/layout/AppShell";
import { EmptyState } from "@/components/ui/EmptyState";
import { useLearningProgress } from "@/hooks/useLearningProgress";
import { NotesPage } from "@/pages/NotesPage";
import { ProgressPage } from "@/pages/ProgressPage";
import { ProjectsPage } from "@/pages/ProjectsPage";
import { RoadmapPage } from "@/pages/RoadmapPage";
import { SettingsPage } from "@/pages/SettingsPage";
import { TodayPage } from "@/pages/TodayPage";

const routePages: Record<string, PageId> = {
  "/": "today",
  "/roadmap": "roadmap",
  "/projects": "projects",
  "/notes": "notes",
  "/progress": "progress",
  "/settings": "settings",
};

function getPageFromHash(): PageId {
  const path = window.location.hash.slice(1) || "/";
  return routePages[path] ?? "today";
}

export function App() {
  const [page, setPage] = useState<PageId>(getPageFromHash);
  const {
    availableDays,
    canGoNext,
    canGoPrevious,
    currentLearningDay,
    getPassCriterionState,
    getTaskStatus,
    goToNextDay,
    goToPreviousDay,
    replaceAppData,
    resetProgress,
    selectDay,
    studyTime,
    togglePassCriterion,
    updateStudyTime,
    updateTaskStatus,
  } = useLearningProgress();

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
    case "settings": return (
      <SettingsPage
        onDataImported={(data) => {
          replaceAppData(data);
          window.location.hash = "#/";
        }}
        onResetProgress={() => {
          resetProgress();
          window.location.hash = "#/";
        }}
      />
    );
    default: return currentLearningDay
      ? (
        <TodayPage
          availableDays={availableDays}
          canGoNext={canGoNext}
          canGoPrevious={canGoPrevious}
          day={currentLearningDay}
          getPassCriterionState={getPassCriterionState}
          getTaskStatus={getTaskStatus}
          onNextDay={goToNextDay}
          onPreviousDay={goToPreviousDay}
          onSelectDay={selectDay}
          studyTime={studyTime}
          togglePassCriterion={togglePassCriterion}
          updateStudyTime={updateStudyTime}
          updateTaskStatus={updateTaskStatus}
        />
      )
      : (
        <AppShell activePage="today">
          <EmptyState
            code="DATA NOT FOUND"
            title="无法加载今日学习数据"
            description="请检查 Week 数据注册和当前学习位置。"
          />
        </AppShell>
      );
  }
}
