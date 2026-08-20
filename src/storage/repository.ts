import { createDefaultAppData, CURRENT_SCHEMA_VERSION } from "@/storage/defaults";
import { migrateAppData } from "@/storage/migrations";
import type { AppData } from "@/types/app-data";

export const STORAGE_KEY = "ic-verify-learning-app";

export class AppDataStorageError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AppDataStorageError";
  }
}

function getStorage(): Storage | undefined {
  try {
    return typeof window === "undefined" ? undefined : window.localStorage;
  } catch {
    return undefined;
  }
}

export function loadAppData(): AppData {
  const storage = getStorage();
  if (!storage) return createDefaultAppData();

  try {
    const serialized = storage.getItem(STORAGE_KEY);
    return serialized === null
      ? createDefaultAppData()
      : migrateAppData(JSON.parse(serialized) as unknown);
  } catch {
    return createDefaultAppData();
  }
}

export function saveAppData(data: AppData): AppData {
  const storage = getStorage();

  const nextData: AppData = {
    ...data,
    schemaVersion: CURRENT_SCHEMA_VERSION,
    updatedAt: new Date().toISOString(),
  };

  if (!storage) {
    throw new AppDataStorageError("Local storage is unavailable.");
  }

  try {
    storage.setItem(STORAGE_KEY, JSON.stringify(nextData));
  } catch {
    throw new AppDataStorageError("Local data could not be saved.");
  }
  return nextData;
}

export function resetAppData(): AppData {
  const currentData = loadAppData();
  const defaultData = createDefaultAppData();
  return saveAppData({
    ...defaultData,
    interviewProgress: currentData.interviewProgress,
    notes: currentData.notes,
    projects: currentData.projects,
  });
}

export function clearAppData(): void {
  try {
    getStorage()?.removeItem(STORAGE_KEY);
  } catch {
    // Clearing unavailable storage should not crash the application.
  }
}
