# character-perception-debug-rendering Specification

## Purpose

Makes centralized Character Perception visible during Collider mode so developers can inspect each detector's grid-relative Visual and Audio Perception and see active detection locations.

## Requirements

### Requirement: Collider mode renders all detector perception
When Collider mode is enabled, the debug view SHALL render perception indicators for every living registered detector using its current grid location, facing, and configured ranges. When Collider mode is disabled, these indicators SHALL not render.

#### Scenario: Collider mode enabled
- **WHEN** the player enables Collider mode
- **THEN** all living registered detectors show their Visual and Audio Perception indicators

#### Scenario: Collider mode disabled
- **WHEN** Collider mode is disabled
- **THEN** perception indicators are absent from the debug view

### Requirement: Visual and Audio indicators use distinct centered squares
Each Visual perception grid spot SHALL be represented by a centered square occupying 50% of the grid cell. Each Audio perception grid spot SHALL be represented by a centered square occupying 25% of the grid cell, rendered after Visual indicators so it appears on top. Both channels SHALL use purple fill at 40% opacity when inactive and 100% opacity while blinking. Visual opacity SHALL fade by range strength as 40%, 30%, 20%, and 10%.

#### Scenario: Inactive perception geometry
- **WHEN** a perception cell is not actively detecting the player
- **THEN** its channel-specific centered square uses the configured inactive fill

#### Scenario: Overlapping channels
- **WHEN** a grid spot belongs to both Visual and Audio Perception
- **THEN** both channel squares render independently with Audio on top

### Requirement: Active detection blinks visibly
When the centralized perception snapshot reports an active detection at a grid spot, the corresponding channel indicator SHALL blink between its inactive fill and active 100% purple fill at 0.2 seconds on and 0.1 seconds off while the detection remains present. Simultaneous detections SHALL blink independently.

#### Scenario: Player enters Visual Perception
- **WHEN** the player occupies a Visual Perception grid spot
- **THEN** that spot's Visual square blinks to 80% purple

#### Scenario: Player enters Audio Perception
- **WHEN** the player occupies an Audio Perception grid spot
- **THEN** that spot's Audio square blinks to 80% purple

#### Scenario: Player leaves perception
- **WHEN** the player leaves the relevant perception grid spot
- **THEN** its indicator returns to the inactive 40% purple fill

### Requirement: Debug rendering follows moving geometry
The debug visualization SHALL update when a detector changes grid location or Visual Perception facing, and SHALL use the canonical grid coordinate conversion for rendering.

#### Scenario: Detector changes facing
- **WHEN** a detector's cardinal facing changes
- **THEN** its Visual indicators move to the new facing line on the next debug render

#### Scenario: Detector changes grid cell
- **WHEN** a detector enters a new logical grid cell
- **THEN** both perception geometries are rendered relative to the new cell center
