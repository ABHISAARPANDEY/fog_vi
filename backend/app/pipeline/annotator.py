"""Bounding-box drawing for tracked vehicle detections."""

from __future__ import annotations

import cv2
import numpy as np

# Per-class BGR colours (vivid, distinct, on-brand with the frontend palette).
CLASS_COLORS: dict[str, tuple[int, int, int]] = {
    "car": (246, 130, 59),       # primary blue (#3B82F6) in BGR
    "truck": (182, 182, 6),      # cyan/teal (#06B6D4)
    "bus": (129, 185, 16),       # success green (#10B981)
    "motorcycle": (68, 68, 239),  # red accent
}
_DEFAULT_COLOR = (200, 200, 200)


# Risk-level colours (BGR).
RISK_COLORS: dict[str, tuple[int, int, int]] = {
    "danger": (60, 60, 239),    # red (#ef4444)
    "caution": (0, 170, 245),   # amber/orange
}
DANGER_LABEL = {"danger": "TOO CLOSE", "caution": "CLOSE"}


class Detection:
    """A single drawable detection."""

    __slots__ = ("x1", "y1", "x2", "y2", "label", "conf", "track_id", "risk", "proximity")

    def __init__(
        self,
        x1: int,
        y1: int,
        x2: int,
        y2: int,
        label: str,
        conf: float,
        track_id: int,
        risk: str = "safe",
        proximity: float = 0.0,
    ):
        self.x1, self.y1, self.x2, self.y2 = x1, y1, x2, y2
        self.label = label
        self.conf = conf
        self.track_id = track_id
        self.risk = risk            # "safe" | "caution" | "danger"
        self.proximity = proximity  # box-height / frame-height, 0..1


def classify_risk(box_height: int, frame_height: int, danger_ratio: float, caution_ratio: float):
    """Return (risk_level, proximity_ratio) from bounding-box height vs frame."""
    ratio = box_height / frame_height if frame_height else 0.0
    if ratio >= danger_ratio:
        return "danger", ratio
    if ratio >= caution_ratio:
        return "caution", ratio
    return "safe", ratio


def draw_detections(frame: np.ndarray, detections: list[Detection]) -> np.ndarray:
    """Draw bounding boxes + labels, colouring close vehicles by risk level.

    Danger vehicles get a thick red box and a "TOO CLOSE" tag; if any vehicle is
    in the danger zone a "⚠ DANGER — VEHICLE TOO CLOSE" banner is drawn on top.
    """
    out = frame
    danger_count = 0
    for det in detections:
        if det.risk in RISK_COLORS:
            color = RISK_COLORS[det.risk]
            thickness = 3 if det.risk == "danger" else 2
        else:
            color = CLASS_COLORS.get(det.label, _DEFAULT_COLOR)
            thickness = 2
        if det.risk == "danger":
            danger_count += 1

        cv2.rectangle(out, (det.x1, det.y1), (det.x2, det.y2), color, thickness)

        caption = f"{det.label} #{det.track_id} {det.conf:.2f}"
        if det.risk in DANGER_LABEL:
            caption += f"  {DANGER_LABEL[det.risk]}"
        (tw, th), baseline = cv2.getTextSize(caption, cv2.FONT_HERSHEY_SIMPLEX, 0.5, 1)
        chip_y2 = det.y1
        chip_y1 = max(0, det.y1 - th - baseline - 6)
        cv2.rectangle(out, (det.x1, chip_y1), (det.x1 + tw + 8, chip_y2), color, -1)
        cv2.putText(
            out,
            caption,
            (det.x1 + 4, chip_y2 - baseline - 2),
            cv2.FONT_HERSHEY_SIMPLEX,
            0.5,
            (255, 255, 255) if det.risk == "danger" else (10, 10, 20),
            1,
            cv2.LINE_AA,
        )

    if danger_count:
        _draw_danger_banner(out, danger_count)
    return out


def _draw_danger_banner(frame: np.ndarray, count: int) -> None:
    """Overlay a red warning banner at the top of the frame."""
    h, w = frame.shape[:2]
    bar_h = max(28, h // 16)
    overlay = frame.copy()
    cv2.rectangle(overlay, (0, 0), (w, bar_h), (40, 40, 220), -1)
    cv2.addWeighted(overlay, 0.55, frame, 0.45, 0, frame)
    text = f"! DANGER - VEHICLE TOO CLOSE ({count})" if count > 1 else "! DANGER - VEHICLE TOO CLOSE"
    scale = max(0.5, bar_h / 44)
    (tw, th), _ = cv2.getTextSize(text, cv2.FONT_HERSHEY_SIMPLEX, scale, 2)
    cv2.putText(
        frame,
        text,
        ((w - tw) // 2, (bar_h + th) // 2),
        cv2.FONT_HERSHEY_SIMPLEX,
        scale,
        (255, 255, 255),
        2,
        cv2.LINE_AA,
    )
