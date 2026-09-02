const FLIP_FLAGS = 0xe0000000;

export { createLevelTerrainTiles } from "./terrain-runtime.js";

export function formatLevelCellLabel(cell) {
  return `${formatCoordinate(cell.x)},${formatCoordinate(cell.y)}`;
}

export function collectTiledLayerTiles(level) {
  return level.layers.flatMap((layer, layerIndex) =>
    layer.tiles.map((tile) => ({ ...tile, layerName: layer.name, layerIndex })),
  );
}

export function validateTiledMap(map, externalTilesets = null) {
  const errors = [];
  if (map?.type !== "map") errors.push("Expected a Tiled map document.");
  if (map?.orientation !== "orthogonal") errors.push("Only orthogonal maps are supported.");
  if (map?.infinite) errors.push("Infinite Tiled maps are not supported.");
  if (!Number.isInteger(map?.width) || map.width <= 0) errors.push("Map width must be positive.");
  if (!Number.isInteger(map?.height) || map.height <= 0) errors.push("Map height must be positive.");
  if (!Number.isInteger(map?.tilewidth) || map.tilewidth <= 0) errors.push("Tile width must be positive.");
  if (!Number.isInteger(map?.tileheight) || map.tileheight <= 0) errors.push("Tile height must be positive.");
  for (const layer of map?.layers ?? []) {
    if (layer.type === "tilelayer" && layer.data?.length !== map.width * map.height) {
      errors.push(`Layer "${layer.name}" must contain ${map.width * map.height} cells.`);
    }
  }
  if (externalTilesets) errors.push(...validateReactiveDecorations(map, externalTilesets), ...validateGoldStones(map, externalTilesets));
  return errors;
}

