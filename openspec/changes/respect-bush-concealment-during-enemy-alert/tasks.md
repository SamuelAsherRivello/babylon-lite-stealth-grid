## 1. Concealment and tracking

- [x] 1.1 C060-T001 Add regression tests for hidden attack suppression and bounded tracking; verify failures before implementation.
- [x] 1.2 C060-T002 Implement shared concealment eligibility and visually confirmed tracking without timer refresh; verify focused reaction and policy tests.
- [x] 1.3 C060-T003 Integrate eligibility into all enemy attack decisions and preparation, and occupied-bush blockers into runtime navigation and collision; verify roster, fallback and cancellation tests.

## 2. Integration verification

- [x] 2.1 C060-T004 Verify visible behavior with production actors in a browser, run relevant automated tests and production build, and validate the OpenSpec change.

Verification: `node --test test/characters/adjacent-player-attack.test.js` reproduced 17 failures before implementation and passed all 173 tests afterward. The focused run passed 308 tests; the related character, perception and gameplay run passed 574 tests. An additional route/physical bush-blocking regression passed in the 8-test player-hidden suite. `npm run build` passed. The production game started in a browser without script errors. `test/browser/check-bush-concealment.cjs` passed all 20 rendered roster/state cases: only the visually alerted row attacked, no new attack started after expiry, and no enemy entered its protected occupied bush. Screenshot: `output/playwright/c060-bush-concealment.png`.
