export function createLevelCompleteUi({ host, onContinue, documentRef = globalThis.document }) {
  const backdrop = documentRef.createElement("div");
  backdrop.className = "level-complete-backdrop";
  backdrop.hidden = true;
  const panel = documentRef.createElement("section");
  panel.className = "level-complete-panel";
  panel.setAttribute("role", "dialog");
  panel.setAttribute("aria-modal", "true");
  const title = documentRef.createElement("h2"); title.className = "menu-title-text"; title.textContent = "Level Complete";
  const body = documentRef.createElement("p"); body.className = "menu-subtitle-text"; body.textContent = "You did great!";
  const button = documentRef.createElement("button");
  button.type = "button"; button.className = "level-complete-continue menu-button-text"; button.textContent = "Continue";
  button.addEventListener("click", onContinue);
  panel.append(title, body, button); backdrop.append(panel); host.append(backdrop);
  return { show() { backdrop.hidden = false; button.focus(); }, dispose() { button.removeEventListener("click", onContinue); backdrop.remove(); } };
}
