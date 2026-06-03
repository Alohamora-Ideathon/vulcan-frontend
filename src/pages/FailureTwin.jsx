import React from "react";
import { twinData } from "../data/mockData";

export default function FailureTwin({ next, back }) {
  return (
    <section className="page">
      <div className="card large twin-card">
        <h2>3. Generative Failure Twin</h2>
        <p className="muted">AI-generated current operational state of the failed pump.</p>

        <div className="twin-box">
          <p><b>Asset:</b> {twinData.asset}</p>
          <p><b>Location:</b> {twinData.location}</p>
          <p><b>Current State:</b> {twinData.currentState}</p>
          <p><b>Seal Risk:</b> {twinData.sealRisk}</p>
          <p><b>Operational Impact:</b> {twinData.operationalImpact}</p>
        </div>

        <div className="actions">
          <button onClick={back}>← Back</button>
          <button className="primary" onClick={next}>Go to Safety Gate →</button>
        </div>
      </div>
    </section>
  );
}