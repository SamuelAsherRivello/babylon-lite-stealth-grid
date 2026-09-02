import { createGoldPickup } from "./gold-pickup.js";

export function createPickupSystem({ createPickup = createGoldPickup, renderer = null } = {}) {
  const pickups = [];
  let activeRenderer = renderer;

  function attach(pickup) {
    if (activeRenderer) {
      activeRenderer.add(pickup.layer);
    }
    return pickup;
  }

  return {
    get pickups() { return pickups; },
    setRenderer(nextRenderer) {
      activeRenderer = nextRenderer;
      for (const pickup of pickups) attach(pickup);
    },
    spawn(definition, position) {
      if (!definition || typeof definition.create !== "function") {
        throw new TypeError("pickup definition with create is required");
      }
      const pickup = definition.create({ position, index: pickups.length });
      if (!pickup) return null;
      pickups.push(attach(pickup));
      return pickup;
    },
    update(deltaSeconds, playerCollider = null) {
      for (const pickup of pickups) {
        pickup.update(deltaSeconds);
        const collider = typeof pickup.getCombatCollider === "function"
          ? pickup.getCombatCollider()
          : pickup.getCollider?.();
        if (playerCollider && collider && collidersOverlap(playerCollider, collider)) pickup.collect();
      }
      for (let i = pickups.length - 1; i >= 0; i -= 1) {
        if (pickups[i].isDead) {
          if (activeRenderer) activeRenderer.remove(pickups[i].layer);
          pickups.splice(i, 1);
        }
      }
    },
    dispose() {
      for (const pickup of pickups) pickup.dispose();
      pickups.length = 0;
    },
  };
}

function collidersOverlap(a, b) {
  return a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y;
}
