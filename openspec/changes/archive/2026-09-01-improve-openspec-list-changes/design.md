## Context

The existing `openspec-list-changes` skill already scans active and archived directories and maintains canonical IDs. Its output format and ordering need to be tightened, and synchronization must be derived from delta-to-main spec comparison rather than from whether a command was previously run.

## Goals / Non-Goals

**Goals:**

- Produce the exact five-column table requested by the user.
- Sort by descending numeric change ID.
- Derive `OPEN`/`ARCHIVED` from the filesystem location.
- Compare each delta spec with its main spec and fail soft for normal missing-main cases.

**Non-Goals:**

- Changing canonical IDs or migration rules.
- Syncing specs as part of listing.
- Archiving, renaming, or modifying change content.

## Decisions

- Use the existing canonical-ID scanner as the source of identity and task counts.
- Use exact table headers: `ID`, `Name`, `Status`, `Synched`, `Tasks`.
- Sort by parsed numeric ID descending, not lexical string order.
- Mark a change `Synched` only when all delta requirements are represented in the corresponding main spec. Missing main specs produce `No`, not a fatal listing error.
- Treat no delta specs as vacuously synchronized and display `Yes`.

## Risks / Trade-offs

- [Semantic comparison is more complex than file comparison] → Compare normalized requirement/scenario content and report mismatches diagnostically.
- [Archived directory names contain date prefixes] → Use the directory name as the displayed name because it is the current filesystem identity; preserve canonical ID as the stable identity.
- [A malformed spec could disrupt comparison] → Report the affected change as `Synched: No` and continue unless the canonical-ID validation itself fails.
