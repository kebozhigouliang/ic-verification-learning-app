const UPDATE_PROMPT_ID = "pwa-update-prompt";

function showUpdatePrompt(worker: ServiceWorker, requestReload: () => void): void {
  if (document.getElementById(UPDATE_PROMPT_ID)) return;

  const prompt = document.createElement("aside");
  prompt.id = UPDATE_PROMPT_ID;
  prompt.className = "pwa-update-prompt";
  prompt.setAttribute("aria-live", "polite");

  const message = document.createElement("span");
  message.textContent = "New version available";

  const reloadButton = document.createElement("button");
  reloadButton.type = "button";
  reloadButton.textContent = "RELOAD";
  reloadButton.addEventListener("click", () => {
    reloadButton.disabled = true;
    reloadButton.textContent = "UPDATING...";
    requestReload();
    worker.postMessage({ type: "SKIP_WAITING" });
  });

  prompt.append(message, reloadButton);
  document.body.append(prompt);
}

export function registerServiceWorker(): void {
  if (!import.meta.env.PROD || !("serviceWorker" in navigator)) return;

  let reloadRequested = false;
  navigator.serviceWorker.addEventListener("controllerchange", () => {
    if (reloadRequested) window.location.reload();
  });

  window.addEventListener("load", () => {
    void navigator.serviceWorker.register("/service-worker.js", {
      scope: "/",
      type: "module",
      updateViaCache: "none",
    }).then((registration) => {
      const requestReload = () => {
        reloadRequested = true;
      };

      if (registration.waiting && navigator.serviceWorker.controller) {
        showUpdatePrompt(registration.waiting, requestReload);
      }

      registration.addEventListener("updatefound", () => {
        const installingWorker = registration.installing;
        if (!installingWorker) return;

        installingWorker.addEventListener("statechange", () => {
          if (installingWorker.state === "installed" && navigator.serviceWorker.controller) {
            showUpdatePrompt(installingWorker, requestReload);
          }
        });
      });
    }).catch(() => {
      // PWA support must not prevent the local-first app from opening.
    });
  });
}
