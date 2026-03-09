# 🗂️ Job Tracker

A full-stack job application tracking web app built with **Django REST Framework**, **React + TypeScript**, **PostgreSQL**, and **Docker**. Track every application, monitor interview progress, and visualise your job search at a glance.

![Python](https://img.shields.io/badge/Python-3.12-3776AB?style=flat&logo=python&logoColor=white)
![Django](https://img.shields.io/badge/Django-5.1-092E20?style=flat&logo=django&logoColor=white)
![React](https://img.shields.io/badge/React-18-61DAFB?style=flat&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat&logo=typescript&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?style=flat&logo=postgresql&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?style=flat&logo=docker&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3-06B6D4?style=flat&logo=tailwindcss&logoColor=white)

---
## ✨ Features

- **Full CRUD** — Create, read, update and delete job applications
- **Status tracking** — Applied → Interview → Offer / Rejected pipeline
- **Stats bar** — Live counts of applications by status
- **Filter by status** — Instantly filter the table by any stage
- **Salary display** — Optional salary field formatted with £ symbol
- **Responsive UI** — Clean Tailwind CSS design that works on any screen
- **Persistent storage** — PostgreSQL database survives container restarts
- **One-command startup** — Entire stack runs with `docker compose up`

---

## 🏗️ Tech Stack

### Backend
| Technology | Version | Purpose |
|------------|---------|---------|
| Python | 3.12 | Core language |
| Django | 5.1 | Web framework & ORM |
| Django REST Framework | 3.15 | REST API layer |
| django-cors-headers | 4.3 | Cross-origin request handling |
| psycopg2-binary | 2.9 | PostgreSQL driver |
| PostgreSQL | 16 | Relational database |

### Frontend
| Technology | Version | Purpose |
|------------|---------|---------|
| React | 18 | UI framework |
| TypeScript | 5 | Type-safe JavaScript |
| Vite | 7 | Build tool & dev server |
| Tailwind CSS | 3 | Utility-first styling |
| Axios | 1.x | HTTP client |

### Infrastructure
| Technology | Purpose |
|------------|---------|
| Docker | Container runtime |
| Docker Compose | Multi-container orchestration |
| Git + GitHub | Version control |

---

## 🚀 Getting Started

### Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed and running
- [Node.js 20+](https://nodejs.org/) (for local frontend development)
- [Git](https://git-scm.com/)

### 1. Clone the repository

```bash
git clone https://github.com/Kb1r/Job-Tracker.git
cd Job-Tracker
```

### 2. Start the backend (Django + PostgreSQL)

```bash
docker compose up --build
```

This single command will:
- Pull the PostgreSQL 16 Docker image
- Build the Django container
- Run all database migrations automatically
- Start the API server at `http://localhost:8000`

> ⏱️ First run takes 2–4 minutes to download images. Subsequent runs start in seconds.

### 3. Start the frontend (React + Vite)

In a new terminal:

```bash
cd frontend
npm install
npm run dev
```

Open **http://localhost:5173** in your browser.

---

## 📁 Project Structure

```
job-tracker/
├── backend/
│   ├── config/
│   │   ├── settings.py       # Django configuration
│   │   └── urls.py           # Root URL routing
│   ├── jobs/
│   │   ├── migrations/       # Database migration files
│   │   ├── models.py         # JobApplication model
│   │   ├── serializers.py    # DRF serializers (Python ↔ JSON)
│   │   ├── views.py          # API views (CRUD + stats)
│   │   └── urls.py           # API URL routing
│   ├── Dockerfile            # Backend container definition
│   └── requirements.txt      # Python dependencies
├── frontend/
│   └── src/
│       ├── api/
│       │   └── jobs.ts       # Axios API calls
│       ├── components/
│       │   ├── JobModal.tsx  # Add/Edit form modal
│       │   ├── JobTable.tsx  # Applications table
│       │   └── StatsBar.tsx  # Status statistics bar
│       ├── types/
│       │   └── index.ts      # TypeScript interfaces
│       └── App.tsx           # Root component
├── docker-compose.yml        # Multi-container orchestration
└── README.md
```

---

## 🔌 API Reference

Base URL: `http://localhost:8000/api`

### Job Applications

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/jobs/` | List all applications |
| `GET` | `/jobs/?status=Applied` | Filter by status |
| `POST` | `/jobs/` | Create a new application |
| `GET` | `/jobs/{id}/` | Get a single application |
| `PUT` | `/jobs/{id}/` | Update an application |
| `DELETE` | `/jobs/{id}/` | Delete an application |
| `GET` | `/stats/` | Get counts by status |

### Example: Create a Job Application

```bash
curl -X POST http://localhost:8000/api/jobs/ \
  -H "Content-Type: application/json" \
  -d '{
    "company_name": "Acme Corp",
    "job_title": "Backend Developer",
    "location": "London",
    "salary": "75000.00",
    "status": "Applied",
    "date_applied": "2026-03-09",
    "notes": "Applied via LinkedIn"
  }'
```

### Example: Stats Response

```json
{
  "Applied": 5,
  "Interview": 2,
  "Offer": 1,
  "Rejected": 3,
  "total": 11
}
```

### Job Application Model

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `company_name` | string | ✅ | Company name |
| `job_title` | string | ✅ | Job title |
| `location` | string | ✅ | Job location |
| `salary` | decimal | ❌ | Salary (optional) |
| `status` | enum | ✅ | Applied / Interview / Offer / Rejected |
| `date_applied` | date | ✅ | Date of application |
| `notes` | text | ❌ | Free-text notes |
| `created_at` | datetime | auto | Record creation timestamp |
| `updated_at` | datetime | auto | Last update timestamp |

---

## 🐳 Docker Architecture

```
┌─────────────────────────────────────────┐
│           docker-compose.yml            │
│                                         │
│  ┌─────────────┐    ┌────────────────┐  │
│  │   backend   │    │       db       │  │
│  │             │───▶│                │  │
│  │  Django     │    │  PostgreSQL 16 │  │
│  │  Port 8000  │    │  Port 5432     │  │
│  └─────────────┘    └────────────────┘  │
│         ▲                    │          │
│         │            postgres_data      │
│         │            (named volume)     │
└─────────┼───────────────────────────────┘
          │
    Your Browser
    Port 5173 (Vite)
```

- **`db`** starts first with a healthcheck
- **`backend`** waits until `db` is healthy, then runs migrations and starts
- **`postgres_data`** volume persists data across container restarts

---

## 🛠️ Development

### Useful Commands

```bash
# Start everything
docker compose up

# Rebuild after dependency changes
docker compose up --build

# Stop everything
docker compose down

# Stop and delete the database volume (fresh start)
docker compose down -v

# View backend logs
docker compose logs backend

# Run Django management commands
docker compose exec backend python manage.py <command>

# Create a superuser for Django admin
docker compose exec backend python manage.py createsuperuser
```

### Django Admin

Visit `http://localhost:8000/admin` to access the Django admin panel.
Create a superuser first:
```bash
docker compose exec backend python manage.py createsuperuser
```

### Running Tests

```bash
# Backend tests
docker compose exec backend python manage.py test

# Frontend type checking
cd frontend && npx tsc --noEmit
```

---

## 🗺️ Roadmap

- [ ] Dockerise the frontend (single `docker compose up` for everything)
- [ ] Sort table by any column
- [ ] Export applications to CSV
- [ ] Notes expansion on row click
- [ ] Dark mode
- [ ] User authentication (multi-user support)
- [ ] Email reminders for follow-ups
- [ ] Kanban board view

---

## 🧠 What I Learned Building This

- **Django ORM** — defining models, writing migrations, using `annotate` and `values` for aggregate queries
- **Django REST Framework** — generic views, serializers, custom API endpoints
- **React + TypeScript** — typed props, custom hooks, `useCallback` for memoised data fetching
- **Docker Compose** — multi-container orchestration, health checks, named volumes, service dependencies
- **CORS** — understanding why browsers block cross-origin requests and how middleware solves it
- **REST API design** — structuring endpoints, HTTP methods, and response shapes

---

## 📄 Licence

MIT — free to use, modify and distribute.

---

## 👤 Author

**Kabir**
- GitHub: [@Kb1r](https://github.com/Kb1r)
- Project: [Job-Tracker](https://github.com/Kb1r/Job-Tracker)
