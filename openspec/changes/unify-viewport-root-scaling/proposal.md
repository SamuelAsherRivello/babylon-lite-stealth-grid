## Why

The game currently positions and rescales sprite layers independently. Gold pickups use special resize and visual-offset logic, causing them to drift or jitter relative to the grid when the window changes. A single logical viewport contract is needed so every world object remains aligned while the screen scales.

## What Changes

- Establish one fixed logical game-world coordinate space based on the existing grid and design resolution.
- Centralize viewport scaling so terrain, actors, pickups, projectiles, effects, and diagnostics share the same resize transform.
- Remove pickup-specific resize calculations and arbitrary visual offsets.
- Place pickup sprites and non-blocking combat colliders at the exact center of their authored grid cells.
- Preserve movement-collider semantics: pickups do not block movement; combat colliders remain non-blocking.
- Add resize-focused runtime QA and coordinate logging for representative objects.

## Capabilities

### New Capabilities

- `unified-viewport-world`: A single logical viewport/root contract for resize-stable world rendering and object placement.

### Modified Capabilities

- `gold-stone-and-pickups`: Gold pickup placement and collider requirements now explicitly use the exact authored grid-cell center and shared viewport transform.

## Impact

Affected areas include the Babylon Lite renderer setup, viewport resize handling, sprite-layer creation, player/actor positioning, gold pickup rendering and colliders, diagnostics, and related tests. No new dependency is expected.
