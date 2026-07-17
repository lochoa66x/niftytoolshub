(function () {
  "use strict";

  const STATUS_LABELS = {
    live: "Live",
    mixed: "Mixed",
    local: "Local",
    delayed: "Delayed",
    context: "Context",
    beta: "Beta",
    backup: "Backup",
    sample: "Sample"
  };

  const HUBS = [
    {
      id: "signals",
      name: "Signal Suite",
      url: "/signal-suite.html",
      label: "Flagship",
      description: "The public signal shelf: early warning, internet weather, cyber, food, aurora, meme, crypto and market radars.",
      icon: "SIG"
    },
    {
      id: "prepper",
      name: "Prepper + Local Risk",
      url: "/prepper-command.html",
      label: "Flagship",
      description: "Calm readiness planning, daily risk checks, supplies, go-bags, power and family plans.",
      icon: "PREP"
    },
    {
      id: "markets",
      name: "Market Tools",
      url: "/library.html?filter=market",
      label: "Market lane",
      description: "Core market screens: Crypto Pulse, Stock Volume Pulse and Shorts vs Longs. Finance calculators stay secondary.",
      icon: "MKT"
    },
    {
      id: "work",
      name: "Work Tools",
      url: "/library.html?filter=utility",
      label: "Utility",
      description: "PDFs, images, receipts, QR, developer helpers, writing tools and file organization.",
      icon: "WORK"
    },
    {
      id: "utilities",
      name: "Everyday Utilities",
      url: "/library.html?filter=utility",
      label: "Local-first",
      description: "Converters, clocks, device tests, math, percentages, loans and practical small tools.",
      icon: "UTIL"
    },
    {
      id: "fun",
      name: "Fun Lab",
      url: "/library.html?filter=fun",
      label: "Play",
      description: "Tarot, zodiac, randomizers, fake hacker terminal and low-stakes weird internet toys.",
      icon: "FUN"
    }
  ];

  const RAW_TOOLS = [
    {
      slug: "signal-suite",
      name: "Signal Suite Hub",
      url: "/signal-suite.html",
      hub: "signals",
      category: "Signal hub",
      status: "mixed",
      sourceTruth: "mixed",
      lane: "global + local radar shelf",
      featured: true,
      priority: 100,
      description: "All flagship radar tools grouped by signal lane, source status and best next action.",
      tags: ["signal", "radar", "hub", "monitor", "prepper", "market", "internet"]
    },
    {
      slug: "personal-risk",
      name: "Personal Risk Briefing",
      url: "/personal-risk.html",
      hub: "signals",
      hubs: ["signals", "prepper"],
      category: "Daily brief",
      status: "mixed",
      sourceTruth: "mixed",
      lane: "daily personal command brief",
      featured: true,
      priority: 98,
      description: "One local read across weather, air, quakes, outages, recalls, markets, cyber and conflict context.",
      tags: ["signal", "prepper", "risk", "briefing", "weather", "air", "outage", "cyber", "food", "market"]
    },
    {
      slug: "command-queue",
      name: "Command Queue",
      url: "/command-queue.html",
      hub: "signals",
      hubs: ["signals", "prepper", "work"],
      category: "Action board",
      status: "local",
      sourceTruth: "local",
      lane: "signal to action workflow",
      featured: true,
      priority: 97,
      description: "Turn radar signals and prepper checks into local action cards, checklists, notes and an audit timeline.",
      tags: ["signal", "prepper", "workflow", "command", "queue", "actions", "checklist", "audit", "local"]
    },
    {
      slug: "signal-suite-pro",
      name: "Signal Suite Pro Lite",
      url: "/signal-suite-pro.html",
      hub: "signals",
      category: "Workspace",
      status: "beta",
      sourceTruth: "mixed",
      lane: "saved places + watchlists",
      featured: true,
      priority: 96,
      description: "Private beta workspace for saved locations, watchlists, thresholds, event history and briefings.",
      tags: ["signal", "pro", "premium", "watchlist", "alerts", "briefing", "workspace"]
    },
    {
      slug: "signal-watch",
      name: "Early Warning Radar",
      url: "/signal-watch.html",
      hub: "signals",
      hubs: ["signals", "prepper"],
      category: "World/local anomaly",
      status: "mixed",
      sourceTruth: "mixed",
      lane: "world/local anomaly",
      featured: true,
      priority: 95,
      description: "Space weather, quakes, outages, conflict spillover, news panic, market stress and local air/weather.",
      tags: ["signal", "radar", "early warning", "space weather", "earthquake", "outage", "conflict", "air quality"]
    },
    {
      slug: "prepper-command",
      name: "Prepper Command Center",
      url: "/prepper-command.html",
      hub: "prepper",
      category: "Preparedness",
      status: "local",
      sourceTruth: "local",
      lane: "household readiness",
      featured: true,
      priority: 93,
      description: "Water, food, power, go-bag, family contacts, home inventory and scenario planning.",
      tags: ["prepper", "preparedness", "emergency", "water", "food", "power", "go bag", "inventory"]
    },
    {
      slug: "prepper-risk",
      name: "Prepper Risk Scanner",
      url: "/prepper-risk.html",
      hub: "prepper",
      hubs: ["prepper", "signals"],
      category: "Local risk",
      status: "mixed",
      sourceTruth: "mixed",
      lane: "local risk to checklist",
      featured: true,
      priority: 91,
      description: "Scan alerts, weather, smoke, nearby quakes, internet and travel friction into a Prep Today list.",
      tags: ["prepper", "risk", "weather", "smoke", "earthquake", "internet", "travel", "checklist"]
    },
    {
      slug: "outage-radar",
      name: "Outage Radar",
      url: "/outage-radar.html",
      hub: "signals",
      category: "Internet weather",
      status: "mixed",
      sourceTruth: "mixed",
      lane: "internet weather",
      featured: true,
      priority: 90,
      description: "Watch app, cloud, carrier and internet-core status signals in a compact world map.",
      tags: ["signal", "outage", "internet", "cloud", "carrier", "status", "youtube", "aws", "instagram"]
    },
    {
      slug: "cyber-threat",
      name: "Cyber Threat Radar",
      url: "/cyber-threat.html",
      hub: "signals",
      category: "Cyber map",
      status: "mixed",
      sourceTruth: "mixed",
      lane: "public cyber signals",
      featured: true,
      priority: 88,
      description: "Public cyber-signal map with attack-style arcs, top ports and vulnerability pulse.",
      tags: ["signal", "cyber", "security", "threat", "attack map", "vulnerability", "cisa", "sans"]
    },
    {
      slug: "aurora-watch",
      name: "Aurora Watch",
      url: "/aurora-watch.html",
      hub: "signals",
      category: "Sky watch",
      status: "live",
      sourceTruth: "live",
      lane: "space weather",
      featured: true,
      priority: 86,
      description: "Check if northern or southern lights are worth chasing tonight using space weather and sky context.",
      tags: ["signal", "aurora", "northern lights", "space weather", "sky", "weather"]
    },
    {
      slug: "crypto-pulse",
      name: "Crypto Pulse",
      url: "/crypto-pulse.html",
      hub: "markets",
      hubs: ["markets", "signals"],
      category: "Network stress",
      status: "mixed",
      sourceTruth: "mixed",
      lane: "network stress",
      featured: true,
      priority: 83,
      description: "BTC and ETH activity, fees, mempool pressure and market context in a cleaner pulse view.",
      tags: ["market", "crypto", "bitcoin", "btc", "ethereum", "eth", "network", "fees", "gas", "mempool", "on-chain", "transaction volume", "signal"]
    },
    {
      slug: "positioning-radar",
      name: "Shorts vs Longs Radar",
      url: "/positioning-radar.html",
      hub: "markets",
      hubs: ["markets", "signals"],
      category: "Long/short crowding",
      status: "delayed",
      sourceTruth: "delayed",
      lane: "long/short crowding",
      featured: true,
      priority: 82,
      description: "Long/short crowding context for SPY, QQQ, BTC, ETH, gold, silver, oil, coffee and major futures.",
      tags: ["market", "positioning", "shorts", "longs", "long short", "long/short", "short interest", "crowding", "spy", "qqq", "bitcoin", "btc", "ethereum", "eth", "gold", "silver", "oil", "coffee", "futures"]
    },
    {
      slug: "market-volume-pulse",
      name: "Stock Volume Pulse",
      url: "/market-volume-pulse.html",
      hub: "markets",
      hubs: ["markets"],
      category: "Volume leaders",
      status: "delayed",
      sourceTruth: "delayed",
      lane: "market activity",
      featured: true,
      priority: 80,
      description: "Most-active stocks, dollar-volume style board, volume leaders and participation pulse.",
      tags: ["market", "stocks", "stock", "volume", "stocks volume", "volume leaders", "most traded", "shares", "trading", "liquidity", "attention leaders"]
    },
    {
      slug: "food-watch",
      name: "Food Watch",
      url: "/food-watch.html",
      hub: "signals",
      hubs: ["signals", "prepper"],
      category: "Food pressure",
      status: "mixed",
      sourceTruth: "mixed",
      lane: "recalls + shortage pressure",
      featured: false,
      priority: 76,
      description: "Recall signals, commodity pressure and shortage-style public context for pantry awareness.",
      tags: ["signal", "food", "recall", "shortage", "prepper", "commodity"]
    },
    {
      slug: "meme-watch",
      name: "Meme Watch",
      url: "/meme-watch.html",
      hub: "signals",
      hubs: ["signals", "fun"],
      category: "Trend scout",
      status: "context",
      sourceTruth: "context",
      lane: "trend early warning",
      featured: false,
      priority: 70,
      description: "Public attention proxies for rising phrases and meme smoke before mainstream saturation.",
      tags: ["signal", "meme", "trend", "viral", "fun", "internet"]
    },
    {
      slug: "prepper-tools",
      name: "Prepper Toolkit Pro",
      url: "/prepper-tools.html",
      hub: "prepper",
      category: "Preparedness calculators",
      status: "local",
      sourceTruth: "local",
      lane: "supply calculators",
      featured: false,
      priority: 78,
      description: "Supply targets, outage power, go-bag, family plan, inventory exports and printable reports.",
      tags: ["prepper", "preparedness", "water", "food", "power", "checklist", "inventory"]
    },
    {
      slug: "salary-tools",
      name: "Salary / Paycheck Pro",
      url: "/salary-tools.html",
      hub: "work",
      hubs: ["work", "markets"],
      category: "Money",
      status: "local",
      sourceTruth: "local",
      lane: "paycheck + offer math",
      featured: true,
      priority: 78,
      description: "Estimate take-home pay, overtime, deductions, raises and competing job offers.",
      tags: ["salary", "paycheck", "finance", "job offer", "overtime", "market"]
    },
    {
      slug: "image-tools",
      name: "Image Toolkit",
      url: "/image-tools.html",
      hub: "work",
      category: "Images",
      status: "local",
      sourceTruth: "local",
      lane: "image utilities",
      featured: true,
      priority: 75,
      description: "Compress, resize, convert WebP/JPG/PNG and remove simple backgrounds.",
      tags: ["image", "compress", "resize", "webp", "jpg", "png", "background"]
    },
    {
      slug: "pdf-tools",
      name: "PDF Toolkit",
      url: "/pdf-tools.html",
      hub: "work",
      category: "Documents",
      status: "local",
      sourceTruth: "local",
      lane: "pdf utilities",
      featured: true,
      priority: 74,
      description: "Merge, extract pages, optimize, make PDFs from images and export pages as images.",
      tags: ["pdf", "documents", "merge", "compress", "extract", "images"]
    },
    {
      slug: "receipt-tools",
      name: "Receipt Generator",
      url: "/receipt-tools.html",
      hub: "work",
      category: "Business docs",
      status: "local",
      sourceTruth: "local",
      lane: "receipt + invoice docs",
      featured: false,
      priority: 68,
      description: "Create printable receipts with line items, tax, discounts, payment details and PDF-ready layout.",
      tags: ["receipt", "invoice", "business", "pdf", "tax"]
    },
    {
      slug: "qr-tools",
      name: "QR Code Toolkit Pro",
      url: "/qr-tools.html",
      hub: "work",
      category: "QR",
      status: "local",
      sourceTruth: "local",
      lane: "qr generator",
      featured: false,
      priority: 66,
      description: "URL, text, Wi-Fi, vCard, email, SMS, phone and event QR codes with PNG/SVG export.",
      tags: ["qr", "generator", "wifi", "vcard", "png", "svg"]
    },
    {
      slug: "file-organizer",
      name: "File Organizer Toolkit",
      url: "/file-organizer.html",
      hub: "work",
      category: "Files",
      status: "local",
      sourceTruth: "local",
      lane: "file organization",
      featured: false,
      priority: 64,
      description: "Group files, spot duplicates, preview batch renames and export a local organization plan.",
      tags: ["files", "organizer", "rename", "duplicates", "documents", "images"]
    },
    {
      slug: "dev-tools",
      name: "Developer Toolkit",
      url: "/dev-tools.html",
      hub: "work",
      category: "Developer",
      status: "local",
      sourceTruth: "local",
      lane: "developer utilities",
      featured: false,
      priority: 63,
      description: "JSON, YAML, CSV, Base64, URL, JWT, hashes, UUIDs, regex and timestamps.",
      tags: ["developer", "json", "yaml", "csv", "base64", "jwt", "hash", "regex"]
    },
    {
      slug: "text-tools",
      name: "Text & Writing Toolkit Pro",
      url: "/text-tools.html",
      hub: "work",
      category: "Writing",
      status: "local",
      sourceTruth: "local",
      lane: "text utilities",
      featured: false,
      priority: 62,
      description: "Analyze, clean, format, diff, preview Markdown and tighten AI prompts locally.",
      tags: ["text", "writing", "markdown", "word counter", "diff", "prompt"]
    },
    {
      slug: "color-tools",
      name: "Color Palette Studio",
      url: "/color-tools.html",
      hub: "work",
      hubs: ["work", "utilities"],
      category: "Design",
      status: "local",
      sourceTruth: "local",
      lane: "color tools",
      featured: false,
      priority: 61,
      description: "Generate palettes, extract colors from images, check contrast and export CSS variables.",
      tags: ["color", "palette", "design", "contrast", "css", "gradient"]
    },
    {
      slug: "unit-tools",
      name: "Unit Converter Pro",
      url: "/unit-tools.html",
      hub: "utilities",
      category: "Converters",
      status: "local",
      sourceTruth: "local",
      lane: "measurement studio",
      featured: false,
      priority: 60,
      description: "Convert measurements across categories with formulas, batch mode and saved favorites.",
      tags: ["unit", "converter", "length", "mass", "temperature", "data", "pressure"]
    },
    {
      slug: "time-tools",
      name: "World Clock / Time Zone Studio",
      url: "/time-tools.html",
      hub: "utilities",
      category: "Time",
      status: "local",
      sourceTruth: "local",
      lane: "time tools",
      featured: false,
      priority: 59,
      description: "Live city clocks, timezone converter, meeting planner, countdowns and UTC offset search.",
      tags: ["time", "clock", "timezone", "meeting", "countdown", "utc"]
    },
    {
      slug: "device-tests",
      name: "Device Test Suite",
      url: "/device-tests.html",
      hub: "utilities",
      category: "Device tests",
      status: "local",
      sourceTruth: "local",
      lane: "hardware checks",
      featured: false,
      priority: 58,
      description: "Test webcam, mic, speakers, keyboard, mouse, screen, typing speed and internet pulse.",
      tags: ["device", "webcam", "microphone", "speaker", "keyboard", "screen", "typing"]
    },
    {
      slug: "math-tools",
      name: "Math Lab Pro",
      url: "/math-tools.html",
      hub: "utilities",
      category: "Math",
      status: "local",
      sourceTruth: "local",
      lane: "math lab",
      featured: false,
      priority: 57,
      description: "Scientific calculator, statistics, prime checks, factors, GCD/LCM, factorials and quadratic solver.",
      tags: ["math", "calculator", "statistics", "prime", "factorial", "fibonacci"]
    },
    {
      slug: "random-tools",
      name: "Random Toolkit Pro",
      url: "/random-tools.html",
      hub: "fun",
      hubs: ["fun", "utilities"],
      category: "Random",
      status: "local",
      sourceTruth: "local",
      lane: "random generators",
      featured: false,
      priority: 56,
      description: "Coin flips, dice, lottery numbers, random picker, countdown timer, lorem ipsum and life stats.",
      tags: ["random", "coin", "dice", "lottery", "picker", "countdown", "lorem"]
    },
    {
      slug: "tarot-tools",
      name: "Tarot Card Reader",
      url: "/tarot-tools.html",
      hub: "fun",
      category: "Tarot",
      status: "local",
      sourceTruth: "local",
      lane: "tarot reader",
      featured: false,
      priority: 55,
      description: "Daily draws, quick answers, spreads, reversals and reflective interpretations.",
      tags: ["fun", "tarot", "cards", "daily draw", "astrology"]
    },
    {
      slug: "astrology-tools",
      name: "Birth Chart / Zodiac Toolkit",
      url: "/astrology-tools.html",
      hub: "fun",
      category: "Astrology",
      status: "local",
      sourceTruth: "local",
      lane: "zodiac toolkit",
      featured: false,
      priority: 54,
      description: "Sun, moon, rising, compatibility, numerology, daily vibe, lucky color and number.",
      tags: ["fun", "zodiac", "astrology", "birth chart", "compatibility", "numerology"]
    },
    {
      slug: "fake-hacker",
      name: "Fake Hacker Terminal",
      url: "/fake-hacker.html",
      hub: "fun",
      category: "Prank",
      status: "local",
      sourceTruth: "local",
      lane: "harmless terminal simulator",
      featured: false,
      priority: 53,
      description: "A cinematic harmless terminal simulation for pranks, streams and presentations.",
      tags: ["fun", "prank", "terminal", "hacker", "simulator", "fullscreen"]
    },
    {
      slug: "mortgage",
      name: "Mortgage Calculator",
      url: "/mortgage.html",
      hub: "utilities",
      hubs: ["utilities", "markets"],
      category: "Finance",
      status: "local",
      sourceTruth: "local",
      lane: "loan math",
      featured: false,
      priority: 52,
      description: "Mortgage payments, amortization and extra-payment scenarios.",
      tags: ["mortgage", "loan", "finance", "amortization", "calculator"]
    },
    {
      slug: "auto-loan",
      name: "Auto Loan Calculator",
      url: "/auto-loan.html",
      hub: "utilities",
      hubs: ["utilities", "markets"],
      category: "Finance",
      status: "local",
      sourceTruth: "local",
      lane: "auto finance",
      featured: false,
      priority: 51,
      description: "Car payment estimates with trade-in, tax and amortization.",
      tags: ["auto", "loan", "car", "finance", "calculator"]
    },
    {
      slug: "percentage",
      name: "Percentage Calculator",
      url: "/percentage.html",
      hub: "utilities",
      category: "Math",
      status: "local",
      sourceTruth: "local",
      lane: "percentage math",
      featured: false,
      priority: 50,
      description: "Common percentage calculations with formulas.",
      tags: ["percentage", "math", "calculator", "discount"]
    }
  ];

  function normalizeTool(tool) {
    const hubs = Array.isArray(tool.hubs) && tool.hubs.length ? tool.hubs : [tool.hub];
    return Object.assign({}, tool, {
      hubs,
      label: STATUS_LABELS[tool.status] || tool.status || "Tool",
      tags: Array.isArray(tool.tags) ? tool.tags : []
    });
  }

  const TOOLS = RAW_TOOLS.map(normalizeTool).sort((a, b) => (b.priority || 0) - (a.priority || 0));
  const HUB_LOOKUP = HUBS.reduce(function (acc, hub) {
    acc[hub.id] = hub;
    return acc;
  }, {});

  function all() {
    return TOOLS.slice();
  }

  function bySlug(slug) {
    return TOOLS.find(function (tool) {
      return tool.slug === slug;
    }) || null;
  }

  function byHub(hubId) {
    return TOOLS.filter(function (tool) {
      return tool.hubs.indexOf(hubId) !== -1;
    });
  }

  function featured(limit) {
    const rows = TOOLS.filter(function (tool) {
      return tool.featured;
    });
    return typeof limit === "number" ? rows.slice(0, limit) : rows;
  }

  function search(query) {
    const q = String(query || "").trim().toLowerCase();
    if (!q) return all();
    return TOOLS.filter(function (tool) {
      const hay = [tool.name, tool.category, tool.description, tool.lane].concat(tool.tags).join(" ").toLowerCase();
      return hay.indexOf(q) !== -1;
    });
  }

  window.NIFTY_TOOLS_REGISTRY = {
    version: "2026-07-11",
    hubs: HUBS,
    hubLookup: HUB_LOOKUP,
    tools: TOOLS,
    statusLabels: STATUS_LABELS,
    all: all,
    bySlug: bySlug,
    byHub: byHub,
    featured: featured,
    search: search
  };

  document.dispatchEvent(new CustomEvent("niftytools:registry-ready", {
    detail: window.NIFTY_TOOLS_REGISTRY
  }));
})();
