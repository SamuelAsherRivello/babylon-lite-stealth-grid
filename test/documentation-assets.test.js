import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

const README_URL = new URL("../README.md", import.meta.url);

test("README screenshot reference resolves to an existing project file", async () => {
  const readme = await readFile(README_URL, "utf8");
  const screenshotPath = readme.match(/src="([^"]*output-arrow-check\.png)"/)?.[1];

  assert.ok(screenshotPath, "README must reference the gameplay screenshot");
  await assert.doesNotReject(access(new URL(screenshotPath, README_URL)));
});
