import React from "react";
import { useState } from "react";
import { repairSteps } from "../data/mockData";
import StepCard from "../components/StepCard";

export default function GuidedRepair({ next, back }) {
  const [completed, setCompleted] = useState([]);

  const completeStep = (index) => {
    if (!completed.includes(index)) {
      setCompleted([...completed, index]);
    }
  };

  return (
    <section className="page">
      <div className="card large">
        <h2>5. Guided Repair Workflow</h2>
        <p className="muted">Follow the repair steps in order. Voice guidance is available.</p>

        <div className="repair-list">
          {repairSteps.map((step, index) => {
            const status = completed.includes(index)
              ? "completed"
              : index === completed.length
              ? "active"
              : "locked";

            return (
              <StepCard
                key={step}
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
          <button className="primary" onClick={next}>
            Finish Repair →
          </button>
        </div>
      </div>
    </section>
  );
}