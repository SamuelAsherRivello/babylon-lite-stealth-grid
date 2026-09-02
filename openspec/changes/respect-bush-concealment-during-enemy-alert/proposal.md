## Why

Bush hiding currently stops perception but does not prevent adjacent attacks. Concealment must protect an unnoticed player while allowing an enemy that confirmed the player to follow their movement briefly after they hide.

## What Changes

- C060 gives each enemy a bounded bush-tracking exception during its visually confirmed ALERT period.
- Track the player's changing hidden position without refreshing the existing alert timer. Expiry immediately restores concealment.
- Prevent non-alerted enemies from targeting a hidden player or walking through a living bush occupied by that player.
- Revalidate concealment during attack preparation; preserve committed attack animations and projectile physics.
- Record implementation tasks with permanent C060-T### IDs.

## Capabilities

### New Capabilities
- `bush-concealment`: Per-enemy attack eligibility and occupied-bush blocking, with temporary confirmed-alert tracking.

### Modified Capabilities
- `enemy-perception-reactions`: Permit bounded movement tracking inside bushes while retaining normal expiry and last-known search behavior.

## Impact

Shared concealment policy, enemy awareness, goblin target selection, archer target eligibility, runtime target snapshots and movement blockers, plus automated and browser verification. No dependencies, assets, map changes, or alert-duration tuning.
