## ADDED Requirements

### Requirement: Perception uses universal entity occupancy
Character perception registration, detection, and reported cells SHALL use each entity's shared quantized logical grid spot.

#### Scenario: Character moves across a midpoint
- **WHEN** a registered character's live center crosses the configured grid midpoint
- **THEN** perception uses the new logical spot on the next query without independently recalculating a conflicting cell
