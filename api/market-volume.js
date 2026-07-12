const ALPHA_URL = "https://www.alphavantage.co/query?function=TOP_GAINERS_LOSERS";
const STOOQ_URL = "https://stooq.com/q/l/";
const YAHOO_CHART_URL = "https://query1.finance.yahoo.com/v8/finance/chart/";
const USER_AGENT = "NiftyToolsHub/1.0 market-volume-pulse";

const WATCH = [
  { symbol:"NVDA", name:"NVIDIA", group:"tech", avgVolume:245000000 },
  { symbol:"TSLA", name:"Tesla", group:"tech", avgVolume:98000000 },
  { symbol:"AAPL", name:"Apple", group:"tech", avgVolume:61000000 },
  { symbol:"MSFT", name:"Microsoft", group:"tech", avgVolume:26000000 },
  { symbol:"AMZN", name:"Amazon", group:"tech", avgVolume:42000000 },
  { symbol:"GOOGL", name:"Alphabet Class A", group:"tech", avgVolume:34000000 },
  { symbol:"GOOG", name:"Alphabet Class C", group:"tech", avgVolume:25000000 },
  { symbol:"META", name:"Meta Platforms", group:"tech", avgVolume:16000000 },
  { symbol:"AVGO", name:"Broadcom", group:"tech", avgVolume:30000000 },
  { symbol:"AMD", name:"AMD", group:"tech", avgVolume:62000000 },
  { symbol:"MU", name:"Micron Technology", group:"tech", avgVolume:26000000 },
  { symbol:"INTC", name:"Intel", group:"tech", avgVolume:76000000 },
  { symbol:"ORCL", name:"Oracle", group:"tech", avgVolume:12000000 },
  { symbol:"CRM", name:"Salesforce", group:"tech", avgVolume:7000000 },
  { symbol:"NFLX", name:"Netflix", group:"tech", avgVolume:4200000 },
  { symbol:"PLTR", name:"Palantir", group:"tech", avgVolume:84000000 },
  { symbol:"SMCI", name:"Super Micro Computer", group:"tech", avgVolume:7600000 },
  { symbol:"UBER", name:"Uber", group:"large", avgVolume:23000000 },
  { symbol:"WMT", name:"Walmart", group:"large", avgVolume:17000000 },
  { symbol:"DIS", name:"Disney", group:"large", avgVolume:12000000 },
  { symbol:"BABA", name:"Alibaba", group:"large", avgVolume:21000000 },
  { symbol:"MSTR", name:"Strategy", group:"crypto", avgVolume:17500000 },
  { symbol:"COIN", name:"Coinbase", group:"crypto", avgVolume:12000000 },
  { symbol:"MARA", name:"MARA Holdings", group:"crypto", avgVolume:53000000 },
  { symbol:"RIOT", name:"Riot Platforms", group:"crypto", avgVolume:26000000 },
  { symbol:"CLSK", name:"CleanSpark", group:"crypto", avgVolume:29000000 },
  { symbol:"BITF", name:"Bitfarms", group:"crypto", avgVolume:19000000 },
  { symbol:"HOOD", name:"Robinhood", group:"crypto", avgVolume:36000000 },
  { symbol:"GME", name:"GameStop", group:"meme", avgVolume:17000000 },
  { symbol:"AMC", name:"AMC Entertainment", group:"meme", avgVolume:18000000 },
  { symbol:"NIO", name:"NIO", group:"meme", avgVolume:48000000 },
  { symbol:"RIVN", name:"Rivian", group:"meme", avgVolume:43000000 },
  { symbol:"LCID", name:"Lucid", group:"meme", avgVolume:52000000 },
  { symbol:"F", name:"Ford", group:"large", avgVolume:61000000 },
  { symbol:"T", name:"AT&T", group:"large", avgVolume:39000000 },
  { symbol:"PFE", name:"Pfizer", group:"large", avgVolume:42000000 },
  { symbol:"WBD", name:"Warner Bros. Discovery", group:"large", avgVolume:33000000 },
  { symbol:"SNAP", name:"Snap", group:"meme", avgVolume:27000000 },
  { symbol:"SOFI", name:"SoFi", group:"financials", avgVolume:65000000 },
  { symbol:"JPM", name:"JPMorgan Chase", group:"financials", avgVolume:9500000 },
  { symbol:"BAC", name:"Bank of America", group:"financials", avgVolume:42000000 },
  { symbol:"C", name:"Citigroup", group:"financials", avgVolume:17000000 },
  { symbol:"WFC", name:"Wells Fargo", group:"financials", avgVolume:20000000 },
  { symbol:"XOM", name:"Exxon Mobil", group:"energy", avgVolume:17000000 },
  { symbol:"CVX", name:"Chevron", group:"energy", avgVolume:8600000 },
  { symbol:"OXY", name:"Occidental Petroleum", group:"energy", avgVolume:13000000 },
  { symbol:"SLB", name:"SLB", group:"energy", avgVolume:11000000 },
  { symbol:"SPY", name:"SPDR S&P 500 ETF", group:"etf", avgVolume:73000000 },
  { symbol:"QQQ", name:"Invesco QQQ ETF", group:"etf", avgVolume:46000000 },
  { symbol:"IWM", name:"iShares Russell 2000 ETF", group:"etf", avgVolume:35000000 },
  { symbol:"TLT", name:"iShares 20+ Year Treasury ETF", group:"etf", avgVolume:42000000 },
  { symbol:"GLD", name:"SPDR Gold Shares", group:"etf", avgVolume:8500000 },
  { symbol:"SLV", name:"iShares Silver Trust", group:"etf", avgVolume:25000000 },
  { symbol:"USO", name:"United States Oil Fund", group:"etf", avgVolume:4700000 },
  { symbol:"HYG", name:"iShares High Yield Bond ETF", group:"etf", avgVolume:38000000 },
  { symbol:"XLF", name:"Financial Select Sector SPDR", group:"etf", avgVolume:35000000 },
  { symbol:"XLE", name:"Energy Select Sector SPDR", group:"etf", avgVolume:18000000 },
  { symbol:"XLK", name:"Technology Select Sector SPDR", group:"etf", avgVolume:8200000 },
  { symbol:"BITO", name:"ProShares Bitcoin Strategy ETF", group:"crypto", avgVolume:18000000 }
];

