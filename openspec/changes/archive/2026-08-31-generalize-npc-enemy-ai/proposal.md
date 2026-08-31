## Why

The sheep and goblin both expose animation states, but their decisions are implemented as unrelated one-off controllers: the sheep reacts to threats and plans a safe route, while the goblin follows a scripted showcase that moves and attacks without considering targets. A small shared actor-AI contract will make those behaviors consistent, testable, and extensible without forcing NPCs and enemies to share identical state lists or rendering code.

## What Changes

- Introduce a reusable AI-controller contract that evaluates world snapshots, chooses an actor intent, and drives actor-specific animation states through explicit transitions.
- Extract reusable grid walkability, bounded route search, waypoint following, timing, and deterministic-random helpers from the sheep-only implementation.
- Preserve the sheep's `idle -> bouncing -> running -> cooldown -> idle` frightened response, expressed as a sheep policy using the shared controller/navigation services; the initial sheep fears both living players and enemies and uses a short configurable post-flee cooldown that leaves it easy to catch.
- Replace the goblin's scripted demo sequence and random swings with a configurable `idle -> patrol -> idle` decision loop.
- Make goblin patrol destinations random reachable walkable cells within a configured path-distance range and a spawn-centered home radius that defaults to four grid cells (256 pixels); the goblin follows cardinal routes around blocked terrain and decides again after arrival.
- Give the goblin attack decision priority when a living player or sheep is within configurable melee range; face the selected target, stop movement, play one atomic swing, observe a short configurable recovery, then reevaluate instead of attacking on a timer.
- Keep animation catalogs, sprite layers, collision geometry, and actor-specific transition rules within the sheep and goblin modules; the generalized layer supplies decisions and movement intent rather than a universal animation enum.
- Remove the goblin demo controller after its integration and tests are replaced by the behavior controller.

## Capabilities

### New Capabilities

- `actor-ai-behaviors`: Shared decision, state/animation intent, navigation, sheep fear, goblin patrol, and target-aware melee behavior for autonomous actors.

### Modified Capabilities

None. The related sheep and goblin changes have not been archived into the main spec set; this capability defines the generalized contract in one delta.

## Impact

- Affects `src/npc/sheep/`, `src/enemies/`, goblin/sheep integration in `src/main.js`, and their unit/integration tests.
- Replaces `src/enemies/goblin/goblin-demo-controller.js` with reusable AI infrastructure plus actor-specific policies.
- Reuses the existing logical grid, terrain and dynamic-collider contracts, animation manager, active gameplay delta, and injected randomness.
- Adds no runtime dependency and does not introduce an ECS, behavior-tree library, or navigation mesh.
