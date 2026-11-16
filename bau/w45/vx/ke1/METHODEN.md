# KE1 – Methoden: Klang aus einer Aufnahme erkennen und mit eigenem Synth nachbauen

Stand 16.11.2026 · Methoden-Recherche (Web-Suche + Fachwissen) · markenfrei (Gerätenamen, Titel mit Produktnamen und die
Gerätebezüge stehen in der privaten Zusatzdatei `ke1-methoden-privat.md` unter `scratchpad/vx-privat/`).
Bezug: Code-Inventar `scratchpad/vx/ke1/INVENTAR.md` (4.78.0, nur gelesen). Quellen: [Q1]…[Q41] am Ende.
Kennzeichen: **[Q..]** = belegt · **[Fachwissen]** = Lehrbuch/Mathematik, nicht eigens nachgeschlagen · **[Ableitung]** = eigener
Vorschlag aus belegten Bausteinen · **[unbestätigt]** = nicht geprüft · **[geschätzt]** = Zeit-/Größen-Schätzung.
Hinweis zur Recherche: arxiv.org und dafx.de waren aus dieser Sitzung nicht abrufbar (Netz-Sperre). Inhalte von dort stammen aus
Suchtreffer-Zusammenfassungen (Titel, Autoren, Jahr, Kernaussage der Kurzfassung); Einzelzahlen aus den Volltexten sind nicht geprüft.

---

## 0. Kurzfassung

**Empfehlung: Analyse-durch-Synthese mit der eigenen Engine, in drei Stufen, ohne Server, ohne neuronales Netz im ersten Schritt.**

1. **Stufe 1 – Merkmal-Schätzung (sofort, < 0,3 s [geschätzt]):** Quelle-Filter-Zerlegung der Obertöne (welche Welle, welcher
   Filter), Verläufe über die Zeit (Filter-Hüllkurve, Lautstärke-Hüllkurve), Modulation (Vibrato, Tremolo, Schwebung), Rauschanteil,
   FM-Spuren, Effekt-Spuren. Ergebnis: ein sofort spielbarer Startklang + je Merkmal eine grobe Sicherheit.
2. **Stufe 2 – Verfeinern durch Nachspielen (2–8 s [geschätzt]):** Die eigene Engine spielt Kandidaten ab (offline, in Workern,
   nicht im Haupt-Thread), ein zusammengesetztes Abstandsmaß vergleicht mit der Aufnahme, ein Optimierer (erst kleine Teilräume mit
   Nelder–Mead, dann CMA-ES über alles) sucht weiter. Aus allen geprüften Versuchen entstehen die Wahrscheinlichkeiten
   („Säge 72 %“, „Cutoff etwa 1,1 kHz, sicher zwischen 0,8 und 1,6 kHz“).
3. **Stufe 3 – Engine-Wahl:** dasselbe für VA, MS 2000 und FM (2–3 Operatoren) mit geteiltem Zeitbudget (schwache Engines
   früh aussortieren), Wahl nach kleinstem Abstand; bei Gleichstand die einfachere Engine. Wenn keine Engine nah genug kommt:
   die Aufnahme selbst als Instrument anbieten (Klangkorn „Als Instrument“ gibt es schon).

Warum so: Der Nachbau-Kern der App (Merkmale, (1+6)-Evolution, Offline-Render mit derselben Engine, 4.62) ist genau diese
Methodenfamilie [INVENTAR §2]; die Literatur zeigt, dass Suche mit der echten Engine die zuverlässigste Grundlage ist, und dass
neuronale Schätzer zwar schnell sind, aber bei Klängen von *anderen* Geräten deutlich schlechter werden und deshalb ebenfalls mit einer
Verfeinerung durch die echte Engine kombiniert werden [Q10][Q15][Q16]. Neuronale Netze, differenzierbare Synths und GPU (WebGL/WebGPU)
bringen für 1-s-Einzeltöne auf dem iPhone keinen Vorteil, der die Ladezeit und die Doppel-Implementierung rechtfertigt (§7).

**Für Xander in einfachen Worten (Vorschlag für die Funk-Antwort):**
> Ja, das geht. Die App hebt die Aufnahme sowieso schon auf. Dann passiert es in drei Schritten:
> 1. Sie hört genau hin und rät sofort: welche Welle, wie hell der Filter, wie schnell der Ton kommt und geht.
> 2. Dann probiert sie in ein paar Sekunden viele kleine Änderungen mit unserem eigenen Synth aus und vergleicht jedes Mal mit der
>    Aufnahme, bis es am ähnlichsten klingt.
> 3. Das macht sie mit VA, MS 2000 und FM und nimmt den, der am nächsten dran ist. Zu jedem Wert sagt sie, wie sicher sie ist.
> Am besten klappt es mit Kabel ins Mischpult statt Mikrofon, mit einzelnen Tönen, und ohne Hall.

---

## 1. Ausgangslage (4.78, nur gelesen, Details in INVENTAR.md)

- Aufnahmen bleiben erhalten (Take = PCM16 mono + Abtastrate, `tkPcm`) – „einfrieren“ gibt es also schon.
- Nachbau existiert für **eine Note**: Merkmale im Worker (`klangFeat`: f0, Obertöne in dB, Rauschanteil, Bänder je Abschnitt,
  Pegel-Hüllkurve, ADSR, Schwebung/Verstimmung/Vibrato/Wah), Rastersuche Welle × Tiefpass, FM-Verhältnis über Bessel-Tabelle,
  (1+6)-Evolution mit ~50 Versuchen, jeder offline durch dieselbe Engine gerendert (`spk2KlRender`, `spk2KlOpt`), Abstand
  `spk2KlDist` = 0,45·Bänder + 0,3·Obertöne + 0,25·Hüllkurve (+ Bewegung SPK3).
- Gemessene Güte (Notizen SPK4): Abstand VA „Säge + Rechteck +9 ct“ 3,89 · FM 1:2 2,06 · Pad Unison 0,96 · Lead Vibrato 0,95;
  Zeit 1,7–2,9 s je Nachbau (Browser, Xeon) → ≈ 35–60 ms je Versuch inkl. Analyse [Ableitung aus diesen Zahlen].
- Lücken: kein Ziel MS 2000 (keine Speicherwelle, kein OSZ 2 mit Ring/Sync, nur LP24), Filter-Anschlag/Halten fest, keine
  Effekte, keine Anschlagstärke/Tastaturverfolgung, keine Wahrscheinlichkeiten, kein Ein-Tipp-Weg vom Take.
