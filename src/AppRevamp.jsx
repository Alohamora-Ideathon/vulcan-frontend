import React, { useState } from "react";

import Capture from "./pages/revamp/Capture.jsx";
import Analyze from "./pages/revamp/Analyze.jsx";
import SafetyLock from "./pages/revamp/SafetyLock.jsx";
import Execute from "./pages/revamp/Execute.jsx";
import Close from "./pages/revamp/Close.jsx";

import {
  createIncident,
  uploadMedia,
  diagnoseIncident
} from "./services/api";

const STEPS = ["Capture", "Analyze", "Safety Lock", "Execute", "Close"];

const EMPTY_INCIDENT = {
  asset_id: "",
  location: "",
  alarm_code: "",
  observation: "",
  imageFile: null,
  imageName: "",
  videoFile: null,
  videoName: "",
  audioBlob: null,
  audioName: "",
  audioUrl: ""
};

export default function AppRevamp() {
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [startTime, setStartTime] = useState(null);
  const [incident, setIncident] = useState(EMPTY_INCIDENT);

  const goTo = (p) => {
    setPage(p);
    window.scrollTo(0, 0);
  };

  const handleAnalyze = async () => {
    try {
      setLoading(true);

      const incidentResponse = await createIncident({
        asset_id: incident.asset_id,
        location: incident.location,
        alarm_code: incident.alarm_code,
        observation: incident.observation
      });

      const sessionId =
        incidentResponse?.session_id ||
        incidentResponse?.id ||
        incidentResponse?.incident_id;

      if (!sessionId) {
        throw new Error("Session ID not returned from Create Incident API");
      }

      if (incident.imageFile || incident.videoFile || incident.audioBlob) {
        await uploadMedia(
          sessionId,
          incident.imageFile,
          incident.videoFile,
          incident.audioBlob
        );
      }

      const diagnoseResponse = await diagnoseIncident({
        session_id: sessionId,
        asset_id: incident.asset_id,
        location: incident.location,
        alarm_code: incident.alarm_code,
        observation: incident.observation
      });

      setResult(diagnoseResponse);
      setStartTime(Date.now());
      goTo(1);
    } catch (error) {
      console.error("Analyze failed:", error);
      alert(error.message || "Analysis failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const restart = () => {
    setPage(0);
    setResult(null);
    setStartTime(null);
    setIncident(EMPTY_INCIDENT);
  };

  return (
    <div className="revamp">
      {loading && (
        <div className="r-loading-overlay">
          <div className="r-loading-ring" />
          <p className="r-loading-text">Vulcan is analyzing</p>
          <div className="r-loading-dots">
            <span />
            <span />
            <span />
          </div>
        </div>
      )}

      <header className="r-header">
        <div className="r-logo">
          <div className="r-logo-mark">⚡</div>
          <div>
            <div className="r-logo-text">Vulcan AI</div>
            <div className="r-logo-sub">
              INDUSTRIAL MAINTENANCE COPILOT
            </div>
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

      <nav className="r-step-nav">
        {STEPS.map((label, i) => (
          <React.Fragment key={label}>
            <div
              className={`r-step-item ${
                i === page ? "active" : i < page ? "done" : ""
              }`}
              onClick={() => i < page && goTo(i)}
              style={{ cursor: i < page ? "pointer" : "default" }}
            >
              <span className="r-step-dot">{i < page ? "✓" : i + 1}</span>
              {label}
            </div>

            {i < STEPS.length - 1 && <div className="r-step-divider" />}
          </React.Fragment>
        ))}
      </nav>

      {page === 0 && (
        <Capture
          incident={incident}
          setIncident={setIncident}
          onAnalyze={handleAnalyze}
          loading={loading}
        />
      )}

      {page === 1 && (
        <Analyze
          incident={incident}
          result={result}
          onProceed={() => goTo(2)}
          onBack={() => goTo(0)}
        />
      )}

      {page === 2 && (
        <SafetyLock
          result={result}
          onProceed={() => goTo(3)}
          onBack={() => goTo(1)}
        />
      )}

      {page === 3 && (
        <Execute
          result={result}
          onFinish={() => goTo(4)}
          onBack={() => goTo(2)}
        />
      )}

      {page === 4 && (
        <Close
          incident={incident}
          result={result}
          startTime={startTime}
          onRestart={restart}
        />
      )}
    </div>
  );
}