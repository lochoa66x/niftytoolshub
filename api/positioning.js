const CFTC_DISAGG_URL = "https://www.cftc.gov/dea/newcot/f_disagg.txt";
const CFTC_FINANCIAL_URL = "https://www.cftc.gov/dea/newcot/FinFutWk.txt";
const FINRA_BASE = "https://cdn.finra.org/equity/regsho/daily/CNMSshvol";
const BINANCE_RATIO = "https://fapi.binance.com/futures/data/globalLongShortAccountRatio";
const OKX_RATIO = "https://www.okx.com/api/v5/rubik/stat/contracts/long-short-account-ratio";

const USER_AGENT = "NiftyToolsHub/1.0 market-positioning-radar";

const CFTC_DISAGG_MARKETS = [
  { id:"gold", re:/\bGOLD\b|GOLD - COMMODITY/i },
  { id:"silver", re:/\bSILVER\b|SILVER - COMMODITY/i },
  { id:"oil", re:/CRUDE OIL|LIGHT SWEET|WTI/i },
  { id:"gas", re:/NATURAL GAS|NAT GAS/i },
  { id:"coffee", re:/COFFEE C|COFFEE/i },
  { id:"cocoa", re:/COCOA/i },
  { id:"sugar", re:/SUGAR NO\.?\s*11|SUGAR/i },
  { id:"wheat", re:/WHEAT|WHEAT-SRW/i },
  { id:"corn", re:/\bCORN\b/i },
  { id:"soy", re:/SOYBEANS/i }
];

const CFTC_FINANCIAL_MARKETS = [
  { id:"es", re:/E-MINI S&P|S&P 500|S&P/i },
  { id:"nq", re:/NASDAQ-100|NASDAQ 100|NASDAQ/i }
];

module.exports = async function handler(req, res) {
  const sources = [];
  const markets = [];

  await Promise.allSettled([
    addBinance("BTCUSDT", "btc", markets, sources),
    addBinance("ETHUSDT", "eth", markets, sources),
    addFinraShortVolume(markets, sources),
    addCftcDisaggregated(markets, sources),
    addCftcFinancial(markets, sources)
  ]);

  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Cache-Control", "s-maxage=900, stale-while-revalidate=3600");
  res.status(200).json({
    ok:true,
    updatedAt:new Date().toISOString(),
    note:"Public market-positioning feeds are mixed-frequency. CFTC is weekly, FINRA short-volume is delayed, crypto long/short feeds are exchange-specific.",
    markets:dedupeMarkets(markets),
    sources:sources
  });
};

async function addBinance(symbol, id, markets, sources) {
  const url = BINANCE_RATIO + "?symbol=" + encodeURIComponent(symbol) + "&period=1d&limit=30";
  try {
    const rows = await fetchJson(url);
    const last = Array.isArray(rows) ? rows[rows.length - 1] : null;
    if (!last) throw new Error("empty ratio response");
    const longPct = clamp(Number(last.longAccount) * 100, 0, 100);
    const shortPct = clamp(Number(last.shortAccount) * 100, 0, 100);
    if (!Number.isFinite(longPct) || !Number.isFinite(shortPct)) throw new Error("ratio fields missing");
    markets.push({
      id:id,
      longPct:round1(longPct),
      shortPct:round1(shortPct),
      pctile:ratioPercentile(rows),
      source:"live",
      detail:"Binance global long/short account ratio, " + symbol
    });
    sources.push({ source:"Binance " + symbol + " long/short", status:"live", detail:"server fetch ok" });
  } catch (err) {
    const detail = cleanError(err);
    const covered = await addOkxRatio(symbol.replace("USDT", ""), id, markets, sources);
    sources.push({
      source:"Binance " + symbol + " long/short",
      status:covered ? "covered" : "blocked",
      detail:covered ? detail + "; OKX fallback live" : detail
    });
  }
}

