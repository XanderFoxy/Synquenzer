# G10g – Tonhöhe nach Tonart: wählbar, sauber, Konsonanten sichtbar geschützt

Basis: `bau/snapshots/R-4300.html` (App 4.30.0) → `bau/helfer/G10G/index.html`. VERSION bleibt `'4.30.0'`.
Spec: `spec/dirigent-spec-v3-nachtrag-9-gesang-studio.md` §2 und §2.7 (G10-60 … G10-66).
Gebaut wird reproduzierbar mit `python3 bau/helfer/G10G/werkzeug/baue.py` (jede Ersetzung genau einmal, sonst Abbruch);
der neue Code liegt lesbar in `werkzeug/g10g.js` und `werkzeug/g10g.css`.

## Was Xander sieht (Tonhöhe-Blatt: Takes-Blatt → [♪ Tonhöhe · Noten])

- **Tonart-Chip im Kopf** (zweizeilig, ≥ 44 px): oben die Tonart („E-Moll“), darunter „Tonart · Auto ▾“ bzw. Gesang / Projekt / Hand / fest.
  Ist die Erkennung unsicher (< 0,25), stehen beide Vorschläge im Chip („C-Dur / A-Moll“).
- **Leiste** (Tipp auf den Chip, liegt über dem Blatt, kein Layout-Sprung): [Auto (Szene)] [Aus dem Gesang] [Projekt] [Fertig],
  12 Grundtöne, Leitern Dur · Moll · Dorisch · Mixolydisch · Phrygisch · Pent. Dur · Pent. Moll · Harm. Moll · Chromatisch.
  Bei unsicherer Erkennung eine Zeile mit beiden Vorschlägen (Tipp tauscht). Jeder Tipp = 1 Undo.
- **Quantisieren an:** ▲/▼ und senkrechtes Ziehen gehen **stufenweise in der Tonart** (E → F → G in C-Dur).
  **Halten + Ziehen** geht frei in Halbtönen (F → F♯). Ohne Quantisieren wie bisher (Halbton).
- **Halten auf einer Note** (≈ 0,45 s, ohne Ziehen) = „nicht rastern“ an/aus (Blue Notes, Schleifer); die Note bekommt einen
  gestrichelten hellblauen Rahmen. Während des Haltens zeigt ein weißer gestrichelter Rahmen, dass der Halte-Modus greift.
- **Regler „Einrast-Zeit“** 0–100 ms unter „Stärke“ (ersetzt die festen 15/40 ms; ab Werk Hart 15, Weich 40). Eine Geste = 1 Undo.
- **Stimmlose Teile** (s, t, k, Atem: kein Ton, aber Pegel) liegen als graue Schraffur unter den Noten – man sieht, dass sie unberührt bleiben.
- **Vorhören beim Verschieben** (Xanders Wunsch 01.11.): Ziehen und ▲/▼ spielen sofort die Note der gehörten Fassung in der neuen Lage
  (ein Klang, 8 ms Anstieg, ≤ 40 ms Ausklang, höchstens 0,6 s; ein neuer Schritt blendet den vorigen in 12 ms aus – kein Stotter-Kleben).
  Nur bei angehaltenem Transport (beim Abspielen hört man die neue Fassung ohnehin).
- Name: Die Leiste heißt „Leiter“ für die Tonleiter-Auswahl wie in der App; der Chip heißt „Tonart“ wie [Tonart: Auto] im Noten-Editor.

## Daten (Format 5, nur additiv – Regel 28)

Am Take (`take.pitch`, normiert in `g2NormPitch`):
- `key.src = 'auto' | 'user'`, dazu `key.via = 'gesang' | 'projekt'` (Herkunft für den Chip) und `key.alt = {root, scale}` (zweiter Vorschlag bei unsicherer Erkennung).
- `notes[k].nq = true` (nicht rastern), `rt` (Einrast-Zeit ms, 0–100), `v = 2`.
- Neue Tonhöhen (erstes Weich/Hart/Verschieben nach dem Update) bekommen `v: 2` und `key.src: 'auto'`.
- Fehlen `v` und `key.src` (alle Takes bis 4.30.0): `P.key` bleibt eingefroren, G7 rechnet mit `g7Key`, der Plan an den Kern ist Feld für Feld
  derselbe wie 4.30.0 → Render bitgleich, Cache-Schlüssel gleich (G10-65).

## Technik

- **Kern** `g2PitchMake` (läuft auch im Worker): `curve()` – Oktav-Klammer (weicht der 3-Frame-Median mehr als 1,5 Halbtöne von `n.m` ab, gilt `n.m`)
  und Einrast-Zeit `plan.rt` nur bei `plan.v === 2`; `planKey` hängt `|v2|rt` nur bei v = 2 an.
- **Eigene Leitern** `G10G_SCALES` (Spec-Name `G2_SCALES` als Alias) mit `g10gScale()`: zuerst diese Liste, dann `Harmony.SCALES`.
  `Harmony.SCALES` und `KeyDetect` bleiben unangetastet. `g2NormPitch` und `g2Snap` lesen über `g10gScale`.
