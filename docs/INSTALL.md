# FogVision AI — Installation Guide

## Prerequisites

| Tool | Version | Notes |
|------|---------|-------|
| Python | **3.11 or 3.12** | PyTorch/Ultralytics have **no wheels for 3.13/3.14** yet |
| Node.js | 18+ (20/22/24 fine) | for the Next.js frontend |
| ffmpeg | optional | improves video codec support for output MP4 |

> **macOS / Apple Silicon:** there is no NVIDIA GPU, so inference runs on the
> **MPS** (Metal) backend or CPU — auto-detected. `brew install python@3.12 ffmpeg`.

---

## 1. Backend

```bash
cd backend
./setup.sh          # creates .venv (py3.11/3.12), installs deps, downloads weights
source .venv/bin/activate
uvicorn app.main:app --reload
```

The API is now at **http://localhost:8000** (Swagger UI at `/docs`).

Manual install (if you prefer not to use the script):

```bash
cd backend
python3.12 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
uvicorn app.main:app --reload
```

Weights (`yolov8n.pt`) are auto-downloaded by Ultralytics on first run if not
already present in `models/`.

---

## 2. Frontend

```bash
cd frontend
npm install
cp .env.example .env.local   # NEXT_PUBLIC_API_URL=http://localhost:8000
npm run dev
```

Open **http://localhost:3000**.

---

## 3. Configuration

Edit `backend/.env` to change the model, confidence, device, or enhancement
defaults. Key options:

```env
MODEL_NAME=yolov8n.pt   # or yolov8s.pt / yolov8m.pt
CONFIDENCE=0.4
DEVICE=auto             # auto | cpu | cuda | mps
MAX_FRAMES=0            # >0 to cap frames for quick demos
```

---

## Troubleshooting

- **`No module named torch` / install fails** — you're on Python 3.13/3.14. Use
  3.11 or 3.12 (`brew install python@3.12`) and re-run `setup.sh`.
- **Output video won't play in the browser** — install `ffmpeg` so the `avc1`
  (H.264) codec is available; without it OpenCV may fall back to `mp4v`, which
  some browsers can't decode.
- **Slow processing** — use `yolov8n.pt`, lower the input resolution, or set
  `MAX_FRAMES` for demos. On Apple Silicon ensure `DEVICE=auto` (uses MPS).
- **CORS errors** — add your frontend origin to `CORS_ORIGINS` in `backend/.env`.
