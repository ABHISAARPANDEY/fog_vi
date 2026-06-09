# FogVision AI — Frontend

Premium dark-theme web app for AI-powered vehicle detection in dense fog.
Built with Next.js 15 (App Router), TypeScript, TailwindCSS, Framer Motion,
Recharts and lucide-react.

## Requirements

- Node 18+ (tested on Node 24)
- The FogVision backend running (default `http://localhost:8000`)

## Getting started

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## Configuration

Copy `.env.example` to `.env.local` and adjust if your backend is elsewhere:

```bash
cp .env.example .env.local
```

```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## Scripts

| Script          | Description                       |
| --------------- | --------------------------------- |
| `npm run dev`   | Start the dev server              |
| `npm run build` | Production build                  |
| `npm run start` | Serve the production build        |
| `npm run lint`  | Lint with `eslint-config-next`    |

## Routes

- `/` — Landing page (hero, features, how-it-works).
- `/app` — Upload → configure → process → results workflow.
  - Deep link `/app?job=<id>` opens a completed job's results directly.
- `/history` — Local + backend job history.

## Backend API contract

The typed client lives in [`lib/api.ts`](./lib/api.ts) and wraps:
`POST /upload`, `POST /process/{job_id}`, `GET /status/{job_id}`,
`GET /results/{job_id}`, `GET /download/{job_id}`, `GET /history`.

Media URLs returned by the backend (`original_url`, `processed_url`) are made
absolute via the `apiBase()` helper.

## Notes

- If the backend is unreachable, the UI shows friendly errors and never crashes.
- Completed jobs are persisted to `localStorage` under `fogvision_history`
  and merged (best-effort) with `GET /history`.
- No external image assets are required — all visuals use CSS/SVG/gradients.
```
