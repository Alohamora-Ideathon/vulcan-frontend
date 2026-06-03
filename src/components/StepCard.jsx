import React from "react";
import VoiceButton from "./VoiceButton";

export default function StepCard({ step, index, status, onComplete }) {
  return (
    <div className={`step-card ${status}`}>
      <div className="step-number">{status === "completed" ? "✓" : index + 1}</div>
      <div className="step-content">
        <h4>{step}</h4>
        <p>Status: {status}</p>
      </div>
      <VoiceButton text={`Step ${index + 1}. ${step}`} />
      {status !== "completed" && (
        <button onClick={onComplete}>Mark Complete</button>
      )}
    </div>
  );
}