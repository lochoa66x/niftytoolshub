(function () {
  "use strict";

  if (window.__niftyMobileLite) return;
  window.__niftyMobileLite = true;

  const ADMIN_RE = /\/admin\.html(?:$|[?#])/;

  ready(function () {
    document.body.classList.toggle("nt-admin-page", ADMIN_RE.test(location.pathname));
    document.body.classList.add("nt-mobile-lite-ready");
    markPublicDiagnostics();
    pruneMobileRouteNoise();
    observeLatePanels();
  });

  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn, { once: true });
    } else {
      fn();
    }
  }

  function observeLatePanels() {
    let timer = 0;
    const observer = new MutationObserver(function () {
      clearTimeout(timer);
      timer = setTimeout(function () {
        markPublicDiagnostics();
        pruneMobileRouteNoise();
      }, 90);
    });
    observer.observe(document.body, { childList: true, subtree: true, characterData: true });
    setTimeout(markPublicDiagnostics, 600);
    setTimeout(markPublicDiagnostics, 1800);
    setTimeout(markPublicDiagnostics, 5000);
  }

  function markPublicDiagnostics() {
    if (ADMIN_RE.test(location.pathname)) return;

    document.querySelectorAll(".panel, article, section").forEach(function (panel) {
      const h = headingText(panel);
      if (isSourceHeading(h)) panel.classList.add("nt-public-source-health");
      if (isExplainerHeading(h)) panel.classList.add("nt-mobile-explainer");
      if (isDiagnosticHeading(h)) panel.classList.add("nt-public-diagnostics");
    });

    document.querySelectorAll(".source-log, .source-strip, .source-health-summary, .source-details").forEach(function (node) {
      const panel = node.closest(".panel, article, section") || node;
      panel.classList.add("nt-public-source-health");
    });

    document.querySelectorAll(".stat-row, .mini, .truth, .signal-row").forEach(function (node) {
      const text = clean(node.textContent).toLowerCase();
      if (
        /\b(source health|source status|data source status|source quality)\b/.test(text) ||
        /\b(live probes|unavailable probes|labels live)\b/.test(text)
      ) {
        node.classList.add("nt-public-source-health");
      }
    });
  }

  function pruneMobileRouteNoise() {
    if (!isPhone()) return;

    document.querySelectorAll("[data-nt-next-steps], .nt-next-steps").forEach(function (node) {
      node.setAttribute("aria-hidden", "true");
    });

    document.querySelectorAll(".nt-tool-context .related-tools, .nt-tool-context .context-card").forEach(function (node) {
      node.classList.add("nt-mobile-explainer");
    });
  }

  function headingText(node) {
    const heading = node.querySelector(":scope > h2, :scope > h3, :scope > .panel-head h2, :scope > .panel-head h3");
    return clean(heading && heading.textContent).toLowerCase();
  }

  function isSourceHeading(text) {
    return [
      "source health",
      "source quality",
      "data coverage",
      "official links",
      "watch coverage"
    ].includes(text);
  }

  function isExplainerHeading(text) {
    return [
      "what this is",
      "how to read this board",
      "how to read",
      "related tools"
    ].includes(text);
  }

  function isDiagnosticHeading(text) {
    return [
      "debug",
      "raw feed",
      "feed log",
      "source log",
      "signals log"
    ].includes(text);
  }

  function isPhone() {
    return !window.matchMedia || window.matchMedia("(max-width: 760px)").matches;
  }

  function clean(value) {
    return String(value || "").replace(/\s+/g, " ").trim();
  }
})();
