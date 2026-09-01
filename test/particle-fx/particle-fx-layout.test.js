import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

import { createParticleFxPreviewLayout } from "../../src/particle-fx/preview-layout.js";
import { PARTICLE_FX_ORDER } from "../../src/particle-fx/particle-fx.catalog.js";

test("eight particle previews form a centered horizontal row", () => {
  const layout = createParticleFxPreviewLayout(576, 1024);

  assert.equal(layout.length, 8);
  assert.deepEqual(layout.map(({ key }) => key), PARTICLE_FX_ORDER);
  assert.deepEqual(layout.map(({ position }) => position), [
    [32, 480],
    [96, 480],
    [160, 480],
    [224, 480],
    [288, 480],
    [352, 480],
    [416, 480],
    [480, 480],
  ]);
  assert.ok(layout.every(({ displaySize }) => (
    displaySize[0] === 64 && displaySize[1] === 64
  )));
  assert.ok(layout.every(({ order }) => order === 3));
  assert.deepEqual(
    {
      left: layout[0].position[0],
      top: layout[0].position[1],
      right: layout.at(-1).position[0] + layout.at(-1).displaySize[0],
      bottom: layout.at(-1).position[1] + layout.at(-1).displaySize[1],
    },
    { left: 32, top: 480, right: 544, bottom: 544 },
  );
});

test("main composes, scales, and settings-gates every particle preview layer", async () => {
  const source = await readFile(new URL("../../src/main.js", import.meta.url), "utf8");

  assert.match(source, /createParticleFxPreviewLayout/);
  assert.match(source, /PARTICLE_FX_CLASS_BY_KEY/);
  assert.match(source, /particleEffects = await Promise\.all/);
  assert.match(source, /particleEffects\.map\(\(effect\) => effect\.layer\)/);
  assert.match(source, /for \(const effect of particleEffects\)/);
  assert.match(source, /effect\.layer\.view\.zoom = viewportScale/);
  assert.match(source, /applyParticleFxPreviewSetting/);
});
