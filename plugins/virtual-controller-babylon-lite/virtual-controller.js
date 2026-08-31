export function calculateJoystickInput(
  pointer,
  center,
  radius,
  deadZone = 0.15,
) {
  if (radius <= 0) {
    return { x: 0, y: 0 };
  }

  const displacement = {
    x: pointer.x - center.x,
    y: center.y - pointer.y,
  };
  const rawLength = Math.hypot(displacement.x, displacement.y) / radius;
  const safeDeadZone = Math.min(Math.max(deadZone, 0), 0.99);

  if (rawLength <= safeDeadZone) {
    return { x: 0, y: 0 };
  }

  const length = Math.hypot(displacement.x, displacement.y);
  const intensity = Math.min(
    (rawLength - safeDeadZone) / (1 - safeDeadZone),
    1,
  );

  return {
    x: displacement.x / length * intensity,
    y: displacement.y / length * intensity,
  };
}

function getPointerId(event) {
  return Number.isFinite(event.pointerId) ? event.pointerId : undefined;
}

export function createVirtualController({
  joystick,
  puck,
  itemButton,
  attackButton,
  onItem = () => {},
  onAttack = () => {},
  onMovementChange = () => {},
}) {
  const removers = [];
  const actionPointers = new Map([
    [itemButton, new Set()],
    [attackButton, new Set()],
  ]);
  let activeMovementPointer;
  let movement = { x: 0, y: 0 };

  function listen(target, type, handler, options) {
    target.addEventListener(type, handler, options);
    removers.push(() => target.removeEventListener(type, handler, options));
  }

  function setPuckPosition(nextMovement) {
    const joystickRect = joystick.getBoundingClientRect();
    const puckRect = puck.getBoundingClientRect();
    const travel = Math.max(0, (Math.min(joystickRect.width, joystickRect.height)
      - Math.min(puckRect.width, puckRect.height)) / 2);
    puck.style.transform = `translate(calc(-50% + ${nextMovement.x * travel}px), calc(-50% + ${-nextMovement.y * travel}px))`;
  }

  function updateMovement(event) {
    const rect = joystick.getBoundingClientRect();
    const center = {
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2,
    };
    movement = calculateJoystickInput(
      { x: event.clientX, y: event.clientY },
      center,
      Math.min(rect.width, rect.height) / 2,
    );
    onMovementChange({ ...movement });
    setPuckPosition(movement);
  }

  function resetMovement(pointerId) {
    if (pointerId !== undefined && pointerId !== activeMovementPointer) {
      return;
    }

    activeMovementPointer = undefined;
    movement = { x: 0, y: 0 };
    joystick.classList.remove("is-pressed");
    puck.style.transform = "translate(-50%, -50%)";
  }

  function handleMovementDown(event) {
    if (activeMovementPointer !== undefined) {
      return;
    }

    event.preventDefault();
    activeMovementPointer = getPointerId(event);
    if (activeMovementPointer !== undefined) {
      joystick.setPointerCapture(activeMovementPointer);
    }
    joystick.classList.add("is-pressed");
    updateMovement(event);
  }

  function handleMovementMove(event) {
    if (getPointerId(event) !== activeMovementPointer) {
      return;
    }

    event.preventDefault();
    updateMovement(event);
  }

  function handleMovementEnd(event) {
    resetMovement(getPointerId(event));
  }

  listen(joystick, "pointerdown", handleMovementDown);
  listen(joystick, "pointermove", handleMovementMove);
  listen(joystick, "pointerup", handleMovementEnd);
  listen(joystick, "pointercancel", handleMovementEnd);
  listen(joystick, "lostpointercapture", handleMovementEnd);

  function registerAction(button, callback) {
    const pressedPointers = actionPointers.get(button);

    function resetPointer(event) {
      pressedPointers.delete(getPointerId(event));
      button.classList.toggle("is-pressed", pressedPointers.size > 0);
    }

    listen(button, "pointerdown", (event) => {
      event.preventDefault();
      const pointerId = getPointerId(event);
      if (pressedPointers.has(pointerId)) {
        return;
      }

      pressedPointers.add(pointerId);
      if (pointerId !== undefined) {
        button.setPointerCapture(pointerId);
      }
      button.classList.add("is-pressed");
      callback();
    });
    listen(button, "pointerup", resetPointer);
    listen(button, "pointercancel", resetPointer);
    listen(button, "lostpointercapture", resetPointer);
    listen(button, "click", (event) => {
      if (event.detail === 0) {
        callback();
      }
    });
  }

  registerAction(itemButton, onItem);
  registerAction(attackButton, onAttack);

  function reset() {
    resetMovement();
    for (const [button, pointers] of actionPointers) {
      pointers.clear();
      button.classList.remove("is-pressed");
    }
  }

  listen(window, "blur", reset);

  return {
    dispose() {
      reset();
      while (removers.length > 0) {
        removers.pop()();
      }
    },
    getMovement() {
      return { ...movement };
    },
    reset,
  };
}
