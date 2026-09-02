import {
  addSprite2D,
  createSprite2DLayer,
  loadSpriteAtlas,
  removeSprite2D,
  updateSprite2D,
} from "@babylonjs/lite";

import {
  ARROW_SIZE,
  advanceProjectile,
  createProjectile,
  getProjectileCollider,
} from "./projectile.js";
import { worldToScreen } from "../../gameplay/game-logic.js";
import { GAME_DEPTH } from "../environment/render-depth.js";

// Arrow.png is a 64x64 frame with transparent padding around the artwork.
// Keep the frame square so the artwork is not vertically clipped or squashed.
const ARROW_ATLAS_FRAME = { width: 64, height: 64 };
// The opaque artwork is then covered by a separate tight gameplay collider.
const ARROW_RENDER_SIZE = 64;
const ARROW_CAPACITY = 32;
export const DEFLECT_DURATION_SECONDS = 0.25;
const DEFLECT_SPEED = 240;
const DEFLECT_ROTATION = Math.PI / 2;

const DEFAULT_API = Object.freeze({
  addSprite2D,
  createSprite2DLayer,
  removeSprite2D,
  updateSprite2D,
});

export function getProjectileRotation(direction) {
  if (direction.x !== 0 && direction.y !== 0) {
    return Math.atan2(direction.y, direction.x);
  }
  if (direction.y > 0) {
    return -Math.PI / 2;
  }
  if (direction.y < 0) {
    return Math.PI / 2;
  }
  return direction.x < 0 ? Math.PI : 0;
}

export function loadArrowAtlas(engine) {
  return loadSpriteAtlas(engine, "./assets/units/archer/Arrow.png", {
    gridSize: [ARROW_ATLAS_FRAME.width, ARROW_ATLAS_FRAME.height],
    sampling: "nearest",
  });
}

export function createProjectileRenderer({ atlas, bounds, obstacles, api = DEFAULT_API }) {
  const layer = api.createSprite2DLayer(atlas, {
    capacity: ARROW_CAPACITY,
    order: GAME_DEPTH.projectiles,
    pivot: [0.5, 0.5],
  });
  const active = [];
  let nextProjectileId = 0;

  function removeAt(index) {
    api.removeSprite2D(active[index].sprite);
    active.splice(index, 1);
  }

  return {
    layer,
    shoot(position, direction, ownerId = null, options = {}) {
      if (active.length >= ARROW_CAPACITY) {
        return false;
      }

      const projectile = createProjectile(position, direction, options);
      const screen = worldToScreen(projectile.position, 1, bounds.height);
      const sprite = api.addSprite2D(layer, {
        positionPx: [screen.x, screen.y],
        sizePx: [ARROW_RENDER_SIZE, ARROW_RENDER_SIZE],
        frame: 0,
        rotation: options.initialRotation ?? getProjectileRotation(projectile.direction),
      });
      active.push({
        id: nextProjectileId,
        projectile,
        ownerId,
        sprite,
        hit: false,
        deflection: null,
        frozen: options.frozen === true,
      });
      nextProjectileId += 1;
      return true;
    },
    setFrozenPosition(id, position) {
      const record = active.find(entry => entry.id === id && entry.frozen);
      if (!record) return false;
      record.projectile.position = { ...position };
      const screen = worldToScreen(position, 1, bounds.height);
      api.updateSprite2D(record.sprite, { positionPx: [screen.x, screen.y] });
      return true;
    },
    removeProjectiles(ids) {
      const removals = new Set(ids.map((id) => Number(id)));
      for (let index = active.length - 1; index >= 0; index -= 1) {
        if (!removals.has(active[index].id)) {
          continue;
        }
        removeAt(index);
      }
    },
    markHit(id) {
      const record = active.find((entry) => entry.id === Number(id));
      if (record) {
        record.hit = true;
      }
    },
    deflect(id) {
      const record = active.find((entry) => entry.id === Number(id));
      if (!record || record.hit || record.deflection) return false;
      record.deflection = {
        elapsedSeconds: 0,
        startRotation: getProjectileRotation(record.projectile.direction),
      };
      return true;
    },
    getColliders() {
      return active
        .filter(({ hit, deflection, projectile }) => !hit && !deflection && projectile.collisionEnabled)
        .map(({ id, projectile, ownerId }) => ({
          id,
          ownerId,
          type: "projectile",
          direction: projectile.direction,
          collider: getProjectileCollider(projectile),
        }));
    },
    getProjectiles() {
      return active.map(({ id, projectile, deflection }) => ({
        id,
        direction: { ...projectile.direction },
        position: { ...projectile.position },
        state: deflection ? "deflected" : "flying",
      }));
    },
    update(deltaSeconds, dynamicColliders = []) {
      for (let index = active.length - 1; index >= 0; index -= 1) {
        const record = active[index];
        if (record.frozen) continue;
        if (record.deflection) {
          const activeDelta = Math.max(0, deltaSeconds);
          record.deflection.elapsedSeconds = Math.min(
            DEFLECT_DURATION_SECONDS,
            record.deflection.elapsedSeconds + activeDelta,
          );
          record.projectile.position.x -= (
            record.projectile.direction.x * DEFLECT_SPEED * activeDelta
          );
          record.projectile.position.y -= (
            record.projectile.direction.y * DEFLECT_SPEED * activeDelta
          );
          const progress = record.deflection.elapsedSeconds / DEFLECT_DURATION_SECONDS;
          const screen = worldToScreen(record.projectile.position, 1, bounds.height);
          api.updateSprite2D(record.sprite, {
            positionPx: [screen.x, screen.y],
            rotation: record.deflection.startRotation + DEFLECT_ROTATION * progress,
            alpha: 1 - progress,
          });
          if (progress >= 1) removeAt(index);
          continue;
        }
        const result = advanceProjectile(
          record.projectile,
          deltaSeconds,
          bounds,
          [
            ...obstacles,
            ...dynamicColliders.map(({ collider }) => collider),
          ],
        );
        if (!result.alive) {
          removeAt(index);
          continue;
        }

        const screen = worldToScreen(record.projectile.position, 1, bounds.height);
        const patch = {
          positionPx: [screen.x, screen.y - (record.projectile.height ?? 0)],
        };
        if (record.projectile.rotationEnabled) {
          patch.rotation = getProjectileRotation(record.projectile.arc ? record.projectile.flightVelocity : record.projectile.direction);
        }
        api.updateSprite2D(record.sprite, patch);
      }
    },
    dispose() {
      while (active.length > 0) {
        removeAt(active.length - 1);
      }
    },
  };
}
