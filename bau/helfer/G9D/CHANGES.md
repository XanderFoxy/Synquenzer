# G9D – Paket G9d „Einbau Songtext/Silben in die App“

Zweig `g9-br-D` · Grundlage `bau/snapshots/stage-ges2.html` (4.23.0 + Gesang G1–G8) · zusammengeführt: `g9-br-U` (G9c Text-Modus) +
`g9-br-S` (G9a Kern, G9b-V Erkennung ohne Modell) · Ergebnis `bau/helfer/G9D/index.html` = Snapshot `bau/snapshots/G9STAGE.html`
(`node bau/helfer/G9D/build.mjs`; alle Eingriffe in vorhandenen Code sind genau einmal vorkommende Ersetzungen in `build.mjs`).
VERSION nicht hochgezählt (beim Merge in die Hauptlinie). Spec: `spec/n8/G9.md` §5–§8, §10.

## Was Xander bekommt
- **Richtige Silbentrennung** statt der vereinfachten Regel: Beim ersten Öffnen des Text-Modus lädt die App einmal das Silben-Muster der
  Sprache des Takes (Deutsch 95 KB, Englisch 21 KB) vom eigenen Server (`/Synquenzer/vendor/g9/syl/`), prüft es (SHA-256) und legt es im
  Gerät ab (`synq-g9-v1`). Danach geht es auch offline. Ohne Server (Claude-App, offline beim ersten Mal) läuft alles weiter mit der
  Vokalkern-Regel, die Silben sind blass und die Info-Zeile sagt „Silbentrennung vereinfacht“.
- **Bessere Verteilung** („Ganzer Text“, Tippen, Ersetzen, Verschieben): der echte Rechen-Kern aus G9a erkennt Ton-Marken (Melisma) und
  Doppel-Marken nach s/f/sch an der Wellenform (Merkmale je Marke, im Hintergrund gerechnet) und überspringt sie.
- **Marken-Editor nimmt den Text mit:** Marke verschieben → ihre Silbe folgt; Marke löschen → die Silbe rückt zur vorigen (verschmolzen,
  nichts geht verloren; Hinweis „1 Silbe verschmolzen“ bzw. „1 Silbe ohne Marke“); Marke setzen → keine Silbe wandert. Ein Rückgängig
  stellt Marke und Silbe zusammen her.
- **Erkennen** ist vorbereitet, aber nicht sichtbar: Der ganze Ablauf ohne Sprachmodell ist eingebaut (Vorstufe, Stimm-Strecken, 30-s-Fenster,
  [Stopp], „Aufnahme hat Vorrang“, automatisches Erkennen neuer Aufnahmen, Rückgängig-Verhalten). Das Sprachmodell selbst fehlt (Freigabe F0),
  darum bleibt [Erkennen] ausgeblendet und es wird nichts geladen (Stopp-Punkt 1, §9).

