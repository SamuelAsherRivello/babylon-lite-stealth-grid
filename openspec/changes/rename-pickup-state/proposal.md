## Why

Pickup collection currently uses an internal transition state that can be re-entered while the pickup animation is running. This makes the collection contract unclear and can restart or delay the animation when collision detection runs again.

## What Changes

- Replace the externally meaningful pickup state with `IsPickedUp`, initialized to `false`.
- Rename the pickup transition method to `pickup()`.
- Set `IsPickedUp` to `true` immediately when `pickup()` succeeds.
- Make pickup detection one-shot by excluding pickups whose `IsPickedUp` is already `true`.
- Preserve the existing pickup animation and removal behavior after the transition.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `gold-stone-and-pickups`: Define the public pickup state and one-shot pickup transition contract.

## Impact

The pickup object API, pickup-system collision handling, related tests, and the gold-stone-and-pickups specification will be affected. No new dependencies or assets are required.
