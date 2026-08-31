## 1. Fear and State Behavior

- [x] 1.1 Replace the timed sheep transition tests with failing tests for `idle -> bouncing -> running -> idle`, stationary bouncing, retained threat context, and immediate post-run fear reevaluation; verify the focused state test fails for the unimplemented behavior.
- [x] 1.2 Add fear-profile validation and character-type filtering for `player`, `enemy`, and both; verify tests cover the initial `{ player }` configuration and ignored enemy stimuli.
- [x] 1.3 Implement Chebyshev grid proximity and nearest-enabled-threat selection; verify tests cover horizontal, vertical, diagonal, outside-radius, and stable tie cases.

## 2. Collision-Aware Flee Planning

- [x] 2.1 Add failing navigation tests for inclusive deterministic distance selection from one through three and verify both endpoints plus the middle value.
- [x] 2.2 Implement bounded four-neighbor breadth-first route discovery with parent reconstruction; verify tests cover straight routes and a three-step route that turns around a corner.
- [x] 2.3 Validate candidate cell centers with the sheep collider against grid bounds, full-cell colliders, and partial polygon colliders; verify tests exclude every unsafe candidate without excluding a neighboring safe cell.
- [x] 2.4 Implement destination scoring away from the retained threat, random tie selection, shorter-route fallback, and enclosed-sheep fallback; verify deterministic tests cover all four behaviors.

## 3. Sheep Movement and Animation

- [x] 3.1 Extend the sheep controller configuration with scare distance, frightening character types, minimum flee distance, maximum flee distance, movement speed, bounds, obstacles, and injectable randomness; verify invalid ranges/types fail clearly and the initial instance resolves to three, `{ player }`, one, and three.
- [x] 3.2 Sequence the complete non-looping bounce before route planning and movement; verify a controller-level test proves the sheep position is unchanged until the bounce completion callback.
- [x] 3.3 Add smooth, no-overshoot waypoint movement using the idle sheet, horizontal sprite flipping, and defensive runtime collision checks; verify tests cover waypoint completion, a turning path, final cell-center alignment, and blocked-segment safe stop.
- [x] 3.4 Return to idle after route completion or no-route fallback and dispose active animation state cleanly; verify focused sheep state/controller tests pass.

## 4. Gameplay Integration

- [x] 4.1 Expose a non-mutating player position/grid-cell snapshot and verify existing player tests plus a new getter test pass.
- [x] 4.2 Configure the current sheep spawn to fear only `player` at three grid cells and flee one through three steps, then pass active player and terrain context through the main loop; verify source-level integration tests confirm these exact values and no enemy snapshot is supplied.
- [x] 4.3 Keep sheep AI updates on the pause-controlled active delta and scale every sheep layer with the logical viewport; verify pause/integration tests prove no movement or state progress occurs while paused.

## 5. Typed NPC Collision

- [x] 5.1 Add failing tests that the sheep collider is a 26-pixel `npc` circle, dynamic non-NPC colliders block route planning and movement, and NPC colliders are ignored; verify the focused tests fail before implementation.
- [x] 5.2 Expose the sheep's fresh world collider and integrate typed dynamic blockers bidirectionally with player and projectile movement; verify collision tests prevent every non-NPC overlap while allowing NPC overlap.
- [x] 5.3 Render the sheep collider in yellow when diagnostics are enabled and verify source/diagnostic tests distinguish it from the cyan hero collider.

## 6. Verification

- [x] 6.1 Run the focused sheep, navigation, player, projectile, collision, and pause tests and verify they all pass.
- [x] 6.2 Run `npm.cmd test` and `npm.cmd run build` separately; verify the build succeeds and report any unrelated pre-existing test failure without changing out-of-scope terrain behavior.
- [x] 6.3 Run the game in a real WebGPU browser at the current sheep spawn; verify the yellow sheep collider matches the hero radius, no non-NPC collider overlaps it, the sheep stays idle outside three cells, bounces without moving at the boundary, lands, visibly follows a safe random one-to-three-step route including a corner case, never overlaps colliding terrain, and returns to idle.
