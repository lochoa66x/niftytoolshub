(function () {
  "use strict";

  if (window.__niftyToolContext) return;
  window.__niftyToolContext = true;

  const TOOLS = {
    "/signal-suite.html": {
      lane: "Command Center",
      title: "Command Center",
      status: "Mixed",
      use: "Start here when you want the strongest signal tools without browsing the full library.",
      source: "Grouped public feeds, local browser events and source-quality labels.",
      action: ["Start Personal Briefing", "/personal-risk.html"],
      related: [["Early Warning Radar", "/signal-watch.html"], ["Outage Radar", "/outage-radar.html"], ["Prepper Command", "/prepper-command.html"]]
    },
    "/personal-risk.html": {
      lane: "Command Center",
      title: "Personal Risk Briefing",
      status: "Mixed",
      use: "Best daily entry point for turning multiple signals into one local read.",
      source: "Weather, air, food, cyber, market, outage and conflict context where available.",
      action: ["Open Command Queue", "/command-queue.html"],
      related: [["Prepper Risk", "/prepper-risk.html"], ["Early Warning Radar", "/signal-watch.html"], ["Food Watch", "/food-watch.html"]]
    },
    "/command-queue.html": {
      lane: "Command Center",
      title: "Command Queue",
      status: "Local",
      use: "Turn radar reads into actions, notes, checklists and an audit trail.",
      source: "Local browser state. No account required.",
      action: ["Open Personal Briefing", "/personal-risk.html"],
      related: [["Command Center", "/signal-suite.html"], ["Prepper Command", "/prepper-command.html"], ["Prepper Toolkit", "/prepper-tools.html"]]
    },
    "/signal-watch.html": {
      lane: "Command Center",
      title: "Early Warning Radar",
      status: "Mixed",
      use: "Broad anomaly scan for space weather, quakes, outages, conflict spillover, market stress and air quality.",
      source: "Live public feeds where possible, plus context and backup layers when feeds are slow.",
      action: ["Run Personal Briefing", "/personal-risk.html"],
      related: [["Outage Radar", "/outage-radar.html"], ["Cyber Threat Radar", "/cyber-threat.html"], ["Food Watch", "/food-watch.html"]]
    },
    "/aurora-watch.html": {
      lane: "Command Center",
      title: "Aurora Watch",
      status: "Live",
      use: "Check whether northern lights are worth chasing tonight from your location.",
      source: "NOAA space-weather signals plus sky and moonlight context.",
      action: ["Open Early Warning Radar", "/signal-watch.html"],
      related: [["Personal Risk", "/personal-risk.html"], ["Command Center", "/signal-suite.html"], ["Weather context", "/signal-watch.html"]]
    },
    "/outage-radar.html": {
      lane: "Command Center",
      title: "Outage Radar",
      status: "Mixed",
      use: "Quickly separate app/cloud/provider trouble from your own local connection.",
      source: "Official status pages, browser reachability checks and regional context.",
      action: ["Check Early Warning Radar", "/signal-watch.html"],
      related: [["Cyber Threat Radar", "/cyber-threat.html"], ["Command Queue", "/command-queue.html"], ["Crypto Pulse", "/crypto-pulse.html"]]
    },
    "/cyber-threat.html": {
      lane: "Command Center",
      title: "Cyber Threat Radar",
      status: "Mixed",
      use: "Public cyber-signal view for exploit pressure, attack-map style events and vulnerability context.",
      source: "Public security feeds with demo visualization fallback where access is limited.",
      action: ["Open Outage Radar", "/outage-radar.html"],
      related: [["Early Warning Radar", "/signal-watch.html"], ["Command Queue", "/command-queue.html"], ["AI Panic Meter", "/ai-panic.html"]]
    },
    "/food-watch.html": {
      lane: "Command Center",
      title: "Food Watch",
      status: "Mixed",
      use: "Track recalls and food/commodity pressure as preparedness context.",
      source: "Recall feeds where available, plus reference pressure rows and backup context.",
      action: ["Open Prepper Command", "/prepper-command.html"],
      related: [["Prepper Toolkit", "/prepper-tools.html"], ["Personal Risk", "/personal-risk.html"], ["Early Warning Radar", "/signal-watch.html"]]
    },
    "/meme-watch.html": {
      lane: "Command Center",
      title: "Meme Watch",
      status: "Context",
      use: "Early cultural trend smoke detector, not a full social-media firehose.",
      source: "Public attention proxies and trend references.",
      action: ["Open Command Center", "/signal-suite.html"],
      related: [["AI Panic Meter", "/ai-panic.html"], ["Early Warning Radar", "/signal-watch.html"], ["Library", "/library.html?filter=fun"]]
    },
    "/crypto-pulse.html": {
      lane: "Markets",
      title: "Crypto Pulse",
      status: "Mixed",
      use: "BTC/ETH network stress, fee pressure and market context in one view.",
      source: "Public chain probes, market references and fallback context where APIs are limited.",
      action: ["Open Positioning Radar", "/positioning-radar.html"],
      related: [["Market Volume Pulse", "/market-volume-pulse.html"], ["Outage Radar", "/outage-radar.html"], ["Command Center", "/signal-suite.html"]]
    },
    "/market-volume-pulse.html": {
      lane: "Markets",
      title: "Market Volume Pulse",
      status: "Delayed",
      use: "Spot participation and volume leaders before opening deeper market tools.",
      source: "Delayed public market data and reference rows.",
      action: ["Open Positioning Radar", "/positioning-radar.html"],
      related: [["Crypto Pulse", "/crypto-pulse.html"], ["Salary Tools", "/salary-tools.html"], ["Library Markets", "/library.html?filter=market"]]
    },
    "/positioning-radar.html": {
      lane: "Markets",
      title: "Market Positioning Radar",
      status: "Delayed",
      use: "Long/short crowding context for futures, ETFs, BTC and ETH.",
      source: "Delayed CFTC/FINRA/market-positioning references and exchange-specific fallbacks.",
      action: ["Open Market Volume Pulse", "/market-volume-pulse.html"],
      related: [["Crypto Pulse", "/crypto-pulse.html"], ["Market Library", "/library.html?filter=market"], ["Command Center", "/signal-suite.html"]]
    },
    "/prepper-command.html": {
      lane: "Prepper",
      title: "Prepper Command Center",
      status: "Local",
      use: "Household readiness planning for water, food, power, go-bags, contacts and smoke days.",
      source: "Local browser calculations and checklist state.",
      action: ["Open Prepper Risk Scanner", "/prepper-risk.html"],
      related: [["Prepper Toolkit", "/prepper-tools.html"], ["Personal Risk", "/personal-risk.html"], ["Food Watch", "/food-watch.html"]]
    },
    "/prepper-tools.html": {
      lane: "Prepper",
      title: "Prepper Toolkit Pro",
      status: "Local",
      use: "Detailed preparedness calculators and lists after you know your scenario.",
      source: "Local browser calculators, notes and checklist state.",
      action: ["Open Personal Risk Briefing", "/personal-risk.html"],
      related: [["Prepper Command", "/prepper-command.html"], ["Prepper Risk", "/prepper-risk.html"], ["Command Queue", "/command-queue.html"]]
    }
  };

  function esc(value) {
    return String(value == null ? "" : value).replace(/[&<>"']/g, ch => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      "\"": "&quot;",
      "'": "&#039;"
    }[ch]));
  }

  function normalizePath(path) {
    if (!path || path === "/") return "/";
    return path.endsWith("/") ? path.slice(0, -1) : path;
  }

  function insertContext(config) {
    if (document.querySelector("[data-nt-tool-context]")) return;
    const header = document.querySelector("header");
    const context = document.createElement("section");
    context.className = "nt-tool-context";
    context.setAttribute("data-nt-tool-context", "");
    context.innerHTML = `
      <div class="nt-tool-context-grid">
        <div class="nt-tool-context-main">
          <div class="nt-tool-breadcrumb">
            <a href="/signal-suite.html">Command Center</a>
            <span>/</span>
            <a href="/library.html">Library</a>
            <span>/</span>
            <span>${esc(config.lane)}</span>
          </div>
          <div class="nt-tool-context-title">
            <h2>${esc(config.title)}</h2>
            <span class="nt-tool-status" data-status="${esc(config.status)}">${esc(config.status)}</span>
          </div>
          <p>${esc(config.use)}</p>
          <div class="nt-tool-facts">
            <div class="nt-tool-fact"><span>Best use</span><b>${esc(config.use)}</b></div>
            <div class="nt-tool-fact"><span>Source quality</span><b>${esc(config.status)}</b></div>
            <div class="nt-tool-fact"><span>Input layer</span><b>${esc(config.source)}</b></div>
          </div>
        </div>
        <aside class="nt-tool-context-side" aria-label="Related NiftyTools">
          <div class="nt-tool-context-actions">
            <a class="nt-tool-action" href="${esc(config.action[1])}">${esc(config.action[0])}</a>
            <a class="nt-tool-action secondary" href="/library.html">Full library</a>
          </div>
          <div class="nt-tool-related">
            <strong>Related tools</strong>
            <div>
              ${config.related.map(([label, url]) => `<a href="${esc(url)}">${esc(label)}</a>`).join("")}
            </div>
          </div>
          <div class="nt-tool-note">Signals are decision-support context, not official emergency instructions. For active incidents, follow local authorities and primary providers.</div>
        </aside>
      </div>
    `;
    if (header && header.parentNode) {
      header.insertAdjacentElement("afterend", context);
    } else {
      document.body.insertBefore(context, document.body.firstChild);
    }
    if (window.ntTrack) {
      window.ntTrack("tool_context_view", {
        tool: config.title,
        lane: config.lane,
        status: config.status
      });
    }
  }

  function init() {
    const config = TOOLS[normalizePath(window.location.pathname)];
    if (!config) return;
    insertContext(config);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();
