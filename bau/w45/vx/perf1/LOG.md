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
