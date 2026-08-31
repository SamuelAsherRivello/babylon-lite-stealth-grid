## 1. Specification and input inventory

- [x] 1.1 Locate every active Jump label, key binding, callback, state, motion
  offset, animation, and test in the controller/player code.
- [x] 1.2 Identify the existing held-item use/animation contract and weapon
  attack contract to reuse without introducing new dependencies.

## 2. Implement the action replacement

- [x] 2.1 Rename the virtual-controller Jump action to Item while preserving
  layout, pointer capture, pressed styling, and simultaneous input behavior.
- [x] 2.2 Bind `C` to the shared Item activation path, clear a held item, and
  spawn gold from the player center in movement direction when applicable.
- [x] 2.3 Remove Jump input, state, visual offset, animation, and related
  integration code so no jump functionality remains.
- [x] 2.4 Keep `V` and Attack delegated to the equipped weapon and make the
  no-weapon path a silent no-op.

## 3. Tests and verification

- [ ] 3.1 Update/add tests for Item button and `C` activation with and without
  an item, including exactly-once activation.
- [x] 3.2 Update/add tests for weapon attack with and without a weapon and for
  simultaneous joystick, Item, and Attack pointers.
- [ ] 3.3 Add regression checks proving former Jump input produces no jump state,
  motion, offset, or animation.
- [x] 3.4 Run the project tests/build and verify the browser UI shows Item and
  Attack only, with the intended keyboard guidance.
