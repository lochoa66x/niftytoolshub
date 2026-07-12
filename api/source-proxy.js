const USER_AGENT = "NiftyToolsHub/1.0 source-proxy";

const STATIC_SOURCES = {
  "status-cloudflare": "https://www.cloudflarestatus.com/api/v2/summary.json",
  "status-openai": "https://status.openai.com/api/v2/summary.json",
  "status-github": "https://www.githubstatus.com/api/v2/summary.json",
  "status-vercel": "https://www.vercel-status.com/api/v2/summary.json",
  "status-discord": "https://discordstatus.com/api/v2/summary.json",
  "status-atlassian": "https://status.atlassian.com/api/v2/summary.json",
  "status-stripe": "https://www.stripestatus.com/api/v2/summary.json",
  "status-zoom": "https://status.zoom.us/api/v2/summary.json",
  "sans-topports": "https://isc.sans.edu/api/topports/records/12?json",
  "sans-sources": "https://isc.sans.edu/api/sources/attacks/24?json",
  "sans-infocon": "https://isc.sans.edu/api/infocon?json",
  "cisa-kev": "https://www.cisa.gov/sites/default/files/feeds/known_exploited_vulnerabilities.json",
  "noaa-kp": "https://services.swpc.noaa.gov/products/noaa-planetary-k-index-forecast.json",
  "noaa-ovation": "https://services.swpc.noaa.gov/json/ovation_aurora_latest.json",
  "usgs-quakes": "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson",
  "coingecko-market": "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,tether,usd-coin&vs_currencies=usd&include_24hr_change=true"
};

module.exports = async function handler(req, res) {
  const start = Date.now();
  const query = normalizeQuery(req);
  const source = String(query.source || "").trim();
  const requestId = req.headers && req.headers["x-vercel-id"] || "";
  try {
    const target = buildTarget(source, query);
    if (!target) {
      res.status(400).json({ ok:false, error:"unknown or incomplete source", allowed:Object.keys(STATIC_SOURCES).concat(["gdelt-doc", "wikimedia-pageviews", "wikipedia-search", "openfda-food"]) });
      return;
    }
    console.log(JSON.stringify({ level:"info", msg:"source_proxy_start", source, requestId }));
    const payload = await fetchPayload(target.url, target.timeout || 11000);
    console.log(JSON.stringify({ level:"info", msg:"source_proxy_done", source, ms:Date.now() - start }));
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Cache-Control", target.cache || "s-maxage=180, stale-while-revalidate=1200");
    res.status(200).json({
      ok:true,
      source,
      url:target.publicUrl || target.url,
      updatedAt:new Date().toISOString(),
      data:payload.data,
      contentType:payload.contentType
    });
  } catch (err) {
    console.error(JSON.stringify({ level:"error", msg:"source_proxy_failed", source, error:cleanError(err), ms:Date.now() - start }));
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.status(502).json({ ok:false, source, error:cleanError(err), updatedAt:new Date().toISOString() });
  }
};

function normalizeQuery(req) {
  if (req && req.query && typeof req.query === "object") return req.query;
  try {
    const url = new URL(req && req.url || "/", "https://niftytoolshub.com");
    return Object.fromEntries(url.searchParams.entries());
  } catch (_err) {
    return {};
  }
}

function buildTarget(source, query) {
  if (STATIC_SOURCES[source]) return { url:STATIC_SOURCES[source] };
  if (source === "gdelt-doc") {
    const q = cleanText(query.q || query.query, 260);
    if (!q) return null;
    const timespan = cleanChoice(query.timespan, ["24h", "48h", "7d", "14d"], "7d");
    const maxrecords = clamp(Number(query.maxrecords || 80), 10, 250);
    return {
      url:"https://api.gdeltproject.org/api/v2/doc/doc?query=" + encodeURIComponent(q) + "&mode=ArtList&format=json&timespan=" + timespan + "&maxrecords=" + maxrecords + "&sort=HybridRel",
      cache:"s-maxage=300, stale-while-revalidate=1800"
    };
  }
  if (source === "wikimedia-pageviews") {
    const title = cleanText(query.title, 180);
    const start = cleanDate(query.start);
    const end = cleanDate(query.end);
    if (!title || !start || !end) return null;
    return {
      url:"https://wikimedia.org/api/rest_v1/metrics/pageviews/per-article/en.wikipedia/all-access/user/" + encodeURIComponent(title) + "/daily/" + start + "/" + end + "?origin=*",
      publicUrl:"https://wikimedia.org/pageviews/" + encodeURIComponent(title),
      cache:"s-maxage=900, stale-while-revalidate=3600"
    };
  }
  if (source === "wikipedia-search") {
    const q = cleanText(query.q || query.query, 160);
    if (!q) return null;
    return {
      url:"https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=" + encodeURIComponent(q) + "&format=json&origin=*",
      cache:"s-maxage=900, stale-while-revalidate=3600"
    };
  }
  if (source === "openfda-food") {
    const search = cleanText(query.search || 'report_date:[NOW-30DAY TO NOW]', 220);
    const limit = clamp(Number(query.limit || 50), 1, 100);
    return {
      url:"https://api.fda.gov/food/enforcement.json?search=" + encodeURIComponent(search) + "&limit=" + limit,
      cache:"s-maxage=900, stale-while-revalidate=3600"
    };
  }
  return null;
}

async function fetchPayload(url, timeout) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);
  try {
    const response = await fetch(url, {
      headers:{ "user-agent":USER_AGENT, "accept":"application/json,text/plain,*/*" },
      cache:"no-store",
      signal:controller.signal
    });
    if (!response.ok) throw new Error("HTTP " + response.status);
    const contentType = response.headers.get("content-type") || "";
    if (/json/i.test(contentType)) return { contentType, data:await response.json() };
    const text = await response.text();
    try {
      return { contentType:"application/json", data:JSON.parse(text) };
    } catch (_err) {
      return { contentType, data:text.slice(0, 250000) };
    }
  } finally {
    clearTimeout(timer);
  }
}

function cleanText(value, max) {
  return String(value || "").replace(/[<>]/g, "").replace(/\s+/g, " ").trim().slice(0, max || 120);
}

function cleanChoice(value, allowed, fallback) {
  value = String(value || "").toLowerCase();
  return allowed.includes(value) ? value : fallback;
}

function cleanDate(value) {
  const raw = String(value || "").replace(/[^0-9]/g, "");
  return raw.length === 8 ? raw : "";
}

function clamp(value, min, max) {
  value = Number.isFinite(value) ? value : min;
  return Math.max(min, Math.min(max, value));
}

function cleanError(err) {
  if (err && err.name === "AbortError") return "source timed out";
  return String(err && err.message || err || "fetch failed").slice(0, 140);
}
