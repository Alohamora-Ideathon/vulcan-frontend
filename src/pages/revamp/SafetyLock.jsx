import React, { useState } from "react";

export default function SafetyLock({ result, onProceed, onBack }) {
  const rules = result?.safety_rules || [];
  const [confirmed, setConfirmed] = useState([]);

  const toggle = i => setConfirmed(prev =>
    prev.includes(i) ? prev.filter(x => x !== i) : [...prev, i]
  );

  const allDone = rules.length > 0 && confirmed.length === rules.length;
  const pct     = rules.length > 0 ? (confirmed.length / rules.length) * 100 : 0;

  return (
    <div className="r-page">
      <div className="r-page-narrow">

        {/* Lock icon + title */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{
            width: 72, height: 72, background: allDone ? "rgba(16,185,129,0.15)" : "var(--accent-dim)",
            border: `2px solid ${allDone ? "var(--safe)" : "var(--accent)"}`,
            borderRadius: 20, display: "grid", placeItems: "center",
            fontSize: 32, margin: "0 auto 16px", transition: "all 0.3s"
          }}>
            {allDone ? "🔓" : "🔒"}
          </div>
          <p className="r-page-title">{allDone ? "Safety Lock Cleared" : "Safety Lock"}</p>
          <p style={{ color: "var(--text-muted)", fontSize: 14, marginTop: 4 }}>
            {allDone
              ? "All safety conditions confirmed. Repair workflow is unlocked."
              : "Confirm all mandatory safety conditions before the repair workflow unlocks."}
          </p>
        </div>

        {/* Progress */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: "var(--text-muted)", marginBottom: 8 }}>
            <span>{confirmed.length} of {rules.length} confirmed</span>
            <span style={{ fontFamily: "var(--font-mono)" }}>{Math.round(pct)}%</span>
          </div>
          <div className="r-progress-track" style={{ height: 6 }}>
            <div className={`r-progress-fill ${allDone ? "safe" : ""}`} style={{ width: `${pct}%` }} />
          </div>
        </div>

        {/* Safety checks */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {rules.map((rule, i) => {
            const text = typeof rule === "object" ? (rule.safety_condition || rule.action || JSON.stringify(rule)) : rule;
            const done = confirmed.includes(i);
            return (
              <div key={i} className={`r-safety-check ${done ? "confirmed" : ""}`} onClick={() => toggle(i)}>
                <div className="r-safety-toggle">{done ? "✓" : ""}</div>
                <span className="r-safety-text">{text}</span>
              </div>
            );
          })}
        </div>

        <div className="r-actions" style={{ marginTop: 28 }}>
          <button className="r-btn r-btn-ghost" onClick={onBack}>← Back</button>
          <button
            className="r-btn r-btn-primary r-btn-lg"
            style={{ flex: 1 }}
            disabled={!allDone}
            onClick={onProceed}
          >
            {allDone ? "Enter Repair Workflow →" : `${rules.length - confirmed.length} check${rules.length - confirmed.length !== 1 ? "s" : ""} remaining`}
          </button>
        </div>

      </div>
    </div>
  );
}