async function addOkxRatio(currency, id, markets, sources) {
  const url = OKX_RATIO + "?ccy=" + encodeURIComponent(currency) + "&period=1D";
  try {
    const payload = await fetchJson(url);
    const rows = Array.isArray(payload && payload.data) ? payload.data : [];
    const points = rows.map((row) => ({
      ts:Array.isArray(row) ? Number(row[0]) : Number(row && (row.ts || row.timestamp || row[0] || 0)),
      ratio:Array.isArray(row) ? Number(row[1]) : Number(row && (row.longShortRatio || row.ratio || row[1]))
    })).filter((row) => Number.isFinite(row.ratio) && row.ratio > 0);
    const latest = points.reduce((best, row) => row.ts >= best.ts ? row : best, points[0] || { ts:0, ratio:NaN });
    const ratio = latest.ratio;
    if (!Number.isFinite(ratio) || ratio <= 0) throw new Error("empty OKX ratio response");
    const longPct = clamp((ratio / (1 + ratio)) * 100, 0, 100);
    const shortPct = 100 - longPct;
    const nextMarket = {
      id:id,
      longPct:round1(longPct),
      shortPct:round1(shortPct),
      pctile:ratioPercentileFromValues(points.map((row) => row.ratio)),
      source:"live",
      detail:"OKX contracts long/short ratio fallback, " + currency
    };
    const item = markets.find((market) => market.id === id);
    if (item) {
      Object.assign(item, nextMarket);
    } else {
      markets.push(nextMarket);
    }
    sources.push({ source:"OKX " + currency + " long/short", status:"live", detail:"fallback server fetch ok" });
    return true;
  } catch (err) {
    sources.push({ source:"OKX " + currency + " long/short", status:"blocked", detail:cleanError(err) });
    return false;
  }
}

async function addFinraShortVolume(markets, sources) {
  const dates = recentBusinessDates(12);
  const symbols = new Set(["SPY", "QQQ"]);
  for (const ymd of dates) {
    try {
      const text = await fetchText(FINRA_BASE + ymd + ".txt");
      const rows = parsePipeTable(text);
      let found = 0;
      for (const row of rows) {
        const symbol = String(row.Symbol || row.symbol || "").toUpperCase();
        if (!symbols.has(symbol)) continue;
        const shortVolume = Number(row.ShortVolume || row.shortvolume || 0);
        const totalVolume = Number(row.TotalVolume || row.totalvolume || 0);
        if (!totalVolume) continue;
        const shortPct = clamp((shortVolume / totalVolume) * 100, 0, 100);
        markets.push({
          id:symbol === "SPY" ? "spy" : "qqq",
          longPct:round1(100 - shortPct),
          shortPct:round1(shortPct),
          pctile:imbalancePercentile(shortPct),
          source:"live",
          detail:"FINRA daily short-volume file " + ymd + " (short volume share proxy)"
        });
        found++;
      }
      if (found) {
        sources.push({ source:"FINRA CNMS short volume", status:"live", detail:"SPY/QQQ from " + ymd });
        return;
      }
    } catch (_err) {
      // Keep walking back through recent business days.
    }
  }
  sources.push({ source:"FINRA CNMS short volume", status:"blocked", detail:"no recent SPY/QQQ file reachable" });
}

async function addCftcDisaggregated(markets, sources) {
  try {
    const text = await fetchText(CFTC_DISAGG_URL);
    const rows = parseCftcTable(text);
    let found = 0;
    for (const target of CFTC_DISAGG_MARKETS) {
      const row = findCftcRow(rows, target.re);
      if (!row) continue;
      const pair = row._cells ? {
        long:toNumber(row._cells[13]),
        short:toNumber(row._cells[14])
      } : getLongShort(row, [
        ["m_money_positions_long_all", "m_money_positions_short_all"],
        ["managed_money_positions_long_all", "managed_money_positions_short_all"],
        ["money_manager_positions_long_all", "money_manager_positions_short_all"]
      ]);
      if (!pair) continue;
      markets.push(cftcMarket(target.id, pair.long, pair.short, "CFTC disaggregated weekly current file; managed-money positioning"));
      found++;
    }
    sources.push({ source:"CFTC disaggregated COT", status:found ? "live" : "blocked", detail:found ? found + " futures rows parsed" : "target rows not found" });
  } catch (err) {
    sources.push({ source:"CFTC disaggregated COT", status:"blocked", detail:cleanError(err) });
  }
}

async function addCftcFinancial(markets, sources) {
  try {
    const text = await fetchText(CFTC_FINANCIAL_URL);
    const rows = parseCftcTable(text);
    let found = 0;
    for (const target of CFTC_FINANCIAL_MARKETS) {
      const row = findCftcRow(rows, target.re);
      if (!row) continue;
      const asset = row._cells ? { long:toNumber(row._cells[11]), short:toNumber(row._cells[12]) } : getLongShort(row, [["asset_mgr_positions_long_all", "asset_mgr_positions_short_all"]]);
      const lev = row._cells ? { long:toNumber(row._cells[14]), short:toNumber(row._cells[15]) } : getLongShort(row, [["lev_money_positions_long_all", "lev_money_positions_short_all"], ["leveraged_funds_positions_long_all", "leveraged_funds_positions_short_all"]]);
      const long = (asset ? asset.long : 0) + (lev ? lev.long : 0);
      const short = (asset ? asset.short : 0) + (lev ? lev.short : 0);
      if (!long && !short) continue;
      markets.push(cftcMarket(target.id, long, short, "CFTC financial futures weekly current file; asset-manager + leveraged-funds proxy"));
      found++;
    }
    sources.push({ source:"CFTC financial COT", status:found ? "live" : "blocked", detail:found ? found + " index futures rows parsed" : "target rows not found" });
  } catch (err) {
    sources.push({ source:"CFTC financial COT", status:"blocked", detail:cleanError(err) });
  }
}

