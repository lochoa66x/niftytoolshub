(function () {
  "use strict";

  if (window.__niftyQualityRails) return;
  window.__niftyQualityRails = true;

  const PAGE_CONFIG = {
    "/signal-suite.html": {
      label: "Signal hub",
      mode: "Mixed source dashboard",
      copy: "Use this page to choose the right radar. Source labels now read as Live, Delayed, Backup, Context or Local.",
      watch: "Signal cards"
    },
    "/personal-risk.html": {
      label: "Personal briefing",
      mode: "Live + context scan",
      copy: "Data can arrive in waves. The loading rail shows when the browser is still checking public feeds.",
      watch: "Risk modules"
    },
    "/command-queue.html": {
      label: "Action queue",
      mode: "Local workspace",
      copy: "Local-first actions, notes and checklists. No remote source required.",
      watch: "Queue cards"
    },
    "/signal-watch.html": {
      label: "Early warning",
      mode: "Public signal blend",
      copy: "Scores should not sit at zero while feeds load. The rail marks source sync, backup use and last refresh.",
      watch: "Radar cards"
    },
    "/aurora-watch.html": {
      label: "Aurora",
      mode: "Live space weather",
      copy: "NOAA and weather feeds may settle after location refresh. Treat backup labels as directional context.",
      watch: "Aurora panels"
    },
    "/outage-radar.html": {
      label: "Outage radar",
      mode: "Official + local checks",
      copy: "The map separates official provider incidents from local browser reachability checks.",
      watch: "Outage map"
    },
    "/cyber-threat.html": {
      label: "Cyber radar",
      mode: "Public threat signals",
      copy: "Public feeds can be blocked by browsers. Backup visualization stays clearly labeled as context.",
      watch: "Threat map"
    },
    "/food-watch.html": {
      label: "Food watch",
      mode: "Recall + pressure context",
      copy: "Recall feeds are strongest when live; commodity pressure rows are context, not official alerts.",
      watch: "Food signal rows"
    },
    "/meme-watch.html": {
      label: "Meme watch",
      mode: "Trend context",
      copy: "This is an early-smoke detector. Public attention proxies are labeled as context when full feeds are unavailable.",
      watch: "Trend cards"
    },
    "/crypto-pulse.html": {
      label: "Crypto pulse",
      mode: "Network stress read",
      copy: "The page now presents public probes as Live, Backup, Context or Unavailable instead of raw blocked-source noise.",
      watch: "Network panels"
    },
    "/market-volume-pulse.html": {
      label: "Volume pulse",
      mode: "Delayed market data",
      copy: "Volume leaders and market activity are delayed/context reads unless a real-time provider is connected.",
      watch: "Market rows"
    },
    "/positioning-radar.html": {
      label: "Positioning radar",
      mode: "Delayed crowding read",
      copy: "CFTC and FINRA data are delayed. Exchange-specific gaps are collapsed into readable source health.",
      watch: "Positioning rows"
    },
    "/prepper-command.html": {
      label: "Prepper command",
      mode: "Local readiness",
      copy: "Preparedness calculators are local and deterministic. Use the signal tools for external live context.",
      watch: "Readiness cards"
    },
    "/prepper-tools.html": {
      label: "Prepper toolkit",
      mode: "Local calculators",
      copy: "Tool output is calculated in the browser. No account or external data feed required.",
      watch: "Planner modules"
    },
    "/admin.html": {
      label: "Admin centre",
      mode: "Local + analytics shell",
      copy: "Admin values are a mix of browser event buffer, source health and future production analytics.",
      watch: "Dashboard panels"
    }
  };

  const SOURCE_LABELS = [
    { key: "live", label: "Live", help: "real feed", match: /\b(live|online|healthy|official|real feed working)\b/i },
    { key: "delayed", label: "Delayed", help: "real but delayed", match: /\b(delayed|weekly|finra|cftc|history|historical)\b/i },
    { key: "backup", label: "Backup", help: "fallback active", match: /\b(backup|fallback|covered)\b/i },
    { key: "context", label: "Context", help: "directional", match: /\b(context|proxy|estimate|public-interest|pageview|reference|baseline)\b/i },
    { key: "local", label: "Local", help: "browser check", match: /\b(local|browser|device)\b/i },
    { key: "demo", label: "Demo", help: "reference mode", match: /\b(sample|demo|mock)\b/i },
    { key: "unavailable", label: "Unavailable", help: "source failed", match: /\b(blocked|unavailable|failed|timeout|abort|unreachable|http 451|http 404|error)\b/i }
  ];

  let activeFetches = 0;
  let totalFetches = 0;
  let failedFetches = 0;
  let hideTimer = 0;
  let scanTimer = 0;

  function esc(value) {
    return String(value == null ? "" : value).replace(/[&<>"']/g, function (ch) {
      return ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" })[ch];
    });
  }

  function normalizePath(path) {
    if (!path || path === "/") return "/";
    return path.endsWith("/") ? path.slice(0, -1) : path;
  }

  function config() {
    return PAGE_CONFIG[normalizePath(window.location.pathname)];
  }

  function sourceTone(value) {
    const text = String(value || "");
    const found = SOURCE_LABELS.find((item) => item.match.test(text));
    return found || SOURCE_LABELS[3];
  }

  function shouldWatchFetch(input) {
    const url = typeof input === "string" ? input : input && input.url ? input.url : "";
    if (!url) return false;
    return /\/api\/|services\.swpc\.noaa\.gov|earthquake\.usgs\.gov|open-meteo|openfda|hn\.algolia|wikimedia|wikipedia|status|source-proxy/i.test(url);
  }

  function loaderNode() {
    let node = document.getElementById("ntQualityLoader");
    if (node) return node;
    node = document.createElement("div");
    node.id = "ntQualityLoader";
    node.className = "nt-quality-loader";
    node.setAttribute("role", "status");
    node.setAttribute("aria-live", "polite");
    node.innerHTML = [
      '<div class="nt-quality-loader-inner">',
      '<span class="nt-quality-spinner" aria-hidden="true"></span>',
      '<div><b>Syncing sources</b><span>Checking public feeds and local context</span></div>',
      '<div class="nt-quality-fetch-count">0</div>',
      '</div>'
    ].join("");
    document.body.appendChild(node);
    return node;
  }

  function updateLoader(title, detail, state) {
    if (!document.body) return;
    const node = loaderNode();
    clearTimeout(hideTimer);
    node.classList.remove("is-done", "is-warn");
    if (state === "done") node.classList.add("is-done");
    if (state === "warn") node.classList.add("is-warn");
    node.querySelector("b").textContent = title || "Syncing sources";
    node.querySelector("span:not(.nt-quality-spinner)").textContent = detail || "Checking public feeds and local context";
    node.querySelector(".nt-quality-fetch-count").textContent = String(Math.max(activeFetches, totalFetches));
    node.classList.add("is-visible");
    document.body.classList.toggle("nt-quality-busy", activeFetches > 0);
    if (activeFetches <= 0) {
      hideTimer = setTimeout(function () {
        node.classList.remove("is-visible", "is-done", "is-warn");
        document.body.classList.remove("nt-quality-busy");
      }, state === "warn" ? 1700 : 1100);
    }
  }

  function startFetch() {
    activeFetches += 1;
    totalFetches += 1;
    updateLoader("Syncing sources", "Checking public feeds and local context", "loading");
    updateRailStatus();
  }

  function finishFetch(ok) {
    activeFetches = Math.max(0, activeFetches - 1);
    if (!ok) failedFetches += 1;
    if (activeFetches === 0) {
      updateLoader(ok || failedFetches === 0 ? "Sources updated" : "Backup context active", failedFetches ? failedFetches + " source check failed or timed out" : "Latest visible data is ready", failedFetches ? "warn" : "done");
      normalizeVisibleLabels();
      decorateEmptyStates();
    } else {
      updateLoader("Syncing sources", activeFetches + " source checks still running", "loading");
    }
    updateRailStatus();
  }

  function patchFetch() {
    if (!window.fetch || window.fetch.__ntQualityPatched) return;
    const original = window.fetch.bind(window);
    function wrappedFetch(input, init) {
      const watch = shouldWatchFetch(input);
      if (watch) startFetch();
      return original(input, init).then(function (response) {
        if (watch) finishFetch(response && response.ok);
        return response;
      }, function (error) {
        if (watch) finishFetch(false);
        throw error;
      });
    }
    wrappedFetch.__ntQualityPatched = true;
    window.fetch = wrappedFetch;
  }

  function insertRail() {
    const cfg = config();
    if (!cfg || document.querySelector("[data-nt-quality-rail]")) return;
    const anchor = document.querySelector("[data-nt-tool-context]") || document.querySelector(".nt-tool-context") || document.querySelector("header");
    const rail = document.createElement("section");
    rail.className = "nt-quality-rail";
    rail.setAttribute("data-nt-quality-rail", "");
    rail.innerHTML = [
      '<div class="nt-quality-grid">',
      '<div class="nt-quality-main">',
      '<div class="nt-quality-label"><strong>' + esc(cfg.label) + '</strong><span>/</span><span>' + esc(cfg.mode) + '</span><span data-nt-quality-clock>ready</span></div>',
      '<div class="nt-quality-copy"><b>' + esc(cfg.watch) + ':</b> ' + esc(cfg.copy) + '</div>',
      '</div>',
      '<div class="nt-quality-actions">',
      '<div class="nt-quality-pills" aria-label="Source quality legend">',
      sourcePill("live", "Live"),
      sourcePill("delayed", "Delayed"),
      sourcePill("backup", "Backup"),
      sourcePill("context", "Context"),
      sourcePill("local", "Local"),
      '</div>',
      '<button class="nt-quality-action" type="button" data-nt-quality-refresh>Refresh view</button>',
      '</div>',
      '</div>'
    ].join("");
    if (anchor && anchor.parentNode) {
      anchor.insertAdjacentElement(anchor.matches && anchor.matches("header") ? "afterend" : "afterend", rail);
    } else {
      document.body.insertBefore(rail, document.body.firstChild);
    }
    const button = rail.querySelector("[data-nt-quality-refresh]");
    if (button) {
      button.addEventListener("click", function () {
        if (window.ntTrack) window.ntTrack("quality_refresh_click", { page: normalizePath(window.location.pathname) });
        window.location.reload();
      });
    }
    updateRailStatus();
  }

  function sourcePill(tone, label) {
    return '<span class="nt-quality-pill" data-tone="' + esc(tone) + '"><i class="nt-quality-dot" aria-hidden="true"></i>' + esc(label) + '</span>';
  }

  function updateRailStatus() {
    const clock = document.querySelector("[data-nt-quality-clock]");
    if (!clock) return;
    const text = activeFetches > 0 ? activeFetches + " syncing" : totalFetches ? "checked " + new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }) : "ready";
    clock.textContent = text;
  }

  function cleanText(value) {
    let text = String(value || "").replace(/\s+/g, " ").trim();
    if (!text) return text;
    const replacements = [
      [/^SAMPLE$/i, "Demo"],
      [/^BLOCKED$/i, "Unavailable"],
      [/proxy fallback/ig, "Backup context"],
      [/demo fallback/ig, "Demo backup"],
      [/sample data/ig, "Demo data"],
      [/sample/ig, "Demo"],
      [/blocked in browser/ig, "Unavailable in browser"],
      [/feed blocked in browser/ig, "Feed unavailable in browser"],
      [/the browser blocked or could not reach the feed/ig, "Source unavailable from this browser"],
      [/the source took too long to answer/ig, "Source timeout"],
      [/HTTP 451/ig, "Provider blocked public browser access"],
      [/HTTP 404/ig, "Feed endpoint unavailable"],
      [/baseline only/ig, "Baseline context"],
      [/public-interest proxy/ig, "Public-interest context"],
      [/local check inconclusive/ig, "Local check pending"],
      [/source unavailable from this browser/ig, "Source unavailable from this browser"]
    ];
    replacements.forEach(function (pair) {
      text = text.replace(pair[0], pair[1]);
    });
    return text;
  }

  function normalizeVisibleLabels() {
    const selectors = [
      ".truth",
      ".badge",
      ".pill",
      ".tag",
      ".nt-source-pill",
      ".nt-tool-status",
      ".source",
      ".source-status",
      ".source-log",
      ".source-details",
      "[id*='source']",
      "[class*='source']",
      "[class*='status']"
    ].join(",");
    document.querySelectorAll(selectors).forEach(function (node) {
      if (!node || node.closest("script,style,template")) return;
      if (node.childElementCount > 4) return;
      const before = node.textContent || "";
      const after = cleanText(before);
      if (after && after !== before.trim() && node.childElementCount === 0) {
        node.textContent = after;
      }
      const tone = sourceTone(after || before);
      if (/\b(live|delayed|backup|context|local|demo|unavailable|provider blocked|source timeout|baseline)\b/i.test(after || before)) {
        node.classList.add("nt-quality-source-clean");
        node.setAttribute("data-tone", tone.key);
      }
    });
  }

  function decorateEmptyStates() {
    const candidates = document.querySelectorAll(".empty,.empty-state,[id*='empty'],[class*='empty']");
    candidates.forEach(function (node) {
      if (!node || node.closest("script,style,template")) return;
      node.classList.add("nt-quality-empty");
    });
  }

  function observeDom() {
    if (!window.MutationObserver || !document.body) return;
    const observer = new MutationObserver(function () {
      clearTimeout(scanTimer);
      scanTimer = setTimeout(function () {
        normalizeVisibleLabels();
        decorateEmptyStates();
      }, 120);
    });
    observer.observe(document.body, { childList: true, subtree: true, characterData: true });
  }

  function init() {
    if (!config()) return;
    insertRail();
    normalizeVisibleLabels();
    decorateEmptyStates();
    observeDom();
    setTimeout(function () {
      if (totalFetches === 0) updateRailStatus();
      normalizeVisibleLabels();
    }, 900);
    if (window.ntTrack) {
      window.ntTrack("quality_rails_view", {
        page: normalizePath(window.location.pathname),
        mode: config().mode
      });
    }
  }

  patchFetch();

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();
