## Purpose

Provides deterministic physics-backed separation for character movement while allowing combat sensors to overlap safely.

## ADDED Requirements

### Requirement: Solid movement colliders cannot overlap
Every living player, enemy, and moving NPC SHALL use a non-trigger movement collider that participates in physics collision resolution with terrain and other living character movement colliders.

#### Scenario: Two characters approach each other
- **WHEN** two living characters move toward the same space
- **THEN** physics SHALL block or separate their movement so their movement colliders do not overlap after a physics step

#### Scenario: Characters begin in an invalid overlapping state
- **WHEN** a character is spawned or restored with an overlapping movement collider
- **THEN** physics SHALL recover the bodies to a non-overlapping state without stopping the game loop

### Requirement: Combat colliders are overlap-permitting triggers
Every combat collider SHALL be represented as a trigger that reports overlap events but does not block, push, or separate movement bodies.

#### Scenario: Attack reaches a target
- **WHEN** a combat trigger overlaps a valid target during an attack
- **THEN** the combat system SHALL receive an overlap event and apply its existing hit rules

#### Scenario: Combat trigger overlaps a movement body
- **WHEN** a red combat collider overlaps a green movement collider
- **THEN** neither movement body SHALL be displaced or blocked by the combat collider

### Requirement: Physics roles remain visually inspectable
Debug rendering SHALL draw green movement geometry from the physical movement collider and red combat geometry from the trigger collider.

#### Scenario: Collider diagnostics are enabled
- **WHEN** collider diagnostics are visible
- **THEN** green geometry SHALL identify solid movement shapes and red geometry SHALL identify overlap-permitting combat triggers

### Requirement: Physics failure cannot freeze gameplay
The runtime SHALL bound physics stepping and collision resolution work so a malformed body, invalid overlap, or excessive contact set cannot lock the gameplay update loop.

#### Scenario: Physics resolution exceeds its configured work budget
- **WHEN** physics cannot resolve contacts within its configured iteration or timestep budget
- **THEN** the runtime SHALL continue rendering and report the affected body identifiers for diagnosis
