## Why

The current change listing format does not provide a compact, stable overview of identity, lifecycle, synchronization, and task progress. A descending canonical-ID listing with an explicit `Synched` column will make the repository's OpenSpec backlog easier to scan and reveal changes whose delta specs still need to reach the main specs.

## What Changes

- Sort all active and archived changes by descending canonical change ID.
- Use the exact columns `ID`, `Name`, `Status`, `Synched`, and `Tasks`.
- Use `OPEN` and `ARCHIVED` as status values.
- Display task progress compactly as `X/Y`.
- Calculate `Synched` by comparing every delta spec with its corresponding main spec.
- Treat changes with no delta specs as `Synched: Yes`.
- Treat missing main specs or unapplied delta content as `Synched: No` and continue listing.

## Capabilities

### New Capabilities

- `openspec-list-changes-output`: Defines the canonical table layout, sorting, status, synchronization, and task-progress display.

### Modified Capabilities

None. The existing `openspec-list-changes` skill is a project-local skill rather than a main OpenSpec capability spec.

## Impact

- Affected `.agents/skills/openspec-list-changes/SKILL.md`.
- May require read-only comparison of delta specs under active changes against main specs.
- No runtime dependencies or application-code changes are expected.
