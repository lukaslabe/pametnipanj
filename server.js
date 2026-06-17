import http from "node:http";
import { readFileSync, existsSync } from "node:fs";

loadEnvFile();

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || "";
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
const PORT = Number(process.env.DEVICE_INGEST_PORT || 8787);

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.warn("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY. /api/readings/ingest will return 500.");
}

const server = http.createServer(async (req, res) => {
  setCors(res);

  if (req.method === "OPTIONS") {
    res.writeHead(204);
    res.end();
    return;
  }

  if (req.method !== "POST" || new URL(req.url, "http://localhost").pathname !== "/api/readings/ingest") {
    sendJson(res, 404, { error: "not_found" });
    return;
  }

  try {
    if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
      sendJson(res, 500, { error: "server_not_configured" });
      return;
    }

    const payload = await readJson(req);
    const validationError = validatePayload(payload);
    if (validationError) {
      sendJson(res, 400, { error: "invalid_payload", detail: validationError });
      return;
    }

    const hive = await findHiveForDevice(payload.deviceId);
    if (!hive || hive.device_api_key !== payload.apiKey) {
      sendJson(res, 401, { error: "invalid_device_credentials" });
      return;
    }

    const previousReading = await fetchPreviousReading(hive.id);
    const reading = await insertReading(hive, payload);
    const status = calculateHiveStatus(payload, previousReading);
    const alerts = buildAlerts(hive, payload, previousReading, reading.id);

    await updateHiveFromReading(hive, payload, status, previousReading);
    if (alerts.length) {
      await insertAlerts(alerts);
    }

    sendJson(res, 201, {
      ok: true,
      hiveId: hive.id,
      readingId: reading.id,
      status: status.status,
      statusText: status.statusText,
      alertsCreated: alerts.length,
      alerts,
    });
  } catch (error) {
    console.error(error);
    sendJson(res, 500, { error: "ingest_failed", detail: error.message });
  }
});

server.listen(PORT, "127.0.0.1", () => {
  console.log(`BeeCare ingest API listening on http://127.0.0.1:${PORT}`);
});

