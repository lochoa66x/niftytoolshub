(function () {
  if (window.__niftySignalUI) return;
  window.__niftySignalUI = true;

  var TONES = {
    live: { label: "Live", detail: "Real feed working", tone: "live" },
    delayed: { label: "Delayed", detail: "Real data, delayed", tone: "delayed" },
    backup: { label: "Backup", detail: "Backup source active", tone: "backup" },
    context: { label: "Context", detail: "Useful context source", tone: "context" },
    mixed: { label: "Mixed", detail: "Live plus backup sources", tone: "mixed" },
    local: { label: "Local", detail: "Local browser signal", tone: "local" },
    demo: { label: "Demo", detail: "Demo/reference mode", tone: "demo" },
    unavailable: { label: "Unavailable", detail: "Source unavailable", tone: "unavailable" },
    loading: { label: "Syncing", detail: "Checking sources", tone: "loading" }
  };

  function injectStyles() {
    if (document.getElementById("nt-signal-ui-style")) return;
    var style = document.createElement("style");
    style.id = "nt-signal-ui-style";
    style.textContent = [
      ".nt-signal-sync{position:fixed;right:18px;bottom:18px;z-index:9999;display:flex;align-items:center;gap:9px;max-width:min(360px,calc(100vw - 36px));border:1px solid rgba(70,224,122,.34);border-radius:8px;background:rgba(2,7,4,.9);box-shadow:0 0 30px rgba(70,224,122,.16),inset 0 0 18px rgba(70,224,122,.06);color:#dfeaDF;font:700 12px ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;padding:10px 12px;opacity:0;pointer-events:none;transform:translateY(10px);transition:opacity .18s ease,transform .18s ease}",
      ".nt-signal-sync.is-visible{opacity:1;transform:translateY(0)}",
      ".nt-signal-spinner{width:14px;height:14px;border-radius:999px;border:2px solid rgba(70,224,122,.2);border-top-color:#46e07a;box-shadow:0 0 16px rgba(70,224,122,.32);animation:ntSignalSpin .75s linear infinite;flex:0 0 auto}",
      ".nt-signal-sync.is-done .nt-signal-spinner{animation:none;border-color:#46e07a;background:#46e07a;box-shadow:0 0 16px rgba(70,224,122,.5)}",
      ".nt-signal-text{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}",
      ".nt-source-pill{display:inline-flex;align-items:center;gap:5px;border:1px solid rgba(70,224,122,.28);border-radius:999px;padding:3px 8px;color:#46e07a;background:rgba(2,7,4,.72);font:800 10px ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;text-transform:uppercase;white-space:nowrap}",
      ".nt-source-pill.delayed,.nt-source-pill.backup,.nt-source-pill.context,.nt-source-pill.mixed{border-color:rgba(255,189,91,.38);color:#ffbd5b}",
      ".nt-source-pill.local,.nt-source-pill.demo{border-color:rgba(99,230,255,.34);color:#63e6ff}",
      ".nt-source-pill.unavailable{border-color:rgba(255,101,114,.42);color:#ff6572}",
      ".nt-skeleton{position:relative;overflow:hidden;background:linear-gradient(90deg,rgba(70,224,122,.05),rgba(99,230,255,.08),rgba(70,224,122,.05));background-size:220% 100%;animation:ntSignalShimmer 1.25s ease-in-out infinite}",
      "@keyframes ntSignalSpin{to{transform:rotate(360deg)}}",
      "@keyframes ntSignalShimmer{0%{background-position:140% 0}100%{background-position:-80% 0}}",
      "@media(max-width:680px){.nt-signal-sync{left:12px;right:12px;bottom:12px;max-width:none}}"
    ].join("");
    document.head.appendChild(style);
  }

  function ensureSyncNode() {
    injectStyles();
    var node = document.getElementById("ntSignalSync");
    if (node) return node;
    node = document.createElement("div");
    node.id = "ntSignalSync";
    node.className = "nt-signal-sync";
    node.setAttribute("role", "status");
    node.setAttribute("aria-live", "polite");
    node.innerHTML = '<span class="nt-signal-spinner" aria-hidden="true"></span><span class="nt-signal-text">Syncing live sources</span>';
    document.body.appendChild(node);
    return node;
  }

  function normalizeStatus(value) {
    var raw = String(value || "").toLowerCase();
    if (/live|ok|online|healthy|success/.test(raw)) return "live";
    if (/delayed|reference|historical|weekly|stooq|finra|cftc/.test(raw)) return "delayed";
    if (/covered|backup|fallback/.test(raw)) return "backup";
    if (/proxy|context|estimate|public-interest|pageview/.test(raw)) return "context";
    if (/mixed|degraded|partial/.test(raw)) return "mixed";
    if (/local|browser|device/.test(raw)) return "local";
    if (/sample|demo|mock/.test(raw)) return "demo";
    if (/blocked|error|failed|timeout|unavailable|abort|unreachable|rate/.test(raw)) return "unavailable";
    return raw ? "context" : "loading";
  }

  function sourceBadge(value) {
    var key = normalizeStatus(value);
    return Object.assign({ status: key }, TONES[key] || TONES.context);
  }

  function label(value) {
    return sourceBadge(value).label;
  }

  function pill(value, extraClass) {
    var badge = sourceBadge(value);
    var cls = "nt-source-pill " + badge.tone + (extraClass ? " " + extraClass : "");
    return '<span class="' + cls + '">' + badge.label + "</span>";
  }

  function summarize(log) {
    var counts = {};
    (log || []).forEach(function (item) {
      var key = normalizeStatus(item && (item.status || item.source_status || item.truth || item.source));
      counts[key] = (counts[key] || 0) + 1;
    });
    var order = ["live", "delayed", "backup", "context", "mixed", "local", "demo", "unavailable"];
    var text = order.filter(function (key) { return counts[key]; }).map(function (key) {
      return counts[key] + " " + TONES[key].label.toLowerCase();
    }).join(" / ");
    return text || "checking sources";
  }

  function start(message) {
    if (!document.body) return;
    var node = ensureSyncNode();
    node.classList.remove("is-done");
    node.querySelector(".nt-signal-text").textContent = message || "Syncing live sources";
    node.classList.add("is-visible");
    document.body.classList.add("nt-signal-busy");
  }

  function finish(message, delay) {
    if (!document.body) return;
    var node = ensureSyncNode();
    node.querySelector(".nt-signal-text").textContent = message || "Sources updated";
    node.classList.add("is-done", "is-visible");
    document.body.classList.remove("nt-signal-busy");
    clearTimeout(node._hideTimer);
    node._hideTimer = setTimeout(function () {
      node.classList.remove("is-visible", "is-done");
    }, delay == null ? 1200 : delay);
  }

  function fail(message, delay) {
    finish(message || "Using backup sources", delay == null ? 1600 : delay);
  }

  function trackHealth(tool, log) {
    try {
      if (window.ntSignalHealth) {
        window.ntSignalHealth({
          slug: tool,
          source_status: summarize(log),
          status: summarize(log)
        });
      }
    } catch (err) {}
  }

  window.ntSignal = {
    start: start,
    finish: finish,
    fail: fail,
    status: normalizeStatus,
    badge: sourceBadge,
    label: label,
    pill: pill,
    summarize: summarize,
    trackHealth: trackHealth
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", injectStyles, { once: true });
  } else {
    injectStyles();
  }
})();
