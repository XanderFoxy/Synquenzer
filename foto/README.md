# Bildwerk – Foto-Bearbeitung auf dem Gerät

Web-App für das iPhone (Safari): <https://xanderfoxy.github.io/Synquenzer/foto/>

- Alles läuft auf dem Gerät. Es werden keine Bilder hochgeladen und es gibt keinen Server.
- Die Bild-Kette läuft auf WebGL2. Die Vorschau hat Bildschirmgröße, beim Sichern wird in voller Auflösung in Kacheln gerechnet.
- Schwere Rechnungen (Analyse, Masken, Füllen, Hochskalieren) laufen in Workern.
- Die KI-Modelle werden erst bei Bedarf vom CDN geladen. Die App zeigt dabei den Fortschritt und die Größe samt Laufzeit. Danach liegen die Modelle im Cache Storage und gehen auch offline.
- Jede KI-Funktion hat einen einfacheren Weg ohne Modell („Ohne Modell“).
- Gespeicherte Personen für „Gesicht auffrischen“ (Name, Referenzfotos, Merkmals-Vektoren) liegen nur auf dem Gerät (IndexedDB) und lassen sich mit „Alle löschen“ entfernen. Die Nutzungsprotokolle der Bild-Laufzeit (MediaPipe) werden gesperrt; außer den Modell-Downloads geht nichts ins Netz.

## Dateien

`index.html`, die ES-Module (`app.js`, `gl.js`, `regler.js`, `looks.js`, `analyse.js`, `auswahl.js`, `entfernen.js`, `hoch.js`, `batch.js`, `zuschnitt.js`, `modelle.js`, `personen.js`, `typen.js`, `rpc.js`), die Worker `wk-rechnen.js` und `wk-ki.js` sowie `sw.js` (Service Worker für den Offline-Betrieb). Es gibt keinen Build-Schritt.

## Modelle und Lizenzen

Die Modelle liegen nicht im Repo. Sie werden mit fester Revision von den Original-Quellen geladen.

| Funktion | Modell | Lizenz |
|---|---|---|
| Gesichtspunkte, Gesichter finden, Haut/Haare/Kleidung, Haare fein, Antippen | MediaPipe Face Landmarker, BlazeFace, Selfie Multiclass, Hair Segmenter, Interactive Segmenter, Magic Touch | Apache-2.0 |
| Feine Kanten (Haarspitzen) | MODNet (quantisiert) | Apache-2.0 |
| Tiefe im Bild | Depth Anything V2 Small | Apache-2.0 (nur Small) |
| Füllen | MI-GAN | MIT |
| Füllen, hohe Qualität (optional, groß) | LaMa | Apache-2.0 |
| Hochskalieren | Real-ESRGAN general-x4v3 | BSD-3-Clause |
| Identitäts-Prüfung beim Auffrischen | SFace (OpenCV Zoo) | Apache-2.0 |
| Gesicht ausrichten | YuNet (OpenCV Zoo) | MIT |

Die Laufzeiten sind `@mediapipe/tasks-vision` (Apache-2.0) und `onnxruntime-web` (MIT), beide vom CDN mit fester Version.

Beim Auffrischen eines Gesichts darf die Referenz nur dieselbe Person zeigen. Das prüft die App per Gesichts-Merkmal-Vergleich. Ist das Prüfmodell nicht geladen, bleibt die Funktion gesperrt.
