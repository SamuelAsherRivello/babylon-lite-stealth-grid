## 1. Asset Inventory and Catalog

- [x] `C018-T001` $tid 1.1 Copy all five supplied distributable Warrior PNGs into the Warrior
  runtime asset folder and verify their dimensions resolve to frame counts
  8/6/4/4/6 on a 192 by 192 grid
- [x] `C018-T002` $tid 1.2 Add failing catalog tests for paths, frame counts, 100 ms timing,
  loop flags, display size, pivot, and nearest sampling, and verify the focused
  tests fail before the catalog exists
- [x] `C018-T003` $tid 1.3 Implement and validate the frozen Warrior animation catalog and verify
  every supplied sheet is represented and the focused tests pass

## 2. Warrior State and Actor Lifecycle

- [x] `C018-T004` $tid 2.1 Add failing pure-state tests for idle/walking transitions, horizontal
  facing, Attack 1, Attack 2, guard entry/release, attack locking, completion,
  and rejected re-entrant actions, and verify they fail for missing behavior
- [x] `C018-T005` $tid 2.2 Implement Warrior state/action selection using the common enemy state
  contract where compatible and verify all pure-state tests pass
- [x] `C018-T006` $tid 2.3 Add failing actor tests for shared atlas loading, initial idle,
  animation switching/completion, flipping, movement/collision, depth updates,
  pause-safe updates, and complete disposal
- [x] `C018-T007` $tid 2.4 Implement the Warrior renderer and lifecycle under its own enemy
  folder and verify the focused actor tests pass without changing goblin tests

## 3. Tiled and Spawner Integration

- [x] `C018-T008` $tid 3.1 Add failing tests for a stable `warrior` character identity in
  normalized Tiled/spawner data, Warrior factory selection, marker art, and the
  legacy goblin default
- [x] `C018-T009` $tid 3.2 Extend Tiled/spawner configuration additively to carry role separately
  from character identity and verify the new and existing spawner tests pass
- [x] `C018-T010` $tid 3.3 Add or update a Tiled-authored map placement for the Warrior and
  verify loading the map creates one Warrior at grid `05,09` from a spawner
  whose minimum and maximum counts are both one, without source-code edits

## 4. Game Integration and Verification

- [x] `C018-T011` $tid 4.1 Load Warrior atlases once and integrate Warrior creation, updates,
  combat/health participation, pause behavior, depth ordering, and disposal in
  the game lifecycle; verify focused integration tests pass
- [x] `C018-T012` $tid 4.2 Add a deterministic demonstration path that exercises idle, run,
  Attack 1, Attack 2, and guard without assigning new damage or mitigation
  semantics, and verify all five animations are observable
- [x] `C018-T013` $tid 4.3 Run the full test/check command, production build, OpenSpec validation,
  and `git diff --check`, and verify each completes without regressions
- [x] `C018-T014` $tid 4.4 Inspect the running game in a real browser at desktop and portrait
  sizes and verify Warrior Tiled placement, crisp sampling, feet anchoring,
  collider alignment, depth sorting, every animation, pause behavior, and
  cleanup while the existing goblin remains functional
