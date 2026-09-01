import test from "node:test";
import assert from "node:assert/strict";

import {
  ARROW_SIZE,
  advanceProjectile,
  createProjectile,
  getProjectileCollider,
} from "../../src/systems/objects/projectile.js";

test("the arrow renders and collides at 200 percent of its prior size", () => {
  assert.deepEqual(ARROW_SIZE, { width: 72, height: 20 });
});

test("the arrow atlas uses its full square frame so transparent padding is scaled too", async () => {
  const renderer = await import("../../src/systems/objects/projectile-renderer.js");
  const source = await import("node:fs/promises").then(({ readFile }) =>
    readFile(new URL("../../src/systems/objects/projectile-renderer.js", import.meta.url), "utf8"));
  assert.match(source, /ARROW_ATLAS_FRAME = \{ width: 64, height: 64 \}/);
  assert.match(source, /const ARROW_RENDER_SIZE = 64/);
  assert.match(source, /sizePx: \[ARROW_RENDER_SIZE, ARROW_RENDER_SIZE\]/);
  assert.equal(typeof renderer.loadArrowAtlas, "function");
});

test("an arrow advances horizontally in its facing direction", () => {
  const right = createProjectile({ x: 100, y: 200 }, { x: 1, y: 0 });
  const left = createProjectile({ x: 100, y: 200 }, { x: -1, y: 0 });

  assert.equal(advanceProjectile(right, 0.1, { width: 576, height: 1024 }, []).alive, true);
  assert.equal(advanceProjectile(left, 0.1, { width: 576, height: 1024 }, []).alive, true);
  assert.equal(right.position.x, 160);
  assert.equal(left.position.x, 40);
  assert.equal(right.position.y, 200);
  assert.equal(left.position.y, 200);
});

test("an arrow advances vertically without horizontal drift", () => {
  const up = createProjectile({ x: 100, y: 200 }, { x: 0, y: 1 });
  const down = createProjectile({ x: 100, y: 200 }, { x: 0, y: -1 });
  assert.equal(advanceProjectile(up, 0.1, { width: 576, height: 1024 }, []).alive, true);
  assert.equal(advanceProjectile(down, 0.1, { width: 576, height: 1024 }, []).alive, true);
  assert.deepEqual(up.position, { x: 100, y: 260 });
  assert.deepEqual(down.position, { x: 100, y: 140 });
  assert.deepEqual(getProjectileCollider(up), { x: 90, y: 224, width: 20, height: 72 });
});

test("an arrow disappears when its collider reaches a blocked tile", () => {
  const arrow = createProjectile({ x: 100, y: 200 }, { x: 1, y: 0 });
  const obstacle = { x: 130, y: 190, width: 64, height: 64 };

  assert.deepEqual(
    advanceProjectile(arrow, 0.1, { width: 576, height: 1024 }, [obstacle]),
    { alive: false, reason: "collision" },
  );
});

test("an arrow resolves collision with a circular NPC collider", () => {
  const arrow = createProjectile({ x: 100, y: 200 }, { x: 1, y: 0 });
  const sheep = { type: "circle", x: 150, y: 200, radius: 26 };
  assert.equal(
    advanceProjectile(arrow, 0.1, { width: 576, height: 1024 }, [sheep]).reason,
    "collision",
  );
});

test("an arrow cannot tunnel through a thin collider during a long frame", () => {
  const arrow = createProjectile({ x: 100, y: 200 }, { x: 1, y: 0 });
  const obstacle = { x: 145, y: 195, width: 2, height: 10 };

  assert.equal(
    advanceProjectile(arrow, 0.1, { width: 576, height: 1024 }, [obstacle]).reason,
    "collision",
  );
});

test("an arrow disappears only after its complete collider leaves the screen", () => {
  const arrow = createProjectile({ x: 570, y: 200 }, { x: 1, y: 0 });

  assert.equal(advanceProjectile(arrow, 0.01, { width: 576, height: 1024 }, []).alive, true);
  assert.equal(advanceProjectile(arrow, 0.2, { width: 576, height: 1024 }, []).reason, "offscreen");
  assert.ok(getProjectileCollider(arrow).x >= 576);
});

test("vertical arrows collide without tunneling and leave through top and bottom", () => {
  const colliding = createProjectile({ x: 100, y: 100 }, { x: 0, y: 1 });
  assert.equal(
    advanceProjectile(
      colliding,
      0.2,
      { width: 576, height: 1024 },
      [{ x: 95, y: 155, width: 10, height: 2 }],
    ).reason,
    "collision",
  );

  const top = createProjectile({ x: 100, y: 1010 }, { x: 0, y: 1 });
  const bottom = createProjectile({ x: 100, y: 14 }, { x: 0, y: -1 });
  assert.equal(advanceProjectile(top, 0.2, { width: 576, height: 1024 }, []).reason, "offscreen");
  assert.equal(advanceProjectile(bottom, 0.2, { width: 576, height: 1024 }, []).reason, "offscreen");
});

test("renderer uses exact quarter turns for four cardinal directions", async () => {
  const { getProjectileRotation } = await import("../../src/systems/objects/projectile-renderer.js");
  assert.equal(getProjectileRotation({ x: 1, y: 0 }), 0);
  assert.equal(getProjectileRotation({ x: -1, y: 0 }), Math.PI);
  assert.equal(getProjectileRotation({ x: 0, y: 1 }), -Math.PI / 2);
  assert.equal(getProjectileRotation({ x: 0, y: -1 }), Math.PI / 2);
});
