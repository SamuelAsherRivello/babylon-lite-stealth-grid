## Context

The game uses a 9x16 logical grid with smooth actor movement, existing cardinal-direction helpers, terrain walkability, and enemy controllers. Perception must be grid-based while reading current actor snapshots from the main update coordinator.

## Goals / Non-Goals

**Goals:**

- Centralize registration, geometry, detection, and alert-event dispatch.
- Preserve a small read-only snapshot contract usable by debug rendering.
- Keep Visual and Audio Perception separate while sharing current presence detection.

**Non-Goals:**

- Audio intensity, movement-speed noise, sound propagation, or audio occlusion.
- Persistent investigation memory after alert recovery.
- Player-facing perception inspection.

## Decisions

- Use a manager-owned registry keyed by stable character identity; this avoids duplicating per-enemy scans and gives all enemy types one contract.
- Derive the origin from each actor's current logical grid cell and facing from its last significant cardinal movement; do not anchor perception to sprite bounds.
- Generate pure cell sets/results before dispatching events. Visual uses a forward line and terrain traversal; Audio uses the eight Chebyshev neighbors without terrain blocking.
- Report channel, strength, and grid location. Keep source identity available only to the manager if needed for routing, not as a requirement of enemy behavior.
- Let each enemy accept one alert transaction at a time. Alert completion and cooldown return it to its prior controller behavior.
- Expose current perception geometry and active detections through a read-only snapshot so the separate rendering change does not reach into enemy internals.

## Risks / Trade-offs

- [Smooth movement can make cell ownership ambiguous] -> Use the existing logical grid-cell convention and update perception when the actor's committed cell changes.
- [Existing enemy controllers have different state machines] -> Adapt reports into narrow alert commands rather than replacing their unrelated locomotion/attack states.
- [Random 50% response is hard to test] -> Inject or isolate the random decision source and test both outcomes deterministically.

## Migration Plan

Add the manager alongside existing behavior, register the three enemies and player through main integration, then route alert responses through adapters. Existing enemy behavior remains the fallback when no alert is active.
