# C058 verification - 2026-09-02

All 13 tasks implemented. No commit or archive performed.

## Automated evidence

- Test-first runs failed for missing swing events and defeat transitions (`test/gameplay/player-damage.test.js`), distance impulses (`test/gameplay/player-knockback.test.js`), three flight-hit cases, persistence beyond 32 arrows, and loss-dialog behavior (`projectile-renderer.test.js`, `level-complete-ui.test.js`). Those same cases now pass.
- Focused combat/projectile/actor/state/UI run: 276 passed. A subsequent final run of 24 tests also includes the added ownership regression and passes.
- Full `node --test`: 758 passed, 3 failed, 761 total. Unrelated failures: browser-only `test/browser/adjacent-player-attack.js` and `test/browser/bush-gravity.js` access browser globals under Node; `test/gameplay/spawn-animation.test.js` requires a comment immediately after renderer attachment despite existing expression initialization between them. No C058 behavior test failed.
- Production build, strict OpenSpec validation, and scoped whitespace checks passed.

## Real WebGPU browser evidence

The fixture imports production actors, player rendering/input, combat lifecycle, player damage routing, projectile rendering, audio playback, collider diagnostic commands, state machine, and level prompt. The normal game at http://localhost:5173 also started and ran with no application console errors.

Run `npx.cmd --yes --package @playwright/cli playwright-cli -s=c058 run-code --filename=test/browser/check-player-combat.cjs`.

- Four actual attacks for each combat enemy reduced health from 100 through 75, 50, 25, and 0. Archer hits consumed their arrows immediately.
- Nonlethal and lethal displacement measured 16/32/48/64 pixels for Goblin/Archer/Warrior/Lancer, within 0.01px floating-point tolerance.
- Screenshots show the player shrinking and fading halfway through death before the loss dialog. Pause freezes the effect; completion occurs once; terminal simulation stays frozen; Continue reloads at 100 health. Existing win copy also verified.
- Forty missed arrows remained visible, grew the layer capacity to 64, and survived unrelated-character overlap and owner death. Owner overlap removed all 40 with exactly 40 successful bush audio playbacks.
- `test/browser/check-arrow-pickup.cjs` additionally verified an Archer walking into one grounded arrow, one removal/one sound, input-resistant 64px knockback, a thin-wall-limited 19.6667px push, and the shared production player-hit route reducing health to 75.

Logs: `output/playwright/c058-browser-results.log`, `c058-walk-and-wall.log`, `c058-focused-tests.log`, `c058-final-tests.log`, and `c058-full-tests.log`.

Screenshots: `output/playwright/c058-{goblin,warrior,lancer,archer}-{dying,lost}.png`, `c058-grounded-capacity.png`, `c058-picked-up.png`, and `c058-walk-pickup.png`.

Chromium reports its usual Windows powerPreference warning. A fixture favicon request returned 404; neither affected gameplay checks.

## Pickup animation follow-up

The user replaced immediate pickup sprite removal with the gold rise/fade effect. Gold and arrows now share `pickup-animation.js`: 50px linear rise and fade over 0.18 active seconds. The arrow collider disables and bush sound plays at collection start. The frozen crop remains visible while fading; the sprite is removed at completion. Both-facing regressions failed before the change and passed afterward. `check-arrow-pickup-animation.cjs` passed in WebGPU, confirming visible midpoint, disabled pickup collider, one sound, and eventual removal. Screenshot: `output/playwright/c058-arrow-pickup-midpoint.png`. Earlier immediate-removal evidence above describes the superseded behavior.
