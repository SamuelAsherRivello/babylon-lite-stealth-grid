## Purpose

Make entering bush cover produce a brief gravity movement toward its center while allowing the player to leave freely after arrival.

## ADDED Requirements

### Requirement: Minimum distance gates gravity movement
The system SHALL define **minimum distance** as 0.75 of the configured grid width and SHALL start gravity only when the player center is strictly closer than this distance to the bush center while overlapping its hiding collider. An unconsumed entry SHALL remain eligible as the player approaches within the collider. The comparison SHALL use Euclidean X/Y distance.

#### Scenario: Approach from outside the minimum distance
- **WHEN** the player overlaps a bush but is at least 0.75 of the grid width from its center
- **THEN** gravity does not start and movement remains available
- **AND** moving strictly closer than that distance starts the pull if the entry has not been consumed

#### Scenario: Grid width changes
- **WHEN** the configured grid width changes
- **THEN** minimum distance remains equal to 0.75 of that width

### Requirement: Bush entry pulls the player to the interaction center
When a living player overlaps a living bush's hiding collider with an armed entry trigger and satisfies the minimum distance check, the system SHALL move the player's world center in X and Y to the bush's interaction collider center over 0.125 seconds of active gameplay time unless interrupted as specified below. Movement SHALL accelerate toward the destination, end exactly at the center, and never overshoot. Existing overlap-based hiding and its visual feedback SHALL continue during the pull.

#### Scenario: Off-center entry
- **WHEN** the player enters an armed bush with both coordinates offset from its center
- **THEN** both coordinates move continuously toward the bush's interaction center
- **AND** the player reaches that exact center at 0.125 seconds, followed by a 0.25-second movement control hold
- **AND** hiding is active from overlap entry rather than delayed until arrival

#### Scenario: Frame duration varies or gameplay pauses
- **WHEN** frame durations vary or gameplay pauses during the pull
- **THEN** progress uses accumulated active gameplay time and clamps to the exact destination on completion
- **AND** paused time does not advance the pull

#### Scenario: Entry at the center
- **WHEN** an eligible player is already at the bush's exact center
- **THEN** the entry is consumed without displacement or an unnecessary movement lock

### Requirement: Movement input resumes after gravity movement
The system SHALL ignore keyboard and virtual joystick locomotion during gravity movement and for 0.25 seconds of active gameplay time after arrival while continuing to track their current input state. After the hold it SHALL remove only the gravity movement lock; existing action and lifecycle restrictions SHALL remain authoritative.

#### Scenario: Held direction through arrival
- **WHEN** the player holds a keyboard direction or joystick displacement during the pull
- **THEN** the input cannot steer or cancel the pull
- **AND** movement can resume on the next movement update after the 0.25-second hold without releasing and pressing again

#### Scenario: Released input during the pull
- **WHEN** the player releases movement before arrival
- **THEN** the player remains at the destination after the pull unless new movement or another gameplay effect occurs

### Requirement: A bush rearms only after full collider exit
The system SHALL consume the selected bush's trigger when a pull begins and SHALL rearm it only after the player's hiding collider no longer overlaps that bush's hiding collider. Moving away from the center within the same collider SHALL NOT start another pull. The system SHALL run at most one pull at a time and SHALL NOT queue pulls for overlaps acquired during an active pull.

#### Scenario: Leave the center while still inside the bush
- **WHEN** the player moves away after arrival but remains overlapping that bush
- **THEN** movement remains available and no new pull begins

#### Scenario: Exit and return
- **WHEN** the player fully leaves a bush's hiding collider and later re-enters it
- **THEN** that bush starts a new 0.125-second gravity movement

#### Scenario: Multiple bushes overlap
- **WHEN** multiple armed bushes become eligible on the same entry update
- **THEN** one is selected deterministically
- **AND** arrival does not cause a queued or automatic second pull while the same overlaps persist

### Requirement: Interrupted gravity movement releases its own lock
If the player dies, the target bush becomes unavailable, the level resets, blocking geometry prevents the pull, or knockback takes control, the system SHALL cancel the pull and remove its temporary locomotion lock. Cancellation SHALL NOT teleport the player to the destination, grant immunity, or override other movement restrictions. An interrupted bush entry SHALL remain consumed until collider exit, except when reset discards that state.

#### Scenario: Centering path is blocked
- **WHEN** a blocking collider prevents gravity movement from advancing along its path
- **THEN** the player stays at the last reachable position and the pull is cancelled
- **AND** ordinary movement is available subject to existing restrictions without waiting for another pull

#### Scenario: Bush disappears or player dies
- **WHEN** the target bush ceases to be alive or the player dies during the pull
- **THEN** gravity movement stops and its own lock is released
- **AND** the normal hiding or death behavior applies

#### Scenario: Knockback interrupts the pull
- **WHEN** the player receives knockback during gravity movement
- **THEN** knockback takes precedence and the pull is cancelled
- **AND** it does not restart while the player remains in the same bush overlap

#### Scenario: Level resets
- **WHEN** the level resets during a pull
- **THEN** the new player has no stale gravity movement lock, destination, or consumed entry state



