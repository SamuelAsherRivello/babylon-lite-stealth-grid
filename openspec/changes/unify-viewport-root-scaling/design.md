## Context

The current runtime stores world positions in logical pixels but applies viewport zoom and render ordering at multiple object-specific sites. Pickup artwork also accumulated manual offsets. See proposal.md and the delta specifications for the required behavior.

## Goals / Non-Goals

**Goals:**

- Establish one shared logical viewport transform for all world-rendered content.
- Keep grid positions and collider positions independent of window dimensions.
- Make pickup rendering follow the same transform and depth rules as actors.
- Preserve non-blocking combat-collider semantics for pickups.

**Non-Goals:**

- Replacing the Babylon Lite renderer.
- Changing gameplay grid dimensions or authored level coordinates.
- Adding inventory, gold balances, or new pickup effects.

## Decisions

- Use the existing fixed design resolution and grid as the canonical logical coordinate space. This preserves current gameplay and avoids converting gameplay state during resize.
- Centralize viewport-scale application over all registered world layers. A true Babylon scene-node parent is not assumed for Babylon Lite sprite layers; the renderer's shared viewport transform is the equivalent root.
- Calculate pickup sprite and combat-collider centers from the same logical position. Remove compensating pixel offsets; image padding must not alter gameplay coordinates.
- Update dynamic layer depth from logical world Y in the same centralized pass used for other actors. This separates depth from viewport scaling.

## Risks / Trade-offs

- [Risk] Babylon Lite layers may not support ordinary scene-node parenting. -> Mitigation: use one renderer-level viewport transform and enforce a single logical-coordinate contract.
- [Risk] Existing objects may contain hidden per-layer zoom or screen-space assumptions. -> Mitigation: inventory all layer creation and resize updates, then add resize regression checks for terrain, player, and pickup alignment.

## Migration Plan

1. Introduce shared viewport application and object coordinate helpers.
2. Migrate actors, pickups, props, projectiles, and effects to the shared path.
3. Remove pickup-specific offsets and duplicate scaling.
4. Run unit, build, and real-browser resize QA.

