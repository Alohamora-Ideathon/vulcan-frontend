import React, { useState } from "react";
import Header from "./components/Header";
import ProgressBar from "./components/ProgressBar";
import IncidentIntake from "./pages/IncidentIntake";
import Diagnosis from "./pages/Diagnosis";
import FailureTwin from "./pages/FailureTwin";
import SafetyGate from "./pages/SafetyGate";
import GuidedRepair from "./pages/GuidedRepair";
import Resolution from "./pages/Resolution";
import {
  createIncident,
  diagnoseIncident,
  uploadMedia
} from "./services/api";

const pages = [
  "Incident Intake",
  "Diagnosis",
  "Failure Twin",
  "Safety Gate",
  "Guided Repair",
  "Resolution"
];

export default function App() {
  const [currentPage, setCurrentPage] = useState(0);
  const [errorMessage, setErrorMessage] = useState("");

  const [incident, setIncident] = useState({
    asset_id: "",
    location: "",
    alarm_code: "",
    observation: "",
    imageFile: null,
    imageName: "",
    videoFile: null,
    videoName: ""
  });

  const [diagnosisResult, setDiagnosisResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const goToPage = (pageIndex) => {
    if (pageIndex > 0 && !diagnosisResult) {
      setErrorMessage("Please complete Incident Intake first.");
      return;
    }

    setErrorMessage("");
    setCurrentPage(pageIndex);
  };

  const next = async () => {
    if (currentPage === 0) {
      if (
        !incident.asset_id ||
        !incident.location ||
        !incident.alarm_code ||
        !incident.observation
      ) {
        setErrorMessage("Please fill all fields before starting diagnosis.");
        return;
      }

      try {
        setLoading(true);
        setErrorMessage("");

        const payload = {
          asset_id: incident.asset_id,
          location: incident.location,
          alarm_code: incident.alarm_code,
          observation: incident.observation,
          image_name: incident.imageName,
          video_name: incident.videoName
        };

        const incidentRecord = await createIncident(payload);

        if (!incidentRecord?.session_id) {
          throw new Error("Session ID was not created.");
        }

        if (incident.imageFile || incident.videoFile) {
          await uploadMedia(
            incidentRecord.session_id,
            incident.imageFile,
            incident.videoFile
          );
        }

        const result = await diagnoseIncident({
          ...payload,
          session_id: incidentRecord.session_id
        });

        setDiagnosisResult(result);
        setCurrentPage(1);
        return;
      } catch (error) {
        console.error("Backend call failed:", error);
        setErrorMessage(
          error?.message || "Backend call failed. Please check backend server."
        );
        return;
      } finally {
        setLoading(false);
      }
    }

    if (!diagnosisResult) {
      setErrorMessage("Diagnosis result is not available yet.");
      return;
    }

    if (currentPage < pages.length - 1) {
      setErrorMessage("");
      setCurrentPage(currentPage + 1);
    }
  };

  const back = () => {
    setErrorMessage("");

    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

  return (
    <div className="app">
      <Header />

      <ProgressBar
        pages={pages}
        currentPage={currentPage}
        onPageClick={goToPage}
      />

      {errorMessage && (
        <div className="error-popup">
          <p>{errorMessage}</p>
          <button type="button" onClick={() => setErrorMessage("")}>
            Close
          </button>
        </div>
      )}

      {loading && <p className="loading">Processing incident...</p>}

      {currentPage === 0 && (
        <IncidentIntake
          incident={incident}
          setIncident={setIncident}
          next={next}
        />
      )}

      {currentPage === 1 && (
        <Diagnosis
          incident={incident}
          diagnosisResult={diagnosisResult}
          next={next}
          back={back}
        />
      )}

      {currentPage === 2 && (
        <FailureTwin
          incident={incident}
          diagnosisResult={diagnosisResult}
          next={next}
          back={back}
        />
      )}

      {currentPage === 3 && (
        <SafetyGate
          diagnosisResult={diagnosisResult}
          next={next}
          back={back}
        />
      )}

      {currentPage === 4 && (
        <GuidedRepair
          diagnosisResult={diagnosisResult}
          next={next}
          back={back}
        />
      )}

      {currentPage === 5 && (
        <Resolution
          incident={incident}
          diagnosisResult={diagnosisResult}
          back={back}
        />
      )}
    </div>
  );
}