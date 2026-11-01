# SYNQUENZER v3 — Nachtrag 10: G6+ Chor-Gruppe (Genre-Chöre, Chor-Spuren, Entkoppeln, „Als Chor-Stimme duplizieren“, farbige Schatten)

## 0. Kurzfassung für Xander

1. Ein Tipp auf einen Chor-Stil setzt alles auf einmal: Stimmen, Doppel, Panorama, Abstand zum Lead, Hall/Echo und Klang. Es gibt 80er großer Refrain, Pop modern, Gospel, Barbershop, Rock-Shout, Ballade, Disco/Falsett und New Wave dunkel.
2. Jede Chorstimme ist eine eigene, benannte Spur („Chor Terz oben“ …) in der Chor-Gruppe unter deiner STIMME-Spur. Jede Spur hat Pegel, Panorama, Solo und Stumm, die Gruppe hat Abstand zum Lead, Hall, Echo und Klang.
3. „Entkoppeln“ macht eine Chorstimme zur eigenen Aufnahme, die du frei bearbeitest. „Als Chor-Stimme duplizieren“ kopiert deinen Gesang als freie Gegenstimme (diese Stelle oder die ganze Spur), danach tippst du „Background“.
4. In Noten- und Wellenansicht siehst du die Chorstimmen als farbige Schatten (Terz rot, Quinte grün, Sexte blau, Oktave violett …), als Vorlage zum Nachsingen.
5. Alte Projekte klingen genau gleich (einzige Ausnahme ist ein Fehler: zwei Clips mit demselben Take teilten sich bisher die Chor-Regler). Drei kleine Chor-Fehler behebe ich schon in 4.25.2, G6+ kommt als 4.28.0 (≈ 100 h, mit 3 Helfern ≈ 45 h). Von dir brauche ich nur einmal eine SQL-Zeile (`max_format = 6`).

---

Status: **Entwurf, Fassung 2** (01.11.2026; Fassung 1 streng gegen Code und Wünsche geprüft, Änderungen in §4.5). Grundlage sind Xanders Wünsche in `fragen-xander-9.md`: 31.10. ~13:30 (Chor-Rezepte, Doppel, Hall als Send, Echo-/Hallzeiten, selbst nachsingen), ~22:05 (Genre-Chöre), ~22:35 (Chor-Gruppe,
„Als Chor-Stimme duplizieren“) und ~23:30 Punkt 8 („Chor entkoppeln“) und Punkt 11 (farbige Schatten). Dazu kommen G6 aus `CHANGES-helfer-G267.md` und Nachtrag 9 (G10h/i/j).
**Alle Zeilen (Z.) beziehen sich auf `synq-snapshots/G-GES-merge.html` (App 4.25.0)** und verschieben sich beim Bau. Der Code-Befund (G6-Block
Z. 44479–44781, Spur-Modell, Busse, Risiken) ist vollständig eingearbeitet; Fundstellen stehen jeweils am Punkt.

**Kennzeichen:** **[A]** Annahme dieser Spec (wird so gebaut) · **[V]** sichtbare Neuerung, die mit der Auslieferung im Funk angesagt wird ·
**[V-Funk]** eigene Gestaltungs-Entscheidung, die sichtbar etwas Bestehendes ändert und deshalb **vorher** im Funk mit Bild vorgeschlagen wird (CLAUDE.md Regel 3) ·
**[K]** nur aus dem Code gelesen, nicht gemessen · **[S]** Schätzung, wird gemessen · **[W]** Studio-Praxis (Fachwissen, nur in dieser Spec).

**Regeln, die hier besonders gelten** (`typische-fehler.md`, CLAUDE.md):
- **27** Gebaut wird nur, was Xander verlangt hat (Genre-Chöre, Chor-Gruppe, Entkoppeln, Duplizieren, Schatten) und was dafür nötig ist. **Nicht** im Umfang: zweite echte
  Gesangsspur (§2.1), eigene Hallmaschine für den Chor, Kompressor am Chor, Chor-Automation, MIDI-Chor, Live-Tonhöhenpunkt (gehört zu G10j) und die Klavierrolle (G10h).
- **28** Alte Projekte bleiben **Zeichen für Zeichen** gleich und klingen gleich. Ein Chor aus 4.25.0 (ohne `v`) läuft auf einem eingefrorenen Weg „v1“, und neue Rechnungen
  hängen am Versionsfeld `chor.v = 2`. Nichts wird beim Laden umgewandelt.
- **30** Die Spec entscheidet nach Studio-Praxis. Gefragt wird nur nach Geld und Zugängen (§4.4).
- **1/4/5** Treffer mindestens 44 × 44 px, nichts abgeschnitten, kein Layout-Sprung. Geprüft wird in P1 320 × 568, P2 375 × 667, P3 390 × 844, L1 568 × 320, L2 844 × 390 und 926 × 428.
- **7/8/9** Eine Geste ergibt einen Undo-Schritt. Speichern → Laden ist deep-equal: neue Felder laufen durch Normalisieren, Kopien, ZIP, Verlauf und Online.
- **24** In Oberfläche, Hilfe, Bezeichnern und Testnamen stehen keine Hersteller-, Produkt-, Künstler- oder Programmnamen. Die Stil-Namen sind Genre-Bezeichnungen.
- **20** Kein Supabase-Aufruf durch den Dirigenten. Die SQL-Zeile setzt Xander (§4.4).
- **29** Gebaut wird in Zweigen, parallel (§4).
- **CLAUDE.md-Vorrang Leistung:** Nichts lädt beim App-Start. Gerechnet wird im Worker und nur für das Clip-Fenster, mit einer Speicher-Obergrenze für Chor-Puffer, und
  im Haupt-Faden gibt es keinen Task über 50 ms. **WebGL bringt hier nichts:** Der Engpass ist das Rechnen der Stimmen im Worker, nicht das Zeichnen. Schatten und
  Mischpult schafft Canvas 2D bzw. DOM.

---

## Übersicht: Xanders Wünsche → Stand 4.25.0 → wo gelöst

| Wunsch (Xander) | Stand 4.25.0 (Befund) | Gelöst in |
|---|---|---|
| 22:05 Chor auf Knopfdruck je Genre (Rezept + Abstände + Effekte + Mischung) | 8 Rezepte, nur 2 Mischungen (`G6_REC` Z. 44492, `G6_MIX` Z. 44496); die Mischung ändert **globale** Hall-/Echo-Werte (`g6Mix` Z. 44696, Zeile Z. 44706) | G6+d, G6+c |
| 13:30 „Hall als Send, Echo-/Hallzeiten“ je Rezept | v1 setzt Hall-Vorverzögerung und Echo-Teilung **global** (Z. 44706) | G6+c (Vorverzögerung im Gruppen-Send), G6+d (Echo-Zeit nur auf Tipp, §1.2) |
| 22:35 Jede Chorstimme eine eigene, benannte Spur, Gruppe mit Gruppen-Pegel/-Hall, Solo/Stumm je Stimme | Stimmen sind Stücke **an** der STIMME-Spur; Pegel/Pan/Sends je Stimme nur über die Test-API (`g6VoiceSet` Z. 44714); keine Gruppe, keine Busse | G6+a, G6+c, G6+e |
| 22:35 Doppel + Verstimmung + Zeitversatz + Panorama „studiomäßig“ | fest im Code: 2 Kopien 12 ms/−6 ct und 24 ms/+8 ct (`G6_COPY` Z. 44494), Panorama nur für 1–3 Stimmen (`G6_PAN` Z. 44565) | G6+b, G6+d, G6+e |
| 22:35 „Gesangsspur duplizieren“ / „Als Chor-Stimme duplizieren“ → freie Gegenstimme, dann Preset „Background“ | fehlt; Take-Felder hängen an der Take-Kennung (Notenziehen würde den Lead ändern) | G6+f (diese Stelle oder ganze Spur) |
| 23:30 Pkt. 8 „Chor entkoppeln“ | fehlt | G6+f |
| 23:30 Pkt. 11 farbige Schatten (Terz rot, Quinte grün …) als Vorlage zum Nachsingen | fehlt | G6+g (Grundlage), G10i (Klavierrolle) |
| (Befund) Chor folgt Lead-Änderung und modalem Transponieren nicht | `iv` in Halbtönen fest gespeichert (`g6Build` Z. 44567) | G6+b (Stufen statt Halbtöne) |
| (Befund) Mängel im heutigen G6 | ZIP ohne selbst gesungene Takes, Solo hängt, Knoten geteilt, ganzer Take gerechnet | G6+0, G6+b |

**Antworten auf die offenen G6-Fragen (CHANGES-helfer-G267, Regel 30):**
(1) Eigene Spuren je Chorstimme: **ja**, als Chor-Spuren in der Chor-Gruppe der STIMME-Spur (§2.1).
(2) Pegel, Verstimmung und Versatz werden einstellbar: Abstand zum Lead als Gruppen-Regler in LU, Doppel unter „⋯“.
(3) Die Mischung ändert **keine** globalen Hall-/Echo-Werte mehr. Neu sind Sends der Gruppe und eine eigene Hall-Vorverzögerung im Send.
(4) „Selbst singen“ bleibt beim Ablauf „scharf schalten, dann ●“. ● zeigt dabei die Zielstimme an. Mit H5 (4.25.1) schaltet ● das Mikro selbst ein.

---

## 1. Ziel und Bedienung auf dem iPhone

**Ziel.** Ein Tipp ergibt einen fertigen Chor im Stil des Genres, wie im Studio gemischt. Jede Stimme ist danach eine eigene Spur, die man einzeln hört, regelt,
nachsingt oder ganz freigibt. Der Lead bleibt die Referenz, und der Chor ändert ihn nie.

### 1.1 Chor auf einen Tipp

1. STIMME-Clip ✎ (oder ein Song-Stimmen-Stück) → Takes-Blatt → **[Chor]** öffnet das Blatt **„Chor“** (wie heute, `g6Sheet` Z. 44737).
2. Oben steht das Raster **„Stil“** mit 8 Kacheln: **80er großer Refrain · Pop modern · Gospel · Barbershop · Rock-Shout · Ballade · Disco/Falsett ·
   New Wave dunkel**. Jede Kachel ist ≥ 52 px hoch, im Hochformat **2 Spalten × 4 Zeilen** (bei 320 px sind 3 Spalten nur ≈ 90 px breit, Name und Zeile passen dort nicht
   ohne Abschneiden), quer 4 Spalten × 2 Zeilen. Unter dem Namen steht eine kleine Zeile mit **höchstens 20 Zeichen**, z. B. „Terz+Okt · viel Hall“; beide Zeilen
   passen ohne Umbruch und ohne Auslassungspunkte (M-PLATZ, G6P-41).
3. **Ein Tipp** rechnet den Chor. Die Kachel zeigt einen Fortschrittsring (ohne Höhenänderung). Der Chor setzt hörbar mit einer 10-ms-Blende ein, **sobald alle Stimmen fertig sind**, nie
   stückweise und nie mit einem Platzhalter-Pegel. Danach erscheint ein Toast: „Gospel: 3 Stimmen · 6 LU unter dem Lead“.
4. Ein Stil setzt mit diesem einen Tipp: **Rezept** (welche Stimmen in welchen Intervallen), **Doppel** (Anzahl, Zeitversatz, Verstimmung, Breite), **Panorama** und **Pegel** je Stimme,
   **Abstand zum Lead** (LU), **Hall-Send mit Vorverzögerung im Tempo**, **Echo-Send**, **Klang** (Tiefschnitt, Mitte, Luft) und **Zischlaute im Chor**. Die Werte stehen in §3, G6+d.
5. Ein anderer Stil auf denselben Clip ist wieder ein Tipp und ein Undo-Schritt. Ändert sich nur die Mischung (gleiches Rezept), rechnet nichts neu; der Wechsel ist sofort zu hören (20-ms-Rampen).
   **[A] Was ein Stil ersetzt:** nur die **errechneten** Stimmen der Stelle. Stimmen mit eigener Aufnahme (`take`: selbst gesungen, entkoppelt, dupliziert) bleiben mit Noten, Pegel, Pan
   und Doppel erhalten; die Gruppe (`grp`) bekommt die Werte des Stils. Kämen so mehr als 6 Stimmen zusammen, sagt ein Toast „Höchstens 6 Stimmen – eine Stimme löschen“, und nichts ändert sich.
6. Ein Stil gilt für **diese Stelle** (diesen Clip bzw. dieses Song-Stück). Andere Chor-Stellen ändern sich nie von selbst; das schützt vor „klingt später anders“
   (Xanders K1-Klage). **[Auf alle Chor-Stellen]** im Blatt überträgt die Gruppen-Einstellungen bewusst auf alle Chor-Stellen der Spur (ein Undo).

### 1.2 Die Chor-Gruppe: jede Stimme eine eigene Spur

Unter dem Stil-Raster liegt das **Mischpult der Chor-Gruppe**:

```
┌ Chor-Gruppe ───────────────────────────────────────────────┐
│ [Chor an]  Abstand zum Lead ──●── 8 LU   Hall ─●─  Echo ●── │
│ [Klang ▸]                                  [Auf alle Stellen]│
├────────────────────────────────────────────────────────────┤
│ ■3 Chor Terz oben    [S][M]  Pegel ──●──  Pan L─●─R  [♪][⋯] │
│ ■8 Chor Oktave oben  [S][M]  Pegel ─●───  Pan L──●R  [♪][⋯] │
│ ■1 Chor Unisono      [S][M]  Pegel ──●──  Pan L─●─R  [♪][⋯] │
│ [+ Stimme ▾]                                                 │
└────────────────────────────────────────────────────────────┘
```

