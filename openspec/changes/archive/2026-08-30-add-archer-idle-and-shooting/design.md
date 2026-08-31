## Context

See `proposal.md` for motivation and
`specs/archer-ranged-attack/spec.md` for the behavior contract. The renderer
currently loads one run atlas, creates one archer sprite, and loops frames 0-3
regardless of movement. Babylon Lite sprite layers each reference one atlas,
while animation objects can be started, stopped, restarted, and observed for
their current frame. The game has no physics dependency or world geometry;
movement and coordinate conversion are pure JavaScript logic.

All three supplied archer sheets use 192x192 frames: four run frames, six idle
frames, and eight shoot frames. The arrow is a single 64x64 image.

## Goals / Non-Goals

**Goals:**

- Keep animation state explicit and prevent overlapping visible archer sprites.
- Synchronize one projectile release with the visual bow release.
- Model flight and ground contact deterministically in testable pure logic.
- Preserve the existing quadrant-I movement and screen-coordinate contracts.
- Allow more than one arrow to remain in flight if a later shot begins after
  the previous shoot animation has completed.

**Non-Goals:**

- Add enemies, damage, obstacle collision, targeting, aiming controls, sound,
  particle effects, or a general-purpose physics engine.
- Add vertical character movement or reinterpret the existing world Y axis as
  physical height.
- Queue or cancel attacks while a shot is already active.

## Decisions

### Use one sprite layer per atlas and one visible archer state

Load run, idle, shoot, and arrow atlases together. Create separate idle, run,
and shoot layers with identical 192x192 size, pivot, order, position, and
facing. A state transition makes exactly one archer handle visible, stops the
previous animation, and starts the destination animation from frame zero.

This matches the one-atlas-per-layer renderer design and avoids repacking or
modifying the supplied art. Building a combined atlas was rejected because it
would create an additional generated asset and complicate frame maintenance.

### Represent archer behavior as idle, running, and shooting states

The update loop derives idle versus running from the normalized movement
vector, except while `shooting` is active. Entering shooting captures the
current facing, locks position updates, starts frames 0-7 without looping, and
ignores further Space keydown events. Animation completion transitions to idle
or running based on the movement keys currently held.

Facing defaults to right and changes only when movement has a non-zero X
component. Vertical-only movement retains the last horizontal facing. This
keeps the horizontal arrow art aligned with a predictable firing direction.

Allowing movement during the shoot animation was rejected because it makes the
attack pose slide and weakens the connection between the bow and release point.

### Release the arrow by observing the shoot animation frame

Track whether the current shot has released its arrow. During update, observe
the non-looping shoot animation's current frame and spawn exactly once when it
first reaches release frame 5. Place the projectile at a configured bow offset
mirrored by facing.

Babylon Lite exposes an end callback but no dedicated per-frame event. A
separate wall-clock timeout was rejected because throttled frames could make
the projectile appear before the visual release frame.

### Use deterministic ballistic projectile logic without a physics engine

Maintain active projectiles as gameplay records containing planar `x` and `y`,
visual `height`, horizontal and vertical velocities, facing, and a circular
collider. Each update step applies horizontal motion, gravity, and
vertical motion. The arrow's screen position is the existing world-to-screen
result with `height` subtracted from screen Y, creating visible elevation
without changing the planar coordinate model.

The collider carries the same planar position and height as its projectile.
Ground collision occurs when a descending projectile reaches height zero.
That projectile and its sprite are removed immediately. Collider data remains
explicit so later enemy or obstacle work can reuse it without being included
in this change.

A full Babylon/Havok physics world was rejected because the game is currently
a lightweight 2D sprite renderer and the required trajectory has a simple,
closed simulation with no rigid-body interactions.

### Use pooled layer capacity with one sprite handle per active arrow

Create one arrow layer with capacity for a small bounded set of simultaneous
projectiles. Each release adds a sprite handle; landing removes it. Keep the
gameplay record and sprite handle together so removal cannot leave an orphaned
collider or rendered arrow. If capacity is reached, do not create an additional
projectile and reset the shot's release flag normally.

This avoids allocating a renderer layer and GPU resources for every shot.

### Test gameplay state and projectile math separately from rendering

Move state-transition and projectile-step calculations into exported pure
functions in `src/game-logic.js`. Unit tests cover state priority, movement
locking, facing retention, one-time release gating, ballistic position,
collider synchronization, and landing removal. Browser verification covers
asset loading, frame alignment, visual state transitions, release timing, arc,
mirroring, and disappearance.

## Risks / Trade-offs

- **Release frame may need visual tuning** -> Start at zero-based frame 5 and
  verify in a real browser against the supplied sheet before finalizing.
- **Transparent padding can make layers appear misaligned** -> Use the same
  native 192x192 cell, pivot, size, and position for all archer layers.
- **Large frame deltas can step below the ground plane** -> Clamp height to
  zero and determine landing from downward travel crossing the plane.
- **Arrow capacity can be exhausted by unusually long flight tuning** -> Use a
  documented capacity comfortably above the maximum expected concurrent shots
  and fail without leaving partial state.
- **A circle collider is only groundwork for future target hits** -> Limit this
  change's collision response to the specified ground landing behavior.

## Migration Plan

1. Copy the three user-supplied PNGs into the existing local archer asset
   directory without changing the source files.
2. Add pure state and projectile logic with tests.
3. Replace the single run-only sprite setup with state-specific layers and the
   projectile layer.
4. Verify tests, production build, and the complete interaction in a WebGPU
   browser at desktop and portrait viewport sizes.

Rollback is additive: remove the new asset copies and restore the original
single run layer and animation path. No stored data or schema migration is
involved.
