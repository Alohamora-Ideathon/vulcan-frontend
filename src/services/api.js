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

async function uploadSingleMediaToS3(sessionId, file, mediaType) {
  if (!file) return null;

  const presignResponse = await fetch(`${API_BASE_URL}/generate-upload-url`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
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
        : new File([audioBlob], "voice-note.webm", {
            type: "audio/webm"
          });

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