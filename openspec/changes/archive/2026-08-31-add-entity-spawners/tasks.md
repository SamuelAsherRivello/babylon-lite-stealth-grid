## 1. Spawner Policy and Lifecycle

- [x] `C005-T001` $tid 1.1 Add failing unit tests for spawner configuration validation, the one-second default, custom N-second intervals, guaranteed initial player, gradual non-player startup, and zero-to-capacity random batches; verify the focused test command fails for the missing behavior before production code is added
- [x] `C005-T002` $tid 1.2 Implement the generic spawner policy with injected actor creation/randomness, lower-batch-biased draws including zero, and accumulated active-delta scheduling; verify focused tests pass for startup evaluation, interval boundaries, bounded batches, and large-delta handling
- [x] `C005-T003` $tid 1.3 Add failing lifecycle tests for owner-isolated counting, death-animation retention, disposed pruning, no spawn within range, above-maximum preservation, maximum enforcement, and idempotent teardown; verify the new cases fail before lifecycle implementation
- [x] `C005-T004` $tid 1.4 Implement spawner-owned actor records, explicit deactivation, reconciliation, and disposal; verify repeated deactivate-and-replenish tests pass without double disposal or population overflow

## 2. Initial Spawner Types and Markers

- [x] `C005-T005` $tid 2.1 Add the player, sheep, and enemy spawner catalog configurations using the current actor positions, `(1,1)`, `(2,2)`, and `(1,1)` population ranges, and the default interval; verify a focused catalog test asserts the exact types, positions, ranges, and omitted/default interval behavior
- [x] `C005-T006` $tid 2.2 Add failing marker tests for frame-zero static artwork, grid-cell-centered placement, 50% rendered dimensions, grayscale output at 50% opacity, no collider/input behavior, and render order beneath actors; verify the tests fail before marker rendering exists
- [x] `C005-T007` $tid 2.3 Implement the shared grayscale marker shader and one persistent marker per spawner using existing idle atlases; verify marker tests pass and no additional image asset or dependency is introduced
- [x] `C005-T008` $tid 2.4 Bind all marker-layer visibility to the existing collider diagnostic setting while leaving spawner updates independent; verify settings integration tests cover off, on, and hidden-while-replenishing cases

## 3. Actor Collection Integration

- [x] `C005-T009` $tid 3.1 Add failing integration coverage expecting startup to obtain one player, two sheep, and one goblin from spawners instead of direct singular construction; verify the focused integration test fails against the current composition root
- [x] `C005-T010` $tid 3.2 Refactor renderer membership, animation startup, viewport scaling, updates, character snapshots, typed colliders, projectile targets, diagnostics, and shutdown around living spawner-owned collections; verify existing player, sheep, goblin, projectile, collision, settings, and responsive-layout tests pass
- [x] `C005-T011` $tid 3.3 Ensure dynamically spawned actors register their layers and death-animation-complete actors remove or hide layers and release animation/input resources; verify integration tests exercise a zero-spawn evaluation followed by replacement without leaked layers or duplicate player controls
- [x] `C005-T012` $tid 3.4 Preserve active-game pause semantics for spawner intervals and reset timing safely across pause/resume; verify a pause-controller integration test shows no interval progress while paused and normal progress after resume

## 4. Verification

- [x] `C005-T013` $tid 4.1 Run the complete automated test suite and production build as separate commands; verify both exit successfully with no changed legacy expectations left unreviewed
- [x] `C005-T014` $tid 4.2 Run the game in a real browser with collider diagnostics disabled; verify the player appears immediately, sheep and goblin populations build gradually through evaluations, and no spawner marker is visible
- [x] `C005-T015` $tid 4.3 Enable collider diagnostics in the real browser; verify three non-animated grayscale spawner markers appear centered in their grid cells at half actor size and 50% opacity beneath the live actors, then disable diagnostics and verify only the markers disappear
- [x] `C005-T016` $tid 4.4 Exercise the lifecycle hook in a browser-safe debug or test path; verify a dying actor counts until disposal, a below-minimum evaluation may create zero, a later evaluation can recreate it, and no population exceeds its maximum
