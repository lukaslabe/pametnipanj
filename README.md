# PametniPanj

Mobilni-first MVP za slovenske cebelarje.

## Kaj vsebuje

- pregled panjev z jasnim stanjem
- panj po podrobnostih
- koledar in opomniki
- QR sledenje panjev, regalov in zaloge
- glasovni zapiski z izluscenim dogodkom
- Pametna cebela za lokalne cebelarske odgovore in zahtevne odgovore prek funkcije
- hranjenje, tocenje, zaloga, medene serije in finance
- tehnicna stran za senzorske podatke

## Lokalni zagon

```powershell
cd C:\Users\lslab\Desktop\Codex
.\start-beecare-local.cmd
```

## Build

```powershell
npm run build
```

## Preverjanje slovenskih besedil

```powershell
npm run check:text
```

## Netlify

Build command:

```text
npm run build
```

Publish directory:

```text
dist
```

Functions directory:

```text
netlify/functions
```

## Pomembno

V repozitorij ne gredo lokalni buildi, node_modules, stari ZIP arhivi, .claude mapa ali lokalne skrivnosti.
