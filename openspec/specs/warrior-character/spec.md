# Warrior Character Specification

## Purpose

Defines a complete Tiny Swords Warrior enemy whose full supplied animation set
is available through a stable Tiled-authored spawn identity.

## Requirements

### Requirement: Warrior uses every supplied animation sheet
The Warrior SHALL provide an eight-frame looping `idle` animation, a six-frame
looping `walking` animation, four-frame non-looping `attack-1` and `attack-2`
animations, and a six-frame guard animation from the supplied 192 by 192 frame
sheets. Runtime rendering SHALL preserve nearest-neighbor sampling.

#### Scenario: Warrior is created
- **WHEN** a Warrior spawns without movement or an action request
- **THEN** it appears in the idle state and loops all eight idle frames

#### Scenario: Warrior animation inventory is inspected
- **WHEN** the runtime catalog is validated
- **THEN** idle, walking, attack-1, attack-2, and guard are all present with
  their supplied frame counts

### Requirement: Warrior actions are explicit and complete
The Warrior SHALL expose both attack variants and guard as distinct actions,
SHALL lock locomotion during a non-looping attack, and SHALL return to idle or
walking after the attack completes. A gameplay controller MAY choose which
attack or when to guard without changing the animation catalog. In addition,
each living Warrior SHALL evaluate incoming arrows using tuneable defense
settings, SHALL automatically enter guard for exactly 0.25 seconds when an
eligible arrow is approaching and the defense attempt succeeds, and SHALL face
toward the incoming arrow. Automatic arrow defense SHALL take priority over
locomotion and attack actions for the defense interval. The initial settings
SHALL be intentionally generous so that defense succeeds for most eligible
incoming arrows during playtesting.

#### Scenario: Alternate attack is requested
- **WHEN** a controller requests Attack 2 while the Warrior is not attacking or automatically defending
- **THEN** the Warrior plays Attack 2 once and retains its horizontal facing

#### Scenario: Guard is requested
- **WHEN** a controller enables guard
- **THEN** the Warrior displays the guard animation until guard is released or superseded by an allowed action

#### Scenario: Eligible arrow approaches
- **WHEN** a living Warrior detects an arrow traveling toward its combat area within the configured reaction window and the configured defense attempt succeeds
- **THEN** the Warrior faces the arrow, immediately displays guard for 0.25 seconds, and does not move or attack during that interval

#### Scenario: Arrow is nearby but moving away
- **WHEN** an arrow is inside the configured proximity area but its trajectory is not approaching the Warrior's combat area
- **THEN** the arrow does not trigger automatic guard

#### Scenario: Automatic defense ends
- **WHEN** 0.25 seconds have elapsed since automatic guard began
- **THEN** the Warrior returns to the locomotion state appropriate to its current movement intent

#### Scenario: Defense tuning is changed
- **WHEN** the defense chance or reaction-window setting is adjusted before creating a Warrior
- **THEN** that Warrior uses the adjusted setting when deciding whether and when to defend

### Requirement: Warrior participates in the enemy lifecycle
The Warrior SHALL use the shared enemy movement, collision, combat, health,
depth, pause, update, and disposal contracts to the same observable standard
as the goblin enemy.

#### Scenario: Warrior is disposed
- **WHEN** a Warrior is removed from the active game
- **THEN** it no longer updates or renders and retains no active animation

### Requirement: Tiled data can select the Warrior
The map/spawner data contract SHALL accept a stable `warrior` character
identity and SHALL construct a Warrior at the authored position without source
code changes. Existing goblin identity and maps SHALL remain compatible.

#### Scenario: Warrior spawner is authored in Tiled
- **WHEN** the authored Warrior spawner identifies its character as `warrior`
- **THEN** the game creates a minimum and maximum of one Warrior at grid
  location `05,09`

#### Scenario: Existing goblin map is loaded
- **WHEN** existing map or spawner data identifies the goblin
- **THEN** goblin construction and behavior remain unchanged
