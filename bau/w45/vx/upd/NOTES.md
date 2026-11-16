# UPD – Update-Weg ohne Doppel-Download (OFFEN-1611 A6)

Basis: rel-4761/index.html (4.76.1, md5 e4dc1b95…). index.html = basis + UPD-Block + 1 Haken. VERSION bleibt '4.76.1'.
Nichts Sichtbares: kein Hinweis, keine Meldung, Aussehen/Bedienung unverändert. sw.js, version.json, Repo unberührt.

## Wie die App heute Versionen prüft (gelesen)
- **VW** (index.html Z 52754 ff.): `version.json?t=<jetzt>` mit `cache: 'no-store'` beim Start (+4 s), bei Rückkehr in die App,
  alle 10 min. Neuere Fassung → `vwGo` (nur bei vwIdle) → `vwReload`: speichern, Cloud senden, `synq-app-*`-Caches löschen,
  `reg.update()`, dann **PERF1A** `perf1aPre` (Vorlauf: normale Adresse mit `cache: 'reload'` holen, Fassungszeile lesen; passt →
  normale Adresse neu laden; passt nicht → Rückfall `?v=<Fassung>`).
- **sw.js** (Repo, Cache `synq-app-2`): Seite „network first“ über den HTTP-Zwischenspeicher; jede ok-Antwort wird per
  `r.clone()` → `cache.put` gespeichert (liest den Körper **ganz**); nur GET wird bearbeitet. `?v=` weicht nie auf die Kopie aus.
- **version.json** (Repo): `{"version": "4.76.0"}`, wird mit der Seite im selben Hochladen getauscht.
- Pages: `Cache-Control: max-age=600`, ETag/Last-Modified, CDN-Rand. `?t=`/`?v=` sind eigene Schlüssel → immer frisch.

## Ist-Messung VORHER (upd-test.mjs, Server wie Pages: gzip, ETag W/"…", Last-Modified, max-age=600, HEAD, 304;
## Online-sw.js von Hand registriert; Rand-Zwischenspeicher simuliert; Seite = Quell-HTML gzip 3,01 MB)
| Szenario | basis: Downloads beim Update | nächster Start | gesamt |
|---|---|---|---|
| ok (alles sofort neu) | 1 (200 + 304) | sofort neu, 0 | **1** |
| kurz (normale Adresse 20 s alt, dann neu) | **2** (alt 3,01 MB ganz + `?v=` 3,01 MB) | startet **alt** 4.76.1, VW lädt neu: +1 | **3** |
| alt (normale Adresse bleibt alt bis nach dem Update) | **2** | startet alt, +1 | **3** |
| alt ohne Service-Worker | 1,25 (alt nach 0,75 MB abgebrochen + `?v=`) | +1 | 2,25 |
Ja: bei veraltetem Rand-Zwischenspeicher lädt ein Update die Seite zweimal (und der nächste Start ein drittes Mal).

## Ursache (Beleg)
1. Vorlauf holt die normale Adresse ohne Vorprüfung: `fetch(location.pathname, {cache: 'reload'})` (PERF1A, Z 113719). Der
   Rand liefert die alte Seite; perf1aRead bricht nach ≈ 26 % ab, aber der Service-Worker liest seine Kopie zu Ende
   (`r.clone()` → `cache.put`, sw.js) → Abruf `/:4.76.1:200:3.01` ganz (v-basis-kurz.json), danach `?v=` 3,01 MB.
2. `cache: 'reload'` schreibt die **alte** Antwort frisch (max-age 600) in den HTTP-Zwischenspeicher der normalen Adresse →
   nächster Start (Home-Bildschirm) zeigt 4.76.1 und lädt ein drittes Mal (`naechsterStart.startVersion 4.76.1, +1`).

