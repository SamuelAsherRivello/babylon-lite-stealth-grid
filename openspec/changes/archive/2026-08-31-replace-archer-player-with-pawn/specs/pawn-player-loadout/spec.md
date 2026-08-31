## Purpose

Defines the playable Pawn presentation, independent item and weapon inventory
slots, automatic collection and replacement, and weapon attack behavior.

## ADDED Requirements

### Requirement: Player uses Pawn locomotion presentations
The game SHALL render the character named `Player` with the supplied Pawn idle
and run artwork when stationary or moving, including the matching held-item
variant when an item is equipped.

#### Scenario: Empty player moves
- **WHEN** Player has no item or weapon and moves
- **THEN** the base Pawn run animation is displayed

#### Scenario: Player carries an item
- **WHEN** Player has `gold`, `meat`, or `wood` in the item slot
- **THEN** the matching Pawn held-item idle or run animation is displayed

### Requirement: Player has independent item and weapon slots
Player SHALL have at most one item and at most one weapon simultaneously. Valid
items SHALL be `gold`, `meat`, and `wood`; valid weapons SHALL be `axe`,
`hammer`, `knife`, and `pickaxe`.

#### Scenario: Player collects separate categories
- **WHEN** Player collects one item and one weapon
- **THEN** both slots are occupied independently

### Requirement: Temporary keys cycle the loadout slots
Key `1` SHALL cycle weapons in the order `none`, `axe`, `hammer`, `knife`,
`pickaxe`, then `none`. Key `2` SHALL cycle items in the order `none`, `gold`,
`meat`, `wood`, then `none`.

#### Scenario: Weapon cycling wraps
- **WHEN** Player taps `1` repeatedly
- **THEN** the weapon slot follows the documented order and returns to none

#### Scenario: Item cycling wraps
- **WHEN** Player taps `2` repeatedly
- **THEN** the item slot follows the documented order and returns to none

#### Scenario: Cycling is locked during weapon action
- **WHEN** Player is within the weapon animation, cooldown, or damage window
- **THEN** taps of `1` and `2` do not change either slot

### Requirement: Equipped weapon controls Attack presentation
The Attack action SHALL do nothing without an equipped weapon. With a weapon,
it SHALL play that weapon's interaction animation while Player continues moving.
New Attack input SHALL be ignored until the current interaction and its 0.5
second weapon-presentation recovery window finish.

#### Scenario: Attack without weapon
- **WHEN** Player activates Attack with no weapon equipped
- **THEN** no attack animation or gameplay action occurs

#### Scenario: Attack with weapon while carrying item
- **WHEN** Player activates Attack with a weapon and an item equipped
- **THEN** the weapon interaction animation is shown
- **AND** movement continues
- **AND** the carried item presentation resumes 0.5 seconds after the interaction ends

#### Scenario: Repeated Attack input
- **WHEN** Player activates Attack during an active attack presentation
- **THEN** the new input is ignored

### Requirement: Attack artwork matches available weapon animations
The game SHALL use the supplied interaction artwork for axe, hammer, knife, and
pickaxe attacks. Gold, meat, and wood SHALL not become weapons merely because
they are carried items.

#### Scenario: Weapon interaction selection
- **WHEN** Player attacks with an equipped axe, hammer, knife, or pickaxe
- **THEN** the corresponding interaction animation is displayed

### Requirement: Weapon attacks apply timed melee damage
The combat collider SHALL be active only during damaging swing frames. An attack
SHALL damage each overlapping target at most once, while allowing multiple
targets to be damaged. Damage SHALL be knife 10, pickaxe 20, axe 30, and hammer
40.

#### Scenario: Weapon damage values
- **WHEN** Player attacks with a knife, pickaxe, axe, or hammer
- **THEN** the target receives respectively 10, 20, 30, or 40 damage

#### Scenario: One hit per target
- **WHEN** one target remains inside the combat collider for one attack
- **THEN** that target receives damage only once during that attack

#### Scenario: Multiple targets
- **WHEN** multiple targets overlap the combat collider during the damage phase
- **THEN** each overlapping target receives one damage event
