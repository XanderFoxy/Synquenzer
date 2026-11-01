# NORTHI – North als Instrument, North-Kits immer sichtbar, Update-Hinweis

Basis: `bau/snapshots/R-4300.html` (= main, 4.30.0). Ergebnis: `index.html` (VERSION bleibt `'4.30.0'`), Unterschied: `patch.diff`
(184 Zeilen dazu, 22 geändert). `sw.js` ist **unverändert** (keine Kopie in der Abgabe). Neue Namen `ndi…` / `NDI…`, CSS in
`/* NDI-CSS-BEGIN */ … /* NDI-CSS-END */`, jede geänderte Zeile trägt `// NDI`. Das Patch-Skript liegt als `tests/ndi-patch.py` bei
(`python3 tests/ndi-patch.py ../../snapshots/R-4300.html index.html` erzeugt `index.html` neu).

Xander (iPhone, 01.11.): „Der North sollte als Instrument verstanden werden. Und als Kit taucht er auch nicht auf. In der Liste nicht
und beim Blättern taucht er auch nicht extra auf.“

## 1. Ursache auf dem iPhone – was gefunden, was abgesichert

### a) Safari / WebKit: kein Fehler in den North-Zeilen gefunden
WebKit für Playwright ist hier nicht installiert (unter `/opt/pw-browsers` nur Chromium; Playwright nachinstallieren war nicht erlaubt),
also gründliche statische Prüfung aller North-Blöcke (ND1 Engine, ND3 Programme/Kits, ND4 Einbindung + MDN, NDSTAGE Kit-Fabrik):

| geprüft | Ergebnis |
|---|---|
| `requestIdleCallback`, `Intl`, `structuredClone`, `Array.prototype.at`, `Object.hasOwn`, `??=`, private Felder, `static {}` | kommen nicht vor |
| `queueMicrotask` (E.hit) | Safari ≥ 12.1 |
| `AudioWorklet.addModule` über Blob-URL, Ersatz data:-URL | derselbe Weg wie der Studio-Klang (`SynthHost`, auf dem iPhone „Worklet (blob)“) |
| `btoa(src)` (data:-URL, Offline-Render) | Worklet-Quelle hat 0 Nicht-ASCII-Zeichen (1011 Zeilen gemessen) – kein `InvalidCharacterError` |
| `performance` im Worklet | abgesichert (`hasPerf`), sonst `Date.now()` |
| `OfflineAudioContext` + `suspend()` + `processorOptions` | Safari ≥ 14.1 |
| Reihenfolge der Skripte | ND1/ND3 (eigener `<script>`) läuft vor dem Hauptskript mit der Kit-Fabrik – richtig |
| Laufzeit beim Laden (ohne Audio) | ND1/ND3 bauen nur Daten (Listen, Tabellen, 45 Programme, 4 Kits); nichts Browser-Spezifisches |

**Gefunden (unabhängig vom Browser): drei stille Fehlerketten**, die genau Xanders Bild ergeben können:

1. **ND3 wirft** (Kit-Daten) → `MDX` steht, `MDX.kits` fehlt → `MD_KIT_FACTORY` ist **still leer**: keine North-Kits in Liste und
   Blättern, ohne jede Meldung.
2. **ND1 wirft zur Laufzeit** → `const MDX` bleibt in der TDZ → `typeof MDX` in der Kit-Fabrik **wirft** → das ganze Hauptskript steht.
3. **ND1 parst nicht** → `MDX` *und* `MD_NAME` fehlen → Kits still weg; zusätzlich wirft das **Menü** (`mdHelp` nutzt `MD_NAME`) –
   von T2 gefunden.

**Abgesichert:**
- Kleines Diagnose-Skript **vor** dem ND1-Block (`window.NDI_BOOT`): merkt den ersten Fehler (Meldung + Zeile) bis der Block fertig ist;
  `MD_NAME` steht jetzt dort (Name bleibt, auch wenn der Block ausfällt).
- ND3 läuft in `try/catch`: ein Fehler setzt `MDX.kitErr` und wird gemeldet statt still leerer Kits.
- Kit-Fabrik liest `window.MDX` (nie TDZ) und baut jedes Kit einzeln abgesichert. Fehlt etwas, entstehen **graue Platzhalter**
  (`NDI_OFF`) mit den 4 Namen.
- **North-Kits stehen immer da**: Reiter Kits, Reiter North, Blättern ‹ ›. Grau mit „North lädt nicht: ‹Grund›“; antippen = Hinweis mit
  Grund (kein Wechsel). Blättern nennt sie („„Fell & Holz“, … übersprungen – North lädt nicht: …“) und springt weiter – nie still.
- Läuft die Engine selbst nicht (kein AudioWorklet, Worklet abgeschaltet, Modul lädt nicht): Kits bleiben ladbar (Drum-Felder = Rom
  Pop, wie in 4.30.0), die Unterzeile nennt den Grund in Bernstein („… · North lädt nicht: AudioWorklet fehlt (spielt Drum-Stimmen)“).

### b) Alte Fassung aus dem Zwischenspeicher – wahrscheinlichste Ursache
- `sw.js` (network first) liefert die Seite nach **3 s aus dem Cache**; die Seite ist 4,66 MB groß – bei mäßigem Netz startet das
  iPhone also oft die **vorige** Fassung, die neue landet erst danach im Cache.
- Als Heim-Bildschirm-App hält iOS die **laufende** Seite oft tagelang offen; ohne Neustart wird gar nichts neu geladen.
- 4.29.0 kennt North überhaupt nicht (in R-4290 0× `MD_NAME`) – das passt zu „taucht als Kit nicht auf, in der Liste nicht, beim
  Blättern nicht“.

