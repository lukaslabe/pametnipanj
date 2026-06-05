import React, { useEffect, useMemo, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import {
 Activity,
 ArrowLeft,
 BatteryCharging,
 Bell,
 Bot,
 CalendarDays,
 Camera,
 Check,
 ChevronRight,
 ClipboardList,
 CloudRain,
 CloudSun,
 Cookie,
 Download,
 Droplets,
 Eye,
 EyeOff,
 Gauge,
 GlassWater,
 Home,
 HeartPulse,
 Hexagon,
 Image,
 ListPlus,
 MapPin,
 Mic,
 Package,
 Pencil,
 Plus,
 QrCode,
 Radio,
 Save,
 Scale,
 Search,
 Settings,
 ShieldAlert,
 Thermometer,
 Trash2,
 Utensils,
 Wind,
 Wrench,
 Waves,
} from "lucide-react";
import "./styles.css";
import {
 fetchCloudData,
 replaceCloudData,
 signIn,
 signUp,
 supabaseConfigured,
} from "./supabaseApi";

const STORAGE_KEY = "pametnipanj-local-v1";
const LEGACY_STORAGE_KEYS = ["beecare-mvp-local-v3-sl"];
const MODE_KEY = "pametnipanj-mode";
const SESSION_KEY = "pametnipanj-supabase-session";

const initialData = {
 hives: [
  {
   id: "BC-2026-001",
   name: "Lipovec",
   location: "Zahodni vrt",
   locationName: "Zahodni vrt",
   locationDescription: "Za hišo, ob lipi",
   latitude: 46.0569,
   longitude: 14.5058,
   locationSource: "manual",
   locationUpdatedAt: "2026-05-20T08:00:00.000Z",
   queen: "2025, označena rumeno",
   status: "ok",
   statusText: "Mirno",
   weightKg: 47.3,
   weeklyDeltaKg: 1.4,
   foodLiters: 6.4,
   foodDays: 12,
   temperatureC: 34.2,
   humidityPct: 68,
   batteryPct: 87,
   signal: "LTE",
   lastSeen: "pred 2 min",
   dataSource: "demo",
   qrCode: "QR-LIP-001",
   deviceId: "BH-00001",
   deviceApiKey: "secret",
   frameCount: 10,
   hiveType: "AŽ",
   forage: ["Lipa", "Mešano"],
   hiveColor: "#E8A020",
   createdAt: "2026-05-20T08:00:00.000Z",
  },
  {
   id: "BC-2026-002",
   name: "Gozd",
   location: "Rob gozda",
   locationName: "Rob gozda",
   locationDescription: "Pri gozdni pasi",
   latitude: 46.061,
   longitude: 14.518,
   locationSource: "manual",
   locationUpdatedAt: "2026-05-21T09:00:00.000Z",
   queen: "2024, neoznačena",
   status: "warn",
   statusText: "Preveri",
   weightKg: 39.8,
   weeklyDeltaKg: -2.8,
   foodLiters: 3.1,
   foodDays: 6,
   temperatureC: 32.9,
   humidityPct: 72,
   batteryPct: 61,
   signal: "Bluetooth",
   lastSeen: "pred 18 min",
   dataSource: "demo",
   qrCode: "QR-GOZ-002",
   deviceId: "BH-00002",
   deviceApiKey: "secret-gozd",
   frameCount: 10,
   hiveType: "AŽ",
   forage: ["Gozd", "Lipa"],
   hiveColor: "#2D6A1A",
   createdAt: "2026-05-21T09:00:00.000Z",
  },
  {
   id: "BC-2026-003",
   name: "Travnik",
   location: "Južni travnik",
   locationName: "Južni travnik",
   locationDescription: "Ob cvetocem travniku",
   latitude: 46.052,
   longitude: 14.499,
   locationSource: "phone",
   locationUpdatedAt: "2026-05-22T10:00:00.000Z",
   queen: "2026, označena belo",
   status: "ok",
   statusText: "Močan",
   weightKg: 51.8,
   weeklyDeltaKg: 2.1,
   foodLiters: 9.2,
   foodDays: 18,
   temperatureC: 34.8,
   humidityPct: 63,
   batteryPct: 92,
   signal: "LTE",
   lastSeen: "pred 4 min",
   dataSource: "demo",
   qrCode: "QR-TRA-003",
   deviceId: "BH-00003",
   deviceApiKey: "secret-travnik",
   frameCount: 12,
   hiveType: "Langstroth",
   forage: ["Polje", "Mešano"],
   hiveColor: "#3B82F6",
   createdAt: "2026-05-22T10:00:00.000Z",
  },
  {
   id: "BC-2026-004",
   name: "Sadovnjak",
   location: "Pri jabolkah",
   locationName: "Pri jabolkah",
   locationDescription: "Sadovnjak, tretja vrsta",
   latitude: 46.049,
   longitude: 14.51,
   locationSource: "manual",
   locationUpdatedAt: "2026-05-23T11:00:00.000Z",
   queen: "2025, označena modro",
   status: "danger",
   statusText: "Ukrepaj",
   weightKg: 31.4,
   weeklyDeltaKg: -3.6,
   foodLiters: 1.4,
   foodDays: 2,
   temperatureC: 30.7,
   humidityPct: 76,
   batteryPct: 34,
   signal: "Slab signal",
   lastSeen: "pred 1 h",
   dataSource: "demo",
   qrCode: "QR-SAD-004",
   deviceId: "BH-00004",
   deviceApiKey: "secret-sadovnjak",
   frameCount: 9,
   hiveType: "AŽ",
   forage: ["Sadovnjak", "Akacija"],
   hiveColor: "#C94033",
   createdAt: "2026-05-23T11:00:00.000Z",
  },
 ],
 readings: [
  { hiveId: "BC-2026-001", time: "08:00", weightKg: 46.9, tempC: 33.7, humidityPct: 67, soundHz: 218, batteryPct: 88 },
  { hiveId: "BC-2026-001", time: "12:00", weightKg: 47.1, tempC: 34.2, humidityPct: 68, soundHz: 224, batteryPct: 87 },
  { hiveId: "BC-2026-001", time: "16:00", weightKg: 47.3, tempC: 34.5, humidityPct: 66, soundHz: 229, batteryPct: 87 },
  { hiveId: "BC-2026-002", time: "08:00", weightKg: 40.6, tempC: 32.4, humidityPct: 73, soundHz: 251, batteryPct: 62 },
  { hiveId: "BC-2026-003", time: "08:00", weightKg: 50.8, tempC: 34.4, humidityPct: 64, soundHz: 212, batteryPct: 93 },
  { hiveId: "BC-2026-004", time: "08:00", weightKg: 32.1, tempC: 30.5, humidityPct: 77, soundHz: 286, batteryPct: 35 },
 ],
 notes: [
  { id: "N-001", hiveId: "BC-2026-001", type: "voice", title: "Pregled satnic", text: "Matica prisotna, zalega lepa. Dodati medišče v tem tednu.", date: "31. maj", duration: "0:42", createdAt: "2026-05-31T07:45:00.000Z" },
  { id: "N-002", hiveId: "BC-2026-002", type: "voice", title: "Opazanje pri vhodu", text: "Manj izletavanja, preveriti zalogo hrane.", date: "30. maj", duration: "1:18", createdAt: "2026-05-30T09:30:00.000Z" },
  { id: "N-003", hiveId: "BC-2026-004", type: "manual", title: "Nujno hranjenje", text: "Hrane je malo. Pripraviti sirup se danes.", date: "danes", duration: null, createdAt: "2026-05-31T10:10:00.000Z" },
 ],
 voiceActions: [
  {
   id: "VA-001",
   hiveId: "BC-2026-001",
   type: "brood_checked",
   transcript: "Pregledal sem zalego v panju Lipovec. Vse je videti normalno.",
   fields: { finding: "zalega pregledana" },
   note: "Zalega pregledana.",
   date: "31. maj",
   consistency: "Zapis shranjen ročno.",
   createdAt: "2026-05-31T07:46:00.000Z",
  },
 ],
 feedingEvents: [
  { id: "F-001", hiveId: "BC-2026-001", date: "28. maj", amountLiters: 2.5, feedType: "sirup 1:1", note: "Preventivno po dežju", createdAt: "2026-05-28T14:00:00.000Z" },
  { id: "F-002", hiveId: "BC-2026-002", date: "29. maj", amountLiters: 3, feedType: "sirup 1:1", note: "Teža pada že tri dni", createdAt: "2026-05-29T13:00:00.000Z" },
  { id: "F-003", hiveId: "BC-2026-004", date: "danes", amountLiters: 4, feedType: "sirup 1:1", note: "Nujno dopolniti", createdAt: "2026-05-31T12:00:00.000Z" },
 ],
 extractionEvents: [
  { id: "E-001", hiveId: "BC-2026-003", date: "25. maj", honeyType: "akacija", frames: 12, grossKg: 32.4, emptyKg: 5.1, netKg: 27.3, createdAt: "2026-05-25T16:00:00.000Z" },
  { id: "E-002", hiveId: "BC-2026-001", date: "26. maj", honeyType: "lipovec", frames: 10, grossKg: 27.2, emptyKg: 4.8, netKg: 22.4, createdAt: "2026-05-26T16:00:00.000Z" },
  { id: "E-003", hiveId: "BC-2026-002", date: "18. maj", honeyType: "gozdni", frames: 8, grossKg: 19.9, emptyKg: 4.0, netKg: 15.9, createdAt: "2026-05-18T16:00:00.000Z" },
 ],
 reminders: [
  { id: "R-001", hiveId: "BC-2026-004", title: "Dopolni hrano", date: "31. maj", time: "18:00", category: "hranjenje", priority: "danger", createdAt: "2026-05-31T06:00:00.000Z" },
  { id: "R-002", hiveId: "BC-2026-002", title: "Pregled zaloge", date: "1. jun", time: "09:00", category: "pregled", priority: "warn", createdAt: "2026-05-30T06:00:00.000Z" },
  { id: "R-003", hiveId: "BC-2026-001", title: "Dodaj medišče", date: "3. jun", time: "dopoldne", category: "delo", priority: "ok", createdAt: "2026-05-29T06:00:00.000Z" },
  { id: "R-004", hiveId: "BC-2026-003", title: "Točenje medu", date: "7. jun", time: "08:30", category: "točenje", priority: "ok", createdAt: "2026-05-28T06:00:00.000Z" },
 ],
 qrItems: [
  { id: "PametniPanj-panj1", type: "Panj", linkedHiveId: "BC-2026-001", linkedTo: "Lipovec", lastScan: "demo", status: "Aktivno", createdAt: "2026-05-20T08:00:00.000Z" },
  { id: "PametniPanj-panj2", type: "Panj", linkedHiveId: "BC-2026-002", linkedTo: "Gozd", lastScan: "demo", status: "Aktivno", createdAt: "2026-05-20T08:00:00.000Z" },
  { id: "PametniPanj-box1", type: "Transportna škatla", linkedHiveId: "", linkedTo: "Škatla 1", lastScan: "demo", status: "Aktivno", createdAt: "2026-05-20T08:00:00.000Z" },
  { id: "PametniPanj-regal1", type: "Regal", linkedHiveId: "", linkedTo: "Regal A1", lastScan: "demo", status: "Aktivno", createdAt: "2026-05-20T08:00:00.000Z" },
  { id: "PametniPanj-serija1", type: "Serija", linkedHiveId: "", linkedTo: "Akacija 2026", lastScan: "demo", status: "Aktivno", createdAt: "2026-05-20T08:00:00.000Z" },
  { id: "PametniPanj-naprava1", type: "Naprava", linkedHiveId: "BC-2026-001", linkedTo: "Hive device", lastScan: "demo", status: "Aktivno", createdAt: "2026-05-20T08:00:00.000Z" },
  { id: "PametniPanj-tehtnica1", type: "Tehtnica", linkedHiveId: "", linkedTo: "PocketScale", lastScan: "demo", status: "Aktivno", createdAt: "2026-05-20T08:00:00.000Z" },
  { id: "QR-LIP-001", type: "Panj", linkedHiveId: "BC-2026-001", linkedTo: "Lipovec", lastScan: "31. maj, 09:12", status: "Aktivno", createdAt: "2026-05-20T08:00:00.000Z" },
  { id: "QR-BOX-014", type: "Transportna škatla", linkedHiveId: "", linkedTo: "Točenje 25. maj", lastScan: "25. maj, 15:40", status: "V uporabi", createdAt: "2026-05-25T15:40:00.000Z" },
  { id: "QR-JAR-041", type: "Serija kozarcev", linkedHiveId: "", linkedTo: "Akacija 2026", lastScan: "26. maj, 18:05", status: "Zakljuceno", createdAt: "2026-05-26T18:05:00.000Z" },
 ],
 alerts: [],
 events: [],
 pollenEvents: [
  { id: "P-001", hiveId: "BC-2026-001", amountKg: 1.24, source: "manual", date: "30. maj", notes: "Cvetni prah iz pasti", status: "confirmed", createdAt: "2026-05-30T12:00:00.000Z", updatedAt: "2026-05-30T12:00:00.000Z" },
 ],
 inventoryItems: [
  { id: "INV-001", name: "Sladkor", category: "sugar", quantity: 45, unit: "kg", shelf: "Regal A1", lowStockAt: 20, status: "confirmed", createdAt: "2026-05-20T08:00:00.000Z", updatedAt: "2026-05-20T08:00:00.000Z" },
  { id: "INV-002", name: "Kozarci 720 ml", category: "jars", quantity: 300, unit: "kos", shelf: "Regal A3", lowStockAt: 80, status: "confirmed", createdAt: "2026-05-20T08:00:00.000Z", updatedAt: "2026-05-20T08:00:00.000Z" },
  { id: "INV-003", name: "Pokrovčki", category: "lids", quantity: 120, unit: "kos", shelf: "Regal A3", lowStockAt: 100, status: "confirmed", createdAt: "2026-05-20T08:00:00.000Z", updatedAt: "2026-05-20T08:00:00.000Z" },
 ],
 inventoryTransactions: [],
 devices: [
  { id: "DEV-POCKET-001", type: "pocket_scale", name: "PametniPanj PocketScale", status: "simulated", batteryPct: 92, createdAt: "2026-05-31T08:00:00.000Z" },
 ],
 scaleMeasurements: [],
 honeyBatches: [
  { id: "HB-001", name: "Akacija 2026", honeyType: "akacija", totalKg: 150, remainingKg: 150, shelf: "Skladišče B1", status: "confirmed", createdAt: "2026-05-26T18:00:00.000Z", updatedAt: "2026-05-26T18:00:00.000Z" },
 ],
 jarFillingEvents: [],
 honeySales: [
  { id: "HS-001", hiveId: "BC-2026-003", batchId: "HB-001", date: "30. maj", honeyType: "akacija", amountKg: 18, pricePerKg: 12, customer: "Sosedje", qrCode: "QR-JAR-041", createdAt: "2026-05-30T16:00:00.000Z" },
 ],
 financeEvents: [
  { id: "FIN-001", hiveId: "BC-2026-003", type: "income", category: "Prodan med", description: "Akacija 2026", amountEur: 216, date: "30. maj", createdAt: "2026-05-30T16:00:00.000Z" },
  { id: "FIN-002", hiveId: "BC-2026-004", type: "expense", category: "Sladkor", description: "Nujno hranjenje", amountEur: 18, date: "31. maj", createdAt: "2026-05-31T12:00:00.000Z" },
  { id: "FIN-003", hiveId: "BC-2026-002", type: "expense", category: "Zdravila", description: "Priprava za varojo", amountEur: 35, date: "29. maj", createdAt: "2026-05-29T12:00:00.000Z" },
 ],
 healthRecords: [
  { id: "HL-001", hiveId: "BC-2026-002", varroaLevel: 3, inspectionDate: "29. maj", treatment: "Brez zdravljenja", queenStatus: "Dobra", queenLastSeen: "29. maj", queenYear: "2024", diseases: ["Varoza"], notes: "Priporočen ponovni pregled.", neighborAlert: { sent: true, radiusKm: 10, area: "Savinjska dolina" }, createdAt: "2026-05-29T12:30:00.000Z" },
 ],
 hivePhotos: [
  { id: "HP-001", hiveId: "BC-2026-001", date: "31. maj", caption: "Sat z lepo zalego", url: "", sizeMb: 0.4, aiAnalysis: "Leglo izgleda enakomerno. Priporočam običajen pregled čez 7 dni.", createdAt: "2026-05-31T08:00:00.000Z" },
 ],
 neighborAlerts: [
  { id: "NA-001", hiveId: "BC-2026-002", radiusKm: 10, area: "Savinjska dolina", message: "Čebelar v vaši okolici poroča o povišani stopnji varoze. Priporočamo preventivni pregled.", anonymous: true, createdAt: "2026-05-29T12:35:00.000Z" },
 ],
 productEvents: [
  { id: "PR-001", hiveId: "BC-2026-001", productType: "cvetni prah", quantity: 850, unit: "g", pricePerUnit: 0.018, date: "30. maj", note: "Pobran cvetni prah iz pasti.", createdAt: "2026-05-30T12:00:00.000Z" },
  { id: "PR-002", hiveId: "BC-2026-003", productType: "vosek", quantity: 1.4, unit: "kg", pricePerUnit: 8, date: "25. maj", note: "Vosek iz točenja.", createdAt: "2026-05-25T17:00:00.000Z" },
 ],
 weather: [
  { id: "W-001", hiveId: "BC-2026-001", locationName: "Zahodni vrt", observedAt: "2026-05-31T08:00:00.000Z", condition: "sončno", tempC: 22.4, humidityPct: 62, windKmh: 8, rainMmNext24h: 0.4, pressureHpa: 1017, advice: "Dober dan za kratek pregled.", risk: "ok" },
  { id: "W-002", hiveId: "BC-2026-002", locationName: "Rob gozda", observedAt: "2026-05-31T08:00:00.000Z", condition: "oblačno", tempC: 20.1, humidityPct: 74, windKmh: 12, rainMmNext24h: 2.8, pressureHpa: 1012, advice: "Pregled naj bo kratek, možna vlaga.", risk: "warn" },
  { id: "W-003", hiveId: "BC-2026-003", locationName: "Južni travnik", observedAt: "2026-05-31T08:00:00.000Z", condition: "toplo", tempC: 24.9, humidityPct: 58, windKmh: 6, rainMmNext24h: 0, pressureHpa: 1018, advice: "Primeren čas za pregled ali dodajanje medišča.", risk: "ok" },
  { id: "W-004", hiveId: "BC-2026-004", locationName: "Pri jabolkah", observedAt: "2026-05-31T08:00:00.000Z", condition: "veter", tempC: 18.7, humidityPct: 79, windKmh: 24, rainMmNext24h: 6.2, pressureHpa: 1008, advice: "Ne odpiraj panja po nepotrebnem. Hrano dodaj hitro.", risk: "danger" },
 ],
};

const nav = [
 { id: "dashboard", label: "Panji", icon: Home },
 { id: "calendar", label: "Koledar", icon: CalendarDays },
 { id: "qr", label: "QR", icon: QrCode },
 { id: "ai", label: "Čebela", icon: Bot },
 { id: "voice", label: "Glas", icon: Mic },
];

const AI_API_URL = import.meta.env.VITE_AI_API_URL || "/.netlify/functions/ai";
const AI_DAILY_LIMIT_KEY = "pametnipanj-ai-daily-limit";
const AI_USAGE_KEY = "pametnipanj-ai-usage";
const AI_DEFAULT_DAILY_LIMIT = 20;

const localQA = [
 { keys: ["varoa", "varroa", "pršica"], answer: "Varoa je najpogostejši zajedavec čebel. Stopnjo spremljamo z naravnim osipom ali testom s sladkorjem/alkoholom. Če je osip visok, ukrepaj pravočasno in zapiši zdravljenje." },
 { keys: ["oksalna", "oksalna kislina", "zdravljenje"], answer: "Oksalna kislina je najučinkovitejša, ko je družina brez zalege, navadno pozimi. Uporabljaj zaščito in se drži navodil registriranega pripravka." },
 { keys: ["rojenje", "roj", "matičnik", "maticnik"], answer: "Znaki rojenja so matičniki, gneča pred vhodom, manj prostora in močna družina v sezoni. Najprej preveri prostor, zalego in matičnike." },
 { keys: ["matica", "matico", "matice"], answer: "Matico zamenjamo, če slabo zalega, je stara, družina postane pretirano agresivna ali ni dovolj zalege. Po dodajanju nove matice preveri sprejem čez nekaj dni." },
 { keys: ["hranjenje", "hraniti", "sirup", "sladkor"], answer: "Poleti se pogosto uporablja sirup 1:1, jeseni gostejši sirup za zimsko zalogo. Ne hrani po nepotrebnem med močno pašo." },
 { keys: ["pogača", "pogaca", "cvetni prah", "nadomestek"], answer: "Beljakovinska pogača pomaga zgodaj spomladi, ko v naravi ni dovolj peloda. Uporabi jo zmerno in spremljaj razvoj zalege." },
 { keys: ["zimska zaloga", "prezimovanje", "zima"], answer: "Za zimo naj ima družina dovolj hrane, mlado matico, zdrave čebele in mirno prezimovališče. Jeseni preveri varojo in zaloge." },
 { keys: ["medišče", "medisce", "dodati medišče", "kdaj medišče"], answer: "Medišče dodaj, ko je družina močna in je plodišče dobro zasedeno. Bolje malo pred pašo kot prepozno, ko čebele že nimajo prostora." },
 { keys: ["točenje", "tocenje", "točiti", "tociti", "kdaj točiti"], answer: "Toči, ko je satje večinoma zapečateno. Če želiš ločen sortni med, toči pred začetkom naslednje močnejše paše." },
 { keys: ["gniloba", "ameriška gniloba", "ameriska gniloba", "apg"], answer: "Ameriška gniloba je huda bolezen zalege in je prijavljiva. Ob sumu ne prestavljaj opreme in se posvetuj z veterinarsko službo." },
 { keys: ["nosema", "nosemoza"], answer: "Nosema oslabi čebele, pogosto se pokaže spomladi. Pomagajo močne družine, čisto satje, dobra hrana in manj stresa." },
 { keys: ["kalkova zalega"], answer: "Kalkova zalega se pogosto pojavi ob vlagi in slabi zračnosti. Pomagajo močnejša družina, zračnost in menjava starega satja." },
 { keys: ["akacija", "robinija"], answer: "Akacija cveti spomladi in daje svetel med. Paša je zelo odvisna od vremena, mraza in vetra med cvetenjem." },
 { keys: ["lipa", "lipov med"], answer: "Lipa cveti poleti. Če želiš lipov med ločeno, spremljaj začetek cvetenja in prostor v medišču." },
 { keys: ["ajda", "ajdov med"], answer: "Ajda cveti poleti in daje temnejši, aromatičen med. Donos je zelo odvisen od vremena." },
 { keys: ["dež", "dez", "dežuje", "dezuje", "slabo vreme"], answer: "V dežju čebele manj letijo in porabljajo zaloge. Panja ne odpiraj, razen če je nujno." },
 { keys: ["veter", "piha", "burja"], answer: "Močan veter moti izletavanje. Pregled raje prestavi na mirnejši del dneva." },
 { keys: ["mraz", "hladno", "temperatura"], answer: "Panja ne odpiraj v mrazu. Za pregled je bolje toplo, mirno vreme brez vetra." },
 { keys: ["dim", "dimnik", "kadilo"], answer: "Dim uporabljaj zmerno. Nekaj hladnega dima pred odpiranjem umiri družino, preveč dima pa jo po nepotrebnem vznemiri." },
 { keys: ["pik", "pičilo", "picilo", "alergi"], answer: "Po piku odstrani želo s strganjem in hladi mesto pika. Pri težkem dihanju ali močni reakciji takoj poišči pomoč." },
 { keys: ["pregled", "kdaj v panj", "kdaj preveriti"], answer: "Najboljši čas za pregled je topel, miren dan, približno med 10. in 16. uro. Pozimi panja ne odpiramo po nepotrebnem." },
 { keys: ["satnica", "satnice", "menjava"], answer: "Staro temno satje redno menjaj. S tem zmanjšaš ostanke bolezni in izboljšaš razvoj družine." },
];

function makeId(prefix) {
 return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`.toUpperCase();
}

function legalRemindersForYear(year = new Date().getFullYear()) {
 return [
  {
   id: `LEGAL-${year}-APR10`,
   title: "⚖️ Pripravi popis čebeljih družin",
   hiveId: "",
   date: `10. apr ${year}`,
   time: "dopoldne",
   category: "zakonsko",
   priority: "warn",
   note: "Popisni datum je 15. april. Preštej vse družine vključno z rezervnimi.",
   legal: true,
  },
  {
   id: `LEGAL-${year}-APR15`,
   title: "⚖️ POPIS: Stanje čebeljih družin",
   hiveId: "",
   date: `15. apr ${year}`,
   time: "ves dan",
   category: "zakonsko",
   priority: "danger",
   note: "Zakonski popisni datum. Zabeleži točno število družin v vsakem čebelnjaku danes.",
   legal: true,
  },
  {
   id: `LEGAL-${year}-OCT31`,
   title: "⚖️ POPIS: Stanje čebeljih družin",
   hiveId: "",
   date: `31. okt ${year}`,
   time: "ves dan",
   category: "zakonsko",
   priority: "danger",
   note: "Zakonski popisni datum. Zabeleži točno število družin v vsakem čebelnjaku danes.",
   legal: true,
  },
  {
   id: `LEGAL-${year}-NOV25`,
   title: "⚖️ Rok za poročanje se izteka",
   hiveId: "",
   date: `25. nov ${year}`,
   time: "dopoldne",
   category: "zakonsko",
   priority: "danger",
   note: "Rok za oddajo je 1. december za oba popisna datuma (15.4. in 31.10.). Oddaj poročilo na UVHVVR.",
   legal: true,
  },
 ];
}

function getLegalReminders() {
 const year = new Date().getFullYear();
 return [...legalRemindersForYear(year), ...legalRemindersForYear(year + 1)];
}

function isNearCensusWindow(date = new Date()) {
 const year = date.getFullYear();
 const dayMs = 24 * 60 * 60 * 1000;
 const targets = [new Date(year, 3, 15), new Date(year, 9, 31), new Date(year, 11, 1)];
 return targets.some((target) => Math.abs(target.getTime() - date.getTime()) / dayMs <= 14);
}

function nextCensusStatus(date = new Date()) {
 const year = date.getFullYear();
 const april = new Date(year, 3, 15);
 const october = new Date(year, 9, 31);
 const deadline = new Date(year, 11, 1);
 const sameDay = (left, right) => left.toDateString() === right.toDateString();
 const daysUntil = (target) => Math.ceil((target.getTime() - date.getTime()) / (24 * 60 * 60 * 1000));
 if (sameDay(date, april) || sameDay(date, october)) return { title: "🔴 DANES je popisni datum!", detail: "Zabeleži stanje čebeljih družin v vsakem čebelnjaku danes.", tone: "danger" };
 if (date < april) return { title: `Naslednji popis: 15. april ${year}`, detail: `Še ${daysUntil(april)} dni`, tone: "ok" };
 if (date < october) return { title: `Naslednji popis: 31. oktober ${year}`, detail: `Še ${daysUntil(october)} dni`, tone: "ok" };
 return { title: `Rok za oddajo: 1. december ${year}`, detail: date <= deadline ? `Še ${Math.max(0, daysUntil(deadline))} dni za oddajo` : "Rok za letošnje poročanje je mimo.", tone: date <= deadline ? "warn" : "danger" };
}

function todayLabel() {
 return new Intl.DateTimeFormat("sl-SI", { day: "numeric", month: "short" }).format(new Date());
}

function toNumber(value, fallback = 0) {
 const number = Number(String(value ?? "").replace(",", "."));
 return Number.isFinite(number) ? number : fallback;
}

function roundOne(value) {
 return Math.round(toNumber(value) * 10) / 10;
}

function displayText(value) {
 if (value === null || value === undefined) return "";
 return String(value);
}

function getHive(hives, hiveId) {
 return (hives || []).find((hive) => hive.id === hiveId) || null;
}

function getHiveName(hives, hiveId) {
 return getHive(hives, hiveId).name || "Neznan panj";
}

function isManualHive(hive) {
 return hive.dataSource === "manual" || (!hive.deviceId && hive.dataSource !== "demo");
}

function sensorValue(value) {
 return value === "" || value === undefined ? null : value;
}

const HIVE_TYPE_OPTIONS = [
 { value: "AŽ panj", label: "AŽ panj", description: "Najpogostejši slovenski panj za čebelnjak in mirno delo od zadaj." },
 { value: "LR panj (Langstroth)", label: "LR panj", description: "Nakladni panj za selitveno čebelarstvo in prilagodljivo širjenje prostora." },
 { value: "DB panj (Dadant-Blatt)", label: "DB panj", description: "Večji plodiščni panj za močne družine in dobro pašo." },
 { value: "Warréjev panj", label: "Warréjev panj", description: "Naravnejši nakladni panj z manj posegi v družino." },
 { value: "Kirerjev panj", label: "Kirerjev panj", description: "Slovenska posebnost brez matične rešetke, zasnovana za enostavno delo." },
 { value: "Kranjič", label: "Kranjič", description: "Tradicionalni panj s poslikanimi končnicami in zgodovinskim značajem." },
 { value: "Drugi tip", label: "Drugi tip", description: "Uporabi, če ima panj posebno izvedbo ali domačo prilagoditev." },
];

function normalizeHiveType(value) {
 const text = value || "";
 if (text === "AŽ") return "AŽ panj";
 if (text === "Langstroth") return "LR panj (Langstroth)";
 if (text === "Dadant") return "DB panj (Dadant-Blatt)";
 if (text === "Warré") return "Warréjev panj";
 if (text === "Drugo") return "Drugi tip";
 return text || "AŽ panj";
}

function suggestedForageFromLocation(form) {
 const text = normalizeSl(`${form.locationName || ""} ${form.locationDescription || ""} ${form.location || ""}`);
 if (/gozd|hosta|hrib|kostanj/.test(text)) return ["Gozd", "Kostanj"];
 if (/lipa|lipovec/.test(text)) return ["Lipa"];
 if (/sadovnjak|jabol/.test(text)) return ["Sadovnjak"];
 if (/travnik|polje/.test(text)) return ["Travnik", "Mešano"];
 if (/akacij|robinij/.test(text)) return ["Akacija"];
 return ["Mešano"];
}

function normalizeData(input = {}, persist = false) {
 const data = { ...initialData, ...(input || {}) };
 const normalized = {
  ...data,
  hives: Array.isArray(data.hives) ? data.hives : [],
  readings: Array.isArray(data.readings) ? data.readings : [],
  notes: Array.isArray(data.notes) ? data.notes : [],
  feedingEvents: Array.isArray(data.feedingEvents) ? data.feedingEvents : [],
  extractionEvents: Array.isArray(data.extractionEvents) ? data.extractionEvents : [],
  reminders: Array.isArray(data.reminders) ? data.reminders : [],
  qrItems: Array.isArray(data.qrItems) ? data.qrItems : [],
  alerts: Array.isArray(data.alerts) ? data.alerts : [],
  events: Array.isArray(data.events) ? data.events : [],
  voiceActions: Array.isArray(data.voiceActions) ? data.voiceActions : [],
  pollenEvents: Array.isArray(data.pollenEvents) ? data.pollenEvents : [],
  inventoryItems: Array.isArray(data.inventoryItems) ? data.inventoryItems : [],
  inventoryTransactions: Array.isArray(data.inventoryTransactions) ? data.inventoryTransactions : [],
  devices: Array.isArray(data.devices) ? data.devices : [],
  scaleMeasurements: Array.isArray(data.scaleMeasurements) ? data.scaleMeasurements : [],
  honeyBatches: Array.isArray(data.honeyBatches) ? data.honeyBatches : [],
  jarFillingEvents: Array.isArray(data.jarFillingEvents) ? data.jarFillingEvents : [],
  financeEvents: Array.isArray(data.financeEvents) ? data.financeEvents : [],
  honeySales: Array.isArray(data.honeySales) ? data.honeySales : [],
  censusReports: Array.isArray(data.censusReports) ? data.censusReports : [],
  healthRecords: Array.isArray(data.healthRecords) ? data.healthRecords : [],
  hivePhotos: Array.isArray(data.hivePhotos) ? data.hivePhotos : [],
  productEvents: Array.isArray(data.productEvents) ? data.productEvents : [],
  neighborAlerts: Array.isArray(data.neighborAlerts) ? data.neighborAlerts : [],
 weather: Array.isArray(data.weather) ? data.weather : [],
 };
 normalized.hives = normalized.hives.map((hive) => {
  const dataSource = hive.dataSource || (hive.deviceId ? "sensor" : "manual");
  const nextHive = { ...hive, dataSource, hiveType: normalizeHiveType(hive.hiveType) };
  if (isManualHive(nextHive)) {
   return {
    ...nextHive,
    deviceId: "",
    deviceApiKey: "",
    weightKg: null,
    weeklyDeltaKg: null,
    foodLiters: null,
    foodDays: null,
    temperatureC: null,
    humidityPct: null,
    batteryPct: null,
    signal: null,
   };
  }
  return nextHive;
 });
 if (persist) localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
 return normalized;
}

function readLocalDemoData() {
 try {
  const stored = localStorage.getItem(STORAGE_KEY) || LEGACY_STORAGE_KEYS.map((key) => localStorage.getItem(key)).find(Boolean);
  return normalizeData(stored ? JSON.parse(stored) : initialData);
 } catch {
  localStorage.removeItem(STORAGE_KEY);
  return normalizeData(initialData);
 }
}

function usePersistedData() {
 const [data, setDataState] = useState(() => readLocalDemoData());
 const setData = (updater) => {
  setDataState((current) => {
   const next = normalizeData(typeof updater === "function" ? updater(current) : updater);
   localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
   return next;
  });
 };
 useEffect(() => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
 }, [data]);
 return [data, setData];
}

function freshnessLabel(value) {
 if (!value) return "zadnji podatek neznan";
 const diffMs = Date.now() - new Date(value).getTime();
 if (!Number.isFinite(diffMs) || diffMs < 0) return "zadnji podatek pravkar";
 const minutes = Math.floor(diffMs / 60000);
 if (minutes < 1) return "zadnji podatek pravkar";
 if (minutes < 60) return `zadnji podatek pred ${minutes} min`;
 const hours = Math.floor(minutes / 60);
 if (hours < 24) return `zadnji podatek pred ${hours} h`;
 return `zadnji podatek pred ${Math.floor(hours / 24)} dni`;
}

function parseRelativeLastSeen(value) {
 const text = normalizeSl(value || "");
 if (!text) return Infinity;
 if (/pravkar|demo/.test(text)) return 0;
 const amount = toNumber(text.match(/\d+/)?.[0], 0);
 if (/min/.test(text)) return amount;
 if (/\bh\b|ur/.test(text)) return amount * 60;
 if (/dni|dan/.test(text)) return amount * 1440;
 return Infinity;
}

function sensorStatusForHive(hive) {
 if (isManualHive(hive)) return { status: "manual", label: "Ročni vnos", detail: "PNV · Ročni vnos", days: 0 };
 const minutes = hive.updatedAt ? Math.max(0, Math.floor((Date.now() - new Date(hive.updatedAt).getTime()) / 60000)) : parseRelativeLastSeen(hive.lastSeen);
 if (!Number.isFinite(minutes)) return { status: "warn", label: "Senzor neznan", detail: "Ni svežega podatka naprave." };
 const hours = Math.max(1, Math.floor(minutes / 60));
 const days = Math.max(1, Math.floor(minutes / 1440));
 if (minutes >= 4320) return { status: "danger", label: `Senzor molči že ${days} dni`, detail: "To NE pomeni, da je panj v redu. Priporočamo fizični obisk.", days };
 if (minutes >= 1440) return { status: "stale", label: `Senzor ne odgovarja ${days} dni`, detail: "Preveri napajanje, signal ali napravo.", days };
 if (minutes >= 180) return { status: "warn", label: `Podatek star ${hours} h`, detail: "Senzor zamuja. Panj še ni nujno v težavah.", days: 0 };
 return { status: "ok", label: minutes < 60 ? `● Živo · pred ${Math.max(1, Math.floor(minutes))} min` : `● Živo · pred ${hours} h`, detail: "Senzor pošilja podatke.", days: 0 };
}

function getWeatherForHive(data, hive) {
 return (data.weather || []).find((item) => item.hiveId === hive.id)
  || makeFallbackWeather(hive);
}

function makeFallbackWeather(hive) {
 const base = Math.abs([...hive.id].reduce((sum, char) => sum + char.charCodeAt(0), 0));
 const tempC = 18 + (base % 8);
 const rainMmNext24h = (base % 5) * 0.8;
 const windKmh = 6 + (base % 18);
 const risk = rainMmNext24h > 4 || windKmh > 22 ? "warn" : "ok";
 return {
  id: `W-${hive.id}`,
  hiveId: hive.id,
  locationName: hive.locationName || hive.location || "Lokacija panja",
  observedAt: new Date().toISOString(),
  condition: risk === "warn" ? "spremenljivo" : "mirno",
  tempC,
  humidityPct: 60 + (base % 22),
  windKmh,
  rainMmNext24h,
  pressureHpa: 1010 + (base % 12),
  advice: risk === "warn" ? "Pregled naj bo kratek." : "Vreme je primerno za pregled.",
  risk,
 };
}

function weatherStatusForHive(hive, weather) {
 if (!weather) return { risk: "warn", text: "Vreme neznano", advice: "Ni vremenskih podatkov za lokacijo." };
 const forecast = forecastForWeather(weather);
 const tomorrow = forecast[1];
 if (weather.tempC > 35) {
  return { risk: "danger", text: "Vročinski stres", advice: "Preveri ventilacijo in senco. Vodo imej blizu stojišča." };
 }
 if (weather.tempC < 8) {
  return { risk: "warn", text: "Zimski grozd", advice: "Čebele so v zimskem grozdu. Panja ne odpiraj." };
 }
 if (weather.windKmh > 30) {
  return { risk: "warn", text: "Veter", advice: "Veter moti izletavanje. Čebele večinoma ostanejo doma." };
 }
 if (tomorrow.rainMm >= 4) {
  return { risk: "warn", text: "Jutri dež", advice: "Če moraš kaj urediti, naredi danes. Jutri ne hodi v panj." };
 }
 if (weather.rainMmNext24h >= 5 || weather.windKmh >= 24) {
  return { risk: "danger", text: "Ne odpiraj", advice: "Dež ali veter. Panj odpri samo, če je nujno." };
 }
 if (weather.rainMmNext24h >= 2 || weather.windKmh >= 16 || weather.tempC < 16) {
  return { risk: "warn", text: "Kratek pregled", advice: "Če moraš do panja, naj bo pregled kratek in brez dolgega odpiranja." };
 }
 if (hive.weeklyDeltaKg < -2 && weather.rainMmNext24h > 0) {
  return { risk: "warn", text: "Hrana in vreme", advice: "Padec teže ob dežju lahko pomeni manj vnosa. Preveri zalogo." };
 }
 if (weather.rainMmNext24h < 1 && weather.tempC >= 18 && weather.windKmh < 14) {
  return { risk: "ok", text: "Idealni pogoji za pašo", advice: hive.weeklyDeltaKg > 1 ? "Medišče se lahko hitro polni. Preveri prostor." : "Dober dan za pregled panjev in opazovanje paše." };
 }
 return { risk: "ok", text: "Primerno", advice: "Vreme je primerno za osnovni pregled." };
}

function beekeepingForecastSummary(forecast) {
 const rainy = forecast.find((day) => day.rainMm >= 4);
 const goodDays = forecast.filter((day) => day.rainMm < 1.5 && day.windKmh < 16 && day.tempC >= 18).length;
 if (rainy) return `${rainy.day}: dež - raje ne odpiraj panja.`;
 if (goodDays >= 3) return "Naslednji 3 dnevi so dobri za pašo. Preveri prostor v medišču.";
 return "Vreme je mešano. Preglede načrtuj v toplem, mirnem delu dneva.";
}

function openMeteoCodeToCondition(code) {
 if ([61, 63, 65, 80, 81, 82, 95, 96, 99].includes(code)) return "rain";
 if ([45, 48, 51, 53, 55].includes(code)) return "cloud";
 return "sun";
}

async function fetchOpenMeteoWeatherForHive(hive) {
 if (!Number.isFinite(Number(hive.latitude)) || !Number.isFinite(Number(hive.longitude))) return null;
 const url = `https://api.open-meteo.com/v1/forecast?latitude=${encodeURIComponent(hive.latitude)}&longitude=${encodeURIComponent(hive.longitude)}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,surface_pressure,weather_code&daily=weather_code,temperature_2m_max,precipitation_sum,wind_speed_10m_max&timezone=Europe%2FLjubljana&forecast_days=7`;
 const response = await fetch(url);
 if (!response.ok) throw new Error("Vreme ni dosegljivo.");
 const payload = await response.json();
 const forecast = (payload.daily.time || []).map((date, index) => ({
  day: index === 0 ? "Danes" : new Intl.DateTimeFormat("sl-SI", { weekday: "short" }).format(new Date(date)),
  tempC: Math.round(payload.daily.temperature_2m_max?.[index] ?? payload.current.temperature_2m ?? 0),
  rainMm: roundOne(payload.daily.precipitation_sum?.[index] ?? 0),
  windKmh: Math.round(payload.daily.wind_speed_10m_max?.[index] ?? payload.current.wind_speed_10m ?? 0),
  condition: openMeteoCodeToCondition(payload.daily.weather_code?.[index] ?? payload.current.weather_code),
 }));
 return {
  id: `W-LIVE-${hive.id}`,
  hiveId: hive.id,
  locationName: hive.locationName || hive.location || hive.name,
  observedAt: new Date().toISOString(),
  condition: openMeteoCodeToCondition(payload.current.weather_code),
  tempC: roundOne(payload.current.temperature_2m),
  humidityPct: Math.round(payload.current.relative_humidity_2m ?? 0),
  windKmh: Math.round(payload.current.wind_speed_10m ?? 0),
  rainMmNext24h: roundOne(forecast[0].rainMm ?? 0),
  pressureHpa: Math.round(payload.current.surface_pressure ?? 0),
  advice: "Podatki Open-Meteo, prevedeni v čebelarski nasvet.",
  risk: "ok",
  forecast,
  source: "Open-Meteo",
 };
}

function forecastForWeather(weather) {
 if (!weather) return [];
 if (Array.isArray(weather.forecast) && weather.forecast.length) return weather.forecast;
 const days = ["Danes", "Pon", "Tor", "Sre", "Čet", "Pet", "Sob"];
 return days.map((day, index) => {
  const rain = Math.max(0, Math.round((toNumber(weather.rainMmNext24h) * (index === 0 ? 1 : 0.45 + ((index * 17) % 5) / 8)) * 10) / 10);
  const wind = Math.max(3, Math.round(toNumber(weather.windKmh) + ((index * 5) % 9) - 4));
  const temp = Math.round(toNumber(weather.tempC) + ((index * 3) % 7) - 3);
  const condition = rain >= 4 ? "rain" : wind >= 22 ? "wind" : rain >= 1.5 ? "cloud" : "sun";
  return { day, tempC: temp, rainMm: rain, windKmh: wind, condition };
 });
}

function WeatherIcon({ condition, size = 20 }) {
 if (condition === "rain") return <CloudRain size={size} />;
 if (condition === "wind") return <Wind size={size} />;
 return <CloudSun size={size} />;
}

function getPastureForHive(hive) {
 const locationText = normalizeSl(`${hive.name} ${hive.location || ""} ${hive.locationName || ""} ${hive.locationDescription || ""}`);
 const hasForest = /gozd|kostanj|rob gozda|hrib|hosta/.test(locationText);
 const hasChestnut = /kostanj/.test(locationText);
 const hasLinden = /lipa|lipovec|lipov/.test(locationText);
 const hasMeadow = /travnik|cvet|vrt|sadovnjak|jabol/.test(locationText);
 const isUrban = /ljubljana|mesto|blok|center/.test(locationText);

 if (hasChestnut || hasForest) {
  return {
   current: hasChestnut ? "gozdna paša" : "gozdna paša",
   next: hasChestnut ? "kostanj" : "kostanj, če je v dosegu",
   window: "zdaj do 14 dni",
   risk: "warn",
   advice: "Če želiš ločen gozdni med, razmisli o točenju pred začetkom kostanja.",
   basis: "Lokacija kaže gozd ali kostanj.",
  };
 }
 if (hasLinden) {
  return {
   current: "lipa",
   next: "poletna cvetlična paša",
   window: "ta teden",
   risk: "ok",
   advice: "Spremljaj donos. Če želiš lipov med posebej, ne čakaj predolgo.",
   basis: "Lokacija kaže lipo ali lipovec.",
  };
 }
 if (hasMeadow && !isUrban) {
  return {
   current: "cvetlična paša",
   next: "travniške paše",
   window: "stalno ob lepem vremenu",
   risk: "ok",
   advice: "Ni posebnega opozorila za mešanje z gozdnim ali kostanjem.",
   basis: "Lokacija kaže travnik, vrt ali sadovnjak.",
  };
 }
 return {
  current: "lokalna cvetlična paša",
  next: "odvisno od okolice",
  window: "spremljaj donos",
  risk: "plain",
  advice: "Za to lokacijo ne priporočam sklepov o kostanju ali gozdnem medu brez dodatnega podatka.",
  basis: "Ni označenega gozda, kostanja ali lipe.",
 };
}

function createEvent({ hiveId = "", type, source = "manual", status = "confirmed", originalText = "", structuredData = {} }) {
 const now = new Date().toISOString();
 return {
  id: makeId("EV"),
  hiveId,
  type,
  date: todayLabel(),
  source,
  status,
  originalText,
  structuredData,
  createdAt: now,
  updatedAt: now,
 };
}

function createReminderFromEvent(action, event) {
 return {
  id: makeId("R"),
  hiveId: action.hiveId || event.hiveId || "",
  title: action.title || actionTypeLabel(event.type),
  date: action.date || event.date,
  time: action.time || "cel dan",
  category: event.type,
  priority: event.type === "feeding" || event.type === "varroa_treatment" ? "warn" : "ok",
  source: event.source,
  eventId: event.id,
  status: "confirmed",
  originalText: event.originalText,
  structuredData: event.structuredData,
  createdAt: event.createdAt,
  updatedAt: event.updatedAt,
 };
}

function StatusBadge({ status, children }) {
 const text = displayText(children);
 const visualStatus = normalizeSl(text).includes("mocan") ? "strong" : status;
 return <span className={`badge badge-${visualStatus}`}>{text}</span>;
}

function PageHeader({ eyebrow, title, subtitle, action }) {
 return (
  <header className="page-header">
   <div>
    <p className="eyebrow">{eyebrow}</p>
    <h1>{title}</h1>
    {subtitle ? <p className="subtle">{subtitle}</p> : null}
   </div>
   {action}
  </header>
 );
}

function Metric({ icon: Icon, label, value, tone = "plain" }) {
 return (
  <div className={`metric metric-${tone}`}>
   <Icon size={22} />
   <div>
    <span>{label}</span>
    <strong>{value}</strong>
   </div>
  </div>
 );
}

function TinyTrend({ values, tone = "honey" }) {
 const max = Math.max(...values, 1);
 return (
  <div className="tiny-trend" aria-hidden="true">
   {values.map((value, index) => (
    <i key={index} className={`bar-${tone}`} style={{ height: `${28 + (value / max) * 58}%` }} />
   ))}
  </div>
 );
}

function HiveSelect({ hives, value, onChange }) {
 return (
  <label>
   Panj
   <select value={value} onChange={(event) => onChange(event.target.value)}>
    {hives.map((hive) => <option key={hive.id} value={hive.id}>{hive.name}</option>)}
   </select>
  </label>
 );
}

function buildDashboardBriefing(data, hives) {
 const hour = new Date().getHours();
 const greeting = hour < 11 ? "Dobro jutro" : hour < 18 ? "Pozdravljen" : "Dober ve\u010der";
 const name = "Luka";
 const active = hives.filter((hive) => hive.status !== "archived");
 const urgentHive = active.find((hive) => hive.status === "danger" || (!isManualHive(hive) && toNumber(hive.foodDays) <= 3));
 const warnHive = active.find((hive) => hive.status === "warn" || (!isManualHive(hive) && toNumber(hive.foodDays) <= 7));
 const swarmEvent = (data.events || []).find((event) => /swarm|swarm_cells|rojenj|maticnik|mati\u010dnik/.test(normalizeSl(`${event.type} ${event.originalText || ""} ${event.structuredData?.note || ""}`)));
 const sensorIssue = active.find((hive) => {
  const sensor = sensorStatusForHive(hive);
  return sensor.status === "danger" || sensor.status === "stale";
 });
 const weatherIssue = active.map((hive) => ({ hive, weather: getWeatherForHive(data, hive) }))
  .map((entry) => ({ ...entry, status: weatherStatusForHive(entry.hive, entry.weather) }))
  .find((entry) => entry.status.risk !== "ok");
 const pastureOpportunity = active
  .map((hive) => ({ hive, pasture: getPastureForHive(hive) }))
  .find((entry) => entry.pasture.risk === "warn" || entry.pasture.current.includes("lipa") || entry.pasture.current.includes("gozd"));

 if (swarmEvent) {
  const hive = getHive(data.hives, swarmEvent.hiveId) || urgentHive || warnHive || active[0];
  return {
   tone: "danger",
   title: `${name}, pozor: mo\u017eni znaki rojenja.`,
   text: hive ? `Najprej preveri panj ${hive.name}. \u010ce so mati\u010dniki ali \u010debele visijo na bradi, ukrepaj danes.` : "Preveri zadnje zapise o rojenju in mati\u010dnikih.",
   actionLabel: hive ? `Odpri ${hive.name}` : "Odpri koledar",
   actionPage: hive ? null : "calendar",
   hiveId: hive?.id || "",
  };
 }
 if (urgentHive) {
  const reason = !isManualHive(urgentHive) && toNumber(urgentHive.foodDays) <= 3 ? `pomanjkanja hrane (${urgentHive.foodDays} dni)` : "rde\u010dega stanja";
  return {
   tone: "danger",
   title: `${greeting} ${name}, nujno si vzemi eno uro.`,
   text: `Obi\u0161\u010di panj ${urgentHive.name} zaradi ${reason}. To je danes pomembnej\u0161e od priprave na medenje.`,
   actionLabel: `Odpri ${urgentHive.name}`,
   hiveId: urgentHive.id,
  };
 }
 if (sensorIssue) {
  const sensor = sensorStatusForHive(sensorIssue);
  return {
   tone: "warn",
   title: `${name}, najprej preveri povezavo senzorja.`,
   text: `${sensorIssue.name}: ${sensor.label}. To ne pomeni, da je panj v redu, samo da nimamo sve\u017eega podatka.`,
   actionLabel: `Odpri ${sensorIssue.name}`,
   hiveId: sensorIssue.id,
  };
 }
 if (warnHive) {
  return {
   tone: "warn",
   title: `${greeting} ${name}, danes preveri en panj.`,
   text: `Panj ${warnHive.name} ni kriti\u010den, ampak ga je pametno pogledati pred ostalimi opravili.`,
   actionLabel: `Odpri ${warnHive.name}`,
   hiveId: warnHive.id,
  };
 }
 if (weatherIssue) {
  return {
   tone: "warn",
   title: `${greeting} ${name}, vreme narekuje tempo.`,
   text: `${weatherIssue.hive.name}: ${weatherIssue.status.text}. ${weatherIssue.status.advice}`,
   actionLabel: "Poglej vreme",
   actionPage: "weather",
  };
 }
 if (pastureOpportunity) {
  return {
   tone: "ok",
   title: `${greeting} ${name}, danes ni posebnosti.`,
   text: `${pastureOpportunity.hive.name}: ${pastureOpportunity.pasture.current}. ${pastureOpportunity.pasture.advice}`,
   actionLabel: "Poglej vreme in pa\u0161o",
   actionPage: "weather",
  };
 }
 return {
  tone: "ok",
  title: `${greeting} ${name}, danes ni posebnosti.`,
  text: "Panji so mirni. Sprosti se in naredi samo kratek pogled, \u010de gre\u0161 mimo stoji\u0161\u010da.",
  actionLabel: "Poglej panje",
  actionPage: "dashboard",
 };
}
function Dashboard({ data, openHive, goTo }) {
 const [sortBy, setSortBy] = useState("status");
 const [filterBy, setFilterBy] = useState("all");
 const [notificationsOpen, setNotificationsOpen] = useState(false);
 const activeHives = data.hives.filter((hive) => hive.status !== "archived");
 const counts = useMemo(() => ({
  all: activeHives.length,
  ok: activeHives.filter((hive) => hive.status === "ok").length,
  attention: activeHives.filter((hive) => hive.status !== "ok").length,
 }), [activeHives]);
 const visibleHives = useMemo(() => sortAndFilterHives(activeHives, sortBy, filterBy), [activeHives, sortBy, filterBy]);
 const seasonHoneyKg = data.extractionEvents.reduce((sum, event) => sum + toNumber(event.netKg), 0);
 const seasonIncome = (data.financeEvents || []).filter((event) => event.type === "income").reduce((sum, event) => sum + toNumber(event.amountEur), 0);
 const totalFrames = activeHives.reduce((sum, hive) => sum + toNumber(hive.frameCount, 10), 0);
 const productsThisSeason = seasonHoneyKg + (data.productEvents || []).reduce((sum, event) => sum + (event.unit === "kg" ? toNumber(event.quantity) : toNumber(event.quantity) / 1000), 0);
 const lastVisitMinutes = Math.min(...activeHives.map((hive) => parseRelativeLastSeen(hive.lastSeen)).filter(Number.isFinite));
 const lastVisitLabel = Number.isFinite(lastVisitMinutes) ? (lastVisitMinutes < 60 ? `${lastVisitMinutes} min` : `${Math.floor(lastVisitMinutes / 60)} h`) : "-";
 const briefing = buildDashboardBriefing(data, activeHives);
 const priorityWeather = activeHives
  .map((hive) => ({ hive, weather: getWeatherForHive(data, hive) }))
  .map((entry) => ({ ...entry, status: weatherStatusForHive(entry.hive, entry.weather) }))
  .filter((entry) => entry.status.risk !== "ok")
  .slice(0, 2);
 const greeting = new Date().getHours() < 11 ? "Dobro jutro" : new Date().getHours() < 18 ? "Pozdravljen" : "Dober večer";
 const notificationItems = [
  ...(briefing.tone !== "ok" ? [{ id: "briefing", tone: briefing.tone, title: briefing.tone === "danger" ? "Pomembno opozorilo" : "Predlog za pregled", text: briefing.text, hiveId: briefing.hiveId }] : []),
  ...(data.alerts || []).filter((alert) => !alert.resolved).slice(0, 4).map((alert) => ({ id: alert.id, tone: alert.severity || "warn", title: alert.title, text: `${getHiveName(data.hives, alert.hiveId)} · ${alert.message}`, hiveId: alert.hiveId })),
  ...data.reminders.slice(0, 3).map((reminder) => ({ id: reminder.id, tone: reminder.priority || "ok", title: reminder.title, text: `${getHiveName(data.hives, reminder.hiveId)} · ${reminder.date}`, hiveId: reminder.hiveId })),
 ];
 const urgentCount = notificationItems.filter((item) => item.tone === "danger" || item.tone === "warn").length;

 return (
  <section>
   <div className="hero compact-hero hero-calm">
    <div className="hero-tools">
     <button className="hero-bell-button" type="button" onClick={() => setNotificationsOpen(true)} aria-label="Obvestila">
      <Bell size={23} />
      {urgentCount ? <span>{urgentCount}</span> : null}
     </button>
     <button className="hero-settings-button" type="button" onClick={() => goTo("more")} aria-label="Nastavitve in orodja">
      <Settings size={19} />
     </button>
    </div>
    <div className="hero-copy">
     <p className="eyebrow">PametniPanj</p>
     <h1>{greeting}, Čebelar Luka.</h1>
     <p>{urgentCount ? `Imaš ${urgentCount} obvestil v zvončku.` : "Danes ni posebnosti. Sprosti se."}</p>
    </div>
    <div className="summary-strip">
     <div><strong>{counts.all}</strong><span>panjev</span></div>
     <div><strong>{counts.ok}</strong><span>mirna</span></div>
     <div><strong>{counts.attention}</strong><span>za pregled</span></div>
    </div>
   </div>

   {notificationsOpen ? (
    <div className="modal-backdrop">
     <div className="modal-card">
      <div className="card-title">
       <h2>Obvestila</h2>
       <button className="text-button" onClick={() => setNotificationsOpen(false)}>Zapri</button>
      </div>
      <div className="stack">
       {notificationItems.length ? notificationItems.map((item) => (
        <button className={`notification-row notification-${item.tone}`} key={item.id} onClick={() => { setNotificationsOpen(false); item.hiveId ? openHive(item.hiveId) : goTo("calendar"); }}>
         <Bell size={22} />
         <div><strong>{item.title}</strong><span>{item.text}</span></div>
        </button>
       )) : <p className="empty">Ni novih obvestil.</p>}
      </div>
     </div>
    </div>
   ) : null}

   {priorityWeather.length ? (
    <div className="card weather-overview priority-weather">
     <div className="card-title">
      <h2>Vremenski napotki</h2>
      <button className="text-button" onClick={() => goTo("weather")}>Odpri</button>
     </div>
     <div className="weather-strip">
      {priorityWeather.map(({ hive, weather, status }) => (
       <button className={`weather-chip weather-${status.risk}`} key={hive.id} onClick={() => openHive(hive.id)}>
        <strong>{hive.name}</strong>
        <span>{status.text}</span>
        <small>{status.advice}</small>
       </button>
      ))}
     </div>
    </div>
   ) : null}

   <h2 className="section-title">Moji panji</h2>
   <div className="segmented-row">
    {[
     ["all", "Vsi"],
     ["danger", "Ukrepaj"],
     ["warn", "Preveri"],
     ["ok", "Mirni"],
    ].map(([id, label]) => <button key={id} className={filterBy === id ? "active" : ""} onClick={() => setFilterBy(id)}>{label}</button>)}
   </div>
   <label className="mini-select">Razvrsti
    <select value={sortBy} onChange={(event) => setSortBy(event.target.value)}>
     <option value="status">Status</option>
     <option value="name">Ime</option>
     <option value="foodDays">Dni hrane</option>
     <option value="lastUpdate">Zadnja osvežitev</option>
     <option value="weightChange">Sprememba teže</option>
    </select>
   </label>
   <div className="hive-list">
    {visibleHives.map((hive) => {
     const weather = getWeatherForHive(data, hive);
     const status = weatherStatusForHive(hive, weather);
     const sensor = sensorStatusForHive(hive);
     return (
      <button className="hive-card" key={hive.id} onClick={() => openHive(hive.id)} style={hiveCardBorderStyle(hive)}>
       <div className="hive-topline">
        <div className="hive-main">
         <span className={`status-dot ${hive.status}`} />
         <div>
          <strong>{hive.name}</strong>
          <span>{displayText(hive.location)}</span>
         </div>
        </div>
        <HiveWeatherPill weather={weather} status={status} />
        <StatusBadge status={hive.status}>{hive.statusText}</StatusBadge>
       </div>
       <div className="hive-stats">
        <span>{isManualHive(hive) ? "PNV" : `${hive.foodDays} dni hrane`}</span>
        <span className={`sensor-chip sensor-${sensor.status}`}>{sensor.label}</span>
        {sensor.status !== "ok" ? <span className={`sensor-chip sensor-${sensor.status}`}>{sensor.detail}</span> : null}
       </div>
       {(sensor.status === "danger" || sensor.status === "stale") ? (
        <div className={`sensor-banner sensor-banner-${sensor.status}`}>
         <strong>{sensor.label}</strong>
         <span>{sensor.detail}</span>
        </div>
       ) : null}
       <ChevronRight size={20} className="chevron" />
      </button>
     );
    })}
   </div>

   <div className="quick-grid dashboard-actions">
    <button onClick={() => goTo("create")}><Plus size={20} /> Dodaj panj</button>
    <button onClick={() => goTo("feeding")}><Utensils size={20} /> Hranjenje</button>
    <button onClick={() => goTo("extraction")}><Scale size={20} /> Točenje</button>
    <button onClick={() => goTo("ai")}><Bot size={20} /> Pametna čebela</button>
    <button onClick={() => goTo("weather")}><CloudSun size={20} /> Vreme</button>
    <button onClick={() => goTo("more")}><Settings size={20} /> Orodja</button>
   </div>

   <h2 className="section-title">Danes</h2>
   <div className="stack">
    {data.reminders.slice(0, 3).map((reminder) => (
     <ReminderRow key={reminder.id} reminder={reminder} hives={data.hives} />
    ))}
   </div>
   {data.alerts.length ? (
    <>
     <h2 className="section-title">Opozorila naprav</h2>
     <div className="stack">
      {data.alerts.filter((alert) => !alert.resolved).slice(0, 4).map((alert) => (
       <AlertRow key={alert.id} alert={alert} hives={data.hives} />
      ))}
     </div>
    </>
   ) : null}

   <h2 className="section-title">Sezona</h2>
   <div className="season-card">
    <span>Sezona 2026</span>
    <strong>{seasonHoneyKg.toFixed(0)} kg medu · {seasonIncome.toFixed(0)} € prihodkov</strong>
    <p>{activeHives.length} aktivni panji</p>
   </div>
   <div className="quick-stats-row">
    <div><strong>{totalFrames}</strong><span>satov skupaj</span></div>
    <div><strong>{productsThisSeason.toFixed(1)} kg</strong><span>pridelkov</span></div>
    <div><strong>{lastVisitLabel}</strong><span>zadnji obisk</span></div>
   </div>
  </section>
 );
}


function sortAndFilterHives(hives, sortBy, filterBy) {
 const rank = { danger: 0, warn: 1, ok: 2 };
 return [...hives]
  .filter((hive) => filterBy === "all" || hive.status === filterBy)
  .sort((a, b) => {
   if (sortBy === "name") return a.name.localeCompare(b.name, "sl");
   if (sortBy === "foodDays") return toNumber(a.foodDays) - toNumber(b.foodDays);
   if (sortBy === "lastUpdate") return new Date(b.updatedAt || b.createdAt || 0) - new Date(a.updatedAt || a.createdAt || 0);
   if (sortBy === "weightChange") return Math.abs(toNumber(b.weeklyDeltaKg)) - Math.abs(toNumber(a.weeklyDeltaKg));
   return (rank[a.status] ?? 3) - (rank[b.status] ?? 3);
  });
}

function hiveCardBorderStyle(hive) {
 if (hive.status === "danger") return { borderLeftColor: "#C94033", borderLeftWidth: 4 };
 if (hive.status === "warn") return { borderLeftColor: "#E8650A", borderLeftWidth: 4 };
 return { borderLeftColor: hive.hiveColor || "#2D6A1A", borderLeftWidth: hive.hiveColor ? 7 : 4 };
}

function inventoryCategoryMeta(categoryOrName = "") {
 const text = normalizeSl(categoryOrName);
 if (text.includes("sladkor")) return { label: "Sladkor", icon: Cookie, color: "#C07810" };
 if (text.includes("kozar")) return { label: "Kozarci", icon: GlassWater, color: "#E8A020" };
 if (text.includes("pokrov") || text.includes("lids")) return { label: "Pokrovčki", icon: Hexagon, color: "#2D6A1A" };
 if (text.includes("oprema")) return { label: "Oprema", icon: Wrench, color: "#64748B" };
 if (text.includes("zdrav")) return { label: "Zdravila", icon: HeartPulse, color: "#E8650A" };
 return { label: "Drugo", icon: Package, color: "#8A8173" };
}

const VARROA_TREATMENTS = ["Oksalna kislina", "Apiguard", "Apivar", "Timol", "Brez zdravljenja", "Drugo"];
const QUEEN_STATUSES = ["Odlična", "Dobra", "Slaba", "Ni je", "Neznano"];
const DISEASE_OPTIONS = ["Ameriška gniloba", "Evropska gniloba", "Nosema", "Varoza", "Kalkova zalega", "Ni bolezni"];
const PHOTO_LIMITS = {
 free: { count: 3, mb: 1, label: "FREE" },
 smart: { count: 20, mb: 5, label: "SMART" },
 pro: { count: Infinity, mb: 20, label: "PRO" },
};

function HealthPanel({ hive, data, saveHealthRecord }) {
 const latest = (data.healthRecords || []).filter((record) => record.hiveId === hive.id).sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))[0];
 const [form, setForm] = useState(() => latest || {
  hiveId: hive.id,
  varroaLevel: 0,
  inspectionDate: todayLabel(),
  treatment: "Brez zdravljenja",
  queenStatus: "Neznano",
  queenLastSeen: "",
  queenYear: "",
  diseases: ["Ni bolezni"],
  notes: "",
  neighborAlert: { sent: false, radiusKm: 10, area: "Savinjska dolina" },
 });
 const [showNeighbor, setShowNeighbor] = useState(false);

 function update(field, value) {
  setForm((current) => ({ ...current, [field]: value }));
  if (field === "varroaLevel" && Number(value) >= 3) setShowNeighbor(true);
 }

 function toggleDisease(disease) {
  setForm((current) => {
   const diseases = new Set(current.diseases || []);
   if (disease === "Ni bolezni") return { ...current, diseases: ["Ni bolezni"] };
   diseases.delete("Ni bolezni");
   diseases.has(disease) ? diseases.delete(disease) : diseases.add(disease);
   return { ...current, diseases: [...diseases] };
  });
 }

 function submit(event) {
  event.preventDefault();
  saveHealthRecord({ ...form, hiveId: hive.id });
 }

 return (
  <div className="stack">
   <form className="form-card compact-form" onSubmit={submit}>
    <div className="card-title"><h2>Zdravje panja</h2><span>{hive.name}</span></div>
    <label>Stopnja varoje</label>
    <div className="varroa-scale">
     {[0, 1, 2, 3, 4, 5].map((level) => <button type="button" key={level} className={`${Number(form.varroaLevel) === level ? "active" : ""} varroa-${level}`} onClick={() => update("varroaLevel", level)}>{level}</button>)}
    </div>
    <div className="form-grid">
     <label>Datum pregleda<input value={form.inspectionDate} onChange={(event) => update("inspectionDate", event.target.value)} /></label>
     <label>Zdravljenje<select value={form.treatment} onChange={(event) => update("treatment", event.target.value)}>{VARROA_TREATMENTS.map((item) => <option key={item} value={item}>{item}</option>)}</select></label>
    </div>
    <label>Matica</label>
    <div className="pill-row">
     {QUEEN_STATUSES.map((status) => <button type="button" key={status} className={form.queenStatus === status ? "active" : ""} onClick={() => update("queenStatus", status)}>{status}</button>)}
    </div>
    <div className="form-grid">
     <label>Matica nazadnje videna<input value={form.queenLastSeen} onChange={(event) => update("queenLastSeen", event.target.value)} placeholder="npr. 31. maj" /></label>
     <label>Leto matice<input value={form.queenYear} onChange={(event) => update("queenYear", event.target.value)} placeholder="npr. 2025" /></label>
    </div>
    <label>Bolezni</label>
    <div className="pill-row">
     {DISEASE_OPTIONS.map((disease) => <button type="button" key={disease} className={(form.diseases || []).includes(disease) ? "active" : ""} onClick={() => toggleDisease(disease)}>{disease}</button>)}
    </div>
    <label>Opombe<textarea value={form.notes} onChange={(event) => update("notes", event.target.value)} placeholder="Kaj si opazil pri zalegi, čebelah ali vhodu" /></label>
    <button className="primary-button" type="submit"><ShieldAlert size={20} /> Shrani zdravje</button>
   </form>
   {showNeighbor ? (
    <div className="modal-backdrop">
     <div className="modal-card">
      <div className="card-title"><h2>Anonimno opozorilo</h2><button className="text-button" onClick={() => setShowNeighbor(false)}>Zapri</button></div>
      <p className="subtle">Ali želite anonimno opozoriti sosednje čebelarje Ime in točna lokacija se nikoli ne prikažeta.</p>
      <label>Območje<select value={form.neighborAlert.radiusKm || 10} onChange={(event) => setForm((current) => ({ ...current, neighborAlert: { ...(current.neighborAlert || {}), radiusKm: Number(event.target.value), sent: true, area: "Savinjska dolina" } }))}><option value={5}>5 km</option><option value={10}>10 km</option><option value={20}>20 km</option></select></label>
      <div className="warning-text">Čebelar v vaši okolici poroča o povišani stopnji varoze. Priporočamo preventivni pregled.</div>
      <button className="primary-button" onClick={() => { setForm((current) => ({ ...current, neighborAlert: { ...(current.neighborAlert || {}), sent: true, area: "Savinjska dolina" } })); setShowNeighbor(false); }}>Da, anonimno opozori</button>
     </div>
    </div>
   ) : null}
   <div className="stack">
    {(data.healthRecords || []).filter((record) => record.hiveId === hive.id).map((record) => <EventCard key={record.id} icon={ShieldAlert} title={`Varoja ${record.varroaLevel}/5 · matica ${record.queenStatus}`} subtitle={`${record.inspectionDate} · ${record.treatment} · ${(record.diseases || []).join(", ")}`} />)}
   </div>
  </div>
 );
}