const SAMPLE_ROWS = [
  row("NVDA", 161.24, 2.1, 268000000, 245000000, "AI/semis attention", "sample"),
  row("TSLA", 287.10, -1.8, 142000000, 98000000, "mega-cap activity spike", "sample"),
  row("PLTR", 137.42, 5.9, 126000000, 84000000, "unusual software volume", "sample"),
  row("AMD", 149.83, 3.2, 94000000, 62000000, "semiconductor follow-through", "sample"),
  row("SOFI", 17.54, 7.4, 91000000, 65000000, "retail finance pressure", "sample"),
  row("AAPL", 213.66, .6, 73000000, 61000000, "large-cap liquidity", "sample"),
  row("MSTR", 421.31, 4.8, 36000000, 17500000, "bitcoin context flow", "sample"),
  row("COIN", 288.40, 3.6, 25000000, 12000000, "crypto-linked equity pulse", "sample"),
  row("GME", 28.60, 8.2, 39000000, 17000000, "meme-stock attention", "sample"),
  row("XOM", 116.52, -1.2, 24000000, 17000000, "energy tape activity", "sample")
];

const SAMPLE_ETFS = [
  row("SPY", 625.19, .4, 81000000, 73000000, "broad-market tape", "sample"),
  row("QQQ", 551.73, .7, 59000000, 46000000, "growth/tech pressure", "sample"),
  row("IWM", 217.88, -.5, 42000000, 35000000, "small-cap risk mood", "sample"),
  row("TLT", 88.40, -1.1, 56000000, 42000000, "rates pressure", "sample"),
  row("GLD", 224.60, .9, 12000000, 8500000, "gold hedge flow", "sample"),
  row("HYG", 78.55, -.2, 43000000, 38000000, "credit risk pulse", "sample")
];