export function normalizeTiledMap(map, externalTilesets) {
  const errors = validateTiledMap(map, externalTilesets);
  if (errors.length > 0) throw new Error(errors.join("\n"));
  const tilesets = map.tilesets.map(({ firstgid, source }) => {
    const tileset = externalTilesets.get(source);
    if (!tileset) throw new Error(`Missing external tileset: ${source}`);
    return { firstgid, source, tileset };
  }).sort((a, b) => a.firstgid - b.firstgid);
  const originObjects = map.layers.flatMap((layer) => layer.type === "objectgroup"
    ? (layer.objects ?? []).filter((object) => (object.name || object.type || object.class) === "World Origin")
    : []);
  const originLayer = map.layers.find(({ name }) => name === "World Origin");
  const originIndices = originLayer?.data?.map((gid, index) => gid ? index : -1)
    .filter((index) => index >= 0) ?? [];
  if (originObjects.length > 1 || (originObjects.length === 0 && originIndices.length !== 1)) {
    throw new Error("World Origin must contain exactly one marker object or tile.");
  }
  const originColumn = originObjects.length === 1
    ? Math.floor(originObjects[0].x / map.tilewidth)
    : originIndices[0] % map.width;
  const originRow = originObjects.length === 1
    ? Math.floor(originObjects[0].y / map.tileheight)
    : Math.floor(originIndices[0] / map.width);
  const layers = map.layers.filter(({ type, name }) => type === "tilelayer" && name !== "World Origin")
    .map((layer) => ({
      name: layer.name,
      visible: layer.visible !== false,
      properties: propertiesToObject(layer.properties),
      tiles: layer.data.flatMap((rawGid, index) => {
        const gid = rawGid & ~FLIP_FLAGS;
        if (gid === 0) return [];
        const source = resolveTileset(tilesets, gid);
        if (!source) throw new Error(`No tileset resolves global tile id ${gid}.`);
        const frame = gid - source.firstgid;
        const tileDefinition = source.tileset.tiles?.find(({ id }) => id === frame);
        if (!source.tileset.image) {
          console.warn(`Skipping terrain tile ${gid} in layer "${layer.name}": tileset "${source.source}" has no terrain atlas image.`);
          return [];
        }
        const column = index % map.width;
        const row = Math.floor(index / map.width);
        return [{
          frame, gid, source: source.source, image: source.tileset.image,
          collisionShapes: normalizeTileCollisionShapes(
            tileDefinition,
            source.tileset.tilewidth,
            source.tileset.tileheight,
          ),
          tiledCell: { x: column, y: row },
          gameCell: { x: column - originColumn, y: originRow - row },
        }];
      }),
    }));
  const objects = map.layers.filter(({ type }) => type === "objectgroup")
    .flatMap((layer) => (layer.objects ?? []).flatMap((object) => {
      if (!object.gid) return [];
      const gid = object.gid & ~FLIP_FLAGS;
      const source = resolveTileset(tilesets, gid);
      if (!source) throw new Error(`No tileset resolves global tile id ${gid}.`);
      const tileId = gid - source.firstgid;
      const tile = source.tileset.tiles?.find(({ id }) => id === tileId) ?? {};
      const className = object.class || object.type || tile.class || tile.type || "";
      const properties = {
        ...(source.tileset.classDefaults?.[className] ?? {}),
        ...propertiesToObject(tile.properties),
        ...propertiesToObject(object.properties),
      };
      const position = className === "ReactiveDecoration"
        ? {
          x: (Math.floor(object.x / map.tilewidth) + 0.5 - originColumn) * map.tilewidth,
          y: (originRow + 2 - (Math.floor(object.y / map.tileheight) + 0.5)) * map.tileheight,
        }
        : {
          x: object.x - originColumn * map.tilewidth,
          y: (originRow + 1) * map.tileheight - object.y,
        };
      const frameWidth = Number(properties.frameWidth ?? tile.imagewidth);
      const frameHeight = Number(properties.frameHeight ?? tile.imageheight);
      return [{
        id: object.id, name: object.name ?? "", class: className,
        layerName: layer.name, gid, tileId, source: source.source,
        position, properties,
        decoration: className === "ReactiveDecoration" ? {
          image: properties.runtimeImage ?? tile.image,
          variantImages: [properties.runtimeImage ?? tile.image, properties.runtimeImageAlt].filter(Boolean),
          frameSize: { width: frameWidth, height: frameHeight },
          frameCount: Number(properties.frameCount),
          frameDurationMs: Number(properties.frameDurationMs),
          idleFrame: Number(properties.idleFrame),
          loop: properties.playbackMode === "loop",
          triggerMode: properties.triggerMode,
          resetAfterPlay: properties.resetAfterPlay,
          rearmOnExit: properties.rearmOnExit,
          blocking: properties.blocking,
          acceptedCharacterTypes: String(properties.acceptedCharacterTypes ?? "")
            .split(",").map((value) => value.trim()).filter(Boolean),
          sensor: normalizeTileSensor(tile, position, frameWidth, frameHeight),
          combatCollider: normalizeTileObject(
            tile, "CombatCollider", position, frameWidth, frameHeight,
          ),
        } : null,
          goldStone: className === "GoldObject" ? {
          image: properties.runtimeImage ?? tile.image,
          variantImages: [properties.runtimeImage ?? tile.image, properties.runtimeImageAlt].filter(Boolean),
          frameSize: { width: frameWidth, height: frameHeight },
          frameCount: Number(properties.frameCount),
          combatCollider: normalizeTileObject(tile, "CombatCollider", position, frameWidth, frameHeight),
        } : null,
      }];
    }));
  const spawners = map.layers.filter(({ type }) => type === "objectgroup")
    .flatMap((layer) => (layer.objects ?? []).flatMap((object) => {
      const gid = object.gid ? object.gid & ~FLIP_FLAGS : 0;
      const source = gid ? resolveTileset(tilesets, gid) : null;
      const tile = source?.tileset?.tiles?.find(({ id }) => id === gid - source.firstgid);
      const className = object.class || object.type || tile?.class || tile?.type || "";
      if (className.toLowerCase() !== "spawner") return [];
      const properties = {
        ...propertiesToObject(tile?.properties),
        ...propertiesToObject(object.properties),
      };
      const column = Math.floor(object.x / map.tilewidth);
      // Tile objects anchor at their bottom edge. Only an exact grid boundary
      // belongs to the preceding row; off-grid anchors stay in their own row.
      const row = object.gid
        ? Math.ceil(object.y / map.tileheight) - 1
        : Math.floor(object.y / map.tileheight);
      return [{
        id: object.id,
        name: object.name ?? "",
        type: String(properties.type ?? "").toUpperCase(),
        spawnMode: String(properties.spawnMode ?? "nearby").toLowerCase(),
        spawnMaxDistance: Number(properties.spawnMaxDistance ?? (
          String(properties.type ?? "").toUpperCase() === "PLAYER" ? 0 : 3
        )),
        gameCell: { x: column - originColumn, y: originRow - row },
      }];
    }));
  validateSpawners(spawners);
  const goldPickupSpawners = map.layers.filter(({ type }) => type === "objectgroup")
    .flatMap((layer) => (layer.objects ?? []).flatMap((object) => {
      const gid = object.gid ? object.gid & ~FLIP_FLAGS : 0;
      const source = gid ? resolveTileset(tilesets, gid) : null;
      const tile = source?.tileset?.tiles?.find(({ id }) => id === gid - source.firstgid);
      const className = object.class || object.type || tile?.class || tile?.type || "";
      if (className.toLowerCase() !== "goldpickupspawner") return [];
      const column = Math.floor(object.x / map.tilewidth);
      const row = Math.floor(object.y / map.tileheight) - (object.gid ? 1 : 0);
      return [{ id: object.id, name: object.name ?? "", tiledCell: { x: column, y: row }, gameCell: { x: column - originColumn, y: originRow - row } }];
    }));
  const goals = map.layers.filter(({ type }) => type === "objectgroup")
    .flatMap((layer) => (layer.objects ?? []).flatMap((object) => {
      const gid = object.gid ? object.gid & ~FLIP_FLAGS : 0;
      const source = gid ? resolveTileset(tilesets, gid) : null;
      const tile = source?.tileset?.tiles?.find(({ id }) => id === gid - source.firstgid);
      const className = object.class || object.type || tile?.class || tile?.type || "";
      if (className.toLowerCase() !== "goalspawner") return [];
      const column = Math.floor(object.x / map.tilewidth);
      const row = Math.floor(object.y / map.tileheight) - (object.gid ? 1 : 0);
      return [{ id: object.id, name: object.name ?? "", gameCell: { x: column - originColumn, y: originRow - row } }];
    }));
  if (goals.length !== 1) throw new Error("Invalid Level Format: Must contain 1 Goal Spawner");
  return {
    width: map.width, height: map.height,
    tileWidth: map.tilewidth, tileHeight: map.tileheight,
    origin: { x: originColumn, y: map.height - originRow - 1 },
    layers, objects, spawners, goldPickupSpawners, goals,
    reactiveDecorations: objects.filter(({ decoration }) => decoration?.frameCount > 1 && decoration.triggerMode),
    goldStones: objects.filter(({ class: className }) => className === "GoldObject"),
  };
}

