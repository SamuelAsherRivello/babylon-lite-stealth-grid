## Context

See proposal.md - Why. The current character modules duplicate sprite transforms, art offsets, collider coordinates, scaling corrections, and lifecycle handling. The repository already has shared collider and spatial utility functions, but actor-level rendering remains divergent, especially for Monk and Lancer.

## Goals / Non-Goals

**Goals:**

- Establish a shared actor core and canonical character definition.
- Keep logical placement centered on the quantized grid cell.
- Separate shared spatial/rendering responsibilities from unique behavior modules.
- Represent movement geometry and art placement as explicit per-character overrides.
- Make all spatial consumers derive from the same contract.

**Non-Goals:**

- No combat-collider scaling override yet.
- No art-file renames or asset reauthoring.
- No redesign of character AI, attacks, healing, defense, or perception rules.
- No local-only correction for Monk or Lancer.

## Decisions

### Canonical definition

Create a character definition containing frame/display dimensions, animation catalog, logical geometry, default `{ x: 0, y: 0 }` art offset, and skeletal movement-collider overrides. Keep the one-grid-cell combat rectangle in shared spatial logic rather than duplicating it per character.

This is preferred over retaining constants in each actor because constants currently drift between rendering, collider, spawner, and diagnostics paths.

### Shared actor core with behavior hooks

Move sprite-layer creation, sprite transforms, animation selection plumbing, visual-transform updates, and disposal into a reusable actor core. Character modules provide behavior hooks and action-specific state machines. This preserves unique behavior without allowing each actor to redefine spatial math.

This is preferred over only extracting utility functions because utility-only sharing would leave lifecycle and transform duplication in place.

### Logical center and artwork transform

Treat the grid-cell center as the logical position and movement-circle center. Compute artwork placement from that position, the frame/display size, and the definition's pivot/alignment data. Apply the art offset only in the visual transform, never to gameplay position or collider geometry.

### Universal combat collider

Derive the red combat collider centrally from the grid cell: grid-sized and bottom-aligned. Leave a future scale override out of the definition until a separate requirement exists.

### Migration order

First implement and test the shared definition and transform/collider calculations. Migrate the reference Goblin, then Player, Sheep, Archer, Warrior, Lancer, and Monk. Migrate spawner markers and diagnostics after the actor contract is stable, then remove duplicated actor-level spatial calculations.

## Risks / Trade-offs

- [Risk] Existing animation frames may contain different transparent padding. -> Mitigation: retain explicit per-character pivot/art-offset overrides and validate every animation catalog against the definition.
- [Risk] Migrating all actors can expose behavior assumptions tied to old positions. -> Mitigation: preserve behavior APIs and add per-character regression tests for position, colliders, animation transforms, and lifecycle.
- [Risk] Existing tests may assert implementation-specific constants or source structure. -> Mitigation: update tests toward observable spatial-contract behavior while preserving valid compatibility surfaces.
- [Risk] The dirty working tree contains unrelated changes. -> Mitigation: isolate edits to the approved refactor scope and inspect the diff before implementation verification.

## Migration Plan

1. Add the shared contract and focused unit tests without changing art assets.
2. Migrate characters incrementally, validating each against the grid-center and collider rules.
3. Migrate spawners, diagnostics, and spatial consumers.
4. Run the complete test suite and browser smoke test with all character types.

Rollback is by reverting the implementation change; art files and level-authored spawner data remain unchanged.
