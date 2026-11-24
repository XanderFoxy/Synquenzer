# Werkstatt 3 – Silben und Wörter (`js/silben.js`)

`js/silben.js` erkennt in einer Gesangsaufnahme die Silben und Wörter und legt sie auf die Zeitachse. Daraus macht die
Pianorolle Beschriftungen, mit denen man Silben, Wörter und Zeilen ziehen kann. Alles wird lokal gerechnet, die Aufnahme
verlässt nie das Gerät. Das Sprachmodell lädt nur Modelldateien herunter und schickt keine Audiodaten weg. Das ist im
Browser geprüft (siehe unten).
Das Modul ist ein ES-Modul ohne `window`/`document` auf oberster Ebene und läuft deshalb auch in einem Worker.

## Einbindung

```js
import { silben, woerter, modellStatus, modellBeenden } from './js/silben.js';

// x: Float32Array (mono), sr: Abtastrate – z. B. aus io.js: const { x, sr } = await laden(datei);
const S = silben(x, sr);                 // alle Silben der Aufnahme (~1 s für 4½ min, gut für den Worker)
const W = await woerter(x, sr, { silben: S });                         // ohne Text: Wort-Kandidaten
const W2 = await woerter(x, sr, { silben: S, text: liedText });        // bekannter Text → auf die Silben gelegt
const W3 = await woerter(x, sr, { silben: S, modell: true,             // lokales Sprachmodell
  zustimmung: async ({ mb, wie }) => confirm(`Sprachmodell laden? ${mb} MB, einmalig, bleibt auf dem Gerät.`),
  fortschritt: (anteil, text) => zeige(text) });
console.log(W3.quelle, W3.hinweis);      // 'modell' | 'text' | 'silben' + Klartext für die Anzeige
```

### `silben(x, sr, opt)` → `[{t0, t1, kern, staerke, db, hz, tal}]`
- `t0` ist der Silbenanfang (Konsonant bzw. Einsatz) und `t1` das Silbenende (nächste Silbe, Stimme 25 dB unter dem Kern
  oder stimmlos). `kern` ist der Gipfel des Vokals. Alle Zeiten sind in Sekunden und absolut, auch wenn mit `von`/`bis`
  nur ein Ausschnitt gerechnet wurde.
- `staerke` (0…1) gibt an, wie sicher die Erkennung ist. Damit lassen sich die Beschriftungen abstufen oder unsichere
  Silben ausblenden.
- `db` ist die Lautstärke des Kerns relativ zur lautesten Stelle (0 = laut).
- `hz` ist der Grundton des Kerns, der Ton der Silbe in der Pianorolle. Bei stimmlosen Silben ist er `null`.
- `tal` ist die Tiefe des Konsonanten-Tals davor in dB. Ein kleiner Wert heißt gebunden gesungen.
- Optionen:
  - `von` und `bis` in Sekunden.
  - `empfindlich` von 0 bis 1, Standard 0,5. Höher findet mehr Silben und bringt mehr Fehlalarme.
  - `minAbstand`, Standard 0,2 s. Für sehr schnellen Gesang verkleinern.
  - `bezug`: fester Pegel in dB, damit Ausschnitte gleich bewertet werden.

Verfahren:
1. Tiefpass und Abwärtstastung auf rund 16 kHz, Merkmale alle 5 ms:
   - Vokalband-Energie 250–3000 Hz
   - SuperFlux-Einsatzfunktion mit 24 Bändern je Oktave und Maximumfilter über die Frequenz, damit Vibrato keine
     Einsätze erzeugt und Hall (nur abklingend) nicht zählt
   - Stimmhaftigkeit und Grundton aus der normierten Autokorrelation, alle 20 ms
2. Kandidaten sind die Gipfel der Einsatzfunktion und die Täler der Vokal-Energie. Jeder Kandidat wird bewertet nach:
   - Einsatzstärke
   - Tal-Tiefe links und rechts
   - Lautstärke danach
   - Einbruch der Stimmhaftigkeit (Konsonant)
