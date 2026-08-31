## 1. Planning-Required State Setup

- [x] 1.1 Finalize change scope and capabilities in `proposal.md`
- [x] 1.2 Define health/damage/death requirements in `specs/combat-health-system/spec.md`
- [x] 1.3 Capture implementation approach in `design.md`

## 2. Core Runtime Implementation

- [x] 2.1 Add shared health/death state creation helpers and integrate actor state in `src/main.js`
- [x] 2.2 Wire frame-level projectile hit handling: apply arrow damage to sheep and goblin, then deactivate projectile
- [x] 2.3 Add goblin melee damage gating: apply 25 damage only during `EnemyState.ATTACKING` and only once per contact window
- [x] 2.4 Add sheep↔hero touch handling for sheep damage and prevent health changes outside defined matrix
- [x] 2.5 Implement 250ms die animation and movement freeze in `src/main.js`
- [x] 2.6 Ensure `update` loop and entity calls skip movement/logic for dying actors

## 3. Integration Verification

- [x] 3.1 Verify no health UI elements are added and gameplay behavior remains sprite-only for health/death outcomes
- [x] 3.2 Manually validate scenarios: hero→sheep hit (100), hero→goblin hit (50), hero↔goblin touch (25), goblin damage gated by attack state (25), die transition
- [x] 3.3 Verify remaining gameplay remains stable when actors die (no unhandled errors during ongoing updates)
