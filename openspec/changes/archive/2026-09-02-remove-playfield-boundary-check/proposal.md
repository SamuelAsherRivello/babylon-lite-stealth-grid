## Why

The current navigation resolver rejects any movement that would place a character's movement collider outside the logical playfield. This prevents characters from crossing the visible screen edge, but the desired navigation behavior is to omit that artificial boundary and allow movement to continue beyond the screen.

## What Changes

- Remove playfield-boundary validation from character movement resolution.
- Preserve terrain obstacle collision and independent horizontal/vertical collision resolution.
- Allow player, NPC, and enemy movement to carry their movement colliders beyond the logical screen bounds.
- Keep rendering and viewport behavior unchanged; characters may become partially or fully off-screen as a result.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `terrain-collision-classification`: Character navigation no longer treats the logical playfield rectangle as a movement obstacle; terrain collision remains active.

## Impact

- `src/gameplay/game-logic.js`, specifically the movement resolver and its boundary decision.
- Existing character actor movement paths that call `moveWithCollisions`.
- Terrain collision behavior, character separation, rendering, projectiles, and viewport scaling remain otherwise unaffected.
