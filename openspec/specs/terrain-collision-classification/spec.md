# Terrain Collision Classification Specification

## Purpose

Provide an interactive terrain review surface where every atlas piece can be identified, provisionally classified, and tested against visible character collision.

## Requirements

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
Each fully non-walkable terrain instance SHALL use its complete 64 px by 64 px tile bounds. Partially walkable terrain frames SHALL use the canonical triangle or edge collider geometry authored in `Tilemap_color3.tsj`; frame 48 SHALL use a triangular collider formed by its upper-left, lower-right, and lower-left corners, leaving its upper-right half walkable.

#### Scenario: Character attempts to enter blocked terrain
- **WHEN** the character collider would overlap a non-walkable portion of a terrain tile
- **THEN** movement SHALL not place the character collider inside that blocked geometry

### Requirement: Character collider
The character SHALL have a circular body collider with radius 18.2 px centered at local sprite-frame coordinates 93 px by 126 px, aligned with the rendered sprite frame as its animation changes or faces either direction.

#### Scenario: Character collider is displayed
- **WHEN** the 192 px by 144 px character frame is rendered
- **THEN** its collider has a 36.4 px diameter and remains centered on the character body

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

### Requirement: Canonical authored terrain collider geometry
`Tilemap_color3.tsj` SHALL retain collision only on tile frames that already contain collider objects. Each retained collider SHALL be represented as an exact 64 by 64 full-tile rectangle, an exact three-corner triangle covering half the tile, or one or more exact 4-pixel full-length rectangles on the left, right, top, or bottom tile edges. Multiple edge rectangles SHALL remain separate and MAY overlap at tile corners.

#### Scenario: Existing full-tile collider is normalized
- **WHEN** an existing collider represents the complete tile
- **THEN** it occupies exactly `x: 0`, `y: 0`, `width: 64`, and `height: 64`

#### Scenario: Existing triangular collider is normalized
- **WHEN** an existing collider represents half of the tile diagonally
- **THEN** its polygon has exactly three vertices at tile corners and covers exactly half of the 64 by 64 tile in the existing orientation

#### Scenario: Existing edge colliders are normalized
- **WHEN** a tile has collider rectangles representing one or more borders
- **THEN** each detected side is represented by its own 4-pixel-thick rectangle spanning that complete side, with corner overlap allowed

#### Scenario: Collider-free tile remains collider-free
- **WHEN** a tile has no collider objects before quantization
- **THEN** quantization adds no object group or collider object to that tile

### Requirement: Ambiguous collider intent blocks mutation
The tileset SHALL NOT be modified until every existing nonzero collider can be classified from its geometry and confirmed against the corresponding tile artwork. A geometry-artwork conflict or uncertain category or orientation SHALL be reported by tile ID for user resolution.

#### Scenario: Existing geometry and artwork disagree
- **WHEN** the apparent collider category or orientation conflicts with the corresponding tile artwork
- **THEN** the tileset remains unchanged and the conflicting tile ID is reported for user input

### Requirement: Collider metadata and scope preservation
Quantization SHALL update existing collider geometry in place, SHALL preserve collider object IDs and non-geometry metadata, SHALL remove zero-area rectangle collider objects that have no polygon geometry, and SHALL leave sibling tilesets and unrelated tileset data unchanged. Polygon objects SHALL be evaluated from their vertices rather than their zero-valued Tiled rectangle dimensions.

#### Scenario: Existing collider is quantized
- **WHEN** an existing nonzero collider has a confirmed canonical interpretation
- **THEN** only its geometry fields change and its ID and non-geometry metadata remain intact

#### Scenario: Zero-area rectangle collider artifact is encountered
- **WHEN** an existing non-polygon rectangle collider object has zero width or zero height
- **THEN** that object is removed without changing the tile's remaining valid colliders

#### Scenario: Polygon carries zero rectangle dimensions
- **WHEN** a polygon collider has three distinct vertices with nonzero polygon area and Tiled stores zero in its rectangle width and height fields
- **THEN** the polygon is retained and quantized from its vertices

#### Scenario: Quantization completes
- **WHEN** the edited TSJ is validated
- **THEN** it parses as strict JSON, contains only canonical in-bounds collider geometry, contains no zero-area rectangle collider objects, and has not changed collider membership for any previously collider-free tile
