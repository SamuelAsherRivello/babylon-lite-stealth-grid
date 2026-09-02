import { addSprite2D, createSprite2DLayer, removeSprite2D, updateSprite2D } from "@babylonjs/lite";

const DEFAULT_API = { addSprite2D, createSprite2DLayer, removeSprite2D, updateSprite2D };

export function createBushLeaves({ atlas, position, order, api = DEFAULT_API, random = Math.random }) {
  const layer = api.createSprite2DLayer(atlas, { capacity: 16, order, pivot: [0.5, 0.5] });
  const leaves = [];
  let disposed = false;
  return {
    layer,
    burst() {
      if (disposed) return;
      const count = random() < 0.5 ? 3 : 4;
      for (let i = 0; i < count; i++) {
        const origin = [position[0] + (random() - 0.5) * 10, position[1] + (random() - 0.5) * 6];
        const direction = [-1, 1, 0, random() < 0.5 ? -1 : 1][i];
        leaves.push({
          sprite: api.addSprite2D(layer, { positionPx: origin, sizePx: [0, 0], frame: 0, color: [1, 1, 1, 0] }),
          origin, age: 0, flight: 0.65 + random() * 0.3,
          distance: direction === 0 ? (random() - 0.5) * 18 : direction * (22 + random() * 24),
          height: 28 + random() * 28,
          rotation: (random() - 0.5) * 0.8,
          spin: (random() - 0.5) * 2,
        });
      }
    },
    update(deltaSeconds) {
      if (disposed) return;
      for (let i = leaves.length - 1; i >= 0; i--) {
        const leaf = leaves[i];
        leaf.age += Math.max(0, deltaSeconds);
        const t = Math.min(1, leaf.age / leaf.flight);
        // Land at the exact launch height, then shrink and fade for 180ms.
        const spawn = Math.min(1, leaf.age / 0.1);
        const death = Math.max(0, Math.min(1, (leaf.age - leaf.flight) / 0.18));
        const visibility = spawn * (1 - death);
        api.updateSprite2D(leaf.sprite, {
          positionPx: [leaf.origin[0] + leaf.distance * t, leaf.origin[1] - 4 * leaf.height * t * (1 - t)],
          sizePx: [16 * visibility, 14 * visibility], color: [1, 1, 1, visibility], visible: true,
          rotation: leaf.rotation + leaf.spin * t,
        });
        if (death === 1) {
          api.removeSprite2D(leaf.sprite);
          leaves.splice(i, 1);
        }
      }
    },
    dispose() {
      if (disposed) return;
      disposed = true;
      for (const leaf of leaves) api.removeSprite2D(leaf.sprite);
      leaves.length = 0;
      layer.visible = false;
    },
  };
}

