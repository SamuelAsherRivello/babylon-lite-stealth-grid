# C054 verification

## Cause and approved extension

The original goblin center (32, 800), spot (0, 12), was inside Level01 terrain frame 42's rectangle x=0, y=768, width=64, height=64. The same Tiled normalization, terrain conversion, and empty-frame set as main.js confirmed that its neighboring endpoints were clear but all connecting segments from the invalid starting position were blocked. Exact initial spawning bypassed isWalkable.

The user approved safe autonomous spawn placement. Enemy and sheep spawners now validate exact placement, preserve available authored positions, choose the nearest available grid center for blocked positions, and defer creation when none is free. Level01 now creates goblin-3 at (32, 736), spot (0, 11). Active actors are never teleported, and player spawn behavior is unchanged.

## Implementation coverage

- Shared bounded progress tracking and three-second active-time retries, including jitter, movement locks, cancellation, and fresh replacement state.
- Segment traversal uses physical collision movement, current blockers, and actual off-center starting positions.
- Goblin patrol and bush approach abandon invalid routes; one-cell recovery can relax normal patrol distance/home radius.
- Shared enemy patrol covers warrior, lancer, archer, and monk; physical dynamic collisions are forwarded through archer and monk movement.
- Sheep flee/separation recovery preserves bounce, waits while enclosed, and enters cooldown after escape.
- Development canvas navigation snapshots expose position, cell, intent, waypoint, recovery state/reason, no-progress time, and retry countdown.

## Automated checks

Before implementation, the original two movement-recovery regressions failed for the intended reasons: the goblin pushed at a thin wall forever and never entered enclosure waiting. Before safe-spawn implementation, both new exact-spawn validation tests failed: the goblin appeared inside the wall and spawning did not defer when every cell was unavailable.

After implementation:

- node --test test/characters/movement-recovery.test.js test/characters/recovery-roster.test.js test/systems/spawners/spawner.test.js: 35/35 passed.
- node --test 'test/characters/*.test.js' 'test/systems/spawners/*.test.js': 205/205 passed.
- npm.cmd run build: passed.
- npm.cmd test: 494/495 passed. The remaining spawn-animation.test.js assertion requires the '// Initial actors' comment immediately after the renderer block; concurrent expression initialization now sits between them. Actual beginSpawn remains outside the renderer guard. This unrelated source-layout assertion was left unchanged.

Additional checks include a sole reverse exit, simultaneous actors approaching one destination without overlap, dynamic collider release, valid exact spawn, deterministic nearest-cell ties, and cancellation/replacement. The reusable roster fixture runs production actor/controller/collision code with drawing calls stubbed; it does not substitute a movement implementation.

## Browser verification

The browser fixture at /test/browser/recovery.html ran for 22.0012 active seconds. All six actor types were enclosed through two retry intervals. At 5.0187 seconds the goblin remained waiting with 0.9999 seconds left; at 6.0186 seconds it had scheduled the next three-second wait. The exit opened at seven seconds. By the end:

| Actor | Initial center | Final center | Result |
| --- | --- | --- | --- |
| Goblin | (32, 800), spot (0, 12) | (229.988, 800) | Escaped and moving |
| Warrior | (32, 32), spot (0, 0) | (511.904, 32) | Escaped and moving |
| Lancer | (32, 32) | (511.904, 32) | Escaped and moving |
| Archer | (32, 32) | (511.904, 32) | Escaped and moving |
| Monk | (32, 32) | (511.904, 32) | Escaped and moving |
| Sheep | (32, 32) | (96, 32) | Escaped and returned to idle |

The normal Level01 browser was also observed. Fresh canvas attribute samples 37.312 seconds apart showed goblin-3 move from (54.008, 608.167), spot (0, 9), walking right, to (160, 545.988), spot (2, 8), idle. Other enemies changed position as well. The original (0, 12) case is now prevented at spawn, rather than escaped from by violating collision.

The browser read-only evaluate snapshot cached canvas attributes, so final live samples used locator.getAttribute('data-navigation-debug') for fresh runtime data.

## Concurrent work

Other tasks were modifying awareness, character facing, grid occupancy, and rendering during implementation. Those edits were preserved. C054 uses the current shared spatial helper. Existing alert ownership can supersede normal patrol; the new alert policy is maintained by its separate change.
