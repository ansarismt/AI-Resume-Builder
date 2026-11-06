# Changelog

Notable changes are documented here. This project follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and semantic versioning.

## [Unreleased]

### Added

- 30 templates (was 20): five new layouts (minimal, bold, elegant, technical, ribbon), each in sans
  and serif.
- Six resume types (was 3): career changer, freelancer, and senior leader, with their own sections
  in the form, preview, and exports.
- Six download formats (was 4): Markdown and a standalone HTML page, generated in the browser.
- Live resume health score with 30 checks, word count, and copy-as-plain-text.
- Resume classifier reads the headline as a separate, weighted feature: held-out accuracy 70.8% to
  83.3%, macro-F1 0.67 to 0.80, top-3 accuracy 94.2%. AI Studio now sends the headline to the model.
- Draft autosave with a restore banner, unsaved-changes warning, and a working Ctrl+S shortcut.
- Signed-in page in labelled sections with a sticky section menu: overview cards, quick actions,
  interview-ready checklist, application tracker, template showcase, action-verb bank (96 verbs),
  interview practice (40 questions), and career tips (12).
- Saved resumes: search, sort, and duplicate.
- Landing page built around the logo's dart: a magnetic, clickable hero dart and a scroll guide
  that travels between section headings; feature showcase bands.
- Theme-aware Login and Sign-up hero ("launch control").
- Light, dark, and system themes with a toggle and a smooth cross-fade.
- New logo, white dark-theme logo, and white-on-blue favicon and app icon; "Developed by VDart" in
  the footer.
- Skip-to-content link, reading-progress bar, and back-to-top button.
- Shared category mapping, frontend test coverage, accessibility checks, CI, and repository
  contribution/security documentation.

### Fixed

- The scroll guide no longer freezes near the bottom of the landing page: its position is now a
  continuous function of scroll across all section headings instead of "nearest visible heading".

### Removed

- Unused `components/preview` wrapper, unused `resume/ResumePreview`, and stale animation CSS.

### Changed

- Redesigned interface: simpler landing page with an animated resume-check demo, one bundled
  font (Plus Jakarta Sans), consistent cards and spacing across every page, and a logo and
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
