## ADDED Requirements

### Requirement: Collider diagnostics render shared occupancy markers
Collider-mode diagnostics SHALL render the centralized small black occupancy X for every active gameplay entity using its current logical grid spot.

#### Scenario: Diagnostics are enabled
- **WHEN** Collider diagnostics are enabled
- **THEN** active characters, objects, pickups, projectiles, goals, and decorations each show one X at their logical cell center

#### Scenario: Diagnostics are disabled
- **WHEN** Collider diagnostics are disabled
- **THEN** occupancy X markers are absent
