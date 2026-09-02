## 1. Physics World and Roles

- [x] 1.1 `C043-T001` Implement bounded 2D movement physics and deterministic circle separation without a runtime physics dependency; verify solver tests pass
- [x] 1.2 `C043-T002` Route green movement colliders through the solver for terrain and every player, enemy, and moving NPC; verify focused non-overlap tests pass
- [x] 1.3 `C043-T003` Keep red combat colliders as separate overlap sensors excluded from movement blocking; verify combat overlap tests pass without movement displacement

## 2. Character Integration

- [x] 2.1 `C043-T004` Drive player and enemy movement through the bounded movement solver and synchronize corrected transforms back to actors; verify actor movement tests pass
- [x] 2.2 `C043-T005` Preserve enemy AI, attacks, defense, healing, projectiles, and collider diagnostics while switching their collision source to physics; verify enemy and collider-role tests pass
- [x] 2.3 `C043-T006` Remove manual overlap separation and make the watchdog telemetry-only; verify no active code path manually pushes characters apart

## 3. Verification

- [x] 3.1 `C043-T007` Add an integration regression with two enemies converging and confirm green colliders never overlap or freeze gameplay
- [x] 3.2 `C043-T008` Run the focused test suite, production build, and real-browser smoke test with collider diagnostics enabled