- Plattform: Safari hat **kein Web MIDI** [Q41] → die App kann ein fremdes Gerät nicht selbst ansteuern; gesteuerte Mess-Aufnahmen
  laufen über eine Aufnahme-App mit MIDI und werden als WAV importiert (Import-Weg `imp1Pick` existiert).

---

## 2. Das Problem in einem Satz – und warum Stufen

Gesucht sind Regler-Werte θ, sodass Engine(θ, Note) ≈ Aufnahme. Das Problem ist **mehrdeutig**: viele θ klingen gleich
(z. B. Rechteck + Tiefpass ≈ Dreieck; Filter-Hüllkurve ≈ wachsender FM-Index; langer Release ≈ Hall) [Q21][Q25]. Deshalb:
- Merkmale allein (Stufe 1) sind schnell und erklärbar, aber bei solchen Verwechslungen unsicher.
- Nachspielen + Vergleichen (Stufe 2) entscheidet über das *Ergebnis im Ohr*, nicht über „die wahren Regler“; die Unsicherheit
  wird als Spanne/Wahrscheinlichkeit ehrlich angezeigt statt versteckt.
- Parameter-Fehler und Hör-Abstand stimmen nur mäßig überein [Q20] → beim Testen immer beides messen (§8).

---

## 3. Methoden-Überblick und Bewertung

Spalten: iPhone-Browser (Safari, JS/WASM, kein Server) · Laufzeit je Note auf dem iPhone 12 [geschätzt] · Genauigkeit ·
Erklärbarkeit („wahrscheinlich X zu Y %“) · Urteil für uns.

| Methode | Quelle | iPhone | Laufzeit | Genauigkeit | Erklärbar | Urteil |
|---|---|---|---|---|---|---|
| Merkmal-Regeln (Obertöne, Gerade/Ungerade, Steigung, Schwerpunkt-Verlauf, RMS-Hülle, Schwebung, HNR) | [Q28][Q30][Q31][Fachwissen] | ja, reines JS | 50–300 ms | mittel; gut bei trockenen Einzeltönen, schwach bei Verwechslungen | sehr gut | **Stufe 1** |
| Analyse-durch-Synthese, lokale Suche (Hill-Climber/(1+λ)-ES, Nelder–Mead) | [Q4][Q43], App 4.62 | ja (vorhanden) | 1–5 s | gut ab gutem Start | gut (Abstand sichtbar) | **Stufe 2, Teilräume** |
| CMA-ES | [Q27] | ja, ~200 Zeilen JS | 2–8 s für 200–400 Versuche | gut–sehr gut in 8–20 Dimensionen, robust bei Kopplungen | gut (+ Streuung) | **Stufe 2, gemeinsam** |
| Genetische Algorithmen (FM-Matching) | [Q1][Q2][Q3][Q36] | ja | meist > 10 s (Tausende Versuche) | gut für globale FM-Suche | mittel | nur kleine Variante: Mehrfach-Start/Vielfalt [Q11] |
| Neuronale Direkt-Schätzer (CNN/LSTM/Transformer auf Spektrogramm) | [Q5][Q6][Q14][Q17] | Inferenz ja (WASM; WebGPU erst ab iOS 26) [Q38][Q40] | < 0,1 s Inferenz + Laden MB | in der eigenen Engine-Welt gut, bei fremden Geräten deutlich schlechter | gering | später, nur als Startwert-Geber (§7) |
| Latentraum/Normalizing Flows | [Q7] | Inferenz ja | wie oben | gut, liefert Verteilung | mittel | zu groß für jetzt |
| Differenzierbare Synths (DDSP, Gradient) | [Q8][Q9][Q12][Q13][Q25] | Training/Gradienten im Browser unpraktisch | – | gut bei passender Proxy-Engine; Tonhöhe/FM-Frequenz per Gradient schlecht [Q23][Q24][Q13] | gering | nein (zweite Engine nötig) |
| Proxy-Netz + Feinschliff zur Laufzeit / RL | [Q16][Q15] | schwer (Training nötig) | – | Stand der Forschung, auch fremde Geräte | gering | Idee übernehmen: Startwert + Verfeinern |
| Engine-Ensemble mit Auswahl | [Q18] | ja | Summe der Engines, durch Aussortieren begrenzt [Q35] | besser als eine Großengine | gut | **Stufe 3** |
| Wahrnehmungs-Linearisierung (PNP) | [Q22] | Idee ja | – | beschleunigt Gradienten | – | Idee nutzen: Empfindlichkeit je Regler (§5.4) |

Kommerzieller Beleg, dass es lokal geht: ein bekanntes Synth-Plugin baut seit 2023 aus ≤ 2 s Audio lokal und ohne Internet einen
Patch per Suche nach; Testberichte loben es, merken aber an, dass **ein** Ton nicht für die ganze Tastatur reicht (Name/Quellen in der
Privat-Datei) → mehrere Töne aufnehmen (§9).

---

## 4. Stufe 1 – Merkmal-Schätzung im Detail

Alle Schritte im bestehenden Analyse-Worker (`klangFeat` erweitern), Ergebnis = Merkmalvektor + Startwerte + Sicherheiten.

### 4.1 Vorverarbeitung
- **Noten trennen:** Ein-/Aus-Zeitpunkte und f0-Spur aus der vorhandenen Stimme-Analyse (pYIN-artig [Q29]). Bei MIDI-gesteuerter
  Mess-Aufnahme sind Tonhöhe, Anschlag und Haltedauer **bekannt** → die besten Bedingungen (§9).
- **Pegel angleichen:** Haltephase auf festen RMS bringen; alle Vergleiche pegelunabhängig.
- **Obertöne verfolgen:** STFT mit Fenster ≥ 4 Perioden, Sprung 5 ms, Spitzen bei k·f0 (±3 %, parabolische Verfeinerung) → a_k(t) in dB,
  f_k(t); Rest (zwischen den Spitzen) = Rauschen. K bis 64 bzw. bis 0,45·Abtastrate [Fachwissen].
- **Weg merken:** `stGuessRoute` (Kabel/Lautsprecher/Bluetooth) steuert später die Sicherheit (§4.11).

