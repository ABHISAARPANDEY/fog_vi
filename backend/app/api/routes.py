"""HTTP API routes for FogVision AI."""

from __future__ import annotations

import asyncio
from pathlib import Path

from fastapi import APIRouter, HTTPException, Request
from fastapi.responses import FileResponse, StreamingResponse
from starlette.datastructures import UploadFile as StarletteUploadFile

from app.core.job_manager import get_job_manager
from app.core.logging import get_logger
from app.models.schemas import (
    HistoryItem,
    ProcessRequest,
    ProcessResponse,
    ResultsResponse,
    StatusResponse,
    UploadResponse,
)

logger = get_logger(__name__)
router = APIRouter()


@router.post("/upload", response_model=UploadResponse)
async def upload(request: Request) -> UploadResponse:
    """Upload a video, validate it and create a queued job.

    The video file is read from the multipart form by scanning for the first
    file part regardless of its field name. This is more robust than requiring
    an exact ``file`` field, which can fail if a browser extension or proxy
    rewrites the multipart body.
    """
    try:
        form = await request.form()
    except Exception as exc:  # noqa: BLE001 - malformed multipart body
        raise HTTPException(
            status_code=400,
            detail="Could not read the upload. Please try again.",
        ) from exc

    upload_file: StarletteUploadFile | None = None
    for value in form.values():
        if isinstance(value, StarletteUploadFile) and value.filename:
            upload_file = value
            break

    if upload_file is None:
        raise HTTPException(
            status_code=400,
            detail="No video file received. Please select a file and try again.",
        )

    raw = await upload_file.read()
    if not raw:
        raise HTTPException(status_code=400, detail="Empty file.")
    logger.info("Received upload: %s (%d bytes)", upload_file.filename, len(raw))
    try:
        record = get_job_manager().create_job(upload_file.filename or "video.mp4", raw)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    return UploadResponse(
        job_id=record["job_id"],
        filename=record["filename"],
        size_bytes=record["size_bytes"],
        duration_s=record["duration_s"],
        fps=record["fps"],
        frame_count=record["frame_count"],
        width=record["width"],
        height=record["height"],
        thumbnail=record["thumbnail"],
    )


@router.post("/process/{job_id}", response_model=ProcessResponse)
async def process(job_id: str, request: ProcessRequest | None = None) -> ProcessResponse:
    """Kick off background processing for an existing job."""
    started = get_job_manager().start(job_id, request)
    if not started:
        raise HTTPException(status_code=404, detail="Job not found.")
    status = get_job_manager().status(job_id)
    return ProcessResponse(job_id=job_id, status=status["status"])  # type: ignore[index]


@router.get("/status/{job_id}", response_model=StatusResponse)
async def status(job_id: str) -> StatusResponse:
    data = get_job_manager().status(job_id)
    if data is None:
        raise HTTPException(status_code=404, detail="Job not found.")
    return StatusResponse(**data)


@router.get("/results/{job_id}", response_model=ResultsResponse)
async def results(job_id: str) -> ResultsResponse:
    data = get_job_manager().results(job_id)
    if data is None:
        raise HTTPException(status_code=404, detail="Job not found.")
    return ResultsResponse(**data)


@router.get("/stream/{job_id}")
async def stream(job_id: str) -> StreamingResponse:
    """Live MJPEG stream of annotated frames while the job is processing.

    Consumable directly by an <img src> tag for a real-time detection feed.
    Emits the latest annotated frame ~10x/second and stops when the job ends.
    """
    mgr = get_job_manager()
    record = mgr.get(job_id)
    if record is None:
        raise HTTPException(status_code=404, detail="Job not found.")

    preview_file = Path(str(Path(record["output_path"]).with_suffix("")) + "_preview.jpg")
    boundary = b"--frame\r\n"

    async def frames():
        last = b""
        # Cap ~10 minutes (6000 * 0.1s) as a safety backstop.
        for _ in range(6000):
            st = mgr.status(job_id)
            current_status = st["status"] if st else "failed"
            data = b""
            try:
                if preview_file.exists():
                    data = preview_file.read_bytes()
            except OSError:
                data = b""
            if data and data != last:
                last = data
                yield boundary + b"Content-Type: image/jpeg\r\n\r\n" + data + b"\r\n"
            if current_status in ("completed", "failed"):
                if data and data != last:
                    yield boundary + b"Content-Type: image/jpeg\r\n\r\n" + data + b"\r\n"
                break
            await asyncio.sleep(0.1)

    return StreamingResponse(
        frames(),
        media_type="multipart/x-mixed-replace; boundary=frame",
        headers={"Cache-Control": "no-cache, no-store", "Pragma": "no-cache"},
    )


@router.get("/download/{job_id}")
async def download(job_id: str) -> FileResponse:
    record = get_job_manager().get(job_id)
    if record is None:
        raise HTTPException(status_code=404, detail="Job not found.")
    output = Path(record["output_path"])
    if not output.exists():
        raise HTTPException(status_code=404, detail="Processed video not available yet.")
    download_name = f"fogvision_{Path(record['filename']).stem}.mp4"
    return FileResponse(path=str(output), media_type="video/mp4", filename=download_name)


@router.get("/history", response_model=list[HistoryItem])
async def history() -> list[HistoryItem]:
    return [HistoryItem(**item) for item in get_job_manager().history()]
