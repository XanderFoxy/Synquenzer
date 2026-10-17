# SYNQUENZER – Stimme und Mikrofon (Runde 7, Xanders Priorität 3)

Stand 17.10.2026. App-Stand: `synq-snapshots/V0a.html` (App 3.1.0, nur gelesen). Baut auf **Nachtrag 1, Teil B, VS** (`dirigent-spec-v3-nachtrag-1.md`, Z. 1435–1462, EN-15), **Spec v3 §13** und **`SYNQUENZER-stimme-jam.md`** (Teil 1 und 3) auf und ersetzt deren Paket-Zuschnitt VS0–VS7 durch den Zuschnitt in §12. Gebaut ist davon nichts.

**Kennzeichen**
- **BELEGT** = Primärquelle (Quelltext, Kompatibilitätsdaten, Hersteller-Doku) direkt gelesen, oder zwei unabhängige Quellen.
- **WAHRSCHEINLICH** = eine Sekundärquelle bzw. nur ein Suchauszug.
- **UNBELEGT** = nicht belegt, eigene Kenntnis oder Vermutung.
- **gemessen** = eigene Messung in Node auf der Xeon-VM (`r7/stimme-proto/`), **synthetische Signale, nie am iPhone**.
- **Vorschlag** = mein Entwurf, keine Tatsache.

**Netz-Lage dieser Runde:** webkit.org, bugs.webkit.org, developer.mozilla.org und raw.githack.com waren aus der Sitzung **nicht abrufbar** (Proxy/DNS). Abrufbar waren: GitHub (MDN-Kompatibilitätsdaten `mdn/browser-compat-data`, MDN-Quelltexte `mdn/content`, WebKit-Quelltext `WebKit/WebKit`, `xiph/speexdsp`) und die npm-Registry. WebKit-Bugs sind deshalb nur aus Suchauszügen belegt (WAHRSCHEINLICH).

---

## 0. Kurz und knapp (für Xander)

1. **In der Claude-App gibt es weiterhin kein Mikrofon.** Die Fähigkeitenliste (Vertrag 0.2.85, heute abgefragt) enthält keins.
2. **Auf deiner eigenen Seite (raw.githack.com) geht das Mikrofon grundsätzlich:** Sie ist https und ein eigenes Fenster. Nötig: ein Tipp auf 🎤, dann fragt das iPhone um Erlaubnis. Ob githack etwas sperrt, prüft der kleine **Mikro-Check (VS0)** auf deinem iPhone.
3. **Singen → Noten funktioniert im Test sehr gut:** 96 % der gesungenen Noten richtig (Tonhöhe und Einsatz), auch mit Vibrato, Anschleifen und Rauschen. Das ist ein synthetischer Test. Echte Stimmen sind schwerer, deshalb gibt es Korrektur-Griffe (teilen, verbinden, Oktave).
4. **Säubern ohne Gate:** Die App kennt ihr eigenes Playback und zieht es nach Frequenz vom Mikro ab. Ein kurzes **Einmess-Rauschen (2 s)** beim ersten Mal macht das deutlich besser: Übersprechen in Pausen 12–25 dB leiser (mit Nachfilter bis 30 dB), Tonhöhe danach zu 99 % richtig. Mit Kopfhörern ist es am besten.
5. **Audio wird quantisierbar:** Silben-Marken auf das Raster schieben. Die Anschläge (Transienten) bleiben erhalten, nur das Dazwischen wird gedehnt.
6. **Beatbox → Drums:** 3 Laute anlernen (b, k, ts), Treffer landen auf Kick, Snare und HiHat.
7. **Aufwand:** 8 Pakete à 4–6 h, ≈ 40 h; dazu 1 optionales Paket (Instrument und Akkorde erkennen).

---

## 1. Plattform-Fakten

### 1.1 Claude-App: Fähigkeitenliste dieses Kontos (Teil a des Auftrags)

**Abfrage heute** (Skill `artifact-capabilities`, Laufzeitvertrag **0.2.85**). Wörtlich:

> „**Available capabilities:** `artifact`, `assets`, `comments`, `db`, `downloads`, `files`, `mcp`, `room`, `sample`, `self`, `user` — the complete set of capability names you may declare; built in on every page, called without declaring (never pass these in `capabilities`): `permissions`. Anything not listed is unavailable to this user.“

- **Kein Mikrofon, keine Kamera.** Die Typdateien 0.2.85 (`artifact`, `assets`, `claude`, `comments`, `db`, `downloads`, `files`, `mcp`, `permissions`, `room`, `sample`, `self`, `user` `.d.ts`) enthalten **0 Treffer** für „micro“, „camera“, „getUserMedia“ und „audio“ als Gerät (gemessen per grep). Treffer gibt es nur für „microtask“ und Medientypen. BELEGT (direkt gelesen).
- **Achtung, Wortlaut:** Die *Beschreibung* des Skills nennt allgemein „using the viewer's camera, microphone, location, screen or device motion“ als mögliche Fähigkeiten. Die *Liste für dieses Konto* enthält keine davon. Es gilt die Liste: „Anything not listed is unavailable to this user.“
- **Gegenüber 0.2.75 (Nachtrag N0.3) unverändert:** dieselben 11 Namen plus `permissions`.
- **Folge:** EN-15 bleibt. Stimme nur außerhalb der Claude-App. Derselbe App-Code läuft in beiden Umgebungen; 🎤 erscheint nur, wenn `navigator.mediaDevices?.getUserMedia` existiert **und** die Seite nicht im Claude-Rahmen läuft (Vorschlag, §12 VS1).

### 1.2 Die eigenständige Seite auf raw.githack.com (Teil b des Auftrags)

| # | Aussage | Status, Quelle |
|---|---|---|
| G1 | Branch `dirigent-synth` im öffentlichen Repo enthält `index.html` (1 310 652 Byte, = Größe von `V0a.html`), `README.md` und `logo-one-day-in-rome.svg`. Letzter Commit 15.10.2026 05:19 UTC „SYNQUENZER v3 V0a …“. | **BELEGT** (GitHub-API, `gh api …/git/trees/dirigent-synth`) |
| G2 | githack ist ein Caching-Proxy, der Dateien aus GitHub mit richtigem Content-Type ausliefert. Entwicklungs-URLs (wie unsere, mit Branch-Namen) holen neue Pushes nach wenigen Minuten. CDN-URLs cachen dauerhaft, deshalb Tag oder Commit-Hash verwenden. Keine Garantie für Verfügbarkeit. | **WAHRSCHEINLICH** (raw.githack.com und FAQ, nur Suchauszug; Seite aus der Sitzung nicht abrufbar) |
| G3 | HTML-Dateien zeigen vorher eine **Bestätigungsseite** mit der Ziel-Adresse (Schutz gegen Phishing). Nach der Bestätigung entfällt sie 24 h für Seiten desselben Repos. | **WAHRSCHEINLICH** (githack-FAQ, Suchauszug) |
| G4 | `getUserMedia` geht nur in sicherem Kontext (https). Anfragen darf nur das **oberste Dokument**, ein iframe nur mit Erlaubnis per Permissions-Policy. Die Nutzer-Erlaubnis ist immer nötig. Im unsicheren Kontext ist `navigator.mediaDevices` `undefined`. | **BELEGT** (MDN-Quelltext `mdn/content …/mediadevices/getusermedia/index.md`; Kompatibilitätsdaten `MediaDevices.getUserMedia.secure_context_required`, Safari 11) |
| G5 | Daraus folgt für githack: https und oberstes Dokument, also **grundsätzlich erlaubt**. Ob githack einen `Permissions-Policy`-Header sendet, der `microphone` sperrt, ist **UNBELEGT**: Die Header waren nicht abrufbar (Proxy 403). → VS0 prüft es am Gerät. | eigene Folgerung aus G4; Header UNBELEGT |
| G6 | **Herkunft (Origin) = Schema + Host + Port.** Alle Repos aller Nutzer auf `https://raw.githack.com/…` teilen sich also **eine** Herkunft. Damit teilen sie IndexedDB, localStorage und eine dauerhaft erteilte Mikrofon-Erlaubnis („Erlauben“ in den Website-Einstellungen gilt je Website). Eine fremde githack-Seite könnte gespeicherte Takes lesen. | Herkunftsbegriff BELEGT (MDN, eK); **Folgerung für githack = eigene Folgerung, nicht getestet** |
| G7 | Die App schreibt heute schon Projekte in IndexedDB `synquenzer` (Version 1, Store `kv`) mit Rückfall auf localStorage (V0a.html Z. 5438). | **BELEGT** (Snapshot gelesen) |

**Empfehlung (Vorschlag):**
- **VS0 (Test) und VS1/VS2 (Noten, keine gespeicherten Rohaufnahmen nötig)** dürfen auf githack laufen.
- **Ab VS3 (gespeicherte Audio-Takes)** sollte die Seite auf einer **eigenen Herkunft** liegen. Möglich ist GitHub Pages (`xanderfoxy.github.io/…`; das Repo ist ohnehin öffentlich; GitHub Free nur aus öffentlichen Repos, SE laut Nachtrag), ein eigener Cloudflare-Pages-Name oder später der Online-Speicher aus Runde 8 (Supabase).
- Bis dahin zeigt VS3 auf githack den Hinweis „Aufnahmen liegen auf einer geteilten Adresse – bitte exportieren“.
- Entscheidung bei Xander (Frage F1, §15).

### 1.3 iOS Safari: Mikrofon, Audio-Sitzung, Abtastrate, Latenz

`safari_ios` „spiegelt“ in den MDN-Kompatibilitätsdaten die Safari-Werte (`"mirror"`, direkt gelesen). Die Versionen gelten also für iOS Safari gleich.

