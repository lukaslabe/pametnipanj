const OPENAI_API_URL = "https://api.openai.com/v1/responses";

export async function handler(event) {
  if (event.httpMethod !== "POST") {
    return json(405, { error: "method_not_allowed" });
  }

  try {
    const body = JSON.parse(event.body || "{}");
    const question = String(body.question || "").trim();
    if (!question) return json(400, { error: "missing_question" });

    const generalAnswer = generalAssistantAnswer(question);
    if (generalAnswer) return json(200, { answer: generalAnswer, mode: "local" });

    if (!isAllowedSmartBeeQuestion(question, body)) {
      return json(200, { answer: offTopicAiMessage(), mode: "blocked" });
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return json(503, {
        error: "ai_not_configured",
        message: "Pametna čebela je izmučena in trenutno ne more odgovarjati na zahtevna vprašanja.",
      });
    }

    const hiveContext = {
      hives: compactRows(body.hives, ["id", "name", "status", "statusText", "locationName", "foodDays", "weightKg", "weeklyDeltaKg"]),
      alerts: compactRows(body.alerts, ["hiveId", "title", "message", "severity"]),
      reminders: compactRows(body.reminders, ["hiveId", "title", "date", "type"]),
      readings: compactRows(body.readings, ["hiveId", "time", "weightKg", "tempC", "humidityPct"]).slice(-12),
    };

    const response = await fetch(OPENAI_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + apiKey,
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || "gpt-4.1-mini",
        max_output_tokens: 450,
        input: [
          {
            role: "system",
            content:
              "Ti si Pametna čebela v aplikaciji PametniPanj. Odgovarjaj v slovenščini, kratko, praktično in za starejše čebelarje. Odgovarjaj samo na teme o čebelarstvu, panjih, medu, vremenu za pregled, opomnikih, zalogi, senzorjih in osnovna vprašanja o datumu ali uri. Če uporabnik vpraša o drugi temi, ga prijazno usmeri nazaj na čebelarstvo. Ne izmišljuj si podatkov. Če ni dovolj podatkov, povej kaj naj čebelar fizično preveri. Ne dajaj nevarnih veterinarskih navodil brez opozorila, naj se uporabnik drži lokalnih pravil in registriranih pripravkov.",
          },
          {
            role: "user",
            content: JSON.stringify({ question, context: hiveContext }),
          },
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return json(response.status, {
        error: "smart_bee_unavailable",
        message: "Pametna čebela je izmučena in trenutno ne more odgovarjati na zahtevna vprašanja.",
        detail: errorText.slice(0, 300),
      });
    }

    const payload = await response.json();
    const answer =
      payload.output_text ||
      payload.output?.flatMap((item) => item.content || []).map((part) => part.text || "").join("\\n").trim() ||
      "Pametna čebela trenutno nima jasnega odgovora.";

    return json(200, { answer });
  } catch (error) {
    return json(500, {
      error: "ai_failed",
      message: "Pametna čebela je izmučena in trenutno ne more odgovarjati na zahtevna vprašanja.",
      detail: error.message,
    });
  }
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
  if (/\b(koliko|kaksna)\b.*\bura\b|\bcas\b/.test(text)) {
    return "Ura je " + new Intl.DateTimeFormat("sl-SI", { hour: "2-digit", minute: "2-digit", timeZone: "Europe/Ljubljana" }).format(now) + ".";
  }
  if (/\b(kateri|kaksen)\b.*\bdan\b|\bdanes\b.*\bdan\b/.test(text)) {
    return "Danes je " + new Intl.DateTimeFormat("sl-SI", { weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: "Europe/Ljubljana" }).format(now) + ".";
  }
  if (/\bdatum\b|\bkateri\b.*\bdatum\b/.test(text)) {
    return "Današnji datum je " + new Intl.DateTimeFormat("sl-SI", { day: "numeric", month: "long", year: "numeric", timeZone: "Europe/Ljubljana" }).format(now) + ".";
  }
  return "";
}

function isAllowedSmartBeeQuestion(question, body = {}) {
  const text = normalizeSl(question);
  if (BEE_ASSISTANT_KEYWORDS.some((key) => text.includes(normalizeSl(key)))) return true;
  return (body.hives || []).some((hive) => {
    const name = normalizeSl(hive.name);
    const location = normalizeSl(hive.location || hive.locationName || "");
    return (name && text.includes(name)) || (location && text.includes(location));
  });
}

function offTopicAiMessage() {
  return "Pametna čebela zna pomagati pri čebelarstvu, panjih, medu, vremenu za pregled, opomnikih, zalogi, senzorjih in tvojem čebelnjaku. Za ostale teme raje vprašaj drugega pomočnika.";
}

function normalizeSl(value) {
  return String(value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function compactRows(value, allowedKeys) {
  if (!Array.isArray(value)) return [];
  return value.slice(0, 30).map((row) => {
    const compact = {};
    for (const key of allowedKeys) {
      if (row?.[key] !== undefined && row?.[key] !== null) compact[key] = row[key];
    }
    return compact;
  });
}

function json(statusCode, body) {
  return {
    statusCode,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
    },
    body: JSON.stringify(body),
  };
}
