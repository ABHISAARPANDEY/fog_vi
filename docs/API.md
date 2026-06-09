# FogVision AI — API Reference

Base URL (local): `http://localhost:8000`
Interactive docs (Swagger UI): `http://localhost:8000/docs`

All responses are JSON unless noted. Status values: `queued | processing | completed | failed`.

---

## `POST /upload`

Upload a video file and create a queued job.

- **Body:** `multipart/form-data` with field `file` (`.mp4`, `.mov`, `.avi`).
- **Validation:** extension check + OpenCV probe (rejects corrupt/unreadable files → `400`).

**Response `200`**
```json
{
  "job_id": "a1b2c3d4e5f6",
  "filename": "fog_traffic.mp4",
  "size_bytes": 18432000,
  "duration_s": 12.4,
  "fps": 25.0,
  "frame_count": 310,
  "width": 1920,
  "height": 1080,
  "thumbnail": "data:image/jpeg;base64,..."
}
```

---

## `POST /process/{job_id}`

Start background processing. Returns immediately.

**Body (optional)**
```json
{
  "enhancement": { "clahe": true, "gamma": 1.2, "hist_eq": true, "sharpen": true },
  "model_name": "yolov8n.pt",
  "conf": 0.4
}
```

**Response `200`**
```json
{ "job_id": "a1b2c3d4e5f6", "status": "queued" }
```

---

## `GET /status/{job_id}`

Poll for progress (frontend polls every 1s).

**Response `200`**
```json
{
  "job_id": "a1b2c3d4e5f6",
  "status": "processing",
  "progress": 0.42,
  "current_frame": 130,
  "total_frames": 310,
  "eta_seconds": 18.5,
  "error": null,
  "preview_url": "/media/outputs/a1b2c3d4e5f6_preview.jpg"
}
```

---

## `GET /stream/{job_id}`

Real-time MJPEG stream (`multipart/x-mixed-replace; boundary=frame`) of the latest
annotated frame while the job processes. Consume directly in an `<img>` tag:

```html
<img src="http://localhost:8000/stream/<job_id>" />
```

Emits frames ~10×/second and closes when the job reaches `completed`/`failed`.

---

## `GET /results/{job_id}`

Full analytics + media URLs (available once `status == completed`).

**Response `200`**
```json
{
  "job_id": "a1b2c3d4e5f6",
  "status": "completed",
  "analytics": {
    "total_vehicles": 27,
    "cars": 18, "trucks": 5, "buses": 2, "motorcycles": 2,
    "average_confidence": 0.71,
    "processing_time_s": 41.3,
    "fps_processed": 7.5,
    "danger_alerts": 12,
    "danger_vehicles": 3,
    "max_proximity": 0.68
  },
  "timeline": [{ "frame": 0, "t": 0.0, "cars": 2, "trucks": 0, "buses": 0, "motorcycles": 0, "total": 2, "danger": 0 }],
  "confidence_hist": [{ "bucket": "40-50%", "count": 12 }],
  "before_after": { "original": "data:image/jpeg;base64,...", "enhanced": "data:image/jpeg;base64,..." },
  "original_url": "/media/uploads/a1b2c3d4e5f6.mp4",
  "processed_url": "/media/outputs/a1b2c3d4e5f6.mp4",
  "error": null
}
```

> `original_url` / `processed_url` are paths on the backend host. Prefix with the
> API base URL when used as a `<video src>` (e.g. `http://localhost:8000/media/...`).

---

## `GET /download/{job_id}`

Streams the processed MP4 as an attachment (`Content-Disposition: attachment`).

---

## `GET /history`

List of all jobs (newest first) — backs the local history view.

**Response `200`**
```json
[
  { "job_id": "a1b2c3d4e5f6", "filename": "fog_traffic.mp4", "created_at": "2026-06-09T18:00:00+00:00", "status": "completed", "total_vehicles": 27 }
]
```

---

## Errors

| Code | Meaning |
|------|---------|
| `400` | Empty file, unsupported type, file too large, or corrupt/unreadable video |
| `404` | Unknown `job_id`, or processed video not ready for download |
| `500` | Unexpected server error (also captured into the job's `error` field) |
