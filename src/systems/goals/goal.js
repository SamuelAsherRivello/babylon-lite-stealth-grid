export function createGoal({ host, position, screenWidth, screenHeight, artworkUrl = "", documentRef = globalThis.document }) {
  const marker = documentRef.createElement("div");
  marker.className = "runtime-goal-marker";
  marker.setAttribute("aria-label", "Goal");
  if (artworkUrl) {
    const artwork = documentRef.createElement("img");
    artwork.src = artworkUrl;
    artwork.alt = "";
    marker.append(artwork);
  }
  marker.style.left = `${(position.x / screenWidth) * 100}%`;
  marker.style.top = `${(1 - position.y / screenHeight) * 100}%`;
  host.append(marker);
  return {
    position,
    combatCollider: { x: position.x - 32, y: position.y - 32, width: 64, height: 64 },
    dispose() { marker.remove(); },
  };
}
