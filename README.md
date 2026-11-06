# AI Resume Builder

[![CI](https://github.com/ansarismt/AI-Resume-Builder/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/ansarismt/AI-Resume-Builder/actions/workflows/ci.yml)
[![Python 3.11+](https://img.shields.io/badge/python-3.11%2B-blue.svg)](https://www.python.org/)
[![Node 20.19+](https://img.shields.io/badge/node-20.19%2B-green.svg)](https://nodejs.org/)

Create a polished, editable resume with a guided React editor, private saved versions, 30 templates,
and optional local analysis and AI writing tools. Developed by [VDart](https://www.vdart.com).

![Resume templates](docs/screenshots/templates.png)

![Resume editor preview](docs/screenshots/editor.png)

## Features

- Guided resume editor and live preview for six resume types: school, college, professional,
  career changer, freelancer, and senior leader.
- 30 professional templates, saved resumes, and version history.
- Vector, selectable-text PDF through the browser print dialog; editable DOCX, JSON, TXT,
  Markdown, and standalone HTML downloads.
- PDF and DOCX import with AI-assisted field extraction.
- Dataset-powered AI Studio for resume-strength feedback, role matches, skills, and job-description
  comparison.
- Optional provider-backed writing tools, including summaries, bullet rewrites, tailoring, and
  cover letters.
- Live resume health score (30 checks), draft autosave with restore, unsaved-changes warning, and
  keyboard shortcuts (Ctrl+S save, Ctrl+P print, `?` for help).
- Career toolkit after sign-in: interview-ready checklist, application tracker, template showcase,
  action-verb bank, interview practice, and career tips.
- Light, dark, and system themes across every page, with a smooth cross-fade when switching.
- An animated landing page built around the logo's dart: it reacts to the cursor, loops when
  clicked, and guides readers from section to section as they scroll. Motion is disabled for
  visitors who prefer reduced motion.

## Architecture

```mermaid
flowchart LR
  B[Browser: React and Vite] -- REST and token --> D[Django REST API]
  D --> DB[(SQLite)]
  D --> ML[Local scikit-learn model]
  D -. optional .-> L[OpenAI-compatible provider or local Ollama]
```

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for boundaries and data flow.

## Requirements

- Python 3.11 or newer.
- Node.js 20.19+ and npm (Vite 7 requirement).
- Windows, macOS, or Linux.

## Quick start

### Windows

```powershell
git clone https://github.com/ansarismt/AI-Resume-Builder.git AI-Resume-Builder
cd AI-Resume-Builder
.\start-dev.bat
```

The launcher creates `.env` from `.env.example` only when needed, creates the virtual environment,
installs dependencies when their lock files change, migrates the local database, then opens the
backend and frontend in separate terminal windows. Review `.env`; keep the example secret only for
local development. Open <http://127.0.0.1:8080>.

### macOS and Linux

```bash
git clone https://github.com/ansarismt/AI-Resume-Builder.git AI-Resume-Builder
cd AI-Resume-Builder
chmod +x scripts/dev.sh && ./scripts/dev.sh
```

The script performs the same setup, then runs Django and Vite in the current terminal. Press
Ctrl+C to stop both servers.

### Manual two-terminal setup

If you prefer separate shells, create a virtual environment and install dependencies first:

```powershell
python -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
if (!(Test-Path .env)) { Copy-Item .env.example .env }
npm ci
.\.venv\Scripts\python.exe manage.py migrate
```

Run `.\.venv\Scripts\python.exe manage.py runserver 127.0.0.1:8000` in one terminal and
`npm run dev` in another. On macOS/Linux, activate `.venv`, use `python` instead, and run
`cp .env.example .env`.

## Configuration

Copy `.env.example` to `.env` for local development. Blank LLM values disable provider-backed
writing tools; the local dataset model works independently.

| Variable                         | Default                                       | Purpose                                                          |
| -------------------------------- | --------------------------------------------- | ---------------------------------------------------------------- |
| `DJANGO_SECRET_KEY`              | `generate-a-random-secret-key`                | Django signing key; replace with a unique secret for deployment. |
| `DJANGO_DEBUG`                   | `True` in example; `False` in code            | Local debug mode; must be false in deployment.                   |
| `DJANGO_ALLOWED_HOSTS`           | `localhost,127.0.0.1`                         | Comma-separated Django hosts.                                    |
| `DJANGO_DB_NAME`                 | `db.sqlite3` in example                       | SQLite database path.                                            |
| `CORS_ALLOWED_ORIGINS`           | `http://127.0.0.1:8080,http://localhost:8080` | Browser origins allowed to call the API.                         |
| `TOKEN_TTL_DAYS`                 | `14`                                          | Authentication token lifetime in days.                           |
| `LLM_PROVIDER`                   | blank                                         | `openai`, `openai-compatible`, or the supported local provider.  |
| `LLM_API_KEY`                    | blank                                         | Provider credential; backend only.                               |
| `LLM_MODEL`                      | blank                                         | Provider model name.                                             |
| `LLM_BASE_URL`                   | blank                                         | Optional base URL for compatible providers.                      |
| `LLM_TEMPERATURE`                | provider default                              | Optional generation temperature.                                 |
| `LLM_MAX_TOKENS`                 | `2048`                                        | Maximum provider output tokens.                                  |
| `VITE_API_URL`                   | `http://127.0.0.1:8000/api`                   | Frontend API base URL.                                           |
| `SECURE_SSL_REDIRECT`            | enabled when debug is false                   | Force HTTPS in production.                                       |
| `SECURE_HSTS_SECONDS`            | `31536000` in production                      | HTTP Strict Transport Security lifetime.                         |
| `SECURE_HSTS_INCLUDE_SUBDOMAINS` | enabled in production                         | Include subdomains in HSTS.                                      |
| `SESSION_COOKIE_SECURE`          | enabled in production                         | Send session cookies only over HTTPS.                            |
| `CSRF_COOKIE_SECURE`             | enabled in production                         | Send CSRF cookies only over HTTPS.                               |
| `SECURE_CONTENT_TYPE_NOSNIFF`    | `True`                                        | Add the content-type nosniff protection.                         |
| `X_FRAME_OPTIONS`                | `DENY`                                        | Prevent framing by other sites.                                  |

Production security settings are overridable for deployment-specific infrastructure. Use a valid
HTTPS origin and never commit `.env`.

## AI features and privacy

| Feature                                                                   | System                                           | API key                         |
| ------------------------------------------------------------------------- | ------------------------------------------------ | ------------------------------- |
| Resume strength and career-category matches                               | Local scikit-learn model                         | No, if trained artifacts exist. |
| Job-description comparison                                                | Local scikit-learn model                         | No, if trained artifacts exist. |
| Skills suggestions                                                        | Local dataset statistics, with provider fallback | Usually no.                     |
| Resume import/parsing and writing suggestions                             | Configured generative provider                   | Yes.                            |
| Tailoring, cover letters, grammar, interview questions, LinkedIn headline | Configured generative provider                   | Yes.                            |

Dataset analysis runs on the Django backend. When a generative tool is used, the submitted content
is sent by the backend to the configured provider. Review its privacy and retention terms. AI output
may be inaccurate; verify every claim and never accept invented qualifications. See
[docs/AI.md](docs/AI.md) and [SECURITY.md](SECURITY.md).

Training is optional. Put an appropriately licensed CSV with `Resume_str` and `Category` columns at
`data/Resume.csv`, then run:

```powershell
.\.venv\Scripts\python.exe manage.py train_model
```

Training data and generated files under `ai/ml/artifacts/` are local and gitignored, so a fresh
clone has no trained model until you run `train_model`.

The classifier combines a TF-IDF of the whole resume with a separately weighted TF-IDF of its first
line (the job title) and a calibrated linear SVM. On the 24-category resume dataset it scores, on a
held-out 20% test split, **83.3% top-1 accuracy**, **94.2% top-3 accuracy**, and **0.80 macro-F1**.
The two smallest categories (BPO and Automobile) are much weaker because they have very few
examples. These numbers are shown on the landing page from `src/lib/modelStats.ts`; update that file
after retraining.

## Templates

| Template         | Layout       | Font  |
| ---------------- | ------------ | ----- |
| Executive        | Classic      | Serif |
| Corporate        | Classic      | Sans  |
| Professional     | Modern       | Sans  |
| Heritage         | Modern       | Serif |
| Navy Sidebar     | Sidebar      | Sans  |
| Charcoal Sidebar | Sidebar      | Serif |
| Slate Aside      | Sidebar      | Sans  |
| Refined Aside    | Sidebar      | Serif |
| Banner           | Header band  | Sans  |
| Banner Serif     | Header band  | Serif |
| Split            | Two column   | Sans  |
| Split Serif      | Two column   | Serif |
| Compact          | Space saving | Sans  |
| Compact Serif    | Space saving | Serif |
| Timeline         | Structured   | Sans  |
| Timeline Serif   | Structured   | Serif |
| ATS Plain        | ATS friendly | Sans  |
| ATS Classic      | ATS friendly | Serif |
| Framed           | Formal       | Sans  |
| Framed Serif     | Formal       | Serif |
| Minimal          | Minimal      | Sans  |
| Minimal Serif    | Minimal      | Serif |
| Bold             | Bold         | Sans  |
| Bold Serif       | Bold         | Serif |
| Elegant          | Elegant      | Serif |
| Elegant Sans     | Elegant      | Sans  |
| Technical        | Technical    | Sans  |
| Technical Serif  | Technical    | Serif |
| Ribbon           | Ribbon       | Sans  |
| Ribbon Serif     | Ribbon       | Serif |

Templates use the restrained palette in `shared/templates.json`. To add a template, update that
catalog; add layout CSS only when introducing a new layout. New layouts also need an entry in
`LAYOUT_BASE` (`resumes/export_styles.py`), which picks the closest existing layout for Word export.

## Exports

- **PDF:** use the browser print dialog and choose **Save as PDF**. This creates a vector,
  selectable-text PDF from the preview.
- **DOCX:** editable Word document that follows the selected template layout and colour, like the preview.
- **JSON and TXT:** server-generated formats for portability and plain-text use.
- **Markdown and HTML:** generated in the browser; HTML is a standalone, print-friendly page in the
  template colour.

## Project structure

```text
backend/              Django settings, security, and routes
resumes/              Accounts, resume data, versions, and exports
ai/                   AI endpoints, local ML, and provider integration
shared/               Shared template and category catalogs
src/
  routes/             Pages (landing, builder, AI Studio, login, signup, admin)
  components/         landing/ (hero, dart), auth/, dashboard/, resume/, steps/, shared/, ui/
  lib/                API client, auth, theme, drafts, client exports, flight helpers
  pages/              The four builder stages
docs/                 Architecture, API, AI, and screenshots
samples/              Fictional sample resume
scripts/              Cross-platform development and screenshot scripts
.github/              CI, Dependabot, and contribution templates
```

## Available scripts

| Command                                     | What it does                                          |
| ------------------------------------------- | ----------------------------------------------------- |
| `npm run dev`                               | Start the Vite dev server on <http://127.0.0.1:8080>. |
| `npm run build`                             | Production build into `dist/`.                        |
| `npm run preview`                           | Serve the production build locally.                   |
| `npm run typecheck`                         | TypeScript type check.                                |
| `npm run lint`                              | ESLint (with Prettier rules).                         |
| `npm run test`                              | Vitest unit tests (add `-- --run` for a single run).  |
| `npm run check`                             | Typecheck, lint, tests, and build in one go.          |
| `npm run format`                            | Format the repository with Prettier.                  |
| `python manage.py runserver 127.0.0.1:8000` | Start the Django API.                                 |
| `python manage.py train_model`              | Train the local resume classifier.                    |
| `python manage.py test resumes ai`          | Backend test suite.                                   |

## Testing and CI

```powershell
npm run check
$env:DJANGO_DEBUG = "True"
$env:DJANGO_SECRET_KEY = "local-test-key"
$env:DJANGO_DB_NAME = "$env:TEMP\resume-builder-tests.sqlite3"
.\.venv\Scripts\python.exe -m pip install -r requirements-dev.txt
.\.venv\Scripts\python.exe manage.py check
.\.venv\Scripts\python.exe manage.py makemigrations --check --dry-run
.\.venv\Scripts\python.exe manage.py test resumes ai
.\.venv\Scripts\python.exe -m ruff check .
.\.venv\Scripts\python.exe -m ruff format --check .
```

GitHub Actions runs the frontend checks and backend checks on Python 3.11 and 3.12. More API
details are in [docs/API.md](docs/API.md).

## Troubleshooting

- **The page is blank or Vite does not respond:** check the terminal for errors; the watcher
  excludes `.venv/`, `data/`, model artifacts, build output, and generated router files.
- **“AI not configured”:** configure the backend provider, key, and model, then restart Django.
- **Local model unavailable:** add the training CSV and run `train_model`; otherwise local
  analysis features will report that the model is unavailable.
- **Saved-resume session error:** sign in again and confirm that the Django API is running.
- **Print preview shows two pages:** select A4 paper, disable browser headers/footers, and use
  the print preview to confirm page breaks before saving.
- **Port 8000 or 8080 is occupied:** stop the process already using it or adjust local server
  configuration.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for tests and pull-request guidance. Report vulnerabilities
privately as described in [SECURITY.md](SECURITY.md).

## License

Copyright (c) 2026 VDart.
