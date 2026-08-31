## ADDED Requirements

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

## MODIFIED Requirements

### Requirement: Terrain collision bounds
Each fully non-walkable terrain instance SHALL use its complete 64 px by 64 px tile bounds. Partially walkable terrain frames SHALL use the canonical triangle or edge collider geometry authored in `Tilemap_color3.tsj`; frame 48 SHALL use a triangular collider formed by its upper-left, lower-right, and lower-left corners, leaving its upper-right half walkable.

#### Scenario: Character attempts to enter blocked terrain
- **WHEN** the character collider would overlap a non-walkable portion of a terrain tile
- **THEN** movement SHALL not place the character collider inside that blocked geometry
