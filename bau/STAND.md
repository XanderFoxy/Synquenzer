# Stand 23.11.14:05 UTC
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
## kmp1
fertig: KMP1 gebaut und getestet (index.html md5 b4943476ff3b5bc6951d20cbf9d37914, apply.py, block.js, kern.js, hoch.png, quer.png, KURZ.md, CHANGES.md)
als Nächstes: nichts – bereit zur Übernahme
## mlg3
fertig: MLG3 gebaut und getestet (index.html, apply.py, block.js, kern.js, quer.js, KURZ.md, CHANGES.md)
als Naechstes: nichts – bereit zur Uebernahme
## vl3
fertig: VL3 gebaut + Kern-Test 10/10 grün, KURZ.md + CHANGES.md geschrieben (Ausgang md5 9bb6ee81)
als Nächstes: nichts – bereit zur Übergabe
## werkzeug
# STAND werkzeug (Grundlage)
- [ ] pflicht.py
- [ ] rauch.mjs
- [ ] KARTE.md
- [ ] base geprüft
