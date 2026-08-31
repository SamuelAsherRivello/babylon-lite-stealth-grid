## 1. Collision Contracts

- [x] 1.1 Add failing unit tests for deriving the 192 px by 72 px bottom-half character AABB from its frame size, position, and pivot; verify the targeted test fails for the missing behavior
- [x] 1.2 Add failing unit tests for AABB overlap, playfield containment, direct obstacle blocking, and independent-axis sliding; verify the targeted tests fail for the missing collision behavior
- [x] 1.3 Implement the pure collision helpers and collision-aware movement needed to pass the new targeted tests, then run the complete unit-test suite

## 2. Terrain Review Layout

- [x] 2.1 Replace the repeated frame-10 terrain with a row-major 9 by 6 layout containing frames 0 through 53 exactly once; verify the rendered frame count and indices in code and in the browser
- [x] 2.2 Define one explicit provisional non-walkable frame-number collection from visually apparent cliffs, rocks, voids, and barriers, derive 64 px by 64 px obstacle AABBs from it, and verify each classified instance has exactly one collider

## 3. Visible Diagnostics

- [x] 3.1 Add a transparent diagnostic overlay aligned to the game frame and render a legible zero-based identifier over each terrain tile; verify labels 0 through 53 remain aligned at the supported portrait size
- [x] 3.2 Render distinct translucent blocked-tile and character AABBs with visualization enabled by default; verify the 192 px by 72 px character box follows movement and blocked boxes remain fixed

## 4. Movement Integration and Verification

- [x] 4.1 Integrate collision-aware movement with keyboard input while retaining world-to-screen/grid behavior and horizontal facing; verify unobstructed movement, direct blocking, diagonal edge sliding, and playfield containment in the browser
- [x] 4.2 Run the full test suite and production build, then perform a real-browser smoke test confirming all 54 numbered tiles, provisional collision behavior, and always-visible collider diagnostics
- [x] 4.3 Record the provisional blocked-frame numbers and explain that collider sizing and partial-tile shapes await user review; verify the project documentation matches the implemented review workflow

## 5. Empty Atlas Positions

- [x] 5.1 Add a failing layout test identifying empty atlas positions as invalid, unblocked spaces without colliders while preserving all 54 numbered positions
- [x] 5.2 Separate empty frames from blocked terrain, skip their sprite creation, render their numbers grey, update documentation, and verify tests, build, and browser appearance

## 6. Diagonal Terrain Exceptions

- [x] 6.1 Add failing tests for convex polygon collision and frame 48's lower-left triangle using upper-left, lower-right, and lower-left tile corners
- [x] 6.2 Make frame 39 fully walkable, assign frame 48 its tested triangle, visualize the polygon, update documentation, and verify movement in tests and the browser

## 7. Circular Player Collision

- [x] 7.1 Add failing tests for a radius-26 player circle, circle-versus-polygon overlap, and horizontal-to-diagonal slope resolution
- [x] 7.2 Replace the rectangular player collider with the centered circle, visualize it, document the behavior, and verify build and browser movement