3. Danach muss ein stimmhafter Kern folgen. Atmer, Klicks und Zischen allein zählen nicht.
4. Je 0,2 s bleibt nur der stärkste Kandidat.

### `woerter(x, sr, opt)` → `[{t0, t1, text, silben:[…], zeile, quelle, p}]`
Jede Silbe in `silben` trägt die Felder von oben und dazu `text`:
- `'–'` steht für eine gedehnte Silbe ohne eigenen Text (Melisma).
- `geschaetzt: true` heißt: die Silbe wurde im Text erwartet, aber nicht gehört, ihre Zeit ist geschätzt.

`zeile` ist die Zeilennummer, für „Zeile ziehen“. Am Array hängen `.quelle` und `.hinweis`. Je nach Aufruf gibt es drei Wege:

| Aufruf | Ergebnis |
|---|---|
| ohne `text`/`modell` | **Wort-Kandidaten ohne Text** (`text: null`): gebunden Gesungenes wird zusammengefasst, nach einer Pause (≥ 0,35 s) beginnt eine neue Zeile. Der `hinweis` sagt das ehrlich. |
| `text: "Zeile 1\nZeile 2"` | Der bekannte Text wird ohne Modell auf die Silben gelegt (dynamische Programmierung mit Pausen als Anker; die Silbentrennung ist eine Faustregel für Englisch/Deutsch, siehe `silbenTeilen`). |
| `text: [{text, zeile, silben:[{text, t}]}]` | Wie oben, aber mit Zielzeiten je Silbe, z. B. `ziel_s` aus `werkstatt/daten/lied.json`. **Das ist der beste Weg für Xanders Lied**: Die Silben rasten auf die tatsächlich gesungenen Einsätze ein. |
| `modell: true` | Whisper erkennt die Wörter lokal mit Wort-Zeitstempeln. Die Wörter werden auf die Silben gelegt, und der Verzug der Zeitstempel wird geschätzt und abgezogen. |

### Sprachmodell: derselbe Weg wie im Synquenzer
Der Synquenzer (`index.html`, stiller Block `sq-g9-src`, „G9A“) nutzt das Modell schon. `silben.js` übernimmt es **1:1**,
damit es nicht doppelt geladen wird:
- Modell: `onnx-community/whisper-base_timestamped`, Revision `608c49e6…`
- transformers.js 4.3.1 und onnxruntime-web 1.31.0-dev von jsDelivr
- dieselbe Dateiliste mit Größen und SHA-256-Prüfsummen
- **derselbe Cache-Name `synq-g9-asr-v1`** und dieselben URLs als Schlüssel

Werkstatt 3 liegt im selben Repo und damit unter derselben Herkunft (xanderfoxy.github.io). Was der Synquenzer schon
geladen hat, ist hier sofort da (`modellStatus().da === true`, `mb: 0`), und umgekehrt genauso.

So läuft das Laden:
- Der Weg wird wie im Synquenzer gewählt: WebGPU, wenn es mit `shader-f16` geht, sonst WebAssembly. Ein Satz, der schon
  vollständig im Cache liegt, hat Vorrang.
- Größe der Download-Sätze:

  | Weg | Größe |
  |---|---|
  | WebAssembly | ≈ 90 MB |
  | WebGPU | ≈ 120 MB |

- **Ohne Zustimmung wird nichts geladen.** `zustimmung(info)` wird nur gefragt, wenn noch etwas fehlt. `info` enthält
  `mb`, `gesamtMb`, `wie`, `modell` und `quellen`.
- `modellStatus()` zeigt den Stand vorher an (für die Größenanzeige).
- `modellBeenden()` gibt den Speicher des Workers frei. Nach 3 Minuten Ruhe passiert das auch von selbst.
- `modellEntfernen()` löscht das Modell aus dem Cache. Achtung: Der Cache ist mit dem Synquenzer geteilt, dort ist es dann
  auch weg.
