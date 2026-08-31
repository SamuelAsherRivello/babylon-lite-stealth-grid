## ADDED Requirements

### Requirement: Living sheep remain mutually non-overlapping
Living sheep SHALL treat every other living sheep's movement collider as a dynamic blocker during route planning and movement. A sheep update SHALL NOT move its collider into overlap with another living sheep, including when multiple sheep attempt to enter the same space during one gameplay update.

#### Scenario: Flee route crosses another sheep
- **WHEN** a sheep plans or follows a flee route whose next position would overlap another living sheep
- **THEN** that position is rejected and the sheep chooses a safe separating route or stops before overlap

#### Scenario: Two sheep approach the same space
- **WHEN** two living sheep attempt movement that would make their movement colliders overlap during the same gameplay update
- **THEN** the update resolves their movement without allowing either final collider to overlap the other

#### Scenario: Dead sheep no longer blocks flock movement
- **WHEN** a sheep is no longer living
- **THEN** its collider does not participate in sheep-to-sheep movement blocking or contact reactions

### Requirement: Sheep contact triggers reciprocal bounce-and-separate behavior
When two living sheep touch because their current colliders are in contact or requested movement would cross into one another, both sheep SHALL stop their current routes, play one complete existing bounce animation while stationary, and then attempt escape routes whose initial directions are opposite and increase separation between the pair. Terrain collision, dynamic blockers, and map boundaries SHALL remain authoritative over the escape movement.

#### Scenario: Moving sheep touches an idle sheep
- **WHEN** a moving living sheep touches an idle living sheep
- **THEN** both sheep stop, each plays one complete bounce, and they then run in opposite separating directions

#### Scenario: Two moving sheep meet
- **WHEN** two living sheep moving toward one another would cross into overlap
- **THEN** neither crosses the other and both begin the reciprocal bounce-and-separate response

#### Scenario: Contact occurs near blocked terrain
- **WHEN** a sheep-to-sheep contact requests opposite escape directions but one or both directions are blocked by terrain, another living actor, or the map boundary
- **THEN** each sheep uses a safe route that increases pair separation when one exists, and any sheep without a safe route remains stationary without entering an obstacle or overlapping the other sheep

### Requirement: Sheep contact resolution is stable and deterministic
Sheep contact handling SHALL resolve coincident positions and simultaneous multi-sheep contacts using stable actor identity rather than update order or random frame timing. The same pair SHALL trigger at most one bounce-and-separate response per uninterrupted contact episode and SHALL become eligible for another response only after their movement colliders have separated.

#### Scenario: Two sheep begin coincident
- **WHEN** two living sheep have coincident collider centers at the start of a gameplay update
- **THEN** a stable identity-based fallback selects opposite separation directions and the pair begins one bounce-and-separate response

#### Scenario: Pair remains touching during bounce
- **WHEN** the same two sheep remain touching throughout their bounce animations
- **THEN** their existing contact episode does not restart or queue additional bounce reactions

#### Scenario: Separated sheep touch again
- **WHEN** two sheep have fully separated after a contact response and later touch again
- **THEN** the later touch starts a new reciprocal bounce-and-separate response

#### Scenario: One sheep touches multiple sheep simultaneously
- **WHEN** three or more living sheep form multiple contacts in the same gameplay update
- **THEN** all contact pairs are resolved in stable actor order and every affected sheep receives at most one newly started bounce response for that update
