import React from "react";

const RISK_CLASS = { High: "r-badge-high", Medium: "r-badge-amber", Low: "r-badge-safe", Critical: "r-badge-high" };

export default function Analyze({ incident, result, onProceed, onBack }) {
  const fp     = result?.failure_fingerprint     || {};
  const twin   = result?.generative_failure_twin || {};
  const visual = result?.visual_analysis         || {};
  const mttr   = result?.estimated_total_repair_minutes;
  const pct    = parseInt(result?.operational_confidence) || 0;
  const hasVis = visual.visual_confidence && visual.visual_confidence !== "No visual provided";
  const steps  = result?.step_by_step_workflow || [];
  const supervised = steps.filter(s => s.supervisor_required).length;

  return (
    <div className="r-page">
      <div className="r-page-center">

        {/* Page header */}
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 24, flexWrap: "wrap" }}>
          <div>
            <p className="r-page-title">Failure Analysis</p>
            <p style={{ color: "var(--text-muted)", fontSize: 13 }}>
              {incident.asset_id || "Unknown asset"} · {incident.location || "Unknown location"}
            </p>
          </div>
          <div style={{ marginLeft: "auto", display: "flex", gap: 8, flexWrap: "wrap" }}>
            <span className={`r-badge ${RISK_CLASS[fp.risk_level] || "r-badge-neutral"}`}>
              ● {fp.risk_level || "Unknown"} Risk
            </span>
            {result?.escalation_required && (
              <span className="r-badge r-badge-super">⚠ Supervisor Required</span>
            )}
          </div>
        </div>

        <div className="r-split">

          {/* Left column */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

            {/* Failure signature */}
            <div className="r-card r-card-accent">
              <p className="r-card-title">Failure Signature</p>
              <p style={{ fontSize: 20, fontWeight: 800, marginBottom: 6 }}>
                {fp.failure_pattern || "Analysing…"}
              </p>
              <p style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 16 }}>
                {fp.failure_area}
              </p>

              <p className="r-card-title" style={{ marginBottom: 8 }}>AI Confidence</p>
              <div className="r-confidence">
                <div className="r-confidence-row">
                  <span>Diagnostic certainty</span>
                  <span className="r-confidence-pct">{result?.operational_confidence}</span>
                </div>
                <div className="r-progress-track">
                  <div className="r-progress-fill" style={{ width: `${pct}%` }} />
                </div>
              </div>
            </div>

            {/* Signals */}
            <div className="r-card">
              <p className="r-card-title">Signals Detected</p>
              <div className="r-signal-list">
                {(fp.signals || []).map(s => (
                  <div className="r-signal-item" key={s}>
                    <div className="r-signal-dot" />
                    <span>{s}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Visual analysis */}
            {hasVis && (
              <div className="r-card">
                <p className="r-card-title">
                  👁 AI Visual Analysis
                  <span className="r-badge r-badge-info" style={{ marginLeft: 10, verticalAlign: "middle" }}>
                    {visual.visual_confidence}
                  </span>
                </p>
                <div className="r-signal-list">
                  {(visual.observed_indicators || []).map(i => (
                    <div className="r-signal-item" key={i}>
                      <div className="r-signal-dot visual" />
                      <span>{i}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right column */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

            {/* MTTR hero */}
            {mttr > 0 && (
              <div className="r-mttr-hero">
                <div>
                  <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
                    <span className="r-mttr-number">{mttr}</span>
                    <span className="r-mttr-unit">min</span>
                  </div>
                  <p className="r-mttr-label">Estimated Repair Time</p>
                  <p className="r-mttr-sub">
                    {steps.length} steps · {supervised} supervised
                  </p>
                </div>
              </div>
            )}

            {/* Digital Twin */}
            <div className="r-card">
              <p className="r-card-title">Generative Digital Twin</p>
              <div className="r-twin-box">
                <p><b>State:</b> {twin.asset_state}</p>
                <p><b>Condition:</b> {twin.current_operational_condition}</p>
                <p><b>Mechanism:</b> {twin.likely_internal_behavior}</p>
                <p style={{ color: "#fb7185" }}><b>Impact:</b> {twin.operational_impact}</p>
              </div>
            </div>

            {/* Tools & parts */}
            {(result?.tools_and_parts?.tools?.length > 0 || result?.tools_and_parts?.parts_may_be_needed?.length > 0) && (
              <div className="r-card">
                <p className="r-card-title">Tools & Parts</p>
                <div className="r-tools-grid">
                  {result.tools_and_parts.tools?.length > 0 && (
                    <div className="r-tool-section">
                      <h4>🔧 Tools</h4>
                      <div className="r-tags">
                        {result.tools_and_parts.tools.map(t => <span key={t} className="r-tag">{t}</span>)}
                      </div>
                    </div>
                  )}
                  {result.tools_and_parts.parts_may_be_needed?.length > 0 && (
                    <div className="r-tool-section">
                      <h4>🔩 Parts</h4>
                      <div className="r-tags">
                        {result.tools_and_parts.parts_may_be_needed.map(p => <span key={p} className="r-tag r-tag-part">{p}</span>)}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Confidence drivers */}
            {result?.confidence_drivers?.length > 0 && (
              <div className="r-card">
                <p className="r-card-title">Why Vulcan is Confident</p>
                <div className="r-signal-list">
                  {result.confidence_drivers.map(d => (
                    <div className="r-signal-item" key={d}>
                      <div className="r-signal-dot info" />
                      <span>{d}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Safety rules bar */}
        {result?.safety_rules?.length > 0 && (
          <div className="r-card r-card-danger" style={{ marginTop: 16 }}>
            <p className="r-card-title">⚠ Mandatory Safety Rules — Complete Before Repair</p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {result.safety_rules.map(r => (
                <span key={r} className="r-badge r-badge-high">{r}</span>
              ))}
            </div>
          </div>
        )}

        <div className="r-actions">
          <button className="r-btn r-btn-ghost" onClick={onBack}>← Back</button>
          <button className="r-btn r-btn-primary r-btn-lg" onClick={onProceed} style={{ flex: 1 }}>
            Proceed to Safety Lock →
          </button>
        </div>

      </div>
    </div>
  );
}