- **Zeile je Chor-Spur** (≥ 48 px hoch). Ganz links steht ein Farbfeld mit Ziffer (3 = Terz, 5 = Quinte, 8 = Oktave …, siehe §1.6). Dann kommt der **Name** (fertig vergeben nach der
  Namens-Tabelle §2.2, z. B. „Chor Terz oben“); ein Tipp darauf benennt die Spur um (höchstens 24 Zeichen). Es folgen **[S] Solo**, **[M] Stumm**, **Pegel** (−24…+6 dB, Doppeltipp = Wert des Stils),
  **Pan** (L…R, Doppeltipp = Stil), **[♪]** Noten der Stimme und **[⋯]** mit Doppel, Selbst singen, Entkoppeln und Stimme löschen.
- **Was wo gilt:** **Pegel, Pan und Doppel** sind Werte der Stimme **an dieser Stelle** (`voices[k].db/pan/w/dbl`, der Stil setzt sie; andere Stellen ändern sich nicht).
  **Name, Farbe und Stumm** gehören der **Spur** und gelten an allen Stellen. Je Stelle hat jede Spur höchstens eine Stimme (eine Rolle = eine Spur; nur freie Gegenstimmen bekommen je eine eigene Spur).
- **Solo** einer Spur: nur diese Stimme mit der Begleitung, Lead und andere Chor-Spuren schweigen. Solo gilt nur, solange das Blatt (bzw. der Noten-Editor mit Legende, §1.6) offen ist; beim Schließen ist es aus.
  **Stumm** ist eine Mix-Entscheidung und wird gespeichert. Stumm gilt für diese Spur an **allen** Stellen, denn die Spur ist dieselbe.
- **Gruppen-Zeile:** **[Chor an/aus]** (A/B mit und ohne Chor; gespeichert als Spur-Merkmal `S.tracks[st].chor.mute`, gilt für alle Stellen, ein Undo-Schritt), **Abstand zum Lead** (2…20 LU, Schritt 0,5)
  ist der Gruppen-Pegel: Der Chor als Ganzes liegt immer so viele LU unter dem Lead. Die Pegel der Stimmen verteilen nur **innerhalb** des Chors. Dazu kommen **Hall** und **Echo** (Sends der Gruppe, 0…100 %)
  und **[Klang ▸]** mit Tiefschnitt (Hz), Mitte (dB), Luft (dB), **Zischlaute im Chor** [ganz] [leiser] [weg] und **Hall-Vorverzögerung** [aus] [1/64] [1/32] [1/16].
- **Echo-/Hallzeiten (Xander 13:30):** Die Hall-Vorverzögerung im Tempo liegt im Gruppen-Send (oben). Die **Echo-Zeit** ist ein Wert des ganzen Songs (globales Echo) und wird vom Stil
  **nicht** heimlich umgestellt. In [Klang ▸] steht dafür die Zeile „Echo-Zeit des Songs: 1/8. · **[Stil-Wert 1/4 übernehmen]**“ (Vorschläge in G6+d). Ein Tipp stellt die globale
  Echo-Teilung um (ein Undo-Schritt, Toast „gilt für alle Spuren“). Ohne Vorschlag (Echo-Send 0) fehlt die Zeile. **[W]** Im Studio teilen sich Lead und Background meist das Song-Echo.
- **[⋯] → Doppel:** Anzahl [1] [2] [3] [4], Zeitversatz (ms), Verstimmung (Cent), Breite (%). Eine Änderung rechnet nur diese Stimme neu.
- **[+ Stimme ▾]** fügt dieser Stelle eine Stimme hinzu, auch zu einem Stil (z. B. Gospel + Oktave oben): Terz, Quarte, Quinte, Sexte, Oktave je oben/unten,
  Akkordton oben/unten, Grundton unten, Terz + Oktave, Unisono-Doppel. Höchstens 6 Stimmen je Stelle und 8 Chor-Spuren je Gruppe. Eine Rolle, die an der Stelle schon da ist, steht grau in der Liste.
- **Spur-Grenze:** Braucht ein Stil oder [+ Stimme] eine neue Spur und es gibt schon 8, wird eine **nicht benutzte** Spur (grau, ohne Stimme an irgendeiner Stelle) übernommen und
  umbenannt. Gibt es keine, sagt ein Toast „Höchstens 8 Chor-Spuren – eine Spur löschen“, und nichts ändert sich. Eine graue Spur hat in [⋯] nur **[Spur löschen]** (ein Undo-Schritt).
- Die STIMME-Spur ist der Ordner: **Ihr Pegel und ihr Stumm gelten für Lead und Chor zusammen**, damit der Abstand bleibt. Die Chor-Gruppe hat keinen eigenen Platz in der Matrix.
- **Hochformat:** Die Spur-Zeilen sind zweizeilig (Name und Knöpfe oben, Regler unten). **Querformat:** einzeilig. Die Spur-Liste scrollt **innen**, die Seite nicht.

**Sichtbar in Matrix und Song [V-Funk]:** In der STIMME-Zelle zeigt eine Reihe farbiger Punkte (einer je Chorstimme, unten im Feld, ohne Größenänderung), dass dort
ein Chor liegt. Im Song stehen in STIMME-Stücken mit Chor dünne Farbstreifen (2 px je Stimme) am unteren Rand, innerhalb der heutigen Höhe. Beides wird vor dem Bau
mit Bildschirmfoto im Funk vorgeschlagen; G10i baut darauf das größere Chor-Band.

### 1.3 Noten einer Chorstimme ändern

[♪] öffnet die Stimme im **Noten-Editor** (heute der G2-Editor `g2Open(r, {voice})` Z. 44307, ab G10h die Klavierrolle). ▲▼ und Ziehen verschieben jetzt in **Leiterstufen** der Tonart
(heute Halbtöne über `g6NoteShift` Z. 44715). Ein langer Druck auf ▲▼ schaltet auf **chromatisch** (Halbton). Jede Geste ist ein Undo-Schritt. Der Lead liegt grau dahinter, die anderen
Chorstimmen als farbige Schatten (§1.6).
**Neu:** Der Chor folgt dem Lead. Ziehst du eine Lead-Note von E nach F, wird die Terz oben automatisch A und nicht G♯. Beim Transponieren in eine andere Tonart (auch Dur → Moll)
bleibt jede Chornote leitereigen. Von Hand geänderte Chornoten behalten ihren Abstand in Stufen. Das gilt für die Chor-Gruppe (v2). Ein Chor aus 4.25 (v1) behält seinen festen
Halbton-Abstand wie heute (Regel 28); dort zeigt der Editor nach einer Lead-Änderung den Hinweis „Chor (Fassung 4.25) folgt in Halbtönen“ mit **[Auf Chor-Gruppe umstellen]**.

### 1.4 Entkoppeln (Xander Punkt 8)

1. In der Spur-Zeile [⋯] → **[Entkoppeln]**. Die Meldung „Chor Terz oben ist jetzt eine eigene Aufnahme – folgt dem Lead nicht mehr“ erscheint mit [Rückgängig].
2. Die Stimme klingt danach **genauso wie vorher**. Sie ist aber jetzt ein eigener Take mit eigener Kennung und erscheint im Takes-Blatt als „Chor Terz oben (aus Take 3)“.
3. Frei bearbeitbar wie jeder Gesangs-Take: Noten (Tonhöhe, Quantisieren), Marken/Zeitkarte, Säubern. Änderungen am Lead wirken nicht mehr auf diese Stimme, und Änderungen an ihr nicht auf den Lead.
4. Sie bleibt in ihrer Chor-Spur (Pegel, Pan, Doppel, Solo/Stumm wie vorher) und spielt weiter mit dem Lead-Clip, weil sie zu dieser Stelle gehört (auch nach Klammern oder Rücken, §2.2). Mit dem Transponieren geht sie mit wie der Lead (G7).

### 1.5 Als Chor-Stimme duplizieren (Xander 22:35)

1. Takes-Blatt eines STIMME-Clips oder Song-Stücks → **[Als Chor-Stimme duplizieren]** (neben [Chor]) → zwei Knöpfe **[Diese Stelle]** · **[Ganze Spur]** (Xander: „Gesangsspur duplizieren“).
2. Sofort und ohne Rechenzeit entsteht eine neue Chor-Spur **„Gegenstimme 1“** (Farbe gelb = freie Stimme). Sie ist eine Kopie deines Gesangs mit eigener Take-Kennung und klingt zunächst
   in der Tonhöhe genau wie der Lead: eine Kopie ohne Versatz/Verstimmung, Pan Mitte, Pegel 0 dB. Ist die Gruppe der Stelle neu, bekommt sie die Background-Gruppenwerte (G6+d), die Kopie liegt
   also gleich 9 LU unter dem Lead.
   **[Ganze Spur]** legt dieselbe Spur „Gegenstimme 1“ an **jeder** Stelle der STIMME-Spur an (alle STIMME-Clips aller Szenen und alle Song-Stimmen, je Stelle eine eigene Take-Kennung, damit Noten-Änderungen an einer Stelle keine andere berühren), ein Gruppen-Undo.
   Die Noten bearbeitest du danach je Stelle. Stellen, die schon 6 Stimmen haben, werden übersprungen (der Toast nennt ihre Zahl). **Grenze [K]:** `tkNormTakes` (Z. 39783) behält höchstens 512 Takes; würde [Ganze Spur] das überschreiten, sagt ein Toast das vorher, und nichts ändert sich.
3. Der Noten-Editor der Kopie öffnet sich direkt (bei [Ganze Spur]: die Stelle, von der aus getippt wurde): Noten ziehen ergibt deine eigene Gegenstimme. Der Lead bleibt unberührt.
4. In der Spur-Zeile steht die Kachel **[Background]**. Ein Tipp setzt Doppel, Panorama und Pegel der Stimme und, falls die Gruppe der Stelle neu ist, Abstand, Klang und Hall (Werte in G6+d);
   bei [Ganze Spur] an allen Stellen dieser Spur (ein Undo). Mehrere Gegenstimmen werden abwechselnd links und rechts verteilt.

### 1.6 Farbige Schatten als Vorlage zum Nachsingen (Xander Punkt 11)

- **Farben nach Intervall** zum Lead, je Note (Ziffer im Block für Farbschwäche):

| Intervall (Stufen zum Lead, ohne Oktave) | Farbe | Ziffer |
|---|---|---|
| Terz (auch Dezime) | rot | 3 (10) |
| Quinte | grün | 5 |
| Sexte | blau | 6 |
| Oktave (±12) | violett | 8 |
| Quarte | orange | 4 |
| Sekunde / Septime | braun | 2 / 7 |
| Unisono / Doppel | grau | 1 |
| freie Gegenstimme (dupliziert, ohne Rezept) | gelb | – |

  Die Farben sind eigene Tokens (`--chor3`, `--chor5` …) für hell und dunkel, mit Kontrast ≥ 3 : 1 zum Hintergrund. Xander nennt nur „Terz rot, Quinte grün …“; Sexte blau, Oktave violett und
  Unisono grau stehen schon in Nachtrag 9 §2.9 und werden übernommen, Quarte, Sekunde/Septime und gelb kommen hier dazu. **Diese Tabelle gilt auch für G10i.**
- **Farbe der Spur** (Farbfeld, Matrix-Punkt, Song-Streifen, Legenden-Chip): bei Intervall-Rollen (`st±n`, `oct±n`, `uni`) aus der Rolle, bei freien Stimmen gelb. Bei **Akkord-Rollen**
  (`ch±n`, `root-`, z. B. Gospel, Barbershop) wechselt das Intervall von Note zu Note; Farbfeld und Punkt zeigen dann das **häufigste Intervall der Stimme an dieser Stelle** (gleich häufig: das
  kleinere), mit dessen Ziffer. Die Schatten färben immer je Note.
- **Wo:** Im Noten-Editor der Lead-Stimme liegen alle Chorstimmen halbtransparent hinter den Lead-Blöcken, im Marken-/Wellen-Editor (`wpPaint` Z. 42677) als dünne
  farbige Tonhöhenlinien über der Welle. Oben steht eine Legende mit einem Chip je Chor-Spur: **Auge** (zeigen/ausblenden) und **Solo**. Ein Tipp auf einen Schatten öffnet diese Stimme.
- **Vorlage zum Nachsingen:** [⋯] → **[Selbst singen]**: Die Zielstimme spielt als Führung, der Lead leise (−12 dB, Schalter „Lead leise mithören“). Im offenen Editor ist ihr Schatten kräftig
  hervorgehoben, die anderen sind blass. ● nimmt auf (mit 🎤; ab H5 schaltet ● das Mikro selbst ein), und die Aufnahme ersetzt die errechnete Stimme in ihrer Spur. Panorama, Pegel und Spur
  bleiben, die Doppel sind dann aus und lassen sich wieder anschalten. Die Live-Anzeige der eigenen Tonhöhe (Punkt grün/gelb) kommt mit G10j.

### 1.7 Was gleich bleibt

