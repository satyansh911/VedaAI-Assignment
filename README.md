<div align="center">

<img src="https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js" />
<img src="https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript" />
<img src="https://img.shields.io/badge/Node.js-20-green?style=for-the-badge&logo=node.js" />
<img src="https://img.shields.io/badge/MongoDB-Atlas-brightgreen?style=for-the-badge&logo=mongodb" />
<img src="https://img.shields.io/badge/Redis-Upstash-red?style=for-the-badge&logo=redis" />
<img src="https://img.shields.io/badge/Groq-LLaMA_3.3-orange?style=for-the-badge" />

# VedaAI — AI Assessment Creator

**Generate structured, exam-ready question papers in seconds using AI.**  
Built for teachers. Powered by LLaMA 3.3 via Groq.

🌐 **Live Demo:** [veda-ai-assignment-satyansh.vercel.app](https://veda-ai-assignment-satyansh.vercel.app)

</div>

---

## Overview

VedaAI lets teachers describe an assignment and instantly receive a fully structured question paper — complete with sections, difficulty badges, mark distribution, MCQ options, and an answer key. No prompt engineering required.

The full pipeline:
- Teacher fills a form → Express API enqueues a **BullMQ** background job
- Worker calls **Groq (LLaMA 3.3-70b)** and validates the response with **Zod**
- Completed paper is saved to **MongoDB** and cached in **Redis**
- Frontend receives a real-time update via **Socket.io** and renders the paper instantly

---

## Screenshots

### Login & Authentication
![Login](https://i.imgur.com/placeholder-login.png)
> Google OAuth + Email/Password authentication with JWT

### Dashboard — Assignments
![Dashboard](https://i.imgur.com/placeholder-dashboard.png)
> View all assignments with status badges, filter by group, and dark mode support

### Create Assignment
![Create](https://i.imgur.com/placeholder-create.png)
> Describe your assignment, set question types, upload a PDF/TXT source (optional)

### Generated Question Paper
![Paper](https://i.imgur.com/placeholder-paper.png)
> Structured paper with sections, difficulty badges, MCQ options, answer key, and one-click PDF export

### My Groups
![Groups](https://i.imgur.com/placeholder-groups.png)
> Organise assignments into class groups with colour labels

### AI Teacher's Toolkit
![Toolkit](https://i.imgur.com/placeholder-toolkit.png)
> Generate lesson plans, rubrics, and study notes from a topic description

### Settings & Dark Mode
![Settings](https://i.imgur.com/placeholder-settings.png)
> Profile management and dark/light theme toggle

---

## Features

| Feature | Details |
|---|---|
| **AI Paper Generation** | LLaMA 3.3-70b via Groq — MCQs, short answer, long answer, true/false |
| **Real-time Updates** | Socket.io push + 4s polling fallback |
| **Answer Key** | Auto-generated with every paper |
| **PDF Export** | Client-side html2canvas + jsPDF, properly paginated |
| **Auth** | Google OAuth + Email/Password, JWT sessions |
| **My Groups** | Organise assignments by class/subject |
| **My Library** | Save favourite papers for reuse |
| **Notifications** | In-app alerts on generation complete/failed |
| **AI Toolkit** | Lesson plans, rubrics, study notes |
| **Dark Mode** | Full dark/light theme, persisted per user |
| **PDF/TXT Upload** | Ground questions in your own source material |
| **Redis Caching** | Completed papers cached 1hr, invalidated on regenerate |

---

## Architecture

```
┌──────────────────────────┐        HTTP / WebSocket        ┌──────────────────────────────┐
│     Next.js Frontend     │  ◄──────────────────────────►  │      Express API Server      │
│                          │                                │                              │
│  Next.js 14 App Router   │                                │  /api/auth  (JWT + Google)   │
│  Zustand · Tailwind CSS  │                                │  /api/assignments            │
│  socket.io-client        │                                │  /api/groups                 │
│  html2canvas + jsPDF     │                                │  /api/notifications          │
│  @react-oauth/google     │                                │  /api/toolkit                │
└──────────────────────────┘                                │  socket.io server            │
                                                            │  BullMQ producer             │
                                                            └──────────────┬───────────────┘
                                                                           │
                                                               ┌───────────┴───────────┐
                                                               │                       │
                                                     ┌─────────▼─────────┐   ┌─────────▼─────────┐
                                                     │      MongoDB      │   │    Redis (Upstash) │
                                                     │  Users · Groups   │   │  BullMQ queue      │
                                                     │  Assignments      │   │  Response cache    │
                                                     │  Notifications    │   └─────────┬──────────┘
                                                     └───────────────────┘             │
                                                                               ┌───────▼────────┐
                                                                               │  BullMQ Worker │
                                                                               │  (in-process)  │
                                                                               │  Groq LLaMA    │
                                                                               │  Zod validate  │
                                                                               │  Save + notify │
                                                                               └────────────────┘
```

### Request Lifecycle

1. Teacher submits the create form → `POST /api/assignments` creates a `pending` document and enqueues a BullMQ job
2. Frontend navigates to `/assignment/[id]`, subscribes to a Socket.io room
3. Worker picks the job, builds a structured prompt, calls Groq, validates with Zod, saves the paper
4. API server receives the BullMQ `completed` event and emits `assignment:update` to the socket room
5. Frontend re-fetches and renders the question paper live
6. A notification is created in MongoDB; the bell badge updates within 30 seconds

---

## Tech Stack

**Frontend**
- Next.js 14 (App Router) · TypeScript · Tailwind CSS
- Zustand · socket.io-client · @react-oauth/google
- html2canvas + jsPDF · lucide-react · marked

**Backend**
- Node.js 20 · Express · TypeScript
- Mongoose (MongoDB Atlas) · ioredis (Upstash Redis)
- BullMQ · Socket.io · Multer · pdf-parse · Zod
- bcryptjs · jsonwebtoken · google-auth-library · Groq SDK

**Infrastructure**
- Frontend → **Vercel**
- Backend → **Render** (Web Service, worker in-process)
- Database → **MongoDB Atlas**
- Cache / Queue → **Upstash Redis**

---

## Repository Layout

```
.
├── backend/
│   └── src/
│       ├── config/        env, mongo, redis
│       ├── middleware/    requireAuth (JWT)
│       ├── models/        User, Assignment, Group, Notification
│       ├── routes/        auth, assignments, groups, notifications, toolkit
│       ├── queues/        BullMQ queue + QueueEvents
│       ├── workers/       generationWorker (embedded in server process)
│       ├── services/      llm (Groq + Zod), toolkit (lesson/rubric/notes)
│       ├── ws/            socket.io server + room helpers
│       ├── utils/         prompt builder, auth helpers
│       ├── app.ts         Express app factory
│       └── server.ts      HTTP + socket + worker bootstrap
├── frontend/
│   └── src/
│       ├── app/           App Router pages
│       ├── components/    All UI components
│       ├── context/       AuthContext, ThemeContext, NotificationsContext
│       ├── lib/           API client, auth storage
│       ├── store/         Zustand store
│       └── types/         Shared TypeScript types
├── docker-compose.yml     Local MongoDB + Redis
└── README.md
```

---

## Local Development

### Prerequisites
- Node.js 18+
- Docker + Docker Compose

### 1. Start MongoDB & Redis

```bash
docker-compose up -d
```

### 2. Backend

```bash
cd backend
cp .env.example .env   # fill in GROQ_API_KEY
npm install
npm run dev
```

API runs at `http://localhost:4000`

### 3. Frontend

```bash
cd frontend
cp .env.example .env.local   # defaults point at http://localhost:4000
npm install
npm run dev
```

App runs at `http://localhost:3000`

---

## Environment Variables

### Backend

| Variable | Description |
|---|---|
| `PORT` | Server port (default 4000) |
| `MONGO_URI` | MongoDB connection string |
| `REDIS_HOST` | Redis host |
| `REDIS_PORT` | Redis port |
| `REDIS_PASSWORD` | Redis password (required for Upstash) |
| `REDIS_TLS` | Set `true` for Upstash |
| `GROQ_API_KEY` | Groq API key |
| `GROQ_MODEL` | Model name (default `llama-3.3-70b-versatile`) |
| `JWT_SECRET` | Secret for signing JWT tokens |
| `JWT_EXPIRES` | Token lifetime (default `7d`) |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID |
| `CLIENT_ORIGIN` | Frontend URL for CORS |

### Frontend

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_API_URL` | Backend base URL |
| `NEXT_PUBLIC_GOOGLE_CLIENT_ID` | Google OAuth client ID |

---

## Deployment

### Vercel (Frontend)

1. Import the `frontend/` folder
2. Framework preset: **Next.js**
3. Add env vars: `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_GOOGLE_CLIENT_ID`

### Render (Backend)

1. Create a **Web Service** from the `backend/` folder
2. Build command: `npm install && npm run build`
3. Start command: `node dist/server.js`
4. Add all backend env vars listed above

> The BullMQ worker runs **in-process** alongside the HTTP server — no separate worker service needed.

---

## API Reference

| Method | Path | Description |
|---|---|---|
| `POST` | `/api/auth/signup` | Register with email + password |
| `POST` | `/api/auth/login` | Login with email + password |
| `POST` | `/api/auth/google` | Login with Google ID token |
| `GET` | `/api/auth/me` | Get current user |
| `PATCH` | `/api/auth/me` | Update profile / preferences |
| `GET` | `/api/assignments` | List user's assignments |
| `POST` | `/api/assignments` | Create + enqueue generation |
| `GET` | `/api/assignments/:id` | Get single assignment |
| `POST` | `/api/assignments/:id/regenerate` | Re-enqueue generation |
| `DELETE` | `/api/assignments/:id` | Delete assignment |
| `POST` | `/api/assignments/:id/library` | Toggle save to library |
| `GET` | `/api/groups` | List groups |
| `POST` | `/api/groups` | Create group |
| `PUT` | `/api/groups/:id` | Update group |
| `DELETE` | `/api/groups/:id` | Delete group |
| `GET` | `/api/notifications` | List notifications |
| `POST` | `/api/notifications/read-all` | Mark all as read |
| `POST` | `/api/toolkit/generate` | Generate toolkit content |

**WebSocket events (`/` namespace)**

| Direction | Event | Payload |
|---|---|---|
| Client → Server | `subscribe` | `assignmentId` |
| Client → Server | `unsubscribe` | `assignmentId` |
| Server → Client | `assignment:update` | `{ type: "status" \| "completed" \| "failed", ... }` |
