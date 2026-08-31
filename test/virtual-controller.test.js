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
const { createVirtualController } = await import("../plugins/virtual-controller-babylon-lite/index.js");

function createHarness(onAttack, onMovementChange) {
  const joystick = new FakeControl();
  const puck = new FakeControl({ left: 0, top: 0, width: 40, height: 40 });
  const itemButton = new FakeControl();
  const attackButton = new FakeControl();
  let items = 0;
  let attacks = 0;
  const controller = createVirtualController({
    joystick,
    puck,
    itemButton,
    attackButton,
    onItem: () => {
      items += 1;
    },
    onAttack: onAttack ?? (() => {
      attacks += 1;
    }),
    onMovementChange,
  });

  return {
    controller,
    get items() {
      return items;
    },
    joystick,
    itemButton,
    puck,
    attackButton,
    get attacks() {
      return attacks;
    },
  };
}

test("movement capture and action pointers remain independent", () => {
  const harness = createHarness();

  harness.joystick.dispatchEvent(pointerEvent("pointerdown", 1, 100, 50));
  harness.itemButton.dispatchEvent(pointerEvent("pointerdown", 2));

  assert.deepEqual(harness.controller.getMovement(), { x: 1, y: 0 });
  assert.equal(harness.items, 1);
  assert.equal(harness.joystick.classList.contains("is-pressed"), true);
  assert.equal(harness.itemButton.classList.contains("is-pressed"), true);

  harness.itemButton.dispatchEvent(pointerEvent("pointercancel", 2));
  assert.deepEqual(harness.controller.getMovement(), { x: 1, y: 0 });
  assert.equal(harness.itemButton.classList.contains("is-pressed"), false);

  harness.joystick.dispatchEvent(pointerEvent("pointerup", 1));
  assert.deepEqual(harness.controller.getMovement(), { x: 0, y: 0 });
  harness.controller.dispose();
});

test("movement changes report analog direction without reporting release as an activation", () => {
  const changes = [];
  const harness = createHarness(undefined, (movement) => changes.push(movement));
  harness.joystick.dispatchEvent(pointerEvent("pointerdown", 1, 100, 50));
  harness.joystick.dispatchEvent(pointerEvent("pointermove", 1, 50, 0));
  harness.joystick.dispatchEvent(pointerEvent("pointerup", 1));

  assert.deepEqual(changes, [{ x: 1, y: 0 }, { x: 0, y: 1 }]);
  harness.controller.dispose();
});

test("Attack fires once per pointer press and safely supports a no-op", () => {
  const harness = createHarness();

  harness.attackButton.dispatchEvent(pointerEvent("pointerdown", 7));
  harness.attackButton.dispatchEvent(pointerEvent("pointerdown", 7));
  assert.equal(harness.attacks, 1);
  harness.attackButton.dispatchEvent(pointerEvent("pointerup", 7));

  const noOpHarness = createHarness(() => {});
  assert.doesNotThrow(() => {
    noOpHarness.attackButton.dispatchEvent(pointerEvent("pointerdown", 8));
  });

  harness.controller.dispose();
  noOpHarness.controller.dispose();
});

test("blur resets movement and every pressed appearance", () => {
  const harness = createHarness();
  harness.joystick.dispatchEvent(pointerEvent("pointerdown", 1, 50, 0));
  harness.attackButton.dispatchEvent(pointerEvent("pointerdown", 2));

  window.dispatchEvent(new Event("blur"));

  assert.deepEqual(harness.controller.getMovement(), { x: 0, y: 0 });
  assert.equal(harness.joystick.classList.contains("is-pressed"), false);
  assert.equal(harness.attackButton.classList.contains("is-pressed"), false);
  harness.controller.dispose();
});
