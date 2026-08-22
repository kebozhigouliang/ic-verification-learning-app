import { loadAppData, saveAppData } from "@/storage/repository";
import type { StudySession } from "@/types/study-session";

export function addSession(session: StudySession): StudySession[] {
  const appData = loadAppData();
  if (appData.studySessions.some((existing) => existing.id === session.id)) {
    throw new Error("Study session ID already exists.");
  }

  return saveAppData({
    ...appData,
    studySessions: [session, ...appData.studySessions],
  }).studySessions;
}

export function getSessions(): StudySession[] {
  return loadAppData().studySessions;
}

export function clearSessions(): StudySession[] {
  const appData = loadAppData();
  return saveAppData({ ...appData, studySessions: [] }).studySessions;
}
