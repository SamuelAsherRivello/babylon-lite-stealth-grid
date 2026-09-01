## 1. Define the identity contract

- [x] `C034-T001` Update `openspec/config.yaml` with the canonical change and task ID formats, lifecycle rules, legacy cutoff, and fail-closed validation policy; verify the configuration is valid YAML and documents `C###` and `C###-T###`.
- [x] `C034-T002` Update the project-local OpenSpec skills so names remain the preferred interface while IDs are accepted and resolved wherever change or task names are currently used; verify every affected skill documents ID resolution and preservation.

## 2. Implement change listing and migration

- [x] `C034-T003` Create the `openspec-list-changes` skill to scan active and archived changes, read metadata, and output the requested table; verify it lists ID, name, `Archived?`, and `Tasks (X of Y Done)`.
- [x] `C034-T004` Implement deterministic assignment and persistence of missing legacy change IDs using creation date and alphabetical tie-breaking; verify a dry-run fixture produces stable IDs across repeated runs.
- [x] `C034-T005` Implement assignment and persistence of missing legacy task IDs according to existing `tasks.md` order; verify IDs use the parent change prefix and remain stable after task reordering.
- [x] `C034-T006` Implement fail-closed validation for duplicate, malformed, mismatched, and orphaned IDs; verify invalid fixtures stop assignment and report actionable errors.

## 3. Integrate creation and workflow support

- [x] `C034-T007` Update change-creation and task-creation paths to assign IDs immediately for all new objects; verify newly created metadata and tasks contain valid IDs.
- [x] `C034-T008` Update archive, rename, apply, update, grill, and sync workflows to preserve IDs and resolve ID input to the current CLI change name; verify rename and archive fixtures retain identity.

## 4. Migrate and verify the repository

- [x] `C034-T009` Run `openspec-list-changes` against all current active and archived changes and persist IDs for legacy objects; verify all 33 pre-existing changes and their tasks have valid non-duplicated IDs.
- [x] `C034-T010` Run OpenSpec validation and targeted skill checks, then inspect the final diff; verify `openspec validate --all` passes and no implementation-code files were changed.
