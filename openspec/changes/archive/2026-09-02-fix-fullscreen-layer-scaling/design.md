## Context

The current page has a fixed logical canvas declaration but Babylon Lite also observes and resizes its render surface from CSS dimensions. The debug canvas and DOM frame follow CSS geometry, while Babylon sprite coordinates are interpreted against the active render target. This can produce a partial-width world at browser zoom 100% even when CSS rectangles appear equal.

## Goals / Non-Goals

**Goals:**

- Establish one authoritative logical viewport and one authoritative visible rectangle.
- Make browser zoom and device-pixel-ratio affect presentation size only, never logical coordinates.
- Align Babylon rendering, debug rendering, and pointer conversion.
- Preserve existing DOM control behavior and gameplay placement.
- Keep viewport defaults reusable for future games through configuration rather than implementation constants.
- Support real-browser validation at Chrome and Edge zoom levels 80%, 100%, and 125%.

**Non-Goals:**

- Redesigning the UI controls or their responsive rules.
- Moving individual game objects during resize.
- Changing the tilemap dimensions, tile art, or gameplay grid.
- Removing QA markers or logs before user approval.

## Decisions

- Use the game frame's measured rectangle as the presentation rectangle and the tilemap dimensions as the logical rectangle. This matches the user's visible experience and avoids assuming the browser viewport itself is the game viewport.
- Store logical dimensions, 9:16 aspect ratio, uniform-fit/letterbox mode, layer selectors, and QA-enabled state in the viewport configuration.
- Fit the complete logical tilemap uniformly inside the game-frame rectangle; all world/debug pixels use the resulting fitted child rectangle.
- Configure Babylon's render surface from the same logical/presentation contract and prevent its automatic CSS-size observer from becoming a second competing source of dimensions.
- Keep Babylon's device-pixel-ratio multiplier capped at 1 for this pixel-authored logical surface; browser zoom and CSS scale the complete surface together.
- Keep debug drawing in the same logical canvas dimensions and CSS rectangle as the world surface.
- Convert pointer coordinates through the measured game-frame rectangle rather than the raw canvas width alone.
- Add a runtime QA snapshot that reports logical dimensions, backing dimensions, CSS rectangles, device pixel ratio, and browser zoom symptoms; screenshots are acceptance evidence.
- Keep the QA flag enabled until the user validates and approves the screenshots and logs.

## Risks / Trade-offs

- [Risk] Babylon Lite may require an internal surface-size override for a fixed logical render target. -> Mitigation: isolate that override in one adapter and assert the dimensions after each engine resize.
- [Risk] CSS layout may produce fractional pixels. -> Mitigation: retain floating-point presentation geometry while keeping integer logical/backing dimensions.
- [Risk] Existing DOM safe-area code may depend on its current viewport behavior. -> Mitigation: do not alter DOM control positioning; only consume the game-frame rectangle for world/debug alignment.

## Migration Plan

1. Add shared viewport measurement and diagnostics.
2. Apply the contract to Babylon and debug canvases.
3. Update pointer conversion and remove competing resize paths.
4. Verify at Chrome/Edge-like 100% sizes and multiple aspect ratios.
5. Leave diagnostics enabled for user validation; remove or disable them only after approval.
