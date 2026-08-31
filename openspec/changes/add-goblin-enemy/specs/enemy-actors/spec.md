## Purpose

Defines a reusable enemy actor contract so individual enemy types share
predictable state, animation, movement, update, and cleanup behavior.

## ADDED Requirements

### Requirement: Enemy content has a stable organization
The system SHALL organize each enemy type beneath an `enemies/<type>/`
boundary and SHALL keep that type's behavior, state, and asset descriptors
together without coupling them to player modules.

#### Scenario: Adding a second enemy type
- **WHEN** a developer adds an enemy other than the goblin
- **THEN** the new type can be added under its own enemy folder while reusing
  the common enemy actor contract

### Requirement: Enemy locomotion uses explicit states
An enemy actor SHALL expose `idle`, `walking`, and `attacking` states and SHALL
select `idle` or `walking` from its requested movement while it is not
attacking.

#### Scenario: Movement begins
- **WHEN** a non-attacking enemy receives non-zero requested movement
- **THEN** it transitions to `walking` and plays its walking animation

#### Scenario: Movement stops
- **WHEN** a non-attacking enemy receives zero requested movement
- **THEN** it transitions to `idle` and plays its idle animation

### Requirement: Attacks are atomic
An enemy actor SHALL reject a new attack while already attacking, SHALL lock
locomotion for the duration of the attack animation, and SHALL return to
`idle` or `walking` when that animation completes.

#### Scenario: Attack completes with movement requested
- **WHEN** an attack animation completes and requested movement is non-zero
- **THEN** the enemy transitions to `walking`

#### Scenario: Repeated attack request
- **WHEN** an attack is requested while the enemy is already attacking
- **THEN** the current attack continues without restarting

### Requirement: Enemy resources have a complete lifecycle
The system SHALL update all spawned enemies through the game loop and SHALL
stop their animations, remove their sprite resources, and release their
listeners or callbacks when they are disposed.

#### Scenario: Enemy disposal
- **WHEN** an enemy is removed from the active game
- **THEN** it no longer updates or renders and retains no active animation

