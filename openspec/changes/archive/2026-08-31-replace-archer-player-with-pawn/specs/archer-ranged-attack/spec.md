## REMOVED Requirements

### Requirement: Archer animation reflects its activity
**Reason**: The playable character is no longer an archer and uses Pawn
locomotion and weapon/item presentations.
**Migration**: Use the `pawn-player-loadout` capability.

### Requirement: Space triggers one complete shot
**Reason**: The playable character no longer performs ranged arrow attacks.
**Migration**: Use the `Attack` action and equipped Pawn weapon interaction.

### Requirement: Shot direction follows the player's cardinal intent
**Reason**: Cardinal arrow direction is no longer part of Player behavior.
**Migration**: Weapon-specific attack behavior is defined by the Pawn capability.

### Requirement: Arrow release is synchronized with the shoot animation
**Reason**: The archer shoot animation and arrow release are removed from Player.
**Migration**: Use the equipped weapon's interaction animation.

### Requirement: Arrow travels along a cardinal path
**Reason**: Player no longer creates arrow projectiles.
**Migration**: Existing projectile behavior remains available to other actors if
needed, but is not a Player requirement.

### Requirement: Arrow has an active collider until removal
**Reason**: Player no longer creates or owns arrow colliders.
**Migration**: Retain projectile collision rules only for systems that still
spawn projectiles.
