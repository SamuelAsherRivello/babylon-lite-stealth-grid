## 1. Inventory and failing regressions

- [x] 1.1 C055-T001 Inventory every enemy factory/controller and the prevailing recovery/occupancy interfaces; verify a written adapter checklist accounts for all runtime enemy types and preserves existing uncommitted changes.
- [x] 1.2 C055-T002 Add transition regressions for initial awareness, escalation, de-escalation, forced states, repeated detections, and reset; run the focused Node tests and record failures proving the missing stop-before-decision contract.
- [x] 1.3 C055-T003 Add executable runtime-update regressions for each enemy adapter starting with nonzero patrol or specialized intent; verify they fail because old movement survives or overwrites awareness, including off-center and same-direction cases.

## 2. Shared interruption and decision ownership

- [x] 2.1 C055-T004 Add central entry/reset signaling that distinguishes actual state transitions from same-state evidence refresh; verify the C055-T002 regressions pass without changing thresholds, memories, or reaction timers.
- [x] 2.2 C055-T005 Implement shared stop, pending-response, and locomotion-ownership handling with minimal controller cancellation adapters; verify C055-T003 passes and each enemy has a stationary active update before fresh reaction movement with no stale route/waypoint/retry resumption.
- [x] 2.3 C055-T006 Integrate state-appropriate facing, safe investigation/pursuit, and return-to-normal decisions; verify complete update-loop tests prevent patrol overwrite and honor remembered targets, cardinal movement, collision, occupancy, and bounded blocked-route recovery.
- [x] 2.4 C055-T007 Cover paused/zero-delta updates, rapid transitions, repeated visual refreshes, attack locks, death/disposal, and debug resets; verify no repeated freeze, obsolete pending movement, canceled protected action, or movement after death.

## 3. Verification and handoff

- [x] 3.1 C055-T008 Run the same initially failing tests, `npm.cmd test`, and `npm.cmd run build`; record results and distinguish any unrelated existing failures.
- [x] 3.2 C055-T009 Verify every supported enemy type in the live browser with audio/visual entry, escalation, de-escalation, repeated sight, and blocked targets; record the live URL and evidence of stationary entry, stopped walking presentation, and fresh state-appropriate movement without snapping or stale-direction continuation.
- [x] 3.3 C055-T010 Review artifact-to-implementation coverage and run `openspec validate stop-and-redecide-on-enemy-alert --strict`; verify all scenarios have evidence and document any remaining gaps before marking implementation complete.
