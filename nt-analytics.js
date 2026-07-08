(function () {
  if (window.__niftyAnalyticsLite) return;
  window.__niftyAnalyticsLite = true;

  var STORE_KEY = "nifty_admin_events";
  var SESSION_KEY = "nifty_session_id";
  var MAX_EVENTS = 800;
  var searchTimers = new WeakMap();
  var TOOL_NAMES = {
    "signal-watch": "Early Warning Radar",
    "signal-suite": "Signal Suite Hub",
    "aurora-watch": "Aurora Watch",
    "outage-radar": "Outage Radar",
    "cyber-threat": "Cyber Threat Radar",
    "food-watch": "Food Watch",
    "meme-watch": "Meme Watch",
    "crypto-pulse": "Crypto Network Pulse",
    "market-volume-pulse": "Market Volume Pulse",
    "positioning-radar": "Market Positioning Radar",
    "ai-panic": "AI Panic Meter",
    "admin": "Admin Centre Lite",
    "prepper-command": "Prepper Command Center Lite",
    "prepper-tools": "Prepper Toolkit Pro",
    "image-tools": "Image Toolkit",
    "pdf-tools": "PDF Toolkit",
    "salary-tools": "Salary / Paycheck Calculator Pro",
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
    "bot-detector": "Bot Post Detector",
    "fake-hacker": "Fake Hacker Terminal",
    "mortgage": "Mortgage Calculator",
    "auto-loan": "Auto Loan Calculator",
    "percentage": "Percentage Calculator"
  };
  var SIGNAL_SUITE_TOOLS = {
    "signal-suite": {
      name: "Signal Suite Hub",
      lane: "signal command shelf",
      truth: "local",
      read: "Local hub grouping the flagship radar tools with source truth labels",
      sources: "NiftyTools Hub tool catalog and local analytics events"
    },
    "signal-watch": {
      name: "Early Warning Radar",
      lane: "global + local anomaly",
      truth: "mixed",
      read: "Live public feeds with local/browser fallback",
      sources: "NOAA, USGS, status pages, weather/news proxies"
    },
    "aurora-watch": {
      name: "Aurora Watch",
      lane: "space weather",
      truth: "live",
      read: "Live NOAA + Open-Meteo where browser access allows",
      sources: "NOAA SWPC, NOAA OVATION, Open-Meteo"
    },
    "outage-radar": {
      name: "Outage Radar",
      lane: "internet health",
      truth: "mixed",
      read: "Official status pages plus browser reachability probes",
      sources: "Cloudflare, OpenAI, GitHub, Google, AWS, local probes"
    },
    "cyber-threat": {
      name: "Cyber Threat Radar",
      lane: "public cyber signals",
      truth: "mixed",
      read: "Public feeds with animated demo fallback when blocked",
      sources: "SANS ISC/DShield, CISA KEV, demo simulator"
    },
    "food-watch": {
      name: "Food Watch",
      lane: "recalls + commodity pressure",
      truth: "mixed",
      read: "Live recall feed plus reference commodity pressure rows",
      sources: "openFDA recalls, bundled commodity context"
    },
    "meme-watch": {
      name: "Meme Watch",
      lane: "trend early warning",
      truth: "proxy",
      read: "Public web attention proxies; social firehose not connected",
      sources: "HN, GDELT, Wikipedia/Wikimedia, demo terms"
    },
    "crypto-pulse": {
      name: "Crypto Pulse",
      lane: "on-chain network stress",
      truth: "mixed",
      read: "BTC public APIs are strongest; ETH needs backend key for full depth",
      sources: "Blockchain.com, mempool.space, CoinGecko, ETH fallback"
    },
    "market-volume-pulse": {
      name: "Market Volume Pulse",
      lane: "market activity",
      truth: "delayed",
      read: "Live/reference quote basket; full real-time market tape is later",
      sources: "Nifty API, Stooq/reference rows, optional Alpha Vantage"
    },
    "positioning-radar": {
      name: "Market Positioning Radar",
      lane: "long/short crowding",
      truth: "delayed",
      read: "CFTC/FINRA/OKX are useful but delayed/proxy-based",
      sources: "CFTC COT, FINRA short volume, OKX, Binance fallback"
    },
    "admin": {
      name: "Admin Centre Lite",
      lane: "operations",
      truth: "local",
      read: "Local browser buffer now; production analytics backend later",
      sources: "nt-analytics localStorage, Vercel Analytics later"
    }
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

  function signalMeta(slug) {
    slug = slug || pageName();
    return SIGNAL_SUITE_TOOLS[slug] || null;
  }

  function signalTruthFromProps(props, meta) {
    var status = String((props && (props.source_status || props.status || props.truth)) || (meta && meta.truth) || "unknown").toLowerCase();
    if (/blocked|error|failed|timeout/.test(status)) return "blocked";
    if (/sample|demo/.test(status)) return "sample";
    if (/proxy|reference|fallback/.test(status)) return "proxy";
    if (/mixed|degraded/.test(status)) return "mixed";
    if (/delayed/.test(status)) return "delayed";
    if (/local/.test(status)) return "local";
    if (/live|ok|online/.test(status)) return "live";
    return status || "unknown";
  }

  function reportSignalHealth(props) {
    var slug = safeText((props && props.slug) || pageName(), 48);
    var meta = signalMeta(slug);
    if (!meta) return;
    var truth = signalTruthFromProps(props, meta);
    track("signal_source_health", Object.assign({
      tool: meta.name,
      slug: slug,
      lane: meta.lane,
      truth: truth,
      source_status: truth,
      read: meta.read
    }, sanitizeProps(props || {})));
  }

  window.ntSignalHealth = reportSignalHealth;
  window.NiftySignalSuite = {
    tools: SIGNAL_SUITE_TOOLS,
    truthLabels: {
      live: "Real feed working",
      delayed: "Real but delayed",
      proxy: "Useful estimate",
      mixed: "Live plus fallback",
      sample: "Fallback/sample",
      local: "Local browser only",
      blocked: "Feed blocked"
    }
  };

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
    if (/compress|resize|convert|generate|remove|merge|split|extract|calculate|estimate|test|start|run|create|scan|analyze|clean|format|render|print|reset|pack|inventory/.test(text)) return "tool_action";
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

  function botCategoryFromUA(ua) {
    ua = String(ua || "").toLowerCase();
    if (/gptbot|chatgpt-user|ccbot|claudebot|anthropic|perplexitybot|bytespider|google-extended|applebot-extended|diffbot|youbot/.test(ua)) return "ai_crawler";
    if (/googlebot|bingbot|slurp|duckduckbot|baiduspider|yandexbot|semrushbot|ahrefsbot|mj12bot|dotbot|petalbot|crawler|spider|bot\b/.test(ua)) return "known_bot";
    if (/headless|phantomjs|selenium|playwright|puppeteer|curl|wget|python-requests|httpclient|go-http-client/.test(ua)) return "automation";
    return "browser";
  }

  function coarseTimezone() {
    try {
      return Intl.DateTimeFormat().resolvedOptions().timeZone || "unknown";
    } catch (err) {
      return "unknown";
    }
  }

  function sessionBotScore() {
    var ua = navigator.userAgent || "";
    var category = botCategoryFromUA(ua);
    var score = 12;
    if (category === "known_bot") score += 80;
    if (category === "ai_crawler") score += 84;
    if (category === "automation") score += 68;
    if (navigator.webdriver) score += 72;
    if (!navigator.languages || !navigator.languages.length) score += 18;
    if (!screen || !screen.width || !screen.height) score += 14;
    if (/admin|bot-detector/.test(pageName())) score -= 8;
    return Math.max(0, Math.min(100, score));
  }

  function trackBotProbe() {
    var ua = navigator.userAgent || "";
    var category = botCategoryFromUA(ua);
    track("bot_session_probe", {
      bot_score: sessionBotScore(),
      ua_category: category,
      webdriver: !!navigator.webdriver,
      language_count: navigator.languages ? navigator.languages.length : 0,
      screen_bucket: screen && screen.width ? String(Math.round(screen.width / 100) * 100) + "x" + String(Math.round(screen.height / 100) * 100) : "unknown",
      timezone: coarseTimezone()
    });
  }

  function bindHumanSignals() {
    var sent = {};
    function mark(kind) {
      if (sent[kind]) return;
      sent[kind] = true;
      track("human_signal", {
        signal: kind,
        ms_since_load: Math.round(performance.now ? performance.now() : 0),
        ua_category: botCategoryFromUA(navigator.userAgent || "")
      });
    }
    ["pointerdown", "keydown", "touchstart", "scroll"].forEach(function (eventName) {
      window.addEventListener(eventName, function () { mark(eventName); }, { once: true, passive: true });
    });
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
    var meta = signalMeta(name);
    if (meta) {
      track("signal_tool_open", {
        tool: meta.name,
        slug: name,
        lane: meta.lane,
        truth: meta.truth,
        source_status: meta.truth,
        read: meta.read,
        sources: meta.sources
      });
    }
    if (name === "admin") {
      track("admin_open", { tool: "admin" });
    }
    trackBotProbe();
  }

  function init() {
    bindClicks();
    bindSearch();
    bindFetchMonitor();
    bindErrors();
    bindHumanSignals();
    trackPerformance();
    trackPage();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
