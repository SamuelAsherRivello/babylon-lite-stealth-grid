## Context

See `proposal.md` for the motivation. The repository currently stores OpenSpec changes in active and archived directories, with `.openspec.yaml` metadata and Markdown task lists. The project-local skills use change names and task descriptions as their practical references, and the OpenSpec CLI continues to address changes by name.

## Goals / Non-Goals

**Goals:**

- Establish one persistent `C###` identity for every change.
- Establish persistent `C###-T###` identities for every task.
- Make legacy ID assignment deterministic and safe.
- Let skills accept IDs while retaining names as the preferred interface.
- Preserve compatibility with the name-based OpenSpec CLI.

**Non-Goals:**

- Declaring or scheduling cross-change dependencies.
- Implementing concurrent application of changes.
- Changing the OpenSpec CLI itself.
- Renaming existing changes or rewriting their planning content.

## Decisions

### Store IDs with the objects they identify

Change IDs will be stored as `id: C###` in `.openspec.yaml`. Task IDs will be inline at the beginning of each task description in `tasks.md`. This keeps identity alongside the object and ensures archive moves preserve it without a separate registry.

### Use deterministic legacy migration

`openspec-list-changes` will scan active and archived changes before assigning missing IDs. Legacy changes will be ordered by ascending `created` date, with alphabetical current-name tie-breaking. Missing task IDs will follow the existing task order. The resulting values will be persisted and never regenerated.

### Keep names as the primary interaction surface

Skills will accept either a name or ID. Names remain preferred in prompts and tables because they are readable; IDs will be shown alongside names and used as the stable internal identity. When invoking the CLI, a resolved ID will be converted to the current change name.

### Fail closed on invalid identity data

The listing and migration workflow will validate all existing IDs before writing any new IDs. Duplicate, malformed, mismatched, or orphaned IDs will stop the operation and produce actionable diagnostics. Automatic repair is intentionally excluded to protect established identity.

### Preserve task identity through edits

Task IDs will not be derived from position after initial assignment. Reordering, editing, checking off, or archiving a task will preserve its ID. New tasks receive the next unused task number for their parent change.

## Risks / Trade-offs

- [Legacy files lack reliable creation dates] → Require an explicit deterministic fallback and report the basis used in the migration summary.
- [Human edits can create malformed IDs] → Validate before assignment and stop on errors.
- [CLI remains name-based] → Resolve IDs to names at the skill boundary and continue passing names to the CLI.
- [Task wording format changes] → Keep the ID as a distinct inline token and update task parsing rules consistently across apply, list, and creation workflows.

## Migration Plan

1. Update the project-local skills and OpenSpec guidance to define the ID formats and lifecycle rules.
2. Implement `openspec-list-changes` so its first successful run assigns IDs to all pre-2026-09-01 changes and tasks.
3. Validate the migration, then use the listing output as the inventory of assigned IDs.
4. Future creation and task-generation paths assign IDs immediately.

## Open Questions

None. Dependency declaration and concurrent scheduling are intentionally deferred to a later change.
