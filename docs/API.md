# API reference

The API is rooted at `/api/`. JSON requests use `Content-Type: application/json`. Authenticated
requests use `Authorization: Token <token>`. Resume and AI data endpoints require authentication
unless otherwise noted. Rate limits and validation errors are returned as standard DRF responses.

## Accounts

| Method | Path                 | Purpose                               |
| ------ | -------------------- | ------------------------------------- |
| POST   | `/api/auth/signup/`  | Create an account and obtain a token. |
| POST   | `/api/auth/login/`   | Authenticate and obtain a token.      |
| GET    | `/api/auth/me/`      | Return the authenticated account.     |
| POST   | `/api/auth/logout/`  | Revoke the current token.             |
| PUT    | `/api/auth/account/` | Update account credentials.           |

## Resumes

| Method                  | Path                             | Purpose                                     |
| ----------------------- | -------------------------------- | ------------------------------------------- |
| GET, POST               | `/api/resumes/`                  | List owned resumes or create one.           |
| GET, PUT, PATCH, DELETE | `/api/resumes/{id}/`             | Read, update, or delete an owned resume.    |
| GET                     | `/api/resumes/{id}/export_docx/` | Export an editable DOCX.                    |
| GET                     | `/api/resumes/{id}/export_pdf/`  | Export a backend PDF for supported text.    |
| GET                     | `/api/resumes/{id}/export_json/` | Export JSON.                                |
| GET                     | `/api/resumes/{id}/export_txt/`  | Export plain text.                          |
| POST                    | `/api/resume/detect-type/`       | Detect a suggested user type; rate-limited. |

Resume writes validate user type, category, links, accent color, and ownership-sensitive fields.
See the serializers and regression tests in `resumes/` for the precise request shape.

## AI

AI endpoints are rooted at `/api/ai/`: `parse-resume/`, `summary/`, `improve-bullets/`,
`ats-score/`, `job-role-match/`, `resume-strength/`, `tailor-to-job/`, `cover-letter/`,
`cover-letter/export/{extension}/`, `skills-suggest/`, `grammar-check/`,
`interview-questions/`, `linkedin-headline/`, `model-info/`, and `model-status/`.

Local analysis endpoints use the trained dataset model when available. Text-generation endpoints
require an enabled provider and are separately rate-limited. Never include API keys in browser
requests or issue reports.
