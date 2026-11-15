# PERF1 – LOG (Schritt 1: Messen + Plan)

- 05:20 Paket angelegt: basis.html = index.html = Kopie rel-4690/index.html (4.69.0). Keine Änderung an der App.
- 05:21 Netz-Größe je Abschnitt (mess/groesse.cjs → mess/groesse.json): 8,80 MB roh, 2,93 MB gzip, 2,14–2,53 MB brotli.
- 05:23 Online-Kopfzeilen nicht abrufbar (Proxy 403) → Cache-Verhalten aus sw.js (/home/user/synquenzer/sw.js) und VW-Block gelesen.
- 05:24 Probe 1× (tippen): Skript läuft, 0 Fehler. Korrektur: R/AU sind Skript-Konstanten, nicht window.*.
- 05:25–05:28 Reihe mess/serie.sh nacheinander: 4× ruhig 3, 4× tippen 3, 4× Trace+Profil 2, 1× ruhig 3, 1× tippen 3. 0 Seitenfehler.
- 05:28 Trace-Auswertung (mess/spur.cjs): Zeitanker = firstContentfulPaint (navigationStart fehlt im Trace).
- 05:29 Statik: Anweisungen oben (mess/oben.cjs), Kommentar-Anteil/Block-Größen (mess/anteil.cjs), Übersetzungszeit (mess/kompil.cjs).
- 05:31 Pflicht auf index.html (pflicht.log): 0 doppelt, 0 Syntax, 0 dupkeys, Rauchtest errors [], MS 2000 1×, live: true, 1×, VERSION 4.69.0.
- 05:33 MESSUNG.md, PLAN.md, NOTES.md geschrieben.

# PERF1 – LOG (Schritt 2: Bauen)

- 05:35 PLAN gelesen; sichere Top-Maßnahmen = PERF1A, PERF1B, PERF1C. PERF1D (Auslieferung ohne Kommentare, Werkstatt-Schritt) und
  PERF1E (Spektral erst beim Öffnen, Risiko mittel–hoch, schreibt Zeilen um) bleiben für einen eigenen Schritt.
- 05:37 Code gelesen: drumBufsStep/DRB (Z 32153), DrumSynth.buildSteps (braucht nur sampleRate + createBuffer), renderPartBar
  (Z 39144, liest jedes Bild 2× clientWidth), vwReload (Z 52763), sw.js (/home/user/synquenzer/sw.js, Netz zuerst über HTTP-Cache).
- 05:38 Headless-Chromium: AudioContext 44,1 kHz, `new AudioBuffer({…})` geht ohne Umgebung.
- 05:38 bau/block-bc.js + bau/bau.cjs (Basis + Blöcke + Haken → HTML, Anker müssen genau 1× passen). topdefs 0/0, dupkeys 0.
- 05:39 Funktionsprobe mess/probe-bc.mjs: PERF1B 8/8 Schritte vor dem Tipp fertig, beim ▶ übernommen (took, DRB.ctx = AU.ctx,
  Klänge white,pink,metal,click,room,gate, 44,1 kHz); PERF1C: clientWidth-Lesungen an #partBar 120/s → 0. 0 Fehler.
- 05:39 mess/start.mjs erweitert (bestehende Arten unverändert): Art `spaet` (▶ 3 s nach bereit), Art `last` (CDP-Last 6 s Leerlauf
  + 6 s Abspielen), PERF1_SR (Rate im localStorage = zweiter Start). mess/zusammen2.cjs (Mediane + Aufgaben nach dem Tipp).
- 05:40–05:46 Reihe mess/serie2.sh: basis vs B+C, je Art abwechselnd, je 3 Läufe → mess/s2/. 0 Seitenfehler.
- 05:46 PERF1C ohne messbaren Gewinn (Leerlauf 0 Layouts in beiden; Abspielen Layouts −8 %, Last nicht kleiner) → verworfen.
- 05:46 bau/block-a.js (PERF1A). 05:47 index.html = basis + PERF1A + PERF1B.
- 05:47–05:50 mess/probe-a.mjs (Update-Weg, Server wie Pages: max-age=600 + ETag/304). Erst Inkognito-Profil: dort cacht Chromium
  die 9-MB-Seite gar nicht (Speicher-Cache) → Probe auf Plattenspeicher-Profil umgestellt. Ergebnis s2/probe-a-*.json.
- 05:50 Pflicht auf index.html grün. 05:50–05:53 Regression (regression.log): smoke errors [], vx1 61/61, mtx3 51/51, spk6 ALLES OK,
  imp1 ALLE OK.
- 05:53–05:58 Endmessung mess/serie3.sh (je Lauf abwechselnd): basis vs index (ruhig, spaet), index vs B+C (last) → mess/s3/.
- 05:59 pflicht.log neu, NOTES.md ergänzt. Zwischenstände index-b/-c/-bc/-abc gelöscht (mit bau/bau.cjs nachbaubar).

# PERF1 – LOG (Prüfung: Befunde beheben)

- 06:17 PRUEFUNG.md gelesen: PERF1B behalten; PERF1A Befund 9 (Rückfall lädt während Wiedergabe/Aufnahme neu) vor Freigabe beheben;
  10 (veralteter Zwischenstand), 11 (Wettlauf), 12 (Speicherberg) mitbehandeln.
- 06:19 Vorher-Stand gesichert (fix/index-vorfix.html, fix/block-a-vorfix.js, fix/bau-vorfix.cjs). bau/block-a.js neu (Rückfall über go()
  mit vwIdle vor/nach dem Speichern, Sperre perf1aBusy, Strom-Lesen mit Abbruch), bau/bau.cjs: Haken am Anfang von vwReload.
- 06:20 index.html neu gebaut; topdefs 26/7616/0/0, dupkeys 0, MS 2000 1×, live 1×, VERSION 4.69.0 1×.
- 06:21 fix/p1a-fix.mjs (aus pruef/p1a.mjs: + gedrosseltes Senden mit Byte-Zählung, Szenarien netz/feld/wettlauf, NOSW=1).
- 06:21–06:28 Reihe fix/serie-a.sh (vorher/nachher je Szenario, basis alt/altspiel) nacheinander. Befund 9 und 11 vorher nachgestellt,
  nachher behoben; ok unverändert.
- 06:28 PERF1B-Kontrollpaar (p1b, 1 Paar; volle 3er-Reihe abgebrochen wegen CPU-Zeit – Code unverändert).
- 06:29–06:30 fix/serie-c.sh ohne Service-Worker: Abbruch wirkt (3,9 MB statt 8,6 MB), mit Service-Worker nicht (sw.js liest seine Kopie zu Ende).
- 06:30–06:38 Regression nacheinander (fix/serie-b.sh): smoke, vx1, mtx3, spk6-kern, spk6, imp1 → fix/serie-b.log. Rauchtest und mtx3 mit
  absolutem Pfad wiederholt (relativer Pfad → ERR_INVALID_URL im Skript, kein App-Fehler).
- 06:38 Regression grün: smoke errors [], vx1 61/61, mtx3 51/51, spk6-kern ALLES OK, spk6 ALLES OK, imp1 ALLE OK. pflicht.log und
  regression.log ergänzt. NOTES.md „PERF1 Prüfung“ geschrieben. Profil-Ordner der Proben gelöscht.
