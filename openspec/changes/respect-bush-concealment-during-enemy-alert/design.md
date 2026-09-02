## Context

See proposal.md for motivation. Centralized perception suppresses all detections for hidden players. Awareness owns pursuit, but adjacent attacks run before awareness navigation and goblin and archer also have independent combat decisions. Navigation already blocks living character cells; it does not represent an occupied bush when the player's center is outside its cell.

## Goals / Non-Goals

**Goals:** Share target eligibility across attack entry and preparation, reuse reaction timing, and supply occupied-bush blockers to both navigation and actor collision.

**Non-Goals:** Changing alert durations, globally exposing hidden players, introducing damage immunity, changing empty-bush behavior, or bypassing character collision.

## Decisions

- Add explicit visual-confirmation tracking eligibility to the reaction. A separate hidden-location update changes pursuit memory without going through detection or resetting its timer. Synthetic visual detections would otherwise keep the enemy alerted forever.
- Keep the player's hidden presentation and centralized perception suppression. Runtime snapshots carry per-enemy target eligibility, and the shared attack-preparation gate rechecks it before committing. Specialized goblin and archer decisions consume the same eligibility.
- Add full-cell blockers for every living bush actually overlapping the player's combat collider, only for enemies lacking tracking permission. Use these for route selection, segment validation and dynamic movement collision. Player occupancy collision remains in force even for alerted enemies.
- Evaluate the reaction timer before tracking and attack decisions so expiry takes effect in the same active frame. Paused time does not expire or extend the window.

## Risks / Trade-offs

- Multiple combat paths could bypass hiding -> regression coverage for the attacking roster, goblin fallback, archer ranged decisions, and mid-preparation expiry.
- Using prior-frame detections could expose a newly hidden player -> snapshot target eligibility overrides stale detection flags.
- Bush overlap and logical occupancy differ at edges -> derive occupied bushes from the existing hiding overlap predicate and use each bush's logical cell for full-cell blockers.

## Migration Plan

No stored data or asset migration. Validate focused regressions, build, and exercise a deterministic browser fixture using production actors. Any rollback is an additive corrective edit.