### 4.2 Wellenform (Oszillatoren)
Quelle-Filter-Modell in dB: a_k = s_w(k) + h(k·f0), mit s_w = Obertonmuster der Welle w und h = **glatte** Filterkurve. Für jede
Kandidaten-Welle wird h mit wenigen Freiwerten angepasst (Filter-Prototyp oder geglättete Hüllkurve, z. B. „wahre Hüllkurve“ [Q31]);
der Rest-Fehler E_w je Welle → Wahrscheinlichkeit (§5.4). Erkennungszeichen [Fachwissen, Fourier-Reihen]:
- Säge: alle Obertöne, 1/k (−6 dB/Oktave).
- Rechteck: nur ungerade, 1/k. Dreieck: nur ungerade, 1/k² (−12 dB/Okt.). Sinus: nur Grundton.
- Puls mit Breite d: |sin(π·k·d)|/k → **Lücken** bei k = m/d (d = 25 % → jeder 4. Oberton fehlt) → Pulsbreite direkt ablesbar;
  wandernde Lücken = Pulsbreiten-Modulation.
- Verwechslung: Rechteck + tiefer Tiefpass ≈ Dreieck. Nur sicher, wenn der Filter weit offen ist → Wellen-Schätzung aus dem Zeitfenster
  mit dem **höchsten Spektralschwerpunkt** (Filter am weitesten auf), sonst Sicherheit senken [Ableitung].
- **Speicherwellen 1–64 (MS 2000):** jede hat ein eigenes Feinmuster. Feinstruktur = a_k minus geglätteter Trend (beide Seiten gleich
  geglättet, damit der Filter herausfällt), Korrelation über k = 1…K gegen die 64 Tabellen (Daten liegen im App-Block `MK_WD`,
  r-Code beachten) → Top-3 mit Wahrscheinlichkeit, jede in Stufe 2 nachgespielt [Ableitung]. **Grenze heute:** die Tabelle ist eine
  Nachzeichnung („≈“); echte Aufnahmen der Wellen verbessern genau diese Erkennung.
- **Zweiter Oszillator mit Abstand (Quinte, Oktave …):** Teiltöne passen nicht auf *einen* Kamm → zweiten Kamm f2 = f0·2^(s/12) suchen
  (harmonisches Sieb); Pegelverhältnis aus den Kamm-Energien. Achtung Oktavfehler der Tonhöhe: bei Quinte (3:2) ist der gemeinsame
  Grundton f0/2. Bei Oktave/Einklang überlappen die Kämme → nur über Schwebung erkennbar (§4.7) [Ableitung].
- **Sync:** harmonisch zu f0, aber mit einem breiten Buckel bei der Frequenz des Folge-Oszillators, der mit der Tonhöhe nicht mitwandert;
  gefegter Sync ähnelt einem Resonanz-Filter-Sweep → Unterscheidung über Buckel-Form (Nebenzipfel) und Stufe 2 [Ableitung].
- **Ringmodulation:** Teiltöne bei |f1 ± f2|, die Ausgangs-Tonhöhen selbst fehlen; bei krummem Verhältnis unharmonisch → mit FM
  verwechselbar → Stufe 3 entscheidet [Fachwissen].

### 4.3 Filter (Typ, Cutoff, Resonanz)
- h(f) = a_k − s_w(k) an den Obertönen; daran Betragskurven der vorhandenen Filtertypen anpassen (MS 2000: 24LP, 12LP, 12BP, 12HP;
  VA zusätzlich 24BP, 24HP, VOKAL), Gewicht nur auf hörbare Obertöne (> −60 dB), Fehler je Typ → Wahrscheinlichkeit [Ableitung].
- Steigung oberhalb Cutoff: ≈ −24 dB/Okt. (4-polig) gegen ≈ −12 dB/Okt. (2-polig); Hochpass = fallender Bass; Bandpass = beides
  [Fachwissen]. Spektrale Steigung/Rolloff/Schwerpunkt nach [Q28].
- Resonanz = Spitze über der resonanzfreien Kurve. **Nur messbar, wenn ≥ 2 Obertöne im Drittel-Oktav-Bereich um den Cutoff liegen**;
  bei hohem Ton und tiefem Cutoff → Resonanz „unbestimmt“, breite Spanne [Ableitung].
- Tastaturverfolgung und Anschlag→Cutoff: brauchen ≥ 2 Töne verschiedener Höhe bzw. Stärke (§9), sonst Standardwert + „geraten“.

### 4.4 Filter-Hüllkurve
- Je Zeitfenster Cutoff fc(t) schätzen (nur fc frei, 1-D-Suche je Fenster – billig) oder ersatzweise Schwerpunkt der quellbereinigten
  Obertöne. Dann log fc(t) = log fc0 + Menge·EG(t; A, D, S, R) mit Nelder–Mead in 4–5 Dimensionen anpassen [Ableitung; Schwerpunkt-
  Verlauf als Merkmal: Q28].
- fc(t) flach → „keine Filter-Hüllkurve“ (sicher). Abgrenzung zu FM: Filter-Sweep ändert Obertöne **gleichsinnig** (monoton von oben
  nach unten), wachsender FM-Index lässt Teiltöne **auf und ab** schwanken (Bessel-Nullstellen) [Q32][Ableitung].

### 4.5 Lautstärke-Hüllkurve (Amp-ADSR)
- Pegel aus den **tiefen** Obertönen messen (unter dem kleinsten Cutoff, also vom Filter unberührt) – so verfälscht die Filter-Hüllkurve
  die Amp-Hüllkurve nicht [Ableitung]. Anstiegszeit robust nach [Q28]; Abfall/Halten/Release als Exponential-Stücke.
- **Regler-Kennlinien aus der eigenen Engine messen:** EG-Zeit (s) ↔ Reglerwert (0–127 bzw. Sekunden) einmal offline rendern und als
  Tabelle ablegen; so wird nichts über die interne Skalierung geraten [Ableitung]. Das gleiche für Cutoff-Wert ↔ Hz, LFO-Wert ↔ Hz,
  Verstimmung ↔ Cent.
- Release braucht das Ende der Taste: bei MIDI-Aufnahme bekannt, sonst aus dem Pegelabfall geschätzt (unsicher; Hall verlängert scheinbar).
- Bekannte Störung: Unison-Schwebung täuscht Abklingen vor (in SPK4 gemessen und korrigiert) [INVENTAR / SPK4-Notizen].

### 4.6 LFO: Vibrato, Tremolo, Wah, PWM
- Vibrato: f0(t) ohne Trend → Spektrum 0,1–20 Hz → Rate, Tiefe in Cent, Form (Sinus/Dreieck/Rechteck/S&H über Oberwellen bzw.
  Sprünge der Modulationskurve), Einblenden über Tiefe(t) [Fachwissen].
- Tremolo: Pegel-Modulation **mit gleicher Rate in allen Obertönen**. Wah: periodisches fc(t). PWM: periodisch wandernde Lücken (§4.2).

