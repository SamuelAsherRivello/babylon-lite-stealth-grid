## Context

The archer already has separate idle, walking, and shooting sprite atlases and a projectile renderer, but its controller methods are placeholders. Existing gameplay uses world units derived from the 64-pixel grid, actor-neutral snapshots, explicit enemy states, and pure projectile helpers.

## Goals / Non-Goals

**Goals:**

- Add a small, deterministic archer policy driven by the existing world snapshot.
- Keep total 2D Euclidean facing range at five units and attack range at four units, inclusive.
- Capture a target point once per shot and produce a testable ballistic arc.
- Reuse current animation and projectile rendering APIs.

**Non-Goals:**

- No homing, line-of-sight, obstacle avoidance, damage-balancing redesign, or new physics dependency.
- No movement toward the player and no vertical change to the actor's planar position.

## Decisions

- Use a dedicated archer policy/state machine rather than adding archer-specific states to the universal enemy enum. This matches the extensible actor-AI contract and keeps ranged timing separate from goblin melee behavior.
- Evaluate total 2D Euclidean distance for the exact five-unit and four-unit thresholds, while using the sign of the X delta to choose left or right. This makes diagonal proximity count while keeping the two-frame-facing archer unambiguous.
- On attack start, capture the player's current position; at the animation release frame, create an arrow with a direction and target snapshot. This preserves a readable shot while allowing evasion.
- Implement the arc as pure projectile state: planar position, target, normalized progress, height, and travel tangent. The renderer converts height into screen offset and rotation, while the existing collider remains tied to planar gameplay position.
- Gate attacks with explicit shooting/recovery state and active gameplay time so pause freezes AI, animation completion, and projectile flight consistently.

## Risks / Trade-offs

- [Unit-to-pixel tuning] → Centralize the grid-unit conversion and test exact boundary values, including diagonal points whose Euclidean distance is exactly four or five units.
- [Animation release mismatch] → Use the shoot animation's observed release frame and verify it in the browser.
- [Target point outside bounds] → Clamp or land safely within projectile bounds without changing player movement rules.
- [Existing projectile combat assumptions] → Keep archer arrows distinguishable from hero arrows and add integration tests for collider/removal behavior.

## Migration Plan

1. Add pure archer decision and ballistic tests.
2. Implement the archer controller and wire the existing player snapshot into its update call.
3. Extend the projectile record/renderer for arcing arrows and release them at the shoot frame.
4. Run the full test suite, production build, and browser smoke test.
