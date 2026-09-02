function pad(value) {
  return String(Math.max(0, value)).padStart(2, "0");
}

export function formatGoldCounterText(collected, total) {
  return `Gold: ${pad(collected)}/${pad(total)}`;
}

export function createGoldCounterUi({ host, total = 0, documentRef = globalThis.document }) {
  const element = documentRef.createElement("p");
  element.className = "gold-counter";
  let collected = 0;
  const render = () => { element.textContent = formatGoldCounterText(collected, total); };
  render();
  host.append(element);
  return {
    element,
    increment() {
      collected += 1;
      render();
    },
    get collected() { return collected; },
  };
}