function PhotoPanel({ hive, photos, addHivePhoto, deleteHivePhoto }) {
 const [tier, setTier] = useState("free");
 const [caption, setCaption] = useState("");
 const [selected, setSelected] = useState(null);
 const limits = PHOTO_LIMITS[tier];
 const limitReached = photos.length >= limits.count;

 function handleFile(event) {
  const file = event.target.files?.[0];
  if (!file) return;
  const sizeMb = file.size / 1024 / 1024;
  if (sizeMb > limits.mb) {
   alert(`Ta paket dovoli fotografije do ${limits.mb} MB.`);
   return;
  }
  if (limitReached) {
   alert("Dosežen je limit fotografij. Za več fotografij izberi SMART ali PRO.");
   return;
  }
  const reader = new FileReader();
  reader.onload = () => {
   addHivePhoto({ hiveId: hive.id, caption, url: reader.result, sizeMb: roundOne(sizeMb) });
   setCaption("");
   event.target.value = "";
  };
  reader.readAsDataURL(file);
 }

 return (
  <div className="stack">
   <div className="form-card compact-form">
    <div className="card-title"><h2>Foto dnevnik</h2><span>{PHOTO_LIMITS[tier].label}</span></div>
    <div className="segmented-row">
     {Object.keys(PHOTO_LIMITS).map((id) => <button key={id} className={tier === id ? "active" : ""} onClick={() => setTier(id)}>{PHOTO_LIMITS[id].label}</button>)}
    </div>
    <p className="subtle">{photos.length}/{Number.isFinite(limits.count) ? limits.count : "∞"} fotografij · največ {limits.mb} MB na fotografijo</p>
    <label>Opomba k fotografiji<input value={caption} onChange={(event) => setCaption(event.target.value)} placeholder="npr. zalega, matica, zaloga..." /></label>
    <label className={`file-button ${limitReached ? "disabled" : ""}`}><Camera size={22} /> Dodaj fotografijo<input type="file" accept="image/*" capture="environment" onChange={handleFile} disabled={limitReached} /></label>
    {limitReached ? <p className="warning-text">Dosežen je limit paketa FREE. Nadgradnja SMART omogoči 20 fotografij na panj.</p> : null}
   </div>
   <div className="photo-grid">
    {photos.map((photo) => (
     <button key={photo.id} className="photo-thumb" onClick={() => setSelected(photo)}>
      {photo.url ? <img src={photo.url} alt={photo.caption || "Fotografija panja"} /> : <Image size={36} />}
      <span>{photo.date}</span>
     </button>
    ))}
   </div>
   {selected ? (
    <div className="modal-backdrop">
     <div className="modal-card">
      <div className="card-title"><h2>{selected.caption || "Fotografija"}</h2><button className="text-button" onClick={() => setSelected(null)}>Zapri</button></div>
      {selected.url ? <img className="photo-large" src={selected.url} alt={selected.caption || "Fotografija panja"} /> : <div className="photo-large placeholder"><Image size={54} /></div>}
      <p className="subtle">{selected.date} · {selected.sizeMb || 0} MB</p>
    <button className="secondary-button" onClick={() => addHivePhoto({ hiveId: hive.id, caption: selected.caption, url: selected.url, sizeMb: selected.sizeMb, aiAnalysis: "Leglo izgleda zdravo in enakomerno. Matice na tej fotografiji ni mogoče zanesljivo potrditi. Priporočam pregled v naslednjih 7 dneh." })}>Naj pogleda Pametna čebela</button>
      {selected.aiAnalysis ? <p className="success-text">{selected.aiAnalysis}</p> : null}
      <button className="danger-button" onClick={() => { deleteHivePhoto(selected.id); setSelected(null); }}>Izbriši fotografijo</button>
     </div>
    </div>
   ) : null}
  </div>
 );
}