- Scheitert das Laden, kommen die Kandidaten ohne Text zurück, und im `hinweis` steht der Grund.

Für das Modell wird nur gesendet, was hörbar ist:
1. Die Strecken mit Silben werden auf 16 kHz gebracht (gefensterter Sinc, vorberechnet).
2. Zwischen die Strecken kommen 0,3 s Stille.
3. Der Strom wird in Fenster von höchstens 30 s geschnitten.
4. Wörter in der eingefügten Stille oder ohne Silbe gelten als erfunden und fliegen raus, ebenso Wiederholungsschleifen.

## Ergebnisse

Die Prüfstände liegen außerhalb des Repos, im Scratchpad unter `silben-test/`:

| Datei | Prüft |
|---|---|
| `test.mjs` | Silben |
| `testw2.mjs` | Text-Ausrichtung |
| `asr/asrtest.mjs` | Modell in Node |
| `browser/run.mjs` | Ende-zu-Ende in Chrome |

**Aufnahme und Referenz:**
- Aufnahme: `original/Gesang-Platzhalter-3.wav` (48 kHz, 24 bit, mono, roh mit Hall).
- Referenz: Silbenkarte der Werkstatt 2 mit 160 Silben und Silbenanfängen. Die Zeiten liegen auf der Zeitachse der
  Rohaufnahme (`a_roh` in `werkzeug/lied.json`).
- `werkstatt/daten/lied.json` hat nur die Notenziele (`ziel_s`), die `einsatz`-Zeiten gelten für die fertige Fassung.
  Gegen beide wurde zum Vergleich ebenfalls gemessen.

### Silbenanfänge (`silben`, Standard `empfindlich: 0.5`, Toleranz ±40 ms)

| Ausschnitt / Referenz | Treffer | Fehlalarme | mittl. Abweichung | ±70 ms |
|---|---|---|---|---|
| **Refrain 1, 63–96 s**, gegen `a_roh` | **24/27 (89 %)** | 8 von 32 (25 %) | 16 ms | 25/27 |
| Refrain 1, gegen `einsatz` (andere Fassung) | 17/27 | 15 | 21 ms | 21/27 |
| Refrain 1, gegen `ziel_s` (Notenraster) | 14/27 | 18 | 19 ms | 19/27 |
| ganzes Lied (266 s), gegen `a_roh` | 100/160 (63 %) | 81 von 181 | 16 ms | 113/160 |

Mit `empfindlich` verschiebt sich das Verhältnis:

| `empfindlich` | Refrain 1: Treffer | Refrain 1: Fehlalarme |
|---|---|---|
| 0,3 | 21/27 | 7 |
| 0,7 | 24/27 | 22 |

In Refrain 1 bleiben drei Silben ohne Treffer:

| Silbe | Erkannt | Grund |
|---|---|---|
| „know“ | +194 ms | Dort liegt der Einsatz der Fassung v10 |
| „this“ | +128 ms | Gefunden wird der Vokal, das „th“ davor nicht |
| „fol“ | −59 ms | knapp außerhalb der Toleranz |

Die Fehlalarme sind meist Doppel-Einsätze in Diphthongen und Konsonant-Vokal-Folgen, etwa „wa-ke“, „u-p“ oder „o-pen“.

**Laufzeit:**

| Umgebung | Refrain 1 (33 s) | ganzes Lied (266 s) |
|---|---|---|
| Node 22 | 0,19 s | 1,1 s |
| Chrome (headless) | 0,14 s | 0,99 s |

### Wörter (Refrain 1)

