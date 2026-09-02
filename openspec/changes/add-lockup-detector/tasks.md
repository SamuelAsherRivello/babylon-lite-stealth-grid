## 1. Detector contract

- [ ] 1.1 `C048-T001` Implement a bounded game-loop liveness monitor with configurable heartbeat interval and missed-progress deadline; verify healthy and stalled timer behavior with unit tests
- [ ] 1.2 `C048-T002` Add phase tracking and update-error reporting that preserves the original exception; verify phase and stack details in unit tests

## 2. Runtime integration

- [ ] 2.1 `C048-T003` Instrument the existing browser update loop with the monitor and named phases without creating a second loop; verify the app still builds
- [ ] 2.2 `C048-T004` Emit throttled healthy heartbeat records and actionable missed-heartbeat diagnostics; verify the browser console shows recurring heartbeats during play

## 3. Lockup diagnosis verification

- [ ] 3.1 `C048-T005` Add a regression test proving detector logging remains bounded and does not recurse or synchronously wait; verify the focused test passes
- [ ] 3.2 `C048-T006` Run a browser smoke test with all current character updates and green-collider physics enabled, confirming heartbeats continue and no new console errors occur
