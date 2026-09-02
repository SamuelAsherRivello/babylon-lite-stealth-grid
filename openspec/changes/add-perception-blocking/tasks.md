## 1. Contract and occupancy model

- [x] C050-T001 Inspect the current perception registration/update path and authoritative bush/enemy grid occupancy sources; document the chosen blocker input and verify existing perception tests pass
- [x] C050-T002 Add channel-specific blocker classification and living-state filtering to the perception contract with a backward-compatible empty default; verify focused unit tests cover player, bush, enemy, and dead-actor classifications

## 2. Perception evaluation

- [x] C050-T003 Update Visual Perception evaluation to distinguish target-cell negation from preceding-cell blocking for terrain, bushes, and living enemies; verify one-cell negation and beyond-cell suppression independently while preserving distance strengths
- [x] C050-T004 Update Audio Perception evaluation to reject living-enemy-occupied neighboring cells while retaining bush transparency, terrain transparency, and the eight-cell radius; verify audio regression tests pass

## 3. Integration and verification

- [x] C050-T005 Wire live bush and enemy occupancy into the centralized perception update before evaluation, including movement/death updates; verify integration tests cover visual blockers moving into and out of a sensing cell and audio enemies entering/leaving a cell
- [x] C050-T006 Run focused perception tests, full test/build validation, and a real-browser stealth-grid smoke check; verify visual target-cell negation, visual beyond-cell blocking, bush-transparent audio, and enemy-negated audio
- [x] C050-T007 Add regression coverage for an enemy inside a bush retaining visual perception and walking through the bush without collision; verify the existing terrain-only movement obstacle path remains unchanged
