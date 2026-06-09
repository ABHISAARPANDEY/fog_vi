"""YOLOv8 + ByteTrack vehicle detector.

Wraps Ultralytics' tracking API and filters results down to the four vehicle
classes we care about. The model is loaded lazily and cached per (model_name)
so repeated jobs reuse the same weights.
"""

from __future__ import annotations

from functools import lru_cache
from pathlib import Path

import numpy as np

from app.config import VEHICLE_CLASSES, get_settings
from app.core.device import resolve_device
from app.core.logging import get_logger
from app.pipeline.annotator import Detection, classify_risk

logger = get_logger(__name__)


class ModelLoadError(RuntimeError):
    """Raised when the YOLO weights cannot be found or loaded."""


@lru_cache
def _load_model(model_name: str):
    """Load (and cache) an Ultralytics YOLO model.

    Ultralytics auto-downloads official weights (e.g. yolov8n.pt) on first use.
    We also accept a path inside the ``models/`` directory.
    """
    try:
        from ultralytics import YOLO
    except ImportError as exc:  # pragma: no cover - dependency guard
        raise ModelLoadError(
            "ultralytics is not installed. Run backend/setup.sh first."
        ) from exc

    settings = get_settings()
    local_path = settings.models_dir / model_name
    target = str(local_path) if local_path.exists() else model_name
    try:
        model = YOLO(target)
    except Exception as exc:  # noqa: BLE001 - surface a clear, actionable error
        raise ModelLoadError(
            f"Failed to load YOLO model '{model_name}': {exc}. "
            "Ensure the weights exist in models/ or that the name is a valid "
            "Ultralytics checkpoint (yolov8n.pt / yolov8s.pt / yolov8m.pt)."
        ) from exc
    logger.info("Loaded YOLO model: %s", target)
    return model


class VehicleDetector:
    """Stateful per-job detector that streams frames through YOLO + ByteTrack."""

    def __init__(
        self,
        model_name: str | None = None,
        conf: float | None = None,
        device: str | None = None,
    ):
        settings = get_settings()
        self.model_name = model_name or settings.model_name
        self.conf = conf if conf is not None else settings.confidence
        self.iou = settings.iou
        self.imgsz = settings.imgsz
        self.tracker = settings.tracker
        self.device = resolve_device(device or settings.device)
        self.danger_ratio = settings.danger_ratio
        self.caution_ratio = settings.caution_ratio
        self.model = _load_model(self.model_name)

    def detect(self, frame: np.ndarray) -> list[Detection]:
        """Run tracking on a single frame, returning filtered vehicle detections.

        ``persist=True`` keeps ByteTrack state across calls so track ids remain
        stable for the duration of the video.
        """
        results = self.model.track(
            source=frame,
            persist=True,
            conf=self.conf,
            iou=self.iou,
            imgsz=self.imgsz,
            tracker=self.tracker,
            device=self.device,
            classes=list(VEHICLE_CLASSES.keys()),
            verbose=False,
        )

        detections: list[Detection] = []
        if not results:
            return detections

        boxes = results[0].boxes
        if boxes is None or boxes.xyxy is None:
            return detections

        frame_h = frame.shape[0]
        xyxy = boxes.xyxy.cpu().numpy()
        cls = boxes.cls.cpu().numpy().astype(int) if boxes.cls is not None else []
        confs = boxes.conf.cpu().numpy() if boxes.conf is not None else []
        ids = (
            boxes.id.cpu().numpy().astype(int)
            if boxes.id is not None
            else np.full(len(xyxy), -1, dtype=int)
        )

        for i in range(len(xyxy)):
            class_id = int(cls[i])
            label = VEHICLE_CLASSES.get(class_id)
            if label is None:
                continue
            x1, y1, x2, y2 = (int(v) for v in xyxy[i])
            risk, proximity = classify_risk(
                y2 - y1, frame_h, self.danger_ratio, self.caution_ratio
            )
            detections.append(
                Detection(
                    x1=x1,
                    y1=y1,
                    x2=x2,
                    y2=y2,
                    label=label,
                    conf=float(confs[i]) if len(confs) else 0.0,
                    track_id=int(ids[i]) if len(ids) else -1,
                    risk=risk,
                    proximity=proximity,
                )
            )
        return detections
