## Context

The existing Character Perception manager produces repeated visual and audio detection events and the debug renderer displays their geometry. Enemy actors already have independent locomotion and combat controllers. This change adds a reaction layer between those events and existing enemy behavior.

## Goals / Non-Goals

**Goals:**

- Keep sensing centralized and reaction state owned per enemy.
- Make awareness discrete, readable, bounded, and recoverable.
- Preserve `suspicionCell` separately from `confirmedCell`/last-known position.
- Allow each enemy type to use a different reaction profile.
- Expose immutable reaction snapshots to the renderer and tests.

**Non-Goals:**

- Continuous detection meters.
- Lighting simulation, alarms, local awareness propagation, or speech UI.
- Replacing existing patrol, locomotion, or combat state machines.

## Decisions

1. Use `NONE`, `SUSPICIOUS`, `INVESTIGATING`, and `ALERT` as perception states. Keep `COMBAT` as a separate behavior state so alerting does not force every enemy into the same attack behavior.

2. Store reaction state in an enemy-owned adapter/controller. The centralized manager remains responsible for geometry, terrain checks, and event production; the adapter interprets strength and channel using the enemy profile.

3. Maintain `suspicionCell`, `alertedCell`, and `lastKnownCell` independently. While `ALERT`, renewed direct visual detections update both `alertedCell` and `lastKnownCell`. Losing direct confirmation freezes the last-known cell and starts investigation/search instead of following the player's current location.

4. Use profile-driven thresholds and timers. Initial defaults are a randomized 1–3 second suspicion phase, 2 seconds facing each of four directions during search, and a randomized 3–5 second alerted phase. Every duration remains configurable for playtesting. Audio may produce suspicion or investigation but never alert by itself.

5. Make investigation movement bounded and deterministic under test. Runtime selection may randomly choose one cell, two cells, or the full route, while tests inject the random source and validate each branch.

6. Treat stronger evidence as an upgrade and weaker evidence as non-downgrading noise while an active reaction is running. Expired reactions return control to the prior controller or patrol behavior.

7. De-escalate through `ALERT -> INVESTIGATING -> SUSPICIOUS -> NONE`. Searching is a behavior substate of `INVESTIGATING`, not a fifth perception state.

8. Render runtime expressions in Babylon Lite using a dedicated Sprite2D layer that follows each enemy's interpolated position. `NONE` has no icon, `SUSPICIOUS` shows `?`, `INVESTIGATING` shows an eye, and `ALERT` shows `!`. State changes keep the enemy's idle animation and trigger one programmatic flash: white for SUSPICIOUS, yellow for INVESTIGATING, and red for ALERT.

9. Reserve keyboard debug keys 4, 5, 6, and 7 for applying SUSPICIOUS, INVESTIGATING, ALERT, and NONE respectively to every living enemy on the current level.

## Risks / Trade-offs

- [Existing controllers have different movement APIs] -> Use narrow adapters that issue stop, face, and movement intents without replacing controller state machines.
- [Smooth movement can make a target cell ambiguous] -> Use each actor's committed logical grid cell.
- [Repeated perception events can refresh reactions forever] -> Refresh only the state appropriate to the current direct evidence; searching and suspicion timers expire without new evidence.
- [Profiles can become inconsistent] -> Validate thresholds, durations, and supported state transitions in unit tests.

## Migration Plan

Add the reaction adapter and profiles alongside the existing perception manager. Route enemy events through the adapter, expose its read-only snapshot to the renderer, and preserve existing behavior when the reaction state is `NONE`. No data migration or dependency change is required.
