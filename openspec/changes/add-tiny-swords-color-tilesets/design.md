## Context

See `proposal.md` for motivation and `specs/tiny-swords-color-tilesets/spec.md` for behavior. The current repository has one external TSJ named `TinySwordsTerrain.tsj`, referencing `public/assets/terrain/Tilemap_color3.png`. The normalized loader already records each placement's external tileset `source`, but startup loads one hard-coded color-three atlas and renders all terrain through it. Collision is selected from the placement's local `frame`, which is the correct shared identity for the five color variants.

All supplied atlases were inspected as 576 by 384 PNGs. They therefore share a nine-column by six-row layout of 54 cells at 64 by 64 pixels. Their file hashes differ, confirming they are distinct palettes rather than duplicate files.

## Goals / Non-Goals

**Goals:**

- Keep all five terrain PNGs and their TSJs in predictable, filename-matched repository locations.
- Make every palette immediately available in the prepared Tiled maps.
- Preserve current `Level01` color-three visuals and authored content exactly.
- Let the runtime select atlases from normalized tileset identity while preserving layer order.
- Reuse the current local-frame collision configuration for every palette.

**Non-Goals:**

- Combining the five images into one larger atlas.
- Recoloring images at runtime or generating palette swaps.
- Giving different colors different collision, animation, or terrain semantics.
- Changing the map dimensions, origin contract, visual layer names, or the direct-TMJ workflow.
- Deleting the user's original Tiny Swords download outside the repository.

## Decisions

### Import the five PNGs into one repository asset directory

Place `Tilemap_color1.png` through `Tilemap_color5.png` together under `public/assets/terrain/tilesets/`. Import means copying the supplied source files into the project; implementation will not remove files from the user's Downloads folder. Keeping atlas files together separates reusable tileset sheets from other terrain effects such as water foam.

Alternative considered: leave `color3` at its current path and add four siblings there. This minimizes one URL change but leaves tileset sheets mixed with other terrain assets and fails the requested organization goal.

### Use one filename-matched external TSJ per image

Create `Tilemap_color1.tsj` through `Tilemap_color5.tsj` under `public/levels/tiled/tilesets/`. Each TSJ declares its name as `Tilemap_colorN` and points relatively to the matching PNG. Replace map references to `TinySwordsTerrain.tsj` with `Tilemap_color3.tsj`; remove the obsolete TSJ only after every live map and documented path is migrated.

Alternative considered: reuse one TSJ and swap its image property. That would not expose five simultaneous painting palettes and could silently recolor existing levels.

### Preserve color-three global IDs during migration

Keep `Tilemap_color3.tsj` as the first tileset with `firstgid: 1` in existing maps, then assign non-overlapping blocks of 54 GIDs to the four added palettes. This avoids rewriting any existing tile-layer data, including the editor-only origin marker, and provides the strongest proof that runtime results are unchanged. The map's tileset array and Tiled palette presentation do not need numeric or filename ordering to be valid.

Alternative considered: order color1 through color5 by GID and add 108 to all existing color-three GIDs. That is valid Tiled data but creates a broad, unnecessary migration with greater risk to authored maps.

### Carry stable tileset identity and image metadata through normalization

Extend normalized tileset data so a placement can be resolved to a stable source key and the matching TSJ image URL. The browser loader resolves image paths relative to each TSJ, not relative to the TMJ or page. Missing images and unrecognized terrain tilesets produce precise errors.

Alternative considered: derive the PNG filename by string replacement on the TSJ source. Explicit TSJ image metadata is authoritative and supports reuse with differently organized projects.

### Render per authored layer and tileset source

Load each distinct referenced image once and cache its Babylon Lite atlas by resolved image URL. Partition placements within each authored visual layer by tileset source, create the needed sprite layers, and retain Tiled's bottom-to-top authored layer ordering. This supports mixed palettes without loading unused images and avoids one hard-coded atlas.

Alternative considered: build a combined texture atlas at startup. It adds image processing, frame remapping, and startup cost for no authoring or collision benefit.

### Keep collision keyed only by local frame

Continue passing each placement's local frame number into the existing blocked-frame, empty-frame, and partial-collider tables. Do not key collision by global GID, TSJ source, or palette name. Add cross-palette tests proving identical geometry for corresponding frames.

Alternative considered: duplicate collision metadata into all five TSJs. That creates five sources of truth and increases the chance of color variants drifting apart.

## Risks / Trade-offs

- [Tiled may display the color-three palette before color-one because its GID block is preserved] -> Prefer migration safety and document palette selection by name; palette order can be revisited through editor presentation metadata if Tiled supports it without changing GIDs.
- [Multiple atlases increase texture memory when a level uses several palettes] -> Load only images referenced by the current map and cache each resolved URL once.
- [Grouping by tileset could disturb overlap ordering] -> Preserve authored layer order as the primary render key and use stable tileset-reference order only within a single tile layer.
- [A broad search-and-replace could alter backups or unrelated files] -> Enumerate live TMJ, TSJ, documentation, and runtime references and migrate only verified project files.
- [The existing dirty worktree contains unrelated changes] -> Keep implementation edits scoped and preserve all concurrent user work.

## Migration Plan

1. Add failing fixtures/tests for five TSJs, filename/image consistency, preserved color-three GIDs, mixed-source normalization, atlas selection, and shared collision.
2. Import the five source PNGs into `public/assets/terrain/tilesets/` and verify dimensions and byte identity against the supplied files.
3. Create the five external TSJs and attach all of them to each live AI-managed TMJ while retaining color three at `firstgid: 1`.
4. Extend normalized tileset metadata and the Babylon Lite terrain adapter to resolve and cache atlases per tileset image.
5. Migrate runtime, documentation, project/session references, and remove the obsolete `TinySwordsTerrain.tsj` only after no live references remain.
6. Run focused tests, the complete suite, production build, Tiled JSON validation, and a real-browser smoke test that compares the unchanged `Level01` appearance and exercises a mixed-palette fixture or level.

Rollback consists of restoring the previous color-three TSJ reference and atlas path while leaving added palette assets unused. No authored tile data needs reverse conversion because color three retains its original GIDs.
