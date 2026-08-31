## Context

See `proposal.md` for motivation and `specs/tiled-spawner-authoring/spec.md` for the behavior contract. The local Tiled loader already normalizes point objects whose class or legacy type is `spawner`, and the composition root passes those records to a catalog function. That catalog currently always creates hardcoded Player, Sheep, and Goblin defaults and then appends authored records. The current working map also contains an in-progress Warrior point object, so this change must coexist with character-specific enemy authoring rather than reducing every enemy to Goblin.

The Tiled project already uses external JSON tilesets and a designated `Spawners` object layer. Runtime coordinates use origin-relative game cells and actor positions use cell centers. The game currently has a single input owner, although non-player spawner collections already support independent ownership and repeated role types.

## Goals / Non-Goals

**Goals:**

- Provide three obvious reusable palette entries that can be dragged or placed in Tiled.
- Make the loaded map the sole source of normal Player, Sheep, and Goblin spawner presence and position.
- Author only a single uppercase `type` property and derive all other configuration in Babylon.
- Centralize defaults and validation so Tiled metadata and runtime configuration cannot silently diverge.
- Preserve the current level's intended behavior through explicit authored migration.

**Non-Goals:**

- Changing spawn timing, population policy, marker visibility, actor AI, combat, or lifecycle rules.
- Adding a general-purpose Tiled property inspector UI or a runtime level editor.
- Supporting multiple player input owners.
- Requiring the stretch black-and-white artwork for baseline completion.
- Removing or redesigning the separately authored Warrior spawner.

## Decisions

### Use a collection-of-images object tileset as the Tiled spawner palette

Add one external spawner tileset with three named tile definitions. Each tile uses a small repository-owned editor icon and supplies one custom `type` property: `PLAYER`, `SHEEP`, or `GOBLIN`. Designers place the tiles as tile objects on `Spawners`; an Enemy instance selects Warrior by overriding that single property with `WARRIOR`.

Baseline icons can be simple labeled SVG or PNG assets such as `P`, `S`, and `E` with distinct labels. The stretch implementation may derive dedicated editor assets from the in-game marker appearance, but Tiled assets remain editor-only and are not loaded as game sprites.

Alternative considered: three free-standing `.tx` object templates. Templates carry defaults but are less discoverable as a compact visual palette and make the requested icon browsing experience weaker. Plain point objects were also rejected as the primary workflow because authors would repeatedly enter properties by hand.

### Normalize one authored type and derive the runtime configuration

During normalization, resolve the placed object's tile definition from its GID. Read the tile definition's `type` property and allow an instance `type` to override it. Emit only source identity, the normalized uppercase type, and the origin-relative game cell. The Babylon catalog maps that value to role, character, population values, interval, and initial-population behavior.

The existing Warrior point placement is migrated by deleting its old custom properties and retaining only `type: WARRIOR` before it is converted to the Enemy palette representation.

Alternative considered: hardcode item-to-configuration mapping in JavaScript by tile ID. Rejected because it duplicates authoring metadata and makes tileset reordering or extension brittle.

### Validate normalized records before game composition

Add a dedicated spawner validation pass after normalization and before actor factories or renderer resources are created. Validation checks the four supported type values, finite coordinates, and exactly one `PLAYER`. The player-count failure uses the exact requested error; other errors include the layer/object name or ID and offending value.

Alternative considered: rely on generic spawner-controller validation after composition. Rejected because it cannot explain Tiled source identity as clearly and could fail after partial level setup.

### Make authored arrays replace defaults rather than extend them

Change the catalog boundary to translate the complete normalized authored list. It no longer prepends hardcoded placements. The catalog owns a definition for each supported uppercase type and produces full runtime configurations. Multiple non-player objects remain separate configurations even when they share the same type.

The Player constraint is validated before the existing type-based lookup can collapse duplicate keys. This preserves current single-player input semantics while allowing future work to revise that constraint explicitly.

Alternative considered: store role, character, counts, and spawn flags as separate Tiled properties. Rejected because the requested level contract needs only one stable type discriminator and Babylon owns behavior defaults.

### Migrate Level01 using cell-aligned placements

Add Player, Sheep, and Goblin tile objects at suitable cells near their current positions, using center anchoring consistently. Convert the current Warrior placement to an Enemy palette object with only `type: WARRIOR`. Level01 therefore has exactly one placement for each of Player, Sheep, Goblin, and Warrior.

The sheep's old fractional world position cannot be represented exactly by one cell-centered editor item. The migration deliberately selects and records the intended map cell; acceptance checks compare against that authored cell rather than the old fractional pixel value.

Alternative considered: permit arbitrary pixel positions to reproduce the fractional values. Rejected because the current normalized spawner contract and level editing language are grid-cell based, and cell alignment makes placement predictable.

### Test authoring metadata, normalization, composition, and visible editor output separately

Fixture tests verify the three palette definitions and their one-property contract. Normalizer tests cover tile defaults, the Warrior instance override, origin conversion, malformed data, and source-rich errors. Catalog/integration tests prove authored records replace placement defaults, Babylon derives behavior defaults, optional non-player omissions remain omissions, non-player duplicates remain independent, and non-singleton player counts fail.

Open the project and migrated map in Tiled for final visual QA, confirming all three items appear in the palette and are distinguishable on the `Spawners` layer. Runtime browser QA verifies actors originate at authored cells and no hardcoded duplicates appear.

## Risks / Trade-offs

- [Concurrent Warrior and Tiled changes modify the same map and parser] -> Preserve legacy point-object support, merge changes around the current files, and test both Goblin and Warrior identity paths.
- [The old sheep position is fractional rather than cell-centered] -> Select an explicit nearest authored cell and document the intentional migration in tests.
- [Tile-object coordinates use a bottom edge while point objects use a point] -> Normalize through one documented anchor rule and cover both representations with coordinate tests.
- [Editor icon assets could accidentally enter the runtime renderer] -> Keep them under the Tiled authoring tree and exclude spawner palette tile objects from visual terrain/object rendering.
- [An instance type override can name an unsupported actor] -> Normalize case consistently and validate against the four-value catalog before composition.
- [A missing or duplicate player makes the level unusable] -> Reject either case with the exact required invalid-level error before game setup.

## Migration Plan

1. Add the external spawner palette and temporary editor icons, register it with the Tiled project/map, and verify the three named items in Tiled.
2. Add tests for the one-property contract, validation, coordinates, optional non-player omission, multiplicity, and the Warrior override.
3. Extend normalization to produce validated `{ type, gameCell }` records from palette objects.
4. Change composition to translate authored records through Babylon-owned catalog defaults.
5. Place Player, Sheep, and Goblin objects in Level01, convert Warrior to the one-property Enemy item, then run unit tests, build, Tiled visual QA, and browser acceptance checks.

Rollback is additive at the data layer: restore the prior catalog fallback and remove the three new authored placements and palette reference. Retain the tileset and icons if maps outside Level01 have begun using them; removing those assets before migrating dependent maps would break their Tiled references.
