import { lazy, Suspense } from "react";
import SimpleChat from "./SimpleChat";
import "./App.css";

const ChatKitPane = lazy(() => import("./ChatKitPane"));

const useChatKit = import.meta.env.VITE_USE_CHATKIT === "true";

export default function App() {
  return (
    <div className="app">
      <header className="app-header">
        <h1 className="app-title">Scena</h1>
        <p className="app-sub">Chat powered by OpenAI</p>
      </header>
      {useChatKit ? (
        <Suspense
          fallback={
            <main className="app-main">
              <p className="app-sub">Loading ChatKit…</p>
            </main>
          }
        >
          <ChatKitPane />
        </Suspense>
      ) : (
        <SimpleChat />
      )}
    </div>
  );
}
