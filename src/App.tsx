import { useEffect, useState } from "react";
import type { PageId } from "@/components/layout/AppShell";
import { AppShell } from "@/components/layout/AppShell";
import { EmptyState } from "@/components/ui/EmptyState";
import { useLearningProgress } from "@/hooks/useLearningProgress";
import { InterviewPage } from "@/pages/InterviewPage";
import { NotesPage } from "@/pages/NotesPage";
import { ProgressPage } from "@/pages/ProgressPage";
import { ProjectsPage } from "@/pages/ProjectsPage";
import { RoadmapPage } from "@/pages/RoadmapPage";
import { SettingsPage } from "@/pages/SettingsPage";
import { SkillsPage } from "@/pages/SkillsPage";
import { TodayPage } from "@/pages/TodayPage";

const routePages: Record<string, PageId> = {
  "/": "today",
  "/roadmap": "roadmap",
  "/projects": "projects",
  "/skills": "skills",
  "/notes": "notes",
  "/progress": "progress",
  "/interview": "interview",
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
    completeBuildTask,
    currentLearningDay,
    currentDayProgress,
    getPassCriterionState,
    getBuildVerification,
    getResourceProgress,
    getSoftwareStatus,
    getTaskStatus,
    goToNextDay,
    goToPreviousDay,
    learningProgress,
    markResourceOpened,
    recordStudySession,
    replaceAppData,
    resetProgress,
    selectDay,
    setResourceCompleted,
    studyTime,
    togglePassCriterion,
    updateBuildVerification,
    updateSoftwareStatus,
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
    case "skills": return <SkillsPage progress={learningProgress} />;
    case "notes": return <NotesPage />;
    case "progress": return <ProgressPage progress={learningProgress} />;
    case "interview": return <InterviewPage />;
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
          dayProgress={currentDayProgress!}
          completeBuildTask={completeBuildTask}
          getBuildVerification={getBuildVerification}
          getPassCriterionState={getPassCriterionState}
          getResourceProgress={getResourceProgress}
          getSoftwareStatus={getSoftwareStatus}
          getTaskStatus={getTaskStatus}
          markResourceOpened={markResourceOpened}
          onNextDay={goToNextDay}
          onPreviousDay={goToPreviousDay}
          onSelectDay={selectDay}
          onStudySessionSaved={recordStudySession}
          studyTime={studyTime}
          setResourceCompleted={setResourceCompleted}
          togglePassCriterion={togglePassCriterion}
          updateBuildVerification={updateBuildVerification}
          updateSoftwareStatus={updateSoftwareStatus}
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
