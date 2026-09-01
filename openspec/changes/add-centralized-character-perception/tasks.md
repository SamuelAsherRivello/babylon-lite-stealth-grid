## 1. Perception model

- [x] C036-T001 Add pure cardinal Visual/Audio cell and strength calculations with tests for all facings, four distances, 9-grid neighbors, and terrain blocking.
- [x] C036-T002 Add centralized registration, lifecycle removal, actor snapshots, and read-only geometry/detection output; verify registration and deregistration tests pass.

## 2. Detection and enemy response

- [x] C036-T003 Integrate player, goblin, archer, and warrior registration into the main update lifecycle; verify all three enemies receive current player detections.
- [ ] C036-T004 Dispatch first-event-only alert handling with 100%, 50%, and 25% responses plus alert/cooldown recovery; verify deterministic unit tests cover every branch.

## 3. Verification

- [ ] C036-T005 Run the full unit suite, production build, and OpenSpec validation; record all passing commands.
- [ ] C036-T006 Verify in a real browser that moving the player through each enemy's visual line and audio radius produces the correct channel, strength, grid spot, and alert behavior.
