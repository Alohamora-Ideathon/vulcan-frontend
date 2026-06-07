import React, { useRef, useState } from "react";

export default function Capture({ incident, setIncident, onAnalyze, loading }) {
  const [recording, setRecording] = useState(false);
  const recorderRef = useRef(null);
  const chunksRef   = useRef([]);

  const set = (key, val) => setIncident(prev => ({ ...prev, [key]: val }));

  const handleImage = e => {
    const f = e.target.files[0];
    if (f) set("imageFile", f), set("imageName", f.name);
  };

  const handleVideo = e => {
    const f = e.target.files[0];
    if (f) set("videoFile", f), set("videoName", f.name);
  };

  const startRec = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const rec    = new MediaRecorder(stream);
      recorderRef.current = rec;
      chunksRef.current   = [];
      rec.ondataavailable = e => { if (e.data.size > 0) chunksRef.current.push(e.data); };
      rec.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        set("audioBlob", blob);
        set("audioUrl",  URL.createObjectURL(blob));
        set("audioName", "voice-note.webm");
        stream.getTracks().forEach(t => t.stop());
      };
      rec.start();
      setRecording(true);
    } catch { alert("Allow microphone access to record."); }
  };

  const stopRec = () => { recorderRef.current?.stop(); setRecording(false); };

  const hasAny = incident.alarm_code || incident.observation ||
                 incident.imageFile  || incident.videoFile   || incident.audioBlob;

  return (
    <div className="r-page">
      <div className="r-page-center">

        <p className="r-page-title">New Incident</p>
        <p className="r-page-sub">Provide evidence and context — any combination works.</p>

        {/* Asset fields */}
        <div className="r-card">
          <div className="r-field-grid">
            <div>
              <label className="r-label">Asset ID</label>
              <input className="r-input" placeholder="e.g. PUMP-101"
                value={incident.asset_id}
                onChange={e => set("asset_id", e.target.value)} />
            </div>
            <div>
              <label className="r-label">Location</label>
              <input className="r-input" placeholder="e.g. Unit 4 Bay 3"
                value={incident.location}
                onChange={e => set("location", e.target.value)} />
            </div>
            <div>
              <label className="r-label">Alarm Code</label>
              <input className="r-input" placeholder="e.g. P101"
                value={incident.alarm_code}
                onChange={e => set("alarm_code", e.target.value)} />
            </div>
          </div>

          <div style={{ marginTop: 16 }}>
            <label className="r-label">Observation</label>
            <textarea className="r-textarea"
              placeholder="Describe what you see, hear or smell at the machine..."
              value={incident.observation}
              onChange={e => set("observation", e.target.value)} />
          </div>
        </div>

        {/* Evidence capture */}
        <p className="r-section-title" style={{ marginTop: 28 }}>Evidence Capture</p>

        <div className="r-evidence-grid">

          {/* Photo */}
          <label className={`r-evidence-card ${incident.imageName ? "has-file" : ""}`}>
            <input type="file" accept="image/*" className="r-file-input" onChange={handleImage} />
            <div className="r-evidence-icon">📷</div>
            <span className="r-evidence-label">Photo</span>
            <span className="r-evidence-sub">Capture the fault indicator, gauge or damage</span>
            {incident.imageName
              ? <span className="r-evidence-filename">✓ {incident.imageName}</span>
              : <span className="r-badge r-badge-neutral" style={{ marginTop: 4 }}>Tap to upload</span>
            }
          </label>

          {/* Video */}
          <label className={`r-evidence-card ${incident.videoName ? "has-file" : ""}`}>
            <input type="file" accept="video/*" className="r-file-input" onChange={handleVideo} />
            <div className="r-evidence-icon">🎥</div>
            <span className="r-evidence-label">Video</span>
            <span className="r-evidence-sub">Record the active fault state for AI analysis</span>
            {incident.videoName
              ? <span className="r-evidence-filename">✓ {incident.videoName}</span>
              : <span className="r-badge r-badge-neutral" style={{ marginTop: 4 }}>Tap to upload</span>
            }
          </label>

          {/* Voice */}
          <div className={`r-evidence-card ${incident.audioBlob ? "has-file" : ""}`}
               style={{ cursor: "default" }}>
            <div className="r-evidence-icon">🎙️</div>
            <span className="r-evidence-label">Voice Note</span>
            <span className="r-evidence-sub">Describe verbally what you observe</span>
            {incident.audioBlob ? (
              <>
                <span className="r-evidence-filename">✓ {incident.audioName}</span>
                <audio controls src={incident.audioUrl}
                  style={{ width: "100%", marginTop: 8, filter: "invert(1) hue-rotate(180deg)" }} />
              </>
            ) : recording ? (
              <button className="r-btn r-btn-danger" onClick={stopRec} style={{ marginTop: 4 }}>
                ⏹ Stop Recording
              </button>
            ) : (
              <button className="r-btn r-btn-ghost" onClick={startRec} style={{ marginTop: 4 }}>
                ⏺ Record
              </button>
            )}
          </div>
        </div>

        {/* CTA */}
        <div style={{ marginTop: 32 }}>
          <button
            className="r-btn r-btn-primary r-btn-full r-btn-lg"
            disabled={!hasAny || loading}
            onClick={onAnalyze}
          >
            {loading ? "Analyzing..." : "⚡ Run Vulcan Analysis"}
          </button>
          {!hasAny && (
            <p style={{ textAlign: "center", marginTop: 10, color: "var(--text-muted)", fontSize: 13 }}>
              Add at least one field, image, video or voice note to proceed.
            </p>
          )}
        </div>

      </div>
    </div>
  );
}
