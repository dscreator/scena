import { lazy, Suspense, useState } from "react";
import "./App.css";

const ChatKitPane = lazy(() => import("./ChatKitPane"));

function IconCustomerBriefing() {
  return (
    <svg className="agent-icon-svg" viewBox="0 0 48 48" fill="none" aria-hidden>
      <rect x="6" y="10" width="36" height="28" rx="4" stroke="currentColor" strokeWidth="2" />
      <path
        d="M16 18h16M16 24h12M16 30h8"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <circle cx="34" cy="16" r="6" fill="#34d399" stroke="currentColor" strokeWidth="1.5" />
      <path d="M31 16h6M34 13v6" stroke="#0f1115" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}

function IconCompetitiveIntel() {
  return (
    <svg className="agent-icon-svg" viewBox="0 0 48 48" fill="none" aria-hidden>
      <path
        d="M8 36V22l6-4 8 4 8-4 10 6v12"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path d="M8 28l6-4 8 4 8-4 10 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <circle cx="24" cy="12" r="4" stroke="currentColor" strokeWidth="2" />
      <path d="M24 16v6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function IconTechnicalCoach() {
  return (
    <svg className="agent-icon-svg" viewBox="0 0 48 48" fill="none" aria-hidden>
      <path
        d="M14 32l-4 6M34 32l4 6M10 18h28v14H10V18z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path d="M16 24h4M22 24h4M28 24h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M24 10v6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export default function AgentHub() {
  const [customerChatOpen, setCustomerChatOpen] = useState(false);
  const [stubNotice, setStubNotice] = useState<string | null>(null);

  if (customerChatOpen) {
    return (
      <div className="agent-hub agent-hub--chat">
        <div className="agent-hub-toolbar">
          <button
            type="button"
            className="agent-hub-back"
            onClick={() => setCustomerChatOpen(false)}
          >
            ← Back to agents
          </button>
          <span className="agent-hub-toolbar-title">Customer Briefing Agent</span>
        </div>
        <Suspense
          fallback={
            <div className="agent-hub-loading">
              <p className="app-sub">Loading chat…</p>
            </div>
          }
        >
          <ChatKitPane />
        </Suspense>
      </div>
    );
  }

  return (
    <div className="agent-hub">
      <p className="agent-hub-intro">Choose an agent to get started.</p>
      {stubNotice ? (
        <p className="agent-hub-notice" role="status">
          {stubNotice}
        </p>
      ) : null}
      <div className="agent-grid">
        <button
          type="button"
          className="agent-card agent-card--primary"
          onClick={() => {
            setStubNotice(null);
            setCustomerChatOpen(true);
          }}
        >
          <span className="agent-card-icon" aria-hidden>
            <IconCustomerBriefing />
          </span>
          <span className="agent-card-title">Customer Briefing Agent</span>
          <span className="agent-card-desc">Strategic briefings on customers, signals, and what to do next.</span>
        </button>

        <button
          type="button"
          className="agent-card agent-card--soon"
          onClick={() => {
            setStubNotice("Competitive Intelligence Agent isn’t connected yet — coming soon.");
          }}
        >
          <span className="agent-card-icon" aria-hidden>
            <IconCompetitiveIntel />
          </span>
          <span className="agent-card-title">Competitive Intelligence Agent</span>
          <span className="agent-card-desc">Market and competitor context (placeholder).</span>
        </button>

        <button
          type="button"
          className="agent-card agent-card--soon"
          onClick={() => {
            setStubNotice("Technical Fluency Coach isn’t connected yet — coming soon.");
          }}
        >
          <span className="agent-card-icon" aria-hidden>
            <IconTechnicalCoach />
          </span>
          <span className="agent-card-title">Technical Fluency Coach</span>
          <span className="agent-card-desc">Build depth on technical topics (placeholder).</span>
        </button>
      </div>
    </div>
  );
}
