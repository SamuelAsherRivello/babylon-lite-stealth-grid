## Purpose

Define a compact and reliable OpenSpec change table that makes canonical identity, lifecycle state, synchronization state, and task progress immediately visible.

## ADDED Requirements

### Requirement: Display the canonical change table
The listing workflow SHALL display changes in a table with exactly the columns `ID`, `Name`, `Status`, `Synched`, and `Tasks`.

#### Scenario: Display an open change
- **WHEN** an open change has ID `C035`, name `improve-openspec-list-changes`, and ten completed tasks out of ten
- **THEN** the table displays `C035`, the name, `OPEN`, the synchronization value, and `10/10`

### Requirement: Sort changes in descending ID order
The listing workflow SHALL sort rows by descending numeric canonical change ID across both open and archived changes.

#### Scenario: Newer change appears first
- **WHEN** changes `C001` and `C035` are present
- **THEN** the row for `C035` appears before the row for `C001`

### Requirement: Report lifecycle status
The listing workflow SHALL display `OPEN` for changes outside the archive directory and `ARCHIVED` for changes inside the archive directory.

#### Scenario: Archived change status
- **WHEN** a change is located under `openspec/changes/archive/`
- **THEN** its status is `ARCHIVED`

### Requirement: Report synchronization status
The listing workflow SHALL display `Synched: Yes` when every delta spec matches its corresponding main spec or when the change has no delta specs, and SHALL display `Synched: No` when a delta spec is unapplied or its main spec is missing.

#### Scenario: Missing main spec
- **WHEN** a change has a delta spec without a corresponding main spec
- **THEN** its row displays `Synched: No` and the listing continues

### Requirement: Display compact task progress
The listing workflow SHALL display completed checkbox tasks and total checkbox tasks as `X/Y`.

#### Scenario: Change has no tasks
- **WHEN** a change has no checkbox tasks
- **THEN** its row displays `0/0`