**Gebaut: Update-Weg ohne Netz-Zugriff der App und ohne Änderung an sw.js.** Die App liest selbst die Seite im Cache `synq-app-1`
(dort legt der vorhandene Service-Worker die Antwort des Netzes ab) und vergleicht deren `VERSION` mit der laufenden:
- Prüfung 4 s, 25 s und 90 s nach dem Start und beim Zurückkommen in die App (höchstens alle 20 s); ETag/Datum/Länge der
  Cache-Antwort sparen das erneute Lesen derselben Fassung.
- Neuer: kleiner Hinweis an der Stelle der Hinweise oben: **„Neue Version x.y.z – Tippen zum Laden“** und ✕ (beide ≥ 44 px). Kein Ton,
  blockiert nichts; ✕ = weg für diese Sitzung. Menü → Version nennt die neue Fassung ebenfalls.
- Tippen: erst sichern wie beim Schließen (`saveNow()` = Rettungskopie + Schreiben, Verlauf `histLeave`, Online-Stand
  `cloudFlushNow`), dann `location.reload()`; höchstens 2,5 s warten. Während einer Aufnahme: „Erst Aufnahme beenden – dann neu laden“.
- Warum sw.js unverändert: Die App kann den Cache selbst lesen (Cache Storage ist im Fenster verfügbar); ein postMessage vom
  Service-Worker hätte nur die Wartezeit bis zur nächsten Prüfung verkürzt. So bleibt `synq-app-1`/`synq-g9-*`-Regel unberührt.
- Grenze (bewusst, „keine Netz-Zugriffe“): Holt nichts die Seite neu (die App lief die ganze Zeit), weiß auch der Cache nichts von der
  neuen Fassung. Dann hilft einmal App wegwischen und neu öffnen – startet sie dabei noch aus dem Cache, kommt der Hinweis wenige
  Sekunden später.

### c) Diagnose sichtbar
Menü → Info, direkt unter „Version“: Zeile **North** – „bereit · 4 Kits, 45 Programme · Engine startet mit dem ersten Tippen / lädt
beim ersten North-Pad / geladen (blob, 72 ms)“, „lädt …“ oder „nicht verfügbar (Grund)“ (z. B. „nicht verfügbar (Error: … (Zeile
18930))“, „nicht verfügbar (AudioWorklet fehlt – Pads spielen ihre Drum-Stimme)“).

## 2. North als Instrument
- **Kit-Browser, Reiter „North“** (hinten: Kits | Eigene | Init | **North** – nichts verschoben): die 4 North-Kits, **„North leer“**
  (alle 12 Pads North, INIT SOUND, Kit-Effekte neutral; Drum-Felder Rom Pop als Rückfall), dazu eigene gesicherte Kits, in denen
  mindestens ein Pad North spielt. Zeilen tragen die Kennung **NORTH** (auch im Reiter Kits). Ist ein North-Kit geladen, öffnet der
  Browser gleich im Reiter North.
- **Drum-Editor-Kopf: Schalter [Drums | North]** direkt nach „DRUMS“ – dieselbe Form wie VA | FM | WT im Synth-Kopf, Trefferfläche
  ≥ 44 px, Hoch- und Querformat ohne Überlauf (auch 375 px). North = alle 12 Pads Quelle North: jedes Pad sein gemerktes Programm,
  sonst das Rollen-Programm `MDX.roleProg` (genau wie [Quelle ▾]); Drums = alle Pads zurück auf die Drum-Stimme, die Programme bleiben in
  `slot.md` gemerkt. **Ein** Undo-Schritt („Instrument North“). Einzelne Pads North = „gemischt“ (keine Taste an, Punkt an North). Die
  Pad-Umschalter [Quelle ▾] im SOUND-Reiter bleiben.
- **Instrument-Listen: Eintrag „North · Drum-Synthese“** – im Synth-Browser unter „Andere Engine ansehen“ (VA ▾), in der Liste
  „Klangerzeugung“ (schmale Hochformate) und im Synth-Editor unter ⋯. Er wählt die Drum-Spur und öffnet ihre Kits im Reiter North
  (lädt nichts von selbst). Eine eigene „Spur-Art wählen“ gibt es in der App nicht (Zusatzspuren sind Synth-Spuren, die Drum-Spur ist
  fest) – darum diese drei Stellen.

## Verträglichkeit
- Alte Projekte laden/speichern Zeichen für Zeichen gleich (T5: gleiche Schritte in R-4300 und NORTHI → gleiches Projekt-JSON);
  Speicherformat unverändert, „North leer“ ist nur ein weiterer Werks-Ursprung (`f-kit-north-leer`).
- Renders bitgleich (T5: `mdRender` Kit Gestimmt, `MDX.render` Kit Schräg – gleiche Prüfsummen). Audio-Code unberührt.
- Test-API additiv: `ndiInstrument(v?)`, `ndiStatus()`, `ndiBoot()`, `ndiNorthList()`, `ndiUpdCheck(f)`, `ndiUpd()`, `ndiGoNorth()`;
  `kits()` liefert bei grauen North-Kits zusätzlich `off: true` (sonst wie bisher); `openBrowser(t, reiter?)`.
- Regeln: genau 1× „  live: true,“, „MS 2000“ genau 1×, verbotene Wörter 0, kein Emoji als Grafik, keine Netz-/Datenbank-Aufrufe.
