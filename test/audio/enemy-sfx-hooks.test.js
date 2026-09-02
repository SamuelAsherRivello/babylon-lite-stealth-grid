import test from "node:test";
import assert from "node:assert/strict";
import { createGoblin, loadGoblinAtlases } from "../../src/characters/enemies/goblin/goblin.js";
import { createWarrior, loadWarriorAtlases } from "../../src/characters/enemies/warrior/warrior.js";
import { createLancer, loadLancerAtlases } from "../../src/characters/enemies/lancer/lancer.js";

for (const [name, create, load] of [
  ["goblin", createGoblin, loadGoblinAtlases],
  ["warrior", createWarrior, loadWarriorAtlases],
  ["lancer", createLancer, loadLancerAtlases],
]) {
  test(`${name} emits one sound hook per accepted attack, never after disposal`, async () => {
    let attacks = 0;
    const api = {
      loadSpriteAtlas: async () => ({}),
      createSprite2DLayer: (_atlas, options) => ({ ...options, view: { zoom: 1 } }),
      addSprite2D: (layer, options) => ({ layer, ...options }),
      updateSprite2D() {}, removeSprite2D() {}, stopSpriteAnimation() {},
      playSprite2DAnimation: () => ({}),
    };
    const actor = create({ atlases: await load({}, api), api, obstacles: [],
      initialPosition: { x: 200, y: 300 }, bounds: { width: 576, height: 1024 },
      onAttack: () => attacks++ });
    actor.playAnimation({});
    const args = name === "goblin" ? [{ x: 1, y: 0 }] : ["attack-1", { x: 1, y: 0 }];
    assert.equal(actor.attack(...args), true);
    assert.equal(actor.attack(...args), false);
    assert.equal(attacks, 1);
    actor.dispose();
    assert.equal(actor.attack(...args), false);
    assert.equal(attacks, 1);
  });
}
