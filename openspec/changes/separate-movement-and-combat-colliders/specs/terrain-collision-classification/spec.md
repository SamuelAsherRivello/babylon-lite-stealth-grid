## MODIFIED Requirements

### Requirement: Character collider
The character SHALL have a circular movement collider with radius 18.2 px centered at local sprite-frame coordinates 93 px by 126 px, aligned with the rendered sprite frame as its animation changes or faces either direction. This movement collider SHALL govern terrain collision independently of the character's rectangular combat collider.

#### Scenario: Character collider is displayed
- **WHEN** the 192 px by 144 px character frame is rendered
- **THEN** its movement collider has a 36.4 px diameter and remains centered on the character body

#### Scenario: Moving horizontally into a diagonal collider
- **WHEN** the circular movement collider moves horizontally into a diagonal polygon edge
- **THEN** collision resolution SHALL push the character along the polygon's outward diagonal normal

### Requirement: Always-visible collision diagnostics
The terrain collider bounds and both current character collider roles SHALL remain visibly distinguishable while the terrain classification is being reviewed. Character combat colliders SHALL be red, and character movement colliders SHALL be green and rendered after combat colliders so movement geometry appears on top where they overlap.

#### Scenario: Reviewing collision bounds during movement
- **WHEN** the character moves through the terrain review
- **THEN** both character colliders follow the character, its red combat collider is drawn before its green movement collider, and every blocked-tile collider remains visibly overlaid on its tile
