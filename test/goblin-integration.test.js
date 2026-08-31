import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

import {
  createGoblinDemoController,
} from "../src/enemies/goblin/goblin-demo-controller.js";

function createGoblinSpy() {
  const events = [];
  return {
    events,
    goblin: {
      attack(direction) {
        events.push({ type: "attack", direction });
        return true;
      },
      setMovementIntent(movement) {
        events.push({ type: "movement", movement });
      },
    },
  };
}

test("goblin remains idle for a random three to five seconds", () => {
  for (const [random, idleSeconds] of [[0, 3], [1, 5]]) {
    const { events, goblin } = createGoblinSpy();
    const controller = createGoblinDemoController(goblin, {
      random: () => random,
    });

    assert.equal(controller.phaseIndex, 0);
    assert.equal(events.length, 1);
    controller.update(idleSeconds - 0.001);
    assert.equal(controller.phaseIndex, 0);
    assert.equal(events.length, 1);
    controller.update(0.001);
    assert.equal(controller.phaseIndex, 1);
    assert.deepEqual(events.at(-1), {
      type: "movement",
      movement: { x: 1, y: 0 },
    });
  }
});

test("goblin demo cycles through idle, walking, and directional attacks", () => {
  const events = [];
  const goblin = {
    attack(direction) {
      events.push({ type: "attack", direction });
      return true;
    },
    setMovementIntent(movement) {
      events.push({ type: "movement", movement });
    },
  };
  const controller = createGoblinDemoController(goblin);

  assert.deepEqual(events.shift(), {
    type: "movement",
    movement: { x: 0, y: 0 },
  });
  for (let index = 0; index < 10; index += 1) {
    controller.update(2);
  }

  assert.deepEqual(
    events.filter(({ type }) => type === "attack").map(({ direction }) => direction),
    [
      { x: 1, y: 0 },
      { x: -1, y: 0 },
      { x: 0, y: 1 },
      { x: 0, y: -1 },
    ],
  );
  assert.ok(events.some(({ movement }) => movement?.x === 1));
  assert.ok(events.some(({ movement }) => movement?.x === -1));
});

test("main owns the complete spawner-managed goblin lifecycle", async () => {
  const source = await readFile(new URL("../src/main.js", import.meta.url), "utf8");

  assert.match(source, /loadGoblinAtlases/);
  assert.match(source, /createGoblin\(/);
  assert.match(source, /createGoblinDemoController/);
  assert.match(source, /createGoblinRecord/);
  assert.match(source, /addSpriteRendererLayer\(renderer, layer\)/);
  assert.match(source, /record\.actor\.playAnimation\(animationManager\)/);
  assert.match(source, /record\.controller\.update\(activeDelta\)/);
  assert.match(source, /record\.actor\.update\(activeDelta/);
  assert.match(source, /record\.actor\.dispose\(\)/);
});
