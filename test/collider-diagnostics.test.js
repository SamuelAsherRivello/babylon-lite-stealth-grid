import test from "node:test";
import assert from "node:assert/strict";

import {
  COMBAT_COLLIDER_STYLE,
  MOVEMENT_COLLIDER_STYLE,
  createCharacterColliderDrawCommands,
} from "../src/collider-diagnostics.js";

test("diagnostics draw every red combat collider before green movement colliders", () => {
  const characters = [
    { combatCollider: { id: "player-combat" }, movementCollider: { id: "player-movement" } },
    { combatCollider: { id: "sheep-combat" }, movementCollider: { id: "sheep-movement" } },
  ];
  const commands = createCharacterColliderDrawCommands(characters);

  assert.deepEqual(commands.map(({ collider }) => collider.id), [
    "player-combat", "sheep-combat", "player-movement", "sheep-movement",
  ]);
  assert.ok(commands.slice(0, 2).every(({ style }) => style === COMBAT_COLLIDER_STYLE));
  assert.ok(commands.slice(2).every(({ style }) => style === MOVEMENT_COLLIDER_STYLE));
  assert.match(COMBAT_COLLIDER_STYLE.strokeStyle, /ff|red/i);
  assert.match(MOVEMENT_COLLIDER_STYLE.strokeStyle, /green|40d|2ecc|22c/i);
});
