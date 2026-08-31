export function createCoordinatesUi(documentRef = globalThis.document) {
  const container = documentRef.querySelector("#coordinates-ui");
  const pixelOutput = documentRef.querySelector("#coordinates-ui-pixel");
  const gridOutput = documentRef.querySelector("#coordinates-ui-grid");

  return {
    setVisible(visible) {
      container.hidden = !visible;
    },
    update(pixelPosition, gridPosition) {
      pixelOutput.value = `X ${Math.round(pixelPosition.x)} · Y ${Math.round(pixelPosition.y)}`;
      gridOutput.value = `C ${gridPosition.x} · R ${gridPosition.y}`;
    },
  };
}
