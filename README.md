# Personal AI Assistant

A personal AI assistant with a React (Vite) frontend and an Express backend, powered by an [n8n](https://n8n.io/) workflow for the actual AI logic.

```
You  →  Frontend (React)  →  Backend (Express)  →  n8n workflow  →  reply
```

## Features

- Clean, responsive chat interface with markdown + code block rendering
- "Thinking" animation while waiting on a reply
- Single Vercel project deploys both the frontend and backend together

## Tech stack

| Layer     | Stack                                   |
|-----------|------------------------------------------|
| Frontend  | React, Vite, react-markdown, remark-gfm  |
| Backend   | Node.js, Express                         |
| AI logic  | n8n webhook (workflow of your choice)    |
| Hosting   | Vercel (frontend + backend in one project) |

## Project structure

```
personal-ai-assistant/
├── frontend/          React + Vite chat UI
│   └── src/
│       ├── App.jsx
│       └── index.css
├── backend/           Express API that forwards messages to n8n
│   └── server.js
├── Pilot.json         Exported n8n workflow (see below)
└── vercel.json        Tells Vercel to build both as one project
```

## n8n workflow (`Pilot.json`)

`Pilot.json` is an export of the n8n workflow this assistant calls. It's included so anyone cloning this repo can import the same workflow into their own n8n instance instead of building it from scratch.

**To use it:**

1. In n8n, go to **Workflows → Import from File** and select `Pilot.json`.
2. Open the imported workflow and update anything specific to your setup — credentials, connected accounts, and the webhook path.
3. Activate the workflow and copy its **Production URL** — that's your `N8N_WEBHOOK_URL`.

**Before deploying your own copy of this repo**, delete `Pilot.json` (or replace it with your own export). It's only meant as a reference for setting up n8n — it isn't read by the frontend or backend at runtime, so removing it doesn't affect the app, and it keeps your published repo from carrying workflow details (node configs, credential references, etc.) that were specific to the original setup.

```bash
git rm Pilot.json
git commit -m "Remove reference n8n workflow export"
git push
```

## Getting started (local development)

**1. Backend**

```bash
cd backend
npm install
cp .env.example .env   # then fill in N8N_WEBHOOK_URL
npm run dev
```

Runs on `http://localhost:5000`.

**2. Frontend**

```bash
cd frontend
npm install
cp .env.example .env   # VITE_API_URL=http://localhost:5000
npm run dev
```

Runs on `http://localhost:5173`.

## Environment variables

| Variable          | Where                | Required in production? | Notes |
|-------------------|-----------------------|:---:|-------|
| `N8N_WEBHOOK_URL` | backend               | ✅ | Your n8n webhook that handles chat messages |
| `VITE_API_URL`    | frontend (local dev only) | ❌ | Leave unset in production — the frontend then calls a relative `/api/chat`, which resolves to the backend automatically since both are one Vercel project |

## Deployment (Vercel)

This repo is set up so **one Vercel project deploys both services**:

1. Push this repo to GitHub.
2. On [vercel.com](https://vercel.com), **New Project** → import the repo → leave the **Root Directory** as the repo root (Vercel reads `vercel.json` and detects the `frontend` and `backend` services automatically).
3. Add one environment variable: `N8N_WEBHOOK_URL`.
4. Click **Deploy**.

You'll get a single URL — the site loads there, and `/api/chat` on that same domain hits the backend.

### How `vercel.json` works

```json
{
  "services": {
    "frontend": { "root": "frontend", "framework": "vite" },
    "backend": { "root": "backend", "entrypoint": "server.js" }
  },
  "rewrites": [
    { "source": "/api(/.*)?", "destination": { "type": "service", "service": "backend" } },
    { "source": "/(.*)", "destination": { "type": "service", "service": "frontend" } }
  ]
}
```

- Requests to `/api/*` are routed to the Express backend.
- Everything else is routed to the built frontend.

## License

Personal project — no license specified.
