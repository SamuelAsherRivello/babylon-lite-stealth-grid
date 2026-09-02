import {
  addSprite2D,
  createSprite2DLayer,
  createSprite2DCustomShader,
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
import { collidersOverlap, worldToScreen } from "../../gameplay/game-logic.js";
import { GAME_DEPTH } from "../environment/render-depth.js";
import { GridSpot } from "../environment/grid-spot.js";
import { GRID } from "../environment/grid-contract.js";
import { getPickupAnimation } from "./pickup-animation.js";

// Arrow.png is a 64x64 frame with transparent padding around the artwork.
// Keep the frame square so the artwork is not vertically clipped or squashed.
const ARROW_ATLAS_FRAME = { width: 64, height: 64 };
// The opaque artwork is then covered by a separate tight gameplay collider.
const ARROW_RENDER_SIZE = 64;
const ARROW_CAPACITY = 32;
export const DEFLECT_DURATION_SECONDS = 0.25;
const DEFLECT_SPEED = 240;
const DEFLECT_ROTATION = Math.PI / 2;

// This layer reserves negative tint alpha for per-sprite ground-mask data:
// RG = rotated local Y basis, B = ground offset from sprite center in pixels.
// Ordinary arrows retain the normal tint/alpha path. Masking in rotated local
// space keeps the cut horizontal in game coordinates at any viewport scale.
const ARROW_GROUND_SHADER = createSprite2DCustomShader({ fragment: `
  let sampleColor = textureSample(atlasTex, atlasSamp, in.uv);
  if (in.tint.a < 0.0) {
    let localPx = (in.uv - vec2f(0.5)) * 64.0;
    if (dot(localPx, in.tint.rg) > in.tint.b) { discard; }
    return sampleColor * L.opacityMul * min(1.0, -in.tint.a);
  }
  return sampleColor * in.tint * L.opacityMul;
` });

export function getArrowGroundClip(angle, centerScreenY, groundScreenY) {
  return [Math.sin(angle), Math.cos(angle), groundScreenY - centerScreenY, -1];
}

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

export async function loadArrowAtlas(engine) {
  const atlas = await loadSpriteAtlas(engine, "./assets/units/archer/Arrow.png", {
    gridSize: [ARROW_ATLAS_FRAME.width, ARROW_ATLAS_FRAME.height],
    sampling: "nearest",
  });
  return atlas;
}

export function createProjectileRenderer({ atlas, bounds, obstacles, api = DEFAULT_API, onPickup = () => {} }) {
  const layer = api.createSprite2DLayer(atlas, {
    capacity: ARROW_CAPACITY,
    order: GAME_DEPTH.projectiles,
    pivot: [0.5, 0.5],
    customShader: ARROW_GROUND_SHADER,
  });
  const active = [];
  let nextProjectileId = 0;

  function removeAt(index) {
    api.removeSprite2D(active[index].sprite);
    active.splice(index, 1);
  }

  function getPickupCollider(projectile) {
    const velocity = projectile.flightVelocity;
    const length = Math.hypot(velocity.x, velocity.y);
    const ux = velocity.x / length;
    const uy = velocity.y / length;
    const shaftLength = projectile.cropOnLanding ? 32 : 64;
    const offset = projectile.cropOnLanding ? 16 : 0;
    const width = Math.abs(ux) * shaftLength + Math.abs(uy) * 10;
    const height = Math.abs(uy) * shaftLength + Math.abs(ux) * 10;
    return {
      x: projectile.position.x - ux * offset - width / 2,
      y: projectile.position.y - uy * offset - height / 2,
      width, height,
    };
  }

  function canPickUp(record) {
    return record.projectile.state === "landed" && record.ownerId != null && !record.hit && !record.deflection;
  }

  return {
    layer,
    shoot(position, direction, ownerId = null, options = {}) {
      // Babylon Lite grows this layer automatically when its initial capacity fills.
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
        gridSpot: new GridSpot(position, GRID),
      });
      nextProjectileId += 1;
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
      if (!record || record.hit || record.deflection || record.projectile.active === false) return false;
      record.deflection = {
        elapsedSeconds: 0,
        startRotation: getProjectileRotation(record.projectile.direction),
      };
      return true;
    },
    getColliders() {
      return active
        .filter(({ hit, deflection, projectile }) => !hit && !deflection && projectile.collisionEnabled)
        .map(({ id, projectile, ownerId, gridSpot }) => ({
          id,
          ownerId,
          type: "projectile",
          direction: projectile.direction,
          collider: getProjectileCollider(projectile),
          gridSpot,
        }));
    },
    getPickupColliders() {
      return active.filter(canPickUp).map(({ id, ownerId, projectile, gridSpot }) => ({
        id, ownerId, type: "arrow-pickup", collider: getPickupCollider(projectile), gridSpot,
      }));
    },
    collectGroundedArrows(characters) {
      for (let index = active.length - 1; index >= 0; index -= 1) {
        const record = active[index];
        if (!canPickUp(record)) continue;
        const owner = characters.find(({ id, collider }) => id === record.ownerId && collider);
        if (!owner || !collidersOverlap(getPickupCollider(record.projectile), owner.collider)) continue;
        record.projectile.state = "pickingUp";
        record.pickupElapsedSeconds = 0;
        onPickup({ id: record.id, ownerId: record.ownerId });
      }
    },
    getProjectiles() {
      return active.map(({ id, projectile, deflection, gridSpot }) => ({
        id,
        direction: { ...projectile.direction },
        position: { ...projectile.position },
        state: deflection ? "deflected" : projectile.state ?? "flying",
        active: projectile.active ?? true,
        gridSpot,
      }));
    },
    update(deltaSeconds, dynamicColliders = [], onFlightStep = () => false) {
      for (let index = active.length - 1; index >= 0; index -= 1) {
        const record = active[index];
        if (record.projectile.state === "pickingUp") {
          record.pickupElapsedSeconds += Math.max(0, deltaSeconds);
          const { rise, opacity, complete } = getPickupAnimation(record.pickupElapsedSeconds);
          if (complete) { removeAt(index); continue; }
          const screen = worldToScreen(record.projectile.position, 1, bounds.height);
          const angle = Math.atan2(-record.projectile.flightVelocity.y, record.projectile.flightVelocity.x);
          // Carry the frozen crop upwards with the arrow; negative alpha also
          // carries fade opacity so the ground-mask shader does not bypass it.
          const color = record.projectile.cropOnLanding
            ? [Math.sin(angle), Math.cos(angle), 0, -opacity]
            : [1, 1, 1, opacity];
          api.updateSprite2D(record.sprite, { positionPx: [screen.x, screen.y - rise], color });
          continue;
        }
        if (record.projectile.active === false) continue;
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
          record.gridSpot.update(record.projectile.position);
          const progress = record.deflection.elapsedSeconds / DEFLECT_DURATION_SECONDS;
          const screen = worldToScreen(record.projectile.position, 1, bounds.height);
          api.updateSprite2D(record.sprite, {
            positionPx: [screen.x, screen.y],
            rotation: record.deflection.startRotation + DEFLECT_ROTATION * progress,
            alpha: 1 - progress,
            color: [1, 1, 1, 1 - progress],
          });
          if (progress >= 1) removeAt(index);
          continue;
        }
        const result = advanceProjectile(
          record.projectile,
          deltaSeconds,
          bounds,
          [
            ...(record.projectile.arc ? [] : obstacles),
            ...dynamicColliders.map(({ collider }) => collider),
          ],
          (collider) => onFlightStep({ id: record.id, ownerId: record.ownerId, direction: record.projectile.flightVelocity, collider }),
        );
        if (!result.alive) {
          removeAt(index);
          continue;
        }

        const screen = worldToScreen(record.projectile.position, 1, bounds.height);
        record.gridSpot.update(record.projectile.position);
        const patch = {
          positionPx: [screen.x, screen.y - (record.projectile.height ?? 0)],
        };
        if (record.projectile.rotationEnabled) {
          patch.rotation = record.projectile.arc
            ? Math.atan2(-record.projectile.flightVelocity.y, record.projectile.flightVelocity.x)
            : getProjectileRotation(record.projectile.direction);
        }
        if (record.projectile.cropOnLanding && record.projectile.verticalVelocity < 0) {
          const angle = Math.atan2(-record.projectile.flightVelocity.y, record.projectile.flightVelocity.x);
          const groundScreenY = bounds.height - (record.projectile.origin.y - record.projectile.landingDrop);
          patch.color = getArrowGroundClip(angle, patch.positionPx[1], groundScreenY);
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
