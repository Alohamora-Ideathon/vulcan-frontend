const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  "https://7t8e4pu586.execute-api.ap-south-1.amazonaws.com";

const USE_MOCK = import.meta.env.VITE_USE_MOCK === "true";

// ── Mock response — matches our Lambda's exact output schema ─────────────────
// Switch off: set VITE_USE_MOCK=false in .env.local (or delete .env.local)
const MOCK_DIAGNOSIS = {
  status: "SUCCESS",
  session_id: "demo-session-001",
  failure_fingerprint: {
    failure_pattern: "Pump Cavitation with Seal Stress",
    failure_area: "Suction System",
    risk_level: "High",
    signals: [
      "Vibration increase at suction line",
      "Pressure drop below 1.5 bar",
      "Unusual rattling noise from pump housing"
    ]
  },
  generative_failure_twin: {
    asset_state: "Pump operating under unstable suction conditions",
    current_operational_condition:
      "Cavitation detected — vapor bubble collapse occurring near impeller",
    likely_internal_behavior:
      "Suction pressure fell below safe operating threshold causing bubble formation and collapse",
    operational_impact:
      "Continued operation may cause impeller damage, seal degradation, and emergency shutdown"
  },
  visual_analysis: {
    observed_indicators: [
      "Amber warning light flashing 3 times consecutively",
      "Pressure gauge reading below safe threshold",
      "Moisture visible around seal housing"
    ],
    visual_confidence: "High"
  },
  operational_confidence: "87%",
  confidence_drivers: [
    "Alarm P101 matched cavitation pattern in Pump Troubleshooting Guide",
    "Observation aligns with suction blockage symptoms",
    "Visual indicators confirm pressure drop and seal stress"
  ],
  safety_rules: [
    "Stop pump operation immediately before any inspection",
    "Close suction and discharge valves — do not open housing under pressure"
  ],
  step_by_step_workflow: [
    {
      step: 1,
      action: "Trip the motor and stop pump operation",
      safety_condition: "Ensure all personnel are clear before shutdown",
      estimated_minutes: 5,
      supervisor_required: false
    },
    {
      step: 2,
      action: "Close suction valve V-101 and discharge valve V-102",
      safety_condition: "Wear PPE — gloves and safety glasses required",
      estimated_minutes: 5,
      supervisor_required: false
    },
    {
      step: 3,
      action: "Release system pressure via pressure relief valve PRV-03",
      safety_condition: "Stand clear of pressure relief direction — HIGH PRESSURE",
      estimated_minutes: 10,
      supervisor_required: true
    },
    {
      step: 4,
      action: "Inspect suction strainer for blockages or debris",
      safety_condition: "Confirm pressure reads zero before opening strainer",
      estimated_minutes: 15,
      supervisor_required: false
    },
    {
      step: 5,
      action: "Verify inlet pressure at test point TP-01 with calibrated gauge",
      safety_condition: "Use Category IV rated instrument only",
      estimated_minutes: 10,
      supervisor_required: false
    },
    {
      step: 6,
      action: "Inspect mechanical seal assembly for leakage or damage",
      safety_condition: "Pump must be fully isolated and de-energised",
      estimated_minutes: 20,
      supervisor_required: true
    },
    {
      step: 7,
      action: "Restart pump gradually and monitor vibration and pressure stability",
      safety_condition: "All personnel clear of pump housing during restart",
      estimated_minutes: 15,
      supervisor_required: false
    }
  ],
  tools_and_parts: {
    tools: ["Calibrated pressure gauge (Cat IV)", "Torque wrench", "Hex key set"],
    parts_may_be_needed: ["Mechanical seal kit", "Suction strainer gasket"]
  },
  estimated_total_repair_minutes: 80,
  escalation_required: false,
  explainability: [
    "P101 alarm matched cavitation pattern in Pump Troubleshooting Guide",
    "Observation and visual indicators are consistent with suction blockage"
  ]
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function handleResponse(response, apiName) {
  const data = await response.json().catch(() => null);
  if (!response.ok) {
    console.error(`${apiName} failed:`, data);
    throw new Error(
      data?.message ||
        data?.detail?.[0]?.msg ||
        data?.detail ||
        `${apiName} failed`
    );
  }
  return data;
}

// ── API functions ─────────────────────────────────────────────────────────────

export async function createIncident(payload) {
  if (USE_MOCK) {
    await delay(400);
    return { session_id: "demo-session-001", status: "OPEN" };
  }

  const response = await fetch(`${API_BASE_URL}/incident`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      asset_id: payload.asset_id || "",
      location: payload.location || "",
      alarm_code: payload.alarm_code || "",
      observation:
        payload.observation || "Technician submitted field evidence for AI diagnosis."
    })
  });
  return await handleResponse(response, "Create Incident API");
}

async function uploadSingleMediaToS3(sessionId, file, mediaType) {
  if (!file) return null;

  const presignResponse = await fetch(`${API_BASE_URL}/generate-upload-url`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      session_id: sessionId,
      filename: file.name,
      content_type: file.type || "application/octet-stream",
      media_type: mediaType
    })
  });

  const presignData = await handleResponse(
    presignResponse,
    "Generate Upload URL API"
  );

  const uploadResponse = await fetch(presignData.upload_url, {
    method: "PUT",
    headers: {
      "Content-Type": file.type || "application/octet-stream"
    },
    body: file
  });

  if (!uploadResponse.ok) {
    throw new Error("Failed to upload file directly to S3");
  }

  return presignData;
}

export async function uploadMedia(sessionId, imageFile, videoFile, audioBlob) {
  if (USE_MOCK) {
    await delay(600);
    return { session_id: sessionId, media: [] };
  }

  const uploadedFiles = [];

  if (imageFile) {
    uploadedFiles.push(
      await uploadSingleMediaToS3(sessionId, imageFile, "image")
    );
  }

  if (videoFile) {
    uploadedFiles.push(
      await uploadSingleMediaToS3(sessionId, videoFile, "video")
    );
  }

  if (audioBlob) {
    const audioFile =
      audioBlob instanceof File
        ? audioBlob
        : new File([audioBlob], "voice-note.webm", { type: "audio/webm" });

    uploadedFiles.push(
      await uploadSingleMediaToS3(sessionId, audioFile, "audio")
    );
  }

  return {
    message: "Media uploaded directly to S3",
    session_id: sessionId,
    files: uploadedFiles.filter(Boolean)
  };
}

export async function diagnoseIncident(payload) {
  if (USE_MOCK) {
    await delay(2000); // simulate AI processing time
    return MOCK_DIAGNOSIS;
  }

  const response = await fetch(`${API_BASE_URL}/diagnose`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  return await handleResponse(response, "Diagnose API");
}

export async function submitFeedback(payload) {
  if (USE_MOCK) {
    await delay(400);
    return { session_id: payload.session_id, message: "Feedback saved." };
  }

  const response = await fetch(`${API_BASE_URL}/feedback`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  return await handleResponse(response, "Feedback API");
}