function HiveDetail({ data, hiveId, setPage, startEdit, deleteHive, addNoteForHive, saveHealthRecord, addHivePhoto, deleteHivePhoto }) {
 const hive = getHive(data.hives, hiveId);
 const hiveReadings = data.readings.filter((reading) => reading.hiveId === hive.id);
 const hiveReminders = data.reminders.filter((reminder) => reminder.hiveId === hive.id);
 const timeline = buildTimeline(data, hive.id);
 const weather = getWeatherForHive(data, hive);
 const weatherStatus = weatherStatusForHive(hive, weather);
 const pasture = getPastureForHive(hive);
 const sensor = sensorStatusForHive(hive);
 const manualHive = isManualHive(hive);
 const [detailTab, setDetailTab] = useState("pregled");
 const [menuOpen, setMenuOpen] = useState(false);
 const [sensorModalOpen, setSensorModalOpen] = useState(false);

 return (
  <section>
   <PageHeader
    eyebrow={hive.id}
    title={displayText(hive.name)}
    subtitle={`${displayText(hive.location)} · zadnji zapis ${displayText(hive.lastSeen)}`}
    action={<button className="icon-button" onClick={() => setPage("dashboard")} aria-label="Nazaj"><ArrowLeft size={22} /></button>}
   />

   <div className="small-actions">
    <button className="secondary-button" onClick={() => startEdit(hive.id)}><Pencil size={18} /> Uredi panj</button>
    <button className="secondary-button" onClick={() => setMenuOpen(!menuOpen)}>Več</button>
   </div>
   {menuOpen ? (
    <div className="more-menu-card">
     <button onClick={() => deleteHive(hive.id)}><Trash2 size={18} /> Arhiviraj panj</button>
    </div>
   ) : null}

   <div className={`status-panel status-${hive.status}`}>
    <div>
     <StatusBadge status={hive.status}>{hive.statusText}</StatusBadge>
     <h2>{hive.status === "danger" ? "Panj potrebuje ukrepanje" : hive.status === "warn" ? "Priporo\u010dam kratek pregled" : "Panj je videti stabilen"}</h2>
     <p>{manualHive ? "Ta panj je v ro\u010dnem na\u010dinu. Stanje temelji na tvojih zapisih, opomnikih in pregledih." : hive.status === "danger" ? "Hrane je malo in te\u017ea pada. Dodaj hrano \u0161e danes." : hive.status === "warn" ? "Te\u017ea pada, zato preveri zalogo in aktivnost pri vhodu." : "Te\u017ea in temperatura sta v pri\u010dakovanem obmo\u010dju."}</p>
    </div>
   </div>

   {manualHive ? (
   <div className="sensor-panel sensor-panel-manual">
    <Package size={22} />
    <div>
     <strong>Podatki niso na voljo</strong>
     <span>Ta panj nima pametnega senzorja.</span>
    </div>
    <button className="secondary-button compact-button" type="button" onClick={() => setSensorModalOpen(true)}>Naroči PametniPanj set</button>
   </div>
   ) : (
   <div className={`sensor-panel sensor-panel-${sensor.status}`}>
    <BatteryCharging size={22} />
    <div>
     <strong>{sensor.label}</strong>
     <span>{sensor.detail}</span>
    </div>
   </div>
   )}

   {sensorModalOpen ? (
    <div className="modal-backdrop">
     <div className="modal-card">
      <div className="card-title">
       <h2>PametniPanj senzorski set</h2>
       <button className="text-button" onClick={() => setSensorModalOpen(false)}>Zapri</button>
      </div>
      <p>Za dostop do podatkov o teži, temperaturi, zalogah hrane in senzorskem statusu naročite PametniPanj senzorski set. Vključuje tehtnico, senzor temperature/vlage in LTE/BT modul.</p>
      <a className="primary-button full-button" href="#" onClick={(event) => event.preventDefault()}>Več informacij</a>
     </div>
    </div>
   ) : null}

   <div className="segmented-row detail-tabs">
    {[
     ["pregled", "Pregled"],
     ["zdravje", "Zdravje"],
     ["foto", "Fotografije"],
    ].map(([id, label]) => <button key={id} className={detailTab === id ? "active" : ""} onClick={() => setDetailTab(id)}>{label}</button>)}
   </div>

   {detailTab === "zdravje" ? <HealthPanel hive={hive} data={data} saveHealthRecord={saveHealthRecord} /> : null}
   {detailTab === "foto" ? <PhotoPanel hive={hive} photos={(data.hivePhotos || []).filter((photo) => photo.hiveId === hive.id)} addHivePhoto={addHivePhoto} deleteHivePhoto={deleteHivePhoto} /> : null}
   {detailTab !== "pregled" ? null : (
    <>

   <WeatherHiveCard hive={hive} weather={weather} status={weatherStatus} compact={false} />
   <PastureCard hive={hive} pasture={pasture} />

   {manualHive ? null : (
   <>
   <div className="metric-grid">
    <Metric icon={Scale} label="Teža" value={`${hive.weightKg} kg`} />
    <Metric icon={Activity} label="7 dni" value={`${hive.weeklyDeltaKg > 0 ? "+" : ""}${hive.weeklyDeltaKg} kg`} tone={hive.weeklyDeltaKg < 0 ? "warn" : "ok"} />
    <Metric icon={Utensils} label="Hrana" value={`${hive.foodDays} dni`} tone={hive.foodDays < 7 ? "warn" : "ok"} />
    <Metric icon={Thermometer} label="Klima" value={`${hive.temperatureC} °C`} />
   </div>

   <div className="card">
    <div className="card-title">
     <h2>Gibanje teže</h2>
     <span>simulirano</span>
    </div>
    <TinyTrend values={[33, 35, 38, 41, 43, 44, Math.max(hive.weightKg, 1)]} />
   </div>
   </>
   )}

   <div className="card">
    <div className="card-title">
     <h2>Naslednja opravila</h2>
     <button className="text-button" onClick={() => setPage("calendar")}>Koledar</button>
    </div>
    <div className="stack">
     {hiveReminders.length ? hiveReminders.map((reminder) => <ReminderRow key={reminder.id} reminder={reminder} hives={data.hives} />) : <p className="empty">Za ta panj ni odprtih opomnikov.</p>}
    </div>
   </div>

   <details className="details-card">
    <summary>Podrobnosti</summary>
    <LocationBlock hive={hive} />
    {manualHive ? (
    <div className="suggestion-box">
     <strong>PNV · Ročni vnos</strong>
     <span>Teža, hrana, temperatura, vlaga, baterija in signal niso na voljo brez senzorja.</span>
    </div>
    ) : (
    <>
    <div className="detail-grid">
     <Metric icon={Droplets} label="Vlaga" value={`${hive.humidityPct}%`} />
     <Metric icon={BatteryCharging} label="Baterija" value={`${hive.batteryPct}%`} />
     <Metric icon={Radio} label="Signal" value={hive.signal} />
     <Metric icon={QrCode} label="QR" value={hive.qrCode} />
     <Metric icon={ClipboardList} label="Vir" value={hive.dataSource || "demo"} />
    </div>
    <div className="table-wrap">
     <table>
      <thead><tr><th>Čas</th><th>kg</th><th>°C</th><th>vlaga</th><th>zvok</th></tr></thead>
      <tbody>{hiveReadings.map((reading) => <tr key={reading.time}><td>{reading.time}</td><td>{reading.weightKg}</td><td>{reading.tempC}</td><td>{reading.humidityPct}%</td><td>{reading.soundHz} Hz</td></tr>)}</tbody>
     </table>
    </div>
    </>
    )}
   </details>

   <div className="card">
    <div className="card-title">
     <h2>Časovnica panja</h2>
     <button className="text-button" onClick={() => addNoteForHive(hive.id)}>Dodaj noto</button>
    </div>
    <div className="timeline-list">
     {timeline.map((item) => <TimelineItem key={item.id} item={item} />)}
    </div>
   </div>
    </>
   )}
  </section>
 );
}

function LocationBlock({ hive }) {
 const sourceLabels = {
  manual: "Lokacija nastavljena ro\u010dno",
  phone: "Lokacija iz telefona",
  device: "Lokacija iz naprave",
 };
 const hasCoordinates = Number.isFinite(Number(hive.latitude)) && Number.isFinite(Number(hive.longitude));
 const mapsUrl = hasCoordinates
  ? `https://www.google.com/maps?q=${encodeURIComponent(`${hive.latitude},${hive.longitude}`)}`
  : `https://www.google.com/maps/search/api=1&query=${encodeURIComponent(hive.locationName || hive.location || hive.name)}`;
 return (
  <div className="location-card">
   <strong>{displayText(hive.locationName || hive.location || "Lokacija")}</strong>
   <span>{sourceLabels[hive.locationSource] || "Lokacija nastavljena ročno"} · {freshnessLabel(hive.locationUpdatedAt)}</span>
   <span>{sourceLabels[hive.locationSource] || "Lokacija nastavljena ročno"} · {freshnessLabel(hive.locationUpdatedAt)}</span>
   <div className="map-placeholder">Predogled zemljevida</div>
   <a className="secondary-link" href={mapsUrl} target="_blank" rel="noreferrer">Odpri v Google Maps</a>
  </div>
 );
}

function HiveWeatherPill({ weather, status }) {
 const forecast = forecastForWeather(weather)[0];
 if (!weather || !forecast) return null;
 return (
  <span className={`hive-weather-pill weather-${status.risk}`}>
   <WeatherIcon condition={forecast.condition} size={21} />
   <strong>{Math.round(weather.tempC)}°</strong>
  </span>
 );
}

function ForecastStrip({ forecast }) {
 return (
  <div className="forecast-strip" aria-label="7-dnevna napoved">
   {forecast.map((day) => (
    <span className={`forecast-day forecast-${day.condition}`} key={day.day}>
     <small>{day.day}</small>
     <WeatherIcon condition={day.condition} size={18} />
     <strong>{day.tempC}°</strong>
    </span>
   ))}
  </div>
 );
}

function WeatherHiveCard({ hive, weather, status, compact = true }) {
 const forecast = forecastForWeather(weather);
 const safeWeather = weather || { tempC: "-", rainMmNext24h: "-", windKmh: "-", humidityPct: "-", pressureHpa: "-", condition: "Ni podatka", observedAt: "" };
 return (
  <article className={`weather-card weather-${status.risk}`}>
   <div className="weather-card-main">
    <div>
     <span className="eyebrow">{displayText(hive.locationName || hive.location)}</span>
     <h2>{compact ? displayText(hive.name) : status.text}</h2>
     <p>{compact ? status.text : status.advice}</p>
    </div>
    <CloudSun size={38} />
   </div>
   <div className="weather-metrics">
    <span><Thermometer size={17} /> {safeWeather.tempC} °C</span>
    <span><CloudRain size={17} /> {safeWeather.rainMmNext24h} mm</span>
    <span><Wind size={17} /> {safeWeather.windKmh} km/h</span>
   </div>
   <ForecastStrip forecast={forecast} />
   <p className="subtle">{displayText(beekeepingForecastSummary(forecast))}</p>
   {!compact ? (
    <details className="inline-details">
     <summary>Podrobnosti</summary>
     <div className="detail-grid">
      <Metric icon={Droplets} label="Vlaga zunaj" value={`${safeWeather.humidityPct}%`} />
      <Metric icon={Gauge} label="Tlak" value={`${safeWeather.pressureHpa} hPa`} />
      <Metric icon={CloudSun} label="Stanje" value={safeWeather.condition} />
      <Metric icon={ClockIcon} label="Osveženo" value={safeWeather.observedAt ? freshnessLabel(safeWeather.observedAt).replace("zadnji podatek ", "") : "ni podatka"} />
     </div>
    </details>
   ) : null}
  </article>
 );
}

function ClockIcon(props) {
 return <CalendarDays {...props} />;
}

function WeatherPage({ data, openHive }) {
 const activeHives = data.hives.filter((hive) => hive.status !== "archived");
 const [liveWeather, setLiveWeather] = useState({});
 const [weatherSource, setWeatherSource] = useState("Nalagam Open-Meteo...");
 useEffect(() => {
  let cancelled = false;
  Promise.all(activeHives.map(async (hive) => {
   try {
    const weather = await fetchOpenMeteoWeatherForHive(hive);
    return weather ? [hive.id, weather] : null;
   } catch {
    return null;
   }
  })).then((entries) => {
   if (cancelled) return;
   const next = Object.fromEntries(entries.filter(Boolean));
   setLiveWeather(next);
   setWeatherSource(Object.keys(next).length ? "Open-Meteo v živo" : "Simulirano vreme");
  });
  return () => {
   cancelled = true;
  };
 }, [data.hives]);
 const bestCount = activeHives.filter((hive) => weatherStatusForHive(hive, getWeatherForHive(data, hive)).risk === "ok").length;
 const warnCount = activeHives.length - bestCount;

 return (
  <section>
   <PageHeader eyebrow="Vreme" title="Stanje po lokacijah" subtitle={`${weatherSource}. Nasvet je napisan za čebelarja, ne za meteorologa.`} />
   <div className="metric-grid">
    <Metric icon={CloudSun} label="Primerno" value={bestCount} tone="ok" />
    <Metric icon={CloudRain} label="Previdno" value={warnCount} tone={warnCount ? "warn" : "ok"} />
   </div>
   <div className="stack">
    {activeHives.map((hive) => {
     const weather = liveWeather[hive.id] || getWeatherForHive(data, hive);
     const status = weatherStatusForHive(hive, weather);
     return (
      <button className="unstyled-button" key={hive.id} onClick={() => openHive(hive.id)}>
       <WeatherHiveCard hive={hive} weather={weather} status={status} />
      </button>
     );
    })}
   </div>
   <details className="details-card">
    <summary>Podrobnosti</summary>
    <p className="subtle">Vreme je vezano na lokacijo panja. Ko dodamo pravi vir, uporabimo koordinate panja in osvežujemo podatke v ozadju.</p>
   </details>
  </section>
 );
}

function PastureCard({ hive, pasture }) {
 return (
  <article className={`pasture-card pasture-${pasture.risk}`}>
   <div>
    <span className="eyebrow">{displayText(hive.locationName || hive.location)}</span>
    <h2>{pasture.current}</h2>
    <p>{pasture.advice}</p>
   </div>
   <div className="pasture-facts">
    <span><Droplets size={17} /> Zdaj: {pasture.current}</span>
    <span><CalendarDays size={17} /> Naprej: {pasture.next}</span>
    <span><Scale size={17} /> {pasture.window}</span>
   </div>
   <small>{pasture.basis}</small>
  </article>
 );
}

function PastureCalendarSection({ hives }) {
 const activeHives = hives.filter((hive) => hive.status !== "archived");
 return (
  <div className="card pasture-overview">
   <div className="card-title">
    <h2>Paša in med</h2>
    <span>simulirano</span>
   </div>
   <div className="stack">
    {activeHives.map((hive) => {
     const pasture = getPastureForHive(hive);
     return (
      <div className={`pasture-row pasture-${pasture.risk}`} key={hive.id}>
       <div>
        <strong>{displayText(hive.name)}: {pasture.current}</strong>
        <span>{pasture.next} · {pasture.window}</span>
       </div>
       <p>{pasture.advice}</p>
      </div>
     );
    })}
   </div>
  </div>
 );
}

function buildTimeline(data, hiveId) {
 const items = [
  ...(data.voiceActions || []).filter((action) => action.hiveId === hiveId).map((action) => ({
   id: action.id,
   type: actionTypeLabel(action.type),
   title: action.note || actionTypeLabel(action.type),
   subtitle: `${action.consistency || "Zapis shranjen."} Izvirnik: "${action.transcript}"`,
   date: action.date,
   createdAt: action.createdAt,
  })),
  ...data.notes.filter((note) => note.hiveId === hiveId).map((note) => ({
   id: note.id,
   type: "Opomba",
   title: note.title,
   subtitle: note.text,
   date: note.date,
   createdAt: note.createdAt,
  })),
  ...data.feedingEvents.filter((event) => event.hiveId === hiveId).map((event) => ({
   id: event.id,
   type: "Hranjenje",
   title: `${event.amountLiters} L · ${event.feedType}`,
   subtitle: event.note,
   date: event.date,
   createdAt: event.createdAt,
  })),
  ...data.extractionEvents.filter((event) => event.hiveId === hiveId).map((event) => ({
   id: event.id,
   type: "Točenje",
   title: `${event.netKg} kg · ${event.honeyType}`,
   subtitle: `${event.frames} satov`,
   date: event.date,
   createdAt: event.createdAt,
  })),
  ...(data.honeySales || []).filter((sale) => sale.hiveId === hiveId).map((sale) => ({
   id: sale.id,
   type: "Prodaja medu",
   title: `${sale.amountKg} kg · ${sale.honeyType}`,
   subtitle: `${sale.pricePerKg} €/kg · ${sale.customer || "brez kupca"}`,
   date: sale.date,
   createdAt: sale.createdAt,
  })),
  ...(data.financeEvents || []).filter((event) => event.hiveId === hiveId).map((event) => ({
   id: event.id,
   type: event.type === "income" ? "Prihodek" : "Strošek",
   title: `${event.category}: ${event.amountEur} €`,
   subtitle: event.description,
   date: event.date,
   createdAt: event.createdAt,
  })),
  ...(data.healthRecords || []).filter((record) => record.hiveId === hiveId).map((record) => ({
   id: record.id,
   type: "Zdravje",
   title: `Varoja ${record.varroaLevel}/5 · matica ${record.queenStatus}`,
   subtitle: `${record.treatment} · ${(record.diseases || []).join(", ")}`,
   date: record.inspectionDate,
   createdAt: record.createdAt,
  })),
  ...(data.hivePhotos || []).filter((photo) => photo.hiveId === hiveId).map((photo) => ({
   id: photo.id,
   type: "Fotografija",
   title: photo.caption || "Foto dnevnik",
   subtitle: photo.aiAnalysis || "Fotografija shranjena.",
   date: photo.date,
   createdAt: photo.createdAt,
  })),
  ...data.reminders.filter((reminder) => reminder.hiveId === hiveId).map((reminder) => ({
   id: reminder.id,
   type: "Opomnik",
   title: reminder.title,
   subtitle: `${reminder.time} · ${reminder.category}`,
   date: reminder.date,
   createdAt: reminder.createdAt,
  })),
 ];

 return items.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
}

