# OpenSpec sync and archive review — 2026-09-02

Reviewed the 21 changes active at the start of this run. Applied unambiguous deltas from 14 changes; four others were already represented by main specs or superseded by later requirements. Three conflicting changes remain pending. Syncing specifications does not mark unfinished implementation tasks complete.

## Archived after sync verification

All nine changes use the `spec-driven` schema and had every task checked. Their files, change IDs, and task IDs were preserved and checked after moving into `openspec/changes/archive/2026-09-02-<name>/`.

| ID | Change |
| --- | --- |
| C039 | unify-viewport-root-scaling |
| C042 | reorganize-settings-menu |
| C043 | update-physics-for-characters |
| C047 | rename-pickup-state |
| C049 | add-perception-escalation |
| C053 | add-gold-counter |
| C053 | prevent-enemy-walking-into-occupied-cells |
| C054 | shared-blocked-movement-recovery |
| C055 | stop-and-redecide-on-enemy-alert |

Movement specs combine cardinal alignment, occupancy rules, and shared recovery. Older movement and pickup MODIFIED blocks were reconciled with the merged requirements so they preserve newer scenarios. Settings retain focus and backdrop behavior alongside the nested developer window.

## Pending conflicts

- **C045 — add-character-perception-debug-rendering:** the delta requires 80% active blink opacity; the current main requirement says 100%, while its own scenarios still say 80%. The delta also lacks the main spec's range fade. Decide the intended active opacity before syncing.
- **C046 / C050 hidden-player conflict resolved:** the user confirmed that players hiding in bushes are not audible. C050 now explicitly excludes hidden players from both channels before audio geometry checks and has been synced and archived. C046 remains active with unfinished implementation tasks.
- C050 preserves movement-heading scenarios and renames the old unblocked audio requirement to a filtered audio requirement. C051's visual delta was reconciled to preserve the newly synced blocker scenarios.

## Identity issues

Existing IDs were preserved as required by the sync/archive skills. C052 is shared by `add-start-game-prompt` and `quantized-enemy-movement-on-one-axis`; C053 is shared by the two archived changes above. `universal-grid-spot-occupancy` and `add-runtime-enemy-vision-shadows` have no change ID. Standard OpenSpec validation does not flag these identity issues.

## Validation and scope

Final `openspec validate --all --strict --json`: **57 passed, 0 failed** — 44 main specs and 13 active changes. Main-spec-only strict validation also passed. These checks validate specification structure, not gameplay implementation or resolution of contradictory prose.

Eleven originally active changes retain unchecked tasks and remain open. C050 is complete but remains open pending the perception conflict. `attack-player-from-adjacent-grid-spot` appeared during this run and was left untouched; it accounts for the thirteenth active change. No application code or implementation task checkboxes were changed by this sync/archive work.

## C050 follow-up

Archived `add-perception-blocking` (C050) to `changes/archive/2026-09-02-add-perception-blocking/` after verifying every delta requirement and all moved file hashes. The runtime already excluded hidden players from both detection channels; 19 existing focused perception/hiding tests passed. All 44 main specs pass strict validation. The final full validation snapshot had 59 passes and one unrelated failure: the concurrently created `respect-bush-concealment-during-enemy-alert` had no delta specs yet. That active work was left untouched. Ten changes have now been archived across this workflow.
