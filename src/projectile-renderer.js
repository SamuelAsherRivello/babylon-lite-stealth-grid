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
import { worldToScreen } from "./game-logic.js";

// Arrow.png is a 64x64 frame with transparent padding around the artwork.
// Keep the frame square so the artwork is not vertically clipped or squashed.
const ARROW_ATLAS_FRAME = { width: 64, height: 64 };
// The opaque artwork is then covered by a separate tight gameplay collider.
const ARROW_RENDER_SIZE = 107;
const ARROW_CAPACITY = 32;

export function loadArrowAtlas(engine) {
  return loadSpriteAtlas(engine, "./assets/units/archer/Arrow.png", {
    gridSize: [ARROW_ATLAS_FRAME.width, ARROW_ATLAS_FRAME.height],
    sampling: "nearest",
  });
}

export function createProjectileRenderer({ atlas, bounds, obstacles }) {
  const layer = createSprite2DLayer(atlas, {
    capacity: ARROW_CAPACITY,
    order: 2,
    pivot: [0.5, 0.5],
  });
  const active = [];

  function removeAt(index) {
    removeSprite2D(active[index].sprite);
    active.splice(index, 1);
  }

  return {
    layer,
    shoot(position, direction) {
      if (active.length >= ARROW_CAPACITY) {
        return false;
      }

      const projectile = createProjectile(position, direction);
      const screen = worldToScreen(projectile.position, 1, bounds.height);
      const sprite = addSprite2D(layer, {
        positionPx: [screen.x, screen.y],
        sizePx: [ARROW_RENDER_SIZE, ARROW_RENDER_SIZE],
        frame: 0,
        flipX: projectile.direction < 0,
      });
      active.push({ projectile, sprite });
      return true;
    },
    getColliders() {
      return active.map(({ projectile }) => ({
        type: "projectile",
        collider: getProjectileCollider(projectile),
      }));
    },
    update(deltaSeconds, dynamicColliders = []) {
      for (let index = active.length - 1; index >= 0; index -= 1) {
        const record = active[index];
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
        updateSprite2D(record.sprite, { positionPx: [screen.x, screen.y] });
      }
    },
    dispose() {
      while (active.length > 0) {
        removeAt(active.length - 1);
      }
    },
  };
}
