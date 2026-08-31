## MODIFIED Requirements

### Requirement: Warrior actions are explicit and complete
The Warrior SHALL expose both attack variants and guard as distinct actions,
SHALL lock locomotion during a non-looping attack, and SHALL return to idle or
walking after the attack completes. A gameplay controller MAY choose which
attack or when to guard without changing the animation catalog. In addition,
each living Warrior SHALL evaluate incoming arrows using the configured reaction
window, SHALL automatically enter guard for exactly 0.25 seconds when an
eligible arrow approaches from the direction the Warrior is already facing,
and SHALL never automatically turn to defend a rear attack. Automatic arrow defense SHALL take priority over
locomotion and attack actions for the defense interval. The initial settings
SHALL make frontal defense deterministic: every eligible frontal arrow is
blocked and every rear arrow causes normal damage.

#### Scenario: Alternate attack is requested
- **WHEN** a controller requests Attack 2 while the Warrior is not attacking or automatically defending
- **THEN** the Warrior plays Attack 2 once and retains its horizontal facing

#### Scenario: Guard is requested
- **WHEN** a controller enables guard
- **THEN** the Warrior displays the guard animation until guard is released or superseded by an allowed action

#### Scenario: Eligible arrow approaches
- **WHEN** a living Warrior detects an arrow traveling toward its combat area from the direction he is already facing within the configured reaction window
- **THEN** the Warrior immediately displays guard for 0.25 seconds and does not move or attack during that interval

#### Scenario: Eligible arrow approaches from behind
- **WHEN** a living Warrior detects an arrow traveling toward his combat area from behind
- **THEN** the Warrior does not turn or enter automatic guard and the arrow causes normal damage on impact

#### Scenario: Arrow is nearby but moving away
- **WHEN** an arrow is inside the configured proximity area but its trajectory is not approaching the Warrior's combat area
- **THEN** the arrow does not trigger automatic guard

#### Scenario: Automatic defense ends
- **WHEN** 0.25 seconds have elapsed since automatic guard began
- **THEN** the Warrior returns to the locomotion state appropriate to its current movement intent

#### Scenario: Defense tuning is changed
- **WHEN** the reaction-window or defense-duration setting is adjusted before creating a Warrior
- **THEN** that Warrior uses the adjusted timing while preserving deterministic front and rear outcomes
