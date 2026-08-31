## Context

See `proposal.md` for motivation and `specs/entity-spawners/spec.md` for the behavior contract. `src/main.js` currently constructs one player, one sheep, and one goblin, registers each actor's one-capacity animation layers with a single sprite renderer, and calls singular update, collision, diagnostics, viewport, and disposal paths. Actor controllers expose `dispose()` but no common living-state contract. The existing `showColliders` setting controls a diagnostic canvas, while Babylon Lite sprite renderers can add layers after creation and sprite layers support custom fragment shaders.

The hardcoded positions are transitional. The active Tiled integration design already assigns player and enemy spawn points to typed object-layer entries, so the runtime spawner input must remain plain data that a later level adapter can produce.

## Goals / Non-Goals

**Goals:**

- Keep population policy independent from actor-specific construction and update behavior.
- Make population timing and weighted random decisions deterministic under injected inputs for unit testing.
- Preserve current movement, collision, pause, animation, input, diagnostics, and renderer behavior while supporting actor collections.
- Make spawner markers reuse existing actor atlases without duplicating image assets.
- Provide one lifecycle boundary that later combat or removal features can call without teaching the spawner why an actor disappeared.

**Non-Goals:**

- Reading or editing spawners in Tiled in this change.
- Adding actor death, health, loot, spawn effects, cooldown UI, interaction, or spawn-point collision.
- Choosing random spawn positions.
- Adding multiple players, player selection, or multiplayer input routing beyond the configured maximum of one.
- Generalizing every actor controller into one shared base class.

## Decisions

### Separate generic spawner policy from actor factories

Create a small spawner controller configured with `type`, `position`, `minimumCount`, `maximumCount`, `checkIntervalSeconds`, an injected random source, and a `createActor(position)` factory. It owns only actors returned by that factory. Its immediate startup evaluation and periodic `update` use the same reconciliation operation: prune removed entries and, when current is below minimum, select a weighted random batch from zero through remaining capacity. The player configuration overrides only the first evaluation to guarantee its unique initial actor.

The `type` is stable configuration metadata and selects the correct factory and marker definition at composition time; the generic policy does not import player, sheep, or goblin modules. This makes future Tiled objects inputs to composition rather than a reason to rewrite the population algorithm.

Alternative considered: one subclass with duplicated timer and counting code for each actor type. Rejected because the three subtypes differ only in configuration and creation wiring; separate policy implementations would drift.

### Represent the three requested subtypes as validated configurations

Define player, sheep, and enemy spawner configuration helpers or catalog entries over the generic controller. Preserve the current hardcoded world positions and assign `(1,1)`, `(2,2)`, and `(1,1)` population ranges respectively. All three omit an explicit interval so the generic one-second default is exercised.

Alternative considered: embed these values directly inside `main.js` conditionals. Rejected because stable configuration records provide the seam that authored level objects will later replace.

### Use explicit lifecycle state and spawner ownership

Each spawned actor record carries its owning spawner and a removal state. Reaching zero health does not remove the record: the actor continues counting through the separate health system's 250 ms death animation. Completion of that animation disposes the actor and marks the record removed exactly once; reconciliation prunes removed records before counting. Page shutdown disposes all remaining actors and markers and stops further checks.

Alternative considered: scan global actors by character type. Rejected because multiple future spawners of the same type must maintain independent populations, and global counting would let one spawner satisfy another accidentally.

### Use a lower-batch-biased random draw with zero included

When current is below minimum, calculate `remainingCapacity = maximumCount - current` and map an injected uniform random value through a squared curve to an integer in `0..remainingCapacity`. Squaring biases outcomes toward zero and smaller batches while still allowing every bounded batch size. A zero result performs no spawn; there is no starvation override, and the spawner simply evaluates again after N seconds. When current is at least minimum, no random draw or spawn occurs. Values above maximum are preserved rather than deleting actors.

Alternative considered: guarantee at least one spawn or fill directly to a target. Rejected because the confirmed experience requires that an eligible evaluation can visibly do nothing and that recovery timing remain hidden from the player.

### Advance the N-second schedule from the game update loop

