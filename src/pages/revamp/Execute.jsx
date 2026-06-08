import React, { useRef, useState } from "react";
import { chatFollowUp, chatUploadFile, chatTranscribeAudio } from "../../services/chatApi.js";

export default function Execute({ result, onFinish, onBack }) {
  const steps = result?.step_by_step_workflow || [];

  // Step execution state
  const [current,   setCurrent]   = useState(0);
  const [completed, setCompleted] = useState([]);
  const [showAll,   setShowAll]   = useState(false);

  // AI chat state
  const [thread,        setThread]        = useState([]);
  const [followInput,   setFollowInput]   = useState("");
  const [followLoading, setFollowLoading] = useState(false);
  const [pendingFiles,  setPendingFiles]  = useState([]); // [{ file, name, mediaType }]
  const [recording,     setRecording]     = useState(false);
  const recorderRef  = useRef(null);
  const chunksRef    = useRef([]);
  const threadEndRef = useRef(null);

  const step     = steps[current] || {};
  const action   = typeof step === "object" ? step.action : step;
  const safety   = step?.safety_condition;
  const mins     = step?.estimated_minutes;
  const superReq = step?.supervisor_required;
  const isDone   = completed.includes(current);
  const allDone  = completed.length === steps.length;

  const markComplete = () => {
    if (!completed.includes(current)) setCompleted(prev => [...prev, current]);
    if (current < steps.length - 1) setCurrent(current + 1);
  };

  const speak = () => {
    const txt = [
      `Step ${current + 1} of ${steps.length}.`,
      action,
      safety   ? `Safety note: ${safety}` : "",
      superReq ? "Supervisor sign-off required for this step." : "",
    ].filter(Boolean).join(" ");
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(Object.assign(new SpeechSynthesisUtterance(txt), { rate: 0.9 }));
  };

  // Media staging
  const addPendingFile = (file, mediaType) => {
    setPendingFiles(prev => [...prev, { file, name: file.name || `${mediaType}`, mediaType }]);
  };

  const handleImagePick = e => {
    const f = e.target.files[0];
    if (f) addPendingFile(f, "image");
    e.target.value = "";
  };

  const handleVideoPick = e => {
    const f = e.target.files[0];
    if (f) addPendingFile(f, "video");
    e.target.value = "";
  };

  const startRec = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const rec    = new MediaRecorder(stream);
      recorderRef.current = rec;
      chunksRef.current   = [];
      rec.ondataavailable = e => { if (e.data.size > 0) chunksRef.current.push(e.data); };
      rec.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        const f    = new File([blob], "voice-note.webm", { type: "audio/webm" });
        addPendingFile(f, "audio");
        stream.getTracks().forEach(t => t.stop());
      };
      rec.start();
      setRecording(true);
    } catch { alert("Allow microphone access to record."); }
  };

  const stopRec = () => { recorderRef.current?.stop(); setRecording(false); };

  const removePending = idx => setPendingFiles(prev => prev.filter((_, i) => i !== idx));

  // Send follow-up
  const handleFollowUp = async () => {
    const q = followInput.trim();
    if (!q && pendingFiles.length === 0) return;

    const userMsg = {
      role: "user",
      text: q,
      files: pendingFiles.map(p => ({ name: p.name, mediaType: p.mediaType })),
    };
    setThread(t => [...t, userMsg]);
    setFollowInput("");
    const staged = [...pendingFiles];
    setPendingFiles([]);
    setFollowLoading(true);
    setTimeout(() => threadEndRef.current?.scrollIntoView({ behavior: "smooth" }), 50);

    try {
      const sessionId  = result?.session_id;
      const audioFiles = staged.filter(p => p.mediaType === "audio");
      const mediaFiles = staged.filter(p => p.mediaType !== "audio");

      // Upload image/video files
      const s3Keys = await Promise.all(
        mediaFiles.map(p => chatUploadFile(sessionId, p.file, p.name))
      );

      // Upload audio → transcribe via /transcribe → append as text
      let questionText = q;
      for (const audio of audioFiles) {
        const audioKey   = await chatUploadFile(sessionId, audio.file, audio.name);
        const transcript = await chatTranscribeAudio(sessionId, audioKey);
        if (transcript) {
          questionText = questionText
            ? `${questionText}\nVoice note: ${transcript}`
            : transcript;
        }
      }

      const res = await chatFollowUp(sessionId, questionText || "[see attached media]", s3Keys);
      setThread(t => [...t, { role: "ai", text: res.answer }]);
    } catch {
      setThread(t => [...t, { role: "ai", text: "Unable to answer right now. Refer to the step details." }]);
    } finally {
      setFollowLoading(false);
      setTimeout(() => threadEndRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
    }
  };

  const handleFollowKey = e => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleFollowUp(); }
  };

  const mediaIcon = t => t === "video" ? "🎥" : t === "audio" ? "🎙️" : "📷";

  return (
    <div className="r-page">
      <div className="r-execute-split">

        {/* ── LEFT: Step execution ─────────────────────────────────── */}
        <div className="r-execute-steps">

          {/* Nav bar */}
          <div className="r-step-nav-bar">
            <button className="r-btn r-btn-ghost" style={{ padding: "8px 14px", minHeight: 0 }}
              onClick={() => current > 0 && setCurrent(current - 1)} disabled={current === 0}>
              ‹ Prev
            </button>

            <div style={{ textAlign: "center" }}>
              <div className="r-step-counter">STEP {current + 1} / {steps.length}</div>
              <div className="r-step-dots" style={{ justifyContent: "center", marginTop: 6 }}>
                {steps.map((_, i) => (
                  <div key={i}
                    className={`r-dot ${completed.includes(i) ? "done" : i === current ? "active" : ""}`}
                    onClick={() => setCurrent(i)}
                    style={{ cursor: "pointer" }} />
                ))}
              </div>
            </div>

            <button className="r-btn r-btn-ghost" style={{ padding: "8px 14px", minHeight: 0 }}
              onClick={() => current < steps.length - 1 && setCurrent(current + 1)}
              disabled={current === steps.length - 1}>
              Next ›
            </button>
          </div>

          {/* Progress bar */}
          <div className="r-progress-track" style={{ marginBottom: 24 }}>
            <div className="r-progress-fill safe"
              style={{ width: `${(completed.length / steps.length) * 100}%` }} />
          </div>

          {/* Step card */}
          <div className="r-step-execute">
            <span className="r-step-num-big">{current + 1}</span>

            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {superReq && <span className="r-badge r-badge-super">👤 Supervisor Required</span>}
              {isDone   && <span className="r-badge r-badge-safe">✓ Complete</span>}
            </div>

            <p className="r-step-action">{action}</p>

            {safety && (
              <div className="r-step-safety-box">
                <span>⚠️</span>
                <span>{safety}</span>
              </div>
            )}

            <div className="r-step-meta">
              {mins && <span className="r-step-time">⏱ ~{mins} min</span>}
              <button className="r-voice-btn" onClick={speak}>🔊 Read Aloud</button>
            </div>
          </div>

          {/* Mark complete */}
          {!allDone && (
            <button
              className="r-btn r-btn-primary r-btn-full r-btn-lg"
              style={{ marginTop: 16 }}
              onClick={markComplete}
              disabled={isDone}
            >
              {isDone ? "✓ Step Complete" : current === steps.length - 1
                ? "✓ Complete Final Step"
                : "✓ Mark Complete — Next Step"}
            </button>
          )}

          {allDone && (
            <button
              className="r-btn r-btn-full r-btn-lg"
              style={{ marginTop: 16, background: "var(--safe)", color: "#fff", border: "none" }}
              onClick={onFinish}
            >
              ✓ All Steps Done — Close Incident →
            </button>
          )}

          {/* Show all steps toggle */}
          <button className="r-btn r-btn-ghost r-btn-full"
            style={{ marginTop: 10, fontSize: 13 }}
            onClick={() => setShowAll(v => !v)}>
            {showAll ? "▲ Hide All Steps" : "▼ View All Steps"}
          </button>

          {showAll && (
            <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 8 }}>
              {steps.map((s, i) => {
                const a    = typeof s === "object" ? s.action : s;
                const done = completed.includes(i);
                const act  = i === current;
                return (
                  <div key={i}
                    onClick={() => setCurrent(i)}
                    style={{
                      display: "flex", gap: 12, alignItems: "flex-start",
                      padding: "12px 14px", borderRadius: 10, cursor: "pointer",
                      background: act ? "var(--accent-dim)" : done ? "rgba(16,185,129,0.06)" : "var(--surface)",
                      border: `1px solid ${act ? "var(--accent-glow)" : done ? "rgba(16,185,129,0.2)" : "var(--border)"}`,
                      opacity: (!done && !act && i > completed.length) ? 0.5 : 1,
                    }}>
                    <span style={{
                      width: 24, height: 24, borderRadius: "50%", flexShrink: 0,
                      background: done ? "var(--safe)" : act ? "var(--accent)" : "var(--text-dim)",
                      display: "grid", placeItems: "center", fontSize: 11, fontWeight: 900, color: "#fff",
                    }}>
                      {done ? "✓" : i + 1}
                    </span>
                    <div>
                      <p style={{ fontSize: 13, fontWeight: 600 }}>{a}</p>
                      {s?.estimated_minutes && (
                        <p style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>
                          ⏱ ~{s.estimated_minutes} min
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div className="r-actions">
            <button className="r-btn r-btn-ghost" onClick={onBack}>← Back</button>
          </div>
        </div>

        {/* ── RIGHT: Ask Vulcan AI panel ───────────────────────────── */}
        <div className="r-execute-ai-panel">
          <div className="r-execute-ai-header">
            <span style={{ color: "var(--accent)" }}>⚡</span> Ask Vulcan
            <span style={{ fontWeight: 400, color: "var(--text-muted)", marginLeft: 6, fontSize: 11 }}>
              Show AI what you're seeing
            </span>
          </div>

          {/* Thread */}
          <div className="r-execute-ai-thread">
            {thread.length === 0 && (
              <p style={{ color: "var(--text-dim)", fontSize: 12, textAlign: "center", marginTop: 16 }}>
                Stuck on a step? Ask Vulcan — attach a photo, video or voice note to show what you're seeing.
              </p>
            )}
            {thread.map((m, i) => (
              <div key={i} className={m.role === "user" ? "r-followup-q" : "r-followup-a"}>
                {m.role === "ai" && <span className="r-followup-label">Vulcan AI</span>}
                {m.text && <span>{m.text}</span>}
                {m.files?.length > 0 && (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginTop: m.text ? 6 : 0 }}>
                    {m.files.map((f, fi) => (
                      <span key={fi} className="r-attach-chip" style={{ fontSize: 11 }}>
                        {mediaIcon(f.mediaType)} {f.name}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
            {followLoading && (
              <div className="r-followup-a">
                <span className="r-followup-label">Vulcan AI</span>
                <span className="r-followup-typing"><span /><span /><span /></span>
              </div>
            )}
            <div ref={threadEndRef} />
          </div>

          {/* Pending file chips */}
          {pendingFiles.length > 0 && (
            <div className="r-pending-bar" style={{ borderTop: "1px solid var(--border)", flexWrap: "wrap" }}>
              {pendingFiles.map((p, i) => (
                <span key={i} className="r-pending-chip">
                  {mediaIcon(p.mediaType)} {p.name}
                  <button className="r-pending-remove" onClick={() => removePending(i)}>×</button>
                </span>
              ))}
            </div>
          )}

          {/* Input bar */}
          <div className="r-execute-ai-input">
            {/* Media attach icons */}
            <div style={{ display: "flex", gap: 2, marginBottom: 8 }}>
              <label className="r-attach-btn" title="Attach photo">
                <input type="file" accept="image/*" style={{ display: "none" }} onChange={handleImagePick} />
                📷
              </label>
              <label className="r-attach-btn" title="Attach video">
                <input type="file" accept="video/*" style={{ display: "none" }} onChange={handleVideoPick} />
                🎥
              </label>
              <button
                className="r-attach-btn"
                title={recording ? "Stop recording" : "Voice note"}
                onClick={recording ? stopRec : startRec}
                style={{ color: recording ? "var(--risk-high)" : undefined }}
              >
                {recording ? "⏹" : "🎙️"}
              </button>
            </div>

            <div style={{ display: "flex", gap: 8 }}>
              <input
                className="r-followup-input"
                placeholder='e.g. "What if I see sparks?" or attach a photo'
                value={followInput}
                onChange={e => setFollowInput(e.target.value)}
                onKeyDown={handleFollowKey}
                disabled={followLoading}
              />
              <button
                className="r-btn r-btn-ghost"
                disabled={(!followInput.trim() && pendingFiles.length === 0) || followLoading}
                onClick={handleFollowUp}
                style={{ whiteSpace: "nowrap", flexShrink: 0 }}
              >
                Ask →
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
