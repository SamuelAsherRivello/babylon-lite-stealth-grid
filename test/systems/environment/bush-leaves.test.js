import assert from "node:assert/strict";
import test from "node:test";
import { createBushLeaves } from "../../../src/particle-fx/bush-leaves.js";

for (const randomValue of [0.25, 0.75]) {
  test(`leaf burst (${randomValue}) grows, arcs, lands, fades and cleans up`, () => {
    const sprites = new Set();
    const effect = createBushLeaves({ atlas: {}, position: [100, 200], order: 1, random: () => randomValue,
      api: {
        createSprite2DLayer: () => ({}),
        addSprite2D: (_, props) => { sprites.add(props); return props; },
        updateSprite2D: (sprite, patch) => Object.assign(sprite, patch),
        removeSprite2D: (sprite) => sprites.delete(sprite),
      },
    });
    effect.burst();
    assert.equal(sprites.size, randomValue < 0.5 ? 3 : 4);
    const leaves = [...sprites];
    const origins = leaves.map(leaf => [...leaf.positionPx]);
    assert.ok(leaves.every(leaf => leaf.color[3] === 0 && leaf.sizePx[0] === 0));
    effect.update(0.05);
    assert.ok(leaves.every(leaf => leaf.color[3] === 0.5 && leaf.sizePx[0] === 8));
    const flight = 0.65 + randomValue * 0.3;
    effect.update(flight / 2 - 0.05);
    assert.ok(leaves.every((leaf, i) => leaf.positionPx[1] < origins[i][1] && leaf.color[3] === 1));
    assert.ok(leaves[0].positionPx[0] < origins[0][0]);
    assert.ok(leaves[1].positionPx[0] > origins[1][0]);
    effect.update(flight / 2);
    assert.ok(leaves.every((leaf, i) => leaf.positionPx[1] === origins[i][1]));
    effect.update(0.09);
    assert.ok(leaves.every(leaf => Math.abs(leaf.color[3] - 0.5) < 1e-9));
    effect.update(0.1);
    assert.equal(sprites.size, 0);
    effect.burst();
    effect.dispose();
    effect.burst();
    assert.equal(sprites.size, 0);
  });
}