- Projekte ohne Chor und Chöre aus 4.25.0 klingen bitgleich. Ein alter Chor zeigt im Blatt „Chor (Fassung 4.25)“ mit seinen bisherigen Knöpfen. Ein Tipp auf einen Stil oder
  **[Auf Chor-Gruppe umstellen]** wandelt ihn um (ein Undo-Schritt, der Klang ändert sich, ein Toast sagt das).
- Lead, Lead-Effekte (G4), Auto-Pegel (VS-P) und die globalen Hall-/Echo-Einstellungen bleiben unberührt (die Echo-Zeit nur, wenn man ihren Vorschlag antippt, §1.2).

---

## 2. Technik

### 2.1 Entscheidung Spur-Modell: Chor-Spuren als Unterspuren der STIMME-Spur (Weg B)

| | **A: echte Spuren** (MAX_T > 8) | **B: Gruppen-Spur mit Unterspuren** ✔ |
|---|---|---|
| Code | 15× `new Array(8)` (`R.slot/…` Z. 19148–19153, `AU.synth` Z. 17702, `WKSET/WKFM` Z. 18476/18486, `KEYC` Z. 21655, `CAP` Z. 21732, `MODS_DIRTY` Z. 27283, `songPlay.cs` Z. 19850, `S.parts` Z. 17215, `BANKS/GEN` Z. 6668/7029), Farben `--t1…--t8` (Z. 22430), Namen (Z. 17165, 22300f.), `DEF_ORDER` (Z. 17159), Ladeschleife Z. 17401, `midiArrs` Z. 36804 | neue Daten an der STIMME-Spur und am Audio-Stück; Matrix, Song und Spurzahl bleiben |
| Leistung | jede Synth-Spur startet eine leer laufende Klang-Engine (`syncEngine`/`wkWanted` Z. 18127/18105) | keine neue Engine; nur Puffer und Knoten |
| Matrix-Layout (von Xander festgelegt) | mehr Zeilen, die Matrix wird anders | unverändert |
| Format/Server | `stimme` nur einmal erlaubt (`tkNormProject` Z. 39820–39824, `normTrack` Z. 17346f.), 4.25.0 macht die zweite STIMME-Spur zur stummen Synth-Spur | additiv, Format 6 nur bei Chor-Gruppe (§2.6) |
| Xanders Wunsch „eigene Spur je Stimme, Gruppe, Solo/Stumm“ | erfüllt | erfüllt (Mischpult, Name, Farbe, Stumm überall) |

**[A] Entscheidung: Weg B.** Die STIMME-Spur wird zum **Gesangs-Ordner**: Lead wie heute, darunter bis zu 8 **Chor-Spuren** (`lanes`). `MAX_T` bleibt 8, es gibt keine zweite STIMME-Spur, und `song.vox`
braucht kein Spurfeld, weil der Chor am Stück hängt. Die 58 Stellen mit `stimmeT()` bleiben richtig, weil es weiter genau eine STIMME-Spur gibt.
**Vorbereitung für später:** Neuer G6+-Code ruft `stimmeT()` nicht neu auf, sondern `g6pTrackOf(r)` (= `r.t`, bei Song-Stücken die STIMME-Spur). Eine **zweite echte Gesangsspur**
(Duett, zweiter Lead) ist **nicht im Umfang** (Regel 27). Falls Xander sie will, ist das ein eigenes Paket von ≈ 22 h (58 Stellen, `tkNormProject`, `song.vox[].tr`, `tkUncovered`/`tkSongMute`
je Spur Z. 40281ff, `G4.cache` je Spur, G7 Z. 44817ff) und wird nur im Funk angeboten.

### 2.2 Datenmodell (additiv, Regel 28)

**v1 (4.25.0, eingefroren).** `audio.chor = {rec, dir, mix, voices: [{name, n: [{t0, t1, m, iv}], pan, db, vol, rev, dly, take?}]}` (`g6NormChor` Z. 44500). Fehlt `v`, gilt
der heutige Weg unverändert. Die Laufzeit-Konstanten werden unter `G6V1` eingefroren und nie mehr angefasst: `G6_COPY` (12 ms/−6 ct/−0,15 · 24 ms/+8 ct/+0,15), `G6_PAN`,
`G6_MIX` inkl. `below: 9` und `leadRev/leadDly/pre/echo`, `G6_CAL = 1.9`, die Formel `g6HallK` (liest den Live-Hall, das bleibt bei v1 so) und die
K-Bewertung mit 48-kHz-Beiwerten auch bei 44,1 kHz (Befund aus der G6-Nachprüfung). Der Klangweg bleibt über `AU.tracks[st].trackIn` mit doppeltem Send.

**v2 am Audio-Stück** (`clip.audio.chor` bzw. `song.vox[k].chor`):
```
chor = {
  v: 2, style: '80'|'pop'|'gospel'|'barber'|'rock'|'ballade'|'disco'|'wave'|null,
  grp: {below, hp, mid, midF, air, sib, rev, pre, dly},      // Gruppe dieser Stelle (§2.4)
  voices: [{
    lane: 'c1',                                   // Chor-Spur (an der STIMME-Spur)
    rule: 'st+2' | 'oct+1' | 'ch+1' | 'ch-1' | 'root-' | 'uni' | 'free' …,   // Rezept-Regel für neue Lead-Noten
    n: [{t0, t1, m, d, o?, x?, iv}],              // je Lead-Note: Stufen d, Oktaven o, chromatisch x; iv = Halbtöne beim Rechnen (nur Rückfall/Anzeige)
    db, pan, w,                                   // Pegel der Stimme an dieser Stelle (dB), Mitte des Panoramas, Breite der Doppel
    dbl: [{ms, ct, p}],                           // 1–4 Kopien: Versatz, Verstimmung, Pan-Faktor (−1…1 × w)
    take?: {take, in, out, at},                   // selbst gesungen, entkoppelt oder dupliziert (Quelle statt Rechnung)
    dblOff?: true
  }],
  // Rückfall-Felder für ältere Fassungen: rec, dir, mix werden mitgeschrieben (rec/dir aus dem ersten Intervall, mix = '80'),
  // je Stimme zusätzlich name (= Spur-Name), vol: 1, rev = grp.rev, dly = grp.dly und n[].iv – sonst spielt 4.25.0 rev 0,5 / dly 0 / Name „Stimme“ (g6NormChor Z. 44506f.)
}
```
- **Rollen (`rule` an der Stimme, `role` an der Spur), feste Schreibweise:** `st±n` (n Leiterstufen, n = 1…7), `oct±n` (n = 1, 2), `ch±n` (n-ter Akkordton über bzw. unter dem Lead, n = 1…3;
  v1 `g6Above/g6Below`), `root-` (Grundton unter dem Lead wie v1-Bass, Z. 44561), `uni`, `free`; mit Oktav-Zusatz `/o±n` (z. B. Disco „Falsett Terz“ = `st+2/o+1`). Eine Spur wird für eine Stimme
  **nach genau dieser Zeichenkette** gesucht (also ist `st+2` eine andere Spur als `st+2/o+1`).
- **Namen (fertig benannt, Xander 22:35):** Eine neue Spur heißt nach ihrer Rolle: `st+2` „Chor Terz oben“, `st-2` „Chor Terz unten“, `st±3` „Chor Quarte oben/unten“, `st±4` „Chor Quinte oben/unten“,
  `st±5` „Chor Sexte oben/unten“, `oct±1` „Chor Oktave oben/unten“, `st+2/o+1` „Chor Terz + Oktave“, `ch+1` „Chor Akkordton oben“, `ch-1` „Chor Akkordton unten“, `ch-2` „Chor Akkordton unten 2“,
  `root-` „Chor Grundton“, `uni` „Chor Unisono“, `free` „Gegenstimme n“. Ein Stil kann beim **Anlegen** eigene Namen geben (Gospel: Chor Sopran/Alt/Tenor, Barbershop: Chor Tenor/Bariton/Bass,
  Disco: Chor Falsett Oktave/Falsett Terz). Eine schon vorhandene Spur behält ihren Namen; umbenannt wird nur durch Antippen des Namens.
- Zeiten `t0/t1` liegen in **Take-Zeit vor der Zeitkarte**, wie `take.pitch.notes` (G2). Eine Chornote gehört zur Lead-Note mit gleichem `t0` (`tkR6`). Teilt oder verbindet man
  Lead-Noten, gilt eine Chornote für jede Lead-Note, die sie zu ≥ 50 % überdeckt. Lead-Noten ohne Chornote bekommen die `rule` der Stimme.
- `d` ist der Abstand in Leiterstufen vom Lead-Ton (Terz `2`, Quinte `4`, Sexte `5`, Unisono `0`), `o` sind Oktaven (±12 Halbtöne), `x` ist ein chromatischer Zusatz (−2…2).
  Die Regeln der Akkord-Rezepte (`ch±n`, `root-`) speichern das Ergebnis beim Rechnen als `d/o`. **Grenzen** wie v1: höchstens 4000 Noten je Stimme, `d` −21…21, `o` −2…2. Neu:
  höchstens 6 Stimmen (v1: 4) und 4 Kopien.
- Normalisieren: `g6NormChor` bekommt einen Zweig `c.v === 2` (eigene Funktion `g6pNorm2`) und lässt v1 Zeichen für Zeichen wie heute.

**An der STIMME-Spur** (`S.tracks[st].chor`, wie `gfx` nur an der STIMME-Spur):
```
chor = {lanes: [{id: 'c1'…'c8', role: 'st+2'|…|'free', name, mute?: true}], mute?: true}
```
`normTrack` (Z. 17346f.) übernimmt `chor` nur bei `o.stimme`, und `tkNormProject` (Z. 39823) löscht `chor` zusammen mit `gfx` an jeder anderen Spur. Eine Stimme mit einer `lane`, die es nicht
gibt (Clip aus einem anderen Projekt eingefügt), bekommt beim Laden eine Spur aus ihrer `rule`. Eine Spur ohne Stimme bleibt, bis man sie im Blatt löscht; sie wird grau „nicht benutzt“
angezeigt. **Farbe** kommt aus `role` (bei Akkord-Rollen aus dem häufigsten Intervall der Stelle, §1.6), frei gewählt wird sie nicht.

**Takes** (`S.takes[id]`, `tkNormTake` Z. 39772): Entkoppelte und duplizierte Stimmen sind **neue Take-Kennungen, die die PCM-Stücke des Lead-Takes mitbenutzen**
(`chunks` = dieselben Namen `lead:k`; `tkPcm` Z. 39850 liest nach Namen). Neu sind die Felder `of` (Herkunfts-Take) und `src: 'dup'|'chor'` (Liste in `tkNormTake` erweitern; ältere Fassungen
machen daraus `'rec'`). Kopiert werden `pitch`, `marks`, `warp`, `follow`, `cl`, `rf`, `pre`/`post` (Z. 44122, 42185, 41315, 42973, `follow: true` Z. 44794). **`lyrics` werden nicht kopiert:** Der Text bleibt
am Lead (G9). Weil kein PCM kopiert wird, geht es sofort und ist bitgleich, auch bei langen G8-Takes.
**Zeit der Take-Stimmen:** Entkoppelte und duplizierte Stimmen liegen zeitgleich zum Lead-Take (dieselben Stücke). Abgespielt wird deshalb mit dem Fenster des Lead-Stücks
`{take: v.take.take, in: a.in, out: a.out, at: a.at}`; das gespeicherte `v.take`-Fenster ist nur Rückfall für ältere Fassungen. So folgen sie Klammern, Anlauf/Ausklang und Rücken (G3, G10b)
ohne eigenen Schritt. Selbst gesungene Stimmen behalten ihr eigenes Fenster wie heute (`g6Start` Z. 44645).

### 2.3 Rechenweg v2 (Worker)

**Kette des Leads** (Z. 44148, 43572): Säubern → G4 → G2 (Tonhöhe inkl. G7) → Zeitkarte → VS-P-Pegel beim Abspielen.
**[A] Eine Chorstimme v2 ist dieselbe Kette mit einem anderen Tonhöhen-Plan, also ein einziger G2-Durchgang** (v1 rechnet G2 auf der schon gehörten Lead-Fassung, zwei Durchgänge):
1. **Plan je Stimme:** Für jede Lead-Note `k` gilt Lead-Ziel `L = round(g2Target(P, n))` (Z. 44131) und Chor-Quelle `c = g6Step(L, d, keySrc) + 12·o + x` in der Tonart der Stelle
   (`g2KeyAt` Z. 44240, `g6Step` Z. 44518). Läuft Transponieren (G7), kommt `c' = outPitch(st, key, c, t)` (Z. 19343) dazu, dieselbe Abbildung wie für den Lead (`g7Shift` Z. 44823).
   So bleibt der Chor bei modalem Transponieren leitereigen (Befund 11c). Der Plan-Eintrag ist `e = e_Lead + 100·(c' − L') + ct_Kopie`, und Intonation, Vibrato und Gleiten des Leads bleiben erhalten.
2. **Quelle** ist die G4-Fassung des Leads (`g2Base` Z. 44149, liegt für das Abspielen des Leads ohnehin im Cache). Die **Analyse** (pYIN, Teiltöne) ist dieselbe wie beim Lead und wird geteilt.
3. **Nur das Clip-Fenster** `[in − Anlauf, out + Ausklang]` (G3) wird gerechnet und nicht mehr der ganze Take (`g6Buf` Z. 44578 nimmt heute `b.getChannelData(0)` ganz). Die Phase jeder stimmhaften
   Strecke wird ab ihrem Anfang integriert, auch wenn das Fenster mitten darin beginnt. Danach wird die Zeitkarte auf das Fenster angewandt.