function actionTypeLabel(type) {
 const labels = {
  feeding: "Hranjenje",
  inspection: "Pregled panja",
  varroa_treatment: "Tretiranje varoje",
  honey_extraction: "Točenje medu",
  pollen_harvest: "Cvetni prah",
  added_super: "Dodano medišče",
  removed_super: "Odstranjeno medišče",
  queen_replaced: "Matica zamenjana",
  queen_seen: "Matica videna",
  brood_checked: "Zalega pregledana",
  swarm_cells_seen: "Matičniki videni",
  swarm_event: "Rojenje",
  moved_hive: "Panj premaknjen",
  equipment_note: "Oprema",
  inventory_update: "Zaloga",
  honey_sale: "Prodaja medu",
  finance: "Bilanca",
  storage_note: "Skladiščenje",
  general_note: "Splošna nota",
 };
 return labels[type] || "Dogodek";
}

function TimelineItem({ item }) {
 return (
  <article className="timeline-item">
   <div className="timeline-dot" />
   <div>
    <span>{item.type} · {item.date}</span>
    <strong>{item.title}</strong>
    <p>{item.subtitle}</p>
   </div>
  </article>
 );
}

function CalendarPage({ data, saveParsedEvent, deleteCalendarEntry, setPage }) {
 const [selectedDay, setSelectedDay] = useState(null);
 const [text, setText] = useState("");
 const [title, setTitle] = useState("");
 const [hiveId, setHiveId] = useState(data.hives[0].id || "");
 const [amount, setAmount] = useState("");
 const [unit, setUnit] = useState("");
 const [suggestion, setSuggestion] = useState(null);
 const days = Array.from({ length: 30 }, (_, index) => index + 1);
 const allReminders = [...getLegalReminders(), ...data.reminders];
 const eventDays = [...allReminders, ...(data.events || [])].reduce((acc, reminder) => {
  const day = Number.parseInt(reminder.date, 10);
  if (Number.isFinite(day)) acc[day] = reminder.category || actionTypeLabel(reminder.type);
  return acc;
 }, {});
 const showReportingShortcut = isNearCensusWindow();

 return (
  <section>
   <PageHeader eyebrow="Opomniki" title="Junij 2026" subtitle="Velike oznake, brez drobnega branja." />
   {showReportingShortcut ? (
    <button className="legal-shortcut" type="button" onClick={() => setPage("porocanje")}>
     <strong>⚖️ Zakonsko poročanje</strong>
     <span>Popis čebeljih družin je blizu. Pripravi podatke za UVHVVR.</span>
    </button>
   ) : null}
   <PastureCalendarSection hives={data.hives} />
   <div className="calendar-grid">
    {days.map((day) => (
     <button key={day} onClick={() => { setSelectedDay(day); setText(""); setTitle(""); setAmount(""); setUnit(""); setHiveId(data.hives[0].id || ""); setSuggestion(null); }} className={`day ${eventDays[day] ? "has-event" : ""} ${day === 7 ? "today" : ""}`}>
      <strong>{day}</strong>
      <span>{eventDays[day] || ""}</span>
     </button>
    ))}
   </div>
   <h2 className="section-title">Prihaja</h2>
   <div className="stack">
    {allReminders.map((reminder) => <CalendarEntryRow key={reminder.id} item={reminder} hives={data.hives} kind="reminder" onDelete={deleteCalendarEntry} />)}
    {(data.events || []).filter((event) => event.source === "manual" && event.status !== "archived").slice(0, 6).map((event) => <CalendarEntryRow key={event.id} item={event} hives={data.hives} kind="event" onDelete={deleteCalendarEntry} />)}
   </div>
   {selectedDay ? (
    <div className="modal-backdrop">
     <form className="modal-card" onSubmit={(event) => {
      event.preventDefault();
      const parsed = {
       ...(suggestion || extractVoiceAction(text, data.hives, hiveId)),
       title: title || suggestion.title || actionTypeLabel(suggestion.type || detectActionType(normalizeSl(text))),
       hiveId,
       amount: amount || suggestion.amount || "",
       unit: unit || suggestion.unit || "",
       date: `${selectedDay}. jun`,
       transcript: text,
       note: text || title || "Koledarski vnos",
      };
      saveParsedEvent(parsed, "manual");
      setSelectedDay(null);
     }}>
      <div className="card-title">
       <h2>Dodaj dogodek</h2>
       <button className="text-button" type="button" onClick={() => setSelectedDay(null)}>Zapri</button>
      </div>
      <label>Datum<input value={`${selectedDay}. jun`} readOnly /></label>
      <label>Naslov<input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="npr. Pregled panja" /></label>
      <HiveSelect hives={data.hives} value={hiveId} onChange={setHiveId} />
      <label>Opis<textarea value={text} onChange={(event) => setText(event.target.value)} placeholder="npr. Pobral sem 1 kg cvetnega prahu iz panja Lipovec." /></label>
      <div className="form-grid">
       <label>Količina<input value={amount} onChange={(event) => setAmount(event.target.value)} placeholder="npr. 1" /></label>
       <label>Enota<input value={unit} onChange={(event) => setUnit(event.target.value)} placeholder="kg / L" /></label>
      </div>
      <button className="secondary-button" type="button" onClick={() => {
       const parsed = { ...extractVoiceAction(text, data.hives, hiveId), date: `${selectedDay}. jun` };
       setSuggestion(parsed);
       setHiveId(parsed.hiveId || hiveId);
       setAmount(parsed.amount || amount);
       setUnit(parsed.unit || unit);
       setTitle(actionTypeLabel(parsed.type));
      }}>Predlagaj strukturo</button>
      {suggestion ? (
       <div className="suggestion-box">
        <strong>Zapišemo v statistiko</strong>
        <span>Tip: {actionTypeLabel(suggestion.type)}</span>
        <span>Panj: {getHiveName(data.hives, suggestion.hiveId)}</span>
        <span>Količina: {suggestion.amount || "-"} {suggestion.unit}</span>
       </div>
      ) : null}
      <div className="cloud-actions">
       <button className="primary-button" type="submit">Da, shrani</button>
       <button className="secondary-button" type="button" onClick={() => {
        saveParsedEvent({ type: "general_note", hiveId, title: title || "Opomba", transcript: text, note: text || title, date: `${selectedDay}. jun`, fields: {} }, "manual");
        setSelectedDay(null);
       }}>Samo opomba</button>
      </div>
     </form>
    </div>
   ) : null}
  </section>
 );
}

function CalendarEntryRow({ item, hives, kind, onDelete }) {
 const structuredData = item.structuredData || {};
 const title = kind === "reminder" ? item.title : (structuredData.title || actionTypeLabel(item.type));
 const subtitle = kind === "reminder"
  ? getHiveName(hives, item.hiveId) + " · " + item.date + " · " + item.time
  : getHiveName(hives, item.hiveId) + " · " + item.date + " · " + (structuredData.note || item.originalText || "");

 return (
  <article className={"reminder reminder-" + (item.priority || "ok") + (item.legal ? " legal-reminder" : "")}>
   <CalendarDays size={22} />
   <div>
    <strong>{title} {item.legal ? <span className="legal-badge">ZAKONSKO</span> : null}</strong>
    <span>{subtitle}</span>
    {item.note ? <small>{item.note}</small> : null}
   </div>
   {!item.legal ? <button className="icon-button small-icon-button" type="button" onClick={() => onDelete(item.id, kind)} aria-label="Izbriši dogodek"><Trash2 size={18} /></button> : null}
  </article>
 );
}

function QRPage({ data, setData, openHive, openInventoryShelf, startHiveWizard }) {
 const [qrCode, setQrCode] = useState("");
 const [message, setMessage] = useState("");
 const [selectedQr, setSelectedQr] = useState(null);
 const [newQrName, setNewQrName] = useState("Regal A1");
 const [newQrType, setNewQrType] = useState("Regal");
 const [isScanning, setIsScanning] = useState(false);
 const [scanStatus, setScanStatus] = useState("Kamera se ni vklopljena.");
 const videoRef = useRef(null);
 const canvasRef = useRef(null);
 const streamRef = useRef(null);
 const scanTimerRef = useRef(null);

 useEffect(() => () => stopQrScan(), []);

 function handleQrValue(value, source = "manual") {
  const cleanCode = value.trim().toUpperCase();
  if (!cleanCode) return;

  const hive = data.hives.find((item) => item.qrCode.toUpperCase() === cleanCode || item.id.toUpperCase() === cleanCode);
  const existing = data.qrItems.find((item) => item.id.toUpperCase() === cleanCode);
  const scanTime = new Intl.DateTimeFormat("sl-SI", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }).format(new Date());
  const inferred = inferQrItemFromCode(cleanCode, source);

  if (hive) {
   setData((current) => ({
    ...current,
    qrItems: upsertQr(current.qrItems, {
     id: hive.qrCode,
     type: "Panj",
     linkedHiveId: hive.id,
     linkedTo: hive.name,
     lastScan: scanTime,
     status: "Aktivno",
     createdAt: new Date().toISOString(),
    }),
   }));
   setMessage(source === "camera" ? `Kamera je na\u0161la panj ${hive.name}.` : "");
   openHive(hive.id);
   return;
  }

  if (existing?.linkedHiveId) {
   setMessage(source === "camera" ? `Kamera je na\u0161la ${existing.linkedTo}.` : "");
   openHive(existing.linkedHiveId);
   return;
  }

  if (existing) {
   const nextItem = { ...existing, lastScan: scanTime, status: existing.status || "Aktivno" };
   setData((current) => ({ ...current, qrItems: upsertQr(current.qrItems, nextItem) }));
   setSelectedQr(nextItem);
   setMessage(`QR ${cleanCode} je najden: ${existing.type}.`);
   setQrCode("");
   return;
  }

  if (normalizeSl(inferred.type).includes("panj")) {
   setMessage(`QR ${cleanCode} je nov. Odpiram dodajanje panja.`);
   setQrCode("");
   if (startHiveWizard) startHiveWizard(cleanCode, { name: inferred.suggestedName, location: "", qrCode: cleanCode });
   return;
  }

  const nextQrItem = {
   id: cleanCode,
   type: inferred.type,
   linkedHiveId: "",
   linkedTo: inferred.linkedTo,
   lastScan: scanTime,
   status: "Novo",
   createdAt: new Date().toISOString(),
  };
  setData((current) => ({
   ...current,
   qrItems: upsertQr(current.qrItems, nextQrItem),
  }));
  setSelectedQr(nextQrItem);
  setMessage(`QR ${cleanCode} je pripravljen kot ${inferred.type}.`);
  setQrCode("");
 }

 function submitQr(event) {
  event.preventDefault();
  handleQrValue(qrCode);
 }

 function createQrItem(event) {
  event.preventDefault();
  const cleanName = newQrName.trim() || newQrType;
  const id = `PP-${normalizeSl(newQrType).replace(/[^a-z0-9]+/g, "-").toUpperCase()}-${Date.now().toString(36).toUpperCase()}`;
  const item = { id, type: newQrType, linkedHiveId: "", linkedTo: cleanName, lastScan: "ustvarjeno", status: "Aktivno", createdAt: new Date().toISOString() };
  setData((current) => ({ ...current, qrItems: upsertQr(current.qrItems, item) }));
  setSelectedQr(item);
  setMessage(`QR za ${cleanName} je pripravljen za tisk.`);
 }

 function downloadQrPng(item) {
  const image = new window.Image();
  image.crossOrigin = "anonymous";
  image.onload = () => {
   const canvas = document.createElement("canvas");
   canvas.width = 680;
   canvas.height = 860;
   const ctx = canvas.getContext("2d");
   ctx.fillStyle = "#FAF7F0";
   ctx.fillRect(0, 0, canvas.width, canvas.height);
   ctx.fillStyle = "#12100A";
   ctx.font = "bold 42px Arial";
   ctx.textAlign = "center";
   ctx.fillText("PametniPanj", canvas.width / 2, 84);
   ctx.drawImage(image, 140, 140, 400, 400);
   ctx.font = "bold 34px Arial";
   ctx.fillText(item.linkedTo || item.id, canvas.width / 2, 610);
   ctx.font = "24px Arial";
   ctx.fillText(item.id, canvas.width / 2, 660);
   const link = document.createElement("a");
   link.href = canvas.toDataURL("image/png");
   link.download = `${item.id}.png`;
   link.click();
  };
  image.src = qrImageUrl(item.id, 400);
 }

 function stopQrScan() {
  if (scanTimerRef.current) {
   clearInterval(scanTimerRef.current);
   scanTimerRef.current = null;
  }
  if (streamRef.current) {
   streamRef.current.getTracks().forEach((track) => track.stop());
   streamRef.current = null;
  }
  setIsScanning(false);
 }

 function loadJsQrDecoder() {
  if (window.jsQR) return Promise.resolve(window.jsQR);
  return new Promise((resolve, reject) => {
   const existingScript = document.querySelector("script[data-pametni-panj-jsqr]");
   if (existingScript) {
    existingScript.addEventListener("load", () => resolve(window.jsQR), { once: true });
    existingScript.addEventListener("error", reject, { once: true });
    return;
   }
   const script = document.createElement("script");
   script.src = "https://cdn.jsdelivr.net/npm/jsqr@1.4.0/dist/jsQR.js";
   script.async = true;
   script.dataset.pametniPanjJsqr = "true";
   script.onload = () => resolve(window.jsQR);
   script.onerror = reject;
   document.head.appendChild(script);
  });
 }

 function readQrFromCanvas(video) {
  const canvas = canvasRef.current;
  if (!canvas || !window.jsQR || !video.videoWidth || !video.videoHeight) return "";
  const context = canvas.getContext("2d", { willReadFrequently: true });
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  context.drawImage(video, 0, 0, canvas.width, canvas.height);
  const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
  return window.jsQR(imageData.data, imageData.width, imageData.height, { inversionAttempts: "attemptBoth" }).data || "";
 }

 async function startQrScan() {
  if (!navigator.mediaDevices.getUserMedia) {
   setScanStatus("Kamera v tem brskalniku ni na voljo. Uporabi ročni vnos.");
   return;
  }
  try {
   stopQrScan();
   setMessage("");
   setScanStatus("Odpiram kamero...");
   const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: "environment" } } });
   streamRef.current = stream;
   setIsScanning(true);
   setScanStatus("Usmeri kamero v QR kodo.");
   if (videoRef.current) {
    videoRef.current.srcObject = stream;
    await videoRef.current.play();
   }
   let detector = null;
   if ("BarcodeDetector" in window) {
    detector = new window.BarcodeDetector({ formats: ["qr_code"] });
   } else {
    setScanStatus("Kamera je odprta. Nalagam rezervni QR bralnik...");
    await loadJsQrDecoder();
    setScanStatus("Usmeri kamero v QR kodo.");
   }
   scanTimerRef.current = window.setInterval(async () => {
    const video = videoRef.current;
    if (!video || video.readyState < 2) return;
    try {
     const codes = detector ? await detector.detect(video) : [];
     const rawValue = codes[0].rawValue || readQrFromCanvas(video);
     if (!rawValue) return;
     setQrCode(rawValue);
     setScanStatus(`Najdeno: ${rawValue}`);
     stopQrScan();
     handleQrValue(rawValue, "camera");
    } catch {
     setScanStatus("Kamera dela, QR kode pa še ne morem prebrati. Poskusi bolj mirno ali bližje.");
    }
   }, 500);
  } catch {
   stopQrScan();
   setScanStatus("Kamera ni dovoljena ali ni na voljo. Na telefonu dovoli dostop do kamere. Če odpiraš prek IP naslova, bo mogoče potreben HTTPS.");
  }
 }

 return (
  <section>
   <PageHeader eyebrow="QR sledljivost" title="Skeniraj ali vpiši" subtitle="Na telefonu odpri kamero, na računalniku lahko uporabiš ročni vnos." />
   <div className="scanner-card">
    <video ref={videoRef} className={`scanner-video ${isScanning ? "is-live" : ""}`} playsInline muted />
    <canvas ref={canvasRef} hidden />
    {!isScanning ? <QrCode size={54} /> : null}
    <div className="scan-frame" />
    <p>{scanStatus}</p>
    <div className="scanner-actions">
     <button className="secondary-button" type="button" onClick={isScanning ? stopQrScan : startQrScan}>{isScanning ? "Ustavi kamero" : "Odpri kamero"}</button>
    </div>
   </div>
   <form className="form-card compact-form" onSubmit={submitQr}>
    <label>QR ali ID panja<input value={qrCode} onChange={(event) => setQrCode(event.target.value)} placeholder="npr. QR-LIP-001" /></label>
    <button className="primary-button" type="submit"><Search size={20} /> Poišči ali shrani</button>
    {message ? <p className="success-text">{message}</p> : null}
   </form>
   <form className="form-card compact-form" onSubmit={createQrItem}>
    <div className="card-title"><h2>Ustvari QR</h2><span>za tisk</span></div>
    <div className="form-grid">
     <label>Tip<select value={newQrType} onChange={(event) => setNewQrType(event.target.value)}><option>Panj</option><option>Regal</option><option>Transportna škatla</option><option>Naprava</option><option>Serija kozarcev</option></select></label>
     <label>Ime<input value={newQrName} onChange={(event) => setNewQrName(event.target.value)} placeholder="npr. Regal A1" /></label>
    </div>
    <button className="secondary-button" type="submit"><QrCode size={20} /> Pripravi kartico</button>
   </form>
   <h2 className="section-title">Zadnji QR vnosi</h2>
   <div className="stack">
    {data.qrItems.map((item) => (
     <button className="list-row" key={item.id} onClick={() => setSelectedQr(item)}>
      <QrCode size={24} />
      <div>
       <strong>{displayText(item.type)}</strong>
       <span>{item.id} · {displayText(item.linkedTo)} · {displayText(item.lastScan)}</span>
      </div>
      <StatusBadge status={item.status === "Novo" ? "warn" : "ok"}>{item.status}</StatusBadge>
     </button>
    ))}
   </div>
   {selectedQr ? (
    <div className="modal-backdrop">
     <div className="modal-card">
      <div className="card-title">
       <h2>{selectedQr.id}</h2>
       <button className="text-button" onClick={() => setSelectedQr(null)}>Zapri</button>
      </div>
      <div className="qr-print-card">
       <strong>PametniPanj</strong>
       <img src={qrImageUrl(selectedQr.id, 220)} alt={`QR ${selectedQr.id}`} />
       <span>{displayText(selectedQr.linkedTo || selectedQr.type)}</span>
       <small>{selectedQr.id}</small>
       <button className="secondary-button" type="button" onClick={() => downloadQrPng(selectedQr)}><Download size={18} /> Prenesi PNG</button>
      </div>
      {normalizeSl(selectedQr.type).includes("regal") ? (
       <div className="shelf-preview">
        <strong>Vsebina regala</strong>
        {(data.inventoryItems || []).filter((item) => normalizeSl(item.shelf) === normalizeSl(selectedQr.linkedTo || selectedQr.id)).length ? (
         (data.inventoryItems || []).filter((item) => normalizeSl(item.shelf) === normalizeSl(selectedQr.linkedTo || selectedQr.id)).map((item) => <ShelfPreviewItem key={item.id} item={item} />)
        ) : <span>Regal je še prazen.</span>}
       </div>
      ) : null}
      <div className="action-menu">
       {qrActionsFor(selectedQr).map((action) => (
        <button key={action} onClick={() => {
         if (action === "Odpri panj" && selectedQr.linkedHiveId) openHive(selectedQr.linkedHiveId);
         if (action === "Odpri skladišče" && openInventoryShelf) openInventoryShelf(selectedQr.linkedTo || selectedQr.id);
         if (action === "Dodaj zalogo" && openInventoryShelf) openInventoryShelf(selectedQr.linkedTo || selectedQr.id, "add", { name: "Sladkor", category: "Sladkor", quantity: 400, unit: "kg" });
         if (action === "Vzemi zalogo" && openInventoryShelf) openInventoryShelf(selectedQr.linkedTo || selectedQr.id, "remove", { quantity: 1 });
         setMessage(`Izbrano: ${action}`);
         setSelectedQr(null);
        }}>{action}</button>
       ))}
      </div>
     </div>
    </div>
   ) : null}
  </section>
 );
}

function qrActionsFor(item) {
 const type = normalizeSl(item.type || "");
 if (type.includes("panj")) return ["Odpri panj", "Dodaj hranjenje", "Dodaj točenje", "Dodaj cvetni prah", "Dodaj pregled", "Povezi s škatlo", "Dodaj opombo"];
 if (type.includes("skat")) return ["Odpri škatlo", "Poveži s panjem", "Stehtaj polno", "Stehtaj prazno", "Zaključi točenje"];
 if (type.includes("regal")) return ["Dodaj zalogo", "Vzemi zalogo", "Odpri skladišče", "Dodaj opombo"];
 if (type.includes("serija") || type.includes("kozar")) return ["Odpri serijo", "Poglej sledljivost", "Dodaj polnjenje"];
 return ["Odpri vnos", "Poveži s panjem", "Dodaj opombo"];
}

function ShelfPreviewItem({ item }) {
 const meta = inventoryCategoryMeta(item.category || item.name);
 const Icon = meta.icon;
 return <span className="shelf-preview-item"><Icon size={16} style={{ color: meta.color }} /> {item.name}: {item.quantity} {item.unit}</span>;
}

function inferQrItemFromCode(code, source = "manual") {
 const cleanCode = code.trim().toUpperCase();
 const text = normalizeSl(cleanCode);
 const suggestedName = cleanCode
  .replace(/^PP[-_]/i, "")
  .replace(/^QR[-_]/i, "")
  .replace(/[-_]+/g, " ")
  .replace(/\s+/g, " ")
  .trim() || cleanCode;

 if (text.includes("panj") || text.includes("hive") || text.startsWith("bh-") || text.startsWith("pp-panj")) {
  return { type: "Panj", linkedTo: suggestedName, suggestedName };
 }
 if (text.includes("regal") || text.includes("shelf") || text.includes("sklad")) {
  return { type: "Regal", linkedTo: suggestedName, suggestedName };
 }
 if (text.includes("box") || text.includes("skat") || text.includes("transport")) {
  return { type: "Transportna škatla", linkedTo: suggestedName, suggestedName };
 }
 if (text.includes("kozarc") || text.includes("serij") || text.includes("jar")) {
  return { type: "Serija kozarcev", linkedTo: suggestedName, suggestedName };
 }
 return { type: source === "camera" ? "Skenirano" : "Ročni vnos", linkedTo: "Ni povezan s panjem", suggestedName };
}

function qrImageUrl(value, size = 220) {
 return `https://api.qrserver.com/v1/create-qr-code/size=${size}x${size}&margin=14&data=${encodeURIComponent(value)}`;
}

function upsertQr(items, nextItem) {
 const exists = items.some((item) => item.id.toUpperCase() === nextItem.id.toUpperCase());
 return exists ? items.map((item) => item.id.toUpperCase() === nextItem.id.toUpperCase() ? { ...item, ...nextItem } : item) : [nextItem, ...items];
}

