## 1. Reconcile Goblin Patrol AI

- [x] `C006-T001` $tid 1.1 Add or restore failing pure-policy tests for the main `actor-ai-behaviors` contract: deterministic idle timing, home-bounded patrol routes, player/sheep attack priority, atomic swing recovery, and stale-target reevaluation; verify the focused tests fail against the scripted demo controller.
- [x] `C006-T002` $tid 1.2 Replace the runtime goblin demo-phase integration with the specified actor-neutral snapshot, patrol navigation, and target-aware controller behavior; verify the focused patrol/combat tests pass without changing warrior demo behavior.
- [x] `C006-T003` $tid 1.3 Add integration coverage proving spawned goblins use the reconciled controller with stable IDs and active-time updates, then verify pause, spawner lifecycle, sheep fear, character collision, and existing damage tests remain green.

## 2. Author and Normalize Damageable Bushes

- [x] `C006-T004` $tid 2.1 Add failing Tiled normalization and validation tests for an independently authored axis-aligned bush `CombatCollider`, including missing/invalid geometry and the requirement that it remains non-blocking.
- [x] `C006-T005` $tid 2.2 Update the reusable bush tileset and Tiled importer contract to expose world-space combat geometry separately from the existing sensor; verify current Level01 placements normalize without map edits and retain `blocking: false`.
- [x] `C006-T006` $tid 2.3 Add failing reactive-decoration tests for stable identity, position/cell snapshots, living-only combat collider access, visual transforms, and independent placement lifecycle; verify existing sensor entry, rustle, rearm, and disposal tests still pass.
- [x] `C006-T007` $tid 2.4 Implement optional damageable-world-target composition for reactive bushes without adding them to character/spawner collections; verify multiple bush instances retain independent sensor, collider, and lifecycle state.
- [x] `C006-T008` $tid 2.5 Extend collider diagnostics to distinguish bush combat colliders from bush sensors and verify diagnostics do not route either shape into movement, navigation, terrain, or projectile obstacles.

## 3. Generalize Health and Fire Playback

- [x] `C006-T009` $tid 3.1 Add failing combat-state tests for configurable 100-health bushes, no knockback or health UI, logical nonliving state at zero, delayed visual death, the shared 250 ms transform, and final removal.
- [x] `C006-T010` $tid 3.2 Extract or adapt the shared combat/death state so characters preserve immediate zero-health death while bushes can gate death presentation on Fire 3 completion; verify all existing player, sheep, goblin, warrior, damage-flash, knockback, and death tests pass.
- [x] `C006-T011` $tid 3.3 Add failing particle-effect tests for non-looping Fire 3 frames 0-11, exactly one completion callback, safe restart without concurrent animations, looping-preview compatibility, and callback cancellation on disposal.
- [x] `C006-T012` $tid 3.4 Implement completion-aware one-cycle playback in the reusable particle-effect API and add bush-attached Fire 3 positioning/layer lifecycle; verify the full particle catalog and preview tests remain green.

## 4. Add Bush-Seeking Decisions and Routing

- [x] `C006-T013` $tid 4.1 Add failing policy tests for the exact 25 percent threshold, no roll when a player/sheep attack has priority, no mid-route diversion, failed-roll normal patrol, and deterministic injected randomness.
- [x] `C006-T014` $tid 4.2 Add failing navigation tests for whole-map living-bush search, all four cardinal adjacent goal cells, shortest reachable-route selection, stable tie order, patrol-home-radius bypass for bush targets only, and safe no-route fallback.
- [x] `C006-T015` $tid 4.3 Implement low-priority bush diversion at fresh goblin patrol decisions using actor-neutral bush snapshots and shared grid walkability; verify the focused decision and navigation tests pass without per-frame map searches.
- [x] `C006-T016` $tid 4.4 Add failing controller tests for arrival-facing, one atomic bush swing, normal recovery, player/sheep interruption after recovery, stale/destroyed target abandonment, and multiple goblins selecting the same bush without reservations.
- [x] `C006-T017` $tid 4.5 Connect bush target IDs, adjacent-cell routes, and reevaluation to goblin movement/attack commands; verify the controller tests pass and ordinary patrol destinations remain spawn-home bounded.

## 5. Resolve Hits, Burning, and Removal

- [x] `C006-T018` $tid 5.1 Add failing combat integration tests proving each committed goblin swing applies exactly one 50-damage event and one Fire 3 cycle despite multi-frame collider overlap, while arrows, movement, sheep, warriors, and undefined sources do no bush damage.
- [x] `C006-T019` $tid 5.2 Implement per-swing bush hit resolution at the attack damage event/window and verify an undamaged bush remains living at 50 health after one swing and becomes immediately untargetable at zero after the second.
- [x] `C006-T020` $tid 5.3 Add failing lifecycle tests proving the first Fire 3 completion leaves the 50-health bush active, the second completion starts the shared death transform, and final disposal removes only that bush and its effect resources.
- [x] `C006-T021` $tid 5.4 Integrate Fire 3 completion with delayed bush death, renderer layer registration/removal, viewport scaling, rustle coexistence, diagnostics, and shutdown teardown; verify lifecycle tests cover disposal during active playback and stale callbacks.

## 6. Full Verification

- [x] `C006-T022` $tid 6.1 Run the complete automated test suite and production build as separate commands; verify both pass and inspect the final diff for unintended map, asset, dependency, character-damage, or UI changes.
- [x] `C006-T023` $tid 6.2 Run the game in a real browser with deterministic or temporarily observable test setup; verify a goblin retains player/sheep priority, uses the 25 percent patrol-decision branch, searches beyond its home radius, reaches a cardinally adjacent cell, and faces the selected bush.
- [x] `C006-T024` $tid 6.3 In the real browser, verify two swings produce two complete Fire 3 cycles, exactly 50 damage each, no health UI, immediate untargetability at zero, then the 250 ms spin/fade/shrink removal after the second cycle.
- [x] `C006-T025` $tid 6.4 Verify multiple bushes and goblins independently, including shared-target races, destroyed/unreachable target abandonment, pass-through movement, existing bush rustling, collider diagnostics, pause behavior, viewport resize, and clean teardown without leaked layers or console errors.

## 7. Correct Collider-Center Spatial Contract

- [x] `C006-T026` $tid 7.1 Add failing tests using the real movement-collider offsets for Player, Sheep, Goblin, Warrior, and current Archer/Pawn paths; prove each character's grid cell and Y-sorted Z order derive from the movement-collider center rather than artwork or raw actor position.
- [x] `C006-T027` $tid 7.2 Implement shared movement-collider-center cell and depth derivation across all character modules and main-loop consumers; verify focused character, coordinate UI, AI snapshot, and render-depth tests pass.
- [x] `C006-T028` $tid 7.3 Derive each bush interaction cell from its combat-collider center, route the goblin movement-collider center to an exact cardinal neighbor, and gate facing, swing commitment, hit overlap, and 50 damage on Manhattan distance one; verify same-cell, diagonal, corner, and two-or-more-cell cases cannot attack.
- [ ] `C006-T029` $tid 7.4 Run focused and complete automated tests, a production build, and real-browser QA with collider/grid diagnostics; verify two centered cardinal swings destroy the bush and screenshots no longer reproduce the reported two-cell attack distance.