| Weg | Ergebnis |
|---|---|
| ohne Text (Kandidaten) | 31 Kandidaten für 23 Wörter; 20 von 23 Wortanfängen getroffen (±40 ms), 7 Zeilen nach Pausen. Mehrsilbige Wörter werden fast nie richtig gebündelt (ohne Sprache nicht entscheidbar). |
| bekannter Text als Zeichenkette | 17/26 Silben mit richtigem Text und Zeit (±40 ms); ganzes Lied nur 36/160 (der Text wiederholt sich, ohne Zeitanker verrutscht die Zuordnung) |
| **bekannter Text + Zielzeiten (`ziel_s`)** | **23/26** Silben richtig (±40 ms); ganzes Lied 91/160 (fast alle, die der Silbenfinder überhaupt findet) |
| Sprachmodell (Whisper base, lokal) | erkannt: „We claim we know it all. can't see who is behind this wall. Don't wait for the that lies. We cannot open your eyes.“ Etwa 19 von 23 Wörtern stimmen im Text, 11/26 Silben mit Text **und** Zeit. Im ganzen Lied sind die Refrains gut, die Strophen schwach (58/138 Wörter). |

**Ende-zu-Ende in Chrome (headless):**
- Ablauf: Leerer Cache → Zustimmung mit 90 MB gefragt → Laden mit Fortschritt und Prüfsummen → Start → Erkennung.
- Die Modelldateien kamen aus lokalen Kopien mit identischen Prüfsummen, weil jsDelivr in der Prüfumgebung gesperrt ist.
- Laufzeit Refrain 1, erster Durchgang: 15,0 s einschließlich Laden und Start.
- Laufzeit Refrain 1, zweiter Durchgang: 4,8 s (WebAssembly, ein Faden).
- Danach meldet `modellStatus()`: `da: true`, `mb: 0`.
- **Netzverkehr: nur GET-Abrufe der 10 Modelldateien, 0 Byte gesendet**, keine Audiodaten.

## Grenzen
- **Konsonanten am Anfang:** Die Referenz setzt den Silbenanfang an den Konsonanten-Beginn. Lange „s/sch/f“ am Anfang
  (sake, Sheep, fake) findet `silben` am Vokal, also bis zu 0,4 s zu spät. Ein Versuch, den Anfang über das Zischen
  zurückzuverlegen, hat insgesamt geschadet: Ein „s“ am Wortende („this wall“) ist akustisch nicht von einem „s“ am
  Wortanfang zu unterscheiden. Deshalb ist er nicht eingebaut.
- **Strophen und gebundener Gesang:** Hier liegt die Trefferquote deutlich unter Refrain 1, im ganzen Lied 63 %.
  Fehlalarme kommen vor allem von Diphthongen, Plosiven am Silbenende und Atmern direkt vor Einsätzen.
- **Ohne Text** sind die Wortgrenzen geraten. Gesang trennt Wörter akustisch kaum.
- **Mit Text als Zeichenkette** kann die Zuordnung bei Fehlalarmen um eine Silbe verrutschen. Mit Zielzeiten
  (`ziel_s`) passiert das kaum.
- **Faustregel für die Silbentrennung:** „Everything“ wird zu 4 statt 3 Silben. Die Ausrichtung gleicht das aus, besser
  sind aber vorgegebene Silben (`silben:[{text, t}]`).
- **Sprachmodell:**
  - Wie gut gesungener Text erkannt wird, hängt stark vom Teil ab.
  - Die Wort-Zeitstempel kommen 0,3–0,5 s zu spät; das wird geschätzt und abgezogen.
  - Erkannte Wörter ohne eigene Silbe werden verworfen.
  - Im Browser braucht es ≈ 5 s je 30 s Gesang (WebAssembly). Für ein ganzes Lied sind das ≈ 40–60 s, deshalb sollte
    es im Hintergrund laufen.
- **Schneller Gesang** mit mehr als ~5 Silben/s braucht einen kleineren `minAbstand`.
- **Nicht geprüft:** WebGPU-Weg und Safari. Die Logik für WebGPU ist 1:1 aus dem Synquenzer übernommen, inklusive des
  Rückfalls auf WebAssembly.
