# Stand 23.11.16:07 UTC
## arp2
# ARP2 Stand
- Start 15:2x; Punkte a–e nachstellen
- apply.py + block.js geschrieben (a,b,d,e); c in Prüfung
- (a) echt: 3/4+6/8 alt 1. Note 67 (falsch), neu 60; 4/4 gleich
- (b) echt: alt 0 Stimmen nach Arp aus (Taste/Clip), neu 3/3; (e) echt: alt 4/33 falsch, neu 0/33
## drum1
# DRUM1 – Stand
- Kern-Test-Datei: **kern.mjs** (Browser, 428×926 Touch: Lied laden → Zerlegen schnell → Drum-Ebene → Kit-Erkennung; Lieder songs.mjs,
  lieder-pruef.mjs, hart.mjs). Offline-Gegenprobe off.mjs auf dump/*.f32 (alt-hits.js = alter Code, neu-off.js = mit DRUM1).
- Bau: apply.py <eingang> <ausgang> (md5 a7515b98…, Anker = Zeile `try{window.__spk11b=…}catch(e){}` 1×, Block block.js dahinter).
- Basis 4.86.0: SUMME kick 515/528 +93 · snare 342/344 +82 · hihat 1546/1768 +1 (Fehler fast nur im Lied „hart“).
## ent1a
# ENT1A Stand
- Start: Analyse Arp/Stopp. stop() kehrt bei !R.playing früh zurück -> arpEndAll fehlt (Verdacht).
- Sonde 1 (hoch+quer): Latch live + gehaltene Taste, ■ -> 0 Stimmen, ARPC leer nach 200ms; Latch bleibt an; ▶ danach Arp auf 1/16-Raster. Prüfe noch Pegel.
- Pegel: nach einfachem ■ klingt nur Hall/Echo aus (gewollt; zweites ■ -> Pegel 0, Stimmen 0). Kein Arp-Ton hängt.
- ERGEBNIS: schon gut, keine Änderung. Sonden je hoch 428x926 + quer 926x428, echte Touch-Taps, 0 Seitenfehler.
## ent1b
# ENT1B Stand: FERTIG
- apply.py: 7 Anker je 1x, Eingang md5 9cfae59f07ef6b087ffe339b125878b3 -> Ausgang 70a2e70eef805be45abc6bd8878c808a
- Projekt-Wert in settings.vid6n ('m' oder 1/2/4/8); vid6N liest Projekt zuerst, sonst Gerät-Wert
- Rückgängig über kind 'set' (Haken in settingApply zeichnet Video neu und setzt Gerät-Vorschlag)
- Neues Projekt übernimmt Gerät-Vorschlag; Beschriftung Chip: "· dieses Projekt"
## ent1c
# STAND ENT1C – FERTIG
- [x] Sonde vorher: Überlappung 0, Text gekürzt ok; Tippziel 26 px (hoch) / 22 px (quer) → zu klein
- [x] apply.py: Video-Spur auf Touch (pointer:coarse) 40 px hoch, Schrift 11 px; Computer unverändert 20/24 px
- [x] Sonde nachher: 12/12 OK (Tippziel 42 px, Überlappung 0, keine Fehler)
- [x] CHANGES.md, KURZ.md
## ent1d
# ENT1D Stand
- 12:55 Start: Kopf „Klang erkennen" untersuchen (✕, ↶, Synth-Reiter, hochkant/quer).
- 13:00 Sonde vorher: ✕/Kopf/Reiter sichtbar, ≥44 px, keine Überlappung; ↶ nach Übernehmen sichtbar. Mängel: ✕ 6 px (hoch) bzw. 25 px (quer) anders als in den übrigen Blättern; langer Name 2 Zeilen.
- apply.py geschrieben (3 Haken), jetzt Test.
- 13:05 FERTIG: Sonde nachher 24/24 OK (hoch+quer), Pflichtprüfungen ok. Ausgang: ausgang.html (md5 ffc7f9a61c3ee41c671ff55ba2124d13).
## ges2
# GES2 Stand
- Start: Code gefunden: Stufensuche = segment() in vsDspMake (Worker-Text via toString!), Gesang-Editor = vx2Pick/vx2AnLead/vx3Lead.
- Plan: (1) Glätten Gleiten+Vibrato in segment (Block innerhalb vsDspMake), (2) Anlauf, (3) Marken.
- apply.py + seg-block.js gebaut (Block GES2-SEG in vsDspMake vor segment, 1 Haken vor minF). Kern-Test 17/18 -> 18/18 (Noten 56 -> 53, Soll 53).
- Anlauf lagefest / Konsonant über stimmhafte Rahmen: nicht angefasst (VX3 macht Letzteres schon bis 3 Rahmen).
## ke2
# KE2 Stand
- Start: Eingang 4.86.0 (md5 a7515b98…) geprüft. KE1-Kern liegt im stillen Block sq-ke1-src (ohne Kommentare). Eichung per CAL (logistisch) gibt es schon.
- Plan: Node-Prüfstand (Kern aus der Datei, Testtöne mit renderH der App-Engine) -> Welle vorher/nachher + ECE vorher/nachher; dann Welle aus dem Anschlag in analyse(); dann CAL nachschärfen.
- 33 min: Kern-Test w/kt.mjs (Node, Kern aus der Datei, Töne per renderH). Vorher (Saat 20261118, 48 Töne): Welle 25/48, ECE 0,112.
  Anschlag-Merkmale (gerade/ungerade Teiltöne + Krümmung, filterfest) Gewicht 6: Stufe-1-Welle Eichsaat 30/60 -> 33/60. Läuft: Endlauf nach + Eichlauf für CAL.
## kmp1
fertig: KMP1 gebaut und getestet (index.html md5 b4943476ff3b5bc6951d20cbf9d37914, apply.py, block.js, kern.js, hoch.png, quer.png, KURZ.md, CHANGES.md)
als Nächstes: nichts – bereit zur Übernahme
## lt2
# LT2 STAND
- 15:2x block.js + apply.py gebaut (Stückweise-Vorzeichnen bei Tönung), Test folgt
- 15:3x erster Lauf: Endbild/Bildschirm gleich (926x428), basis bei Last <1 ohne LT; großer Lauf run1.out läuft
- 15:4x Blit durch Kopier-Shader ersetzt + Zaun (fenceSync) vor dem Zeigen; Schnelltest: Bilder gleich, Bildabstand alles 23/19 statt 31/39 ms; großer A/B-Lauf run2.out läuft (index md5 43e05a35…)
## Aufbau (index md5 43e05a3592d31884bf73f8e2eb67d3c8, Eingang 9c7f63cf…)
## mlg3
fertig: MLG3 gebaut und getestet (index.html, apply.py, block.js, kern.js, quer.js, KURZ.md, CHANGES.md)
als Naechstes: nichts – bereit zur Uebernahme
## ton1
# TON1 – Stand (fertig)
- Ausgang: index.html = python3 apply.py ../rel-4850/index.html index.html (md5 125767aed0f89918371d0729d07a6f82).
- 9 Haken (/*TON1*/) + Block TON1-BEGIN/-END vor spk7TrE. Worklet-Kern: wartende Stimmen laufen weiter (Hüllkurve, Wartezeit),
  bei Ankunft Einstieg an der richtigen Stelle + 5-ms-Blende; Vorab-Quelle (ohne Spektren) wird bei der vollen Quelle übernommen.
  Hauptfaden: ton1Got (PCM gelesen → sofort an wartende Engines), ton1Pre (Engine wartet, PCM schon da → sofort füttern).