4. **Doppel in einem Rechengang:** Die Kopien einer Stimme unterscheiden sich nur in `ct` und werden in einer Schleife mit gemeinsamer Hülle und Analyse erzeugt. Ziel: Stimme mit 2 Kopien
   ≤ 1,6 × Zeit einer Kopie [S]. Kopien mit `ct = 0` teilen sich einen Puffer. Versatz und Panorama entstehen beim Abspielen und kosten keine Rechnung.
5. **Zischlaute im Chor** (`grp.sib`: 0 / −6 / −12 / −18 / weg = −60 dB) werden ebenfalls im Rechengang angewandt. In stimmlosen Abschnitten (aus derselben Analyse, 10-ms-Blenden) wird die Kopie
   abgesenkt; stimmhafte Teile bleiben unberührt. **[W]** Im Studio werden s/sch/t in den Background-Spuren fast immer stark abgesenkt oder entfernt, weil gestapelte Zischlaute
   „zischeln“ und flangen. Das ist der eigentliche Entzischer des Chors; der G4-Entzischer des Leads wirkt schon in der Quelle.
6. **Selbst gesungene, entkoppelte und duplizierte Stimmen** (`take`): Ihre Quelle ist ihr eigener Take mit seiner eigenen Kette. Die Kopien sind dieselbe Kette + `ct`, ebenfalls im Fenster,
   und `grp.sib` wirkt auf sie genauso (sonst klänge eine Stimme nach dem Entkoppeln anders, G6P-50).
7. **Cache nach Bytes statt Anzahl:** höchstens **48 MB** Chor-Puffer (LRU; heute 24 Puffer ganzer Takes, bis ≈ 147 MB). Schlüssel: Plan + Quelle (`wpBid`) + Fenster + `sib`.
   Mischungs-Änderungen (Pegel, Pan, Versatz, Sends, Klang, Abstand) rechnen nie neu.
8. **Vorausrechnen:** Beim Öffnen des Blatts, beim Starten oder Vormerken eines Clips mit Chor (`R.pend`) und im Song für den nächsten Teil mit Chor (wie `g7Prefetch`
   Z. 44868). Der Worker arbeitet nach Vorrang: läuft gerade > nächster Teil > Rest.
9. **Lautheit exakt im Worker:** Nach dem Rechnen mischt der Worker die Stimmen **nur zum Messen**. Das umfasst Versatz, Pan-Gesetz (StereoPanner, gleiche Leistung, wie die Web-Audio-Formel), Pegel der
   Stimmen (`db`) und Gruppen-Klang (Biquad-Beiwerte nach derselben Formel wie `BiquadFilterNode`). Gemessen wird die integrierte Lautheit (BS.1770, Gating, **richtige K-Beiwerte je Abtastrate**)
   von Chor und Lead im selben Fenster. Daraus folgt der Auto-Pegel `gA = 10^((L_Lead − below − L_Chor)/20)`. **Keine Kalibrier-Konstante und keine Abhängigkeit vom globalen Hall**
   (v1: `G6_CAL`, `g6HallK`). Neu gemessen wird nach jeder Mischungs-Geste (entprellt 150 ms, wenige ms im Worker), Stumm und Solo zählen nicht.

**v1-Fenster:** Auch v1-Chöre rechnen nur das Fenster, aber **nur wenn** die Fenster-Synthese im Fenster bitgleich zur Ganz-Synthese ist (Abnahme G6P-13). Gelingt das nicht, bleibt v1
beim ganzen Take, und nur die Byte-Grenze gilt.

### 2.4 Wiedergabe und Klangweg

Einstieg wie heute: `scheduleTrack` → `tkSched` (Z. 40309) → `tkPlace` → `tkStartSrc` (Z. 40209) → `g6Start` (Z. 44636). Bei `chor.v === 2` zweigt `g6pStart` ab, v1 bleibt
unverändert. Mitlaufen mit dem Lead (`g6Drop/g6Kill/g6Fade` Z. 44657–44659 in `tkDrop/tkKill/tkFadeAt/tkXfOut` Z. 40237–40250) gilt für beide.

```
je Kopie:  Puffer ─▶ Blenden × r.G (Clip-Pegel × VS-P des Leads, wie v1) ─▶ Stimme: 10^(db/20) × Stumm/Solo × Vorlage-Faktor ─▶ Pan (pan + p·w) ─┐
                                                                                                                        ▼
Gruppe je gespieltem Stück:  Summe ─▶ Tiefschnitt (HP 12 dB/Okt.) ─▶ Mitte (Glocke) ─▶ Luft (Kuhschwanz 10 kHz) ─▶ Auto-Pegel gA
   ─▶ × Chor an/aus (Spur-Merkmal `chor.mute`) × STIMME-Pegel (gespiegelt aus applyTrackParams) ─▶ guide (Wert 1, für G10j) ─┬─▶ Master-Summe
                                                                                                                           ├─▶ Vorverzögerung (DelayNode, im Tempo) ─▶ Hall-Send ─▶ AU.hallIn
                                                                                                                           └─▶ Echo-Send ─▶ AU.echoIn
```
- **Kein Weg mehr durch die STIMME-Kette** (`buildChain` Z. 17903–17922): Drive, Chorus, Tremolo und Pumpen (`trem`/`duck`), Pan und Post-Fader-Sends des Leads wirken nicht auf den Chor v2.
  Damit gibt es keinen doppelten Send mehr. Ein Vocoder, der die STIMME-Spur als Eingang abgreift (MK7), hört nur den Lead; bei v1 bleibt es wie heute.
  **Pegel und Stumm** der STIMME-Spur gelten trotzdem (Ordner-Verhalten), damit der Abstand zum Lead bleibt: Der Pegel wird gespiegelt; „Stumm“ wirkt schon heute, weil eine stumme STIMME-Spur
  keine Lead-Stücke plant (`scheduleTrack` Z. 19477, `setMute` Z. 37362) und der Chor nur an Lead-Stücken hängt. **`N.cut` wird nicht benutzt** (gehört MK7, `mkDryCut` Z. 18321).
- **Vorlage-Faktor (für G10j):** Der Stumm/Solo-Knoten jeder Kopie trägt zusätzlich einen Laufzeit-Faktor je Chor-Spur (Wert 1, nie gespeichert). So kann G10j **eine** Chor-Spur als
  Vorlage +6 dB setzen, während der Rest −10 dB bekommt (`guide` der Gruppe bzw. der übrigen Spuren). Mit `guide` nur an der Gruppe ginge das nicht.
- **Sends nach dem Gruppen-Pegel und nach `guide`** (wie die Spur-`guide` in Nachtrag 9 §2.10 vor den Sends): Mit „Chor aus“ oder einer stummen STIMME-Spur schweigt auch der Hall des Chors, und eine Vorlage-Absenkung nimmt Hall/Echo mit. **[W]** Gruppen-Sends sind Studio-Standard, und die eigene Vorverzögerung im Send ersetzt
  das globale `predelay` von v1.
- **Kein Kompressor am Chor [A]:** Die Quelle hat schon die G4-Dynamik des Leads. Der Web-Audio-Kompressor hätte zudem eine eingebaute, browserabhängige Aufholverstärkung, und
  dann stimmt der Abstand in LU nicht mehr.
- **Knoten je gespieltem Stück** (Clip-Instanz bzw. Song-Stück + Stimme + Kopie), nicht je Lead-Take wie heute (Befund: Clip-Kopien teilen sich Pegel/Pan). Knoten werden
  freigegeben, wenn das Stück endet, und beim Laden geleert (`G6.nodes` wird heute nie geleert).
- **Einsatz:** Eine Stelle erklingt erst, wenn alle ihre Stimmen und `gA` fertig sind, dann mit 10-ms-Blende (heute −14 dB Platzhalter, danach Sprung, Z. 44627).
- **Solo:** Laufzeit-Zustand, endet beim Schließen des Blatts, beim Laden und beim Video-Render. Solo einer Chor-Spur schaltet den Lead stumm wie heute (`g6LeadMute`).
- **Offline/Video:** Dieselben Knoten im OfflineAudioContext, deshalb sind die Ergebnisse gleich (G6P-72).

### 2.5 Undo

| Geste | Undo |
|---|---|
| Stil-Tipp, [+ Stimme], Stimme löschen, [Auf Chor-Gruppe umstellen], Chor löschen | **ein** Gruppen-Undo: Clip (`pushUndo`) bzw. Song (`pushSongUndo`) **plus** `S.tracks[st].chor` (neues Undo-Element `{kind: 'chorlanes', track, before}`), Muster `g6Mix` Z. 44696 |
| Regler (Pegel, Pan, Abstand, Hall, Echo, Klang, Doppel) | ein Schritt je Geste (beim Loslassen), Doppeltipp = ein Schritt |
| Umbenennen, Spur stumm, Chor stumm | ein Schritt (Spur-Daten) |
| [Auf alle Chor-Stellen] | ein Gruppen-Undo über alle betroffenen Clips und Song-Stücke |
| Entkoppeln, Als Chor-Stimme duplizieren | ein Gruppen-Undo: Take-Eintrag + Stück + Spur. ↶ entfernt die neue Take-Kennung; die PCM-Stücke bleiben, weil sie dem Lead gehören |
| [Ganze Spur] (Duplizieren), [Background] auf der ganzen Spur | ein Gruppen-Undo über alle neuen Takes, alle Clips und Song-Stücke und die Spur |
| [Stil-Wert … übernehmen] (Echo-Zeit) | ein Schritt (`{kind: 'fx'}` wie heute in `g6Mix`) |
| [Spur löschen] (graue Spur) | ein Schritt (`chorlanes`) |
| Selbst singen | im Undo der Aufnahme (wie heute `g6Took` Z. 44727) |
| Noten der Stimme (▲▼, Ziehen) | ein Schritt je Geste, wie `g6Edit` Z. 44674 |
| Lead-Note ändern | **kein** Chor-Schritt nötig: Der Chor folgt über den Plan (§2.3), die Daten ändern sich nicht |

### 2.6 Speichern, Laden, Format, ZIP, Aufräumen

- **Format nach Inhalt [A]:** Geschrieben wird **6 nur, wenn** das Projekt v2-Chor, Chor-Spuren oder Takes mit `src: 'dup'|'chor'` enthält, sonst 5 wie bisher.
  **[K] Umsetzung:** `PROJECT_FORMAT` (Z. 13497) ist heute Lese-Grenze **und** Schreibwert zugleich. Wird es einfach 6, schreibt `kvFile` (Z. 13689, `Math.max(…, PROJECT_FORMAT)`) jedes Projekt
  als 6. Deshalb wird getrennt: neue Lese-Grenze `PROJECT_FORMAT_READ = 6` an allen Lese-Stellen (Z. 13939/13940/13945, 14141, 17433, `nvLockOf`/`nvNewer` Z. 34707/34708, Z. 34735;
  `SQStore` Z. 14176 gibt beide aus). `PROJECT_FORMAT` bleibt 5, und an den Schreib-Stellen (`kvFile` Z. 13689, Datei Z. 13873, Online-Text Z. 35611, Online-Kopf `p_format` Z. 35624)
  steht `fmtOf(proj)` (= 6 bei Chor-Gruppen-Inhalt, sonst `PROJECT_FORMAT`). Grund: 4.25.0 würde die Chor-Gruppe beim Speichern **still verlieren**. Es kürzt auf
  4 Stimmen, verwirft `v`, `lane`, `d`, `grp` und `S.tracks[st].chor` und fällt auf `'80'`/`'terz'` zurück (Z. 44502–44511). Mit Format 6 öffnet eine ältere Fassung das Projekt nur
  mit Banner und speichert es nicht (NV-Sperre `nvLockOf` Z. 34707, Banner Z. 34711). Gespielt wird dort eine v1-Näherung aus den Rückfall-Feldern (`name`, `n[].iv`, `pan`, `vol`, `rev`, `dly`, §2.2).
  **Online braucht dafür `max_format = 6`** (§4.4). Ohne diese Freigabe bleibt das Format 5 und das Risiko oben bestehen.
- **Deep-equal-Weg:** Normalisieren (§2.2), Clip-/Szenen-/Teil-Kopien (tragen `audio.chor` wie heute), Verlauf, ZIP und Online.
- **ZIP:** `tkUsedIds` (Z. 40693) und `tkActiveIds` (Z. 39875) zählen alle `voices[].take.take` mit. Heute fehlen selbst gesungene Chor-Takes im ZIP und sind auf einem anderen Gerät
  verloren, und `tkLoadAll` räumt ihre Puffer immer wieder ab. Duplikate stehen im ZIP als eigenes WAV (die ZIP wird größer; beim Import bekommen sie eigene Stücke).
- **Aufräumen (`tkGc` Z. 40732):** Behalten wird nach **Stück-Namen** aller Takes (offenes Projekt, Verlauf, ↶/↷, gespeicherte Projekte: `"chunks"` statt nur Take-Kennungen) und nicht mehr
  nach dem Kennungs-Präfix. Sonst würden geteilte Stücke gelöscht, sobald der Original-Take fehlt. **Restrisiko [K]:** Eine veraltete 4.25-App, die [Aufräumen] auf ein Format-6-Projekt
  anwendet, dessen Lead-Take gelöscht ist, kann geteilte Stücke löschen. Es tritt nur mit veralteter App auf, und die NV-Sperre verhindert dort das Speichern, aber nicht das Aufräumen.
  Deshalb sagt der Changelog „nach dem Update einmal neu laden“.

