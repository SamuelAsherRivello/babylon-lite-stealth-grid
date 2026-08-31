## Context

See `proposal.md` for motivation. The target is a dependency-light Vite application using `@babylonjs/lite`, a centered 576 by 1024 logical canvas, a same-size diagnostic overlay canvas, and DOM HUD controls inside a container-query-enabled 9:16 frame. `src/main.js` owns rendering and updates, `src/player.js` owns movement and animation selection, and `src/virtual-controller.js` owns touch/pointer input. There is currently no settings store or audio subsystem. The inspiration repository already establishes the desired 800-unit frame-relative gear and modal composition.

## Goals / Non-Goals

**Goals:**

- Preserve the inspiration menu's observable placement, styling, controls, persistence, and dismissal behavior while integrating with this project's simpler runtime.
- Establish small reusable boundaries for a game window, settings store, and pause state without adding a framework or dependency.
- Make every current mutable update respect one pause authority and make stale input impossible after resume.
- Keep settings storage extensible for future game options and audio assets.

**Non-Goals:**

- Adding music or sound-effect media, inventing gameplay sounds, or changing already-playing audio instances.
- Adding a start-menu flow solely to support the inspiration project's `Skip Start Menu` option.
- Writing arbitrary native files, adding a server, or prompting for filesystem permissions.
- Removing or redesigning the existing coordinate HUD, virtual controller, terrain review grid, or debug drawing semantics.
- Adding Escape-key dismissal unless separately requested; parity is limited to gear, X, and direct backdrop activation.

## Decisions

### Use frame-relative CSS copied from the inspiration composition

Author the gear as `8cqw` square at `8.75cqw` from the top and right, corresponding to 64 and 70 units in the inspiration's 800-unit design space. Preserve the inspiration window's 76cqw width, centered full-frame 50 percent backdrop, dark blue gradient, circular 8cqw X, and cqw-based typography, spacing, controls, borders, and shadows. Use the supplied `gear.svg` visual asset from the inspiration rather than a font glyph.

Treat the existing coordinate readout as a named `Coordinates UI` component. Rename its component-level HTML id/class, CSS selector, JavaScript references, and tests consistently, then place that component directly below the gear using frame-relative spacing. The gear remains the anchor and keeps its authored measurements; only the Coordinates UI moves.

Fixed pixels and browser viewport units were rejected because this project already treats the game frame as the visual coordinate system and the composition must remain stable between desktop and portrait mobile sizes.

### Mount reusable DOM chrome directly inside the game frame

Add a dedicated UI host layered above both canvases and the existing controller. A reusable game-window module owns the dialog, backdrop, heading relationship, X, direct-backdrop dismissal, focus entry/return, and disposal. A settings composer owns the Music, SFX, Collider, and Reset controls and toggles the window from the persistent gear.

Embedding settings markup permanently in `index.html` was rejected because lifecycle tests and later reuse are clearer when the modal is created and disposed as a unit. Putting the modal below the diagnostic canvas was rejected because it would not isolate pointer input.

### Organize UI implementation and artwork by ownership

Keep DOM UI modules and the UI stylesheet together under `src/ui/`: `game-window.js`, `settings-ui.js`, `virtual-controller.js`, `coordinates-ui.js`, and `style.css`. The Coordinates UI module owns its DOM output references and update method instead of leaving those details in `main.js`. Keep gameplay, settings storage, audio normalization, and pause state at the `src/` root because they are runtime logic rather than UI composition. Store the gear at `public/ui/gear.svg`, and use the Vite base URL when constructing that nested asset path.

Leaving UI files scattered at the source root was rejected because the requested folder boundary would remain incomplete. Moving gameplay renderers or state modules into `ui/` was rejected because their ownership is not DOM UI and the folder would stop communicating a useful boundary.

### Persist one validated settings document

Store one JSON document under a target-specific key such as `babylon-lite-stealth-grid.settings`, with `{ version, values }`. Use `audio.musicVolume`, `audio.sfxVolume`, and `debug.showColliders` keys. Defaults are 100, 100, and false. Validate each read independently and catch storage access, parse, write, and removal failures. Keep the in-memory map authoritative for the session and publish per-key subscriptions.

