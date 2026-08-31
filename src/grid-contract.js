export const GRID = Object.freeze({
  tileSizePx: 64,
  columns: 9,
  rows: 16,
  widthPx: 576,
  heightPx: 1024,
});

if (
  GRID.columns * GRID.tileSizePx !== GRID.widthPx
  || GRID.rows * GRID.tileSizePx !== GRID.heightPx
) {
  throw new Error("The logical grid must cover the complete game screen.");
}
