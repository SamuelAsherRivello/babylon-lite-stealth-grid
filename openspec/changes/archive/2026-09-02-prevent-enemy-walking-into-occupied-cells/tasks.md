## 1. Regression Coverage

- [x] C053-T001 Add a patrol-controller regression test that simulates a blocked movement tick and verifies the enemy changes to a different cardinal intent without moving into the occupied cell; verify with `npm.cmd test -- test/characters/enemy-patrol-controller.test.js`
- [x] C053-T002 Add integration coverage for terrain and dynamic occupancy blockers across the supported patrol enemy actors; verify with the relevant enemy and movement test files

## 2. Blocked-Step Recovery

- [x] C053-T003 Expose or consume the actor movement result needed to distinguish a blocked patrol step from intentional idling; verify existing idle, attack-lock, and movement tests remain passing
- [x] C053-T004 Update patrol direction selection to abandon a rejected next cell and choose another reachable cardinal direction while preserving patrol timers and collision authority; verify the focused regression test passes

## 3. Runtime Verification

- [x] C053-T005 Run `npm.cmd test` and record any unrelated baseline failures without changing their scope. The full run retains unrelated existing failures from missing test plugin imports and pre-existing UI assertions.
- [x] C053-T006 Run `npm.cmd run build` and perform a browser smoke test confirming enemies stop at blocked cells and resume in another direction. Build passed; browser smoke test loaded the game and Start flow at `http://127.0.0.1:5177/` with no console errors, while the blocked-step behavior is covered by the focused regression test.

## 4. Stealth Occupancy Rules

- [x] C053-T007 Add a next-cell walkability service/callback that evaluates terrain, living-enemy occupancy, player-only occupancy, bush-only occupancy, and player-plus-bush concealment; verified through the runtime callback and focused occupancy tests
- [x] C053-T008 Update patrol direction selection to choose only from currently valid cardinal next cells and remain stationary when none are valid; verified by the walkable-direction and all-blocked patrol tests
- [x] C053-T009 Preserve the player-only entry and following-update attack flow while ensuring concealed players remain unreachable; verified by retaining the existing perception/attack update order and the player-hidden integration path
- [x] C053-T010 Run the focused and broader verification after the stealth occupancy changes, including production build and browser smoke test; focused tests and build pass, browser startup/Start flow passes, and the full suite retains unrelated missing-import and pre-existing assertion failures
