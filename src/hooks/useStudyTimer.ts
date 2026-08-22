import { useCallback, useEffect, useRef, useState } from "react";
import { addSession } from "@/storage/studySessionRepository";
import type { StudySession, StudyType } from "@/types/study-session";

export type StudyTimerStatus = "idle" | "running" | "paused";

interface UseStudyTimerOptions {
  type: StudyType;
  relatedDayId?: string;
  relatedTaskId?: string;
  onSessionSaved?: (session: StudySession) => void;
}

export interface StudySessionStartOptions {
  type?: StudyType;
  relatedDayId?: string;
  relatedTaskId?: string;
}

interface SessionContext {
  type: StudyType;
  relatedDayId?: string;
  relatedTaskId?: string;
  startedAt: Date;
}

function formatLocalDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function createSessionId(date: Date): string {
  const randomPart = typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID().replaceAll("-", "").slice(0, 8)
    : Math.random().toString(36).slice(2, 10).padEnd(8, "0");
  return `study-session-${date.getTime()}-${randomPart}`;
}

export function useStudyTimer({
  type,
  relatedDayId,
  relatedTaskId,
  onSessionSaved,
}: UseStudyTimerOptions) {
  const [elapsedTime, setElapsedTime] = useState(0);
  const [status, setStatus] = useState<StudyTimerStatus>("idle");
  const accumulatedMilliseconds = useRef(0);
  const runningSince = useRef<number | undefined>(undefined);
  const sessionContext = useRef<SessionContext | undefined>(undefined);
  const savedCallback = useRef(onSessionSaved);

  useEffect(() => {
    savedCallback.current = onSessionSaved;
  }, [onSessionSaved]);

  useEffect(() => {
    if (status !== "running") return undefined;
    const updateElapsedTime = () => {
      const activeMilliseconds = runningSince.current === undefined
        ? 0
        : Date.now() - runningSince.current;
      setElapsedTime(Math.floor((accumulatedMilliseconds.current + activeMilliseconds) / 1000));
    };
    updateElapsedTime();
    const intervalId = window.setInterval(updateElapsedTime, 250);
    return () => window.clearInterval(intervalId);
  }, [status]);

  const start = useCallback((overrides?: StudySessionStartOptions) => {
    if (status !== "idle") return;
    const startedAt = new Date();
    accumulatedMilliseconds.current = 0;
    runningSince.current = startedAt.getTime();
    sessionContext.current = {
      type: overrides?.type ?? type,
      relatedDayId: overrides?.relatedDayId ?? relatedDayId,
      relatedTaskId: overrides?.relatedTaskId ?? relatedTaskId,
      startedAt,
    };
    setElapsedTime(0);
    setStatus("running");
  }, [relatedDayId, relatedTaskId, status, type]);

  const pause = useCallback(() => {
    if (status !== "running" || runningSince.current === undefined) return;
    accumulatedMilliseconds.current += Date.now() - runningSince.current;
    runningSince.current = undefined;
    setElapsedTime(Math.floor(accumulatedMilliseconds.current / 1000));
    setStatus("paused");
  }, [status]);

  const resume = useCallback(() => {
    if (status !== "paused") return;
    runningSince.current = Date.now();
    setStatus("running");
  }, [status]);

  const stop = useCallback((): StudySession | undefined => {
    const context = sessionContext.current;
    if (status === "idle" || !context) return undefined;

    const endedAt = new Date();
    const activeMilliseconds = status === "running" && runningSince.current !== undefined
      ? endedAt.getTime() - runningSince.current
      : 0;
    const duration = Math.max(
      1,
      Math.floor((accumulatedMilliseconds.current + activeMilliseconds) / 1000),
    );
    const session: StudySession = {
      id: createSessionId(endedAt),
      date: formatLocalDate(context.startedAt),
      type: context.type,
      duration,
      startTime: context.startedAt.toISOString(),
      endTime: endedAt.toISOString(),
    };
    if (context.relatedDayId) session.relatedDayId = context.relatedDayId;
    if (context.relatedTaskId) session.relatedTaskId = context.relatedTaskId;

    addSession(session);
    savedCallback.current?.(session);
    accumulatedMilliseconds.current = 0;
    runningSince.current = undefined;
    sessionContext.current = undefined;
    setElapsedTime(0);
    setStatus("idle");
    return session;
  }, [status]);

  return {
    elapsedTime,
    status,
    actions: { start, pause, resume, stop },
  };
}
