# VR1 – Video-Regie mit Ereigniserkennung, „Im Video“ am Clip, nichts Erfundenes, Klavier steigt auf

## 1. Für Xander
- **Klavier im Video:** Die Noten steigen jetzt nach oben. Sie starten beim Anschlag an der Taste, wachsen, solange der Ton klingt, und lösen sich oben in leuchtende Funken auf. Ausprobieren: Video → Bild **Auto**, oder Regie-Zeile im Teil → **Klavier**.
- **Die Regie erkennt, was im Song passiert:** Spur setzt ein (z. B. Gegenmelodie), Gesang beginnt, Fill, Klangfahrt ◆, Teilwechsel, Drop, Spur setzt aus. Danach schneidet sie. Video → Zeile **Bild** → **Regeln**: je Ereignis an/aus, welche Ansicht, mit ▲▼ die Reihenfolge (oben = Vorrang). „Standard“ setzt alles zurück.
- **Im Clip festlegen, was das Video zeigt:** Clip lange halten → **Im Video · Auto** → Auto, Gerät, Klavier, Mäusekino, Noten oder aus. Gilt überall, wo der Clip spielt. Deine Regie-Zeile im Teil oder in der Marke geht weiter vor.
- **Nichts Erfundenes:** Reglerbewegungen siehst du nur noch im echten Gerät: das Editor-Blatt des Synths (Reiter, Seite, alle Regler) mit Rahmen um den Regler, der sich bewegt, oder die Original-Platte (hochkant mit Nahaufnahme am Regler). Neue Regie-Ansicht **Spur … → Gerät**.

## 2. Technik
Neuer Block `/* VR1-BEGIN … VR1-END */` direkt nach `VK3-END`. Dazu Einhänge-Zeilen, jeweils mit `VR1` im Kommentar:
- `normClip`: `out.vid` (am Ende, nur die 5 erlaubten Werte; geprüft wird über ein Literal, weil `normClip` schon beim Laden der Seite läuft, bevor `VR1_VID` existiert). `cleanClip`: `o.vid` (am Ende).
- `vvCuts`: `const VR1X = vr1Ctx(song, A, B)` und nach `const he = …` die Zeile `want = vr1Want(VR1X, x, want, cur, rem, pend, ch, enters)`.
- `vv4Pic`: `'geraet'` → `vr1DrawGer`. `vv4Shot`: `what === 'geraet'` → `vr1GerIn`. `vv4ModIn`: `else if (VR1.ed) kh = vr1ModEd(…)`, damit die Regler nie mehr allein stehen.
- `vvkDraw`: erste Zeile `if (VR1K.up) return vr1Klav(…)`. `vvkLayout` (**VR1-fix**): Die Cache-Zeile `let c = VVK.lay.get(g) …` stand seit VK3 im Kommentar. Dadurch wurden Tastatur-Bild und Verläufe für jedes Bild neu gebaut, und `c` war eine versehentlich globale Variable. Jetzt steht sie auf einer eigenen Zeile.
- `vv4Pick`: Bei „Spur …“ gibt es zusätzlich `['geraet', 'Gerät']`. `vvDirRow`: Die Taste „Spur …“ leuchtet auch bei `geraet`.
- `openClipSheet`: `vr1ClipBtn(…)` in `.cgrid` (nach ◆ Klang). `openCellSheet`: Bei eigenen Clips gibt es `vr1OwnOpt` und den Tipp `vr1vid`.
- `vvOpen`: `vr1VvBtn(segV)` setzt [Regeln] ans Ende der Zeile „Bild“. Ist die Zeile zu schmal (320 px), kommt die Taste ans Ende der Zeile „Format“ (`vr1VvPlace`, auch bei `resize`).
- Test-API: am Ende `Object.assign(SYNQUENZER, vr1Api())`. Enthält `vr1Events`, `vr1Rules`, `vr1RulesSet`, `vr1Cuts`, `vr1SetVid`, `vr1Vid`, `vr1SetOwnVid`, `vr1RulesOpen`, `vr1Pic`, `vr1Klav`, `vr1KlavMs`.

