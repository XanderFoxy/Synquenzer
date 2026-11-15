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
