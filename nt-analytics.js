(function () {
  if (window.__niftyAnalyticsLite) return;
  window.__niftyAnalyticsLite = true;

  var STORE_KEY = "nifty_admin_events";
  var SESSION_KEY = "nifty_session_id";
  var MAX_EVENTS = 800;
  var searchTimers = new WeakMap();
  var TOOL_NAMES = {
    "signal-watch": "Early Warning Radar",
    "aurora-watch": "Aurora Watch",
    "meme-watch": "Meme Early Warning",
    "cyber-threat": "Cyber Threat Radar",
    "outage-radar": "Outage Radar",
    "ai-panic": "AI Panic Meter",
    "image-tools": "Image Toolkit",
    "pdf-tools": "PDF Toolkit",
    "salary-tools": "Salary / Paycheck Calculator Pro",
    "math-tools": "Math Lab Pro",
    "unit-tools": "Unit Converter Pro",
    "time-tools": "World Clock / Time Zone Studio",
    "device-tests": "Device Test Suite",
    "file-organizer": "File Organizer Toolkit",
    "color-tools": "Color Palette Studio",
    "qr-tools": "QR Code Toolkit Pro",
    "receipt-tools": "Receipt Generator",
    "dev-tools": "Developer Toolkit",
    "text-tools": "Text & Writing Toolkit Pro",
    "tarot-tools": "Tarot Card Reader",
    "astrology-tools": "Birth Chart / Zodiac Toolkit",
    "random-tools": "Random Toolkit Pro",
    "fake-hacker": "Fake Hacker Terminal",
    "mortgage": "Mortgage Calculator",
    "auto-loan": "Auto Loan Calculator",
    "percentage": "Percentage Calculator"
  };

  function nowIso() {
    return new Date().toISOString();
  }

  function sessionId() {
    try {
      var existing = localStorage.getItem(SESSION_KEY);
      if (existing) return existing;
      var id = (window.crypto && window.crypto.randomUUID) ? window.crypto.randomUUID() : String(Date.now()) + "-" + Math.random().toString(16).slice(2);
      localStorage.setItem(SESSION_KEY, id);
      return id;
    } catch (err) {
      return "session-unavailable";
    }
  }

  function pageName() {
    var path = location.pathname.split("/").pop() || "index.html";
    return path.replace(/\.html$/i, "") || "home";
  }

  function safeText(value, max) {
    return String(value || "")
      .replace(/\s+/g, " ")
      .replace(/[<>]/g, "")
      .trim()
      .slice(0, max || 80);
  }

  function safePath(value) {
    try {
      var url = new URL(value, location.href);
      return url.origin === location.origin ? url.pathname : url.hostname;
    } catch (err) {
      return safeText(value, 120);
    }
  }

  function referrerLabel() {
    if (!document.referrer) return "direct / local";
    try {
      var ref = new URL(document.referrer);
      return ref.hostname.replace(/^www\./, "");
    } catch (err) {
      return safeText(document.referrer, 80) || "direct / local";
    }
  }

  function slugFromPath(value) {
    var path = safePath(value || location.pathname);
    var file = path.split("/").pop() || "index";
    return file.replace(/\.html$/i, "") || "index";
  }

  function canonicalToolName(raw, target) {
    var slug = slugFromPath(target || raw || location.pathname);
    if (TOOL_NAMES[slug]) return TOOL_NAMES[slug];
    var text = safeText(raw, 80);
    if (/signal watch/i.test(text)) return "Early Warning Radar";
    if (/salary/i.test(text)) return "Salary / Paycheck Calculator Pro";
    if (/pdf/i.test(text)) return "PDF Toolkit";
    if (/image/i.test(text)) return "Image Toolkit";
    return text || TOOL_NAMES[pageName()] || pageName();
  }

  function cleanSearchTerm(value) {
    var term = safeText(value, 60).toLowerCase();
    if (!term || term.length < 2) return "";
    if (/@/.test(term)) return "[redacted-email-like]";
    if (/\d{3}[-.\s]?\d{3}[-.\s]?\d{4}/.test(term)) return "[redacted-phone-like]";
    return term;
  }

  function sanitizeProps(props) {
    var out = {};
    props = props || {};
    Object.keys(props).slice(0, 18).forEach(function (key) {
      var value = props[key];
      var cleanKey = safeText(key, 32).replace(/[^a-zA-Z0-9_:-]/g, "_");
      if (!cleanKey) return;
      if (typeof value === "number" || typeof value === "boolean") out[cleanKey] = value;
      else out[cleanKey] = safeText(value, 120);
    });
    return out;
  }

  function localEvents() {
    try {
      return JSON.parse(localStorage.getItem(STORE_KEY) || "[]");
    } catch (err) {
      return [];
    }
  }

  function saveLocalEvent(event) {
    try {
      var events = localEvents();
      events.push(event);
      if (events.length > MAX_EVENTS) events = events.slice(events.length - MAX_EVENTS);
      localStorage.setItem(STORE_KEY, JSON.stringify(events));
    } catch (err) {}
  }

  function track(name, props) {
    var payload = Object.assign({
      event: safeText(name, 48),
      page: pageName(),
      path: location.pathname,
      title: safeText(document.title, 90),
      referrer: referrerLabel(),
      session: sessionId(),
      ts: nowIso()
    }, sanitizeProps(props));

    saveLocalEvent(payload);

    try {
      if (typeof window.va === "function") {
        window.va("event", { name: payload.event, data: payload });
      }
    } catch (err) {}

    try {
      window.dispatchEvent(new CustomEvent("nifty:analytics", { detail: payload }));
    } catch (err) {}
  }

  window.ntTrack = track;

  function cardName(card) {
    var title = card.querySelector("h1,h2,h3,.title");
    if (title) return safeText(title.textContent, 80);
    if (card.dataset && card.dataset.name) return safeText(card.dataset.name, 80);
    return safeText(card.textContent, 80);
  }

  function linkTarget(node) {
    var href = node.getAttribute && node.getAttribute("href");
    if (href) return safePath(href);
    var onclick = node.getAttribute && node.getAttribute("onclick");
    var match = onclick && onclick.match(/location\.href=['"]([^'"]+)/);
    return match ? safePath(match[1]) : "";
  }

  function actionKind(text) {
    text = text.toLowerCase();
    if (/download|export|save file/.test(text)) return "download";
    if (/copy|clipboard/.test(text)) return "copy";
    if (/share/.test(text)) return "share";
    if (/compress|resize|convert|generate|remove|merge|split|extract|calculate|estimate|test|start|run|create|scan|analyze|clean|format|render/.test(text)) return "tool_action";
    return "";
  }

  function bindClicks() {
    document.addEventListener("click", function (event) {
      var target = event.target;
      if (!target || !target.closest) return;

      var card = target.closest(".tool,.featured-card");
      if (card) {
        var targetPath = linkTarget(card);
        track("tool_open", {
          tool: canonicalToolName(cardName(card), targetPath),
          target: targetPath,
          surface: card.classList.contains("featured-card") ? "featured" : "library"
        });
      }

      var action = target.closest("button,a,[role='button'],input[type='button'],input[type='submit']");
      if (!action) return;
      var label = safeText(action.getAttribute("aria-label") || action.textContent || action.value || action.title, 80);
      var kind = actionKind(label);
      if (!kind) return;
      track(kind, {
        action: label,
        tool: pageName(),
        target: linkTarget(action)
      });
    }, true);
  }

  function bindSearch() {
    var inputs = Array.prototype.slice.call(document.querySelectorAll("input[type='search'], #q"));
    inputs.forEach(function (input) {
      input.addEventListener("input", function () {
        clearTimeout(searchTimers.get(input));
        var timer = setTimeout(function () {
          var term = cleanSearchTerm(input.value);
          if (!term) return;
          track("search", {
            term: term,
            length: term.length,
            source: input.id || input.name || "search"
          });
        }, 700);
        searchTimers.set(input, timer);
      });
    });
  }

  function bindFetchMonitor() {
    if (!window.fetch || window.__niftyFetchMonitor) return;
    window.__niftyFetchMonitor = true;
    var originalFetch = window.fetch;
    window.fetch = function () {
      var started = performance.now();
      var target = arguments[0];
      return originalFetch.apply(this, arguments).then(function (response) {
        var ms = Math.round(performance.now() - started);
        if (!response.ok) {
          track("error", {
            type: "fetch_status",
            status: response.status,
            url: safePath(response.url || target),
            ms: ms
          });
        } else if (ms > 2500) {
          track("slow_fetch", {
            url: safePath(response.url || target),
            ms: ms
          });
        }
        return response;
      }).catch(function (err) {
        track("error", {
          type: "fetch_failed",
          url: safePath(target),
          message: safeText(err && err.message, 100)
        });
        throw err;
      });
    };
  }

  function bindErrors() {
    window.addEventListener("error", function (event) {
      track("error", {
        type: "runtime",
        message: safeText(event.message, 120),
        source: safePath(event.filename || ""),
        line: event.lineno || 0
      });
    });

    window.addEventListener("unhandledrejection", function (event) {
      var reason = event.reason && (event.reason.message || event.reason);
      track("error", {
        type: "promise",
        message: safeText(reason, 120)
      });
    });
  }

  function trackPerformance() {
    window.addEventListener("load", function () {
      setTimeout(function () {
        var nav = performance.getEntriesByType && performance.getEntriesByType("navigation")[0];
        var loadMs = nav ? Math.round(nav.loadEventEnd) : 0;
        var domMs = nav ? Math.round(nav.domContentLoadedEventEnd) : 0;
        if (loadMs > 3000 || domMs > 1800) {
          track("slow_page", { load_ms: loadMs, dom_ms: domMs });
        }

        var resources = performance.getEntriesByType ? performance.getEntriesByType("resource") : [];
        var bytes = resources.reduce(function (sum, item) {
          return sum + (item.transferSize || item.encodedBodySize || 0);
        }, 0);
        if (bytes > 1800000) {
          track("large_page", { bytes: bytes, mb: Math.round(bytes / 10485.76) / 100 });
        }
      }, 900);
    });
  }

  function trackPage() {
    var name = pageName();
    if (name !== "index" && name !== "admin") {
      track("tool_page_view", { tool: canonicalToolName(name, location.pathname) });
    }
    if (name === "admin") {
      track("admin_open", { tool: "admin" });
    }
  }

  function init() {
    bindClicks();
    bindSearch();
    bindFetchMonitor();
    bindErrors();
    trackPerformance();
    trackPage();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
