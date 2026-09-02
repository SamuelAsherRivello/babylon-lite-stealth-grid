## Why

Enemy perception currently supports recovery after evidence is lost, but a new, stronger detection during an active reaction is not yet expressed as escalation. This makes an enemy remain at an outdated awareness level when the player moves into a more severe detection location; allowing stronger re-detection makes the state machine responsive while preserving bounded de-escalation.

## What Changes

- Treat accepted detections as severity-ranked evidence that can raise an enemy's current perception state.
- Allow `SUSPICIOUS` to escalate to `INVESTIGATING` or `ALERT` when stronger evidence is detected.
- Allow `INVESTIGATING` to escalate to `ALERT` on an alert-level trigger, including a direct jump when the evidence warrants it.
- Allow an already `ALERT` enemy to refresh its confirmed and last-known location from renewed direct detection without downgrading.
- Preserve the existing de-escalation path when no stronger evidence is present: `ALERT` to `INVESTIGATING` to `SUSPICIOUS` to `NONE`.
- Reset or replace only the reaction timers and remembered locations relevant to the newly escalated state, so stale lower-severity timers cannot immediately undo the escalation.

## Capabilities

### New Capabilities

- `enemy-perception-escalation`: Severity-aware re-detection and upward transitions for active enemy perception reactions.

### Modified Capabilities

- `character-perception`: Detection handling must accept stronger subsequent evidence and distinguish escalation from weaker duplicate detections.

## Impact

Likely affects the enemy perception reaction adapter, reaction profiles and state-transition logic, centralized detection event consumption, remembered-location/timer snapshots, and deterministic unit/integration tests. Existing perception geometry, enemy locomotion/combat states, de-escalation behavior, and dependencies remain in scope unless needed to expose the new transition contract.
