## 1. Shared AI Contracts and Navigation

- [ ] `C022-T001` $tid 1.1 Add failing unit tests for inclusive random ranges, invalid configuration, actor-neutral living snapshots, and bounded cardinal reachability; verify the new focused tests fail before production modules exist
- [ ] `C022-T002` $tid 1.2 Extract shared grid-cell centering, collider-aware walkability, bounded breadth-first traversal, and route reconstruction into `src/ai/`; verify the new shared-navigation tests pass with full, partial, boundary, and dynamic blockers
- [ ] `C022-T003` $tid 1.3 Add shared waypoint-route advancement and blocked-segment result contracts; verify unit tests cover smooth no-overshoot movement, route completion, and safe interruption without collider overlap

## 2. Sheep Policy Migration

- [ ] `C022-T004` $tid 2.1 Add or update failing sheep tests to express fear selection and flee ranking through the shared snapshot/navigation contracts; verify they fail against the sheep-only plumbing
- [ ] `C022-T005` $tid 2.2 Refactor the sheep controller to reuse shared timing, walkability, traversal, and waypoint mechanics while retaining sheep-specific threat ranking and `idle -> bouncing -> running -> idle` transitions; verify all sheep state, navigation, controller, and integration tests pass unchanged or with contract-focused updates
- [ ] `C022-T006` $tid 2.3 Remove obsolete duplicated helpers from the sheep navigation boundary; verify repository search finds only the shared definitions and the full sheep test set still passes

## 3. Enemy Patrol and Target Decisions

- [ ] `C022-T007` $tid 3.1 Replace scripted-demo expectations with failing pure policy tests for configurable idle timing, reachable patrol-distance bounds, random destination selection, no-route recovery, and deterministic randomness; verify the focused tests fail before the policy exists
- [ ] `C022-T008` $tid 3.2 Implement the goblin patrol policy using shared bounded reachability and waypoint routes; verify tests prove it alternates idle and walking, turns around blocked terrain, and selects a fresh idle duration after arrival or route failure
- [ ] `C022-T009` $tid 3.3 Add failing perception tests for living player/sheep eligibility, nearest-target and stable-tie selection, no-target no-swing behavior, patrol interruption, and captured attack direction; verify the cases fail before target-aware attack decisions are connected
- [ ] `C022-T010` $tid 3.4 Implement target-aware attack priority and atomic completion handling; verify tests prove only in-range living targets trigger one swing, movement locks during the swing, direction does not change mid-animation, and completion requests a fresh decision
- [ ] `C022-T011` $tid 3.5 Connect policy movement/attack intent to the existing enemy state machine and goblin animation selection; verify goblin state and renderer tests cover idle, walking, all attack directions, rejected repeat attacks, and animation-completion reevaluation

## 4. Gameplay Integration

- [ ] `C022-T012` $tid 4.1 Add stable IDs and build living actor-neutral player, sheep, and goblin snapshots in the active main-loop path; verify an integration test proves dead actors are omitted and paused frames do not advance AI
- [ ] `C022-T013` $tid 4.2 Configure the initial goblin's idle-duration, patrol-distance, melee-distance, and attackable-type ranges at its spawn, then replace `createGoblinDemoController` with the new behavior controller; verify source integration tests find the explicit configuration and no scripted attack phases
- [ ] `C022-T014` $tid 4.3 Pass current terrain and dynamic blockers to patrol and flee controllers without changing the existing collision-category rules; verify integration tests cover player, sheep, enemy, projectile, full-tile, and partial-terrain blocking expectations
- [ ] `C022-T015` $tid 4.4 Remove `goblin-demo-controller.js` and its obsolete phase-cycle tests after all imports are migrated; verify repository search contains no demo-controller reference or timer-driven attack sequence

## 5. Verification and Tuning

- [ ] `C022-T016` $tid 5.1 Run the focused shared-AI, sheep, enemy, goblin, combat, and integration test files; verify every focused test passes
- [ ] `C022-T017` $tid 5.2 Run the complete test suite and production build as separate commands; verify both finish successfully without modifying dependencies
- [ ] `C022-T018` $tid 5.3 Run the game in a real browser and observe multiple decision cycles; verify the sheep stays idle until threatened and still bounces before a safe flee route
- [ ] `C022-T019` $tid 5.4 In the same browser run, verify the goblin idles for varying periods, patrols to reachable cells around non-walkable tiles, stops to think at destinations, and never swings without a nearby living player or sheep
- [ ] `C022-T020` $tid 5.5 Validate the configured melee distance against sprite/collider spacing and adjust only the named spawn configuration if needed; verify every swing visibly faces its selected target and document the final value in the relevant test expectation
- [ ] `C022-T021` $tid 5.6 Run `openspec validate generalize-npc-enemy-ai --strict`; verify the proposal, capability spec, design, and completed task evidence remain coherent
