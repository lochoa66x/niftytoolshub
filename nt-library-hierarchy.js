(function () {
  "use strict";

  if (window.__niftyLibraryHierarchy) return;
  window.__niftyLibraryHierarchy = true;

  const MISSIONS = [
    {
      id: "signal",
      title: "Command Center",
      filter: "signal",
      label: "Signal Suite",
      description: "Flagship radars, live signals, daily reads and public OSINT-style context."
    },
    {
      id: "prepper",
      title: "Preparedness",
      filter: "prepper",
      label: "Local Risk",
      description: "Household readiness, local risk scanning, checklists and practical plans."
    },
    {
      id: "market",
      title: "Market Tools",
      filter: "market",
      label: "Market Pulse",
      description: "Crypto Pulse, Market Volume and Market Positioning first. Finance helpers stay secondary."
    },
    {
      id: "work",
      title: "Work Tools",
      filter: "work",
      label: "Production",
      description: "PDFs, images, QR, receipts, developer tools, text cleanup and file organization."
    },
    {
      id: "utility",
      title: "Everyday Utilities",
      filter: "utility",
      label: "Small Tools",
      description: "Converters, clocks, calculators, device tests and practical one-off helpers."
    },
    {
      id: "fun",
      title: "Fun Lab",
      filter: "fun",
      label: "Play",
      description: "Tarot, astrology, randomizers, fake terminals and lightweight experiments."
    },
    {
      id: "indie",
      title: "Indie Developers",
      filter: "indie",
      label: "Coming Soon",
      description: "Founder utilities, launch checklists, pricing helpers and product ops tools."
    }
  ];

  const STARTERS = [
    ["Command Center", "/signal-suite.html", "flagship"],
    ["Personal Risk Briefing", "/personal-risk.html", "daily read"],
    ["Crypto Pulse", "/crypto-pulse.html", "crypto network"],
    ["Market Positioning Radar", "/positioning-radar.html", "long vs short"],
    ["Market Volume Pulse", "/market-volume-pulse.html", "volume"],
    ["Prepper Command", "/prepper-command.html", "readiness"],
    ["PDF Toolkit", "/pdf-tools.html", "work"]
  ];

  const MARKET_TOOLS = [
    {
      title: "Crypto Pulse",
      url: "/crypto-pulse.html",
      badge: "Crypto network",
      desc: "BTC/ETH fees, rails, gas, mempool and transaction pressure.",
      core: true
    },
    {
      title: "Market Volume Pulse",
      url: "/market-volume-pulse.html",
      badge: "Stocks volume",
      desc: "Most-traded stocks, ETF activity, volume leaders and attention spikes.",
      core: true
    },
    {
      title: "Market Positioning Radar",
      url: "/positioning-radar.html",
      badge: "Long vs short",
      desc: "Crowding context for SPY, QQQ, BTC, ETH, gold, silver, oil and coffee.",
      core: true
    },
    {
      title: "Salary / Paycheck",
      url: "/salary-tools.html",
      badge: "Finance helper",
      desc: "Take-home pay, raises, overtime and job-offer comparison.",
      core: false
    },
    {
      title: "Mortgage Calculator",
      url: "/mortgage.html",
      badge: "Finance helper",
      desc: "Payments, amortization and extra-payment scenarios.",
      core: false
    },
    {
      title: "Auto Loan Calculator",
      url: "/auto-loan.html",
      badge: "Finance helper",
      desc: "Car payment estimates with trade-in, tax and amortization.",
      core: false
    }
  ];

  const PRIORITY_NAMES = new Set([
    "command center",
    "signal suite hub",
    "personal risk briefing",
    "prepper command center lite",
    "prepper command center",
    "early warning radar",
    "outage radar",
    "cyber threat radar",
    "crypto pulse",
    "market positioning radar",
    "shorts vs longs radar",
    "market volume pulse",
    "stock volume pulse",
    "image toolkit",
    "pdf toolkit",
    "salary / paycheck calculator pro"
  ]);

  function esc(value) {
    return String(value == null ? "" : value).replace(/[&<>"']/g, ch => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      "\"": "&quot;",
      "'": "&#039;"
    }[ch]));
  }

  function cards() {
    return Array.from(document.querySelectorAll(".tool-library .tool"));
  }

  function activeFilter() {
    const chip = document.querySelector(".chip.on");
    return chip ? chip.dataset.f || "all" : "all";
  }

  function cardTags(card) {
    return `${card.dataset.tags || ""} ${card.dataset.name || ""} ${card.textContent || ""}`.toLowerCase();
  }


  const CATALOGUE_ASSIGNMENTS = {
    signal: [
      "signal suite hub",
      "signal suite pro lite",
      "command queue",
      "personal risk briefing",
      "meme early warning",
      "early warning radar",
      "outage radar",
      "cyber threat radar",
      "aurora watch",
      "food watch"
    ],
    prepper: [
      "prepper command center lite",
      "prepper command center",
      "prepper risk scanner",
      "prepper toolkit pro",
      "personal risk briefing"
    ],
    market: [
      "crypto pulse",
      "stock volume pulse",
      "market volume pulse",
      "shorts vs longs radar",
      "market positioning radar",
      "salary / paycheck calculator pro",
      "salary / paycheck pro",
      "finance ratios",
      "compound interest",
      "debt payoff",
      "loan & mortgage"
    ],
    work: [
      "image toolkit",
      "pdf toolkit",
      "receipt generator",
      "qr code toolkit pro",
      "file organizer toolkit",
      "developer toolkit",
      "text & writing toolkit pro",
      "word counter",
      "case converter",
      "json formatter",
      "color palette studio",
      "scratchpad",
      "barcode generator"
    ],
    utility: [
      "unit converter pro",
      "world clock / time zone studio",
      "device test suite",
      "dead pixel test",
      "days lived",
      "tip calculator",
      "number base converter",
      "morse code converter",
      "timer & stopwatch",
      "math lab pro",
      "percentage calc",
      "timestamp converter",
      "gpa calculator",
      "password generator"
    ],
    fun: [
      "gematria calculator",
      "zodiac finder",
      "random toolkit pro",
      "fake hacker terminal",
      "magic 8-ball",
      "random picker",
      "zodiac love match",
      "tarot card reader",
      "birth chart / zodiac toolkit"
    ],
    indie: []
  };

  const LANE_FILTERS = new Set(Object.keys(CATALOGUE_ASSIGNMENTS));

  function cardName(card) {
    return (card.querySelector("h3")?.textContent || card.dataset.name || "").trim().toLowerCase();
  }

  function laneListFor(card) {
    const stored = (card.dataset.ntLanes || "").trim();
    if (stored) return stored.split(/\s+/).filter(Boolean);
    const name = cardName(card);
    const hits = [];
    Object.entries(CATALOGUE_ASSIGNMENTS).forEach(([lane, names]) => {
      if (names.includes(name)) hits.push(lane);
    });
    if (!hits.length) {
      const tags = (card.dataset.tags || "").toLowerCase();
      if (tags.includes("prepper")) hits.push("prepper");
      else if (tags.includes("market") || tags.includes("finance")) hits.push("market");
      else if (tags.includes("signal") || tags.includes("monitor")) hits.push("signal");
      else if (tags.includes("fun") || tags.includes("zodiac") || tags.includes("tarot")) hits.push("fun");
      else if (tags.includes("developer") || tags.includes("pdf") || tags.includes("image") || tags.includes("text") || tags.includes("qr")) hits.push("work");
      else hits.push("utility");
    }
    return Array.from(new Set(hits));
  }

  function normalizeCatalogueLanes() {
    cards().forEach(card => {
      const lanes = laneListFor(card);
      card.dataset.ntLane = lanes[0] || "utility";
      card.dataset.ntLanes = lanes.join(" ");
      const tags = new Set((card.dataset.tags || "").toLowerCase().split(/\s+/).filter(Boolean));
      lanes.forEach(lane => tags.add(lane));
      card.dataset.tags = Array.from(tags).join(" ");
    });
  }

  function matchesFilter(card, filter) {
    if (!filter || filter === "all") return true;
    if (filter === "free") return cardTags(card).includes("free");
    if (LANE_FILTERS.has(filter)) return laneListFor(card).includes(filter);
    return cardTags(card).includes(filter);
  }

  function matchesQuery(card, query) {
    if (!query) return true;
    const hay = cardTags(card);
    return query.split(/\s+/).every(part => hay.includes(part));
  }

  function smartApplyLibraryFilters() {
    normalizeCatalogueLanes();
    const q = (document.getElementById("q")?.value || "").toLowerCase().trim();
    const filter = activeFilter();
    cards().forEach(card => {
      card.classList.toggle("hidden", !(matchesFilter(card, filter) && matchesQuery(card, q)));
    });
    syncCount();
  }

  function countFor(filter) {
    normalizeCatalogueLanes();
    return cards().filter(card => matchesFilter(card, filter)).length;
  }

  function visibleCount() {
    return cards().filter(card => !card.classList.contains("hidden")).length;
  }

  function setActiveMission() {
    const current = activeFilter();
    document.querySelectorAll("[data-nt-mission-filter]").forEach(card => {
      card.classList.toggle("is-active", card.dataset.ntMissionFilter === current);
    });
  }

  const FILTER_LABELS = {
    all: "all tools",
    market: "Market Tools lane",
    signal: "Command Center lane",
    prepper: "Preparedness lane",
    work: "Work Tools lane",
    utility: "Everyday Utilities lane",
    fun: "Fun Lab lane",
    indie: "Indie Developers lane"
  };

  function syncCount() {
    const filter = activeFilter();
    document.body.classList.toggle("nt-market-library-mode", filter === "market");

    const box = document.getElementById("ntLibraryCount");
    if (box) {
      const total = cards().length;
      const visible = visibleCount();
      const label = FILTER_LABELS[filter] || `${filter} lane`;
      box.textContent = `${visible}/${total} showing · ${label}`;
    }

    const marketLane = document.getElementById("ntMarketLane");
    if (marketLane) marketLane.hidden = filter !== "market";
    const indieLane = document.getElementById("ntIndieLane");
    if (indieLane) indieLane.hidden = filter !== "indie";
    setActiveMission();
  }

  function activateFilter(filterName) {
    const chip = document.querySelector(".chip[data-f=\"" + filterName + "\"]");
    if (chip) {
      document.querySelectorAll(".chip").forEach(item => item.classList.remove("on"));
      chip.classList.add("on");
    }
    const url = new URL(window.location.href);
    if (filterName && filterName !== "all") url.searchParams.set("filter", filterName);
    else url.searchParams.delete("filter");
    window.history.replaceState({}, "", url);
    smartApplyLibraryFilters();
  }

  function enhanceFilters() {
    const filters = document.getElementById("filters");
    if (!filters) return;
    filters.classList.add("nt-phase2-filters");
    filters.setAttribute("aria-label", "Library quick filters");
    document.querySelectorAll(".chip").forEach(chip => {
      const filterName = chip.dataset.f || "all";
      const label = chip.textContent.trim().replace(/\d+$/, "").trim();
      const count = countFor(filterName);
      chip.setAttribute("role", "button");
      chip.setAttribute("tabindex", "0");
      chip.innerHTML = `<span>${esc(label)}</span><b>${count}</b>`;
      chip.addEventListener("keydown", event => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          chip.click();
        }
      });
    });
  }


  function renderMarketLane() {
    const libraryHead = document.querySelector(".library-head");
    const search = document.querySelector(".library-search");
    if (!libraryHead || document.getElementById("ntMarketLane")) return;
    const anchor = search || libraryHead.nextElementSibling;
    const byTitle = new Map(MARKET_TOOLS.map(tool => [tool.title, tool]));
    const routes = [
      {
        title: "Market Positioning Radar",
        display: "Long/Short Positioning",
        number: "01",
        question: "Who is crowded long or short?",
        decision: "Use this before reading market direction. It shows squeeze and unwind risk across ETFs, crypto and commodities.",
        scope: ["SPY / QQQ", "BTC / ETH", "Gold, silver, oil, coffee"],
        cta: "Open positioning"
      },
      {
        title: "Market Volume Pulse",
        display: "Market Volume Pulse",
        number: "02",
        question: "What is getting unusual attention?",
        decision: "Use this for current tape pressure, high-volume stocks, ETF participation and unusual trading activity.",
        scope: ["Most traded stocks", "ETF activity", "Attention spikes"],
        cta: "Open volume"
      },
      {
        title: "Crypto Pulse",
        display: "Crypto Network Pulse",
        number: "03",
        question: "Are BTC or ETH rails stressed?",
        decision: "Use this before moving crypto. It focuses on fees, gas, mempool pressure and public network activity.",
        scope: ["BTC fees", "ETH gas", "Network congestion"],
        cta: "Open crypto"
      }
    ].map(route => ({ ...(byTitle.get(route.title) || {}), ...route })).filter(tool => tool.url);
    const helpers = MARKET_TOOLS.filter(tool => !tool.core);
    const section = document.createElement("section");
    section.id = "ntMarketLane";
    section.className = "nt-market-lane";
    section.hidden = true;
    section.innerHTML = `
      <div class="nt-market-shell">
        <div class="nt-market-hero">
          <div>
            <div class="nt-library-eyebrow">Market Tools</div>
            <h2>Pick the market question first.</h2>
            <p>Three market screens, three jobs. Start with the decision you are trying to make, then open the right board.</p>
          </div>
          <div class="nt-market-quick-read" aria-label="Market tools summary">
            <span><b>3</b> core boards</span>
            <span><b>6+</b> markets covered</span>
            <span><b>0</b> source health clutter</span>
          </div>
        </div>

        <div class="nt-market-router" aria-label="Choose a market tool">
          ${routes.map(tool => `
            <a class="nt-market-card ${tool.number === "01" ? "is-primary" : ""}" href="${esc(tool.url)}">
              <span class="nt-market-card-top">
                <b>${esc(tool.number)}</b>
                <em>${esc(tool.badge || "Market tool")}</em>
              </span>
              <strong>${esc(tool.display)}</strong>
              <span class="nt-market-question">${esc(tool.question)}</span>
              <small>${esc(tool.decision)}</small>
              <span class="nt-market-scope">
                ${tool.scope.map(item => `<i>${esc(item)}</i>`).join("")}
              </span>
              <span class="nt-market-open">${esc(tool.cta)} -&gt;</span>
            </a>
          `).join("")}
        </div>

        <div class="nt-market-bottom">
          <details class="nt-market-secondary">
            <summary>Finance helpers <span>${helpers.length} calculators</span></summary>
            <div class="nt-market-helper-grid">
              ${helpers.map(tool => `
                <a class="nt-market-helper" href="${esc(tool.url)}">
                  <span>${esc(tool.badge)}</span>
                  <strong>${esc(tool.title)}</strong>
                  <small>${esc(tool.desc)}</small>
                </a>
              `).join("")}
            </div>
          </details>
          <a class="nt-market-all" href="/library.html">Open full library</a>
        </div>
      </div>
    `;
    libraryHead.parentNode.insertBefore(section, anchor);
  }

  function renderIndieLane() {
    const libraryHead = document.querySelector(".library-head");
    const search = document.querySelector(".library-search");
    if (!libraryHead || document.getElementById("ntIndieLane")) return;
    const anchor = search || libraryHead.nextElementSibling;
    const section = document.createElement("section");
    section.id = "ntIndieLane";
    section.className = "nt-indie-lane";
    section.hidden = true;
    section.innerHTML =
      '<div class="nt-library-eyebrow">Indie Developers</div>' +
      '<h2>Founder tools are queued.</h2>' +
      '<p>This lane is intentionally empty for now. Planned tools: launch checklist, pricing sanity check, changelog builder, landing-page teardown, waitlist copy helper and uptime/status page starter.</p>' +
      '<a href="/library.html" class="nt-market-all">Back to all tools</a>';
    libraryHead.parentNode.insertBefore(section, anchor);
  }

  function renderOrientation() {
    const libraryHead = document.querySelector(".library-head");
    const search = document.querySelector(".library-search");
    if (!libraryHead || document.getElementById("ntLibraryOrient")) return;
    const anchor = search || libraryHead.nextElementSibling;
    const section = document.createElement("section");
    section.id = "ntLibraryOrient";
    section.className = "nt-library-orient";
    section.innerHTML = `
      <div class="nt-library-orient-head">
        <div>
          <div class="nt-library-eyebrow">Product lanes</div>
          <h2>Pick a lane before searching.</h2>
          <p>The full toolbox is still here. This layer makes the big product systems obvious first, then lets users drop into the smaller utilities without scrolling a wall of cards.</p>
        </div>
        <div class="nt-library-count" id="ntLibraryCount" aria-live="polite">Loading tools</div>
      </div>
      <div class="nt-mission-grid">
        ${MISSIONS.map(mission => `
          <button class="nt-mission-card" type="button" data-nt-mission-filter="${esc(mission.filter)}">
            <span>
              <span class="nt-mission-kicker">${esc(mission.label)} <b>${countFor(mission.filter)}</b></span>
              <span class="nt-mission-title">${esc(mission.title)}</span>
              <span class="nt-mission-desc">${esc(mission.description)}</span>
            </span>
            <span class="nt-mission-action">Show lane -&gt;</span>
          </button>
        `).join("")}
      </div>
      <div class="nt-starter-rail">
        <div class="nt-starter-copy">
          <strong>Recommended starting points</strong>
          <span>These routes carry the product. Everything else stays reachable in the secondary library.</span>
        </div>
        <div class="nt-starter-links">
          ${STARTERS.map(([name, url, label]) => `
            <a class="nt-starter-link" href="${esc(url)}">
              ${esc(name)}
              <small>${esc(label)}</small>
            </a>
          `).join("")}
        </div>
      </div>
    `;
    libraryHead.parentNode.insertBefore(section, anchor);
  }

  function markPriorityTools() {
    cards().forEach(card => {
      const name = (card.querySelector("h3")?.textContent || card.dataset.name || "").trim().toLowerCase();
      const tags = cardTags(card);
      if (PRIORITY_NAMES.has(name) || tags.includes("monitor signal") || tags.includes("prepper")) {
        card.classList.add("nt-priority-tool");
      }
    });
    const grid = document.getElementById("grid");
    if (grid) grid.classList.add("nt-grid-has-filter");
  }

  function bindMissionCards() {
    document.addEventListener("click", event => {
      const mission = event.target.closest("[data-nt-mission-filter]");
      if (!mission) return;
      event.preventDefault();
      activateFilter(mission.dataset.ntMissionFilter || "all");
      const grid = document.getElementById("grid");
      if (grid) grid.scrollIntoView({ behavior: "smooth", block: "start" });
      if (window.ntTrack) {
        window.ntTrack("library_lane_select", {
          lane: mission.dataset.ntMissionFilter || "all",
          surface: "phase2_library"
        });
      }
    });
  }

  function wrapExistingFilter() {
    if (typeof window.applyLibraryFilters === "function" && !window.applyLibraryFilters.__ntSmartWrapped) {
      window.applyLibraryFilters = smartApplyLibraryFilters;
      window.applyLibraryFilters.__ntSmartWrapped = true;
    }
    if (typeof window.filter === "function" && !window.filter.__ntSmartWrapped) {
      window.filter = function (chip) {
        if (!chip) return;
        activateFilter(chip.dataset.f || "all");
        if (window.ntTrack) {
          window.ntTrack("tool_action", { tool: "Library", action: "filter", filter: chip.dataset.f || "all" });
        }
      };
      window.filter.__ntSmartWrapped = true;
    }
    window.search = function () {
      smartApplyLibraryFilters();
      const q = document.getElementById("q")?.value.toLowerCase().trim();
      if (q && window.ntTrack) window.ntTrack("search", { tool: "Library", query: q });
    };
    window.clearSearch = function () {
      const q = document.getElementById("q");
      if (q) {
        q.value = "";
        smartApplyLibraryFilters();
        q.focus();
      }
    };
  }

  function init() {
    if (!document.querySelector(".tool-library")) return;
    normalizeCatalogueLanes();
    wrapExistingFilter();
    renderOrientation();
    renderMarketLane();
    renderIndieLane();
    enhanceFilters();
    markPriorityTools();
    bindMissionCards();
    smartApplyLibraryFilters();
    syncCount();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();
