(function () {
  "use strict";

  const pages = {
    "signal-watch.html": { type: "map", role: "signal", label: "Early Warning Radar" },
    "aurora-watch.html": { type: "sky", role: "local", label: "Aurora Watch" },
    "outage-radar.html": { type: "map", role: "signal", label: "Outage Radar" },
    "cyber-threat.html": { type: "map", role: "signal", label: "Cyber Threat Radar" },
    "food-watch.html": { type: "chart", role: "prepper", label: "Food Watch" },
    "meme-watch.html": { type: "trend", role: "trend", label: "Meme Watch" },
    "crypto-pulse.html": { type: "market", role: "market", label: "Crypto Pulse" },
    "market-volume-pulse.html": { type: "market", role: "market", label: "Market Volume Pulse" },
    "positioning-radar.html": { type: "market", role: "market", label: "Market Positioning Radar" },
    "personal-risk.html": { type: "brief", role: "prepper", label: "Personal Risk Briefing" },
    "prepper-risk.html": { type: "brief", role: "prepper", label: "Prepper Risk Scanner" },
    "signal-suite.html": { type: "hub", role: "hub", label: "Signal Suite" }
  };

  const pathName = (location.pathname.split("/").pop() || "index.html").toLowerCase();
  const config = pages[pathName];
  if (!config) return;

  const slug = pathName.replace(/\.html$/, "");
  const ready = (fn) => {
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", fn, { once: true });
    else fn();
  };

  ready(() => {
    document.body.classList.add("nt-display-system", "nt-osint-layout", "nt-display-" + slug, "nt-display-type-" + config.type);
    document.body.classList.add(config.type === "market" ? "nt-display-market" : "nt-display-has-map");
    document.body.dataset.ntDisplayType = config.type;
    document.body.dataset.ntSignalRole = config.role || config.type;
    markDisplayElements(config);
    installStageLoading(config);
    installKeyboardLabels(config);
  });

  function markDisplayElements(config) {
    document.querySelectorAll(".hero").forEach((el) => {
      el.dataset.ntPublicHero = "true";
    });

    document.querySelectorAll(".toolbar, .controls, .options-drawer").forEach((el) => {
      el.dataset.ntPublicControls = "true";
    });

    document.querySelectorAll(".main-grid, .command-grid, .layout, .content").forEach((el) => {
      el.dataset.ntPublicLayout = "true";
      markColumns(el);
    });

    document.querySelectorAll(".side, .radar-side").forEach((el) => {
      el.dataset.ntPublicSide = "true";
    });

    document.querySelectorAll(".report-grid, .network-grid, .lower-grid, .impact-grid, .heat-grid").forEach((el) => {
      el.dataset.ntPublicSecondary = "true";
    });

    document.querySelectorAll(".screen, .radar-screen, .crypto-board-screen, .panel.board, .shell").forEach((el, index) => {
      el.dataset.ntDisplayShell = config.type;
      if (!el.getAttribute("aria-label")) el.setAttribute("aria-label", config.label + " display " + (index + 1));
    });

    document.querySelectorAll(".map-frame, .canvas-frame, .canvas-wrap, .pulse-layout, .sky-card, .map-card").forEach((el) => {
      el.dataset.ntDisplayStage = "true";
    });

    document.querySelectorAll("canvas").forEach((canvas) => {
      if (!canvas.getAttribute("aria-label")) canvas.setAttribute("aria-label", config.label + " visual display");
      if (!canvas.getAttribute("role")) canvas.setAttribute("role", "img");
    });

    document.querySelectorAll(".map-tools, .network-tabs, .network-toggle-bar").forEach((el) => {
      if (!el.getAttribute("aria-label")) el.setAttribute("aria-label", "Display filters");
    });

    markPanelTypes();
  }

  function markColumns(container) {
    Array.from(container.children).forEach((child) => {
      const text = clean(child.textContent).toLowerCase();
      const hasInputs = !!child.querySelector("input, select, textarea");
      const hasPrimaryRead = !!child.querySelector(".score-card, .score-panel, .score-grid, .screen, .radar-screen, .crypto-board-screen, .panel.board, #riskScore, #scoreNum, #emergeScore, #combinedScore, #crowdState");
      const looksLikeControls = hasInputs || /\b(scan setup|viewing location|location preset|place preset|data mode|market group|find market|briefing label)\b/.test(text);
      if (hasPrimaryRead) child.dataset.ntPrimaryColumn = "true";
      if (looksLikeControls && !hasPrimaryRead) child.dataset.ntControlColumn = "true";
    });
  }

  function markPanelTypes() {
    document.querySelectorAll(".panel, article, section, aside, details, .log").forEach((panel) => {
      const h = normalizedHeading(panel);
      if (isSourceHeading(h)) panel.classList.add("nt-public-source-health", "nt-public-source-panel");
      if (isDiagnosticHeading(h)) panel.classList.add("nt-public-diagnostics");
      if (isExplainerHeading(h)) panel.classList.add("nt-mobile-explainer", "nt-public-explainer-panel");
      if (/\b(event log|timeline|activity log|readable report|meme desk brief|viewing plan)\b/.test(h)) {
        panel.dataset.ntPublicLog = "true";
      }
    });
  }

  function installStageLoading(config) {
    const stage = document.querySelector(".map-frame, .canvas-frame, .canvas-wrap, .pulse-layout, .sky-card, .map-card");
    document.body.classList.add("nt-display-loading");

    let sync = null;
    if (stage && !stage.querySelector(".nt-display-sync")) {
      sync = document.createElement("div");
      sync.className = "nt-display-sync";
      sync.setAttribute("role", "status");
      sync.setAttribute("aria-live", "polite");
      sync.textContent = "loading public signals";
      stage.appendChild(sync);
    }

    const done = () => {
      document.body.classList.remove("nt-display-loading");
      if (!sync) return;
      sync.classList.add("is-done");
      setTimeout(() => sync.remove(), 260);
    };

    let checks = 0;
    const timer = setInterval(() => {
      checks += 1;
      if (hasMeaningfulRead() || checks > 56) {
        clearInterval(timer);
        done();
      } else if (sync && checks > 16) {
        sync.textContent = "waiting for public feeds";
      }
    }, 250);
  }

  function hasMeaningfulRead() {
    const candidates = Array.from(document.querySelectorAll(
      ".readout b, .score-row b, .score b, .mini b, .stat b, #readText, #sourceState, #updatedAt, #miniUpdated, #heroUpdated, #activityState, #combinedState, #crowdState, #riskState, #riskLabel, #verdict, #emergeLabel, #satLabel"
    ));
    return candidates.some((el) => {
      const text = clean(el.textContent).toLowerCase();
      if (!text || text === "--") return false;
      if (text === "0" || text === "0/13" || text === "0/100") return false;
      return !/booting|sync pending|waiting|loading|checking|not scanned|data probes booting/.test(text);
    });
  }

  function installKeyboardLabels(config) {
    if (document.querySelector(".nt-display-sr")) return;
    const summary = document.createElement("div");
    summary.className = "nt-display-sr";
    summary.textContent = config.label + " uses a standardized NiftyTools public signal shell with status, controls, visual display and readable metrics.";
    const main = document.querySelector("main") || document.body;
    main.insertBefore(summary, main.firstChild);
  }

  function normalizedHeading(node) {
    const heading = node.querySelector(":scope > h2, :scope > h3, :scope > .panel-head h2, :scope > .panel-head h3, :scope > summary, :scope .panel-head h2, :scope .panel-head h3");
    return clean(heading && heading.textContent).toLowerCase().replace(/^(\/\/|>|\+|-)\s*/, "").trim();
  }

  function isSourceHeading(text) {
    return /\b(source health|source quality|source status|data coverage|official links|official sources|watch coverage)\b/.test(text);
  }

  function isDiagnosticHeading(text) {
    return /\b(debug|raw feed|feed log|source log|signals log|runtime log)\b/.test(text);
  }

  function isExplainerHeading(text) {
    return /\b(what this is|how to read this board|how to read|related tools|readable report)\b/.test(text);
  }

  function clean(value) {
    return String(value || "").replace(/\s+/g, " ").trim();
  }
})();
