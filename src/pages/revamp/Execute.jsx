import React, { useState } from "react";

export default function Execute({ result, onFinish, onBack }) {
  const steps     = result?.step_by_step_workflow || [];
  const [current,   setCurrent]   = useState(0);
  const [completed, setCompleted] = useState([]);
  const [showAll,   setShowAll]   = useState(false);

  const step      = steps[current] || {};
  const action    = typeof step === "object" ? step.action    : step;
  const safety    = step?.safety_condition;
  const mins      = step?.estimated_minutes;
  const superReq  = step?.supervisor_required;
  const isDone    = completed.includes(current);
  const allDone   = completed.length === steps.length;

  const markComplete = () => {
    if (!completed.includes(current)) {
      setCompleted(prev => [...prev, current]);
    }
    if (current < steps.length - 1) {
      setCurrent(current + 1);
    }
  };

  const speak = () => {
    const txt = [
      `Step ${current + 1} of ${steps.length}.`,
      action,
      safety ? `Safety note: ${safety}` : "",
      superReq ? "Supervisor sign-off required for this step." : ""
    ].filter(Boolean).join(" ");
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(Object.assign(new SpeechSynthesisUtterance(txt), { rate: 0.9 }));
  };

  return (
    <div className="r-page">
      <div className="r-page-narrow">

        {/* Nav bar */}
        <div className="r-step-nav-bar">
          <button className="r-btn r-btn-ghost" style={{ padding: "8px 14px", minHeight: 0 }}
            onClick={() => current > 0 && setCurrent(current - 1)} disabled={current === 0}>
            ‹ Prev
          </button>

          <div style={{ textAlign: "center" }}>
            <div className="r-step-counter">STEP {current + 1} / {steps.length}</div>
            <div className="r-step-dots" style={{ justifyContent: "center", marginTop: 6 }}>
              {steps.map((_, i) => (
                <div key={i} className={`r-dot ${completed.includes(i) ? "done" : i === current ? "active" : ""}`}
                  onClick={() => setCurrent(i)} style={{ cursor: "pointer" }} />
              ))}
            </div>
          </div>

          <button className="r-btn r-btn-ghost" style={{ padding: "8px 14px", minHeight: 0 }}
            onClick={() => current < steps.length - 1 && setCurrent(current + 1)}
            disabled={current === steps.length - 1}>
            Next ›
          </button>
        </div>

        {/* Progress bar */}
        <div className="r-progress-track" style={{ marginBottom: 24 }}>
          <div className="r-progress-fill safe"
            style={{ width: `${(completed.length / steps.length) * 100}%` }} />
        </div>

        {/* Step card */}
        <div className="r-step-execute">
          <span className="r-step-num-big">{current + 1}</span>

          {/* Badges */}
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {superReq && <span className="r-badge r-badge-super">👤 Supervisor Required</span>}
            {isDone   && <span className="r-badge r-badge-safe">✓ Complete</span>}
          </div>

          {/* Action text */}
          <p className="r-step-action">{action}</p>

          {/* Safety condition */}
          {safety && (
            <div className="r-step-safety-box">
              <span>⚠️</span>
              <span>{safety}</span>
            </div>
          )}

          {/* Meta */}
          <div className="r-step-meta">
            {mins && <span className="r-step-time">⏱ ~{mins} min</span>}
            <button className="r-voice-btn" onClick={speak}>🔊 Read Aloud</button>
          </div>
        </div>

        {/* Mark complete */}
        {!allDone && (
          <button
            className="r-btn r-btn-primary r-btn-full r-btn-lg"
            style={{ marginTop: 16 }}
            onClick={markComplete}
            disabled={isDone}
          >
            {isDone ? "✓ Step Complete" : current === steps.length - 1 ? "✓ Complete Final Step" : "✓ Mark Complete — Next Step"}
          </button>
        )}

        {allDone && (
          <button className="r-btn r-btn-full r-btn-lg"
            style={{ marginTop: 16, background: "var(--safe)", color: "#fff", border: "none" }}
            onClick={onFinish}>
            ✓ All Steps Done — Close Incident →
          </button>
        )}

        {/* Show all steps toggle */}
        <button className="r-btn r-btn-ghost r-btn-full"
          style={{ marginTop: 10, fontSize: 13 }}
          onClick={() => setShowAll(v => !v)}>
          {showAll ? "▲ Hide All Steps" : "▼ View All Steps"}
        </button>

        {showAll && (
          <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 8 }}>
            {steps.map((s, i) => {
              const a    = typeof s === "object" ? s.action : s;
              const done = completed.includes(i);
              const act  = i === current;
              return (
                <div key={i}
                  onClick={() => setCurrent(i)}
                  style={{
                    display: "flex", gap: 12, alignItems: "flex-start",
                    padding: "12px 14px", borderRadius: 10, cursor: "pointer",
                    background: act ? "var(--accent-dim)" : done ? "rgba(16,185,129,0.06)" : "var(--surface)",
                    border: `1px solid ${act ? "var(--accent-glow)" : done ? "rgba(16,185,129,0.2)" : "var(--border)"}`,
                    opacity: (!done && !act && i > completed.length) ? 0.5 : 1
                  }}>
                  <span style={{
                    width: 24, height: 24, borderRadius: "50%", flexShrink: 0,
                    background: done ? "var(--safe)" : act ? "var(--accent)" : "var(--text-dim)",
                    display: "grid", placeItems: "center", fontSize: 11, fontWeight: 900, color: "#fff"
                  }}>
                    {done ? "✓" : i + 1}
                  </span>
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 600 }}>{a}</p>
                    {s?.estimated_minutes && (
                      <p style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>⏱ ~{s.estimated_minutes} min</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="r-actions">
          <button className="r-btn r-btn-ghost" onClick={onBack}>← Back</button>
        </div>

      </div>
    </div>
  );
}
