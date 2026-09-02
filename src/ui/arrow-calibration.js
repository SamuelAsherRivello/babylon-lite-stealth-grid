// Temporary screenshot tool. All coordinates are world pixels (Y increases up).
export function createArrowCalibration({ host, width, height, archer, arrow, facing, onMove }) {
  let position = { ...arrow };
  let drag = null;
  const handle = document.createElement("div");
  handle.setAttribute("aria-label", "Drag arrow attachment");
  handle.style.cssText = "position:absolute;width:64px;height:64px;border:1px dashed #ffd76a;border-radius:8px;pointer-events:auto;touch-action:none;cursor:grab;box-sizing:border-box;z-index:1000";
  const label = document.createElement("pre");
  label.style.cssText = "position:absolute;margin:0;padding:8px;color:#fff;background:#101820ed;border:1px solid #ffd76a;border-radius:5px;font:12px/1.5 monospace;pointer-events:none;z-index:1001";
  host.append(handle, label);
  function render() {
    handle.style.left = `${position.x - 32}px`;
    handle.style.top = `${height - position.y - 32}px`;
    label.style.left = `${Math.max(0, Math.min(width - 280, position.x + 42))}px`;
    label.style.top = `${Math.max(0, Math.min(height - 112, height - position.y + 40))}px`;
    const f = value => value.toFixed(2);
    label.textContent = `ARROW CALIBRATION • ${facing} • frame 3\nArcher X ${f(archer.x)}  Y ${f(archer.y)}\nArrow  X ${f(position.x)}  Y ${f(position.y)}\nOffset X ${f(position.x - archer.x)}  Y ${f(position.y - archer.y)}\nWorld pixels • Y ↑ • drag arrow`;
  }
  handle.onpointerdown = event => {
    event.preventDefault(); event.stopPropagation();
    handle.setPointerCapture(event.pointerId);
    drag = { clientX: event.clientX, clientY: event.clientY, ...position };
    handle.style.cursor = "grabbing";
  };
  handle.onpointermove = event => {
    if (!drag) return;
    const rect = host.getBoundingClientRect();
    position = {
      x: Math.max(0, Math.min(width, drag.x + (event.clientX - drag.clientX) * width / rect.width)),
      y: Math.max(0, Math.min(height, drag.y - (event.clientY - drag.clientY) * height / rect.height)),
    };
    onMove(position); render();
  };
  handle.onpointerup = handle.onpointercancel = event => {
    event.stopPropagation(); drag = null; handle.style.cursor = "grab";
    if (handle.hasPointerCapture(event.pointerId)) handle.releasePointerCapture(event.pointerId);
  };
  render();
  return { dispose() { handle.remove(); label.remove(); } };
}
