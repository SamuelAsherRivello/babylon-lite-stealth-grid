## 1. Entry and transition behavior

- [x] 1.1 C059-T001 Add focused failing tests for 0.125-second X/Y interpolation, exact arrival, variable delta, pause, and already-centered entry; verify failures exercise the missing gravity behavior.
- [x] 1.2 C059-T002 Implement the gravity controller with per-bush exit/re-entry tracking and deterministic single-target selection; verify timing tests and tests for movement within a bush, full exit/re-entry, and overlapping bushes pass.

## 2. Player and hiding integration

- [x] 2.1 C059-T003 Integrate gravity locomotion suppression without clearing keyboard or virtual joystick input, and reset stale quantized routes; verify held input resumes, released input stays stopped, and both coordinates reach the target.
- [x] 2.2 C059-T004 Connect current hiding-collider entries to the bush interaction center and refresh spatial/perception/presentation state after movement; verify hiding begins on entry and the player's actual center, colliders, and GridSpot agree throughout the pull.
- [x] 2.3 C059-T005 Implement cancellation for blockers, knockback, player death, unavailable bushes, and level reset; verify no teleport, repeated pull while still inside, or stale movement lock remains and other restrictions stay effective.

## 3. Integrated verification

- [x] 3.1 C059-T006 Run relevant player, perception, and movement tests plus the repository build; record commands and outcomes and resolve regressions attributable to C059.
- [x] 3.2 C059-T007 Verify in the real browser using keyboard and virtual joystick: off-center X/Y entry, 0.125-second pull, movement suppression, held/released input after arrival, movement inside the bush without retrigger, and exit/re-entry; record the live URL and visual evidence of exact center alignment and hiding feedback.

## Verification results

- 33 focused Node tests passed covering gravity, player movement/state, knockback, damage, and hiding. Gravity tests were first run red before implementation.
- Production build passed (`npm run build`).
- Browser harness: `http://localhost:5173/test/browser/bush-gravity.html`, checked with `test/browser/check-bush-gravity.cjs`; keyboard and pointer-driven joystick checks passed for both-axis pull, exact arrival, held/released input, strict minimum-distance boundary, full exit/re-entry, blocking geometry, knockback, unavailable bush, and disabled input. Fresh actor construction verified reset behavior.
- Live game: `http://localhost:5173/`; entered bush at cell (3,7), verified hidden perception state and visible H/opacity feedback. Screenshots: `output/playwright/c059-center.png` and `output/playwright/c059-game.png`.
- User correction implemented: **minimum distance** is 0.75 of the grid width; gravity requires distance strictly less than it. Approaching within an unconsumed overlap remains eligible.


- User correction implemented: retain the movement control lock for 0.25 seconds after successful gravity arrival.
