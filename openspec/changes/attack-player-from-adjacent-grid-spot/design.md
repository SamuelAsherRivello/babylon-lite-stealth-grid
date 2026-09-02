## Context

See proposal.md for motivation. The awareness controller currently delegates ordinary behavior in NONE, checks an entry interruption before combat in other states, and exposes only the Goblin's combat-only hook. Warrior and Lancer have attack APIs but patrol controllers do not request nearby-player attacks. Archer shooting requires a detected player. Monk has healing artwork but no attack API; the user's latest decision explicitly excludes both automatic healing and attacks.

The working tree contains ongoing GridSpot and awareness work. Integrate against those live contracts without changing their quantization, movement geometry, or unrelated artifacts. C056 is separate from C055 awareness entry and the universal-grid-spot-occupancy change.

## Goals / Non-Goals

**Goals:** One shared cardinal-adjacency decision, roster-specific attack adapters, and consistent priority across all four awareness states. Preserve each actor's attack and recovery lifecycle.

**Non-Goals:** Changing damage rules, adding melee to the Archer, changing ranged behavior outside adjacency, changing grid quantization, altering art, adding dependencies, or making the Monk combat-capable.

## Decisions

1. Read authoritative live actor GridSpots and a living-player snapshot. Use Manhattan distance exactly one. Do not add separate rounding or pixel-range checks: the visual grid markers and combat decision must agree, including configurable grid sizes.
2. Add a shared attack decision before navigation in every awareness state. Respect active action locks and existing recovery first. A pending awareness entry stop may coexist with an immediate attack because both stop locomotion; it must not delay an otherwise eligible attack. Do not force ALERT or retain privileged player tracking after adjacency ends.
3. Use explicit per-roster attack adapters. Goblin starts through its behavior controller so recovery and target bookkeeping remain coherent. Warrior and Lancer use their existing directional attack APIs. Archer uses its existing shooting lifecycle with a captured live target, bypassing detection only for cardinal adjacency. Monk registers no adjacency attack capability. Avoid a generic call to differently shaped attack APIs or treating Monk healing as an attack.
4. Preserve Goblin recovery while allowing repeated adjacent-player attacks. Its current remembered-target exclusion can suppress repeat swings; the adjacency path must reevaluate the player after recovery instead. Player priority applies before selecting new sheep or bush actions, but never cancels an already committed attack.
5. Cancel obsolete normal navigation only when committing the attack; do not repeatedly cancel combat recovery or decrement it twice in one update. Clear or recompute stale reaction routes when locomotion becomes eligible again. Keep actor updates running for animations, projectiles, and lifecycle progression.
6. Treat this as an additional attack trigger. Existing non-adjacent Archer shooting and other established combat remain intact. Attack initiation does not itself award damage or expand reach through terrain; existing hit resolution remains authoritative.

## Risks / Trade-offs

- Different actor APIs and recovery ownership could cause duplicate starts or skipped cooldowns -> exercise real actor adapters and full controller-to-actor update order, not only the distance helper.
- Awareness entry or patrol can overwrite an attack -> test all four states and their entry transitions during motion and blocked waiting.
- GridSpot changes are already in progress -> use the current authoritative accessors and test non-centered positions without modifying quantization.
- Archer can enter its shooting path twice -> ensure one accepted animation and at most one projectile per attack.
- Monk could inherit behavior accidentally -> add an explicit negative roster test covering attack and heal animations.

## Migration Plan

Add failing behavior tests, integrate the shared decision and adapters, then run focused tests, the relevant character/perception suites, and a production build. Verify rendered attacks and the Monk exemption in a browser with controlled actor placement. Record evidence and only mark tasks complete when their behavior is verified. No data migration is required; any later rollback is an additive corrective edit, preserving existing work and Git history.
