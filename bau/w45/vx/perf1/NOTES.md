# PERF1 – NOTES

Schritt 1 = nur Messen und Planen. `index.html` ist bytegleich mit `basis.html` (4.69.0); neu sind nur Mess-Skripte unter `mess/`.

## Grenzen der Messung
- Chromium statt Safari; CPU-Drosselung 4× ist eine grobe Näherung (eher zu langsam), 1× eher zu schnell. Die Rechner-CPU war
  durch andere Läufe belegt → Mediane aus 3 Läufen; Streuung bei 4× ±10–15 % (bereit 2 203–2 898 ms).
- Lokaler Server ohne Netz-Drosselung: Netzzeit steht nur als Größe (MESSUNG §1), nicht in den Zeiten.
- Trace-Läufe sind durch den Trace ~25 % langsamer; dort zählen nur die Anteile.
- Block-Namen in `mess/bloecke.cjs` sind eine Näherung (innerster offener `-BEGIN`, sonst letzte Überschrift). Einige
  Bezeichnungen passen nicht (der Rumpf des Haupt-Skripts Z 27566 erscheint als „SQStore“, DrumSynth-Funktionen Z 265xx–267xx
  ebenso, „HM1-END“, „Ende“ = T1-Kern-Ende). Darum nennt MESSUNG die Funktionen mit Zeilennummer.
- Service-Worker lässt sich lokal nicht prüfen (registriert nur über https); das Update-Verhalten ist aus dem Code abgeleitet
  und am Gerät zu bestätigen. `Cache-Control: max-age=600` der Online-Seite ist angenommen, nicht gemessen.

## Wichtigste Befunde (kurz)
1. Je Fassung ~2,9 MB, aber **zweimal** geladen (`?v=` und danach die normale Adresse).
2. Start bei 4×: bereit 2,57 s; längste Aufgabe 1,22 s = Haupt-Skript übersetzen (925 ms) + Rumpf (397 ms); HTML lesen +
   dekodieren 0,74 s. Bei 1×: bereit 0,60 s, längste Aufgabe 0,22 s.
3. Erste Antwort auf ▶: 368 ms (4×) / 152 ms (1×); davon ~210 ms (4×) Trommel-Klänge, die erst beim ersten ▶ gebaut werden.
4. Leerlauf: Hauptthread 17–19 % belegt (4×), vor allem `renderPartBar` jedes Bild (erzwingt Layout).
5. Abspielen: Hauptthread ~85 % (4×), Compositor-Abgleich 2,2 s je 8 s → eigenes Paket PERF2.
6. Spektral/Video/Import/Gesang tun beim Start nichts, kosten aber Übersetzen (SPK allein −10 % wenn ausgelagert).

## Nächster Schritt
PLAN.md Top 5: zuerst PERF1A (Update einmal laden), PERF1B (Trommel-Klänge im Leerlauf), PERF1C (renderPartBar-Vorprüfung) –
klein, unsichtbar, niedriges Risiko. PERF1D (Auslieferung ohne Kommentare) und PERF1E (Spektral erst bei Bedarf) danach.
Nr. 12/13 im Plan nur nach Xanders Okay (berühren das erzwungene Update bzw. „eine HTML-Datei“).

# PERF1 Schritt 2 – Bauen (index.html = 4.69.0 + PERF1A + PERF1B)

VERSION bleibt '4.69.0'. Aussehen und Bedienung unverändert. 62 neue Zeilen, keine vorhandene Zeile geändert.
Bau: `node bau/bau.cjs basis.html index.html a,b` (Blöcke in bau/block-a.js, bau/block-bc.js).

## Was drin ist
| Maßnahme | Block | Haken (Ein-Zeiler, typeof-geschützt) |
|---|---|---|
| PERF1A Update nur einmal laden | `/* PERF1A-BEGIN */ … -END` vor `init()` am Ende des Haupt-Skripts | in `vwReload` vor `location.replace(…?v=…)`: `if (typeof perf1aPre === 'function' && await perf1aPre(v, o)) return;   /* PERF1A */` |
| PERF1B Trommel-Klänge vor dem ersten ▶ | `/* PERF1B-BEGIN */ … -END` ebenda | in `drumBufsStep` nach `const c = AU.ctx; if (!c) return null;`: `if (DRB.ctx !== c && typeof perf1bTake === 'function') perf1bTake(c);   /* PERF1B */` |

