## Context

The existing `createSettingsUi` composes all audio, developer, fullscreen, and reset controls into one `GameWindow`. `GameWindow` already owns a backdrop, X close control, focus return, and disposal lifecycle. See proposal.md and the modified `game-settings-menu` delta for the intended user-visible contract.

## Goals / Non-Goals

**Goals:**

- Keep the top-level Settings Menu focused on general settings and add a clear Developer Settings entry point.
- Reuse existing controls, storage keys, labels, reset behavior, and modal primitives.
- Make the developer window a true top layer with correct close, focus, pause, and input behavior.

**Non-Goals:**

- Changing any setting definitions, defaults, persistence format, gameplay behavior, or gear behavior.
- Adding dependencies or redesigning the existing visual language.

## Decisions

- Add a nested-window composition in `settings-ui.js`, with one active top-level window and a separately tracked developer window. This preserves the existing `GameWindow` accessibility and dismissal behavior; duplicating modal markup would risk inconsistent X/backdrop semantics.
- Keep Music, SFX, and FullScreen in the top-level content. Move Collider, Crop Marks, Particle FX (Preview), Animated Tile (Preview), and Reset into developer content. This maps directly to the requested five options while keeping the existing fullscreen preference a general setting.
- Opening Developer Settings pauses only once for the overall settings flow; closing the child reveals the parent without resuming gameplay. Closing the parent tears down the child first, disposes fullscreen listeners, and resumes once.
- Treat the child backdrop as the active interaction boundary and ensure its stacking order is above the parent. The parent remains visually present but inert while the child is open.
- Add focused unit/source tests for button labels, child contents, nested close behavior, reset placement, and input isolation, then run the existing UI test suite and production build.

## Risks / Trade-offs

- [Risk] Two modal lifecycles can double-resume or leak listeners. → Centralize top-level cleanup and make child close idempotent before parent cleanup.
- [Risk] The existing fake DOM tests may not model nested stacking or focus fully. → Assert observable parent/child connection state and opener focus, then perform a real-browser flow check during implementation.
- [Risk] The parent backdrop could intercept clicks intended for the child. → Append the child after the parent and explicitly style it as the active top layer.

## Migration Plan

1. Update the settings composer and focused tests/CSS without changing persisted settings.
2. Run tests and build, then verify gear → Settings Menu → Developer Settings → X/backdrop in a browser.
3. Rollback is additive: restore the previous single-window composition; stored settings remain compatible.
