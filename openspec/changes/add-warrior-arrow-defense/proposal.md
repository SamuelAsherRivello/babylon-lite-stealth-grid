## Why

The Warrior already has a guard animation, but it does not react defensively to incoming arrows. Making defense depend on the direction he is already facing creates a readable positional combat counter: frontal shots are blocked and rear shots always land.

## What Changes

- Detect arrows approaching a living Warrior and automatically show the Warrior's guard pose for 0.25 seconds.
- Block every approaching arrow from the Warrior's facing side, while arrows approaching from behind always deal normal damage.
- Prevent arrow damage when an arrow hits a Warrior during the active defense pose.
- Deflect a defended arrow away from the Warrior, spin it slightly, fade it out, and remove it after 0.25 seconds.
- Preserve normal Warrior damage and arrow removal when the defense is not active.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `warrior-character`: Add deterministic facing-based incoming-arrow defense using the existing guard pose.
- `archer-ranged-attack`: Add a 0.25-second visual deflection lifecycle for arrows blocked by a defending Warrior.
- `combat-health-system`: Make an active Warrior defense negate arrow damage while undefended arrow hits retain normal damage behavior.

## Impact

The change affects Warrior state/control integration, projectile proximity and hit resolution, projectile rendering/lifecycle state, shared combat routing in `src/main.js`, and focused unit/integration tests. It uses the existing Warrior guard atlas and current Babylon Lite sprite APIs; no new dependency or authored art is required.
