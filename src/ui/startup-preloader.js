export async function loadWithPreloader({ load, overlay, message, spinner, retry, game, reload }) {
  game.inert = true;
  retry.addEventListener("click", reload, { once: true });
  try {
    const module = await load();
    // Babylon Lite startEngine resolves after rendering its first frame.
    await module.gameReady;
    overlay.hidden = true;
    overlay.setAttribute("aria-busy", "false");
    game.inert = false;
    game.querySelector?.(".start-game-prompt-start")?.focus();
    return true;
  } catch (error) {
    overlay.setAttribute("aria-busy", "false");
    overlay.setAttribute("role", "alert");
    spinner.hidden = true;
    message.textContent = `The game could not start. Check your connection and WebGPU support, then retry. ${error instanceof Error ? error.message : String(error)}`;
    retry.hidden = false;
    return false;
  }
}