### 2.7 Video-Render (ab 4.26.0 in der Hauptlinie)

`vvRenderAudio` (helfer-VV3 Z. 41998ff) tauscht `AU.ctx` und nutzt den Live-Scheduler. Damit läuft auch `g6Start`/`g6pStart`. **Lücke:** `vvTakesReady` (helfer-VV3 Z. 41946) wartet nur auf
`tkLoad`, und eine Stimme ohne fertigen Puffer fehlt im Video. G6+h ergänzt `g6pWaitAll(bereich)`: Vor dem Render werden alle Chor-Puffer, `gA` sowie G2-/G4-/VS-P-Fassungen der Stücke im
Bereich fertig gerechnet (Vorlage: Test-API `g6Wait` Z. 44777). Während des Renders gelten **kein** Solo und **kein** „Selbst singen“-Scharf (heute schaltet ein aktives `G6.solo`
den Lead auch im Video stumm, Z. 44640). Danach stehen Solo und Scharf wieder wie vorher. Das gilt für v1 und v2.

### 2.8 Song

- Chor auf Song-Stimmen-Stücken wie auf Clips (`r.vox`, `g6Edit` Z. 44674). Die Akkorde der Begleitung **am Takt** werden gelesen: Song-Bahnen → Szenen-Clips, eigene Clips, `song.mel`
  (neu `g6pSongPcs(bar, beat)`). Heute nutzt eine Song-Stimme nur die leitereigenen Dreiklänge (Hinweis aus der G6-Nachprüfung). Die Tonart kommt wie bisher aus `g2KeyAt` → `g2SongScene` (Z. 44248).
- **Vorausrechnen** eines Teils voraus (§2.3 Nr. 8). Wenn ein Punch eine Song-Stimme überdeckt (`tkUncovered/tkSongMute` Z. 40281ff), schweigt ihr Chor mit, wie heute.
- „Selbst singen“ auf Song-Stimmen braucht den `g6Took`-Haken in `tkSongCommit` (Z. 40486). Das liefert **G10j** (G10-90); G6+ bereitet die Spur-Zuordnung dafür vor.

### 2.9 Regel 28: was alte Projekte betrifft

| Fall | Ergebnis |
|---|---|
| Projekt ohne Chor | JSON Zeichen für Zeichen gleich, Format 5, Render bitgleich |
| Chor aus 4.25.0 (v1) | Daten gleich; Klang bitgleich (eingefrorene Konstanten, alter Klangweg, Hall-Kopplung wie 4.25.0); Fenster-Rechnung nur, wenn bitgleich |
| v1-Chor bearbeiten (Pegel, ♪, Selbst singen) | wie in 4.25.0 (v1-Funktionen bleiben) |
| v1 → v2 | nur auf Tipp des Nutzers (Stil oder [Auf Chor-Gruppe umstellen]), ein Undo-Schritt, Toast „neue Chor-Fassung – klingt anders“ |
| G6+0-Korrekturen | ändern keinen Klang: ZIP/Laden, Solo-Rücksetzen und Knoten je Stück. Die Knotenwerte sind dieselben, deshalb bleibt der Render gleich. **Einzige Ausnahme [K]:** Zwei Stellen mit **demselben** Lead-Take und **verschiedenen** Chor-Werten teilen sich in 4.25.0 die Knoten (Schlüssel `take:Stimme:Kopie` + Spur, Z. 44597/44629); dort gewinnt, je nach Reihenfolge, die zuletzt angewandte Stelle. Ab 4.25.2 klingt jede Stelle mit ihren eigenen Werten. Das ist kein fester Klang, der verloren geht, sondern ein Fehler; er wird im Changelog und im Funk genannt (G6P-03, G6P-04 mit diesem Fall als Ausnahme) |
| Lead-Bearbeitung wirkt auf den Chor | gewollt (der Chor ist aus dem Lead gerechnet), nur nach einer Änderung, nie beim Laden. **v2:** folgt in Stufen (§2.3). **v1:** wie 4.25.0, der Chor wird aus der geänderten gehörten Fassung mit festem Halbton-Abstand `iv` gerechnet; `iv` wird nie neu berechnet (§4.3, G10i) |

### 2.10 Leistung (CLAUDE.md Vorrang 1–2)

Nichts beim App-Start. Puffer nur für das Fenster: Barbershop auf 8 Takten bei 120 BPM braucht ≈ 9–13 MB (je nach Anlauf/Ausklang) statt ≈ 37 MB beim ganzen 32-s-Take [S]. Höchstens 48 MB Chor-Puffer. Die Analyse wird mit dem Lead
geteilt. Mischungs-Gesten rechnen nicht neu. Je Kopie gibt es 3 Knoten und die Quelle, je Stück 8 Knoten (Tiefschnitt, Mitte, Luft, Pegel, `guide`, Vorverzögerung, Hall-, Echo-Send). Gospel (9 Kopien) braucht so ≈ 44 Knoten je gespieltem Stück, Rock-Shout (8 Kopien) ≈ 40. Im Haupt-Faden gibt es keinen Task über 50 ms.
Das Mischpult ist DOM, und Regler schreiben nur `AudioParam` (20-ms-Rampe) und Text, ohne Layout-Arbeit.

---

## 3. Pakete G6+0, G6+a … G6+i

### 3.0 Gemeinsame Messverfahren und Testdaten

- **Testprojekt `g6p-demo`:** Szene 1, C-Dur, 120 BPM, Refrain 8 Takte. Der STIMME-Clip ist ein synthetischer Gesang (48 kHz, Vokale aus Obertönen mit Vibrato ±25 ct, Konsonanten
  s/t/sch als Rauschen, erzeugt wie `k-g10-sing.wav`). Begleitung: Bass, Synth 1 mit Akkorden C–Am–F–G. Song: Szene 1 ×2 + eine Song-Stimme in Takt 9–16. Die Variante `g6p-demo-441`
  hat 44,1 kHz. **`g6p-v1`:** drei Projekte aus 4.25.0 (Terz/80er, Falsett/Pop, Barbershop + selbst gesungene Stimme 2) für die Golden-Prüfung.
- **M-LU:** Integrierte Lautheit nach BS.1770-4 (K-Bewertung mit den Beiwerten der jeweiligen Abtastrate, Gating, Stereo) aus dem **Offline-Render** (VV-Weg) am Master. Gemessen
  werden Lead allein (Chor aus) und Chor allein (Test-API „nur Chor“) im Fenster. Abstand = L_Lead − L_Chor in LU.
- **M-PAN:** Eine Kopie allein (Test-API) mit Rauschen als Quelle; geschätzte Lage `p̂ = (4/π)·atan(√(E_R/E_L)) − 1` (Umkehrung des Gesetzes gleicher Leistung).
- **M-MS:** Einsatz einer Kopie gegen die unverdoppelte Stimme per Kreuzkorrelation der Hüllkurve (1-ms-Fenster), auf 0,1 ms aufgelöst.
- **M-CT:** Tonhöhe je Note mit unabhängigem NSDF (Median über die mittleren 60 % der Note), in Cent zum Soll.
- **M-SIB:** RMS in den stimmlosen Abschnitten (aus der Analyse) Chor gegen Lead, in dB.
- **M-G28:** Golden-Prüfung wie Nachtrag 9: alle Projekte in `synq-snapshots/`, Demo-Projekt und `g6p-v1` laden → normalisiertes JSON zeichengleich zu 4.25.0, Offline-Render bitgleich (max |Δ| = 0).
- **M-MEM/M-ZEIT:** Bytes der Chor-Puffer (Test-API `g6pInfo().bytes`), Worker-Zeit je Auftrag, lange Tasks über PerformanceObserver.
- **M-PLATZ:** typische-fehler 1/4/5 in den 6 Formaten mit der echten App-Schrift. **M-UNDO:** ↶/↷ deep-equal. **M-SAVE:** Speichern → Laden deep-equal und Render bitgleich.
- **M-KLICK:** wie G1/G2 (Klick-Maß am Übergang), für Mischungs-Wechsel und Einsatz.

### G6+0 — Sofort-Korrekturen am heutigen G6 (in 4.25.2, zusammen mit K1–K4) · ≈ 3 h

**Inhalt:** (1) `tkUsedIds`/`tkActiveIds` zählen `voices[].take.take` (ZIP, Laden, kein Abräumen). (2) `G6.solo`/`G6.arm` werden beim Schließen des Chor-Blatts, beim Laden und beim
Video-Render zurückgesetzt bzw. ausgesetzt. (3) Knoten werden je Stück statt je Lead-Take angelegt, und `G6.nodes` wird beim Laden geleert. (4) Kleinigkeiten: das unerreichbare `if (v.take) break;` in `g6Ready` (Z. 44594) und
ein Knoten statt zwei für selbst gesungene Stimmen in `g6Apply`.
- [ ] **G6P-01** `g6p-v1` Nr. 3 als ZIP → leeres Profil → Import → Stimme 2 (selbst gesungen) klingt; Offline-Render bitgleich zum Ausgangsgerät.
- [ ] **G6P-02** „Selbst singen“ scharf, ohne Aufnahme, Blatt schließen → Lead hörbar (RMS = ohne Chor-Solo ±0,1 dB); dasselbe nach Projekt-Laden und im Video-Render.
- [ ] **G6P-03** Zwei Clips mit demselben Take und Chor: Pegel einer Stimme im einen Clip → der andere Clip spielt unverändert (gemessen). 3 min Wiedergabe → 0 erneute `tkLoad` für Chor-Takes.
- [ ] **G6P-04** M-G28 bitgleich (die Korrekturen ändern keinen Klang). Einzige erlaubte Abweichung: Projekte mit zwei Stellen desselben Takes und verschiedenen Chor-Werten (§2.9); sie werden
  vor dem Bau in `synq-snapshots/` und `g6p-v1` gesucht und mit Ergebnis im Changelog genannt.

**Abhängigkeiten:** G6 (4.25.0). **Risiko:** gering.

### G6+a — Fundament: Daten v2, Chor-Spuren, Format nach Inhalt, v1 einfrieren · ≈ 10 h

**Inhalt:** §2.2 und §2.6: `g6pNorm2`, `S.tracks[st].chor` (`normTrack`/`tkNormProject`), Take-Felder `of`/`src`, `G6V1`-Einfrieren (Konstanten in eigenes Objekt, Weiche `chor.v`),
Format 6 nach Inhalt (Datei, Online-Kopf, NV-Lesegrenze), `tkGc` nach Stück-Namen, Undo-Element `chorlanes`, Test-API `g6pInfo`.
- [ ] **G6P-05** M-G28: alle Projekte inkl. `g6p-v1` zeichengleich, Format 5, Render bitgleich; zusätzlich `g6p-v1` mit Hall-Rückweg ×2 → Chor-Pegel ändert sich **wie in 4.25.0** (v1-Kopplung erhalten, ±0,05 dB zum 4.25.0-Render).
- [ ] **G6P-06** v2-Daten (alle Felder belegt) → Speichern/Laden, Clip kopieren, Szene kopieren, Teil konsolidieren, ZIP, Verlauf → deep-equal. Format 6 genau dann, wenn v2-Inhalt da ist, sonst 5.
- [ ] **G6P-07** Format-6-Datei in einer 4.25.0-Kopie → Banner „neuere Version“, Speichern gesperrt (`NV.lock` gesetzt); Projekt-Daten im Speicher unverändert.
- [ ] **G6P-08** Geteilte Stücke: Duplikat anlegen, Lead-Take löschen, [Aufräumen] → Duplikat hörbar (alle Stücke da); ohne Duplikat werden die Stücke des Leads gelöscht (`TK.gc.deleted` > 0).
- [ ] **G6P-09** Unbekannte `lane` beim Laden → Spur aus `rule` angelegt, Farbe nach Tabelle; Spur ohne Stimme bleibt erhalten.

**Abhängigkeiten:** G6 (v1), MK0 (NV-Sperre), §4.4 F-1 (Online mit Format 6). **Risiko:** mittel, weil das Format jedes Speichern berührt. Deshalb gilt G6P-05 auf allen Snapshots.

### G6+b — Rechenweg v2: ein Durchgang, Stufen, Fenster, Doppel, Zischlaute, Lautheit · ≈ 18 h

**Inhalt:** §2.3 komplett: Plan je Stimme (Stufen → Halbtöne, G7-Abbildung), Quelle = G4-Fassung, Fenster-Synthese mit Phase ab Streckenanfang, Zeitkarte auf das Fenster,
mehrere Kopien in einem Gang, Zischlaut-Absenkung, Cache nach Bytes, Vorrang-Warteschlange, Vorausrechnen, exakte Lautheit im Worker (K-Beiwerte je Rate).
- [ ] **G6P-10** Stufen: C-Dur, Terz oben, Tabelle C→E … H→D (8/8). Lead E → ▲ F ⇒ Chor A (nicht G♯), ohne neue Analyse (Analyse-Zähler gleich). Tabelle mit 30 Fällen aus Dur, Moll
  und Dorisch, Quinte/Sexte/Oktave/Terz+Oktave oben und unten: 100 % richtig. (Ersetzt G10-80.)
