# Vulcan AI — Industrial Maintenance Copilot

AI-powered field tool for industrial technicians. Log a fault, attach evidence (photo / video / voice), and get a full diagnosis, step-by-step repair workflow, and guided Q&A — all grounded in your equipment manuals via a Bedrock Knowledge Base.

---

## Architecture Overview

```
Browser (React SPA)
      │
      │  HTTPS / JSON
      ▼
AWS API Gateway HTTP API  ──────────────────────────────────────────────────────────────┐
  POST /session                                                                          │
  POST /generate-upload-url                                                              │
  POST /message                                                                          │
  POST /transcribe                                                                       │
      │                                                                                  │
      ▼                                                                                  │
AWS Lambda  (vulcan-chat-engine, Python 3.11, 512 MB, 120 s)                           │
  ├── Main package : groq (Whisper client)                                              │
  └── Layer        : opencv-python-headless + Pillow (image resize + video frames)     │
      │                                                                                  │
      ├──► Amazon Bedrock  apac.amazon.nova-pro-v1:0   (LLM inference)                 │
      ├──► Amazon Bedrock Knowledge Base  LRI8L7JJTJ   (equipment manual RAG)          │
      ├──► Amazon DynamoDB  vulcan-chat-sessions        (conversation history)          │
      ├──► Amazon S3        vulcan-chat-zone            (uploaded media)                │
      └──► Groq API         whisper-large-v3-turbo      (audio transcription)           │
                                                                                        │
S3 presigned PUT URLs  ◄──────────────────────────────────────────────────────────────┘
(browser uploads media directly to S3 — never through the Lambda)
```

---

## Repository Layout

```
vulcan-frontend-v2/          React SPA (Vite)
  src/
    App.jsx                  Root — page state machine, handleAnalyze
    services/
      chatApi.js             All API calls (session, upload, diagnose, follow-up, transcribe)
    pages/revamp/
      Capture.jsx            Step 1 — Log Incident
      Analyze.jsx            Step 2 — Failure Analysis
      SafetyLock.jsx         Step 3 — Safety Lock
      Execute.jsx            Step 4 — Repair Workflow
      Close.jsx              Step 5 — Close Incident

vulcan_chat_engine/          AWS Lambda (Python)
  lambda_function.py         All backend logic (4 routes)
  deploy.ps1                 One-shot PowerShell deploy script
```

---

## User Flow (5 Steps)

### Step 1 — Capture (Log Incident)

The technician logs what they observe. Three evidence types are supported:

| Input | How it works |
|---|---|
| **Photo** | File picker → uploaded to S3 via presigned URL |
| **Video** | File picker → uploaded to S3 via presigned URL |
| **Voice Note** | MediaRecorder API records `audio/webm` in-browser → uploaded to S3 → transcribed by `/transcribe` before the AI call |

Asset metadata (Asset ID, Location, Alarm Code) is optional. The "Run Vulcan Analysis" button is enabled as soon as any one of: observation text, photo, video, or voice note is present.

**On submit (`handleAnalyze` in `App.jsx`):**
1. `POST /session` — creates a DynamoDB session, returns `session_id`
2. Photo + video uploaded to S3 via presigned URLs; S3 keys collected
3. If voice note present: uploaded to S3 → `POST /transcribe` → transcript appended to observation text
4. `POST /message` — sends observation text + S3 media keys → triggers full AI diagnosis

---

### Step 2 — Analyze (Failure Analysis)

Displays the structured diagnosis returned by the AI:

- **Failure Signature** — pattern name, failure area, risk level (Critical / High / Medium / Low)
- **AI Confidence** — 0–100% with progress bar
- **Signals Detected** — observed fault signals from the evidence
- **AI Visual Analysis** — what the AI saw in the image/video frames (hidden if no visual provided)
- **Generative Digital Twin** — asset state, current condition, root-cause mechanism, operational impact
- **Estimated Repair Time** — total minutes summed from all workflow steps
- **Tools & Parts** — tools required, parts that may be needed
- **Follow-up Q&A** — text input (with optional image/video attach) that calls `POST /message` for conversational answers against the same session

---

### Step 3 — Safety Lock

The AI returns a `safety_rules` array — mandatory isolation and PPE actions. Every rule must be individually ticked before the workflow unlocks. The "Enter Repair Workflow" button stays disabled until 100% confirmed.

