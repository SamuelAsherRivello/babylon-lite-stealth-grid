# Tiled Babylon Lite

Dependency-free helpers for validating, normalizing, and loading finite orthogonal Tiled JSON maps with external JSON tilesets in Babylon Lite projects.

## Library audit

The current ecosystem review found no maintained package that directly connects Tiled TMJ/TSJ maps to Babylon Lite's data-oriented sprite API. Babylon Lite's official loaders cover formats such as glTF and `.babylon`; Babylon.js mapping packages found during the audit target unrelated geographic 3D Tiles or depend on the full `@babylonjs/core` API. This plugin therefore implements the deliberately narrow project contract locally without a production dependency.

## Public API

- `validateTiledMap(map, externalTilesets?)` returns structural and supported
  object-contract errors.
- `normalizeTiledMap(map, externalTilesets)` returns ordered tile placements,
  tile objects, class/property metadata, reactive-decoration descriptors,
  origin-relative game coordinates, normalized spawner records, and normalized
  sensor geometry. Spawner objects carry one uppercase `type` value; exactly one
  `PLAYER` is required per level.
- `loadTiledMap(url, fetchImpl)` loads a TMJ and its referenced TSJ files in a browser.
