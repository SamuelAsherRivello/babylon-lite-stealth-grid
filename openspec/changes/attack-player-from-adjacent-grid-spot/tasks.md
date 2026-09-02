## 1. Regression coverage

- [x] 1.1 C056-T001 Add behavior tests for Goblin, Warrior, Lancer, and Archer at each of four cardinal offsets in all four awareness states, including undetected players and alert entry; run them against current code and record failures caused by missing adjacency attacks.
- [x] 1.2 C056-T002 Add negative and lifecycle coverage for diagonal/same-cell/distant positions, non-centered GridSpot positions, configurable grid size, dead/absent player, dead/disposed enemy, pause, protected actions, recovery, repeated attacks, stale targets, and Monk non-combat behavior; verify failures distinguish the new rule from existing ranged behavior.

## 2. Shared attack priority

- [x] 2.1 C056-T003 Integrate a shared authoritative-GridSpot adjacency decision with living-player snapshots before awareness navigation; verify attacks interrupt patrol, investigation, pursuit, and blocked waiting without changing perception state or bypassing locks.
- [x] 2.2 C056-T004 Route Goblin adjacency attacks through its combat controller, prioritize the player over new alternate targets, and permit repeats after existing recovery; verify recovery advances once per update and existing committed sheep/bush attacks remain atomic.
- [x] 2.3 C056-T005 Connect Warrior and Lancer directional attack adapters and Archer captured-target shooting to the shared decision; verify the roster/state tests pass and Archer releases at most one arrow per animation with its existing recovery.
- [x] 2.4 C056-T006 Keep Monk excluded from adjacency combat and automatic healing; verify its existing patrol and awareness tests plus adjacent-player tests pass in every state.

## 3. Integrated verification

- [x] 3.1 C056-T007 Run the regression tests from section 1, relevant character/perception tests, and `npm run build`; record commands and results and resolve regressions attributable to this change.
- [x] 3.2 C056-T008 Verify the game in a real browser with controlled placements: rendered attacks for all four combat enemies across cardinal adjacency and awareness states, movement locked during attacks, repeat after recovery, and Monk patrol/alert behavior without attack/heal. Record evidence in verification.md, including any existing damage or projectile limitations.
