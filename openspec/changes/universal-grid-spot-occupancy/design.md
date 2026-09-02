## Context

See proposal.md - Why. The runtime currently derives cells in multiple places: character movement spatial helpers, bush snapshots, pickup destinations, and diagnostic assembly. Existing diagnostics already draw a small black center X for some records, but bushes are converted to whole-cell rectangles and pickups use ad-hoc center fields.

## Goals / Non-Goals

**Goals:**

- Establish one reusable occupancy object for all active gameplay entities.
- Preserve a continuous live world center for artwork and collider geometry.
- Quantize occupancy from configured grid dimensions without hardcoded half-cell gameplay constants.
- Centralize marker command creation and canvas rendering.
- Make gameplay cell reads agree with the diagnostic marker.

**Non-Goals:**

- Do not change movement speed, collision resolution, attack geometry, or rendering depth.
- Do not make the X follow the interpolated physical center.
- Do not deduplicate Xs when entities share a cell.
- Do not rename assets or add dependencies.

## Decisions

### Separate logical spot from live world center
Each entity supplies one authoritative live world center. A shared occupancy object stores the current quantized cell and derives its cell-center world coordinate for marker commands. Physical transforms continue using the live center. This is preferred over collider selection because characters expose multiple collider roles and decorative objects may have non-blocking sensors.

### Quantize relative to cell centers
The quantizer uses the configured grid width and height and a nearest-cell calculation with an explicit tie rule: an exact midpoint remains in the current spot, and the spot changes only after crossing it. The implementation must express this through normalized position/grid-size math rather than a literal 32 px or 64 px threshold.

### Centralized diagnostic command
The occupancy object exposes one marker command per entity. A single diagnostics module owns the existing small black X style, geometry, and canvas drawing. This is preferred over entity-specific drawing because it guarantees identical appearance and prevents bush/pickup special cases from drifting.

### Explicit lifecycle registration
Active entity records register with or update an occupancy object while active. Dead, collected, destroyed, and removed records are excluded before command creation. Shared-cell markers remain separate commands so one entity cannot hide another in diagnostics.

### Migration of gameplay reads
Existing cell reads in perception, AI, bush interaction, targeting, and pickup/object flows are routed through the same occupancy value. This ensures the X is an operational explanation of gameplay state, not a diagnostic approximation.

## Risks / Trade-offs

- [Risk] Exact midpoint behavior can differ from JavaScript's default rounding ties. -> Mitigation: add boundary tests on both axes for exact midpoint and one-pixel-beyond midpoint using configurable grid dimensions.
- [Risk] Some entities currently expose collider positions but not a stable live center API. -> Mitigation: add explicit center accessors at entity boundaries and keep collider geometry derived from the same live position.
- [Risk] Migrating gameplay reads can expose existing disagreement between snapshots and render records. -> Mitigation: add integration assertions that AI/perception/diagnostics report the same cell during interpolated movement.
- [Risk] Multiple Xs at one location visually overlap. -> Mitigation: preserve one command per entity and verify command counts in tests; do not offset markers.

## Migration Plan

1. Add the occupancy model and focused quantization/marker tests.
2. Add live-center accessors and initial grid-center placement to all entity factories.
3. Replace character, bush, pickup, object, projectile, and goal cell reads with shared occupancy reads.
4. Replace diagnostic special cases with one marker-command path and preserve the existing black X appearance.
5. Run the complete test suite and a browser smoke test with Collider diagnostics enabled during smooth movement.

Rollback is an additive code revert; level data and art assets remain unchanged.
