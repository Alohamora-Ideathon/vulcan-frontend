import React, { useState } from "react";
import { submitFeedback } from "../services/api";

export default function Resolution({ incident, diagnosisResult, back }) {
  const [actualFix, setActualFix] = useState("Suction blockage removed");
  const [notes, setNotes] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [sessionId, setSessionId] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    try {
      setError("");
      setSubmitting(true);

      if (!diagnosisResult?.session_id) {
        setError("Session ID missing. Please restart the incident flow.");
        return;
      }

      const payload = {
        session_id: diagnosisResult.session_id,
        status: diagnosisResult?.status === "SUCCESS" ? "resolved" : "escalated",
        actual_fix: actualFix,
        notes: notes,
        diagnosis_output: diagnosisResult || {}
      };

      console.log("Feedback payload:", payload);

      const result = await submitFeedback(payload);

      console.log("Feedback API result:", result);

      if (result?.session_id) {
        setSessionId(result.session_id);
        setSubmitted(true);
      } else {
        setError("Feedback submitted but session confirmation was not received.");
      }
    } catch (err) {
      console.error("Feedback submission failed:", err);
      setError("Feedback submission failed. Check backend terminal.");
    } finally {
      setSubmitting(false);
    }
  };

  const startNewIncident = () => {
    window.location.reload();
  };

  if (submitted) {
    return (
      <section className="page">
        <div className="card large resolution workflow-complete">
          <h2>✅ Workflow Closed</h2>

          <div className="result-box">
            <h3>Feedback Stored Successfully</h3>
            <p>The incident workflow is now closed.</p>
            <p><b>Session ID:</b> {sessionId}</p>
            <p><b>Asset:</b> {incident?.asset_id}</p>
            <p><b>Alarm:</b> {incident?.alarm_code}</p>
          </div>

          <button type="button" className="primary" onClick={startNewIncident}>
            Start New Incident
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="page">
      <div className="card large resolution">
        <h2>6. Resolution & Feedback</h2>

        {error && (
          <div className="error-popup">
            <p>{error}</p>
            <button type="button" onClick={() => setError("")}>
              Close
            </button>
          </div>
        )}

        <div className="result-box">
          <h3>Issue Resolution</h3>
          <p>
            {diagnosisResult?.status === "SUCCESS"
              ? `${incident?.asset_id} workflow completed. Feedback can now be submitted.`
              : diagnosisResult?.message || "Escalation required."}
          </p>
        </div>

        <label>What was the actual fix?</label>
        <select
          value={actualFix}
          onChange={(e) => setActualFix(e.target.value)}
        >
          <option>Suction blockage removed</option>
          <option>Seal replaced</option>
          <option>Valve position corrected</option>
          <option>Escalated to supervisor</option>
        </select>

        <label>Additional Notes</label>
        <textarea
          placeholder="Add technician notes..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />

        <button
          type="button"
          className="primary"
          onClick={handleSubmit}
          disabled={submitting}
        >
          {submitting ? "Submitting..." : "Submit Feedback"}
        </button>

        <button type="button" onClick={back}>
          ← Back
        </button>
      </div>
    </section>
  );
}