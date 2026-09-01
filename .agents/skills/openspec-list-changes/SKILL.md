---
name: openspec-list-changes
description: List active and archived OpenSpec changes with stable IDs and task progress, assigning missing legacy IDs safely.
allowed-tools: Bash(openspec:*)
license: MIT
---

List project OpenSpec changes and maintain their canonical identities. By
default, list only `OPEN` changes. To show more, the user may invoke this skill
again with `All` or `archived`.

## Canonical IDs

- Change IDs are exactly `C` followed by three digits, such as `C001`.
- Task IDs are exactly `<change-id>-T` followed by three digits, such as
  `C001-T001`.
- IDs are stored in `.openspec.yaml` and inline in `tasks.md`.
- Names remain preferred for human-facing output, but IDs are permanent
  identity and survive renames and archiving.

## Steps

1. Parse the optional scope argument. With no argument, use `OPEN` scope. Use
   `All` for active and archived changes, or `archived` for archived changes
   only. Treat scope matching as case-insensitive.
2. Find the nearest OpenSpec root and scan both `openspec/changes/` and
   `openspec/changes/archive/` without relying on CLI listing order.
3. Read every `.openspec.yaml`. Classify a change as archived only when its
   path is under the archive directory.
4. Validate all existing change IDs and task IDs before writing anything:
   - change IDs match `^C\d{3}$` and are globally unique;
   - task IDs match `^C\d{3}-T\d{3}$`;
   - each task ID's change prefix matches its parent change;
   - task IDs are unique within their parent change;
   - task IDs are attached to actual checkbox tasks, not headings or prose.
5. If any invalid, duplicate, malformed, mismatched, or orphaned ID exists,
   stop without assigning or writing any IDs and report every violation.
6. For pre-2026-09-01 changes without IDs, sort by ascending `created` date,
   then current change name using a deterministic ordinal comparison. Assign
   the next unused `C###` value and persist it in `.openspec.yaml`.
7. For tasks without IDs, use their existing checkbox order in `tasks.md` and
   assign the next unused `T###` value for that change. Persist the ID at the
   beginning of the checkbox description.
8. Do not alter valid existing IDs. If a legacy change lacks a reliable
   `created` date, stop and report it rather than guessing.
9. Filter the validated changes according to the requested scope. With the
   default scope, exclude archived changes.
10. Re-scan and validate after writes. Then calculate synchronization. For each
   delta spec, locate the corresponding main spec under the resolved
   `openspec/specs/` root. Display `Synched: Yes` only when every delta
   requirement is represented in the main spec. Display `Synched: No` when a
   main spec is missing, a delta is unapplied, or the comparison is not
   conclusive. A change with no delta specs is `Synched: Yes`. Report a brief
   diagnostic after the table for any `No` result, but continue listing.
11. Display rows sorted by descending numeric change ID using this exact table:

| ID   | Name                       | Status | Synched | Tasks |
| ---- | -------------------------- | ------ | ------- | ----- |
| C001 | example-change             | OPEN   | Yes     | 2/3   |

12. When the default `OPEN` scope is used and archived changes exist, append:
   `Call again with "All" or "archived" to see more.`

## Input Resolution

Other OpenSpec skills may accept either a name or `C###`. Names are the
preferred interface. When an ID is supplied, resolve it by scanning metadata,
then pass the current change directory/name to the OpenSpec CLI.

## Safety

This workflow may write only missing IDs during migration. It must not rename,
archive, delete, reorder, or rewrite unrelated OpenSpec content. It must stop
on identity conflicts and must report the exact files and IDs involved.
