# Job Tracker

A full-stack job application tracking app with token-based authentication, per-user data isolation, and a free-tier production deployment. Built with Django REST Framework, React 19 + TypeScript, and PostgreSQL.

**Live demo:** [job-tracker-bay-one.vercel.app](https://job-tracker-bay-one.vercel.app)

![Python](https://img.shields.io/badge/Python-3.11-3776AB?style=flat&logo=python&logoColor=white)
![Django](https://img.shields.io/badge/Django-5.1-092E20?style=flat&logo=django&logoColor=white)
![DRF](https://img.shields.io/badge/DRF-3.15-A30000?style=flat&logo=django&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?style=flat&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat&logo=typescript&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?style=flat&logo=postgresql&logoColor=white)
![Tailwind](https://img.shields.io/badge/Tailwind-3-06B6D4?style=flat&logo=tailwindcss&logoColor=white)
![Vercel](https://img.shields.io/badge/Vercel-deployed-000?style=flat&logo=vercel&logoColor=white)
![Render](https://img.shields.io/badge/Render-deployed-46E3B7?style=flat&logo=render&logoColor=white)

---

## Features

- **Email + password auth** — register and sign in with token authentication; passwords validated server-side (length, common-password, similarity, numeric-only checks)
- **Per-user isolation** — every job application is scoped to the authenticated owner; one user can't see another user's data
- **Full CRUD pipeline** — create, edit, delete applications; quick-toggle status from the row
- **Status filters** — All / New / Applied / Follow-up / Interview / Offer / Rejected; the "Interview" filter also includes Technical Test
- **Live stats** — counts by status update on every change
- **Resume uploads** — attach a PDF per application; stored on disk in dev, S3-ready in prod via `django-storages`
- **Optimistic UI** — status changes apply locally first, then reconcile with the server (rolled back on failure)
- **Production hardening** — HSTS, secure cookies, CSP-aware CORS, request size caps, throttling on `/register/`, Sentry-ready
- **Deployed for free** — Vercel + Render + Neon on free tiers, with a GitHub Actions cron to keep Render warm

---

## Tech stack

### Backend
| Tech | Purpose |
|------|---------|
| Python 3.11 | Runtime |
| Django 5.1 | Web framework + ORM |
| Django REST Framework | REST API + token auth |
| drf-spectacular | OpenAPI schema + Swagger UI |
| gunicorn | WSGI server |
| WhiteNoise | Static-file serving |
| dj-database-url | Postgres URL parsing |
| psycopg2-binary | Postgres driver |
| django-storages | S3-compatible media (optional) |
| Sentry SDK | Error monitoring (optional) |

### Frontend
| Tech | Purpose |
|------|---------|
| React 19 | UI |
| TypeScript 5 | Type safety |
| Vite 7 | Dev server + build |
| Tailwind CSS 3 | Styling |
| Axios | HTTP client with interceptors |

### Infrastructure
| Service | Role |
|---------|------|
| Vercel | Frontend hosting + CDN |
| Render | Backend gunicorn host |
| Neon | Managed Postgres (serverless) |
| GitHub Actions | Cron ping to prevent Render cold starts |
| Docker Compose | Local dev with backend + Postgres |

---

## Architecture

```
                    ┌──────────────────┐
                    │   GitHub Actions │
                    │  cron */10 min   │
                    └────────┬─────────┘
                             │ GET /healthz/
                             ▼
┌──────────────┐    HTTPS     ┌──────────────┐    SQL/TLS    ┌──────────────┐
│   Browser    │─────────────▶│   Render     │──────────────▶│    Neon      │
│              │              │              │               │              │
│  React 19    │   POST/GET   │  Django 5.1  │   psycopg2    │  Postgres 16 │
│  TypeScript  │   Token auth │  gunicorn    │   pooled      │  pooler.aws  │
│  Tailwind    │              │  WhiteNoise  │               │              │
└──────┬───────┘              └──────────────┘               └──────────────┘
       │                       job-tracker-1-vwvl.onrender.com
       │ static
       ▼
┌──────────────┐
│   Vercel     │
│   CDN        │
│              │
│ index.html   │
│ index.js     │
│ index.css    │
└──────────────┘
job-tracker-bay-one.vercel.app
```

---

## Local development

The fastest path is Docker Compose for the backend and `npm run dev` for the frontend.

### Prerequisites
- Docker Desktop
- Node.js 20+
- Git

### 1. Clone and configure

```bash
git clone https://github.com/Kb1r/Job-Tracker.git
cd Job-Tracker
cp .env.example .env
```

Edit `.env` and set at minimum:
```
DJANGO_SECRET_KEY=<run: python3 -c "import secrets; print(secrets.token_urlsafe(50))">
DEBUG=True
```

### 2. Start the backend

```bash
docker compose up --build
```

Brings up Django on `http://localhost:8000` with a Postgres 16 sidecar. Migrations run automatically on boot.

### 3. Start the frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend serves on `http://localhost:5173`. By default it talks to `http://localhost:8000` — override with `VITE_API_URL` in `frontend/.env.local` if needed.

### 4. Create a test user

Either register through the UI, or via the API:

```bash
curl -X POST http://localhost:8000/api/auth/register/ \
  -H "Content-Type: application/json" \
  -d '{"email":"you@example.com","password":"StrongPass123!","first_name":"You"}'
```

Response: `{"token": "abc123..."}` — paste into the `Authorization: Token abc123...` header for subsequent requests.

---

## API reference

Base URL (prod): `https://job-tracker-1-vwvl.onrender.com`
Base URL (local): `http://localhost:8000`
Interactive docs: `/api/schema/swagger-ui/`

### Authentication

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/api/auth/register/` | none | Create account, returns token. Throttled at 5/hour per IP. |
| `POST` | `/api/auth/login/` | none | Authenticate, returns token. |

All `/api/jobs/*` endpoints require `Authorization: Token <token>` header.

### Jobs

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/jobs/` | List the current user's applications |
| `POST` | `/api/jobs/` | Create an application (multipart for resume upload) |
| `GET` | `/api/jobs/{id}/` | Get one application (owner only) |
| `PATCH` | `/api/jobs/{id}/` | Partial update |
| `DELETE` | `/api/jobs/{id}/` | Delete |
| `PATCH` | `/api/jobs/{id}/update-status/` | Quick status change |
| `GET` | `/api/jobs/stats/` | Counts by status for the current user |

### Health

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/healthz/` | Liveness probe — returns `{"status":"ok"}` |

---

## Project structure

```
job-tracker/
├── .github/workflows/
│   └── keep-alive.yml          # cron ping to keep Render warm
├── backend/
│   ├── config/
│   │   ├── settings.py         # env-driven config; prod hardening
│   │   └── urls.py             # /api/auth/, /api/jobs/, /healthz/
│   ├── jobs/
│   │   ├── auth_views.py       # Register, Login (DRF APIViews)
│   │   ├── auth_urls.py        # /register/, /login/
│   │   ├── models.py           # JobApplication with owner FK
│   │   ├── serializers.py
│   │   ├── views.py            # ViewSet filtered by request.user
│   │   └── migrations/
│   ├── Dockerfile
│   └── requirements.txt
├── frontend/
│   └── src/
│       ├── api/
│       │   ├── auth.ts         # login/register
│       │   └── jobs.ts         # CRUD + interceptors (401 → logout)
│       ├── components/
│       │   ├── App.tsx         # 8-line auth gate
│       │   ├── Dashboard.tsx   # authenticated home
│       │   ├── LoginPage.tsx   # login + register
│       │   ├── JobModal.tsx
│       │   ├── JobTable.tsx
│       │   └── StatsBar.tsx
│       ├── context/
│       │   └── AuthContext.tsx # token persistence in localStorage
│       └── types/
└── docker-compose.yml
```

---

## Deployment

The live demo runs on three free-tier services:

- **Frontend** on Vercel — auto-deploys from `main` on every push, builds the Vite bundle with `VITE_API_URL` baked in.
- **Backend** on Render — auto-deploys from `main`, runs `python manage.py migrate --noinput && gunicorn config.wsgi` on boot.
- **Database** on Neon — pooled Postgres connection over TLS with `channel_binding=require`.

A GitHub Actions cron pings `/healthz/` every 10 minutes so Render's free tier doesn't spin down between visits.

### Required environment variables (production)

**Render (backend):**
| Var | Example |
|-----|---------|
| `DJANGO_SECRET_KEY` | random 50-char string |
| `DEBUG` | `False` |
| `DATABASE_URL` | `postgresql://user:pw@host/db?sslmode=require` |
| `ALLOWED_HOSTS` | `your-app.onrender.com` |
| `CORS_ALLOWED_ORIGINS` | `https://your-frontend.vercel.app` |
| `CSRF_TRUSTED_ORIGINS` | `https://your-frontend.vercel.app,https://your-app.onrender.com` |
| `SENTRY_DSN` | optional |

**Vercel (frontend):**
| Var | Example |
|-----|---------|
| `VITE_API_URL` | `https://your-app.onrender.com` (no trailing slash, no path) |

---

## Testing

```bash
# Backend
docker compose exec backend python manage.py test

# Frontend type-check + lint
cd frontend
npx tsc --noEmit
npm run lint
```

---

## Roadmap

- [x] User authentication and per-user isolation
- [x] Production deployment (Vercel + Render + Neon)
- [x] Cold-start prevention via GitHub Actions
- [ ] Sort table by any column
- [ ] CSV export
- [ ] Email reminders for follow-ups
- [ ] Kanban board view
- [ ] Dark mode

---

## What I learned building this

- **Token-based REST auth** — DRF `TokenAuthentication`, `AllowAny` on register/login, per-user filtering with `get_queryset`, throttling registration with `AnonRateThrottle`
- **Production Django** — env-driven settings, `dj-database-url` for portable Postgres config, WhiteNoise for static files, HSTS + secure cookies + `SECURE_PROXY_SSL_HEADER` behind a reverse proxy
- **Free-tier deployment trade-offs** — Render cold starts, Neon's connection pooler, Vercel's build-time env vars vs Render's runtime env vars, why CORS preflight fails when origins have trailing slashes
- **Vite build pipeline** — `import.meta.env` substitution at build time means env-var changes need a fresh build, not just a redeploy
- **React 19 + hooks discipline** — auth gate as a tiny root component to keep all hooks inside the dashboard and never violate the Rules of Hooks
- **Migration ordering** — adding a non-null FK to an existing table needs a data migration to delete or backfill orphans before the schema migration

---

## Licence

MIT — free to use, modify and distribute.

---

## Author

**Kabir Gautam** — [@Kb1r](https://github.com/Kb1r)
