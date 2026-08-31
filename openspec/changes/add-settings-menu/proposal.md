## Why

The game currently has no in-frame settings surface, no persistent player preferences, and no way to temporarily suspend movement while adjusting options. Bringing over the settings-menu concept from `bablylon-lite-wave-spawn` gives this portrait game the same recognizable upper-right gear, modal presentation, volume controls, reset behavior, browser-local persistence, and close interactions in a form adapted to this project's existing controls and diagnostics.

## What Changes

- Add an upper-right gear control inside the responsive 9:16 game frame, matching the inspiration project's icon, relative placement, sizing, and interaction treatment.
- Name the existing upper-right coordinate readout `Coordinates UI` in its HTML, CSS, JavaScript, and tests, and position it directly below the new gear without changing the gear's authored placement.
- Open a centered, dimmed-backdrop `Settings Menu` window whose frame-relative styling, title bar, and small X close control match the inspiration.
- Provide Music and Sound Effects volume sliders from 0 through 100, with endpoint labels and immediate in-memory updates.
- Provide a Collider visibility option for the debug overlays already present in this project.
- Provide Reset below the settings controls, restoring audio to 100 and collider visibility to off while leaving the window open.
- Persist settings immediately to one versioned, namespaced browser-local document so they survive reloads; continue safely in memory if storage is unavailable or malformed.
- Pause archer movement, virtual-controller actions, animation progression, and other mutable game-time behavior while the modal is open, while continuing to render the frozen scene beneath it.
- Close the window from the X, the gear toggle, or direct backdrop activation, then resume from the interrupted state without hidden progress.
- Do not add the inspiration project's `Skip Start Menu` option because this project has no start-menu flow for that setting to control.

## Capabilities

### New Capabilities

- `game-settings-menu`: Defines the gear placement, modal appearance and dismissal, volume and collider controls, reset behavior, responsive layout, and accessible interaction contract.
- `persistent-game-settings`: Defines validated, versioned, namespaced browser-local persistence, immediate notifications, defaults, and safe reset behavior.
- `gameplay-pause`: Defines the complete freeze/resume behavior while settings is open, including input isolation and continued rendering.

### Modified Capabilities

- None.

## Impact

- Affects the page shell and frame styling in `index.html` and `src/ui/style.css`.
- Groups DOM UI modules under `src/ui/`, including settings-window, settings-menu, virtual-controller, and Coordinates UI modules; runtime state remains under `src/`.
- Places UI-owned public artwork under `public/ui/`, including the local gear asset.
- Integrates pause and setting state with `src/main.js`, `src/player.js`, `src/virtual-controller.js`, and the existing debug-canvas rendering path.
- Adds unit/contract coverage for storage validation, reset and notification behavior, modal lifecycle, input blocking, pause semantics, and relative layout; browser verification covers desktop and portrait-mobile viewports.
- Adds no runtime dependency and no server-side or native filesystem write path; “write to disk” is fulfilled through the browser's durable local-storage facility, consistent with the static Vite application and the inspiration project.
