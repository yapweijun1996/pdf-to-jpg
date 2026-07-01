# Product Review

Last reviewed: 2026-07-01

## Project Goal

PDF to JPG Converter Pro should let users convert PDF pages into JPG images locally in the browser, without uploading files to a server.

## Review Scope

This review covers the current React/Vite codebase, product flow, PWA behavior, deployment workflow, and gaps that matter for a usable public tool.

## Current User Journey

1. User opens the web app.
2. User chooses page range, quality/DPI, and output naming options.
3. User selects or drags in one or more PDFs.
4. The app validates PDF type and the 50 MB per-file size limit.
5. The app loads PDF.js and renders selected pages sequentially.
6. Each rendered page becomes a JPG blob and appears in the preview grid.
7. User downloads one JPG page or all successful outputs as a ZIP file.

## Capability Map

| Capability | Status | Notes |
| --- | --- | --- |
| Batch PDF upload | Present | File picker and drag-and-drop accept one or more PDFs. |
| Forgiving PDF validation | Present | Accepts `application/pdf` and `.pdf` files with empty MIME type. |
| Client-side conversion | Present | PDF.js renders pages locally. |
| Privacy positioning | Present | README, UI, privacy page, and architecture align with no-upload processing. |
| Page range selection | Present | Users can choose all pages or a start/end range. |
| Quality controls | Present | Compact, standard, and high presets map to scale, JPG quality, and DPI. |
| Output naming | Present | Users can enter a base name; batch output stays grouped by source PDF. |
| Page preview | Present | Images are shown progressively. |
| Single image download | Present | Each converted page has a download button. |
| ZIP download | Present | JSZip packages all converted pages. |
| PWA install | Present | Manifest, service worker, install button, and update toast exist. |
| Offline launch | Partial | App shell is cached after production load. Real conversion still depends on cached assets and browser memory. |
| Error recovery | Present | Conversion and ZIP failures render in app UI instead of browser alerts. |
| Long-running conversion control | Present | Reading/rendering can be cancelled from the processing panel. |
| Automated user-flow tests | Present | Playwright smoke test covers empty-MIME PDF upload and downloads. |

## Strengths

- Clear, small code structure with files under 300 lines.
- Product promise is easy to understand: local, private, fast conversion.
- Main flow now supports Pro-level controls for repeat usage.
- PWA and GitHub Pages deployment are built into the project.
- Conversion state is centralized enough to extend safely.
- CI now includes typecheck, lint, audit, build, and smoke test gates.

## Main Product Risks

### R1: Very large PDFs can still pressure browser memory

The app processes selected pages sequentially and supports cancellation, but generated JPG blobs still remain in browser memory until reset or page unload.

Recommended first step: warn on large page counts and offer a lower-memory mode.

Acceptance checks:

- Large page counts show a clear warning before conversion continues.
- Users can choose compact output from the warning.
- Object URLs are revoked when outputs are removed or conversion resets.

### R2: Browser compatibility still needs device coverage

The smoke test covers Chromium. PWA install, file picker behavior, and memory limits can differ on Safari and mobile browsers.

Recommended first step: run real-device checks for iOS Safari and Android Chrome.

Acceptance checks:

- iOS Safari can select PDFs and complete one conversion.
- Android Chrome can install or use the app normally.
- Mobile layout has no overlapping controls.

### R3: No privacy-safe analytics

The app has no telemetry, which is good for privacy but limits product learning about success rate and failure causes.

Recommended first step: decide whether anonymous, content-free event metrics are acceptable.

Acceptance checks:

- No file content, names, page text, or images are collected.
- Metrics are disclosed in the privacy policy before launch.
- Users can understand what is and is not tracked.

## Suggested Product Metrics

- Upload-to-first-preview time.
- Full conversion success rate.
- ZIP download success rate.
- Conversion failure reason.
- Average page count per successful conversion.
- PWA install prompt acceptance rate.

Keep metrics privacy-safe: do not collect file contents, file names, page text, or generated images.

## Open Questions

- Is the target user a casual one-time converter or a repeat office workflow user?
- Is anonymous telemetry acceptable if it records no file content or file names?
- What is the maximum page count the app should support before warning users?
