# CHANGES – PROMO (Helfer-Zweig `helfer-promo`)

Nichts an der App geändert. Alles mit der App aus `bau/vs/n5-br-V/index.html` (4.25.0, VV1+VV2) bzw. `bau/helfer/VV3/index.html`
(Zweig `helfer-vv3`, Innenleben) erzeugt, gesteuert über die Test-API `SYNQUENZER` in Chromium (Playwright).

## Demo-Song „Synthie-Demo 84“ (`demo-synthie-track.json`, `.wav`)
- 118 BPM, a-Moll (äolisch), 44 Takte = 89,5 s + 2,2 s Ausklang (WAV 91,6 s). Akkorde Am–F–C–G, eigene Melodien.
- Aufbau: Haken (2 T.: Vocoder „Synquenzer“ + Stabs + Gated-Snare) · Strophe (8) · Strophe 2 (8, Lead) · Aufbau (4, Snare-Wirbel,
  steigendes Arp) · Drop (8) · Break (4) · Drop 2 (8) · Schluss (2).
- Spuren: Bass (VA, 16tel-Sequenzerbass mit Oktavsprüngen) · Arp (FM-Glocke) · Fläche (VA-Ensemble-Streicher) · Stabs (VA Poly-Stab) ·
  Drums (Kit „Gated 84“) · Lead (VA Sync-Lead, Echo + Hall hochgesetzt) · Vocoder (MS-Werksprogramm H14, „Formant halten“ aus,
  E2 = Spur Stimme, trocken stumm) · Stimme (STIMME-Spur, Take = Modulator).
- Ton: offline über `vvRender` (derselbe Graph wie live), danach linear auf −14 LUFS / −1,5 dBTP (ffmpeg loudnorm, 2 Durchgänge).
- **Hinweis Take:** Das Projekt trägt nur die Take-ID; das Audio liegt in der App im Gerätespeicher. Der Modulator liegt als
  `demo-stimme-take.wav` bei (Sprachsynthese „Synquenzer“, 48 kHz mono) – `werkzeug/load.mjs` legt ihn beim Laden wieder an
  (`tkAddPcmTake` mit derselben ID). Ohne den Take schweigt der Vocoder.

## Videos
- Quellen: Song-Video der App (VV1/VV2: Auto, Song, Matrix, 9:16) synchron zum Ton; VV3-Spurbilder (FM-Algorithmus, Drum-Pads,
  VA-Lead) für Takte 18–30; echte Bedien-Aufnahmen mit Touch-Emulation (390×844 @3×, CDP-Screencast 1170×2532).
- Schnitt (`werkzeug/edit.py`): alle Schnitte auf Taktgrenzen (1 Takt = 2,034 s), Ton aus Song-Teilen mit 12-ms-Überblendung
  zusammengesetzt; jede Länge mit eigener Teile-Folge (30 s: Haken → Aufbau mit 1-Takt-Schnitten → Drop → Schluss).
- Texte: Barlow Semi Condensed (App-Schrift), dunkle Tafel; nur im Bereich y 270–1650, x 70–930 (TikTok-Ränder frei);
  bei Bedien-Aufnahmen über dem Telefonbild, nie auf Bedienelementen.
- Abgedeckt: der Untertitel unter „Vocoder“ in der Matrix-Aufnahme (zeigt den Modellnamen der Engine).

## Blocker / Notizen (nicht behoben – App bleibt unverändert)
- Die App zeigt den Engine-Namen „MS 2000“ in Spurkopf, Platte und VV3-Kopfzeile (`MK_LABEL`); für Werbung ggf. neutral benennen.
- Chromium hier ohne AAC-Kodierer: App-Videos mit Opus (Test-Schalter `vvTest({opus:true})`), Endton ohnehin neu als AAC gemischt.
- Playwright `recordVideo` nimmt nur in CSS-Pixeln auf (390×844) → ersetzt durch CDP-Screencast.
