(function () {
  "use strict";

  if (window.__niftyMobilePhase2) return;
  window.__niftyMobilePhase2 = true;

  const ADMIN_RE = /\/admin\.html(?:$|[?#])/;
  const SIGNAL_RE = /\/(?:signal-watch|aurora-watch|outage-radar|cyber-threat|food-watch|meme-watch|crypto-pulse|market-volume-pulse|positioning-radar|personal-risk|prepper-risk|prepper-tools|signal-suite)\.html(?:$|[?#])/;
  const PHONE_MQ = window.matchMedia ? window.matchMedia("(max-width: 760px)") : { matches: false };

  ready(function () {
    document.body.classList.add("nt-mobile-phase2");
    document.body.classList.toggle("nt-admin-page", ADMIN_RE.test(location.pathname));
    document.body.classList.toggle("nt-signal-tool", SIGNAL_RE.test(location.pathname));

    markPublicDiagnostics();
    markAdvancedActions();
    installMobileControls();
    installInitialSync();
    observeLateChanges();
  });

  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn, { once: true });
    } else {
      fn();
    }
  }

  function observeLateChanges() {
    let timer = 0;
    const observer = new MutationObserver(function () {
      clearTimeout(timer);
      timer = setTimeout(function () {
        markPublicDiagnostics();
        markAdvancedActions();
        clearInitialSyncIfReady();
      }, 90);
    });
    observer.observe(document.body, { childList: true, subtree: true, characterData: true });
    [500, 1500, 3500, 7000].forEach(function (ms) {
      setTimeout(function () {
        markPublicDiagnostics();
        markAdvancedActions();
        clearInitialSyncIfReady();
      }, ms);
    });
  }

  function markPublicDiagnostics() {
    if (ADMIN_RE.test(location.pathname)) return;

    document.querySelectorAll(".panel, article, section, aside, details").forEach(function (panel) {
      const h = headingText(panel);
      if (isSourceHeading(h)) panel.classList.add("nt-public-source-health", "nt-public-source-panel");
      if (isDiagnosticHeading(h)) panel.classList.add("nt-public-diagnostics");
      if (isExplainerHeading(h)) panel.classList.add("nt-mobile-explainer");
    });

    document.querySelectorAll("#sourceHealth, #sourceLog, .source-log, .source-strip, .source-health-summary, .source-details, .source-drawer, .source-row, .truth-strip").forEach(function (node) {
      const target = node.closest(".panel, article, section, aside, details") || node;
      target.classList.add("nt-public-source-health", "nt-public-source-panel");
    });

    document.querySelectorAll(".stat, .stat-row, .mini, .truth, .signal-row, .item, .card").forEach(function (node) {
      const text = clean(node.textContent).toLowerCase();
      if (
        /\b(source health|source status|source quality|data source|official source|official status)\b/.test(text) ||
        /\b(live probes|unavailable probes|blocked feeds|labels live|source mode)\b/.test(text)
      ) {
        node.classList.add("nt-public-source-health");
      }
    });
  }

  function markAdvancedActions() {
    if (ADMIN_RE.test(location.pathname)) return;
    document.querySelectorAll("button, a.btn, .btn, [role='button']").forEach(function (node) {
      const text = clean(node.textContent).toLowerCase();
      const label = clean(node.getAttribute("aria-label")).toLowerCase();
      const value = text + " " + label;
      if (/\b(export|download json|print|raw|debug|source log|official links|official source|feed log)\b/.test(value)) {
        node.classList.add("nt-mobile-advanced-action");
      }
    });
  }

  function installMobileControls() {
    if (!isPhone() || ADMIN_RE.test(location.pathname)) return;

    document.querySelectorAll(".toolbar, .controls").forEach(function (control) {
      if (!control.parentNode || control.closest(".nt-mobile-options") || control.closest(".nt-mobile-control-shell")) return;
      if (control.hidden || control.classList.contains("nt-admin-source-hook")) return;

      const shell = document.createElement("section");
      shell.className = "nt-mobile-control-shell";
      shell.setAttribute("aria-label", "Mobile controls");

      const actionStrip = document.createElement("div");
      actionStrip.className = "nt-mobile-action-strip";

      const primary = findPrimaryAction(control);
      if (primary) {
        actionStrip.appendChild(primary);
        primary.classList.add("nt-mobile-primary-action");
      }

      const details = document.createElement("details");
      details.className = "nt-mobile-options";

      const summary = document.createElement("summary");
      summary.innerHTML = "<span>Options</span><small>filters and secondary actions</small>";
      details.appendChild(summary);

      control.parentNode.insertBefore(shell, control);
      if (primary) shell.appendChild(actionStrip);
      control.classList.add("nt-mobile-contained");
      details.appendChild(control);
      shell.appendChild(details);
    });
  }

  function findPrimaryAction(control) {
    const candidates = Array.from(control.querySelectorAll("button, a.btn, .btn")).filter(function (node) {
      if (node.classList.contains("ghost") || node.classList.contains("nt-mobile-advanced-action")) return false;
      const text = clean(node.textContent).toLowerCase();
      return /\b(refresh|scan|run|calculate|check|generate|update|build|start|open)\b/.test(text);
    });
    return candidates[0] || null;
  }

  function installInitialSync() {
    if (!SIGNAL_RE.test(location.pathname) || ADMIN_RE.test(location.pathname)) return;
    document.body.classList.add("nt-initial-sync");
    setTimeout(function () {
      document.body.classList.remove("nt-initial-sync");
    }, 12000);
    clearInitialSyncIfReady();
  }

  function clearInitialSyncIfReady() {
    if (!document.body.classList.contains("nt-initial-sync")) return;
    if (hasUsableData()) document.body.classList.remove("nt-initial-sync");
  }

  function hasUsableData() {
    const updatedNodes = [
      "updatedAt",
      "miniUpdated",
      "heroUpdated",
      "sourceState",
      "activityState",
      "combinedState",
      "crowdState"
    ].map(function (id) { return document.getElementById(id); }).filter(Boolean);

    const updatedReady = updatedNodes.some(function (node) {
      const text = clean(node.textContent).toLowerCase();
      return text && !/\b(sync|pending|boot|loading|waiting|--)\b/.test(text);
    });

    const scoreReady = Array.from(document.querySelectorAll(".score-row b, .score b, .readout b, .mini b")).some(function (node) {
      const text = clean(node.textContent);
      const number = parseFloat(text.replace(/[^0-9.-]/g, ""));
      return Number.isFinite(number) && number > 0;
    });

    return updatedReady || scoreReady;
  }

  function headingText(node) {
    const heading = node.querySelector(":scope > h2, :scope > h3, :scope > .panel-head h2, :scope > .panel-head h3, :scope > summary, :scope .panel-head h2, :scope .panel-head h3");
    return clean(heading && heading.textContent).toLowerCase();
  }

  function isSourceHeading(text) {
    return [
      "source health",
      "source quality",
      "source status",
      "data coverage",
      "official links",
      "official sources",
      "watch coverage"
    ].includes(text);
  }

  function isDiagnosticHeading(text) {
    return [
      "debug",
      "raw feed",
      "feed log",
      "source log",
      "signals log",
      "runtime log"
    ].includes(text);
  }

  function isExplainerHeading(text) {
    return [
      "what this is",
      "how to read this board",
      "how to read",
      "related tools",
      "readable report"
    ].includes(text);
  }

  function isPhone() {
    return !!PHONE_MQ.matches;
  }

  function clean(value) {
    return String(value || "").replace(/\s+/g, " ").trim();
  }
})();
