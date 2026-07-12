const SUPABASE_TABLE = process.env.SUPABASE_ANALYTICS_TABLE || "nifty_events";
const MAX_EVENTS = 1200;

module.exports = async function handler(req, res) {
  const start = Date.now();
  const providers = [];
  let events = [];
  try {
    const supabase = await readSupabaseEvents();
    providers.push(supabase.provider);
    events = events.concat(supabase.events);
  } catch (err) {
    providers.push({ source:"Supabase analytics table", status:"unavailable", detail:cleanError(err) });
  }

  try {
    const vercel = await readVercelDeploymentEvents();
    providers.push(vercel.provider);
    events = events.concat(vercel.events);
  } catch (err) {
    providers.push({ source:"Vercel runtime events", status:"unavailable", detail:cleanError(err) });
  }

  events = normalizeEvents(events).slice(0, MAX_EVENTS);
  console.log(JSON.stringify({ level:"info", msg:"admin_metrics_done", events:events.length, ms:Date.now() - start }));
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Cache-Control", "s-maxage=30, stale-while-revalidate=120");
  res.status(200).json({
    ok:true,
    updatedAt:new Date().toISOString(),
    mode:events.length ? "connected" : "local-warmup",
    note:events.length ? "Server analytics source connected." : "No server analytics source configured yet. Admin will use local browser events.",
    events,
    providers
  });
};

async function readSupabaseEvents() {
  const url = trimSlash(process.env.SUPABASE_URL || "");
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || "";
  if (!url || !key) {
    return { events:[], provider:{ source:"Supabase analytics table", status:"not configured", detail:"Set SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY and SUPABASE_ANALYTICS_TABLE" } };
  }
  const endpoint = url + "/rest/v1/" + encodeURIComponent(SUPABASE_TABLE) + "?select=*&order=ts.desc&limit=" + MAX_EVENTS;
  const response = await fetch(endpoint, {
    headers:{
      "apikey":key,
      "authorization":"Bearer " + key,
      "accept":"application/json"
    },
    cache:"no-store"
  });
  if (!response.ok) throw new Error("Supabase HTTP " + response.status);
  const rows = await response.json();
  return {
    events:Array.isArray(rows) ? rows : [],
    provider:{ source:"Supabase analytics table", status:"live", detail:(Array.isArray(rows) ? rows.length : 0) + " events read from " + SUPABASE_TABLE }
  };
}

async function readVercelDeploymentEvents() {
  const token = process.env.VERCEL_TOKEN || "";
  const deploymentId = process.env.VERCEL_DEPLOYMENT_ID || process.env.VERCEL_DEPLOYMENT || "";
  if (!token || !deploymentId) {
    return { events:[], provider:{ source:"Vercel runtime events", status:"not configured", detail:"Set VERCEL_TOKEN and VERCEL_DEPLOYMENT_ID for runtime event sampling" } };
  }
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 12000);
  try {
    const response = await fetch("https://api.vercel.com/v3/deployments/" + encodeURIComponent(deploymentId) + "/events?limit=100", {
      headers:{ "authorization":"Bearer " + token },
      signal:controller.signal,
      cache:"no-store"
    });
    if (!response.ok) throw new Error("Vercel HTTP " + response.status);
    const text = await response.text();
    const lines = text.split(/\n+/).filter(Boolean);
    const events = lines.map((line) => {
      try { return JSON.parse(line); }
      catch (_err) { return null; }
    }).filter(Boolean).map((event) => ({
      event:event.level === "error" ? "error" : "runtime_log",
      page:"server",
      tool:"Vercel Runtime",
      message:event.text || event.message || "",
      ts:safeIso(event.timestamp || Date.now()),
      source:"vercel"
    }));
    return { events, provider:{ source:"Vercel runtime events", status:"live", detail:events.length + " deployment events sampled" } };
  } finally {
    clearTimeout(timer);
  }
}

function normalizeEvents(rows) {
  return (rows || []).map((row) => {
    const payload = row.payload && typeof row.payload === "object" ? row.payload : row;
    const type = payload.event || payload.name || payload.type || "analytics_event";
    const page = payload.page || payload.path || payload.url || row.path || "";
    return {
      event:String(type).slice(0, 64),
      page:String(page).replace(/^https?:\/\/[^/]+/i, "").replace(/^\//, "").replace(/\.html$/i, "") || "unknown",
      path:payload.path || payload.url || "",
      tool:payload.tool || payload.title || "",
      action:payload.action || "",
      term:payload.term || "",
      referrer:payload.referrer || payload.source || "",
      source:payload.source || row.source || "server",
      session:payload.session || payload.session_id || row.session_id || "",
      ts:safeIso(payload.ts || payload.timestamp || row.ts || row.created_at || Date.now()),
      source_status:payload.source_status || payload.truth || payload.status || ""
    };
  }).sort((a, b) => Date.parse(b.ts) - Date.parse(a.ts));
}

function safeIso(value) {
  const date = new Date(value || Date.now());
  return Number.isNaN(date.getTime()) ? new Date().toISOString() : date.toISOString();
}

function trimSlash(value) {
  return String(value || "").replace(/\/+$/, "");
}

function cleanError(err) {
  if (err && err.name === "AbortError") return "request timed out";
  return String(err && err.message || err || "not available").slice(0, 140);
}
