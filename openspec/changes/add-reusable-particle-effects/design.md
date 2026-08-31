## Context

See `proposal.md` for motivation and `specs/reusable-particle-effects/spec.md` for the behavior contract. The renderer uses `@babylonjs/lite`, whose installed `loadSpriteAtlas` supports uniform grid atlases and explicitly rejects a metadata URL. A sprite layer references one atlas. The supplied Aseprite source contains 75 frames divided into eight forward tags, each at 100 ms, while the supplied PNGs export each tag as a separate one-row sheet. Five sheets use 64x64 cells and three use 192x192 cells.

No `/plugins/` convention currently exists in the repository. The available package ecosystem has generic Aseprite parsers and engine-specific integrations, but no Babylon Lite adapter that matches the installed API.

## Goals / Non-Goals

**Goals:**

- Establish a reusable local boundary for translating inspected Aseprite data into Babylon Lite grid-atlas animations.
- Give every concrete effect a small object-oriented lifecycle with safe play and stop controls.
- Keep pack-specific metadata separate from generic Babylon Lite integration behavior.
- Make all eight animations simultaneously inspectable without changing the 576x1024 logical viewport.

**Non-Goals:**

- Parse `.aseprite` binary files in the browser or require Aseprite to run the game.
- Implement a general packed-atlas loader, variable per-frame timing, particle emitters, pooling, destruction, combat triggers, or editor hot reload.
- Change existing terrain, player, collision, controller, or water-foam behavior.

## Decisions

### Use an explicit descriptor as the Aseprite-to-Babylon contract

Create a pack-agnostic adapter under `plugins/aseprite-babylon-lite/` that validates a descriptor and uses Babylon Lite's supported `loadSpriteAtlas`, `createSprite2DLayer`, `addSprite2D`, `playSprite2DAnimation`, and `stopSpriteAnimation` functions. A descriptor carries the PNG URL, grid size, frame count, duration, loop default, display size, pivot, and sampling mode.

The `.aseprite` source is inspected during integration to populate descriptors but is not imported by application code. Parsing the binary at runtime was rejected because exported PNGs are already present, browser parsing adds cost and dependency surface, and Babylon Lite still needs runtime atlas objects tailored to its own API. A third-party generic parser was rejected for the same reason and because no Babylon Lite-specific package exists.

### Separate the reusable adapter, pack catalog, and concrete classes

Keep generic adapter code in `plugins/aseprite-babylon-lite/`. Keep the Particle FX catalog in `src/particle-fx/particle-fx.catalog.js`, then provide a shared `AnimatedParticleEffect` base class and eight concrete classes in effect-specific folders:

- `dust-01/Dust01ParticleEffect.js`
- `dust-02/Dust02ParticleEffect.js`
- `explosion-01/Explosion01ParticleEffect.js`
- `explosion-02/Explosion02ParticleEffect.js`
- `fire-01/Fire01ParticleEffect.js`
- `fire-02/Fire02ParticleEffect.js`
- `fire-03/Fire03ParticleEffect.js`
- `water-splash/WaterSplashParticleEffect.js`

Each subclass selects one immutable catalog entry while the base class owns layer, sprite, and animation state. A single generic class configured at call sites was rejected because the user explicitly requires one usable class per effect. Duplicating Babylon setup in eight unrelated classes was rejected because it would make playback fixes inconsistent.

### Make play and stop idempotent

An instance retains its current Babylon Lite animation handle. `play()` stops the retained handle before starting a fresh animation from frame zero, ensuring restart semantics and preventing duplicate manager entries. `stop()` stops the retained handle when present and otherwise does nothing. The sprite and layer remain allocated and visible after stopping.

This uses Babylon Lite's public animation lifecycle rather than manipulating animation-manager arrays. Removing the sprite on stop was rejected because stop should control playback, not visibility or ownership.

### Use one atlas and layer per effect instance

Because Babylon Lite sprite layers each reference one atlas, each concrete preview effect owns a capacity-one layer. All preview layers use render order 3, above terrain order 0, player order 1, and animated terrain order 2. The renderer receives the eight layers in catalog order.

Repacking all effects into one generated atlas was rejected because the native cell sizes differ and it would introduce another derived binary asset. Sharing layers across instances was rejected for the initial adapter because it complicates ownership and prevents classes from being independently usable.

### Fit the overview into eight uniform display cells

Use 64x64 display size for every preview instance even when its source atlas cell is 192x192. Place the top-left-pivoted sprites at X values 32, 96, 160, 224, 288, 352, 416, and 480 with Y 480. This forms a 512x64 row centered in the 576x1024 logical viewport. Atlas decoding continues to use native cell dimensions, so scaling affects display only.

Native-sized previews were rejected because their combined width is 896 pixels and cannot form a non-overlapping horizontal row in the current viewport.

### Preserve source and exports in separate asset roots

Copy `Particle FX.aseprite` to `assets/source/particles/` and copy the eight PNGs to `public/assets/particles/`. The source location is versioned authoring material but is outside Vite's public asset root. Runtime URLs reference only the PNG folder.

## Risks / Trade-offs

- **Large effects lose detail at 64x64 in the overview** -> Preserve native atlas geometry and keep display size configurable so consumers can instantiate those effects at 192x192 elsewhere.
- **One layer per instance does not scale to hundreds of particles** -> Keep this change focused on reusable individual effects and the eight-item preview; design pooling as a later capability if gameplay requires emitters.
- **Stopping may leave a visually unexpected current frame** -> Define stop as halting advancement without hiding or resetting; `play()` always restarts from frame zero.
- **Descriptor data could drift from edited Aseprite source** -> Unit-test every supplied descriptor against the known exported sheet geometry and document the inspection/export checklist in the plugin README.
- **DOM debug canvas can still draw over WebGPU sprites** -> Interpret render order as ordering among Babylon sprite layers; keep preview positions away from persistent controls where practical and verify the composed page in-browser.

## Migration Plan

1. Copy the untouched Aseprite source and eight exported PNGs to their authoring and runtime destinations.
2. Add descriptor validation and adapter lifecycle tests before integration code.
3. Add the shared base and eight concrete particle-effect classes with class-level tests.
4. Integrate the eight preview layers and centered layout without removing existing animation behavior.
5. Update documentation, run tests and build, validate the OpenSpec change, and inspect the animations in a real WebGPU browser.

Rollback is additive: remove the new source, runtime assets, adapter, particle classes, tests, and preview wiring. No saved data, dependencies, or existing public APIs require migration.
