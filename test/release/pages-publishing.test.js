import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const read = (path) => readFile(new URL(`../../${path}`, import.meta.url), "utf8");
const demoUrl = "https://samuelasherrivello.github.io/babylon-lite-stealth-grid/";

test("README screenshot links directly to the renamed live game", async () => {
  const readme = await read("README.md");
  assert.ok(readme.includes(`<a href="${demoUrl}">`));
  assert.ok(readme.includes(`[Play the live demo](${demoUrl})`));
  const image = await readFile(new URL("../../documentation/images/output-arrow-check.png", import.meta.url));
  assert.equal(image.subarray(1, 4).toString(), "PNG");
  assert.deepEqual({ width: image.readUInt32BE(16), height: image.readUInt32BE(20) },
    { width: 405, height: 720 }, "match the original portrait screenshot dimensions");
});

test("Pages assets remain relative so repository renames do not break the build", async () => {
  const { default: config } = await import("../../vite.config.js");
  assert.equal(config.base, "./");
});

test("Pages publishing checks deployment contracts before building", async () => {
  const workflow = await read(".github/workflows/deploy-pages.yml");
  assert.match(workflow, /push:\s+branches:\s+- master/);
  assert.match(workflow, /workflow_dispatch:/);
  assert.match(workflow, /run: npm run test:publish/);
  assert.match(workflow, /run: npm test/);
  assert.ok(workflow.indexOf("run: npm test") < workflow.indexOf("run: npm run build"));
  assert.ok(workflow.indexOf("run: npm run test:publish") < workflow.indexOf("run: npm run build"));
  assert.match(workflow, /path: dist/);
  assert.doesNotMatch(workflow, /babylon-light-stealth-grid/);
});
