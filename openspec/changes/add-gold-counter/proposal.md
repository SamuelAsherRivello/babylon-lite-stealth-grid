## Why

The level currently provides no at-a-glance feedback about how much gold is available or how much the player has collected. A small visual counter makes the existing gold pickup activity legible without adding a gameplay objective or reward.

## What Changes

- Add an upper-left HUD label directly below the release/version line, formatted as `Gold: 00/00`.
- Count the gold available when the level starts and show it as the denominator.
- Increase the collected value when the player collects a gold pickup.
- Keep the counter visual only; collecting all gold does not trigger any special behavior.

## Capabilities

### New Capabilities

- `gold-counter`: Provides a level-scoped visual gold collection counter in the HUD.

### Modified Capabilities

- None.

## Impact

The existing DOM HUD/header, level initialization, and gold pickup collection path will be affected. No new dependency, persistence, or gameplay completion rule is required.