## Änderung (Block `/* UPD-BEGIN */ … /* UPD-END */` direkt nach PERF1A-END, 1 Haken)
- Haken in vwReload (seit Prüfung: VOR dem Löschen der synq-app-Kopie, nach Speichern/Cloud): `if (typeof updPre === 'function' && await updPre(v, o)) return;   /* UPD */`
- `updPre`: nur 1. Versuch je Fassung (wie PERF1A). Fragt **nur Kopfzeilen** ab: `HEAD` normale Adresse und `HEAD ?v=<Fassung>`
  (`cache: 'no-store'`, 8-s-Grenze; HEAD geht am Service-Worker vorbei, kein Inhalt). Vergleich ETag (W/ und „-gzip“ gleich
  behandelt) und Last-Modified; „alt“ nur, wenn **alle** vorhandenen Merkmale abweichen **und** (seit Prüfung) die normale Adresse
  genau die Kopfzeilen der Seiten-Kopie des Service-Workers (= laufende Fassung) liefert; ohne Kopie → unklar → bisheriger Weg.
  - gleich/unklar → wie bisher PERF1A (1 Download unter der normalen Adresse).
  - alt → alle 15 s (seit Prüfung 10 s) erneut fragen, höchstens 60 s (PERF1A.busy gesetzt: zweite VW-Prüfung tut nichts). Wird die normale
    Adresse neu → PERF1A (1 Download, HTTP-Zwischenspeicher neu). Bleibt sie alt → direkt `?v=` (1 Download, die alte Seite wird
    gar nicht geladen), mit denselben vwIdle-Prüfungen vor/nach dem Speichern wie PERF1A.
- Neue Namen: UPD, updHead, updProbe, updPre (topdefs 7988 → 7992, 0 doppelt); seit Prüfung dazu updKey, updMk, updCmp, updRef (→ 7996).
- Werkstatt: `node bau.cjs basis.html index.html` (Block in block-upd.js). Diff: +61 Zeilen, 0 geändert/entfernt.

## Messung NACHHER (A/B im Wechsel mit basis, Last 17–24 auf dem Rechner; Bytes sind lastunabhängig)
| Szenario | basis gesamt (Update + nächster Start) | index gesamt | Update kommt nach |
|---|---|---|---|
| ok | 1 + 0 = **1** (2×) | 1 + 0 = **1** | 564–693 → 660 ms (unverändert, Rauschen) |
| kurz (Quell-HTML, gz 3,01 MB) | 2 + 1 = **3** (2×) | 1 + 0 = **1** (2×) | 113–372 ms → 30,4–31,2 s (wartet, bis der Rand neu ist) |
| kurz, Auslieferung (gz 2,27 MB) | 4,54 + 2,27 = **6,81 MB** | **2,27 MB** | 163 ms → 30,5 s |
| alt (Rand > 60 s alt) | 2 + 1 = **3** (2×) | 1 + 1 = **2** | 360 ms → 60,2 s, dann `?v=` |
| alt ohne Service-Worker | 1,25 + 1 = 2,25 | 1 + 1 = 2 | 148 ms → 60,2 s |
Normalfall unverändert; veralteter Rand: nie mehr die alte Seite geladen, Update selbst immer genau 1 Download.
Einzelzeilen + Last je Lauf: LOG.md.

## Tests
- upd-test.mjs: 14 Läufe (6 basis vorher/A-B, 5 index, 2 Auslieferung, 1 Probe), 0 Seitenfehler, Seite nach dem Update immer 4.76.2.
- Pflicht (pflicht.log): topdefs 26 Skripte / 7992 Namen / 0 doppelt / 0 Syntaxfehler; dupkeys 0; smoke „title SYNQUENZER
  errors []“; „MS 2000“ 1×; „^  live: true,“ 1×; VERSION-Zeile 1×.
- Auslieferung (perf2/ausliefern.mjs) läuft durch: 6 964 722 B, gzip -6 +446 B gegenüber basis-Auslieferung.

## Grenzen / Offen
- Pages selbst nicht messbar (Proxy 403): ETag/Last-Modified-Verhalten des echten Rands ist angenommen (gleiche Datei unter `/` und
  `?v=` → gleiche Kopfzeilen). ~~Weichen sie am echten Rand trotz gleicher Datei ab, kostet das nur Zeit (60 s, dann `?v=` wie 4.68),
  keinen Doppel-Download.~~ **Richtiggestellt (Prüfung, Befund 1):** in der ersten Fassung kostete das 60 s beim Update, beim nächsten
  Start noch einmal bis zu 60 s Warten auf der alten Fassung und nach 10 min einen weiteren Download. Seit der Nachbesserung gilt
  „alt“ nur noch, wenn die normale Adresse nachweislich die laufende Fassung liefert (Kopie des Service-Workers) – liefert Pages unter
  `?v=` eigene Kopfzeilen, läuft das Update wie basis (gemessen, siehe Prüfung). Vor dem Release trotzdem Roh-Lauf/iPhone-Check.
