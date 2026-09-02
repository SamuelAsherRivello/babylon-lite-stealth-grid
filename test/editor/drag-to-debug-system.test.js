import test from "node:test";
import assert from "node:assert/strict";
import { createDragToDebugSystem } from "../../src/editor/systems/drag-to-debug-system/index.js";

function setup() {
  const children = [];
  const moves = [];
  let disconnected = false;
  const documentRef = { createElement() {
    return {
      style: {}, offsetWidth: 200, offsetHeight: 100, captured: null,
      setAttribute() {}, setPointerCapture(id) { this.captured = id; },
      hasPointerCapture(id) { return this.captured === id; },
      releasePointerCapture() { this.captured = null; },
      remove() { this.removed = true; },
    };
  } };
  const host = { append(...items) { children.push(...items); }, getBoundingClientRect: () => ({ left: 0, top: 0, width: 800, height: 600 }) };
  const canvas = { getBoundingClientRect: () => ({ left: 100, top: 50, width: 200, height: 400 }) };
  const tool = createDragToDebugSystem({ host, canvas, width: 400, height: 800,
    initialPosition: { x: 100, y: 200 }, referencePosition: { x: 80, y: 180 },
    targetLabel: "Socket", referenceLabel: "Actor", context: "frame 5",
    documentRef, ResizeObserverClass: class { observe() {} disconnect() { disconnected = true; } },
    onMove: point => moves.push(point),
  });
  const event = (x, y, pointerId = 1) => ({ clientX: x, clientY: y, pointerId, button: 0, preventDefault() {}, stopPropagation() {} });
  return { tool, children, moves, event, disconnected: () => disconnected };
}

test("generic readout tracks scaled dragging in Y-up world coordinates without snapping", () => {
  const { tool, children: [handle, label], moves, event } = setup();
  assert.equal(handle.style.left, "134px");
  assert.equal(handle.style.top, "334px");
  assert.match(label.textContent, /Actor X 80.00  Y 180.00/);
  assert.match(label.textContent, /Offset X 20.00  Y 20.00/);
  const labelStart = label.style.top;
  handle.onpointerdown(event(155, 355));
  handle.onpointermove(event(165, 340));
  assert.deepEqual(tool.getPosition(), { x: 120, y: 230 });
  assert.deepEqual(moves, [{ x: 120, y: 230 }]);
  assert.match(label.textContent, /Socket X 120.00  Y 230.00/);
  assert.notEqual(label.style.top, labelStart);
  assert.ok(parseFloat(label.style.left) >= parseFloat(handle.style.left) + 32);
  tool.dispose();
});

test("drag clamps to world bounds, ignores other pointers and cleans up", () => {
  const context = setup();
  const { tool, children: [handle, label], event } = context;
  handle.onpointerdown(event(0, 0));
  handle.onpointermove(event(100, 100, 2));
  assert.deepEqual(tool.getPosition(), { x: 100, y: 200 });
  handle.onpointermove(event(1000, 1000));
  assert.deepEqual(tool.getPosition(), { x: 400, y: 0 });
  handle.onpointercancel(event(1000, 1000));
  handle.onpointermove(event(0, 0));
  assert.deepEqual(tool.getPosition(), { x: 400, y: 0 });
  tool.dispose();
  assert.equal(context.disconnected(), true);
  assert.equal(handle.removed, true);
  assert.equal(label.removed, true);
  assert.equal(handle.captured, null);
});
