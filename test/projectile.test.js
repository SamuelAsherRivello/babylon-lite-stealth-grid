import test from "node:test";
import assert from "node:assert/strict";

import {
  ARROW_SIZE,
  advanceProjectile,
  createProjectile,
  getProjectileCollider,
} from "../src/projectile.js";

test("the arrow renders and collides at 200 percent of its prior size", () => {
  assert.deepEqual(ARROW_SIZE, { width: 72, height: 20 });
});

test("the arrow atlas uses its full square frame so transparent padding is scaled too", async () => {
  const renderer = await import("../src/projectile-renderer.js");
  const source = await import("node:fs/promises").then(({ readFile }) =>
    readFile(new URL("../src/projectile-renderer.js", import.meta.url), "utf8"));
  assert.match(source, /ARROW_ATLAS_FRAME = \{ width: 64, height: 64 \}/);
  assert.match(source, /const ARROW_RENDER_SIZE = 107/);
  assert.match(source, /sizePx: \[ARROW_RENDER_SIZE, ARROW_RENDER_SIZE\]/);
  assert.equal(typeof renderer.loadArrowAtlas, "function");
});

test("an arrow advances horizontally in its facing direction", () => {
  const right = createProjectile({ x: 100, y: 200 }, 1);
  const left = createProjectile({ x: 100, y: 200 }, -1);

  assert.equal(advanceProjectile(right, 0.1, { width: 576, height: 1024 }, []).alive, true);
  assert.equal(advanceProjectile(left, 0.1, { width: 576, height: 1024 }, []).alive, true);
  assert.equal(right.position.x, 160);
  assert.equal(left.position.x, 40);
  assert.equal(right.position.y, 200);
  assert.equal(left.position.y, 200);
});

test("an arrow disappears when its collider reaches a blocked tile", () => {
  const arrow = createProjectile({ x: 100, y: 200 }, 1);
  const obstacle = { x: 130, y: 190, width: 64, height: 64 };

  assert.deepEqual(
    advanceProjectile(arrow, 0.1, { width: 576, height: 1024 }, [obstacle]),
    { alive: false, reason: "collision" },
  );
});

test("an arrow cannot tunnel through a thin collider during a long frame", () => {
  const arrow = createProjectile({ x: 100, y: 200 }, 1);
  const obstacle = { x: 145, y: 195, width: 2, height: 10 };

  assert.equal(
    advanceProjectile(arrow, 0.1, { width: 576, height: 1024 }, [obstacle]).reason,
    "collision",
  );
});

test("an arrow disappears only after its complete collider leaves the screen", () => {
  const arrow = createProjectile({ x: 570, y: 200 }, 1);

  assert.equal(advanceProjectile(arrow, 0.01, { width: 576, height: 1024 }, []).alive, true);
  assert.equal(advanceProjectile(arrow, 0.2, { width: 576, height: 1024 }, []).reason, "offscreen");
  assert.ok(getProjectileCollider(arrow).x >= 576);
});
