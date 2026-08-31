## 1. Spawner Configuration and Placement Math

- [x] 1.1 Add validated spawn mode and maximum-distance configuration to the spawner API, preserve actor identity, and verify invalid modes/distances fail in focused unit tests
- [x] 1.2 Implement nearby Chebyshev candidate enumeration and verify radius-zero and radius-three cases with deterministic tests
- [x] 1.3 Implement anywhere-walkable candidate enumeration and verify it can select cells outside the spawner neighborhood
- [ ] 1.4 Ensure candidate reservation and full movement-collider validation prevent overlap within a batch, and verify no-candidate behavior

## 2. Level and Collision Integration

- [ ] 2.1 Expose a level-wide spawn occupancy query covering terrain, blocking object colliders, the player, and all living character movement colliders; verify cross-spawner exclusion
- [ ] 2.2 Pass spawned-character collider geometry into candidate validation and verify partial terrain and character-specific collider cases
- [x] 2.3 Update catalog defaults and Level01 runtime configuration to Player nearby/0 and Sheep, Goblin, and Warrior nearby/3; verify normalized configuration

## 3. Tiled Authoring and Validation

- [x] 3.1 Extend Tiled spawner metadata and normalization for actor identity, spawn mode, and maximum distance while retaining defaults for existing placements; verify fixture normalization
- [ ] 3.2 Validate unsupported modes and malformed distances with actionable object-specific errors; verify loader failure tests

## 4. Regression and Browser Verification

- [ ] 4.1 Update existing spawner, catalog, and Tiled tests without weakening population, lifecycle, ownership, or marker assertions; verify the focused test suite passes
- [ ] 4.2 Run the complete test suite and production build, then perform a browser smoke test confirming the four Level01 spawners use the agreed placement values and never spawn into occupied walk-collider space
- [x] 4.3 Ensure every character begins its spawn animation before or after renderer registration, and verify the pre-renderer attachment regression test passes
