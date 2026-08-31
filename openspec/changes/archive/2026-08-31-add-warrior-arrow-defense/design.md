## Context

See `proposal.md` for motivation. The Warrior already exposes a looping guard action, while arrows are owned by a renderer that advances them, exposes active colliders, and removes hits. Combat damage is resolved centrally after projectile movement. The defense therefore crosses Warrior action state, projectile state/rendering, and collision routing. Updates must remain pause-aware because the game already supplies zero active delta while paused.

## Goals / Non-Goals

**Goals:**

- Keep defense timing values in one validated configuration object passed into each Warrior.
- Detect only arrows whose current velocity is aimed toward the Warrior, with enough lookahead to make the 0.25-second pose readable.
- Give hit resolution one unambiguous answer for whether the Warrior is currently defending.
- Retain a defended arrow long enough to show its bounce, spin, and fade without letting it collide again.
- Make horizontal frontal blocks and rear damage deterministic from the Warrior's existing facing, while upward arrows use a 50% roll.

**Non-Goals:**

- Player-controlled guarding, shields, parries for other actors, reflected-arrow damage, or changing the arrow's normal damage values.
- New Warrior or arrow artwork, audio, particles, UI settings, or persisted difficulty controls.
- Vertical-facing Warrior artwork; upward defense reuses the current horizontal facing and downward arrows remain undefended.

## Decisions

### Centralize defense timing and use existing facing

Define a frozen default defense configuration near the Warrior behavior contract with `reactionLookaheadSeconds`, `upwardDefenseChance`, and `defenseDurationSeconds`. Start with a 0.40-second trajectory lookahead, exactly 0.50 upward defense chance, and the required 0.25-second defense duration. Validate/clamp configuration at Warrior creation and inject randomness for deterministic tests. Compare horizontal travel with the Warrior's current facing: an arrow traveling opposite the facing direction comes from the front and always blocks; one traveling with the facing direction comes from behind and never blocks. Upward arrows roll the dedicated 50% chance without changing horizontal facing; downward arrows never defend.

This keeps horizontal defense positional and frame-rate independent while giving upward attacks the requested uncertainty. Turning toward an incoming arrow was rejected because it would erase the intended rear vulnerability.

### Use trajectory lookahead rather than a radial proximity check

For each active arrow and living Warrior, project the arrow forward along its velocity for the configured lookahead and test whether that swept region reaches the Warrior combat collider. Trigger at most one defense attempt per arrow/Warrior pair. Nearby arrows traveling away or passing outside the combat area do not trigger defense.

This matches “coming near” while avoiding reactions to harmless arrows. A simple distance radius was rejected because it reacts behind the Warrior and to arrows traveling away.

### Make automatic defense a timed Warrior action

Add an automatic-defense timer and per-projectile defense authorization to the Warrior actor. A frontal horizontal block or successful upward roll preserves facing, enters guard immediately, interrupts locomotion or attack animation, and holds guard for 0.25 seconds of active gameplay time. Hit resolution checks authorization for the specific arrow so a rear or downward shot cannot be protected by a pose triggered by another projectile. When the timer expires, the actor returns to current idle/walking intent.

Using the existing guard state preserves current art and movement locking. Treating defense as only a combat flag was rejected because the visible pose could drift out of sync with damage immunity.

### Give projectiles an explicit deflected lifecycle

Extend projectile records from the current flying/hit distinction to flying and deflected behavior. Deflection removes the arrow from `getColliders()` immediately, records a normalized away vector, and starts a 0.25-second timer. During that timer the renderer moves the sprite a short distance away, adds a modest rotation (targeting roughly a quarter turn over the effect), and interpolates alpha from 1 to 0 before removal.

Reversing the flight direction at reduced speed provides the bounce impression. The arrow cannot damage another target while deflected. Immediate removal was rejected because it cannot communicate a block; returning it to active collision was rejected because this change does not introduce reflected-arrow combat.

### Resolve defense at the existing projectile-hit boundary

Before applying Warrior projectile damage, query whether that arrow is authorized by the active directional defense. An authorized hit calls projectile deflection and skips damage/knockback/hit flash. A rear shot, downward arrow, failed upward roll, expired defense, or otherwise undefended hit retains the existing 50 damage and normal removal. Sheep and goblin projectile behavior remains unchanged.

This keeps health mutation and projectile outcome atomic in the current central collision loop rather than duplicating damage rules inside actors or the renderer.

## Risks / Trade-offs

- [Guaranteed frontal blocks may make Warriors frustrating] → Preserve an absolute rear vulnerability so positioning remains the counter.
- [Low frame rates could allow collision before a reaction is evaluated] → Use swept trajectory prediction and perform defense evaluation before projectile hit damage in the same update.
- [Multiple arrows may repeatedly restart guard] → Record attempts per arrow/Warrior pair and define that an already-active defense remains active rather than rerolling every frame.
- [Animation state and immunity timer may diverge] → Drive both from the same timed automatic-defense state and test start, active, and expiry boundaries.
- [Deflected arrows consume renderer capacity briefly] → They last only 0.25 seconds and remain within the existing small fixed-capacity lifecycle.

## Migration Plan

No data migration is required. Add the behavior behind the new Warrior defense defaults, retain existing construction call compatibility, run focused tests plus the full project verification, and tune only the centralized defaults after playtesting. Rollback is additive: stop passing projectile approach data to Warriors and restore defended hits to the existing normal hit-removal path.