### 4.7 Verstimmung, Unison, Chorus
- Zwei um Δ Hz verstimmte Oszillatoren: Oberton k schwebt mit **k·Δ** – die Schwebung wächst mit der Obertonnummer; Tremolo dagegen hat
  überall dieselbe Rate. Cent = 1200·log2(1 + Δ/f0) [Fachwissen].
- Rechenbeispiel: 3 Cent bei 110 Hz → Δ ≈ 0,19 Hz (Periode > 5 s, im Grundton nicht messbar), im 10. Oberton aber 1,9 Hz → **hohe
  Obertöne auswerten** [Ableitung].
- Unison (viele Stimmen): unregelmäßige Schwebung, verbreiterte Spitzen; vorhandene SPK4-Erkennung nutzen.
- Chorus-Effekt: periodisch (LFO) schwankende Schwebung + leichte Tonhöhen-Streuung; Unison-Verstimmung ist dagegen gleichbleibend.

### 4.8 Rauschanteil
- HNR über Autokorrelation [Q30] bzw. Energie zwischen den Obertönen. Bei Subtraktiv-Synths läuft Rauschen durch denselben Filter →
  Rausch-Spektrum muss h(f) folgen (Plausibilitäts-Prüfung). Rauschen nur im Anschlag → eigener Anschlags-Anteil [Ableitung].

### 4.9 FM (2–3 Operatoren)
- Teiltöne bei fc ± n·fm mit Beträgen |J_n(I)| (Bessel); Verhältnis N1/N2 ganzzahlig → harmonisch [Q32].
- Hinweise auf FM: Teiltöne nicht auf k·f0 (krummes Verhältnis), oder harmonisch, aber mit nicht-monotonem Obertonmuster/Lücken, die
  keine Pulsbreite erklärt, und mit auf-und-ab-Bewegung über die Zeit [Q32][Ableitung].
- Schätzung: Kandidaten-Verhältnisse (½, 1, 2, 3, … kleine Brüche), je Kandidat Index I(t) je Fenster aus einer J_n-Tabelle (1-D-Suche)
  → Index-Hüllkurve = Modulator-EG [Ableitung]. Die App macht das schon für 2 Operatoren (Bessel-Tabelle).
- Allgemeine 6-OP-FM ist aus Audio nicht eindeutig umkehrbar → auf Vorlagen begrenzen: 2 OP, 2 OP + Rückkopplung, 3 OP gestapelt.
  Literatur: Rückkopplungs-FM bzw. 2–3-fach geschachtelte Modulatoren treffen Instrumententöne am besten [Q2]; GA-Suche für
  Verhältnis/Index [Q1]. Rückkopplungs-FM klingt sägeähnlich → Verwechslung mit Säge + Tiefpass → Stufe 3 entscheidet.

### 4.10 Effekte (Hall, Echo, Modulations-Effekt)
- **Hall:** nach Tastenende Abklingen viel langsamer als jeder plausible Release, Spektrum diffus → Nachhallzeit über Rückwärts-Integration
  der Energie [Fachwissen] → Hinweis „Hall erkannt (~x s)“. In Stufe 2 Hallschwanz **ausblenden** (Vergleich nur bis Tastenende + 50 ms)
  oder App-Hall mit geschätzter Länge dazunehmen.
- **Echo:** Autokorrelation der Anschlagsstärke-Kurve zeigt Spitzen bei τ, 2τ … mit abnehmender Höhe g^n → Zeit und Rückkopplung;
  Abgleich mit Song-Tempo [Fachwissen].
- **Modulations-Effekt:** periodisch wandernde Kammfilter-Lücken (Flanger/Phaser) bzw. periodische Schwebung (Chorus).
- Literatur: Effekt-Parameter aus Audio per CNN mit mittlerem Fehler < 0,05 (Skala 0–1) für Chorus, Phaser, Hall, Verzerrung – aber je
  Effekt und Instrument trainiert [Q37a]; Effektketten-Erkennung samt trockenem Signal [Q37b]; bei Gesangs-Presets sind Raum-Effekte für
  den Abgleich besonders wichtig [Q37c]. Folgerung: **wo möglich trocken aufnehmen** (Effekte am Gerät aus), sonst erkennen + ausblenden.

### 4.11 Raum und Mikrofon
- Kabel (Mischpult-Eingang) ist fast linear → volle Sicherheit. Mikrofon im Raum: Reflexionen färben einzelne Obertöne um mehrere dB
  (Kammfilter) und heben den Rauschboden [Fachwissen] → bei Weg „Lautsprecher/Mikro“ (a) Spektren auf Drittel-Oktaven glätten,
  (b) **beide Seiten gleich glätten** (Aufnahme und Nachspiel), damit der Raum nicht den Optimierer treibt, (c) Sicherheit senken,
  (d) 1 s Stille vor dem Ton aufnehmen (Rauschboden) [Ableitung]. Bluetooth: verlustbehaftet → nur „grob“.

### 4.12 Mehrstimmigkeit
- Akkorde: Mehrfach-Tonhöhen (SPK4 „mehrstimmig“ vorhanden); geteilte Teiltöne (Quinte: 3. Oberton Grundton = 2. Oberton Quinte) sind
  nicht eindeutig zuzuordnen → Stufe 1 nur mit **nicht überlappenden** Teiltönen. Stufe 2 löst es von selbst: dieselben Noten mit
  demselben Klang nachspielen und das Gemisch vergleichen [Ableitung].
- Arpeggios/Läufe: viele kurze Töne → Merkmale je Ton, Median über alle; die Verschiedenheit (Höhe, Stärke) liefert Tastatur-/Anschlags-
  verhalten gratis.

---

## 5. Stufe 2 – Verfeinern durch Nachspielen

### 5.1 Abstandsmaß (gleich für alle Engines)
Zusammengesetzt, pegelunabhängig, auf gleicher Zeitspanne (Anschlag bis Tastenende + Release-Fenster, Hall ausgeblendet):

| Teil | Was | Warum / Quelle |
|---|---|---|
| D1 Mehrfach-STFT | log-Betrag + spektrale Konvergenz bei 3–4 FFT-Größen (z. B. 2048/1024/512/256) | Zeit- und Frequenzauflösung zugleich; Standard [Q26][Q8] |
| D2 Obertöne | dB-Abstand der ersten 24–32 Obertöne, gewichtet nach Hörbarkeit, im Halte- und im Anschlagsteil | erklärbar, robust; schon in `spk2KlDist` |
| D3 Hüllkurve | Pegel-Verlauf in dB (5 ms), optional mit Zeitverzerrung (DTW) | DTW-Hüllkurve war in einer Vergleichsstudie für einige Synth-Arten besser als Spektrogramm-Abstände [Q20][Q21] |
| D4 Bewegung | Verlauf Schwerpunkt/fc(t), Modulations-Spektrum (Rate/Tiefe von Vibrato, Tremolo, Schwebung) | billiger Ersatz für Streuungs-Transformationen (JTFS), die Modulation gut erfassen [Q22] |
| D5 Mel/MFCC (optional) | grobe Klangfarbe | in Bibliotheken als Standard-Bewertung [Q36]; blind für Feinstruktur (Pulsbreiten-Lücken) |