function HiveFormPage({ mode, hives, initialHive, initialDraft, saveHive, cancel }) {
 const isCreate = mode === "create";
 const [step, setStep] = useState(1);
 const [form, setForm] = useState(() => initialHive || {
  id: `BC-2026-${String(hives.length + 1).padStart(3, "0")}`,
  name: initialDraft.name || "",
  location: initialDraft.location || "",
  queen: "",
  status: "ok",
  statusText: "Mirno",
  dataSource: "manual",
  weightKg: null,
  weeklyDeltaKg: null,
  foodLiters: null,
  foodDays: null,
  temperatureC: null,
  humidityPct: null,
  batteryPct: null,
  signal: null,
  lastSeen: "pravkar",
  qrCode: initialDraft.qrCode || `QR-${String(hives.length + 1).padStart(3, "0")}`,
  deviceId: "",
  deviceApiKey: "",
  locationName: "",
  locationDescription: "",
  latitude: "",
  longitude: "",
  locationSource: "manual",
  locationUpdatedAt: new Date().toISOString(),
  frameCount: 10,
  hiveType: "AŽ panj",
  forage: [],
 hiveColor: "#E8A020",
 });
 const [locationMessage, setLocationMessage] = useState("");
 const wizardTitles = ["Panj", "Oprema", "Paša", "Barva", "Lokacija", "Naprava", "Pregled"];
 const showStep = (target) => !isCreate || step === target;

 function update(field, value) {
  setForm((current) => ({ ...current, [field]: value }));
 }

 function toggleForage(item) {
  setForm((current) => {
   const forage = new Set(current.forage || []);
   forage.has(item) ? forage.delete(item) : forage.add(item);
   return { ...current, forage: [...forage] };
  });
 }

 function applyForageSuggestion() {
  setForm((current) => ({ ...current, forage: suggestedForageFromLocation(current) }));
 }

 function handleSetupPhoto(event) {
  const file = event.target.files?.[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => update("setupPhotoUrl", reader.result);
  reader.readAsDataURL(file);
 }

 function detectHiveLocation() {
  if (!navigator.geolocation) {
   setLocationMessage("Telefon ne omogoča zaznave lokacije.");
   return;
  }
  setLocationMessage("Zaznavam lokacijo ...");
  navigator.geolocation.getCurrentPosition(
   async (position) => {
    const lat = position.coords.latitude.toFixed(6);
    const lon = position.coords.longitude.toFixed(6);
    update("latitude", lat);
    update("longitude", lon);
    update("locationSource", "phone");
    update("locationUpdatedAt", new Date().toISOString());
    try {
     const response = await fetch(`https://nominatim.openstreetmap.org/reverseformat=json&lat=${encodeURIComponent(lat)}&lon=${encodeURIComponent(lon)}&zoom=18&addressdetails=1`, {
      headers: { "User-Agent": "PametniPanj/1.0" },
     });
     const payload = await response.json();
     const address = payload.display_name || "Zaznano iz telefona";
     if (!form.locationName) update("locationName", address);
     update("locationDescription", form.locationDescription || address);
     setLocationMessage(`Lokacija je zaznana: ${address}`);
    } catch {
     if (!form.locationName) update("locationName", "Zaznano iz telefona");
     setLocationMessage("Lokacija je zaznana.");
    }
   },
   () => setLocationMessage("Lokacije ni bilo mogoče zaznati. Preveri dovoljenje za lokacijo."),
   { enableHighAccuracy: true, timeout: 12000, maximumAge: 60000 },
  );
 }

 function submit(event) {
  event.preventDefault();
  const saved = {
   ...form,
   id: form.id.trim().toUpperCase(),
   name: form.name.trim() || "Nov panj",
   location: form.location.trim() || "Brez lokacije",
   queen: form.queen.trim(),
   qrCode: form.qrCode.trim().toUpperCase() || makeId("QR"),
   dataSource: form.dataSource || (form.deviceId ? "sensor" : "manual"),
   deviceId: form.dataSource === "sensor" ? form.deviceId.trim().toUpperCase() || "" : "",
   deviceApiKey: form.dataSource === "sensor" ? form.deviceApiKey.trim() || "" : "",
   locationName: form.locationName.trim() || form.location.trim() || "Brez lokacije",
   locationDescription: form.locationDescription.trim() || "",
   latitude: form.latitude === "" ? null : toNumber(form.latitude, null),
   longitude: form.longitude === "" ? null : toNumber(form.longitude, null),
   locationSource: form.locationSource || "manual",
   locationUpdatedAt: form.locationUpdatedAt || new Date().toISOString(),
   weightKg: form.dataSource === "manual" ? null : toNumber(form.weightKg, 0),
   weeklyDeltaKg: form.dataSource === "manual" ? null : toNumber(form.weeklyDeltaKg, 0),
   foodLiters: form.dataSource === "manual" ? null : toNumber(form.foodLiters, 0),
   foodDays: form.dataSource === "manual" ? null : Math.round(toNumber(form.foodDays, 0)),
   temperatureC: form.dataSource === "manual" ? null : toNumber(form.temperatureC, 0),
   humidityPct: form.dataSource === "manual" ? null : Math.round(toNumber(form.humidityPct, 0)),
   batteryPct: form.dataSource === "manual" ? null : Math.round(toNumber(form.batteryPct, 100)),
   frameCount: Math.max(1, Math.min(30, Math.round(toNumber(form.frameCount, 10)))),
   hiveType: normalizeHiveType(form.hiveType),
   forage: form.forage || [],
   hiveColor: form.hiveColor || "#E8A020",
   createdAt: form.createdAt || new Date().toISOString(),
  };
  saveHive(saved);
 }

 return (
  <section>
   <PageHeader
    eyebrow={mode === "edit" ? "Uredi panj" : "Ročni vnos"}
    title={mode === "edit" ? form.name : "Dodaj panj"}
    subtitle="Podatki se shranijo samo na tej napravi."
    action={<button className="icon-button" onClick={cancel} aria-label="Nazaj"><ArrowLeft size={22} /></button>}
   />
   <form className="form-card" onSubmit={submit}>
    {isCreate ? (
     <div className="wizard-progress">
      <span>Korak {step}/7</span>
      <strong>{wizardTitles[step - 1]}</strong>
      <i style={{ width: `${(step / 7) * 100}%` }} />
     </div>
    ) : null}
    {showStep(1) ? (
     <>
    <label>Ime panja<input value={form.name} onChange={(event) => update("name", event.target.value)} placeholder="npr. Lipovec" /></label>
    <label>Lokacija<input value={form.location} onChange={(event) => update("location", event.target.value)} placeholder="npr. Severni rob sadovnjaka" /></label>
    <label>Oznaka panja<input value={form.id} onChange={(event) => update("id", event.target.value)} /></label>
    <label>QR koda<input value={form.qrCode} onChange={(event) => update("qrCode", event.target.value)} /></label>
     </>
    ) : null}
    {showStep(2) ? (
     <>
    <label>Matica<input value={form.queen} onChange={(event) => update("queen", event.target.value)} placeholder="letnik, barva oznake" /></label>
    <label>Število satov</label>
    <div className="frame-selector">
     {Array.from({ length: 30 }, (_, index) => index + 1).map((count) => <button type="button" key={count} className={Number(form.frameCount) === count ? "active" : ""} onClick={() => update("frameCount", count)}>{count}</button>)}
    </div>
    <label>Tip panja</label>
    <div className="pill-row">
     {HIVE_TYPE_OPTIONS.map((type) => <button type="button" key={type.value} className={normalizeHiveType(form.hiveType) === type.value ? "active" : ""} onClick={() => update("hiveType", type.value)}>{type.label}</button>)}
    </div>
    <p className="hint-text">{HIVE_TYPE_OPTIONS.find((type) => type.value === normalizeHiveType(form.hiveType)).description}</p>
     </>
    ) : null}
    {showStep(3) ? (
     <>
    <label>Pašna okolica</label>
    <div className="pill-row">
     {["Akacija", "Lipa", "Gozd", "Kostanj", "Sadovnjak", "Travnik", "Mešano", "Polje"].map((item) => <button type="button" key={item} className={(form.forage || []).includes(item) ? "active" : ""} onClick={() => toggleForage(item)}>{item}</button>)}
    </div>
    {(form.locationName || form.locationDescription || form.location || form.latitude) ? (
     <div className="suggestion-box">
      <strong>Pametna čebela predlaga</strong>
      <span>{suggestedForageFromLocation(form).join(", ")}</span>
      <button type="button" className="secondary-button compact-button" onClick={applyForageSuggestion}>Uporabi predlog</button>
     </div>
    ) : null}
     </>
    ) : null}
    {showStep(4) ? (
     <>
    <label>Barva panja</label>
    <div className="color-picker-row">
     {["#E8A020", "#2D6A1A", "#C94033", "#3B82F6", "#F97316", "#8B5CF6", "#14B8A6", "#F8FAFC"].map((color) => <button type="button" key={color} className={form.hiveColor === color ? "active" : ""} style={{ background: color }} onClick={() => update("hiveColor", color)} aria-label={`Barva ${color}`} />)}
    </div>
    <label className="file-button"><Camera size={22} /> Fotografiraj sprednjo stran panja<input type="file" accept="image/*" capture="environment" onChange={handleSetupPhoto} /></label>
    {form.setupPhotoUrl ? <img className="setup-photo-preview" src={form.setupPhotoUrl} alt="Sprednja stran panja" /> : null}
     <label>Stanje
      <select value={form.status} onChange={(event) => {
       const status = event.target.value;
       update("status", status);
       update("statusText", status === "danger" ? "Ukrepaj" : status === "warn" ? "Preveri" : "Mirno");
      }}>
       <option value="ok">Mirno</option>
       <option value="warn">Preveri</option>
       <option value="danger">Ukrepaj</option>
      </select>
     </label>
     </>
    ) : null}
    {showStep(6) ? (
    <div className="details-card nested-details">
     <div className="card-title">
      <h2>Pametni senzor</h2>
      <span>{form.dataSource === "sensor" ? "s senzorjem" : "ročni vnos"}</span>
     </div>
     <div className="choice-card-grid">
      <button type="button" className={`choice-card ${form.dataSource === "sensor" ? "active" : ""}`} onClick={() => {
       update("dataSource", "sensor");
       if (!form.deviceId) update("deviceId", `BH-${String(hives.length + 1).padStart(5, "0")}`);
      }}>
       <BatteryCharging size={28} />
       <strong>Pametni panj (s senzorjem)</strong>
       <span>Panj ima PametniPanj senzor za tehtanje, temperaturo in vlago. Podatki se posodabljajo v realnem času.</span>
      </button>
      <button type="button" className={`choice-card ${form.dataSource === "manual" ? "active" : ""}`} onClick={() => {
       update("dataSource", "manual");
       update("deviceId", "");
       update("deviceApiKey", "");
      }}>
       <Pencil size={28} />
       <strong>Ročni vnos</strong>
       <span>Podatke vnaša čebelar ročno. Teža, hrana in senzorski podatki ne bodo na voljo.</span>
      </button>
     </div>
     {form.dataSource === "sensor" ? (
      <>
       <label>ID naprave<input value={form.deviceId || ""} onChange={(event) => update("deviceId", event.target.value)} placeholder="npr. BH-00001" /></label>
       <label>API ključ naprave<input value={form.deviceApiKey || ""} onChange={(event) => update("deviceApiKey", event.target.value)} placeholder="skrivni ključ" /></label>
      </>
     ) : null}
    </div>
    ) : null}
    {showStep(5) ? (
    <div className="details-card nested-details">
     <div className="card-title">
      <h2>Lokacija panja</h2>
      <span>{form.latitude && form.longitude ? "zaznana" : "ročno ali GPS"}</span>
     </div>
     <button className="secondary-button" type="button" onClick={detectHiveLocation}>Zaznaj lokacijo</button>
     {locationMessage ? <p className="hint-text">{locationMessage}</p> : null}
     <label>Ime lokacije<input value={form.locationName || ""} onChange={(event) => update("locationName", event.target.value)} placeholder="npr. Zahodni vrt" /></label>
     <label>Opis lokacije<input value={form.locationDescription || ""} onChange={(event) => update("locationDescription", event.target.value)} placeholder="npr. ob lipi" /></label>
     <div className="form-grid">
      <label>Latitude<input value={form.latitude || ""} onChange={(event) => update("latitude", event.target.value)} /></label>
      <label>Longitude<input value={form.longitude || ""} onChange={(event) => update("longitude", event.target.value)} /></label>
     </div>
    </div>
    ) : null}
    {showStep(7) ? (
     <>
    {form.dataSource === "manual" ? (
     <div className="suggestion-box">
      <strong>Ročni panj</strong>
      <span>Težo, hrano in senzorske meritve lahko dodaš kasneje, ko priklopiš PametniPanj set.</span>
     </div>
    ) : (
    <div className="form-grid">
     <label>Teža kg<input type="number" step="0.1" value={form.weightKg || ""} onChange={(event) => update("weightKg", event.target.value)} /></label>
     <label>Hrana L<input type="number" step="0.1" value={form.foodLiters || ""} onChange={(event) => update("foodLiters", event.target.value)} /></label>
     <label>Dni hrane<input type="number" value={form.foodDays || ""} onChange={(event) => update("foodDays", event.target.value)} /></label>
     <label>Temp. °C<input type="number" step="0.1" value={form.temperatureC || ""} onChange={(event) => update("temperatureC", event.target.value)} /></label>
    </div>
    )}
     <div className="suggestion-box">
      <strong>{form.name || "Nov panj"}</strong>
      <span>{form.location || "Brez lokacije"} · {form.qrCode}</span>
      <span>{form.frameCount} satov · {form.hiveType} · {(form.forage || []).join(", ") || "paša ni izbrana"}</span>
     </div>
     </>
    ) : null}
    {isCreate ? (
     <div className="wizard-actions">
      <button type="button" className="secondary-button" disabled={step === 1} onClick={() => setStep((current) => Math.max(1, current - 1))}>Nazaj</button>
      {step < 7 ? (
       <button type="button" className="primary-button" onClick={() => setStep((current) => Math.min(7, current + 1))}>Naprej</button>
      ) : (
       <button type="submit" className="primary-button"><Save size={20} /> Shrani panj</button>
      )}
     </div>
    ) : (
     <button type="submit" className="primary-button"><Save size={20} /> Shrani panj</button>
    )}
   </form>
  </section>
 );
}

const supportedActionTypes = [
 "feeding",
 "inspection",
 "varroa_treatment",
 "honey_extraction",
 "pollen_harvest",
 "added_super",
 "removed_super",
 "queen_replaced",
 "queen_seen",
 "brood_checked",
 "swarm_cells_seen",
 "swarm_event",
 "moved_hive",
 "equipment_note",
 "inventory_update",
 "storage_note",
 "general_note",
];

function extractVoiceAction(transcript, hives, fallbackHiveId) {
 const raw = transcript || "";
 const text = normalizeSl(raw);
 const hive = findHiveInText(text, hives) || getHive(hives, fallbackHiveId);
 const amount = extractAmount(text);
 const type = detectActionType(text);
 const unit = detectUnit(text, type);
 const missing = [];
 if (!hive.id) missing.push("panj");
 if ((type === "feeding" || type === "honey_extraction") && !amount) missing.push("količina");

 return {
  type,
  hiveId: hive.id || fallbackHiveId,
  hiveName: hive.name || "",
  amount: amount || "",
  unit,
  date: todayLabel(),
  note: buildActionNote(type, amount, unit, raw),
  transcript: raw,
  missing,
  fields: extractActionFields(type, text),
 };
}

function correctBeeTranscript(input, hives = []) {
 let text = String(input || "").trim();
 if (!text) return { text: "", changes: [] };
 const changes = [];
 const replacements = [
  [/\bmaticni\s*ki\b/gi, "matičniki"],
  [/\bmaticniki\b/gi, "matičniki"],
  [/\bmaticnik\b/gi, "matičnik"],
  [/\bmatica\s+je\s+prisotno\b/gi, "matica je prisotna"],
  [/\bmarvljicn[ao]\b/gi, "mravljična"],
  [/\bmravljicn[ao]\b/gi, "mravljična"],
  [/\boksaln[ao]\b/gi, "oksalna"],
  [/\bvaroja\b/gi, "varojo"],
  [/\bmedisce\b/gi, "medišče"],
  [/\bmedisca\b/gi, "medišča"],
  [/\btocenje\b/gi, "točenje"],
  [/\btocil\b/gi, "točil"],
  [/\biztocil\b/gi, "iztočil"],
  [/\bzalego\b/gi, "zalega"],
  [/\bpogaca\b/gi, "pogača"],
  [/\bcebele\b/gi, "čebele"],
  [/\bcebel\b/gi, "čebel"],
  [/\bpan\s+(\d+)\b/gi, "panj $1"],
  [/\bpanju\s+(\d+)\b/gi, "panj $1"],
 ];
 replacements.forEach(([pattern, replacement]) => {
  const before = text;
  text = text.replace(pattern, replacement);
  if (before !== text) changes.push(replacement);
 });
 hives.forEach((hive) => {
  const normalizedName = normalizeSl(hive.name);
  if (!normalizedName) return;
  const loose = normalizedName.replace(/\s+/g, "\\s+");
  const pattern = new RegExp(`\\b${loose}\\b`, "i");
  if (pattern.test(normalizeSl(text)) && !text.includes(hive.name)) {
   text = text.replace(new RegExp(hive.name, "i"), hive.name);
  }
 });
 return { text, changes: [...new Set(changes)] };
}

function normalizeSl(value) {
 return String(value || "")
  .toLowerCase()
  .normalize("NFD")
  .replace(/[\u0300-\u036f]/g, "");
}

function findHiveInText(text, hives) {
 const numbered = text.match(/\bpanj\s*(\d+)\b/);
 if (numbered) {
  const index = Number(numbered[1]) - 1;
  if (hives[index]) return hives[index];
  return hives.find((hive) => normalizeSl(hive.id).includes(numbered[1]));
 }
 return hives.find((hive) => {
  const name = normalizeSl(hive.name);
  return name && text.includes(name);
 });
}

function extractAmount(text) {
 const match = text.match(/(\d+(:[,.]\d+))\s*(l|litrov|liter|kg|kilogramov|kilogram|kila|kos|kosov)/);
 return match ? Number(match[1].replace(",", ".")) : "";
}

function detectUnit(text, type) {
 if (/\b(kg|kilogram|kilogramov|kila)\b/.test(text)) return "kg";
 if (/\b(kos|kosov)\b/.test(text)) return "kos";
 if (/\b(l|liter|litrov)\b/.test(text)) return "L";
 return type === "honey_extraction" ? "kg" : type === "feeding" ? "L" : "";
}

function detectActionType(text) {
 if (/maticnik|maticn/.test(text)) return "swarm_cells_seen";
 if (/cvetn.*prah|pollen/.test(text)) return "pollen_harvest";
 if (/zalogo|sladkor|kozar|pokrov|vosk|satnic/.test(text) && /(dodaj|dodal|odstran|porab)/.test(text)) return "inventory_update";
 if (/skladisc|regal|shramb/.test(text)) return "storage_note";
 if (/varoj|mravljic|oksal|tretir/.test(text)) return "varroa_treatment";
 if (/(iztoč|točil|točenje).*(med|kg|kilogram)/.test(text)) return "honey_extraction";
 if (/(vzel|odstran|snel).*(medisc|naklad)/.test(text)) return "removed_super";
 if (/(dodal|namestil).*(medisc|naklad)/.test(text)) return "added_super";
 if (/(zamenjal|menjal).*(matic)/.test(text)) return "queen_replaced";
 if (/(videl|nasel|prisotna).*(matic)/.test(text)) return "queen_seen";
 if (/zaleg|brood/.test(text)) return "brood_checked";
 if (/rojil|roj izsel|roj ujel|swarm/.test(text)) return "swarm_event";
 if (/premaknil|prestav|preselil/.test(text)) return "moved_hive";
 if (/oprema|satnic|okvir|podnica|pokrov/.test(text)) return "equipment_note";
 if (/(dodal|nalil|hran|sirup|hrane|pogac)/.test(text)) return "feeding";
 if (/pregled|opazil|videl/.test(text)) return "inspection";
 return "general_note";
}

function buildActionNote(type, amount, unit, transcript) {
 if (type === "feeding") return amount ? `Dodanih ${amount} ${unit || "L"} hrane.` : "Dodano hranjenje.";
 if (type === "honey_extraction") return amount ? `Iztočeno ${amount} ${unit || "kg"} medu.` : "Zabeleženo točenje medu.";
 if (type === "pollen_harvest") return amount ? `Pobranih ${amount} ${unit || "kg"} cvetnega prahu.` : "Pobran cvetni prah.";
 if (type === "inventory_update") return amount ? `Zaloga posodobljena: ${amount} ${unit}.` : "Zaloga posodobljena.";
 if (type === "storage_note") return "Opomba o skladiščenju.";
 if (type === "swarm_cells_seen") return "Viden/i matičniki.";
 if (type === "varroa_treatment") return "Tretiranje proti varoji.";
 if (type === "added_super") return "Dodano medišče.";
 if (type === "removed_super") return "Odstranjeno medišče.";
 if (type === "queen_replaced") return "Matica zamenjana.";
 if (type === "queen_seen") return "Matica videna.";
 if (type === "brood_checked") return "Zalega pregledana.";
 if (type === "swarm_event") return "Zabeležen rojilni dogodek.";
 if (type === "moved_hive") return "Panj premaknjen.";
 if (type === "equipment_note") return "Opomba o opremi.";
 return transcript || "Splošna nota.";
}

function extractActionFields(type, text) {
 if (type === "varroa_treatment") {
  const treatment = text.includes("mravljic") ? "mravljična kislina" : text.includes("oksal") ? "oksalna kislina" : "";
  return { treatment };
 }
 if (type === "swarm_cells_seen") return { finding: "swarm_cells" };
 if (type === "inventory_update") return { item: text.includes("sladkor") ? "sugar" : text.includes("kozar") ? "jars" : text.includes("pokrov") ? "lids" : "inventory" };
 if (type === "queen_seen") return { finding: "queen_seen" };
 if (type === "brood_checked") return { finding: "brood_checked" };
 return {};
}

function previewSensorConsistency(data, action) {
 return compareActionWithSensors(data, action).message;
}

function compareActionWithSensors(data, action) {
 const hiveReadings = data.readings
  .filter((reading) => reading.hiveId === action.hiveId)
  .sort((a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0));

 if (hiveReadings.length < 2) return { status: "manual", message: "Zapis shranjen ročno." };
 const previous = hiveReadings[hiveReadings.length - 2];
 const latest = hiveReadings[hiveReadings.length - 1];
 const delta = toNumber(latest.weightKg) - toNumber(previous.weightKg);

 if (action.type === "feeding") {
  if (delta > 0) return { status: "match", message: "Podatek se sklada s tehtnico." };
  return { status: "contradiction", message: "Zabeleženo hranjenje, vendar tehtnica ni zaznala pričakovane spremembe. Preveri, ali je bil izbran pravi panj ali pravilna količina." };
 }
 if (action.type === "honey_extraction") {
  if (delta < 0) return { status: "match", message: "Podatek se sklada s tehtnico." };
  return { status: "contradiction", message: "Zabeleženo točenje, vendar tehtnica ni zaznala pričakovane spremembe. Preveri panj ali količino." };
 }
 return { status: "manual", message: "Zapis shranjen ročno." };
}

function VoicePage({ data, saveVoiceAction, initialHiveId }) {
 const [recording, setRecording] = useState(false);
 const [hiveId, setHiveId] = useState(initialHiveId || data.hives[0].id || "");
 const [draft, setDraft] = useState("Danes sem pregledal panj. Matica je prisotna, zalega je mirna.");
 const [originalTranscript, setOriginalTranscript] = useState("");
 const [correctionMessage, setCorrectionMessage] = useState("");
 const [extracted, setExtracted] = useState(null);
 const [speechMessage, setSpeechMessage] = useState("");
 const recognitionRef = useRef(null);
 const finalTranscriptRef = useRef("");

 useEffect(() => {
  if (initialHiveId) setHiveId(initialHiveId);
 }, [initialHiveId]);

 useEffect(() => () => {
  if (recognitionRef.current) recognitionRef.current.stop();
 }, []);

 function startVoiceCapture() {
  if (recording && recognitionRef.current) {
   recognitionRef.current.stop();
   setRecording(false);
   return;
  }
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
   setSpeechMessage("Ta brskalnik ne podpira glasovnega prepisa. Besedilo lahko vneseš ročno.");
   setRecording(false);
   return;
  }
  const recognition = new SpeechRecognition();
  recognitionRef.current = recognition;
  recognition.lang = "sl-SI";
  recognition.continuous = true;
  recognition.interimResults = true;
  recognition.maxAlternatives = 3;
  recognition.onstart = () => {
   setRecording(true);
   setSpeechMessage("Poslušam sproti...");
   setCorrectionMessage("");
   finalTranscriptRef.current = "";
   setDraft("");
   setOriginalTranscript("");
   setExtracted(null);
  };
  recognition.onresult = (event) => {
   let finalText = finalTranscriptRef.current;
   let interimText = "";
   for (let index = event.resultIndex; index < event.results.length; index += 1) {
    const result = event.results[index];
    const alternatives = Array.from(result || []);
    const best = (alternatives.find((item) => item.confidence >= 0.55) || alternatives[0])?.transcript || "";
    if (!best.trim()) continue;
    if (result.isFinal) finalText += `${best.trim()} `;
    else interimText += `${best} `;
   }
   finalTranscriptRef.current = finalText;
   const liveTranscript = `${finalText}${interimText}`.replace(/\s+/g, " ").trim();
   const corrected = correctBeeTranscript(liveTranscript, data.hives);
   setOriginalTranscript(liveTranscript);
   setDraft(corrected.text);
   setExtracted(extractVoiceAction(corrected.text, data.hives, hiveId));
   setCorrectionMessage(corrected.changes.length ? `Popravil sem: ${corrected.changes.join(", ")}.` : "");
   const latestResult = event.results[event.results.length - 1];
   setSpeechMessage(latestResult?.isFinal ? "Prepis pripravljen. Preveri podatke spodaj." : "Prepisujem sproti...");
  };
  recognition.onerror = (event) => {
   const message = event.error === "not-allowed"
    ? "Mikrofon ni dovoljen. V brskalniku dovoli mikrofon in poskusi znova."
    : "Prepis ni uspel. Besedilo lahko vneseš ročno.";
   setSpeechMessage(message);
   setRecording(false);
  };
  recognition.onend = () => {
   setRecording(false);
   recognitionRef.current = null;
  };
  try {
   recognition.start();
  } catch {
   setSpeechMessage("Mikrofon se ni zagnal. Poskusi še enkrat ali vnesi besedilo ročno.");
   setRecording(false);
  }
 }

 function extractNow() {
  const corrected = correctBeeTranscript(draft, data.hives);
  setDraft(corrected.text);
  setCorrectionMessage(corrected.changes.length ? `Popravil sem: ${corrected.changes.join(", ")}.` : "");
  setExtracted(extractVoiceAction(corrected.text, data.hives, hiveId));
 }

 function updateExtracted(field, value) {
  setExtracted((current) => ({ ...current, [field]: value }));
 }

 function submit(event) {
  event.preventDefault();
  const action = extracted || extractVoiceAction(draft, data.hives, hiveId);
  saveVoiceAction({ ...action, transcript: originalTranscript || draft, correctedTranscript: draft });
  setRecording(false);
  setExtracted(null);
  setDraft("");
  setOriginalTranscript("");
  setCorrectionMessage("");
 }

 return (
  <section>
   <PageHeader eyebrow="Glas v dogodek" title="Povej, kaj si naredil" subtitle="Prepis se sproti pretvori v strukturiran dogodek, pred shranjevanjem ga potrdiš." />
   <div className={`voice-panel ${recording ? "recording" : ""}`}>
    <button className="record-button" onClick={startVoiceCapture} aria-label="Snemanje" type="button">
     <Mic size={38} />
    </button>
    <strong>{recording ? "Snemanje teče..." : "Pritisni za prepis"}</strong>
    <div className="wave-lines">{Array.from({ length: 24 }, (_, index) => <i key={index} style={{ height: `${18 + ((index * 17) % 54)}px` }} />)}</div>
    {speechMessage ? <p>{speechMessage}</p> : null}
   </div>
   <div className="form-card">
    <HiveSelect hives={data.hives} value={hiveId} onChange={setHiveId} />
    <label>Prepoznano besedilo<textarea value={draft} onChange={(event) => setDraft(event.target.value)} /></label>
    {correctionMessage ? <p className="success-text">{correctionMessage}</p> : null}
    {originalTranscript && originalTranscript !== draft ? (
     <details className="details-card inline-details">
      <summary>Izvirni prepis</summary>
      <p className="subtle">{originalTranscript}</p>
     </details>
    ) : null}
    <button className="secondary-button" type="button" onClick={extractNow}><Save size={18} /> Pripravi zapis za {getHiveName(data.hives, hiveId)}</button>
   </div>
   {extracted ? (
    <form className="form-card confirmation-card" onSubmit={submit}>
     <h2>Zabeležim {actionTypeLabel(extracted.type).toLowerCase()}</h2>
     {extracted.missing.length ? <p className="warning-text">Manjkajo podatki: {extracted.missing.join(", ")}. Popravi spodaj.</p> : null}
     <HiveSelect hives={data.hives} value={extracted.hiveId} onChange={(value) => updateExtracted("hiveId", value)} />
     <label>Tip dogodka
      <select value={extracted.type} onChange={(event) => updateExtracted("type", event.target.value)}>
       {supportedActionTypes.map((type) => <option key={type} value={type}>{actionTypeLabel(type)}</option>)}
      </select>
     </label>
     <div className="form-grid">
      <label>Količina<input value={extracted.amount || ""} onChange={(event) => updateExtracted("amount", event.target.value)} placeholder="npr. 10" /></label>
      <label>Enota<input value={extracted.unit || ""} onChange={(event) => updateExtracted("unit", event.target.value)} placeholder="L / kg" /></label>
     </div>
     <label>Opomba<textarea value={extracted.note || ""} onChange={(event) => updateExtracted("note", event.target.value)} /></label>
     <p className="success-text">{previewSensorConsistency(data, extracted)}</p>
     <button className="primary-button" type="submit"><Check size={20} /> Shrani v {getHiveName(data.hives, extracted.hiveId)}</button>
    </form>
   ) : null}
   <h2 className="section-title">Zadnji glasovni dogodki</h2>
   <div className="stack">{(data.voiceActions || []).map((action) => <EventCard key={action.id} icon={Mic} title={actionTypeLabel(action.type)} subtitle={`${getHiveName(data.hives, action.hiveId)} · ${action.note}`} />)}</div>
  </section>
 );
}


function FeedingPage({ data, addFeedingEvent }) {
 const [form, setForm] = useState({ hiveId: data.hives[0].id || "", amountLiters: 2, feedType: "sirup 1:1", note: "" });
 const selectedHive = getHive(data.hives, form.hiveId);
 const foodPct = Math.min(100, selectedHive.foodLiters * 10);
 const dailySugarCost = 0.8;

 function submit(event) {
  event.preventDefault();
  addFeedingEvent(form);
  setForm((current) => ({ ...current, amountLiters: 2, note: "" }));
 }

 return (
  <section>
   <PageHeader eyebrow="Hranjenje" title="FeedScale pregled" subtitle="Vrednosti so simulirane, brez povezave na pravo strojno opremo." />
   <div className={`feed-tank card ${foodPct < 20 ? "feed-low" : ""}`}>
    <div className="tank"><i style={{ height: `${foodPct}%` }} /><strong>{selectedHive.foodLiters} L</strong></div>
    <div>
     <h2>{selectedHive.name}</h2>
     <p className="subtle">Ocenjeno se {selectedHive.foodDays} dni hrane.</p>
     {foodPct < 20 ? <p className="warning-text">Nizka zaloga. Priporočam hranjenje ali fizični pregled.</p> : null}
     <p className="cost-text">Strošek sladkorja: ~{dailySugarCost.toFixed(2)} €/dan · ~{(dailySugarCost * 7).toFixed(2)} €/teden · ~{(dailySugarCost * 48).toFixed(0)} €/leto</p>
     <TinyTrend values={[9, 8.4, 7.8, 7.1, selectedHive.foodLiters]} tone="green" />
    </div>
   </div>
   <form className="form-card compact-form" onSubmit={submit}>
    <HiveSelect hives={data.hives} value={form.hiveId} onChange={(value) => setForm((current) => ({ ...current, hiveId: value }))} />
    <div className="form-grid">
     <label>Količina L<input type="number" step="0.1" value={form.amountLiters} onChange={(event) => setForm((current) => ({ ...current, amountLiters: event.target.value }))} /></label>
     <label>Vrsta hrane<input value={form.feedType} onChange={(event) => setForm((current) => ({ ...current, feedType: event.target.value }))} /></label>
    </div>
    <label>Opomba<input value={form.note} onChange={(event) => setForm((current) => ({ ...current, note: event.target.value }))} placeholder="npr. po deževnem tednu" /></label>
    <button className="primary-button" type="submit"><Plus size={20} /> Dodaj hranjenje</button>
   </form>
   <h2 className="section-title">Vsi panji</h2>
   <div className="stack">
    {data.hives.map((hive) => (
     <div className="feed-row" key={hive.id}>
      <div><strong>{hive.name}</strong><span>{hive.foodLiters} L · {hive.foodDays} dni</span></div>
      <div className="progress"><i style={{ width: `${Math.min(100, hive.foodLiters * 10)}%` }} /></div>
     </div>
    ))}
   </div>
   <h2 className="section-title">Časovnica hranjenja</h2>
   <div className="stack">{data.feedingEvents.map((event) => <EventCard key={event.id} icon={Utensils} title={`${getHiveName(data.hives, event.hiveId)}: ${event.amountLiters} L`} subtitle={`${event.date} · ${event.feedType} · ${event.note}`} />)}</div>
  </section>
 );
}

function ExtractionPage({ data, addExtractionEvent }) {
 const [form, setForm] = useState({ hiveId: data.hives[0].id || "", boxId: "QR-BOX-014", honeyType: "akacija", frames: 8, grossKg: 20, emptyKg: 4, notes: "" });
 const total = data.extractionEvents.reduce((sum, event) => sum + event.netKg, 0);
 const netPreview = Math.max(0, toNumber(form.grossKg) - toNumber(form.emptyKg)).toFixed(1);

 function submit(event) {
  event.preventDefault();
  addExtractionEvent(form);
  setForm((current) => ({ ...current, frames: 8, grossKg: 20, emptyKg: 4 }));
 }

 return (
  <section>
   <PageHeader eyebrow="Točenje medu" title={`${total.toFixed(1)} kg v sezoni`} subtitle="Sledenje po panju, vrsti medu in prazni embalaži." />
   <form className="form-card compact-form" onSubmit={submit}>
    <HiveSelect hives={data.hives} value={form.hiveId} onChange={(value) => setForm((current) => ({ ...current, hiveId: value }))} />
    <label>QR škatle / box<input value={form.boxId} onChange={(event) => setForm((current) => ({ ...current, boxId: event.target.value }))} /></label>
    <div className="form-grid">
     <label>Vrsta medu<input value={form.honeyType} onChange={(event) => setForm((current) => ({ ...current, honeyType: event.target.value }))} /></label>
     <label>St. satov<input type="number" value={form.frames} onChange={(event) => setForm((current) => ({ ...current, frames: event.target.value }))} /></label>
     <label>Polno kg<input type="number" step="0.1" value={form.grossKg} onChange={(event) => setForm((current) => ({ ...current, grossKg: event.target.value }))} /></label>
     <label>Prazno kg<input type="number" step="0.1" value={form.emptyKg} onChange={(event) => setForm((current) => ({ ...current, emptyKg: event.target.value }))} /></label>
    </div>
    <p className="success-text">Neto izračun: {netPreview} kg</p>
    <p className="subtle">Ocena medu ±0.5 kg. Prazne satnice lahko ročno popraviš.</p>
    <button className="primary-button" type="submit"><Plus size={20} /> Dodaj točenje</button>
   </form>
   <div className="card">
    <div className="card-title"><h2>Donos po dogodkih</h2><span>kg neto</span></div>
    <TinyTrend values={data.extractionEvents.map((event) => event.netKg)} />
   </div>
   <div className="stack">
    {data.extractionEvents.map((event) => (
     <EventCard
      key={event.id}
      icon={Scale}
      title={`${getHiveName(data.hives, event.hiveId)}: ${event.netKg} kg`}
      subtitle={`${event.date} · ${event.honeyType} · ${event.frames} satov`}
     />
    ))}
   </div>
   <details className="details-card">
    <summary>Podrobnosti</summary>
    <div className="table-wrap">
     <table>
      <thead><tr><th>Panj</th><th>Polno</th><th>Prazno</th><th>Neto</th></tr></thead>
      <tbody>{data.extractionEvents.map((event) => <tr key={event.id}><td>{getHiveName(data.hives, event.hiveId)}</td><td>{event.grossKg} kg</td><td>{event.emptyKg} kg</td><td>{event.netKg} kg</td></tr>)}</tbody>
     </table>
    </div>
   </details>
  </section>
 );
}

