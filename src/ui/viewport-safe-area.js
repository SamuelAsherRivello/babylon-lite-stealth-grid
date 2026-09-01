export function readVisibleViewport(windowRef = window) {
  const viewport = windowRef.visualViewport;
  if (viewport) {
    return {
      left: viewport.offsetLeft,
      top: viewport.offsetTop,
      width: viewport.width,
      height: viewport.height,
    };
  }
  return {
    left: 0,
    top: 0,
    width: windowRef.innerWidth,
    height: windowRef.innerHeight,
  };
}

export function applyVisibleViewport(element, rect) {
  element.style.left = `${rect.left}px`;
  element.style.top = `${rect.top}px`;
  element.style.width = `${rect.width}px`;
  element.style.height = `${rect.height}px`;
  element.classList.add("is-viewport-ready");
}

export function intersectViewportWithGameFrame(viewport, frameRect) {
  const left = Math.max(viewport.left, frameRect.left);
  const top = Math.max(viewport.top, frameRect.top);
  const right = Math.min(viewport.left + viewport.width, frameRect.right);
  const bottom = Math.min(viewport.top + viewport.height, frameRect.bottom);
  return {
    left,
    top,
    width: Math.max(0, right - left),
    height: Math.max(0, bottom - top),
  };
}

export function createViewportSafeArea({
  element,
  frameElement,
  windowRef = window,
  documentRef = document,
  ResizeObserverRef = globalThis.ResizeObserver,
}) {
  const update = () => {
    const viewport = readVisibleViewport(windowRef);
    const frameRect = frameElement.getBoundingClientRect();
    const visibleRect = intersectViewportWithGameFrame(viewport, frameRect);

    applyVisibleViewport(element, visibleRect);
  };
  const visualViewport = windowRef.visualViewport;
  const subscriptions = [
    [windowRef, "resize"],
    [windowRef, "orientationchange"],
    [documentRef, "fullscreenchange"],
    ...(visualViewport ? [[visualViewport, "resize"], [visualViewport, "scroll"]] : []),
  ];
  for (const [target, event] of subscriptions) target.addEventListener(event, update);

  const resizeObserver = ResizeObserverRef
    ? new ResizeObserverRef(update)
    : null;
  resizeObserver?.observe(documentRef.documentElement);
  resizeObserver?.observe(frameElement);
  update();

  return {
    update,
    dispose() {
      for (const [target, event] of subscriptions) target.removeEventListener(event, update);
      resizeObserver?.disconnect();
    },
  };
}
