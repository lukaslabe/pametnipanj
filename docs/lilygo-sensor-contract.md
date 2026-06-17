# PametniPanj LilyGO senzorski dogovor

To je pogodba med LilyGO napravo in aplikacijo PametniPanj.

## Moduli

- Glavna tehtnica panja: 4 load celli pod celotnim panjem, polje `weightKg`.
- Tehtnica pitalnika: 4 load celli pod sediščem pitalnika, polje `feedWeightKg`.
- Notranja temperatura: DS18B20, polje `insideTempC`.
- Zunanje vreme pri panju: BME280, polja `outsideTempC`, `outsideHumidityPct`, `pressureHpa`.
- Napajanje: `batteryPct`, `batteryV`, `solarV`.
- LTE signal: `rssiDbm`.
- Mikrofon: trenutno pripravljeno mesto, pozneje `soundHz` in `microphoneStatus`.
- Kamera: trenutno pripravljeno mesto, pozneje `cameraStatus` in ločen slikovni tok.

## JSON odčitek

```json
{
  "deviceId": "BH-00001",
  "apiKey": "secret",
  "timestamp": "2026-06-16T06:00:00+02:00",
  "weightKg": 52.4,
  "feedWeightKg": 8.7,
  "insideTempC": 34.6,
  "insideHumidityPct": 58,
  "outsideTempC": 22.4,
  "outsideHumidityPct": 71,
  "pressureHpa": 1016,
  "batteryPct": 87,
  "batteryV": 3.91,
  "solarV": 5.7,
  "rssiDbm": -73,
  "soundHz": 0,
  "microphoneStatus": "not_installed",
  "cameraStatus": "not_installed"
}
```

## Pravila opozoril

- `feedWeightKg < 3`: nujno preveri hrano.
- `feedWeightKg < 6`: preveri pitalnik.
- padec `weightKg` za 2,5 kg ali več od zadnjega odčitka: nujno preveri panj.
- padec notranje temperature za 8 °C ali več od zadnjega odčitka: možno odprtje panja, prepih ali težava z družino.
- `insideTempC < 30` ali `insideTempC > 38`: temperatura ni v mirnem območju.
- `insideHumidityPct >= 82`: vlaga je previsoka.
- `batteryPct <= 20`: nizka baterija.
- `rssiDbm <= -90`: slab LTE signal.

## Navodilo za firmware generator

Ko boš prosil ChatGPT ali Claude za firmware, uporabi to navodilo:

> Napiši Arduino firmware za LilyGO T-A7670E z ESP32 in A7670E. Naprava mora brati dve ločeni HX711 tehtnici: glavna tehtnica panja (`weightKg`) in tehtnica pitalnika (`feedWeightKg`). Prva tehtnica ima 4 load celle pod celotnim panjem, druga ima 4 load celle pod sediščem pitalnika. Dodaj DS18B20 za notranjo temperaturo (`insideTempC`) in BME280 za zunanjo temperaturo, zunanjo vlago in tlak (`outsideTempC`, `outsideHumidityPct`, `pressureHpa`). Mikrofon in kamera naj bosta za zdaj samo pripravljeni kot statusni polji `microphoneStatus: "not_installed"` in `cameraStatus: "not_installed"`. Firmware naj ne zmrzne, če modem ali omrežje ne deluje. Vsaki 2 minuti naj sestavi JSON po pogodbi PametniPanj in ga pošlje na ingest endpoint. Če endpoint ni dosegljiv, naj odčitek zapiše v Serial in poskusi znova pozneje. Koda naj ima jasne konstante za API ključ, deviceId, APN, kalibracijo obeh tehtnic in pine.