| # | Aussage | Status, Quelle |
|---|---|---|
| I1 | `getSupportedConstraints()`: Safari meldet `echoCancellation` (ab 13.1), `sampleRate` und `sampleSize` (ab 18.6), `deviceId`, `groupId` (18.6). **`noiseSuppression`, `autoGainControl`, `channelCount` und `latency`: `false`** (nie unterstützt). | **BELEGT** (mdn/browser-compat-data `api/MediaDevices.json`, heute vom main-Branch) |
| I2 | Gegenprobe im WebKit-Quelltext: `RealtimeMediaSourceSupportedConstraints.h` kennt `supportsEchoCancellation`, `supportsSampleRate` und `supportsSampleSize`, aber **kein** Feld für Rausch-Unterdrückung oder Pegel-Automatik. | **BELEGT** (WebKit/WebKit main, direkt gelesen) |
| I3 | → Wir setzen `{echoCancellation:false, noiseSuppression:false, autoGainControl:false}`. Die letzten zwei ignoriert Safari, sie helfen aber in anderen Browsern. Ob iOS trotz `false` intern filtert, ist offen: Ein älterer Bericht spricht von abgeschnittenen Höhen (WebKit 192932). | Vorschlag; Bericht **WAHRSCHEINLICH** (Suchauszug) |
| I4 | **Audio-Sitzung:** `navigator.audioSession.type` gibt es ab Safari 16.4 (`AudioSession.state` und `statechange` nicht). Im WebKit-Quelltext wird `play-and-record` auf `AudioSessionCategory::PlayAndRecord` abgebildet. MDN setzt den Typ im Beispiel **vor** `getUserMedia`. | **BELEGT** (BCD `api/AudioSession.json`; WebKit `DOMAudioSession.cpp` direkt gelesen); Reihenfolge WAHRSCHEINLICH (MDN-Suchauszug) |
| I5 | Die App setzt heute beim Start `navigator.audioSession.type = 'playback'` und gibt dem AudioContext nie eine `sampleRate` (Hinweis auf WebKit-Bug 274507). | **BELEGT** (V0a.html Z. 8385–8388) |
| I6 | **Wiedergabe wird schlechter, sobald das Mikro läuft:** WebKit-Bug 311451 „Degraded audio quality with microphone enabled“: niedrigere Abtastrate, Stereo→Mono, mit und ohne `echoCancellation:false`; iOS 26.4, iPhone 15 Pro; nicht auf macOS; Status NEW (gemeldet 03.04.2026). | **WAHRSCHEINLICH** (Suchauszug der Bug-Seite) |
| I7 | **Lautstärke fällt** bei laufendem Mikro (z. B. auf etwa die Hälfte; iOS 15.5). Ein WebKit-Kommentar beobachtet, dass iOS die Lautstärke **je Sitzungstyp** speichert (`playback` 50 %, `play-and-record` 100 %). | **WAHRSCHEINLICH** (WebKit 260501, 236219, 218012; Apple-Forum 730550; Suchauszüge) |
| I8 | **Knistern** bei `echoCancellation:true` ab iOS 26.2 (WebKit 326286; auf iOS 18.7 sauber); ähnlich schon iOS 15 (231191). | **WAHRSCHEINLICH** (Suchauszüge) → wir nutzen `false` |
| I9 | **Abtastraten-Falle:** Die Spur meldet 44,1 kHz, der AudioContext läuft mit 48 kHz → verlorene Samples (WebKit 244203). Verzerrung nach Ratenwechsel, Umgehung „Kontext schließen und neu anlegen“ (154538). | **WAHRSCHEINLICH** (Suchauszüge) |
| I10 | **Erlaubnis im Home-Bildschirm-Modus:** iOS entzieht die Kamera-/Mikro-Erlaubnis bei Hash-Wechsel (WebKit 215884, 212040). Wiederholte Nachfragen auf iOS (Apple-Forum 788518). Website-Einstellung „Fragen/Ablehnen/Erlauben“ je Website. | **WAHRSCHEINLICH** (Suchauszüge). Die App nutzt **kein** `location.hash` und kein `pushState` (0 Treffer in V0a.html, BELEGT) |
| I11 | **Nutzer-Geste:** Ton-Ausgabe braucht eine Geste (`resume()` im Tipp). Die Antwort auf die Mikro-Nachfrage zählt **nicht** als Geste (Apple-Forum 690568). Ob `getUserMedia` selbst eine Geste braucht, ist für iOS nicht eindeutig belegt. | **WAHRSCHEINLICH** / Teil UNBELEGT → Vorschlag: Mikro **nur auf Tipp** starten und im selben Tipp `ctx.resume()` |
| I12 | `AudioContext.baseLatency` ab Safari 14.1, **`outputLatency` erst ab 18.4**. `AudioWorklet` und `AudioWorkletNode` ab 14.1. Der `MediaStreamAudioSourceNode`-Konstruktor ab 14.1. | **BELEGT** (BCD `AudioContext.json`, `BaseAudioContext.json`, `AudioWorkletNode.json`, `MediaStreamAudioSourceNode.json`) |
| I13 | Browser melden die Ende-zu-Ende-Latenz nicht zuverlässig: `latency` der Eingangsspur meldete in Chrome immer 10 ms. Desktop-Rundlauf gemessen (Piep → Mikro): Chrome ≈ 67 ms, mit allen Automatiken aus ≈ 19 ms. | **WAHRSCHEINLICH** (jefftk.com „Browser Audio Latency“, eine Quelle, Desktop, nicht iOS) |
| I14 | **Für das iPhone im Browser fand ich keine Latenzwerte.** BandLab gleicht die Latenz auf iOS automatisch aus (native App). Typisch nennt BandLab für Kabelkopfhörer 5–10 ms; Bluetooth deutlich mehr. Ihr Test: Lautsprecher nah ans Mikro. | iPhone-Browser **UNBELEGT**; BandLab **WAHRSCHEINLICH** (help.bandlab.com, eine Quelle) |
| I15 | `MediaRecorder` ab Safari/iOS 14.1. WebM/Opus ab Safari 18.4 laut addpipe-Tabelle; Ogg/Opus widersprüchlich. `AudioEncoder` (WebCodecs) **ab Safari 26**. | MediaRecorder und AudioEncoder **BELEGT** (BCD); WebM/Opus **WAHRSCHEINLICH** (addpipe, frequal) |
| I16 | `SharedArrayBuffer` gibt es ab Safari 15.2, aber nur in **cross-origin-isolierten** Seiten (COOP/COEP-Header). githack setzt solche Header nicht nachweislich. → Daten zwischen Worklet und Hauptfaden per `port.postMessage` mit Übergabe (transfer), nicht per SAB. | BCD und MDN-Quelltext **BELEGT**; githack-Header **UNBELEGT** |

### 1.4 Speicher für Audio (IndexedDB)

| # | Aussage | Status, Quelle |
|---|---|---|
| S1 | Ab iOS 17 / macOS 14: In Browser-Apps (Safari) darf eine Herkunft bis **≈ 60 % des gesamten Speichers** belegen, alle Herkünfte zusammen bis 80 %. In eingebetteten WebViews 15 %; Web-Apps auf dem Home-Bildschirm haben dieselbe Quote wie der Browser. Keine Rückfrage mehr ab Safari 17. Cross-origin-iframes ≈ 1/10. | **BELEGT** (MDN-Quelltext „Storage quotas and eviction criteria“ + WebKit-Blog 14403, Suchauszug) |
| S2 | **Proaktives Löschen in Safari:** Ohne Nutzer-Interaktion (Klick/Tipp) in den letzten 7 Tagen der Browser-Nutzung löscht Safari alle per Skript angelegten Daten der Herkunft (bei aktivem Tracking-Schutz). | **BELEGT** (MDN-Quelltext; dazu mjtsai/searchengineland 2020) |
| S3 | `navigator.storage.persist()` ab Safari 15.2, `estimate()` ab 17. Safari genehmigt oder verweigert `persist()` **ohne Rückfrage**, abhängig von der bisherigen Interaktion. | **BELEGT** (BCD `StorageManager.json`; MDN-Quelltext) |
| S4 | Datenmenge (gerechnet): 48 kHz Mono 16 Bit = 96 kB/s = **5,76 MB/min**. Roh + gesäubert = 11,5 MB/min. 5 Takes à 3 min ≈ 173 MB. Das passt locker in S1. | gerechnet |
| S5 | Supabase Free: 1 GB Dateispeicher, 2 aktive Projekte, Pause nach 7 Tagen ohne Aktivität. 50 MB je Datei nur aus einem Blog. | 1 GB / 2 Projekte **BELEGT** (zwei Sekundärquellen: cloudzero, jetadmin); 50 MB **WAHRSCHEINLICH** |
| S6 | Für die Wolke müssten Takes komprimiert werden. Mit `AudioEncoder` (Safari 26+) als Opus/AAC ≈ 96 kbit/s ≈ 0,72 MB/min → 1 GB ≈ 23 h. | gerechnet; Bitrate Vorschlag |

### 1.5 Bibliotheken (geprüft in der npm-Registry, heute)

| Paket | Version | Lizenz | Größe (entpackt) | Nutzen | Status |
|---|---|---|---|---|---|
| `signalsmith-stretch` | 1.3.2 | **MIT** | 232 KB, davon `SignalsmithStretch.js` 114 KB (WASM eingebettet) | Zeit-Dehnung und Tonhöhe im AudioWorklet, Formant-Ausgleich, Puffer-Wiedergabe mit Zeitplan | **BELEGT** (Registry + README im Paket) |
| `pitchy` | 4.1.0 | MIT | 33 KB | MPM | BELEGT |
| `pitchfinder` | 2.3.4 | **GPL-3** | 229 KB | YIN/AMDF … | BELEGT → **nicht verwenden** (GPL) |
| `@spotify/basic-pitch` | 1.0.1 | Apache-2.0 | **1,76 MB** + TensorFlow.js | mehrstimmig | BELEGT → nur optional, nachladen |
| speexdsp `mdf.c` | – | BSD-artig (Xiph) | – | Vorbild Echo-Abzug: MDF (Soo/Pang 1990), AUMDF, variable Lernrate gegen Doppelsprechen (Valin 2007) | **BELEGT** (Quelltext-Kopf gelesen) |

Eigene Umsetzung von YIN/MPM/pYIN-lite (≈ 4 KB) ist kleiner als jede Bibliothek. Der Prototyp zeigt, dass das reicht (§4).

---

## 2. Was schon steht, worauf das aufbaut

- **Nachtrag 1, VS:**
  - S0 eigenständige Version;
  - VS0 Mikro-Check mit `echoCancellation/noiseSuppression/autoGainControl: false`, `audioSession` `play-and-record` ↔ `playback`, Wechsel der Abtastrate abfangen, Ergebnis-Blatt, erst im Safari-Tab testen;
  - VS1 ff. nur bei positivem VS0.
  - **Neu seit Runde 8:** Die eigenständige Seite existiert schon (githack). Damit ist die alte Frage E.9 zur Hälfte beantwortet.
- **stimme-jam.md, Teil 1:**
  - Messungen r3: YIN 99,7 % auf gesummter Basslinie; Klick ausblenden; NLMS;
  - Konzept 🎤 SINGEN in der Modusleiste, Anschluss an den FANG-Puffer (`capPush`), Beatbox mit 3–4 Lauten, Hör-Spur, Silbenmarken, spektraler Entrauscher.
  - **Übernommen und präzisiert**, nicht ersetzt.