## Gebaut
| Teil | Stelle |
|---|---|
| Kern `g9Make()` (G9a, unverändert aus `G9S/g9-kern.js`) im **Start-Pfad**, erst beim ersten Bedarf ausgeführt (`g9K()`): Normalisierer, Marken-Haken, Text-Modus | `src/start.js` (Platzhalter `/*@G9KERN@*/`) |
| Normalisierer `tkExt().take` = `K.normLy` (§5.2) | `start.js` |
| Undo-Art `'ly'` (`undoState`/`undoApply`, nur `ly` + `lyrics` eines Takes) | `start.js`, build 4) |
| `take.ly` = `K.normLy(…)`, `take.lyrics` = `K.lyText(ly)` bei jeder G9-Änderung; VS5b-Text → `K.fromVs5b` bei der ersten Änderung (Silben > 24 Zeichen geteilt) | `g9.js` `g9PutLy`, `g9Vs5b` |
| Dünne Hüllen §7.12: `g9Syl` → `K.syl`, `g9Align` → `K.align`, `g9Feat` → `K.feat` (Worker), `g9View` → `K.view`, `g9Set` → `K.apply` (Wort/Ersetzen, [+], Löschen, ‹ ›, Verschmelzen, Trennen, Nachrücken, Ganzer Text, Neu ausrichten) | `src/g9.js` |
| VS5a-Worker: + `g9Make` + Ops `g9f` (Merkmale), `g9a` (ganze Ausrichtung / Schritt), `g9s` (Muster); Rückfall Haupt-Faden | build 13), `start.js` `g9Run`/`g9Call` |
| Marken-Haken in `wpEdit` (`mkMove`/`mkDel`/`mkAdd`, vorher Sicht §5.1 → Anker = Marken-Zeit), im selben `'takes'`-Undo | build 14), `g9MarkHook` |
| `wpSetLyrics` mit vorhandenem `ly` schreibt beides (§8) | build 15) |
| Silben-Muster laden (§6.2, §4.5): `vendor/g9/syl/`, SHA-256-Liste im Code, Cache `synq-g9-v1`, nur GET, Zähler `g9Net()`; Worker bekommt die Muster mit | `g9.js` `g9SylEnsure` |
| Erkennung ohne Modell (G9b-V): eigener Worker `G9.w` (Vorstufe/Fenster `g9ErkMake().plan`), Fenster einzeln an die Andock-Stelle `G9.asr`, Rückrechnung + Schutz (`zurueck`), Silben (`silben`, Lücken füllen / Alles ersetzen) | `src/rec.js` |
| [Stopp] = Worker beenden, fertige Fenster bleiben (§6.6.9) · Aufnahme hat Vorrang: Haken in `stStart`/`micStart`/`micTapGet`, 2 s nach dem letzten Mikrofon weiter, `saveNow()` vor jedem Start (§6.6.10) | build 17), `rec.js` |
| Automatisch erkennen (F1, §7.8): Haken nach jeder Aufnahme (Stimme-FANG/REC und SONG), nur Takes ohne Text, ohne Undo-Schritt, verworfen wenn inzwischen getippt; `G9.auto` + `wpUndone`-Haken | build 16) 18), `rec.js`, `start.js` |
| Schnittstelle `G9.rec` aus G9c bleibt (für `g9-br-E`): liefert `recognize` nur Wörter `{w, a, b, p}`, richtet der Text-Modus sie aus | `ui.js` `g9RecRunUi` |
| Text-Modus (G9c) unverändert übernommen; nur: Vorschau aus dem Kern, Info-Zeile „vereinfacht“ nach Muster-Stand, „n Silben ohne Marke“, [Ganzer Text] rechnet im Worker | `src/ui.js` |
| `sw.js`: keine Änderung nötig – er cacht nur `index.html`, `vendor/supabase-js-*.js`, Schriften, Icons, Manifest; `vendor/g9/` geht unberührt ans Netz (§4.5 erfüllt) | – |

## Messwerte (Chromium headless, Touch-Emulation, dieser Rechner)
Tests `tests/alle.sh`: t2 34/34 · t3 41/41 · t4 23/23 · t5 25/25 · t6 15/15 · t7 4/4 · t8 4/4 · t9 14/14 (alle G9U-Tests, jetzt auf der
eingebauten App mit echtem Kern) · t10 48/48 · t11 12/12 · t12 6/6 = **226/226**. Kern: `G9S/tests/alle.mjs` alles grün (unverändert).

