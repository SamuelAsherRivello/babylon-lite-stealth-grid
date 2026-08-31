## MODIFIED Requirements

### Requirement: Arrow has an active collider until removal
Each arrow SHALL have a gameplay collider that follows its projectile position
and orientation during flight. The game SHALL remove the arrow from view and
active projectile state when its swept path intersects a blocking collider or
when its complete collider leaves the game bounds. When an arrow hits a Warrior
during the Warrior's active defense pose, the arrow SHALL stop participating in
collisions, visibly bounce away from the Warrior, rotate slightly, fade from
fully visible to transparent, and be removed exactly 0.25 seconds after the
deflection begins.

#### Scenario: Collider follows a horizontal projectile
- **WHEN** a left- or right-moving arrow is active
- **THEN** its collider is centered on the arrow and uses the horizontal arrow dimensions

#### Scenario: Collider follows a vertical projectile
- **WHEN** an up- or down-moving arrow is active
- **THEN** its collider is centered on the arrow and swaps the horizontal arrow dimensions for vertical orientation

#### Scenario: Arrow intersects a blocker
- **WHEN** an arrow's swept cardinal path intersects a blocking collider
- **THEN** the arrow is removed without tunneling through the blocker

#### Scenario: Arrow leaves the game bounds
- **WHEN** an arrow's complete collider passes beyond any applicable edge of the game bounds
- **THEN** the arrow is removed from view and active projectile state

#### Scenario: Defended arrow begins its bounce
- **WHEN** an arrow hits a Warrior while that Warrior's defense pose is active
- **THEN** the arrow immediately stops causing collisions and begins moving away, spinning slightly, and fading out

#### Scenario: Defended arrow effect completes
- **WHEN** the deflected arrow has been visible for 0.25 seconds
- **THEN** it is fully transparent and removed from active projectile state