- **App V0a** (BELEGT, gelesen):
  - `capPush()` Z. 10872 und `capture()` (FANG) Z. 10886 nehmen Notenobjekte `{track, n, v, b, d}` mit Schlag-Zeitstempel aus `t2b(t − AU.outLat)`.
  - `quantizeClip()` Z. 16254 mit `detectGridApp()` (Auto-Raster, Swing, Stärke).
  - `AU.M.ceil` = letzter Master-Knoten; dort hängt heute schon „Song als Audio“ (MediaRecorder, Z. 17282). Das wird die **Referenz** für den Echo-Abzug.
  - `updateOutLat()` nutzt `outputLatency || baseLatency`.
  - Autosave in IndexedDB.

---

## 3. Gesamtbild (Vorschlag)

```
 Tipp 🎤 ──► audioSession='play-and-record' ──► getUserMedia({audio:{echoCancellation:false,…}}) ──► ctx.resume()
                                                        │
  App-Ausgabe AU.M.ceil ──┬──► destination (Lautsprecher/Kopfhörer)
                          └──► (Referenz) ─┐
  Mikro ─► MediaStreamSource ──────────────┴─► AudioWorkletNode 'stimme' (2 Eingänge, 48 kHz)
                                                 │  a) Roh-Mikro + Referenz in Ringpuffer (Int16, je 2 min) → port (transfer, ~100 ms Blöcke)
                                                 │  b) 3:1 dezimieren → 16 kHz
                                                 │  c) Klick-/Treffer-Maske (App kennt ihre Zeiten)
                                                 │  d) LIVE: MPM (FFT) → Taste leuchtet, Pegel
                                                 │  e) Beatbox-Modus: Einsatz + Merkmale → Pad (nur mit Kopfhörer live)
  Haupt-Faden: FANG / ● REC ──► Worker 'stimme-offline':
        1. Referenz um gemessene Latenz verschieben → Echo-Abzug (NLMS/MDF, 48 kHz)   [VS4]
        2. pYIN-lite + HMM (voll, offline) auf 16 kHz → Noten, Stimmung, Einrasten   [VS2]
        3. Einsätze/Silben → Marken                                                 [VS5a]
        4. Nachfilter + Wiener-Entrauschen (nur Hör-Spur, regelbar)                  [VS4]
        → MELODIE-Clip (Noten) + STIMME-Take (Audio, roh + gesäubert) in IndexedDB  [VS3]
```

**Warum so:**
- **Live nur leicht (MPM).** Der Synth-Worklet braucht die CPU. Der volle pYIN-Lauf und der Echo-Abzug laufen offline im Worker, gemessen 5,5 % bzw. 8,3 % Echtzeit (Node, naiv).
- **Zeitstempel kommen aus Audio-Frames, nicht aus der Erkennung.** Die Erkennungsverzögerung zählt nicht. Nur die gemessene Rundlauf-Latenz wird abgezogen.

---

## 4. Tonhöhe → Noten (Prototyp und Messung)

### 4.1 Verfahren

| Verfahren | Kern | Stärken / Schwächen | Status |
|---|---|---|---|
| **YIN** (de Cheveigné & Kawahara 2002) | Differenzfunktion, kumulativ normiert, absolute Schwelle | billig; Oktavfehler, wenn der Grundton schwach ist (Formant über 2./3. Teilton) | Verfahren eK; Messung unten |
| **MPM** (McLeod & Wyvill 2005) | NSDF, „Schlüssel-Maxima“, erstes ≥ k·max | genau (kleinster Median-Fehler), Klarheit als Stimmhaft-Maß; einzelne Oktavfehler | eK; `pitchy` (MIT) setzt es um |
| **pYIN** (Mauch & Dixon, ICASSP 2014) | YIN mit Schwellen-Verteilung → mehrere Kandidaten je Frame → HMM/Viterbi | weniger Oktavsprünge und weniger Fehler beim Stimmhaft-Entscheid als YIN; braucht Rückschau (Viterbi) | **WAHRSCHEINLICH** (qmul-Repository, Sekundärquelle); Tony nutzt pYIN für Tonhöhe **und Noten** (soundsoftware.ac.uk, BELEGT als Projektseite) |
| CREPE / Basic Pitch | neuronale Netze | genauer bzw. mehrstimmig, aber groß (Basic Pitch 1,76 MB + TF.js) | stimme-jam 1.1/1.4; Registry |

**Literatur zur Schwierigkeit:** Die besten Systeme treffen bei echtem Gesang auf Notenebene (Einsatz + Tonhöhe + Ende) **unter 60 %** (Li/Demirel/Proutskova/Dixon 2021, SE). Tony macht typische Fehler wie „benachbarte Vokale gleicher Tonhöhe zu einer Note verschmolzen“. Die Schwelle für einen Notenwechsel liegt bei pYIN bei **2/3 Halbton** (dieselbe Quelle). WAHRSCHEINLICH.

### 4.2 Prototyp (`r7/stimme-proto/`, Node, ohne Abhängigkeiten)

- `synth.mjs` erzeugt eine **synthetische Singstimme** mit Grundwahrheit je Sample:
  - 3 Stimmlagen: Summen „mm“ A2–A3, Mann „da“ A3–A4, Frau „da“ A4–A5;
  - je 26 Noten a-Moll, 100 BPM, Werte 1/16 bis 1/2, Pausen, Tonwiederholungen, Sprünge;
  - Intonationsstreuung σ 15 ct je Note; Anschleifen von unten (0,5–1,5 HT, τ 30 ms) bei 50 % der Noten; Legato-Glissando 60–120 ms bei 35 %;
  - Vibrato 5–6,5 Hz, ±30–70 ct (Bed. E: ±80–120 ct) ab 200 ms; langsame Drift;
  - Formanten (Vokal a bzw. m), Hauchrauschen −28 dB, Konsonanten-Burst, Atemgeräusch in Pausen;
  - optional rosa Rauschen, Metronom-Klick über Raumantwort, Gesamtverstimmung.
- `trackers.mjs`: YIN, MPM, **pYIN-lite** (Beta(2,18)-Schwellen, 20-ct-Raster 55–1050 Hz, HMM mit librosa-Vorgaben: Sprungrate 35,92 Okt/s, Stimmhaft-Wechsel 0,01). fs 16 kHz, Hop 5 ms, Fenster 49 ms. Framebasiert, also 1:1 in einen `AudioWorkletProcessor` übertragbar.
- `seg.mjs` (Vorschlag, gemessen):
  - Noten-Segmentierung:
    - stimmhafte Strecken;
    - Energie-Einbruch ≥ 6 dB = neuer Anschlag gleicher Ton;
    - Tonhöhenwechsel, wenn der 120-ms-Mittelwert > 0,6 HT vom Notenzentrum abweicht und das ≥ 50 ms bleibt; die Grenze wird rückwärts gesucht.
  - Notenhöhe = Median des Mittelteils (Anfang 60 ms / 25 % und Ende 30 ms / 15 % weg). So fallen Anschleifen und Ausklang heraus; das Vibrato mittelt sich.
  - **Stimmungs-Ausgleich** (gewichteter Kreis-Mittelwert der Nachkommastellen).
  - **Einrasten auf die Skala**, wenn der nächste Skalenton ≤ 0,75 HT entfernt ist.
- Maße: Frame-RPA (±50 ct), Oktavfehler, Noten-F nach mir_eval-Art („COnP“: Einsatz ±50 ms + Ton exakt; „COnPOff“: + Ende), Einsatz-Fehler, Treffer im 1/16-Raster.
- Ausführen: `node bench.mjs > bench.out` (≈ 4 min), `node bleed.mjs > bleed.out` (≈ 3 min), `node latency.mjs > latency.out`.

### 4.3 Messergebnis (gemessen, `bench.out`; 6 Läufe je Zeile = 3 Stimmen × 2 Melodien, ≈ 156 Noten)

| Bed. | Bedingung | Verfahren | RPA % | Oktavfehler (Frames) | Noten-F COnP % (gerundet / +Stimmung / +Skala) | F COnPOff % | Einsatz-Fehler Median / 95 % (ms) | 1/16-Raster richtig % |
|---|---|---|---|---|---|---|---|---|
| A | sauber, Vibrato ±30–70 ct | YIN | 97,6 | 344 | 87,0 / 87,0 / 87,0 | 84,5 | 4 / 26 | 92,9 |
| A | | MPM | **99,6** | 20 | 92,4 / 92,4 / 92,4 | 92,4 | 8 / 29 | 94,9 |
| A | | **pYIN-lite** | 99,5 | **0** | **96,1** / 96,1 / 96,1 | **96,1** | 4 / 26 | **96,2** |
| C | Rauschen SNR 10 dB | YIN | 92,0 | 710 | 69,0 / 69,4 / 69,4 | 57,7 | 11 / 32 | 89,7 |
| C | | MPM | 98,5 | 57 | 88,5 | 84,2 | 8 / 30 | 93,6 |
| C | | pYIN-lite | **98,9** | **0** | **95,4** | **94,1** | 7 / 30 | 94,9 |
| D | verstimmt −30 ct, σ 20 ct | YIN | 96,8 | 487 | 81,0 / 85,2 / 85,2 | 83,1 | 3 / 30 | 91,7 |
| D | | MPM | 99,6 | 17 | 87,4 / **92,4** / 92,4 | 92,4 | 8 / 29 | 94,9 |
| D | | pYIN-lite | 99,5 | 0 | 90,4 / **94,2** / 94,2 | 94,2 | 4 / 28 | 94,2 |
| E | Vibrato ±80–120 ct | pYIN-lite | 99,3 | 0 | 93,4 | 92,8 | 4 / 26 | 96,2 |
| F | Metronom-Klick 0 dB | pYIN-lite | 98,0 | 0 | 93,7 | 90,7 | 9 / 32 | 94,2 |
| G | Klick +6 dB | YIN / MPM / pYIN | 91,5 / 93,7 / 95,4 | 534 / 192 / 0 | 67,9 / 81,2 / 89,6 | 33,6 / 56,3 / 76,5 | – | – |
| **Gm** | Klick +6 dB, **Klickzeiten maskiert** | YIN / MPM / **pYIN** | 97,8 / 99,8 / **99,7** | 295 / 9 / **0** | 88,0 / 95,2 / **95,5** | 84,7 / 95,2 / 94,2 | 10 / 27 (MPM 12 / 29; pYIN 11 / 26) | 91,7 / 95,5 / 95,5 |