Neue Namen: PERF1B, perf1bRate, perf1bStart, perf1bIdle, perf1bTake, perf1aPre. Neuer localStorage-Schlüssel `synq.perf1b.sr`
(zuletzt gesehene Abtastrate; ohne Eintrag 48 kHz).

## Messung (Chromium 428×926, 4× gedrosselt, Median aus 3, CPU geteilt → ±10–15 %)
- Start (bereit): unverändert im Rauschen (s2: 2 648 → 2 637 ms; s3: 2 891 → 2 705 ms ruhig, 2 532 → 2 899 ms spaet). Erwartet:
  PERF1B beginnt erst nach `load` im Leerlauf, PERF1A läuft nur beim Update.
- PERF1B, ▶ 3 s nach bereit: Sperrzeit nach dem Tipp 427 → 306 ms (s2) bzw. 517 → 384 ms (s3), also −121 / −133 ms (−26–28 %).
  Die lange Aufgabe nach dem Tipp-Handler (bisher mit drumBufs) 165 → 93 ms (s2) bzw. 158 → 97 ms (s3). Die erste Aufgabe
  (pointerdown, ≈ 310–370 ms) bleibt: das ist ensureAudio (buildBuffers/buildFx/Worklets), nicht drumBufs.
  Zwischen bereit und Tipp keine zusätzlichen langen Aufgaben (Schritte einzeln im Leerlauf). 1×: 84 → 78 ms (dort ist drumBufs
  ohnehin keine lange Aufgabe). Kosten: ≈ 1,4 MB Puffer liegen schon vor dem ersten ▶ im Speicher.
- ▶ sofort bei bereit (`tippen`): kein Effekt (Vorbau startet erst nach `load`, dann ist die Umgebung schon da → alter Weg).
- PERF1A (mess/probe-a.mjs, Plattenspeicher-Profil, Server max-age=600 + ETag): vorher 1 Download beim Update, danach startet die
  normale Adresse innerhalb 10 min mit der **alten** Fassung aus dem Browser-Cache (Nebenbefund bestätigt; VW lädt dann erneut,
  nach 10 min kommt die Datei ein zweites Mal). Nachher: 1 Download (Vorlauf), Neuladen = 304 ohne Inhalt, nächster Start sofort
  die neue Fassung ohne Abruf.

## Verworfen
- PERF1C (Vorprüfung renderPartBar über ResizeObserver): funktioniert (clientWidth-Lesungen 120/s → 0), aber ohne messbaren
  Gewinn: im Leerlauf 0 Layouts in beiden Fassungen (das Lesen erzwingt nichts, wenn nichts geändert ist), beim Abspielen
  Layouts −8–10 %, Layout-Zeit und Last aber nicht kleiner (65 → 73 %, 72 → 79 % – Rauschen). Erfüllt die Regel (≥ 5 % Start oder
  klar weniger lange Aufgaben) nicht → nicht eingebaut. Block bleibt in bau/block-bc.js für PERF2 (Compositor/Abspielen).
  Die Schritt-1-Schätzung (17–19 % Leerlauf-Last) galt für das Fenster direkt nach bereit (Nacharbeit), nicht für den Dauer-Leerlauf
  (gemessen 5–7 %).

## Grenzen / am Gerät prüfen
- PERF1A ist lokal ohne Service-Worker geprüft (registriert nur über https). Am iPhone prüfen: Fassung X+1 hochladen, App offen
  lassen → nach dem Neuladen zeigt sie X+1 und die Adresse ist die normale (ohne ?v=); nächster Start vom Home-Bildschirm zeigt
  sofort X+1, Datenzähler ≈ 1× Dateigröße. Rückfall: zweiter Versuch je Fassung nimmt immer den alten ?v=-Weg; Vorlauf-Zeitlimit 60 s.
  Mit Service-Worker: der Vorlauf geht durch `sw.js` (`fetch(rq)` behält cache: 'reload') und füllt auch dessen Kopie.
