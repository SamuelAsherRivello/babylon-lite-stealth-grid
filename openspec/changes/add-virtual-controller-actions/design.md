## Context

See `proposal.md` for motivation and `specs/virtual-player-controller/spec.md` for the behavior contract. The game renders one Babylon Lite 2D sprite in a fixed 576 by 1024 logical game frame. World X controls left/right ground movement and world Y controls up/down ground movement; screen conversion inverts world Y. The renderer has no Babylon GUI dependency, and the existing keyboard state feeds directly into the animation-frame update.

The working tree also contains unrelated coordinate/grid changes, while arrow shooting is being developed independently. The controller work must preserve both boundaries.

## Goals / Non-Goals

**Goals:**

- Match the reference project's visible lower-left joystick and lower-right action-button interaction closely using the current dependency set.
- Keep input math and jump timing deterministic and independently testable.
- Allow simultaneous movement and action pointers.
- Provide one narrow integration seam for independently implemented arrow shooting.

**Non-Goals:**

- Add Babylon.js Core, Babylon GUI, a physics engine, or another UI dependency.
- Make jump affect world X/Y, grid coordinates, collisions, or terrain traversal.
- Implement arrows, projectile movement, collision, damage, ammunition, or cooldowns.
- Replace or remap existing keyboard movement.

## Decisions

### Render controls as a DOM overlay

Add semantic HTML controls inside `.game-frame` and style them as circular translucent controls over the canvas. Native DOM pointer events provide multi-touch pointer IDs, pointer capture, cancellation, accessibility labels, and responsive CSS without importing the Babylon.js GUI stack used by the reference game.

Recreating the reference with Babylon GUI was rejected because this project depends on `@babylonjs/lite`, not `@babylonjs/core` and `@babylonjs/gui`. Drawing controls into the sprite renderer was rejected because it would require custom hit testing and pointer capture for behavior the browser already provides.

The overlay root remains non-blocking, while the joystick surface and action buttons accept pointer input. Controls use `touch-action: none` to prevent browser scrolling or gestures during gameplay. Existing lower-corner guidance is repositioned above the controller footprint rather than removed.

### Keep joystick state separate from keyboard state

Create a focused virtual-controller module that owns DOM event subscriptions and exposes the latest normalized joystick vector plus Jump and Shoot callbacks. Movement selection occurs each update: a joystick vector outside the dead zone takes priority; otherwise the existing keyboard vector applies.

Joystick displacement is calculated in CSS pixels from the control's current bounding rectangle. It is inverted on screen Y so dragging upward produces positive world Y. A small dead zone is removed and the remainder is remapped proportionally to a maximum magnitude of one. Pointer capture is established only when a pointer begins inside the joystick and is released on pointer-up, pointer-cancel, lost capture, blur, or disposal.

Combining virtual directions with the keyboard key set was rejected because proportional analog input cannot be represented faithfully as pressed keys and could leave synthetic keys stuck after cancellation.

### Track every control by pointer ID

The joystick owns at most one captured pointer. Each action button tracks its own active pointer IDs and fires on a valid pointer-down edge. This allows one finger to move while another jumps or shoots and prevents an action release from resetting movement.

A single global active-pointer variable was rejected because it would make simultaneous mobile movement and actions impossible.

### Apply jump after world-to-screen conversion

Add testable jump-state math with an elapsed time, a fixed duration near 0.6 seconds, and a peak near 64 logical pixels. The normalized parabolic offset is `4 * peak * progress * (1 - progress)`. Each update first advances normal X/Y world movement, converts the resulting ground position to screen coordinates, then subtracts the jump offset from screen Y before updating the sprite.

The jump state returns an exact zero offset at completion and ignores activation while already active. Grid display continues to derive exclusively from `worldPosition`, so jumping cannot alter the coordinate contract.

Changing `worldPosition.y` was rejected because Y is the ground-plane up/down axis in this game. Sprite-layer pivot changes were rejected because they would affect coordinate interpretation and alignment rather than represent transient elevation.

### Make Shoot an optional callback boundary

The controller accepts an `onShoot` callback. The integration supplies the arrow action when one exists; an absent callback uses a no-op and owns no projectile state. The button remains present so the requested two-button controller layout is stable while the other thread lands.

Searching for or partially implementing an arrow inside this change was rejected because shooting behavior is explicitly owned by separate work. The implementation task must re-inspect the current working tree before wiring this callback so it can use the actual arrow API if it has appeared.

### Dispose browser input deterministically

The virtual controller exposes a disposal path that releases pointer capture, resets its movement vector, and removes all event listeners. Window blur also clears joystick state alongside the current pressed-key clearing behavior. This prevents a pointer or key from leaving movement active after focus loss or hot reload.

## Risks / Trade-offs

- [The independently developed shooting API may not exist or may have a different shape] -> Re-inspect the checkout during implementation and connect only through the optional callback; leave it as a no-op when absent.
- [Controller controls may overlap the existing coordinate guide or control hint] -> Reserve a controller footprint and move existing guidance above it at both desktop and narrow portrait sizes.
- [CSS pixels differ from the 576 by 1024 logical canvas size] -> Use pointer displacement only as a normalized ratio of the live DOM control radius; keep the jump peak in logical renderer pixels.
- [Pointer capture behavior varies after cancellation or focus loss] -> Handle pointer-up, pointer-cancel, lostpointercapture, and window blur, and test reset behavior directly.
- [Jump timing can overshoot after a stalled frame] -> Clamp elapsed time to the configured duration and return an exact zero offset at completion.

## Migration Plan

1. Add failing unit tests for joystick direction, dead-zone scaling, clamping, jump timing, non-stacking behavior, and exact landing.
2. Add the DOM controller structure and responsive styling without changing renderer dependencies.
3. Add the virtual-controller event lifecycle and route its movement vector into the existing X/Y movement update.
4. Add the screen-space jump state and connect Jump.
5. Re-inspect the current checkout for the arrow-shooting entry point; connect Shoot if present, otherwise retain the safe no-op.
6. Run focused and full tests, build the project, and verify desktop plus portrait multi-pointer behavior in a real browser.

Rollback is additive: remove the controller overlay/module and jump-offset integration while leaving existing keyboard movement and unrelated coordinate or shooting work intact.
