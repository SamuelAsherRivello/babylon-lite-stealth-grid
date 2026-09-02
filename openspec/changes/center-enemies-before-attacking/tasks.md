## 1. Regression coverage

- [x] 1.1 C057-T001 Add failing tests for off-center and already-centered attacks across Goblin, Warrior, Lancer, and Archer; assert center arrival precedes heading update and attack start, and record the focused Node test failure before implementation.
- [x] 1.2 C057-T002 Add failing integration tests for all awareness states, normal Goblin melee, autonomous Archer shooting, moving/invalid players, duplicate triggers, pause, death, displacement, blocked centers, and protected recovery; verify failures identify preparation gaps while existing Monk and non-player targeting expectations remain intact.

## 2. Preparation and integration

- [x] 2.1 C057-T003 Implement shared preparation ownership using the authoritative occupied GridSpot captured at decision time; verify destination stays fixed and navigation cannot overwrite preparation in the focused tests.
- [x] 2.2 C057-T004 Integrate collision-aware endpoint-limited movement at normal speed using existing axis rules; verify exact arrival without overshoot for both-axis offsets, multiple frame durations, supported grid sizes, and obstructions.
- [x] 2.3 C057-T005 Route every player attack path through preparation and roster-specific heading/commit adapters; verify latest-player aiming, one accepted attack, one Archer projectile, and unchanged Goblin recovery in controller-to-actor tests.
- [x] 2.4 C057-T006 Complete cancellation, pause, action-lock, disposal, and bounded blocked-recovery handling; rerun interruption tests and verify no off-center attack, stale target, or duplicate recovery tick occurs.

## 3. Integrated verification

- [x] 3.1 C057-T007 Rerun the original failing tests, relevant character/perception suites, and `npm run build`; record results and distinguish any unrelated pre-existing failures.
- [x] 3.2 C057-T008 Extend the existing browser harness and visually verify each combat enemy moving from an offset to its own exact cell center, then facing and attacking; record center coordinates at attack start and confirm rendered Archer arrow release and Monk exclusion.
- [x] 3.3 C057-T009 Before synchronization or archival, reconcile C056 immediate-animation wording with C057 preparation timing in the then-current enemy-actors specification; verify adjacency priority and exclusions remain intact and strict OpenSpec validation passes.
