## Purpose

Provides durable, validated, browser-local player preferences with safe defaults, immediate observation, and game-scoped reset behavior.

## ADDED Requirements

### Requirement: Versioned namespaced persistence
The game SHALL persist its settings in one versioned, game-namespaced browser-local document and SHALL make a successfully written setting available immediately and after a reload in the same browser storage context.

#### Scenario: Save a supported setting
- **WHEN** the player changes Music, SFX, or Collider
- **THEN** the running game immediately receives the new value
- **AND** the value is restored after a page reload

#### Scenario: Preserve unrelated storage
- **WHEN** the game writes or resets its settings while unrelated same-origin storage exists
- **THEN** unrelated storage keys remain unchanged

### Requirement: Validated settings and defaults
The game SHALL accept finite Music and SFX values from 0 through 100 and a boolean Collider value. A missing, malformed, wrong-version, wrong-type, or out-of-range value SHALL resolve to 100 for audio or false for Collider without preventing startup.

#### Scenario: Load corrupt storage
- **WHEN** the persisted settings document cannot be parsed or contains an invalid value
- **THEN** startup continues without an uncaught error
- **AND** each invalid setting uses its own default

#### Scenario: Storage is unavailable
- **WHEN** browser-local storage cannot be read
- **THEN** the game and Settings Menu remain usable with in-memory defaults

### Requirement: Immediate setting notifications
Consumers SHALL be able to subscribe to individual setting changes without polling browser storage.

#### Scenario: Observe a settings change
- **WHEN** a player changes or resets a setting
- **THEN** every subscriber for that setting receives the resolved value during the same interaction

### Requirement: Resilient writes
If browser-local storage rejects a write or removal, the game SHALL keep the current in-memory setting authoritative for the session and SHALL continue without an uncaught error.

#### Scenario: Persisting a change fails
- **WHEN** browser storage rejects a setting write
- **THEN** the changed value remains active for the current session
- **AND** the Settings Menu and gameplay remain usable

#### Scenario: Reset removal fails
- **WHEN** browser storage rejects removal of the game-settings document
- **THEN** in-memory settings still return to defaults
- **AND** subscribers receive the default values

### Requirement: Category volume contract
Music and SFX settings SHALL define category multipliers for audio playback. New audio playback SHALL apply the current category setting, while the absence of an audio asset or active audio instance SHALL NOT cause an error.

#### Scenario: Create category audio
- **WHEN** audio playback is created while its category value is 40
- **THEN** its effective volume is 40 percent of that sound's configured base volume

#### Scenario: Project has no active audio
- **WHEN** the player adjusts Music or SFX before audio content is introduced or while none is playing
- **THEN** the setting is saved without an error
- **AND** later playback can consume the saved category value

