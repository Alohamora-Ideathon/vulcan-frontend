import React, { useState } from "react";
import Capture    from "./pages/revamp/Capture.jsx";
import Analyze    from "./pages/revamp/Analyze.jsx";
import SafetyLock from "./pages/revamp/SafetyLock.jsx";
import Execute    from "./pages/revamp/Execute.jsx";
import Close      from "./pages/revamp/Close.jsx";

// ── Static mock result — swap for real API response later ────────────
const MOCK_RESULT = {
  status: "SUCCESS",
  session_id: "demo-001",
  failure_fingerprint: {
    failure_pattern: "Pump Cavitation with Seal Stress",
    failure_area: "Suction System — Primary Circuit",
    risk_level: "High",
    signals: [
      "Vibration increase at suction line",
      "Inlet pressure dropped below 1.5 bar",
      "Rattling noise from pump housing"
    ]
  },
  generative_failure_twin: {
    asset_state: "Pump operating under unstable suction conditions",
    current_operational_condition: "Cavitation detected — vapor bubble collapse near impeller",
    likely_internal_behavior: "Suction pressure below safe threshold causing bubble formation and collapse",
    operational_impact: "Continued operation → impeller erosion, seal failure, emergency shutdown"
  },
  visual_analysis: {
    observed_indicators: [
      "Amber warning light flashing 3 times consecutively",
      "Pressure gauge reading 0.8 bar (below 1.5 bar threshold)",
      "Moisture visible around seal housing"
    ],
    visual_confidence: "High"
  },
  operational_confidence: "87%",
  confidence_drivers: [
    "P101 alarm matched cavitation pattern in Pump Troubleshooting Guide",
    "Observation aligns with suction blockage symptoms",
    "Visual indicators confirm pressure drop and seal stress"
  ],
  safety_rules: [
    "Stop pump operation immediately — do not restart until inspected",
    "Close suction valve V-101 and discharge valve V-102 before any access"
  ],
  step_by_step_workflow: [
    { step:1, action:"Trip motor and stop pump operation", safety_condition:"Ensure all personnel clear before shutdown", estimated_minutes:5,  supervisor_required:false },
    { step:2, action:"Close suction valve V-101 and discharge valve V-102", safety_condition:"Wear PPE — gloves and safety glasses required", estimated_minutes:5,  supervisor_required:false },
    { step:3, action:"Release system pressure via relief valve PRV-03", safety_condition:"STAND CLEAR of pressure relief direction — HIGH PRESSURE", estimated_minutes:10, supervisor_required:true  },
    { step:4, action:"Inspect suction strainer for blockages or debris", safety_condition:"Confirm pressure reads zero before opening strainer", estimated_minutes:15, supervisor_required:false },
    { step:5, action:"Verify inlet pressure at test point TP-01 with calibrated gauge", safety_condition:"Use Category IV rated instrument only", estimated_minutes:10, supervisor_required:false },
    { step:6, action:"Inspect mechanical seal assembly for leakage or damage", safety_condition:"Pump must be fully isolated and de-energised before access", estimated_minutes:20, supervisor_required:true  },
    { step:7, action:"Restart pump gradually and monitor vibration and pressure", safety_condition:"All personnel clear of pump housing during restart", estimated_minutes:15, supervisor_required:false }
  ],
  tools_and_parts: {
    tools: ["Calibrated pressure gauge (Cat IV)", "Torque wrench", "Hex key set"],
    parts_may_be_needed: ["Mechanical seal kit", "Suction strainer gasket"]
  },
  estimated_total_repair_minutes: 80,
  escalation_required: false,
  explainability: [
    "P101 alarm matched cavitation pattern in Pump Troubleshooting Guide",
    "Observation and visual indicators consistent with suction blockage"
  ]
};

const STEPS = ["Capture", "Analyze", "Safety Lock", "Execute", "Close"];

export default function AppRevamp() {
  const [page,      setPage]      = useState(0);
  const [loading,   setLoading]   = useState(false);
  const [result,    setResult]    = useState(null);
  const [startTime, setStartTime] = useState(null);
  const [incident,  setIncident]  = useState({
    asset_id: "", location: "", alarm_code: "", observation: "",
    imageFile: null, imageName: "", videoFile: null, videoName: "",
    audioBlob: null, audioName: "", audioUrl: ""
  });

  const goTo = p => { setPage(p); window.scrollTo(0, 0); };

  const handleAnalyze = async () => {
    setLoading(true);
    // TODO: replace setTimeout with real API calls (createIncident, uploadMedia, diagnoseIncident)
    await new Promise(r => setTimeout(r, 2200));
    setResult(MOCK_RESULT);
    setStartTime(Date.now());
    setLoading(false);
    goTo(1);
  };

  const restart = () => {
    setPage(0);
    setResult(null);
    setStartTime(null);
    setIncident({ asset_id:"", location:"", alarm_code:"", observation:"",
      imageFile:null, imageName:"", videoFile:null, videoName:"",
      audioBlob:null, audioName:"", audioUrl:"" });
  };

  return (
    <div className="revamp">

      {/* Loading overlay */}
      {loading && (
        <div className="r-loading-overlay">
          <div className="r-loading-ring" />
          <p className="r-loading-text">Vulcan is analyzing</p>
          <div className="r-loading-dots">
            <span /><span /><span />
          </div>
        </div>
      )}

      {/* Header */}
      <header className="r-header">
        <div className="r-logo">
          <div className="r-logo-mark">⚡</div>
          <div>
            <div className="r-logo-text">Vulcan AI</div>
            <div className="r-logo-sub">INDUSTRIAL MAINTENANCE COPILOT</div>
          </div>
        </div>
        <div className="r-header-right">
          <span style={{ fontSize: 13, color: "var(--text-muted)" }}>
            <span className="r-status-dot" style={{ marginRight: 6 }} />
            AI Online
          </span>
          <span className="r-user-badge">Technician</span>
        </div>
      </header>

      {/* Step nav */}
      <nav className="r-step-nav">
        {STEPS.map((label, i) => (
          <React.Fragment key={label}>
            <div className={`r-step-item ${i === page ? "active" : i < page ? "done" : ""}`}
              onClick={() => i < page && goTo(i)} style={{ cursor: i < page ? "pointer" : "default" }}>
              <span className="r-step-dot">{i < page ? "✓" : i + 1}</span>
              {label}
            </div>
            {i < STEPS.length - 1 && <div className="r-step-divider" />}
          </React.Fragment>
        ))}
      </nav>

      {/* Pages */}
      {page === 0 && <Capture incident={incident} setIncident={setIncident} onAnalyze={handleAnalyze} loading={loading} />}
      {page === 1 && <Analyze incident={incident} result={result} onProceed={() => goTo(2)} onBack={() => goTo(0)} />}
      {page === 2 && <SafetyLock result={result} onProceed={() => goTo(3)} onBack={() => goTo(1)} />}
      {page === 3 && <Execute result={result} onFinish={() => goTo(4)} onBack={() => goTo(2)} />}
      {page === 4 && <Close incident={incident} result={result} startTime={startTime} onRestart={restart} />}

    </div>
  );
}
