# SPKV2 auf 4.88.0 – Stand: fertig (gebaut, gemessen; Grenzen unten)
Ausgang `index.html` md5 2b2ae4e36cd18528b270f499a3465ae3 (Eingang 695af0504463a6385e21dc94e55b00c9). Bau: `python3 apply.py <eingang> <ausgang>`.
apply.py ersetzt den ganzen SPKV-Block (`alt.js`, 1 Treffer, liegt in spk1DspMake → Worker) durch `block.js` (SPKV2-BEGIN/-END,
gleicher Funktionsname spkvFix, kein neuer Top-Level-Name). `SPKV2_DEV=1` baut eine Dev-Fassung mit Debug-Haken (nur für test/dev-spkv2.mjs, Hauptfaden).

**Kern-Test-Datei: `test/kern-spkv2.mjs`** – gegen eine andere Fassung: `[RASTER=1] [SINUS=1] node test/kern-spkv2.mjs <neu.html> [basis.html]`
(A = neu, B = basis). RASTER=1: Projekt-Raster 112 BPM statt Tempo-Erkennung; SINUS=1: Bass als reiner Sinus. Ausgabe `test/kern-spkv2.out`
(alle drei Fälle, A = SPKV2, B = 4.88.0). Schnell alle drei: `test/laufe.sh <html> <tag>`. Je-Note-Analyse: `test/dev-spkv2.mjs` mit Dev-Fassung.

Änderungen in spkvFix (nur Ziel bass/drums, nur Verfeinern; Schalter in spkvO):
- alt: kein Ton mit Grundton → Grundton über Obertöne 2–5 (Kick überdeckt den Grundton), Oktave nach oben geprüft.
- ref: Grundton fein nachgestellt (parabolische Spitzen der Teiltöne 1–4).
- sin: Sinus-Abschnitte (eine saubere Spitze ≥ 70 % des Tiefbands, stetig, nach dem Maximum 4 Rahmen kein Abfall > 1,5 dB → kein abklingender Kick).
- sub: Kick braucht Anschlag im Tiefst-Band ≤ 110 Hz (Snare zählt nicht mehr als Kick); Rest-Anteil auch gegen den vorigen Ton.
- r2: Ton-Anschlag vs. Kick über den Rest-Anteil 2 Rahmen nach dem Anschlag (Kick klingt nach, Einschwing-Streuung des Basses nicht).
- wk: Bass-Anteil je Basis-Bin mit Kern der Basis-Auflösung (±3 Feinbins).
- dr: Verfeinern Drums im Kick-Fenster = genaues Gegenstück zu Verfeinern Bass.

Pflicht: MS 2000 1×, „  live: true,“ 1×, verbotene Zahlen 0, doppelt.js neu [], Konsole/Seitenfehler [] (428×926, Touch, isMobile). Zerlegen bitgleich (alle Zahlen A = B).

Grenzen (ehrlich):
- Nur am synthetischen Song gemessen, nicht am echten Demo-Song.
- Mit falsch erkanntem Tempo bleiben 13/24 Bass-Anschläge als Kick (Ziel ≤ 4 nur mit richtigem Raster erreicht).
- Sinus-Bass: 19/30 Noten, aber noch 13/24 Anschläge als Kick (Einschwingen eines Sinus sieht im Tiefband wie ein Kick aus).
- Nach Verfeinern Drums bleibt etwas Kick im Bass (2/16 statt 0/16) – Preis dafür, dass der Bass nicht mehr zurückgenommen wird.
- Bass-Noten direkt im Ausklang eines Kicks (gleiches Frequenzband) gehen noch zu gut der Hälfte an die Drums (Maske je Bin kann überlappende Spitzen nicht trennen).