Use accumulated active gameplay delta rather than independent `setInterval` callbacks. Each spawner defaults its interval to one second and accepts any positive N. A large delta can consume complete intervals predictably, while the existing pause controller naturally freezes population time along with actor AI and animation. Marker visibility is never consulted by this schedule.

Alternative considered: browser `setInterval`. Rejected because callback timing is nondeterministic in background tabs, complicates disposal and tests, and could mutate actor collections between main-loop phases. The phrase "always in use" is satisfied by independence from diagnostic visibility; normal gameplay pause semantics remain authoritative.

### Refactor composition around typed actor collections

Keep the unique player accessible through the player spawner's living instances, and store sheep and enemies as iterable collections. Each update phase builds fresh snapshots and collider lists from the current living collections. Sheep continue ignoring NPC blockers under their existing typed-collider rules. Viewport scaling, animation startup, diagnostics, projectile targets, and shutdown iterate the same living records rather than maintaining parallel singular variables.

Spawned layers are added to the existing renderer through its mutable layer-membership API. Removed actors dispose their animations and hide or remove their sprites and layers so respawning does not leak visible or registered render state. Player creation retains the existing input integration, with the `(1,1)` invariant preventing concurrent controller ownership.

Alternative considered: preallocate dormant actors up to every maximum. Rejected because it hides actual spawn lifecycle behavior and would become inflexible when authored maximums grow.

### Render markers as grayscale sprite layers beneath actors

For each spawner, create one dedicated marker sprite using frame zero of the corresponding idle atlas and half the actor's live rendered width and height. Give the marker an independent centered pivot and place it at the center of the grid cell containing the configured spawn position rather than inheriting the live actor's ground anchor. A small shared Sprite2D custom fragment shader converts sampled RGB to luminance and multiplies retained alpha by `0.5`, making every marker black and white at 50% opacity. Marker layers use an order between terrain and actors and mirror the current viewport zoom. Their `visible` state subscribes to or is updated from the existing collider diagnostic setting.

Per-sprite color multiplication is not sufficient because tinting cannot remove the source artwork's color. Drawing markers on the diagnostic canvas was also rejected because that canvas renders above the game canvas, which would place the marker over the live actor instead of beneath it.

### Test policy without Babylon rendering and integration through source-visible seams

Inject actor creation and random values while advancing elapsed time explicitly in spawner unit tests. Cover validation, default and custom N-second intervals, guaranteed initial player, gradual non-player startup, zero and bounded batches, lower-batch bias boundaries, no spawn within range, ownership isolation, death-animation counting, disposal pruning, and teardown. Integration tests verify the three catalog configurations, collection-based main-loop paths, grayscale static marker configuration, collider-setting visibility, render ordering, and teardown. Finish with the full suite, production build, and a real-browser check showing all three markers while actor populations build gradually.

## Risks / Trade-offs

- [Two sheep initially occupy the same spawn position] -> Preserve the explicit single-position semantics; existing sheep-to-sheep collision filtering allows them to separate through their behavior without making the spawner invent offsets.
- [Adding and removing sprite layers at runtime can leak renderer resources] -> Centralize actor-record disposal and test repeated deactivate/replenish cycles plus page teardown.
- [The current game has no normal death path] -> Test lifecycle replenishment through the explicit deactivation API and leave combat integration for the feature that introduces death.
- [A custom grayscale shader adds a rendering path for debug-only visuals] -> Share one minimal shader definition across marker layers and verify both WebGPU and WebGL fallback builds/runtime paths.
- [Multiple actor collections increase frame-order sensitivity for dynamic collisions] -> Build immutable per-phase snapshots from living records and retain the existing deterministic update ordering.
- [Pausing freezes the accumulated check interval] -> This matches the current active-game delta contract; marker visibility remains independent and does not pause population checks.

## Migration Plan

1. Add and unit-test the generic spawner policy, configuration validation, lifecycle records, and subtype catalog.
2. Add the grayscale static marker renderer and bind visibility to the existing collider diagnostic value.
3. Convert startup and the main loop to create and consume spawner-owned actor collections while preserving the current positions and behavior.
4. Add lifecycle and integration coverage, then run unit tests, production build, and browser acceptance checks with diagnostics off and on.

Rollback is additive: restore direct singular actor construction and remove the spawner controller, catalog, markers, and collection integration. No authored level data or saved-game migration is involved.
