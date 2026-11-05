# Changelog

Notable changes are documented here. This project follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and semantic versioning.

## [Unreleased]

### Added

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
