import { deriveHiveStatus } from "./utils/hiveStatus";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || "";
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || "";
export const supabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);

function apiUrl(path) {
  return `${SUPABASE_URL}${path}`;
}

function createUuid() {
  if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID();
  const bytes = new Uint8Array(16);
  if (globalThis.crypto?.getRandomValues) {
    globalThis.crypto.getRandomValues(bytes);
  } else {
    for (let index = 0; index < bytes.length; index += 1) bytes[index] = Math.floor(Math.random() * 256);
  }
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = [...bytes].map((value) => value.toString(16).padStart(2, "0"));
  return `${hex.slice(0, 4).join("")}-${hex.slice(4, 6).join("")}-${hex.slice(6, 8).join("")}-${hex.slice(8, 10).join("")}-${hex.slice(10).join("")}`;
}

function authHeaders(accessToken) {
  return {
    apikey: SUPABASE_ANON_KEY,
    Authorization: `Bearer ${accessToken || SUPABASE_ANON_KEY}`,
    "Content-Type": "application/json",
  };
}

async function request(path, { accessToken, method = "GET", body, prefer } = {}) {
  const headers = authHeaders(accessToken);
  if (prefer) headers.Prefer = prefer;
  const response = await fetch(apiUrl(path), {
    method,
    headers,
    cache: "no-store",
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await response.text();
  let payload = null;
  try {
    payload = text ? JSON.parse(text) : null;
  } catch {
    payload = text || null;
  }
  if (!response.ok) {
    throw new Error(payload?.msg || payload?.message || payload?.error_description || String(payload || "Supabase request failed"));
  }
  return payload;
}

function accountEmail(username) {
  const clean = String(username || "").trim().toLowerCase().replace(/[^a-z0-9._-]/g, "");
  return clean.includes("@") ? clean : `${clean}@pametnipanj.local`;
}

function accountPassword(password) {
  return `pp-${String(password || "")}-2026`;
}

export async function signUp(username, password, fullName = "") {
  const clean = String(username || "").trim().toLowerCase().replace(/[^a-z0-9._-]/g, "");
  return request("/auth/v1/signup", { method: "POST", body: { email: accountEmail(clean), password: accountPassword(password), data: { username: clean, full_name: fullName || username } } });
}

export async function signIn(username, password) {
  return request("/auth/v1/token?grant_type=password", { method: "POST", body: { email: accountEmail(username), password: accountPassword(password) } });
}

export async function refreshSession(refreshToken) {
  return request("/auth/v1/token?grant_type=refresh_token", {
    method: "POST",
    body: { refresh_token: refreshToken },
  });
}

export async function fetchProfile(session) {
  const rows = await request(`/rest/v1/users?id=eq.${session.user.id}&select=id,email,username,full_name,role`, { accessToken: session.access_token });
  return rows[0] || null;
}

export async function fetchAdminOverview(session) {
  const accessToken = session.access_token;
  const [profile, users, hives, readings] = await Promise.all([
    fetchProfile(session),
    request("/rest/v1/users?select=id,email,username,full_name,role,created_at&order=created_at.desc", { accessToken }),
    request("/rest/v1/hives?select=*&order=created_at.desc", { accessToken }),
    request("/rest/v1/readings?select=*&order=created_at.desc&limit=100", { accessToken }),
  ]);
  return {
    profile,
    users,
    hives: hives.map(fromHiveRow),
    readings: readings.map(fromReadingRow),
    adminAccess: profile?.role === "admin",
  };
}

export async function saveSimulatorReading(session, userId, hive, values) {
  const now = new Date().toISOString();
  const feedWeightKg = Number(values.feedWeightKg ?? values.foodKg);
  const foodKg = Number(values.foodKg ?? feedWeightKg);
  const derived = deriveHiveStatus({ ...hive, ...values, foodKg });
  const foodDays = derived.foodDays;
  const batteryPct = Number(values.batteryPct);
  const insideTempC = Number(values.insideTempC);
  const previousFoodKg = Number(hive.foodKg || 0);
  const previousWeightKg = Number(hive.weightKg || 0);
  const weightKg = Number(values.weightKg);
  const foodDropKg = Math.max(0, previousFoodKg - foodKg);
  const foodIncreaseKg = Math.max(0, foodKg - previousFoodKg);
  const weightDropKg = Math.max(0, previousWeightKg - weightKg);
  const unexpectedLoss = foodDropKg >= 1 || weightDropKg >= 3;
  const status = derived.status;
  const statusText = derived.statusText;
  const statusRank = { ok: 0, warn: 1, danger: 2 };
  const shouldAlert = unexpectedLoss || statusRank[status] > (statusRank[hive.status] ?? 0);
  const reading = {
    id: createUuid(),
    user_id: userId,
    hive_id: hive.id,
    device_id: hive.deviceId || `SIM-${hive.id}`,
    time_label: new Intl.DateTimeFormat("sl-SI", { hour: "2-digit", minute: "2-digit" }).format(new Date()),
    weight_kg: weightKg,
    temp_c: Number(values.insideTempC),
    humidity_pct: Number(values.insideHumidityPct),
    inside_temp_c: Number(values.insideTempC),
    inside_humidity_pct: Number(values.insideHumidityPct),
    outside_temp_c: Number(values.outsideTempC),
    outside_humidity_pct: Number(values.outsideHumidityPct),
    feed_weight_kg: feedWeightKg,
    pressure_hpa: Number(values.pressureHpa),
    microphone_status: values.microphoneStatus || "",
    camera_status: values.cameraStatus || "",
    battery_pct: Number(values.batteryPct),
    battery_v: Number(values.batteryV),
    solar_v: Number(values.solarV),
    rssi_dbm: Number(values.rssiDbm),
    created_at: now,
    recorded_at: now,
  };
  const savedHives = await request(`/rest/v1/hives?id=eq.${encodeURIComponent(hive.id)}&select=*`, {
    accessToken: session.access_token,
    method: "PATCH",
    prefer: "return=representation",
    body: {
      weight_kg: reading.weight_kg,
      temperature_c: reading.inside_temp_c,
      humidity_pct: reading.inside_humidity_pct,
      battery_pct: reading.battery_pct,
      food_liters: foodKg,
      food_days: foodDays,
      status,
      status_text: statusText,
      signal: "Simulator",
      last_seen: "pravkar",
      latitude: values.latitude === "" ? null : Number(values.latitude),
      longitude: values.longitude === "" ? null : Number(values.longitude),
      location: values.location || hive.location || "",
      location_name: values.location || hive.locationName || hive.location || "",
      data_source: "sensor",
      updated_at: now,
    },
  });
  if (!Array.isArray(savedHives) || !savedHives.length) {
    throw new Error("Strežnik ni potrdil spremembe panja. Preveri skrbniška dovoljenja.");
  }

  const warnings = [];
  const deviceUid = hive.deviceId || `SIM-${hive.id}`;
  try {
    await request("/rest/v1/devices", {
      accessToken: session.access_token,
      method: "POST",
      prefer: "resolution=merge-duplicates",
      body: {
        id: deviceUid,
        user_id: userId,
        hive_id: hive.id,
        device_uid: deviceUid,
        type: "LilyGO",
        name: `Senzor ${hive.name}`,
        status: "online",
        battery_pct: batteryPct,
        firmware_version: "simulator-1.0",
        last_seen: now,
        metadata: {
          source: "admin_simulator",
          rssiDbm: Number(values.rssiDbm),
          solarV: Number(values.solarV),
          feedWeightKg,
          pressureHpa: Number(values.pressureHpa),
          microphoneStatus: values.microphoneStatus || "",
          cameraStatus: values.cameraStatus || "",
        },
        created_at: now,
        updated_at: now,
      },
    });
  } catch (error) {
    warnings.push(`register naprave še ni posodobljen: ${error.message}`);
  }
  try {
    await request("/rest/v1/readings", { accessToken: session.access_token, method: "POST", body: reading });
  } catch (error) {
    warnings.push(`stanje panja je shranjeno, zgodovina meritve pa ne: ${error.message}`);
  }
  if (status !== "ok" && shouldAlert) {
    const lossMessage = unexpectedLoss
      ? `Senzor je zaznal nenaden padec${foodDropKg >= 1 ? ` zaloge hrane za ${foodDropKg.toFixed(1)} kg` : ""}${weightDropKg >= 3 ? `${foodDropKg >= 1 ? " in" : ""} teže za ${weightDropKg.toFixed(1)} kg` : ""}. Preveri panj.`
      : `Hrana ${foodDays} dni, temperatura ${insideTempC} °C, baterija ${batteryPct} %.`;
    try {
      await request("/rest/v1/alerts", {
        accessToken: session.access_token,
        method: "POST",
        body: {
          id: `SIM-${hive.id}-${Date.now()}`,
          user_id: userId,
          hive_id: hive.id,
          severity: status === "danger" ? "danger" : "warn",
          category: unexpectedLoss ? "food_loss" : "sensor",
          title: unexpectedLoss
            ? (status === "danger" ? "Nujen pregled: nenaden padec zaloge" : "Preveri nenaden padec zaloge")
            : (status === "danger" ? "Panj potrebuje ukrep" : "Preveri panj"),
          message: lossMessage,
          value: unexpectedLoss ? `${foodDropKg.toFixed(1)} kg hrane; ${weightDropKg.toFixed(1)} kg teže` : `${foodDays} dni`,
          resolved: false,
          created_at: now,
        },
      });
    } catch (error) {
      warnings.push(`stanje panja je shranjeno, opozorilo pa ne: ${error.message}`);
    }
  }
  if (foodIncreaseKg > 0) {
    try {
      await request(`/rest/v1/alerts?user_id=eq.${encodeURIComponent(userId)}&hive_id=eq.${encodeURIComponent(hive.id)}&category=eq.food_loss`, {
        accessToken: session.access_token,
        method: "PATCH",
        body: { resolved: true },
      });
    } catch (error) {
      warnings.push(`stanje hrane je shranjeno, starega opozorila pa ni bilo mogoče zapreti: ${error.message}`);
    }
  }
  return { hive: fromHiveRow(savedHives[0]), reading: fromReadingRow(reading), warnings };
}

export async function fetchCloudData(session) {
  const accessToken = session.access_token;
  const userFilter = `user_id=eq.${encodeURIComponent(session.user.id)}`;
  const requiredRows = await Promise.all(["hives", "readings"].map((table) => (
    request(`/rest/v1/${table}?${userFilter}&select=*&order=created_at.desc`, { accessToken })
  )));
  const optionalTables = [
    "notes", "voice_actions", "feeding_events", "extraction_events", "reminders", "qr_items",
    "alerts", "events", "pollen_events", "inventory_items", "inventory_transactions", "devices", "scale_measurements",
    "honey_batches", "jar_filling_events",
  ];
  const optionalRows = await Promise.all(optionalTables.map(async (table) => {
    try {
      return await request(`/rest/v1/${table}?${userFilter}&select=*&order=created_at.desc`, { accessToken });
    } catch {
      return [];
    }
  }));
  let systemContent = [];
  let systemContentError = "";
  try {
    systemContent = await request("/rest/v1/system_content?select=*&published=eq.true&order=created_at.desc", { accessToken });
  } catch (error) {
    systemContent = [];
    systemContentError = error.message;
  }
  const [
    notes, voiceActions, feedingEvents, extractionEvents, reminders, qrItems, alerts, events,
    pollenEvents, inventoryItems, inventoryTransactions, devices, scaleMeasurements, honeyBatches, jarFillingEvents,
  ] = optionalRows;
  const [hives, readings] = requiredRows;

  return {
    hives: hives.map(fromHiveRow),
    readings: readings.map(fromReadingRow),
    notes: notes.map(fromNoteRow),
    voiceActions: voiceActions.map(fromVoiceActionRow),
    feedingEvents: feedingEvents.map(fromFeedingRow),
    extractionEvents: extractionEvents.map(fromExtractionRow),
    reminders: reminders.map(fromReminderRow),
    qrItems: qrItems.map(fromQrRow),
    alerts: alerts.map(fromAlertRow),
    events: events.map(fromEventRow),
    pollenEvents: pollenEvents.map(fromPollenRow),
    inventoryItems: inventoryItems.map(fromInventoryItemRow),
    inventoryTransactions: inventoryTransactions.map(fromInventoryTransactionRow),
    devices: devices.map(fromDeviceRow),
    scaleMeasurements: scaleMeasurements.map(fromScaleMeasurementRow),
    honeyBatches: honeyBatches.map(fromHoneyBatchRow),
    jarFillingEvents: jarFillingEvents.map(fromJarFillingRow),
    newsItems: systemContent.filter((item) => item.type === "news").map(fromSystemNewsRow),
    systemEvents: systemContent.filter((item) => item.type === "calendar").map(fromSystemEventRow),
    systemContentError,
  };
}

export async function fetchSystemContent(session) {
  const rows = await request("/rest/v1/system_content?select=*&published=eq.true&order=created_at.desc", { accessToken: session.access_token });
  return {
    newsItems: rows.filter((item) => item.type === "news").map(fromSystemNewsRow),
    systemEvents: rows.filter((item) => item.type === "calendar").map(fromSystemEventRow),
  };
}

export async function saveSystemContent(session, item) {
  const row = {
    id: item.id,
    type: item.type,
    title: item.title,
    body: item.body || "",
    date_label: item.date || "",
    calendar_date: item.calendarDate || null,
    priority: item.priority || "ok",
    source_url: item.sourceUrl || "",
    published: item.published !== false,
    created_by: session.user.id,
    created_at: item.createdAt || new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  await request("/rest/v1/system_content", {
    accessToken: session.access_token,
    method: "POST",
    body: row,
    prefer: "resolution=merge-duplicates",
  });
}

export async function deleteSystemContent(session, id) {
  await request(`/rest/v1/system_content?id=eq.${encodeURIComponent(id)}`, {
    accessToken: session.access_token,
    method: "DELETE",
  });
}

export async function upsertCloudData(session, data) {
  const userId = session.user.id;
  const accessToken = session.access_token;
  const calls = [
    ["hives", data.hives.map((item) => toHiveRow(item, userId))],
    ["readings", data.readings.map((item) => toReadingRow(item, userId))],
    ["notes", data.notes.map((item) => toNoteRow(item, userId))],
    ["voice_actions", (data.voiceActions || []).map((item) => toVoiceActionRow(item, userId))],
    ["feeding_events", data.feedingEvents.map((item) => toFeedingRow(item, userId))],
    ["extraction_events", data.extractionEvents.map((item) => toExtractionRow(item, userId))],
    ["reminders", data.reminders.filter((item) => !/^R-00[5-9]$|^R-01[01]$/.test(item.id)).map((item) => toReminderRow(item, userId))],
    ["qr_items", data.qrItems.map((item) => toQrRow(item, userId))],
    ["alerts", (data.alerts || []).map((item) => toAlertRow(item, userId))],
    ["events", (data.events || []).map((item) => toEventRow(item, userId))],
    ["pollen_events", (data.pollenEvents || []).map((item) => toPollenRow(item, userId))],
    ["inventory_items", (data.inventoryItems || []).map((item) => toInventoryItemRow(item, userId))],
    ["inventory_transactions", (data.inventoryTransactions || []).map((item) => toInventoryTransactionRow(item, userId))],
    ["devices", (data.devices || []).map((item) => toDeviceRow(item, userId))],
    ["scale_measurements", (data.scaleMeasurements || []).map((item) => toScaleMeasurementRow(item, userId))],
    ["honey_batches", (data.honeyBatches || []).map((item) => toHoneyBatchRow(item, userId))],
    ["jar_filling_events", (data.jarFillingEvents || []).map((item) => toJarFillingRow(item, userId))],
  ];

  for (const [table, rows] of calls) {
    if (rows.length) {
      await request(`/rest/v1/${table}`, { accessToken, method: "POST", body: rows, prefer: "resolution=merge-duplicates" });
    }
  }
}

export async function deleteCloudHive(session, hiveId) {
  await request(`/rest/v1/hives?id=eq.${encodeURIComponent(hiveId)}`, { accessToken: session.access_token, method: "DELETE" });
}

export async function resolveCloudAlert(session, alertId) {
  await request(`/rest/v1/alerts?id=eq.${encodeURIComponent(alertId)}`, {
    accessToken: session.access_token,
    method: "PATCH",
    body: { resolved: true },
  });
}

export async function saveCloudNote(session, note) {
  await request("/rest/v1/notes", {
    accessToken: session.access_token,
    method: "POST",
    body: toNoteRow(note, session.user.id),
    prefer: "resolution=merge-duplicates",
  });
}

export async function saveCloudHive(session, hive) {
  const row = toHiveRow(hive, session.user.id);
  try {
    const saved = await request("/rest/v1/hives", {
      accessToken: session.access_token,
      method: "POST",
      body: row,
      prefer: "resolution=merge-duplicates,return=representation",
    });
    if (!Array.isArray(saved) || !saved.length) throw new Error("Strežnik ni vrnil potrjenega panja.");
    return fromHiveRow(saved[0]);
  } catch (error) {
    if (!/frame_count|hive_type|forage|hive_color|frames_occupied|colony_strength|last_feeding_date|schema cache/i.test(error.message)) throw error;
    const legacyRow = { ...row };
    delete legacyRow.frame_count;
    delete legacyRow.hive_type;
    delete legacyRow.forage;
    delete legacyRow.hive_color;
    delete legacyRow.frames_occupied;
    delete legacyRow.colony_strength;
    delete legacyRow.last_feeding_date;
    const saved = await request("/rest/v1/hives", {
      accessToken: session.access_token,
      method: "POST",
      body: legacyRow,
      prefer: "resolution=merge-duplicates,return=representation",
    });
    if (!Array.isArray(saved) || !saved.length) throw new Error("Strežnik ni vrnil potrjenega panja.");
    return fromHiveRow(saved[0]);
  }
}

export async function replaceCloudData(session, data) {
  const accessToken = session.access_token;
  const tables = ["jar_filling_events", "honey_batches", "scale_measurements", "devices", "inventory_transactions", "inventory_items", "pollen_events", "events", "alerts", "qr_items", "reminders", "extraction_events", "feeding_events", "voice_actions", "notes", "readings", "hives"];
  for (const table of tables) {
    await request(`/rest/v1/${table}?user_id=eq.${session.user.id}`, { accessToken, method: "DELETE" });
  }
  await upsertCloudData(session, data);
}

function fromHiveRow(row) {
  return {
    id: row.id, name: row.name, location: row.location || "", queen: row.queen || "", status: row.status,
    statusText: row.status_text, weightKg: Number(row.weight_kg || 0), weeklyDeltaKg: Number(row.weekly_delta_kg || 0),
    foodKg: Number(row.food_liters ?? row.food_kg ?? 0), foodDays: Number(row.food_days || 0), temperatureC: Number(row.temperature_c || 0),
    humidityPct: Number(row.humidity_pct || 0), batteryPct: Number(row.battery_pct || 0), signal: row.signal,
    lastSeen: row.last_seen, qrCode: row.qr_code || "", deviceId: row.device_id || "", deviceApiKey: row.device_api_key || "",
    latitude: row.latitude === null ? "" : Number(row.latitude), longitude: row.longitude === null ? "" : Number(row.longitude),
    locationName: row.location_name || row.location || "", dataSource: row.data_source || "sensor", userId: row.user_id,
    framesOccupied: Number(row.frames_occupied ?? row.frame_count ?? 10), colonyStrength: row.colony_strength || "normal",
    lastFeedingDate: row.last_feeding_date || "",
    frameCount: Number(row.frame_count || 10), hiveType: row.hive_type || "AŽ panj", forage: row.forage || [], hiveColor: row.hive_color || "#E8A020",
    createdAt: row.created_at, updatedAt: row.updated_at,
  };
}

function toHiveRow(item, userId) {
  return {
    id: item.id, user_id: userId, name: item.name, location: item.location, queen: item.queen, status: item.status,
    status_text: item.statusText || "Mirno", weight_kg: item.weightKg ?? 0, weekly_delta_kg: item.weeklyDeltaKg ?? 0,
    food_liters: item.foodKg ?? item.foodLiters ?? 0,
    food_days: item.foodDays ?? 0, temperature_c: item.temperatureC ?? 0, humidity_pct: item.humidityPct ?? 0, battery_pct: item.batteryPct ?? 100,
    signal: item.signal || "Ročno", last_seen: item.lastSeen || "pravkar", qr_code: item.qrCode, device_id: item.deviceId || null,
    device_api_key: item.deviceApiKey || null, latitude: item.latitude || null, longitude: item.longitude || null,
    location_name: item.locationName || item.location || "", data_source: item.dataSource || "sensor",
    frames_occupied: item.framesOccupied ?? item.frameCount ?? 10, colony_strength: item.colonyStrength || "normal",
    last_feeding_date: item.lastFeedingDate || null,
    frame_count: item.frameCount || 10, hive_type: item.hiveType || "AŽ panj", forage: item.forage || [], hive_color: item.hiveColor || "#E8A020",
    created_at: item.createdAt, updated_at: new Date().toISOString(),
  };
}

function fromReadingRow(row) {
  return {
    id: row.id, hiveId: row.hive_id, deviceId: row.device_id || "", time: row.time_label, weightKg: Number(row.weight_kg || 0),
    tempC: Number(row.temp_c || 0), humidityPct: Number(row.humidity_pct || 0),
    insideTempC: Number(row.inside_temp_c ?? row.temp_c ?? 0), insideHumidityPct: Number(row.inside_humidity_pct ?? row.humidity_pct ?? 0),
    outsideTempC: row.outside_temp_c === null ? null : Number(row.outside_temp_c || 0),
    outsideHumidityPct: row.outside_humidity_pct === null ? null : Number(row.outside_humidity_pct || 0),
    feedWeightKg: row.feed_weight_kg === null || row.feed_weight_kg === undefined ? null : Number(row.feed_weight_kg || 0),
    pressureHpa: row.pressure_hpa === null || row.pressure_hpa === undefined ? null : Number(row.pressure_hpa || 0),
    microphoneStatus: row.microphone_status || "",
    cameraStatus: row.camera_status || "",
    soundHz: Number(row.sound_hz || 0), batteryPct: Number(row.battery_pct || 0),
    batteryV: row.battery_v === null ? null : Number(row.battery_v || 0), solarV: row.solar_v === null ? null : Number(row.solar_v || 0),
    rssiDbm: row.rssi_dbm === null ? null : Number(row.rssi_dbm || 0), recordedAt: row.recorded_at, createdAt: row.created_at,
  };
}

function toReadingRow(item, userId) {
  return {
    id: item.id || undefined, user_id: userId, hive_id: item.hiveId, device_id: item.deviceId || null, time_label: item.time, weight_kg: item.weightKg,
    temp_c: item.tempC, humidity_pct: item.humidityPct, inside_temp_c: item.insideTempC ?? item.tempC,
    inside_humidity_pct: item.insideHumidityPct ?? item.humidityPct, outside_temp_c: item.outsideTempC ?? null,
    outside_humidity_pct: item.outsideHumidityPct ?? null, sound_hz: item.soundHz, battery_pct: item.batteryPct,
    feed_weight_kg: item.feedWeightKg ?? null, pressure_hpa: item.pressureHpa ?? null,
    microphone_status: item.microphoneStatus || null, camera_status: item.cameraStatus || null,
    battery_v: item.batteryV ?? null, solar_v: item.solarV ?? null, rssi_dbm: item.rssiDbm ?? null,
    created_at: item.createdAt || new Date().toISOString(),
  };
}

function fromNoteRow(row) {
  return { id: row.id, hiveId: row.hive_id, type: row.type, title: row.title, text: row.text, photoUrl: row.photo_url || "", photoName: row.photo_name || "", photoSizeMb: Number(row.photo_size_mb || 0), photoQuality: row.photo_quality || {}, aiAnalysis: row.ai_analysis || "", date: row.date_label, duration: row.duration, createdAt: row.created_at };
}
function toNoteRow(item, userId) {
  return { id: item.id, user_id: userId, hive_id: item.hiveId, type: item.type, title: item.title, text: item.text, photo_url: item.photoUrl || null, photo_name: item.photoName || null, photo_size_mb: item.photoSizeMb || null, photo_quality: item.photoQuality || {}, ai_analysis: item.aiAnalysis || null, date_label: item.date, duration: item.duration, created_at: item.createdAt };
}
function fromVoiceActionRow(row) {
  return { id: row.id, hiveId: row.hive_id, type: row.type, transcript: row.transcript, fields: row.fields || {}, amount: row.amount === null ? null : Number(row.amount || 0), unit: row.unit || "", note: row.note || "", date: row.date_label, consistency: row.consistency, consistencyStatus: row.consistency_status, createdAt: row.created_at };
}
function toVoiceActionRow(item, userId) {
  return { id: item.id, user_id: userId, hive_id: item.hiveId, type: item.type, transcript: item.transcript, fields: item.fields || {}, amount: item.amount, unit: item.unit, note: item.note, date_label: item.date, consistency: item.consistency, consistency_status: item.consistencyStatus, created_at: item.createdAt };
}
function fromFeedingRow(row) {
  return { id: row.id, hiveId: row.hive_id, date: row.date_label, amountKg: Number(row.amount_liters || 0), feedType: row.feed_type, note: row.note, createdAt: row.created_at };
}
function toFeedingRow(item, userId) {
  return { id: item.id, user_id: userId, hive_id: item.hiveId, date_label: item.date, amount_liters: item.amountKg ?? item.amountLiters, feed_type: item.feedType, note: item.note, created_at: item.createdAt };
}
function fromExtractionRow(row) {
  return { id: row.id, hiveId: row.hive_id, date: row.date_label, honeyType: row.honey_type, frames: Number(row.frames || 0), grossKg: Number(row.gross_kg || 0), emptyKg: Number(row.empty_kg || 0), netKg: Number(row.net_kg || 0), createdAt: row.created_at };
}
function toExtractionRow(item, userId) {
  return { id: item.id, user_id: userId, hive_id: item.hiveId, date_label: item.date, honey_type: item.honeyType, frames: item.frames, gross_kg: item.grossKg, empty_kg: item.emptyKg, net_kg: item.netKg, created_at: item.createdAt };
}
function fromReminderRow(row) {
  return { id: row.id, hiveId: row.hive_id, title: row.title, date: row.date_label, time: row.time_label, category: row.category, priority: row.priority, createdAt: row.created_at };
}
function toReminderRow(item, userId) {
  return { id: item.id, user_id: userId, hive_id: item.hiveId || null, title: item.title, date_label: item.date, time_label: item.time, category: item.category, priority: item.priority, created_at: item.createdAt };
}
function fromSystemNewsRow(row) {
  return { id: row.id, type: "news", title: row.title, body: row.body || "", date: row.date_label || "", calendarDate: row.calendar_date || "", priority: row.priority || "ok", sourceUrl: row.source_url || "", published: row.published, createdAt: row.created_at };
}
function fromSystemEventRow(row) {
  return { id: row.id, type: "calendar", hiveId: "", title: row.title, note: row.body || "", date: row.calendar_date || row.date_label || "", time: "ves dan", category: "sistemsko", priority: row.priority || "ok", sourceUrl: row.source_url || "", published: row.published, createdAt: row.created_at };
}
function fromQrRow(row) {
  return { id: row.id, type: row.type, linkedHiveId: row.linked_hive_id || "", linkedTo: row.linked_to, lastScan: row.last_scan, status: row.status, createdAt: row.created_at };
}
function toQrRow(item, userId) {
  return { id: item.id, user_id: userId, type: item.type, linked_hive_id: item.linkedHiveId || null, linked_to: item.linkedTo, last_scan: item.lastScan, status: item.status, created_at: item.createdAt };
}
function fromAlertRow(row) {
  return { id: row.id, hiveId: row.hive_id, readingId: row.reading_id, severity: row.severity, category: row.category, title: row.title, message: row.message, value: row.value, resolved: row.resolved, createdAt: row.created_at };
}
function toAlertRow(item, userId) {
  return { id: item.id, user_id: userId, hive_id: item.hiveId, reading_id: item.readingId || null, severity: item.severity, category: item.category, title: item.title, message: item.message, value: item.value, resolved: Boolean(item.resolved), created_at: item.createdAt };
}
function fromEventRow(row) {
  return { id: row.id, hiveId: row.hive_id || "", type: row.type, date: row.date_label, source: row.source, status: row.status, originalText: row.original_text, structuredData: row.structured_data || {}, createdAt: row.created_at, updatedAt: row.updated_at };
}
function toEventRow(item, userId) {
  return { id: item.id, user_id: userId, hive_id: item.hiveId || null, type: item.type, date_label: item.date, source: item.source, status: item.status, original_text: item.originalText, structured_data: item.structuredData || {}, created_at: item.createdAt, updated_at: item.updatedAt };
}
function fromPollenRow(row) {
  return { id: row.id, hiveId: row.hive_id || "", amountKg: Number(row.amount_kg || 0), source: row.source, date: row.date_label, notes: row.notes, status: row.status, createdAt: row.created_at, updatedAt: row.updated_at };
}
function toPollenRow(item, userId) {
  return { id: item.id, user_id: userId, hive_id: item.hiveId || null, amount_kg: item.amountKg, source: item.source, date_label: item.date, notes: item.notes, status: item.status, created_at: item.createdAt, updated_at: item.updatedAt };
}
function fromInventoryItemRow(row) {
  return { id: row.id, name: row.name, category: row.category, quantity: Number(row.quantity || 0), unit: row.unit, shelf: row.shelf, lowStockAt: Number(row.low_stock_at || 0), status: row.status, createdAt: row.created_at, updatedAt: row.updated_at };
}
function toInventoryItemRow(item, userId) {
  return { id: item.id, user_id: userId, name: item.name, category: item.category, quantity: item.quantity, unit: item.unit, shelf: item.shelf, low_stock_at: item.lowStockAt, status: item.status, created_at: item.createdAt, updated_at: item.updatedAt };
}
function fromInventoryTransactionRow(row) {
  return { id: row.id, itemId: row.item_id, hiveId: row.hive_id || "", quantity: Number(row.quantity || 0), unit: row.unit, source: row.source, status: row.status, createdAt: row.created_at, updatedAt: row.updated_at };
}
function toInventoryTransactionRow(item, userId) {
  return { id: item.id, user_id: userId, item_id: item.itemId || null, hive_id: item.hiveId || null, quantity: item.quantity, unit: item.unit, source: item.source, status: item.status, created_at: item.createdAt, updated_at: item.updatedAt };
}
function fromDeviceRow(row) {
  return { id: row.id, type: row.type, name: row.name, status: row.status, batteryPct: Number(row.battery_pct || 0), createdAt: row.created_at };
}
function toDeviceRow(item, userId) {
  return { id: item.id, user_id: userId, type: item.type, name: item.name, status: item.status, battery_pct: item.batteryPct, created_at: item.createdAt };
}
function fromScaleMeasurementRow(row) {
  return { id: row.id, hiveId: row.hive_id || "", type: row.type, grossKg: Number(row.gross_kg || 0), tareKg: Number(row.tare_kg || 0), netKg: Number(row.net_kg || 0), source: row.source, status: row.status, createdAt: row.created_at, updatedAt: row.updated_at };
}
function toScaleMeasurementRow(item, userId) {
  return { id: item.id, user_id: userId, hive_id: item.hiveId || null, type: item.type, gross_kg: item.grossKg, tare_kg: item.tareKg, net_kg: item.netKg, source: item.source, status: item.status, created_at: item.createdAt, updated_at: item.updatedAt };
}
function fromHoneyBatchRow(row) {
  return { id: row.id, name: row.name, honeyType: row.honey_type, totalKg: Number(row.total_kg || 0), remainingKg: Number(row.remaining_kg || 0), shelf: row.shelf, status: row.status, createdAt: row.created_at, updatedAt: row.updated_at };
}
function toHoneyBatchRow(item, userId) {
  return { id: item.id, user_id: userId, name: item.name, honey_type: item.honeyType, total_kg: item.totalKg, remaining_kg: item.remainingKg, shelf: item.shelf, status: item.status, created_at: item.createdAt, updated_at: item.updatedAt };
}
function fromJarFillingRow(row) {
  return { id: row.id, batchId: row.batch_id, jarSizeKg: Number(row.jar_size_kg || 0), jarCount: Number(row.jar_count || 0), usedKg: Number(row.used_kg || 0), remainingKg: Number(row.remaining_kg || 0), shelf: row.shelf, status: row.status, date: row.date_label, createdAt: row.created_at, updatedAt: row.updated_at };
}
function toJarFillingRow(item, userId) {
  return { id: item.id, user_id: userId, batch_id: item.batchId || null, jar_size_kg: item.jarSizeKg, jar_count: item.jarCount, used_kg: item.usedKg, remaining_kg: item.remainingKg, shelf: item.shelf, status: item.status, date_label: item.date, created_at: item.createdAt, updated_at: item.updatedAt };
}
