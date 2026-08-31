# release-metadata-display Specification

## Purpose
Provide visible, deployment-specific release identity and total uncompressed browser-build size without preventing the stealth-grid game from starting when metadata is absent or invalid.

## Requirements

### Requirement: Release metadata loads relative to the deployed application
The system SHALL request `environment.json` relative to the application's configured deployment base and SHALL bypass cached metadata when making that request.

#### Scenario: Versioned deployment loads its own metadata
- **WHEN** the game is served from a nested or versioned deployment path
- **THEN** the metadata request targets `environment.json` beneath that same deployment base with caching disabled

### Requirement: Release versions use an exact three-component tag
The system SHALL accept release versions only in the form `v<major>.<minor>.<patch>`, SHALL normalize an uppercase leading `V` to lowercase, and SHALL use `v0.0.0` when the supplied version is absent or invalid.

#### Scenario: Valid release version is displayed
- **WHEN** metadata supplies `v0.1.7` or `V0.1.7`
- **THEN** the resolved release version is `v0.1.7`

#### Scenario: Invalid release version falls back locally
- **WHEN** metadata supplies an incomplete, prerelease, non-string, or otherwise invalid version
- **THEN** the resolved release version is `v0.0.0`

### Requirement: Download size is formatted from total uncompressed bytes
The system SHALL interpret a finite, non-negative numeric byte count, including a non-empty numeric string, as decimal megabytes rounded to one fractional digit and suffixed with `Mb`. The system SHALL omit the size when the value is absent, empty, non-numeric, negative, or non-finite.

#### Scenario: Known download size is formatted
- **WHEN** metadata supplies `12300000` bytes
- **THEN** the formatted download size is `12.3Mb`

#### Scenario: Unknown download size is omitted
- **WHEN** metadata does not contain a valid non-negative byte count
- **THEN** no download-size text is produced

### Requirement: Metadata failure does not block game startup
The system SHALL resolve metadata request, response, and parsing failures to release version `v0.0.0` with no download size instead of propagating the failure.

#### Scenario: Metadata cannot be loaded
- **WHEN** the request is offline, receives a non-success response, or returns invalid JSON
- **THEN** startup continues with `v0.0.0` and an omitted download size

### Requirement: Release metadata appears as one proportional overlay line
The system SHALL render one non-interactive line in the existing game UI overlay. The line SHALL contain `<releaseVersion> <downloadSize>` when size is known and only `<releaseVersion>` when size is unknown, SHALL remain on one line, and SHALL size and position itself relative to the portrait game frame in its upper-left region.

#### Scenario: Published metadata is visible
- **WHEN** valid metadata resolves to version `v0.1.7` and size `12.3Mb`
- **THEN** the game overlay displays exactly `v0.1.7 12.3Mb` as one line without intercepting pointer input

#### Scenario: Local fallback is visible
- **WHEN** metadata resolves with no download size
- **THEN** the game overlay displays only `v0.0.0`

#### Scenario: Overlay scales with the game frame
- **WHEN** the game frame is viewed in large desktop and narrow portrait viewports
- **THEN** the metadata line preserves its upper-left relative position and proportional typography without using browser-viewport or fixed-pixel sizing for its composition

### Requirement: Release builds contain self-consistent metadata
The release workflow SHALL require an exact three-component release tag, write that tag and a fixed-width placeholder size before building, calculate the total uncompressed size of all files in the completed browser build, replace the placeholder with the same-width byte count, and verify that the replacement does not change the measured total.

#### Scenario: Release build records its exact total size
- **WHEN** a release tagged `v0.1.7` produces a browser build whose total file size fits the metadata field
- **THEN** the built `environment.json` contains release version `v0.1.7` and a twelve-digit download-size value equal to the final total uncompressed build size

#### Scenario: Invalid release tag is rejected
- **WHEN** the release workflow receives a tag that is not exactly `v<major>.<minor>.<patch>`
- **THEN** the workflow fails before building or publishing the browser app

### Requirement: Published releases remain addressable
The release workflow SHALL package the browser build as an immutable GitHub Release asset, assemble available versioned builds under their release tags, and publish root and `latest` entry points that direct users to the newly released version.

#### Scenario: New release is published
- **WHEN** the GitHub Release for `v0.1.7` is published successfully
- **THEN** the versioned `v0.1.7` build remains available and both the root and `latest` entry points lead to it
