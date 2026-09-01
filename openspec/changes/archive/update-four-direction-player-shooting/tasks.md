## 1. Cardinal Direction Resolution

- [x] `C031-T001` $tid 1.1 Add pure cardinal-direction selection helpers and tests covering the default right direction, all four remembered directions, dominant-axis selection, equal-magnitude recency ties, opposite inputs, released input, and the guarantee that outputs contain exactly one non-zero unit component; verify the focused logic tests pass.
- [x] `C031-T002` $tid 1.2 Record non-repeat keyboard/WASD and virtual-controller cardinal activations without losing the remembered direction on release or reset; verify input tests demonstrate that the latest actual activation wins and key-repeat events do not change recency.
- [x] `C031-T003` $tid 1.3 Capture the resolved direction when a shot starts and retain it until the animation release frame; verify player state tests prove later movement input cannot redirect the pending shot and the default shot remains rightward.

## 2. Four-Direction Player and Projectile Contract

- [x] `C031-T004` $tid 2.1 Replace the numeric horizontal shot payload with a cardinal unit vector across player, main integration, renderer, and projectile modules; verify searches and tests show every projectile direction consumer uses the vector contract.
- [x] `C031-T005` $tid 2.2 Add explicit four-direction arrow spawn mappings that preserve the established left/right bow positions and place up/down arrows ahead of the player; verify unit tests cover exact spawn positions for all four directions.
- [x] `C031-T006` $tid 2.3 Generalize projectile advancement to change only the selected axis while retaining stepped collision detection; verify projectile tests cover speed, perpendicular-axis stability, obstacle collision, NPC collision, and long-frame anti-tunneling for horizontal and vertical shots.
- [x] `C031-T007` $tid 2.4 Orient projectile colliders horizontally or vertically and remove arrows only after the complete oriented collider exits any game edge; verify collider and bounds tests cover left, right, top, and bottom exits.
- [x] `C031-T008` $tid 2.5 Map the four cardinal vectors to exact arrow sprite quarter-turn orientations without diagonal angles; verify renderer tests cover right, left, up, and down presentation.

## 3. Integration and Browser Verification

- [ ] `C031-T009` $tid 3.1 Run the complete automated test suite and production build, resolving only regressions introduced by this change, and record both commands as passing.
- [x] `C031-T010` $tid 3.2 Run the game in a real browser and verify keyboard direction recency, dominant virtual-controller magnitude, equal-axis tie behavior, four straight shot paths, spawn placement, sprite orientation, collisions, and edge removal with no diagonal or subtle-angle movement.
