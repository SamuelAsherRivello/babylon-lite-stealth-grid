## ADDED Requirements

### Requirement: AI decisions use shared logical spots
AI movement, adjacency, patrol, perception reaction, and bush interaction decisions SHALL use the shared logical grid spot for each relevant entity.

#### Scenario: Moving actor is near a cell transition
- **WHEN** an actor's live center has not crossed the midpoint into the next spot
- **THEN** AI treats it as occupying the current logical spot

#### Scenario: Moving actor crosses a cell transition
- **WHEN** an actor's live center crosses the midpoint into the next spot
- **THEN** AI treats it as occupying the new logical spot
