## 1. Authoring and normalization
- [x] Add source assets, attribution, Gold Stone tileset item, combat collider, and Level01 placement.
- [x] Normalize Gold Stone objects and validate their frame metadata and collider contract.

## 2. Runtime object lifecycle
- [x] Implement one-shot Gold Stone spawning and the Gold Stone idle/highlight/ObjectDeath lifecycle.
- [x] Implement Gold Pickup variants, 9-grid destination selection, pickup spawn tween, player-only collection, and PickupObjectDeath.
- [x] Route player projectile hits to Gold Stones and create drops only after stone death completes.

## 3. Verification
- [x] Add focused unit and Tiled contract tests for variants, timing, health, 9-grid placement, collection, and disposal.
- [ ] Run focused tests, full test suite, production build, and browser verification of Level01.
