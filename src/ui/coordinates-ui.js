export function createCoordinatesUi(documentRef = globalThis.document) {
  const container = documentRef.querySelector("#coordinates-ui");
  const pixelOutput = documentRef.querySelector("#coordinates-ui-pixel");
  const gridOutput = documentRef.querySelector("#coordinates-ui-grid");

  return {
    setVisible(visible) {
      container.hidden = !visible;
    },
    update(pixelPosition, gridPosition) {
      pixelOutput.value = `Pos:  (${Math.round(pixelPosition.x)},${Math.round(pixelPosition.y)})`;
      gridOutput.value = `Grid: (${gridPosition.y},${gridPosition.x})`;
    },
  };
}