function PocketScalePage({ data, saveScaleMeasurement, saveParsedEvent }) {
 const [hiveId, setHiveId] = useState(data.hives[0].id || "");
 const [type, setType] = useState("pollen_harvest");
 const [tare, setTare] = useState(0.42);
 const [weight, setWeight] = useState(1.24);
 const [bleStatus, setBleStatus] = useState("Bluetooth se ni povezan. Lahko testiras s simulirano tezo.");
 const [bleDeviceName, setBleDeviceName] = useState("");
 const [isBleConnected, setIsBleConnected] = useState(false);
 const net = Math.max(0, Math.round((weight - tare) * 100) / 100);

 async function connectBluetoothScale() {
  if (!navigator.bluetooth.requestDevice) {
   setBleStatus("Bluetooth v tem brskalniku ni na voljo. Na telefonu poskusi Chrome ali uporabi simulacijo.");
   return;
  }
  try {
   setBleStatus("Iscem Bluetooth naprave...");
   const device = await navigator.bluetooth.requestDevice({
    acceptAllDevices: true,
    optionalServices: ["battery_service"],
   });
   setBleDeviceName(device.name || device.id || "Neimenovana naprava");
   device.addEventListener("gattserverdisconnected", () => {
    setIsBleConnected(false);
    setBleStatus("Naprava se je odklopila. Simulacija ostane na voljo.");
   });
   const server = await device.gatt.connect();
   setIsBleConnected(true);
   let batteryText = "";
   try {
    const service = await server.getPrimaryService("battery_service");
    const characteristic = await service.getCharacteristic("battery_level");
    const value = await characteristic.readValue();
    batteryText = ` Baterija ${value.getUint8(0)}%.`;
   } catch {
    batteryText = " Za pravo branje teze moramo kasneje dodati UUID tvoje tehtnice.";
   }
   setBleStatus(`Povezano z ${device.name || "napravo"}.${batteryText}`);
  } catch {
   setIsBleConnected(false);
   setBleStatus("Povezava ni uspela ali je bila preklicana. Simulacija ostane na voljo.");
  }
 }

 function readScaleWeight() {
  const nextWeight = Math.round((0.6 + Math.random() * 4) * 100) / 100;
  setWeight(nextWeight);
  if (isBleConnected) {
   setBleStatus("Naprava je povezana. Teža je za zdaj testno simulirana, dokler ne poznamo protokola tehtnice.");
  }
 }

 function save() {
  const action = {
   type,
   hiveId,
   amount: net,
   unit: "kg",
   date: todayLabel(),
   transcript: `PocketScale ${actionTypeLabel(type)} ${net} kg`,
   note: `${actionTypeLabel(type)}: ${net} kg.`,
   fields: { device: "PametniPanj PocketScale", grossKg: weight, tareKg: tare },
  };
  saveScaleMeasurement({ hiveId, type, grossKg: weight, tareKg: tare, netKg: net });
  saveParsedEvent(action, "bluetooth_scale");
 }

 return (
  <section>
   <PageHeader eyebrow="PametniPanj PocketScale" title={`${net.toFixed(2)} kg`} subtitle={isBleConnected ? `Povezano: ${bleDeviceName}` : "Bluetooth iskanje je pripravljeno, teža je še testna."} />
   <div className="scale-card">
    <Scale size={44} />
    <strong>{weight.toFixed(2)} kg</strong>
    <span>Tara {tare.toFixed(2)} kg · neto {net.toFixed(2)} kg</span>
   </div>
   <div className={`device-status ${isBleConnected ? "ok" : ""}`}>
    <Radio size={20} />
    <span>{bleStatus}</span>
   </div>
   <div className="quick-grid">
    <button onClick={connectBluetoothScale}>Bluetooth</button>
    <button onClick={() => setTare(weight)}>Tara</button>
    <button onClick={readScaleWeight}>Stehtaj</button>
    <button onClick={save}>Shrani</button>
   </div>
   <form className="form-card">
    <HiveSelect hives={data.hives} value={hiveId} onChange={setHiveId} />
    <label>Vrsta dogodka
     <select value={type} onChange={(event) => setType(event.target.value)}>
      <option value="pollen_harvest">Cvetni prah</option>
      <option value="honey_extraction">Okvirji z medom</option>
      <option value="inventory_update">Zaloga</option>
      <option value="equipment_note">Oprema</option>
     </select>
    </label>
   </form>
  </section>
 );
}

function PollenPage({ data, addPollenEvent }) {
 const [form, setForm] = useState({ hiveId: data.hives[0].id || "", amountKg: 1, notes: "" });
 const total = data.pollenEvents.reduce((sum, event) => sum + toNumber(event.amountKg), 0);

 return (
  <section>
   <PageHeader eyebrow="Cvetni prah" title={`${total.toFixed(2)} kg skupaj`} subtitle="Ročni, glasovni ali PocketScale vnos." />
   <form className="form-card compact-form" onSubmit={(event) => { event.preventDefault(); addPollenEvent(form); setForm((current) => ({ ...current, amountKg: 1, notes: "" })); }}>
    <HiveSelect hives={data.hives} value={form.hiveId} onChange={(value) => setForm((current) => ({ ...current, hiveId: value }))} />
    <label>Količina kg<input type="number" step="0.01" value={form.amountKg} onChange={(event) => setForm((current) => ({ ...current, amountKg: event.target.value }))} /></label>
    <label>Opomba<input value={form.notes} onChange={(event) => setForm((current) => ({ ...current, notes: event.target.value }))} /></label>
    <button className="primary-button" type="submit">Shrani cvetni prah</button>
   </form>
   <div className="stack">{data.pollenEvents.map((event) => <EventCard key={event.id} icon={Droplets} title={`${getHiveName(data.hives, event.hiveId)}: ${event.amountKg} kg`} subtitle={`${event.date} · ${event.notes}`} />)}</div>
  </section>
 );
}

const PRODUCT_UNITS = {
 "cvetni prah": "g",
 propolis: "g",
 vosek: "kg",
 "matični mleček": "g",
 med: "kg",
};

function ProductsPage({ data, addProductEvent }) {
 const [form, setForm] = useState({ hiveId: data.hives[0].id || "", productType: "propolis", quantity: 100, unit: "g", pricePerUnit: 0.04, note: "" });
 const annualTotal = (type) => (data.productEvents || []).filter((event) => event.productType === type).reduce((sum, event) => sum + toNumber(event.quantity), 0);
 const revenue = (data.productEvents || []).reduce((sum, event) => sum + toNumber(event.quantity) * toNumber(event.pricePerUnit), 0);
 const productTypes = ["med", "cvetni prah", "propolis", "vosek", "matični mleček"];

 function submit(event) {
  event.preventDefault();
  addProductEvent(form);
  setForm((current) => ({ ...current, quantity: 100, note: "" }));
 }

 return (
  <section>
   <PageHeader eyebrow="Pridelki" title={`${revenue.toFixed(0)} € ocenjenega prihodka`} subtitle="Med, cvetni prah, propolis, vosek in matični mleček. Vnos gre tudi v bilanco." />
   <form className="form-card compact-form" onSubmit={submit}>
    <HiveSelect hives={data.hives} value={form.hiveId} onChange={(value) => setForm((current) => ({ ...current, hiveId: value }))} />
    <label>Vrsta pridelka</label>
    <div className="pill-row">
     {productTypes.map((type) => <button type="button" key={type} className={form.productType === type ? "active" : ""} onClick={() => setForm((current) => ({ ...current, productType: type, unit: PRODUCT_UNITS[type] }))}>{type}</button>)}
    </div>
    <div className="form-grid">
     <label>Količina<input type="number" step="0.01" value={form.quantity} onChange={(event) => setForm((current) => ({ ...current, quantity: event.target.value }))} /></label>
     <label>Enota<input value={form.unit} onChange={(event) => setForm((current) => ({ ...current, unit: event.target.value }))} /></label>
     <label>Cena/enoto €<input type="number" step="0.001" value={form.pricePerUnit} onChange={(event) => setForm((current) => ({ ...current, pricePerUnit: event.target.value }))} /></label>
    </div>
    <label>Opomba<input value={form.note} onChange={(event) => setForm((current) => ({ ...current, note: event.target.value }))} placeholder="npr. surov propolis, vosek iz starih satnic..." /></label>
    <button className="primary-button" type="submit"><Plus size={20} /> Shrani pridelek</button>
   </form>
   <div className="metric-grid">
    {productTypes.slice(1).map((type) => <Metric key={type} icon={Droplets} label={type} value={`${annualTotal(type).toFixed(type === "vosek" ? 1 : 0)} ${PRODUCT_UNITS[type]}`} />)}
   </div>
   <div className="card">
    <div className="card-title"><h2>Po mesecih</h2><span>demo graf</span></div>
    <TinyTrend values={[1, 3, 5, 8, 6, 4, 2]} tone="green" />
   </div>
   <div className="stack">{(data.productEvents || []).map((event) => <EventCard key={event.id} icon={Droplets} title={`${event.productType}: ${event.quantity} ${event.unit}`} subtitle={`${getHiveName(data.hives, event.hiveId)} · ${event.date} · ${event.note || "brez opombe"}`} />)}</div>
  </section>
 );
}

function InventoryPage({ data, addInventoryTransaction, initialShelf = "", initialDraft = null }) {
 const [activeShelf, setActiveShelf] = useState(initialShelf || "Vse");
 const [form, setForm] = useState({ category: initialDraft.category || "Sladkor", name: initialDraft.name || "Sladkor", quantity: initialDraft.quantity || 5, unit: initialDraft.unit || "kg", shelf: initialDraft.shelf || initialShelf || "Regal A1", direction: initialDraft.direction || "add", brand: "", jarSize: "720 ml", condition: "Dobra", expiryDate: "" });
 const [search, setSearch] = useState("");
 const shelves = ["Vse", ...new Set([
  ...data.qrItems.filter((item) => normalizeSl(item.type).includes("regal")).map((item) => item.linkedTo || item.id),
  ...data.inventoryItems.map((item) => item.shelf),
 ].filter(Boolean))];
 const visibleItems = activeShelf === "Vse" ? data.inventoryItems : data.inventoryItems.filter((item) => normalizeSl(item.shelf) === normalizeSl(activeShelf));
 const searchResults = search.trim() ? data.inventoryItems.filter((item) => normalizeSl(`${item.name} ${item.shelf}`).includes(normalizeSl(search))) : [];

 useEffect(() => {
  if (!initialShelf) return;
  setActiveShelf(initialShelf);
  setForm((current) => ({ ...current, shelf: initialShelf }));
 }, [initialShelf]);

 useEffect(() => {
  if (!initialDraft) return;
  if (initialDraft.shelf) setActiveShelf(initialDraft.shelf);
  setForm((current) => ({
   ...current,
   ...initialDraft,
   category: initialDraft.category || current.category,
   name: initialDraft.name || current.name,
   quantity: initialDraft.quantity || current.quantity,
   unit: initialDraft.unit || current.unit,
   shelf: initialDraft.shelf || initialShelf || current.shelf,
   direction: initialDraft.direction || current.direction,
  }));
 }, [initialDraft, initialShelf]);

 return (
  <section>
   <PageHeader eyebrow="Zaloga" title="Skladišče" subtitle="Preprost pregled po regalih: sladkor, kozarci, pokrovčki, satnice in oprema." />
   <div className="segmented-row shelf-tabs">
    {shelves.map((shelf) => <button key={shelf} className={activeShelf === shelf ? "active" : ""} onClick={() => { setActiveShelf(shelf); if (shelf !== "Vse") setForm((current) => ({ ...current, shelf })); }}>{shelf}</button>)}
   </div>
   <label className="search-field">Kje imam ...<input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="npr. dimnik, sladkor, pokrovčki" /></label>
   {searchResults.length ? <div className="stack">{searchResults.map((item) => <EventCard key={item.id} icon={Search} title={`${item.name}: ${item.quantity} ${item.unit}`} subtitle={`${item.shelf} · dodano ${displayText(item.updatedAt ? new Date(item.updatedAt).toLocaleDateString("sl-SI") : "neznano")}`} />)}</div> : null}
   <form className="form-card compact-form" onSubmit={(event) => { event.preventDefault(); addInventoryTransaction(form); }}>
    <label>Kategorija</label>
    <div className="pill-row">
     {["Sladkor", "Kozarci", "Pokrovčki", "Oprema", "Zdravila", "Drugo"].map((category) => {
      const meta = inventoryCategoryMeta(category);
      const Icon = meta.icon;
      return <button type="button" key={category} className={form.category === category ? "active" : ""} onClick={() => setForm((current) => ({ ...current, category, name: category === "Kozarci" ? `Kozarci ${current.jarSize}` : category, unit: category === "Sladkor" ? "kg" : category === "Kozarci" || category === "Pokrovčki" ? "kom" : current.unit }))}><Icon size={18} style={{ color: meta.color }} /> {category}</button>;
     })}
    </div>
    {form.category === "Kozarci" ? (
     <>
      <label>Velikost kozarca</label>
      <div className="frame-selector jar-size-selector">
       {["250 ml", "370 ml", "720 ml", "1000 ml", "Drugo"].map((size) => <button type="button" key={size} className={form.jarSize === size ? "active" : ""} onClick={() => setForm((current) => ({ ...current, jarSize: size, name: `Kozarci ${size}` }))}>{size}</button>)}
      </div>
     </>
    ) : null}
    <label>Artikel<input value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} /></label>
    <div className="form-grid">
     <label>Količina<input type="number" step="0.1" value={form.quantity} onChange={(event) => setForm((current) => ({ ...current, quantity: event.target.value }))} /></label>
     <label>Enota<input value={form.unit} onChange={(event) => setForm((current) => ({ ...current, unit: event.target.value }))} /></label>
    </div>
    {form.category === "Oprema" ? <label>Stanje<select value={form.condition} onChange={(event) => setForm((current) => ({ ...current, condition: event.target.value }))}><option>Nova</option><option>Dobra</option><option>Rabljena</option></select></label> : null}
    {form.category === "Zdravila" ? <label>Rok uporabe<input type="date" value={form.expiryDate} onChange={(event) => setForm((current) => ({ ...current, expiryDate: event.target.value }))} /></label> : null}
    <label>Lokacija/regal<input value={form.shelf} onChange={(event) => setForm((current) => ({ ...current, shelf: event.target.value }))} /></label>
    <label>Premik</label>
    <div className="segmented-row">
     <button type="button" className={form.direction === "add" ? "active" : ""} onClick={() => setForm((current) => ({ ...current, direction: "add" }))}>Dodaj</button>
     <button type="button" className={form.direction === "remove" ? "active" : ""} onClick={() => setForm((current) => ({ ...current, direction: "remove" }))}>Vzemi</button>
    </div>
    <button className="primary-button" type="submit">{form.direction === "add" ? "Dodaj v zalogo" : "Vzemi iz zaloge"}</button>
   </form>
   <div className="stack">{visibleItems.map((item) => <InventoryItemCard key={item.id} item={item} addInventoryTransaction={addInventoryTransaction} />)}</div>
  </section>
 );
}

function InventoryItemCard({ item, addInventoryTransaction }) {
 const meta = inventoryCategoryMeta(item.category || item.name);
 const Icon = meta.icon;
 const extra = normalizeSl(item.name).includes("kozar") && item.jarSize ? ` · ${item.jarSize}` : "";
 return (
  <article className={`event-card inventory-item-card ${item.quantity <= item.lowStockAt ? "low-stock" : ""}`}>
   <Icon size={24} style={{ color: meta.color }} />
   <div>
    <strong>{displayText(item.name)}: {item.quantity} {item.unit}</strong>
    <span>{displayText(item.shelf)}{extra} · dodano {item.updatedAt ? new Date(item.updatedAt).toLocaleDateString("sl-SI") : "neznano"}</span>
   </div>
   <button className="secondary-button compact-button" type="button" onClick={() => addInventoryTransaction({ ...item, direction: "remove", quantity: 1 })}>Odvzemi / Porabljeno</button>
  </article>
 );
}

function FillingPage({ data, addFillingEvent }) {
 const [form, setForm] = useState({ batchId: data.honeyBatches[0].id || "", jarSizeKg: 0.45, jarCount: 100, shelf: "Regal B2" });
 const batch = data.honeyBatches.find((item) => item.id === form.batchId) || data.honeyBatches[0];
 const usedKg = toNumber(form.jarSizeKg) * toNumber(form.jarCount);
 const remaining = batch ? toNumber(batch.remainingKg) - usedKg : 0;

 return (
  <section>
   <PageHeader eyebrow="Polnjenje" title={`${usedKg.toFixed(1)} kg medu`} subtitle="Kozarci, serije, ostanek in izgube." />
   <form className="form-card compact-form" onSubmit={(event) => { event.preventDefault(); addFillingEvent({ ...form, usedKg, remainingKg: remaining }); }}>
    <label>Serija<select value={form.batchId} onChange={(event) => setForm((current) => ({ ...current, batchId: event.target.value }))}>{data.honeyBatches.map((batch) => <option key={batch.id} value={batch.id}>{batch.name} ({batch.remainingKg} kg)</option>)}</select></label>
    <div className="form-grid">
     <label>Velikost kozarca kg<input type="number" step="0.01" value={form.jarSizeKg} onChange={(event) => setForm((current) => ({ ...current, jarSizeKg: event.target.value }))} /></label>
     <label>St. kozarcev<input type="number" value={form.jarCount} onChange={(event) => setForm((current) => ({ ...current, jarCount: event.target.value }))} /></label>
    </div>
    <label>Lokacija<input value={form.shelf} onChange={(event) => setForm((current) => ({ ...current, shelf: event.target.value }))} /></label>
    {remaining < 0 ? <p className="warning-text">Pozor: serija nima dovolj medu. Manjka {Math.abs(remaining).toFixed(1)} kg.</p> : <p className="success-text">Po polnjenju ostane {remaining.toFixed(1)} kg.</p>}
    <button className="primary-button" type="submit">Shrani polnjenje</button>
   </form>
   <div className="stack">{data.jarFillingEvents.map((event) => <EventCard key={event.id} icon={ListPlus} title={`${event.jarCount} kozarcev · ${event.usedKg.toFixed(1)} kg`} subtitle={`${event.date} · izguba/ostanek ocenjen`} />)}</div>
  </section>
 );
}

function hiveFinanceSummary(data, hiveId = "") {
 const events = (data.financeEvents || []).filter((event) => !hiveId || event.hiveId === hiveId);
 const income = events.filter((event) => event.type === "income").reduce((sum, event) => sum + toNumber(event.amountEur), 0);
 const expense = events.filter((event) => event.type === "expense").reduce((sum, event) => sum + toNumber(event.amountEur), 0);
 return { income, expense, profit: income - expense };
}

function FinancePage({ data, addFinanceEvent }) {
 const [form, setForm] = useState({ hiveId: data.hives[0].id || "", type: "expense", category: "Sladkor", description: "", amountEur: 10 });
 const total = hiveFinanceSummary(data);
 const rows = data.hives.filter((hive) => hive.status !== "archived").map((hive) => ({ hive, ...hiveFinanceSummary(data, hive.id) }));
 const incomeCategories = ["Med", "Propolis", "Vosek", "Cvetni prah", "Matično mlečko", "Storitev", "Drugo"];
 const expenseCategories = ["Sladkor", "Zdravila", "Oprema", "Naročnina", "Prevoz", "Panji in naklade", "Registracija", "Izobraževanje", "Drugo"];

 function submit(event) {
  event.preventDefault();
  addFinanceEvent(form);
  setForm((current) => ({ ...current, description: "", amountEur: 10 }));
 }

 function exportPdf() {
  const report = rows.map(({ hive, income, expense, profit }) => `${hive.name}: prihodki ${income.toFixed(2)} EUR, stroški ${expense.toFixed(2)} EUR, rezultat ${profit.toFixed(2)} EUR`).join("\n");
  const win = window.open("", "_blank");
  if (!win) return;
  win.document.write(`<pre style="font:18px Arial;white-space:pre-wrap">PametniPanj finančni pregled 2026\n\nSKUPAJ\nPrihodki: ${total.income.toFixed(2)} EUR\nStroški: ${total.expense.toFixed(2)} EUR\nDobiček: ${total.profit.toFixed(2)} EUR\n\nPO PANJIH\n${report}</pre>`);
  win.document.close();
  win.print();
 }

 return (
  <section>
   <PageHeader eyebrow="Finančni pregled" title={`${total.profit.toFixed(0)} € rezultat`} subtitle={`Vaš hobi vas je letos ${total.profit >= 0 ? "zaslužil" : "stal"} ${Math.abs(total.profit).toFixed(0)} €.`} />
   <div className="pl-card">
    <span>Sezona 2026</span>
    <strong>Dobiček: {total.profit.toFixed(0)} €</strong>
    <p>Prihodki: {total.income.toFixed(0)} € · Stroški: {total.expense.toFixed(0)} € · Na panj: {(total.profit / Math.max(1, rows.length)).toFixed(0)} €</p>
   </div>
   <div className="metric-grid">
    <Metric icon={Scale} label="Prihodki" value={`${total.income.toFixed(0)} €`} tone="ok" />
    <Metric icon={ClipboardList} label="Stroški" value={`${total.expense.toFixed(0)} €`} tone={total.expense ? "warn" : "ok"} />
   </div>
   <form className="form-card compact-form" onSubmit={submit}>
    <HiveSelect hives={data.hives} value={form.hiveId} onChange={(value) => setForm((current) => ({ ...current, hiveId: value }))} />
    <label>Vrsta<select value={form.type} onChange={(event) => setForm((current) => ({ ...current, type: event.target.value, category: event.target.value === "income" ? "Med" : "Sladkor" }))}><option value="expense">Strošek</option><option value="income">Prihodek</option></select></label>
    <div className="form-grid">
     <label>Kategorija<select value={form.category} onChange={(event) => setForm((current) => ({ ...current, category: event.target.value }))}>{(form.type === "income" ? incomeCategories : expenseCategories).map((item) => <option key={item}>{item}</option>)}</select></label>
     <label>Znesek €<input type="number" step="0.01" value={form.amountEur} onChange={(event) => setForm((current) => ({ ...current, amountEur: event.target.value }))} /></label>
    </div>
    <label>Opis<input value={form.description} onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))} placeholder="npr. gorivo, kozarci, prodaja medu..." /></label>
    <button className="primary-button" type="submit"><Plus size={20} /> Shrani v bilanco</button>
   </form>
   <button className="secondary-button full-button" onClick={exportPdf}>Izvoz za PDF</button>
   <h2 className="section-title">Po panjih</h2>
   <div className="stack">
    {rows.map(({ hive, income, expense, profit }) => (
     <article className={`event-card finance-row ${profit >= 0 ? "finance-ok" : "finance-warn"}`} key={hive.id}>
      <Scale size={24} />
      <div>
       <strong>{hive.name}: {profit.toFixed(0)} €</strong>
       <span>Prihodki {income.toFixed(0)} € · stroški {expense.toFixed(0)} €</span>
      </div>
     </article>
    ))}
   </div>
  </section>
 );
}

function HoneyDiaryPage({ data, addHoneySale }) {
 const [form, setForm] = useState({ hiveId: data.hives[0].id || "", honeyType: "cvetlični", amountKg: 5, pricePerKg: 12, customer: "", qrCode: "QR-JAR-" });
 const totalKg = (data.honeySales || []).reduce((sum, sale) => sum + toNumber(sale.amountKg), 0);
 const totalEur = (data.honeySales || []).reduce((sum, sale) => sum + toNumber(sale.amountKg) * toNumber(sale.pricePerKg), 0);

 function submit(event) {
  event.preventDefault();
  addHoneySale(form);
  setForm((current) => ({ ...current, amountKg: 5, customer: "", qrCode: "QR-JAR-" }));
 }

 return (
  <section>
   <PageHeader eyebrow="Medeni dnevnik" title={`${totalKg.toFixed(1)} kg prodanega medu`} subtitle={`${totalEur.toFixed(0)} € prihodkov. Vsaka serija ima panj, sorto, kupca in QR sled.`} />
   <form className="form-card compact-form" onSubmit={submit}>
    <HiveSelect hives={data.hives} value={form.hiveId} onChange={(value) => setForm((current) => ({ ...current, hiveId: value }))} />
    <div className="form-grid">
     <label>Sorta medu<input value={form.honeyType} onChange={(event) => setForm((current) => ({ ...current, honeyType: event.target.value }))} /></label>
     <label>Količina kg<input type="number" step="0.1" value={form.amountKg} onChange={(event) => setForm((current) => ({ ...current, amountKg: event.target.value }))} /></label>
     <label>Cena/kg €<input type="number" step="0.01" value={form.pricePerKg} onChange={(event) => setForm((current) => ({ ...current, pricePerKg: event.target.value }))} /></label>
     <label>QR kozarca<input value={form.qrCode} onChange={(event) => setForm((current) => ({ ...current, qrCode: event.target.value }))} /></label>
    </div>
    <label>Kupec<input value={form.customer} onChange={(event) => setForm((current) => ({ ...current, customer: event.target.value }))} placeholder="npr. Janez, tržnica, trgovina..." /></label>
    <button className="primary-button" type="submit"><Plus size={20} /> Dodaj prodajo</button>
   </form>
   <div className="stack">
    {(data.honeySales || []).map((sale) => (
     <EventCard key={sale.id} icon={ListPlus} title={`${sale.honeyType}: ${sale.amountKg} kg`} subtitle={`${getHiveName(data.hives, sale.hiveId)} · ${sale.pricePerKg} €/kg · ${sale.customer || "brez kupca"} · ${sale.qrCode || "brez QR"}`} />
    ))}
   </div>
  </section>
 );
}

function buildAiAnswer(question, data) {
 const text = normalizeSl(question);
 const activeHives = data.hives.filter((hive) => hive.status !== "archived");
 const risky = activeHives.filter((hive) => hive.status !== "ok");
 const sensorHives = activeHives.filter((hive) => !isManualHive(hive));
 const losingWeight = sensorHives.filter((hive) => toNumber(hive.weeklyDeltaKg) < -1);
 const lowFood = sensorHives.filter((hive) => toNumber(hive.foodDays) < 7);
 const bestHive = sensorHives.find((hive) => toNumber(hive.weeklyDeltaKg) > 1);

 if (/tezo|teza|pada|izgublja/.test(text)) {
  const names = losingWeight.map((hive) => hive.name).join(", ") || "noben panj izrazito";
  return "Najprej poglej panje z upadom teže: " + names + ". Če teža pada in je hrane manj kot 7 dni, je najbolj praktično narediti kratek fizični obisk, preveriti zalogo in vhod. Pri dežju ali hladnem vremenu je padec lahko normalen, pri lepem vremenu pa je to znak za ukrepanje.";
 }
 if (/medisc|dodati/.test(text)) {
  return bestHive ? "Pri panju " + bestHive.name + " se teža lepo dviguje (" + bestHive.weeklyDeltaKg + " kg v tednu). Če je vreme ugodno in so čebele močne, je to kandidat za dodajanje medišča. Pri panjih z opozorilom najprej preveri zdravje in hrano." : "Trenutno ne vidim panja z močnim dvigom teže. Medišče dodaj, ko je družina močna, vreme ugodno in je v plodišču dovolj čebel.";
 }
 if (/rojenj|maticnik/.test(text)) {
  return "Znaki rojenja: matičniki, nenadna gneča na bradi, manj prostora in močna družina v sezoni. V PametniPanj bi najprej pogledal zapise v zdravju, zadnje opombe in rast teže. Če vidiš matičnike, naredi pregled hitro, ne šele čez teden.";
 }
 if (/varoj|zdrav/.test(text)) {
  const highVarroa = (data.healthRecords || []).filter((record) => toNumber(record.varroaLevel) >= 3);
  return highVarroa.length ? "Pozor: " + highVarroa.length + " zapis ima povišano varojo. Pri stopnji 3/5 ali več priporočam preventivni pregled sosednjih panjev in zapis zdravljenja. Opozorilo naj ostane anonimno, brez točne lokacije." : "Za varojo je najbolje delati redne preglede, ne čakati na očitne znake. Če ob pregledu oceniš 3/5 ali več, vnesi zapis v zavihek Zdravje in razmisli o anonimnem opozorilu okolici.";
 }
 return "Trenutno imaš " + activeHives.length + " aktivne panje, " + risky.length + " za pregled in " + lowFood.length + " z manj kot 7 dni hrane. Moj praktični predlog: najprej obišči rdeče/oranžne panje, nato preveri hrano in šele potem delaj večje posege.";
}

const BEE_ASSISTANT_KEYWORDS = [
 "cebel", "panj", "matic", "zaleg", "roj", "maticnik", "varoj", "prsic", "bolezen", "zdrav", "osip",
 "med", "medisc", "toc", "iztoc", "sat", "satnic", "vosek", "propolis", "cvetni prah", "pelod",
 "hran", "sirup", "sladkor", "pogac", "zaloga", "feed", "teht", "teza", "senzor", "naprava", "bater", "signal",
 "akacij", "lipa", "kostanj", "ajda", "pasa", "gozd", "travnik", "vreme", "dez", "veter", "temperatura",
 "opomnik", "koledar", "pregled", "zapis", "qr", "regal", "skladisc", "oprema", "panji", "cebelnjak",
 "kaj naj", "stanje", "opozoril", "obvestil", "danes v panj", "jutri v panj"
];

function generalAssistantAnswer(question) {
 const text = normalizeSl(question);
 const now = new Date();
 if (/(koliko|kaksna).*ura|cas/.test(text)) {
  return "Ura je " + new Intl.DateTimeFormat("sl-SI", { hour: "2-digit", minute: "2-digit" }).format(now) + ".";
 }
 if (/(kateri|kaksen).*dan|danes.*dan/.test(text)) {
  return "Danes je " + new Intl.DateTimeFormat("sl-SI", { weekday: "long", day: "numeric", month: "long", year: "numeric" }).format(now) + ".";
 }
 if (/datum|kateri.*datum/.test(text)) {
  return "Dana?nji datum je " + new Intl.DateTimeFormat("sl-SI", { day: "numeric", month: "long", year: "numeric" }).format(now) + ".";
 }
 return "";
}

function isAllowedSmartBeeQuestion(question, data = {}) {
 const text = normalizeSl(question);
 if (generalAssistantAnswer(question)) return true;
 if (BEE_ASSISTANT_KEYWORDS.some((key) => text.includes(normalizeSl(key)))) return true;
 return (data.hives || []).some((hive) => {
  const name = normalizeSl(hive.name);
  const location = normalizeSl(hive.location || hive.locationName || "");
  return (name && text.includes(name)) || (location && text.includes(location));
 });
}

function offTopicAiMessage() {
 return "Pametna čebela zna pomagati pri čebelarstvu, panjih, medu, vremenu za pregled, opomnikih, zalogi, senzorjih in tvojem čebelnjaku. Za ostale teme raje vprašaj drugega pomočnika.";
}

function localAiAnswer(question) {
 const generalAnswer = generalAssistantAnswer(question);
 if (generalAnswer) return generalAnswer;
 const text = normalizeSl(question);
 const match = localQA.find((entry) => entry.keys.some((key) => text.includes(normalizeSl(key))));
 return match?.answer || "";
}

function readAiUsage() {
 const today = new Date().toISOString().slice(0, 10);
 try {
  const usage = JSON.parse(localStorage.getItem(AI_USAGE_KEY) || "{}");
  return usage.date === today ? usage : { date: today, count: 0 };
 } catch {
  return { date: today, count: 0 };
 }
}

