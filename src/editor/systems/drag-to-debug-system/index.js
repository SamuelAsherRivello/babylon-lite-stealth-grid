// Opt-in editor tool. World coordinates are pixels with Y increasing upwards.
// The caller owns pause/resume and applies the position to the rendered target.
export function createDragToDebugSystem({
  host, canvas, width, height, initialPosition, referencePosition = { x: 0, y: 0 },
  targetLabel = "Target", referenceLabel = "Reference", title = "DRAG TO DEBUG",
  context = "", handleSize = 64, onMove,
  documentRef = globalThis.document, ResizeObserverClass = globalThis.ResizeObserver,
}) {
  let position = { ...initialPosition };
  let drag = null;
  const handle = documentRef.createElement("div");
  handle.setAttribute("aria-label", `Drag ${targetLabel}`);
  handle.style.cssText = "position:absolute;width:64px;height:64px;border:1px dashed #ffd76a;border-radius:8px;pointer-events:auto;touch-action:none;cursor:grab;box-sizing:border-box;z-index:1000";
  const label = documentRef.createElement("pre");
  label.style.cssText = "position:absolute;margin:0;padding:8px;color:#fff;background:#101820ed;border:1px solid #ffd76a;border-radius:5px;font:12px/1.5 monospace;pointer-events:none;z-index:1001";
  host.append(handle, label);
  function render() {
    const rect = canvas.getBoundingClientRect();
    const hostRect = host.getBoundingClientRect();
    const scaleX = rect.width / width;
    const scaleY = rect.height / height;
    const x = rect.left - hostRect.left + position.x * scaleX;
    const y = rect.top - hostRect.top + (height - position.y) * scaleY;
    const halfSize = handleSize / 2;
    handle.style.width = `${handleSize * scaleX}px`;
    handle.style.height = `${handleSize * scaleY}px`;
    handle.style.left = `${x - halfSize * scaleX}px`;
    handle.style.top = `${y - halfSize * scaleY}px`;
    const f = value => value.toFixed(2);
    label.textContent = `${title}${context ? ` • ${context}` : ""}\n${referenceLabel} X ${f(referencePosition.x)}  Y ${f(referencePosition.y)}\n${targetLabel} X ${f(position.x)}  Y ${f(position.y)}\nOffset X ${f(position.x - referencePosition.x)}  Y ${f(position.y - referencePosition.y)}\nWorld pixels • Y ↑ • drag target`;
    const right = x + halfSize * scaleX + 8;
    const left = x - halfSize * scaleX - 8 - label.offsetWidth;
    const fitsRight = right + label.offsetWidth <= hostRect.width;
    const fitsLeft = left >= 0;
    const labelX = fitsRight ? right : fitsLeft ? left : x - label.offsetWidth / 2;
    const above = y - halfSize * scaleY - 8 - label.offsetHeight;
    const labelY = fitsRight || fitsLeft ? y - label.offsetHeight / 2 : above >= 0 ? above : y + halfSize * scaleY + 8;
    label.style.left = `${Math.max(0, Math.min(hostRect.width - label.offsetWidth, labelX))}px`;
    label.style.top = `${Math.max(0, Math.min(hostRect.height - label.offsetHeight, labelY))}px`;
  }
  handle.onpointerdown = event => {
    if (drag || event.button !== 0) return;
    event.preventDefault(); event.stopPropagation();
    handle.setPointerCapture(event.pointerId);
    drag = { pointerId: event.pointerId, clientX: event.clientX, clientY: event.clientY, ...position };
    handle.style.cursor = "grabbing";
  };
  handle.onpointermove = event => {
    if (!drag || event.pointerId !== drag.pointerId) return;
    const rect = canvas.getBoundingClientRect();
    position = {
      x: Math.max(0, Math.min(width, drag.x + (event.clientX - drag.clientX) * width / rect.width)),
      y: Math.max(0, Math.min(height, drag.y - (event.clientY - drag.clientY) * height / rect.height)),
    };
    onMove({ ...position }); render();
  };
  handle.onpointerup = handle.onpointercancel = event => {
    if (!drag || event.pointerId !== drag.pointerId) return;
    event.stopPropagation(); drag = null; handle.style.cursor = "grab";
    if (handle.hasPointerCapture(event.pointerId)) handle.releasePointerCapture(event.pointerId);
  };
  handle.onlostpointercapture = () => { drag = null; handle.style.cursor = "grab"; };
  render();
  const resize = new ResizeObserverClass(render);
  resize.observe(canvas);
  resize.observe(host);
  return {
    getPosition: () => ({ ...position }),
    refresh: render,
    dispose() {
      if (drag && handle.hasPointerCapture(drag.pointerId)) handle.releasePointerCapture(drag.pointerId);
      drag = null;
      resize.disconnect(); handle.remove(); label.remove();
    },
  };
}
