## Purpose

Defines the first goblin enemy using the verified Tiny Swords Torch animation
set and a deterministic mapping from movement and attack direction to art.

## ADDED Requirements

### Requirement: The first goblin uses verified Torch animations
The goblin SHALL provide a seven-frame `idle` animation, a six-frame
`walking` animation, and six-frame `attack-right`, `attack-down`, and
`attack-up` animations at 100 milliseconds per frame.

#### Scenario: Goblin is spawned
- **WHEN** a goblin is created without an immediate movement or attack request
- **THEN** it appears in the `idle` state and loops all seven idle frames

### Requirement: Goblin attack art follows the requested direction
The goblin SHALL use the up or down attack animation when the corresponding
vertical direction is dominant, SHALL use the right attack animation for a
rightward or neutral request, and SHALL mirror the right attack animation for
a leftward request.

#### Scenario: Left attack
- **WHEN** the goblin starts an attack whose dominant direction is left
- **THEN** it plays the six-frame right-attack art mirrored horizontally once

#### Scenario: Up attack
- **WHEN** the goblin starts an attack whose dominant direction is up
- **THEN** it plays the six-frame up-attack animation once

#### Scenario: Down attack
- **WHEN** the goblin starts an attack whose dominant direction is down
- **THEN** it plays the six-frame down-attack animation once

### Requirement: Runtime sheets are uniform and flattened
The goblin runtime SHALL use one uniform single-row PNG sheet per animation;
the game SHALL NOT require Aseprite files, Aseprite layers, or irregular packed
frame metadata at runtime.

#### Scenario: Loading goblin art in the browser
- **WHEN** the game loads goblin animation assets
- **THEN** each sheet can be loaded as a 192 by 192 Babylon Lite grid atlas

### Requirement: Source art remains reproducible
The red Torch goblin Aseprite source SHALL remain in a local Git-ignored import
directory, attribution and official usage terms SHALL be retained in the
repository, and exported runtime sheets SHALL exclude the source tag named
`Original`.

#### Scenario: Re-exporting the goblin
- **WHEN** a licensed developer regenerates the runtime sheets from their local
  source copy
- **THEN** the `Idle`, `Run`, `Attack_Right`, `Attack_Down`, and `Attack_Up`
  tags reproduce the specified runtime animations
