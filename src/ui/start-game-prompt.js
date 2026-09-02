const START_PROMPT_BODY = "Use bushes to hide. Reach the flag to win. Collect gold for fun.";

export function shouldShowStartGamePrompt({ showStartPrompt = true } = {}) {
  return showStartPrompt !== false;
}

export function shouldSkipIntro({ isDevelopment = false, search = "" } = {}) {
  return isDevelopment && new URLSearchParams(search).get("skipIntro") === "true";
}

export function createStartGamePrompt({ host, onStart, documentRef = globalThis.document }) {
  const backdrop = documentRef.createElement("div");
  backdrop.className = "start-game-prompt-backdrop menu-backdrop";
  backdrop.setAttribute("data-start-game-prompt", "true");

  const panel = documentRef.createElement("section");
  panel.className = "start-game-prompt-panel menu-panel";
  panel.setAttribute("role", "dialog");
  panel.setAttribute("aria-modal", "true");

  const title = documentRef.createElement("h2");
  title.className = "game-window-title menu-title-text";
  title.textContent = "Stealth Grid";
  const titleId = "start-game-prompt-title";
  title.id = titleId;
  panel.setAttribute("aria-labelledby", titleId);

  const body = documentRef.createElement("p");
  body.className = "menu-subtitle-text start-game-prompt-body";
  body.textContent = START_PROMPT_BODY;

  const startButton = documentRef.createElement("button");
  startButton.type = "button";
  startButton.className = "start-game-prompt-start menu-button-text";
  startButton.textContent = "Start";
  const handleStart = () => {
    onStart?.();
    prompt.close();
  };
  startButton.addEventListener("click", handleStart);

  panel.append(title, body, startButton);
  backdrop.append(panel);
  const closeOnClick = (event) => {
    if (event.target === backdrop) prompt.close();
  };
  backdrop.addEventListener("click", closeOnClick);
  host.append(backdrop);
  startButton.focus();

  const prompt = {
    backdrop,
    panel,
    startButton,
    close() {
      startButton.removeEventListener("click", handleStart);
      backdrop.removeEventListener("click", closeOnClick);
      backdrop.remove();
    },
  };
  return prompt;
}

export { START_PROMPT_BODY };
