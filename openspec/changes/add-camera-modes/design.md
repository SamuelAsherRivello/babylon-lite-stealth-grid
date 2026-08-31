## Context

See `proposal.md` for motivation. The current game calculates one uniform viewport scale and assigns it directly to each Babylon Lite sprite layer. There is no shared camera position, and debug drawing converts world Y using a fixed screen height. The Tiled plan introduces finite authored map bounds that may extend left of or below the origin marker at game tile `(0,0)`.

## Goals / Non-Goals

**Goals:**

- Keep camera state and mode transitions pure and testable without WebGPU.
- Apply one logical world-to-screen transform consistently across all world layers and diagnostics.
- Anchor screen regions to tile `(0,0)` so negative map coordinates are deterministic.
- Preserve responsive physical scaling independently from camera world position.

**Non-Goals:**

- Cinematic paths, zoom animation, camera shake, manual/free-camera controls, or following arbitrary non-player targets.
- Perspective or 3D camera behavior.
- Letting the human content editor structurally configure camera metadata; the AI prepares it.
- Defining occlusion, room streaming, or unloading offscreen tiles.

## Decisions

### Represent the camera as plain logical state

Use a data object containing mode, viewport size, world-space view origin or center, map bounds, deadzone, and current screen-region indices. Pure update functions receive player position and return the next camera state. Rendering adapters translate that state to Babylon Lite layer views and debug-canvas transforms.

### Use one shared transform for all world content

Compute world-to-screen translation plus uniform physical scale once per frame and apply equivalent values to terrain, player, animated, and future world layers. Debug diagnostics use the same logical camera rectangle. Existing HTML HUD and controls remain outside this transform.

### Define fixed mode from authored world bounds

`world-center-no-scroll` centers the viewport on the midpoint of the full authored minimum/maximum bounds and never updates from player movement. This preserves fixed behavior conceptually while supporting maps whose coordinates are not zero-based.

### Use a rectangular deadzone in logical pixels

Store deadzone left, right, bottom, and top offsets relative to the logical viewport. Player-follow moves only the minimum distance needed on each axis after the player crosses a boundary, then clamps to map bounds. Pixel-space parameters avoid coupling camera feel to a particular tileset while AI setup can derive tile-multiple defaults.

### Anchor screen regions to the declared world origin

Region `(0,0)` is the initial viewport whose lower-left is game `(0,0)`. Region indices use floor division by logical viewport width and height, so content and players in negative coordinates map to negative region indices. Partial edge regions clamp to authored bounds.

### Keep mode selection in AI-managed level metadata

The runtime consumes a validated camera configuration from the authored level. Mode-specific configuration is structural metadata prepared by the AI, consistent with the content-only human workflow.

## Risks / Trade-offs

- [Applying camera transforms separately can desynchronize layers] -> Derive all layer views and diagnostics from one immutable camera snapshot per frame.
- [A player can cross two screen regions in one long frame] -> Determine the region from the resulting player position rather than incrementing by only one region.
- [Negative coordinates can produce incorrect region indices with truncation] -> Use mathematical floor division and test boundary values on both sides of zero.
- [Maps smaller than the viewport cannot be conventionally clamped] -> Center them on that axis and permit background clear space equally on both sides.
- [Deadzone values can be invalid or larger than the viewport] -> Validate ordering and dimensions before level startup.
- [Screen-region transitions are selected but their visual transition style is unspecified] -> Resolve instant cut versus timed pan before implementing the screen-by-screen presentation; the region state model supports either.

## Migration Plan

1. Add pure failing tests for bounds, fixed centering, deadzone tracking, negative region indices, region crossing, resize stability, and small maps.
2. Implement the camera state and world-to-screen transform without changing rendering.
3. Apply the shared transform to all Babylon Lite world layers and diagnostics while preserving screen-space UI.
4. Add AI-managed camera metadata to the authored level contract and sample maps.
5. Verify all modes in focused tests, the full suite, production build, and real browser.

Rollback is an additive Git revert to the existing zoom-only fixed view. No stored player data migration is required.

## Open Questions

- Should `screen-by-screen` change regions with an instant cut or a timed pan? The user selected the region mode but ended the grill before choosing its presentation. This must be resolved before implementing that mode's visible transition.