- **Geschätzte Stimmung** in D: −27 ct (wahr −30 ct).
- **Je Stimme** (A, pYIN-lite): Summen, Mann und Frau je 96,1 % Noten-F, 0 Oktavfehler. YIN bei der Männerstimme nur 71,5 % (339 Oktavfehler-Frames: Formant F1 ≈ 700 Hz stärkt den 3. Teilton).
- **Rechenzeit** (Node, ein Faden, naiv O(W·τ), ohne FFT; gemessen): YIN 3,9 %, MPM 7,4 %, pYIN-lite 5,5 % Echtzeit.
  - iPhone-Faktor 2–2,5 angenommen (geschätzt, wie stimme-jam), also pYIN offline ≈ 11–14 % Echtzeit. Eine Minute Gesang ist in ≈ 7–8 s ausgewertet.
  - Live mit FFT-Autokorrelation **geschätzt** < 2 %.

**Was die Zahlen sagen:**
1. **pYIN-lite ist das Hauptverfahren** (offline beim FANG/REC): kein einziger Oktavfehler in allen Bedingungen, beste Noten-F. **MPM** ist das Live-Verfahren (Tasten-Leuchten): beste Frame-Genauigkeit, keine Rückschau nötig.
2. **Klickzeiten maskieren hilft nur richtig umgesetzt.** Die erste Fassung hielt in maskierten Frames die alte Tonhöhe. Weil Noten **auf dem Schlag** beginnen, versteckte die Maske genau die Einsätze: Noten-F fiel auf 79 % (gemessen). Fassung 2 setzt maskierte Frames auf „unbekannt“ und legt eine Grenze hinter einem Maskenblock auf dessen Anfang (= Schlag): **95,5 %**.
3. **Stimmungs-Ausgleich** bringt bei verstimmtem Sänger +3,8 bis +5 Punkte. Das Einrasten auf die Skala bringt hier nichts mehr, weil die Testmelodien nur Skalentöne haben. Es schützt bei echten Sängern gegen Halbton-Fehlgriffe (UNBELEGT, am Gerät prüfen).
4. **Restfehler (≈ 4 %)** sind vor allem **kurze Legato-Noten (1/16 mit Glissando)**: Sie werden mit dem Nachbarn verschmolzen. Das ist dieselbe Fehlerart wie bei Tony. Gegenmittel: Korrektur-Griff „teilen“ (§11, Skizze 4).
5. **Einsätze:** Median 4 ms, 95 % ≤ 26–30 ms. Nach Abzug des konstanten Versatzes landen **95–96 %** der Noten im richtigen 1/16-Feld (100 BPM, Feld = 150 ms).

**Grenzen der Messung:** Alles ist synthetisch: kein echtes Mikrofon, keine iOS-Signalverarbeitung, keine Konsonanten-Vielfalt, kein Kehlkopf-Jitter, keine Kopfstimme. Die Zahlen sind **Obergrenzen**. Die Literatur (< 60 % Noten-F bei echtem Gesang, SE) zeigt, wie groß der Abstand sein kann. Deshalb gehören zu VS2 Korrektur-Griffe und ein Gerätetest mit Xanders Stimme (N7V-12).

### 4.4 Regeln „Stimme → Noten“ (Vorschlag)

- **Vibrato:** Notenhöhe = Median über den Mittelteil. Der Wechsel-Detektor mittelt über 120 ms; ±70 ct Vibrato bei 5,5 Hz schrumpft dabei rechnerisch auf ±30 ct, liegt also unter der Wechsel-Schwelle 0,6 HT. Bei Vibrato > ±100 ct greift die Haltezeit 50 ms (Bed. E: 93,4 %).
- **Anschleifen und Glissando** gehören zur Note, nicht zu einer eigenen Note: Der Mittelteil zählt, und die Mindestlänge ist 60 ms.
- **Einrasten auf die Tonart der Szene** (wie „Tonart sperren“; KeyDetect Z. 3814), Standard **an**. Schalter „frei“ für Blue Notes. Die geschätzte Stimmung wird angezeigt („du singst 27 ct tief – ausgeglichen“).
- **Lage:** ‹ › verschiebt um Oktaven (Bass −1 Okt.), wie stimme-jam.
- **Kürzeste Note:** 1/16 beim Quantisieren; erkannt ab 60 ms.
- **Mehrstimmig gespielte Instrumente** (Grenze, §4.5).

### 4.5 Instrumente einspielen: einstimmig ja, mehrstimmig begrenzt

- **Einstimmig** (Synth-Lead, Bass, Pfeifen): derselbe Weg mit Quelle „Instrument“. Schalter **„Oktave sperren“** gegen Sub-Oszillator- und Unisono-Oktavfehler (Vorschlag). pYIN-lite hatte im Test 0 Oktavfehler. Bei Synths mit Sub-Oszillator ist das UNBELEGT → Abnahme N7V-30.
- **Akkorde** (Fläche, Gitarre, Klavier): keine Einzelnoten, sondern ein **Akkord-Symbol** per Chroma-Vergleich (12 Tonklassen gegen Dur/Moll/7er-Schablonen). Das Ergebnis geht direkt in die **Akkord-Zeile (S6)**. Treffsicherheit UNBELEGT → Node-Test N7V-31.
- **Echte Mehrstimmigkeit** (Einzelnoten aus Akkorden): nur Basic Pitch (Apache-2.0; README: „works best on one instrument at a time“; Note-F 0,43 auf Slakh, SE). Größe 1,76 MB + TF.js passt nicht sinnvoll in die Ein-Datei-App (EN-17: 4,0 MB) → **nicht im Zuschnitt**, höchstens später nachladbar in der eigenständigen Version.

---

## 5. Beatbox → Drums (Vorschlag)

- **Vorbilder:**
  - Dubler 2: Triggern „sehr schnell und genau“; am zuverlässigsten mit 3–4 angelernten Lauten (Kick, Snare, HiHat + Schnipsen); Anlernen durch bis zu 12 Wiederholungen; fast jedes MIDI muss man nacharbeiten (musictech.com).
  - Laut musicteachermagazine bis 8 Laute.
  - WAHRSCHEINLICH (zwei Rezensionen, teils widersprüchlich).
- **Forschung:** AVP-Datensatz (Amateur Vocal Percussion), 28 Personen, 9 780 Laute, Klassen Kick/Snare/HiHat zu/offen, aufgenommen mit eingebautem MacBook-Mikro (Delgado u. a., arXiv 2009.11737). Klassifikation: bis 90 % mit Entscheidungsbaum (Hazan/Ramirez) bzw. 98 % in einer Vergleichsstudie, nicht vergleichbar aufgebaut (arXiv 2110.09223). WAHRSCHEINLICH.
- **Verfahren (Vorschlag):**
  1. **Einsatz:** Spectral-Flux auf 16 kHz, Hop 2,5 ms (40 Samples), adaptive Schwelle (Median 200 ms + δ), Mindestabstand 50 ms. Die Zeit kommt aus dem Audio-Frame, minus Rundlauf-Latenz.
  2. **Merkmale** der ersten 50 ms: Energie in 3 Bändern (< 200 Hz, 200 Hz–2 kHz, > 4 kHz) als Anteile, spektraler Schwerpunkt, Nulldurchgänge, Abklingzeit, Tonhaftigkeit (YIN-Aperiodizität).
  3. **Klassifikator:** k-NN (k = 3) auf z-normierten Merkmalen aus **3 Lauten × 5 Beispielen** (≈ 15 s Anlernen). Ohne Anlernen gelten Regeln: tief = Kick, hoch und kurz = HiHat, breit und rauschig = Snare. Höchstens 4 Laute; ab dem 4. warnt die App (Dubler: mehr Fehlauslöser).
  4. **Anschlag** aus dem Spitzenpegel (Kurve wie Pad-Anschlag).
  5. **Ausgabe:** Pads 36/38/42 (+ frei wählbar) über `capPush({track: Drum-Spur, n, v, b})`, also FANG und ● REC wie bei Tasten.
- **Live-Auslösen** (hören, während man beatboxt) nur mit Kopfhörer und mit Hinweis auf ≈ Fenster + Latenz. Standard: aufnehmen, dann FANG; das Raster gleicht aus.

---

## 6. Latenz messen und ausgleichen

**Messung (gemessen, `latency.out`; 60 Versuche je Zeile, wahre Laufzeit 20–80 ms mit Bruchteil-Samples, Handy-Lautsprecher-Hochpass 300 Hz, Raum 0,25 s, 48 kHz):**

| Testsignal | SNR | Median-Fehler | 95 %-Fehler | max | Ausreißer > 2 ms |
|---|---|---|---|---|---|
| Klick 1,5 kHz, Schwelle 50 % | 20 dB | 0,36 ms | 2,66 ms | 3,51 ms | 4/60 |
| Klick | 0 dB | 0,38 ms | 1,60 ms | 3,07 ms | 1/60 |
| Chirp 0,8–8 kHz, 30 ms, Kreuzkorrelation, **frühestes Maximum ≥ 50 %** | 20 dB | **0,014 ms** | **0,034 ms** | 0,044 ms | 0 |
| Chirp, ebenso | 0 dB | 0,017 ms | 0,031 ms | 0,032 ms | 0 |

- **Achtung, gemessen:** Mit dem *globalen* Maximum der Kreuzkorrelation gab es bis 15 ms Fehler, weil eine Reflexion gewann. Die Regel „**erste Ankunft**“ ist Pflicht.
- **Ablauf (Vorschlag), zuerst beim ersten Mikro-Start („Einmessen“), dann je Ausgangsweg:**
  1. 0,5 s Stille (Rauschprofil);
  2. 4 Chirps (Latenz = Median);
  3. 2 s leises rosa Rauschen, −20 dBFS (Echo-Filter lernt, §7);
  4. nochmals 1 Chirp am Ende eines Takes (Drift-Probe gegen den 44,1/48-kHz-Fehler I9: Zeigen Anfang und Ende > 0,5 ms Unterschied je Minute, warnt die App und resampelt).
- **Profile je Weg:** Lautsprecher / Kabel-Kopfhörer / Bluetooth.
  - Mit Kopfhörern hört das Mikro die Chirps nicht. Dann gilt „**Ohrhörer ans Mikro halten**“ (Taste „Einmessen mit Kopfhörer“), sonst der Lautsprecher-Wert minus `outputLatency`-Unterschied (Safari ≥ 18.4).
  - Bluetooth: nur per Ohrhörer-ans-Mikro oder Handregler „± ms“ (BandLab nennt Bluetooth deutlich langsamer, WAHRSCHEINLICH).
- **Ausgleich:**
  - Noten-Zeitstempel: `b = t2b(tFrame − L_rund)`. Heute rechnet die App bei Tasten `t − AU.outLat`; beim Mikro zählt die **gemessene Rundlauf-Latenz** (Ausgang + Eingang + Luftweg).
  - Audio-Takes werden beim Ablegen um `L_rund` nach vorn geschoben (sample-genau).
