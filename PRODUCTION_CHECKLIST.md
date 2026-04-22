# Job Tracker — Production Readiness Checklist

A task list you can tick off before deploying to Railway / Heroku / DigitalOcean. Grouped by file and concern. Each item includes a short "why" so you can prioritize.

---

## 1. Backend — `config/settings.py`

- [ ] Remove the `'fallback-dev-key'` default from `SECRET_KEY`. Use `os.environ['DJANGO_SECRET_KEY']` so the app fails fast if the env var is missing.
- [ ] Change `DEBUG` default to `'False'` (capital F matters) and only set `True` explicitly in local `.env`.
- [ ] Replace `ALLOWED_HOSTS = ['*']` with a comma‑split list from an env var, e.g. your Railway domain + custom domain.
- [ ] Add `CSRF_TRUSTED_ORIGINS` containing your frontend URL (required in Django 4+ when frontend and backend are on different origins).
- [ ] Replace `CORS_ALLOW_ALL_ORIGINS = True` with `CORS_ALLOWED_ORIGINS = [...]` containing just your frontend domain.
- [ ] Keep `CORS_ALLOW_CREDENTIALS = True` only if you actually use cookie auth; otherwise remove.
- [ ] Add a `if not DEBUG:` block with:
  - [ ] `SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')`
  - [ ] `SECURE_SSL_REDIRECT = True`
  - [ ] `SESSION_COOKIE_SECURE = True`
  - [ ] `CSRF_COOKIE_SECURE = True`
  - [ ] `SECURE_HSTS_SECONDS = 31536000`
  - [ ] `SECURE_HSTS_INCLUDE_SUBDOMAINS = True`
  - [ ] `SECURE_HSTS_PRELOAD = True`
  - [ ] `X_FRAME_OPTIONS = 'DENY'`
- [ ] Install `django-environ` or `python-dotenv` and load `.env` at the top of `settings.py`.
- [ ] Swap hardcoded `DATABASES` dict for `dj-database-url` reading `DATABASE_URL` (works with Railway/Heroku out of the box).
- [ ] Add `DATA_UPLOAD_MAX_MEMORY_SIZE = 5 * 1024 * 1024` and `FILE_UPLOAD_MAX_MEMORY_SIZE = 5 * 1024 * 1024` so oversized payloads are rejected at the boundary.
- [ ] Confirm `whitenoise.middleware.WhiteNoiseMiddleware` is right after `SecurityMiddleware` (it already is).
- [ ] Set `STORAGES` (Django 5 style) or keep `STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'`.
- [ ] For production media uploads, install `django-storages[boto3]` and point `DEFAULT_FILE_STORAGE` at S3 — Railway/Heroku ephemeral disks will lose uploads.
- [ ] Add a default `REST_FRAMEWORK` block with `DEFAULT_THROTTLE_CLASSES`, `DEFAULT_THROTTLE_RATES`, and `DEFAULT_PERMISSION_CLASSES`.

## 2. Backend — `jobs/models.py`

- [ ] Add `FileExtensionValidator(['pdf'])` to `resume_pdf`.
- [ ] Add a custom `validate_pdf_size` validator that raises `ValidationError` if `value.size > 5 * 1024 * 1024`.
- [ ] Consider an index on `status` and `date_applied` once you have >1k rows.

## 3. Backend — `jobs/serializers.py`

- [ ] Add a `validate_job_url` method that rejects anything whose parsed `scheme` isn't in `{'http', 'https'}`.
- [ ] Add a `validate_resume_pdf` method that checks `content_type == 'application/pdf'` and size ≤ 5 MB.
- [ ] Add a `validate_status` method that confirms the value is in `JobApplication.STATUS_CHOICES` keys.

## 4. Backend — `jobs/views.py`

- [ ] The `update_status` action currently accepts any string — validate `new_status` against `STATUS_CHOICES`.
- [ ] Replace the six separate `.count()` queries in `stats` with a single `aggregate()` using `Count(Case(When(...)))` or a `values('status').annotate(Count('id'))`.
- [ ] Make the lowercase keys in `stats` match the capitalized keys the frontend `Stats` type expects — or vice versa (currently they mismatch, which is why the stats bar is empty).
- [ ] Add `permission_classes` (at least `IsAuthenticatedOrReadOnly`, ideally `IsAuthenticated`) once auth is in.

## 5. Backend — Deployment plumbing

- [ ] `Procfile`: `web: gunicorn config.wsgi --log-file - --workers ${WEB_CONCURRENCY:-3} --timeout 30`
- [ ] Add `release: python manage.py migrate --noinput` line to run migrations on deploy.
- [ ] Add a `runtime.txt` (Heroku) or `.python-version` (Railway) pinning Python (e.g. `3.12`).
- [ ] Pin every dependency in `requirements.txt` (already done — good).
- [ ] Add `python manage.py collectstatic --noinput` to the build command.
- [ ] Add `.env.example` to the repo documenting every required env var (`DJANGO_SECRET_KEY`, `DATABASE_URL`, `ALLOWED_HOSTS`, `DEBUG`, `CORS_ALLOWED_ORIGINS`, etc.).
- [ ] Ensure `.env`, `db.sqlite3`, `media/`, `staticfiles/`, `venv/`, `__pycache__/` are in `.gitignore`.

## 6. Frontend — `src/App.tsx`

