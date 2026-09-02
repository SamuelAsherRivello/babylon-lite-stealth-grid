## Why

Enemies can show awareness while continuing their previous walking direction, making detection look disconnected from behavior. Every enemy needs to stop its current movement and make a fresh state-appropriate decision when its awareness state changes.

## What Changes

- Apply one shared stop-and-redecide contract to entry into `SUSPICIOUS`, `INVESTIGATING`, and `ALERT`, including escalation and de-escalation into those states.
- Clear obsolete movement intent, route, waypoint, and recovery work before selecting the new reaction; prevent normal controllers from overwriting it.
- Make entry produce a stationary locomotion update before newly selected movement can execute. Do not add an arbitrary timed stun or alter reaction durations.
- Preserve same-state detection refreshes without repeatedly stopping the enemy, existing combat/death locks, collision rules, and legitimate state-specific decisions.
- Cover all enemy types with transition and runtime-integration regressions plus browser verification.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `enemy-perception-reactions`: Require movement interruption and fresh decision ownership on every non-`NONE` state entry, followed by state-appropriate behavior.

## Impact

Likely edit surfaces are `src/systems/perception/enemy-perception-reaction.js`, enemy runtime wiring/update order in `src/main.js`, shared enemy patrol and specialized controller cancellation adapters, and perception/controller integration tests. Integrate with the current blocked-movement recovery and GridSpot contracts without changing their ownership or geometry. No new dependencies, assets, level edits, or player/NPC behavior changes.

Canonical change identity is `C055`; implementation tasks use permanent `C055-T###` IDs. `stop-and-redecide-on-enemy-alert` remains the readable name. This proposal does not implement gameplay changes.