## ton2
# TON2 – Stand (fertig)
- Ausgang: index.html = python3 apply.py ../rel-4860/index.html index.html (md5 f714174b731b2d82d47ff897ca2ef62f)
- 4 Haken (/*TON2*/) + Block TON2-BEGIN/-END vor tkLoad:
  1. tkPcm: Stücke mit Vorab-Fenster (TON2_W=6) parallel anfordern, weiter in Reihenfolge einsetzen (gilt für alle Leser von tkPcm).
  2. tkLoad: ton2Load = tkPcm + gemerkte Analyse (<take>:lv1 im Audio-Speicher, ArrayBuffer: Kopf-JSON + Float32-Hüllkurve nur in Begrenzer-Abschnitten) gleichzeitig.
## vl3
fertig: VL3 gebaut + Kern-Test 10/10 grün, KURZ.md + CHANGES.md geschrieben (Ausgang md5 9bb6ee81)
als Nächstes: nichts – bereit zur Übergabe
## vox2
# VOX2 Stand
- Start: Eingang 4.85.0 geprüft (md5 9c7f63cf…). Keine echten Takes vorhanden (realvox fehlt) -> synthetische Testsignale.
- Plan: (1) Klicks in lauten tiefen Vokalen: puls-synchroner Vergleich in clickScan.test; (2) Plopps messen; (3) Raumton nur wenn Zeit.
- 20 min: Test-Gerüst w/ (gen.mjs synth. Gesang, kt.mjs Klick-Test) fertig; Basis: Treffer 76–80/80, Fehlalarme sauberer tiefer Take A2: 3 (letzter Stimmlippen-Puls am Notenende). block.js Entwurf.
- FERTIG (Endfassung md5 a40c87ea50c3b8dcdbb75647e1e72158 = out.html aus apply.py):
## werkzeug
# STAND werkzeug (Grundlage)
- [ ] pflicht.py
- [ ] rauch.mjs
- [ ] KARTE.md
- [ ] base geprüft
## zrl2
# ZRL2 auf 4.85.0 – Stand: fertig (2 von 3 Punkten)
Ausgang `index.html` md5 cbdf7b2e629b5d3306eb03e1c5890a20 (Eingang 9c7f63cf…). Bau: `python3 apply.py <eingang> <ausgang>` (Blöcke `block-q.js`, `block-lo.js`).
Gebaut (bitgleich):
1. Tiefband (`magsLo`, spk3DspMake): Rand-Rahmen des vorigen Streifens werden übernommen (gleiche FFT-Paare, Prüfung Signal-Objekt, Fenster, N/R/K, cen je Rahmen, Versatz gerade). Speicher kopiert vor der Rückgabe (lowSplit4 ändert Y in place), 2 Einträge je Schlüssel, Freigabe im finally von zerlegen.
2. zPrep-Quantisierung ohne log10: Tabelle über float32-Bits (Exponent + 6 Mantissen-Bits), je Zelle höchstens eine Schwelle (per Binärsuche mit der alten Formel gefunden), nahe der Schwelle (±2,5e-4 relativ) und Sonderwerte genau gerechnet.
## zrl3
# ZRL3 auf 4.86.0 – Stand: fertig (Kern gebaut und gemessen; Grenzen unten)
Ausgang `index.html` md5 f0a4ae8ced20e9fa72efc8dc57e89f76 (Eingang a7515b98…). Bau: `python3 apply.py <eingang> <ausgang>` (Block `block.js`, 1 Haken `/*ZRL3*/`).
**Kern-Test-Datei: `test/test-zrl3.mjs`** (`node test-zrl3.mjs <neu.html> <basis.html>`, SEK=40 RUNDEN=2). Ausgaben: `test/test-zrl3.out` (40 s, 2 Runden),
`test/test-zrl3-final20.out` (Endfassung, 20 s). Der 40-s-Lauf lief auf der Vorfassung mit 48 MB Speichergrenze; einziger Unterschied zur Endfassung ist die
Grenze (32 MB), die nicht auf die Bits wirkt. Die Endfassung ist mit 20 s nachgeprüft.
