## Context

See `proposal.md` for motivation and scope. The current Player renderer loads
three archer atlases and the state machine owns idle, running, and shooting.
The Pawn source sheets are 192x192 cells: 8 idle frames, 6 run frames, and
weapon-specific interaction sheets for axe, hammer, knife, and pickaxe.

## Goals / Non-Goals

**Goals:**

- Preserve Player movement, collision, jumping, facing, depth sorting, and
  keyboard/virtual-controller integration.
- Make visual selection derive from locomotion plus independent item/weapon
  slots.
- Keep inventory semantics separate from the temporary attack presentation.
- Make temporary slot cycling and melee damage deterministic and testable.

**Non-Goals:**

- Adding world pickup, drop, or inventory-menu behavior in this change.
- Adding new artwork for item interactions that have no source sheets.
- Adding simultaneous composited weapon-and-item sprite layers.
- Removing projectile systems used by non-player actors.

## Decisions

1. **Use a data-driven Pawn animation catalog.** Map empty, item, and weapon
   idle/run sheets to atlas entries, and map the four interaction sheets to
   weapon actions. This avoids a separate state branch for every combination.
   Runtime sprite layers remain compatible with the existing Lite renderer.

2. **Represent inventory independently from presentation.** Store one item and
   one weapon slot. Locomotion displays the item when present; an attack
   temporarily selects the weapon interaction and then keeps the weapon
   presentation for 0.5 seconds before returning to the item.

3. **Use an attack presentation lock, not a movement lock.** Attack input is
   accepted only when no interaction/recovery presentation is active, while
   movement and jump continue through the animation. This directly preserves
   the confirmed free-movement behavior.

4. **Use temporary keyboard loadout controls.** Key `1` cycles
   `none -> axe -> hammer -> knife -> pickaxe -> none`; key `2` cycles
   `none -> gold -> meat -> wood -> none`. Both controls are disabled from
   attack start through that weapon's animation, cooldown, and damage window.

5. **Keep `Player` as the public runtime identity.** Replace archer-specific
   atlas loading and shooting callbacks inside the existing player boundary so
   spawners, movement callers, and collision integrations do not need a new
   actor identity.

6. **Use a timed melee combat collider.** Keep the movement collider unchanged
   and enable the combat collider only during damaging swing frames. Each
   target may be damaged once per attack, with weapon values of knife 10,
   pickaxe 20, axe 30, and hammer 40.

7. **Treat the action control as an attack request.** Rename the visible Shoot
   label and keyboard/control contract to Attack. Player requests a game-owned
   weapon action and does not create projectiles itself.

## Risks / Trade-offs

- [Risk] Source sheets are pre-composited, so an item and weapon cannot both be
  visibly held at once. -> Mitigation: preserve both slots logically and give
  the weapon temporary visual priority during attack; defer layered artwork.
- [Risk] Gold, meat, and wood have no interaction sheets. -> Mitigation: keep
  them item-only and reject attack when no valid weapon is equipped.
- [Risk] Temporary cycling is not representative of final inventory UX. ->
  Mitigation: keep the slot model independent so a future pickup/menu change
  can replace only the input source.
- [Risk] Existing archer tests may encode obsolete shooting behavior. ->
  Mitigation: replace Player-specific assertions with Pawn/loadout assertions
  while retaining generic projectile tests.

## Migration Plan

1. Add or update Pawn-focused specs and tests before replacing Player behavior.
2. Switch asset loading and state selection behind the existing Player API.
3. Update controller labeling and remove Player arrow-release integration.
4. Validate movement, jump, cycling, attack timing, melee damage, and browser
   rendering before considering the change complete.

Rollback is a code-level revert of the Player/catalog changes; the copied Pawn
assets can remain unused without affecting other actors.

## Open Questions

- The final pickup/drop UX is intentionally deferred to a later change.
