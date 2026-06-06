import React, { useRef, useState } from "react";

export default function IncidentIntake({ incident, setIncident, next }) {
  const [recording, setRecording] = useState(false);
  const recorderRef = useRef(null);
  const chunksRef = useRef([]);

  const updateIncident = (key, value) => {
    setIncident({ ...incident, [key]: value });
  };

  const handleImage = (e) => {
    const file = e.target.files[0];
    if (file) {
      setIncident({ ...incident, imageFile: file, imageName: file.name });
    }
  };

  const cancelImage = () => {
    setIncident({ ...incident, imageFile: null, imageName: "" });
  };

  const handleVideo = (e) => {
    const file = e.target.files[0];
    if (file) {
      setIncident({ ...incident, videoFile: file, videoName: file.name });
    }
  };

  const cancelVideo = () => {
    setIncident({ ...incident, videoFile: null, videoName: "" });
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);

      recorderRef.current = recorder;
      chunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = () => {
        const audioBlob = new Blob(chunksRef.current, { type: "audio/webm" });
        const audioUrl = URL.createObjectURL(audioBlob);

        setIncident({
          ...incident,
          audioBlob,
          audioName: "technician-voice-note.webm",
          audioUrl
        });

        stream.getTracks().forEach((track) => track.stop());
      };

      recorder.start();
      setRecording(true);
    } catch {
      alert("Please allow microphone permission to record voice note.");
    }
  };

  const stopRecording = () => {
    recorderRef.current?.stop();
    setRecording(false);
  };

  const cancelAudio = () => {
    setIncident({
      ...incident,
      audioBlob: null,
      audioName: "",
      audioUrl: ""
    });
  };

  const evidenceCount = [
    incident.imageFile,
    incident.videoFile,
    incident.audioBlob
  ].filter(Boolean).length;

  return (
    <section className="page">
      <div className="card large">
        <div className="intake-title-row">
          <div>
            <h2>1. Incident Intake</h2>
            <p className="muted">
              Provide details and evidence to begin AI-assisted diagnosis.
            </p>
          </div>
        </div>

        <div className="field-grid">
          <label>
            Asset ID
            <input
              value={incident.asset_id}
              onChange={(e) => updateIncident("asset_id", e.target.value)}
            />
          </label>

          <label>
            Location
            <input
              value={incident.location}
              onChange={(e) => updateIncident("location", e.target.value)}
            />
          </label>

          <label>
            Alarm Code
            <input
              value={incident.alarm_code}
              onChange={(e) => updateIncident("alarm_code", e.target.value)}
            />
          </label>
        </div>

        <label>Technician Observation</label>
        <textarea
          value={incident.observation}
          onChange={(e) => updateIncident("observation", e.target.value)}
        />

        <div className="evidence-header">
          <h3>Evidence Capture</h3>
          <p>Attach photo, video, or voice note from the field.</p>
        </div>

        <div className="evidence-card-row">
          <div className="mini-evidence-card">
            <div className="mini-icon">📷</div>
            <h4>Photo</h4>
            <p>Upload photo of the issue</p>

            <label className="mini-upload-btn">
              Choose Image
              <input type="file" accept="image/*" onChange={handleImage} />
            </label>

            {incident.imageName && (
              <div className="mini-file">
                <span>{incident.imageName}</span>
                <button type="button" onClick={cancelImage}>
                  ×
                </button>
              </div>
            )}
          </div>

          <div className="mini-evidence-card">
            <div className="mini-icon">🎥</div>
            <h4>Video</h4>
            <p>Upload video of the issue</p>

            <label className="mini-upload-btn">
              Choose Video
              <input type="file" accept="video/*" onChange={handleVideo} />
            </label>

            {incident.videoName && (
              <div className="mini-file">
                <span>{incident.videoName}</span>
                <button type="button" onClick={cancelVideo}>
                  ×
                </button>
              </div>
            )}
          </div>

          <div className="mini-evidence-card">
            <div className="mini-icon">🎙️</div>
            <h4>Voice</h4>
            <p>Describe the issue verbally</p>

            {!recording ? (
              <button
                type="button"
                className="mini-record-btn"
                onClick={startRecording}
              >
                Record Voice
              </button>
            ) : (
              <button
                type="button"
                className="mini-stop-btn"
                onClick={stopRecording}
              >
                Stop Recording
              </button>
            )}

            {incident.audioUrl && (
              <div className="mini-audio">
                <audio controls src={incident.audioUrl}></audio>
                <button type="button" onClick={cancelAudio}>
                  ×
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="actions">
          <button className="primary" onClick={next}>
            Start Diagnosis →
          </button>
        </div>
      </div>
    </section>
  );
}