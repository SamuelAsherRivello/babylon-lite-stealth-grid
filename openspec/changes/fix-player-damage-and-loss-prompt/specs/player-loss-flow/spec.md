## Purpose

Provide a complete player defeat sequence that visibly finishes the death animation before presenting a clear loss prompt and restart action.

## ADDED Requirements

### Requirement: Lethal player damage begins an irreversible defeat sequence
When player health reaches zero or below during play, the game SHALL immediately disable voluntary player movement, attacks, interactions, and further damage, and SHALL prevent victory for the remainder of that run. The existing 250 ms shrink, fade, and random 20-degree rotation death animation SHALL complete before the player is removed and before a loss prompt is shown. The lethal hit's forced knockback SHALL remain active during that animation and finish within its duration.

#### Scenario: Death animation is still playing
- **WHEN** lethal damage has occurred and fewer than 250 ms of active animation time have elapsed
- **THEN** the player death animation remains visible, input is disabled, and no loss prompt is shown

#### Scenario: Death occurs on the goal
- **WHEN** lethal damage and goal overlap occur in the same gameplay update
- **THEN** defeat takes precedence and the win prompt is not displayed

#### Scenario: Death completes
- **WHEN** the player's death animation completes
- **THEN** the game enters its lost state exactly once, removes the defeated player, pauses gameplay, and shows the loss prompt

#### Scenario: Manual pause during death
- **WHEN** gameplay is manually paused during the death animation and later resumed
- **THEN** death progress pauses and resumes without displaying the loss prompt early

### Requirement: Loss prompt follows the established level prompt presentation
The loss prompt SHALL use the existing win prompt's layout, positioning, typography, backdrop, and button styling, with title "You Lost", message "Try again!", and action "Continue". The action SHALL reload the level using the current win prompt restart behavior. The prompt SHALL focus its action when opened, support keyboard activation, and keep its restart action available when the backdrop is clicked. The existing win text and action SHALL remain unchanged.

#### Scenario: Player sees loss prompt
- **WHEN** the death animation has completed
- **THEN** exactly one loss dialog is displayed with the specified text and focused Continue button

#### Scenario: Restart after loss
- **WHEN** the player activates Continue
- **THEN** the level reloads with a new living player at 100 health and the normal start flow

#### Scenario: Backdrop click
- **WHEN** the player clicks outside the loss panel
- **THEN** the loss prompt remains available and gameplay stays paused
