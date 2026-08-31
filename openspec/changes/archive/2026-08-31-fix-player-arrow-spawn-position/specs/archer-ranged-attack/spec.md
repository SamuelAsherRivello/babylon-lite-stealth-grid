## MODIFIED Requirements

### Requirement: Arrow release is synchronized with the shoot animation
The game SHALL create exactly one arrow close to the archer's bow when the shoot animation reaches its visual release moment. The arrow SHALL use the same horizontal separation from the player when facing left or right, mirrored to the firing side. The arrow SHALL not appear at the start or after the end of the animation.

#### Scenario: Animation reaches its release moment
- **WHEN** an active shoot animation reaches the configured release frame
- **THEN** exactly one arrow appears close to the bow and begins flight

#### Scenario: Arrow is released facing right
- **WHEN** the archer releases an arrow while facing right
- **THEN** the arrow appears close to the bow on the archer's right side

#### Scenario: Arrow is released facing left
- **WHEN** the archer releases an arrow while facing left
- **THEN** the arrow appears close to the bow on the archer's left side with the same horizontal separation as a right-facing release
