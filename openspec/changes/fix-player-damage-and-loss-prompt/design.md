## Context

See proposal.md for motivation. Current source sets MAX_HEALTH to 100 and subtracts 25 for enemy-body overlap during an attack. activeTouchPairs deduplicates contact across frames, rather than identifying swings. C056 introduces adjacent attacks; C057 plans centering before attacks. The player is excluded from projectile target iteration, and Archer shots are created with collisionEnabled false; both gates must be traced.

The shared combat state already animates death over 0.25 active seconds. The main loop removes dead actors before reading the current player record. GameState currently has only LEVEL_START, LEVEL_PLAYING, and LEVEL_COMPLETE. The win dialog reloads the page on Continue.

## Goals / Non-Goals

Goals: Connect real enemy attack events to health and add an ordered defeat lifecycle with testable completion signaling.

Non-goals: AI navigation or centering changes, health bars, new death artwork, class-specific damage tuning, or changes to sheep, bush, player-arrow enemy damage, or Warrior defense rules. Monk remains non-combatant.

## Decisions

1. Preserve 25 melee damage. Use 25 for enemy arrows as a documented planning assumption, since no effective player-arrow damage path currently exists. Keep 100 player health. Increasing damage would mask missing hits.
2. Give accepted melee swings stable identities and a single damage event. Use an actor's existing authored damage timing if available; otherwise use the midpoint of its non-looping attack animation as the deterministic impact event. At impact, test the living player's current collider against a one-cell directional damage area in the locked attack direction, including the attacker cell for existing overlap combat. A player outside that area misses; no mid-swing retargeting. Consume each event once. Keep contact deduplication for other contact interactions; do not use it to count player melee hits.
3. Check gameplay Archer arrows against the living player's combat collider throughout their actual visible ballistic flight, including rise, descent, and the final segment before landing. Use swept or sufficiently subdivided collision along the arc, including visual elevation and rotation, so a long frame cannot skip a player hit or land first. A hit deals 25 damage once and removes the arrow and its collider immediately; that arrow never becomes grounded. Preserve trajectory, rendering, release timing, self-hit exclusion, and existing non-player flight target behavior. Retain stable ownership/faction metadata even if the shooter is removed. Archer shooting itself does not deal contact damage.
8. Only an arrow that finishes flight without a consumed hit becomes grounded. Disable all damage, defense, obstruction, and general interaction routes for grounded arrows. Expose a non-blocking pickup combat collider around the visible grounded shaft, activated only after landing and responsive solely to its living firing Archer's combat collider. On overlap, disable the collider immediately and play the existing bush sound once through an isolated pickup callback. Reuse gold pickup animation tuning: rise 50 pixels and fade over 0.18 active seconds, then remove the sprite. Preserve the grounded crop during the animation. Other Archers, the player, NPCs, and other objects cannot collect or interact with it. No inventory change is required.
9. Uncollected grounded arrows remain until ordinary level disposal, even if their owner dies. Remove the current oldest-landed-arrow eviction when the 32-sprite pool fills; grow or allocate additional rendering capacity without removing grounded arrows or blocking new shots. Reuse normal level cleanup; no timer or separate cleanup system is in scope.
4. Add LEVEL_DYING and LEVEL_LOST transitions with idempotent playerDefeated/deathCompleted events. Capture completion from the combat lifecycle before spawner removal, avoiding reliance on an actors[0] record that has disappeared. Do not treat absence before spawn as death. Disable player input immediately; let active animation time continue until completion, then pause. A user pause still freezes active time. Guard victory against lethal damage in the same update and ignore duplicate terminal events.
5. Reuse the existing shared death effect; it is the currently specified player death animation. Allow the lethal hit's forced knockback to run during that effect, with no voluntary movement. Do not invent a dedicated sprite animation. Reuse or parameterize the win dialog for explicit outcome copy while preserving its current success default. Keep the loss backdrop non-dismissable so a paused level cannot lose its only restart action. Retain existing lose sound timing at death start without duplicate sound.
6. Carry attacker type with each damage event and projectile so knockback uses Goblin 0.25, Archer 0.5, Warrior 0.75, and Lancer 1.0 grid cells. The first three distances are proportional planning defaults for the user's requested ordering. At the current 64 px grid these are 16, 32, 48, and 64 px. Use the configured grid dimensions to calculate displacement. Melee pushes away from the attacker; arrows push along their travel direction. Use the committed direction as fallback for coincident centers.
7. Express knockback as distance over the existing 0.2 active-second duration, integrating an easing curve by elapsed progress so frame rate does not change total travel. Collision resolution truncates blocked travel without teleporting through terrain or actors. Player input cannot cancel knockback. A new hit starts its own impulse from the current position and replaces the unfinished impulse, avoiding unbounded stacking. Run forced movement while dying so the lethal hit remains visible and finishes before the 0.25-second death completion. Preserve corpse exclusion from damage/AI while retaining a private movement shape for collision resolution. Other actors' knockback tuning remains unchanged.

## Risks / Trade-offs

- Concurrent C056/C057 edits → Re-read current attack adapters before implementation and keep this change focused on damage and defeat.
- Repeated frames, simultaneous attackers, or contact plus swing paths could double damage → One authoritative melee event path with per-swing consumption; guard non-living targets.
- Arrow collision currently disabled → Test the actual renderer/projectile collision pipeline, not only resolveProjectileHit in isolation.
- Pausing too early can freeze death forever; removal can lose the completion event → Emit completion before removal, then pause and show the dialog once.
- A 250 ms animation is brief → Verify visible sequencing in a real browser with captured intermediate frames.

## Migration Plan

No persistent data migration or new dependencies. Implement through additive changes and focused regression coverage, then run browser checks and the build. If a regression requires withdrawal, use a new corrective change without discarding unrelated work or rewriting history.

