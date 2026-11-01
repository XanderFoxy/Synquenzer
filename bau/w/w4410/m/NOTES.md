# VK2 – Video-Ansicht „Mäusekino“ (Konzept V2) mit sichtbarem Klang-Morph (Konzept V1)

## 1. Für Xander

- Neue Video-Ansicht **Mäusekino**: Jede Spur ist eine Leuchtzeile. Du siehst ihren Pegel, die gerade klingenden Töne als Lauflicht über 88 Tasten (Helligkeit = Anschlag und Hüllkurve), wie viele Töne gehalten werden, die Schritte des laufenden Takts und bei den Drums 12 Pads, auf denen Akzente weiß glühen. Oben stehen Takt · Schlag · 16tel, der Teil und die Summe.
- Rechts (bei 9:16 unten) siehst du die Filterkurven aller Synths. Bei hoher Resonanz glühen sie. Wechselt eine Spur in einen Clip mit ◆-Klangzustand, siehst du die Ist-Kurve von Filter und Hüllkurven, die gestrichelte Ziel-Kurve, den Fortschritt in % und die Werte, die gerade gleiten (z. B. „CUTOFF 1,3 kHz → 300 Hz“). Das alles läuft genau so schnell und in derselben Kurve wie der Klang.
- So wählst du es: Takte oder Teil markieren → in der Zeile **Video** (2. Reihe, ganz rechts) auf **[Mäusekino]** tippen. Die Auto-Regie wählt es nie von selbst. Geht in 16:9 und 9:16.

## 2. Technische Änderungen (nur `m/index.html`)

Neuer Block `VK2-BEGIN … VK2-END` direkt nach `vv2Api()` (vor dem VV4-B/D-Block), rund 500 Zeilen. Außerhalb davon gibt es nur Einhänge-Zeilen mit dem Kürzel VK2:

| Stelle | Änderung |
|---|---|
| `v6aGo` | +1 Zeile `vk2Cap(i, old, st1, t0, t1, at, c)`: schreibt jede Fahrt in der Form von KV1 mit (t0, t1, at, c, a, b, m, prev). Im Offline-Render geht das je Render in `VK2.cap` (WeakMap, Schlüssel ist `off.tl` = `r.tl`, gilt also auch für die Bilder hinter dem Render), live sind es die letzten 8 Fahrten je Spur. Alles steht in try/catch. |
| `drumHit`, `mdHit` | je +1 Zeile `if (ex && ex.acc) h.log.acc = 1`: Der Schritt-Akzent steht dann im Noten-Log, damit „Akzente glühen“ ein echter Wert ist. Der Klang ändert sich nicht. |
| `vvRenderAudio0` (Ergebnis `r`) | **Fehlerbehebung aus G10a-5:** Der Kommentar `// G10a-5: lead` stand mitten in der Zeile. Dadurch waren `log, ms, wk, nt, t0` auskommentiert, und `VV.last` hatte weder Noten noch Zeitbasis. Folge: Stillbilder (`vvShot`) und alle Video-Bilder, die nach dem Ton-Durchlauf gezeichnet werden, hatten keine Noten (betrifft auch die Spur-, Roll- und Innenleben-Bilder). Der Kommentar steht jetzt am Zeilenende. |
| `VV_DIRV` / `VV4_NAME` | `'kino'` bzw. `kino: 'Mäusekino'` am Listenende angehängt |
| `vv4StripeCol` | +1 Zeile: Streifenfarbe `#ff6a3d` für Mäusekino |
| `vvDirRow` | 2. Reihe: `+ vk2DirBtn(B, v)` vor `</div>`. Die Taste heißt [Mäusekino] (≥ 44 px wie die anderen), der Tipp läuft über das bestehende `vvDirTap`/`vvDirSet` (1 Undo). |
| `vvDrawShot` | +1 Zeile: `if (sh.v === VK2_ID) { vk2Shot(…); return; }` (ganzes Bild, Kamera-Log wie VV4) |
| Test-API | +1 Zeile `Object.assign(SYNQUENZER, vk2Api())`, nämlich `vk2Probe`, `vk2At(t, fmt)` und `vk2Runs()` |

