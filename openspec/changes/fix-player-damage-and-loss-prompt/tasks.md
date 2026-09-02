## 1. Combat hit registration

- [x] 1.1 C058-T001 Re-read C056/C057 integration and add failing behavioral regressions for adjacent melee damage, successive swings, misses, multiple attackers, and the 100→75→50→25→0 sequence; verify failures reproduce missing hits without relying on source-text assertions.
- [x] 1.2 C058-T002 Connect Goblin, Warrior, and Lancer committed swing identities and impact events to directional player hit testing; replace player melee contact deduplication and verify the new regressions pass with no idle/recovery or Archer contact damage.
- [x] 1.3 C058-T003 Enable gameplay Archer projectile collision and player targeting with stable ownership, 25 damage, and immediate single-hit removal before landing; test visible arc collision during ascent, descent, final pre-landing travel, and long frames; verify real projectile-path tests for enemy hits, self-hit exclusion, mixed-source lethal damage, and unchanged other-target/Warrior-defense behavior.

- [x] 1.4 C058-T009 Add source-specific, distance-based player knockback for Goblin/Archer/Warrior/Lancer (0.25/0.5/0.75/1 grid cell); verify measured displacement at multiple frame rates, direction, obstacle limits, input suppression, replacement by a later hit, and lethal-hit travel completing during death.

## 2. Defeat lifecycle and prompt

- [x] 2.1 C058-T004 Add failing state/lifecycle tests for lethal and overkill damage, disabled input, 250 ms death completion, pause/resume, same-frame goal conflict, duplicate events, and completion before actor removal; verify they reproduce the absent loss transition.
- [x] 2.2 C058-T005 Implement dying/lost states and combat completion signaling before spawner removal, then pause after animation completion; verify lifecycle regressions pass and missing pre-spawn player records do not trigger loss.
- [x] 2.3 C058-T006 Reuse the level prompt presentation with You Lost / Try again! / Continue, focused keyboard-operable reload action, and a non-dismissable loss backdrop; verify dialog tests preserve win defaults and expose exactly one loss prompt.

## 3. Integrated verification

- [x] 3.1 C058-T007 In a real browser, verify successful hits from each combat enemy, ranked knockback distances including a full-cell Lancer push, death after four 25-damage hits, visible intermediate death frames before the loss dialog, frozen gameplay afterward, Continue restarting at 100 health, and the existing win flow; record concrete results and screenshots.
- [x] 3.2 C058-T008 Run relevant combat, projectile, actor, state, pause, and UI tests plus the production build; validate this OpenSpec change strictly and record outcomes with any remaining limitations.


## 4. Grounded arrow lifecycle

- [x] 4.1 C058-T010 Reconcile the existing owner-pickup implementation with the full flight/landing contract; add failing regressions for same-update hit-versus-landing order, harmless grounded overlaps, owner death, and persistence beyond initial rendering capacity. Preserve and rerun both-facing owner-only pickup regressions.
- [x] 4.2 C058-T011 Complete grounded-only combat collider routing to the living firing Archer, immediate collider deactivation, gold-style 50px rise and fade over 0.18 seconds before sprite removal, one temporary bush sound, and collider diagnostics; keep grounded arrows out of all damage, defense, blocking, and other interaction routes.
- [x] 4.3 C058-T012 Replace oldest-landed-arrow capacity eviction with expandable or additional sprite capacity; verify uncollected arrows persist and new arrows can fire beyond 32 records, with ordinary level disposal cleaning all resources.
- [x] 4.4 C058-T013 Verify in a real browser that flight hits visibly damage the player and disappear before landing, missed arrows persist, other entities cannot interact, and only the owner walking over a grounded arrow triggers its gold-style rise and fade with one bush sound. Include collider display and capacity persistence checks.
