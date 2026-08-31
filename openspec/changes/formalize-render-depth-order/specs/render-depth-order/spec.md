## Purpose

Provides a stable, extensible visual-depth contract so game layers and user-interface overlays render in an intentional order as new content is added.

## ADDED Requirements

### Requirement: Game depth uses category bands and TileMap sub-depths
The system SHALL assign game-rendered content to documented category depth bands, and the TileMap SHALL provide a base depth with ordered sub-depths for its visual sublayers.

#### Scenario: TileMap sublayers render in authored order
- **WHEN** multiple TileMap visual sublayers overlap at the same screen position
- **THEN** their sub-depths determine their order within the TileMap band

#### Scenario: New game content receives a reserved band
- **WHEN** a new game-rendered category is added
- **THEN** it SHALL use an available documented depth band without changing unrelated category depths

### Requirement: Persistent UI renders above game content
The system SHALL render the coordinate guide, coordinates widget, version/build metadata, settings gear, and virtual controller above all Babylon game content and diagnostics.

#### Scenario: Persistent UI overlaps game artwork
- **WHEN** persistent UI and game artwork occupy the same screen region
- **THEN** the persistent UI SHALL remain visually on top and interactive controls SHALL remain usable

### Requirement: Settings overlay renders above persistent UI
When open, the settings backdrop and settings window SHALL render above all persistent UI and Babylon content, with the settings controls above the backdrop.

#### Scenario: Settings menu is open
- **WHEN** the user opens the settings menu
- **THEN** the backdrop and settings window SHALL obscure or supersede lower layers, and the settings controls SHALL be interactable

### Requirement: Projectile and effect ordering remains deferred
The system SHALL reserve depth capacity for projectiles and gameplay effects without requiring a final ordering between those categories.

#### Scenario: Projectile/effect relationship is undecided
- **WHEN** a projectile or gameplay effect is added before that relationship is decided
- **THEN** its placement SHALL remain within the reserved projectiles/effects range and SHALL NOT establish a permanent cross-category ordering contract
