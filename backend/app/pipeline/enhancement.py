"""Modular fog-enhancement pipeline.

Each enhancement step is a small, independently testable function operating on a
BGR ``numpy`` frame. :class:`FogEnhancer` composes the enabled steps in a fixed,
sensible order:

    CLAHE -> gamma correction -> histogram equalisation -> unsharp sharpening

The order matters: CLAHE recovers local contrast hidden by fog, gamma lifts the
mid-tones, global histogram equalisation balances overall brightness, and a final
unsharp mask restores edge definition for the detector.
"""

from __future__ import annotations

import cv2
import numpy as np

from app.models.schemas import EnhancementSettings


def apply_clahe(frame: np.ndarray, clip_limit: float = 2.5, tile_grid: int = 8) -> np.ndarray:
    """Contrast Limited Adaptive Histogram Equalisation on the L channel (LAB)."""
    lab = cv2.cvtColor(frame, cv2.COLOR_BGR2LAB)
    l, a, b = cv2.split(lab)
    clahe = cv2.createCLAHE(clipLimit=clip_limit, tileGridSize=(tile_grid, tile_grid))
    l = clahe.apply(l)
    merged = cv2.merge((l, a, b))
    return cv2.cvtColor(merged, cv2.COLOR_LAB2BGR)


def apply_gamma(frame: np.ndarray, gamma: float = 1.2) -> np.ndarray:
    """Gamma correction via a precomputed lookup table."""
    if gamma <= 0:
        gamma = 1.0
    inv = 1.0 / gamma
    table = np.array([((i / 255.0) ** inv) * 255 for i in range(256)], dtype=np.uint8)
    return cv2.LUT(frame, table)


def apply_hist_eq(frame: np.ndarray) -> np.ndarray:
    """Global histogram equalisation on luminance (YCrCb) to preserve colour."""
    ycrcb = cv2.cvtColor(frame, cv2.COLOR_BGR2YCrCb)
    y, cr, cb = cv2.split(ycrcb)
    y = cv2.equalizeHist(y)
    merged = cv2.merge((y, cr, cb))
    return cv2.cvtColor(merged, cv2.COLOR_YCrCb2BGR)


def apply_sharpen(frame: np.ndarray, amount: float = 1.0, sigma: float = 1.0) -> np.ndarray:
    """Unsharp-mask sharpening (frame + amount*(frame - blur))."""
    blurred = cv2.GaussianBlur(frame, (0, 0), sigmaX=sigma)
    sharpened = cv2.addWeighted(frame, 1 + amount, blurred, -amount, 0)
    return sharpened


class FogEnhancer:
    """Composes the enabled enhancement steps based on :class:`EnhancementSettings`."""

    def __init__(self, settings: EnhancementSettings):
        self.settings = settings

    def __call__(self, frame: np.ndarray) -> np.ndarray:
        return self.enhance(frame)

    def enhance(self, frame: np.ndarray) -> np.ndarray:
        out = frame
        if self.settings.clahe:
            out = apply_clahe(out)
        if self.settings.gamma and abs(self.settings.gamma - 1.0) > 1e-3:
            out = apply_gamma(out, self.settings.gamma)
        if self.settings.hist_eq:
            out = apply_hist_eq(out)
        if self.settings.sharpen:
            out = apply_sharpen(out)
        return out