- [ ] **G6P-11** G7 C-Dur → a-Moll (diatonisch) und → D-Dur: jede Chornote = `outPitch` der Chor-Quelle, M-CT ≤ 3 ct; keine leiterfremde Chornote.
- [ ] **G6P-12** M-CT je Chornote: Stimme ≤ 3 ct neben dem Soll; Kopie mit `ct = −9` → −9 ± 1 ct gegen die Stimme. Vibrato-Tiefe der Stimme ≥ 95 % des Leads.
- [ ] **G6P-13** Fenster: Puffer-Länge = Fenster (±1 Block); v2-Fenster = v2-Ganzrechnung im Fenster mit max |Δ| ≤ 1e−6. v1-Fenster = v1-Ganzrechnung **bitgleich** (sonst bleibt v1 ganz, das wird im Changelog vermerkt).
- [ ] **G6P-14** Zischlaute M-SIB: [ganz] bitgleich zum Lead in stimmlosen Abschnitten (vor Doppel-Versatz); [leiser] −12 ± 0,5 dB; [weg] ≤ −40 dB; stimmhafte Teile unverändert (≤ −90 dB Differenz außerhalb der 10-ms-Blenden).
- [ ] **G6P-15** Zeit/Speicher (M-ZEIT/M-MEM, Prüfrechner): 8 Takte bei 120 BPM, Gospel (3 Stimmen × 3 Kopien): erster vollständiger Chor ≤ 4 s bei vorhandener Analyse (Takes-Blatt war offen), ≤ 6 s kalt.
  Mischungs-Wechsel ohne Rechnen (Render-Zähler unverändert), Stimme mit 2 Kopien ≤ 1,6 × eine Kopie. Chor-Puffer gesamt ≤ 48 MB bei 6 Chor-Stellen (LRU greift), Barbershop-Stelle ≤ 14 MB. Keine langen Tasks > 50 ms.
- [ ] **G6P-16** Lautheit im Worker = M-LU am Ausgang ±0,2 LU für alle 9 Stile (ohne Kalibrier-Konstante), bei 48 und 44,1 kHz.

**Abhängigkeiten:** G2 (Worker, Plan, harmonisches Modell, `G2P.planKey`), G4 (Quelle `g2Base`), G7 (`outPitch`, `g7Key`, `g7Shift`), VS5 (Zeitkarte), G3 (Anlauf/Ausklang),
VS-P (`r.G`), G6+a. **Risiko:** mittel bis hoch (DSP). Der Fenster-Nachweis G6P-13 entscheidet über v1-Fenster.

### G6+c — Chor-Gruppe im Klangweg · ≈ 12 h

**Inhalt:** §2.4: Knoten je Kopie und je Stück, Gruppen-Summe, Tiefschnitt/Mitte/Luft, Auto-Pegel `gA`, Chor an/aus, Spur stumm, Solo-Logik, STIMME-Pegel/-Stumm gespiegelt,
Sends nach dem Gruppen-Pegel mit Vorverzögerung im Tempo, `guide`-Knoten (Wert 1) und Vorlage-Faktor je Chor-Spur (Wert 1) für G10j, Einsatz erst wenn fertig, gleiche Knoten im Offline-Render.
- [ ] **G6P-20** Abstand: Für jeden Stil gilt M-LU = `below` ± 0,5 LU (80er 8, Pop 9, Gospel 6, Barbershop 4, Rock-Shout 5, Ballade 10, Disco 7, New Wave 9, Background 9).
  Der globale Hall-Rückweg ×2 ändert den Abstand der trockenen Signale um ≤ 0,1 LU (keine Hall-Kopplung mehr).
- [ ] **G6P-21** Regler: Abstand 8 → 12 LU ⇒ gemessen 12 ± 0,3. Pegel der Terz +3 dB ⇒ Chor-Gesamt bleibt (±0,3 LU, der Auto-Pegel gleicht aus), die Terz liegt danach +3 ± 0,2 dB lauter **relativ zu den anderen Chor-Stimmen**. STIMME-Pegel −6 dB ⇒ Lead und Chor je
  −6 ± 0,1 dB. STIMME stumm ⇒ Chor ≤ −90 dBFS, Hall-Eingang vom Chor ≤ −120 dBFS.
- [ ] **G6P-22** Pan (M-PAN): je Kopie `p̂ = clamp(pan + p·w)` ± 0,03 für alle Stile (Tabelle G6+d). Stimm-Pan +0,5 verschiebt alle Kopien um +0,5 (geklemmt).
- [ ] **G6P-23** Versatz (M-MS): Kopien-Einsatz = Soll-ms ± 0,5 ms gegen die Stimme. Stimme ohne Versatz (Barbershop) 0 ± 0,5 ms zum Lead.
- [ ] **G6P-24** Solo/Stumm: Solo Spur 2 ⇒ nur Spur 2 + Begleitung (Lead und andere Spuren ≤ −90 dBFS). Stumm Spur 1 ⇒ nur Spur 1 fehlt, auch an einer zweiten Chor-Stelle. Chor aus ⇒
  Ausgang bitgleich zu „ohne Chor“. Blatt zu ⇒ Solo aus. Vorlage-Faktor einer Spur auf 2 (Test-API) ⇒ nur diese Spur +6,0 ± 0,1 dB; zurück auf 1 ⇒ bitgleich.
- [ ] **G6P-25** Sends: Gruppen-Hall 0 ⇒ Hall-Eingang vom Chor ≤ −120 dBFS. Vorverzögerung 1/32 bei 120 BPM ⇒ 62,5 ± 1 ms (Impuls am Hall-Eingang). Chor aus ⇒ auch Hall/Echo 0. `S.fxBus` ist
  vor und nach jedem Stil deep-equal.
- [ ] **G6P-26** Klang: Übertragungsfunktion der Gruppe (Rauschen, FFT) = Formel ± 0,3 dB (Tiefschnitt −3 dB bei Soll-Hz ± 3 %, Luft +n dB bei 10 kHz). G6P-20 hält auch mit Klang-Änderung.
- [ ] **G6P-27** Live = Offline: Chor-Lautheit am Live-Ausgang (Abgriff) = Offline-Render ± 0,2 LU. Vor „fertig“ ist der Chor still, kein −14-dB-Platzhalter, und der Einsatz geht ohne Klick (M-KLICK).
- [ ] **G6P-28** Leistung: 3 min Wiedergabe mit 3 Chor-Stellen und Szenenwechseln: 0 Aussetzer, keine langen Tasks, Knotenzahl nach dem Stopp wieder auf dem Ausgangswert (keine Lecks).

**Abhängigkeiten:** G6+a, G6+b (Lautheit, Puffer), VS-P (`r.G`), G10j (nutzt `guide`). **Risiko:** mittel.

### G6+d — Genre-Stile (Presets) · ≈ 9 h

**Inhalt:** Tabelle unten als Daten (`G6P_STYLE`, eingefroren mit `chor.v = 2`: spätere Feinabstimmung = neue Stil-Fassung, nie Änderung gespeicherter Werte), Anwendung auf eine Stelle
(Spuren nach `role` finden oder anlegen), Hilfetext je Stil, Kalibrier-Messung je Stil.

**Stimmen und Doppel** (Pegel = Pegel der Stimme `db` an dieser Stelle; Namen = Spur-Name beim Anlegen, §2.2; Kopien als Versatz ms / Verstimmung ct / Pan-Faktor):

| Stil | Stimmen (Regel) · Pan · Breite · Pegel | Kopien je Stimme |
|---|---|---|
| **80er großer Refrain** | Unisono (`uni`) 0 · 1,0 · 0 dB; Terz oben (`st+2`) 0 · 0,7 · −1; Oktave oben (`oct+1`) 0 · 0,4 · −4 | Unisono 16/−8/−1, 29/+9/+1; Terz 12/−6/−1, 24/+8/+1; Oktave 20/−5/−1, 33/+7/+1 |
| **Pop modern** | Unisono 0 · 1,0 · 0; Terz oben 0 · 0,6 · −2; Oktave unten (`oct-1`) 0 · 0,3 · −7 | eng: 8/−4/−1, 15/+5/+1 (alle Stimmen, Terz 10/−5, 18/+6) |
| **Gospel** | Sopran (`ch+1`) −0,45 · 0,25 · 0; Alt (`ch-1`) +0,45 · 0,25 · 0; Tenor (`ch-2`) 0 · 0,35 · −1 | Ensemble, 3 je Stimme: 9/−10/−1, 21/+5/0, 34/+12/+1 (versetzt je Stimme +2 ms) |
| **Barbershop** | Tenor (`ch+1`) −0,3 · 0 · −1; Bariton (`ch-1`) +0,3 · 0 · 0; Bass (`root-`) 0 · 0 · +1 | keine Doppel: 1 Kopie 0/0/0 (echte Einzelsänger) |
| **Rock-Shout** | Unisono 0 · 0,8 · 0; Oktave unten 0 · 0,6 · −3 | 4 je Stimme: 17/−14/−1, 28/+12/+1, 41/−19/−0,5, 52/+17/+0,5 |
| **Ballade** | Terz oben −0,35 · 0,35 · −1; Sexte unten (`st-5`) +0,35 · 0,35 · −2 | 20/−6/−1, 35/+7/+1 |
| **Disco/Falsett** | Falsett Oktave (`oct+1`) −0,5 · 0,3 · 0; Falsett Terz (`st+2/o+1`) +0,5 · 0,3 · −2 | 10/−7/−1, 18/+7/+1 |
| **New Wave dunkel** | Oktave unten −0,4 · 0 · 0; Quinte unten (`st-4`) +0,4 · 0 · −2 | 1 Kopie: 25/−5/0 bzw. 28/+5/0 |
| **Background** (eine Spur, kein Rezept) | Pan abwechselnd −0,6 / +0,6 je Gegenstimme · 0,15 · 0 | 12/−6/−1, 24/+8/+1 (= v1-Doppel) |

**Gruppe** (Abstand LU · Tiefschnitt Hz · Mitte dB @ Hz · Luft dB @ 10 kHz · Zischlaute · Hall-Send · Vorverzögerung · Echo-Send):

| Stil | Abstand | Tief | Mitte | Luft | Zischl. | Hall | Vorv. | Echo |
|---|---|---|---|---|---|---|---|---|
| 80er großer Refrain | 8 | 180 | −3 @ 400 | +3 | −12 | 0,75 | 1/32 | 0,12 |
| Pop modern | 9 | 200 | −2 @ 350 | +4 | weg | 0,35 | 1/64 | 0,18 |
| Gospel | 6 | 120 | −1 @ 300 | +2 | −12 | 0,50 | 1/32 | 0 |
| Barbershop | 4 | 70 | 0 | +1 | −6 | 0,20 | 1/64 | 0 |
| Rock-Shout | 5 | 250 | +2 @ 1500 | 0 | −12 | 0,20 | aus | 0 |
| Ballade | 10 | 150 | −2 @ 300 | −2 | weg | 0,85 | 1/16 | 0,20 |
| Disco/Falsett | 7 | 300 | −2 @ 500 | +5 | −18 | 0,50 | 1/32 | 0,15 |
| New Wave dunkel | 9 | 80 | −2 @ 2500 | −3 | −12 | 0,60 | 1/32 | 0,25 |
| Background (nur wenn die Gruppe der Stelle neu ist) | 9 | 180 | −2 @ 400 | +2 | −12 | 0,50 | 1/32 | 0,10 |

**Echo-Zeit-Vorschlag** (nur Anzeige und Knopf in [Klang ▸], §1.2; ändert das globale Echo erst auf Tipp): 80er 1/4 · Pop modern 1/8. · Ballade 1/4. · Disco/Falsett 1/8 ·
New Wave dunkel 1/4. · Background 1/4 · Gospel, Barbershop, Rock-Shout keiner (Echo-Send 0). 80er und Pop entsprechen v1 (`G6_MIX.echo` Z. 44497f.).

**[W] Begründung kurz:** Background-Stimmen liegen im Studio meist 6–12 dB unter dem Lead. Gang-Rufe und vierstimmiger Satz liegen näher (4–5 LU), weil sie selbst Teil der Melodie sind. Unisono-Doppel
gehen hart links/rechts, Harmonien gefächert, tiefe Stimmen eher mittig. Doppel liegen bei 10–40 ms Versatz und 4–20 ct Verstimmung; über ≈ 40 ms und ±15 ct klingt es nach Gruppe statt Doppel
(Rock-Shout, Gospel). Der Tiefschnitt ist im Chor höher als im Lead, damit es nicht mulmt (Ausnahme: Bass im Barbershop). Die Zischlaute im Chor werden gesenkt. Die Hall-Vorverzögerung im Tempo hält
den Chor trotz viel Hall verständlich. Der Echo-Send nutzt das globale Echo (dessen Teilung bleibt, wie sie ist, außer man tippt den Vorschlag). „Falsett“ ist eine formant-erhaltende Oktave mit hellem Klang; ob das
nach Kopfstimme klingt, prüft die Hörprobe [S].

