import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import {
  createReleaseMetadataUi,
  formatReleaseMetadataText,
} from "../src/ui/release-metadata-ui.js";

function createDocumentStub() {
  return {
    createElement(tagName) {
      return {
        tagName: tagName.toUpperCase(),
        className: "",
        textContent: "",
      };
    },
  };
}

test("release metadata text appends size only when known", () => {
  assert.equal(formatReleaseMetadataText({
    releaseVersion: "v0.1.7",
    downloadSize: "12.3Mb",
  }), "v0.1.7 12.3Mb");
  assert.equal(formatReleaseMetadataText({
    releaseVersion: "v0.1.7",
    downloadSize: "",
  }), "v0.1.7");
});

test("release metadata creates one line in the existing game UI overlay", () => {
  const children = [];
  const host = { append: (...elements) => children.push(...elements) };
  const element = createReleaseMetadataUi({
    host,
    metadata: {
      releaseVersion: "v0.1.7",
      downloadSize: "12.3Mb",
    },
    documentRef: createDocumentStub(),
  });

  assert.equal(children.length, 1);
  assert.equal(children[0], element);
  assert.equal(element.tagName, "P");
  assert.equal(element.className, "release-metadata");
  assert.equal(element.textContent, "v0.1.7 12.3Mb");
});

test("release metadata styling matches the proportional upper-left contract", async () => {
  const styles = await readFile(new URL("../src/ui/style.css", import.meta.url), "utf8");
  const rule = styles.match(/\.release-metadata\s*\{([^}]*)\}/s)?.[1] ?? "";

  assert.match(styles, /--screen-margin:\s*30px/);
  assert.match(rule, /position:\s*absolute/);
  assert.match(rule, /top:\s*var\(--ui-safe-top\)/);
  assert.match(rule, /left:\s*var\(--ui-safe-left\)/);
  assert.match(rule, /font-size:\s*clamp\(0\.75rem, 2\.67cqw, 1rem\)/);
  assert.match(rule, /line-height:\s*1\.5/);
  assert.match(rule, /white-space:\s*nowrap/);
  assert.match(rule, /pointer-events:\s*none/);
  assert.doesNotMatch(rule, /(?:^|[\s:(,+-])-?(?:\d*\.)?\d+(?:vw|vh)\b/);
});

test("startup loads and renders release metadata", async () => {
  const mainSource = await readFile(new URL("../src/main.js", import.meta.url), "utf8");

  assert.match(mainSource, /loadReleaseMetadata\(import\.meta\.env\.BASE_URL\)/);
  assert.match(mainSource, /createReleaseMetadataUi\(\{/);
  assert.match(mainSource, /host:\s*gameUi/);
});
