"""FogVision AI — FastAPI application entrypoint.

Run with:  uvicorn app.main:app --reload  (from the backend/ directory)
"""

from __future__ import annotations

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles

from app.api.routes import router
from app.config import get_settings
from app.core.logging import configure_logging, get_logger

configure_logging()
logger = get_logger("fogvision")
settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    settings.ensure_dirs()
    logger.info("FogVision AI backend starting | model=%s conf=%.2f device=%s",
                settings.model_name, settings.confidence, settings.device)
    yield
    logger.info("FogVision AI backend shutting down")


app = FastAPI(
    title="FogVision AI",
    description="Vehicle detection in dense fog using YOLOv8 + ByteTrack.",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router, prefix="")

# Serve processed/original media so the frontend <video> elements can stream them.
app.mount("/media/uploads", StaticFiles(directory=str(settings.uploads_dir)), name="uploads")
app.mount("/media/outputs", StaticFiles(directory=str(settings.outputs_dir)), name="outputs")


@app.get("/")
async def root() -> JSONResponse:
    return JSONResponse(
        {
            "name": "FogVision AI",
            "status": "ok",
            "version": app.version,
            "endpoints": ["/upload", "/process/{job_id}", "/status/{job_id}",
                          "/results/{job_id}", "/download/{job_id}", "/history"],
        }
    )


@app.get("/health")
async def health() -> dict:
    return {"status": "healthy"}


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("app.main:app", host=settings.host, port=settings.port, reload=True)
