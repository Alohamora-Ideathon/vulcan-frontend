import React from "react";
export default function IncidentIntake({ incident, setIncident, next }) {
  const handleImage = (e) => {
    const file = e.target.files[0];
    if (file) {
      setIncident({ ...incident, imageName: file.name });
    }
  };

  return (
    <section className="page">
      <div className="card large">
        <h2>1. Incident Intake</h2>
        <p className="muted">Technician reports the refinery pump issue.</p>

        <label>Alarm Code</label>
        <input
          value={incident.alarmCode}
          onChange={(e) =>
            setIncident({ ...incident, alarmCode: e.target.value })
          }
        />

        <label>Technician Observation</label>
        <textarea
          value={incident.observation}
          onChange={(e) =>
            setIncident({ ...incident, observation: e.target.value })
          }
        />

        <label>Upload Image</label>
        <input type="file" accept="image/*" onChange={handleImage} />

        {incident.imageName && (
          <p className="success">Uploaded: {incident.imageName}</p>
        )}

        <button className="primary" onClick={next}>
          Start Diagnosis →
        </button>
      </div>
    </section>
  );
}