- PERF1B: Rate ab dem zweiten Start bekannt; beim allerersten Start 48 kHz angenommen (iPhone üblich). Andere Rate → alter Weg.
- Chromium statt Safari; Messwerte sind Richtwerte.

## Nicht in diesem Schritt
PERF1D (Auslieferung ohne Kommentare, −19 % gzip) und PERF1E (Spektral erst beim Öffnen) – eigene Schritte laut PLAN.
Nebenbeobachtung für den nächsten Plan: die erste Aufgabe nach dem ersten Tipp (ensureAudio, ≈ 310–370 ms bei 4×) ist jetzt der
größte Posten beim ersten ▶.

# PERF1 Prüfung – Befunde behoben (index.html = 4.69.0 + PERF1A neu + PERF1B unverändert)

VERSION bleibt '4.69.0'. Aussehen und Bedienung unverändert. Diff basis → index: 95 Zeilen neu, 0 entfernt oder geändert.
Bau wie bisher: `node bau/bau.cjs basis.html index.html a,b` (PERF1A-Block in bau/block-a.js neu, bau.cjs hat einen Haken mehr).
Vorher-Stand zum Vergleich: `fix/index-vorfix.html` (= Prüf-Stand), `fix/block-a-vorfix.js`, `fix/bau-vorfix.cjs`.

## Was geändert ist (nur im PERF1A-Block + 1 neuer Haken)
| Befund | Änderung |
|---|---|
| 9 Rückfall lädt während Wiedergabe/Aufnahme/Feld neu | Scheitert der Vorlauf (alte Fassung, Netzfehler, 60-s-Grenze), ruft perf1aPre den Rückfall `?v=` jetzt selbst über dasselbe `go()` auf wie den Erfolgsweg und gibt `true` zurück – die alte Zeile `location.replace(…?v=…)` in vwReload wird nach einem Vorlauf nicht mehr erreicht. `go()` prüft `vwIdle()` (Wiedergabe, Song-Aufnahme, `rec.state`, Feld) vor **und nach** dem Speichern; sonst alle 3 s neu. |
| 11 zweite VW-Prüfung bricht den Vorlauf ab | Neuer Haken am Anfang von vwReload: `if (typeof perf1aBusy === 'function' && perf1aBusy()) return;   /* PERF1A */`. Solange ein Vorlauf läuft oder `go()` wartet, tut ein zweiter Aufruf nichts (kein `o.n++`, kein Cache-Löschen, kein `?v=`). `pageshow` aus dem Zurück-Cache setzt die Sperre zurück. |
| 12 9-MB-Seite als Zeichenkette | Antwort wird als Strom gelesen (`getReader` + `TextDecoder`), gesucht wird nur die Fassungszeile (erste `const VERSION` mit Ziffern-Fassung, bei ≈ 26 % der Datei). Neue Fassung: Rest wird nur noch zu Ende gelesen (Zwischenspeicher vollständig), nie als ganze Zeichenkette gehalten. Ohne Strom-Unterstützung: wie bisher `r.text()`. |
| 10 veralteter Zwischenstand | Alte Fassung erkannt → Abruf sofort abgebrochen (`AbortController`), dann Rückfall. Wirkung siehe Messung: **nur ohne Service-Worker** weniger Daten im Moment; mit Service-Worker liest dessen Kopie (`r.clone()` → `cache.put`) die alte Seite trotzdem zu Ende. Befund 10 bleibt damit ein (seltenes) Risiko, siehe unten. |
| Zeitgrenze | Nach 60 s wird der Abruf abgebrochen statt im Hintergrund weiterzulaufen. |

Neue Namen: PERF1A, perf1aBusy, perf1aRead (topdefs 7 613 → 7 616, 0 doppelt).