function saveAiUsage(usage) {
 localStorage.setItem(AI_USAGE_KEY, JSON.stringify(usage));
}

function aiTiredMessage() {
 return "Pametna čebela je izmučena in trenutno ne more odgovarjati na zahtevna vprašanja. Osnovna lokalna pomoč še vedno deluje.";
}

function AiAssistantPage({ data, openHive, setPage }) {
 const suggestions = ["Kdaj dodati medišče", "Znaki rojenja", "Kako zdraviti varojo", "Kdaj točiti med"];
 const [question, setQuestion] = useState("");
 const [thinking, setThinking] = useState(false);
 const [dailyLimit, setDailyLimit] = useState(() => Number(localStorage.getItem(AI_DAILY_LIMIT_KEY) || AI_DEFAULT_DAILY_LIMIT));
 const [usage, setUsage] = useState(() => readAiUsage());
 const [messages, setMessages] = useState([
  { role: "assistant", text: "Pametna čebela najprej odgovori lokalno. Zahtevnejša vprašanja obdela samo, če so povezana s čebelarstvom ali osnovnimi podatki, kot sta datum in ura." },
 ]);
 const cloudAvailable = Boolean(AI_API_URL);
 const limitReached = usage.count >= dailyLimit;
 const priorityHive = data.hives.find((hive) => hive.status === "danger") || data.hives.find((hive) => hive.status === "warn") || data.hives[0];

 function addExchange(userText, assistantText) {
  setMessages((current) => [...current, { role: "user", text: userText }, { role: "assistant", text: assistantText }]);
 }

 async function ask(nextQuestion = question) {
  const clean = nextQuestion.trim();
  if (!clean || thinking) return;
  setThinking(true);
  try {
   const localAnswer = localAiAnswer(clean);
   if (localAnswer) {
    addExchange(clean, localAnswer);
    setQuestion("");
    return;
   }
   if (!isAllowedSmartBeeQuestion(clean, data)) {
    addExchange(clean, offTopicAiMessage());
    setQuestion("");
    return;
   }
   if (!cloudAvailable || limitReached) {
    addExchange(clean, buildAiAnswer(clean, data) || aiTiredMessage());
    setQuestion("");
    return;
   }
   const response = await fetch(AI_API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ question: clean, hives: data.hives, readings: data.readings, alerts: data.alerts, reminders: data.reminders }),
   });
   if (!response.ok) throw new Error("Pametna čebela ni dosegljiva");
   const payload = await response.json();
   const answer = payload.answer || payload.message || aiTiredMessage();
   const currentUsage = readAiUsage();
   const nextUsage = { ...currentUsage, count: currentUsage.count + 1 };
   saveAiUsage(nextUsage);
   setUsage(nextUsage);
   addExchange(clean, answer);
   setQuestion("");
  } catch {
   addExchange(clean, aiTiredMessage() + " " + buildAiAnswer(clean, data));
   setQuestion("");
  } finally {
   setThinking(false);
  }
 }

 function updateDailyLimit(value) {
  const next = Math.max(1, Number(value) || AI_DEFAULT_DAILY_LIMIT);
  setDailyLimit(next);
  localStorage.setItem(AI_DAILY_LIMIT_KEY, String(next));
 }

 return (
  <section>
   <PageHeader
    eyebrow="Pametna čebela"
    title="Čebelarski pomočnik"
    subtitle="Odgovarja na čebelarska vprašanja in osnovne stvari, kot sta datum in ura. Ostale teme zavrne."
    action={<span className={["ai-status-dot", cloudAvailable && !limitReached ? "online" : "offline"].join(" ")} title={cloudAvailable && !limitReached ? "Pametna čebela pripravljena" : "Lokalni način"} />}
   />
   <div className="ai-hero-card">
    <Bot size={42} />
    <div>
     <strong>{limitReached ? "Pametna čebela počiva" : "Čebelarski pomočnik"}</strong>
     <span>{priorityHive ? "Najprej bi pogledal panj " + priorityHive.name + "." : "Dodaj panj, da lahko prika?em osnovno stanje."}</span>
    </div>
   </div>
   <div className="ai-budget-card">
    <div>
     <strong>Pametni odgovori danes</strong>
     <span>{usage.count} / {dailyLimit} zahtevnih vprašanj</span>
    </div>
    <label>Dnevna omejitev<input type="number" min="1" value={dailyLimit} onChange={(event) => updateDailyLimit(event.target.value)} /></label>
   </div>
   {limitReached ? <p className="warning-text">{aiTiredMessage()}</p> : null}
   <div className="pill-row">
    {suggestions.map((item) => <button type="button" key={item} disabled={thinking} onClick={() => ask(item)}>{item}</button>)}
   </div>
   <div className="chat-card" aria-live="polite">
    {messages.map((message, index) => <div key={index} className={["chat-bubble", "chat-" + message.role].join(" ")}>{message.text}</div>)}
    {thinking ? <div className="chat-bubble chat-assistant ai-thinking"><span /> Pametna čebela razmišlja...</div> : null}
   </div>
   <form className="form-card compact-form" onSubmit={(event) => { event.preventDefault(); ask(); }}>
    <label>Vpra?anje<input value={question} disabled={thinking} onChange={(event) => setQuestion(event.target.value)} placeholder="npr. zakaj Gozd pada s te?o" /></label>
    <button className="primary-button" type="submit" disabled={thinking}><Bot size={20} /> {thinking ? "Pametna čebela razmišlja..." : "Vprašaj pomočnika"}</button>
    <p className="subtle">Če pametni odgovor ni na voljo, Pametna čebela odgovori iz lokalnega čebelarskega znanja.</p>
   </form>
   {priorityHive ? <button className="secondary-button full-button" onClick={() => openHive(priorityHive.id)}>Odpri predlagan panj</button> : null}
  </section>
 );
}

function DevicesPage({ data }) {
 return (
  <section>
   <PageHeader eyebrow="Naprave" title="Povezave" subtitle="Real Bluetooth se pride, zdaj je UI simuliran." />
   <div className="stack">{data.devices.map((device) => <EventCard key={device.id} icon={Radio} title={device.name} subtitle={`${device.type} · ${device.status} · baterija ${device.batteryPct}%`} />)}</div>
  </section>
 );
}

function SettingsPage({ data, setData }) {
 const [importText, setImportText] = useState("");

 function exportJson() {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `pametnipanj-export-${new Date().toISOString().slice(0, 10)}.json`;
  link.click();
  URL.revokeObjectURL(url);
 }

 function importJson() {
  try {
   const parsed = normalizeData(JSON.parse(importText));
   setData(parsed);
   setImportText("");
   alert("Podatki so uvozeni.");
  } catch {
   alert("Uvoz ni uspel. Preveri JSON.");
  }
 }

 function resetDemo() {
  if (!window.confirm("Ponastavim demo podatke Trenutni lokalni podatki bodo zamenjani.")) return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(initialData));
  setData(initialData);
 }

 return (
  <section>
   <PageHeader eyebrow="Nastavitve" title="PametniPanj" subtitle="Offline-first: vsi podatki so v localStorage." />
   <div className="stack">
    <button className="list-row" onClick={exportJson}><Save size={24} /><div><strong>Export JSON</strong><span>Shrani varnostno kopijo.</span></div></button>
    <div className="form-card">
     <label>Import JSON<textarea value={importText} onChange={(event) => setImportText(event.target.value)} placeholder="Prilepi PametniPanj JSON..." /></label>
     <button className="primary-button" onClick={importJson}>Import JSON</button>
    </div>
    <button className="danger-button" onClick={resetDemo}>Reset demo</button>
   </div>
   <div className="card"><h2>Arhiviranje</h2><p className="subtle">Vnosi se ne brisejo trajno. Skrijejo se kot arhivirani in jih lahko kasneje obnovimo.</p></div>
  </section>
 );
}

const BEEKEEPER_STORAGE_KEY = "pametnipanj-cebelar-data";

function defaultBeekeeperData() {
 return { name: "", taxId: "", kmgMid: "", address: "", email: "", phone: "" };
}

function readBeekeeperData() {
 try {
  return { ...defaultBeekeeperData(), ...JSON.parse(localStorage.getItem(BEEKEEPER_STORAGE_KEY) || "{}") };
 } catch {
  return defaultBeekeeperData();
 }
}

function defaultApiary(index = 1) {
 return { id: makeId("APIARY"), registrationNo: "", location: "", colonies: index === 1 ? 1 : 0, reserveColonies: 0 };
}

function importApiariesFromHives(hives = []) {
 const active = hives.filter((hive) => hive.status !== "archived");
 const groups = active.reduce((acc, hive) => {
  const key = hive.locationName || hive.location || hive.locationDescription || "Čebelnjak";
  if (!acc[key]) acc[key] = { id: makeId("APIARY"), registrationNo: "", location: key, colonies: 0, reserveColonies: 0 };
  acc[key].colonies += 1;
  return acc;
 }, {});
 return Object.values(groups).length ? Object.values(groups) : [defaultApiary()];
}

function formatCensusDate(value) {
 const date = new Date(value);
 return new Intl.DateTimeFormat("sl-SI", { day: "numeric", month: "long", year: "numeric" }).format(date);
}

function censusDateOptions(year = new Date().getFullYear()) {
 return [
  { id: "april", label: `15. april ${year}`, value: `${year}-04-15` },
  { id: "october", label: `31. oktober ${year}`, value: `${year}-10-31` },
 ];
}

function nearestCensusDate() {
 const now = new Date();
 const options = censusDateOptions(now.getFullYear());
 const upcoming = options.find((option) => new Date(option.value) >= now);
 return (upcoming || options[1]).value;
}

function validateCensus(beekeeper, apiaries) {
 const checks = [
  { ok: Boolean(beekeeper.name.trim()), text: `Ime in priimek: ${beekeeper.name || "manjka"}` },
  { ok: /^\d{8}$/.test(beekeeper.taxId), text: `Davčna številka: ${beekeeper.taxId || "manjka"}` },
  { ok: Boolean(beekeeper.kmgMid.trim()), text: `KMG-MID: ${beekeeper.kmgMid || "ni vpisana (neobvezno)"}`, optional: true },
  ...apiaries.map((apiary, index) => ({
   ok: Boolean(apiary.registrationNo.trim()) && toNumber(apiary.colonies) > 0,
   text: `Čebelnjak ${index + 1}: ${apiary.registrationNo || "brez številke"} · ${toNumber(apiary.colonies)} družin`,
  })),
 ];
 return checks;
}

function pdfHex(value) {
 const bytes = [0xfe, 0xff];
 for (const char of String(value || "")) {
  const code = char.charCodeAt(0);
  bytes.push((code >> 8) & 255, code & 255);
 }
 return bytes.map((byte) => byte.toString(16).padStart(2, "0")).join("").toUpperCase();
}

function escapePdfText(value) {
 return `<${pdfHex(value)}>`;
}

