# C057 verification

- Initial regression run: `node --test test/characters/attack-preparation.test.js` reproduced premature attacks (64 failures, 2 passes before implementation).
- Final focused run: all 454 tests under `test/characters` and `test/systems/perception` passed. This includes the expanded 79-case preparation suite, existing adjacency/animation/recovery coverage, and actual production actor adapters.
- The final-movement Archer range regression was independently observed failing, then passing after eligibility was rechecked from the arrived position.
- `npm run build` passed. Strict OpenSpec validation passed for C057 and the reconciled C056 delta.
- A broad `.test.js` sweep recorded 736 passes and 6 failures in separate damage/spawn work: four tests in `test/gameplay/player-damage.test.js` and two in `test/gameplay/spawn-animation.test.js`. The damage tests appeared during this session; the initial broad run already failed the spawn attachment source assertion. These are not a claim of a clean repository-wide gate. Bare `node --test` also discovers the existing browser-only harness and fails on its use of `location`; the harness is verified in a browser instead.

## Browser observations

Used the running local Vite server and production sprite/animation/controller/projectile harness:

`http://127.0.0.1:5173/test/browser/adjacent-player-attack.html?startX=-20&startY=-12&duration=0.45`

- At 0.15 seconds, all 16 combat actors (four types across four awareness states) were walking toward their own centers with zero attacks.
- At 0.45 seconds, all 16 had started one attack. Every recorded aim and attack position equaled that actor's exact cell center. Visible Goblin swing, Warrior swing, Lancer thrust, and Archer shooting poses were inspected.
- At 1 second, all four Archers had released one arrow, with rendered arrows visible. No actor moved during a committed attack.
- All four Monks recorded zero attack starts and zero heals.

The harness now records attack and aim centers and accepts initial pixel offsets for repeatable verification. C056's pending enemy-actors delta was reconciled to distinguish immediate attack acceptance from the centering phase required by C057; its adjacency priority and exclusions remain intact. The main specification does not yet contain C056's adjacency requirements, so no premature synchronization or archive was performed.
