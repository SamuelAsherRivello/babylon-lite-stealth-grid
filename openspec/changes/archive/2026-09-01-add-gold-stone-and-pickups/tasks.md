## 1. Authoring and normalization
- [x] `C032-T001` $tid Add source assets, attribution, Gold Stone tileset item, combat collider, and Level01 placement.
- [x] `C032-T002` $tid Normalize Gold Stone objects and validate their frame metadata and collider contract.

## 2. Runtime object lifecycle
- [x] `C032-T003` $tid Implement one-shot Gold Stone spawning and the Gold Stone idle/highlight/ObjectDeath lifecycle.
- [x] `C032-T004` $tid Implement Gold Pickup variants, 9-grid destination selection, pickup spawn tween, player-only collection, and PickupObjectDeath.
- [x] `C032-T005` $tid Route player projectile hits to Gold Stones and create drops only after stone death completes.

## 3. Verification
- [x] `C032-T006` $tid Add focused unit and Tiled contract tests for variants, timing, health, 9-grid placement, collection, and disposal.
- [ ] `C032-T007` $tid Run focused tests, full test suite, production build, and browser verification of Level01.
