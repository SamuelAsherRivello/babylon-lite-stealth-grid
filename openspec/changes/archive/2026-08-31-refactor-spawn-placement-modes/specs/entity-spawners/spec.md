## MODIFIED Requirements

### Requirement: Generic spawner configuration
The system SHALL represent each spawner as one spawn position, exactly one actor/item identity, an explicit spawn mode, a non-negative maximum spawn distance in grid cells, an inclusive minimum population, an inclusive maximum population, and a positive check interval measured in seconds. The spawn mode SHALL be `nearby` or `anywhere-walkable`; nearby placement SHALL use Chebyshev grid distance and anywhere-walkable placement SHALL search the level's walkable cells. The default check interval SHALL be one second when no interval is supplied, and the minimum population SHALL NOT exceed the maximum population.

#### Scenario: Default interval
- **WHEN** a spawner is configured without a check interval
- **THEN** it checks its owned population every one second

#### Scenario: Configured interval
- **WHEN** a spawner is configured with a valid interval of N seconds
- **THEN** it checks its owned population every N seconds

#### Scenario: Nearby placement configuration
- **WHEN** a spawner is configured with nearby mode and maximum distance N
- **THEN** candidate cells are limited to Chebyshev distance N or less from its cell

#### Scenario: Anywhere placement configuration
- **WHEN** a spawner is configured with anywhere-walkable mode
- **THEN** candidate cells can come from any walkable location on the level

#### Scenario: Invalid placement configuration
- **WHEN** a spawner has an unsupported mode or a negative, non-finite, or non-integer maximum distance
- **THEN** the system rejects the configuration with a clear error

#### Scenario: Invalid population range
- **WHEN** a spawner is configured with a negative population value or a minimum greater than its maximum
- **THEN** the system rejects the configuration with a clear error

### Requirement: Initial hardcoded spawners
The system SHALL replace direct startup creation with a player spawner at the current player position configured as minimum one, maximum one, nearby mode, and maximum distance zero; a sheep spawner at the current sheep position configured as minimum two, maximum two, nearby mode, and maximum distance three; and enemy spawners at their authored goblin and warrior positions configured as minimum one, maximum one, nearby mode, and maximum distance three. Each SHALL initially use the default one-second check interval.

#### Scenario: Initial level evaluation
- **WHEN** the current hardcoded level starts
- **THEN** it immediately contains one player and immediately evaluates the sheep, goblin, and warrior spawners for gradual randomized population

#### Scenario: Player remains unique
- **WHEN** the player spawner already owns one living player
- **THEN** subsequent checks do not create another player
