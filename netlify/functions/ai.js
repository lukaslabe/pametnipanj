const OPENAI_API_URL = "https://api.openai.com/v1/responses";

export async function handler(event) {
  if (event.httpMethod !== "POST") {
    return json(405, { error: "method_not_allowed" });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return json(503, {
      error: "ai_not_configured",
      message: "Pametna čebela je izmučena in trenutno ne more odgovarjati na zahtevna vprašanja.",
    });
  }

  try {
    const body = JSON.parse(event.body || "{}");
    const question = String(body.question || "").trim();
    if (!question) return json(400, { error: "missing_question" });

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
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || "gpt-4.1-mini",
        max_output_tokens: 450,
        input: [
          {
            role: "system",
            content:
              "Ti si Pametna čebela v aplikaciji PametniPanj. Odgovarjaj v slovenščini, kratko, praktično in za starejše čebelarje. Ne izmišljuj si podatkov. Če ni dovolj podatkov, povej kaj naj čebelar fizično preveri. Ne dajaj nevarnih veterinarskih navodil brez opozorila, naj se uporabnik drži lokalnih pravil in registriranih pripravkov.",
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
        error: "openai_unavailable",
        message: "Pametna čebela je izmučena in trenutno ne more odgovarjati na zahtevna vprašanja.",
        detail: errorText.slice(0, 300),
      });
    }

    const payload = await response.json();
    const answer =
      payload.output_text ||
      payload.output?.flatMap((item) => item.content || []).map((part) => part.text || "").join("\n").trim() ||
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
