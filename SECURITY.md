# Security policy

## Reporting a vulnerability

Please do not report exploitable vulnerabilities in a public issue. Use GitHub's private
vulnerability reporting for this repository. Include affected versions, impact, and safe
reproduction details; do not attach real resumes, secrets, or personal data.

## Supported releases

Security fixes are applied to the current maintained release. Keep dependencies current and deploy
only from a reviewed release.

## Deployment checklist

- Set `DJANGO_DEBUG=False`, use a unique secret key, configure `DJANGO_ALLOWED_HOSTS`, and serve
  only over HTTPS.
- Keep provider API keys on the backend; never put them in a `VITE_` variable or commit `.env`.
- Configure a restrictive Content Security Policy at the HTTPS reverse proxy or hosting layer.
  Account tokens are stored in browser `localStorage`, so a script injection could expose a token.
- Keep SQLite files, model artifacts, user media, and logs outside public/static directories.
- Keep dependencies patched and review authentication throttling, token expiry, ownership checks,
  and allowed CORS origins when changing deployment configuration.

## Data and logs

Do not log passwords, tokens, API keys, or full resume bodies. Use fictional sample content in
tests and screenshots. Treat uploaded documents and generated exports as private user data.