module.exports = async function handler(req, res) {
  const sources = [];
  let rows = [];
  let etfs = [];

  const key = process.env.ALPHA_VANTAGE_API_KEY || process.env.ALPHAVANTAGE_API_KEY || "";
  if (key) {
    try {
      rows = await fetchAlphaVantage(key);
      sources.push({ source:"Alpha Vantage TOP_GAINERS_LOSERS", status:rows.length ? "live" : "reference", detail:rows.length ? rows.length + " most-active rows parsed" : "response did not include active rows" });
    } catch (err) {
      sources.push({ source:"Alpha Vantage TOP_GAINERS_LOSERS", status:"blocked", detail:cleanError(err) });
    }
  } else {
    sources.push({ source:"Alpha Vantage TOP_GAINERS_LOSERS", status:"reference", detail:"ALPHA_VANTAGE_API_KEY optional; using public reference basket" });
  }

  try {
    const yahooRows = await fetchYahoo(WATCH);
    if (yahooRows.length) {
      rows = mergeRows(rows, yahooRows.filter((item) => item.group !== "etf"));
      etfs = mergeRows(etfs, yahooRows.filter((item) => item.group === "etf"));
      sources.push({ source:"Yahoo Finance delayed quote basket", status:"delayed", detail:yahooRows.length + " quote rows parsed with volume and average-volume context" });
    } else {
      sources.push({ source:"Yahoo Finance delayed quote basket", status:"reference", detail:"quote endpoint returned no rows" });
    }
  } catch (err) {
    sources.push({ source:"Yahoo Finance delayed quote basket", status:"blocked", detail:cleanError(err) });
  }

  if (rows.length < 6 || etfs.length < 4) {
    try {
      const stooqRows = await fetchStooq(WATCH);
      if (stooqRows.length) {
        rows = mergeRows(rows, stooqRows.filter((item) => item.group !== "etf"));
        etfs = stooqRows.filter((item) => item.group === "etf");
        sources.push({ source:"Stooq quote basket", status:"reference", detail:stooqRows.length + " public delayed quote rows parsed" });
      } else {
        sources.push({ source:"Stooq quote basket", status:"sample", detail:"public quote basket returned no rows" });
      }
    } catch (err) {
      sources.push({ source:"Stooq quote basket", status:"blocked", detail:cleanError(err) });
    }
  } else {
    sources.push({ source:"Stooq quote basket", status:"backup", detail:"optional reference feed skipped; delayed quote provider is active" });
  }

  if (rows.length < 6) rows = mergeRows(rows, SAMPLE_ROWS);
  if (etfs.length < 4) etfs = mergeRows(etfs, SAMPLE_ETFS);

  rows = rows.map(normalizeRow).sort((a, b) => b.score - a.score).slice(0, 28);
  etfs = etfs.map(normalizeRow).sort((a, b) => b.score - a.score).slice(0, 12);

  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Cache-Control", "s-maxage=300, stale-while-revalidate=1800");
  res.status(200).json({
    ok:true,
    updatedAt:new Date().toISOString(),
    mode:rows.some((item) => item.source === "live") ? "live" : rows.some((item) => item.source === "delayed") ? "delayed" : rows.some((item) => item.source === "reference") ? "reference" : "sample",
    note:"Market volume feeds are delayed or mixed-source unless a paid realtime data provider is connected. Context only, not financial advice.",
    rows:rows,
    etfs:etfs,
    sources:sources
  });
};

async function fetchAlphaVantage(key) {
  const payload = await fetchJson(ALPHA_URL + "&apikey=" + encodeURIComponent(key));
  if (payload.Note || payload.Information) throw new Error(payload.Note || payload.Information);
  const active = Array.isArray(payload.most_actively_traded) ? payload.most_actively_traded : [];
  return active.map((item) => {
    const symbol = cleanSymbol(item.ticker || item.symbol);
    const meta = metaFor(symbol);
    const price = toNumber(item.price);
    const changePct = toNumber(String(item.change_percentage || "").replace("%", ""));
    const volume = toNumber(item.volume);
    return row(symbol, price, changePct, volume, meta.avgVolume, "Alpha Vantage most-active ticker", "live");
  }).filter((item) => item.symbol && item.volume > 0);
}

async function fetchStooq(items) {
  const chunks = [];
  for (let i = 0; i < items.length; i += 12) chunks.push(items.slice(i, i + 12));
  const out = [];
  for (const chunk of chunks) {
    const symbols = chunk.map((item) => item.symbol.toLowerCase() + ".us").join(",");
    const text = await fetchText(STOOQ_URL + "?s=" + encodeURIComponent(symbols) + "&f=sd2t2ohlcv&h&e=csv");
    const parsed = parseCsvTable(text);
    for (const raw of parsed) {
      const symbol = cleanSymbol(String(raw.Symbol || "").replace(/\.US$/i, ""));
      const meta = metaFor(symbol);
      const close = toNumber(raw.Close);
      const open = toNumber(raw.Open);
      const volume = toNumber(raw.Volume);
      if (!symbol || !Number.isFinite(close) || close <= 0 || !Number.isFinite(volume) || volume <= 0) continue;
      const changePct = Number.isFinite(open) && open > 0 ? ((close - open) / open) * 100 : 0;
      out.push(row(symbol, close, changePct, volume, meta.avgVolume, "public delayed quote basket", "reference"));
    }
  }
  return out;
}

