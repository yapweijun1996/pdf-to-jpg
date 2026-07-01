# Roadmap

This roadmap is based on the current product review and should be updated after each meaningful product change.

## Product Goal

Make PDF to JPG conversion private, simple, reliable, and useful enough for repeat office use.

## Completed: Pro Baseline

The initial Pro baseline now includes:

- Batch PDF upload and grouped outputs.
- Page range selection.
- Compact, standard, and high quality/DPI presets.
- Custom output base naming.
- Cancel control for long conversions.
- Forgiving PDF validation for empty-MIME `.pdf` files.
- Inline ZIP error recovery.
- Typecheck, lint, build, audit, and Playwright smoke test gates.

## P0: Harden Large-File Behavior

These items reduce failure risk for large or unusual PDFs.

### 1. Large Page Count Warning

Rationale: Browser memory is still the main constraint.

Acceptance checks:

- App warns before converting very large selected page counts.
- User can switch to compact output from the warning.
- User can cancel before any page render begins.

### 2. Real-Device Browser QA

Rationale: Chromium smoke tests do not fully represent iOS Safari and mobile file pickers.

First PR:

- Run iOS Safari file picker, conversion, download, and PWA checks.
- Run Android Chrome conversion and install checks.
- Record any browser-specific limits in docs.

Acceptance checks:

- iOS Safari can complete a one-page conversion.
- Mobile controls do not overlap.
- Known browser-specific constraints are documented.

## P1: Product Learning

### 3. Privacy-Safe Analytics

Rationale: Product decisions need success/failure signals, but the privacy promise must stay intact.

Acceptance checks:

- No file names, file text, or image content are collected.
- Events include only coarse performance and failure metadata.
- Privacy policy is updated before analytics ship.

### 4. Large File Performance Mode

Rationale: Memory pressure can become the main constraint for large PDFs.

Acceptance checks:

- App warns before converting very large page counts.
- User can choose lower-memory output.
- Object URLs are revoked when no longer needed.

## Not In Scope Yet

- Server-side conversion.
- Account system.
- Cloud file storage.
- OCR or PDF text extraction.
- Editing PDFs before conversion.
