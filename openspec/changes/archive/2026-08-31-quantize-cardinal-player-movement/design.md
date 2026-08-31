## Context

See `proposal.md` for motivation. Player input currently resolves keyboard and virtual joystick input into a two-axis movement vector in `src/player.js`; knockback replaces that vector while active. `moveWithCollisions` in `src/game-logic.js` resolves axes against the playfield, terrain, polygons, and dynamic colliders. The canonical cell size is `GRID.tileSizePx` (64 pixels), while the player sprite pivot and circular collider mean sprite position is not itself the correct alignment reference.

## Goals / Non-Goals

**Goals:**

- Keep alignment calculations deterministic and frame-rate independent.
- Align the player's collision center, so exactness corresponds to gameplay geometry rather than transparent sprite padding.
- Reuse the existing collision path for both requested travel and assisted correction.
- Make classification and correction math independently unit-testable.

**Non-Goals:**

- Quantizing diagonal movement, NPCs, enemies, knockback, or projectile motion.
- Snapping the player instantly or forcing the player to finish a correction after input changes.
- Changing the existing collision solver, player speed, animation state selection, input bindings, or grid dimensions.

## Decisions

### Classify near-cardinal analog input with a ratio

A movement vector is cardinal when it has a dominant non-zero axis and `abs(offAxis) <= abs(mainAxis) * 0.10`. The dominant component defines the requested travel; the sub-threshold component is treated as joystick noise and replaced by alignment on the orthogonal axis. This gives keyboard and analog control a shared observable rule.

Alternatives considered: exact-zero comparison would make touch alignment fragile; keyboard-only alignment would produce inconsistent controls; a broad angular sector would capture intentional diagonals.

### Align the gameplay collider center

Compute the player's current circle-collider center using the existing character collider geometry. For vertical travel, select the center of the grid column containing that collider center; for horizontal travel, select the center of its grid row. This is the fixed target for that correction session. If the collider center lies exactly on a cell boundary, the cell reached by flooring the bounded coordinate is the current cell.

Alternatives considered: aligning the sprite anchor would be distorted by its non-central pivot and transparent frame padding; selecting a neighboring center from direction could cause unwanted lane changes.

### Use a bounded 0.2-second correction session

On entry into cardinal movement, or when the cardinal axis changes, capture the applicable center and initial orthogonal offset. Advance toward that target at the constant correction rate required to cover the captured offset in 0.2 seconds, clamping the final step to the remaining distance. Use elapsed frame time so the duration is frame-rate independent. A zero, diagonal, axis-changing, or overriding programmatic input cancels the session; a later qualifying input creates a fresh session.

Alternatives considered: instant snapping is visually harsh; per-frame interpolation has frame-rate-dependent or asymptotic completion; continuously retargeting is unnecessary on the orthogonal axis and makes behavior harder to reason about.

### Resolve requested travel before assisted correction

Within each update, derive the requested main-axis displacement first and the orthogonal correction second, but pass both through the established collision rules. Collision constraints remain authoritative. The correction cannot reverse or reduce the main-axis input, and blocked correction does not cancel requested travel when the travel axis remains clear. If correction is blocked, the session remains eligible to try subsequent safe steps while the same cardinal intent continues.

The behavioral priority is therefore: collision constraints, qualifying player intent, grid correction, then programmatic effects. Existing knockback remains a special overriding mode for compatibility: while it is active the input/correction path is suspended, and current input is reevaluated after it ends.

Alternatives considered: bypassing collision would violate level geometry; merging correction into a normalized input vector could reduce requested travel speed; changing knockback composition would expand this change into combat-motion semantics.

## Risks / Trade-offs

- [A narrow 10% threshold may still feel sensitive on some touch devices] → Keep the ratio as one named constant with direct boundary tests so later tuning is isolated.
- [A collider can prevent perfect centering near a wall or dynamic actor] → Preserve collision correctness and continue main-axis travel; exact centering is conditional on a safe path.
- [Large frame times could overshoot the center] → Clamp every correction step to the remaining signed offset.
- [Separately resolving travel and correction can expose axis-order behavior at corners] → Add focused collision tests and verify both horizontal and vertical cases in the browser.

## Migration Plan

No data migration or dependency change is required. Add the tested helper behavior, integrate it into player updates behind the existing movement path, and verify the full suite and production build. Rollback consists of reverting the additive alignment helper and player integration while leaving existing input, collision, and knockback behavior intact.
