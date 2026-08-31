## Why

The level currently creates one hardcoded player, sheep, and enemy directly, which prevents level-authored placement and automatic population recovery. Introducing reusable spawners now establishes the runtime concept that later Tiled level objects can configure while preserving the current hardcoded positions during the transition.

## What Changes

- Add a generic spawner that owns one actor type, a position, minimum and maximum population values, and a configurable check interval of N seconds that defaults to one second.
- Add player, sheep, and enemy spawner configurations at the actors' current hardcoded positions.
- Immediately evaluate every spawner, guaranteeing the initial player while allowing non-player spawners to create zero or a lower-weighted random batch, then reevaluate every N seconds so populations build and recover gradually without exceeding the configured maximum.
- Represent every spawner with a permanent, non-interactive marker using the corresponding actor's static idle appearance, rendered in black and white at 50% of the live actor's rendered dimensions.
- Show spawner markers only while the existing collider diagnostic setting is enabled without allowing marker visibility to affect spawning.
- Generalize the main-loop integration from singular actor references to spawner-owned actor collections and count defeated actors until their death animation completes and they are disposed.

## Capabilities

### New Capabilities

- `entity-spawners`: Defines generic timed population maintenance, the three initial spawner configurations, actor lifecycle accounting, and debug-only spawner markers.

### Modified Capabilities

- None.

## Impact

- Affects the game composition root, player/sheep/enemy lifecycle integration, dynamic collision inputs, updates, viewport scaling, diagnostics, renderer layer membership, and shutdown disposal.
- Adds focused spawner and integration tests while retaining the current Babylon Lite rendering stack and existing assets.
- Establishes a runtime configuration boundary compatible with the typed object-layer spawn points planned by the active Tiled integration change.
- Adds no new runtime dependency and does not yet read spawner positions from level files.