Inhalt des Blocks:
- **Werte:** Pegel kommen aus dem Meter des Renders (`mtrAt` wie `vvDrawMeters`). Noten und Hüllkurven-Pegel kommen aus `vv3VaState0` / `vv3MkState0` (VV3-Formeln, mit Ist-Klang inkl. ◆). Die Drum-Treffer liest der Block aus `src.nt`. Die Schritte des Takts kommen aus der Taktkarte (`barAt`/`barBeat`, auch für andere Taktarten).
- **Morph:** Der Wert ist `kv1RunV`/`kv1Q`, also dieselbe Formel wie Worklet und Regler: S-Kurve oder linear, Log-Raum bei Cutoff, stufig am Taktstrich. Die Ist-Kurve rechnet mit diesem Wert, die Ziel-Kurve mit dem Endwert. Die Spur-Werte (Lautstärke, Pan, Hall, Echo) laufen über `v6aS`. Der Start mit ▶ (Zustand sofort, t1 = t0) zählt nicht als Morph.
- **Filterform:** Gezeichnet wird eine Modellkurve aus Cutoff, Resonanz und Typ (LP24 als Ladder-Form 1/((1+jx)⁴+k), LP12/BP/HP als 2-Pol-Form, 24 dB als zwei Stufen). Bei MK kommen Cutoff und Resonanz aus `cutHz(f.cut)` und `1,1·f.res/127`.
- **Leistung:** Der ruhende Teil liegt als Pufferbild je Größe vor, die Glühpunkte als 64-px-Bilder je Farbe (`'lighter'`). Es gibt keinen shadowBlur und keine neuen Gradienten je Bild. Die Listen der Test-Sonde entstehen nur im Test (`VK2.full`).
- Kein Zufall, keine Uhr. Auto-Regie (`vvCuts`), Format, VERSION und CHANGES sind unverändert.

## 3. Tests und Zeiten

Prüfungen:
- topdefs: 0 Syntaxfehler, 0 doppelte Namen
- smoke: `errors []`
- Markenwörter 0, „MS 2000“ 1×, `  live: true,` 1×

Testlauf mit `vk2-test.mjs` (Song aus `n5-v-qm-lib` mit FM6 auf SYN 2 und MK mit Arp auf SYN 4, Akzente auf den Snare-Schritten, Regie Takt 5–10 = Mäusekino):
- **Regie:** Die Taste ist da, ein Tipp setzt den Eintrag `{a: 4, b: 10, v: 'kino'}`, und die Schnittliste ist `[[4, 10, 'kino']]`. Die Auto-Regie ohne Eintrag wählt nie 'kino'.
- **Formel (FM6, Log-Gesetz, 2 Takte):** Ist-Cutoff = a·(b/a)^s bei 0/25/50/75/100 %. Gemessen 4000/2669/1095/450/300 Hz, erwartet gleich. **MK (linear, 1 Takt):** 4605/786/134 Hz bzw. Resonanz 0,173/0,598/1,022, ebenfalls exakt wie erwartet.
- **Akzent:** 18 Akzent-Treffer im Log, das Pad glüht (acc 0,92).
- **Determinismus:** Fahrten von Render 1 und 2 sind gleich, ebenso alle Werte außer dem Pegel. Mit Meter aus (`VV.noMtr`) sind die Bilder bitgleich. Der Pegel selbst schwankt von Render zu Render schon in der **Basis** (auch die Song-Ansicht der Basis gibt zwei verschiedene Bilder), weil der Offline-Klang leicht variiert. Das kommt nicht von VK2.
- **Live-Vorschau:** Das Mäusekino läuft aus Live-Noten und Live-Fahrten, ohne Fehler.
- **Echtes Video (WebCodecs, H.264 1920×1080 + Opus, headless):** `vk2-video-16x9.mp4`, 275 Bilder, 9,17 s. Ein Bild daraus ist `vk2-video-frame.png`.

Bilder:
- `vk2-16x9-vor.png`
- `vk2-16x9-morph.png`
- `vk2-16x9-morph-mk.png`
- `vk2-16x9-akzent.png`
- `vk2-9x16-vor.png`
- `vk2-9x16-morph.png`
- `vk2-9x16-nach.png`

Zeiten: Takt 6–8, 16:9, 9,2-s-Video, dieselbe Seite, abwechselnd gerendert. Die Maschine war durch parallele Helfer belastet (Last 7–9 auf 4 Kernen), die Werte schwanken also stark.

| Lauf | Job | Bild-Mittel |
|---|---|---|
| Basis, Auto (App-Bild) | 10,3 s / 13,6 s | 28,9 / 38,2 ms |
| neu, Auto (App-Bild) | 10,1 s / 10,4 s | 26,5 / 29,2 ms |
| neu, **Mäusekino** | 8,4 s / 7,6 s | 20,4 / 17,0 ms |

Reine Zeichenzeit je 1080p-Bild in derselben Seite:
- Mäusekino 6–7 ms (16:9) bzw. 6–9 ms (9:16)
- Song 2–5 ms
- Matrix 4–7 ms

Das Video wird mit Mäusekino also nicht langsamer als mit der Standard-Auto-Regie.
