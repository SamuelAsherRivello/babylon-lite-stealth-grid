## Context

The existing release metadata is rendered into `#gameUi` in the DOM header, while gold pickup objects are created and updated by the level startup and main game loop. See proposal.md and the gold-counter delta spec for the user-visible contract.

## Goals / Non-Goals

**Goals:**

- Reuse the existing DOM HUD and styling conventions.
- Establish the total once the level’s initial gold sources/pickups are known.
- Update the displayed collected value from the existing player collection event.

**Non-Goals:**

- No win condition, reward, sound, animation, persistence, or special all-collected state.
- No React or UI library introduction.

## Decisions

- Create a small DOM UI module that owns `Gold: 00/00` formatting and text updates, colocated with the existing release metadata UI. This keeps presentation testable and prevents counter markup from being embedded in the game loop.
- Append the counter to the existing header UI host after release metadata, so normal document flow places it immediately below the version line. CSS will preserve the upper-left header alignment and match the existing HUD typography.
- Derive the denominator from the gold represented by the level’s initial authored gold sources, including initial pickups and gold stones according to the existing gold spawning model. Increment only when a pickup transitions into collection, using a callback/event at the collection boundary rather than polling pickup array length.
- Add focused unit/UI tests for formatting, initialization, placement order, and collection updates, then run the existing test suite and browser smoke verification.

## Risks / Trade-offs

- [Risk] Gold stones create additional pickups after destruction, so the initial count can become ambiguous. → Mitigation: define the level total from gold available at level start and keep the total stable; the implementation should count the initial gold source contract consistently with the level’s existing gold model.
- [Risk] A pickup may be collected while its death animation is still active. → Mitigation: notify the counter only on the one-shot pickup transition into collection, not on removal from the pickup system.

## Migration Plan

No migration is required. The change is additive and can be rolled back by removing the counter module, its header styling, and its collection callback wiring.
