import React, { useState } from "react";
import StepCard from "../components/StepCard";

export default function GuidedRepair({
  diagnosisResult,
  next,
  back
}) {
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

  const repairSteps =
    diagnosisResult?.step_by_step_workflow || [];

  const completeStep = (index) => {
    if (!completed.includes(index)) {
      setCompleted([...completed, index]);
    }
  };

  return (
    <section className="page">
      <div className="card large">
        <h2>5. Guided Repair Workflow</h2>

        <p className="muted">
          Follow the repair steps in sequence.
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
                  if (index === completed.length) {
                    completeStep(index);
                  }
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
            disabled={
              repairSteps.length > 0 &&
              completed.length !== repairSteps.length
            }
          >
            Finish Repair →
          </button>
        </div>
      </div>
    </section>
  );
}