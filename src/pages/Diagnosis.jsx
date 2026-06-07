import React from "react";

export default function Diagnosis({ incident, diagnosisResult, next, back }) {
  if (diagnosisResult?.status !== "SUCCESS") {
    return (
      <section className="page">
        <div className="card large">
          <h2>Escalation Required</h2>
          <p>{diagnosisResult?.message || "Diagnosis unavailable."}</p>
          <div className="actions">
            <button onClick={back}>← Back</button>
          </div>
        </div>
      </section>
    );
  }

  const fingerprint = diagnosisResult?.failure_fingerprint;
  const visual      = diagnosisResult?.visual_analysis;
  const mttr        = diagnosisResult?.estimated_total_repair_minutes;
  const hasVisual   = visual?.visual_confidence &&
                      visual.visual_confidence !== "No visual provided";

  return (
    <section className="page">
      <div className="card large">
        <h2>2. Failure Fingerprint</h2>

        {/* P3-B: badge row — risk level + key stats at a glance */}
        <div className="badge-row">
          <div className="risk">{fingerprint?.risk_level || "Risk Pending"}</div>

          {diagnosisResult?.escalation_required && (
            <div className="risk risk-warning">⚠️ Supervisor Required</div>
          )}

          {mttr > 0 && (
            <div className="risk risk-info">⏱ Est. {mttr} min repair</div>
          )}

          {diagnosisResult?.operational_confidence && (
            <div className="risk risk-neutral">
              {diagnosisResult.operational_confidence} confidence
            </div>
          )}
        </div>

        {/* P1-B: use incident local state — no longer relies on diagnosisResult.alarm */}
        <div className="info-grid">
          <p><b>Asset:</b> {incident.asset_id || "N/A"}</p>
          <p><b>Location:</b> {incident.location || "N/A"}</p>
          <p><b>Alarm Code:</b> {incident.alarm_code || "N/A"}</p>
          <p><b>Failure Pattern:</b> {fingerprint?.failure_pattern || "N/A"}</p>
          <p><b>Failure Area:</b> {fingerprint?.failure_area || "N/A"}</p>
          <p><b>Observation:</b> {incident.observation || "N/A"}</p>
        </div>

        {/* P2-A: visual analysis — only shown when image/video was uploaded */}
        {hasVisual && (
          <>
            <h3>👁 Visual Analysis</h3>
            <div className="visual-analysis">
              <p className="visual-confidence">
                AI Vision Confidence: <b>{visual.visual_confidence}</b>
              </p>
              {visual.observed_indicators?.map((item) => (
                <div className="evidence" key={item}>👁 {item}</div>
              ))}
            </div>
          </>
        )}

        <h3>Signals Detected</h3>
        {fingerprint?.signals?.length > 0 ? (
          fingerprint.signals.map((item) => (
            <div className="evidence" key={item}>✓ {item}</div>
          ))
        ) : (
          <p className="muted">No signals available.</p>
        )}

        {/* P3-A: confidence drivers */}
        {diagnosisResult?.confidence_drivers?.length > 0 && (
          <>
            <h3>Confidence Drivers</h3>
            {diagnosisResult.confidence_drivers.map((item) => (
              <div className="evidence" key={item}>→ {item}</div>
            ))}
          </>
        )}

        <h3>Explainability</h3>
        {diagnosisResult?.explainability?.length > 0 ? (
          diagnosisResult.explainability.map((item) => (
            <div className="evidence" key={item}>✓ {item}</div>
          ))
        ) : (
          <p className="muted">No explainability available.</p>
        )}

        <div className="actions">
          <button onClick={back}>← Back</button>
          <button className="primary" onClick={next}>
            Create Failure Twin →
          </button>
        </div>
      </div>
    </section>
  );
}
