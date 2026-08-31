## MODIFIED Requirements

### Requirement: Enemy content has a stable organization
The system SHALL organize each enemy type beneath an `enemies/<type>/`
boundary and SHALL keep that type's behavior, state, and asset descriptors
together without coupling them to player modules. Each enemy type SHALL retain
a stable character identity across Tiled map or spawner data, actor factory
selection, and runtime lifecycle management.

#### Scenario: Adding a second enemy type
- **WHEN** a developer adds an enemy other than the goblin
- **THEN** the new type can be added under its own enemy folder while reusing
  the common enemy actor contract

#### Scenario: Selecting an enemy from authored map data
- **WHEN** Tiled map or spawner data names a supported enemy character identity
- **THEN** the matching enemy type is created without replacing or changing
  another supported enemy type