- Anzeige: `⏱ 38 ms` in der Mikro-Zeile; Tipp → neu einmessen.

---

## 7. Säubern: Übersprechen und Rauschen (kein Gate)

**Grundidee (aus stimme-jam 1.3, jetzt gemessen):** Die App kennt ihr eigenes Playback (Referenz = `AU.M.ceil`). Ein adaptives Filter lernt den Weg „Lautsprecher → Raum → Mikro“ und zieht die Vorhersage ab. Danach folgt optional ein Nachfilter je Frequenz und eine Rauschminderung je Frequenz. Nirgends wird stumm geschaltet.

**Messung** (gemessen, `bleed.out`; Männerstimme, 26 Noten; Referenz = Am-F-C-G-Fläche aus Sägezähnen + Klick; Lautsprecher-Hochpass 250 Hz, optional Sättigung tanh; Raum 12 ms + RT60 0,3 s; „Einmessen“ = 2 s rosa Rauschen am Anfang des Einzählers):

| Übersprechen rel. Stimme | Lautsprecher | SNR | Verfahren | SDR Stimme | Minderung in Pausen | RPA | Noten-F |
|---|---|---|---|---|---|---|---|
| 0 dB | linear | 40 | 0 nichts | 0,0 dB | 0 dB | 17,5 % | 11,1 % |
| 0 dB | linear | 40 | 2 nur spektrale Subtraktion mit Referenz | 6,7 dB | 12,9 dB | 76,5 % | 58,1 % |
| 0 dB | linear | 40 | 1 NLMS 2048 Taps, Einzähler = Fläche | 7,6 dB | 13,4 dB | 99,5 % | 87,3 % |
| 0 dB | linear | 40 | **1E NLMS mit Einmess-Rauschen** | **19,6 dB** | 20,4 dB | **99,9 %** | **88,9 %** |
| 0 dB | linear | 40 | 3E = 1E + Nachfilter | 19,7 dB | 23,1 dB | 99,9 % | 76,7 % |
| −6 dB | linear | 20 | 4E = 3E + Wiener (Boden −15 dB) | 19,7 dB | 21,8 dB | 99,9 % | 80,7 % |
| +6 dB | tanh | 40 | 1 NLMS ohne Einmessen | 6,0 dB | 14,6 dB | 94,7 % (59 Oktavfehler) | 71,4 % |
| +6 dB | tanh | 40 | **1E** | **12,3 dB** | 18,7 dB | 98,9 % | **90,6 %** |
| +6 dB | tanh | 20 | 4E | 14,6 dB | 25,6 dB | 99,8 % | 84,2 % |

- **Zusatzlauf** (`bleed-var.out`): Ohne Einmess-Rauschen und mit eingefrorenem Filter nach dem Einzähler fällt SDR auf 4,8 dB. Grund: Der Einzähler spielt nur einen Akkord (Am), das Filter lernt also nur dessen Frequenzen. Beim nächsten Akkord stimmt es nicht.
- **Folgerung:** Einmessen mit breitbandigem Signal, danach langsames Nachlernen (μ 0,003) mit Doppelsprech-Bremse.
- **Ohne adaptives Filter** (nur spektrale Subtraktion) ist die Tonhöhe unbrauchbar (RPA 42–87 %, viele Oktavfehler).
- **Nachfilter und Wiener** senken das Restübersprechen und Rauschen in Pausen um weitere 2–10 dB, **verschlechtern aber meist die Noten-Erkennung** (3E gegen 1E: in 11 von 12 Fällen um 1,6–12,2 Punkte schlechter, einmal 5,2 besser). Die Energie schwankt stärker, dadurch gibt es Zusatz-Schnitte.
- → **Zwei Wege (Vorschlag):**
  - **Noten-Weg** = nur Echo-Abzug (1E).
  - **Hör-Weg** (gespeicherte Stimme) = 1E + Nachfilter + Wiener, mit Regler „Säubern 0–100 %“: Boden −6 … −24 dB, Nachfilter-Stärke 0 … 1,5.
- **Sättigung** (Handy-Lautsprecher laut, nah am Mikro) begrenzt das lineare Filter: bei +6 dB rund 6 dB schlechter (SDR 18,3 → 12,3 dB). Hinweis-Regel: Ist das Übersprechen nach dem Einmessen > 0 dB rel. Stimme, rät die App zu Kopfhörern oder leiserem Playback.
- **Rechenzeit:** NLMS 2048 Taps zeitbereich 8,3 % Echtzeit (Node, naiv). Im Gerät offline im Worker; als Blockverfahren im Frequenzbereich (MDF wie speexdsp, AUMDF, variable Lernrate gegen Doppelsprechen) deutlich billiger (UNBELEGT, eK).
- **Rauschen:** Profil aus den 0,5 s Stille vor dem Einzähler, Wiener mit „decision-directed“ a-priori-SNR (Ephraim/Malah 1984, IEEE TASSP 32; Sekundärquelle) statt reiner spektraler Subtraktion nach Boll 1979 („musical noise“). WAHRSCHEINLICH (Suchauszüge, mehrere Quellen). Dazu ein fester Hochpass 80 Hz (Trittschall).
- **Klick-Maske** (App kennt Klick- und Drum-Zeiten) für die Live-Tonhöhe: gemessen 95,5 % statt 89,6 % Noten-F bei Klick +6 dB (§4.3).

---

## 8. Audio-Spur: Datenmodell, Takes, Punch, Overdub (Vorschlag)

**Spur-Art STIMME:** Einer der 8 Spurplätze (V2a) lässt sich auf „STIMME (Audio)“ schalten, wie „Engine je Pad“. So gibt es **keine neue Leiste** (S4); die Spur ist eine normale Zeile in Matrix und Song.

```js
// Projekt (Format 4 + Feld audio, Version +1): nur Verweise, Audio liegt in IndexedDB
take  = { id, sr: 48000, len /*Samples*/, store: 'audio', chunks: [key…] /*PCM16, je ≤ 1 MB*/,
          clean: { chunks: [key…], nlms: true, post: 0.6, floorDb: -15 } /*gesäuberte Fassung*/,
          route: 'speaker'|'wired'|'bt', latMs, gainDb, tuneCt, created,
          f0: { hop: 0.005, cents: Int16Array /*komprimiert, für Anzeige*/ },
          marks: [{ t /*s im Take*/, kind: 'onset'|'syl'|'word', text?, conf, user? }] }
audioClip = { type: 'audio', take, in, out /*s*/, at /*Schlag im Clip bzw. Song*/, gain, fadeIn, fadeOut,
              warp: { mode: 'off'|'slice'|'stretch', grid, strength, swing, map: [[srcSec, beat]…] } }
```

- **Speicher:** IndexedDB `synquenzer` **Version 2**, neuer Store `audio` (Blobs/ArrayBuffer in Stücken). Der Store `kv` bleibt. Nach dem ersten Take `navigator.storage.persist()`; `estimate()` im Takes-Blatt anzeigen (S3).
  - Projekt-Export als Datei: JSON + Audio als WAV in einem ZIP. In der eigenständigen Seite per Blob-Link. Die `downloads`-Fähigkeit der Claude-App kennt kein `wav` (N0.3), dort gibt es aber ohnehin kein Mikro.
- **Takes:** Jede Aufnahme über einen Bereich ist ein Take. Overdub = neuer Take **darüber**; der alte bleibt stumm erhalten (Takes-Blatt: wählen, A/B, löschen). Undo nimmt Take und Clip zusammen zurück.
- **Punch im Song** (Xanders S5, gilt für Audio wie für Noten):
  - In Takt 3 tippen und ● → Rückfrage „**ab Takt 3 überschreiben**“ oder „**dazwischen aufnehmen**“. Beim Einfügen rutschen alle späteren Clips aller Spuren um die Aufnahmelänge nach hinten, auf ganze Takte gerundet.
  - Ist ein Bereich gelb markiert: nur dort ersetzen oder Overdub.
  - Ein- und Ausblenden je 5 ms an den Punch-Grenzen gegen Knackser.
- **Stimme-FANG (rückwirkend, wie FANG für Tasten):**
  - Läuft 🎤 „hört zu“, puffert der Worklet ständig die letzten 2 min (Roh + Referenz, Int16 ≈ 23 MB bei 48 kHz).
  - Tipp auf **FANG**: Die Klammer endet am **letzten logischen Takt** (Xanders F-Regel, gleiche Funktion wie bei Noten) und beginnt am ersten Einsatz nach ≥ 1 Takt Stille (höchstens 16 Takte).
  - Ergebnis: **MELODIE-Clip (Noten)** und **STIMME-Take (Audio)**, verknüpft (gleiche `take`-ID am Clip). Xander kann spontan singen und erst danach entscheiden, ob er es behält.
- **Synchron abspielen:** `AudioBufferSourceNode.start(when, offset)` auf dem Transport-Takt, gerendert aus `warp.map` (§9). Clips hängen in Szenen wie Noten-Clips (Loop-Länge in Takten) und im Song als aufgelöste Clips (S2).
- **Mischung:** Die Rolle GESANG FOLGT (§8.6 der Spec) wird zur echten Audio-Rolle: Pegel, Hochpass, und andere Spuren halten 1–4 kHz frei.

---

## 9. Audio quantisieren (Xanders A: „Audioaufnahmen müssen quantisierbar sein“)

**Vorbilder:**
- Melodyne „Quantize Time“ schiebt Noten zu oder in Richtung des *beabsichtigten Schlags* bzw. der nächsten Rasterlinie, die Stärke ist wählbar. Bei weichen Einsätzen nimmt Melodyne den Einsatz als Bezug; die Bezugsstelle ist von Hand änderbar (Celemony Help Center, BELEGT als Herstellerseite, Suchauszug).
- Ableton-Warp-Modi: „Beats“ schützt Anschläge (gut für Drums, verschmiert Flächen), „Tones“ für einstimmiges Material, „Complex/Complex Pro“ für Mischungen (nur Sekundärquellen, WAHRSCHEINLICH).