- **Kein Abstand ist überall der beste** [Q20]; Gewichte daher am Prüfkorpus so einstellen, dass der Abstand mit Hörurteilen am besten
  übereinstimmt (§8), nicht von Hand raten.
- Spektrale Abstände „hören“ Tonhöhen-Unterschiede schlecht [Q23]; Gradienten auf Frequenzen bleiben in lokalen Minima hängen [Q24][Q13].
  → **Tonhöhe, FM-Verhältnis und Oszillator-Abstand nie frei optimieren**, sondern aus Stufe 1 festlegen bzw. als feste Kandidaten
  durchprobieren.

### 5.2 Optimierer und Budget
- **Diskrete Wahl** (Welle OSZ 1/2, Speicherwelle Top-3, Filtertyp, FM-Vorlage) = getrennte Hypothesen, nicht in den Optimierer mischen.
- **Erst Teilräume** (je 2–5 Dimensionen, Nelder–Mead [Q43], 15–30 Versuche): Filter statisch (fc, Res), Filter-EG (Menge, A, D, S),
  Amp-EG, Mischung/Verstimmung. **Dann gemeinsam** CMA-ES über 8–16 Dimensionen mit kleiner Schrittweite um den Startpunkt
  (Standard-Population λ = 4 + ⌊3·ln n⌋, also ~11–12 bei n = 12–16; rangbasiert, also unempfindlich gegen Skalierung des Abstands;
  lernt Kopplungen wie Cutoff ↔ Hüllkurven-Menge) [Q27]. Parameter transformiert: Zeiten und Frequenzen logarithmisch, Pegel 0–1 begrenzt.
- **Hypothesen früh aussortieren:** nach einem Drittel des Budgets die schlechtere Hälfte verwerfen (successive halving) [Q35].
- Beispiel-Budget je Note [geschätzt]: 6 Hypothesen × 20 Versuche (120) → beste 2 × CMA-ES 200 → 1 Endprüfung in voller Qualität
  ≈ 320–350 Versuche.
- Vielfalt statt nur „bester Treffer“: 2–3 deutlich verschiedene gute Lösungen zeigen („Variante A Säge + Filter, Variante B FM“) [Q11].

### 5.3 Schnell rendern auf dem iPhone
- **Engine in Web-Workern statt OfflineAudioContext:** der Worklet-Code ist reiner JS-Text und läuft im Node-Prüfstand bereits mit einem
  Ersatz-`AudioWorkletProcessor` [INVENTAR §4 A] → dieselbe Hülle im Worker, 2–4 Worker parallel. Das A14 hat 6 CPU-Kerne (2 schnell,
  4 sparsam) [Fachwissen, unbestätigt in diesem Lauf]; ob mehrere OfflineAudioContexts in Safari parallel laufen: [unbestätigt].
- Kurze Renders: nur Anschlag + Haltestück + Release-Fenster (≈ 0,6–1,2 s), Zwischenstufen mit halber Abtastrate, Endprüfung voll
  [Ableitung]. Ziel-Merkmale der Aufnahme nur einmal berechnen.
- **Zufall festhalten:** Rausch-Startwert, Analog-Drift (`analog`), Phasen (`reset`) und Unison-Phasen beim Abgleich fest setzen, sonst
  ist der Abstand verrauscht und der Optimierer irrt [Ableitung]. Endprüfung mit 2 Startwerten mitteln.
- Haupt-Thread bleibt frei (keine Long Tasks > 50 ms, wie LT1); Fortschritt sichtbar, Zwischenergebnis sofort hörbar.
- Rechnung [geschätzt]: 20–40 ms je kurzem Render × 350 Versuche / 3 Worker ≈ 2,5–5 s. Am echten Gerät messen (§8).

### 5.4 Wahrscheinlichkeiten („wahrscheinlich … zu X %“)
- **Diskret** (Welle, Filtertyp, Engine): p_h ∝ exp(−D_h / T) über die besten Abstände je Hypothese; T am Prüfkorpus so einstellen, dass
  „70 %“ in 70 % der Fälle stimmt (Temperatur-Skalierung) [Q34]. Ohne Kalibrierung keine Prozentzahl zeigen, nur „wahrscheinlich/
  vielleicht“.
- **Stetig** (Cutoff, Zeiten …): alle geprüften Versuche mit Gewicht exp(−(D_i − D_min)/T_c) → gewichteter Median + 10–90-%-Spanne;
  das ist die weiche Form der Approximate Bayesian Computation (Simulation statt Formel) [Q33]. Die CMA-ES-Kovarianz am Ende ergänzt die
  Spanne.
- **Einfluss je Regler:** Abstands-Änderung bei ±10 % Regler-Änderung (lokale Linearisierung, Idee aus [Q22]) → „hört man kaum“ markieren
  statt Scheingenauigkeit.
- Anzeige für Xander in drei Worten: **sicher / ungefähr / geraten**, Zahl nur auf Nachfrage.

---

## 6. Stufe 3 – Engine-Wahl (VA, MS 2000, FM)

- Kandidaten: VA (`analog`), MS 2000 (`mk`, 2 Oszillatoren wie das Original-Gerät, Speicherwellen, Ring/Sync, 4 Filtertypen), FM (`fm6`,
  beschränkt auf 2–3-OP-Vorlagen). Vor-Wahrscheinlichkeit aus Stufe 1: unharmonisch/Bessel-Muster → FM hoch; Lücken/ungerade Obertöne →
  VA/MS 2000; Speicherwellen-Feinmuster → MS 2000.
- Ablauf: gemeinsames Budget, nach jedem Drittel schwächste Engine raus [Q35]; Wahl nach kleinstem Abstand; liegt der Unterschied unter
  einer Hörschwelle (am Korpus bestimmen), die **einfachere** bzw. vom Nutzer gewählte Engine. Ein Engine-Ensemble mit Auswahl schlägt
  nachweislich eine einzige große Engine [Q18].