Der Block selbst:
- **Ereignisse:** `vr1Events(song, A, B)` liefert `[{x, ev:[{k, t, why, fresh}]}]`.
  - `teil`: Teilanfang und Bereichsanfang.
  - `drop`: Marke mit dem Namen „Drop“, oder Drums setzen nach Pause zusammen mit mindestens einer weiteren Spur ein.
  - `gesang`: Die STIMME-Spur setzt ein, oder `song.vox` beginnt.
  - `fill`: Übergang aus `song.ue` (`vv4UeWin`), oder ein Drum-Clip von höchstens 1 Takt nach mindestens 2 Takten desselben Clips, vor demselben Clip, vor Stille oder vor einem Teilanfang.
  - `morph`: ◆-Zustand wechselt, Clip mit Kurven oder Locks beginnt, oder eine Fahrt `song.sr` beginnt.
  - `ein`: eine Spur setzt ein. Setzen 2 oder mehr ein, wird ein Ereignis ohne Spur daraus (Matrix).
  - `neu`: Ein Clip spielt zum ersten Mal auf einer laufenden Spur.
  - `aus`: zählt nur für die Spur, die gerade im Bild ist.
  - `xp`: `vv4Xp`.
  - In Takt 0 gibt es nur `teil`.
- **Regeln:** Gespeichert in `uiPrefs().vr1 = {r:[{k, on, v}]}` als Geräteprofil, wie Format/Bild/Kamera. Vorgabe-Reihenfolge:

  | Ereignis | Ansicht |
  |---|---|
  | drop | Matrix |
  | gesang | Spur |
  | fill | Noten |
  | ein | Spur |
  | neu | Spur |
  | teil | App |
  | morph | Mäusekino |
  | xp | Tastatur |
  | aus | Song |

  „Spur“ heißt: ein Clip, der zum ersten Mal spielt, bekommt Zelle und dann Piano-Roll (wie VV4-D). Drums zeigen den Drum-Sequenzer, STIMME die Welle. `teil` mit App bleibt wie VV4-D: steht das Bild schon auf App, Matrix oder Spur; jeder zweite Teil mit Song-Melodie zeigt Klavier.
- **Auswahl in `vr1Want`:**
  1. Manuelle Regie geht vor.
  2. Unter den Ereignissen gewinnt das mit dem höchsten Vorrang. Ausnahmen: Regel aus, Clip „aus“, oder das Ereignis ist schon im Bild.
  3. Was wegen der 2-Takt-Grenze nicht geschnitten werden kann, wartet höchstens 2 Takte, solange sein Clip läuft.
  4. Ein Fill von 1 Takt direkt vor einem Teilanfang beginnt einen Takt früher (`fill-vor`), damit der Teilanfang ein Schnitt bleibt.
  5. Ohne Ereignis gilt die alte Regie, außer ihr Grund gehört zu einer ausgeschalteten Regel (`VR1_WHY`).
  6. „Im Video“ am Clip gilt für jedes Bild dieser Spur.
- **Datenfelder** (alle nur dazu, Format bleibt):
  - `clip.vid` hat einen von 5 Werten: `geraet`, `klav`, `kino`, `noten`, `aus`. Fehlt der Eintrag, gilt Auto. Gilt für Szenen-Clips und eigene Clips (`song.own`). Kopieren, Einfügen, Duplizieren und Undo nehmen ihn mit.
  - `song.video` kennt den neuen Wert `'geraet'` mit Spur `t`. `VV_DIRV`, `VV4_OWN`, `VV4_TRK` und `VV4_NAME` sind dafür ergänzt.
- **Gerät/Editor:**
  - `vr1EdIn` zeichnet das Editor-Blatt der App:
    - Reiter OSZ/WT/FM · FILTER · HÜLLK. · LFO · MOD · FX und die Unter-Reiter aus `subTabsFor`.
    - Seiten (`VR1_PG`): Filter, Osz 1–3, Mix (Fader), Stimme, Makro, FX/Spur.
    - Regler über `vv4Knob`, Werte mit ◆-Gleiten (`vk2Src`/`vk2V`), Mod-Ringe aus `vv4Knobs`.
    - Fokus-Rahmen wie `.k1hl`.
    - Die Seite kommt aus den ◆-Schlüsseln des Clips, sonst aus den echten Modulationen, sonst Filter.
  - `vr1GerIn`:
    - STIMME → Welle, Drums → Drum-Sequenzer.
    - Platte: mit Modulation Platte und Mod-Übersicht; ohne Modulation `vr1PlateIn` (quer die ganze Platte, hochkant die ganze Platte und eine 2,4-fache Nahaufnahme am gleitenden Regler oder an CUTOFF, mit Rahmen).
    - VA/FM/WT → Editor-Blatt.
    - Bit Mask, Perkussion und fremde Klänge → Piano-Roll.
