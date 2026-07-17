(function () {
  "use strict";

  if (window.__niftyLibraryHierarchy) return;
  window.__niftyLibraryHierarchy = true;

  const MISSIONS = [
    {
      id: "signal",
      title: "Signal Suite",
      filter: "signal",
      label: "Flagship",
      description: "Radars, live signals, daily reads and public OSINT-style context."
    },
    {
      id: "prepper",
      title: "Prepper + Local Risk",
      filter: "prepper",
      label: "Preparedness",
      description: "Household readiness, local risk scanning, checklists and practical plans."
    },
    {
      id: "market",
      title: "Market Tools",
      filter: "market",
      label: "Markets",
      description: "Crypto Pulse, Stock Volume Pulse and Shorts vs Longs first. Finance calculators stay secondary."
    },
    {
      id: "utility",
      title: "Work Tools",
      filter: "utility",
      label: "Production",
      description: "PDFs, images, QR, developer tools, text cleanup and business docs."
    },
    {
      id: "fun",
      title: "Fun Lab",
      filter: "fun",
      label: "Play",
      description: "Tarot, astrology, randomizers, fake terminals and lightweight experiments."
    }
  ];

  const STARTERS = [
    ["Signal Suite Hub", "/signal-suite.html", "flagship"],
    ["Crypto Pulse", "/crypto-pulse.html", "crypto network"],
    ["Stock Volume Pulse", "/market-volume-pulse.html", "stocks volume"],
    ["Shorts vs Longs", "/positioning-radar.html", "positioning"],
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
      title: "Stock Volume Pulse",
      url: "/market-volume-pulse.html",
      badge: "Stocks volume",
      desc: "Most-traded stocks, ETF activity, volume leaders and attention spikes.",
      core: true
    },
    {
      title: "Shorts vs Longs",
      url: "/positioning-radar.html",
      badge: "Positioning",
      desc: "Long/short crowding for SPY, QQQ, BTC, ETH, gold, silver, oil and coffee.",
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

  function countFor(filter) {
    if (filter === "all") return cards().length;
    return cards().filter(card => (card.dataset.tags || "").toLowerCase().includes(filter)).length;
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
    signal: "Signal Suite lane",
    prepper: "Prepper lane",
    utility: "Work Tools lane",
    fun: "Fun Lab lane"
  };

  function syncCount() {
    const box = document.getElementById("ntLibraryCount");
    if (!box) return;
    const total = cards().length;
    const visible = visibleCount();
    const filter = activeFilter();
    const label = FILTER_LABELS[filter] || `${filter} lane`;
    box.textContent = `${visible}/${total} showing · ${label}`;
    const marketLane = document.getElementById("ntMarketLane");
    if (marketLane) marketLane.hidden = !(filter === "all" || filter === "market");
    setActiveMission();
  }

  function activateFilter(filterName) {
    const chip = document.querySelector(`.chip[data-f="${filterName}"]`);
    if (chip && typeof window.filter === "function") {
      window.filter(chip);
    } else if (chip) {
      document.querySelectorAll(".chip").forEach(item => item.classList.remove("on"));
      chip.classList.add("on");
      if (typeof window.applyLibraryFilters === "function") window.applyLibraryFilters();
    }
    const url = new URL(window.location.href);
    if (filterName && filterName !== "all") url.searchParams.set("filter", filterName);
    else url.searchParams.delete("filter");
    window.history.replaceState({}, "", url);
    syncCount();
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
    const core = MARKET_TOOLS.filter(tool => tool.core);
    const helpers = MARKET_TOOLS.filter(tool => !tool.core);
    const section = document.createElement("section");
    section.id = "ntMarketLane";
    section.className = "nt-market-lane";
    section.innerHTML = `
      <div class="nt-market-lane-head">
        <div>
          <div class="nt-library-eyebrow">Market Tools lane</div>
          <h2>Crypto, stocks and shorts vs longs.</h2>
          <p>Open the exact market screen first. Finance calculators stay available as helpers, not as the main market product.</p>
        </div>
        <a class="nt-market-all" href="/library.html?filter=market">All market tools</a>
      </div>
      <div class="nt-market-core">
        ${core.map(tool => `
          <a class="nt-market-card is-core" href="${esc(tool.url)}">
            <span>${esc(tool.badge)}</span>
            <strong>${esc(tool.title)}</strong>
            <small>${esc(tool.desc)}</small>
            <b>Open tool -&gt;</b>
          </a>
        `).join("")}
      </div>
      <details class="nt-market-secondary">
        <summary>Finance helpers <span>${helpers.length} tools</span></summary>
        <div class="nt-market-helper-grid">
          ${helpers.map(tool => `
            <a class="nt-market-card" href="${esc(tool.url)}">
              <span>${esc(tool.badge)}</span>
              <strong>${esc(tool.title)}</strong>
              <small>${esc(tool.desc)}</small>
            </a>
          `).join("")}
        </div>
      </details>
    `;
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
    if (typeof window.applyLibraryFilters === "function" && !window.applyLibraryFilters.__ntWrapped) {
      const original = window.applyLibraryFilters;
      window.applyLibraryFilters = function () {
        const result = original.apply(this, arguments);
        syncCount();
        return result;
      };
      window.applyLibraryFilters.__ntWrapped = true;
    }
    if (typeof window.filter === "function" && !window.filter.__ntWrapped) {
      const originalFilter = window.filter;
      window.filter = function (chip) {
        const result = originalFilter.apply(this, arguments);
        if (chip && chip.dataset && chip.dataset.f) {
          const url = new URL(window.location.href);
          if (chip.dataset.f === "all") url.searchParams.delete("filter");
          else url.searchParams.set("filter", chip.dataset.f);
          window.history.replaceState({}, "", url);
        }
        syncCount();
        return result;
      };
      window.filter.__ntWrapped = true;
    }
  }

  function init() {
    if (!document.querySelector(".tool-library")) return;
    renderOrientation();
    renderMarketLane();
    enhanceFilters();
    markPriorityTools();
    bindMissionCards();
    wrapExistingFilter();
    syncCount();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();