- Rückfall: bleibt der beste Abstand über der Schwelle → „Original als Instrument verwenden“ (Klangkorn) anbieten; so bekommt Xander
  entweder einen nachgebauten oder den echten Klang.
- Später (wenn Korpus da): kleiner Klassifikator für die Engine-Vorwahl aus dem Merkmalvektor [Q18].

---

## 7. Neuronale Wege, GPU – lohnt das? (Profi-Vergleich)

- Profis/Forschung: CNN/LSTM/Transformer schätzen Regler in Millisekunden [Q5][Q6][Q14][Q17]; auf fremden Klängen (andere Geräte,
  Stimme) fallen sie ab und brauchen Feinschliff mit der echten Engine oder Selbst-Überwachung [Q10][Q15][Q16]. Differenzierbare Synths
  brauchen eine zweite, differenzierbare Kopie der Engine und haben Probleme mit Frequenz-Gradienten [Q13][Q23][Q24][Q25].
- Für uns: Modelle mit mehreren MB verschlechtern die Ladezeit (oberste Priorität) und bräuchten Training auf vielen gerenderten
  Klängen. **WebGL/WebGPU bringt hier nichts:** 1-s-Signale, FFT 256–2048, ein paar hundert Renders – das ist CPU-Arbeit; WebGPU gibt es
  in Safari erst ab iOS 26 [Q38], WASM-SIMD seit Safari 16.4 [Q39].
- **Sinnvoller kleiner Schritt (Stufe 4, optional):** ein winziges Netz (MLP, Eingabe = Stufe-1-Merkmalvektor statt Spektrogramm,
  Größe ~50–200 KB [geschätzt]), im Node-Prüfstand auf gerenderten Zufalls-Patches trainiert, nur nachgeladen wenn gebraucht; liefert
  bessere Startwerte → weniger Versuche. Ebenfalls billig: **Nächster-Nachbar in den Werksklängen** (128 Kompakt-Programme + VA-Werksklänge
  bei 3 Tonhöhen als Merkmalvektoren, beim ersten Gebrauch berechnet und im Browser-Speicher gecacht) → Startwert + Satz „klingt am ehesten
  wie Werksklang X“ [Ableitung, Idee Ensemble/Bibliothek Q18]. Die Forschung geht hier in Richtung gemeinsamer Einbettungen von Klang
  und Reglern, um passende Presets direkt zu finden [Q19] – für uns reicht vorerst der Merkmal-Nachbar.

---

## 8. Testmethode

**Korpora** (nur Parameter + Merkmale als JSON speichern, keine WAV-Dateien – Platte hat ~4 GB frei):
- **A – eigene Welt:** je Engine 300–500 Zufalls-Patches aus einer *musikalischen* Verteilung (Cutoff log-gleichverteilt, Zeiten log,
  70 % Säge/Puls …), gerendert mit dem Node-Prüfstand (`render-probe.mjs`-Weg, `nice -n 10`) bei 3 Tonhöhen (C2/C3/C4), 2 Anschlägen,
  1 s Halten + 1 s Release, Effekte aus. Rechenzeit ≈ 0,5 s je Render [INVENTAR §4] → 500 × 6 × 0,5 s ≈ 25 min je Engine [geschätzt].
- **B – über Kreuz:** VA-Patches mit MS 2000 nachbauen und umgekehrt, FM mit VA. Bewertung über die **gemeinsamen** Regler
  (Cutoff, Hüllkurven-Zeiten) = „Partial Parameter Distance“ [Q21].
- **C – echt:** MIDI-gesteuerte Mess-Aufnahmen vom Original-Gerät (§9), optional mit notierten Regler-Werten als Teil-Wahrheit; Stimme
  und andere Instrumente nur mit Hörurteil.
- **Störungen** auf A/B: künstlicher Raum (Hall 0,3–1,5 s), Mikro-Färbung (±6 dB Neigung), Rauschen bei 30/20 dB Abstand, Chorus/Echo an,
  Zweiklänge/Dreiklänge – messen, wie stark die Güte fällt.

**Maße:**
- Hör-Abstand: D1 (Mehrfach-STFT, log), Mel-Cepstral-Abstand, Hüllkurven-dB-Fehler; dazu ein **blinder A/B-Hörtest** mit Xander
  (Paare „Original / Nachbau“, „welcher ist näher“, ~20 Paare) zum Eichen der Gewichte [Q20: Hörurteil ≠ Abstand ≠ Parameterfehler].
- Parameter-Fehler in Hör-Einheiten: Cutoff in Halbtönen, Zeiten als log-Verhältnis, Pegel in dB; Treffer-Quote für Welle, Filtertyp, Engine.
- **Ehrlichkeit der Prozente:** Kalibrierungsfehler (ECE) und Abdeckung der 80-%-Spannen (enthält die Spanne die Wahrheit in ~80 %?) [Q34].
- Zeit und Last auf dem iPhone 12: Median und 95-%-Wert je Nachbau, keine Long Tasks im Haupt-Thread, Speicher.

**Abnahme-Vorschlag** [Vorschlag, am Korpus nachjustieren]: Korpus A: Wellen-Klasse ≥ 90 %, Filtertyp ≥ 80 %, Cutoff-Median ≤ 3 Halbtöne,
Zeiten-Median ≤ 30 %, Engine-Wahl ≥ 85 %; Korpus C: im A/B-Test Nachbau neu besser als 4.78 in ≥ 70 % der Paare; iPhone ≤ 10 s je Note.
Vergleichsmethodik mit konstruierten Zielen nach [Q3], offene Prüf-Bibliothek als Vorbild [Q36].

---

## 9. Was gesteuerte Mess-Aufnahmen bringen

Mit bekanntem Ton, Anschlag und Haltedauer (MIDI-gesteuert, Aufnahme-App mit MIDI, dann WAV-Import) werden Release, Halten,
Tastaturverfolgung und Anschlag→Filter/Pegel **messbar statt geraten**. Vorschlag einer Mess-Folge je Klang [Ableitung]:
- Töne C2, C3, C4, C5 (Tastaturverfolgung), je mit Anschlag 40 und 120 (Anschlagstärke), je 1,5 s halten + 2,5 s Pause (Release, Hall).
- 1 langer Ton 4 s auf C3 (langsames LFO, Schwebung), 1 kurzer Ton 0,15 s (Anschlag/Abfall), 1 s Stille am Anfang (Rauschboden).
- Wenn möglich zweimal: Effekte an / Effekte aus.
- Dauer ≈ 40 s je Klang [geschätzt]; feste Zeitraster, damit die App die Töne ohne Erkennung zuordnet.
Das deckt sich mit dem Befund, dass ein einzelner Ton nicht für die ganze Tastatur reicht (§3, Privat-Datei).
Hinweis: die gleiche Art Aufnahme liefert auch die Speicherwellen (eigenes Paket, alte Anleitung siehe Privat-Datei).

