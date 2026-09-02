## 1. Shared movement contract

- [x] 1.1 C052-T001 Add focused tests for vertical and horizontal quantized enemy movement, axis changes, stopping, collision blocking, and correction from off-center positions; verify with the focused Node test command.
- [x] 1.2 C052-T002 Extract or adapt the shared grid-alignment integration needed by enemy actors without changing the existing player behavior; verify existing player grid-alignment tests remain passing.

## 2. Enemy actor integration

- [x] 2.1 C052-T003 Integrate quantized movement into Goblin while preserving attack, bush interaction, and knockback behavior; verify Goblin movement and behavior tests.
- [x] 2.2 C052-T004 Integrate quantized movement into Archer while preserving ranged attack release and recovery behavior; verify Archer AI and lifecycle tests.
- [x] 2.3 C052-T005 Integrate quantized movement into Warrior and Lancer while preserving defense, attack, and knockback behavior; verify their focused tests.
- [x] 2.4 C052-T006 Integrate quantized movement into the shared Monk actor path; verify Monk actor tests and shared actor tests.

## 3. Verification

- [ ] 3.1 C052-T007 Verify all enemy movement colliders, grid occupancy, and render depth remain coherent after horizontal and vertical movement; run the complete automated test suite.
- [ ] 3.2 C052-T008 Run a browser smoke test with the enemy types and verify visible one-axis centerline movement, obstacle handling, attacks, and no regressions.
