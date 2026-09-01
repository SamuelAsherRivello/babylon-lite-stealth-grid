## 1. Update listing contract

- [x] `C035-T001` Update `openspec-list-changes/SKILL.md` to use the exact `ID`, `Name`, `Status`, `Synched`, and `Tasks` columns and descending numeric ID order; verify the documented example matches the required output.
- [x] `C035-T002` Define `OPEN`/`ARCHIVED`, compact `X/Y` task counts, and `Synched` semantics including no-delta and missing-main cases; verify the skill documents all states.

## 2. Implement synchronization reporting

- [x] `C035-T003` Add delta-to-main spec comparison guidance and diagnostics; verify a missing main spec reports `Synched: No` without stopping the listing.
- [x] `C035-T004` Preserve canonical-ID validation and legacy migration behavior while changing only listing presentation and synchronization reporting; verify existing valid IDs remain unchanged.

## 3. Verify output

- [x] `C035-T005` Generate the complete repository listing and verify rows are in descending ID order with the exact five columns and compact task counts.
- [x] `C035-T006` Run `openspec validate --all --strict` and `git diff --check`; verify all OpenSpec validation passes and no application-code files are changed.
