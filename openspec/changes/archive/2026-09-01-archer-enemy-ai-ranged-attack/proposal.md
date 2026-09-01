## Why

The archer is currently rendered but has no autonomous response to the player, so it does not read as an enemy threat. Adding proximity-based facing and ranged attack behavior will make the archer visibly react while preserving the player's opportunity to evade a fired arrow.

## What Changes

- Add autonomous archer targeting of the living player.
- Face left or right toward the player whenever the player's total 2D distance is within five world units.
- Start a non-looping shoot animation when the player's total 2D distance is within four world units and the archer is ready to fire.
- Spawn one arrow during the shoot animation, aimed at the player's position captured at release.
- Give the arrow a visible upward-then-downward arc toward the captured landing position; do not home or retarget it after release.
- Keep the existing enemy, collider, projectile, animation, and pause contracts intact.
- Add unit and integration coverage for thresholds, facing, cooldown/attack gating, release, arc, and player evasion.

## Capabilities

### New Capabilities

- `archer-enemy-ai`: Defines the archer's player-aware facing, ranged attack timing, and non-homing target snapshot behavior.
- `archer-ballistic-projectiles`: Defines archer arrow release, directional travel, ballistic arc, landing, and lifecycle behavior.

### Modified Capabilities

- `actor-ai-behaviors`: Extends autonomous enemy targeting to support the archer's ranged attack policy while preserving the shared actor-neutral AI contract.

## Impact

- Affects `src/characters/enemies/archer/`, the main gameplay update/controller wiring, and the existing projectile modules.
- Adds pure AI/trajectory logic and tests without adding dependencies.
- Reuses the existing archer shoot animation, arrow asset/renderer, combat colliders, world-unit conventions, and pause behavior.