- [ ] **G6P-30** Je Stil ein Tipp → Daten deep-equal zur Tabelle (Stimmen, Regeln, Kopien, Pan, Breite, Pegel, Gruppe) und Noten-Tabelle je Regel richtig (G-Dur mit Begleitung für `ch±`/`root-`).
  Gemessen gelten G6P-20/22/23/26 je Stil. Neue Spuren tragen die Namen aus §2.2 bzw. die Stil-Namen; eine vorhandene Spur behält ihren Namen.
- [ ] **G6P-31** Ein Tipp ergibt einen Undo-Schritt. Wechsel 80er ↔ Pop modern (anderes Rezept) rechnet neu. Gleiches Rezept mit nur anderer Mischung (Test-Stil) rechnet nicht neu, und der Wechsel ist hörbar ≤ 50 ms ohne Klick.
- [ ] **G6P-32** Lead unverändert: `S.tracks[st].sound` und `gfx` sowie `S.fxBus` deep-equal vor und nach jedem Stil (v1 änderte sie über `g6Mix`).
- [ ] **G6P-33** Stil auf einen v1-Chor ⇒ v2 (ein Undo-Schritt, Toast). ↶ ⇒ v1-Daten deep-equal und Render bitgleich.
- [ ] **G6P-35** Stilwechsel an einer Stelle mit einer entkoppelten und einer selbst gesungenen Stimme ⇒ beide bleiben deep-equal (Noten, `take`, Pegel, Pan, Doppel), nur die errechneten Stimmen
  wechseln. [Stil-Wert 1/4 übernehmen] ⇒ `S.fxBus.echo.divL` = 1/4, ein Undo-Schritt; ohne Tipp bleibt `S.fxBus` deep-equal (G6P-32).
- [ ] **G6P-34** Zweite Chor-Stelle mit anderem Stil ⇒ erste Stelle bitgleich (keine Fernwirkung). [Auf alle Chor-Stellen] ⇒ beide `grp` gleich, ein Undo-Schritt.

**Abhängigkeiten:** G6+b, G6+c. **Risiko:** gering (Daten), die Klangwahl prüft die Hörprobe.

### G6+e — Blatt „Chor“ neu: Stil-Raster, Mischpult, Markierung in Matrix und Song · ≈ 14 h

**Inhalt:** §1.1–§1.3: Stil-Raster, Gruppen-Zeile, Spur-Zeilen, [⋯]-Bereich (Doppel, Selbst singen, Entkoppeln, Stimme löschen; graue Spur: Spur löschen), [+ Stimme ▾], [Klang ▸] mit Echo-Zeit-Knopf, Umbenennen, Fortschritt
ohne Höhenänderung, v1-Ansicht „Fassung 4.25“, Hilfetexte, Matrix-Punkte und Song-Streifen sowie der neue Blatt-Aufbau (ersetzt die 8 Rezept-Knöpfe von 4.25.0) **[V-Funk]** (Bild vorher im Funk). CSS-Block nach dem G6-CSS.
- [ ] **G6P-40** Ablauf per Touch (CDP) wie Xander: STIMME-Clip ✎ → [Chor] → [Gospel] → 3 Spur-Zeilen „Chor Sopran/Alt/Tenor“ mit Farben. Solo, Stumm, Pegel und Pan je Spur sowie Abstand, Hall, Echo und
  Klang wirken (Messwerte wie G6+c). Jede Geste ist ein Undo-Schritt.
- [ ] **G6P-41** M-PLATZ in den 6 Formaten: alle Treffer ≥ 44 × 44 px (auch Regler-Griffe), nichts abgeschnitten, keine Seiten-Überbreite. Stil-Kacheln hochkant 2 × 4, quer 4 × 2,
  Name und Zeile (≤ 20 Zeichen) je einzeilig ohne Auslassungspunkte, auch in P1 320 px. Das Blatt quer kommt ohne Seiten-Scroll aus (die Spur-Liste scrollt innen).
  Kein Layout-Sprung beim Rechnen, beim Aufklappen von [⋯]/[Klang ▸] innerhalb fester Höhe bzw. mit innerem Scroll.
- [ ] **G6P-42** Umbenennen über die Tastatur (≤ 24 Zeichen). Der Name erscheint in Legende, Takes-Blatt und Song-Tipp. Doppeltipp auf einen Regler ⇒ Stil-Wert.
  Spur-Grenze: 8 Spuren belegt ⇒ eine graue Spur wird übernommen; keine graue ⇒ Toast, Daten deep-equal. [Spur löschen] auf einer grauen Spur = ein Undo-Schritt.
- [ ] **G6P-43** Matrix-Punkte/Song-Streifen: richtige Farben und Anzahl. Bildzeit p95 der Matrix und des Songs +≤ 0,3 ms. Ohne Chor bleibt die Ansicht pixelgleich zu 4.25.0.
- [ ] **G6P-44** Bedien-Tempo: Tipp → Reaktion (Kachel gedrückt) ≤ 50 ms, Regler-Bewegung p95 ≤ 16,7 ms Bildzeit.

**Abhängigkeiten:** G6+a, G6+c, G6+d (Kacheln). **Risiko:** mittel (Platz im Hochformat 320 px).

### G6+f — Entkoppeln und „Als Chor-Stimme duplizieren“ · ≈ 13 h

**Inhalt:** §1.4/§1.5, §2.2 Takes: neue Take-Kennung mit geteilten Stücken, Felder kopieren, beim Entkoppeln `take.pitch` = Plan der Stimme (Lead-Plan + `c − L` als `sh` je Note,
gleiche Quantisier-Einstellung). G7 auf diesen Takes: `g7SegOf` (Z. 44866) und `g7Key` (Z. 44817) finden heute nur oberste Stücke und suchen künftig auch in `voices[].take` (Stelle = Lead-Stück).
G4 wirkt über die STIMME-Spur, VS-P über `vpKick`. Takes-Blatt mit Herkunftszeile, Knopf [Als Chor-Stimme duplizieren] mit [Diese Stelle]/[Ganze Spur], Spur „Gegenstimme n“ (`role 'free'`), Kachel [Background], Noten-Editor öffnet sich.
- [ ] **G6P-50** Entkoppeln: neue Kennung, `chunks` = die des Leads, Felder übernommen, `lyrics` nicht. Klang vorher = nachher (M-CT ≤ 1 ct je Note, M-LU ± 0,2 LU, M-MS ± 0,5 ms, Rest-Differenz ≤ −60 dB im
  Fenster [S]). Danach gilt: Lead-Note ändern ⇒ Stimme bitgleich; Stimm-Note ändern ⇒ Lead bitgleich.
- [ ] **G6P-51** Duplizieren: Kopie im Fenster bitgleich zum Lead (gleiche Kette, gleiche Daten), bis man sie ändert. Note ▲ in der Kopie ⇒ Lead bitgleich. [Background] ⇒ Werte wie Tabelle, zweite Gegenstimme auf der
  anderen Seite. Anlegen ≤ 100 ms (kein PCM-Kopieren).
- [ ] **G6P-52** G7: Transponieren C → a-Moll nimmt entkoppelte und duplizierte Stimmen mit wie den Lead (je Note = `outPitch` ± 1 ct). Zurück auf 0 ⇒ bitgleich zur Fassung ohne Transponieren.
- [ ] **G6P-53** Undo: Entkoppeln/Duplizieren = 1 Schritt. Nach ↶ ist die neue Kennung aus `S.takes` verschwunden, und [Aufräumen] löscht keine Lead-Stücke. ZIP ⇒ Kopie als eigenes WAV, Import ⇒ hörbar bitgleich.
- [ ] **G6P-54** Song-Stück: Duplizieren und Entkoppeln auf einer Song-Stimme gehen genauso (Song-Undo).
- [ ] **G6P-55** [Ganze Spur] in einem Projekt mit 3 STIMME-Clips und 2 Song-Stimmen ⇒ 5 neue Take-Kennungen, alle in derselben Spur „Gegenstimme 1“, ein Gruppen-Undo (Clips + Song + Spur);
  ↶ ⇒ deep-equal. Note ▲ an einer Stelle ⇒ die anderen vier bitgleich. Über 512 Takes ⇒ Toast, Daten deep-equal.

**Abhängigkeiten:** G6+a (Takes, `tkGc`), G6+b (Plan), G2-Editor, G7, G4, VS-P, G9 (Text bleibt am Lead), später G10h (die Klavierrolle öffnet entkoppelte Stimmen). **Risiko:** mittel
(Take-Bindungen an `stimmeT()`/Take-Kennung).

### G6+g — Farbige Schatten und Vorlage zum Nachsingen · ≈ 8 h

**Inhalt:** §1.6: Farb-Tokens hell/dunkel, Schatten im G2-Noten-Editor (`g2Paint` Z. 44375) hinter den Lead-Blöcken mit Ziffer, farbige Tonhöhenlinien im Marken-/Wellen-Editor (`wpPaint`
Z. 42677), Legende mit Auge/Solo, Tipp auf einen Schatten öffnet die Stimme, „Selbst singen“ v2 (Führung, Lead leise, Spur bleibt, Doppel aus), Zeichnen aus einem Bild-Cache (nur bei Änderung neu).
- [ ] **G6P-60** Farbe und Ziffer je Intervall: Tabelle §1.6 für 30 Fälle richtig (inkl. Dezime = rot „10“, Oktave unten = violett „8“). Akkord-Rolle: Farbfeld = häufigstes Intervall der Stelle (Gleichstand: kleineres). Kontrast ≥ 3 : 1 hell und dunkel.
- [ ] **G6P-61** Schatten auf den Chornoten: Start ± 1 px, Zeile = Ton der Stimme für alle Noten; Auge blendet aus; Tipp öffnet die Stimme (Lead grau). Solo über die Legende endet mit dem Schließen des Editors.
- [ ] **G6P-62** Bildzeit mit 4 Stimmen auf einem 32-s-Take p95 +≤ 2 ms; Zoomen/Scrollen ohne Neuberechnung der Schatten-Geometrie (Cache-Treffer).
- [ ] **G6P-63** Selbst singen v2: Zielstimme hörbar, Lead −12 ± 0,5 dB (Schalter aus ⇒ Lead stumm), andere Spuren stumm. Die Aufnahme ersetzt die Stimme (Spur, Pan und Pegel bleiben, `dblOff`), und ein Undo-Schritt gehört zur Aufnahme.

**Abhängigkeiten:** G6+a, G2-Editor, G6 „Selbst singen“. **Folgepakete:** G10i übernimmt Tabelle und Schatten in die Klavierrolle; G10j bringt den Live-Tonhöhenpunkt und die Vorlage-Leiste im Aufnahme-Overlay.

### G6+h — Song und Video · ≈ 7 h

**Inhalt:** §2.7/§2.8: `g6pSongPcs` (Akkorde der Begleitung am Takt), Vorausrechnen des nächsten Teils, Song-Undo inkl. Spuren, `g6pWaitAll` im Video-Render, Solo/Scharf aus während des Renders (v1 und v2).
- [ ] **G6P-70** Song-Stimme in G-Dur mit Begleitung, Dreistimmig/Barbershop/Gospel ⇒ Akkordtöne aus der Begleitung am Takt (Tabelle, 100 %).
- [ ] **G6P-71** Song 3 min mit 3 Chor-Stellen ab Kaltstart: Jede Stelle ist fertig, bevor sie erklingt (Vorausrechnen ≥ 1 Teil), 0 Aussetzer, keine langen Tasks.
- [ ] **G6P-72** Video (VV-Weg) über den ganzen Song: Ton enthält jede Chor-Stelle. Chor/Lead-Abstand = live ± 0,2 LU. Zwei Renders sind bitgleich. Ein vor dem Render aktives Solo ändert den Render nicht.
- [ ] **G6P-73** Stil auf einer Song-Stimme = 1 Song-Undo-Schritt inkl. Spuren; Speichern/Laden deep-equal.

**Abhängigkeiten:** G6+b, G6+c, Song (V2d′/G8), Video 4.26.0 (VV3). **Risiko:** gering bis mittel.

### G6+i — Zusammenführen, Gesamt-Abnahme, Hörprobe, Auslieferung · ≈ 7 h

**Inhalt:** Merge der drei Zweige, gezielte Regression (G6-01…05 auf v1, G2, G7, G1, VS-P, G4, Song, Video, smoke), M-G28 auf allen Snapshots, Fach-Prüfung Gesang (unabhängiger
Prüf-Lauf mit eigenen Signalen: E♭-Dur, 44,1 kHz, tiefe und hohe Stimme, Legato), **Hörprobe-WAVs** je Stil für Xander, Changelog, Snapshot, SPIELSYSTEM.md, Werkstatt,
Sonden, Funk-Antwort mit „Bitte prüfen“ (CLAUDE.md Regel 4).
- [ ] **G6P-80** Alle G6P ✓ in der zusammengeführten Fassung; G6-01…05 ✓ (v1 unverändert); smoke ohne Fehler; Bildzeit und Tipp-Median wie 4.27.0 ± 5 %.
- [ ] **G6P-81** „Bitte prüfen“ am iPhone (5 min): Refrain singen → [80er großer Refrain] → klingt groß? [Gospel]/[Barbershop] vergleichen; Spur Solo/Stumm; [Als Chor-Stimme duplizieren] → Note
  ziehen → [Background]; Schatten im Noten-Editor; Speichern, neu laden.

