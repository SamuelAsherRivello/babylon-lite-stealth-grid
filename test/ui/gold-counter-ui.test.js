import assert from "node:assert/strict";
import test from "node:test";
import { createGoldCounterUi, formatGoldCounterText } from "../../src/ui/gold-counter-ui.js";

test("gold counter formats two-digit collected and total values", () => {
  assert.equal(formatGoldCounterText(0, 10), "Gold: 00/10");
  assert.equal(formatGoldCounterText(3, 4), "Gold: 03/04");
});

test("gold counter initializes and increments visually", () => {
  const elements = [];
  const host = { append: (element) => elements.push(element) };
  const counter = createGoldCounterUi({ host, total: 10, documentRef: { createElement: () => ({ className: "", textContent: "" }) } });
  assert.equal(elements[0].className, "gold-counter");
  assert.equal(elements[0].textContent, "Gold: 00/10");
  counter.increment();
  assert.equal(elements[0].textContent, "Gold: 01/10");
});
