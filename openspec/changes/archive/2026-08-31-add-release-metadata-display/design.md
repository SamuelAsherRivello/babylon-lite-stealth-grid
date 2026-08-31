## Context

See `proposal.md` for motivation and `specs/release-metadata-display/spec.md` for the behavioral contract. The game is a Vite-built Babylon Lite application with a centered 9:16 `.game-frame`, an existing `#gameUi` DOM overlay, a relative Vite base, Node's built-in test runner, and a push-to-Pages workflow. The reference repository implements release metadata through small pure modules, a checked-in `public/environment.json`, and a release-driven Pages workflow. The current checkout also contains unrelated edits that must remain undisturbed.

## Goals / Non-Goals

**Goals:**

- Port the reference feature with the same validation, formatting, fallback, and fixed-width size-accounting semantics.
- Keep metadata logic independently testable and keep metadata failures isolated from game startup.
- Integrate the label into the existing portrait overlay using game-frame-relative styling.
- Adapt release asset names, titles, URLs, and documentation to the stealth-grid repository.

**Non-Goals:**

- Measuring compressed transfer size, per-file size, runtime network traffic, or Babylon Lite engine-only size.
- Adding a settings toggle, interactive metadata panel, telemetry, or a new package.
- Refactoring unrelated startup, overlay, settings, controls, or in-progress particle work.
- Preserving push-to-`master` as the publication trigger; the port uses published releases as the source of immutable version identity.

## Decisions

### Keep metadata parsing and DOM creation in separate modules

Use one pure/data-focused module for version resolution, size formatting, and fetch fallback, and one UI-focused module for line formatting and element creation. This mirrors the proven source, allows narrow Node tests without initializing WebGPU, and prevents release concerns from spreading through `src/main.js`.

Alternative considered: place all logic directly in `main.js`. Rejected because it couples simple metadata behavior to the largest runtime module and makes failure and formatting cases harder to test.

### Load metadata concurrently with other startup resources

Start the deployment-relative metadata request as part of the existing startup resource work and render the line after metadata resolves. The loader converts all failures to a local fallback, so it cannot turn metadata availability into a startup failure.

Alternative considered: hard-code the package version at build time. Rejected because the package version does not represent the published GitHub Release artifact and cannot carry the final build size.

### Reuse the existing game UI host and source layout contract

Append a semantic paragraph with a dedicated class to `#gameUi`. Position and size it with `cqw` values inside the existing container, retain `white-space: nowrap`, and disable pointer events. Preserve the source feature's upper-left presentation while adapting only as needed to avoid existing stealth-grid UI collisions.

Alternative considered: add static markup to `index.html`. Rejected because the final text depends on asynchronous deployment metadata and would require extra mutation or placeholder state anyway.

### Use a fixed-width decimal byte field for exact size accounting

Before Vite builds, the workflow writes a twelve-digit placeholder to `public/environment.json`. After build completion it measures every file in `dist`, replaces only that same-width field, and confirms the total has not changed. The UI converts the stored total to decimal megabytes only at display time.

Alternative considered: write the size after measuring without a placeholder. Rejected because adding or changing the digit width would alter the build total and make the recorded value self-inconsistent.

### Publish immutable release assets and assemble versioned Pages output

Adapt the reference release workflow to the stealth-grid repository: exact release tags, a repository-specific web-build zip, one directory per released version, plus `latest` and root redirects. If the release asset already exists, leave it unchanged.

Alternative considered: retain the existing push deployment and only inject a Git commit or package version. Rejected because a moving branch deployment cannot guarantee stable versioned builds or metadata aligned with a published release.

## Risks / Trade-offs

- [Changing the Pages trigger alters the current deployment cadence] → Document the release workflow clearly and verify manual dispatch plus published-release paths.
- [Existing overlay controls could visually collide with the upper-left line] → Use the source proportional contract, inspect the current overlay, and verify large desktop and narrow portrait viewports before accepting the implementation.
- [A failed or missing metadata request briefly delays label creation] → Keep the request small, bypass stale caches, and resolve every failure to a deterministic local fallback.
- [A future build larger than the twelve-digit field cannot be represented exactly] → Fail the workflow explicitly instead of publishing incorrect metadata.
- [Multiple active OpenSpec and source edits share the checkout] → Limit implementation diffs to named feature files and inspect the pre-existing working tree before each overlapping edit.

## Migration Plan

1. Add the checked-in metadata source, pure loader/formatter, UI creator, focused tests, and runtime integration.
2. Add proportional overlay styling and verify it against both portrait and desktop frame sizes.
3. Replace the current Pages workflow with the adapted release-driven packaging and versioned publication flow, then update README release instructions.
4. Run focused metadata/workflow tests, the full Node test suite, a production build, and real-browser viewport checks.
5. Release using a matching three-component tag. Rollback is additive: publish a subsequent fixed release and point `latest` to it; keep prior versioned release assets immutable.
