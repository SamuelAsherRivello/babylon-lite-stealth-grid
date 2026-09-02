import test from "node:test";
import assert from "node:assert/strict";
import { separateOverlappingCharacterColliders } from "../../src/gameplay/game-logic.js";

test("separation ignores invalid obstacle records without throwing", () => {
  const firstPosition = { x: 100, y: 100 };
  const secondPosition = { x: 110, y: 100 };
  const makeRecord = (position) => ({
    combat: { isAlive: true },
    actor: {
      getPosition: () => position,
      getMovementCollider: () => ({ type: "circle", x: position.x, y: position.y, radius: 24 }),
      setPosition: (next) => Object.assign(position, next),
    },
  });

  const invalidObstacleRecord = {
    combat: { isAlive: true },
    actor: { getMovementCollider: () => ({ type: "circle", x: 110, y: 100, radius: 24 }) },
  };

  assert.doesNotThrow(() => separateOverlappingCharacterColliders(
    [makeRecord(firstPosition), invalidObstacleRecord],
    0.01,
    1,
    [undefined],
  ));
});
