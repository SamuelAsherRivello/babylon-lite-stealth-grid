## Context

See `proposal.md` for motivation and `specs/reactive-terrain-decorations/spec.md` for behavior. The current Tiled plugin normalizes finite orthogonal tile layers only; it does not yet expose object layers, tile classes, tile collision objects, or runtime animation descriptors. The composition root already owns a shared Babylon Lite sprite animation manager, typed player/NPC/enemy colliders, collider overlap helpers, explicit render-depth contracts, and disposal lifecycles.

The supplied `Bushe1.png` is a 1024 x 128 horizontal sheet containing eight 128 x 128 frames. A normal eight-cell Tiled spritesheet would expose all eight source frames as paintable palette tiles and Tiled's automatic tile animation would not provide per-placement trigger state.

## Goals / Non-Goals

**Goals:**

- Preserve a one-item authoring experience while keeping the original animation sheet intact for runtime use.
- Establish a generic normalized decoration descriptor and state controller that later reactive props can reuse.
- Keep sensing separate from blocking collision and keep every placement's state independent.
- Fit the existing Tiled normalization, Babylon Lite sprite, collider, and render-depth boundaries.

**Non-Goals:**

- General scripting, arbitrary event graphs, destructible foliage, loot, audio, particles, or save-game persistence.
- Making Tiled's editor preview play the collision-triggered runtime animation.
- Treating bushes as navigation obstacles or projectile targets.
- Adding a new physics, animation, or entity-component dependency.

## Decisions

### Use a one-tile image-collection entry with a derived idle preview

Add the untouched full spritesheet as the runtime source and derive a transparent 128 x 128 frame-zero preview for the Tiled tileset entry. The external decoration TSJ contains one named tile with `ReactiveDecoration` defaults plus explicit runtime-sheet, frame-size, frame-count, and timing metadata. Placing that tile on an object layer produces a tile object and keeps frames one through seven out of the authoring palette.

An ordinary eight-column Tiled spritesheet was rejected because it presents eight paintable source-frame tiles and encourages accidental placement of animation frames. Automatic Tiled tile animation was rejected because the game needs triggered, non-looping, independently controlled instances.

### Place instances on a dedicated Y-sorted props object layer

The map receives a canonical `Y-Sorted Props` object layer. Bushes are tile objects anchored at their bottom center, so authored position, sensor placement, and depth key share a stable ground-contact reference. A tile layer was rejected because per-instance properties, occupancy, and Y sorting are object semantics rather than grid-cell terrain semantics.

### Declare reusable behavior through a Tiled class and tile defaults

The Tiled project defines `ReactiveDecoration` with typed defaults for trigger mode, playback mode, idle frame, reset, rearm, blocking, accepted character types, and animation timing. Asset-specific defaults live on the bush tile; object properties override them. Normalization merges class defaults, tile defaults, and placed overrides in that precedence order.

Hard-coding `Bushe1` checks in `main.js` was rejected because the intended follow-up skill needs a stable class-driven recipe for additional artwork.

### Normalize object and sensor data without Babylon Lite dependencies

Extend the pure plugin boundary to resolve supported object layers and tile objects, including object identity, class, properties, bottom-center game position, visual descriptor, and tile collision geometry. Tile collision objects marked as sensors become normalized non-blocking shapes in world coordinates. Validation reports unsupported or incomplete reactive-decoration contracts before rendering.

Parsing map JSON directly in the runtime controller was rejected because it would duplicate coordinate conversion and make Node testing depend on rendering code.

### Use a small occupancy-driven state machine per placement

Each controller tracks `armed`, `playing`, and a set of overlapping character identities:

```text
+---------+   first character enters   +---------+
|  ARMED  | --------------------------> | PLAYING |
+---------+                             +----+----+
     ^                                       |
     | sensor empty                          | animation ends
     |                                       v
+----+------+   characters still inside +---------+
| DISARMED  | <-------------------------- |  IDLE   |
+-----------+                             +---------+
```

Entry is detected by comparing the current set of overlapping living character IDs with the prior set. Playback never restarts or queues while active. Animation completion restores frame zero. The controller rearms whenever occupancy becomes empty; exiting never cancels playback. Stable actor IDs are required so multiple characters do not cause per-frame triggers.

### Reuse the shared animation manager and collision helpers

Each decoration owns one sprite and its animation handle, while the application continues to update one shared animation manager. Character colliders already expose typed player, NPC, and enemy records; the composition root supplies only living supported characters to decoration updates. Sensors are stored separately from terrain and projectile obstacle collections.

### Derive depth from the bottom-center anchor

The renderer adapter uses the tile object's bottom-center position as the Y-sort key and the existing props/actor depth contract. Transparent pixels and the 128 px frame rectangle do not influence ordering. The sensor is positioned relative to the same anchor, keeping visuals and interaction aligned.

## Risks / Trade-offs

- [The derived preview duplicates frame-zero pixels] -> Generate it deterministically from the supplied sheet, keep the original as runtime truth, and test its 128 x 128 dimensions.
- [Object-layer support overlaps the broader active Tiled plugin change] -> Add the narrow reusable object/class/sensor fields required here without changing established tile-layer output, and cover backward compatibility with existing fixtures.
- [Several characters can enter or leave in one update] -> Track stable occupant IDs as a set and trigger at most once while armed.
- [Animation completion and sensor exit can occur in either order] -> Keep playback and armed state separate; reset visuals on completion and rearm only from empty occupancy.
- [Tiled class schema details may drift across versions] -> Use the repository's declared Tiled format version and validate the checked-in JSON through both parser tests and a Tiled-file contract test.
- [Y sorting could conflict with current fixed layer order] -> Add the decoration layer to the existing render-depth contract and verify front/behind cases in focused tests and the browser.

## Migration Plan

1. Add failing normalization and controller tests using minimal Tiled fixtures and fake animation APIs.
2. Copy the original sheet, generate the frame-zero preview, add attribution, and create the external decoration tileset and class declaration.
3. Add the canonical object layer and a sample bush placement to the current level.
4. Extend validation and normalization for the required tile-object, class, visual, and sensor contract without changing existing tile-layer consumers.
5. Add the runtime descriptor/controller and integrate its sprites, colliders, animation updates, Y sorting, and disposal at the composition root.
6. Run focused tests, the full suite, production build, checked-in Tiled validation, and a real-browser interaction smoke test.

Rollback is additive: remove the sample object and revert the decoration-specific files and narrow normalizer additions while retaining existing terrain maps. No authored terrain cells or persistent player data require migration.