## Messung (fix/p1a-fix.mjs: Online-sw.js von Hand registriert, Plattenspeicher-Profil, Server max-age=600 + ETag, Seite in 64-KB-Stücken je 4 ms gesendet, gezählt wird, was wirklich rausging; 1×, je Szenario 1 Lauf vorher/nachher nacheinander)
| Szenario | vorher (Prüf-Stand) | nachher |
|---|---|---|
| altspiel: normale Adresse antwortet nach 9 s alt, ▶ bei +4 s, Stopp bei +14 s | Neuladen bei +9,75 s, **während Wiedergabe** (`pagehide` playing = true) | Neuladen bei +15,24 s = 1,07 s **nach dem Stopp**, playing = false |
| feld: wie altspiel, statt ▶ Fokus in einem Eingabefeld +4…+14 s | Neuladen bei +10,18 s **mit Fokus im Feld** | Neuladen 1,86 s nach dem Verlassen des Felds |
| netz: Verbindung nach 9 s weg (Chromium wiederholt 1×, 2 × 9 s) | Neuladen +18,2 s (nach Stopp, weil der Fehler erst nach 18 s kam) | Neuladen +18,3 s, nach Stopp; nicht trennscharf, aber kein Fehler |
| wettlauf: zweite VW-Prüfung bei +2 s, normale Adresse braucht 6 s | `?v=` bei +2,3 s, Vorlauf läuft im Hintergrund weiter: **2 volle Downloads (17,2 MB)** | zweite Prüfung tut nichts; 1× 200 (Vorlauf) + 1× 304 (Neuladen), **8,6 MB**, Seite `/` 4.69.1, nächster Start 0 Abrufe |
| ok (Normalfall) | 200 + 304, 8,6 MB, nächster Start 4.69.1 ohne Abruf | gleich: 200 + 304, 8,6 MB, nächster Start 4.69.1 ohne Abruf |
| alt (veralteter Rand-Zwischenspeicher) mit Service-Worker | 2 × 8,6 = 17,2 MB, nächster Start alt | gleich 17,2 MB (Service-Worker liest seine Kopie zu Ende), nächster Start alt |
| alt **ohne** Service-Worker | 17,2 MB, nächster Start alt aus dem Zwischenspeicher (0 Abrufe) | Vorlauf nach 3,9 MB abgebrochen + `?v=` 8,6 MB; der nächste Start holt die normale Adresse neu (+8,6 MB, hier noch alt, im Echtbetrieb ggf. schon neu) |
| basis (alt / altspiel) | – | `?v=` nach 139 / 158 ms, 8,6 MB |
Lange Aufgaben (≥ 50 ms) während des Vorlaufs: in ok/feld/wettlauf/alt 0; in altspiel/netz nur die schon im Prüf-Stand vorhandenen (▶-Start, 97–271 ms). 0 Seitenfehler in allen Läufen.
Rohdaten: fix/a-*.json, Übersicht `node fix/zeig-a.cjs fix/a-*.json`, Reihe fix/serie-a.sh, fix/serie-c.sh (ohne Service-Worker).

## PERF1B (unverändert)
Ein Kontroll-Paar (fix/p1b.mjs = pruef/p1b.mjs, 4×, Rate bekannt, Rechner stark belegt): Trommel-CPU nach dem Tipp 68,5 → 0 ms,
Vorbau 8/8 vor dem Tipp. Sperrzeiten aus einem Paar unter dieser Last nicht aussagekräftig (2 054 / 2 283 ms, beide Fassungen
gleich gestört) – die Gewinnzahl der Prüfung (Median aus 5: −183 ms) gilt weiter, der PERF1B-Code ist bytegleich.

## Befund 10 – Abwägung (offen, nicht gebaut)
Mit Service-Worker (der Normalfall online) kostet ein veralteter Rand-Zwischenspeicher weiterhin 2 Downloads. Ein billiger Vorab-Test
wäre ein HEAD-Vergleich (ETag der normalen Adresse gegen `?v=`; HEAD geht am Service-Worker vorbei) – nur vorschlagen, weil das
ETag-Verhalten von Pages hier nicht messbar ist (Proxy 403). Da Pages Seite und version.json im selben Hochladen tauscht, ist der Fall
selten; im ungünstigsten Fall ist es 1 Download mehr als basis, dafür im Normalfall 1 statt 2.

## Am iPhone prüfen (unverändert + neu)
- Update bei offener App → nach dem Neuladen normale Adresse mit der neuen Fassung, Start vom Home-Bildschirm sofort neu, Datenzähler ≈ 1×.
- Neu: Update auslösen und sofort ▶ (oder Gesang aufnehmen) – Neuladen erst nach Stopp.
