import { CURRENT_SCHEMA_VERSION } from "@/storage/defaults";
import { migrateAppData } from "@/storage/migrations";
import { loadAppData, saveAppData } from "@/storage/repository";
import type { AppData } from "@/types/app-data";

export type ImportErrorCode =
  | "FILE_READ_ERROR"
  | "INVALID_JSON"
  | "INVALID_STRUCTURE"
  | "UNSUPPORTED_VERSION";

export class AppDataImportError extends Error {
  constructor(
    public readonly code: ImportErrorCode,
    message: string,
  ) {
    super(message);
    this.name = "AppDataImportError";
  }
}

export type ImportResult =
  | { status: "cancelled" }
  | { status: "imported"; data: AppData };

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function validateImportEnvelope(value: unknown): asserts value is Record<string, unknown> {
  if (!isRecord(value) || !isRecord(value.progress)) {
    throw new AppDataImportError(
      "INVALID_STRUCTURE",
      "The selected file is not an IC Verify AppData backup.",
    );
  }

  if (!Number.isInteger(value.schemaVersion)) {
    throw new AppDataImportError(
      "INVALID_STRUCTURE",
      "The backup is missing a valid schemaVersion.",
    );
  }

  if (value.schemaVersion !== CURRENT_SCHEMA_VERSION) {
    throw new AppDataImportError(
      "UNSUPPORTED_VERSION",
      `Unsupported backup schema version: ${String(value.schemaVersion)}.`,
    );
  }
}

function formatLocalDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function createBackupFileName(date = new Date()): string {
  return `ic-verify-backup-${formatLocalDate(date)}.json`;
}

export function exportAppData(): string {
  if (typeof document === "undefined") {
    throw new Error("Data export is only available in a browser.");
  }

  const data = loadAppData();
  const fileName = createBackupFileName();
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const objectUrl = URL.createObjectURL(blob);
  const link = document.createElement("a");

  try {
    link.href = objectUrl;
    link.download = fileName;
    link.click();
  } finally {
    URL.revokeObjectURL(objectUrl);
  }

  return fileName;
}

export async function importAppData(
  file: File,
  confirmOverwrite: () => boolean,
): Promise<ImportResult> {
  let source: string;
  try {
    source = await file.text();
  } catch {
    throw new AppDataImportError("FILE_READ_ERROR", "The selected file could not be read.");
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(source) as unknown;
  } catch {
    throw new AppDataImportError("INVALID_JSON", "The selected file is not valid JSON.");
  }

  validateImportEnvelope(parsed);
  const normalized = migrateAppData(parsed);

  if (!confirmOverwrite()) return { status: "cancelled" };

  const savedData = saveAppData(normalized);
  return { status: "imported", data: savedData };
}
