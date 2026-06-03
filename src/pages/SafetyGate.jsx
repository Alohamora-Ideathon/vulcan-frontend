import React from "react";
import { useState } from "react";

const checks = [
  "Pump stopped",
  "Suction and discharge valves closed",
  "Pressure released",
  "PPE and face protection worn"
];

export default function SafetyGate({ next, back }) {
  const [confirmed, setConfirmed] = useState([]);

  const toggle = (item) => {
    setConfirmed((prev) =>
      prev.includes(item) ? prev.filter((x) => x !== item) : [...prev, item]
    );
  };

  const allDone = confirmed.length === checks.length;

  return (
    <section className="page">
      <div className="card large safety-card">
        <h2>4. Safety Gate</h2>
        <p>High-risk inspection detected. Complete all checks before repair steps unlock.</p>

        <div className="safety-list">
          {checks.map((check) => (
            <label key={check}>
              <input
                type="checkbox"
                checked={confirmed.includes(check)}
                onChange={() => toggle(check)}
              />
              {check}
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