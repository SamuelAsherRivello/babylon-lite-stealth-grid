import test from "node:test";
import assert from "node:assert/strict";
import {
  formatDownloadSize,
  loadEditorConfig,
  resolveEditorVersion,
} from "../../src/editor-config/editor-config.js";

test("release versions require an exact three-component tag", () => {
  assert.equal(resolveEditorVersion("v0.1.7"), "v0.1.7");
  assert.equal(resolveEditorVersion("V2.10.3"), "v2.10.3");
  assert.equal(resolveEditorVersion("v0.1"), "v0.0.0");
  assert.equal(resolveEditorVersion("v0.1.7-beta"), "v0.0.0");
  assert.equal(resolveEditorVersion(undefined), "v0.0.0");
});

test("download sizes use decimal megabytes and omit invalid values", () => {
  assert.equal(formatDownloadSize(100_000_000), "100.0Mb");
  assert.equal(formatDownloadSize("1250000"), "1.3Mb");
  assert.equal(formatDownloadSize(0), "0.0Mb");
  assert.equal(formatDownloadSize(""), "");
  assert.equal(formatDownloadSize("not-a-number"), "");
  assert.equal(formatDownloadSize(-1), "");
  assert.equal(formatDownloadSize(Number.POSITIVE_INFINITY), "");
});

test("release metadata loads relative to the deployment base without cache", async () => {
  const calls = [];
  const metadata = await loadEditorConfig("./releases/v0.1.7/", async (...args) => {
    calls.push(args);
    return {
      ok: true,
      json: async () => ({
        releaseVersion: "v0.1.7",
        downloadSize: "000012300000",
      }),
    };
  });

  assert.deepEqual(calls, [[
    "./releases/v0.1.7/environment.json",
    { cache: "no-store" },
  ]]);
  assert.deepEqual(metadata, {
    releaseVersion: "v0.1.7",
    downloadSize: "12.3Mb",
  });
});

test("release metadata failures fall back without blocking startup", async () => {
  const failedResponse = await loadEditorConfig("./", async () => ({
    ok: false,
    json: async () => ({ releaseVersion: "v9.9.9" }),
  }));
  const invalidJson = await loadEditorConfig("./", async () => ({
    ok: true,
    json: async () => { throw new SyntaxError("invalid json"); },
  }));
  const offline = await loadEditorConfig("./", async () => {
    throw new Error("offline");
  });

  for (const metadata of [failedResponse, invalidJson, offline]) {
    assert.deepEqual(metadata, {
      releaseVersion: "v0.0.0",
      downloadSize: "",
    });
  }
});
