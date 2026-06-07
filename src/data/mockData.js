export const diagnosisData = {
  risk: "High",
  failureArea: "Pump Flow System",
  likelyCause: "Cavitation with Seal Stress",
  alarm: "P101 – Cavitation Detected",
  confidence: "84%",
  evidence: [
    "Troubleshooting Guide: Cavitation symptoms include vibration, rattling noise, and pressure instability.",
    "SOP: Isolate pump and release pressure before seal inspection.",
    "Historical Logs: Similar issue resolved by suction blockage removal."
  ]
};

export const twinData = {
  asset: "Pump-12",
  location: "Refinery Zone B",
  currentState: "Flow instability",
  sealRisk: "Increasing leakage risk",
  operationalImpact: "Possible pump damage / emergency shutdown"
};

export const repairSteps = [
  "Stop pump operation",
  "Close suction and discharge valves",
  "Verify pressure release",
  "Wear PPE and face protection",
  "Inspect seal assembly",
  "Check suction blockage",
  "Escalate if leakage continues"
];