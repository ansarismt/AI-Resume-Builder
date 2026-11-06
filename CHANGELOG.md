# Changelog

Notable changes are documented here. This project follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and semantic versioning.

## [Unreleased]

### Added

- Light/dark theme toggle (saved in the browser, follows the system setting on first visit).
- Sticky navigation with section links, mobile menu and scroll-aware background; new footer.
- "Inside the model" landing section: real evaluation metrics (accuracy, top-3, macro F1), the analysis pipeline, a live in-browser category preview built from the dataset's keywords, and the cross-validated model comparison. Data comes from `shared/modelPreview.json` (regenerate with `python scripts/export_model_preview.py`).
- "Aim for your next role" slingshot: drag and release the brand arrow at a career goal to get a resume plan (goal buttons also work).
- Rotating hero headline phrase.
- Landing hero arrow field: a grid of brand arrows that turn toward the pointer and ripple on click.
- Sign-in/sign-up hero: a brand arrow that chases the pointer with a comet trail, plus a progress track that fills as the form is completed.
- Landing "Try the AI tools" playground (six tools with sample output) and a drag-to-compare before/after resume slider.
- Earlier hero arrow (leans toward the pointer, launches on click; since replaced by the arrow field), a scroll-progress arrow rail with section jumps, arrow accents on section headings and the closing call to action.
- Brand arrow traced from the supplied logo, animated on load, hover and click (respects reduced motion).
- Split-screen sign-in and sign-up pages with show/hide password, inline validation, confirm password and a live strength meter.
- Shared category mapping, frontend test coverage, accessibility checks, CI, and repository
  contribution/security documentation.

### Changed

- Redesigned interface: simpler landing page with an animated resume-check demo, one bundled
  font (Plus Jakarta Sans), consistent cards and spacing across every page, and a new logo and
  favicon.
- Template page: full-width grid with a right-edge Preview tab that opens a full-screen preview
  panel with a live template and colour switcher.
- Word downloads now follow the selected template layout, colour and font; the PDF button is
  labelled Download PDF.
- Resume headline is separate from target job category; PDF downloads use the browser print flow.
- Authentication, resume validation, model handling, and exports have regression coverage and
  hardened behavior.

### Fixed

- Blank trailing page in printed PDFs, filler values such as "0" or "N/A" from small AI models
  when importing resumes, and a dead saved-resumes page.
- Corrected account validation and token lifecycle, AI provider/model edge cases, and document
  export handling.
