# openspec-list-changes Specification

## Purpose

Provide a reliable table of active and archived OpenSpec changes using stable canonical IDs, human-readable names, archive state, and task completion progress.

## Requirements

### Requirement: List active and archived changes
The listing workflow SHALL display active and archived changes in a table containing ID, name, archive state, and task progress.

#### Scenario: Display changes
- **WHEN** the user requests a change listing
- **THEN** the workflow displays each active and archived change with its canonical ID, current name, `Archived?` state, and completed-versus-total task count

### Requirement: Resolve changes by ID or name
The OpenSpec workflows SHALL accept either a canonical change ID or the current human-readable change name wherever a change name is accepted.

#### Scenario: Resolve by ID after rename
- **WHEN** the user supplies `C001` after the change has been renamed
- **THEN** the workflow resolves and operates on the change's current name

#### Scenario: Prefer readable names in output
- **WHEN** a change is resolved successfully
- **THEN** the workflow displays both its canonical ID and current human-readable name

### Requirement: Preserve identifiers during listing
The listing workflow SHALL never alter existing valid change or task IDs.

#### Scenario: Repeated listing
- **WHEN** the listing workflow runs multiple times
- **THEN** valid IDs remain identical across all runs