- **Klavier:**
  - `vr1Gather` holt die Noten bis jetzt. `vr1Klav` zeichnet:
    - Hintergrund mit violettem Dunst und Oktav-Linien, als ein Bild je Layout.
    - Takt-Raster und Teil-Namen steigen mit.
    - Balken mit weichem Glühen und Anschlag-Farbe (`vvkCol` wie VK3), heller Kante am Anschlag und heißem Fuß direkt nach dem Anschlag.
    - Oben 30 % Auflöse-Zone mit Verlauf. Funken bilden sich in festen Zeitabständen von 55 ms ab Notenbeginn, mit Samen aus Spur, Note und Start (`vr1H`/`vr1R`). Höchstens 900 Funken je Bild.
    - Beim Anschlag fliegen Funken von der Taste.
    - Ein Lichtsteg verbindet klingende Note und Taste. Die Drum-Leiste bleibt (Namen liegen oben drauf), ebenso Jetzt-Linie und Kopf.
  - `vvkWait` ist unverändert: Das Video wartet weiter, bis die Noten gerechnet sind, deshalb bleibt es deterministisch.
- **CSS:** `#vr1css` wird aus dem Block angelegt (`.vr1vp`, `.vr1cb`, `.vr1rb`, `.vr1rp`, `.vr1rl`, `.vr1r`, `.vr1on`, `.vr1n`, `.vr1v`, `.vr1m`, `.vr1vw`, `.vr1ft`).

## 3. Tests
Testskript: `vr1-test.mjs` (Playwright, 428×926 und 926×428). Ergebnis: **43/43 PASS**. Rohdaten in `vr1-test.json`.

- **Ereignisliste** im Test-Song (24 Takte):

  | Takt | Ereignis |
  |---|---|
  | 1 | Teil |
  | 3 | Akkorde setzen ein |
  | 5 | Gesang (zusammen mit Teil) |
  | 9 | Gegenmelodie setzt ein |
  | 11 | STIMME setzt aus |
  | 12 | Fill (kurzer Drum-Clip) |
  | 13 | Teil + Synth 4 setzt ein |
  | 15 | Klangfahrt ◆ + neuer Clip |
  | 17 | Teil + 4× aus |
  | 19 | Drop (Name) + mehrere setzen ein |
  | 23 | Teil |

  Die Liste ist deterministisch.
- **Auto-Schnitte:**

  | Takte | Bild |
  |---|---|
  | 1–2 | App |
  | 3–4 | Akkorde (Roll) |
  | 5–6 | STIMME-Welle |
  | 7–8 | Bass (Roll; die alte „neu“-Wartezeile von Takt 1) |
  | 9–10 | Gegenmelodie (Zelle → Roll) |
  | 11–12 | Drum-Sequenzer (Fill einen Takt früher) |
  | 13–14 | Synth 4 |
  | 15–16 | Mäusekino |
  | 17–18 | App |
  | 19–22 | Matrix |
  | 23–24 | App |

  Alle Schnitte haben 2 bis 8 Takte. Die Liste ist deterministisch.
- **Regeln, „Im Video“ und Daten:**
  - Regel aus, Regel-Ansicht ändern und Reihenfolge wirken. „Standard“ bringt dieselbe Liste zurück.
  - Clip auf Klavier oder aus wirkt.
  - Speichern → Laden ist deep-equal. Ausnahme: die Prüfsumme `sum`, die sich mit einem STIMME-Take auch in 4.42.0 ändert (nachgeprüft).
  - Undo/Redo ist je ein Schritt. Kopieren, Einfügen und Duplizieren nehmen „Im Video“ mit.
  - Manuelle Regie geht vor. Gerät ist in der Regie-Zeile setzbar.
- **Bilder** (Ordner `stills/`):
  - `klavier-16x9.png`, `klavier-9x16.png`: Noten steigen, Funken, klingende Noten enden an der Jetzt-Linie. Zwei Aufrufe ergeben dasselbe Bild.
  - `geraet-9x16-synth4-klangfahrt.png`: Filterseite, Fokus auf CUTOFF während der ◆-Fahrt.
  - `modulation-16x9-synth1.png`: Editor-Blatt und Mod-Übersicht, kein Einzel-Regler.
  - `geraet-9x16-platte.png`, `geraet-16x9-platte.png`: Platte mit Nahaufnahme.
  - Alle 8 Editor-Seiten zeichnen in 9:16 und 16:9 ohne Fehler.
- **Leistung** (1080 px, Desktop-Chromium):

  | Ansicht | 9:16 | 16:9 |
  |---|---|---|
  | Klavier steigend | 5–8 ms | 5–8 ms |
  | Alte fallende Ansicht mit Cache-Fix | 2,4 ms | 2,4 ms |
  | 4.42.0 fallend ohne Fix | 7,4 ms | 10,5 ms |

  Die neue Ansicht ist also nicht langsamer als 4.42.0.