---

### Step 4 — Execute (Repair Workflow)

Step-by-step repair guide driven by the AI's `step_by_step_workflow` array. Each step has:
- Action text
- Safety condition (PPE / pre-condition)
- Estimated minutes
- Supervisor-required flag

Features:
- Prev / Next navigation and dot progress indicator
- "Mark Complete — Next Step" advances through the list
- "View All Steps" accordion
- "Read Aloud" button uses browser Speech Synthesis API
- **Ask Vulcan panel** — right-side AI assistant for follow-up questions during repair:
  - Attach photo (file pick)
  - Attach video (file pick)
  - Voice note (MediaRecorder → `/transcribe` → text appended to question)
  - All non-audio media sent as S3 keys to `POST /message`

---

### Step 5 — Close (Close Incident)

- Estimated vs. actual repair time comparison with % saved
- Dropdown: "What was the actual fix?" (energy-sector options)
- Free-text notes field for feedback to future AI responses
- Submit logs the outcome and shows a confirmation screen with incident summary

---

## Backend — Lambda Routes

### `POST /session`
Creates a new DynamoDB session.

**Request:**
```json
{ "asset_id": "PUMP-101", "location": "Unit 4 Bay 3", "alarm_code": "P101" }
```
**Response:**
```json
{ "session_id": "uuid", "status": "OPEN" }
```

---

### `POST /generate-upload-url`
Returns a presigned S3 PUT URL. The browser uploads media directly to S3 using this URL — media never passes through the Lambda.

**Request:**
```json
{ "session_id": "uuid", "filename": "fault.jpg", "content_type": "image/jpeg" }
```
**Response:**
```json
{ "upload_url": "https://s3.amazonaws.com/...", "s3_key": "uuid/20240608120000_fault.jpg" }
```

---

### `POST /message`
Handles both first-turn diagnosis and follow-up Q&A for a session.

**Request:**
```json
{
  "session_id": "uuid",
  "text": "Pump making rattling noise, pressure low. Voice note: bearing wear visible on left shaft",
  "media_keys": ["uuid/20240608120000_fault.jpg", "uuid/20240608120001_video.mp4"]
}
```

**First turn — full diagnosis response:**
```json
{
  "session_id": "uuid",
  "failure_fingerprint": { "failure_pattern": "...", "failure_area": "...", "risk_level": "High", "signals": [...] },
  "generative_failure_twin": { "asset_state": "...", "current_operational_condition": "...", "likely_internal_behavior": "...", "operational_impact": "..." },
  "visual_analysis": { "observed_indicators": [...], "visual_confidence": "High" },
  "operational_confidence": "87%",
  "confidence_drivers": [...],
  "safety_rules": [...],
  "step_by_step_workflow": [{ "step": 1, "action": "...", "safety_condition": "...", "estimated_minutes": 10, "supervisor_required": false }, ...],
  "tools_and_parts": { "tools": [...], "parts_may_be_needed": [...] },
  "estimated_total_repair_minutes": 90,
  "escalation_required": false,
  "explainability": [...]
}
```

**Subsequent turns — follow-up Q&A response:**
```json
{ "session_id": "uuid", "answer": "Plain-text answer, max 120 words" }
```

**Media processing inside Lambda (`_load_media`):**
- S3 key fetched; Content-Type header + file extension used to classify
- `audio/*` → skipped (audio handled by `/transcribe` before this call)
- `video/*` or `.mp4 / .mov / .avi / .webm / .mkv` → `_video_frames()` via OpenCV layer: samples 3 frames (seek-based for MP4; sequential fallback for WebM where frame count = 0)
- Everything else → `_img_frame()` via Pillow: resized to max 640 px wide, JPEG 80%
- Up to 3 frames total passed to Bedrock as inline image content

---

### `POST /transcribe`
Transcribes an already-uploaded audio file using Groq Whisper. Called by the frontend before `/message` so the transcript can be injected into the observation text. Runs in its own 29-second API Gateway window, well within Whisper's ~2–3 s response time.

**Request:**
```json
{ "session_id": "uuid", "s3_key": "uuid/20240608120002_voice-note.webm" }
```
**Response:**
```json
{ "transcript": "Bearing wear is visible on the left shaft coupling" }
```

---

## AI Design

**Model:** `apac.amazon.nova-pro-v1:0` (Amazon Bedrock)

