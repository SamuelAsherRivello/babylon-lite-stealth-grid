export function createLevelCompleteUi({ host, onContinue, outcome = "win", documentRef = globalThis.document }) {
  const backdrop = documentRef.createElement("div");
  backdrop.className = "level-complete-backdrop menu-backdrop";
  backdrop.hidden = true;
  const panel = documentRef.createElement("section");
  panel.className = "level-complete-panel menu-panel";
  panel.setAttribute("role", "dialog");
  panel.setAttribute("aria-modal", "true");
  const title = documentRef.createElement("h2"); title.className = "menu-title-text"; title.textContent = outcome === "loss" ? "You Lost" : "Level Complete";
  const body = documentRef.createElement("p"); body.className = "menu-subtitle-text"; body.textContent = outcome === "loss" ? "Try again!" : "You did great!";
  const button = documentRef.createElement("button");
  button.type = "button"; button.className = "level-complete-continue menu-button-text"; button.textContent = "Continue";
  button.addEventListener("click", onContinue);
  const closeOnClick = (event) => { if (outcome !== "loss" && event.target === backdrop) backdrop.remove(); };
  backdrop.addEventListener("click", closeOnClick);
  panel.append(title, body, button); backdrop.append(panel); host.append(backdrop);
  return { backdrop, panel, button, show() { backdrop.hidden = false; button.focus(); }, dispose() { button.removeEventListener("click", onContinue); backdrop.removeEventListener("click", closeOnClick); backdrop.remove(); } };
}
