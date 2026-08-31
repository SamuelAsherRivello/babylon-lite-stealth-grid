## ADDED Requirements

### Requirement: Goblin patrol decisions may select environmental mischief
At each new patrol decision, after resolving any eligible player or sheep attack, the initial goblin SHALL use its configured deterministic random source to select bush burning with a 25 percent probability. A failed roll SHALL continue normal patrol selection. Bush burning SHALL NOT interrupt an active attack, recovery, or patrol route.

#### Scenario: Mischief roll succeeds
- **WHEN** the goblin reaches a new patrol decision with no eligible player or sheep attack and the configured roll is below 0.25
- **THEN** it searches the entire logical map for a reachable living bush

#### Scenario: Mischief roll does not succeed
- **WHEN** the goblin reaches a new patrol decision and the configured roll is 0.25 or greater
- **THEN** it chooses its normal spawn-bounded patrol behavior without searching for a bush

#### Scenario: Combat target has priority
- **WHEN** an eligible player or sheep is in attack range at the same decision where bush burning could be selected
- **THEN** the goblin attacks that character without making a bush-burning roll

### Requirement: Goblin selects the nearest reachable living bush across the map
A goblin that selects bush burning SHALL consider every living bush on the logical map, regardless of its patrol home radius, and SHALL choose the bush with the shortest reachable cardinal route to a walkable cell adjacent to that bush. Stable bush snapshot order SHALL resolve equal route lengths. If no bush has a reachable adjacent cell, the goblin SHALL return to normal decision behavior.

#### Scenario: Distant bush is the only reachable target
- **WHEN** the only reachable living bush is outside the goblin's patrol home radius
- **THEN** the goblin routes toward an adjacent cell for that bush

#### Scenario: Nearest visible bush is unreachable
- **WHEN** one bush is geometrically nearer but has no reachable adjacent cell and another living bush has a reachable adjacent cell
- **THEN** the goblin selects the reachable bush

#### Scenario: No living bush is reachable
- **WHEN** the bush-burning search finds no living bush with a reachable adjacent cell
- **THEN** the goblin safely resumes normal decision behavior

### Requirement: Goblin attacks a selected bush from an adjacent grid cell
The goblin SHALL stop on the selected reachable cardinally adjacent cell, face the bush, and perform one atomic directional fire swing. After its normal recovery, it SHALL reevaluate character combat priority and the current bush snapshot before attacking the bush again. Multiple goblins SHALL be allowed to select the same bush without reserving it.

#### Scenario: Goblin reaches attack position
- **WHEN** a goblin reaches its selected cell adjacent to a living bush
- **THEN** it stops, faces the bush, and performs one fire swing without entering the bush's footprint

#### Scenario: Character becomes attackable during recovery
- **WHEN** a player or sheep becomes an eligible attack target after a bush swing
- **THEN** the goblin prioritizes the character instead of beginning another bush swing

#### Scenario: Selected bush is destroyed by another goblin
- **WHEN** the selected bush ceases to be living before the approaching or recovering goblin begins its next swing
- **THEN** that goblin abandons the stale target and resumes normal decision behavior

