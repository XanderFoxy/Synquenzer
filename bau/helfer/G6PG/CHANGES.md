# G6+g – Farbige Schatten der Chorstimmen, Legende, „Selbst singen“ v2

Basis `bau/snapshots/R-4252.html` (4.25.2, VERSION unverändert). Spec: Nachtrag 10 §1.6, Paket G6+g.
Bau: `python3 werkzeug/apply.py` (Basis + `g6pg-block.js` + Haken) → `index.html`; `patch.diff` = örtlicher Unterschied zur Basis.

## Neu
- **Farbtabelle §1.6** je Note nach Intervall zum Lead (Stufen, ohne Oktave): Terz rot 3 (Dezime „10“), Quinte grün 5, Sexte blau 6,
  Oktave violett 8, Quarte orange 4, Sekunde/Septime braun 2/7, Unisono grau 1, freie Gegenstimme gelb (ohne Ziffer).
  Tokens `--chor1 --chor2 --chor3 --chor4 --chor5 --chor6 --chor8 --chorF` dunkel (`:root`) und hell (`:root[data-theme="light"]`, für später).
  Kontrast gemessen: dunkel ≥ 6,0 : 1, hell ≥ 4,5 : 1.
- **Farbe der Spur:** Intervall-Rolle (`st±n`, `oct±n`, `uni`, `/o±n`) aus der Rolle, `free` gelb, Akkord-Rolle (`ch±n`, `root-`) und v1-Chöre = häufigstes Intervall der Stelle (Gleichstand: kleineres).
- **Noten-Editor (g2Paint):** alle Chorstimmen halbtransparent hinter den Lead-Blöcken, Ziffer im Block, sobald er hoch genug ist.
  In einer Chorstimme: Lead grau, die anderen Stimmen farbig. Der Tonbereich schließt die Schatten ein.
- **Marken-/Wellen-Editor (wpPaint):** dünne farbige Tonhöhenlinien über der Welle (Band oben, kleine Ziffer).
- **Legende** (Chip je Chor-Spur: Farbfeld + Ziffer, Name, Auge, Solo) als Leiste **oben in der Noten-Leinwand**; die Noten bekommen darunter
  Platz. Treffer 44 × 44, Leiste scrollt innen. Solo aus der Legende endet beim Schließen des Editors. Auge = Laufzeit (nicht gespeichert).
- **Tipp auf einen Schatten** öffnet diese Stimme (im Chor-Editor öffnet ein Tipp auf den grauen Lead den Lead).
- **„Selbst singen“ v2** (`g6pgSing`): Zielstimme spielt als Führung, Lead **−12 dB** (Schalter „Lead leise“ in der Legende; aus = Lead stumm),
  andere Stimmen stumm. Im Editor: ihr Schatten kräftig, die anderen blass. Die Aufnahme ersetzt die Stimme: Spur, Pan, Pegel bleiben; bei v2 `dblOff: true`.
  Ein Undo-Schritt gehört zur Aufnahme (wie bisher `g6Took`). Der Knopf „Selbst singen“ im heutigen Chor-Blatt läuft schon darüber.
- **Leistung (iPhone):** Geometrie je Stelle im Cache nach Daten-Prüfsumme (O(Noten), ohne JSON); je Ansicht ein Bild-Puffer (Offscreen-Canvas).
  Neu gezeichnet wird nur bei geänderter Ansicht, Daten, Auge oder Hervorhebung, sonst gibt es ein `drawImage`. Zoomen/Scrollen = Geometrie-Treffer.

## Haken in der Basis (örtlich, siehe patch.diff)
`g2Open` (Legende), `g2Paint` (Bereich, Platz oben, Schatten, Legende), `g2Gest` (Tipp auf Schatten), `g2Close`/`wpClose` (Solo endet),
`wpPaint` (Linien), `g6LeadMute`/`g6Start` (Lead leise statt stumm beim Selbst-Singen), `g6Took` (v2: `dblOff`), Chor-Blatt (Selbst singen → `g6pgSing`), Test-API `G6PG_API`.

## Schnittstellen zu G6+a…f, h (Platzhalter nach Spec §2.2)
- liest v2-Daten: `chor.v === 2`, `voices[].lane/rule/n[].d/o/x`, Spuren `S.tracks[st].chor.lanes [{id, role, name, mute}]`.
- v2-Ton = `g6Step(round(g2Target(Lead)), d, Tonart) + 12·o + x` (Lead-Note mit gleichem `t0`), Rückfall `m + iv`. G7 (Transponieren) noch nicht im Schatten: das übernimmt G6+b mit seinem Plan.
- ruft, falls vorhanden: `g6pTrackOf(r)` (Spur der Stelle), `g6pSolo(laneId)` (Solo der Spur, G6+c/e); sonst das v1-Solo je Stimme.
- `g6pgSing(r, k, {leadQ})` für das neue Blatt von G6+e ([⋯] → [Selbst singen]); `G6PG.leadQ` und `g6pgLeadG(r)` für den Klangweg v2 (G6+c), damit dort derselbe −12-dB-Wert gilt.
- ändert keine Daten (nur `dblOff` beim Selbst-Singen v2). Format bleibt.

## Nicht gemacht / offen
- **Legende im Marken-Editor:** nicht eingebaut. Die Leinwand ist dort in P1 nur 63 px hoch (Basis), L1 46 px, und eine 44-px-Leiste würde Noten-Raum
  bzw. die Griffe der Marken verdecken. Die Linien folgen dem Auge aus dem Noten-Editor. → Vorschlag für den Dirigenten/Funk, falls Xander sie dort will.
- Hörbarer Klangweg v2 für „Lead leise“ (Knoten der Gruppe) gehört G6+c; hier ist der v1-Weg gemessen.
