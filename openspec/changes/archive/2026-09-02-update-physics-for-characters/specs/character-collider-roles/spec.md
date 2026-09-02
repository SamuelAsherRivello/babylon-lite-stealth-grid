## MODIFIED Requirements

### Requirement: Character collider roles are distinct
The player and enemies SHALL expose a green movement collider as a solid physics shape and a red combat collider as a separate trigger shape. Movement collision tests SHALL use only solid movement shapes; combat overlap tests SHALL use only combat trigger shapes.

#### Scenario: Movement colliders are routed to movement physics
- **WHEN** a character moves
- **THEN** its green movement shape SHALL participate in terrain and character separation, while its red combat shape SHALL be excluded from movement blocking

#### Scenario: Combat colliders are routed to combat events
- **WHEN** an attack checks targets
- **THEN** only the red trigger overlap SHALL determine candidate contact, subject to the existing combat rules
