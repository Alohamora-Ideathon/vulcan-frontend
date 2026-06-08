const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  "https://7t8e4pu586.execute-api.ap-south-1.amazonaws.com";

// Set VITE_USE_MOCK=false in .env.local to switch to the live backend
const USE_MOCK = import.meta.env.VITE_USE_MOCK !== "false";

const MOCK_RESULT = {
  status: "SUCCESS",
  session_id: "demo-001",
  failure_fingerprint: {
    failure_pattern: "Pump Cavitation with Seal Stress",
    failure_area:    "Suction System — Primary Circuit",
    risk_level:      "High",
    signals: [
      "Vibration increase at suction line",
      "Inlet pressure dropped below 1.5 bar",
      "Rattling noise from pump housing"
    ]
  },
  generative_failure_twin: {
    asset_state:                    "Pump operating under unstable suction conditions",
    current_operational_condition:  "Cavitation detected — vapor bubble collapse near impeller",
    likely_internal_behavior:       "Suction pressure below safe threshold causing bubble formation",
    operational_impact:             "Continued operation → impeller erosion, seal failure, emergency shutdown"
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
    { step:1, action:"Trip motor and stop pump operation",                        safety_condition:"Ensure all personnel clear before shutdown",               estimated_minutes:5,  supervisor_required:false },
    { step:2, action:"Close suction valve V-101 and discharge valve V-102",       safety_condition:"Wear PPE — gloves and safety glasses required",            estimated_minutes:5,  supervisor_required:false },
    { step:3, action:"Release system pressure via relief valve PRV-03",           safety_condition:"STAND CLEAR of pressure relief direction — HIGH PRESSURE", estimated_minutes:10, supervisor_required:true  },
    { step:4, action:"Inspect suction strainer for blockages or debris",          safety_condition:"Confirm pressure reads zero before opening strainer",      estimated_minutes:15, supervisor_required:false },
    { step:5, action:"Verify inlet pressure at test point TP-01",                 safety_condition:"Use Category IV rated instrument only",                   estimated_minutes:10, supervisor_required:false },
    { step:6, action:"Inspect mechanical seal assembly for leakage or damage",    safety_condition:"Pump must be fully isolated and de-energised before access",estimated_minutes:20, supervisor_required:true  },
    { step:7, action:"Restart pump gradually and monitor vibration and pressure", safety_condition:"All personnel clear of pump housing during restart",       estimated_minutes:15, supervisor_required:false }
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

function delay(ms) { return new Promise(r => setTimeout(r, ms)); }

async function handleResponse(res, name) {
  const data = await res.json().catch(() => null);
  if (!res.ok) throw new Error(data?.message || data?.detail || `${name} failed`);
  return data;
}

export async function createIncident(payload) {
  if (USE_MOCK) { await delay(400); return { session_id: "demo-001", status: "OPEN" }; }
  const res = await fetch(`${API_BASE_URL}/incident`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      asset_id:    payload.asset_id    || "",
      location:    payload.location    || "",
      alarm_code:  payload.alarm_code  || "",
      observation: payload.observation || "Technician submitted field evidence."
    })
  });
  return handleResponse(res, "Create Incident");
}

export async function uploadMedia(sessionId, imageFile, videoFile, audioBlob) {
  if (USE_MOCK) { await delay(600); return { session_id: sessionId }; }

  const upload = async (file, mediaType) => {
    if (!file) return;
    const f = file instanceof File ? file : new File([file], `${mediaType}.webm`, { type: "audio/webm" });
    const presign = await fetch(`${API_BASE_URL}/generate-upload-url`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ session_id: sessionId, filename: f.name, content_type: f.type, media_type: mediaType })
    });
    const { upload_url } = await handleResponse(presign, "Generate Upload URL");
    const s3 = await fetch(upload_url, { method: "PUT", headers: { "Content-Type": f.type }, body: f });
    if (!s3.ok) throw new Error(`S3 upload failed for ${f.name}`);
  };

  if (imageFile) await upload(imageFile, "image");
  if (videoFile) await upload(videoFile, "video");
  if (audioBlob) await upload(audioBlob, "audio");
  return { session_id: sessionId };
}

export async function diagnoseIncident(payload) {
  if (USE_MOCK) { await delay(2200); return MOCK_RESULT; }
  const res = await fetch(`${API_BASE_URL}/diagnose`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  return handleResponse(res, "Diagnose");
}

export async function submitFeedback(payload) {
  if (USE_MOCK) { await delay(400); return { session_id: payload.session_id }; }
  const res = await fetch(`${API_BASE_URL}/feedback`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  return handleResponse(res, "Feedback");
}

function mockFollowUpAnswer(question, failurePattern) {
  const q = question.toLowerCase();
  const pattern = failurePattern || "this fault";

  if (q.includes("alternative") || q.includes("don't have") || q.includes("substitute") || q.includes("without")) {
    return `For ${pattern}, a calibrated digital pressure gauge (Category III or higher) can substitute where specified tooling is unavailable. Confirm all readings against the system baseline before proceeding. Document any substitution in the maintenance log.`;
  }
  if (q.includes("urgent") || q.includes("defer") || q.includes("overnight") || q.includes("wait") || q.includes("how long")) {
    return `${pattern} is a progressive fault — continued operation accelerates impeller erosion and seal degradation. If immediate shutdown isn't possible, reduce pump load by 30% and schedule repair within 4 hours maximum. Do not leave unmonitored overnight.`;
  }
  if (q.includes("fail") || q.includes("doesn't work") || q.includes("not working") || q.includes("step")) {
    return `If the indicated step yields no result, the fault may have propagated further upstream. Stop work, document current instrument readings, and escalate to a senior engineer before attempting further intervention.`;
  }
  if (q.includes("safe") || q.includes("danger") || q.includes("risk") || q.includes("ppe")) {
    return `High-risk areas for ${pattern}: pressure relief direction (stand clear), seal housing access (full isolation required), and restart phase (all personnel clear). Minimum PPE: safety glasses, chemical-resistant gloves, steel-toe boots. Supervisor sign-off needed for steps 3 and 6.`;
  }
  if (q.includes("root cause") || q.includes("why") || q.includes("cause")) {
    return `Root cause for ${pattern}: suction pressure dropped below NPSH (Net Positive Suction Head) threshold, causing vapour bubble formation at the impeller eye. Primary triggers are typically a blocked suction strainer, partially closed suction valve, or upstream supply issue. Address the strainer first — it resolves ~70% of cavitation cases.`;
  }
  return `Based on the ${pattern} diagnosis, follow the repair steps in sequence — each safety condition must be verified before advancing. If you encounter unexpected readings or physical damage beyond what's described, stop work and call your supervisor. Vulcan's guidance covers the standard fault path; field conditions may vary.`;
}

export async function askFollowUp(sessionId, question, failurePattern) {
  if (USE_MOCK) {
    await delay(900 + Math.random() * 600);
    return { answer: mockFollowUpAnswer(question, failurePattern) };
  }
  const res = await fetch(`${API_BASE_URL}/diagnose`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ session_id: sessionId, followup_question: question })
  });
  return handleResponse(res, "Follow-up");
}
