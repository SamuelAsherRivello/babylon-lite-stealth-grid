## Why

Terrain decorations such as the Tiny Swords bush need to remain simple, single items for a level designer to place in Tiled while still supporting independent collision-triggered animation at runtime. Establishing this first reactive decoration creates a repeatable contract for adding further interactive environmental artwork without hard-coding behavior in each map.

## What Changes

- Add `Bushe1.png` as one Tiled tileset item backed by eight 128 x 128 animation frames.
- Represent each placed bush as a selectable tile object on the Y-sorted props object layer.
- Give reactive decorations a reusable Tiled class with a non-blocking character-entry sensor and per-instance behavior properties.
- Keep each bush on frame zero while idle, play frames zero through seven once when any supported character enters, then return to frame zero.
- Rearm a bush only after all characters have left its sensor, preventing overlap spam and mid-playback restarts.
- Normalize the required tile-object, class, animation, and sensor metadata and instantiate independently controlled Babylon Lite decoration sprites.
- Add automated and browser-visible verification for placement, depth sorting, triggering, playback, reset, and rearming.

## Capabilities

### New Capabilities

- `reactive-terrain-decorations`: Tiled-authored, independently animated terrain decoration objects triggered by character sensor entry.

### Modified Capabilities

None.

## Impact

- Adds the supplied Tiny Swords bush spritesheet under the repository-managed public terrain-decoration assets.
- Adds or updates repository Tiled project data, an external decoration tileset, the level object-layer structure, and a sample bush placement.
- Extends `plugins/tiled-babylon-lite` normalization to expose supported tile objects, tile animation metadata, classes/properties, and non-blocking sensor geometry.
- Adds a small runtime reactive-decoration controller and integrates it with character colliders, animation-manager updates, rendering order, and disposal.
- Adds focused unit/integration tests and updates asset attribution documentation as required; no new production dependency is expected.
