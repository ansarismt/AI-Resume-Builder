# AI Resume Builder

AI Resume Builder is a full-stack resume builder with a React, TypeScript, and Vite frontend and a Django REST API. It supports a guided resume editor, live previews, 20 templates, private saved resumes, resume exports, local dataset-based career analysis, and optional generative-AI writing tools.

> **Important:** The dataset-trained model and generative AI are different systems. The local model can analyze and classify resume content, but it does not generate or parse text. Generative tools require a configured AI provider and API key.

## Features

- Guided resume editor with a live preview and 20 templates.
- User accounts and private saved resumes, with resume versions.
- PDF, DOCX, JSON, and plain-text TXT exports.
- PDF/DOCX resume import and AI-assisted field extraction.
- Dataset-powered AI Studio for resume-strength feedback, career-category matches, skills to explore, and job-description comparisons.
- Optional AI writing tools for summaries, bullet improvements, resume tailoring, cover letters, grammar checks, interview preparation, and LinkedIn headlines.

PDF exports use the selected template and accent color directly, without relying on the browser
print dialog. DOCX remains editable, though Word may render some spacing differently.

## Which AI features need an API key?

| Tool                                                                                         | Model used                              | Needs provider credentials?                                                       |
| -------------------------------------------------------------------------------------------- | --------------------------------------- | --------------------------------------------------------------------------------- |
| Resume strength and career-category matches                                                  | Local scikit-learn model                | No, if the model has been trained.                                                |
| Job-description comparison                                                                   | Local scikit-learn model                | No, if the model has been trained.                                                |
| Role skills                                                                                  | Local dataset statistics when available | Usually no; may use the generative provider if local suggestions are unavailable. |
| Resume parsing/import, summaries, and bullet rewrites                                        | Configured generative AI provider       | Yes.                                                                              |
| Resume tailoring, cover letters, grammar checks, interview questions, and LinkedIn headlines | Configured generative AI provider       | Yes.                                                                              |

The **Improve with AI** control is available beside the field label for Education, Skills, Projects, Internships, Achievements, Certifications, and Work Experience. Career Objective and Professional Summary have their own AI drafting control in the same position. Suggestions are shown for review before you accept them.

The training dataset is mostly professional resumes, so recommendations for students or underrepresented career categories can be less reliable. Treat scores and career matches as guidance, not hiring predictions. Review AI-generated content and correct it before using it; the tools should not invent your qualifications or accomplishments.

**Privacy:** Dataset analysis runs on the Django backend using the local model. When you use a generative tool, the submitted resume content is sent from the backend to the AI provider configured by the project owner. Do not send information you are not comfortable sharing with that provider.

## Requirements

- Python 3.11 or newer.
- Node.js 20.19+ or 22.12+, with npm (required by Vite 7).
- Windows, macOS, or Linux.

## Setup on Windows

Open PowerShell in the `AI-Resume-Builder` project directory:

```powershell
.\start-dev.bat
```


The launcher creates `.env` from `.env.example` only when needed, creates the Python
virtual environment, installs missing dependencies, applies database migrations, and
opens the Django API and Vite frontend in separate terminal windows. Review `.env`
for local configuration; do not overwrite an existing file. Replace the example
`DJANGO_SECRET_KEY` before deploying, and keep `DJANGO_DEBUG=True` for local
development only. Open <http://127.0.0.1:8080>. The API is at
<http://127.0.0.1:8000/api/> and the Django staff admin is at
<http://127.0.0.1:8000/admin/>.

Alternatively, run each server in its own terminal:

```powershell
# Terminal 1: Django backend
.\.venv\Scripts\python.exe manage.py runserver 127.0.0.1:8000
```

```powershell
# Terminal 2: Vite frontend
npm run dev
```

Create a staff account with `.\.venv\Scripts\python.exe manage.py createsuperuser`. There are no default admin credentials.

### macOS and Linux

Create and activate a virtual environment, install dependencies, copy `.env.example` to `.env` if needed, then migrate and install frontend packages:

```bash
python3 -m venv .venv
source .venv/bin/activate
python -m pip install -r requirements.txt
test -f .env || cp .env.example .env
python manage.py migrate
npm install
```

Start `python manage.py runserver` and `npm run dev` in separate terminals.

## Configure generative AI (OpenAI)

The local dataset model does **not** require an OpenAI key. Resume parsing and writing tools do. To enable them:

1. Open the project’s local `.env` file.
2. Set `LLM_PROVIDER=openai`.
3. Set `LLM_API_KEY` to your own OpenAI API key.
4. Set `LLM_MODEL` to a model available to your OpenAI account.
5. Save `.env` and restart the Django backend.

For example, the configuration has this shape—replace the placeholders locally:

```dotenv
LLM_PROVIDER=openai
LLM_API_KEY=your-private-api-key
LLM_MODEL=your-available-model
```

Never put an API key in frontend code, a `VITE_` variable, source control, screenshots, or chat. Keep `.env` private. Provider access or usage charges may apply to your account.

If a generative feature says **“AI not configured,”** confirm all three settings are present in `.env` and restart Django. A missing provider key does not prevent the independently trained local analysis tools from working.

An OpenAI-compatible provider can also be used by setting `LLM_PROVIDER=openai-compatible`, `LLM_API_KEY`, `LLM_MODEL`, and `LLM_BASE_URL` to that provider’s values.

## Dataset model

Training is optional. The training command expects the supplied CSV at `data/Resume.csv`:

```powershell
.\.venv\Scripts\python.exe manage.py train_model
```

The CSV must include `Resume_str` and `Category` columns. Training writes the classifier, category statistics, and evaluation metrics to `ai/ml/artifacts/`. These artifacts and the private training data are local and gitignored. The AI Studio displays the trained model’s current metrics and reports when the local model is unavailable.

Do not copy raw resume text into frontend assets, public endpoints, fixtures, or logs.

## Troubleshooting

- **The page is blank or the Vite development server does not respond:** check the Vite terminal for startup errors. This project’s Vite watcher excludes the large `.venv/`, `data/`, model-artifact, build, and generated-router directories.
- **“AI not configured”:** add the provider, API key, and model to `.env`, then restart Django. The dataset model cannot replace these credentials for text generation.
- **AI Studio reports the dataset model is unavailable:** place the CSV at `data/Resume.csv` and run the training command above.
- **Saved resumes show a sign-in/session error:** sign in again; saved resumes require an authenticated account and a running Django API.
- **Ports 8000 or 8080 are already in use:** stop the application already using that port or change the corresponding local server configuration.

## Checks and tests

Run these commands from the project directory:

```powershell
# Django checks and backend tests
.\.venv\Scripts\python.exe manage.py check
.\.venv\Scripts\python.exe manage.py test resumes ai

# Frontend checks
npm run typecheck
npm run lint
npm run build
```

## Project structure

| Path                   | Contents                                                               |
| ---------------------- | ---------------------------------------------------------------------- |
| `src/`                 | React app, routes, resume editor, templates, and API client.           |
| `src/lib/resumeApi.ts` | Typed frontend API client and API error handling.                      |
| `resumes/`             | Django authentication, resume, versioning, and export APIs.            |
| `ai/`                  | Authenticated AI API, provider integration, and local ML pipeline.     |
| `backend/`             | Django settings and URL routing.                                       |
| `data/`                | Local training data; gitignored.                                       |
| `ai/ml/artifacts/`     | Locally generated model, metrics, and category statistics; gitignored. |
| `start-dev.bat`        | Windows development launcher.                                          |
