# start-game-prompt Specification

## Purpose

Provides a clear, optional entry prompt that explains the stealth objective before the player begins interacting with the level.

## Requirements

### Requirement: Start prompt is visible by default

The game SHALL present a modal start prompt after the level is ready unless the startup option `showStartPrompt` is explicitly set to `false`.

#### Scenario: Default startup
- **WHEN** the game starts without a `showStartPrompt` value
- **THEN** the prompt is displayed before player input can affect gameplay

#### Scenario: Environment suppresses prompt
- **WHEN** the game starts with `showStartPrompt` set to `false`
- **THEN** the prompt is not displayed and gameplay starts normally

### Requirement: Prompt content explains the current objective

The prompt SHALL have the title `Stealth Grid`, the body text `Reach the flag to win. Avoid audio/visual detection of enemies. Currently pointless gameplay is: gold, attack, items.`, and one button labeled `Start`.

#### Scenario: Player reads the prompt
- **WHEN** the prompt is displayed
- **THEN** the title, body text, and `Start` button are visible with the exact specified wording

### Requirement: Start is the only dismissal action

The prompt SHALL not include a close button and SHALL not dismiss when the player clicks its backdrop.

#### Scenario: Player starts the game
- **WHEN** the player activates `Start`
- **THEN** the prompt closes, player input becomes enabled, and gameplay resumes

#### Scenario: Player interacts outside the prompt
- **WHEN** the player clicks the prompt backdrop
- **THEN** the prompt remains visible and gameplay remains paused