**Verfahren (Vorschlag):**
1. **Marken** = Noteneinsätze aus §4 (Gesang) bzw. Flux-Einsätze (Beatbox, Instrument), mit Vertrauenswert. Von Hand: tippen = Marke setzen, ziehen = verschieben, halten = löschen.
2. **Ziel** je Marke: dieselbe Logik wie `quantizeNoteSet()` (Raster auto/fest, Stärke, Swing) auf die Marken-Liste. Für Noten und Audio gibt es **eine** Quantisier-Funktion, und das Quantisieren eines verknüpften MELODIE-Clips nimmt den Take mit (Schalter „Audio folgt“).
3. **Zeitkarte** `warp.map`: stückweise linear zwischen Marken.
4. **Rendern** (Worker, nicht-destruktiv, Ergebnis gecacht):
   - **Modus „Scheiben“** (Beatbox, Drums): jede Scheibe wird nur verschoben, nichts gedehnt. Lücken füllt der ausklingende Rest, Überlappungen werden mit 5 ms überblendet. Anschläge bleiben bitgenau.
   - **Modus „Dehnen“** (Gesang): Die ersten 20 ms nach jeder Marke werden **unverändert** kopiert (Transient). Der Rest der Scheibe wird mit **WSOLA** auf die Ziellänge gedehnt (für einstimmige Stimme gut und billig, eK); Überblendung 5 ms.
   - Höhere Qualität: **Signalsmith Stretch** (MIT, 114 KB, Formant-Ausgleich; README empfiehlt Faktoren 0,75–1,5 für beste Qualität) als nachladbare Option (CDN nur in der eigenständigen Seite).
   - **Grenzen:** Dehnfaktor 0,5–2,0. Außerhalb wird nur verschoben, mit Warnung.
5. **Stärke 0 %** = Original, bitgleich. A/B-Schalter.
- **Tonhöhe ändern** (Auto-Tune-artig, PSOLA mit Formant-Erhalt) ist **nicht** im Zuschnitt. Grund: groß, nicht verlangt. Später mit Signalsmith `semitones`/`formantCompensation` möglich.

---

## 10. Silben- und Wort-Marken, Songtext

- **Silben:**
  - Jede erkannte Note ist eine Silben-Marke (Vokal-Einsatz).
  - Energie-Einbrüche ohne Tonwechsel (Tonwiederholung „la-la“) sind ebenfalls Silben; sie werden im Prototyp schon geschnitten (Regel 1 in `seg.mjs`).
- **Wörter:** Zwei Silben-Marken durch Wischen verbinden = ein Wort. Wort-Marken sind länger (dickerer Strich).
- **Songtext auf Marken** (passt zu „B11 Songtext“ aus der Vision):
  - Text eintippen, Silben mit Bindestrich trennen („Lie-be ist ein Feu-er“).
  - Eine Silbe je Marke, von links. Überzählige Silben erscheinen rot am Ende, fehlende als „·“.
  - Der Text wandert beim Quantisieren mit (er hängt an der Marke, nicht an der Zeit).
- **Spracherkennung** (Web Speech API) **nicht** verwenden: Sie arbeitet nicht auf gespeicherten Puffern, und der Datenweg ist unklar (UNBELEGT; Vorschlag).

---

## 11. UI-Skizzen (390 × 844, Hochformat)

**Skizze 1 – Hauptansicht mit 🎤 (nur eigenständige Seite, Mikro erlaubt)**
```
┌────────────────────────────────────────┐ 390
│ ≡ SYNQUENZER  ▶  ■  ●   100  Am     ⚙ │ Kopf wie heute
├────────────────────────────────────────┤
│ Matrix / Clips wie heute               │
│ … STIMME-Spur = normale Zeile (🎤-Icon)│
├────────────────────────────────────────┤
│🎤 hört zu ▮▮▮▮▮▮▯▯ −14 dB ⏱38 ms 🎧 ✕ │ Mikro-Zeile 28 px, nur bei 🎤 an
├────────────────────────────────────────┤
│ [♪ SPIELEN │ 🎤 SINGEN │ ⇅ TRANSP.]FANG│ Modusleiste 44 px (stimme-jam)
├────────────────────────────────────────┤
│ ┌──┬─┬──┬─┬──┬──┬─┬──┬─┬──┬─┬──┐       │
│ │  │█│  │ │  │  │ │▓▓│ │  │ │  │ ← erkannte Note (A) leuchtet
│ └──┴─┴──┴─┴──┴──┴─┴──┴─┴──┴─┴──┘       │ Tastatur wie heute
└────────────────────────────────────────┘ 844
```
- 🎧 = Weg (Lautsprecher/Kopfhörer/BT), Tipp = einmessen. ✕ = Mikro aus (Spuren stoppen, `audioSession` → `playback`).
- Auf der Drum-Spur heißt das Feld **BEATBOX**.

**Skizze 2 – Einmessen (erstes Mal, ≈ 4 s)**
```
┌────────────────────────────────────────┐
│            Mikro einmessen             │
│  Handy hinlegen, leise sein.           │
│  ① Stille …………………… ✓                    │
│  ② 4 Pieptöne ………… ✓  Latenz 38,2 ms   │
│  ③ Rauschen 2 s …… ▮▮▮▮▮▯ lernt Raum   │
│  Ergebnis: Übersprechen −19 dB  ✓ gut  │
│  [Mit Kopfhörer einmessen]  [Fertig]   │
└────────────────────────────────────────┘
```

**Skizze 3 – Nach FANG mit Stimme**
```
┌────────────────────────────────────────┐
│ Gesungen eingefangen · Takt 5–8        │
│ ┌────────────────────────────────────┐ │
│ │ ▬▬  ▬ ▬▬▬   ▬  ▬▬    (Noten, 8)   │ │ Mini-Rolle
│ │ ∿∿∿∿∿∿∿∿∿∿∿∿∿∿∿∿∿∿∿∿ (Audio)      │ │ Wellenform + Silbenstriche
│ └────────────────────────────────────┘ │
│ Stimmung −27 ct ausgeglichen · a-Moll ✓│
│ [✓ Noten → MELODIE] [✓ Audio → STIMME] │
│ [Oktave ‹ ›]  [Raster 1/16 ▾]  [OK]    │
└────────────────────────────────────────┘
```

**Skizze 4 – Audio-Clip-Editor (STIMME)**
```
┌────────────────────────────────────────┐
│ ‹ STIMME · Take 3/4 ›        A/B  ⋯   │
├──1──────2──────3──────4────────────────┤ Taktleiste (gelbe Markierung wie Rolle)
│ |    |  |     |   |  |      |          │ Silben-Marken (tippen/ziehen/halten)
│ ∿∿∿∿∿∿∿∿∿∿∿∿∿∿∿∿∿∿∿∿∿∿∿∿∿∿∿∿∿∿∿∿∿∿  │ Wellenform (gesäubert)
│ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─  │ Tonhöhenlinie (dünn)
│ Lie-be  ist  ein  Feu-er               │ Songtext auf Silben
├────────────────────────────────────────┤
│ QUANT  [1/16▾] Stärke ━━━━●━ 80 %      │
│ Modus  [Dehnen│Scheiben]   Swing 50 %  │
│ SÄUBERN ━━━━━●━━ 60 %  (kein Gate)     │
│ [Teilen] [Verbinden] [Oktave] [Takes]  │ Korrektur-Griffe (wie Tony)
└────────────────────────────────────────┘
```

**Skizze 5 – Beatbox anlernen**
```
┌────────────────────────────────────────┐
│ Beatbox anlernen (je 5×)               │
│ KICK   „b“   ●●●●○   Pad 36  [neu]     │
│ SNARE  „k“   ●●●●●   Pad 38  ✓         │
│ HIHAT  „ts“  ○○○○○   Pad 42  [jetzt]   │
│ + 4. Laut (unsicherer)                 │
│ [Test: sag etwas → leuchtet]  [Fertig] │
└────────────────────────────────────────┘
```

**Skizze 6 – Song-Modus, Punch auf STIMME**
```
┌────────────────────────────────────────┐
│ SONG  1  2 │STROPHE      │ 7  8  9     │ gelb = Song-Teil (S4)
│ Drums ▪▪ ▪▪ ▪▪ ▪▪ ▪▪ ▪▪ ▪▪ ▪▪ ▪▪        │
│ Bass  ▪▪ ▪▪ ▪▪ ▪▪ ▪▪ ▪▪ ▪▪ ▪▪ ▪▪        │
│ STIMME      ∿∿∿∿∿∿∿∿∿∿     ∿∿∿         │ Audio-Clips als „gläserne“ Wellen (S7)
│  ┌──────────────────────────────────┐  │
│  │ Aufnahme ab Takt 3:              │  │
│  │ [Ab Takt 3 überschreiben]        │  │ S5-Rückfrage, gilt auch für Audio
│  │ [Dazwischen aufnehmen →]         │  │
│  └──────────────────────────────────┘  │
└────────────────────────────────────────┘
```

**Skizze 7 – VS0 Mikro-Check (Testblatt)**
```
┌────────────────────────────────────────┐
│ Mikro-Check (bitte im Safari-Tab)      │
│ [ Mikro starten ]                      │
│ sicher: ja · Fenster: oberstes         │
│ Spur: 48000 Hz · 1 Kanal · Echo aus ✓  │
│ Kontext: 48000 Hz · base 5,3 · out 9,1 │
│ Sitzung: play-and-record → playback    │
│ Rundlauf: 38,2 / 38,1 / 38,3 / 38,2 ms │
│ Frequenzgang Mikro: ▁▃▅▇▇▇▇▆▅▃ (Chirp) │
│ Speicher: 61 GB frei · persist: ja     │
│ „Wurde die Musik leiser/dumpfer?“ J/N  │
│ [Ergebnis kopieren]  [Als Datei]       │
└────────────────────────────────────────┘
```

---

## 12. Paket-Zuschnitt (je ≈ 4–6 h)

Gilt nur für die eigenständige Seite. In der Claude-App ist alles verborgen (Feature-Erkennung). Ersetzt den Zuschnitt VS1–VS7 aus stimme-jam Teil 3; VS0 präzisiert den Nachtrag.