- [ ] Add `error` state and render a user‑facing error banner when `fetchData` fails.
- [ ] Wrap `handleDelete` in try/catch and surface the error.
- [ ] Replace `alert('Save failed.')` with a toast (`react-hot-toast` or `sonner`) and include the server's validation message.
- [ ] Consider migrating `fetchData` / `getStats` to `@tanstack/react-query` — you get loading, error, retry, and cache invalidation for free.
- [ ] Align the `Follow-up` filter logic with the backend (`icontains='Followed up'`) so counts and visible rows match.

## 7. Frontend — `src/components/JobTable.tsx`

- [ ] Empty state: render a centered "No applications yet" card with a CTA when `jobs.length === 0`. Differentiate empty‑filter vs empty‑dataset.
- [ ] Switch both `<a>` tags (job URL link and PDF link) from `rel="noreferrer"` to `rel="noopener noreferrer"`.
- [ ] For the status `<select>`, add optimistic UI — update local state first, roll back on error.
- [ ] Remove the `onRefresh` prop once status updates become optimistic, or keep it and document why both exist.

## 8. Frontend — `src/components/JobModal.tsx`

- [ ] Validate file on select: reject `file.size > 5 * 1024 * 1024` and `file.type !== 'application/pdf'`, with an inline error message.
- [ ] Validate `job_url` with `new URL(value)` and confirm `protocol ∈ {'http:', 'https:'}`.
- [ ] Replace all `any` usage with `JobApplicationFormData` (see Types section).
- [ ] Display field‑level errors from `err.response.data` (DRF returns a `{field: [messages]}` shape).
- [ ] Reset form state when `onClose` is called, not only when `job` changes.

## 9. Frontend — `src/api/jobs.ts`

- [ ] Replace the hardcoded `http://localhost:8000/api/jobs` baseURL with `import.meta.env.VITE_API_URL`.
- [ ] Add a response interceptor that normalizes errors into `{ message, fieldErrors }` for the UI layer.
- [ ] Add a request interceptor that attaches an auth token (or CSRF token) once auth is introduced.
- [ ] Remove `any` from `createFormData`, `createJob`, `updateJob` — use `JobApplicationFormData` / `JobApplicationPayload`.

## 10. Frontend — `src/types/index.ts`

- [ ] Split `JobApplication` (read model, `resume_pdf: string | null`) from `JobApplicationPayload` (write model, `resume_pdf: File | null`).
- [ ] Fix `Stats` interface to match backend (lowercase keys: `new`, `applied`, `follow_up`, `interview`, `offer`, `rejected`, `total`).
- [ ] Add `Followed up (1‑4)` variants and the missing `"Technical Test"`, `"Closed / No interest"`, `"No response"` options to the `Status` union so it matches the backend's `STATUS_CHOICES`.
- [ ] Consider a branded `type JobId = number & { __brand: 'JobId' }` if you want extra safety on id handling.

## 11. Frontend — TypeScript config

- [ ] Enable `"strict": true` in `tsconfig.app.json`.
- [ ] Enable `"noImplicitAny": true`, `"strictNullChecks": true`.
- [ ] Optionally `"exactOptionalPropertyTypes": true` to catch `undefined` vs missing‑key bugs.
- [ ] Run `tsc --noEmit` in CI to block regressions.

## 12. Frontend — UX polish

- [ ] Replace the "Syncing Pipeline..." text with skeleton rows (`animate-pulse` divs sized to the table layout) so there's no layout shift.
- [ ] Add an optional top progress bar (e.g. `nprogress`) during any mutation.
- [ ] Show a toast confirming successful save/delete/status change.
- [ ] Add keyboard handling to the modal (Escape to close, focus trap, autofocus first input).
- [ ] Make the modal accessible: `role="dialog"`, `aria-labelledby`, `aria-modal="true"`.
- [ ] Add `loading="lazy"` / defer heavy assets if any.
- [ ] Add favicon and a proper `<title>` in `index.html`.

## 13. Frontend — Build & deployment

- [ ] Create `.env.production` with `VITE_API_URL=https://your-api.example.com`.
- [ ] Add a `vercel.json` / `netlify.toml` / Railway service config with SPA fallback (`/* -> /index.html`).
- [ ] Verify `npm run build` produces a clean `dist/` with no source maps shipped to production (or explicitly enable them if you want Sentry).
- [ ] Add cache‑busting headers (Vite does this by default via hashed filenames).

## 14. Cross‑cutting — Observability & reliability

- [ ] Add Sentry (or similar) to both backend and frontend.
- [ ] Add a `/healthz` endpoint returning `200 OK` for the platform's healthcheck.
- [ ] Configure Django logging to write JSON to stdout for Railway/Heroku log drain.
- [ ] Set up automated DB backups on your hosted Postgres.
- [ ] Add basic tests: one happy‑path test per endpoint + one 400 per validator.

## 15. Cross‑cutting — Security hygiene

- [ ] Rotate the `DJANGO_SECRET_KEY` and never commit it.
- [ ] Review the repo's git history for accidentally committed secrets (`git log -p | grep -i secret`).
- [ ] Enable dependabot / Renovate for security updates.
- [ ] Add rate limiting at the platform level if available (Railway/Cloudflare).
- [ ] Add auth: at minimum, DRF token auth or session auth behind a login page — the current API is fully public.

---

**Priority order if you're time‑boxed:**

1. Env vars + `ALLOWED_HOSTS` + CORS (1.1–1.6) — deploy will be insecure without these.
2. File size & URL validation (2, 3, 8) — data integrity.
3. Stats key mismatch (4, 10) — visible bug.
4. `any` cleanup (9, 10, 11) — regression prevention.
5. UX polish (12) — nice to have.
6. Auth + observability (14, 15) — before real users arrive.
