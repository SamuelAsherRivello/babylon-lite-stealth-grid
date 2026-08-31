import test from "node:test";
import assert from "node:assert/strict";

import {
  applyVisibleViewport,
  createViewportSafeArea,
  intersectViewportWithGameFrame,
  readVisibleViewport,
} from "../src/ui/viewport-safe-area.js";

function createEventTarget(properties = {}) {
  const listeners = new Map();
  return Object.assign(properties, {
    addEventListener(type, listener) {
      const bucket = listeners.get(type) ?? new Set();
      bucket.add(listener);
      listeners.set(type, bucket);
    },
    removeEventListener(type, listener) {
      listeners.get(type)?.delete(listener);
    },
    dispatch(type) {
      for (const listener of listeners.get(type) ?? []) listener();
    },
    listenerCount(type) {
      return listeners.get(type)?.size ?? 0;
    },
  });
}

test("reads the visual viewport and falls back to the layout viewport", () => {
  assert.deepEqual(readVisibleViewport({
    innerWidth: 800,
    innerHeight: 600,
    visualViewport: { offsetLeft: 7, offsetTop: 11, width: 320, height: 540 },
  }), { left: 7, top: 11, width: 320, height: 540 });
  assert.deepEqual(readVisibleViewport({ innerWidth: 800, innerHeight: 600 }), {
    left: 0, top: 0, width: 800, height: 600,
  });
});

test("applies visible viewport bounds idempotently", () => {
  const classes = new Set();
  const element = { style: {}, classList: { add: (...names) => names.forEach((name) => classes.add(name)) } };
  const rect = { left: 4.5, top: 8, width: 390, height: 844 };
  applyVisibleViewport(element, rect);
  applyVisibleViewport(element, rect);
  assert.deepEqual(element.style, {
    left: "4.5px", top: "8px", width: "390px", height: "844px",
  });
  assert.equal(classes.has("is-viewport-ready"), true);
});

test("safe UI bounds are the visible intersection of viewport and game frame", () => {
  assert.deepEqual(intersectViewportWithGameFrame(
    { left: 0, top: 0, width: 1278, height: 1328 },
    { left: 266, top: 0, right: 1012, bottom: 1328 },
  ), { left: 266, top: 0, width: 746, height: 1328 });

  assert.deepEqual(intersectViewportWithGameFrame(
    { left: 0, top: 0, width: 554, height: 1330 },
    { left: -97, top: 0, right: 651, bottom: 1330 },
  ), { left: 0, top: 0, width: 554, height: 1330 });
});

test("coordinator updates for every viewport signal and disposes subscriptions", () => {
  const visualViewport = createEventTarget({ offsetLeft: 0, offsetTop: 0, width: 390, height: 844 });
  const windowRef = createEventTarget({ innerWidth: 390, innerHeight: 844, visualViewport });
  const documentElement = {};
  const documentRef = createEventTarget({ documentElement });
  const element = { style: {}, classList: { add() {} } };
  const frameElement = {
    getBoundingClientRect: () => ({ left: -20, top: 0, right: 410, bottom: 844 }),
  };
  const observed = [];
  let disconnected = false;
  class ResizeObserverStub {
    constructor(callback) { this.callback = callback; }
    observe(target) { observed.push(target); }
    disconnect() { disconnected = true; }
  }

  const coordinator = createViewportSafeArea({
    element, frameElement, windowRef, documentRef, ResizeObserverRef: ResizeObserverStub,
  });
  assert.deepEqual(observed, [documentElement, frameElement]);
  visualViewport.width = 412;
  for (const [target, event] of [
    [windowRef, "resize"], [windowRef, "orientationchange"],
    [documentRef, "fullscreenchange"], [visualViewport, "resize"],
    [visualViewport, "scroll"],
  ]) {
    target.dispatch(event);
    assert.equal(element.style.width, "410px");
  }

  coordinator.dispose();
  assert.equal(disconnected, true);
  assert.equal(windowRef.listenerCount("resize"), 0);
  assert.equal(windowRef.listenerCount("orientationchange"), 0);
  assert.equal(documentRef.listenerCount("fullscreenchange"), 0);
  assert.equal(visualViewport.listenerCount("resize"), 0);
  assert.equal(visualViewport.listenerCount("scroll"), 0);
});
