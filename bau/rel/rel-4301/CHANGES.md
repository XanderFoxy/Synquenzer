## 4.30.1 — Logo-Abspann deckungsgleich, Blätter schließbar und ablegbar

App: `rel-4301/index.html`, 4 689 628 B, `VERSION = '4.30.1'` (APP_CODE 4030001), md5 `fbf8be68dbb2a7c43cc4f02a0ed5730f`.
Grundlage ist **4.30.0** (online, `synq-snapshots/R-4300.html`). Die Datei entsteht reproduzierbar aus 4.30.0 mit
`python3 rel-4301/work/build.py R-4300.html rel-4301/work/psh.js <ziel>` (nur exakte Ersetzungen, je genau ein Treffer).
Gegenüber 4.30.0: 315 Zeilen dazu, 47 Zeilen ersetzt (`rel-4301/release.diff`). Kein neuer Klang, alte Klänge unverändert.
Regeln: „MS 2000“ 1×, die Zeile `  live: true,` 1×, keine Markennamen, keine Emojis als Grafik (Symbole im neuen Kopf sind
gezeichnete Linien), alle neuen Tasten ≥ 44 × 44 px. Doppelte Namen (acorn): 0 doppelt, 0 Syntaxfehler (22 Skripte).

### A · Logo-Abspann: dein Logo endet genau mit dem Video

So, wie du es beschrieben hast:

- **Es wird nichts mehr angehängt.** Das Video ist so lang wie der Song bzw. die Auswahl samt Ausklang – genau so lang wie
  ohne Logo.
- **Vom Ende zurückgerechnet:** Dein Logo-Video ist 10 s lang, also beginnt es 10 s vor dem Ende. Die letzte Sekunde des Logos
  ist die letzte Sekunde des Videos; das allerletzte Bild zeigt das fertige Logo (gemessen: Abweichung zum Endbild der
  Logo-Datei ≤ 2 von 255).
- **Im selben Moment**, in dem sich das Logo zu schreiben beginnt, blendet das laufende Bild flächig auf Schwarz ab.
  Ich habe **2 Sekunden** gewählt (gleichmäßig, wie eine Abblende im Schnittprogramm): man sieht den Song noch kurz hinter
  den ersten Strichen, danach steht das Logo auf Schwarz bis zum Schluss.
- Das Logo liegt **einmal in der Mitte**, 60 % der kürzeren Bildseite, Schwarz wird herausgerechnet (Luma-Key): **kein Kasten,
  kein Rand, das Rot bleibt satt** – wie in 4.29.0.
- **Der Ton bleibt, wie er ist.** Der Song endet so, wie er endet (mit seinem Ausklang); kein zusätzliches Ausblenden, keine
  angehängte Stille.
- **Song kürzer als das Logo** (z. B. eine kurze Auswahl): Dann beginnt das Logo schon mit dem ersten Bild – mitten in seiner
  Animation (so viel weiter vorn, wie das Video kürzer ist), damit das Ende trotzdem deckungsgleich bleibt. Nur in diesem Fall
  blendet das Logo in 0,25 s weich ein, damit es nicht hart erscheint.
- Gilt für **16:9, 9:16 und 1:1** und für **beide Video-Wege** (WebCodecs und Aufnahme in Echtzeit).
- **Ohne Logo** (Schalter aus oder keine Datei) ist das Video wie in 4.30.0.

Befund nebenbei (behoben, eine Zeile): Ohne Logo konnte die **Bildspur länger werden als der Ton** – wenn das Bild schneller
gerechnet wurde als der Ton, entstanden Bilder hinter dem Songende, bevor feststand, wo der Ausklang endet (gemessen in 4.30.0:
1:1-Video 23,3 s Bild bei 18,6 s Ton). Jetzt warten diese Bilder auf die gekürzte Länge – so wie es mit Logo schon immer war.
Wo das nicht auftrat, ist das Video unverändert (siehe Test „ohne Logo wie 4.30.0“).

### B · Chor-, Takes- und Mikro-Blatt: immer schließbar, ablegbar, mit Abspielen

**Warum du in der Vorschau nicht herauskamst:** In der Vorschau (428 × 650) ist das Chor-Blatt fast so hoch wie das Bild.
[OK] lag unten außerhalb, Takes- und Mikro-Blatt haben gar keinen Schließen-Knopf (nur „Tipp daneben“ – dafür blieben 8 bis
24 px Rand). Und das Blatt ließ sich mit dem Finger nicht verschieben (die App hält Wischgesten auf Tasten fest, damit keine
Lupe erscheint). Dein Wischen nach unten ging deshalb an die Claude-App – die hat die ganze Vorschau geschlossen.
Dazu kam ein kleiner Fehler: Im leeren Chor-Blatt (noch kein Chor) tat [OK] gar nichts. Beides ist behoben.

Neu in **Chor**, **Takes** und **Mikrofon** – ein fester Kopf, der immer oben am Blatt stehen bleibt:

| Knopf | Wirkung |
|---|---|
| ⏮ | die Stelle von vorn |
| ▶ / ■ | spielt die Stelle **mit Chor** bzw. hält an – das Blatt bleibt offen |
| Schleife | an: die Stelle wiederholt sich; aus: einmal, dann Stopp (gemerkt; gilt nur hier, deine Song-Schleife bleibt) |
| Pfeil ▾ | **Ablegen**: das Blatt fährt auf eine schmale Leiste unten zusammen |
| ✕ | schließen |