**Knowledge Base:** `LRI8L7JJTJ` — equipment manuals and SOPs indexed in Bedrock. Retrieved with 3 top chunks per query using vector search.

**Diagnosis prompt behaviour:**
- All answers grounded in retrieved manual context only
- If retrieved context is insufficient: returns `INSUFFICIENT_MANUAL_EVIDENCE` fallback
- Visual evidence: AI reads ALL visible indicators (meters, gauges, LEDs) and cross-references against manual healthy ranges — healthy readings produce Low risk, not a false fault
- `step_by_step_workflow` steps 1–2 are always safety isolation / lockout steps
- `estimated_total_repair_minutes` is the sum of all step `estimated_minutes`

**Follow-up prompt:** Plain-text only (no JSON), max 120 words, safety-first when safety is involved.

---

## Infrastructure (deployed by `deploy.ps1`)

| Resource | Name | Purpose |
|---|---|---|
| S3 Bucket | `vulcan-chat-zone` | Media uploads + deployment zips |
| DynamoDB Table | `vulcan-chat-sessions` | Session + conversation history (PK: `session_id`) |
| Lambda Function | `vulcan-chat-engine` | All backend logic (Python 3.11, 512 MB, 120 s) |
| Lambda Layer | `vulcan-opencv` | `opencv-python-headless` + `Pillow` (manylinux Linux wheels) |
| API Gateway | HTTP API `i64pybx6j7` | Routes: `/session`, `/generate-upload-url`, `/message`, `/transcribe` |
| IAM Role | `vulcan-lambda-execution-role` | S3, DynamoDB, Bedrock, CloudWatch permissions |

**Deploy command:**
```powershell
cd C:\Users\DasariUdayKiran\Projects\vulcan_chat_engine
.\deploy.ps1
```

The script builds two separate packages:
- **Main package** (`groq` only, ~25 MB) — Lambda function code
- **Layer** (`opencv-python-headless + Pillow`, ~150 MB) — installed as `vulcan-opencv` Lambda Layer

Both use `--platform manylinux2014_x86_64 --python-version 311 --only-binary=:all:` to produce Linux-compatible wheels when building from Windows. Total combined size stays well under the 250 MB Lambda limit.

After deploy, add the Function URL to the frontend:

```
# vulcan-frontend-v2/.env.local
VITE_CHAT_API_URL=https://<function-url>.lambda-url.ap-south-1.on.aws
VITE_USE_MOCK=false
```

---

## Environment Variables (Lambda)

| Variable | Value | Purpose |
|---|---|---|
| `KB_ID` | `LRI8L7JJTJ` | Bedrock Knowledge Base ID |
| `MODEL_ID` | `apac.amazon.nova-pro-v1:0` | Bedrock model |
| `S3_BUCKET` | `vulcan-chat-zone` | Media bucket |
| `TABLE_NAME` | `vulcan-chat-sessions` | DynamoDB table |
| `GROQ_API_KEY` | `gsk_...` | Groq API key for Whisper transcription |

---

## Key Design Decisions

**Why a separate `/transcribe` route?**
API Gateway HTTP API has a hard 29-second integration timeout that cannot be extended. Audio transcription + AI diagnosis in a single call risks exceeding this. Separating them gives each its own 29-second window. Groq Whisper returns in ~2–3 seconds, leaving plenty of headroom.

**Why a Lambda Layer for OpenCV?**
Lambda's combined function-code + layers unzipped limit is 250 MB. OpenCV (~100 MB) + numpy (~35 MB) cannot fit in the main deployment package alongside other dependencies. A Layer has a separate 250 MB quota and is counted separately in the combined total, allowing both to coexist.

**Why `audio/webm` detection uses Content-Type, not extension?**
Voice notes (audio) and browser-recorded videos both use the `.webm` extension. The S3 object's `Content-Type` header is the only reliable way to distinguish them: `"audio" in content_type` → skip to `/transcribe`; `"video" in content_type` → extract frames.

**Why sequential frame reading for WebM?**
`cv2.CAP_PROP_FRAME_COUNT` returns 0 for WebM containers because the format does not store frame count in its header. Seek-based sampling (`cap.set(POS_FRAMES, n)`) then lands on frame 0 every time. The fallback reads sequentially, taking one frame every 50, to get evenly-spread samples.