| Punkt | Ziel | Ergebnis |
|---|---|---|
| G9-01 Worker = Haupt-Faden (Merkmale `g9f`, Ausrichtung mit Muster `g9a`) | 100 % | gleich (t10) |
| Muster laden | erst beim Text-Modus, nur Take-Sprache | 1 GET `de-x-syllable.wasm` beim ersten [Text], 0 beim Start, 0 nach Neuladen (Cache) |
| SHA-256 falsch / Server weg / file:// | Abbruch mit Meldung, App läuft | „Prüfsumme falsch: …“, nicht im Cache; Modus `einfach`, Silben p 0,5, Info „Silbentrennung vereinfacht“ |
| G9-08 Marken-Haken | Silben folgen, 0 verloren, ein Undo | verschieben/löschen/löschen neben 3 Silben (→ `o`)/setzen: ✓, ein `'takes'`-Schritt |
| G9-09 ganze Ausrichtung 300 Marken × 225 Silben im Worker | ≤ 60 ms (4× ≤ 240 ms) | Median **14,5 ms** (max 20,8); mit 4× Drossel 8,7 ms – die CDP-Drossel wirkt nicht auf Worker, darum nur bedingt aussagekräftig; am Gerät nachmessen |
| Merkmale 65-s-Take im Worker | – | 384 ms (Haupt-Faden frei) |
| Tastendruck-Vorschau (64 Takte, Haupt-Faden) | ≤ 2 ms Median, ≤ 6 ms max (4×) | **1,30 ms** Median, **7,6 ms max** (ohne Drossel 0,20 / 0,60 ms); 16-Takt-Fall in t3: Median 1,2 ms, max 3,4 ms |
| G9-28 [Stopp] | ≤ 0,5 s | 0,4 ms (Worker beendet, fertige Fenster ausgerichtet) |
| G9-56 Aufnahme hat Vorrang | ≤ 100 ms | 0,2 ms; 2 s nach dem Mikrofon weiter; 90-s-Take mit 4 Fenstern: Fenster 0,1,1,2,3 (nur das angefangene neu) |
| G9-38 automatisch | wie §7.8 | 5/5 (erscheint ohne Undo-Schritt, älteres Quantisieren ↶ lässt Text stehen, Undo der Aufnahme nimmt ihn mit, Tippen davor → verworfen, Schalter aus → nichts) |
| G9-57 Undo-Fußabdruck (1200 Silben, 60 Wörter) | ≤ 4 MB | 3,20 MB (ein Take im Projekt; als `'takes'` gleich groß, weil das Projekt nur diesen Take hat – der Vorteil wächst mit jedem weiteren Take) |
| Regel 28 (Differenz zur Basis, t11) | gleich | VS5a-Marken, VS5b-Songtext, Marken setzen/verschieben/löschen, Quantisieren + Dehnen (Klang-Prüfsumme), Projekt-JSON, Laden + Speichern: **12/12 gleich** |
| App-Start | ± 3 % | −1,3 % (Rauschen ±5 %) |
| Markennamen / „MS 2000“ / VERSION / Supabase | | 0 / 1× / unverändert / keiner; einziger neuer Netz-Abruf = GET der Muster |

Basis-Befund (nicht G9): Laden + Speichern ordnet die Schlüssel eines Takes neu (`lyrics` hinter `marks`), wenn `marks` nach `lyrics`
entstanden sind – in der Basis genauso (t11 vergleicht darum G9D gegen die Basis).

## Abweichungen und Entscheidungen (Regel 30)
1. **Kern im Start-Pfad statt im Lade-Block:** Normalisierer und Marken-Haken brauchen ihn beim Laden bzw. im Marken-Modus, der VS5a-Worker
   bekommt ihn per `toString()`. Die Fabrik wird erst beim ersten Take mit `ly` bzw. beim ersten [Text] ausgeführt (Start: `kern = null`).
2. **Merkmale asynchron im Worker:** Anzeige und Sicht nutzen sie, sobald sie da sind (≈ 0,4 s für 65 s Take); ein Schritt in den ersten
   Augenblicken rechnet sie einmal im Haupt-Faden, damit jeder Schritt mit denselben Merkmalen rechnet wie seine Vorschau.
3. **Muster nur der Take-Sprache** beim Öffnen; die andere lädt [Ganzer Text] bei Bedarf (vor dem Verteilen).
4. **[Nachrücken]:** Kern-Schritt `nach` (Rest ab dem nächsten Wort) + das ersetzte Wort verteilt sich auf die frei gewordenen Plätze
   (wie G9c); eine feste Silbe ohne Marke bleibt Schranke.
5. **Hinweis beim Marke-Löschen** als Toast (die Info-Zeile des Marken-Modus wird beim Neuzeichnen überschrieben).
6. **[Neu ausrichten]** gibt es als Schritt (`g9Set {op: 'neu'}`); eine eigene Taste hat G9c nicht gebaut (Aussehen nicht umgestaltet,
   Regel 27) – die Info-Zeile zählt „n Silben ohne Marke“.
7. **Budget:** +128 KB statt geplant +45 KB (Kern 30 KB, Erkennung ohne Modell 12 KB, Text-Modus G9c 57 KB, Rest Hüllen/Kommentare);
   der Lade-Block (≈ 85 KB) wird beim Start nicht ausgewertet, App-Start gleich schnell (t12).

## Unabhängige Prüfung
Eigener Prüf-Agent (Fehler suchen), 10 Funde, Reproduktionen in `tests/pruefer/` (Aufruf aus diesem Ordner mit `node <datei>`):
1. **Getipptes Wort gelöscht**, wenn Muster, Merkmale oder ein Erkennungsergebnis während des Tippens ankamen → `g9Refill`: bei
   bearbeitetem Feld nur neu zeichnen (+ Vorschau), nie das Feld überschreiben; automatisches Ergebnis wird auch bei offenem, bearbeitetem
   Feld verworfen. ✓ (t-fill, t-feat, t-auto2)
