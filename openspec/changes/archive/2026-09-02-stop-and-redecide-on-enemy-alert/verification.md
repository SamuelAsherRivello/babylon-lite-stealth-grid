# C055 verification

## Adapter inventory

- Archer, Warrior, Lancer, Monk: runtime factories use `createEnemyPatrolController`; `cancel` clears intent, waypoint, and shared movement recovery. Actor updates own animation and defense/shooting where applicable and must keep running.
- Goblin: `createGoblinBehaviorController`; navigation cancellation also needs to clear bush/character targets and idle/retry work. A combat-only update must preserve nearby attacks and existing attack recovery without restarting unrelated bush/patrol decisions.
- Demo controllers are not used by the runtime enemy factories.
- `createActorWalkability` supplies terrain, occupied cells, and live-position segment checks. Use it for reaction routing; retain `getCharacterGridCell`/GridSpot conversion and continuous world position.
- Existing uncommitted changes include main.js, actor spatial/archer/shared actor work, editor files, occupancy and recovery tests/docs. Preserve these; no resets, restores, or bulk replacements.

## Red baseline

`node --test test/systems/perception/awareness-entry.test.js`: 17 failures before production changes. Stop callback is absent; all five runtime controller configurations retain movement, advancing from x=105 to x=106.92 after detection. The test also covers all three detection strengths, escalation, refresh, forced entry, and reset notification.

## Implementation and automated verification

- Central `onStop` precedes entry responses; `reset` notifies return to `NONE`. Same-state evidence does not retrigger stop.
- `enemy-awareness-controller.js` gates normal navigation, cancels old work, retains one stationary eligible update, queues only the latest response, and reuses bounded route search/recovery and live walkability.
- All five actors support facing without movement. Goblin has navigation-only cancellation and combat-only updates so attack/recovery remain active.
- `node --test test/characters/enemy-awareness-controller.test.js test/systems/perception/awareness-entry.test.js test/systems/perception/enemy-perception-reaction.test.js test/characters/goblin-integration.test.js`: 53 passed. Includes real actor/animation layers, same-direction decisions, facing, zero-delta, rapid transitions, refresh, reset, death, real attack preservation, combat recovery, enclosed retry, and dynamic segment rejection.
- `npm.cmd test`: latest complete run 497/498 passed. Remaining failure is `spawn animation begins even when actors attach before renderer creation`: its source regex requires LF-only lines but the existing attachActor preamble has CRLF. This change does not modify that preamble; no spawn behavior change was made. Earlier projectile failures disappeared as unrelated concurrent edits landed; they were not fixed by C055.
- `npm.cmd run build`: passed. Targeted `git diff --check`: no whitespace errors (Git reports normal LF/CRLF conversion warnings).

## Live browser verification

URL: http://localhost:5173/ (existing server, unchanged port).

Playwright used request interception only in its isolated `c055` browser session to expose existing runtime records and pause control. No test hooks were added to production source. The tests operate actual level-spawned actors, their normal controllers, real terrain/occupancy walkability, and rendered sprite layers.

- All five types, audio strengths 0.25/0.5 and visual strength 1: 15/15 entry cases passed. At a clear off-center segment each actor stopped exactly at `(102.92, 96)`. Suspicion remained there; investigation/alert moved to `(104.84, 96)` only on the following update.
- Each type also passed renewed direct sight without another stop, escalation, timed de-escalation, enclosure by four other enemies, and movement after the three-second retry when the exit reopened.
- In the real running main loop, the first post-entry frame was stationary/idle for all five types. Subsequent frames moved Monk, Warrior, and Archer toward their targets; Goblin and Lancer remained stopped where those test targets were blocked or already occupied by self.
- Inspected `output/playwright/c055-awareness-live.png`: the actual game renders all five enemies with investigation indicators and no loading/error overlay. Console has no errors; the existing engine warning is unrelated.
- Reproduction scripts: `output/playwright/c055-instrument.js`, `c055-live-check.js`, and `c055-frame-check.js`. Logs: `c055-focused.log`, `c055-full.log` in the same ignored output directory. Run multi-line scripts through the CLI as a single string on Windows.

## Coverage and limits

All C055 specification scenarios are covered by transition tests, full-actor tests, and live runtime checks. The stop is one eligible active locomotion update, not a newly added timed stun. Protected combat and knockback retain their own movement authority. No changes were made to detection thresholds, reaction durations, level data, art offsets, projectile work, or unrelated occupancy/recovery work.
