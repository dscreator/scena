import { ChatKit, useChatKit } from "@openai/chatkit-react";
import { useMemo, useState } from "react";
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

export default function ChatKitPane() {
  const userId = useMemo(() => getOrCreateUserId(), []);
  const [kitError, setKitError] = useState<string | null>(null);

  const { control } = useChatKit({
    ...chatKitUiOptions,
    api: {
      async getClientSecret(_existing) {
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
  });

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
      <main className="app-main">
        <ChatKit control={control} className="chatkit-panel" />
      </main>
    </>
  );
}
