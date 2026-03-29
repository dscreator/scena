import { useCallback, useState } from "react";
import "./App.css";

type Role = "user" | "assistant";

type Msg = { role: Role; content: string };

export default function SimpleChat() {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const send = useCallback(async () => {
    const text = input.trim();
    if (!text || loading) {
      return;
    }
    setInput("");
    setError(null);
    setMessages((m) => [...m, { role: "user", content: text }]);
    setLoading(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text }),
      });
      const data = (await res.json()) as { output_text?: string; error?: string };
      if (!res.ok) {
        throw new Error(data.error ?? `Request failed (${res.status})`);
      }
      const reply = data.output_text ?? "";
      setMessages((m) => [...m, { role: "assistant", content: reply }]);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Request failed";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [input, loading]);

  return (
    <>
      {error ? (
        <div className="app-error" role="alert">
          <strong>Error:</strong> {error}
          <button type="button" className="app-error-dismiss" onClick={() => setError(null)}>
            Dismiss
          </button>
        </div>
      ) : null}
      <main className="app-main simple-chat-main">
        <div className="simple-chat">
          <div className="simple-chat-messages">
            {messages.length === 0 ? (
              <p className="simple-chat-empty">Send a message to talk to the model.</p>
            ) : (
              messages.map((m, i) => (
                <div key={i} className={`simple-chat-bubble simple-chat-bubble--${m.role}`}>
                  {m.content}
                </div>
              ))
            )}
            {loading ? <div className="simple-chat-bubble simple-chat-bubble--assistant">…</div> : null}
          </div>
          <form
            className="simple-chat-form"
            onSubmit={(e) => {
              e.preventDefault();
              void send();
            }}
          >
            <input
              className="simple-chat-input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Message…"
              disabled={loading}
              autoComplete="off"
            />
            <button type="submit" className="simple-chat-send" disabled={loading || !input.trim()}>
              Send
            </button>
          </form>
        </div>
      </main>
    </>
  );
}
