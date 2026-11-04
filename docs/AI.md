# AI features and privacy

## Two distinct systems

- **Local dataset model:** the scikit-learn classifier and category statistics power resume
  strength, role matching, skills suggestions, and job-description analysis. Training is optional;
  without local artifacts, the API reports that those features are unavailable. This model does not
  write or parse prose.
- **Generative provider:** configured on the Django backend through `LLM_PROVIDER`, `LLM_API_KEY`,
  `LLM_MODEL`, and optionally `LLM_BASE_URL`. It supports resume import/parsing and writing tools
  such as summaries, bullet improvements, tailoring, cover letters, grammar checks, interview
  questions, and LinkedIn headlines. A compatible local Ollama endpoint can be configured.

## Data handling

Resume data is sent to the backend for saved-resume and analysis operations. Local model analysis
runs on the backend. When a user invokes a generative tool, only the request content needed for
that operation is sent to the configured provider. Review the provider's retention and privacy
terms before enabling it. The app does not intentionally log resume bodies or provider credentials.
Do not upload real resumes in public bug reports or sample fixtures.

AI output can be incomplete or incorrect. Review all suggestions and never treat model scores as
hiring decisions. Do not accept invented qualifications or accomplishments.

## Train the local model

Place the appropriately licensed dataset at `data/Resume.csv` with `Resume_str` and `Category`
columns, then run:

```powershell
.\.venv\Scripts\python.exe manage.py train_model
```

Generated models, statistics, and metrics are written to `ai/ml/artifacts/`, which is gitignored.
The training data is not included in this repository. Ensure you have permission to use any data
before training.
