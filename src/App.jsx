import React from "react";
import { useState } from "react";
import Header from "./components/Header";
import ProgressBar from "./components/ProgressBar";
import IncidentIntake from "./pages/IncidentIntake";
import Diagnosis from "./pages/Diagnosis";
import FailureTwin from "./pages/FailureTwin";
import SafetyGate from "./pages/SafetyGate";
import GuidedRepair from "./pages/GuidedRepair";
import Resolution from "./pages/Resolution";

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
  const [incident, setIncident] = useState({
    alarmCode: "P101",
    observation: "Pump noisy, pressure unstable, minor leakage visible.",
    imageName: ""
  });

  const next = () => {
    if (currentPage < pages.length - 1) setCurrentPage(currentPage + 1);
  };

  const back = () => {
    if (currentPage > 0) setCurrentPage(currentPage - 1);
  };

  return (
    <div className="app">
      <Header />
      <ProgressBar pages={pages} currentPage={currentPage} />

      {currentPage === 0 && (
        <IncidentIntake incident={incident} setIncident={setIncident} next={next} />
      )}

      {currentPage === 1 && (
        <Diagnosis incident={incident} next={next} back={back} />
      )}

      {currentPage === 2 && (
        <FailureTwin next={next} back={back} />
      )}

      {currentPage === 3 && (
        <SafetyGate next={next} back={back} />
      )}

      {currentPage === 4 && (
        <GuidedRepair next={next} back={back} />
      )}

      {currentPage === 5 && (
        <Resolution back={back} />
      )}
    </div>
  );
}