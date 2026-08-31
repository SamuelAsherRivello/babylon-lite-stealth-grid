## Why

The terrain atlas currently repeats one grass frame, so there is no practical way to inspect every terrain piece, decide which pieces are walkable, or verify collision behavior. A visible classification course is needed so walkability can be tested and refined collaboratively.

## What Changes

- Preserve all 54 numbered atlas positions in a review grid while rendering terrain sprites only for non-empty frames.
- Mark empty atlas positions with grey numbers and exclude them from walkable/non-walkable tile classification and collision.
- Assign an initial, easily editable walkable/non-walkable classification, with visually obvious cliffs, rocks, voids, and barriers provisionally treated as non-walkable.
- Add whole-tile collision to provisionally non-walkable terrain frames.
- Add a circular character body collider centered on the visible archer and resolve it along diagonal terrain slopes.
- Prevent character movement through blocked terrain while allowing movement to slide along obstacle edges.
- Keep character and terrain collider visualization enabled during the classification work.
- Defer tuning the character collider dimensions and partial-tile collision shapes until after the first visual and movement review.

## Capabilities

### New Capabilities

- `terrain-collision-classification`: Covers displaying and identifying every terrain frame, assigning provisional walkability, visualizing colliders, and enforcing character movement collision.

### Modified Capabilities

None.

## Impact

- Terrain layout and sprite rendering in `src/main.js` will change from one repeated frame to a terrain review layout.
- Movement logic in `src/game-logic.js` will gain collision-aware movement behavior and test coverage.
- The UI/debug rendering will expose terrain frame numbers and visible collider bounds.
- No new runtime dependency is expected.
