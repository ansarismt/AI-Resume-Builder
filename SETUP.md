# AI Resume Builder setup (Windows)

## Prerequisites

- Python 3.11+
- Node.js 20.19+ or 22.12+ with npm (required by Vite 7)

## Install

Open PowerShell in the project directory:

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
Copy-Item .env.example .env
python manage.py migrate
npm install
```

If PowerShell blocks activation, use `.\.venv\Scripts\python.exe` and `.\.venv\Scripts\pip.exe` directly instead of changing the machine's execution policy.

Edit `.env` and replace `DJANGO_SECRET_KEY` with a unique value. AI generation is optional; configure `LLM_PROVIDER`, `LLM_API_KEY`, and `LLM_MODEL` there to enable it. Do not put API keys in the frontend or commit `.env`.

## Start both servers

Run these commands in separate terminals from the project directory:

```powershell
# Terminal 1
.\.venv\Scripts\Activate.ps1
python manage.py runserver
```

```powershell
# Terminal 2
npm run dev
```

Open <http://localhost:8080>. The Django API is at <http://127.0.0.1:8000/api/>. Alternatively, run `start-dev.bat` to open both development servers in separate terminal windows.

Create staff credentials interactively when needed:

```powershell
python manage.py createsuperuser
```

There are no default admin credentials.

## Optional dataset model

Put only the provided `Resume/Resume.csv` at `data/Resume.csv`, then train the local model:

```powershell
python manage.py train_model
```

The source dataset and trained artifacts are gitignored and must not be copied to public web assets.

## Verify

```powershell
python manage.py check
python manage.py test resumes ai
npm run typecheck
npm run lint
npm run build
```

See [README.md](./README.md) for architecture, configuration, and additional project details.
