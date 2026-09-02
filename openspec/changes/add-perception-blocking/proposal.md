## Why

The perception system currently treats audio as an unblocked neighboring-cell check and visual perception as blocked only by terrain. For stealth gameplay, an enemy in an audio spot must mask that spot and any player there, while a bush or enemy on a visual ray hides that cell and every cell beyond it.

## What Changes

- Make audio perception enemy-aware: a living enemy occupying a neighboring audio spot blocks detection for that spot, including a player sharing it; bushes do not block audio.
- Add visual detection negation: a bush, living enemy, or unwalkable terrain in the player's exact visual cell makes that one spot undetectable.
- Add visual perception blocking: a bush, living enemy, or unwalkable terrain before the player on the detector's facing line prevents detection in that cell and every cell beyond it.
- Preserve bush pass-through movement for enemies; a bush occupying the detector's current cell SHALL NOT block that enemy's own visual ray.
- Keep terrain blocking, perception ranges, strengths, hidden-player filtering, and enemy reaction behavior unchanged unless required to consume the new blocked-cell result.
- Add deterministic unit and integration coverage for bush/enemy blockers, player co-occupancy, and cells beyond visual blockers.

## Detection Case Matrix

| Perception | Valid detection | Detection negation — one spot | Detection blocking — beyond one spot |
|---|---|---|---|
| Audio | The player is in one of the eight neighboring cells and no living enemy occupies that cell. | A living enemy occupies the audio cell, so the player cannot be detected in that same cell. A bush does not negate audio detection. | Not applicable: audio has no directional beyond-cell rule; only the occupied cell is negated. |
| Visual | The player is on the detector's cardinal vision line, within range, the target cell is walkable, and every preceding cell is clear. | A bush, living enemy, or unwalkable terrain occupies the player's exact visual cell, so that one spot cannot be detected. | A bush, living enemy, or unwalkable terrain occupies an earlier visual cell, so that blocker cell and every visual cell beyond it cannot be detected. |

Audio therefore differs from visual in two ways: only living enemies negate an audio spot, bushes are transparent to audio, and audio has no directional propagation beyond the occupied cell. Visual perception has both target-cell negation and beyond-cell blocking.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `character-perception`: Visual and Audio Perception must account for occupied blocking spots when deciding whether the player can be detected.

## Impact

Likely affects `src/systems/perception/character-perception.js`, the actor registration/update data supplied to perception, terrain/decorations and enemy occupancy queries, debug snapshots if blocked geometry is exposed, and perception tests. No new dependency or persistence migration is required.