export async function loadTiledMap(url, fetchImpl = fetch) {
  const mapUrl = new URL(url, globalThis.location?.href ?? "http://localhost/");
  const map = await fetchJson(mapUrl, fetchImpl);
  const externalTilesets = new Map();
  await Promise.all(map.tilesets.map(async ({ source }) => {
    externalTilesets.set(source, await fetchJson(new URL(source, mapUrl), fetchImpl));
  }));
  const level = normalizeTiledMap(map, externalTilesets);
  level.layers = level.layers.map((layer) => ({
    ...layer,
    tiles: layer.tiles.map((tile) => ({
      ...tile,
      image: new URL(tile.image, new URL(tile.source, mapUrl)).href,
    })),
  }));
  level.reactiveDecorations = level.reactiveDecorations.map((object) => ({
    ...object,
    decoration: {
      ...object.decoration,
      image: new URL(
        object.decoration.image,
        new URL(object.source, mapUrl),
      ).href,
    },
  }));
  level.goldStones = level.goldStones.map((object) => ({
    ...object,
    goldStone: {
      ...object.goldStone,
      image: new URL(object.goldStone.image, new URL(object.source, mapUrl)).href,
      variantImages: object.goldStone.variantImages.map((image) => new URL(image, new URL(object.source, mapUrl)).href),
    },
  }));
  return level;
}

