## Context

See `proposal.md` for motivation. The player currently stores horizontal facing
as a scalar, uses it for mirrored spawn placement and sprite presentation, and
passes that scalar through the projectile renderer into X-only projectile
movement. Movement input already produces two-dimensional vectors from keyboard
and virtual-controller input. Shooting is delayed until an animation release
frame, so the selected direction must remain stable throughout that delay.

## Goals / Non-Goals

**Goals:**

- Represent shot direction consistently as a cardinal unit vector throughout player and projectile code.
- Make keyboard recency and analog magnitude resolution deterministic and independently testable.
- Preserve collision sweep protection, correct render orientation, and full-collider offscreen removal in all four directions.

**Non-Goals:**

- Diagonal firing, free-angle aiming, mouse aiming, or twin-stick controls.
- New archer animation sheets or separate up/down character animations.
- Changes to shot timing, projectile speed, damage, capacity, or firing controls.

## Decisions

### Store cardinal shot direction separately from horizontal visual facing

Maintain a cardinal unit vector (`{ x: 1, y: 0 }`, `{ x: -1, y: 0 }`,
`{ x: 0, y: 1 }`, or `{ x: 0, y: -1 }`) for aiming while retaining horizontal
facing for the existing archer sprites. This avoids overloading the current
`-1`/`1` facing scalar and lets projectile behavior use one direction shape
end-to-end. The alternative—adding a second vertical flag beside the scalar—was
rejected because it permits invalid or diagonal combinations.

### Resolve cardinal intent with magnitude first and recency as the tie-breaker

Track a monotonic press order for each cardinal direction on non-repeat keydown
and equivalent discrete virtual-direction activation. At shot initiation,
compare the absolute X and Y magnitudes of current movement intent. Select the
larger axis and its sign. For equal non-zero magnitudes, select the active
component whose direction has the latest press order. With no non-zero current
input, reuse the remembered last cardinal direction; initialize it to right.
This directly implements the requested priority while avoiding key-repeat events
silently changing recency. Always preferring one fixed axis was rejected because
it would discard the player's most recent intent.

### Capture direction when shooting begins

Store the resolved cardinal direction as part of the active shooting sequence
and pass that captured value at the animation release frame. This makes a button
press deterministic even if movement input changes while movement is locked.
Resolving only on the release frame was rejected because animation latency could
redirect a shot after the player committed to it.

### Generalize projectile geometry around a direction vector

Advance both world coordinates by `direction * distance`, subdividing travel by
the projectile's leading-axis half-size so the existing swept collision behavior
works vertically and horizontally. Use the existing arrow width/height for
horizontal colliders and swap them for vertical colliders. Bounds removal checks
all four edges using the oriented collider. The renderer maps the four vectors
to exact quarter-turn rotations (and mirroring only where needed), never to an
arbitrary angle.

### Use explicit direction-aware spawn offsets

Define tested spawn offsets for all four directions so every arrow begins near
the bow and ahead of the player without changing the established right/left
placement. Up/down offsets will be cardinal mappings selected alongside the
shot direction and visually verified in the browser. Computing spawn from an
arbitrary angle was rejected because the contract permits only four directions.

## Risks / Trade-offs

- [The archer artwork remains horizontally posed for vertical shots] → Rotate the arrow only and keep character presentation stable; directional character animation is explicitly out of scope.
- [Keyboard and analog input can report ties differently] → Centralize direction resolution in a pure helper and cover dominant-axis, equal-axis, opposite-key, released-input, and default cases with unit tests.
- [Vertical collider dimensions can alter collision timing] → Derive collider and sweep step size from the oriented dimensions and add obstacle, NPC, and boundary regression tests for both axes.
- [Existing call sites may assume a numeric direction] → Update the player-to-renderer-to-projectile contract atomically and search all direction consumers during implementation.

## Migration Plan

Implement the direction helper and tests first, then migrate the player shot
payload, projectile model, renderer, collision behavior, and integrations in one
code change. No persisted data migration is required. Rollback consists of
reverting the additive implementation commit; existing assets and saved settings
remain compatible.
