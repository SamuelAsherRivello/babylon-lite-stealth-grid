## Context

See `proposal.md` for motivation and `specs/tiled-spawner-authoring/spec.md` for the behavior contract. The local Tiled loader already normalizes point objects whose class or legacy type is `spawner`, and the composition root passes those records to a catalog function. That catalog currently always creates hardcoded Player, Sheep, and Goblin defaults and then appends authored records. The current working map also contains an in-progress Warrior point object, so this change must coexist with character-specific enemy authoring rather than reducing every enemy to Goblin.

The Tiled project already uses external JSON tilesets and a designated `Spawners` object layer. Runtime coordinates use origin-relative game cells and actor positions use cell centers. The game currently has a single input owner, although non-player spawner collections already support independent ownership and repeated role types.

## Goals / Non-Goals

**Goals:**

- Provide three obvious reusable palette entries that can be dragged or placed in Tiled.
- Make the loaded map the sole source of normal Player, Sheep, and Goblin spawner presence and position.
- Keep role (`player`, `sheep`, `enemy`) separate from character (`player`, `sheep`, `goblin`, `warrior`).
- Centralize defaults and validation so editor metadata, normalized data, and runtime configuration cannot silently diverge.
- Preserve the current level's intended behavior through explicit authored migration.

**Non-Goals:**

- Changing spawn timing, population policy, marker visibility, actor AI, combat, or lifecycle rules.
- Adding a general-purpose Tiled property inspector UI or a runtime level editor.
- Supporting multiple player input owners.
- Requiring the stretch black-and-white artwork for baseline completion.
- Removing or redesigning the separately authored Warrior spawner.

## Decisions

### Use a collection-of-images object tileset as the Tiled spawner palette

Add one external spawner tileset with three named tile definitions. Each tile uses a small repository-owned editor icon and supplies class/properties for its stable role, character, counts, and initial behavior. Designers place the tiles as tile objects on `Spawners`, which provides the normal visual palette, selection, move, and duplication workflow in Tiled.

Baseline icons can be simple labeled SVG or PNG assets such as `P`, `S`, and `G` with distinct silhouettes or labels. The stretch implementation may derive dedicated editor assets from the in-game marker appearance, but Tiled assets remain editor-only and are not loaded as game sprites.

Alternative considered: three free-standing `.tx` object templates. Templates carry defaults but are less discoverable as a compact visual palette and make the requested icon browsing experience weaker. Plain point objects were also rejected as the primary workflow because authors would repeatedly enter properties by hand.

### Resolve tile defaults first and instance overrides second

During normalization, resolve the placed object's tile definition from its GID. Merge the tile definition's properties with explicitly authored object properties, with instance properties winning. Emit a plain spawner record containing source identity for diagnostics, stable role and character values, origin-relative game cell, population values, and initial-population behavior.

This retains flexibility for intentional per-placement count changes without making the common placement workflow depend on manual property entry. Legacy point spawners remain readable during migration by using their object-level properties, which protects the concurrent Warrior work.

Alternative considered: hardcode item-to-configuration mapping in JavaScript by tile ID. Rejected because it duplicates authoring metadata and makes tileset reordering or extension brittle.

### Validate normalized records before game composition

Add a dedicated spawner validation pass after normalization and before actor factories or renderer resources are created. Validation checks supported role/character pairs, integer count invariants, finite coordinates, Boolean initial-population data, and the single Player Spawner constraint. Errors include the layer/object name or ID and offending field.

Alternative considered: rely on generic spawner-controller validation after composition. Rejected because it cannot explain Tiled source identity as clearly and could fail after partial level setup.

### Make authored arrays replace defaults rather than extend them

Change the catalog boundary to translate the complete normalized authored list. It no longer prepends hardcoded defaults. Empty is a meaningful level definition and yields no spawners; it does not trigger fallback behavior. Multiple non-player objects remain separate configurations even when they share the same role or character.

The Player constraint is validated before the existing type-based lookup can collapse duplicate keys. This preserves current single-player input semantics while allowing future work to revise that constraint explicitly.

Alternative considered: use hardcoded defaults only when no authored objects exist. Rejected because an empty or partially populated map could not intentionally omit a spawner and would make map authority conditional and surprising.

### Migrate Level01 using cell-aligned placements

Add Player, Sheep, and Goblin tile objects at the cells nearest their current hardcoded world positions, using center anchoring consistently for all authored spawners. Preserve their `(1,1)`, `(2,2)`, and `(1,1)` population ranges and existing initial-population settings. Keep the Warrior point placement valid until it is optionally converted to a palette item by its own change.

The sheep's old fractional world position cannot be represented exactly by one cell-centered editor item. The migration deliberately selects and records the intended map cell; acceptance checks compare against that authored cell rather than the old fractional pixel value.

Alternative considered: permit arbitrary pixel positions to reproduce the fractional values. Rejected because the current normalized spawner contract and level editing language are grid-cell based, and cell alignment makes placement predictable.

### Test authoring metadata, normalization, composition, and visible editor output separately

Fixture tests verify the three palette definitions and default properties. Normalizer tests cover tile defaults, instance overrides, legacy point compatibility, origin conversion, malformed data, and source-rich errors. Catalog/integration tests prove authored records replace defaults, omissions remain omissions, non-player duplicates remain independent, and duplicate players fail.

Open the project and migrated map in Tiled for final visual QA, confirming all three items appear in the palette and are distinguishable on the `Spawners` layer. Runtime browser QA verifies actors originate at authored cells and no hardcoded duplicates appear.

## Risks / Trade-offs

- [Concurrent Warrior and Tiled changes modify the same map and parser] -> Preserve legacy point-object support, merge changes around the current files, and test both Goblin and Warrior identity paths.
- [The old sheep position is fractional rather than cell-centered] -> Select an explicit nearest authored cell and document the intentional migration in tests.
- [Tile-object coordinates use a bottom edge while point objects use a point] -> Normalize through one documented anchor rule and cover both representations with coordinate tests.
- [Editor icon assets could accidentally enter the runtime renderer] -> Keep them under the Tiled authoring tree and exclude spawner palette tile objects from visual terrain/object rendering.
- [Instance overrides can create invalid combinations] -> Merge first, then validate the complete normalized record before composition.
- [A map without a player can load but may not be controllable] -> Treat omission as authoritative per the requested contract; gameplay code must handle the no-player collection safely and tests must cover it.

## Migration Plan

1. Add the external spawner palette and temporary editor icons, register it with the Tiled project/map, and verify the three named items in Tiled.
2. Add tests for tile-property resolution, validation, coordinates, omission, multiplicity, and legacy Warrior compatibility.
3. Extend normalization to produce validated records from palette objects while retaining legacy point objects.
4. Change composition to translate authored records without hardcoded defaults and make no-player paths safe.
5. Place Player, Sheep, and Goblin objects in Level01, retain the existing Warrior record, then run unit tests, build, Tiled visual QA, and browser acceptance checks.

Rollback is additive at the data layer: restore the prior catalog fallback and remove the three new authored placements and palette reference. Retain the tileset and icons if maps outside Level01 have begun using them; removing those assets before migrating dependent maps would break their Tiled references.