function cftcMarket(id, long, short, detail) {
  const total = Math.max(1, long + short);
  const longPct = clamp((long / total) * 100, 0, 100);
  const shortPct = clamp((short / total) * 100, 0, 100);
  return {
    id:id,
    longPct:round1(longPct),
    shortPct:round1(shortPct),
    pctile:imbalancePercentile(Math.max(longPct, shortPct)),
    source:"live",
    detail:detail
  };
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

function parsePipeTable(text) {
  const lines = String(text || "").trim().split(/\r?\n/).filter(Boolean);
  if (lines.length < 2) return [];
  const headers = lines[0].split("|").map((h) => h.trim());
  return lines.slice(1).map((line) => {
    const cells = line.split("|");
    const row = {};
    headers.forEach((h, i) => { row[h] = cells[i]; row[normalizeHeader(h)] = cells[i]; });
    return row;
  });
}

function parseCsvTable(text) {
  const lines = String(text || "").replace(/^\uFEFF/, "").trim().split(/\r?\n/).filter(Boolean);
  if (lines.length < 2) return [];
  const headers = parseCsvLine(lines[0]).map(normalizeHeader);
  return lines.slice(1).map((line) => {
    const cells = parseCsvLine(line);
    const row = {};
    headers.forEach((h, i) => { row[h] = cells[i]; });
    return row;
  });
}

function parseCftcTable(text) {
  const lines = String(text || "").replace(/^\uFEFF/, "").trim().split(/\r?\n/).filter(Boolean);
  if (!lines.length) return [];
  const first = parseCsvLine(lines[0]);
  if (/market.*exchange/i.test(String(first[0] || ""))) return parseCsvTable(text);
  return lines.map((line) => {
    const cells = parseCsvLine(line);
    return {
      _cells:cells,
      _market:cells[0],
      market_and_exchange_names:cells[0]
    };
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

function findCftcRow(rows, re) {
  return rows.find((row) => re.test(String(row.market_and_exchange_names || row.market_and_exchange_name || row.market || row._market || "")));
}

function getLongShort(row, pairs) {
  for (const pair of pairs) {
    const long = toNumber(row[pair[0]]);
    const short = toNumber(row[pair[1]]);
    if (Number.isFinite(long) && Number.isFinite(short) && (long || short)) return { long, short };
  }
  return null;
}

function recentBusinessDates(count) {
  const dates = [];
  const date = new Date();
  for (let i = 0; dates.length < count && i < 24; i++) {
    const d = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate() - i));
    const day = d.getUTCDay();
    if (day === 0 || day === 6) continue;
    dates.push(String(d.getUTCFullYear()) + pad2(d.getUTCMonth() + 1) + pad2(d.getUTCDate()));
  }
  return dates;
}

function dedupeMarkets(markets) {
  const byId = new Map();
  for (const market of markets) byId.set(market.id, Object.assign(byId.get(market.id) || {}, market));
  return Array.from(byId.values());
}

function ratioPercentile(rows) {
  const values = rows.map((row) => Math.abs(Number(row.longAccount || 0) - 0.5) * 200).filter(Number.isFinite);
  if (!values.length) return 50;
  const last = values[values.length - 1];
  const below = values.filter((value) => value <= last).length;
  return Math.round((below / values.length) * 100);
}

function ratioPercentileFromValues(values) {
  const clean = values.filter(Number.isFinite);
  if (!clean.length) return 50;
  const transformed = clean.map((ratio) => Math.abs((ratio / (1 + ratio)) * 100 - 50) * 2);
  const last = transformed[transformed.length - 1];
  const below = transformed.filter((value) => value <= last).length;
  return Math.round((below / transformed.length) * 100);
}

function imbalancePercentile(value) {
  return Math.round(clamp(50 + Math.abs(Number(value) - 50) * 1.75, 50, 99));
}

function normalizeHeader(value) {
  return String(value || "").trim().toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "");
}

function toNumber(value) {
  if (value == null || value === "") return NaN;
  return Number(String(value).replace(/,/g, ""));
}

function round1(value) {
  return Math.round(Number(value) * 10) / 10;
}

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

function pad2(n) {
  return String(n).padStart(2, "0");
}

function cleanError(err) {
  return String(err && err.message || err || "fetch failed").slice(0, 110);
}
