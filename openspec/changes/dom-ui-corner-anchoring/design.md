## Context

The existing overlay contains five user-visible DOM control areas over the Babylon game rectangle. The implementation must preserve their interactions and allow browser zoom to change their rendered size without making their position depend on unrelated element dimensions.

## Goals / Non-Goals

**Goals:**

- Establish one shared logical inset value for all DOM overlay anchors.
- Use corner anchoring for the independent controls and one grouped container for Item and Attack.
- Keep the layout stable when the viewport or browser zoom changes.

**Non-Goals:**

- Changing control artwork, labels, keyboard shortcuts, or interaction behavior.
- Changing Babylon rendering, world coordinates, or adding a UI framework.

## Decisions

- Use a single CSS custom property or equivalent shared layout value for the 25 px inset, so all four edges cannot drift independently.
- Anchor controls against the established visible game rectangle rather than the document body, preserving alignment when the game is letterboxed or centered.
- Position Item and Attack inside one lower-right wrapper, rather than independently anchoring them, so resizing preserves their relationship.
- Prefer existing DOM and plain CSS structures. Adding a framework would increase scope without improving the required anchoring behavior.

## Risks / Trade-offs

- [Risk] Very small visible game rectangles may leave insufficient space for controls at the full inset → retain existing sizing constraints and verify at supported viewport sizes.
- [Risk] A nested control wrapper could alter pointer hit areas → preserve existing button bounds and verify each control at 50%, 100%, and 150% browser scale.

## Migration Plan

Update the existing overlay positioning rules, run focused tests/build checks, and perform real-browser screenshots at the requested zoom levels. Rollback is limited to reverting the DOM/CSS changes if any existing interaction or layout regresses.
