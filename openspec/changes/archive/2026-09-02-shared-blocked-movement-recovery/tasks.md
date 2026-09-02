## 1. Reproduction and shared contract

- [x] 1.1 C054-T001 Inventory every autonomous locomotion controller and current movement/occupancy changes; capture actual goblin center, waypoint, intent, and blocking segment near (0, 12), and record a reproducible fixture or explain any changed live reproduction in verification notes.
- [x] 1.2 C054-T002 Add failing regressions for the observed corner or equivalent real-collision fixture, blocked waypoint, oscillation, sole reverse exit, and enclosure; verify failures exercise missing recovery rather than missing exports alone.
- [x] 1.3 C054-T003 Implement shared progress tracking and bounded recovery/wait state with one-second no-progress and three-second retry defaults; verify deterministic tests cover progress, locks, pause, death, replacement, and repeated enclosure without per-frame searches.

## 2. Safe route selection and actor integration

- [x] 2.1 C054-T004 Align cell availability and segment traversal with physical collision semantics and live blocking occupancy; verify self/dead filtering, partial terrain, off-center alignment, clear-endpoint/blocked-segment cases, and dynamic route invalidation.
- [x] 2.2 C054-T005 Implement preferred alternative selection, failed-segment exclusion/revalidation, and safe one-cell fallback; verify deterministic sole-exit tests relax patrol length, home radius, and flee separation while preserving bounds and collision safety.
- [x] 2.3 C054-T006 Integrate goblin patrol and bush-approach movement with shared feedback/recovery; verify both abandon stalled routes and preserve attack, target-lifecycle, and normal idle behavior.
- [x] 2.4 C054-T007 Integrate common enemy patrol and every remaining autonomous enemy controller identified in C054-T001; verify a parameterized roster test covers each enemy type and does not count deliberate attack locks as stalls.
- [x] 2.5 C054-T008 Integrate sheep flee/separation navigation with recovery; verify full bounce, recovery before post-flee cooldown, escape fallback, enclosure retries, and idle without threat. Verify human player direction remains user-controlled.

## 3. Diagnostics and integrated verification

- [x] 3.1 C054-T009 Expose bounded development snapshots with actor identity, world center, spot, intent, waypoint, recovery reason/state, no-progress time, and retry countdown; verify snapshots distinguish intentional rest, blocked movement, escape, and enclosure without changing behavior.
- [x] 3.2 C054-T010 Run relevant character/navigation integration tests and npm.cmd run build; verify two actors competing for a route cannot overlap and a released dynamic blocker becomes traversable on retry. Record commands and results.
- [x] 3.3 C054-T011 Sample the running game for at least 20 active seconds at (0, 12) and another corner, and exercise temporary enclosure for at least two retry intervals before releasing an exit; record timestamped position/intent/recovery evidence proving available escape and delayed retry. Verify representative enemies and sheep, and explain any difference from the original reproduction.


## 4. Approved safe-spawn extension

- [x] 4.1 C054-T012 Reproduce the blocked exact initial spawn, add autonomous spawn validation with nearest-available fallback and deferred creation, and verify valid placement, occupied candidates, deterministic ties, retry after release, and unchanged player spawning using tests and the live Level01 goblin.
