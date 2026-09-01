## 1. Pawn Asset and Catalog Foundation

- [x] `C028-T001` $tid 1.1 Register the copied Pawn PNG sheets under `public/assets/player/pawn/` and verify all 20 expected PNG files resolve from the browser asset root
- [x] `C028-T002` $tid 1.2 Add a data-driven Pawn animation catalog for empty, item, weapon, and interaction sheets and verify frame counts and 192x192 cell slicing with catalog tests
- [x] `C028-T003` $tid 1.3 Define the independent item and weapon slot model and verify valid values, empty slots, and category boundaries with unit tests

## 2. Player Presentation and State

- [x] `C028-T004` $tid 2.1 Replace archer atlas loading in `Player` with Pawn atlas loading while preserving the public Player spawn, movement, collider, facing, jump, and depth-sort behavior; verify existing player movement and grid tests pass
- [x] `C028-T005` $tid 2.2 Implement locomotion presentation selection for empty hands and each item/weapon slot combination and verify idle/run rendering selection with state tests
- [ ] `C028-T006` $tid 2.3 Implement the non-blocking weapon attack presentation, 0.5-second recovery, and repeated-input rejection; verify attack timing, movement continuity, and return-to-item behavior with state tests
- [ ] `C028-T007` $tid 2.4 Remove Player-specific arrow release and archer shooting integration while preserving generic projectile and non-player behavior; verify obsolete Player arrow tests are replaced and generic projectile tests pass

## 3. Temporary Loadout and Melee Combat

- [x] `C028-T008` $tid 3.1 Add temporary `1` weapon cycling and `2` item cycling in the exact documented orders, then verify wraparound and category boundaries with tests
- [ ] `C028-T009` $tid 3.2 Disable both cycling controls during the active weapon animation, cooldown, and damage window, then verify changes apply only after the lifecycle ends
- [ ] `C028-T010` $tid 3.3 Add the attack-only combat collider, per-weapon damage values, and once-per-target-per-attack hit tracking, then verify melee combat tests

## 4. Controls and Integration

- [ ] `C028-T011` $tid 4.1 Rename the action control and keyboard mapping from Shoot to Attack while preserving Jump, joystick, simultaneous pointers, and responsive layout; verify controller tests and markup checks pass
- [ ] `C028-T012` $tid 4.2 Wire Attack to the game-owned equipped-weapon action and verify no-weapon presses are harmless and equipped-weapon presses invoke once
- [ ] `C028-T013` $tid 4.3 Run the complete automated test suite and production build, verify no archer asset references remain in Player paths, and perform a browser smoke check of movement, jump, cycling, attack, damage, and Pawn rendering
