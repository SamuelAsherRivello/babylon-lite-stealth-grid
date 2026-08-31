import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

import {
  createWarriorDemoController,
} from "../src/enemies/warrior/warrior-demo-controller.js";

test("warrior demo exposes idle, run, both attacks, and guard", () => {
  const events = [];
  const warrior = {
    attack(name, direction) {
      events.push({ type: "attack", name, direction });
      return true;
    },
    setGuarding(enabled) {
      events.push({ type: "guard", enabled });
      return true;
    },
    setMovementIntent(movement) {
      events.push({ type: "movement", movement });
    },
  };
  const controller = createWarriorDemoController(warrior);
  for (let index = 0; index < 8; index += 1) {
    controller.update(2);
  }
  assert.deepEqual(
    events.filter(({ type }) => type === "attack").map(({ name }) => name),
    ["attack-1", "attack-2"],
  );
  assert.ok(events.some(({ movement }) => movement?.x === 1));
  assert.ok(events.some(({ type, enabled }) => type === "guard" && enabled));
  assert.ok(events.some(({ type, enabled }) => type === "guard" && !enabled));
});

test("main owns the spawner-managed Warrior lifecycle", async () => {
  const source = await readFile(new URL("../src/main.js", import.meta.url), "utf8");
  assert.match(source, /loadWarriorAtlases/);
  assert.match(source, /createWarrior\(/);
  assert.match(source, /createWarriorDemoController/);
  assert.match(source, /createWarriorRecord/);
  assert.match(source, /SpawnerCharacter\.WARRIOR/);
});
