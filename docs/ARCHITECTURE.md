# FogVision AI — Architecture

## High-level flow

```
┌─────────────┐     upload      ┌──────────────────────────────────────────┐
│             │ ───────────────▶│              FastAPI backend               │
│  Next.js    │                 │                                            │
│  frontend   │  poll /status   │  ┌────────────┐   ┌─────────────────────┐ │
│  (Browser)  │ ◀──────────────▶│  │ JobManager │──▶│  ThreadPoolExecutor │ │
│             │                 │  │ (JSON store)│   └──────────┬──────────┘ │
│             │  /results       │  └────────────┘              │            │
│             │ ◀───────────────│                              ▼            │
│             │                 │              ┌──────────────────────────┐ │
│             │  /download      │              │      Processing pipeline  │ │
│             │ ◀───────────────│              │  extract→enhance→detect   │ │
└─────────────┘                 │              │  →track→annotate→encode   │ │
                                │              └──────────────────────────┘ │
                                └──────────────────────────────────────────┘
```

## Backend modules

| Module | Responsibility |
|--------|----------------|
| `app/main.py` | FastAPI app, CORS, static media mounts, lifespan |
| `app/config.py` | Env-driven settings, vehicle class map, path management |
| `app/api/routes.py` | HTTP endpoints (upload/process/status/results/download/history) |
| `app/core/job_manager.py` | Job lifecycle, JSON persistence, thread-pool dispatch, history |
| `app/core/device.py` | Compute-device auto-detection (`cuda → mps → cpu`) |
| `app/core/logging.py` | Centralised logging configuration |
| `app/pipeline/enhancement.py` | Modular fog enhancement (CLAHE, gamma, hist-eq, sharpen) |
| `app/pipeline/detector.py` | YOLOv8 + ByteTrack, vehicle-class filtering |
| `app/pipeline/annotator.py` | Bounding-box / label rendering |
| `app/pipeline/processor.py` | Orchestrates the per-frame pipeline + analytics |
| `app/models/schemas.py` | Pydantic request/response contracts |

## Processing pipeline (per frame)

1. **Extract** — OpenCV `VideoCapture` streams frames one at a time (constant memory).
2. **Enhance** — `FogEnhancer` composes enabled steps in order:
   `CLAHE → gamma → histogram equalisation → unsharp sharpening`.
3. **Detect + Track** — `VehicleDetector` runs `YOLO.track(persist=True,
   tracker="bytetrack.yaml")` and filters to COCO ids `{2,3,5,7}`
   (car, motorcycle, bus, truck).
4. **Annotate** — boxes + `"{label} #{id} {conf:.2f}"` chips, per-class colours.
5. **Encode** — frames written to an MP4 via `cv2.VideoWriter`
   (codec fallback: `avc1 → mp4v → H264 → XVID`).
6. **Analyse** — unique vehicles per class (by track id), average confidence,
   processing time, FPS, per-frame timeline, confidence histogram.

## Concurrency & persistence

- Each job is processed on a `ThreadPoolExecutor` worker, so HTTP requests never
  block. Progress is written to `backend/data/jobs/<job_id>.json` every few frames.
- That JSON file is the single source of truth and **doubles as local history**,
  surviving backend restarts. No database is used.

## Device strategy

`resolve_device("auto")` selects the best backend in order **cuda → mps → cpu**.
Any unavailable explicit choice falls back to CPU with a warning, so the pipeline
always runs. On Apple Silicon this resolves to **mps**.
```
```
