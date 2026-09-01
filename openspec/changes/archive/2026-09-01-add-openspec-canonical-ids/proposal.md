## Why

OpenSpec changes currently use mutable names as their practical identity, which makes it difficult to track a change after it is renamed, archived, or referenced by future concurrent workflows. This change introduces permanent change and task identifiers so listings, skill invocations, and later dependency-aware tooling can refer to stable objects while retaining human-readable names.

## What Changes

- Add a permanent change ID in each change's `.openspec.yaml`, using the format `C###` such as `C001`.
- Add permanent task IDs to `tasks.md`, using the format `C###-T###` such as `C001-T001`.
- Add an `openspec-list-changes` skill that lists active and archived changes in a table and assigns missing IDs to legacy changes and tasks.
- Assign legacy change IDs deterministically by creation date, with alphabetical name tie-breaking.
- Assign legacy task IDs according to their existing order in `tasks.md`.
- Assign IDs during creation for all new changes and tasks created from 2026-09-01 onward.
- Preserve IDs across change renames, task edits, task reordering, and archiving.
- Allow existing OpenSpec skills to accept either a human-readable change name or its canonical ID, while keeping names as the preferred user-facing interface.
- Treat duplicate, malformed, mismatched, or otherwise invalid existing IDs as errors and stop ID assignment until resolved.
- Defer dependency declaration and scheduling to a future change; IDs provide the stable references needed by that future work.

## Capabilities

### New Capabilities

- `openspec-canonical-ids`: Provides permanent identifiers for changes and tasks, including legacy migration and validation behavior.
- `openspec-list-changes`: Provides a table view of active and archived changes with IDs, names, archive state, and task progress.

### Modified Capabilities

None. Existing OpenSpec skills will be updated as implementation impact so they
can resolve and preserve the new canonical IDs; they do not currently have a
corresponding main capability spec to modify.

## Impact

- Affected project-local OpenSpec skills under `.agents/skills/`.
- Affected OpenSpec change metadata files under `openspec/changes/`.
- Affected task documents under active and archived changes.
- Affected project OpenSpec configuration and validation conventions.
- No new runtime dependencies or application-code changes are expected.
