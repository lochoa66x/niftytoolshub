(function () {
  const pages = {
    "signal-watch.html": { type: "map", label: "Early Warning Radar" },
    "outage-radar.html": { type: "map", label: "Outage Radar" },
    "cyber-threat.html": { type: "map", label: "Cyber Threat Radar" },
    "food-watch.html": { type: "chart", label: "Food Watch" },
    "crypto-pulse.html": { type: "market", label: "Crypto Pulse" },
    "market-volume-pulse.html": { type: "market", label: "Market Volume Pulse" },
    "positioning-radar.html": { type: "market", label: "Market Positioning Radar" }
  };

  const path = (location.pathname.split("/").pop() || "index.html").toLowerCase();
  const config = pages[path];
  if (!config) return;

  const slug = path.replace(/\.html$/, "");
  const ready = (fn) => {
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", fn, { once: true });
    else fn();
  };

  ready(() => {
    document.body.classList.add("nt-display-system", "nt-display-" + slug);
    document.body.classList.add(config.type === "market" ? "nt-display-market" : "nt-display-has-map");
    markDisplayElements(config);
    installStageLoading(config);
    installKeyboardLabels(config);
  });

  function markDisplayElements(config) {
    document.querySelectorAll(".screen, .radar-screen").forEach((el, index) => {
      el.dataset.ntDisplayShell = config.type;
      if (!el.getAttribute("aria-label")) el.setAttribute("aria-label", config.label + " display " + (index + 1));
    });
    document.querySelectorAll(".map-frame, .canvas-frame, .canvas-wrap, .pulse-layout").forEach((el) => {
      el.dataset.ntDisplayStage = "true";
    });
    document.querySelectorAll("canvas").forEach((canvas) => {
      if (!canvas.getAttribute("aria-label")) canvas.setAttribute("aria-label", config.label + " visual display");
      if (!canvas.getAttribute("role")) canvas.setAttribute("role", "img");
    });
    document.querySelectorAll(".map-tools, .network-tabs, .network-toggle-bar").forEach((el) => {
      if (!el.getAttribute("aria-label")) el.setAttribute("aria-label", "Display filters");
    });
  }

  function installStageLoading(config) {
    const stage = document.querySelector(".map-frame, .canvas-frame, .canvas-wrap, .pulse-layout");
    if (!stage || stage.querySelector(".nt-display-sync")) return;
    const sync = document.createElement("div");
    sync.className = "nt-display-sync";
    sync.setAttribute("role", "status");
    sync.setAttribute("aria-live", "polite");
    sync.textContent = "syncing display";
    stage.appendChild(sync);

    const done = () => {
      sync.classList.add("is-done");
      setTimeout(() => sync.remove(), 260);
    };

    const hasMeaningfulRead = () => {
      const candidates = Array.from(document.querySelectorAll(
        ".readout b, .score-row b, #readText, #sourceState, #updatedAt, #crowdState, #combinedState"
      ));
      return candidates.some((el) => {
        const text = (el.textContent || "").trim().toLowerCase();
        if (!text || text === "--") return false;
        if (text === "0" || text === "0/13" || text === "0/100") return false;
        return !/booting|sync pending|waiting|loading|data probes booting/.test(text);
      });
    };

    let checks = 0;
    const timer = setInterval(() => {
      checks += 1;
      if (hasMeaningfulRead() || checks > 48) {
        clearInterval(timer);
        done();
      } else if (checks > 16) {
        sync.textContent = "waiting for public feeds";
      }
    }, 250);
  }

  function installKeyboardLabels(config) {
    const summary = document.createElement("div");
    summary.className = "nt-display-sr";
    summary.textContent = config.label + " uses a standardized NiftyTools display shell with status, controls, legend and readouts.";
    const main = document.querySelector("main") || document.body;
    main.insertBefore(summary, main.firstChild);
  }
})();
