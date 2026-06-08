import React, { useState } from "react";

const FIX_OPTIONS = [
  "Breaker tripped — reset and restored",
  "Transformer fault isolated and cleared",
  "Cable / wiring fault repaired",
  "Protection relay reconfigured",
  "Cooling system fault resolved",
  "Generator / turbine component serviced",
  "Sensor or instrumentation replaced",
  "Escalated to supervisor",
  "Other"
];

export default function Close({ incident, result, startTime, onRestart }) {
  const [actualFix, setActualFix] = useState(FIX_OPTIONS[0]);
  const [notes,     setNotes]     = useState("");
  const [submitted, setSubmitted] = useState(false);

  const estimatedMins = result?.estimated_total_repair_minutes || 0;
  const actualMins    = startTime ? Math.round((Date.now() - startTime) / 60000) : estimatedMins;
  const savedMins     = Math.max(0, estimatedMins - actualMins);
  const savedPct      = estimatedMins > 0 ? Math.round((savedMins / estimatedMins) * 100) : 0;

  if (submitted) {
    return (
      <div className="r-page">
        <div className="r-page-narrow" style={{ textAlign: "center" }}>

          <div style={{
            width: 80, height: 80, background: "rgba(16,185,129,0.15)",
            border: "2px solid var(--safe)", borderRadius: 24,
            display: "grid", placeItems: "center", fontSize: 38,
            margin: "0 auto 20px"
          }}>✅</div>

          <p className="r-page-title" style={{ color: "var(--safe)" }}>Incident Closed</p>
          <p style={{ color: "var(--text-muted)", marginTop: 4, marginBottom: 32 }}>
            This incident has been logged and will train Vulcan's next response.
          </p>

          <div className="r-impact-box" style={{ marginBottom: 28, textAlign: "center" }}>
            <div className="r-impact-stat">
              <span className="r-impact-num">{estimatedMins}</span>
              <span className="r-impact-lbl">Estimated min</span>
            </div>
            <div className="r-impact-stat">
              <span className="r-impact-num">{actualMins}</span>
              <span className="r-impact-lbl">Actual min</span>
            </div>
            <div className="r-impact-stat">
              <span className="r-impact-num">↓{savedPct}%</span>
              <span className="r-impact-lbl">vs. estimate</span>
            </div>
          </div>

          <div className="r-card" style={{ textAlign: "left", marginBottom: 20 }}>
            <p className="r-card-title">Incident Summary</p>
            <div style={{ display: "grid", gap: 8, fontSize: 14 }}>
              <p><span style={{ color: "var(--text-muted)" }}>Asset:</span> {incident.asset_id || "—"}</p>
              <p><span style={{ color: "var(--text-muted)" }}>Alarm:</span> {incident.alarm_code || "—"}</p>
              <p><span style={{ color: "var(--text-muted)" }}>Fix applied:</span> {actualFix}</p>
              {notes && <p><span style={{ color: "var(--text-muted)" }}>Notes:</span> {notes}</p>}
            </div>
          </div>

          <p style={{ fontSize: 12, color: "var(--text-dim)", marginBottom: 20 }}>
            🧠 This incident has been added to Vulcan's knowledge base.
          </p>

          <button className="r-btn r-btn-primary r-btn-full r-btn-lg" onClick={onRestart}>
            + Start New Incident
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="r-page">
      <div className="r-page-narrow">

        <p className="r-page-title">Close Incident</p>
        <p className="r-page-sub">Log the outcome to improve future AI responses.</p>

        {/* Impact preview */}
        <div className="r-impact-box" style={{ marginBottom: 24 }}>
          <div className="r-impact-stat">
            <span className="r-impact-num">{estimatedMins}</span>
            <span className="r-impact-lbl">Estimated min</span>
          </div>
          <div className="r-impact-stat">
            <span className="r-impact-num">{actualMins}</span>
            <span className="r-impact-lbl">Actual min</span>
          </div>
          <div className="r-impact-stat">
            <span className="r-impact-num">↓{savedPct}%</span>
            <span className="r-impact-lbl">vs. estimate</span>
          </div>
        </div>

        <div className="r-card">
          <label className="r-label">What was the actual fix?</label>
          <select className="r-select" value={actualFix} onChange={e => setActualFix(e.target.value)}>
            {FIX_OPTIONS.map(o => <option key={o}>{o}</option>)}
          </select>

          <label className="r-label" style={{ marginTop: 16 }}>Additional notes for Vulcan</label>
          <textarea className="r-textarea"
            placeholder="Anything the AI should know next time this alarm fires..."
            value={notes}
            onChange={e => setNotes(e.target.value)}
          />
        </div>

        <p style={{ fontSize: 12, color: "var(--text-dim)", margin: "14px 0", textAlign: "center" }}>
          🧠 Your feedback trains Vulcan's knowledge base for future incidents.
        </p>

        <button className="r-btn r-btn-primary r-btn-full r-btn-lg" onClick={() => setSubmitted(true)}>
          Close Incident & Submit Feedback
        </button>


      </div>
    </div>
  );
}
