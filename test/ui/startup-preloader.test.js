import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { loadWithPreloader } from "../../src/ui/startup-preloader.js";

function fixture(load) {
  const attributes = {};
  const overlay = { hidden: false, setAttribute: (key, value) => { attributes[key] = value; } };
  const message = {};
  const spinner = { hidden: false };
  const retry = { hidden: true, addEventListener() {} };
  const game = {};
  const done = loadWithPreloader({ load, overlay, message, spinner, retry, game, reload() {} });
  return { done, attributes, overlay, message, spinner, retry, game };
}

test("preloader blocks input and stays visible until the first frame", async () => {
  let rendered;
  const gameReady = new Promise((resolve) => { rendered = resolve; });
  const view = fixture(async () => ({ gameReady }));
  await Promise.resolve();
  assert.equal(view.overlay.hidden, false);
  assert.equal(view.game.inert, true);
  rendered();
  assert.equal(await view.done, true);
  assert.equal(view.overlay.hidden, true);
  assert.equal(view.game.inert, false);
});

for (const phase of ["module", "engine"]) {
  test(`preloader reports ${phase} failures without exposing an unfinished game`, async () => {
    const view = fixture(async () => {
      if (phase === "module") throw new Error("Asset unavailable");
      return { gameReady: Promise.reject(new Error("Asset unavailable")) };
    });
    assert.equal(await view.done, false);
    assert.equal(view.overlay.hidden, false);
    assert.equal(view.game.inert, true);
    assert.equal(view.spinner.hidden, true);
    assert.equal(view.retry.hidden, false);
    assert.equal(view.attributes.role, "alert");
    assert.match(view.message.textContent, /Asset unavailable/);
  });
}

test("startup preloader exists in HTML before any game module executes", async () => {
  const html = await readFile(new URL("../../index.html", import.meta.url), "utf8");
  assert.match(html, /id="startup-preloader"/);
  assert.match(html, /aria-busy="true"/);
  assert.match(html, /src="\.\/src\/bootstrap.js"/);
  assert.ok(html.indexOf('id="startup-preloader"') < html.indexOf('<script type="module"'));
});