| Paket | Inhalt | Dauer | Budget | Hängt ab von |
|---|---|---|---|---|
| **VS0 Mikro-Check** | Testblatt (Skizze 7) als verstecktes Blatt **in der App** (⚙ → „Mikro-Check“, nur ohne Claude-Rahmen):<ul><li>`isSecureContext`, oberstes Fenster;</li><li>`getSupportedConstraints`, `getSettings`;</li><li>Abtastraten von Spur und Kontext, `baseLatency`/`outputLatency`;</li><li>`audioSession` vorher/während/nachher;</li><li>Fehlername;</li><li>4-Chirp-Rundlauf (erste Ankunft);</li><li>Mikro-Frequenzgang aus Chirp/Rauschen;</li><li>2-Minuten-Drift-Probe;</li><li>`storage.estimate/persist`, 50-MB-Schreibtest;</li><li>Ja/Nein-Frage zum Klang;</li><li>Ergebnis als JSON kopieren/speichern.</li></ul> | 4 h | 15 KB | – (sofort, auch vor allen Gruppen) |
| **VS1 Mikro-Grundlage** | 🎤 in der Modusleiste; Start nur auf Tipp (`audioSession`, `getUserMedia`, `resume`); Worklet `stimme` mit 2 Eingängen (Mikro, Referenz `AU.M.ceil`); 3:1-Dezimierung; Ringpuffer 2 min (Int16) + Übergabe per `port`; Pegel; Mikro-Zeile; **Einmessen** (Skizze 2) mit Profilen je Weg; Stopp räumt alles ab; Fehlerpfade (abgelehnt, belegt, unterbrochen) | 5–6 h | 25 KB | VS0 positiv |
| **VS2 Stimme → Noten** | Live MPM (FFT) → Taste leuchtet; Klick-/Treffer-Maske (Fassung 2); offline pYIN-lite + Segmentierung + Stimmung + Einrasten (Worker); **Stimme-FANG** (letzter logischer Takt) und ● REC → MELODIE-Clip; Ergebnis-Blatt (Skizze 3); Korrektur-Griffe Teilen/Verbinden/Oktave in der Rolle | 5–6 h | 30 KB | VS1; FANG (vorhanden); V2a MELODIE-Spur empfohlen |
| **VS3 STIMME-Spur & Takes** | Spur-Art STIMME; IndexedDB v2 Store `audio` (PCM16-Stücke); Take = Roh-Mikro; synchrones Abspielen; Takes-Blatt; Overdub; Punch mit S5-Rückfrage (überschreiben/einfügen, Bereich); Undo; WAV-Export, ZIP mit Projekt; `persist()`; githack-Hinweis (G6) | 6 h | 35 KB | VS2; V2a (Format 4); V2e (neue Song-Ansicht) für Punch im Song |
| **VS4 Säubern** | Worker: Referenz per Latenz verschieben, Echo-Abzug (NLMS → Block-/MDF-Variante), langsames Nachlernen + Doppelsprech-Bremse; Nachfilter; Wiener-Entrauschen mit Rauschprofil; HP 80 Hz; Regler SÄUBERN (0 % = bitgleich); A/B; Hinweis „Kopfhörer/leiser“, wenn Übersprechen > 0 dB | 5 h | 25 KB | VS3 |
| **VS5a Marken & Scheiben** | Silben-/Wort-Marken (aus VS2 bzw. Flux), Marken-Editor (tippen/ziehen/halten), Zeitkarte, Quantisieren über `quantizeNoteSet`-Logik, Modus **Scheiben**, „Audio folgt“ bei verknüpftem MELODIE-Clip | 5 h | 25 KB | VS3 |
| **VS5b Dehnen & Songtext** | Modus **Dehnen** (Transient 20 ms fest + WSOLA), Grenzen 0,5–2,0, Render-Cache; Songtext auf Silben (Bindestriche), Text wandert mit; *(P1)* Signalsmith Stretch nachladbar | 5–6 h | 30 KB | VS5a |
| **VS6 Beatbox** | Flux-Einsatz (Hop 2,5 ms), Merkmale, k-NN, Anlernen (Skizze 5), Regeln ohne Anlernen, Anschlag aus Pegel, Pads 36/38/42, FANG/REC; Live nur mit Kopfhörer | 4–5 h | 20 KB | VS1; V1 (Drum-Editor) |
| *VS7 Instrument & Akkorde (optional)* | Quelle „Instrument“, „Oktave sperren“; Chroma-Akkorde → Akkord-Zeile (S6) | 4–5 h | 20 KB | VS2; V2c (Akkord-Zeilen) |

- **Summe:**
  - VS0–VS6 ≈ **39–44 h**, mit VS7 ≈ 43–49 h.
  - Budget ≈ 210–230 KB. Das passt in EN-17 (4,0 MB; Plan ≈ 3,47 MB).
- **Einordnung in Teil C (Vorschlag):**
  - **VS0 sofort**, parallel zu allem: klein, entscheidet, braucht nur die eigenständige Seite.
  - **Gruppe VS-A (VS1, VS2)** nach Gruppe V2-2 (FANG TEIL, Song). Sie liegt also hinter Xanders Prioritäten 1 (Kodamo = V4) und 2 (FANG/Song = V2-2): **direkt nach V4, vor V3**.
  - **Gruppe VS-B (VS3, VS4, VS5a, VS5b)** danach.
  - VS6/VS7 bei V7 bzw. nach V2c.
  - Das ändert EN-15 („keine Bau-Gruppe“) → braucht Orchestrator-Entscheid.

---

## 13. Abnahme N7V-01 …

„Node“ = automatischer Test auf der VM mit dem Prototyp-Korpus (`stimme-proto/`, wird beim Bau in die Test-API übernommen). „Gerät“ = Prüfpunkt für Xanders iPhone.

| ID | Paket | Prüfung | Soll |
|---|---|---|---|
| N7V-01 | VS0 | Testblatt zeigt alle Felder aus §12 VS0; „Ergebnis kopieren“ liefert gültiges JSON | vollständig, Fehlername statt Absturz bei Ablehnung |
| N7V-02 | VS0 | Rundlauf per Chirp (erste Ankunft), Node-Test SNR 0/10/20 dB | 95 %-Fehler ≤ 0,1 ms (gemessen 0,031–0,034 ms) |
| N7V-03 | VS0/VS1 | Gerät: 4 Chirps hintereinander | Streuung (max − min) ≤ 2 ms |
| N7V-04 | VS1 | Vor dem ersten Tipp auf 🎤: Zähler der `getUserMedia`-Aufrufe (Test-API) | 0 |
| N7V-05 | VS1 | In der Claude-App bzw. ohne `getUserMedia`: 🎤, BEATBOX und Mikro-Zeile | unsichtbar; Regression aller Pakete grün |
| N7V-06 | VS1 | Nach ✕ / Stopp: alle Spuren `readyState === 'ended'`, `audioSession.type === 'playback'` | ja |
| N7V-07 | VS1 | Abtastraten von Spur und Kontext verschieden oder Drift-Probe > 0,5 ms/min | Warnung + Resampling, keine stillen Lücken |
| N7V-08 | VS2 | Node-Korpus Bed. A–F: pYIN-lite Oktavfehler-Frames | 0 |
| N7V-09 | VS2 | Node-Korpus: Noten-F COnP (mit Stimmung + Skala) | A ≥ 0,94; C ≥ 0,93; D ≥ 0,92; E ≥ 0,91; Gm ≥ 0,93 (gemessen 0,961 / 0,954 / 0,942 / 0,934 / 0,955) |
| N7V-10 | VS2 | Node-Korpus Bed. D: geschätzte Gesamtverstimmung | ±5 ct um die wahre (gemessen −27 statt −30) |
| N7V-11 | VS2 | Einrasten: Note 20 ct über Gis in a-Moll mit Einrasten an → A; aus → Gis | genau so |
| N7V-12 | VS2 | Gerät: Xander singt 8 Takte zum Klick (Kopfhörer), dann FANG | ≥ 80 % der Noten ohne Korrektur richtig (Xander zählt); Teilen/Verbinden/Oktave reparieren den Rest |
| N7V-13 | VS2 | Stimme-FANG: Tipp 1/8 Takt nach dem Taktstrich | Klammer endet am vorigen Taktstrich (F-Regel); Noten-Clip + Take verknüpft; ein Undo entfernt beides |
| N7V-14 | VS2 | Live-Leuchten: Abstand stabile Tonhöhe → Taste an (Worklet im Node mit Testton) | ≤ 60 ms |
| N7V-15 | VS2 | Rechenzeit Live-Pfad (Dezimierung + MPM-FFT + Maske) im Node | ≤ 3 % Echtzeit; Gerät: 0 Aussetzer in 2 min bei 8 Synth-Stimmen |
| N7V-16 | VS3 | Take eines App-Klicks über Kabel-Loopback (OfflineAudioContext-Simulation): Wiedergabe gegen Raster | ≤ 1 ms nach Latenzausgleich |
| N7V-17 | VS3 | Punch „dazwischen aufnehmen“ ab Takt 3 (2 Takte) | alle späteren Clips aller Spuren +2 Takte; „überschreiben“ ersetzt nur Takt 3–4 der STIMME-Spur |
| N7V-18 | VS3 | Overdub | neuer Take oben, alter stumm im Takes-Blatt; Undo stellt Zustand vorher her |
| N7V-19 | VS3 | Speicher: IndexedDB v2 Store `audio`, Stücke ≤ 1 MB; Projekt-JSON enthält nur IDs; `persist()` aufgerufen | ja; Neuladen verliert keinen Take |
| N7V-20 | VS3 | WAV-Export 48 kHz/16 Bit, bitgleich zum gespeicherten Roh-Take | ja |
| N7V-21 | VS4 | Node `bleed`: Übersprechen 0 dB linear, mit Einmessen | SDR ≥ 15 dB, Minderung in Pausen ≥ 15 dB, RPA ≥ 99 % (gemessen 19,6 / 20,4 / 99,9) |
| N7V-22 | VS4 | Node `bleed`: +6 dB mit Sättigung | SDR ≥ 10 dB, Noten-F ≥ 0,85 (gemessen 12,3 / 0,906) |
| N7V-23 | VS4 | Kein Gate: ohne Übersprechen, SNR 40, Säubern 100 % | SDR gegen die Original-Stimme ≥ 20 dB; kein Abschnitt > 50 ms mit Pegel < −40 dB innerhalb gesungener Noten |
| N7V-24 | VS4 | Säubern 0 % | bitgleich zum Roh-Take |
| N7V-25 | VS4 | Noten-Weg nutzt nur den Echo-Abzug (ohne Nachfilter/Wiener) | Test-API meldet Weg „1E“ |
| N7V-26 | VS5a | Quantisieren Stärke 100 % | alle Marken ±1 Sample auf dem Raster; 50 % = halber Weg |
| N7V-27 | VS5a | Modus Scheiben: Klickfolge quantisieren | Spitzenpegel je Klick ±0,1 dB, Anschläge bitgleich |
| N7V-28 | VS5b | Modus Dehnen: Klickfolge mit Ton dazwischen | erste 20 ms je Scheibe bitgleich (bis zur Überblendung); Länge je Scheibe ±1 ms |
| N7V-29 | VS5b | Dehnfaktor außerhalb 0,5–2,0 | nur verschoben + Warnung |
| N7V-30 | VS5b | Songtext „Lie-be ist ein Feu-er“ auf 6 Marken | 1 Silbe je Marke; bei 5 Marken „er“ rot; Text bleibt nach Quantisieren an seiner Marke |
| N7V-31 | VS6 | Gerät: Xander lernt b/k/ts je 5× an, dann 32 Schläge | ≥ 90 % richtiges Pad, ≤ 2 Doppelauslöser |
| N7V-32 | VS6 | Treffer gehen über `capPush` (FANG/REC wie Tasten), Anschlag aus Pegel | ja (Test-API) |
| N7V-33 | VS7 | Node: Synth-Säge mit Sub-Oszillator −1 Okt., „Oktave sperren“ an | 0 Oktavfehler-Frames |
| N7V-34 | VS7 | Node: 24 Dur-/Moll-Dreiklänge (Säge-Fläche) | ≥ 90 % richtiges Akkord-Symbol; Eintrag in Akkord-Zeile mit Undo |
| N7V-35 | alle | Datenschutz: Während Aufnahme und Säubern keine Netzaufrufe (Netzwerk-Mitschnitt) | 0 Anfragen (bis ein Online-Paket aus Runde 8 mit Zustimmung kommt) |

