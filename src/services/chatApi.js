const BASE = (import.meta.env.VITE_CHAT_API_URL || "").replace(/\/$/, "");

async function post(path, body) {
  if (!BASE) throw new Error("VITE_CHAT_API_URL is not set in .env.local");
  const res = await fetch(`${BASE}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => null);
  if (!res.ok) throw new Error(data?.message || data?.detail || `${path} failed (${res.status})`);
  return data;
}

export async function chatCreateSession({ asset_id = "", location = "", alarm_code = "" }) {
  return post("/session", { asset_id, location, alarm_code });
}

export async function chatUploadMedia(sessionId, imageFile, videoFile, audioBlob) {
  const s3Keys = [];

  const upload = async (file, defaultName) => {
    const f = file instanceof File
      ? file
      : new File([file], defaultName, { type: file.type || "application/octet-stream" });
    const { upload_url, s3_key } = await post("/generate-upload-url", {
      session_id:   sessionId,
      filename:     f.name,
      content_type: f.type || "application/octet-stream",
    });
    const s3 = await fetch(upload_url, {
      method: "PUT",
      headers: { "Content-Type": f.type || "application/octet-stream" },
      body: f,
    });
    if (!s3.ok) throw new Error(`S3 upload failed for ${f.name}`);
    s3Keys.push(s3_key);
  };

  if (imageFile) await upload(imageFile, imageFile.name || "image.jpg");
  if (videoFile) await upload(videoFile, videoFile.name || "video.mp4");
  if (audioBlob) await upload(audioBlob, "voice-note.webm");

  return s3Keys;
}

export async function chatDiagnose(sessionId, text, mediaKeys = []) {
  return post("/message", { session_id: sessionId, text, media_keys: mediaKeys });
}

export async function chatUploadFile(sessionId, file, defaultName = "upload") {
  const f = file instanceof File
    ? file
    : new File([file], defaultName, { type: file.type || "application/octet-stream" });
  const { upload_url, s3_key } = await post("/generate-upload-url", {
    session_id: sessionId, filename: f.name, content_type: f.type || "application/octet-stream",
  });
  const s3 = await fetch(upload_url, { method: "PUT", headers: { "Content-Type": f.type || "application/octet-stream" }, body: f });
  if (!s3.ok) throw new Error(`S3 upload failed for ${f.name}`);
  return s3_key;
}

export async function chatFollowUp(sessionId, question, mediaKeys = []) {
  return post("/message", { session_id: sessionId, text: question, media_keys: mediaKeys });
}

export async function chatTranscribeAudio(sessionId, s3Key) {
  const data = await post("/transcribe", { session_id: sessionId, s3_key: s3Key });
  return data.transcript || "";
}
