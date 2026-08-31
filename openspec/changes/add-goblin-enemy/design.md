## Context

The current game creates the player as layered Babylon Lite sprite atlases and
keeps its pure transition logic in `player-state.js`. A sheep NPC follows the
same state-machine separation. There is no enemy module yet.

The inspected Tiny Swords Goblins/Troops files are three distinct compositions:

| Source | Canvas | Verified tags | Layers |
| --- | --- | --- | --- |
| Torch | 192x192 | Original 0-2; Idle 3-9; Run 10-15; Attack_Right 16-21; Attack_Down 22-27; Attack_Up 28-33 | Shadow, Hand, Body, Torch, Fire |
| TNT | 192x192 | Original 0; Idle 1-6; Run 7-12; Throw 13-19; Dynamite 20-25 | Shadow, Backpack, Body, Head, Hands, Dynamite, Firee |
| Barrel | 128x128 | Original 0; Idle_In 1; Out 2-7; Idle_Out 8; In 9-14; Run 15-17; Fired 18-20 | Shadow, Body, Head, Fire |

All tag frames use 100 ms except the Barrel's two idle frames, which use 500
ms. The checked-in PNGs flatten the layers into multi-row sheets with unused
cells, while the local adapter expects uniform grid sheets. See the specs for
the required runtime behavior and `proposal.md` for scope.

## Goals / Non-Goals

**Goals:**

- Establish a small enemy abstraction that does not prematurely define AI.
- Make state transitions testable without Babylon or browser dependencies.
- Export only the Torch goblin tags needed by this first enemy.
- Preserve the full layered Aseprite source locally for future re-export
  without redistributing it through Git.

**Non-Goals:**

- A general behavior tree, pathfinder, perception system, combat resolution,
  health model, or entity-component framework.
- TNT and Barrel variants, even though their verified tags are documented.
- Runtime composition or recoloring of Aseprite layers.

## Decisions

### Use the Torch goblin as the first goblin

Torch has complete idle, locomotion, and directional melee animations. It can
exercise the enemy state contract without inventing art. TNT implies projectile
and fuse timing, while Barrel implies disguise/transform behavior; both would
expand gameplay scope.

Alternative: model every Troops folder as one configurable goblin. Rejected
because their canvases, state sets, layers, and gameplay semantics differ.

### Separate intent, state, and rendering

`src/enemies/enemy-state.js` will own the pure `idle`/`walking`/`attacking`
transition rules. `src/enemies/goblin/goblin.js` will own position, collision,
sprite creation, animation callbacks, and disposal. A caller supplies movement
and attack intent; this change does not decide where that intent originates.

Alternative: embed transitions directly in the render update. Rejected because
it would be harder to test and would repeat the coupling avoided by the player
and sheep patterns.

### Export a separate sheet for each useful Aseprite tag

Place the legitimately acquired `Torch_Red.aseprite` under the Git-ignored
`assets/local-imports/enemies/goblin/`, then export five transparent single-row
sheets under `public/assets/enemies/goblin/`:
`goblin-idle.png`, `goblin-walk.png`, `goblin-attack-right.png`,
`goblin-attack-down.png`, and `goblin-attack-up.png`. Each cell is 192x192 and
each descriptor records frame count, 100 ms timing, loop behavior, pivot, and
display size. The three `Original` frames are authoring references, not runtime
states.

Alternative: use the upstream multi-row PNG directly. Rejected because tags
cross row boundaries and unused grid cells make the mapping fragile with the
current Babylon Lite atlas API.

Alternative: render the five source layers independently at runtime. Rejected
because the upstream PNG already demonstrates the intended composite and
runtime layering would multiply sprites, ordering concerns, and synchronization
cost without enabling a requirement in this change.

### Direction is chosen once when an attack starts

The attack request is normalized by dominant axis. Up and down choose their
dedicated sheets; horizontal attacks use `Attack_Right`, mirrored for left.
Zero direction uses the last horizontal facing, defaulting to right. Direction
does not change midway through the non-looping six-frame attack.

Alternative: continually retarget the attack animation. Rejected because it
would cause visual discontinuities and make attack completion nondeterministic.

### Keep movement and collision compatible with current actors

The goblin uses the same world-to-screen conversion and collision helper
contract as the player. Its own frame, pivot, and collider constants remain in
the goblin module, and its layer order is updated from world Y using the game's
existing depth convention.

## Risks / Trade-offs

- [The current official terms allow project use but prohibit redistributing or
  repackaging the raw assets] -> keep the paid source Git-ignored, commit only
  the game-ready runtime exports, and record the official terms and attribution.
- [A 192x192 transparent cell is larger than the visible goblin] -> measure a
  feet-centered pivot and compact collider against the rendered sprite rather
  than using the full cell.
- [The attack animation alone does not define a damage moment] -> expose an
  animation-frame callback seam but defer hit timing and damage behavior until
  combat is specified.
- [One layer per animation increases texture count] -> load the five atlases
  once and share them across goblin instances; create only sprite instances per
  enemy.

## Migration Plan

1. Add the pure enemy contract and tests without spawning an enemy.
2. Stage the verified Torch source locally and export five runtime sheets
   without adding the raw source to Git.
3. Add the goblin renderer and lifecycle tests.
4. Spawn one goblin through the existing game loop for visual verification.
5. Roll back additively by removing the spawn integration; existing player and
   NPC behavior remains independent.
