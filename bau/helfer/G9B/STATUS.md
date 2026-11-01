# G9B – gesungene Wörter automatisch erkennen (G9b-0/1/2) · App 4.26.2

**Stand:** gebaut und in Chromium getestet (43/43). **Nicht abgenommen** – Xander muss es am iPhone prüfen.

## Modell, Bibliothek, Größe
| | WASM-Weg (Vorgabe) | WebGPU-Weg (nur mit Adapter + shader-f16) |
|---|---|---|
| Modell | whisper-base mehrsprachig, Encoder + Decoder 8-Bit | Encoder fp16 (GPU), Decoder 8-Bit (WASM) |
| Download einmalig | **≈ 90 MB** (94,5 MB) | ≈ 119 MB (125,3 MB) |
| Laufzeit | onnxruntime-web 1.31.0-dev (14,3 MB) | asyncify-Fassung (26,9 MB) |

- Modell: `onnx-community/whisper-base_timestamped`, feste Revision `608c49e6…`, von huggingface.co.
- Bibliothek: transformers.js **4.3.1** (npm-CDN). 4.3.2 aus der Spec ist erst 5 Tage alt → nach Regel „≥ 2 Wochen“ 4.3.1 genommen
  (gleiche Laufzeit-Version).
- Cache: `synq-g9-asr-v1` (sw.js löscht `synq-g9-*` nicht; nur Kommentar ergänzt). SHA-256 je Datei im Code.

## Zeiten (Chromium, dieser Rechner, WASM, 1 Kern)
| | Zeit |
|---|---|
| Download 94,5 MB (schnelles Netz hier) | ≈ 6 s |
| Modell-Start aus dem Cache (neuer Worker) | 1,6–2,5 s |
| EN-Satz 3,7 s, Sprache „Auto“ | 8,9 s (davon Sprach-Erkennung 4,2 s) |
| DE-Satz 5,5 s, Sprache fest | 6,7 s |
| [Stopp] beim Laden / beim Erkennen | 11 ms / 0,5 ms |
| längste Aufgabe im Haupt-Faden während Laden + Erkennen | 0 ms (> 50 ms: keine) |

iPhone-Zeiten fehlen noch (Spec-Ziel WASM ≤ 45 s, WebGPU ≤ 15 s je 30-s-Fenster).

## Treffer
- **Englisch** (synthetische Stimme): „The sun is shining over the city, and my heart is singing.“ – **12/12 Wörter richtig**,
  Sprache „Auto“ → en richtig, 16 Silben auf Marken verteilt.
- **Deutsch:** Im Container gibt es keine deutsche Sprachausgabe (Installation einer TTS wurde blockiert). Der Testsatz ist eine
  englische Roboterstimme mit deutscher Lautschrift → Erkennung „Ich will die Hälfte des Erkrankens …“ (Wörter + Zeiten + Silben + Undo
  laufen, die **Güte für Deutsch ist hier nicht messbar**). Das Modell lief dabei in eine Wiederholungs-Schleife: Token-Obergrenze nach
  Fensterlänge eingebaut (36 s → 7 s), die Schutz-Regel kürzt auf 2×.
- Echte Güte bei Gesang → nur am iPhone mit Xanders Stimme.

## Was getestet ist (tests/, `sh tests/alle.sh`)
smoke (5) · t1 echter Download, Stopp beim Laden, Weiterladen, DE/EN, ein Undo, Neuladen + offline aus dem Cache, Stopp beim Erkennen (12) ·
t2 Taste [Erkennen]/[Stopp], Blatt mit Größe, Laden per Tipp, Haupt-Faden frei, Automatik nur mit Modell im Cache, [Entfernen] (11) ·
t3 Regel 28 gegen basis.html (Klang-Prüfsummen, Marken, Projekt-JSON gleich) (12) · t4 WebGPU-Weg → Rückfall auf WASM (3).
Dazu die G9D-Prüfer mit Ersatz-Modell gegen diese Datei: unverändert grün (einzige Abweichung gewollt: [Erkennen] ist jetzt sichtbar).

## Offen / Risiken
- WebGPU-Weg selbst ungetestet (Chromium hier hat nur Software-WebGPU ohne fp16 → Rückfall getestet). Am iPhone: Diagnose `?g9diag=1`
  zeigt im Erkennen-Blatt Weg, Startzeit, Zeit je Fenster, Abrufe.
- npm-CDN ist im Container gesperrt: Tests liefern Bibliothek/Laufzeit aus den npm-Paketen (gleiche Bytes, SHA-256 prüft die App).
  Am iPhone kommt alles echt von cdn.jsdelivr.net und huggingface.co.
- Speicher iPhone: Worker beendet sich nach 3 min Ruhe (Modell ≈ 150 MB im Speicher frei), Neustart aus dem Cache.

## Bitte prüfen (Xander, iPhone)
1. Text-Modus öffnen → [Erkennen] → Blatt zeigt „≈ 90 MB“ (oder ≈ 119 MB) → [Laden und erkennen]: Fortschritt in MB, Taste wird [Stopp].
2. Einmal mitten im Laden [Stopp] → „Laden gestoppt“; nochmal [Erkennen] → lädt weiter.
3. Ein gesungener deutscher Take: Wörter richtig? Silben auf den richtigen Marken? Ein ↶ nimmt alles zurück.
4. App schließen, Flugmodus, wieder öffnen → [Erkennen] geht ohne Netz.
5. Neue Aufnahme (Stimme-FANG/REC) → Text erscheint von selbst.
6. Mit `?g9diag=1`: welcher Weg (wasm/webgpu) und Zeit je Fenster?
