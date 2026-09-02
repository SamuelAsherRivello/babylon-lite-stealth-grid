let windowSequence = 0;

export class GameWindow {
  constructor({
    host,
    title,
    content,
    onClose,
    opener = null,
    closeLabel = "Close window",
    screenLayer = null,
    documentRef = globalThis.document,
  }) {
    this.onClose = onClose;
    this.opener = opener;
    this.backdrop = documentRef.createElement("div");
    this.backdrop.className = "game-window-backdrop menu-backdrop";
    this.dimmer = screenLayer ? documentRef.createElement("div") : null;
    if (this.dimmer) {
      this.dimmer.className = "game-window-dimmer";
      this.dimmer.addEventListener("click", this.handleDimmer = () => this.close());
      screenLayer.append(this.dimmer);
    }

    this.panel = documentRef.createElement("section");
    this.panel.className = "game-window menu-panel";
    this.panel.setAttribute("role", "dialog");
    this.panel.setAttribute("aria-modal", "true");

    const titleId = `game-window-title-${windowSequence += 1}`;
    const heading = documentRef.createElement("h2");
    heading.id = titleId;
    heading.className = "game-window-title menu-title-text";
    heading.textContent = title;
    this.panel.setAttribute("aria-labelledby", titleId);

    this.closeButton = documentRef.createElement("button");
    this.closeButton.className = "game-window-close";
    this.closeButton.type = "button";
    this.closeButton.setAttribute("aria-label", closeLabel);
    this.closeButton.textContent = "";

    const body = documentRef.createElement("div");
    body.className = "game-window-body";
    body.append(content);
    this.panel.append(heading, this.closeButton, body);
    this.backdrop.append(this.panel);

    this.handleBackdrop = (event) => {
      if (event.target === this.backdrop) this.close();
    };
    this.handleClose = () => this.close();
    this.backdrop.addEventListener("click", this.handleBackdrop);
    this.closeButton.addEventListener("click", this.handleClose);
    host.append(this.backdrop);
    this.closeButton.focus();
  }

  close() {
    if (!this.backdrop.isConnected && !this.backdrop.parentNode) {
      return;
    }
    this.backdrop.removeEventListener("click", this.handleBackdrop);
    this.closeButton.removeEventListener("click", this.handleClose);
    this.dimmer?.removeEventListener("click", this.handleDimmer);
    this.dimmer?.remove();
    this.backdrop.remove();
    this.onClose?.();
    this.opener?.focus?.();
  }

  setVisible(visible) {
    this.backdrop.hidden = !visible;
    if (this.dimmer) this.dimmer.hidden = !visible;
  }
}
