import React, { useState } from "react";
import StepCard from "../components/StepCard";

export default function GuidedRepair({ diagnosisResult, next, back }) {
  const [completed, setCompleted] = useState([]);

  if (diagnosisResult?.status !== "SUCCESS") {
    return (
      <section className="page">
        <div className="card large">
          <h2>Escalation Required</h2>
          <p>{diagnosisResult?.message || "Workflow unavailable."}</p>
          <div className="actions">
            <button onClick={back}>← Back</button>
          </div>
        </div>
      </section>
    );
  }

  const repairSteps = diagnosisResult?.step_by_step_workflow || [];
  const tools       = diagnosisResult?.tools_and_parts?.tools || [];
  const parts       = diagnosisResult?.tools_and_parts?.parts_may_be_needed || [];
  const mttr        = diagnosisResult?.estimated_total_repair_minutes;

  const completeStep = (index) => {
    if (!completed.includes(index)) {
      setCompleted([...completed, index]);
    }
  };

  return (
    <section className="page">
      <div className="card large">
        <h2>5. Guided Repair Workflow</h2>

        {/* P2-B: MTTR banner — headline demo stat */}
        {mttr > 0 && (
          <div className="mttr-banner">
            <span className="mttr-number">{mttr}</span>
            <div>
              <p className="mttr-label">Estimated Repair Time</p>
              <p className="mttr-sub">minutes · {repairSteps.length} steps</p>
            </div>
          </div>
        )}

        {/* P2-C: tools and parts — reduces logistics friction */}
        {(tools.length > 0 || parts.length > 0) && (
          <div className="tools-panel">
            {tools.length > 0 && (
              <div>
                <h4>🔧 Tools Required</h4>
                <div className="tools-list">
                  {tools.map((t) => (
                    <span key={t} className="tool-tag">{t}</span>
                  ))}
                </div>
              </div>
            )}
            {parts.length > 0 && (
              <div>
                <h4>🔩 Parts May Be Needed</h4>
                <div className="tools-list">
                  {parts.map((p) => (
                    <span key={p} className="tool-tag parts-tag">{p}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        <p className="muted">
          Follow the repair steps in sequence. Complete each before the next unlocks.
        </p>

        <div className="repair-list">
          {repairSteps.map((step, index) => {
            const status = completed.includes(index)
              ? "completed"
              : index === completed.length
              ? "active"
              : "locked";

            return (
              <StepCard
                key={index}
                step={step}
                index={index}
                status={status}
                onComplete={() => {
                  if (index === completed.length) completeStep(index);
                }}
              />
            );
          })}
        </div>

        <div className="actions">
          <button onClick={back}>← Back</button>
          <button
            className="primary"
            onClick={next}
            disabled={repairSteps.length > 0 && completed.length !== repairSteps.length}
          >
            Finish Repair →
          </button>
        </div>
      </div>
    </section>
  );
}
