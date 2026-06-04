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
  const alarm = diagnosisResult?.alarm;

  return (
    <section className="page">
      <div className="card large">
        <h2>2. Failure Fingerprint</h2>

        <div className="risk">
          {fingerprint?.risk_level || "Risk Pending"}
        </div>

        <div className="info-grid">
          <p><b>Asset:</b> {incident.asset_id}</p>
          <p><b>Location:</b> {incident.location}</p>
          <p><b>Alarm:</b> {incident.alarm_code}</p>
          <p><b>Alarm Name:</b> {alarm?.alarm_name || "N/A"}</p>
          <p><b>Observation:</b> {incident.observation}</p>
          <p><b>Failure Pattern:</b> {fingerprint?.failure_pattern || "N/A"}</p>
          <p><b>Failure Area:</b> {fingerprint?.failure_area || "N/A"}</p>
          <p><b>Confidence:</b> {diagnosisResult?.operational_confidence || "N/A"}</p>
        </div>

        <h3>Signals Detected</h3>
        {fingerprint?.signals?.length > 0 ? (
          fingerprint.signals.map((item) => (
            <div className="evidence" key={item}>✓ {item}</div>
          ))
        ) : (
          <p className="muted">No signals available.</p>
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