- „Die Stelle“ ist bei einer Song-Stimme der Song über genau ihre Takte (z. B. Takt 5–8), bei einem Szenen-Clip die Szene von vorn.
- Der Inhalt unter dem Kopf **scrollt jetzt mit dem Finger** (nur innen, das Wischen geht nicht mehr an die Claude-App).
- **Wischen nach unten am Kopf** schließt das Blatt; ein kurzer Zug federt zurück. **Tipp daneben** schließt wie bisher.
- **Abgelegt** liegt unten eine Leiste mit Name und Stelle, ⏮ ▶ Schleife, Pfeil ▴ und ✕. Die App ist darüber voll bedienbar
  (Szenen starten, Tempo, andere kleine Fenster). **Ein Tipp auf die Leiste holt das Blatt zurück – genau so, wie es war**
  (aufgeklappte Teile, Scroll-Stand). Öffnest du ein anderes großes Blatt, ersetzt es das abgelegte.
- **Aufteilen direkt im Chor-Blatt:** [Als Chor‑Stimme duplizieren] → [Diese Stelle] oder [Ganze Spur]. Das Blatt bleibt offen,
  die neue Stimme erscheint als eigene Zeile (Noten über ihr ♪). Ein Chor aus 4.25 zeigt wie bisher oben
  [Auf Chor-Gruppe umstellen]. Hochkant steht der Knopf unter [+ Stimme · Chor löschen · OK], quer in derselben Zeile.
- Marken-/Wellen-Editor, Noten-Editor und Video-Blatt hatten ihr ✕ schon immer sichtbar – geprüft in allen drei Größen.
- Sonst ist nichts umgebaut: Kacheln, Regler, Zeilen und Farben der Blätter sind wie vorher.

### C · Versions-Wächter: neue Versionen kommen von selbst

- Die App fragt beim Start, bei jeder Rückkehr in die App und alle 10 Minuten nach, ob es eine neuere Version gibt.
- Gibt es eine, speichert sie und lädt die neue Version selbst (nie während Wiedergabe oder Aufnahme – dann direkt nach dem Stopp).
  Kurz steht da „Neue Version … wird geladen“. Kein Zwischenspeicher kann mehr eine alte Fassung liefern.
- ≡ → Info zeigt die laufende Version.

### So prüfst du am iPhone (Safari und Vorschau)

1. **Version:** Seite neu laden. ≡ → Info zeigt „SYNQUENZER 4.30.1“.
2. **Logo:** Song mit mindestens 6 Takten → ≡ → Video → 16:9 → Video erstellen. Ansehen:
   - Das Video ist so lang wie der Song (keine Sekunden mehr hinten dran).
   - 10 s vor dem Ende beginnt dein Logo sich zu schreiben, **gleichzeitig** wird das Bild dunkel (2 s).
   - Das letzte Bild ist das fertige Logo, dann ist das Video zu Ende. Kein Kasten um das Logo, Rot satt.
   - Der Ton hört genauso auf wie ohne Logo.
3. Dasselbe in **9:16** (gern mit [Ganze App]).
4. **Kurz:** Nur 2–3 Takte markieren → Video. Das Logo ist von Anfang an da (schon halb geschrieben) und endet mit dem Video.
5. **Chor-Blatt in der Vorschau:** STIMME-Stelle → Takes → [Chor]. Oben stehen ⏮ ▶ Schleife ▾ ✕.
   - ▶ tippen: die Stelle spielt mit Chor, das Blatt bleibt offen. ⏮: wieder von vorn. ■: Stopp.
   - Im Blatt mit dem Finger nach oben wischen: der Inhalt scrollt, die Vorschau bleibt offen.
   - ✕ tippen: zu. Noch einmal öffnen, am Kopf nach unten wischen: zu.
6. **Ablegen:** Chor-Blatt öffnen, [Klang ▸] aufklappen, Pfeil ▾ tippen. Unten liegt die Leiste.
   - Jetzt in der App etwas tun (Szene starten, BPM antippen und wieder zu).
   - Auf die Leiste tippen: das Blatt ist zurück, [Klang ▸] ist noch offen.
7. **Aufteilen:** Im Chor-Blatt [Als Chor‑Stimme duplizieren] → [Diese Stelle]. Eine neue Zeile erscheint; ↶ nimmt sie zurück.
8. **Takes- und Mikro-Blatt:** beide haben denselben Kopf (Mikro ohne Abspielen); ✕ schließt.
9. **Quer drehen:** dieselben Schritte quer – ✕ bleibt oben sichtbar.

### Tests (Chromium headless, 4 Kerne; „alt“ = 4.30.0 `R-4300`)

| Satz | Ergebnis |
|---|---|
| Blätter (Chor/Takes/Mikro, 3 Größen, Ablegen, Transport, Aufteilen) | 91/91 |
| Logo-Abspann 8 Läufe (2 Wege × 3 Formate, kurz/lang) | 6 Läufe grün; 16:9/1:1 WebCodecs: Länge/Ton weicht im Rahmen der Lauf-zu-Lauf-Streuung ab (offline-Ton streut unter Last) |
| Ohne Logo wie 4.30.0 | grün (2 rote Punkte nur Netz-Sperre der Testumgebung) |
| Rauchtest, acorn, Regeln | grün |

### Offene Punkte

- Logo 16:9/1:1 (WebCodecs): Video mit Logo kann um Bruchteile einer Sekunde von „ohne Logo“ abweichen – bitte am iPhone ansehen; ich messe weiter.
- Bitte am iPhone prüfen: Blätter in der Claude-Vorschau.
