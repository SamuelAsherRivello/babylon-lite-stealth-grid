## Context

The existing reaction layer already models `NONE`, `SUSPICIOUS`, `INVESTIGATING`, and `ALERT`, with timers and remembered cells, but its detection contract is primarily first-trigger/stronger-active handling. See proposal.md and the two delta specs for the required behavior.

## Goals / Non-Goals

**Goals:**

- Centralize upward transition decisions in the enemy reaction layer.
- Preserve direct-detection truth: only direct alert evidence may update the confirmed player cell and trigger `ALERT`.
- Make transitions deterministic and testable, including timer replacement and same-state refresh behavior.

**Non-Goals:**

- Adding new perception states, channels, enemy types, or dependencies.
- Changing perception geometry, detection-strength calculation, patrol/combat state machines, or the existing downward recovery sequence.

## Decisions

- Use an explicit severity ordering `NONE < SUSPICIOUS < INVESTIGATING < ALERT` for transition comparison. This makes direct jumps data-driven and avoids enumerating every pair in separate callers. An event-type switch alone was rejected because it would duplicate transition rules across states.
- Keep the mapping from detection evidence to reaction severity in each enemy's existing reaction profile. This preserves enemy-specific confirmation rules while allowing the shared adapter to compare the resulting severity.
- On an upward transition, clear or replace the previous state's expiry/search timer and initialize the destination state's timer. This prevents a stale lower-state timer from undoing a valid escalation; accumulating timers was rejected because it makes state duration dependent on prior history.
- Treat same-state direct visual detections as location refreshes, while weaker detections remain non-downgrading evidence. This retains the existing no-cheating last-known-position rule.
- Test the reaction adapter with injected time/random inputs, then add integration coverage for the centralized manager's repeated detections. No browser-only behavior is required unless the existing perception test harness exposes it.

## Risks / Trade-offs

- [Repeated detections may refresh alert indefinitely] → Refresh only the confirmed location and the destination rules explicitly permitted by the profile; do not let weaker or non-direct evidence extend alert.
- [Concurrent active perception changes may alter current incomplete behavior] → Reuse the current reaction snapshot and transition APIs, and run existing perception/reaction tests before adding escalation assertions.
- [Profile thresholds could make a nominally stronger event map to the same state] → Test at the profile's actual severity boundaries and document that escalation is based on mapped reaction severity, not raw strength alone.

## Migration Plan

No data migration or dependency change is required. Implement the transition contract behind the existing reaction API, run focused and full tests, and roll back by reverting the new change artifacts and implementation if regressions appear.
