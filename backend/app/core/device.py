"""Compute-device auto-detection (cuda -> mps -> cpu)."""

from __future__ import annotations

from app.core.logging import get_logger

logger = get_logger(__name__)


def resolve_device(preference: str = "auto") -> str:
    """Resolve the inference device.

    ``preference`` may be ``auto``, ``cuda``, ``mps`` or ``cpu``. When ``auto``
    we pick the best available backend in the order cuda -> mps -> cpu. If a
    specific device is requested but unavailable we log a warning and fall back
    to cpu so the pipeline always runs.
    """
    try:
        import torch
    except ImportError:  # torch not installed yet
        logger.warning("torch not installed; defaulting device to 'cpu'")
        return "cpu"

    cuda_ok = torch.cuda.is_available()
    mps_ok = getattr(torch.backends, "mps", None) is not None and torch.backends.mps.is_available()

    pref = (preference or "auto").lower()
    if pref == "cuda":
        if cuda_ok:
            return "cuda"
        logger.warning("CUDA requested but unavailable; falling back to cpu")
        return "cpu"
    if pref == "mps":
        if mps_ok:
            return "mps"
        logger.warning("MPS requested but unavailable; falling back to cpu")
        return "cpu"
    if pref == "cpu":
        return "cpu"

    # auto
    if cuda_ok:
        device = "cuda"
    elif mps_ok:
        device = "mps"
    else:
        device = "cpu"
    logger.info("Auto-selected inference device: %s", device)
    return device
