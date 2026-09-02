export const GAME_VIEWPORT = Object.freeze({
  referenceResolution: Object.freeze({ width: 576, height: 1024 }),
  referenceGridSize: Object.freeze({ width: 64, height: 64 }),
  targetAspectRatio: 9 / 16,
  fitMode: "contain",
  gameFrameSelector: ".game-frame",
  renderCanvasSelector: "#renderCanvas",
  debugCanvasSelector: "#debugCanvas",
  domLayerSelector: "#uiLayer",
  qaDiagnostics: true,
});

function rectFrom(element) {
  const rect = element.getBoundingClientRect();
  return { left: rect.left, top: rect.top, width: rect.width, height: rect.height, right: rect.right, bottom: rect.bottom };
}

export function measureGameViewport(config = GAME_VIEWPORT, documentRef = globalThis.document) {
  const frame = documentRef.querySelector(config.gameFrameSelector);
  const renderCanvas = documentRef.querySelector(config.renderCanvasSelector);
  const debugCanvas = documentRef.querySelector(config.debugCanvasSelector);
  const domLayer = documentRef.querySelector(config.domLayerSelector);
  if (!frame || !renderCanvas || !debugCanvas || !domLayer) throw new Error("Game viewport elements are missing.");
  const frameRect = rectFrom(frame);
  const { width: logicalWidth, height: logicalHeight } = config.referenceResolution;
  const scale = Math.min(frameRect.width / logicalWidth, frameRect.height / logicalHeight);
  const fitted = {
    left: frameRect.left + (frameRect.width - logicalWidth * scale) / 2,
    top: frameRect.top + (frameRect.height - logicalHeight * scale) / 2,
    width: logicalWidth * scale,
    height: logicalHeight * scale,
  };
  return {
    config,
    frameRect,
    fittedRect: { ...fitted, right: fitted.left + fitted.width, bottom: fitted.top + fitted.height },
    renderRect: rectFrom(renderCanvas),
    debugRect: rectFrom(debugCanvas),
    domRect: rectFrom(domLayer),
    scale,
    devicePixelRatio: globalThis.devicePixelRatio || 1,
  };
}

export function logicalPointFromClient(point, viewport) {
  return {
    x: (point.x - viewport.fittedRect.left) / viewport.scale,
    y: (point.y - viewport.fittedRect.top) / viewport.scale,
  };
}

export function formatViewportDiagnostics(viewport) {
  const format = (rect) => `${rect.left.toFixed(2)},${rect.top.toFixed(2)} ${rect.width.toFixed(2)}x${rect.height.toFixed(2)}`;
  const { width, height } = viewport.config.referenceResolution;
  return `Viewport reference=${width}x${height} targetAspect=${viewport.config.targetAspectRatio} scale=${viewport.scale.toFixed(4)} dpr=${viewport.devicePixelRatio}; frame=${format(viewport.frameRect)} fitted=${format(viewport.fittedRect)} render=${format(viewport.renderRect)} debug=${format(viewport.debugRect)} dom=${format(viewport.domRect)}`;
}

export function renderViewportQaMarkers(viewport, visible = false, documentRef = globalThis.document) {
  let host = documentRef.querySelector("#viewportQaMarkers");
  if (!host) {
    host = documentRef.createElement("div");
    host.id = "viewportQaMarkers";
    host.setAttribute("aria-hidden", "true");
    documentRef.body.append(host);
  }
  host.replaceChildren();
  host.hidden = !visible;
  if (!visible) return;
  const layers = [
    ["frame", viewport.frameRect, "#facc15"],
    ["tilemap", viewport.fittedRect, "#22d3ee"],
    ["debug", viewport.debugRect, "#fb7185"],
    ["dom", viewport.domRect, "#c084fc"],
  ];
  for (const [name, rect, color] of layers) {
    for (const [x, y] of [[rect.left, rect.top], [rect.right, rect.top], [rect.left, rect.bottom], [rect.right, rect.bottom]]) {
      const marker = documentRef.createElement("span");
      marker.className = "viewport-qa-marker";
      marker.dataset.layer = name;
      marker.style.left = `${x}px`;
      marker.style.top = `${y}px`;
      marker.style.background = color;
      host.append(marker);
    }
  }
}
