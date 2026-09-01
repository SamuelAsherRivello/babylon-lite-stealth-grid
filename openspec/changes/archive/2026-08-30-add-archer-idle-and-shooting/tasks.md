## 1. Assets and Gameplay Tests

- [x] `C001-T001` $tid 1.1 Copy the supplied `Archer_Idle.png`, `Archer_Shoot.png`, and
  `Arrow.png` into `public/assets/units/archer/` and verify the local files are
  respectively 1152x192, 1536x192, and 64x64 without modifying the originals.
- [ ] `C001-T002` $tid 1.2 Add failing unit tests for idle/run/shoot state priority, movement
  locking, retained horizontal facing, repeated Space input, and one-time
  release gating; run `npm.cmd test` and verify the new tests fail for the
  missing behavior before production logic changes.
- [ ] `C001-T003` $tid 1.3 Implement the pure archer state transitions and shoot-release gating
  in `src/game-logic.js`, then run `npm.cmd test` and verify all state tests
  pass alongside the existing movement tests.
- [ ] `C001-T004` $tid 1.4 Add failing unit tests for horizontal projectile motion, gravity,
  non-negative height, collider synchronization, downward ground crossing,
  and landed-projectile removal; run `npm.cmd test` and verify these tests fail
  before projectile logic is added.
- [ ] `C001-T005` $tid 1.5 Implement deterministic projectile creation and update helpers in
  `src/game-logic.js`, then run `npm.cmd test` and verify all projectile and
  existing tests pass.

## 2. Archer Animation Integration

- [ ] `C001-T006` $tid 2.1 Load the run, idle, and shoot atlases using native 192x192 cells,
  create aligned state-specific layers and sprite handles, and run
  `npm.cmd run build` to verify every atlas is bundled without an asset or
  renderer error.
- [ ] `C001-T007` $tid 2.2 Connect locomotion state to looping idle frames 0-5 and run frames
  0-3 with exactly one archer layer visible, then verify in a WebGPU browser
  that stationary, horizontal, vertical, and diagonal input select the correct
  aligned animation and facing.
- [ ] `C001-T008` $tid 2.3 Handle Space as an edge-triggered action, play shoot frames 0-7 once,
  lock movement, ignore repeated keydowns, and transition to the currently
  appropriate locomotion state; verify each transition and held-input case in
  a WebGPU browser.

## 3. Arrow Rendering and Collision Lifecycle

- [ ] `C001-T009` $tid 3.1 Create a bounded-capacity arrow layer and release one 64x64 arrow at
  the mirrored bow offset when the shoot animation first reaches zero-based
  frame 5; verify right- and left-facing shots spawn once at the visual bow
  release and point in the travel direction.
- [ ] `C001-T010` $tid 3.2 Update active arrow sprites from projectile position and visual
  height while keeping collider state synchronized; verify in a WebGPU browser
  that each arrow visibly rises, advances horizontally, and descends along a
  smooth arc.
- [ ] `C001-T011` $tid 3.3 Remove the sprite, projectile record, and collider immediately when
  downward motion reaches the ground plane, and verify landed arrows disappear
  without orphaned sprites while later shots and simultaneous arrows still
  function.

## 4. Documentation and Final Verification

- [ ] `C001-T012` $tid 4.1 Update `README.md` controls and project structure to describe idle,
  movement, Space shooting, and the additional local archer assets; verify the
  documented commands and file paths match the checkout.
- [ ] `C001-T013` $tid 4.2 Run `npm.cmd test`, `npm.cmd run build`, `openspec validate
  add-archer-idle-and-shooting --strict`, and `git diff --check`, and verify all
  commands pass.
- [ ] `C001-T014` $tid 4.3 Perform a final real-browser smoke test at desktop and portrait
  viewport sizes covering idle, run, left/right facing, movement lock, repeat
  Space suppression, release timing, arc, landing, disappearance, and viewport
  resize behavior; record the live URL and observed result.
