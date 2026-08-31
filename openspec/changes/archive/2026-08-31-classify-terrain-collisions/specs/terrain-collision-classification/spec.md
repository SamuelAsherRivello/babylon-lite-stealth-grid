## Purpose

Provide an interactive terrain review surface where every atlas piece can be identified, provisionally classified, and tested against visible character collision.

## ADDED Requirements

### Requirement: Complete numbered terrain review
The system SHALL preserve all 54 terrain atlas positions in zero-based row-major order and SHALL render exactly one terrain instance for each non-empty frame. Empty atlas positions SHALL render no terrain instance while retaining their number in grey.

#### Scenario: Reviewing the terrain atlas
- **WHEN** the terrain review starts
- **THEN** identifiers 0 through 53 remain visible in their original positions, non-empty frames render once, and empty positions show only grey identifiers

### Requirement: Editable provisional walkability
The system SHALL maintain explicit, readily editable sets for empty, walkable, and non-walkable terrain frame numbers. Empty atlas positions SHALL be invalid tile spaces with no collider. The initial non-walkable classification SHALL mark visually apparent cliffs, rocks, and barriers as non-walkable pending user review.

#### Scenario: Inspecting an empty atlas position
- **WHEN** a displayed frame number is in the empty-frame classification
- **THEN** no terrain sprite or collider exists at that position and its identifier is grey

#### Scenario: Inspecting a provisionally blocked frame
- **WHEN** a displayed frame number is in the non-walkable classification
- **THEN** that terrain instance is treated as a blocked tile

#### Scenario: Inspecting a provisionally walkable frame
- **WHEN** a displayed frame number is not in the non-walkable classification
- **THEN** that terrain instance does not block character movement

#### Scenario: Inspecting a partially walkable frame
- **WHEN** a displayed frame number has a custom collision polygon
- **THEN** only the polygonal portion of that terrain instance blocks character movement

### Requirement: Terrain collision bounds
Each fully non-walkable terrain instance SHALL use its complete 64 px by 64 px tile bounds. Frame 39 SHALL be fully walkable. Frame 48 SHALL use a triangular collider formed by its upper-left, lower-right, and lower-left corners, leaving its upper-right half walkable.

#### Scenario: Character attempts to enter blocked terrain
- **WHEN** the character collider would overlap a non-walkable terrain tile
- **THEN** movement SHALL not place the character collider inside that tile

### Requirement: Character collider
The character SHALL have a circular body collider with radius 26 px centered at local sprite-frame coordinates 93 px by 126 px, aligned with the rendered sprite frame as its animation changes or faces either direction.

#### Scenario: Character collider is displayed
- **WHEN** the 192 px by 144 px character frame is rendered
- **THEN** its collider has a 52 px diameter and remains centered on the character body

#### Scenario: Moving horizontally into a diagonal collider
- **WHEN** the circular character collider moves horizontally into a diagonal polygon edge
- **THEN** collision resolution SHALL push the character along the polygon's outward diagonal normal

### Requirement: Collision-aware directional movement
The character SHALL remain within the playfield and SHALL resolve horizontal and vertical movement independently so unobstructed movement can continue along a blocked tile edge.

#### Scenario: Moving diagonally into an obstacle edge
- **WHEN** one component of diagonal movement would collide and the other component is unobstructed
- **THEN** the blocked component is rejected and the unobstructed component is applied

### Requirement: Always-visible collision diagnostics
The terrain collider bounds and the current character collider bounds SHALL remain visibly distinguishable while the terrain classification is being reviewed.

#### Scenario: Reviewing collision bounds during movement
- **WHEN** the character moves through the terrain review
- **THEN** the character collider follows the character and every blocked-tile collider remains visibly overlaid on its tile
