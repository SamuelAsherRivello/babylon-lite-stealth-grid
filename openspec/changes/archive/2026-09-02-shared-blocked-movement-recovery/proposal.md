## Why

Live diagnostics showed goblin-3 remaining at spot (0, 12) across four samples spanning 19 seconds, including walking states. Autonomous characters need to abandon movement that cannot progress and select an available escape instead of repeatedly pushing into corners.

## What Changes

- Validate autonomous spawn placement, including exact initial spawns; replace a blocked authored position with the nearest available grid-cell center, or defer spawning if none is available.
- C054 introduces shared blocked-movement recovery for every autonomous enemy and NPC movement policy, including goblin patrol and bush approach.
- Use current terrain, actor occupancy, collider clearance, and segment reachability when selecting and revalidating movement.
- Detect a rejected movement segment or sustained lack of progress, discard the failed route, and select another reachable destination.
- Permit a one-cell escape when ordinary patrol or flee preferences leave no candidate; preserve normal preferences outside recovery.
- When genuinely surrounded, stop and retry after three seconds of active gameplay time.
- Expose bounded diagnostic snapshots for actual position, spot, intent, waypoint, recovery reason, and retry timing.
- Preserve human player directional control, intentional idle/attack/cooldown states, and collision safety.

## Capabilities

### New Capabilities

### Modified Capabilities

- `actor-ai-behaviors`: Shared progress detection, safe destination selection, recovery priority, and delayed retries for autonomous movement.

## Impact

- Shared movement/navigation helpers, enemy patrol and goblin controllers, NPC navigation, and runtime collision/snapshot integration.
- Focused automated regressions and live browser sampling at (0, 12), corners, dynamic blockers, and temporary enclosure.
- Coordinate with universal-grid-spot-occupancy and quantized-enemy-movement-on-one-axis; use the authoritative spot contract available at implementation time. No dependency on their diagnostic rendering work.
- No new dependencies, asset edits, teleportation, or game-loop lockup detector changes.
