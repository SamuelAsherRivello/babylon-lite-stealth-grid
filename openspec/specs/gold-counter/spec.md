# gold-counter Specification

## Purpose

Provides a simple, level-scoped visual indication of available and collected gold without changing objectives, rewards, or completion behavior.

## Requirements

### Requirement: Gold counter placement and format

The HUD SHALL display a label formatted as `Gold: 00/00` in the upper-left area, directly below the release/version line.

#### Scenario: Gold counter is visible at level start

- **WHEN** the level starts
- **THEN** the gold counter is visible beneath the release/version line and shows the collected count as `00`

### Requirement: Level gold total

The counter SHALL set its total to the number of gold available in the level when that level starts.

#### Scenario: Level contains ten gold

- **WHEN** a level with ten available gold starts
- **THEN** the counter displays `Gold: 00/10`

### Requirement: Gold collection display

The counter SHALL increase its collected count by one for each gold pickup collected by the player and SHALL not change any other gameplay state.

#### Scenario: Player collects gold

- **WHEN** the player collects one gold pickup
- **THEN** the counter updates from `Gold: 00/10` to `Gold: 01/10`

#### Scenario: Player collects all gold

- **WHEN** the player collects the final available gold pickup
- **THEN** the counter shows the collected total and no special completion action occurs
