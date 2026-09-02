## 1. Regression Coverage

- [x] C053-T001 Add a patrol-controller regression test that simulates a blocked movement tick and verifies the enemy changes to a different cardinal intent without moving into the occupied cell; verify with `npm.cmd test -- test/characters/enemy-patrol-controller.test.js`
- [x] C053-T002 Add integration coverage for terrain and dynamic occupancy blockers across the supported patrol enemy actors; verify with the relevant enemy and movement test files

## 2. Blocked-Step Recovery

- [x] C053-T003 Expose or consume the actor movement result needed to distinguish a blocked patrol step from intentional idling; verify existing idle, attack-lock, and movement tests remain passing
- [x] C053-T004 Update patrol direction selection to abandon a rejected next cell and choose another reachable cardinal direction while preserving patrol timers and collision authority; verify the focused regression test passes

## 3. Runtime Verification

- [x] C053-T005 Run `npm.cmd test` and record any unrelated baseline failures without changing their scope. The full run retains unrelated existing failures from missing test plugin imports and pre-existing UI assertions.
- [x] C053-T006 Run `npm.cmd run build` and perform a browser smoke test confirming enemies stop at blocked cells and resume in another direction. Build passed; browser smoke test loaded the game and Start flow at `http://127.0.0.1:5177/` with no console errors, while the blocked-step behavior is covered by the focused regression test.
