## 1. Asset Rights and Export

- [x] `C007-T001` $tid 1.1 Record the official Tiny Swords usage and non-redistribution terms
  and attribution in the repository, and verify the source URL and the user's
  confirmed Enemy Pack entitlement are documented without credentials
- [x] `C007-T002` $tid 1.2 Stage the legitimate red Torch Aseprite file under the Git-ignored
  `assets/local-imports/enemies/goblin/` directory and verify it is ignored and
  retains the documented five layers plus `Idle`, `Run`, `Attack_Right`,
  `Attack_Down`, and `Attack_Up` tags
- [x] `C007-T003` $tid 1.3 Export the five selected tags as transparent single-row PNGs under
  `public/assets/enemies/goblin/` and verify every cell is 192x192, frame counts
  are 7/6/6/6/6, and the `Original` frames are absent

## 2. Enemy State Contract

- [x] `C007-T004` $tid 2.1 Add failing unit tests for idle/walking transitions, attack locking,
  re-entrant attack rejection, direction selection, and post-attack recovery,
  and verify the new focused test file fails for missing behavior
- [x] `C007-T005` $tid 2.2 Implement the pure common enemy state machine and goblin directional
  mapping under `src/enemies/`, and verify the focused state tests pass

## 3. Goblin Rendering and Lifecycle

- [x] `C007-T006` $tid 3.1 Add a frozen goblin animation catalog with image URLs, 192x192 grid
  size, verified frame counts, 100 ms duration, loop flags, pivot, and display
  size, and verify catalog tests reject inconsistent descriptors
- [x] `C007-T007` $tid 3.2 Add failing tests for shared atlas loading, initial idle rendering,
  animation switching, horizontal mirroring, update behavior, and complete
  disposal, and verify the focused renderer tests fail before implementation
- [x] `C007-T008` $tid 3.3 Implement goblin atlas loading and sprite creation using the common
  movement/collision and world-to-screen contracts, and verify the renderer
  and lifecycle tests pass

## 4. Game Integration and Verification

- [x] `C007-T009` $tid 4.1 Spawn one goblin through the existing game lifecycle with an explicit
  temporary intent driver that demonstrates idle, walking, and all attack
  directions, and verify game pause/disposal does not leave it updating
- [x] `C007-T010` $tid 4.2 Run the full automated test suite and production build and verify both
  commands complete successfully without regressions
- [x] `C007-T011` $tid 4.3 Inspect the game in a real browser at desktop and portrait dimensions
  and verify the goblin is feet-anchored, depth-sorted, nearest-neighbor crisp,
  collision-safe, and visually transitions through idle, walking, left/right,
  up, and down attacks without frame jumps