function loadEnvFile() {
  if (!existsSync(".env")) return;
  const contents = readFileSync(".env", "utf8");
  for (const line of contents.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#") || !trimmed.includes("=")) continue;
    const [key, ...rest] = trimmed.split("=");
    if (!process.env[key]) {
      process.env[key] = rest.join("=").replace(/^["']|["']$/g, "");
    }
  }
}

function setCors(res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
}

function sendJson(res, statusCode, payload) {
  res.writeHead(statusCode, { "Content-Type": "application/json" });
  res.end(JSON.stringify(payload));
}

function readJson(req) {
  return new Promise((resolve, reject) => {
    let raw = "";
    req.on("data", (chunk) => {
      raw += chunk;
      if (raw.length > 1024 * 1024) {
        reject(new Error("Payload too large"));
        req.destroy();
      }
    });
    req.on("end", () => {
      try {
        resolve(JSON.parse(raw || "{}"));
      } catch {
        reject(new Error("Invalid JSON"));
      }
    });
    req.on("error", reject);
  });
}

function validatePayload(payload) {
  const requiredStrings = ["deviceId", "apiKey", "timestamp"];
  for (const field of requiredStrings) {
    if (!payload[field] || typeof payload[field] !== "string") return `${field} is required`;
  }

  if (Number.isNaN(Date.parse(payload.timestamp))) return "timestamp must be ISO date";

  const numericFields = [
    "weightKg",
    "insideTempC",
    "insideHumidityPct",
    "outsideTempC",
    "outsideHumidityPct",
    "batteryPct",
    "batteryV",
    "solarV",
    "rssiDbm",
  ];
  const optionalNumericFields = ["feedWeightKg", "pressureHpa", "soundHz"];

  for (const field of numericFields) {
    if (!Number.isFinite(Number(payload[field]))) return `${field} must be numeric`;
  }
  for (const field of optionalNumericFields) {
    if (payload[field] !== undefined && payload[field] !== null && payload[field] !== "" && !Number.isFinite(Number(payload[field]))) {
      return `${field} must be numeric`;
    }
  }

  if (payload.insideHumidityPct < 0 || payload.insideHumidityPct > 100) return "insideHumidityPct must be 0-100";
  if (payload.outsideHumidityPct < 0 || payload.outsideHumidityPct > 100) return "outsideHumidityPct must be 0-100";
  if (payload.batteryPct < 0 || payload.batteryPct > 100) return "batteryPct must be 0-100";
  return "";
}

async function findHiveForDevice(deviceId) {
  const byDevice = await supabaseGet(`/rest/v1/hives?select=*&device_id=eq.${encodeURIComponent(deviceId)}&limit=1`);
  if (byDevice.length) return byDevice[0];
  const byHiveId = await supabaseGet(`/rest/v1/hives?select=*&id=eq.${encodeURIComponent(deviceId)}&limit=1`);
  return byHiveId[0] || null;
}

async function fetchPreviousReading(hiveId) {
  const rows = await supabaseGet(`/rest/v1/readings?select=*&hive_id=eq.${encodeURIComponent(hiveId)}&order=recorded_at.desc&limit=1`);
  return rows[0] || null;
}

async function insertReading(hive, payload) {
  const row = {
    user_id: hive.user_id,
    hive_id: hive.id,
    recorded_at: payload.timestamp,
    time_label: formatTimeLabel(payload.timestamp),
    weight_kg: payload.weightKg,
    temp_c: payload.insideTempC,
    humidity_pct: payload.insideHumidityPct,
    inside_temp_c: payload.insideTempC,
    inside_humidity_pct: payload.insideHumidityPct,
    outside_temp_c: payload.outsideTempC,
    outside_humidity_pct: payload.outsideHumidityPct,
    feed_weight_kg: payload.feedWeightKg === undefined ? null : Number(payload.feedWeightKg),
    pressure_hpa: payload.pressureHpa === undefined ? null : Number(payload.pressureHpa),
    sound_hz: payload.soundHz === undefined ? null : Math.round(Number(payload.soundHz)),
    microphone_status: payload.microphoneStatus || "",
    camera_status: payload.cameraStatus || "",
    battery_pct: payload.batteryPct,
    battery_v: payload.batteryV,
    solar_v: payload.solarV,
    rssi_dbm: payload.rssiDbm,
  };
  const rows = await supabasePost("/rest/v1/readings?select=*", row);
  return rows[0];
}

async function updateHiveFromReading(hive, payload, status, previousReading) {
  const previousWeight = previousReading ? Number(previousReading.weight_kg || 0) : Number(hive.weight_kg || 0);
  const weightDelta = roundOne(payload.weightKg - previousWeight);
  const feedWeightKg = payload.feedWeightKg === undefined || payload.feedWeightKg === null || payload.feedWeightKg === "" ? null : Number(payload.feedWeightKg);
  const foodPatch = feedWeightKg === null ? {} : {
    food_liters: feedWeightKg,
    food_days: Math.max(0, Math.round(feedWeightKg / 1.4)),
  };
  await supabasePatch(`/rest/v1/hives?id=eq.${encodeURIComponent(hive.id)}`, {
    status: status.status,
    status_text: status.statusText,
    weight_kg: payload.weightKg,
    weekly_delta_kg: weightDelta,
    temperature_c: payload.insideTempC,
    humidity_pct: Math.round(payload.insideHumidityPct),
    battery_pct: Math.round(payload.batteryPct),
    signal: `${payload.rssiDbm} dBm`,
    last_seen: "pravkar",
    ...foodPatch,
    updated_at: new Date().toISOString(),
  });
}

function calculateHiveStatus(payload, previousReading) {
  const weightDrop = previousReading ? Number(previousReading.weight_kg || 0) - payload.weightKg : 0;
  const feedWeightKg = payload.feedWeightKg === undefined || payload.feedWeightKg === null || payload.feedWeightKg === "" ? null : Number(payload.feedWeightKg);
  const previousInsideTemp = previousReading ? Number(previousReading.inside_temp_c || previousReading.temp_c || 0) : null;
  const tempDrop = previousInsideTemp ? previousInsideTemp - Number(payload.insideTempC) : 0;
  if (
    payload.batteryPct <= 20 ||
    (feedWeightKg !== null && feedWeightKg < 3) ||
    payload.insideTempC < 30 ||
    payload.insideTempC > 38 ||
    payload.insideHumidityPct >= 82 ||
    weightDrop >= 2.5 ||
    tempDrop >= 8
  ) {
    return { status: "danger", statusText: "Ukrepaj" };
  }
  if (
    payload.batteryPct <= 40 ||
    (feedWeightKg !== null && feedWeightKg < 6) ||
    payload.rssiDbm <= -90 ||
    payload.solarV < 4.6 ||
    payload.insideTempC < 32 ||
    payload.insideTempC > 36 ||
    payload.insideHumidityPct >= 75 ||
    weightDrop >= 1
  ) {
    return { status: "warn", statusText: "Preveri" };
  }
  return { status: "ok", statusText: "Mirno" };
}

function buildAlerts(hive, payload, previousReading, readingId) {
  const alerts = [];
  const previousWeight = previousReading ? Number(previousReading.weight_kg || 0) : null;
  const weightDrop = previousWeight === null ? 0 : previousWeight - payload.weightKg;
  const feedWeightKg = payload.feedWeightKg === undefined || payload.feedWeightKg === null || payload.feedWeightKg === "" ? null : Number(payload.feedWeightKg);
  const previousInsideTemp = previousReading ? Number(previousReading.inside_temp_c || previousReading.temp_c || 0) : null;
  const tempDrop = previousInsideTemp ? previousInsideTemp - Number(payload.insideTempC) : 0;

  addAlertIf(alerts, payload.batteryPct <= 20, hive, readingId, "danger", "battery", "Nizka baterija", `Baterija je ${payload.batteryPct}%. Napolni ali preveri napajanje.`, `${payload.batteryPct}%`);
  addAlertIf(alerts, payload.batteryPct > 20 && payload.batteryPct <= 40, hive, readingId, "warn", "battery", "Baterija pada", `Baterija je ${payload.batteryPct}%.`, `${payload.batteryPct}%`);
  addAlertIf(alerts, payload.solarV < 4.6, hive, readingId, "warn", "solar", "Solarno polnjenje je sibko", `Solarna napetost je ${payload.solarV} V.`, `${payload.solarV} V`);
  addAlertIf(alerts, payload.rssiDbm <= -90, hive, readingId, "warn", "signal", "Slab signal", `Signal je ${payload.rssiDbm} dBm.`, `${payload.rssiDbm} dBm`);
  addAlertIf(alerts, payload.insideTempC < 30 || payload.insideTempC > 38, hive, readingId, "danger", "temperature", "Temperatura v panju ni normalna", `Notranja temperatura je ${payload.insideTempC} °C.`, `${payload.insideTempC} °C`);
  addAlertIf(alerts, payload.insideTempC >= 30 && (payload.insideTempC < 32 || payload.insideTempC > 36), hive, readingId, "warn", "temperature", "Preveri temperaturo", `Notranja temperatura je ${payload.insideTempC} °C.`, `${payload.insideTempC} °C`);
  addAlertIf(alerts, payload.insideHumidityPct >= 82, hive, readingId, "danger", "humidity", "Vlaga je previsoka", `Notranja vlaga je ${payload.insideHumidityPct}%.`, `${payload.insideHumidityPct}%`);
  addAlertIf(alerts, payload.insideHumidityPct >= 75 && payload.insideHumidityPct < 82, hive, readingId, "warn", "humidity", "Vlaga narasca", `Notranja vlaga je ${payload.insideHumidityPct}%.`, `${payload.insideHumidityPct}%`);
  addAlertIf(alerts, weightDrop >= 2.5, hive, readingId, "danger", "weight", "Teza hitro pada", `Panj je izgubil ${roundOne(weightDrop)} kg od zadnjega odcitka.`, `${roundOne(weightDrop)} kg`);
  addAlertIf(alerts, weightDrop >= 1 && weightDrop < 2.5, hive, readingId, "warn", "weight", "Preveri padec teze", `Panj je izgubil ${roundOne(weightDrop)} kg od zadnjega odcitka.`, `${roundOne(weightDrop)} kg`);
  addAlertIf(alerts, feedWeightKg !== null && feedWeightKg < 3, hive, readingId, "danger", "food", "Hrane v pitalniku je malo", `Pitalnik kaže ${roundOne(feedWeightKg)} kg hrane.`, `${roundOne(feedWeightKg)} kg`);
  addAlertIf(alerts, feedWeightKg !== null && feedWeightKg >= 3 && feedWeightKg < 6, hive, readingId, "warn", "food", "Preveri pitalnik", `Pitalnik kaže ${roundOne(feedWeightKg)} kg hrane.`, `${roundOne(feedWeightKg)} kg`);
  addAlertIf(alerts, tempDrop >= 8, hive, readingId, "danger", "temperature", "Nenaden padec temperature", `Notranja temperatura je padla za ${roundOne(tempDrop)} °C od zadnjega odčitka. Pozimi preveri, ali je bil panj odprt.`, `${roundOne(tempDrop)} °C`);

  return alerts;
}

function addAlertIf(alerts, condition, hive, readingId, severity, category, title, message, value) {
  if (!condition) return;
  alerts.push({
    id: makeId("A"),
    user_id: hive.user_id,
    hive_id: hive.id,
    reading_id: readingId,
    severity,
    category,
    title,
    message,
    value,
    resolved: false,
    created_at: new Date().toISOString(),
  });
}

async function insertAlerts(alerts) {
  await supabasePost("/rest/v1/alerts", alerts);
}

async function supabaseGet(path) {
  return supabaseRequest(path, { method: "GET" });
}

async function supabasePost(path, body) {
  return supabaseRequest(path, { method: "POST", body, prefer: "return=representation" });
}

async function supabasePatch(path, body) {
  return supabaseRequest(path, { method: "PATCH", body, prefer: "return=minimal" });
}

async function supabaseRequest(path, { method, body, prefer }) {
  const headers = {
    apikey: SERVICE_ROLE_KEY,
    Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
    "Content-Type": "application/json; charset=utf-8",
  };
  if (prefer) headers.Prefer = prefer;

  const response = await fetch(`${SUPABASE_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await response.text();
  const payload = text ? JSON.parse(text) : null;
  if (!response.ok) {
    throw new Error(payload?.message || payload?.details || text || `Supabase ${method} failed`);
  }
  return payload || [];
}

function formatTimeLabel(timestamp) {
  return new Intl.DateTimeFormat("sl-SI", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(timestamp));
}

function makeId(prefix) {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`.toUpperCase();
}

function roundOne(value) {
  return Math.round(value * 10) / 10;
}