function propertiesToObject(properties = []) {
  return Object.fromEntries(properties.map(({ name, value }) => [name, value]));
}

function resolveTileset(tilesets, gid) {
  return [...tilesets].reverse().find(({ firstgid }) => gid >= firstgid);
}

function normalizeTileSensor(tile, position, frameWidth, frameHeight) {
  const sensor = tile.objectgroup?.objects?.find((object) => (object.class || object.type) === "Sensor");
  if (!sensor) return null;
  if (sensor.ellipse && sensor.width === sensor.height) {
    return {
      type: "circle",
      x: position.x - frameWidth / 2 + sensor.x + sensor.width / 2,
      y: position.y + frameHeight - sensor.y - sensor.height / 2,
      radius: sensor.width / 2,
    };
  }
  return {
    x: position.x - frameWidth / 2 + sensor.x,
    y: position.y + frameHeight - sensor.y - sensor.height,
    width: sensor.width, height: sensor.height,
  };
}

function normalizeTileObject(tile, className, position, frameWidth, frameHeight) {
  const object = tile.objectgroup?.objects?.find(
    (entry) => (entry.class || entry.type) === className,
  );
  if (!object || object.width <= 0 || object.height <= 0 || object.ellipse) return null;
  return {
    x: position.x - frameWidth / 2 + object.x,
    y: position.y + frameHeight - object.y - object.height,
    width: object.width,
    height: object.height,
  };
}

function normalizeTileCollisionShapes(tile, tileWidth, tileHeight) {
  if (!Number.isFinite(tileWidth) || tileWidth <= 0
    || !Number.isFinite(tileHeight) || tileHeight <= 0) {
    return [];
  }
  return (tile?.objectgroup?.objects ?? [])
    .filter((object) => !["Sensor", "CombatCollider"].includes(object.class || object.type))
    .flatMap((object) => {
      if (object.polygon) {
        return [{
          type: "polygon",
          points: object.polygon.map((point) => ({
            x: (object.x + point.x) / tileWidth,
            y: 1 - (object.y + point.y) / tileHeight,
          })),
        }];
      }
      if (object.ellipse || object.point || object.polyline
        || object.width <= 0 || object.height <= 0) {
        return [];
      }
      return [{
        type: "rectangle",
        x: object.x / tileWidth,
        y: 1 - (object.y + object.height) / tileHeight,
        width: object.width / tileWidth,
        height: object.height / tileHeight,
      }];
    });
}

function validateReactiveDecorations(map, externalTilesets) {
  const errors = [];
  const tilesets = (map?.tilesets ?? []).map(({ firstgid, source }) => ({
    firstgid, source, tileset: externalTilesets.get(source),
  })).sort((a, b) => a.firstgid - b.firstgid);
  for (const layer of map?.layers ?? []) {
    if (layer.type !== "objectgroup") continue;
    for (const object of layer.objects ?? []) {
      if (!object.gid) continue;
      const gid = object.gid & ~FLIP_FLAGS;
      const source = resolveTileset(tilesets, gid);
      const tile = source?.tileset?.tiles?.find(({ id }) => id === gid - source.firstgid);
      const className = object.class || object.type || tile?.class || tile?.type || "";
      if (className !== "ReactiveDecoration") continue;
      const label = `Reactive decoration object ${object.id ?? "(unknown)"}`;
      const properties = {
        ...(source.tileset.classDefaults?.[className] ?? {}),
        ...propertiesToObject(tile?.properties), ...propertiesToObject(object.properties),
      };
      if (layer.name !== "Y-Sorted Props") errors.push(`${label} must be on layer "Y-Sorted Props".`);
      if (!source?.tileset) errors.push(`${label} has an unresolved tileset.`);
      if (!properties.runtimeImage) errors.push(`${label} is missing runtimeImage.`);
      if (!Number.isInteger(properties.frameWidth) || properties.frameWidth <= 0
        || !Number.isInteger(properties.frameHeight) || properties.frameHeight <= 0
        || !Number.isInteger(properties.frameCount) || properties.frameCount <= 1) {
        errors.push(`${label} has invalid frame dimensions or count.`);
      }
      const sensor = tile?.objectgroup?.objects?.find((entry) => (entry.class || entry.type) === "Sensor");
      if (!sensor || sensor.width <= 0 || sensor.height <= 0) errors.push(`${label} is missing valid Sensor geometry.`);
      const combat = tile?.objectgroup?.objects?.find((entry) => (entry.class || entry.type) === "CombatCollider");
      if (!combat || combat.ellipse || combat.width <= 0 || combat.height <= 0) {
        errors.push(`${label} is missing valid CombatCollider geometry.`);
      }
      if (properties.blocking !== false) errors.push(`${label} sensor must be non-blocking.`);
      if (properties.triggerMode !== "character-enter") errors.push(`${label} has unsupported triggerMode.`);
      if (properties.playbackMode !== "once") errors.push(`${label} has unsupported playbackMode.`);
    }
  }
  return errors;
}

