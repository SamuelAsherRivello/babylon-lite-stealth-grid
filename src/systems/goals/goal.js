import { GridSpot } from "../environment/grid-spot.js";
import { GRID } from "../environment/grid-contract.js";

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
  const gridSpot = new GridSpot(position, GRID);
  const colliderSize = GRID.tileSizePx * 0.5;
  return {
    position,
    combatCollider: { x: position.x - colliderSize / 2, y: position.y - colliderSize / 2, width: colliderSize, height: colliderSize },
    getGridSpot() { return gridSpot; },
    dispose() { marker.remove(); },
  };
}