---

## 10. Grenzen und Risiken

- Mehrdeutigkeit bleibt: „klingt gleich“ heißt nicht „gleiche Regler“ → Anzeige als Spanne, Varianten anbieten.
- Kurze Töne: langsame LFOs/Schwebungen (< 0,5 Hz) nicht messbar → „unbestimmt“.
- Starker Hall/Raum, Akkorde, laute Umgebung: Güte sinkt deutlich → Hinweis „besser trocken, einzeln, per Kabel“.
- Speicherwellen-Erkennung ist nur so gut wie die Tabelle (heute Nachzeichnung).
- Laufzeit auf dem iPhone ist geschätzt, nicht gemessen → erste Aufgabe des Bau-Pakets: Render-Zeit im Worker am Gerät messen.

## 11. Vorgeschlagene Pakete (Reihenfolge, ohne Zeitangabe)

1. **KE-A** Messen: Render im Worker + Zeit je Render am iPhone; Kennlinien (EG-Zeit, Cutoff, LFO, Verstimmung ↔ Reglerwert) für VA und MS 2000.
2. **KE-B** Stufe 1 erweitern (Quelle-Filter-Zerlegung, Filtertypen, fc(t), Amp-EG aus tiefen Obertönen, Effekt-/Raum-Erkennung, Speicherwellen-Top-3).
3. **KE-C** Stufe 2: Abstand D1–D4, Teilraum-NM + CMA-ES, Hypothesen-Aussortieren, Zufall fest, Wahrscheinlichkeiten.
4. **KE-D** Stufe 3: Ziel MS 2000 + FM-Vorlagen, Engine-Wahl, Rückfall Klangkorn; Ein-Tipp-Weg vom Take.
5. **KE-E** Prüfkorpus A/B/C + Kalibrierung + A/B-Hörtest; danach optional Stufe 4 (Merkmal-MLP, Werksklang-Nachbar).
Alles Sichtbare (Anzeige der Prozente, neue Knöpfe) vorher im Funk vorschlagen (Regel 3 CLAUDE.md).

---

## Quellen

(Titel mit Produktnamen stehen nur in der Privat-Datei; hier Autoren/Jahr/Ort/Link.)

- [Q1] Horner, Beauchamp, Haken 1993: „Machine Tongues XVI: Genetic Algorithms and Their Application to FM Matching Synthesis“,
  Computer Music Journal 17(4). https://doi.org/10.2307/3680541
- [Q2] Horner 1998: „Nested modulator and feedback FM matching of instrument tones“, IEEE Trans. Speech Audio Proc. 6(4):398–409.
  https://doi.org/10.1109/89.701371
- [Q3] Mitchell, Creasey: „Evolutionary Sound Matching: A Test Methodology and Comparative Study“ (Jahr ~2007 [unbestätigt]).
  https://uwe-repository.worktribe.com/OutputFile/1023391
- [Q4] Heise, Hlatky, Loviscach 2009: „Automatic Cloning of Recorded Sounds by Software Synthesizers“, AES 127th Conv., Paper 7858.
  https://www.aes.org/e-lib/browse.cfm?elib=15053
- [Q5] Yee-King, Fedden, d'Inverno 2018 (Titel → Privat-Datei), IEEE TETCI 2(2):150–159; Ergebnis: bidirektionales LSTM am besten,
  in 25 % der Fälle nahe Treffer; Netz in Millisekunden statt Minuten. https://research.gold.ac.uk/22516
- [Q6] Barkan, Tsiris, Koenigstein, Katz 2019: „InverSynth: Deep Estimation of Synthesizer Parameter Configurations from Audio Signals“,
  IEEE/ACM TASLP 27(12). https://arxiv.org/abs/1812.06349
- [Q7] Esling, Masuda, Bardet, Despres, Chemla-Romeu-Santos 2019/2020: „Universal audio synthesizer control with normalizing flows“ (DAFx 2019)
  / „Flow Synthesizer …“, Applied Sciences 10(1):302. https://arxiv.org/abs/1907.00971 · https://www.mdpi.com/2076-3417/10/1/302
- [Q8] Engel, Hantrakul, Gu, Roberts 2020: „DDSP: Differentiable Digital Signal Processing“, ICLR. https://arxiv.org/abs/2001.04643
- [Q9] Masuda, Saito 2021: „Synthesizer Sound Matching with Differentiable DSP“, ISMIR, S. 428–434.
  https://archives.ismir.net/ismir2021/paper/000053.pdf
- [Q10] Masuda, Saito 2023: „Improving Semi-Supervised Differentiable Synthesizer Sound Matching for Practical Applications“,
  IEEE/ACM TASLP 31:863–875. https://doi.org/10.1109/TASLP.2023.3237161
- [Q11] Masuda, Saito 2021: „Quality Diversity for Synthesizer Sound Matching“, DAFx (Neuheits-Ziel im GA, Menge verschiedener Treffer).
  https://hyakuchiki.github.io/QDSynthWebpage · https://doi.org/10.23919/DAFX51585.2021.9768271
- [Q12] Uzrad, Barkan u. a. 2024 (modularer differenzierbarer Synth, FM + subtraktiv; Titel → Privat-Datei). https://arxiv.org/abs/2401.12570
- [Q13] Caspe, McPherson, Sandler 2022 (differenzierbare 6-OP-FM, ISMIR; spektrale Verluste schwer für FM; Titel → Privat-Datei).
  https://arxiv.org/abs/2208.06169
- [Q14] Chen, Jing, Yuan, Xu, Wu, Zhao 2022: „Sound2Synth: Interpreting Sound via FM Synthesizer Parameters Estimation“, IJCAI.
  https://www.ijcai.org/proceedings/2022/682
- [Q15] Shin, Lee 2025: „SynthRL: Cross-domain Synthesizer Sound Matching via Reinforcement Learning“, IJCAI (Belohnung = Klang-Ähnlichkeit,
  ohne Parameter-Wahrheit, auch für fremde Klänge). https://www.ijcai.org/proceedings/2025/1129
- [Q16] Barkan u. a. 2023: „InverSynth II: Sound Matching via Self-Supervised Synthesizer-Proxy and Inference-Time Finetuning“, ISMIR.
  https://archives.ismir.net/ismir2023/paper/000076.pdf