- **Bedienung:**
  - Clip-Blatt: Taste „Im Video“ hat 44 px, das Blatt läuft nicht über, das ✕ ist sichtbar. Die Auswahl hat 6 Tasten, jede mindestens 44 px. Hochkant und quer geprüft.
  - [Regeln]: 51×44 px, ohne Überlauf in 926/844/667 quer und 428/390/375 hochkant. Bei 320 px steht die Taste in der Zeile „Format“.
  - Regel-Blatt: 9 Zeilen, Tasten mindestens 44 px. Es beginnt unter dem Kopf, das ✕ bleibt frei (quer scrollt die Liste).
  - Der Video-Streifen im Song liegt auf der Song-Fläche; die Trefferprüfung ergibt die Canvas.
  - Fotos: `foto-hochkant-clip-im-video.png`, `foto-quer-clip-im-video.png`, `foto-hochkant-regie-regeln.png`, `foto-quer-regie-regeln.png`.
- **Video-Render** (WebCodecs):
  - Takt 11–16 in 9:16 und 16:9, je 15,5 s, Schnitte: Fill → Synth 4 → Mäusekino.
  - Klavier-Video Takt 13–14 (9:16), Einzelbilder per ffmpeg (`stills/video-*.png`, `stills/*.mp4`).
- **Pflichtprüfungen:**
  - `topdefs`: 0 Syntaxfehler, 0 doppelt (5001 Namen).
  - Smoke: `errors []`.
  - Markenwörter 0, `MS 2000` genau 1, `^  live: true,` genau 1.

## 4. Offen / Risiken
- **Alte Test-Erwartungen, die sich bewusst ändern:**
  - VK3: Die Klavier-Noten fallen nicht mehr. `VVK.probe` hat jetzt `rise`, `yD`, `top` und `sparks`; `rows[].y` ist die Oberkante des steigenden Balkens. Ein Test, der fallende Geometrie prüft, muss angepasst werden.
  - VV4-E (`mod`) zeichnet bei VA/FM/WT keine Einzel-Regler mehr. `VV4.probe.mod.knobs` sind jetzt Zellen des Editor-Blatts (key, x, y, w, h, n, mod, mv); modulierte Regler haben weiter lo/hi/dot/c/src.
  - VV4-D (Auto-Regie) hat neue Schnittgründe: `drop`, `gesang`, `fill`, `morph` (→ Mäusekino), `aus` nur für die Spur im Bild. Eine nicht neue, einzeln einsetzende Spur am Teilanfang zeigt jetzt ihre Spur statt der App.
- **Regeln sind Geräteprofil**, nicht Teil des Projekts. Ein anderes Gerät mit anderen Regeln schneidet anders. Wenn Xander will, dass Regeln mit dem Song gespeichert werden: Feld `song.vr1` nachrüsten.
- **Gesang/Text:** Für Gesang zeigt die Regie die STIMME-Welle. Eine Songtext-Ansicht gibt es im Video noch nicht, darum habe ich keine erfunden. Gesang nur als Punch (`song.vox` ohne Clip) zeigt die App.
- **Gerät:** Bit Mask, North/Perkussion und fremde Klänge haben noch kein Video-Bild ihres Panels; dort zeigt die Regie die Piano-Roll. Bei der Platte dreht die Nahaufnahme nur Regler mit echter Modulation (wie VV3).
- **Editor-Blatt:** nachgezeichnet nach der App bei 428 und 926 px, nicht per Messung wie bei VV4-A. HÜLLK., LFO und MOD als eigene Seiten fehlen noch; ein Regler von dort fällt auf die Filterseite zurück.
- **Einfache Zuordnung ohne Zeile:** Im Clip-Blatt ist „Im Video“ eine Taste mit Auswahl statt einer eigenen Zeile. Grund: Quer ist das Blatt voll, eine Zeile hätte das Layout verschoben. Die Taste nutzt den freien Platz neben ◆ Klang.
- **Unklarer Satz:** „Man kriegt in den Takt und dann ist da irgendwas drüber“ ist nicht eindeutig. Geprüft habe ich, dass der Video-Streifen nichts verdeckt. Falls Xander etwas anderes meint (z. B. die Bereich-Leiste oder ein Hinweis über der Taktleiste), braucht es ein Foto von ihm.
- **Leistung auf dem iPhone** ist nicht gemessen. Desktop-Chromium: 5–8 ms je 1080p-Bild. Funken höchstens 900 je Bild, mit Ausdünnung (deterministisch).
- **3-Wege-Merge:** VA (Video-Audio) könnte `vvOpen` oder die Test-API-Zeilen berühren. Meine Einhänge-Zeilen dort sind je eine eigene Zeile.
