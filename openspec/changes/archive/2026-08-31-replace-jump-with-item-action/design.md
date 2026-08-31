## Context

The existing virtual controller and player input path still contain Jump-era
labels, bindings, and animation/state handling. The current loadout model
already distinguishes carried items from weapons, so the new action should
delegate to those existing game-owned interactions.

## Goals / Non-Goals

**Goals:**

- Make the Item button and `C` key share one item-use command.
- Preserve independent pointer behavior for movement, Item, and Attack.
- Make both actions safely no-op when their required equipment is absent.
- Remove Jump from user-visible controls and player behavior.

**Non-Goals:**

- Adding new item types, inventory rules, or weapon behavior.
- Changing joystick movement, viewport layout beyond the button label/action,
  or NPC actions.

## Decisions

- **One command per action:** route the Item button and `C` through the same
  item-use callback, and keep Attack on its existing weapon callback. This
  prevents keyboard and pointer paths from drifting; separate duplicated
  handlers were considered and rejected.
- **Equipment guards at the interaction boundary:** item use checks the held
  item before requesting its animation, while Attack checks the equipped
  weapon. This keeps missing equipment a harmless no-op and avoids requiring
  the controller to know item or weapon details.
- **Delete Jump behavior rather than remap its state:** remove jump-specific
  input/state/animation code and tests, rather than leaving an unreachable
  jump arc behind. This ensures future inputs cannot accidentally reactivate
  the obsolete mechanic.
- **Preserve pointer capture semantics:** retain per-pointer pressed state and
  simultaneous joystick/action handling, changing only the action identity.

## Risks / Trade-offs

- [Risk] Existing tests or documentation may still refer to Jump or the old
  keyboard mapping. → Update those contracts and add source/runtime checks that
  no active Jump path remains.
- [Risk] Item-use animation names may differ by item. → Reuse the existing
  item animation catalog/selection and cover each supported held-item path in
  tests.

## Migration Plan

1. Update the controller contract, input mapping, player action callbacks, and
   related tests.
2. Run the unit/build checks and inspect the browser-visible controller.
3. If rollback is required, revert only this change's additive files and code
   edits; no persisted data migration is involved.
