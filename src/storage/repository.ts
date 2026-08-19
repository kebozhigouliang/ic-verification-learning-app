import { createDefaultAppData, CURRENT_SCHEMA_VERSION } from "@/storage/defaults";
import { migrateAppData } from "@/storage/migrations";
import type { AppData } from "@/types/app-data";

export const STORAGE_KEY = "ic-verify-learning-app";

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

  if (!storage) return nextData;

  try {
    storage.setItem(STORAGE_KEY, JSON.stringify(nextData));
  } catch {
    // Storage can be unavailable or full. The in-memory session remains usable.
  }
  return nextData;
}

export function clearAppData(): void {
  try {
    getStorage()?.removeItem(STORAGE_KEY);
  } catch {
    // Clearing unavailable storage should not crash the application.
  }
}
