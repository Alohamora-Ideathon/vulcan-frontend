import React from "react";

export default function IncidentIntake({ incident, setIncident, next }) {
  const handleImage = (e) => {
    const file = e.target.files[0];

    if (file) {
      setIncident({
        ...incident,
        imageFile: file,
        imageName: file.name
      });
    }
  };

  const handleVideo = (e) => {
    const file = e.target.files[0];

    if (file) {
      setIncident({
        ...incident,
        videoFile: file,
        videoName: file.name
      });
    }
  };

  return (
    <section className="page">
      <div className="card large">
        <h2>1. Incident Intake</h2>

        <p className="muted">
          Technician reports the refinery pump issue.
        </p>

        <label>Asset ID</label>
        <input
          value={incident.asset_id}
          onChange={(e) =>
            setIncident({
              ...incident,
              asset_id: e.target.value
            })
          }
          placeholder="PUMP-12"
        />

        <label>Location</label>
        <input
          value={incident.location}
          onChange={(e) =>
            setIncident({
              ...incident,
              location: e.target.value
            })
          }
          placeholder="Refinery Zone B"
        />

        <label>Alarm Code</label>
        <input
          value={incident.alarm_code}
          onChange={(e) =>
            setIncident({
              ...incident,
              alarm_code: e.target.value
            })
          }
          placeholder="P101"
        />

        <label>Technician Observation</label>
        <textarea
          value={incident.observation}
          onChange={(e) =>
            setIncident({
              ...incident,
              observation: e.target.value
            })
          }
          placeholder="Pump noisy with pressure fluctuation and vibration increase"
        />

        <label>Upload Image</label>
        <input
          type="file"
          accept="image/*"
          onChange={handleImage}
        />

        {incident.imageName && (
          <p className="success">
            Image selected: {incident.imageName}
          </p>
        )}

        <label>Upload Video</label>
        <input
          type="file"
          accept="video/*"
          onChange={handleVideo}
        />

        {incident.videoName && (
          <p className="success">
            Video selected: {incident.videoName}
          </p>
        )}

        <button className="primary" onClick={next}>
          Start Diagnosis →
        </button>
      </div>
    </section>
  );
}