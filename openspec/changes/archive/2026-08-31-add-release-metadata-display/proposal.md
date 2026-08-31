## Why

The stealth-grid game does not currently identify the deployed release or show how large its shipped browser build is. Porting the proven release metadata feature from `bablylon-lite-wave-spawn` makes local and published builds immediately distinguishable and keeps the visible size tied to the exact release artifact.

## What Changes

- Add a non-blocking metadata loader that reads the deployment-relative `environment.json`, validates a three-component release tag, formats the total build size in decimal megabytes, and provides safe local-development fallbacks.
- Add a single proportional, non-interactive version-and-size line to the upper-left of the existing game UI overlay.
- Update the GitHub Pages release process to write the release tag before building, calculate the total uncompressed `dist` size, inject that fixed-width value without changing the measured total, and publish versioned, `latest`, and root entry points.
- Add the checked-in release metadata source and document how its version stays aligned with a matching GitHub Release tag.
- Add focused tests for parsing, fallback behavior, UI output and responsive styling, workflow ordering and size accounting, and documentation alignment.

## Capabilities

### New Capabilities

- `release-metadata-display`: Defines loading, validation, formatting, responsive display, build-size calculation, and release-publication behavior for visible release metadata.

### Modified Capabilities

None.

## Impact

- Adds release metadata modules and tests under `src/` and `test/`, plus `public/environment.json`.
- Integrates metadata loading and rendering into `src/main.js` and the existing `#gameUi` overlay, with proportional styles in `src/ui/style.css`.
- Replaces or evolves the current push-based `.github/workflows/deploy-pages.yml` flow into release-aware versioned deployment behavior.
- Updates `README.md` release instructions; no new runtime or development dependency is required.
