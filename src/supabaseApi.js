const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || "";
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || "";

export const supabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);

function apiUrl(path) {
  return `${SUPABASE_URL}${path}`;
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
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await response.text();
  const payload = text ? JSON.parse(text) : null;
  if (!response.ok) {
    throw new Error(payload.msg || payload.message || payload.error_description || "Supabase request failed");
  }
  return payload;
}

export async function signUp(email, password) {
  return request("/auth/v1/signup", { method: "POST", body: { email, password } });
}

export async function signIn(email, password) {
  return request("/auth/v1/token?grant_type=password", { method: "POST", body: { email, password } });
}

export async function fetchCloudData(session) {
  const accessToken = session.access_token;
  const tables = [
    "hives", "readings", "notes", "voice_actions", "feeding_events", "extraction_events", "reminders", "qr_items",
    "alerts", "events", "pollen_events", "inventory_items", "inventory_transactions", "devices", "scale_measurements",
    "honey_batches", "jar_filling_events",
  ];
  const rows = await Promise.all(tables.map((table) => request(`/rest/v1/${table}?select=*&order=created_at.desc`, { accessToken })));
  const [
    hives, readings, notes, voiceActions, feedingEvents, extractionEvents, reminders, qrItems, alerts, events,
    pollenEvents, inventoryItems, inventoryTransactions, devices, scaleMeasurements, honeyBatches, jarFillingEvents,
  ] = rows;

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
  };
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
    ["reminders", data.reminders.map((item) => toReminderRow(item, userId))],
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
  await request(`/rest/v1/hivesid=eq.${encodeURIComponent(hiveId)}`, { accessToken: session.access_token, method: "DELETE" });
}

export async function replaceCloudData(session, data) {
  const accessToken = session.access_token;
  const tables = ["jar_filling_events", "honey_batches", "scale_measurements", "devices", "inventory_transactions", "inventory_items", "pollen_events", "events", "alerts", "qr_items", "reminders", "extraction_events", "feeding_events", "voice_actions", "notes", "readings", "hives"];
  for (const table of tables) {
    await request(`/rest/v1/${table}user_id=eq.${session.user.id}`, { accessToken, method: "DELETE" });
  }
  await upsertCloudData(session, data);
}

function fromHiveRow(row) {
  return {
    id: row.id, name: row.name, location: row.location || "", queen: row.queen || "", status: row.status,
    statusText: row.status_text, weightKg: Number(row.weight_kg || 0), weeklyDeltaKg: Number(row.weekly_delta_kg || 0),
    foodLiters: Number(row.food_liters || 0), foodDays: Number(row.food_days || 0), temperatureC: Number(row.temperature_c || 0),
    humidityPct: Number(row.humidity_pct || 0), batteryPct: Number(row.battery_pct || 0), signal: row.signal,
    lastSeen: row.last_seen, qrCode: row.qr_code || "", deviceId: row.device_id || "", deviceApiKey: row.device_api_key || "",
    createdAt: row.created_at,
  };
}

function toHiveRow(item, userId) {
  return {
    id: item.id, user_id: userId, name: item.name, location: item.location, queen: item.queen, status: item.status,
    status_text: item.statusText, weight_kg: item.weightKg, weekly_delta_kg: item.weeklyDeltaKg, food_liters: item.foodLiters,
    food_days: item.foodDays, temperature_c: item.temperatureC, humidity_pct: item.humidityPct, battery_pct: item.batteryPct,
    signal: item.signal, last_seen: item.lastSeen, qr_code: item.qrCode, device_id: item.deviceId || null,
    device_api_key: item.deviceApiKey || null, created_at: item.createdAt, updated_at: new Date().toISOString(),
  };
}

function fromReadingRow(row) {
  return {
    id: row.id, hiveId: row.hive_id, time: row.time_label, weightKg: Number(row.weight_kg || 0),
    tempC: Number(row.temp_c || 0), humidityPct: Number(row.humidity_pct || 0),
    insideTempC: Number(row.inside_temp_c ?? row.temp_c ?? 0), insideHumidityPct: Number(row.inside_humidity_pct ?? row.humidity_pct ?? 0),
    outsideTempC: row.outside_temp_c === null ? null : Number(row.outside_temp_c || 0),
    outsideHumidityPct: row.outside_humidity_pct === null ? null : Number(row.outside_humidity_pct || 0),
    soundHz: Number(row.sound_hz || 0), batteryPct: Number(row.battery_pct || 0),
    batteryV: row.battery_v === null ? null : Number(row.battery_v || 0), solarV: row.solar_v === null ? null : Number(row.solar_v || 0),
    rssiDbm: row.rssi_dbm === null ? null : Number(row.rssi_dbm || 0), createdAt: row.created_at,
  };
}

function toReadingRow(item, userId) {
  return {
    id: item.id || undefined, user_id: userId, hive_id: item.hiveId, time_label: item.time, weight_kg: item.weightKg,
    temp_c: item.tempC, humidity_pct: item.humidityPct, inside_temp_c: item.insideTempC ?? item.tempC,
    inside_humidity_pct: item.insideHumidityPct ?? item.humidityPct, outside_temp_c: item.outsideTempC ?? null,
    outside_humidity_pct: item.outsideHumidityPct ?? null, sound_hz: item.soundHz, battery_pct: item.batteryPct,
    battery_v: item.batteryV ?? null, solar_v: item.solarV ?? null, rssi_dbm: item.rssiDbm ?? null,
    created_at: item.createdAt || new Date().toISOString(),
  };
}

function fromNoteRow(row) {
  return { id: row.id, hiveId: row.hive_id, type: row.type, title: row.title, text: row.text, date: row.date_label, duration: row.duration, createdAt: row.created_at };
}
function toNoteRow(item, userId) {
  return { id: item.id, user_id: userId, hive_id: item.hiveId, type: item.type, title: item.title, text: item.text, date_label: item.date, duration: item.duration, created_at: item.createdAt };
}
function fromVoiceActionRow(row) {
  return { id: row.id, hiveId: row.hive_id, type: row.type, transcript: row.transcript, fields: row.fields || {}, amount: row.amount === null ? null : Number(row.amount || 0), unit: row.unit || "", note: row.note || "", date: row.date_label, consistency: row.consistency, consistencyStatus: row.consistency_status, createdAt: row.created_at };
}
function toVoiceActionRow(item, userId) {
  return { id: item.id, user_id: userId, hive_id: item.hiveId, type: item.type, transcript: item.transcript, fields: item.fields || {}, amount: item.amount, unit: item.unit, note: item.note, date_label: item.date, consistency: item.consistency, consistency_status: item.consistencyStatus, created_at: item.createdAt };
}
function fromFeedingRow(row) {
  return { id: row.id, hiveId: row.hive_id, date: row.date_label, amountLiters: Number(row.amount_liters || 0), feedType: row.feed_type, note: row.note, createdAt: row.created_at };
}
function toFeedingRow(item, userId) {
  return { id: item.id, user_id: userId, hive_id: item.hiveId, date_label: item.date, amount_liters: item.amountLiters, feed_type: item.feedType, note: item.note, created_at: item.createdAt };
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
  return { id: item.id, user_id: userId, hive_id: item.hiveId, title: item.title, date_label: item.date, time_label: item.time, category: item.category, priority: item.priority, created_at: item.createdAt };
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
