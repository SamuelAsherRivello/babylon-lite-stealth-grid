import test from "node:test";
import assert from "node:assert/strict";
import { createStartGamePrompt, shouldShowStartGamePrompt, START_PROMPT_BODY } from "../../src/ui/start-game-prompt.js";

class FakeElement extends EventTarget {
  children = [];
  attributes = new Map();
  parentNode = null;
  focused = false;
  append(...children) { for (const child of children) { child.parentNode = this; this.children.push(child); } }
  remove() { this.parentNode?.children.splice(this.parentNode.children.indexOf(this), 1); this.parentNode = null; }
  setAttribute(name, value) { this.attributes.set(name, String(value)); }
  focus() { this.focused = true; }
}

const documentRef = { createElement: () => new FakeElement() };
const click = (element) => element.dispatchEvent(new Event("click", { bubbles: true }));

test("start prompt is enabled by default and can be suppressed", () => {
  assert.equal(shouldShowStartGamePrompt(), true);
  assert.equal(shouldShowStartGamePrompt({ showStartPrompt: true }), true);
  assert.equal(shouldShowStartGamePrompt({ showStartPrompt: false }), false);
});

test("start prompt has exact content and closes on any click", () => {
  const host = new FakeElement();
  let starts = 0;
  const prompt = createStartGamePrompt({ host, onStart: () => { starts += 1; }, documentRef });
  assert.equal(prompt.panel.children[0].textContent, "Stealth Grid");
  assert.equal(prompt.panel.children[1].textContent, START_PROMPT_BODY);
  assert.equal(prompt.startButton.textContent, "Start");
  assert.equal(prompt.panel.children.length, 3);
  assert.equal(prompt.startButton.focused, true);
  click(prompt.startButton);
  assert.equal(starts, 1);
  assert.equal(host.children.length, 0);
  const secondPrompt = createStartGamePrompt({ host, onStart: () => {}, documentRef });
  click(secondPrompt.backdrop, secondPrompt.panel);
  assert.equal(host.children.length, 0);
});
