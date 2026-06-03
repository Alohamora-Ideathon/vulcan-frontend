import React from "react";
import { diagnosisData } from "../data/mockData";

export default function Diagnosis({ incident, next, back }) {
  return (
    <section className="page">
      <div className="card large">
        <h2>2. Failure Fingerprint</h2>
        <div className="risk">High Risk</div>

        <div className="info-grid">
          <p><b>Alarm:</b> {incident.alarmCode}</p>
          <p><b>Observation:</b> {incident.observation}</p>
          <p><b>Failure Area:</b> {diagnosisData.failureArea}</p>
          <p><b>Likely Cause:</b> {diagnosisData.likelyCause}</p>
          <p><b>Confidence:</b> {diagnosisData.confidence}</p>
        </div>

        <h3>Evidence Retrieved</h3>
        {diagnosisData.evidence.map((item) => (
          <div className="evidence" key={item}>✓ {item}</div>
        ))}

        <div className="actions">
          <button onClick={back}>← Back</button>
          <button className="primary" onClick={next}>Create Failure Twin →</button>
        </div>
      </div>
    </section>
  );
}