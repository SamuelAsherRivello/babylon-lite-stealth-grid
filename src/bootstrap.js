import { installSfx } from "./audio/sfx.js";

installSfx();
import { loadWithPreloader } from "./ui/startup-preloader.js";

await loadWithPreloader({
  load: () => import("./main.js"),
  overlay: document.querySelector("#startup-preloader"),
  message: document.querySelector("#startup-message"),
  spinner: document.querySelector("#startup-spinner"),
  retry: document.querySelector("#startup-retry"),
  game: document.querySelector("main"),
  reload: () => location.reload(),
});
