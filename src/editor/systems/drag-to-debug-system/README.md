# Drag to Debug System

Opt-in editor utility for finding exact attachment positions. It is not imported
or enabled by normal gameplay. No archer, projectile, animation or renderer dependency.

The caller freezes the desired animation frame and simulation, creates this tool,
and applies `onMove` to the real rendered target. The tool keeps pointer input live,
shows target/reference X/Y and their offset, and places the readout beside the handle
(above/below on narrow screens). Coordinates are world pixels, origin bottom-left,
Y increasing upward. Canvas scaling and resizing are accounted for.

```js
import { createDragToDebugSystem } from "./src/editor/systems/drag-to-debug-system/index.js";

// In your temporary editor integration, after pausing at the desired frame:
const debug = createDragToDebugSystem({
  host: document.querySelector(".dom-screen"), // full-screen untransformed overlay
  canvas: document.querySelector("#renderCanvas"),
  width: 576, height: 1024, // actual logical canvas/world dimensions
  initialPosition: target.getPosition(),
  referencePosition: actor.getPosition(),
  targetLabel: "Attachment", referenceLabel: "Actor",
  context: "right • frame 5 • angle -41.68°", // optional caller-owned metadata
  handleSize: 64, // world pixels; drag handle only, not target size
  onMove: position => target.setPosition(position),
});

const chosenPosition = debug.getPosition(); // independent copy for caller to save
debug.refresh(); // if layout moves without resizing
debug.dispose(); // removes UI, observer and pointer capture; caller resumes gameplay
```

Requires a DOM, Pointer Events and ResizeObserver. `documentRef` and
`ResizeObserverClass` can be injected for tests. It does not persist values,
change angles/frames, create sprites, pause globally, or modify source files.
Record approved coordinates and metadata before disposing; apply them to the
production attachment configuration separately and remove the temporary integration.

The original archer calibration is complete: frame **5** (zero-based), local
offset **X 24.48 / Y 29.55**, with horizontal offset mirrored when facing left,
and the approved **1° upward** angle adjustment mirrored with facing.
