export function normalizeVolume(value) {
  const numericValue = Number(value);
  if (!Number.isFinite(numericValue)) {
    return 0;
  }
  return Math.min(100, Math.max(0, numericValue)) / 100;
}

export function applyCategoryVolume(baseVolume = 1, categoryVolume = 100) {
  const normalizedBase = Number.isFinite(Number(baseVolume))
    ? Math.min(1, Math.max(0, Number(baseVolume)))
    : 1;
  return normalizedBase * normalizeVolume(categoryVolume);
}
