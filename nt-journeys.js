(function () {
  "use strict";

  if (window.__niftyJourneys) return;
  window.__niftyJourneys = true;

  const JOURNEYS = [
    {
      id: "daily",
      code: "BRIEF",
      title: "Daily risk read",
      time: "3 min",
      description: "Start with one practical briefing across weather, air, outages, food, cyber, conflict and markets.",
      url: "/personal-risk.html",
      steps: [["01", "Personal Risk"], ["02", "Command Queue"], ["03", "Prepper Command"]]
    },
    {
      id: "signals",
      code: "RADAR",
      title: "Watch the internet",
      time: "5 min",
      description: "Check weird broad signals: early warning, outages, cyber pressure, food, aurora and meme drift.",
      url: "/signal-suite.html",
      steps: [["01", "Signal Suite"], ["02", "Outage Radar"], ["03", "Early Warning"]]
    },
    {
      id: "prepper",
      code: "PREP",
      title: "Prep today",
      time: "8 min",
      description: "Turn household readiness into concrete water, food, power, go-bag and communication checks.",
      url: "/prepper-command.html",
      steps: [["01", "Prepper Command"], ["02", "Prepper Toolkit"], ["03", "Food Watch"]]
    },
    {
      id: "markets",
      code: "MKT",
      title: "Market pulse",
      time: "4 min",
      description: "Open volume leaders, crowding and crypto network pressure without treating delayed data as live tape.",
      url: "/market-volume-pulse.html",
      steps: [["01", "Volume Pulse"], ["02", "Positioning"], ["03", "Crypto Pulse"]]
    },
    {
      id: "work",
      code: "WORK",
      title: "Fix a file",
      time: "2 min",
      description: "Jump straight into images, PDFs, receipts, QR codes, developer helpers and business documents.",
      url: "/library.html?filter=utility",
      steps: [["01", "Image Tools"], ["02", "PDF Toolkit"], ["03", "QR / Docs"]]
    },
    {
      id: "fun",
      code: "FUN",
      title: "Fun lab",
      time: "1 min",
      description: "Low-stakes weird internet toys: tarot, zodiac, randomizers, fake hacker and meme watch.",
      url: "/library.html?filter=fun",
      steps: [["01", "Tarot"], ["02", "Zodiac"], ["03", "Randomizers"]]
    }
  ];

  const NEXT = {
    "/signal-suite.html": {
      title: "Run a signal loop",
      copy: "Pick one route depending on what you are checking right now.",
      actions: [
        ["Daily Brief", "/personal-risk.html", "One read across the whole stack."],
        ["Early Warning", "/signal-watch.html", "Global and local anomaly radar."],
        ["Command Queue", "/command-queue.html", "Turn signal into action."]
      ]
    },
    "/personal-risk.html": {
      title: "After the brief",
      copy: "The useful output is the next action, not the score by itself.",
      actions: [
        ["Command Queue", "/command-queue.html", "Save actions and notes."],
        ["Prepper Command", "/prepper-command.html", "Check household readiness."],
        ["Early Warning", "/signal-watch.html", "Inspect wider signals."]
      ]
    },
    "/command-queue.html": {
      title: "Feed the queue",
      copy: "Use the queue after a scan or before a prep session.",
      actions: [
        ["Personal Risk", "/personal-risk.html", "Generate today’s read."],
        ["Prepper Tools", "/prepper-tools.html", "Calculate supplies."],
        ["Signal Suite", "/signal-suite.html", "Return to radar shelf."]
      ]
    },
    "/signal-watch.html": {
      title: "From radar to action",
      copy: "If a lane is elevated, verify the source and move to a specific workflow.",
      actions: [
        ["Personal Risk", "/personal-risk.html", "Localize the read."],
        ["Outage Radar", "/outage-radar.html", "Check internet/weather layer."],
        ["Command Queue", "/command-queue.html", "Create action items."]
      ]
    },
    "/outage-radar.html": {
      title: "Diagnose an outage",
      copy: "Separate platform trouble from your own network, then decide whether to wait or work around it.",
      actions: [
        ["Cyber Radar", "/cyber-threat.html", "Check cyber pressure context."],
        ["Early Warning", "/signal-watch.html", "See broader anomaly stack."],
        ["Command Queue", "/command-queue.html", "Track incident notes."]
      ]
    },
    "/cyber-threat.html": {
      title: "Cyber context",
      copy: "Public cyber signals are context. Use them to prioritize attention, not as attribution.",
      actions: [
        ["Outage Radar", "/outage-radar.html", "Check service health."],
        ["AI Panic Meter", "/ai-panic.html", "Monitor AI/platform spikes."],
        ["Signal Suite", "/signal-suite.html", "Return to signal shelf."]
      ]
    },
    "/food-watch.html": {
      title: "Food signal route",
      copy: "Use recall and commodity pressure as a prompt to inspect your own pantry.",
      actions: [
        ["Prepper Command", "/prepper-command.html", "Open household plan."],
        ["Prepper Toolkit", "/prepper-tools.html", "Calculate supplies."],
        ["Personal Risk", "/personal-risk.html", "Fold into daily brief."]
      ]
    },
    "/aurora-watch.html": {
      title: "Sky watch route",
      copy: "If the aurora read is strong, verify cloud cover and local visibility before traveling.",
      actions: [
        ["Early Warning", "/signal-watch.html", "Check space weather context."],
        ["Personal Risk", "/personal-risk.html", "Check local weather friction."],
        ["Signal Suite", "/signal-suite.html", "Return to command center."]
      ]
    },
    "/meme-watch.html": {
      title: "Trend route",
      copy: "Use this as cultural smoke. Verify with search and avoid over-reading one surface.",
      actions: [
        ["AI Panic Meter", "/ai-panic.html", "AI/platform trend context."],
        ["Signal Suite", "/signal-suite.html", "Return to command center."],
        ["Fun Lab", "/library.html?filter=fun", "Open playful tools."]
      ]
    },
    "/crypto-pulse.html": {
      title: "Crypto route",
      copy: "Read network stress together with market participation and positioning.",
      actions: [
        ["Volume Pulse", "/market-volume-pulse.html", "See participation."],
        ["Positioning", "/positioning-radar.html", "Check crowding."],
        ["Outage Radar", "/outage-radar.html", "Check provider trouble."]
      ]
    },
    "/market-volume-pulse.html": {
      title: "Market route",
      copy: "Volume tells you what people are touching; positioning tells you how crowded it may be.",
      actions: [
        ["Positioning", "/positioning-radar.html", "Open crowding read."],
        ["Crypto Pulse", "/crypto-pulse.html", "Check chain pressure."],
        ["Market Library", "/library.html?filter=market", "See all market tools."]
      ]
    },
    "/positioning-radar.html": {
      title: "Positioning route",
      copy: "Delayed positioning is useful for crowding context, not minute-by-minute trading.",
      actions: [
        ["Volume Pulse", "/market-volume-pulse.html", "Check current participation."],
        ["Crypto Pulse", "/crypto-pulse.html", "Check BTC/ETH stress."],
        ["Market Library", "/library.html?filter=market", "Open market lane."]
      ]
    },
    "/prepper-command.html": {
      title: "Prepper route",
      copy: "Start with the household view, then drill into calculators and risk signals.",
      actions: [
        ["Prepper Toolkit", "/prepper-tools.html", "Calculate supplies."],
        ["Prepper Risk", "/prepper-risk.html", "Scan local friction."],
        ["Food Watch", "/food-watch.html", "Check recall context."]
      ]
    },
    "/prepper-tools.html": {
      title: "Planner route",
      copy: "Calculators are useful after you know the scenario and household size.",
      actions: [
        ["Prepper Command", "/prepper-command.html", "Return to command view."],
        ["Personal Risk", "/personal-risk.html", "Run today’s local read."],
        ["Food Watch", "/food-watch.html", "Check recall context."]
      ]
    },
    "/prepper-risk.html": {
      title: "Local risk route",
      copy: "Turn the local scan into a checklist, then update supplies if needed.",
      actions: [
        ["Prepper Command", "/prepper-command.html", "Open household plan."],
        ["Command Queue", "/command-queue.html", "Save action items."],
        ["Early Warning", "/signal-watch.html", "Compare global/local read."]
      ]
    },
    "/image-tools.html": {
      title: "File workflow",
      copy: "Image work usually pairs with documents, QR codes and file organization.",
      actions: [
        ["PDF Toolkit", "/pdf-tools.html", "Build or merge PDFs."],
        ["File Organizer", "/file-organizer.html", "Sort downloads."],
        ["QR Toolkit", "/qr-tools.html", "Create codes."]
      ]
    },
    "/pdf-tools.html": {
      title: "Document workflow",
      copy: "After PDF work, generate receipts, business docs or QR links.",
      actions: [
        ["Business Docs", "/business-docs.html", "Create docs."],
        ["Receipt Generator", "/receipt-tools.html", "Make receipts."],
        ["Image Toolkit", "/image-tools.html", "Process images."]
      ]
    },
    "/library.html": {
      title: "Library route",
      copy: "Choose a mission first, then search inside that lane if needed.",
      actions: [
        ["Signals", "/signal-suite.html", "Flagship command shelf."],
        ["Prepper", "/prepper-command.html", "Household readiness."],
        ["Work Tools", "/library.html?filter=utility", "Files and utilities."]
      ]
    }
  };

  const HUB_PAGES = new Set(["/", "/index.html", "/library.html"]);

  function esc(value) {
    return String(value == null ? "" : value).replace(/[&<>"']/g, function (ch) {
      return ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" })[ch];
    });
  }

  function path() {
    let p = window.location.pathname || "/";
    if (p.length > 1 && p.endsWith("/")) p = p.slice(0, -1);
    return p || "/";
  }

  function track(name, props) {
    try {
      if (window.ntTrack) window.ntTrack(name, props || {});
    } catch (_err) {}
  }

  function journeyCard(journey) {
    return [
      '<a class="nt-journey-card" href="' + esc(journey.url) + '" data-nt-journey="' + esc(journey.id) + '">',
      '<div class="nt-journey-kicker"><span class="nt-journey-code">' + esc(journey.code) + '</span><span class="nt-journey-time">' + esc(journey.time) + '</span></div>',
      '<h3>' + esc(journey.title) + '</h3>',
      '<p>' + esc(journey.description) + '</p>',
      '<div class="nt-journey-steps">' + journey.steps.map(function (step) {
        return '<span class="nt-journey-step"><b>' + esc(step[0]) + '</b>' + esc(step[1]) + '</span>';
      }).join("") + '</div>',
      '<span class="nt-journey-open">Start route -></span>',
      '</a>'
    ].join("");
  }

  function insertJourneyHub() {
    if (document.querySelector("[data-nt-journeys]")) return;
    const isLibrary = path() === "/library.html";
    const section = document.createElement("section");
    section.className = "nt-journeys" + (isLibrary ? " nt-journey-compact" : "");
    section.setAttribute("data-nt-journeys", "");
    section.innerHTML = [
      '<div class="nt-journey-panel">',
      '<div class="nt-journey-head">',
      '<h2>' + (isLibrary ? "Start From A Route" : "Choose Your Route") + '</h2>',
      '<p>' + (isLibrary ? "The full library is large. These routes narrow the first click before you search." : "Most visitors do not need every tool. Start with the mission, then drill into the exact utility.") + '</p>',
      '</div>',
      '<div class="nt-journey-grid">' + JOURNEYS.map(journeyCard).join("") + '</div>',
      '</div>'
    ].join("");

    const anchor = isLibrary
      ? document.querySelector(".hero, .library-hero, header")
      : document.querySelector(".hero, header");

    if (anchor && anchor.parentNode) {
      anchor.insertAdjacentElement(anchor.matches("header") ? "afterend" : "afterend", section);
    } else {
      document.body.insertBefore(section, document.body.firstChild);
    }

    section.addEventListener("click", function (event) {
      const card = event.target.closest("[data-nt-journey]");
      if (!card) return;
      try { localStorage.setItem("nt:lastJourney", card.getAttribute("data-nt-journey")); } catch (_err) {}
      track("journey_start", { journey: card.getAttribute("data-nt-journey"), page: path() });
    });
  }

  function insertNextSteps() {
    const current = path();
    const data = NEXT[current];
    if (!data || document.querySelector("[data-nt-next-steps]")) return;

    const section = document.createElement("section");
    section.className = "nt-next-steps";
    section.setAttribute("data-nt-next-steps", "");
    section.innerHTML = [
      '<div class="nt-next-panel">',
      '<div class="nt-next-head"><h2>' + esc(data.title) + '</h2><p>' + esc(data.copy) + '</p></div>',
      '<div class="nt-next-grid">',
      data.actions.map(function (item, index) {
        return '<a class="nt-next-card" href="' + esc(item[1]) + '" data-nt-next="' + esc(item[0]) + '"><span>Next ' + String(index + 1).padStart(2, "0") + '</span><b>' + esc(item[0]) + '</b><small>' + esc(item[2]) + '</small></a>';
      }).join(""),
      '</div>',
      '</div>'
    ].join("");

    const anchor = document.querySelector("[data-nt-quality-rail]") || document.querySelector(".nt-quality-rail") || document.querySelector("[data-nt-tool-context]") || document.querySelector(".nt-tool-context") || document.querySelector("header");
    if (anchor && anchor.parentNode) {
      anchor.insertAdjacentElement(anchor.matches("header") ? "afterend" : "afterend", section);
    } else {
      document.body.insertBefore(section, document.body.firstChild);
    }

    section.addEventListener("click", function (event) {
      const card = event.target.closest("[data-nt-next]");
      if (!card) return;
      track("next_step_click", { label: card.getAttribute("data-nt-next"), page: current });
    });
  }

  function init() {
    const current = path();
    if (HUB_PAGES.has(current)) insertJourneyHub();
    insertNextSteps();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();