- **Gemeinsame Tonart-Quelle** `g10gKeys(id, P)`: bei `src 'auto'` je Note – Szene-Clip: Tonart der Szene (`g2KeyAt`), Song-Stimme: Szene an dem Takt
  der Note (`g2SongScene` + `sceneKeyOf`, Takt über `g10gBpb()` = `grid().beatsPerBar`). Genutzt von G2 (`g10gPlan` in `g2Plan`),
  G7 (`g7Shift` je Note, `g7Pre`), G5 (`g5Pitched` – die Melodie aus dem Gesang hört dieselbe Fassung) und der Anzeige.
- **Neu-Lesen bei Auto:** `g2SetQ` liest bei jedem Weich/Hart neu; Szenen-Änderungen wirken sofort im Plan (er wird bei jedem `tkPlayBuf` aus der
  Quelle gebaut).
- **„Aus dem Gesang“** = `KeyDetect.detectKey` über die Take-Noten (Dauer in Schlägen, damit gewichtet; Takt aus `g10gBpb()`). Unsicher
  (`conf < 0,25`): zweiter Kandidat von KeyDetect, sonst die Paralleltonart.
- Geänderte Stellen in bestehenden Funktionen (alle mit `// G10g` markiert): `curve`, `planKey` (Kern), `g2NormPitch`, `g2Snap`, `g2Target` (dritter,
  optionaler Parameter = Tonart der Note; `nq`), `g2Plan`, `g5Pitched`, `g2Edit` (neue Tonhöhe v 2/Auto; gewählte Tonart bleibt auch ohne
  Quantisieren), `g2SetQ`, `g2Open` (Chip, Leiste, Regler), `g2Close`, `g2Paint` (Tonart je Note, Schraffur, Rahmen, Name eigener Leitern),
  `g2Gest` (Halten, stufenweises Ziehen), `g7Shift`, `g7Pre`, Export der Test-API. 40 Zeilen außerhalb der G10g-Blöcke.
- Neuer Code: JS-Block `/* G10G-BEGIN */ … /* G10G-END */` nach G7, CSS zwischen `/* G10G-CSS-BEGIN */` und `/* G10G-CSS-END */`.
  Alle neuen Namen `g10g…`/`G10G…`, außer dem Spec-Alias `G2_SCALES`.
- Test-API (`SYNQUENZER.g10g…`): `g10gInfo`, `g10gKey`, `g10gStep`, `g10gNq`, `g10gRt`, `g10gDetect`, `g10gSnap`, `g10gScales`, `g10gUnvoiced`, `g10gPanel`.
- Querformat: der Kopf des Tonhöhe-Blatts ist 44 statt 40 px hoch (sonst wäre der Chip unter 44 px); die Notenfläche bleibt 160 px.

## Parallel laufende Pakete (beim Zusammenführen beachten)

- **G10h** (Notenfenster) soll Chip und Leiterstufen übernehmen: `g10gStepD`, `g10gKeys`, `g10gKeyLabel`, `g10gSetKey` sind dafür eigenständig.
- **G10i** (Chor in der Tonart): `g6`-Zeile mit `g2Snap(n.m, P.key)` (Chor-Plan, `G6`) ist bewusst **nicht** umgestellt – dort fehlt noch `nq`
  und die Tonart je Note. Vorschlag: Chor-Plan über `g10gPlan` bauen.
- **G10c/G10e/Hotfix 4.30.1:** berühren andere Funktionen; Konfliktgefahr nur in `g2Open`/`g2Paint` (Kopf des Blatts), falls dort auch Knöpfe dazukommen.

## Offene Fragen (für Xander / Dirigent)

1. **Halten:** Spec Nr. 2 „Halten + Ziehen frei“ und Nr. 4 „Halten = nicht rastern“ teilen sich die Geste. Gebaut: Halten und **loslassen** schaltet
   „nicht rastern“, Halten und **ziehen** verschiebt frei. Passt das so?
2. **Vorhören** spielt die Note der gehörten Fassung schneller/langsamer abgespielt (klingt kurz „Micky-Maus“ bei großen Schritten), weil die echte
   Fassung erst im Worker gerechnet wird. Reicht das, oder lieber ein reiner Ton der Zielhöhe?
3. **„Projekt“** übernimmt die Projekt-Tonart als feste Wahl (ändert sich das Projekt später, bleibt der Take). Soll „Projekt“ mitwandern wie „Auto“?
4. Song-Stimme mit Auto: die Takt-Zuordnung je Note rechnet ohne Zeitkarte (Warp) des Takes – bei stark verschobenen Takes kann eine Note am
   Taktrand die Tonart der Nachbar-Szene bekommen.
5. „Szenen-Änderung“ wirkt beim nächsten Abspielen/Neuzeichnen; ein offenes Blatt zeigt sie nach dem nächsten Zeichnen.
