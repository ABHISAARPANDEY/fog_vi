#!/usr/bin/env bash
# FogVision AI — backend setup.
# Creates a Python 3.11/3.12 virtualenv, installs dependencies and pre-downloads
# the YOLOv8 weights so the first request is fast.
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
cd "${SCRIPT_DIR}"

echo "==> FogVision AI backend setup"

# --- Locate a compatible Python (3.11 or 3.12) -----------------------------
PYTHON_BIN=""
for candidate in python3.12 python3.11; do
  if command -v "${candidate}" >/dev/null 2>&1; then
    PYTHON_BIN="${candidate}"
    break
  fi
done

if [ -z "${PYTHON_BIN}" ]; then
  cat <<'EOF'
ERROR: Python 3.11 or 3.12 is required (PyTorch/Ultralytics do not ship wheels
for Python 3.13/3.14 yet). Install one, e.g. on macOS:

    brew install python@3.12

then re-run this script.
EOF
  exit 1
fi

echo "==> Using ${PYTHON_BIN} ($(${PYTHON_BIN} --version))"

# --- Virtual environment ---------------------------------------------------
if [ ! -d ".venv" ]; then
  "${PYTHON_BIN}" -m venv .venv
fi
# shellcheck disable=SC1091
source .venv/bin/activate

python -m pip install --upgrade pip wheel >/dev/null
echo "==> Installing dependencies (this may take a few minutes)..."
pip install -r requirements.txt

# --- Pre-download model weights into models/ -------------------------------
MODEL_NAME="${MODEL_NAME:-yolov8n.pt}"
echo "==> Downloading model weights: ${MODEL_NAME}"
python - "${MODEL_NAME}" "${REPO_ROOT}/models" <<'PYEOF'
import shutil
import sys
from pathlib import Path
from ultralytics import YOLO

model_name, models_dir = sys.argv[1], Path(sys.argv[2])
models_dir.mkdir(parents=True, exist_ok=True)
# Triggers Ultralytics' auto-download into the cache, then copy into models/.
m = YOLO(model_name)
src = Path(getattr(m, "ckpt_path", "") or model_name)
dst = models_dir / model_name
if src.exists() and src.resolve() != dst.resolve():
    shutil.copy(src, dst)
print(f"Weights ready at: {dst if dst.exists() else src}")
PYEOF

# --- .env ------------------------------------------------------------------
if [ ! -f ".env" ]; then
  cp .env.example .env
  echo "==> Created backend/.env from .env.example"
fi

echo ""
echo "==> Setup complete. Start the backend with:"
echo "      cd backend && source .venv/bin/activate && uvicorn app.main:app --reload"
