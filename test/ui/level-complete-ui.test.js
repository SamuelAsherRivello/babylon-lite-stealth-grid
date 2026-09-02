import test from "node:test";
import assert from "node:assert/strict";
import { createLevelCompleteUi } from "../../src/ui/level-complete-ui.js";

class FakeElement extends EventTarget {
  children = [];
  parentNode = null;
  hidden = false;
  append(...children) { for (const child of children) { child.parentNode = this; this.children.push(child); } }
  remove() { this.parentNode?.children.splice(this.parentNode.children.indexOf(this), 1); this.parentNode = null; }
  setAttribute() {}
  focus() {}
}

const documentRef = { createElement: () => new FakeElement() };

test("level complete closes only when the backdrop itself is clicked", () => {
  const host = new FakeElement();
  let continued = 0;
  const ui = createLevelCompleteUi({ host, onContinue: () => { continued += 1; }, documentRef });
  ui.show();
  const panel = ui.panel;
  const button = panel.children[2];
  button.dispatchEvent(new Event("click", { bubbles: true }));
  assert.equal(host.children.length, 1);
  assert.equal(continued, 1);
  ui.backdrop.dispatchEvent(new Event("click", { bubbles: true }));
  assert.equal(host.children.length, 0);
});
