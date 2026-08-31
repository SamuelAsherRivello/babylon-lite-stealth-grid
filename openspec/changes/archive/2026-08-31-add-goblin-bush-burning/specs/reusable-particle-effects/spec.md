## ADDED Requirements

### Requirement: Fire 3 supports completion-aware one-cycle gameplay playback
The Fire 3 effect SHALL support a gameplay playback mode that starts or restarts at frame zero, advances through all 12 frames exactly once at the existing 100 ms frame duration, and emits exactly one completion notification. This mode SHALL coexist with the existing looping preview behavior without changing the catalog's preview defaults.

#### Scenario: Bush is struck
- **WHEN** gameplay starts Fire 3 for a successful bush hit
- **THEN** the effect is positioned on that bush and plays frames zero through eleven once

#### Scenario: One cycle completes
- **WHEN** one-cycle Fire 3 reaches frame eleven and finishes
- **THEN** playback stops and emits one completion notification

#### Scenario: Gameplay cycle is restarted
- **WHEN** the same living bush receives a later successful hit after its prior cycle has completed
- **THEN** its Fire 3 effect restarts from frame zero without accumulating a concurrent animation

#### Scenario: Particle preview is enabled
- **WHEN** Fire 3 is displayed in the Particle FX Preview row
- **THEN** it retains the existing continuous looping preview behavior

### Requirement: Gameplay Fire 3 follows bush presentation and lifecycle
A bush-attached Fire 3 effect SHALL remain centered on the authored bush placement, render with the gameplay effects depth, follow viewport scaling, and release its sprite, layer, animation, and completion resources when the bush is removed or gameplay is disposed.

#### Scenario: Viewport scale changes
- **WHEN** the logical game viewport changes scale during a bush fire cycle
- **THEN** the bush-attached Fire 3 remains aligned with the bush

#### Scenario: Gameplay is disposed during playback
- **WHEN** gameplay shuts down while a bush-attached Fire 3 cycle is active
- **THEN** the effect stops and releases its rendering and completion resources without firing a stale gameplay action

