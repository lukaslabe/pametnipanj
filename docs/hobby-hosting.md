# BeeCare stalni predogled brez terminala

Najcenejša začetna pot je Vercel Hobby ali Cloudflare Pages. Za zdaj priporočilo: Vercel Hobby, ker je najhitrejši za ročni upload ali povezavo z GitHubom.

## Vercel Hobby

Strošek: 0 EUR za osebni/hobby projekt.

Kaj nastaviti:

- Framework preset: `Vite`
- Build command: `npm run build`
- Output directory: `dist`
- Install command: `npm install`

Po deployu dobiš stalen HTTPS link, na primer:

```text
https://beecare.vercel.app
```

Ta link dela na telefonu tudi prek mobilnih podatkov. Računalnik in terminal nista več potrebna.

## Kaj trenutno deluje na hostingu

- frontend aplikacija
- lokalni demo podatki v brskalniku
- kamera in lokacija prek HTTPS
- QR tiskanje in skeniranje, če telefon dovoli kamero
- PWA/service worker

## Kaj še ni produkcijsko vezano

- pravi Supabase račun in baza
- pravi device ingest za LilyGO/ESP32
- pravi AI API

Ko začnemo testirati s pravimi uporabniki, dodamo Supabase Pro ali drugo plačljivo bazo.