**Summe G6+ ≈ 101 h** (G6+0 3 · a 10 · b 18 · c 12 · d 9 · e 14 · f 13 · g 8 · h 7 · i 7). Davon kommen 3 h vorab in 4.25.2, ≈ 98 h in 4.28.0.

---

## 4. Reihenfolge

### 4.1 Plan

| Schritt | Version | Inhalt | Aufwand | Kalender |
|---|---|---|---|---|
| 0 | **4.25.2** | G6+0 Sofort-Korrekturen (mit K1–K4 aus Nachtrag 9) | 3 h | im 4.25.2-Zweig |
| 1 | 4.26.0 / 4.27.0 | Video, dann G9 Songtext (Vorrang laut Xander 19:45) | — | — |
| 2 | (vorher) | **Funk-Vorschlag [V-Funk]** mit Bildern: Matrix-Punkte, Song-Streifen, Blatt-Aufbau Hochformat/quer; **F-1** (SQL) anfragen | 1 h | parallel zu 4.27.0 |
| 3 | **4.28.0 Welle 1** | Zweig A `g6p-br-D`: **G6+a** · Zweig B `g6p-br-R`: **G6+b** · Zweig C `g6p-br-K`: **G6+c** (gegen die Datenform aus §2.2) | 10 · 18 · 12 h | ≈ 18 h |
| 4 | **4.28.0 Welle 2** | A: **G6+f** → **G6+h** · B: **G6+d** → **G6+g** · C: **G6+e** | 20 · 17 · 14 h | ≈ 20 h |
| 5 | **4.28.0 Welle 3** | **G6+i** Zusammenführen, Abnahme, Hörprobe, Auslieferung | 7 h | ≈ 7 h |

**Kalender 4.28.0 ≈ 45 h** mit 3 Zweigen (Bauzeit ≈ 98 h). Fertige Teilstände gehen sofort als Vorschau raus (Regel 31): nach Welle 1 Stile mit Test-Knöpfen, nach Welle 2 das neue Blatt.

**Begründung.** G6+0 kommt vorab, weil der ZIP-Fehler Daten kostet. Das ändert keinen Klang. G6+ kommt nach Video und G9 (Xanders Vorrang) und **vor G10**: G10h/i/j brauchen die Chor-Spuren, die
Stufen-Rechnung und den `guide`-Knoten (Nachtrag 9 §3, Schritt 5). In Welle 1 stehen die drei Grundlagen (Daten, Rechnen, Klangweg). Sie berühren getrennte Blöcke und laufen
deshalb parallel. Stile, Blatt, Takes und Schatten bauen darauf auf.

### 4.2 Abhängigkeiten auf einen Blick

| Baustein | braucht G6+ | G6+ braucht |
|---|---|---|
| **G2** (Tonhöhe, Worker, Editor) | — | Plan/Analyse/Fenster-Synthese (b), Editor für Stimmen (f, g) |
| **G4** (Gesangs-Effekte) | — | Quelle = G4-Fassung (b); entkoppelte Takes laufen durch G4 (f) |
| **G7** (Transponieren) | — | `outPitch`/`g7Key` (b); `g7SegOf` erweitert (f) |
| **VS-P** (Auto-Pegel) | — | `r.G` für den Chor (c), `vpKick` für neue Takes (f) |
| **G9** (Songtext) | Text nur am Lead | `lyrics` nicht kopieren (f) |
| **G10h** (Klavierrolle) | entkoppelte/duplizierte Stimmen und Chorstimmen öffnen dort | — |
| **G10i** (Chor sichtbar) | Farbtabelle §1.6, Schatten (g), Stufen-Rechnung (b) | — |
| **G10b** (Clip-Fenster) | entkoppelte/duplizierte Stimmen folgen dem Fenster des Lead-Stücks (§2.2) | — |
| **G10c/G10d** (Takes, Comping) | Takes mit `of`/`src` im Takes-Blatt mit Herkunft; Chor schweigt, solange `comp` gesetzt ist | — |
| **G10j** (Vorlage) | `guide`-Knoten der Gruppe und Vorlage-Faktor je Chor-Spur (c), Chor-Spuren als Vorlage, Song-Haken `g6Took` | — |
| **Video** (VV) | — | `vvTakesReady` + `g6pWaitAll` (h) |

### 4.3 Auswirkung auf Nachtrag 9 (G10)

- **G10i** wird kleiner (≈ 8 h → ≈ 4 h). „Chor folgt dem Lead“ (Befund 11c) erledigt G6+b über die Stufen, und Farben/Schatten/Legende liefert G6+g. Übrig bleiben die Übernahme in die Klavierrolle,
  der rote Rand für leiterfremde Chornoten und das Chor-Band. G10-80 wird durch G6P-10 ersetzt. Die Farbtabelle §1.6 gilt; sie übernimmt die Farben aus Nachtrag 9 §2.9 (Sexte blau,
  Oktave violett) und ergänzt Quarte, Sekunde/Septime und gelb für freie Stimmen.
- **G10i und alte Chöre (Regel 28):** Nachtrag 9 §2.9 wollte bei jeder Lead-Änderung die `iv` eines v1-Chors neu berechnen. Das entfällt: v1 bleibt eingefroren (§2.9 dieser Spec), und wer
  „Chor folgt dem Lead“ will, tippt [Auf Chor-Gruppe umstellen] (§1.3). G10-81 gilt für v2 (Hand-Versatz als `d`/`x` in den Noten). G10-84 heißt für v1: Laden bitgleich (M-G28), und nach einer Lead-Änderung klingt der Chor genau wie
  in 4.25.0 bei derselben Änderung (gehörte Fassung mit festem `iv`, keine Daten-Änderung am Chor). „Lead-Änderung + Chor-Neuberechnung = 1 Undo“ entfällt, weil sich bei v2 keine Chor-Daten ändern (§2.5).
- **G10i, Spur-Modell:** Nachtrag 9 §2.9 nennt einen „Umbau `stimmeT()` auf mehrere STIMME-Spuren“. Das ist durch Weg B (§2.1) überholt, es bleibt eine STIMME-Spur. „Schatten aus den
  Gruppen-Spuren“ heißt hier: Noten aus `voices[].n` der Stelle (v2: Höhe aus Plan `d/o/x` und Lead), Farbe, Name und Auge aus der Spur (`lane`).
- **G10j** nutzt den `guide`-Knoten der Gruppe (G6+c) und den Vorlage-Faktor je Chor-Spur (§2.4), zusätzlich zu den `guide`-Knoten der Spuren aus Nachtrag 9 §2.10. Die Vorlage „Chorstimme“ ist eine
  Chor-Spur: Sie bekommt +6 dB über ihren Faktor, die übrigen Chor-Spuren −10 dB. Ein v1-Chor läuft durch die STIMME-Kette und folgt deren `guide` wie der Lead.
- **G10b** (Klammern, Anlauf/Ausklang, Rücken): Entkoppelte und duplizierte Stimmen spielen mit dem Fenster des Lead-Stücks (§2.2), sie brauchen dort keinen eigenen Schritt. Errechnete Stimmen
  rechnen nach einer Fenster-Änderung neu (das Fenster steht im Cache-Schlüssel, §2.3 Nr. 7).
- **G10c/G10d:** Das Takes-Blatt zeigt Takes mit `of` als „Chor Terz oben (aus Take 3)“ bzw. „Gegenstimme 1 (aus Take 3)“; Status-Chip „Chor-Gruppe“ (G10-25). Solange am Lead `comp` gesetzt ist,
  schweigt auch der Chor v2 (wie Nachtrag 9 §2.4), und [Entkoppeln]/[Als Chor-Stimme duplizieren] sind dann grau mit dem Hinweis „erst Zusammenfügen“.
- **G10h** öffnet Chorstimmen und entkoppelte Takes in der Klavierrolle. Nachtrag 9 §2.8 nennt „G6+ (entkoppelte Stimmen öffnen im selben Fenster)“ bereits als Abhängigkeit, das passt.
- Nachtrag 9 schätzt „Entkoppeln ≈ 18 h“. Hier sind es ≈ 13 h für Entkoppeln **und** Duplizieren (inkl. [Ganze Spur]), weil geteilte PCM-Stücke und der Plan als `take.pitch` das Rendern von Audio ersparen.

### 4.4 Offene Punkte (nur Zugang)

- **F-1 `max_format = 6` (Supabase, Regel 20).** Das Online-Speichern von Projekten mit Chor-Gruppe braucht eine SQL-Zeile von Xander (`private.settings.max_format = 6`).
  `max_app` steht schon bei 4 030 000 und reicht für 4.28.0. Der Dirigent bereitet die Zeile vor und erinnert vor Welle 3, ruft Supabase aber nie selbst auf. **Ohne** Freigabe bleibt das Format 5:
  Alles funktioniert, nur könnte eine veraltete App-Fassung die Chor-Gruppe beim Speichern still verlieren (§2.6).
- Keine Geldfragen.

### 4.5 Prüfvermerk (nur Code gelesen [K])

- Alle Zeilen sind gelesen, nicht gemessen. Die Abnahmen G6P-NN sind die Messung.
- **[K] zu prüfen beim Bau:** (1) Die genaue Reihenfolge der `tkExt().proc`-Kette (Säubern → G4 → G2 → Zeitkarte, Z. 44148/43572) für die Fenster-Zeitkarte. (2) Ob die
  G2-Synthese stimmhafte Strecken wirklich unabhängig rechnet; davon hängt G6P-13 für v1 ab. (3) Die Felder `q/str/mode` von `take.pitch` beim Entkoppeln, wenn der Lead **kein** Tonhöhen-Feld hat:
  Dann bekommt die Kopie `{mode: 'soft', str: 0, q: false, notes: erkannte Noten + sh}` (`g2NormPitch` Z. 44108ff rundet `sh` auf ganze Halbtöne, −36…36; das passt, weil `c − L` ganzzahlig ist).
- **[S] am Gerät:** Rechenzeiten am iPhone (Ziel ≤ 2 × Prüfrechner), ob „Falsett“ nach Kopfstimme klingt, und die Stil-Werte (Hörprobe G6P-81).
- Versionsnummern vergibt der Dirigent beim Zusammenführen (parallel laufen North, Bit Mask, Innovation, T1 und Magic Scale).
- **Fassung 2 (strenge Prüfung 01.11.):** Zeilen korrigiert (`g6Mix` Z. 44696/44706, `g6Sheet` Z. 44737). Ergänzt: feste Rollen-Schreibweise und Namens-Tabelle (fertig benannt),
  Farbe bei Akkord-Rollen, was ein Stil ersetzt, Spur-Grenze 8 mit Übernahme/Löschen, [Ganze Spur] beim Duplizieren (Xander: „Gesangsspur duplizieren“), Anfangswerte der Kopie,
  Echo-Zeit als Vorschlag auf Tipp (Xander 13:30 „Echo-/Hallzeiten“), Zischlaute auch für Take-Stimmen, Pegel/Pan je Stelle statt „Spur-Pegel“, Vorlage-Faktor je Chor-Spur für G10j,
  Format-Trennung Lesen/Schreiben (`PROJECT_FORMAT` an 13 Stellen), Rückfall-Felder für 4.25.0, Regel-28-Ausnahme „gleicher Take, verschiedene Chor-Werte“, v1 folgt dem Lead nicht in Stufen,
  Stil-Kacheln hochkant 2 × 4, Knotenzahl, Farbtabelle wie Nachtrag 9, Abhängigkeiten zu G10b/c/d/i/j.

## Quellen (kurz, eigene Worte)

- Code 4.25.0 (`synq-snapshots/G-GES-merge.html`): G6-Block Z. 44479–44781, Takes/Normalisieren Z. 39770–39832, Kette `buildChain` Z. 17903ff, Format/NV Z. 13497/34707.
  Video-Render: Zweig `helfer-VV3.html` (4.25.0 + VV), Z. 41946/41998.
- `CHANGES-helfer-G267.md` (G6 Abnahme, Fragen, Nachprüfung D2: `below` 8 → 9, 44,1-kHz-Hinweis), Nachtrag 5 §G6, Nachtrag 9 §2.8–2.10, §3.
- Studio-Praxis [W], nur zum Vergleich: Background-Gesang als eigene Spuren mit Sammel-Bus und gemeinsamem Hall/Echo-Send, Doppeln durch Versatz und leichte Verstimmung,
  Zischlaute in Background-Spuren absenken, Abstand Lead–Chor 6–12 dB, tiefe Stimmen mittig, Doppel außen, Vorverzögerung im Tempo für Klarheit.

## Nachtrag Xander 01.11. ~02:00 UTC – Kopplung Lead ↔ Chor (verbindlich)
- Schalter **[Gekoppelt]** (Standard AN) an der Chor-Gruppe: Lead-Lautstärke (Spur-Regler, auch je Songteil/Refrain-Block) ändert den Chor prozentual mit (gleicher dB-Schritt), Mix bleibt stehen – kein Nachregeln.
- **Chor als Ganzes** lauter/leiser: Gruppen-Regler „Chor“ (Abstand zum Lead in dB), wirkt immer; bei [Gekoppelt] AUS wird der Chor vom Lead-Regler getrennt; wieder AN → ab dann wieder gemeinsam (aktueller Abstand bleibt erhalten).
- Abnahme G6P-K1: Lead −6 dB bei Kopplung an → alle Chorstimmen −6 dB ±0,1; Kopplung aus → Chor unverändert; wieder an → Abstand bleibt.
