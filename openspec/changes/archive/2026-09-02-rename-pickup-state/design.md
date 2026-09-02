## Context

The current pickup object uses an internal `pickingUp` state and a `collect()` method. The pickup system performs collision detection every update, so the transition must be represented by a stable public flag and must be idempotently guarded.

## Goals / Non-Goals

**Goals:**

- Establish `IsPickedUp = false` as the collection state contract.
- Make `pickup()` the single transition into the collection animation.
- Remove the collection collider immediately after the transition.

**Non-Goals:**

- Changing pickup animation timing, visuals, rewards, placement, or removal duration.
- Introducing a new dependency or changing the viewport/collider model.

## Decisions

- Use a boolean `IsPickedUp` property as the externally observable latch. This directly expresses whether collection has already begun and avoids exposing the animation's internal timing state.
- Make `pickup()` return success only when `IsPickedUp` is false, then set the flag before animation progression. This prevents repeated collision updates from resetting elapsed animation time.
- Return no combat collider while `IsPickedUp` is true. This prevents the pickup system from treating the object as detectable again, rather than merely ignoring a repeated method call.
- Update callers and tests to use the new method/property names. Keep the existing internal animation state private to the pickup implementation.

## Risks / Trade-offs

- [Risk] External code may still call `collect()` or inspect the old state getters. → Mitigation: update all repository callers and focused tests together; no compatibility alias is needed for this internal game API.

## Migration Plan

Update the pickup object, pickup system, and tests in one change, then run focused tests and the production build.
