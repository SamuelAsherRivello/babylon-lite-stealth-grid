## 1. Reaction Contract

- [x] C049-T001 Inspect the current enemy perception reaction adapter, profiles, snapshots, and detection event flow; document the existing severity mapping in tests or implementation notes and verify current perception tests pass
- [x] C049-T002 Add explicit severity comparison and upward-transition handling for `SUSPICIOUS`, `INVESTIGATING`, and `ALERT`, including direct jumps to `ALERT`; verify focused transition tests pass
- [x] C049-T003 Replace stale lower-state timers and update state-appropriate remembered cells during escalation; verify timer-expiry and last-known-location tests pass

## 2. Integration and Regression Coverage

- [x] C049-T004 Route repeated centralized visual/audio detection events through the escalation contract without changing perception geometry; verify centralized perception integration tests pass
- [x] C049-T005 Add regression coverage proving weaker detections do not downgrade active reactions and renewed direct visual detection refreshes an alerted location; verify existing de-escalation tests remain green
- [x] C049-T006 Run the repository's focused perception tests and full validation/build command, recording the unrelated pre-existing test import/plugin failures; verify the new escalation scenarios with direct module and centralized-routing smoke tests
