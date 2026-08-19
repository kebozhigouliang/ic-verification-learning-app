import { useRef, useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { PageIntro } from "@/components/ui/PageIntro";
import {
  AppDataImportError,
  exportAppData,
  importAppData,
} from "@/storage/importExport";
import type { AppData } from "@/types/app-data";

interface SettingsPageProps {
  onDataImported: (data: AppData) => void;
  onResetProgress: () => void;
}

type OperationMessage = {
  kind: "success" | "error" | "neutral";
  text: string;
};

export function SettingsPage({ onDataImported, onResetProgress }: SettingsPageProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [message, setMessage] = useState<OperationMessage>();
  const [isImporting, setIsImporting] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [showResetConfirmation, setShowResetConfirmation] = useState(false);

  const handleExport = () => {
    try {
      const fileName = exportAppData();
      setMessage({ kind: "success", text: `Exported ${fileName}` });
    } catch {
      setMessage({ kind: "error", text: "Export failed. Your current data was not changed." });
    }
  };

  const handleImport = async (file: File | undefined) => {
    if (!file) return;
    setIsImporting(true);
    setMessage(undefined);

    try {
      const result = await importAppData(
        file,
        () => window.confirm("当前学习进度将被替换，是否继续？"),
      );

      if (result.status === "cancelled") {
        setMessage({ kind: "neutral", text: "Import cancelled. Current data was not changed." });
        return;
      }

      onDataImported(result.data);
    } catch (error) {
      const text = error instanceof AppDataImportError
        ? error.message
        : "Import failed. Your current data was not changed.";
      setMessage({ kind: "error", text });
    } finally {
      setIsImporting(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleConfirmReset = () => {
    setIsResetting(true);
    setMessage(undefined);

    try {
      onResetProgress();
      setShowResetConfirmation(false);
    } catch {
      setMessage({ kind: "error", text: "Reset failed. Your current data was not changed." });
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <AppShell activePage="settings">
      <PageIntro
        code="SETTINGS / LOCAL DATA"
        title="设置"
        description="备份或恢复这台设备上的学习数据。"
      />
      <section className="data-management" aria-labelledby="data-management-title">
        <header>
          <p>LOCAL BACKUP</p>
          <h2 id="data-management-title">DATA MANAGEMENT</h2>
        </header>
        <div className="data-action">
          <div>
            <h3>Export Data</h3>
            <p>Download the complete local AppData as a dated JSON backup.</p>
          </div>
          <button onClick={handleExport} type="button">EXPORT DATA</button>
        </div>
        <div className="data-action">
          <div>
            <h3>Import Data</h3>
            <p>Validate a previous backup, then replace the current local progress.</p>
          </div>
          <button disabled={isImporting} onClick={() => fileInputRef.current?.click()} type="button">
            {isImporting ? "IMPORTING..." : "IMPORT DATA"}
          </button>
          <input
            accept="application/json,.json"
            className="visually-hidden"
            onChange={(event) => void handleImport(event.currentTarget.files?.[0])}
            ref={fileInputRef}
            type="file"
          />
        </div>
        <div className="data-action danger-action">
          <div>
            <h3>Reset Progress</h3>
            <p>Restore Day, Task, Mastery, Study Time, and settings. Notes are kept.</p>
          </div>
          <button
            disabled={isResetting}
            onClick={() => {
              setMessage(undefined);
              setShowResetConfirmation(true);
            }}
            type="button"
          >RESET PROGRESS</button>
        </div>
        {showResetConfirmation ? (
          <section
            aria-describedby="reset-confirmation-description"
            aria-labelledby="reset-confirmation-title"
            aria-modal="true"
            className="reset-confirmation"
            role="alertdialog"
          >
            <h3 id="reset-confirmation-title">Reset all learning progress?</h3>
            <p id="reset-confirmation-description">Your tasks, mastery status and study time will be cleared. Notes will be kept.</p>
            <div>
              <button
                disabled={isResetting}
                onClick={() => {
                  setShowResetConfirmation(false);
                  setMessage({ kind: "neutral", text: "Reset cancelled. Current data was not changed." });
                }}
                type="button"
              >CANCEL</button>
              <button className="confirm-reset" disabled={isResetting} onClick={handleConfirmReset} type="button">
                {isResetting ? "RESETTING..." : "CONFIRM RESET"}
              </button>
            </div>
          </section>
        ) : null}
        <p className="data-warning">Import replaces Task, Mastery, Study Time, current Day, and Notes data after confirmation.</p>
        {message ? <p className={`operation-message ${message.kind}`} role={message.kind === "error" ? "alert" : "status"}>{message.text}</p> : null}
      </section>
    </AppShell>
  );
}
