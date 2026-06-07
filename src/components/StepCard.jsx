import React from "react";
import VoiceButton from "./VoiceButton";

export default function StepCard({ step, index, status, onComplete }) {
  // Handle both object steps (new schema) and plain strings (backward compat)
  const action           = typeof step === "object" ? step.action : step;
  const safetyCondition  = step?.safety_condition;
  const estimatedMins    = step?.estimated_minutes;
  const supervisorNeeded = step?.supervisor_required;

  return (
    <div className={`step-card ${status}`}>
      <div className="step-number">{status === "completed" ? "✓" : index + 1}</div>

      <div className="step-content">
        <div className="step-title-row">
          <h4>{action}</h4>
          {supervisorNeeded && (
            <span className="supervisor-badge">👤 Supervisor Required</span>
          )}
        </div>
        {safetyCondition && (
          <p className="step-safety">⚠️ {safetyCondition}</p>
        )}
        {estimatedMins && (
          <p className="step-time">⏱ ~{estimatedMins} min</p>
        )}
      </div>

      <VoiceButton text={`Step ${index + 1}. ${action}${safetyCondition ? `. Safety note: ${safetyCondition}` : ""}`} />

      {status !== "completed" && (
        <button onClick={onComplete}>Mark Complete</button>
      )}
    </div>
  );
}
