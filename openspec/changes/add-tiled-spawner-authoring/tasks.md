## 1. Authoring Palette Contract

- [ ] 1.1 Add failing fixture tests for a Tiled spawner collection containing exactly the named Player, Sheep, and Enemy items with only their expected `type` defaults; verify the focused test fails before adding the collection
- [ ] 1.2 Add the external collection-of-images spawner tileset and three recognizable temporary editor icon assets, register the tileset with the Tiled project/map, and verify the fixture test passes
- [ ] 1.3 Open the project and Level01 in Tiled and verify the three items are visibly distinct, selectable from the palette, and placeable as tile objects on the `Spawners` layer

## 2. Normalization and Validation

- [ ] 2.1 Add failing loader tests for tile `type` defaults, the Warrior instance override, tile-object anchoring, and origin-relative cells; verify the focused loader tests fail for the missing behavior
- [ ] 2.2 Implement spawner tile-definition resolution into normalized `{ type, gameCell }` records with source identity, then verify the focused normalization tests pass
- [ ] 2.3 Add failing validation tests for unsupported type values, non-finite positions, and zero or multiple Player Spawners; verify both player-count cases produce exactly `Invalid Level Format: Must contain 1 Player Spawner`
- [ ] 2.4 Implement pre-composition authored-spawner validation and verify Player, Sheep, Goblin, and Warrior records normalize successfully with no gameplay properties beyond `type`

## 3. Map-Authoritative Runtime Composition

- [ ] 3.1 Replace catalog expectations with failing tests proving authored placements are not combined with hardcoded placements, optional non-player omissions remain omitted, repeated non-player placements stay independent, and every uppercase type receives the correct Babylon-owned defaults
- [ ] 3.2 Change the catalog/composition boundary to translate only authored `{ type, gameCell }` records through the runtime defaults and verify the focused catalog tests pass without altering population timing or lifecycle behavior
- [ ] 3.3 Add failing integration coverage for the exactly-one-player invariant and single-player lookup, then verify invalid levels stop before game setup with the exact requested error

## 4. Primary Level Migration

- [ ] 4.1 Choose and document explicit cell-aligned locations for one Player, Sheep, Goblin, and Warrior in Level01, and verify fixture expectations encode those four cells
- [ ] 4.2 Place Player, Sheep, and Goblin palette items and convert the current Warrior to the Enemy item with only `type: WARRIOR`; verify normalization returns exactly four authored records and no implicit placements
- [ ] 4.3 Update the Tiled level-authoring documentation with the palette, `Spawners` layer, one-property contract, Enemy type override, optional non-player behavior, mandatory Player error, and editor-only icon rules; verify every documented path and name exists

## 5. Verification and Optional Polish

- [ ] 5.1 Run the full automated test suite and production build and verify both complete successfully with no spawner, Tiled, or existing Warrior regressions
- [ ] 5.2 Run the game in a real browser and verify Level01 creates Player, Sheep, Goblin, and Warrior actors at the four authored cells and collider diagnostics show no duplicate hardcoded markers
- [ ] 5.3 Reopen the saved project/map in Tiled and verify the palette and all placements remain intact and visually distinguishable after a save/reload cycle
- [ ] 5.4 Stretch: replace the temporary palette icons with editor assets matching the corresponding small black-and-white in-game spawner markers, and verify Tiled visual QA plus the full test/build checks still pass
