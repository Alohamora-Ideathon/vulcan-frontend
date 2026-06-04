import React from "react";

export default function FailureTwin({ incident = {}, diagnosisResult, next, back }) {
  if (!diagnosisResult) {
    return (
      <section className="page">
        <div className="card large escalation-card">
          <h2>Diagnosis Not Available</h2>
          <p>Please complete Incident Intake first.</p>

          <div className="actions">
            <button onClick={back}>← Back</button>
          </div>
        </div>
      </section>
    );
  }

  if (diagnosisResult?.status !== "SUCCESS") {
    return (
      <section className="page">
        <div className="card large escalation-card">
          <h2>Escalation Required</h2>
          <p>{diagnosisResult?.message || "Failure twin unavailable."}</p>

          <div className="actions">
            <button onClick={back}>← Back</button>
          </div>
        </div>
      </section>
    );
  }

  const twin = diagnosisResult?.generative_failure_twin || {};

  const assetId = incident?.asset_id || diagnosisResult?.asset_id || "N/A";
  const location = incident?.location || diagnosisResult?.location || "N/A";
  const alarmCode =
    incident?.alarm_code || diagnosisResult?.alarm?.alarm_code || "N/A";
  const observation = incident?.observation || "N/A";

  return (
    <section className="page">
      <div className="card large twin-card">
        <h2>3. Generative Failure Twin</h2>

        <p className="muted">
          AI-generated current operational state of the failed asset.
        </p>

        <div className="twin-box">
          <p>
            <b>Asset:</b> {assetId}
          </p>
          <p>
            <b>Location:</b> {location}
          </p>
          <p>
            <b>Alarm:</b> {alarmCode}
          </p>
          <p>
            <b>Observation:</b> {observation}
          </p>
          <p>
            <b>Asset State:</b> {twin.asset_state || "N/A"}
          </p>
          <p>
            <b>Current Condition:</b>{" "}
            {twin.current_operational_condition || "N/A"}
          </p>
          <p>
            <b>Likely Internal Behavior:</b>{" "}
            {twin.likely_internal_behavior || "N/A"}
          </p>
          <p>
            <b>Operational Impact:</b> {twin.operational_impact || "N/A"}
          </p>
        </div>

        <div className="actions">
          <button onClick={back}>← Back</button>

          <button className="primary" onClick={next}>
            Go to Safety Gate →
          </button>
        </div>
      </div>
    </section>
  );
}