- Szenario „alt“ (Rand bleibt > 60 s alt): Update 1 Download, aber der nächste Start unter der normalen Adresse lädt einmal neu
  (HTTP-Zwischenspeicher der normalen Adresse ist noch alt) – nur mit sw.js-Änderung vermeidbar (Seite mit If-None-Match =
  ETag der eigenen Kopie holen und bei 304 die Kopie liefern). Vorschlag, nicht gebaut (Repo-Datei, eigenes Paket).
- Update kommt bei veraltetem Rand bis zu 60 s später (unsichtbar, kein Hinweis). Normalfall unverändert (+2 HEAD ≈ 1 RTT).
- Am iPhone prüfen: Fassung hochladen, App offen → Datenzähler ≈ 1× Seite; Safari-Web-Inspector: 2 HEAD, 1 GET.

## Prüfung (Nachbesserung 16.11. 08:43–09:00; Prüfer-Befunde 1–3, Prüfer-Dateien in pruef/)
Sicherung vorher: `sicherung-0845/` (index.html 56cd354c…, block-upd.js 3611f5e2…, bau.cjs, NOTES, LOG, upd-test.mjs, pflicht.log, smoke.png).
Endfassung: **index.html md5 d7f97d5f5cef8bfcae7c511097da0bb6** (= `node bau.cjs basis.html …`, nachgebaut byte-gleich), block-upd.js
14292898…; Diff gegen basis +84 Zeilen, 0 entfernt (1 Haken + Block). VERSION '4.76.1'.

| # | Befund | nachgeprüft | Behebung |
|---|---|---|---|
| 1 (mittel) | Kernannahme „/ und ?v= gleiche Kopfzeilen“ ungeprüft; ist sie falsch, wartete UPD 60 s, der nächste Start lief alt und wartete erneut, nach 10 min ein weiterer Download | **echt** (Code: „alt“ allein aus „/ ≠ ?v=“; Prüfer-Lauf ETQ: 60,1 s + nächster Start 4.76.1) | „alt“ braucht jetzt einen **Beleg**: die normale Adresse liefert genau die Kopfzeilen der Seiten-Kopie des Service-Workers (= laufende Fassung; `updRef`, nur Kopfzeilen, kein Inhalt). Liefert Pages unter ?v= eigene ETag/Last-Modified, ist / ≠ Kopie → unklar → bisheriger Weg (PERF1A) ohne Warten. Ohne Kopie (kein Service-Worker) → bisheriger Weg. Die localStorage-Sperre aus dem Vorschlag ist damit unnötig und würde im echten „alt“-Fall einen Download kosten – nicht gebaut. Offen 1 oben richtiggestellt. |
| 2 (klein) | Offline-Kopie bis zu 60 s gelöscht | **echt** (Haken Z 52795 stand nach dem Löschen Z 52794) | Haken steht jetzt **vor** dem Löschen (nach Speichern/Cloud). „frei“ → vwReload löscht danach wie bisher, reg.update, PERF1A. „alt“ → kein Löschen (?v= ersetzt die Kopie selbst; schlägt ?v= offline fehl, startet die alte Kopie statt Response.error), reg.update wie vwReload. Gemessen: 8 s nach dem Anstoß ist die Kopie da (kurz, kurz-ETQ, alt). |
| 3 (klein) | Neuladen kommt bei veraltetem Rand später (mitten in der Arbeit) | **echt**, Folge der Wartezeit | Abfrage-Takt 15 → 10 s: Neuladen bei „kurz“ nach 21,0–21,4 s statt 30,4–31,2 s. Bewusste Folge, für Funk: bei veraltetem Rand kommt der (unsichtbare, gespeicherte) Neustart bis zu 60 s später; Warten auf „kein Blatt offen“ wäre eine Bedienungsänderung → nur als Vorschlag. |