function validateGoldStones(map, externalTilesets) {
  const errors = [];
  for (const layer of map?.layers ?? []) for (const object of layer.objects ?? []) {
    if (!object.gid) continue;
    const source = resolveTileset((map.tilesets ?? []).map(({ firstgid, source }) => ({ firstgid, source, tileset: externalTilesets.get(source) })).sort((a, b) => a.firstgid - b.firstgid), object.gid & ~FLIP_FLAGS);
    const tile = source?.tileset?.tiles?.find(({ id }) => id === ((object.gid & ~FLIP_FLAGS) - source.firstgid));
    const className = object.class || object.type || tile?.class || tile?.type || "";
    if (className !== "GoldObject") continue;
    const properties = propertiesToObject(tile?.properties);
    if (!properties.runtimeImage || !properties.runtimeImageAlt) errors.push(`Gold Stone object ${object.id ?? "(unknown)"} is missing both runtime variants.`);
    if (properties.frameWidth !== 64 || properties.frameHeight !== 64 || properties.frameCount !== 6) errors.push(`Gold Object ${object.id ?? "(unknown)"} has invalid frame metadata.`);
    const collider = tile?.objectgroup?.objects?.find((entry) => (entry.class || entry.type) === "CombatCollider");
    if (!collider || collider.width <= 0 || collider.height <= 0) errors.push(`Gold Stone object ${object.id ?? "(unknown)"} is missing valid CombatCollider geometry.`);
  }
  return errors;
}

function validateSpawners(spawners) {
  const playerCount = spawners.filter(({ type }) => type === "PLAYER").length;
  if (playerCount !== 1) {
    throw new Error("Invalid Level Format: Must contain 1 Player Spawner");
  }
  const supportedTypes = new Set(["PLAYER", "SHEEP", "GOBLIN", "WARRIOR", "ARCHER", "MONK", "LANCER"]);
  for (const spawner of spawners) {
    if (!supportedTypes.has(spawner.type)) {
      const name = spawner.name ? ` ("${spawner.name}")` : "";
      throw new Error(
        `Spawner object ${spawner.id ?? "(unknown)"}${name} has unsupported type "${spawner.type}"`,
      );
    }
    if (!Number.isFinite(spawner.gameCell.x) || !Number.isFinite(spawner.gameCell.y)) {
      throw new Error(`Spawner object ${spawner.id ?? "(unknown)"} has an invalid position`);
    }
    if (!["nearby", "anywhere-walkable"].includes(spawner.spawnMode)) {
      throw new Error(`Spawner object ${spawner.id ?? "(unknown)"} has unsupported spawn mode "${spawner.spawnMode}"`);
    }
    if (!Number.isInteger(spawner.spawnMaxDistance) || spawner.spawnMaxDistance < 0) {
      throw new Error(`Spawner object ${spawner.id ?? "(unknown)"} has invalid spawn max distance "${spawner.spawnMaxDistance}"`);
    }
  }
}

function formatCoordinate(value) { return String(value).padStart(2, "0"); }

async function fetchJson(url, fetchImpl) {
  const response = await fetchImpl(url);
  if (!response.ok) throw new Error(`Unable to load Tiled file ${url}: HTTP ${response.status}`);
  return response.json();
}