async function fetchYahoo(items) {
  const out = [];
  await mapLimit(items, 8, async (item) => {
    const symbol = cleanSymbol(item.symbol);
    const payload = await fetchJson(YAHOO_CHART_URL + encodeURIComponent(symbol) + "?range=5d&interval=1d&includePrePost=false");
    const result = payload && payload.chart && Array.isArray(payload.chart.result) ? payload.chart.result[0] : null;
    const meta = result && result.meta || {};
    const quote = result && result.indicators && result.indicators.quote && result.indicators.quote[0] || {};
    const closes = (quote.close || []).map(toNumber).filter(Number.isFinite);
    const volumes = (quote.volume || []).map(toNumber).filter((value) => Number.isFinite(value) && value > 0);
    const price = toNumber(meta.regularMarketPrice || closes[closes.length - 1]);
    const previous = toNumber(meta.chartPreviousClose || closes[Math.max(0, closes.length - 2)]);
    const volume = toNumber(meta.regularMarketVolume || volumes[volumes.length - 1]);
    const avgVolume = Math.round(avgNumber(volumes) || item.avgVolume || metaFor(symbol).avgVolume || volume || 1);
    if (!symbol || !Number.isFinite(price) || !Number.isFinite(volume) || volume <= 0) return;
    out.push(row(symbol, price, calcChangePct(price, previous), volume, avgVolume, "delayed chart + volume pressure", "delayed"));
  });
  return out;
}

async function mapLimit(items, limit, worker) {
  const queue = (items || []).slice();
  const workers = Array.from({ length:Math.min(limit, queue.length) }, async () => {
    while (queue.length) {
      const item = queue.shift();
      try { await worker(item); }
      catch (_err) { /* Individual symbols can fail without dropping the whole board. */ }
    }
  });
  await Promise.all(workers);
}

function avgNumber(values) {
  const clean = (values || []).filter((value) => Number.isFinite(value));
  if (!clean.length) return 0;
  return clean.reduce((sum, value) => sum + value, 0) / clean.length;
}

function row(symbol, price, changePct, volume, avgVolume, signal, source) {
  const meta = metaFor(symbol);
  const vol = Math.max(0, Math.round(toNumber(volume)));
  const avg = Math.max(1, Math.round(toNumber(avgVolume || meta.avgVolume || vol || 1)));
  const px = round2(toNumber(price));
  const rel = vol / avg;
  const dollarVolume = Number.isFinite(px) ? Math.round(px * vol) : 0;
  return {
    symbol:cleanSymbol(symbol),
    name:meta.name,
    group:meta.group,
    price:px,
    changePct:round2(changePct),
    volume:vol,
    avgVolume:avg,
    relVolume:round2(rel),
    dollarVolume:dollarVolume,
    signal:signal || meta.signal,
    score:attentionScore(vol, avg, changePct, dollarVolume, px),
    source:source || "sample",
    detail:detailFor(source || "sample", meta)
  };
}

function normalizeRow(item) {
  const meta = metaFor(item.symbol);
  return Object.assign({}, item, {
    symbol:cleanSymbol(item.symbol),
    name:item.name || meta.name,
    group:item.group || meta.group,
    price:round2(item.price),
    changePct:round2(item.changePct),
    volume:Math.round(toNumber(item.volume)),
    avgVolume:Math.round(toNumber(item.avgVolume || meta.avgVolume || 1)),
    relVolume:round2(item.relVolume || (toNumber(item.volume) / Math.max(1, toNumber(item.avgVolume || meta.avgVolume || 1)))),
    dollarVolume:Math.round(toNumber(item.dollarVolume || toNumber(item.price) * toNumber(item.volume))),
    score:Math.round(clamp(item.score || attentionScore(item.volume, item.avgVolume || meta.avgVolume, item.changePct, item.dollarVolume, item.price), 0, 100)),
    source:item.source || "sample",
    detail:item.detail || detailFor(item.source || "sample", meta)
  });
}

function metaFor(symbol) {
  const clean = cleanSymbol(symbol);
  const item = WATCH.find((entry) => entry.symbol === clean);
  return item || { symbol:clean, name:clean || "Ticker", group:guessGroup(clean), avgVolume:25000000, signal:"market attention" };
}