- [Q17] Bruford, Blang, Nercessian 2024: „Synthesizer Sound Matching Using Audio Spectrogram Transformers“, DAFx (16 Parameter; auch
  Stimm-Imitationen getestet). https://arxiv.org/abs/2407.16643
- [Q18] Roma 2024: „Sound Matching Using Synthesizer Ensembles“, DAFx (Klassifikator wählt Synth + Programmierer; Ensemble besser als
  eine integrierte Engine). https://repository.uwl.ac.uk/id/eprint/12230/
- [Q19] Braun, Finkelstein 2026: „FM Synthesizer Audio-Parameter Shared Embeddings“, DAFx. https://www.dafx.de/paper-archive/2026/papers/DAFx26_paper_33.pdf
- [Q20] Salimi u. a. 2025: „Evaluating Sound Similarity Metrics for Differentiable, Iterative Sound-Matching“ (16 Kombinationen; kein Verlust
  überall optimal; DTW-Hüllkurve teils besser; Parameter-/Spektral-/Hör-Maße nur mäßig einig). https://arxiv.org/abs/2506.22628
- [Q21] Salimi, Penner, Eng, Hindle, Zaïane 2026: „Evaluating Loss Functions in Differentiable Out-of-Domain Sound-Matching with Partial
  Parameter Distance“. https://arxiv.org/abs/2608.27698
- [Q22] Han, Lostanlen, Lagrange 2023/2024: „Perceptual-Neural-Physical Sound Matching“ (ICASSP) / „Learning to Solve Inverse Problems for
  Perceptual Sound Matching“ (IEEE TASLP). https://arxiv.org/abs/2301.02886 · https://arxiv.org/abs/2311.14213
- [Q23] Turian, Henry 2020: „I'm Sorry for Your Loss: Spectrally-Based Audio Distances Are Bad at Pitch“. https://arxiv.org/abs/2012.04572
- [Q24] Hayes, Saitis, Fazekas 2023: „Sinusoidal Frequency Estimation by Gradient Descent“, ICASSP. https://arxiv.org/abs/2210.14476
- [Q25] Hayes, Shier, Fazekas, McPherson, Saitis 2024: „A review of differentiable digital signal processing for music and speech synthesis“,
  Frontiers in Signal Processing. https://doi.org/10.3389/frsip.2023.1284100
- [Q26] Yamamoto, Song, Kim 2020: „Parallel WaveGAN …“ (Mehrfach-STFT-Verlust), ICASSP. https://arxiv.org/abs/1910.11480
- [Q27] Hansen 2016: „The CMA Evolution Strategy: A Tutorial“. https://arxiv.org/abs/1604.00772
- [Q28] Peeters, Giordano, Susini, Misdariis, McAdams 2011: „The Timbre Toolbox: Extracting audio descriptors from musical signals“,
  JASA 130:2902–2916. https://www.mcgill.ca/mpcl/files/mpcl/peeters_2011_jasa.pdf
- [Q29] Mauch, Dixon 2014: „pYIN: A Fundamental Frequency Estimator Using Probabilistic Threshold Distributions“, ICASSP.
  https://code.soundsoftware.ac.uk/projects/pyin
- [Q30] Boersma 1993: „Accurate short-term analysis of the fundamental frequency and the harmonics-to-noise ratio of a sampled sound“,
  Proc. Inst. Phonetic Sciences 17:97–110. https://www.fon.hum.uva.nl/paul/papers/Proceedings_1993.pdf
- [Q31] Röbel, Rodet 2005: „Efficient Spectral Envelope Estimation and Its Application to Pitch Shifting and Envelope Preservation“, DAFx.
  https://dafx.de/paper-archive/details/EDSTSaO17Gd_0LV03iwDfw
- [Q32] Chowning 1973: „The Synthesis of Complex Audio Spectra by Means of Frequency Modulation“, JAES 21(7):526–534.
  https://web.eecs.umich.edu/~fessler/course/100/misc/chowning-73-tso.pdf
- [Q33] Csilléry, Blum, Gaggiotti, François 2010: „Approximate Bayesian Computation (ABC) in practice“, Trends Ecol. Evol. 25(7):410–418.
  https://doi.org/10.1016/j.tree.2010.04.001
- [Q34] Guo, Pleiss, Sun, Weinberger 2017: „On Calibration of Modern Neural Networks“, ICML (Temperatur-Skalierung).
  https://proceedings.mlr.press/v70/guo17a
- [Q35] Jamieson, Talwalkar 2016: „Non-stochastic Best Arm Identification and Hyperparameter Optimization“, AISTATS (successive halving).
  https://proceedings.mlr.press/v51/jamieson16.html
- [Q36] Shier, Tzanetakis, McNally 2020: SpiegeLib (offene Bibliothek für automatische Synth-Programmierung, MFCC-Bewertung, GA/NSGA,
  Hörtest-Werkzeug), AES 148. https://www.aes.org/e-lib/browse.cfm?elib=20794 · https://pypi.org/project/spiegelib
- [Q37a] Effekt-Parameter per CNN (Gitarre; Fehler < 0,05 für Chorus/Phaser/Hall/Verzerrung), EURASIP J. Audio Speech Music Proc. 2022
  [Titel nicht geprüft]. https://asmp-eurasipjournals.springeropen.com/articles/10.1186/s13636-022-00257-4
- [Q37b] „Audio effect chain estimation and dry signal recovery from multi-effect-processed musical signals“, DAFx 2024.
  https://dafx.de/paper-archive/2024/papers/DAFx24_paper_53.pdf
- [Q37c] DiffVox 2025 (differenzierbare Gesangs-Effekte; Raum-Effekte wichtig für den Abgleich). https://arxiv.org/abs/2504.14735
- [Q38] WebGPU in Safari ab iOS 26: https://web.dev/blog/webgpu-supported-major-browsers · iOS 26 auf iPhone 12:
  https://www.macrumors.com/2025/06/10/ios-26-compatible-iphones-list
- [Q39] WebAssembly-SIMD in Safari/iOS 16.4: https://web-platform-dx.github.io/web-features-explorer/features/wasm-simd
- [Q40] ONNX Runtime Web (WASM sicher, WebGPU auf iOS uneinheitlich dokumentiert): https://onnxruntime.ai/docs/get-started/with-javascript/web.html
- [Q41] Web MIDI in Safari nicht vorhanden: https://caniuse.com/midi · https://bugs.webkit.org/show_bug.cgi?id=107250
- [Q43] Nelder, Mead 1965: „A simplex method for function minimization“, Computer Journal 7(4):308–313 [nicht online geprüft].
  https://doi.org/10.1093/comjnl/7.4.308
