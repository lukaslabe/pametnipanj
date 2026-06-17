# PametniPanj podatkovni tok za LilyGO

Pametni panj mora delovati na dva načina:

1. LilyGO meri samostojno in pošilja podatke prek SIM kartice na strežnik.
2. Ko je telefon blizu panja, lahko aplikacija pozneje prebere zadnje stanje tudi lokalno prek Bluetootha.

Obe poti morata uporabljati isti pomen podatkov, da aplikacija ne postane dve ločeni aplikaciji.

## Pot A: SIM kartica v strežnik

LilyGO pošlje:

`POST https://pametnipanj.si/api/readings/ingest`

Payload:

```json
{
  "deviceId": "BH-00001",
  "apiKey": "skrivni-kljuc-panja",
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

Strežnik preveri:

- `deviceId` mora pripadati panju.
- `apiKey` se mora ujemati s ključem panja.
- Meritev se shrani v `readings`.
- Zadnje stanje panja se posodobi v `hives`.
- Po potrebi nastanejo opozorila v `alerts`.
- Naprava se zabeleži v `devices`.

## Pot B: Bluetooth v telefon

Bluetooth naj pozneje bere isto zadnje stanje ali enakovreden JSON. Telefon lahko to uporabi za hiter lokalni vpogled, ko ni mobilnega signala ali ko je čebelar fizično ob panju.

Bluetooth pot ne sme imeti drugačnih pomenov polj. Če Bluetooth vrne `feedWeightKg`, mora to pomeniti isto kot pri SIM poti: tehtnica pitalnika v kilogramih.

## Minimalna logika v LilyGO

LilyGO naj zna:

- brati glavno tehtnico,
- brati tehtnico pitalnika,
- brati DS18B20,
- brati BME280,
- spremljati baterijo, solar in signal,
- lokalno sestaviti zadnji JSON odčitek,
- poslati JSON na strežnik,
- isti zadnji JSON pozneje ponuditi prek Bluetootha.

Če internet ne deluje, LilyGO ne sme zmrzniti. Zadnji odčitek naj ostane na napravi in naj poskusi znova ob naslednjem ciklu.