**A/B-Reihe nach der Nachbesserung** (`serie-pruef.sh`, upd-test2.mjs = upd-test.mjs + ETQ wie Prüfer + Kopie-Probe, abwechselnd, Last 1 min
3,2–25,9 in mess2/serie.log; Bytes lastunabhängig; 0 Seitenfehler in allen 11 Läufen; Seite nach dem Update immer 4.76.2):
| Szenario | basis gesamt (Update + nächster Start) | index gesamt | Neuladen basis → index | Kopie nach 8 s (index) |
|---|---|---|---|---|
| ok | 1 + 0 = **1** | 1 + 0 = **1** | 431 → 515 ms (2 HEAD, Rauschen) | – (schon neu geladen) |
| kurz | 2 + 1 = **3** | 1 + 0 = **1** | 254 ms → 21,4 s | da |
| alt | 2 + 1 = **3** | 1 + 1 = **2** | 452 ms → 60,6 s | da |
| ok, ETQ (?v= eigene Kopfzeilen) | 1 + 0 = **1** | 1 + 0 = **1** | 756 → **363 ms** (vorher 60,1 s + nächster Start alt) | – |
| kurz, ETQ | 2 + 1 = **3** | 1 + 0 = **1** | 208 ms → 21,0 s | da |
| alt ohne Service-Worker | (vorher gemessen 2,25) | 1,29 + 1 = **2,29** | → 215 ms | – (keine Kopie → bisheriger Weg) |
Ohne Service-Worker ist der kleine Gewinn (2,25 → 2) bewusst aufgegeben (kein Beleg möglich); die App registriert sw.js auf https immer.

**Tests**
- `upd-logik.cjs index.html`: **34/34 OK** (16 Probe-Fälle inkl. ETQ, Kopie stark/-gzip, Kopie nur ETag, Kopie ≠ Rand; 8-s-Grenze;
  updRef Ordner-Adresse/Fehler/ohne Cache-API; updPre neu/n=2/busy/alt (reg.update 1×, 0 gelöscht)/ohne Kopie/ETQ/alt→neu/Zurück-Cache/
  nicht idle/file:; Zeiten 10 s/60 s; Haken-Lage save < cloud < UPD < löschen < reg.update < PERF1A; Block = block-upd.js).
  Prüfer-logik.cjs gegen die Endfassung: 6 „FEHL“ = genau die „alt“-Fälle ohne Kopie (dort kein caches-Nachbau), jetzt absichtlich unklar.
- e2e: 11 Läufe (Tabelle oben). Pflicht (pflicht2.log): topdefs 26 Skripte / 7996 Namen / 0 doppelt / 0 Syntaxfehler; dupkeys 0;
  smoke „title SYNQUENZER errors []“ (smoke.png unverändert); „MS 2000“ 1×; „^  live: true,“ 1×; VERSION-Zeile 1×.
- Auslieferung (perf2/ausliefern.mjs): 6 965 433 B, gzip -6 2 364 767 B (+688 B gegenüber basis-Auslieferung).
- Repo /home/user/synquenzer: git status leer; perf2/r4760: keine Datei neuer als die Sicherung.

**Offen nach der Prüfung**
1. Roh-Lauf/iPhone-Check vor oder direkt nach dem Release (OFFEN-1611 A6): HEAD / und /?v=x der echten Seite – ETag, Last-Modified,
   x-cache vergleichen, möglichst kurz nach einem Hochladen. Ist die Annahme falsch, kostet es jetzt nichts mehr (bisheriger Weg); ist der
   Rand auf HEAD nie aus dem Zwischenspeicher, gibt es keinen Gewinn, aber keinen Schaden.
2. Funk-Vorschlag (sichtbar → nur vorschlagen): beim Update zusätzlich warten, bis kein Blatt offen ist.
3. Nächster Start nach „alt“ (> 60 s) lädt einmal neu – nur mit sw.js-Änderung vermeidbar (eigenes Paket, Repo-Datei).
