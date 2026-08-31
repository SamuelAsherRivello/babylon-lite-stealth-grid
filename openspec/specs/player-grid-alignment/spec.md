# Player Grid Alignment Specification

## Purpose

Provide gentle, collision-safe grid alignment during cardinal player movement while preserving intentional diagonal movement and existing forced-motion behavior.

## Requirements

### Requirement: Cardinal movement classification
The game SHALL classify non-zero player input as cardinal when the absolute off-axis component is no more than 10% of the absolute main-axis component. Input outside that tolerance SHALL be treated as diagonal.

#### Scenario: Keyboard cardinal input qualifies
- **WHEN** the player holds exactly one movement direction on the keyboard
- **THEN** the game classifies the movement as cardinal in that direction

#### Scenario: Near-cardinal analog input qualifies
- **WHEN** analog movement has a non-zero main-axis component and an off-axis component no greater than 10% of it
- **THEN** the game classifies the movement as cardinal on the main axis

#### Scenario: Analog diagonal input remains free
- **WHEN** the analog off-axis component is greater than 10% of the main-axis component
- **THEN** the game treats the movement as diagonal and applies no grid-centering correction

### Requirement: Orthogonal grid-centering assistance
During cardinal movement, the game SHALL smoothly move the center of the player's collision footprint toward the center of its current grid column for vertical movement or current grid row for horizontal movement. From the offset present when cardinal movement begins, an unobstructed correction SHALL complete in approximately 0.2 seconds without changing the player's requested main-axis travel.

#### Scenario: Vertical movement corrects horizontal drift
- **WHEN** cardinal up or down movement begins while the player's collision center is horizontally offset from its current grid column center
- **THEN** the player continues in the requested vertical direction while easing horizontally to that column center in approximately 0.2 seconds

#### Scenario: Horizontal movement corrects vertical drift
- **WHEN** cardinal left or right movement begins while the player's collision center is vertically offset from its current grid row center
- **THEN** the player continues in the requested horizontal direction while easing vertically to that row center in approximately 0.2 seconds

#### Scenario: Already-centered movement needs no correction
- **WHEN** cardinal movement begins with the player's collision center already at the applicable grid center
- **THEN** the player moves only in the requested direction without orthogonal displacement

#### Scenario: Input change cancels the active correction
- **WHEN** input becomes diagonal, becomes zero, or changes to the other movement axis during an active correction
- **THEN** the game immediately stops that correction and derives any later correction from the new current position and input

### Requirement: Movement-priority preservation
The game SHALL keep player grid alignment subordinate to collision constraints and qualifying player intent. Grid alignment SHALL use the same collision and playfield constraints as ordinary player movement and SHALL not run while knockback or another overriding programmatic movement effect controls the player.

#### Scenario: Collider blocks grid centering
- **WHEN** an alignment displacement would overlap blocking terrain, a dynamic character collider, or the playfield boundary
- **THEN** the blocked displacement is rejected or resolved by the normal collision rules without moving the player through the constraint

#### Scenario: Diagonal intent overrides quantization
- **WHEN** the player changes from cardinal input to diagonal input
- **THEN** diagonal movement takes effect immediately and no residual alignment displacement is applied

#### Scenario: Knockback suspends quantization
- **WHEN** knockback controls the player's movement
- **THEN** the game applies the existing knockback behavior without a grid-centering correction

#### Scenario: Input is reevaluated after knockback
- **WHEN** knockback ends
- **THEN** the game starts a new alignment only if the player's current input qualifies as cardinal at that time
