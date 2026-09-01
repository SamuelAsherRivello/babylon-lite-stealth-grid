# openspec-canonical-ids Specification

## Purpose

Provide permanent identifiers for OpenSpec changes and their tasks so they remain addressable when names change, changes are archived, or later workflows operate concurrently.

## Requirements

### Requirement: Changes have permanent canonical IDs
Every change SHALL have a unique canonical identifier in the format `C` followed by four digits, stored in its `.openspec.yaml` metadata.

#### Scenario: New change receives an ID
- **WHEN** a new change is created
- **THEN** its metadata contains a unique `C###` identifier

#### Scenario: Change is renamed
- **WHEN** the human-readable name of a change changes
- **THEN** its canonical identifier remains unchanged

#### Scenario: Change is archived
- **WHEN** a change is archived
- **THEN** its canonical identifier remains unchanged in the archived metadata

### Requirement: Tasks have permanent child IDs
Every task in a change's `tasks.md` SHALL have a unique identifier formed from its parent change ID, `-T`, and four digits.

#### Scenario: New task receives an ID
- **WHEN** a task is added to change `C001`
- **THEN** the task receives an available identifier such as `C001-T001`

#### Scenario: Task is reordered or edited
- **WHEN** a task is reordered or its wording changes
- **THEN** its task identifier remains unchanged

### Requirement: Legacy IDs are assigned deterministically
The system SHALL assign missing IDs to changes created before 2026-09-01 by ascending creation date with alphabetical name tie-breaking, and SHALL assign missing task IDs by their existing order in `tasks.md`.

#### Scenario: Legacy change has no ID
- **WHEN** the listing workflow finds a pre-2026-09-01 change without an ID
- **THEN** it assigns and persists the next deterministic unique `C###` identifier

#### Scenario: Legacy task has no ID
- **WHEN** the listing workflow finds a task without an ID
- **THEN** it assigns and persists the next `T###` identifier according to task order

### Requirement: Invalid IDs block migration
The system SHALL report duplicate, malformed, mismatched, or otherwise invalid existing IDs and SHALL stop ID assignment until the invalid state is resolved.

#### Scenario: Duplicate change ID
- **WHEN** two changes contain the same canonical ID
- **THEN** the workflow reports the duplicate and performs no ID assignment

#### Scenario: Mismatched task ID
- **WHEN** a task under change `C001` is labeled `C002-T001`
- **THEN** the workflow reports the mismatch and performs no ID assignment
