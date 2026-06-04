const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

async function handleResponse(response, apiName) {
  const data = await response.json().catch(() => null);

  if (!response.ok) {
    console.error(`${apiName} failed:`, data);
    throw new Error(data?.message || `${apiName} failed`);
  }

  return data;
}

export async function createIncident(payload) {
  const response = await fetch(`${API_BASE_URL}/incident`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  return await handleResponse(response, "Create Incident API");
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

export async function uploadMedia(sessionId, imageFile, videoFile) {
  const formData = new FormData();

  formData.append("session_id", sessionId);

  if (imageFile) {
    formData.append("image", imageFile);
  }

  if (videoFile) {
    formData.append("video", videoFile);
  }

  const response = await fetch(`${API_BASE_URL}/upload-media`, {
    method: "POST",
    body: formData
  });

  return await handleResponse(response, "Upload Media API");
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