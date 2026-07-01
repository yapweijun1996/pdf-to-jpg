# Quality And Release

This document describes the current release checks and the recommended quality gates for PDF to JPG Converter Pro.

## Current Release Path

The GitHub Pages workflow runs on pushes to `main` or `master` and on manual dispatch.

Current build job:

1. Checkout repository.
2. Set up Node.js 20.19.0.
3. Install dependencies with `npm ci`.
4. Run TypeScript check with `npm run typecheck`.
5. Run lint with `npm run lint`.
6. Run dependency audit with `npm audit`.
7. Build with `npm run build`.
8. Install Chromium for Playwright.
9. Run smoke test with `npm run test:smoke`.
10. Upload `dist` to GitHub Pages.

## Local Verification

Run these commands before release:

```bash
npm install
npm run typecheck
npm run lint
npm run test:smoke
npm run build
npm audit
npm run preview
```

Manual browser checks:

- App opens from the production preview.
- PDF upload works with a small valid PDF and an empty-MIME `.pdf` file.
- Batch PDF upload groups outputs by source file.
- Page range and quality controls affect the conversion run.
- Progress reaches 100%.
- At least one JPG preview appears.
- Cancel stops a long conversion and lets the user start again.
- Single-page download button is visible and usable.
- ZIP download button is visible and usable.
- Privacy, terms, and offline pages load.
- PWA install button behavior is acceptable for the browser under test.

## Automated Gates

- `npm run typecheck` runs `tsc --noEmit`.
- `npm run lint` runs ESLint across the repo.
- `npm run test:smoke` runs the Playwright browser smoke test.
- `npm run verify` runs lint, typecheck, tests, and build locally.

## Release Checklist

- README is accurate for current capabilities.
- Product docs are updated for any changed scope.
- Privacy page still matches actual data handling.
- Terms page still matches current usage.
- `npm audit` has no unresolved moderate or higher issues.
- `npm run lint` succeeds.
- `npm run typecheck` succeeds.
- `npm run test:smoke` succeeds.
- `npm run build` succeeds.
- PWA shell works after production preview load.
- No generated user PDFs or JPG blobs are cached by app code.

## Known Gaps

- Large PDFs need better pre-conversion warning and lower-memory workflows.
- Browser compatibility needs real-device checks, especially iOS Safari.
