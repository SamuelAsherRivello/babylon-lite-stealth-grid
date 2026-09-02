import test from "node:test";
import assert from "node:assert/strict";
import { createStartGamePrompt, shouldShowStartGamePrompt, shouldSkipIntro, START_PROMPT_BODY } from "../../src/ui/start-game-prompt.js";

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
const click = (element, eventTarget = element) => {
  const event = new Event("click", { bubbles: true });
  Object.defineProperty(event, "target", { value: eventTarget });
  element.dispatchEvent(event);
};

test("start prompt is enabled by default and can be suppressed", () => {
  assert.equal(shouldShowStartGamePrompt(), true);
  assert.equal(shouldShowStartGamePrompt({ showStartPrompt: true }), true);
  assert.equal(shouldShowStartGamePrompt({ showStartPrompt: false }), false);
});

test("skipIntro is enabled only for the exact development query flag", () => {
  assert.equal(shouldSkipIntro({ isDevelopment: true, search: "?skipIntro=true" }), true);
  assert.equal(shouldSkipIntro({ isDevelopment: true, search: "?skipIntro=false" }), false);
  assert.equal(shouldSkipIntro({ isDevelopment: false, search: "?skipIntro=true" }), false);
});

test("start prompt closes only when the backdrop itself is clicked", () => {
  const host = new FakeElement();
  let starts = 0;
  const prompt = createStartGamePrompt({ host, onStart: () => { starts += 1; }, documentRef });
  assert.equal(prompt.panel.children[0].textContent, "Stealth Grid");
  assert.equal(prompt.panel.children[1].textContent, START_PROMPT_BODY);
  assert.equal(prompt.startButton.textContent, "Start");
  assert.equal(prompt.panel.children.length, 3);
  assert.equal(prompt.startButton.focused, true);
  click(prompt.backdrop, prompt.panel);
  assert.equal(host.children.length, 1);
  assert.equal(starts, 0);
  click(prompt.startButton);
  click(prompt.backdrop);
  assert.equal(starts, 1);
  assert.equal(host.children.length, 0);
  const secondPrompt = createStartGamePrompt({ host, onStart: () => {}, documentRef });
  click(secondPrompt.backdrop, secondPrompt.panel);
  assert.equal(host.children.length, 1);
  click(secondPrompt.backdrop);
  assert.equal(host.children.length, 0);
});
