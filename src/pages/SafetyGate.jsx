import React, { useState } from "react";

export default function SafetyGate({ diagnosisResult, next, back }) {
  const [confirmed, setConfirmed] = useState([]);

  if (diagnosisResult?.status !== "SUCCESS") {
    return (
      <section className="page">
        <div className="card large">
          <h2>Escalation Required</h2>
          <p>{diagnosisResult?.message || "Safety evaluation unavailable."}</p>

          <div className="actions">
            <button onClick={back}>← Back</button>
          </div>
        </div>
      </section>
    );
  }

  const checks = diagnosisResult?.safety_rules || [];

  const getCheckText = (check) => {
    if (typeof check === "string") return check;

    if (typeof check === "object" && check !== null) {
      return (
        check.safety_condition ||
        check.action ||
        check.rule ||
        check.description ||
        JSON.stringify(check)
      );
    }

    return String(check);
  };

  const toggle = (index) => {
    setConfirmed((prev) =>
      prev.includes(index)
        ? prev.filter((x) => x !== index)
        : [...prev, index]
    );
  };

  const allDone = checks.length > 0 && confirmed.length === checks.length;

  return (
    <section className="page">
      <div className="card large safety-card">
        <h2>4. Safety Gate</h2>
        <p>
          High-risk inspection detected. Complete all checks before repair steps
          unlock.
        </p>

        <div className="safety-list">
          {checks.map((check, index) => (
            <label key={index}>
              <input
                type="checkbox"
                checked={confirmed.includes(index)}
                onChange={() => toggle(index)}
              />
              {getCheckText(check)}
            </label>
          ))}
        </div>

        <div className="actions">
          <button onClick={back}>← Back</button>
          <button className="primary" disabled={!allDone} onClick={next}>
            Confirm Safe to Proceed →
          </button>
        </div>
      </div>
    </section>
  );
}