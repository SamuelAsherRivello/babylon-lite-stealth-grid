import test from "node:test";
import assert from "node:assert/strict";

class FakeClassList {
  values = new Set();

  add(value) {
    this.values.add(value);
  }

  remove(value) {
    this.values.delete(value);
  }

  contains(value) {
    return this.values.has(value);
  }

  toggle(value, force) {
    if (force) {
      this.add(value);
    } else {
      this.remove(value);
    }
  }
}

class FakeControl extends EventTarget {
  classList = new FakeClassList();
  style = {};
  capturedPointers = new Set();

  constructor(rect = { left: 0, top: 0, width: 100, height: 100 }) {
    super();
    this.rect = rect;
  }

  getBoundingClientRect() {
    return this.rect;
  }

  setPointerCapture(pointerId) {
    this.capturedPointers.add(pointerId);
  }
}

function pointerEvent(type, pointerId, clientX = 0, clientY = 0) {
  const event = new Event(type, { cancelable: true });
  Object.defineProperties(event, {
    clientX: { value: clientX },
    clientY: { value: clientY },
    pointerId: { value: pointerId },
  });
  return event;
}

globalThis.window = new EventTarget();
const { createVirtualController } = await import("../src/ui/virtual-controller.js");

function createHarness(onShoot) {
  const joystick = new FakeControl();
  const puck = new FakeControl({ left: 0, top: 0, width: 40, height: 40 });
  const jumpButton = new FakeControl();
  const shootButton = new FakeControl();
  let jumps = 0;
  let shots = 0;
  const controller = createVirtualController({
    joystick,
    puck,
    jumpButton,
    shootButton,
    onJump: () => {
      jumps += 1;
    },
    onShoot: onShoot ?? (() => {
      shots += 1;
    }),
  });

  return {
    controller,
    get jumps() {
      return jumps;
    },
    joystick,
    jumpButton,
    puck,
    shootButton,
    get shots() {
      return shots;
    },
  };
}

test("movement capture and action pointers remain independent", () => {
  const harness = createHarness();

  harness.joystick.dispatchEvent(pointerEvent("pointerdown", 1, 100, 50));
  harness.jumpButton.dispatchEvent(pointerEvent("pointerdown", 2));

  assert.deepEqual(harness.controller.getMovement(), { x: 1, y: 0 });
  assert.equal(harness.jumps, 1);
  assert.equal(harness.joystick.classList.contains("is-pressed"), true);
  assert.equal(harness.jumpButton.classList.contains("is-pressed"), true);

  harness.jumpButton.dispatchEvent(pointerEvent("pointercancel", 2));
  assert.deepEqual(harness.controller.getMovement(), { x: 1, y: 0 });
  assert.equal(harness.jumpButton.classList.contains("is-pressed"), false);

  harness.joystick.dispatchEvent(pointerEvent("pointerup", 1));
  assert.deepEqual(harness.controller.getMovement(), { x: 0, y: 0 });
  harness.controller.dispose();
});

test("Shoot fires once per pointer press and safely supports a no-op", () => {
  const harness = createHarness();

  harness.shootButton.dispatchEvent(pointerEvent("pointerdown", 7));
  harness.shootButton.dispatchEvent(pointerEvent("pointerdown", 7));
  assert.equal(harness.shots, 1);
  harness.shootButton.dispatchEvent(pointerEvent("pointerup", 7));

  const noOpHarness = createHarness(() => {});
  assert.doesNotThrow(() => {
    noOpHarness.shootButton.dispatchEvent(pointerEvent("pointerdown", 8));
  });

  harness.controller.dispose();
  noOpHarness.controller.dispose();
});

test("blur resets movement and every pressed appearance", () => {
  const harness = createHarness();
  harness.joystick.dispatchEvent(pointerEvent("pointerdown", 1, 50, 0));
  harness.shootButton.dispatchEvent(pointerEvent("pointerdown", 2));

  window.dispatchEvent(new Event("blur"));

  assert.deepEqual(harness.controller.getMovement(), { x: 0, y: 0 });
  assert.equal(harness.joystick.classList.contains("is-pressed"), false);
  assert.equal(harness.shootButton.classList.contains("is-pressed"), false);
  harness.controller.dispose();
});
