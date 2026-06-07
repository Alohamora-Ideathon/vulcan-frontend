const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  "https://7t8e4pu586.execute-api.ap-south-1.amazonaws.com";

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

export async function createIncident(payload) {
  const response = await fetch(`${API_BASE_URL}/incident`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      asset_id: payload.asset_id || "",
      location: payload.location || "",
      alarm_code: payload.alarm_code || "",
      observation:
        payload.observation ||
        "Technician submitted field evidence for AI diagnosis."
    })
  });

  return await handleResponse(response, "Create Incident API");
}

export async function uploadMedia(sessionId, imageFile, videoFile, audioBlob) {
  const formData = new FormData();

  formData.append("session_id", sessionId);

  if (imageFile) {
    formData.append("image", imageFile);
  }

  if (videoFile) {
    formData.append("video", videoFile);
  }

  if (audioBlob) {
    const audioFile =
      audioBlob instanceof File
        ? audioBlob
        : new File([audioBlob], "technician-voice-note.webm", {
            type: "audio/webm"
          });

    formData.append("audio", audioFile);
  }

  const response = await fetch(`${API_BASE_URL}/upload-media`, {
    method: "POST",
    body: formData
  });

  return await handleResponse(response, "Upload Media API");
}

export async function diagnoseIncident(payload) {
  const response = await fetch(`${API_BASE_URL}/diagnose`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  return await handleResponse(response, "Diagnose API");
}

export async function submitFeedback(payload) {
  const response = await fetch(`${API_BASE_URL}/feedback`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  return await handleResponse(response, "Feedback API");
}