---

## 14. Risiken

| # | Risiko | Wirkung | Gegenmittel |
|---|---|---|---|
| R1 | Wiedergabe schlechter/leiser, sobald das Mikro läuft (I6, I7) | Musik klingt beim Singen dumpf/leise | Mikro nur bei 🎤 an, sofort freigeben; Kopfhörer empfehlen; VS0-Frage; Lautstärke-Hinweis |
| R2 | iOS filtert trotz `echoCancellation:false` (I3) oder knistert (I8) | Höhen fehlen, Artefakte | `false` setzen; VS0 misst den Frequenzgang per Chirp; Ergebnis ins Ergebnis-Blatt |
| R3 | 44,1/48-kHz-Fehler, verlorene Samples (I9) | Takes driften, Lücken | Drift-Probe (Chirp am Take-Ende), nie `sampleRate` im Kontext setzen (heute schon so), Kontext bei Bedarf neu anlegen |
| R4 | githack: geteilte Herkunft (G6), Bestätigungsseite (G3), keine Garantie (G2), Header unbekannt (G5) | fremde Seiten könnten Takes lesen; Ausfall | VS0/VS1/VS2 ok; Takes (VS3) erst auf eigener Herkunft oder mit Warnung + Export; Entscheid F1 |
| R5 | Safari löscht Daten nach 7 Tagen ohne Interaktion (S2) | Takes weg | `persist()`, Export-Erinnerung, später Online-Speicher (Runde 8) |
| R6 | Echte Stimmen schwerer als synthetische (4.3; Literatur < 60 %) | mehr Fehler als gemessen | pYIN + Korrektur-Griffe; Einrasten; Gerätetest N7V-12 vor VS3 |
| R7 | Lautsprecher nah und laut → Sättigung, Restübersprechen (§7) | Säubern reicht nicht | Einmessen, Hinweis „Kopfhörer/leiser“, Klick-Maske, Lichtpuls statt Klick als Option |
| R8 | CPU am iPhone (Synth-Worklet + Mikro) | Aussetzer | Live nur MPM; Echo-Abzug und pYIN offline im Worker; N7V-15 |
| R9 | Bluetooth-Latenz nicht per Lautsprecher messbar (I14) | Takes zu spät | „Ohrhörer ans Mikro“-Messung, Handregler, Warnung bei BT |
| R10 | Erlaubnis wird im Home-Bildschirm-Modus neu erfragt (I10) | Nerv-Dialoge | kein Hash-Routing (heute erfüllt); zuerst im Safari-Tab testen (Nachtrag VS0) |
| R11 | Dehnen klingt bei großen Faktoren künstlich | schlechter Gesang | Grenzen 0,5–2,0; Transient fest; *(P1)* Signalsmith |
| R12 | Zwei App-Varianten (Claude-App ohne, Safari mit Mikro) laufen auseinander | doppelte Pflege | eine Datei, Feature-Erkennung; Regression in beiden Umgebungen (N7V-05) |
| R13 | Speicherbedarf (S4) bei vielen Takes | Quote voll | Anzeige `estimate()`; alte Takes aufräumen; später Kompression (`AudioEncoder`, Safari 26+) |

---

## 15. Fragen an Xander (nicht blockierend; der Bau nimmt die Vorgabe)

| # | Frage | Vorgabe |
|---|---|---|
| F1 | Für gespeicherte Gesangs-Takes eine eigene Adresse: GitHub Pages (Repo ist schon öffentlich), Cloudflare Pages oder warten auf den Online-Speicher? | VS0–VS2 auf githack; VS3 mit Warnung + Export |
| F2 | Singst du lieber mit Kopfhörern (Kabel oder Bluetooth?) oder über den Handy-Lautsprecher? | beides; Einmessen je Weg |
| F3 | Beatbox: Welche 3–4 Laute machst du für Kick, Snare, HiHat? | b / k / ts |
| F4 | Soll die gespeicherte Stimme nur „Hör-Spur“ sein (zum Merken) oder fertiger Gesang, den du mischst? | beides (Säubern-Regler); Tonhöhen-Korrektur nicht im Zuschnitt |

---

## Quellen

**Direkt gelesen (BELEGT)**
- Skill `artifact-capabilities`, Laufzeitvertrag 0.2.85, Fähigkeitenliste und Typdateien (lokal, heute).
- GitHub-API: `xanderfoxy/deutsch-mit-xander`, Branch `dirigent-synth` (Baum, letzter Commit).
- MDN-Kompatibilitätsdaten (main, heute): https://github.com/mdn/browser-compat-data – `api/MediaDevices.json`, `api/AudioSession.json`, `api/AudioContext.json`, `api/BaseAudioContext.json`, `api/AudioWorkletNode.json`, `api/MediaStreamAudioSourceNode.json`, `api/MediaRecorder.json`, `api/StorageManager.json`, `api/AudioEncoder.json`, `javascript/builtins/SharedArrayBuffer.json` (Kopien in `r7/stimme-proto/bcd/`).
- MDN-Quelltexte: https://github.com/mdn/content – `web/api/mediadevices/getusermedia/index.md`, `web/api/storage_api/storage_quotas_and_eviction_criteria/index.md`, `web/javascript/reference/global_objects/sharedarraybuffer/index.md`.
- WebKit-Quelltext: https://github.com/WebKit/WebKit – `Source/WebCore/platform/mediastream/RealtimeMediaSourceSupportedConstraints.h`, `Source/WebCore/Modules/audiosession/DOMAudioSession.cpp`, `Source/WebCore/Modules/mediastream/MediaDevices.cpp` (Kopien in `r7/stimme-proto/webkit/`).
- speexdsp `libspeexdsp/mdf.c`: https://github.com/xiph/speexdsp
- npm-Registry: `signalsmith-stretch` 1.3.2 (+ README im Paket), `pitchy`, `pitchfinder`, `@spotify/basic-pitch`.
- App-Snapshot `synq-snapshots/V0a.html` (Z. 3814, 5438, 8374–8411, 10872–10900, 16239–16275, 17273–17304).

**Suchauszüge (WAHRSCHEINLICH, Seiten nicht abrufbar)**
- WebKit-Blog „Updates to Storage Policy“: https://webkit.org/blog/14403/updates-to-storage-policy/
- WebKit-Bugs: https://bugs.webkit.org/show_bug.cgi?id=311451 · …=326286 · …=231191 · …=281978 · …=192932 · …=244203 · …=154538 · …=251350 · …=260501 · …=236219 · …=218012 · …=215884 · …=212040 · …=237350 · …=290002
- Apple-Foren: https://developer.apple.com/forums/thread/730550 · /690568 · /788518 · /804765
- raw.githack.com und FAQ: https://raw.githack.com/ · https://raw.githack.com/faq
- Latenz: https://www.jefftk.com/p/browser-audio-latency · https://superpowered.com/webbrowserlatency · BandLab: https://help.bandlab.com/hc/en-us/articles/115002959414 · https://help.bandlab.com/hc/en-us/articles/360025805834
- MediaRecorder-Formate: https://addpipe.com/tech-demos/media-recorder-api-demo/ · https://frequal.com/java/OggOpusStillNotWorkingInSafari18_4.html
- 7-Tage-Grenze: https://mjtsai.com/blog/2020/03/26/safari-13-1-third-party-cookie-blocking-and-7-day-script-writeable-storage/ · https://searchengineland.com/what-safaris-7-day-cap-on-script-writeable-storage-means-for-pwa-developers-332519
- Supabase: https://supabase.com/pricing · https://www.cloudzero.com/blog/supabase-pricing/ · https://www.jetadmin.io/blog/supabase-pricing-2026-guide-to-plans-limits-and-real-world-costs/
- pYIN: https://code.soundsoftware.ac.uk/projects/pyin · https://qmro.qmul.ac.uk/xmlui/handle/123456789/6040 · Tony: https://code.soundsoftware.ac.uk/projects/tony · https://sonicvisualiser.org/tony · Noten-Segmentierung Gesang: https://webspace.eecs.qmul.ac.uk/s.e.dixon/pub/2021/LiDemirelProutskovaDixon-NLP4MusA2021.pdf
- Beatbox: https://arxiv.org/pdf/2009.11737 · https://zenodo.org/records/3245959 · https://ar5iv.labs.arxiv.org/html/2110.09223 · Dubler 2: https://musictech.com/reviews/software-instruments/vochlea-dubler-2-review/ · https://www.musicteachermagazine.co.uk/articles/tech-reviews-dubler-2 · https://vi-control.net/community/threads/are-there-any-vochlea-dubler-users-here.103151/
- Quantisieren: https://helpcenter.celemony.com/M5/doc/melodyneEssential5/en/M5tour_MacroTiming · Ableton-Warp (sekundär): https://teragonaudio.com/article/Warping-tips-in-Ableton-Live.html · https://www.musicguymixing.com/how-to-warp-in-ableton-live/
- Rauschminderung: https://jcaa.caa-aca.ca/index.php/jcaa/article/download/2252/2000/2390 · https://homes.esat.kuleuven.be/~dspuser/dasp/material/Slides_2023_2024/Chapter-2%20Noise%20Reduction-pp40.pdf
- Signalsmith Stretch: https://npmjs.com/package/signalsmith-stretch · Vergleich: https://bungee.parabolaresearch.com/compare

**Eigene Messungen (gemessen, Node v22, synthetisch)** – `r7/stimme-proto/`: `bench.mjs/.out` (Tonhöhe, Noten), `bleed.mjs/.out` und `bleed-var.mjs/.out` (Übersprechen), `latency.mjs/.out` (Rundlauf). Bibliotheken: `lib.mjs`, `synth.mjs`, `trackers.mjs`, `seg.mjs`.
