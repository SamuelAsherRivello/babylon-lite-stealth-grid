## Why

The project needs a repeatable way to translate Aseprite-authored sprite packs into Babylon Lite animations without parsing `.aseprite` files at runtime. The supplied Tiny Swords Particle FX pack also needs an immediately inspectable preview so every exported effect and its playback controls can be verified in the running game.

## What Changes

- Add a reusable local Babylon Lite/Aseprite integration under `plugins/aseprite-babylon-lite/` that consumes explicit JavaScript sprite descriptors and Babylon Lite's supported grid-atlas API.
- Preserve the supplied `.aseprite` authoring source separately from the eight PNG sheets used by the browser.
- Add a shared animated-particle base class and one concrete class per Dust, Explosion, Fire, and Water Splash animation under appropriately named `src/particle-fx/` subfolders.
- Give every particle instance conventional `play()` and `stop()` controls, with looping playback used by the initial preview.
- Display one instance of every supplied effect above existing game sprites in a centered horizontal row.
- Add unit, build, and real-browser verification for descriptors, class controls, asset loading, animation, layering, and layout.

## Capabilities

### New Capabilities

- `reusable-particle-effects`: Defines reusable Babylon Lite particle-effect classes, playback controls, Aseprite-to-runtime metadata, and the centered all-effects preview.

### Modified Capabilities

None.

## Impact

- Adds local integration code under `plugins/aseprite-babylon-lite/` and particle classes under `src/particle-fx/`.
- Adds the original Aseprite source under a non-public authoring-assets path and eight runtime PNG sheets under `public/assets/particles/`.
- Updates `src/main.js` to load and render the preview and updates tests and project documentation.
- Uses the existing `@babylonjs/lite` dependency; no runtime Aseprite parser or new external package is required.
