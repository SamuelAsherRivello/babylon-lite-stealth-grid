## Context

Enemy patrol and reaction code already produces cardinal movement intents, and the player movement path already provides smooth grid alignment through `createGridAlignedMovementController`. Enemy actors currently use raw collision movement, so their orthogonal coordinate is not corrected toward a cell center.

## Goals / Non-Goals

**Goals:**

- Reuse one collision-aware alignment algorithm for all enemy movement paths.
- Preserve main-axis travel, dynamic blocking, bounds, attacks, and external displacement behavior.
- Keep grid occupancy and render depth derived from the movement collider center.

**Non-Goals:**

- No change to patrol destination selection, perception, attack ranges, or animation rules.
- No instant snapping, diagonal enemy movement, or player/sheep movement redesign.
- No new dependency or asset/level change.

## Decisions

Use the existing grid-aligned movement controller as the shared primitive rather than adding enemy-specific coordinate rounding. It already distinguishes cardinal input, performs a time-bounded orthogonal correction, preserves forward movement, and routes both portions through collision handling.

Each enemy actor that owns movement will create one controller with its character geometry and 64-pixel tile size, use it for normal intent movement, and reset it on external displacement such as knockback. The shared Monk actor will receive the same controller through its common actor path. Attack and recovery states will continue to bypass normal movement, so alignment cannot move an attacking enemy.

Correction is based on the movement-collider center and the current cell at the moment an axis begins. If correction is blocked, the enemy keeps its valid main-axis progress and retries on later frames. Stopping or changing axis invalidates the previous session.

Alternative considered: snapping the orthogonal coordinate immediately. This would produce visibly discontinuous movement and could place the collider into an obstacle, so it is rejected. Alternative considered: quantizing patrol waypoints only. This would not correct enemies that begin off-center or are displaced by collisions, so it is insufficient.

## Risks / Trade-offs

- [Risk] Existing enemies have different actor implementations and movement state machines. -> Mitigation: add focused actor tests and keep the controller behind the existing `setMovementIntent`/`update` APIs.
- [Risk] A correction can be blocked while the main axis remains open. -> Mitigation: preserve main-axis movement and retry correction, matching the existing player behavior.
- [Risk] Knockback can leave an enemy between cell centerlines. -> Mitigation: reset alignment after external displacement and let the next cardinal movement establish a fresh target.

## Migration Plan

1. Add enemy-focused tests around the shared alignment behavior.
2. Integrate the controller into each enemy actor and the shared Monk actor.
3. Run the complete test suite and browser smoke test with multiple enemy types.

Rollback is limited to reverting this change's actor integrations and tests; no persistent data or assets are modified.