Separate local-storage keys were rejected because versioning, validation, reset, and future migration would be scattered. Native file writes or a server endpoint were rejected because the app is a static browser build; durable local storage satisfies the requested disk persistence without new permissions or infrastructure.

### Treat volume as an extensible category contract

The store exposes Music and SFX now even though the target has no audio assets. Provide a small normalization/category helper that future audio playback can consume: effective volume equals configured base volume multiplied by the current category percentage and clamped to the browser range. The controls therefore persist and reset fully now and become behaviorally active as soon as audio playback is added.

Importing the inspiration's audio assets was rejected because the user asked for the settings-menu concept and functionality, not its copyrighted or game-specific media content. Creating silent placeholder audio was rejected because it adds bundle weight without improving behavior.

### Reuse the current debug canvas for Collider visibility

Subscribe diagnostic visibility to `debug.showColliders`. Keep the canvas and draw path available, but clear and skip diagnostic drawing while disabled; on re-enable, the next rendered frame redraws current terrain and player collider data. The setting defaults to off to match the inspiration.

Removing the debug canvas from the DOM was rejected because it complicates re-enabling and risks changing sizing or pointer-layer behavior. Hiding only the player collider was rejected because the label promises collider visibility generally.

### Pause through a single active-time boundary

The settings lifecycle owns a pause controller. Opening clears all current keyboard and virtual-controller state and marks gameplay paused. The render callback still updates frame scaling and presents the scene, but uses zero active delta and skips player updates, coordinate mutation, animation advancement, and animated-terrain advancement. Closing resets the prior timestamp to the current time before resuming so wall-clock time spent in the modal cannot produce a large catch-up update.

Relying only on the modal backdrop to block new pointer input was rejected because held keyboard state and previously captured pointers can remain active. Stopping `requestAnimationFrame` was rejected because the modal and frozen scene must remain continuously rendered and resizing must still be reflected.

### Make the backdrop the input boundary and the gear the stable toggle

Place the full-frame backdrop above the canvas and virtual controller but below the gear, matching the inspiration z-order. Only a click whose target is the backdrop dismisses the window. The gear remains operable as an open/close toggle. Modal controls use native range inputs, checkbox, and buttons for keyboard and touch support. On open, focus the first useful modal control or X; on close, return focus to the gear.

Disabling the entire UI host was rejected because it would also disable the dialog. Dismissing on any bubbled backdrop click was rejected because slider and checkbox interactions would accidentally close the window.

## Risks / Trade-offs

- [Babylon Lite animation timing may not expose a direct global pause API] -> Isolate animation pause/resume behind the pause controller, verify the installed API before implementation, and add a browser-visible frozen-frame check.
- [The upper-right gear may overlap the Coordinates UI] -> Keep the gear fixed at its authored position, place the explicitly named Coordinates UI directly below it with frame-relative separation, and browser-check both target viewports.
- [A pointer captured by the joystick before opening may survive the overlay] -> Add an explicit controller reset/cancel operation and invoke it before the modal becomes interactive.
- [Keyboard keys held while opening may remain in the player's input set] -> Clear pressed-key state on pause and require a fresh keydown after resume.
- [Storage can be unavailable, malformed, or full] -> Catch every storage boundary, validate per key, and retain a working in-memory session.
- [Volume controls cannot produce audible proof before audio content exists] -> Test the stored values and category multiplier contract now; browser QA verifies the controls and persistence rather than claiming sound playback.
- [Diagnostic labels and collider shapes share one canvas] -> Define Collider as controlling the entire diagnostic overlay so the behavior is predictable and reset can hide it completely.

## Migration Plan

1. Introduce and test the settings store and category-volume contract; existing players receive defaults because no namespaced document exists.
2. Introduce and test controller reset and active-time pause behavior before exposing the modal.
3. Add the reusable game window, settings composer, gear asset, and frame-relative styling.
4. Bind Collider to the diagnostic draw path and bind modal lifecycle to pause/resume.
5. Run unit tests and production build, then verify the live settings flow, persistence after reload, input isolation, resize behavior, and reset on desktop and portrait-mobile viewports.

Rollback is additive: remove the settings chrome and pause/store integrations. A leftover namespaced local-storage document is harmless and can be ignored by older builds.
