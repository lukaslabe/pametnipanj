# BeeCare Device Ingest API

Run the API locally:

```powershell
npm run api
```

Endpoint:

```http
POST http://127.0.0.1:8787/api/readings/ingest
Content-Type: application/json
```

Example payload:

```json
{
  "deviceId": "BH-00001",
  "apiKey": "secret",
  "timestamp": "2026-05-17T06:00:00+02:00",
  "weightKg": 52.4,
  "insideTempC": 34.6,
  "insideHumidityPct": 58,
  "outsideTempC": 22.4,
  "outsideHumidityPct": 71,
  "batteryPct": 87,
  "batteryV": 3.91,
  "solarV": 5.7,
  "rssiDbm": -73
}
```

Required server environment:

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
DEVICE_INGEST_PORT=8787
```

Device authentication:

- `deviceId` must match `hives.device_id` or `hives.id`.
- `apiKey` must match `hives.device_api_key`.
- The demo hive `Lipovec` uses `deviceId = BH-00001` and `apiKey = secret` after demo data is synced to Supabase.

On a valid ingest, the API:

- inserts a row into `readings`
- updates hive weight, inside temperature, humidity, battery, signal, status and last seen
- creates rows in `alerts` for battery, solar, signal, temperature, humidity and sudden weight loss conditions
