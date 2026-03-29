import { ChatKit, useChatKit } from "@openai/chatkit-react";
import { useCallback, useMemo, useState } from "react";
import { chatKitUiOptions } from "./chatKitOptions";
import "./App.css";

const USER_STORAGE_KEY = "scena_chatkit_user_id";

function messageFromSessionErrorBody(body: unknown): string {
  if (!body || typeof body !== "object") {
    return "Failed to start ChatKit session.";
  }
  const o = body as Record<string, unknown>;
  if (typeof o.error === "string") {
    return o.error;
  }
  if (o.error && typeof o.error === "object") {
    const msg = (o.error as { message?: unknown }).message;
    if (typeof msg === "string") {
      return msg;
    }
  }
  return "Failed to start ChatKit session.";
}

function getOrCreateUserId(): string {
  try {
    let id = localStorage.getItem(USER_STORAGE_KEY);
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem(USER_STORAGE_KEY, id);
    }
    return id;
  } catch {
    return "anonymous";
  }
}

function downloadMarkdown(filename: string, markdown: string) {
  const blob = new Blob([markdown], { type: "text/markdown;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.rel = "noopener";
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export default function ChatKitPane() {
  const userId = useMemo(() => getOrCreateUserId(), []);
  const [kitError, setKitError] = useState<string | null>(null);
  const [threadId, setThreadId] = useState<string | null>(null);
  const [briefingReady, setBriefingReady] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);

  const { control } = useChatKit({
    ...chatKitUiOptions,
    api: {
      async getClientSecret(existing) {
        // Reusing the same secret keeps the hosted session + thread; minting a new
        // session here on refresh breaks sends (see ChatKit auth guides).
        if (existing) {
          return existing;
        }
        setKitError(null);
        const res = await fetch("/api/chatkit/session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ user: userId }),
        });
        const raw = await res.json().catch(() => ({}));
        if (!res.ok) {
          const msg = messageFromSessionErrorBody(raw);
          setKitError(msg);
          throw new Error(msg);
        }
        const data = raw as { client_secret?: string };
        if (!data.client_secret) {
          const msg = "No client_secret in session response.";
          setKitError(msg);
          throw new Error(msg);
        }
        return data.client_secret;
      },
    },
    onError: (detail) => {
      const msg = detail.error?.message ?? String(detail.error);
      setKitError(msg);
    },
    onThreadChange: (detail) => {
      setThreadId(detail.threadId);
      setBriefingReady(false);
      setExportError(null);
    },
    /** Prior thread from history can be exported once items are loaded. */
    onThreadLoadEnd: () => {
      setBriefingReady(true);
    },
    /** New replies: enable download after the assistant finishes streaming. */
    onResponseEnd: () => {
      setBriefingReady(true);
    },
  });

  const handleDownloadBriefing = useCallback(async () => {
    if (!threadId || exporting) {
      return;
    }
    setExportError(null);
    setExporting(true);
    try {
      const res = await fetch("/api/chatkit/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ threadId }),
      });
      const data = (await res.json()) as { markdown?: string; filename?: string; error?: string };
      if (!res.ok) {
        throw new Error(data.error ?? `Export failed (${res.status})`);
      }
      if (typeof data.markdown !== "string") {
        throw new Error("No briefing content returned.");
      }
      const name =
        typeof data.filename === "string" && data.filename.length > 0
          ? data.filename
          : `customer-briefing-${threadId.slice(-8)}.md`;
      downloadMarkdown(name, data.markdown);
    } catch (e) {
      setExportError(e instanceof Error ? e.message : "Download failed.");
    } finally {
      setExporting(false);
    }
  }, [threadId, exporting]);

  return (
    <>
      {kitError ? (
        <div className="app-error" role="alert">
          <strong>ChatKit error:</strong> {kitError}
          <button type="button" className="app-error-dismiss" onClick={() => setKitError(null)}>
            Dismiss
          </button>
        </div>
      ) : null}
      {exportError ? (
        <div className="app-error" role="alert">
          <strong>Export error:</strong> {exportError}
          <button type="button" className="app-error-dismiss" onClick={() => setExportError(null)}>
            Dismiss
          </button>
        </div>
      ) : null}
      <div className="chatkit-stage">
        <div className="chatkit-row">
          <div className="chatkit-panel-wrap">
            <ChatKit control={control} className="chatkit-panel" />
          </div>
          <aside className="chatkit-aside" aria-label="Briefing export">
            <button
              type="button"
              className="chatkit-download-btn"
              disabled={!threadId || !briefingReady || exporting}
              onClick={() => void handleDownloadBriefing()}
            >
              {exporting ? "Preparing…" : "Download briefing"}
            </button>
            <p className="chatkit-aside-hint">
              {!threadId
                ? "Start a conversation to enable export."
                : !briefingReady
                  ? "Available after the assistant finishes a reply."
                  : "Saves the thread as a Markdown file (opens in Word or any editor)."}
            </p>
          </aside>
        </div>
      </div>
    </>
  );
}
