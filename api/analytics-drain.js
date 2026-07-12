const crypto = require("crypto");

module.exports = async function handler(req, res) {
  const started = Date.now();
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    res.status(405).json({ ok:false, error:"POST only" });
    return;
  }

  try {
    const rawBody = await readBody(req);
    const secret = process.env.VERCEL_DRAIN_SECRET || "";
    if (secret && !verifySignature(rawBody, req.headers["x-vercel-signature"], secret)) {
      res.status(401).json({ ok:false, error:"invalid drain signature" });
      return;
    }

    const events = parseDrainPayload(rawBody);
    const stored = await writeSupabase(events);
    console.log(JSON.stringify({ level:"info", msg:"analytics_drain_received", events:events.length, stored, ms:Date.now() - started }));
    res.status(200).json({
      ok:true,
      received:events.length,
      stored,
      mode:stored ? "supabase" : "log-only"
    });
  } catch (err) {
    console.error(JSON.stringify({ level:"error", msg:"analytics_drain_failed", error:cleanError(err), ms:Date.now() - started }));
    res.status(500).json({ ok:false, error:cleanError(err) });
  }
};

async function writeSupabase(events) {
  const url = trimSlash(process.env.SUPABASE_URL || "");
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
  const table = process.env.SUPABASE_ANALYTICS_TABLE || "nifty_events";
  if (!url || !key || !events.length) return 0;
  const rows = events.map((event) => ({
    event:event.event,
    page:event.page,
    path:event.path,
    source:event.source,
    referrer:event.referrer,
    session:event.session,
    ts:event.ts,
    payload:event
  }));
  const response = await fetch(url + "/rest/v1/" + encodeURIComponent(table), {
    method:"POST",
    headers:{
      "apikey":key,
      "authorization":"Bearer " + key,
      "content-type":"application/json",
      "prefer":"return=minimal"
    },
    body:JSON.stringify(rows)
  });
  if (!response.ok) throw new Error("Supabase insert HTTP " + response.status);
  return rows.length;
}

function parseDrainPayload(rawBody) {
  const text = String(rawBody || "").trim();
  if (!text) return [];
  let items;
  if (text[0] === "[") {
    items = JSON.parse(text);
  } else {
    items = text.split(/\n+/).map((line) => JSON.parse(line));
  }
  return (Array.isArray(items) ? items : [items]).filter(Boolean).map(normalizeDrainEvent);
}

function normalizeDrainEvent(item) {
  const path = item.url || item.path || "";
  const event = item.name || item.type || "vercel_event";
  const ts = safeIso(item.timestamp || Date.now());
  return {
    event:String(event).slice(0, 64),
    page:String(path).replace(/^https?:\/\/[^/]+/i, "").replace(/^\//, "").replace(/\.html$/i, "") || "unknown",
    path:path,
    source:"vercel-drain",
    referrer:item.referrer || "",
    session:item.sessionId || item.session || "",
    ts:ts,
    country:item.geo && item.geo.country || "",
    device:item.device && (item.device.browser || item.device.os) || "",
    is_bot:item.device && item.device.isBot === true,
    payload:item
  };
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let body = "";
    req.setEncoding("utf8");
    req.on("data", (chunk) => {
      body += chunk;
      if (body.length > 2_000_000) {
        reject(new Error("payload too large"));
        req.destroy();
      }
    });
    req.on("end", () => resolve(body));
    req.on("error", reject);
  });
}

function verifySignature(rawBody, signature, secret) {
  if (!signature) return false;
  const expected = crypto.createHmac("sha1", secret).update(rawBody).digest("hex");
  const left = Buffer.from(String(signature));
  const right = Buffer.from(expected);
  return left.length === right.length && crypto.timingSafeEqual(left, right);
}

function trimSlash(value) {
  return String(value || "").replace(/\/+$/, "");
}

function safeIso(value) {
  const date = new Date(value || Date.now());
  return Number.isNaN(date.getTime()) ? new Date().toISOString() : date.toISOString();
}

function cleanError(err) {
  return String(err && err.message || err || "drain failed").slice(0, 140);
}
