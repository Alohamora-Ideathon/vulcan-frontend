import React from "react";
export default function Resolution({ back }) {
  return (
    <section className="page">
      <div className="card large resolution">
        <h2>6. Resolution & Feedback</h2>

        <div className="result-box">
          <h3>Issue Resolved</h3>
          <p>Pump-12 cavitation risk reduced. Seal leakage inspection completed.</p>
        </div>

        <label>What was the actual fix?</label>
        <select>
          <option>Suction blockage removed</option>
          <option>Seal replaced</option>
          <option>Valve position corrected</option>
          <option>Escalated to supervisor</option>
        </select>

        <label>Additional Notes</label>
        <textarea placeholder="Add technician notes..." />

        <button className="primary">Submit Feedback</button>
        <button onClick={back}>← Back</button>
      </div>
    </section>
  );
}













































