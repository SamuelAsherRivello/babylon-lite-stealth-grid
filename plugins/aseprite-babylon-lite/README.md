# Aseprite to Babylon Lite

This local adapter turns metadata inspected from an Aseprite source file into
Babylon Lite grid-atlas sprites. Aseprite is an authoring input, not a browser
dependency: the game loads exported PNG sheets and explicit JavaScript
descriptors only.

## Descriptor

Each animation descriptor contains:

- `name`: human-readable Aseprite tag name.
- `imageUrl`: browser URL of the exported PNG sheet.
- `gridSize`: native `[width, height]` of one exported frame.
- `frameCount`: number of frames in the tag and exported sheet.
- `direction`: currently `"forward"` only.
- `frameDurationMs`: uniform delay between frames.
- `loop`: default playback behavior.
- `displaySize`: independently configurable rendered size.
- `pivot`: sprite-layer pivot; `[0, 0]` is the top-left preview convention.
- `sampling`: Babylon texture sampling, normally `"nearest"` for pixel art.

`validateAsepriteSpriteDescriptor()` checks the runtime contract.
`loadAsepriteSpriteAtlas()` loads the native grid through Babylon Lite, and
`createAsepriteSpriteInstance()` creates a capacity-one layer and sprite.

## Integration workflow

1. Open or inspect the `.aseprite` file and record each tag's name, frame range,
   direction, frame duration, and native canvas or export-cell size.
2. Export one uniform, single-row PNG sheet per animation tag.
3. Keep the `.aseprite` file in a non-public source-assets directory.
4. Put runtime PNGs under `public/assets/` and describe them in a frozen catalog.
5. Create a concrete `AnimatedParticleEffect` subclass whose static
   `descriptor` selects one catalog entry.

The installed Babylon Lite atlas loader does not accept Aseprite JSON metadata
or irregular packed frames. This adapter therefore supports uniform grid
sheets. Add a separate packed-atlas adapter if a future export requires
per-frame rectangles.

## Example

```js
import { Fire01ParticleEffect } from "../../src/particle-fx/index.js";

const fire = await Fire01ParticleEffect.create({
  engine,
  animationManager,
  position: [288, 480],
  order: 3,
});

fire.play();
fire.stop();
fire.play(); // Restarts from frame zero using the same animation handle.
```
