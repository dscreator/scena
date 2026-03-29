import { lazy, Suspense, useEffect, useState } from "react";
import SimpleChat from "./SimpleChat";
import "./App.css";

const AgentHub = lazy(() => import("./AgentHub"));

type UiMode = "loading" | "chatkit" | "simple";

export default function App() {
  const [mode, setMode] = useState<UiMode>("loading");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/config");
        const data = (await res.json()) as { chatKit?: unknown };
        const useKit = data.chatKit === true;
        if (!cancelled) {
          setMode(useKit ? "chatkit" : "simple");
        }
      } catch {
        if (!cancelled) {
          setMode("simple");
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="app">
      <header className="app-header">
        <h1 className="app-title">Scena</h1>
        <p className="app-sub">Chat powered by OpenAI</p>
      </header>
      {mode === "loading" ? (
        <main className="app-main">
          <p className="app-sub">Loading…</p>
        </main>
      ) : mode === "chatkit" ? (
        <Suspense
          fallback={
            <main className="app-main">
              <p className="app-sub">Loading agents…</p>
            </main>
          }
        >
          <AgentHub />
        </Suspense>
      ) : (
        <SimpleChat />
      )}
    </div>
  );
}