function buildCensusPdf(report) {
 const lines = [];
 const add = (text, x = 42, yGap = 14, size = 10) => lines.push({ text, x, yGap, size });
 add("REPUBLIKA SLOVENIJA", 190, 18, 10);
 add("Ministrstvo za kmetijstvo, gozdarstvo in prehrano", 130, 12, 9);
 add("Uprava za varno hrano, veterinarstvo in varstvo rastlin - SIRIS", 95, 22, 9);
 add("OBRAZEC ZA SPOROČANJE ŠTEVILA ČEBELJIH DRUŽIN", 85, 28, 13);
 add("v Register čebelnjakov", 215, 16, 10);
 add(`Popisni datum: ${formatCensusDate(report.censusDate)}`, 42, 26, 11);
 add("A. PODATKI O ČEBELARJU", 42, 24, 11);
 add(`Ime in priimek: ${report.beekeeperData.name}`);
 add(`Davčna številka: ${report.beekeeperData.taxId}`);
 add(`KMG-MID: ${report.beekeeperData.kmgMid || "-"}`);
 add(`Naslov: ${report.beekeeperData.address || "-"}`);
 add(`Telefon: ${report.beekeeperData.phone || "-"}`);
 add(`E-mail: ${report.beekeeperData.email || "-"}`);
 add("B. PODATKI O ČEBELNJAKIH", 42, 26, 11);
 add("Zap. št. | Številka čebelnjaka | Naslov/lokacija | Vse družine | Rezervne", 42, 16, 9);
 report.apiaries.forEach((apiary, index) => {
  add(`${index + 1}. | ${apiary.registrationNo} | ${apiary.location || "-"} | ${apiary.colonies} | ${apiary.reserveColonies || 0}`, 42, 14, 9);
 });
 add(`SKUPAJ: ${report.totalColonies} čebeljih družin v ${report.apiaries.length} čebelnjakih`, 42, 20, 10);
 add("C. OPOMBE", 42, 24, 11);
 add(report.notes || "____________________________________________________________", 42, 16, 9);
 add("Izjavljam, da so zgornji podatki točni in resnični.", 42, 28, 10);
 add("Datum: ____________________        Podpis: ____________________", 42, 24, 10);
 add("Obrazec oddajte do 1. decembra na info.sir@gov.si, prek spletne aplikacije ali po pošti na UVHVVR - SIRIS, Dunajska cesta 22, 1000 Ljubljana.", 42, 28, 8);
 add(`Ustvarjeno z aplikacijo PametniPanj · pametnipanj.si · ${new Date().toLocaleDateString("sl-SI")}`, 42, 14, 8);

 let y = 780;
 const content = [
  "q 0.92 0.92 0.92 rg 42 748 36 36 re f Q",
  `BT /F1 12 Tf 52 765 Td ${escapePdfText("RS")} Tj ET`,
  "q 0.85 0.85 0.85 rg 0.96 0.96 0.96 RG 240 390 140 60 re B Q",
  `BT /F1 38 Tf 255 420 Td ${escapePdfText("OSNUTEK")} Tj ET`,
 ];
 for (const line of lines) {
  y -= line.yGap;
  content.push(`BT /F1 ${line.size} Tf ${line.x} ${y} Td ${escapePdfText(line.text)} Tj ET`);
 }
 const stream = content.join("\n");
 const objects = [
  "<< /Type /Catalog /Pages 2 0 R >>",
  "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
  "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>",
  "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
  `<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`,
 ];
 let pdf = "%PDF-1.4\n";
 const offsets = [0];
 objects.forEach((object, index) => {
  offsets.push(pdf.length);
  pdf += `${index + 1} 0 obj\n${object}\nendobj\n`;
 });
 const xref = pdf.length;
 pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
 offsets.slice(1).forEach((offset) => { pdf += `${String(offset).padStart(10, "0")} 00000 n \n`; });
 pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`;
 return new Blob([pdf], { type: "application/pdf" });
}

function downloadCensusPdf(report) {
 const blob = buildCensusPdf(report);
 const url = URL.createObjectURL(blob);
 const safeName = (report.beekeeperData.name || "cebelar").replace(/[^a-z0-9čšžČŠŽ-]+/gi, "-");
 const link = document.createElement("a");
 link.href = url;
 link.download = `Popis-cebeljih-druzin-${report.censusDate}-${safeName}.pdf`;
 link.click();
 URL.revokeObjectURL(url);
}

function PorocanjePage({ data, saveCensusReport }) {
 const [beekeeper, setBeekeeper] = useState(() => readBeekeeperData());
 const [saved, setSaved] = useState(false);
 const [censusDate, setCensusDate] = useState(() => nearestCensusDate());
 const [apiaries, setApiaries] = useState(() => importApiariesFromHives(data.hives));
 const [notes, setNotes] = useState("");
 const status = nextCensusStatus();
 const totalColonies = apiaries.reduce((sum, apiary) => sum + toNumber(apiary.colonies), 0);
 const checks = validateCensus(beekeeper, apiaries);
 const canExport = checks.filter((check) => !check.optional).every((check) => check.ok);

 function updateBeekeeper(field, value) {
  const nextValue = field === "taxId" ? value.replace(/\D/g, "").slice(0, 8) : value;
  setBeekeeper((current) => ({ ...current, [field]: nextValue }));
 }

 function saveBeekeeper() {
  localStorage.setItem(BEEKEEPER_STORAGE_KEY, JSON.stringify(beekeeper));
  setSaved(true);
  setTimeout(() => setSaved(false), 2500);
 }

 function updateApiary(id, field, value) {
  setApiaries((current) => current.map((apiary) => apiary.id === id ? { ...apiary, [field]: field.includes("Colonies") || field === "colonies" ? Math.max(0, Number(value) || 0) : value } : apiary));
 }

 function stepApiary(id, field, delta) {
  setApiaries((current) => current.map((apiary) => apiary.id === id ? { ...apiary, [field]: Math.max(0, toNumber(apiary[field]) + delta) } : apiary));
 }

 function makeReport(pdfGenerated = false) {
  return {
   id: makeId("CR"),
   date: new Date().toISOString(),
   censusDate,
   beekeeperData: beekeeper,
   apiaries,
   notes,
   totalColonies,
   submittedAt: new Date().toISOString(),
   pdfGenerated,
  };
 }

 function exportPdf() {
  const report = makeReport(true);
  saveCensusReport(report);
  downloadCensusPdf(report);
 }

 function sendMail() {
  const subject = encodeURIComponent(`Popis čebeljih družin - ${formatCensusDate(censusDate)}`);
  const body = encodeURIComponent(`Pozdravljeni,\n\nv prilogi oziroma spodaj pošiljam podatke za popis čebeljih družin.\n\nČebelar: ${beekeeper.name}\nDavčna številka: ${beekeeper.taxId}\nPopisni datum: ${formatCensusDate(censusDate)}\nSkupaj: ${totalColonies} čebeljih družin\n\n${apiaries.map((apiary, index) => `${index + 1}. ${apiary.registrationNo} - ${apiary.location || "-"} - ${apiary.colonies} družin, rezervnih ${apiary.reserveColonies || 0}`).join("\n")}\n\nOpombe: ${notes || "-"}\n\nLep pozdrav`);
  window.location.href = `mailto:info.sir@gov.si?subject=${subject}&body=${body}`;
 }

 return (
  <section>
   <PageHeader eyebrow="Zakonsko poročanje" title="Popis čebeljih družin" subtitle="Register čebelnjakov (UVHVVR)" />
   <div className={`legal-status legal-status-${status.tone}`}><strong>{status.title}</strong><span>{status.detail}</span></div>
   <div className="form-card">
    <h2>Podatki čebelarja</h2>
    <label>Ime in priimek *<input value={beekeeper.name} onChange={(event) => updateBeekeeper("name", event.target.value)} placeholder="npr. Janez Novak" /></label>
    <div className="form-grid">
     <label>Davčna številka *<input inputMode="numeric" value={beekeeper.taxId} onChange={(event) => updateBeekeeper("taxId", event.target.value)} placeholder="12345678" /></label>
     <label>KMG-MID številka<input value={beekeeper.kmgMid} onChange={(event) => updateBeekeeper("kmgMid", event.target.value)} placeholder="neobvezno" /></label>
    </div>
    <label>Naslov čebelarja<input value={beekeeper.address} onChange={(event) => updateBeekeeper("address", event.target.value)} placeholder="npr. Glavna ulica 1, 1000 Ljubljana" /></label>
    <div className="form-grid">
     <label>Kontaktni e-mail<input value={beekeeper.email} onChange={(event) => updateBeekeeper("email", event.target.value)} placeholder="za potrditev oddaje" /></label>
     <label>Telefon<input value={beekeeper.phone} onChange={(event) => updateBeekeeper("phone", event.target.value)} placeholder="neobvezno" /></label>
    </div>
    <button className="secondary-button" type="button" onClick={saveBeekeeper}>Shrani podatke čebelarja</button>
    {saved ? <p className="success-text">✓ Podatki shranjeni</p> : null}
   </div>
   <div className="segmented-row">
    {censusDateOptions().map((option) => <button key={option.value} className={censusDate === option.value ? "active" : ""} onClick={() => setCensusDate(option.value)}>{option.label}</button>)}
   </div>
   <div className="card">
    <div className="card-title"><h2>Čebelnjaki in število družin</h2><button className="text-button" type="button" onClick={() => setApiaries(importApiariesFromHives(data.hives))}>🐝 Uvozi iz mojih panjev</button></div>
    <div className="stack">
     {apiaries.map((apiary, index) => (
      <div className="apiary-card" key={apiary.id}>
       <div className="card-title"><h3>Čebelnjak #{index + 1}</h3>{apiaries.length > 1 ? <button className="icon-button small-icon-button" onClick={() => setApiaries((current) => current.filter((item) => item.id !== apiary.id))}><Trash2 size={18} /></button> : null}</div>
       <label>Številka čebelnjaka *<input value={apiary.registrationNo} onChange={(event) => updateApiary(apiary.id, "registrationNo", event.target.value)} placeholder="npr. SI-KR-0123" /></label>
       <label>Naslov / lokacija čebelnjaka<input value={apiary.location} onChange={(event) => updateApiary(apiary.id, "location", event.target.value)} /></label>
       <div className="counter-row"><span>Število čebeljih družin *</span><button onClick={() => stepApiary(apiary.id, "colonies", -1)}>-</button><input value={apiary.colonies} onChange={(event) => updateApiary(apiary.id, "colonies", event.target.value)} /><button onClick={() => stepApiary(apiary.id, "colonies", 1)}>+</button></div>
       <div className="counter-row"><span>Od tega rezervnih</span><button onClick={() => stepApiary(apiary.id, "reserveColonies", -1)}>-</button><input value={apiary.reserveColonies} onChange={(event) => updateApiary(apiary.id, "reserveColonies", event.target.value)} /><button onClick={() => stepApiary(apiary.id, "reserveColonies", 1)}>+</button></div>
      </div>
     ))}
    </div>
    <button className="secondary-button full-button" type="button" onClick={() => setApiaries((current) => [...current, defaultApiary(current.length + 1)])}>+ Dodaj čebelnjak</button>
    <p className="cost-text">Skupaj: {totalColonies} čebeljih družin v {apiaries.length} čebelnjakih</p>
   </div>
   <label>Opombe (neobvezno)<textarea value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="npr. 2 rezervni družini pri Lipovcu, ena brez matice" /></label>
   <div className="validation-card">
    <h2>Preverjanje pred oddajo</h2>
    {checks.map((check) => <p key={check.text} className={check.ok || check.optional ? "success-text" : "warning-text"}>{check.ok ? "✓" : check.optional ? "⚠" : "!"} {check.text}</p>)}
   </div>
   <div className="cloud-actions">
    <button className="primary-button" type="button" disabled={!canExport} onClick={exportPdf}>📄 Izvozi PDF obrazec</button>
    <button className="secondary-button" type="button" onClick={sendMail}>📧 Pošlji na info.sir@gov.si</button>
    <button className="secondary-button" type="button" onClick={() => window.open("https://storitve-mkgp.gov.si/dad/sir_javno/w_apis_census.startup", "_blank", "noopener")}>🌐 Odpri Register čebelnjakov</button>
   </div>
   <div className="card">
    <h2>Pretekla poročila</h2>
    <div className="stack">
     {(data.censusReports || []).length ? data.censusReports.map((report) => (
      <article className="event-card" key={report.id}>
       <ClipboardList size={22} />
       <div>
        <strong>{formatCensusDate(report.censusDate)} · {report.totalColonies} družin</strong>
        <span>{report.apiaries.length} čebelnjakov · {new Date(report.date).toLocaleDateString("sl-SI")}</span>
       </div>
       <button className="secondary-button compact-button" type="button" onClick={() => downloadCensusPdf(report)}>Prenesi PDF</button>
      </article>
     )) : <p className="subtle">Arhiv je še prazen.</p>}
    </div>
   </div>
  </section>
 );
}

function MorePage({ setPage }) {
 const sections = [
  {
   title: "MERJENJE",
   items: [
    ["weather", "Vreme", CloudSun, "Vreme v čebelarskem jeziku"],
    ["feeding", "FeedScale", Utensils, "Zaloga hrane v dnevih"],
    ["pocketScale", "PocketScale", Scale, "Ročno tehtanje satnic"],
   ],
  },
  {
   title: "EVIDENCE",
   items: [
    ["honeyDiary", "Medeni dnevnik", ListPlus, "Evidenca točenja in serij medu"],
    ["products", "Pridelki", Droplets, "Med, propolis, vosek, cvetni prah"],
    ["extraction", "Točenje", Scale, "Beleženje točenja po panju"],
    ["pollen", "Cvetni prah", Droplets, "Evidenca zbiranja cvetnega prahu"],
   ],
  },
  {
   title: "FINANCE",
   items: [
    ["porocanje", "Zakonsko poročanje", Scale, "Popis čebeljih družin · 15.4. in 31.10."],
    ["finance", "Bilanca", Scale, "Prihodki, stroški, dobiček"],
    ["inventory", "Zaloga", ClipboardList, "Sladkor, kozarci, oprema na regalu"],
    ["filling", "Polnjenje", ListPlus, "Kozarci, serije in ostanek medu"],
    ["devices", "Naprave", Radio, "Povezave s senzorji in tehtnicami"],
    ["settings", "Nastavitve", Settings, "Izvoz, uvoz in demo podatki"],
    ["debug", "Tech podatki", Gauge, "Za testiranje senzorjev"],
   ],
  },
 ];

 return (
  <section>
   <PageHeader eyebrow="Več možnosti" title="Orodja" subtitle="Napredni podatki so ločeni, da osnovni pogled ostane preprost." />
   {sections.map((section) => (
    <div className="tool-section" key={section.title}>
     <h2 className="section-title">{section.title}</h2>
     <div className="stack">
      {section.items.map(([id, label, Icon, description]) => (
       <button className="list-row" key={id} onClick={() => setPage(id)}>
        <Icon size={24} />
        <div><strong>{label}</strong><span>{description}</span></div>
        <ChevronRight size={20} />
       </button>
      ))}
     </div>
    </div>
   ))}
  </section>
 );
}

function DebugPage({ data }) {
 return (
  <section>
   <PageHeader eyebrow="Podrobnosti" title="Senzorji in debug" subtitle="Samo za tehnični pregled. Prava strojna oprema še ni povezana." />
   <div className="metric-grid">
    <Metric icon={Radio} label="Povezava" value="simulacija" />
    <Metric icon={BatteryCharging} label="Povp. baterija" value="69%" />
    <Metric icon={Waves} label="Zvok" value="212-286 Hz" />
    <Metric icon={ClipboardList} label="Zapisi" value={data.readings.length} />
   </div>
   <div className="card">
    <div className="card-title"><h2>Zadnji odčitki</h2><span>mock data</span></div>
    <div className="table-wrap">
     <table>
      <thead><tr><th>Panj</th><th>Čas</th><th>kg</th><th>notri</th><th>zunaj</th><th>baterija</th><th>signal</th></tr></thead>
      <tbody>
       {data.readings.map((reading, index) => {
        const inside = (reading.insideTempC ?? reading.tempC ?? "-") + " °C / " + (reading.insideHumidityPct ?? reading.humidityPct ?? "-") + "%";
        const outside = (reading.outsideTempC ?? "-") + " °C / " + (reading.outsideHumidityPct ?? "-") + "%";
        const battery = (reading.batteryPct ?? "-") + "%" + (reading.batteryV ? " " + reading.batteryV + " V" : "");
        return (
         <tr key={reading.hiveId + "-" + reading.time + "-" + index}>
          <td>{getHiveName(data.hives, reading.hiveId)}</td><td>{reading.time}</td><td>{reading.weightKg}</td><td>{inside}</td><td>{outside}</td><td>{battery}</td><td>{reading.rssiDbm ?? "-"} dBm</td>
         </tr>
        );
       })}
      </tbody>
     </table>
    </div>
   </div>
   {data.alerts.length ? (
    <div className="card">
     <div className="card-title"><h2>Opozorila</h2><span>{data.alerts.length}</span></div>
     <div className="stack">{data.alerts.map((alert) => <AlertRow key={alert.id} alert={alert} hives={data.hives} />)}</div>
    </div>
   ) : null}
   <div className="code-card">
    <pre>{`Reading {
  hiveId, time, weightKg, insideTempC, insideHumidityPct, outsideTempC, outsideHumidityPct, batteryPct, rssiDbm
}`}</pre>
   </div>
  </section>
 );
}

function ReminderRow({ reminder, hives }) {
 return (
  <div className={`reminder reminder-${reminder.priority}`}>
   <CalendarDays size={22} />
   <div>
    <strong>{reminder.title}</strong>
    <span>{getHiveName(hives, reminder.hiveId)} · {reminder.date} · {reminder.time}</span>
   </div>
  </div>
 );
}

function AlertRow({ alert, hives }) {
 return (
  <article className={`reminder reminder-${alert.severity === "danger" ? "danger" : "warn"}`}>
   <BatteryCharging size={22} />
   <div>
    <strong>{alert.title}</strong>
    <span>{getHiveName(hives, alert.hiveId)} · {alert.message}</span>
   </div>
  </article>
 );
}

function NoteCard({ note, hives }) {
 return (
  <article className="note-card">
   <Mic size={22} />
   <div>
    <strong>{note.title}</strong>
    <span>{getHiveName(hives, note.hiveId)} · {note.date}{note.duration ? ` · ${note.duration}` : ""}</span>
    <p>{note.text}</p>
   </div>
  </article>
 );
}

function EventCard({ icon: Icon, title, subtitle }) {
 return (
  <article className="event-card">
   <Icon size={24} />
   <div>
    <strong>{title}</strong>
    <span>{subtitle}</span>
   </div>
  </article>
 );
}

function BackendPanel({ mode, setMode, session, auth, setAuth, authMessage, cloudStatus, onSignIn, onSignUp, onSignOut, onSyncDemo }) {
 return (
  <div className="backend-panel">
   <div className="mode-row">
    <button className={mode === "demo" ? "active" : ""} onClick={() => setMode("demo")} type="button">Demo</button>
    <button className={mode === "cloud" ? "active" : ""} onClick={() => setMode("cloud")} type="button">Supabase</button>
   </div>
   {mode === "demo" ? (
    <p>Lokalni demo način. Podatki ostanejo v tem brskalniku.</p>
   ) : !supabaseConfigured ? (
    <p>Dodaj `VITE_SUPABASE_URL` in `VITE_SUPABASE_ANON_KEY` v `.env`, nato ponovno zaženi aplikacijo.</p>
   ) : session ? (
    <div className="cloud-row">
     <p>Prijavljen: <strong>{session.user.email}</strong><br />{cloudStatus}</p>
     <div className="cloud-actions">
      <button className="secondary-button" onClick={onSyncDemo} type="button">Prenesi demo v Supabase</button>
      <button className="danger-button" onClick={onSignOut} type="button">Odjava</button>
     </div>
    </div>
   ) : (
    <form className="auth-form" onSubmit={onSignIn}>
     <label>Email<input value={auth.email} onChange={(event) => setAuth((current) => ({ ...current, email: event.target.value }))} type="email" placeholder="cebelar@example.com" /></label>
     <label>Geslo<input value={auth.password} onChange={(event) => setAuth((current) => ({ ...current, password: event.target.value }))} type="password" placeholder="vsaj 6 znakov" /></label>
     <div className="cloud-actions">
      <button className="primary-button" type="submit">Prijava</button>
      <button className="secondary-button" onClick={onSignUp} type="button">Registracija</button>
     </div>
     {authMessage ? <p>{authMessage}</p> : null}
    </form>
   )}
  </div>
 );
}

class AppErrorBoundary extends React.Component {
 constructor(props) {
  super(props);
  this.state = { hasError: false };
 }

 static getDerivedStateFromError() {
  return { hasError: true };
 }

 resetApp = () => {
  try {
   Object.keys(localStorage || {}).forEach((key) => {
    if (/beecare|pametnipanj|bee-care/i.test(key)) localStorage.removeItem(key);
   });
  } catch {}
  window.location.href = `${window.location.origin}${window.location.pathname}?fresh=1`;
 };

 render() {
  if (!this.state.hasError) return this.props.children;
  return (
   <div className="app-shell">
    <main className="app-main">
     <section className="form-card">
      <h1>PametniPanj potrebuje osvežitev</h1>
      <p>Nek podatek je nepopoln ali star. Osveži aplikacijo, podatke pa lahko po potrebi vneseš znova.</p>
      <button className="primary-button" type="button" onClick={this.resetApp}>Osveži aplikacijo</button>
     </section>
    </main>
   </div>
  );
 }
}

function App() {
 const mode = "demo";
 const [data, setData] = usePersistedData(true);
 const [session, setSession] = useState(() => {
  try {
   const stored = localStorage.getItem(SESSION_KEY);
   return stored ? JSON.parse(stored) : null;
  } catch {
   return null;
  }
 });
 const [auth, setAuth] = useState({ email: "", password: "" });
 const [authMessage, setAuthMessage] = useState("");
 const [cloudStatus, setCloudStatus] = useState("Pripravljen za sinhronizacijo.");
 const [page, setPage] = useState("dashboard");
 const [selectedHiveId, setSelectedHiveId] = useState(data.hives[0].id || "");
 const [editingHiveId, setEditingHiveId] = useState("");
 const [inventoryShelf, setInventoryShelf] = useState("");
 const [inventoryDraft, setInventoryDraft] = useState(null);
 const [newHiveDraft, setNewHiveDraft] = useState(null);

 function setMode() {}

 useEffect(() => {
  if (!session) {
   localStorage.removeItem(SESSION_KEY);
   return;
  }
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
 }, [session]);

 useEffect(() => {
  if (mode !== "cloud" || !session || !supabaseConfigured) return;
  let cancelled = false;
  setCloudStatus("Nalaganje iz Supabase...");
  fetchCloudData(session)
   .then((cloudData) => {
    if (cancelled) return;
    setData(normalizeData(cloudData, false));
    setCloudStatus("Podatki so naloženi iz Supabase.");
   })
   .catch((error) => {
    if (cancelled) return;
    setCloudStatus(`Napaka: ${error.message}`);
   });
  return () => {
   cancelled = true;
  };
 }, [mode, session]);

 function commitData(updater) {
  setData((current) => {
   const nextData = typeof updater === "function" ? updater(current) : updater;
   if (mode === "cloud" && session && supabaseConfigured) {
    setCloudStatus("Shranjevanje v Supabase...");
    window.setTimeout(() => {
     replaceCloudData(session, nextData)
      .then(() => setCloudStatus("Shranjeno v Supabase."))
      .catch((error) => setCloudStatus(`Napaka pri shranjevanju: ${error.message}`));
    }, 0);
   }
   return nextData;
  });
 }

 async function handleSignIn(event) {
  event.preventDefault();
  setAuthMessage("Prijava...");
  try {
   const nextSession = await signIn(auth.email, auth.password);
   setSession(nextSession);
   setAuthMessage("");
   setMode("cloud");
  } catch (error) {
   setAuthMessage(error.message);
  }
 }

 async function handleSignUp() {
  setAuthMessage("Registracija...");
  try {
   const result = await signUp(auth.email, auth.password);
   if (result.access_token) {
    setSession(result);
    setAuthMessage("");
   } else {
    setAuthMessage("Račun je ustvarjen. Če je vklopljena potrditev e-pošte, najprej potrdi email.");
   }
   setMode("cloud");
  } catch (error) {
   setAuthMessage(error.message);
  }
 }

 function handleSignOut() {
  setSession(null);
  setCloudStatus("Odjavljen.");
  setMode("demo");
 }

 async function handleSyncDemo() {
  if (!session) return;
  setCloudStatus("Prenašam trenutne podatke v Supabase...");
  try {
   await replaceCloudData(session, readLocalDemoData());
   setData(readLocalDemoData());
   setCloudStatus("Demo podatki so preneseni v Supabase.");
  } catch (error) {
   setCloudStatus(`Prenos ni uspel: ${error.message}`);
  }
 }

 useEffect(() => {
  if (!data.hives.some((hive) => hive.id === selectedHiveId)) {
   setSelectedHiveId(data.hives[0].id || "");
   if (!data.hives.length) setPage("create");
  }
 }, [data.hives, selectedHiveId]);

 function openHive(hiveId) {
  setSelectedHiveId(hiveId);
  setPage("hive");
  window.scrollTo({ top: 0, behavior: "smooth" });
 }

 function saveHive(hive) {
  commitData((current) => {
   const setupPhotoUrl = hive.setupPhotoUrl || "";
   const cleanHive = { ...hive };
   delete cleanHive.setupPhotoUrl;
   const oldId = editingHiveId || hive.id;
   const exists = current.hives.some((item) => item.id === cleanHive.id || item.id === editingHiveId);
   const nextHives = exists
    ? current.hives.map((item) => item.id === editingHiveId || item.id === cleanHive.id ? cleanHive : item)
    : [cleanHive, ...current.hives];
   const setupPhoto = setupPhotoUrl && !exists ? {
    id: makeId("HP"),
    hiveId: cleanHive.id,
    date: todayLabel(),
    caption: "Sprednja stran panja",
    url: setupPhotoUrl,
    sizeMb: 0,
    aiAnalysis: "",
    createdAt: new Date().toISOString(),
   } : null;

   return {
    ...current,
    hives: nextHives,
    notes: current.notes.map((item) => item.hiveId === oldId ? { ...item, hiveId: cleanHive.id } : item),
    voiceActions: (current.voiceActions || []).map((item) => item.hiveId === oldId ? { ...item, hiveId: cleanHive.id } : item),
    feedingEvents: current.feedingEvents.map((item) => item.hiveId === oldId ? { ...item, hiveId: cleanHive.id } : item),
    extractionEvents: current.extractionEvents.map((item) => item.hiveId === oldId ? { ...item, hiveId: cleanHive.id } : item),
    honeySales: (current.honeySales || []).map((item) => item.hiveId === oldId ? { ...item, hiveId: cleanHive.id } : item),
    financeEvents: (current.financeEvents || []).map((item) => item.hiveId === oldId ? { ...item, hiveId: cleanHive.id } : item),
    healthRecords: (current.healthRecords || []).map((item) => item.hiveId === oldId ? { ...item, hiveId: cleanHive.id } : item),
    hivePhotos: setupPhoto ? [setupPhoto, ...(current.hivePhotos || []).map((item) => item.hiveId === oldId ? { ...item, hiveId: cleanHive.id } : item)] : (current.hivePhotos || []).map((item) => item.hiveId === oldId ? { ...item, hiveId: cleanHive.id } : item),
    productEvents: (current.productEvents || []).map((item) => item.hiveId === oldId ? { ...item, hiveId: cleanHive.id } : item),
    reminders: current.reminders.map((item) => item.hiveId === oldId ? { ...item, hiveId: cleanHive.id } : item),
    qrItems: upsertQr(current.qrItems, {
     id: cleanHive.qrCode,
     type: "Panj",
     linkedHiveId: cleanHive.id,
     linkedTo: cleanHive.name,
     lastScan: todayLabel(),
     status: "Aktivno",
     createdAt: new Date().toISOString(),
    }),
   };
  });
  setSelectedHiveId(hive.id);
  setEditingHiveId("");
  setPage("hive");
 }

 function startEdit(hiveId) {
  setEditingHiveId(hiveId);
  setPage("edit");
 }

 function deleteHive(hiveId) {
  const hive = getHive(data.hives, hiveId);
  if (!window.confirm(`Skrijemo panj ${hive.name} Lahko ga obnovite kasneje.`)) return;
  commitData((current) => ({
   ...current,
   hives: current.hives.map((item) => item.id === hiveId ? { ...item, status: "archived", statusText: "Arhiv", archivedAt: new Date().toISOString(), updatedAt: new Date().toISOString() } : item),
   events: (current.events || []).map((item) => item.hiveId === hiveId ? { ...item, status: "archived", updatedAt: new Date().toISOString() } : item),
  }));
  setPage("dashboard");
 }

 function addNote(input) {
  const note = {
   id: makeId("N"),
   hiveId: input.hiveId,
   type: input.type || "manual",
   title: input.title.trim() || "Nova nota",
   text: input.text.trim() || "Brez opombe",
   date: todayLabel(),
   duration: input.duration || null,
   createdAt: new Date().toISOString(),
  };
  commitData((current) => ({ ...current, notes: [note, ...current.notes] }));
  setSelectedHiveId(note.hiveId);
  setPage("hive");
 }

 function addNoteForHive(hiveId) {
  setSelectedHiveId(hiveId);
  setPage("voice");
 }

 function openInventoryShelf(shelf, direction = "add", draft = {}) {
  setInventoryShelf(shelf);
  setInventoryDraft({ ...draft, shelf, direction });
  setPage("inventory");
  window.scrollTo({ top: 0, behavior: "smooth" });
 }

 function startHiveWizard(qrCode = "", draft = {}) {
  setEditingHiveId("");
  setNewHiveDraft(qrCode ? { ...draft, qrCode: qrCode.trim().toUpperCase() } : draft || null);
  setPage("create");
  window.scrollTo({ top: 0, behavior: "smooth" });
 }

 function saveVoiceAction(input) {
  const consistency = compareActionWithSensors(data, input);
  const voiceAction = {
   id: makeId("VA"),
   hiveId: input.hiveId,
   type: input.type || "general_note",
   transcript: input.transcript || "",
   fields: input.fields || {},
   amount: input.amount ? toNumber(input.amount, 0) : null,
   unit: input.unit || "",
   note: input.note.trim() || buildActionNote(input.type, input.amount, input.unit, input.transcript),
   date: todayLabel(),
   consistency: consistency.message,
   consistencyStatus: consistency.status,
   createdAt: new Date().toISOString(),
  };

  const note = {
   id: makeId("N"),
   hiveId: voiceAction.hiveId,
   type: "voice_action",
   title: actionTypeLabel(voiceAction.type),
   text: `${voiceAction.note} Izvirnik: ${voiceAction.transcript}`,
   date: voiceAction.date,
   duration: null,
   createdAt: voiceAction.createdAt,
  };

  commitData((current) => {
   let next = {
    ...current,
    voiceActions: [voiceAction, ...(current.voiceActions || [])],
    notes: [note, ...current.notes],
    events: [createEvent({ hiveId: voiceAction.hiveId, type: voiceAction.type, source: "voice", originalText: voiceAction.transcript, structuredData: voiceAction }), ...(current.events || [])],
   };

   if (voiceAction.type === "feeding") {
    const amountLiters = toNumber(voiceAction.amount, 0);
    const feedingEvent = {
     id: makeId("F"),
     hiveId: voiceAction.hiveId,
     date: voiceAction.date,
     amountLiters,
     feedType: /sirup/i.test(voiceAction.transcript) ? "sirup" : "hrana",
     note: voiceAction.note,
     createdAt: voiceAction.createdAt,
    };
    next = {
     ...next,
     feedingEvents: [feedingEvent, ...next.feedingEvents],
     hives: next.hives.map((hive) => hive.id === voiceAction.hiveId ? {
      ...hive,
      foodLiters: Math.round((toNumber(hive.foodLiters) + amountLiters) * 10) / 10,
      foodDays: Math.max(1, Math.round(toNumber(hive.foodDays) + amountLiters * 2)),
      lastSeen: "pravkar",
     } : hive),
    };
   }

   if (voiceAction.type === "honey_extraction") {
    const netKg = toNumber(voiceAction.amount, 0);
    const extractionEvent = {
     id: makeId("E"),
     hiveId: voiceAction.hiveId,
     date: voiceAction.date,
     honeyType: "med",
     frames: 0,
     grossKg: netKg,
     emptyKg: 0,
     netKg,
     createdAt: voiceAction.createdAt,
    };
    next = {
     ...next,
     extractionEvents: [extractionEvent, ...next.extractionEvents],
     hives: next.hives.map((hive) => hive.id === voiceAction.hiveId ? {
      ...hive,
      weightKg: Math.max(0, Math.round((toNumber(hive.weightKg) - netKg) * 10) / 10),
      weeklyDeltaKg: Math.round((toNumber(hive.weeklyDeltaKg) - netKg) * 10) / 10,
      lastSeen: "pravkar",
     } : hive),
    };
   }

   if (voiceAction.type === "pollen_harvest") {
    const pollenEvent = { id: makeId("P"), hiveId: voiceAction.hiveId, amountKg: toNumber(voiceAction.amount, 0), source: "voice", date: voiceAction.date, notes: voiceAction.note, status: "confirmed", createdAt: voiceAction.createdAt, updatedAt: voiceAction.createdAt };
    next = { ...next, pollenEvents: [pollenEvent, ...next.pollenEvents] };
   }

   if (voiceAction.type === "inventory_update") {
    next = applyInventoryChange(next, {
     name: voiceAction.fields.item === "sugar" ? "Sladkor" : voiceAction.fields.item === "jars" ? "Kozarci" : voiceAction.fields.item === "lids" ? "Pokrovčki" : "Zaloga",
     quantity: toNumber(voiceAction.amount, 0),
     unit: voiceAction.unit || "kos",
     shelf: "Ni določeno",
     direction: "add",
     source: "voice",
    });
   }

   return next;
  });
  setSelectedHiveId(voiceAction.hiveId);
  setPage("hive");
 }

 function saveParsedEvent(input, source = "manual") {
  const action = {
   ...input,
   hiveId: input.hiveId || "",
   transcript: input.transcript || input.originalText || "",
   date: input.date || todayLabel(),
   note: input.note || buildActionNote(input.type, input.amount, input.unit, input.transcript || ""),
  };
  const genericEvent = createEvent({
   hiveId: action.hiveId,
   type: action.type || "general_note",
   source,
   originalText: action.transcript,
   structuredData: action,
  });
  genericEvent.date = action.date || genericEvent.date;

  commitData((current) => {
   let next = {
    ...current,
    events: [genericEvent, ...(current.events || [])],
    reminders: [createReminderFromEvent(action, genericEvent), ...current.reminders],
   };
   if (action.type === "pollen_harvest") {
    const pollen = { id: makeId("P"), hiveId: action.hiveId, amountKg: toNumber(action.amount, 0), source, date: action.date, notes: action.note, status: "confirmed", createdAt: genericEvent.createdAt, updatedAt: genericEvent.updatedAt };
    next = { ...next, pollenEvents: [pollen, ...next.pollenEvents] };
   } else if (action.type === "inventory_update") {
    const name = action.fields.item === "sugar" ? "Sladkor" : action.fields.item === "jars" ? "Kozarci" : action.fields.item === "lids" ? "Pokrovčki" : "Zaloga";
    next = applyInventoryChange(next, { name, quantity: toNumber(action.amount, 0), unit: action.unit || "kos", shelf: "Ni določeno", direction: "add", source });
   } else {
    const note = { id: makeId("N"), hiveId: action.hiveId || current.hives[0].id || "", type: source, title: actionTypeLabel(action.type), text: action.note, date: action.date, duration: null, createdAt: genericEvent.createdAt };
    next = { ...next, notes: [note, ...next.notes] };
   }
   return next;
  });
 }

 function deleteCalendarEntry(kind, id) {
  if (!window.confirm("Izbrišem ta koledarski vnos")) return;
  commitData((current) => {
   const now = new Date().toISOString();
   const reminder = current.reminders.find((item) => item.id === id);
   return {
    ...current,
    reminders: kind === "reminder" ? current.reminders.filter((item) => item.id !== id) : current.reminders,
    events: (current.events || []).map((item) => {
     const shouldArchive = kind === "event" ? item.id === id : reminder.eventId === item.id;
     return shouldArchive ? { ...item, status: "archived", updatedAt: now } : item;
    }),
   };
  });
 }


 function addPollenEvent(input) {
  const now = new Date().toISOString();
  const event = { id: makeId("P"), hiveId: input.hiveId, amountKg: toNumber(input.amountKg, 0), source: "manual", date: todayLabel(), notes: input.notes || "Ročni vnos", status: "confirmed", createdAt: now, updatedAt: now };
  commitData((current) => ({
   ...current,
   pollenEvents: [event, ...current.pollenEvents],
   events: [createEvent({ hiveId: event.hiveId, type: "pollen_harvest", source: "manual", structuredData: event, originalText: event.notes }), ...(current.events || [])],
  }));
 }

 function addProductEvent(input) {
  const now = new Date().toISOString();
  const event = {
   id: makeId("PR"),
   hiveId: input.hiveId,
   productType: input.productType,
   quantity: roundOne(input.quantity),
   unit: input.unit || PRODUCT_UNITS[input.productType] || "kg",
   pricePerUnit: toNumber(input.pricePerUnit, 0),
   date: todayLabel(),
   note: input.note || "",
   createdAt: now,
  };
  const income = roundOne(event.quantity * event.pricePerUnit);
  const financeEvent = {
   id: makeId("FIN"),
   hiveId: event.hiveId,
   type: "income",
   category: event.productType,
   description: `${event.quantity} ${event.unit}`,
   amountEur: income,
   date: event.date,
   createdAt: now,
  };
  commitData((current) => ({
   ...current,
   productEvents: [event, ...(current.productEvents || [])],
   financeEvents: income > 0 ? [financeEvent, ...(current.financeEvents || [])] : current.financeEvents,
   events: [createEvent({ hiveId: event.hiveId, type: "product_harvest", source: "manual", structuredData: event, originalText: `${event.productType} ${event.quantity} ${event.unit}` }), ...(current.events || [])],
  }));
 }

 function addInventoryTransaction(input) {
  commitData((current) => applyInventoryChange(current, { ...input, source: "manual" }));
 }

 function applyInventoryChange(current, input) {
  const quantity = toNumber(input.quantity, 0);
  const signed = input.direction === "remove" ? -quantity : quantity;
  const existing = current.inventoryItems.find((item) => normalizeSl(item.name) === normalizeSl(input.name) && normalizeSl(item.shelf) === normalizeSl(input.shelf));
  const now = new Date().toISOString();
  const item = existing || { id: makeId("INV"), name: input.name, category: input.category || "custom", quantity: 0, unit: input.unit, shelf: input.shelf, lowStockAt: 0, status: "confirmed", createdAt: now, updatedAt: now };
  const nextItem = { ...item, category: input.category || item.category, brand: input.brand || item.brand, jarSize: input.jarSize || item.jarSize, condition: input.condition || item.condition, expiryDate: input.expiryDate || item.expiryDate, quantity: Math.max(0, roundOne(toNumber(item.quantity) + signed)), unit: input.unit, shelf: input.shelf || item.shelf, updatedAt: now };
  const transaction = { id: makeId("IT"), itemId: nextItem.id, category: input.category || nextItem.category, quantity: signed, unit: input.unit, source: input.source || "manual", status: "confirmed", createdAt: now, updatedAt: now };
  return {
   ...current,
   inventoryItems: existing ? current.inventoryItems.map((entry) => entry.id === nextItem.id ? nextItem : entry) : [nextItem, ...current.inventoryItems],
   inventoryTransactions: [transaction, ...current.inventoryTransactions],
   events: [createEvent({ type: "inventory_update", source: input.source || "manual", structuredData: transaction, originalText: `${input.name} ${signed} ${input.unit}` }), ...(current.events || [])],
  };
 }

 function saveScaleMeasurement(input) {
  const measurement = { id: makeId("SM"), ...input, source: "bluetooth_scale", status: "confirmed", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
  commitData((current) => ({ ...current, scaleMeasurements: [measurement, ...current.scaleMeasurements] }));
 }

 function addFillingEvent(input) {
  const event = { id: makeId("JF"), ...input, date: todayLabel(), status: "confirmed", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
  commitData((current) => ({
   ...current,
   jarFillingEvents: [event, ...current.jarFillingEvents],
   honeyBatches: current.honeyBatches.map((batch) => batch.id === event.batchId ? { ...batch, remainingKg: Math.max(0, roundOne(event.remainingKg)), updatedAt: event.updatedAt } : batch),
   events: [createEvent({ type: "jar_filling", source: "manual", structuredData: event }), ...(current.events || [])],
  }));
 }

 function addFeedingEvent(input) {
  const amountLiters = toNumber(input.amountLiters, 0);
  const event = {
   id: makeId("F"),
   hiveId: input.hiveId,
   date: todayLabel(),
   amountLiters,
   feedType: input.feedType.trim() || "sirup",
   note: input.note.trim() || "Ročni vnos",
   createdAt: new Date().toISOString(),
  };
  commitData((current) => ({
   ...current,
   feedingEvents: [event, ...current.feedingEvents],
   hives: current.hives.map((hive) => hive.id === event.hiveId ? {
    ...hive,
    foodLiters: Math.round((toNumber(hive.foodLiters) + amountLiters) * 10) / 10,
    foodDays: Math.max(1, Math.round(toNumber(hive.foodDays) + amountLiters * 2)),
    lastSeen: "pravkar",
   } : hive),
  }));
 }

 function addExtractionEvent(input) {
  const grossKg = toNumber(input.grossKg, 0);
  const emptyKg = toNumber(input.emptyKg, 0);
  const netKg = Math.max(0, Math.round((grossKg - emptyKg) * 10) / 10);
  const event = {
   id: makeId("E"),
   hiveId: input.hiveId,
   date: todayLabel(),
   honeyType: input.honeyType.trim() || "med",
   frames: Math.round(toNumber(input.frames, 0)),
   grossKg,
   emptyKg,
   netKg,
   createdAt: new Date().toISOString(),
  };
  commitData((current) => ({
   ...current,
   extractionEvents: [event, ...current.extractionEvents],
   hives: current.hives.map((hive) => hive.id === event.hiveId ? {
    ...hive,
    weightKg: Math.max(0, Math.round((toNumber(hive.weightKg) - netKg) * 10) / 10),
    weeklyDeltaKg: Math.round((toNumber(hive.weeklyDeltaKg) - netKg) * 10) / 10,
    lastSeen: "pravkar",
   } : hive),
  }));
 }

 function addFinanceEvent(input) {
  const event = {
   id: makeId("FIN"),
   hiveId: input.hiveId,
   type: input.type,
   category: input.category.trim() || (input.type === "income" ? "Prihodek" : "Strošek"),
   description: input.description.trim() || "Ročni vnos",
   amountEur: roundOne(input.amountEur),
   date: todayLabel(),
   createdAt: new Date().toISOString(),
  };
  commitData((current) => ({
   ...current,
   financeEvents: [event, ...(current.financeEvents || [])],
   events: [createEvent({ hiveId: event.hiveId, type: "finance", source: "manual", structuredData: event, originalText: `${event.category} ${event.amountEur} EUR` }), ...(current.events || [])],
  }));
 }

 function addHoneySale(input) {
  const sale = {
   id: makeId("HS"),
   hiveId: input.hiveId,
   batchId: input.batchId || "",
   date: todayLabel(),
   honeyType: input.honeyType.trim() || "med",
   amountKg: roundOne(input.amountKg),
   pricePerKg: roundOne(input.pricePerKg),
   customer: input.customer.trim() || "",
   qrCode: input.qrCode.trim() || "",
   createdAt: new Date().toISOString(),
  };
  const financeEvent = {
   id: makeId("FIN"),
   hiveId: sale.hiveId,
   type: "income",
   category: "Prodan med",
   description: `${sale.honeyType} ${sale.amountKg} kg`,
   amountEur: roundOne(sale.amountKg * sale.pricePerKg),
   date: sale.date,
   createdAt: sale.createdAt,
  };
  commitData((current) => ({
   ...current,
   honeySales: [sale, ...(current.honeySales || [])],
   financeEvents: [financeEvent, ...(current.financeEvents || [])],
   events: [createEvent({ hiveId: sale.hiveId, type: "honey_sale", source: "manual", structuredData: sale, originalText: financeEvent.description }), ...(current.events || [])],
  }));
 }

 function saveHealthRecord(input) {
  const record = {
   id: input.id || makeId("HL"),
   hiveId: input.hiveId,
   varroaLevel: Math.max(0, Math.min(5, Math.round(toNumber(input.varroaLevel, 0)))),
   inspectionDate: input.inspectionDate || todayLabel(),
   treatment: input.treatment || "Brez zdravljenja",
   queenStatus: input.queenStatus || "Neznano",
   queenLastSeen: input.queenLastSeen || "",
   queenYear: input.queenYear || "",
   diseases: input.diseases || [],
   notes: input.notes || "",
   neighborAlert: input.neighborAlert || { sent: false },
   createdAt: new Date().toISOString(),
  };
  const alert = record.varroaLevel >= 3 && record.neighborAlert.sent ? { id: makeId("NA"), hiveId: record.hiveId, radiusKm: record.neighborAlert.radiusKm || 10, area: record.neighborAlert.area || "Splošno območje", message: "Čebelar v vaši okolici poroča o povišani stopnji varoze. Priporočamo preventivni pregled.", anonymous: true, createdAt: record.createdAt }
   : null;
  commitData((current) => ({
   ...current,
   healthRecords: [record, ...(current.healthRecords || [])],
   neighborAlerts: alert ? [alert, ...(current.neighborAlerts || [])] : current.neighborAlerts,
   events: [createEvent({ hiveId: record.hiveId, type: "health_check", source: "manual", structuredData: record, originalText: record.notes }), ...(current.events || [])],
  }));
 }

 function addHivePhoto(input) {
  const photo = {
   id: makeId("HP"),
   hiveId: input.hiveId,
   date: todayLabel(),
   caption: input.caption || "",
   url: input.url || "",
   sizeMb: input.sizeMb || 0,
   aiAnalysis: input.aiAnalysis || "",
   createdAt: new Date().toISOString(),
  };
  commitData((current) => ({
   ...current,
   hivePhotos: [photo, ...(current.hivePhotos || [])],
   events: [createEvent({ hiveId: photo.hiveId, type: "hive_photo", source: "manual", structuredData: photo, originalText: photo.caption }), ...(current.events || [])],
  }));
 }

 function deleteHivePhoto(photoId) {
  commitData((current) => ({ ...current, hivePhotos: (current.hivePhotos || []).filter((photo) => photo.id !== photoId) }));
 }

 function saveCensusReport(report) {
  commitData((current) => ({
   ...current,
   censusReports: [report, ...(current.censusReports || []).filter((item) => item.id !== report.id)],
  }));
 }

 const screens = {
  dashboard: <Dashboard data={data} openHive={openHive} goTo={setPage} />,
  hive: <HiveDetail data={data} hiveId={selectedHiveId} setPage={setPage} startEdit={startEdit} deleteHive={deleteHive} addNoteForHive={addNoteForHive} saveHealthRecord={saveHealthRecord} addHivePhoto={addHivePhoto} deleteHivePhoto={deleteHivePhoto} />,
  calendar: <CalendarPage data={data} saveParsedEvent={saveParsedEvent} deleteCalendarEntry={deleteCalendarEntry} setPage={setPage} />,
    qr: <QRPage data={data} setData={commitData} openHive={openHive} openInventoryShelf={openInventoryShelf} startHiveWizard={startHiveWizard} />,
    ai: <AiAssistantPage data={data} openHive={openHive} setPage={setPage} />,
  voice: <VoicePage data={data} saveVoiceAction={saveVoiceAction} initialHiveId={selectedHiveId} />,
  more: <MorePage setPage={setPage} />,
  weather: <WeatherPage data={data} openHive={openHive} />,
    create: <HiveFormPage mode="create" hives={data.hives} initialDraft={newHiveDraft} saveHive={saveHive} cancel={() => setPage("dashboard")} />,
  edit: <HiveFormPage mode="edit" hives={data.hives} initialHive={getHive(data.hives, editingHiveId)} saveHive={saveHive} cancel={() => setPage("hive")} />,
  feeding: <FeedingPage data={data} addFeedingEvent={addFeedingEvent} />,
  extraction: <ExtractionPage data={data} addExtractionEvent={addExtractionEvent} />,
  pocketScale: <PocketScalePage data={data} saveScaleMeasurement={saveScaleMeasurement} saveParsedEvent={saveParsedEvent} />,
  pollen: <PollenPage data={data} addPollenEvent={addPollenEvent} />,
  products: <ProductsPage data={data} addProductEvent={addProductEvent} />,
  inventory: <InventoryPage data={data} addInventoryTransaction={addInventoryTransaction} initialShelf={inventoryShelf} initialDraft={inventoryDraft} />,
  filling: <FillingPage data={data} addFillingEvent={addFillingEvent} />,
  honeyDiary: <HoneyDiaryPage data={data} addHoneySale={addHoneySale} />,
  finance: <FinancePage data={data} addFinanceEvent={addFinanceEvent} />,
  porocanje: <PorocanjePage data={data} saveCensusReport={saveCensusReport} />,
  devices: <DevicesPage data={data} />,
  settings: <SettingsPage data={data} setData={setData} />,
  debug: <DebugPage data={data} />,
 };

 return (
  <div className="app-shell">
   <main className="app-main">{screens[page]}</main>
   <nav className="bottom-nav" aria-label="Glavna navigacija">
    {nav.map(({ id, label, icon: Icon }) => (
     <button key={id} className={page === id ? "active" : ""} onClick={() => setPage(id)}>
      <Icon size={22} />
      <span>{label}</span>
     </button>
    ))}
   </nav>
  </div>
 );
}

createRoot(document.getElementById("root")).render(
 <AppErrorBoundary>
  <App />
 </AppErrorBoundary>
);
