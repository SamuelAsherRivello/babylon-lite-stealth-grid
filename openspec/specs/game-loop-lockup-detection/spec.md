# game-loop-lockup-detection Specification

## Purpose

Provides reliable, human-readable runtime evidence when the game loop stops advancing, so gameplay lockups can be diagnosed from the browser console instead of inferred from missing movement.

## Requirements

### Requirement: Report healthy game-loop progress

The running game SHALL emit a throttled heartbeat containing a timestamp or elapsed time, the most recently completed update phase, and enough runtime state to identify whether character updates are enabled.

#### Scenario: Healthy loop

- **WHEN** the game loop continues to advance during normal play
- **THEN** the console receives recurring heartbeat records at a bounded interval
- **AND** each record identifies the latest completed update phase

### Requirement: Detect a missed heartbeat

The runtime SHALL report a lockup diagnostic when no update progress is observed within a configurable deadline, and the diagnostic SHALL identify the last heartbeat time and last known update phase.

#### Scenario: Update loop stalls

- **WHEN** the configured heartbeat deadline passes without a completed update
- **THEN** the console reports that a game-loop lockup is suspected
- **AND** the report includes the last known phase and elapsed time since progress

### Requirement: Preserve runtime error evidence

The runtime SHALL record uncaught errors occurring during the game update path with their message and stack, without hiding or replacing the original exception behavior.

#### Scenario: Update throws

- **WHEN** an update phase throws an exception
- **THEN** the console reports the phase and exception details as lockup-relevant evidence
- **AND** the original exception remains observable to the browser error system

### Requirement: Avoid detector-induced lockups

The detector SHALL use bounded work and SHALL NOT synchronously wait, recursively retry updates, or create an additional animation loop.

#### Scenario: Detector observes a bad frame

- **WHEN** the update path is stalled or throws
- **THEN** detector work remains bounded and the detector does not block future browser diagnostics
