# FogVision AI — Design Spec

**Date:** 2026-06-09
**Status:** Approved

## Overview

FogVision AI is a computer-vision platform that detects vehicles (car, truck, bus,
motorcycle) in dense foggy video footage. A user uploads a video; the backend
enhances visibility, runs YOLOv8 detection with ByteTrack tracking, renders an
annotated MP4, and returns analytics. The frontend is a premium dark-theme
Next.js app (landing → upload → processing → results).

## Environment constraints (target machine)

- Apple M1 (no CUDA). Device auto-detect order: `cuda → mps → cpu`.
- Host has Python 3.14 (no torch wheels). Backend requires **Python 3.11 or 3.12**
  in a venv created by `setup.sh`.
- Throughput target "10–20 FPS on consumer GPU" does not apply literally on M1;
  README documents realistic CPU/MPS expectations.

## Decisions

- **Runtime:** Deliver complete code + `setup.sh` (venv, deps, weight download).
- **Job store:** File-based JSON persistence under `backend/data/jobs/` so history
  survives restarts. Background work via `ThreadPoolExecutor`.
- **Build mode:** Everything in one pass.

## Architecture

```
backend/
  app/
    main.py            FastAPI app, CORS, routers, static mounts
    config.py          pydantic-settings (model, conf, paths, device, classes)
    api/routes.py      /upload /process /status /results /download
    core/
      job_manager.py   ThreadPoolExecutor + JSON-file persistence + history
      device.py        cuda→mps→cpu detection
      logging.py       structured logging setup
    pipeline/
      enhancement.py   CLAHE, gamma, hist-eq, optional sharpen (modular)
      detector.py      YOLOv8 + ByteTrack, COCO class filter
      annotator.py     boxes, confidence, track id, label styling
      processor.py     orchestration: extract→enhance→detect→track→write→analytics
    models/schemas.py  Pydantic request/response models
  requirements.txt
  setup.sh
  .env.example
frontend/              Next.js 15 App Router, TS, Tailwind, Framer Motion, Recharts
docs/                  ARCHITECTURE.md, API.md, INSTALL.md
models/ uploads/ outputs/   runtime dirs (.gitkeep)
README.md
```

## AI pipeline (per job)

1. OpenCV reads frames; capture metadata (fps, total frames, w/h, duration).
2. `enhancement.py` applies modular, toggleable steps: CLAHE → gamma → histogram
   equalization → optional unsharp-mask sharpen. One before/after sample pair saved.
3. YOLOv8 (`yolov8n.pt`, swappable via env `MODEL_NAME`), conf threshold `0.4`,
   `tracker="bytetrack.yaml"`, `persist=True` across frames.
4. Filter to COCO ids `{2: car, 3: motorcycle, 5: bus, 7: truck}`.
5. `annotator.py` draws boxes + `"{label} #{id} {conf:.2f}"`.
6. Write annotated MP4 (`mp4v`, fallback `avc1`).
7. Analytics: unique vehicles per class (by track id), total, average confidence,
   processing time (s), FPS processed (frames / processing time), per-frame timeline
   counts, confidence distribution.

Progress (`current_frame`, `total_frames`, `eta_seconds`, `status`) written to the
job JSON each frame for polling.

## API contract

- `POST /upload` — multipart `file`; validates extension (mp4/mov/avi) and opens
  with OpenCV (rejects corrupt). Returns `{job_id, filename, size_bytes, duration_s,
  fps, frame_count, width, height, thumbnail (data URL)}`.
- `POST /process/{job_id}` — optional JSON body of enhancement/model overrides;
  submits to thread pool; returns `{job_id, status: "processing"}`.
- `GET /status/{job_id}` — `{job_id, status, progress (0..1), current_frame,
  total_frames, eta_seconds, error?}`.
- `GET /results/{job_id}` — `{job_id, status, analytics, timeline[], confidence_hist[],
  before_after: {original, enhanced} (data URLs), original_url, processed_url}`.
- `GET /download/{job_id}` — streams processed MP4 as attachment.
- `GET /history` — list of completed jobs (bonus; backs local history view).

Status values: `queued | processing | completed | failed`.

## Frontend

- Theme tokens: bg `#050816`, card `#0F172A`, primary `#3B82F6`, accent `#06B6D4`,
  success `#10B981`; glassmorphism, rounded-2xl, soft shadows, Framer Motion.
- Landing `/`: hero (title/subtitle/description, Upload + View Demo CTAs), animated
  AI particles + vehicle visualization, gradient backdrop, feature highlights.
- Workflow `/app`: dropzone (drag-drop, thumbnail, size, duration) → processing view
  (progress bar, frame counter, ETA, animation) → results (original vs processed
  players side-by-side; Recharts dashboard: class counts bar, confidence chart,
  vehicle timeline area; metric cards; frame-by-frame viewer; before/after slider;
  download button).
- History page/section via `localStorage` + backend `/history`.

## Error handling & logging

- Invalid/corrupt/unreadable video → HTTP 400 with clear message.
- Missing model weights → job fails with actionable error string in job record.
- All pipeline stages logged via `core/logging.py`. Graceful CPU/MPS fallback.

## Out of scope

No auth, no database, no cloud, no real-time streaming input. Single-machine local.
