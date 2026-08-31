## 1. Test-First Input and Jump Logic

- [x] 1.1 Add failing unit tests for joystick cardinal directions, proportional dead-zone remapping, magnitude clamping, and upward pointer movement producing positive world Y; run `npm.cmd test` and confirm the new cases fail for missing behavior.
- [x] 1.2 Add failing unit tests for the approximately 0.6-second, 64-logical-pixel parabolic jump, including non-stacking activation, frame-rate independence, exact zero landing offset, and unchanged X/Y ground coordinates; run `npm.cmd test` and confirm the new cases fail for missing behavior.
- [x] 1.3 Implement the pure joystick and jump-state logic in the focused game-logic layer and verify all focused and existing movement/grid tests pass with `npm.cmd test`.

## 2. Virtual Controller UI

- [x] 2.1 Add semantic controller markup with one movement joystick plus `Jump` and `Shoot` buttons in `index.html`; verify the DOM contains the three labeled controls in the specified left-to-right action order.
- [x] 2.2 Add responsive translucent circular-control styling in `src/style.css`, keep interactive controls within the game frame, and reposition existing guidance above the controller footprint; verify desktop and narrow portrait layouts show no overlap or clipping.
- [x] 2.3 Implement a focused virtual-controller module with proportional joystick state, one captured movement pointer, independent action pointer tracking, pressed appearances, and deterministic pointer/blur/disposal cleanup; verify pointer cancellation resets only the affected control in browser interaction checks.

## 3. Gameplay Integration

- [x] 3.1 Select joystick movement while it is displaced and otherwise preserve the current keyboard vector in `src/main.js`; verify joystick up changes `+Y`, joystick right changes `+X`, diagonal speed stays bounded, and held keyboard input resumes after joystick release.
- [x] 3.2 Connect Jump to the screen-space jump state, apply its offset only after X/Y world-to-screen conversion, and verify the player can walk during the arc while world/grid coordinates remain ground-based and exact landing is preserved.
- [x] 3.3 Re-inspect the current working tree for the independently developed arrow-shooting entry point, connect the Shoot callback exactly once per press when present, and otherwise retain a tested no-op that does not change movement or jump state.
- [x] 3.4 Preserve unrelated coordinate/grid and shooting-thread changes while integrating and verify `git diff -- src index.html test package.json` contains no unintended dependency or behavior edits.

## 4. Verification

- [x] 4.1 Run `npm.cmd test` and `npm.cmd run build` separately and verify both complete successfully.
- [x] 4.2 Run the game and verify in a real desktop browser that mouse dragging moves the player, Jump completes one arc, Shoot uses the available callback or safely no-ops, keyboard walking remains intact, and no console errors occur.
- [x] 4.3 Verify a portrait mobile viewport with multi-pointer input: hold the joystick while pressing Jump and Shoot independently, drag outside the joystick before releasing, cancel or blur active input, resize or change orientation, and confirm control placement and state reset satisfy the capability spec.
