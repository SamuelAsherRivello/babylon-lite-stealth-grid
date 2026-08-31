## 1. Metadata Contract

- [ ] 1.1 Add failing unit tests for exact three-component version validation, uppercase normalization, decimal-megabyte formatting, deployment-base fetching with `cache: "no-store"`, and non-blocking failure fallbacks; run the focused test file and verify it fails for the missing implementation
- [ ] 1.2 Add `public/environment.json` and the release metadata loader/formatter module; rerun the focused metadata tests and verify all parsing, fetch, and fallback cases pass

## 2. Overlay Display

- [ ] 2.1 Add failing UI tests for the combined version-and-size text, version-only fallback, one appended paragraph in `#gameUi`, and the proportional non-interactive upper-left styling contract; run the focused UI test and verify it fails for the missing implementation
- [ ] 2.2 Add the release metadata UI module, integrate metadata loading and rendering into startup without blocking WebGPU initialization, and add `cqw`-based styling in `src/ui/style.css`; rerun the focused metadata UI tests and verify they pass
- [ ] 2.3 Start the app and verify in a real browser that published-style metadata and the local fallback each render as one readable upper-left line without intercepting controls at a large desktop viewport and a narrow portrait viewport

## 3. Release Publication

- [ ] 3.1 Add failing workflow tests for exact release-tag validation, pre-build metadata creation, twelve-digit placeholder replacement, final-size equality, versioned release assets, and root/latest redirects; run the focused workflow test and verify it fails against the current push deployment workflow
- [ ] 3.2 Adapt the GitHub Pages workflow to build from a published or manually selected exact release tag, record the total uncompressed browser-build size without changing that total, upload an immutable repository-specific release asset, and assemble versioned/root/latest Pages content; rerun the focused workflow tests and verify they pass
- [ ] 3.3 Update README release instructions to keep `public/environment.json`, a matching three-component release tag, visible `releaseVersion`, and total uncompressed `downloadSize` aligned; verify the documentation assertions pass

## 4. Full Verification

- [ ] 4.1 Run `npm test` and verify the complete existing and new Node test suite passes without altering unrelated tests or source behavior
- [ ] 4.2 Run `npm run build`, inspect `dist/environment.json`, and verify the production bundle contains deployment-relative metadata with the checked-in unknown-size placeholder ready for release-time replacement
- [ ] 4.3 Inspect `git diff` and `git status --short` to verify the implementation is limited to release metadata, its tests, workflow, documentation, and the smallest necessary integration/style edits while preserving all pre-existing user changes