2. **Gelöschter Text kam zurück** (G9.auto nach `wpLyrics(id, '')`, bei Projektwechsel nie geleert) → Löschen über `wpSetLyrics` entfernt
   `G9.auto`; `applyProject` beendet Aufträge und leert `G9.auto`/Warteschlange/Sicht/Merkmale. ✓ (t-auto)
3. **`wpLyrics` vor dem Erkennen der Marken** schrieb nur `lyrics`, `ly` blieb alt → dann gilt der VS5b-Text, `ly` entfällt (nie auseinander). ✓ (t-lyr)
4. **[Erkennen] von Hand während eines automatischen Auftrags** erbte „automatisch“ → übernimmt den Auftrag als Handschritt (ein Undo). ✓
5. **`sw.js` löscht bei jedem Update alle `synq-*`-Caches außer `synq-app-1`**, also auch `synq-g9-v1` → **offen, Merge-Schritt** (siehe STATUS;
   `sw.js` liegt im Pages-Stamm, den dieser Zweig nicht ändert).
6. **Kein [Stopp] in der Oberfläche / Fortschritt überschrieben** → Fortschritt „Erkennen … 3/5 · 60 %“ steht jetzt in der Info-Zeile,
   solange ein Auftrag läuft. Die [Stopp]-Taste gehört zur Erkennen-Oberfläche von G9b-2 (ohne Modell gibt es keinen Auftrag) – offen.
7. `new URL` bei about:blank/srcdoc warf → fängt ab, Modus `einfach`. ✓ (t-base)
8. Mikrofon während `tkLoad` → keine Vorstufe mehr während der Aufnahme (Prüfung nach dem Warten). ✓
9. Marken-Haken löschte `G9.auto` → bleibt (Marke ändern ist keine Text-Änderung). ✓
10. Testlücke „Fenster nicht doppelt“ (nur 1 Fenster) → `tests/pruefer/t-hold.mjs` mit 90 s / 4 Fenstern: 0,1,1,2,3. ✓
Ohne Fund geprüft: Fuzz 750 Schritte (je Aktion ein Undo, Undo/Redo deep-equal, Zeiten monoton, `normLy` idempotent), Speichern → Laden,
Regel 28, ohne Worker (Haupt-Faden-Rückfall), Markennamen, Supabase, VERSION, SHA-256, Pfade für `/Synquenzer/`.

## Offen
- **`sw.js`** (Merge): in `activate` `synq-g9-` vom Löschen ausnehmen: `ks.filter(k => k.startsWith('synq-') && !k.startsWith('synq-g9-') && k !== CACHE)`.
- **G9b-0/1/2 (Sprachmodell)**: Freigabe F0 fehlt. Andock-Stelle `G9.asr` (Fenster → Wörter); Lader/Cache/Weg-Wahl/Diagnose-Zeile, [Stopp]-Taste und Download-Fortschritt kommen mit G9b-2.
- K-G9 (a)/(b) echter Gesang (F0/F7) für G9-02/04/21 nachmessen.
- Gerätepunkte G9-60…64 (iPhone), Geräte-Probe G9-61 (`probe.html`) → Haptik-Labels im Dock und `g9KbSim`-Höhen.
- I4 (`take.tp`): Tipp-Kosten bleiben aus (G9-55 in G9S: kein Gewinn).

## Bitte prüfen (Xander am iPhone, Seite G9STAGE)
1. Marken-Editor → [Text]: Silben sind nicht mehr blass, die Info-Zeile sagt nicht mehr „Silbentrennung vereinfacht“ (nur beim allerersten
   Öffnen ohne Internet).
2. [Ganzer Text] mit deinem Songtext: Stimmen „Ge-dan-ken“, „A-bend“, „Feu-er“? Landen Silben nach einem langen Ton nicht mehr eine Marke zu früh?
3. Im Marken-Modus eine Marke mit Silbe verschieben und eine löschen: geht die Silbe mit? Rückgängig stellt beides her?
4. Alles aus G9c (Tippen, Ersetzen, [+], ‹ ›, Verschmelzen, Trennen, Dock) wie vorher.
