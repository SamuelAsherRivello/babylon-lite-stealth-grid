## Context

The application has a single browser-driven update loop and existing character-specific watchdog telemetry. The new detector should diagnose the whole loop, not infer a cause from green-collider overlap and not perform physics correction.

## Goals / Non-Goals

**Goals:**

- Make healthy progress visible in the console.
- Identify the last completed phase when progress stops.
- Surface thrown exceptions with phase context.
- Keep the detector safe to leave enabled during development.

**Non-Goals:**

- Recovering or restarting a stalled game loop.
- Changing character movement, collision, or AI behavior.
- Treating collider overlap as proof of a lockup.

## Decisions

- Use one lightweight liveness monitor around the existing loop. This preserves the single-loop architecture and gives a direct signal of progress.
- Track named phases around major update sections. A phase label is more actionable than a generic heartbeat because it narrows the failing subsystem without assuming the cause.
- Use a deadline-based timer for missed progress and throttled console output for healthy progress. This provides evidence while avoiding per-frame log volume.
- Record errors at the loop boundary and rethrow them. Swallowing errors would make the game appear quiet while hiding the actual defect.
- Keep the detector injectable/configurable in tests so stalled-heartbeat and error scenarios can be verified without waiting in real time.

## Risks / Trade-offs

- [Risk] A long browser pause or debugger breakpoint may look like a lockup. → Use a configurable deadline and label the report as suspected rather than confirmed.
- [Risk] Console output can affect timing during diagnosis. → Throttle healthy heartbeats and emit detailed output only on missed deadlines/errors.
- [Risk] Error reporting can duplicate browser console output. → Add phase context while preserving the original exception and avoid repeated reporting for the same error.

## Migration Plan

Enable the detector in the existing development runtime, verify it in a browser smoke test, and leave gameplay systems unchanged. If diagnostics are too noisy, adjust the interval/deadline configuration without changing character or physics code.
