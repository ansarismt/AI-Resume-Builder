# Contributing

Thanks for helping improve AI Resume Builder. Keep changes focused, preserve privacy, and add a
regression test for each behavior fix.

## Local setup

Follow the [README quick start](README.md#quick-start). Never commit `.env`, databases, generated
model artifacts, screenshots containing real people, or resume data that is not fictional.
Install the extra developer tools before running all checks:

```powershell
.\.venv\Scripts\python.exe -m pip install -r requirements-dev.txt
```

## Before opening a pull request

```powershell
npm run check
$env:DJANGO_DEBUG = "True"
$env:DJANGO_SECRET_KEY = "local-test-key"
$env:DJANGO_DB_NAME = "$env:TEMP\resume-builder-tests.sqlite3"
.\.venv\Scripts\python.exe manage.py check
.\.venv\Scripts\python.exe manage.py makemigrations --check --dry-run
.\.venv\Scripts\python.exe manage.py test resumes ai
.\.venv\Scripts\python.exe -m ruff check .
```

Use conventional commits such as `fix(api): validate resume links` or `docs: clarify local setup`.
Keep generated files and unrelated formatting changes out of the pull request. Update the relevant
documentation when behavior or configuration changes.

## Reporting issues

Use the issue templates and include reproducible steps and tool versions. Remove personal data,
tokens, API keys, and provider request bodies from logs and screenshots.
