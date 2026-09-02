## Why

The game can stop producing frames while the browser remains open, making a gameplay lockup difficult to distinguish from a rendering or input problem. A bounded runtime detector is needed now so every stall produces timestamped console evidence, including the last completed update phase and any captured exception.

## What Changes

- Add a development-time game-loop liveness detector that expects periodic heartbeat progress.
- Log regular heartbeat status while the loop is healthy, including elapsed time and the current update phase.
- Report a lockup when the heartbeat deadline is missed, with the last heartbeat, phase, and character/update context.
- Capture uncaught update errors with a clear lockup diagnosis while preserving the original error for normal debugging.
- Keep detection bounded and observational; it must never attempt an unbounded recovery loop or create a second game loop.
- Add automated coverage and a browser smoke check proving healthy heartbeats and actionable stalled-loop diagnostics.

## Capabilities

### New Capabilities

- `game-loop-lockup-detection`: Observable heartbeat and stalled-loop diagnostics for the running game.

### Modified Capabilities


## Impact

Affected runtime update-loop instrumentation in `src/main.js`, a small diagnostic module under `src/gameplay/`, and automated/browser verification. No new runtime dependency is required and gameplay behavior is unchanged when the loop is healthy.
