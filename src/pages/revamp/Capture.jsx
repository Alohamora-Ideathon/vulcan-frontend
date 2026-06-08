import React, { useRef, useState } from "react";

export default function Capture({ incident, setIncident, onAnalyze, loading }) {
  const [recording, setRecording] = useState(false);
  const recorderRef = useRef(null);
  const chunksRef   = useRef([]);

  const set = (key, val) => setIncident(prev => ({ ...prev, [key]: val }));

  const handleImage = e => {
    const f = e.target.files[0];
    if (f) { set("imageFile", f); set("imageName", f.name); }
    e.target.value = "";
  };

  const handleVideo = e => {
    const f = e.target.files[0];
    if (f) { set("videoFile", f); set("videoName", f.name); }
    e.target.value = "";
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

  const canAnalyze = incident.observation.trim().length > 0 || incident.imageFile || incident.videoFile || incident.audioBlob;

  return (
    <div className="r-page">
      <div className="r-page-center">

        {/* Page header */}
        <div style={{ marginBottom: 24 }}>
          <p className="r-page-title">Log Incident</p>
          <p style={{ color: "var(--text-muted)", fontSize: 13 }}>
            Describe the fault and attach any evidence. Vulcan will analyse and generate a repair plan.
          </p>
        </div>

        {/* Evidence attachments */}
        <div className="r-card" style={{ marginBottom: 16 }}>
          <p className="r-card-title" style={{ marginBottom: 12 }}>Attach Evidence</p>

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>

            {/* Photo */}
            <label className="r-evidence-btn">
              <input type="file" accept="image/*" style={{ display: "none" }} onChange={handleImage} />
              {incident.imageName ? (
                <>
                  <span>📷</span>
                  <span style={{ fontSize: 12, maxWidth: 140, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {incident.imageName}
                  </span>
                  <button
                    className="r-pending-remove"
                    style={{ marginLeft: 4 }}
                    onClick={e => { e.preventDefault(); set("imageFile", null); set("imageName", ""); }}>
                    ×
                  </button>
                </>
              ) : (
                <>
                  <span>📷</span>
                  <span>Add Photo</span>
                </>
              )}
            </label>

            {/* Video */}
            <label className="r-evidence-btn">
              <input type="file" accept="video/*" style={{ display: "none" }} onChange={handleVideo} />
              {incident.videoName ? (
                <>
                  <span>🎥</span>
                  <span style={{ fontSize: 12, maxWidth: 140, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {incident.videoName}
                  </span>
                  <button
                    className="r-pending-remove"
                    style={{ marginLeft: 4 }}
                    onClick={e => { e.preventDefault(); set("videoFile", null); set("videoName", ""); }}>
                    ×
                  </button>
                </>
              ) : (
                <>
                  <span>🎥</span>
                  <span>Add Video</span>
                </>
              )}
            </label>

            {/* Voice note */}
            {incident.audioBlob ? (
              <div className="r-evidence-btn" style={{ cursor: "default" }}>
                <span>🎙️</span>
                <span>voice-note.webm</span>
                <button className="r-pending-remove" style={{ marginLeft: 4 }}
                  onClick={() => { set("audioBlob", null); set("audioUrl", ""); set("audioName", ""); }}>
                  ×
                </button>
              </div>
            ) : (
              <button className="r-evidence-btn"
                style={{ color: recording ? "var(--risk-high)" : undefined, border: recording ? "1px solid var(--risk-high)" : undefined }}
                onClick={recording ? stopRec : startRec}>
                {recording ? <><span>⏹</span><span>Stop Recording</span></> : <><span>🎙️</span><span>Voice Note</span></>}
              </button>
            )}
          </div>

          {incident.audioUrl && (
            <audio controls src={incident.audioUrl} style={{ marginTop: 12, width: "100%", height: 36 }} />
          )}
        </div>

        {/* Fault description */}
        <div className="r-card" style={{ marginBottom: 16 }}>
          <p className="r-card-title" style={{ marginBottom: 12 }}>Fault Description</p>
          <textarea
            className="r-input"
            style={{ resize: "vertical", minHeight: 80, fontFamily: "inherit", lineHeight: 1.6 }}
            placeholder={`Describe what you see, hear or smell — e.g. "Pump making rattling noise, P101 alarm flashing, pressure reading low"`}
            value={incident.observation}
            onChange={e => set("observation", e.target.value)}
            rows={3}
          />
        </div>

        {/* Asset details */}
        <div className="r-card" style={{ marginBottom: 24 }}>
          <p className="r-card-title" style={{ marginBottom: 12 }}>Asset Details</p>
          <div className="r-field-grid">
            <div>
              <label className="r-label">Asset ID</label>
              <input className="r-input" placeholder="e.g. PUMP-101"
                value={incident.asset_id} onChange={e => set("asset_id", e.target.value)} />
            </div>
            <div>
              <label className="r-label">Location</label>
              <input className="r-input" placeholder="e.g. Unit 4 Bay 3"
                value={incident.location} onChange={e => set("location", e.target.value)} />
            </div>
            <div>
              <label className="r-label">Alarm Code</label>
              <input className="r-input" placeholder="e.g. P101"
                value={incident.alarm_code} onChange={e => set("alarm_code", e.target.value)} />
            </div>
          </div>
        </div>

        {/* CTA */}
        <button
          className="r-btn r-btn-primary r-btn-full r-btn-lg"
          disabled={!canAnalyze || loading}
          onClick={onAnalyze}
        >
          {loading ? "Analyzing…" : (
            <>
              <span style={{ background: "rgba(0,0,0,0.25)", borderRadius: 6, padding: "2px 7px", marginRight: 6, fontSize: 14 }}>⚡</span>
              Run Vulcan Analysis
            </>
          )}
        </button>
        {!canAnalyze && (
          <p style={{ textAlign: "center", marginTop: 10, color: "var(--text-dim)", fontSize: 13 }}>
            Add a fault description or attach evidence to continue
          </p>
        )}

      </div>
    </div>
  );
}