function guessGroup(symbol) {
  if (/^(SPY|QQQ|IWM|TLT|GLD|SLV|USO|HYG|XLF|XLE|XLK|BITO)$/.test(symbol)) return "etf";
  if (/^(MSTR|COIN|MARA|RIOT|HOOD|BITF|CLSK)$/.test(symbol)) return "crypto";
  if (/^(NVDA|TSLA|AAPL|MSFT|AMZN|GOOGL|GOOG|META|AVGO|AMD|MU|INTC|ORCL|CRM|NFLX|PLTR|SMCI)$/.test(symbol)) return "tech";
  if (/^(JPM|BAC|C|WFC|GS|MS|SOFI)$/.test(symbol)) return "financials";
  if (/^(XOM|CVX|OXY|SLB)$/.test(symbol)) return "energy";
  if (/^(GME|AMC|NIO|RIVN|LCID|SNAP)$/.test(symbol)) return "meme";
  return "large";
}

function detailFor(source, meta) {
  if (source === "live") return "Alpha Vantage most-active stock feed";
  if (source === "delayed") return "Delayed quote provider with volume and average-volume context";
  if (source === "reference") return "Public delayed high-liquidity quote basket with local average-volume baselines";
  return "Bundled reference row for layout and backup mode";
}

function attentionScore(volume, avgVolume, changePct, dollarVolume, price) {
  const rel = toNumber(volume) / Math.max(1, toNumber(avgVolume));
  const relScore = clamp(rel * 28, 0, 45);
  const moveScore = clamp(Math.abs(toNumber(changePct)) * 4.2, 0, 30);
  const dollarScore = clamp(Math.log10(Math.max(1, toNumber(dollarVolume))) * 6 - 40, 0, 22);
  const pennyPenalty = toNumber(price) > 0 && toNumber(price) < 5 ? 8 : 0;
  return Math.round(clamp(18 + relScore + moveScore + dollarScore - pennyPenalty, 0, 100));
}

function mergeRows(base, extra) {
  const bySymbol = new Map();
  for (const item of base || []) bySymbol.set(cleanSymbol(item.symbol), item);
  for (const item of extra || []) {
    const symbol = cleanSymbol(item.symbol);
    if (!symbol) continue;
    const old = bySymbol.get(symbol);
    if (!old || sourceRank(item.source) < sourceRank(old.source)) bySymbol.set(symbol, item);
  }
  return Array.from(bySymbol.values());
}

function sourceRank(source) {
  if (source === "live") return 0;
  if (source === "delayed") return 1;
  if (source === "reference") return 1;
  return 2;
}

async function fetchText(url) {
  const res = await fetch(url, { headers:{ "user-agent":USER_AGENT }, cache:"no-store" });
  if (!res.ok) throw new Error("HTTP " + res.status);
  return await res.text();
}

async function fetchJson(url) {
  const res = await fetch(url, { headers:{ "user-agent":USER_AGENT }, cache:"no-store" });
  if (!res.ok) throw new Error("HTTP " + res.status);
  return await res.json();
}

function parseCsvTable(text) {
  const lines = String(text || "").replace(/^\uFEFF/, "").trim().split(/\r?\n/).filter(Boolean);
  if (lines.length < 2) return [];
  const headers = parseCsvLine(lines[0]);
  return lines.slice(1).map((line) => {
    const cells = parseCsvLine(line);
    const row = {};
    headers.forEach((header, index) => { row[header] = cells[index]; });
    return row;
  });
}

function parseCsvLine(line) {
  const cells = [];
  let cell = "";
  let quote = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (quote && line[i + 1] === '"') {
        cell += '"';
        i++;
      } else {
        quote = !quote;
      }
    } else if (ch === "," && !quote) {
      cells.push(cell.trim());
      cell = "";
    } else {
      cell += ch;
    }
  }
  cells.push(cell.trim());
  return cells;
}

function cleanSymbol(symbol) {
  return String(symbol || "").trim().toUpperCase().replace(/[^A-Z0-9.-]/g, "");
}

function toNumber(value) {
  if (value == null || value === "" || value === "N/D") return NaN;
  return Number(String(value).replace(/[%,$\s]/g, ""));
}

function round2(value) {
  const n = Number(value);
  return Number.isFinite(n) ? Math.round(n * 100) / 100 : 0;
}

function calcChangePct(price, previousClose) {
  if (!Number.isFinite(price) || !Number.isFinite(previousClose) || previousClose <= 0) return 0;
  return ((price - previousClose) / previousClose) * 100;
}

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, Number(n) || 0));
}

function cleanError(err) {
  return String(err && err.message || err || "fetch failed").slice(0, 130);
}
