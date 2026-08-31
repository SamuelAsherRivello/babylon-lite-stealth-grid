## 1. Authoring Palette Contract

- [ ] 1.1 Add failing fixture tests for a Tiled spawner collection containing exactly the named Player, Sheep, and Goblin items with their expected role, character, population, and initial-population defaults; verify the focused test fails before adding the collection
- [ ] 1.2 Add the external collection-of-images spawner tileset and three recognizable temporary editor icon assets, register the tileset with the Tiled project/map, and verify the fixture test passes
- [ ] 1.3 Open the project and Level01 in Tiled and verify the three items are visibly distinct, selectable from the palette, and placeable as tile objects on the `Spawners` layer

## 2. Normalization and Validation

- [ ] 2.1 Add failing loader tests for tile-definition defaults, per-instance overrides, tile-object anchoring, origin-relative cells, and legacy point-spawner compatibility; verify the focused loader tests fail for the missing behavior
- [ ] 2.2 Implement spawner tile-definition resolution and normalized source identity while retaining legacy point-object parsing, then verify the focused normalization tests pass
- [ ] 2.3 Add failing validation tests for unsupported role/character pairs, non-integer or invalid population bounds, non-Boolean initial settings, non-finite positions, and multiple Player Spawners; verify every invalid fixture produces the intended source-rich error
- [ ] 2.4 Implement pre-composition authored-spawner validation and verify all invalid fixtures fail actionably while Player, Sheep, Goblin, and the existing Warrior record normalize successfully

## 3. Map-Authoritative Runtime Composition

- [ ] 3.1 Replace catalog expectations with failing tests proving authored records are not combined with hardcoded defaults, an omitted type stays omitted, an empty map yields no spawners, and repeated non-player placements remain independently configured
- [ ] 3.2 Change the catalog/composition boundary to translate only the complete authored spawner list and verify the focused catalog tests pass without altering population timing or lifecycle behavior
- [ ] 3.3 Add failing integration coverage for safe no-player startup/update/shutdown paths and the single-player lookup, then update composition paths as needed and verify the integration tests pass

## 4. Primary Level Migration

- [ ] 4.1 Choose and document the explicit cell-aligned Player, Sheep, and Goblin migration cells, including the intentional rounding of the former fractional sheep position, and verify fixture expectations encode those cells and existing population settings
- [ ] 4.2 Place the three palette items on Level01's `Spawners` layer without removing or changing the current Warrior placement, then verify normalization returns exactly the authored Player, Sheep, Goblin, and Warrior records with no implicit defaults
- [ ] 4.3 Update the Tiled level-authoring documentation with the palette, layer, placement, override, omission, validation, and editor-only icon rules, then verify every documented repository path and item name exists

## 5. Verification and Optional Polish

- [ ] 5.1 Run the full automated test suite and production build and verify both complete successfully with no spawner, Tiled, or existing Warrior regressions
- [ ] 5.2 Run the game in a real browser and verify the migrated level creates actors at the authored cells, omitted fixtures create no fallback spawners, and collider diagnostics show no duplicate hardcoded markers
- [ ] 5.3 Reopen the saved project/map in Tiled and verify the palette and all placements remain intact and visually distinguishable after a save/reload cycle
- [ ] 5.4 Stretch: replace the temporary palette icons with editor assets matching the corresponding small black-and-white in-game spawner markers, and verify Tiled visual QA plus the full test/build checks still pass
