## Why

The current Settings Menu exposes developer-only controls directly in the main settings window, making the primary menu noisier and less approachable. Grouping those controls behind a clearly named Developer Settings button preserves access while giving the main settings surface a simpler hierarchy.

## What Changes

- Replace the `Developer` title and the five developer controls beneath it, including the Reset button, with a `Developer Settings` button in the main Settings Menu.
- Open a second, layered Developer Settings window when that button is activated.
- Show the five existing developer options and the Reset button in the Developer Settings window, preserving their labels, persistence, and reset behavior.
- Keep the existing X close control and modal dismissal/focus behavior for both windows.
- Preserve the gear flow: clicking the gear opens Settings Menu, then clicking Developer Settings opens the nested developer window on top.

## Capabilities

### New Capabilities

- None.

### Modified Capabilities

- `game-settings-menu`: Change the settings navigation and modal behavior so developer controls are presented in a nested Developer Settings window.

## Impact

- `src/ui/settings-ui.js` and related game-window composition and styling.
- Settings UI tests and browser-facing interaction coverage.
- No new dependencies, storage keys, gameplay settings, or changes to the five existing developer controls.
