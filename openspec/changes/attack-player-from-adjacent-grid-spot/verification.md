# C056 verification

## Implementation

- Shared adjacency arbitration reads the current actor/player GridSpots before navigation in every awareness state. It does not require detection or change awareness.
- Goblin attacks retain controller-owned recovery, prioritize the adjacent player, and allow repeat swings. Warrior and Lancer use their attack APIs. Archer captures the target through its existing shooting lifecycle.
- Monk has no adjacency attack adapter and no automatic healing behavior.
- Main-loop wiring supplies living-player snapshots; snapshots passed to the Archer also now carry the player's actual alive state.
- Concurrent Lancer directional attack and heading changes in the working tree were preserved and included in final tests.

## Automated evidence

- Before implementation: `node --test test/characters/adjacent-player-attack.test.js` produced **74 failures / 53 passes**, with the new attack assertions failing against the original behavior. Evidence: `.c056-regression-before.log`.
- Final focused coverage includes 152 tests: four combat types and Monk across four offsets and all four awareness states; negative offsets; death/disposal/pause; action locks; repeated attacks; captured Archer target and release; configurable grid size; non-centered positions; alert entry; navigation and blocked-wait interruption; Goblin priority and exact recovery timing; Lancer directional rendering and heading locks.
- `node --test test/characters/*.test.js test/systems/perception/*.test.js`: **375 passed, 0 failed**. Evidence: `.c056-related-tests.log`.
- `npm run build`: passed.
- `openspec validate attack-player-from-adjacent-grid-spot --strict`: passed.
- Scoped `git diff --check`: passed (Git reports normal LF/CRLF conversion warnings).

## Browser evidence

Live Vite URL: http://localhost:5173/.

The reusable scene at `/test/browser/adjacent-player-attack.html` loads production enemy actors, animation atlases, awareness/patrol/Goblin controllers, and the production projectile renderer. Static player sprites use the production player atlas and authoritative GridSpot snapshots. It renders all five enemy types in each of the four awareness states.

Run with a Playwright CLI session:

```powershell
npx --yes --package @playwright/cli playwright-cli -s=c056 open http://localhost:5173/test/browser/adjacent-player-attack.html
npx --yes --package @playwright/cli playwright-cli -s=c056 run-code --filename=test/browser/check-adjacent-player-attack.cjs
```

All **80 browser scenarios passed** (5 types x 4 states x 4 directions). Each combat enemy started on its first active update, performed at least three attacks during the four-second scenario, and never moved during an attack. Archer arrows released without duplicate shots. Monk recorded zero attacks and zero heals. Real sprite and arrow rendering was inspected in screenshots, including the Lancer's upward thrust. Evidence: `.c056-browser-results.log` and `.c056-browser-1-0.png`, `.c056-browser--1-0.png`, `.c056-browser-0-1.png`, `.c056-browser-0--1.png`.

The fixture clamps its initial animation-frame delta to zero to avoid a browser timestamp preceding the setup timestamp; it samples the first positive update. No runtime gameplay workaround was needed.

Main-game smoke check: loaded the normal page, clicked Start, confirmed six registered perception actors and live navigation snapshots (including Monk patrol), and observed zero console errors.

## Existing combat limitations

This change triggers existing attacks; it does not expand hitboxes or alter damage. Main-game melee damage still requires combat-collider overlap. Archer projectiles retain their existing non-colliding ballistic trajectory and landing behavior, including their existing horizontal travel for vertically located targets. The controlled scene verifies initiation, animation, release, and recovery rather than changing those damage rules.
