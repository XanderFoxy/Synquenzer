# SYNQUENZER · Zusammenarbeit und Versionen: Stand der Technik und Modell (r8)

Stand 17.10.2026. Auftrag: fragen-xander-9 (Abschnitt „Zusammenarbeit – Stand der Technik“), fragen-xander-8 (O1–O4).
Baut auf dem Online-Entwurf `v3-ideen/r7/online-schema.sql` auf (Tabellen `spaces`, `projects`, `project_versions`, RPC `save_project`). Diese Datei wurde nur gelesen und nicht geändert. `r7/online.md` gab es zum Zeitpunkt dieser Arbeit noch nicht.
Mockups (390×844, deutsch): `v3-ideen/r8/zusammenarbeit-mockups/m1.png` … `m6.png`, Quelle `mockups.html` im selben Ordner.

**Belegstatus.** BELEGT: Die Quelle sagt es direkt (offizielle Seite, Fachpresse oder eigene Messung). WAHRSCHEINLICH: Drittquelle, Zusammenfassung oder plausibler Schluss. UNBELEGT: kein Beleg gefunden, nur Vermutung. Hinweis zur Methode: Direkte Seitenabrufe (WebFetch/curl) wurden in dieser Sitzung vom Proxy abgelehnt. Belege stammen deshalb aus Suchauszügen (WebSearch), aus der offiziellen Supabase-Dokumentation (Supabase-MCP `search_docs`) und aus eigenen Messungen. Wo nur ein Suchauszug vorlag, steht „(Auszug)“.

---

## 0. Kurzantwort für Xander

- **Überschreiben:** Bei uns kann niemand still den Stand des anderen überschreiben. Jede Speicherung wird eine neue, unveränderliche Version. Der Server nimmt eine Speicherung nur an, wenn sie auf dem neuesten Stand aufbaut. Sonst führt die App beide Stände zusammen, und zwar Clip für Clip.
- **Gleichzeitig arbeiten:** Ihr arbeitet fast gleichzeitig am selben Projekt. Du siehst, wo René gerade ist (oranger Ring am Clip). Seine gespeicherten Änderungen erscheinen bei dir nach 1–3 Sekunden, und zwar am nächsten Taktanfang. Arbeitet ihr an verschiedenen Clips oder Spuren, klappt alles automatisch.
- **Gleicher Clip:** Wollt ihr denselben Clip gleichzeitig ändern, gibt es zuerst einen Hinweis („René arbeitet gerade daran“). Ändert ihr ihn trotzdem beide, erscheint eine Karte mit Probehören. Dort wählst du „Deine“, „Renés“ oder „Beide behalten“. Nichts ist verloren.
- **Abzweigen (wie BandLab-„Fork“):** Aus jeder alten Version machst du einen eigenen Zweig. Das Original bleibt unverändert.
- **Übernehmen:** Einzelne Spuren oder Clips aus Renés Zweig holst du dir mit A/B-Probehören.
- **„die Music“:** unklar. Kandidaten stehen in Abschnitt 3. Bitte kurz sagen, welcher Dienst gemeint war.
- **Empfehlung:** Versionen mit weichen Sperren je Clip (Abschnitt 9), **kein** CRDT. Das ist schneller gebaut, passt zum kostenlosen Supabase-Plan und schließt stilles Überschreiben aus.

---

## 1. Stand der Technik: Musik-Apps

| App | Was es kann | Gleichzeitig? | Versionen / Abzweigen | Status | Beleg |
|---|---|---|---|---|---|
| **BandLab** | Projektseite mit Revisions-Verlauf und Mitwirkenden; Einladung per Projekt-Link | eingeschränkt; Echtzeit-Bearbeitung „wie Google Docs“ hat Grenzen | Revisionen; **Fork** = vollständige Kopie im eigenen Konto, Original bleibt; nur wenn der Ersteller „Allow Forks“ einschaltet; Kennzeichen Ψ | aktiv; keine lokale Kopie, „oft Revisionen speichern“ (Q4); Fork-Wiederveröffentlichung mit Namensnennung (Q6) | Q1 BELEGT (Auszug), Q2 WAHRSCHEINLICH, Q3 BELEGT, Q4 BELEGT, Q5 BELEGT, Q6 WAHRSCHEINLICH |
| **Splice Studio** | DAW-Projekte sichern, synchronisieren, Versionen ansehen; kennt Projekttypen (Spurnamen, Plug-ins) | nein | Versionsliste; zeigte, *dass* es eine Version gibt, nicht *was* sich geändert hat; kein Zusammenführen | **eingestellt 2023** (9.3. keine neuen Mitwirkenden, 7.4. keine neuen Projekte, danach Abschaltung des Syncs; Enddatum 31.5. oder 5.6.2023, die Quellen widersprechen sich) | Q7 BELEGT, Q8 BELEGT, Q9 BELEGT, Q11 WAHRSCHEINLICH |
| **Ohm Studio** | „erste Echtzeit-Kollaborations-DAW“; das ganze Projekt liegt auf den Servern von Ohm Force | ja, Änderungen werden automatisch zu den anderen synchronisiert | Server führt die Versionen; ob es Zweige gab, war schon 2010 offen | seit etwa 2013 keine Updates (Nutzerangaben) | Q12 BELEGT, Q13 BELEGT, Q14 BELEGT, Q15 WAHRSCHEINLICH |
| (Ohm-Technik „Flip“) | C++-Datenmodell für gemeinsames Bearbeiten: transaktional, Undo/Redo im Framework eingebaut, Kern der Ohm-Studio-Zusammenarbeit | – | – | Lizenz über Irisate | Q16 BELEGT |
| **Soundtrap** (Spotify) | Live-Zusammenarbeit (2022 als Beta), Änderungen „ohne Sync-Knopf“, Auto-Speichern; man muss die Funktion vor dem Anlegen des Projekts einschalten | ja | Auto-Speichern; das Verhalten bei Konflikten ist nicht dokumentiert | aktiv; ob noch Beta: UNBELEGT | Q17 BELEGT, Q18 WAHRSCHEINLICH |
| **Endlesss** | „Jams“: Räume mit Chat. Jede eingespielte Schicht ergibt ein neues **Rifff**, also eine Kette von Ständen. Geräte laufen taktgenau synchron. Eigene Ideen bleiben privat, bis man sie schickt | ja (Loop-Jam) | Rifff-Kette = jeder Stand bleibt | **eingestellt Mai 2024**, danach an HabLab (Imogen Heap) übergeben | Q19 BELEGT, Q20 WAHRSCHEINLICH, Q21 BELEGT, Q22 BELEGT |
| **Blend.io** | komplette Projektdateien (nicht nur Stems) anderer laden und remixen; Ableton/Pro Tools | nein | Remix = Kopie | **eingestellt Juni 2024** (Herunterladen bis 4.6.2024) | Q21 BELEGT, Q23 BELEGT |
| **Audiotool** | Browser-DAW; 3.0 (8.7.2026) mit Echtzeit-Multiplayer; Mitmachen per Link; veröffentlichte Tracks lassen sich **forken**, jeder Remix verlinkt das Original | ja | Fork mit Rückverweis; Sync-Technik nicht veröffentlicht | aktiv | Q24 BELEGT, Q25 BELEGT |
| **Avid Pro Tools Cloud Collaboration** | Jede Spur hat eigene Knöpfe für Teilen, Hochladen und Herunterladen. Eine geänderte Spur wird grün markiert, bis sie hochgeladen ist. Höchstens 2 Mitwirkende gleichzeitig | spurweise, nicht live | Revisionen des Projekts | aktuell UNBELEGT | Q26 BELEGT, Q27 BELEGT, Q28 WAHRSCHEINLICH |
| **Ableton Live** | **Ableton Link** synchronisiert nur Schlag, Tempo und Phase im lokalen Netz, keine Noten und keine Projekte | Tempo ja, Inhalt nein | keine Cloud-Zusammenarbeit | aktiv | Q29 BELEGT |
| **Bitwig** | Zusammenarbeit laut Support-Seite „geplant“. **„Bitwig Connect“ ist eine Hardware** (Interface Connect 4/12), keine Zusammenarbeits-Funktion | nein | – | – | Q30 BELEGT, Q31 BELEGT |
| **Kompoz** | Man lädt eine Spur als „Idee“ in fremde Projekte. Der Gründer **nimmt an oder archiviert**; wer angenommen wird, wird Partner | nein | Annehmen statt Überschreiben | aktiv (seit 2007) | Q32 WAHRSCHEINLICH, Q33 BELEGT |
| **Indaba Music** | Online-Zusammenarbeit, Remix-Wettbewerbe (u. a. Peter Gabriel, Linkin Park) | nein | – | Übernahme durch Splice 2018: UNBELEGT | Q34 BELEGT, Q35 UNBELEGT |

**Was wir daraus lernen** (Schlüsse, belegt durch die Zeilen oben):
1. **Abzweigen statt Überschreiben ist Standard.** BandLab (Fork, Original bleibt), Audiotool (Fork mit Rückverweis), Blend (Remix-Kopie), Kompoz (Idee wird angenommen) arbeiten so. Q1, Q2, Q23, Q24, Q32.
2. **Echtzeit-DAWs verraten ihre Konfliktregeln nicht.** Bei Soundtrap, Ohm Studio und Audiotool ist nicht dokumentiert, was bei gleichzeitiger Änderung desselben Clips passiert. Q12, Q17, Q25. Wir müssen es selbst sauber festlegen. WAHRSCHEINLICH.
3. **Spuren als Einheit funktionieren in der Praxis.** Avid lädt je Spur hoch und herunter. Q26.
4. **Taktgenaue Synchronität ist musikalisch wichtig.** Endlesss synchronisiert die Geräte im Takt. Q19, WAHRSCHEINLICH (Auszug).
5. **Cloud-Dienste sterben.** Splice Studio 2023, Endlesss und Blend 2024. Deshalb: alles exportierbar halten, keine Abhängigkeit von Spezial-Servern. Q7, Q21. Der Schluss ist WAHRSCHEINLICH.
6. **Ein Verlauf ohne „was hat sich geändert“ reicht nicht.** Das wurde an Splice Studio kritisiert. Q11 WAHRSCHEINLICH (Meinung). Wir zeigen deshalb je Version, *welche* Spur und welcher Clip sich geändert hat.

## 2. Stand der Technik: allgemein (Dokumente, Design, Code)

| Verfahren | Prinzip | Was passiert bei Gleichzeitigkeit? | Beleg |
|---|---|---|---|
| **Operational Transformation (Google Docs)** | Zentraler Server ordnet die Operationen und transformiert gleichzeitige Operationen gegeneinander. Clients wenden ihre Änderungen sofort lokal an | Einfügungen werden verschoben, sodass alle gleich enden. Bei Strukturen wie Tabellen gilt das Verfahren als schwierig | Q36 WAHRSCHEINLICH (Sekundärquellen), Q37 WAHRSCHEINLICH |
| **Figma Multiplayer** | „kein echtes CRDT“: Der Server bestimmt die Reihenfolge, je **Eigenschaft eines Objekts** gewinnt der letzte Schreiber (LWW) | Ein gleichzeitiger Wert kann verloren gehen (stilles Überschreiben auf Eigenschaftsebene) | Q38 BELEGT (Figma-Blog, über Zusammenfassungen) |
| **Figma Branching** | Zweig aus der Hauptdatei; Prüfen mit Seite-an-Seite-Vergleich; beim Zusammenführen je **Ebene**: Haupt oder Zweig wählen. Alle Konflikte müssen gelöst sein; Teil-Übernahme ist nicht möglich; vor dem Merge ein Sicherungspunkt | Konflikt-Auswahl je Objekt | Q39 BELEGT |
| **Yjs (CRDT)** | Jeder Client hat eine Kopie, Änderungen werden ohne Server-Entscheid zusammengeführt | `Y.Map` bei gleichem Schlüssel: Sieger nach Client-ID, also **nicht** der letzte Schreiber. Verteilte Sperren sind nicht möglich (nur „schließlich konsistent“) | Q40 WAHRSCHEINLICH, Q41 BELEGT |
| **y-supabase** | Yjs-Provider über Supabase Realtime | README: **nicht für den Produktivbetrieb empfohlen**; Bericht über viele Nachrichten ohne Aktivität | Q42 BELEGT, Q43 WAHRSCHEINLICH |
| **Automerge (CRDT)** | wie Yjs | Gleichzeitige Schreibvorgänge auf dieselbe Eigenschaft: Ein Sieger wird willkürlich, aber deterministisch gewählt. **Verlierer bleiben** in `getConflicts` abrufbar | Q44 BELEGT |
| **git** | unveränderliche Commits, Zweige als Zeiger, Merge per 3-Wege-Vergleich | Konflikte zeilenweise; Mensch entscheidet | Q45 WAHRSCHEINLICH (Allgemeinwissen, Seite nicht abgerufen) |

**Schluss für uns:** Für Text sind CRDT und OT stark. Bei Musik ergibt ein „korrektes“ Zusammenführen derselben Noten-Liste aus zwei Händen oft Unsinn, etwa zwei Melodien ineinander verzahnt. UNBELEGT, eigene Einschätzung. Figma zeigt den pragmatischen Weg: Der Server ordnet, und gearbeitet wird je Objekt. Wir ersetzen das stille LWW durch eine sichtbare Wahl wie beim Figma-Branching und bleiben bei der Clip-Einheit.

## 3. „die Music“: Kandidaten (Xander fragen)

Xander sagte „Wie war das damals bei die Music?“. Das „damals“ deutet auf einen früheren oder eingestellten Dienst. Das ist WAHRSCHEINLICH, eine Deutung.

| Kandidat | Warum er passen könnte | Was er bei Versionen und Zusammenarbeit machte |
|---|---|---|
| **Splice (Studio)** | bekanntester „GitHub für Musik“-Ansatz; „damals“ passt, 2023 eingestellt | Versionsverlauf je DAW-Projekt, kein Merge (Q7, Q9, Q10, Q11) |
| **Ohm Studio** | „damals“ die erste Echtzeit-DAW | live, Server-Versionen (Q12–Q14) |
| **Endlesss** | „damals“, 2024 eingestellt; Rifff-Kette = Iterationen, die aufeinander aufbauen | jede Schicht ein neues Rifff (Q19, Q21) |
| **Blend.io** | „damals“, 2024 eingestellt; Projekte anderer weiterbauen | Remix-Kopie mit CC-Lizenz (Q21, Q23) |
| **Indaba Music** | klanglich nah („…ba Music“) | Remix und Zusammenarbeit (Q34) |
| **Soundtrap** | im Diktat-Kontext genannt (fragen-xander-9) | Live-Zusammenarbeit (Q17) |
| **BandLab** | „Bentley“ = BandLab; „die Music“ könnte dasselbe meinen | Fork, Revisionen (Q1, Q3) |

Die Zuordnung ist UNBELEGT. **Frage an Xander (eine Zeile):** „Meintest du mit ‚die Music‘ Splice, Ohm Studio, Endlesss, Blend, Indaba oder etwas anderes?“

---

## 4. Ist-Stand, der das Design bestimmt

- **Projektdatei:** `project.tracks[]` ist ein Array ohne IDs. Jede Spur hat `clips[]`, indiziert nach Szenen-Position (z. B. `[{…}, null, null, null]`). `scenes[]` haben nur `name`. BELEGT, eigene Messung an `r7/online-test/demo.json` und `big.json`.
  → Fügt René eine Szene oder Spur ein, verschieben sich alle Indizes. Für Zusammenführen und Übernehmen braucht jede Spur und jede Szene eine **feste ID** (`uid`), also Format 4. Das ist ein Design-Schluss.
- **Gerätesache vs. Songsache:** `project.settings` mischt Song-Werte (`swing`, `harmony`, Tonart steht in `project.key`) mit Geräte-Vorlieben (`metro`, `metroVol`, `haptics`, `quality`, `buffer`, `coach`, `hintDismissed`, `noteNames`, `kbScale`). Auch `project.ui` (`selT`, `selS`) steckt in der Projektdatei. BELEGT (demo.json).
  → Diese Werte dürfen **nicht** geteilt werden. Sonst springt Renés Auswahl bei Xander um, und das Metronom geht bei beiden an. Sie wandern in eine lokale Geräte-Datei. Design-Schluss.
- **Größen** (eigene Messung, BELEGT):

  | Datei | roh | gzip | Spuren | Clips | Ø Clip roh / gzip | größter Clip | Ø Klang je Spur roh / gzip |
  |---|---|---|---|---|---|---|---|
  | demo.json | 11.872 B | 3.488 B | 5 | 7 | 226 B / 135 B | 338 B | 1.691 B / 777 B |
  | big.json | 258.313 B | 57.025 B | 5 | 20 | 12.403 B / 2.983 B | 20.925 B | 1.691 B / 777 B |

  `big.json` (258 KB) liegt **über** der Broadcast-Nutzlast im Free-Plan (256 KB, Q46 BELEGT). Ganze Projekte per Broadcast zu verschicken, scheidet damit aus. Wer Teile verschickt, bleibt weit darunter.
- **Supabase-Projekt `synquenzer`** (ref dbdnsryoivvezspgydpx): Status ACTIVE_HEALTHY, eu-central-1, Postgres 17; im Schema `public` gibt es noch **keine Tabellen**. BELEGT (Supabase-MCP `get_project` und `list_tables`, 17.10.2026). Das r7-Schema ist also noch nicht eingespielt. Die Änderungen unten lassen sich ohne Datenmigration einarbeiten.
- **r7-Entwurf** (`online-schema.sql`): speichert den ganzen Projekt-Text (`project_data.body`). Eine `auto`-Version legt er höchstens alle 10 Minuten an. Nach 30 Tagen **dünnt er aus** (`private.thin_versions`: je Tag bleibt nur der letzte Stand). Bei einem Konflikt speichert er eine ganze `conflict`-Kopie. BELEGT (Datei gelesen).
  → Das widerspricht „jede Speicherung eine Version, nichts geht verloren“ (fragen-xander-8 O4, Auftrag r8). Die nötigen Änderungen stehen in Abschnitt 8.4.

---

## 5. Begriffe (so heißen sie in der App)

| Begriff | Bedeutung |
|---|---|
| **Version** | ein gespeicherter Stand. Unveränderlich, wird nie gelöscht. Nummer und Autor sind sichtbar. |
| **Teil** | kleinste Einheit für Speichern, Zusammenführen und Übernehmen: *Clip* (Spur × Szene), *Klang* (je Spur), *Spur-Kopf* (Name, Farbe, Stumm, Folgen …), *Song-Spur* (Song-Ablauf je Spur), *Projekt-Kopf* (Tempo, Tonart, Swing, Harmonie, Szenen-Liste, Effekt-Bus). |
| **Zweig** | eine Linie von Versionen. Jedes Projekt hat einen Hauptzweig. **Abzweigen** legt einen neuen an. |
| **Anwesenheit** | wer gerade im Projekt ist und welchen Teil er offen hat (oranger Ring). |
| **Weiche Sperre** | Hinweis „René arbeitet gerade daran“. Sie blockiert nicht, lenkt aber auf „Zuschauen“ oder „Eigene Variante“. |
| **Variante** | eine zweite Fassung eines Clips im selben Feld (kleine Zahl am Clip). Entsteht bei „Eigene Variante“ oder „Beide behalten (Variante)“. |
| **Übernehmen** | einzelne Teile aus einem anderen Zweig oder einer anderen Version in den eigenen Stand holen. Ergibt eine neue Version. |
| **Zurückholen** | einen alten Stand wieder aktuell machen. Ergibt eine **neue** Version, der Verlauf bleibt. |

## 6. Speichern: jede Speicherung eine Version

1. **Lokal sofort:** Wie heute in IndexedDB. Zusätzlich kommt jede Änderung in einen **Postausgang** (`outbox`), bis der Server sie bestätigt. Die App lädt neu und bleibt offline nutzbar, ohne Verlust (O4).
2. **Online-Speicherpunkt:** am Ende jeder Geste (Taste los, Regler los, Note gesetzt). Bei Dauerbearbeitung höchstens alle 2 s, spätestens alle 20 s. Das ist ein Vorschlag, die Werte sind Zielwerte.
3. **Der Speicherpunkt zerlegt das Projekt in Teile.** Jeder Teil wird als kanonischer JSON-Text mit `md5` gehasht. Hochgeladen werden **nur neue Teile** und ein **Manifest**, also die Liste aller Teil-Hashes. Unveränderte Teile teilen sich alle Versionen, wie bei git-Objekten (Q45 WAHRSCHEINLICH).
4. **Der Server prüft „baut auf dem Neuesten auf“** (optimistische Sperre wie r7 `save_project`, `p_base`):
   - Basis = aktueller Kopf: Er legt die Version an, setzt den Kopf weiter und meldet `ok`.
   - Basis veraltet: Er legt die Version **trotzdem unveränderlich ab** (Art `parallel`, nicht Kopf) und meldet `behind` mit dem neuen Kopf. Der Client führt dann zusammen (Abschnitt 7) und speichert erneut mit `merge_from`. Die erste Fassung ist damit schon sicher auf dem Server, auch wenn das Handy danach abstürzt.
5. **Speicherbedarf** (Rechnung aus den eigenen Messungen; Kompression nicht eingerechnet; Status WAHRSCHEINLICH):
   - Manifest: rund 31 Teile × 50 B, also etwa 1,5 KB je Version.
   - Kleine Änderung, Demo-Projekt: Manifest plus ein Clip ergibt etwa 1,8 KB. 500 MB Datenbank (Q47 WAHRSCHEINLICH) reichen dann für rund 280.000 Versionen.
   - Große Änderung, big-Projekt: Manifest plus ein Clip von 12 KB ergibt etwa 14 KB, also rund 36.000 Versionen.
   - Zum Vergleich: r7 speichert den ganzen Text, im big-Projekt 258 KB je Version (nur etwa 2.000 Versionen). Postgres komprimiert große Werte zusätzlich per TOAST (Q48 WAHRSCHEINLICH).
   - Fazit: Ausdünnen ist **nicht nötig**. Eine Füllstand-Anzeige gibt es schon in r7 (`storage_report`). Erst ab 80 % fragt die App: „Archiv exportieren?“. Es wird nie automatisch gelöscht.

## 7. Fast gleichzeitig am selben Projekt

**Ablauf (Paar-Raum Xander ↔ René):**
1. Beide öffnen „Nachtlicht“. Jeder tritt dem privaten Kanal `space:<id>` bei; das r7-Schema hat die RLS-Policies dafür schon. Jeder meldet seine **Anwesenheit**: `{name, farbe, projekt, fokus:{art:'clip', spur:uid, szene:uid} | {art:'klang', spur:uid} | null, spielt:bool}`. Presence ist für langsam wechselnden Zustand gedacht, nicht für hohe Raten (Q49 BELEGT). Deshalb wird nur der Fokus gemeldet, nicht jede Note.
2. René ändert „Bass · Refrain“ und lässt los. Speicherpunkt, `ok`, der Kopf rückt auf v49.
3. Xanders App erfährt das, weil die Zeile `projects` sich ändert (Postgres Changes; im r7-Schema schon in der Publikation). Sie holt das Manifest v49 und **nur die geänderten Teile** (meist unter 1 KB bis 15 KB).
4. **Taktgenau einspielen:** Läuft der Transport, wendet die App den neuen Teil am nächsten Taktanfang an (bei Clips am Loop-Ende). Steht der Transport, sofort. Der geänderte Clip leuchtet 3 s orange; der Hinweis lautet „René hat Fläche · Refrain geändert“ (Mockup m1). Vorbild: Endlesss synchronisiert Geräte im Takt (Q19).
5. **Erwartete Verzögerung 1–3 s.** Das ist UNBELEGT und muss gemessen werden (Abnahme ZA-05). Last: zwei Personen mit je höchstens 0,5 Speicherpunkten pro Sekunde liegen weit unter 100 Nachrichten/s und 20 Presence-Nachrichten/s im Free-Plan (Q46 BELEGT). Bei Postgres Changes prüft die Datenbank jede Änderung für jeden Abonnenten; das bremst erst bei vielen Nutzern (Q50 BELEGT). Bei 2 Personen ist das unkritisch, WAHRSCHEINLICH.

**Zusammenführen je Teil (3-Wege: Basis B, Meins M, Seins S):**

| Fall | Ergebnis | Sichtbar? |
|---|---|---|
| M = B, S ≠ B | Seins übernehmen | Hinweis und Leuchten (nicht still) |
| M ≠ B, S = B | Meins bleibt | – |
| M = S | gleich | – |
| M ≠ B, S ≠ B, M ≠ S, **gleicher Teil** | **Konflikt.** Der Kopf behält zuerst S (wer zuerst kam). M wird als **Variante** am Clip abgelegt, Xander sieht lokal weiter M. Es erscheint die Konflikt-Karte (Mockup m3) | ja, Karte; „Später“ erlaubt |
| einer löscht, der andere ändert | **Ändern gewinnt**; der Clip bleibt | Hinweis: „René hat den Clip gelöscht, du hast ihn geändert – er bleibt. [Doch löschen]“ |
| beide legen neue Spuren oder Szenen an | beide bleiben (feste `uid`, keine Index-Kollision) | Hinweis |
| beide ändern die Reihenfolge von Spuren oder Szenen | die zuletzt gespeicherte Reihenfolge gilt (kein Inhalt geht verloren) | Hinweis mit [Rückgängig] |
| Projekt-Kopf (Tempo, Tonart) beide geändert | Konflikt-Karte „Tempo 118 (du) oder 124 (René)?“ | ja |

Dass nichts still überschrieben wird, ist dreifach abgesichert. Erstens nimmt der Server nur Speicherungen an, die auf dem Kopf aufbauen. Zweitens legt er jeden Versuch als Version ab. Drittens erscheint jeder fremde Ersatz eines eigenen Teils sichtbar als Hinweis oder als Karte.

**Weiche Sperre statt harter Sperre:** Tippt Xander auf einen Clip, den René im Fokus hat, erscheint Mockup m2 mit den Wahlen „Zuschauen“, „Eigene Variante anlegen“ und „René fragen“. Eine harte Sperre scheidet aus. Bei Yjs sind verteilte Sperren ohnehin nicht machbar (Q41 BELEGT). Bei uns verhindert der Server nur das Überschreiben, nicht das Arbeiten, und eine Sperre könnte nach einem Verbindungsabbruch hängen bleiben (Presence räumt beim Trennen automatisch auf, Q49 BELEGT). Eigener Schluss.

**Undo:** Rückgängig betrifft nur die eigenen Schritte. Würde ein Undo einen Teil zurücksetzen, den René danach geändert hat, erscheint die Konflikt-Karte statt eines stillen Rücksetzens. Jedes Undo, das gespeichert wird, ist eine neue Version.

**Song-Modus:** Je Spur gibt es einen Teil „Song-Spur“, damit Xander die Bass-Spur im Song arrangieren kann, während René die Drums arrangiert. Die gelben Song-Teil-Markierungen (fragen-xander-7 S4, -8 S9) gehören zum Projekt-Kopf.

## 8. Abzweigen, Zurückholen, Übernehmen

### 8.1 Abzweigen (Mockup m5)
- Verlauf → Version antippen → „Abzweigen“. Name vorgeschlagen: „Nachtlicht – Xander hell“. Sichtbar für „Nur ich“ oder „Mit René“.
- Server: neues `projects`-Kopfstück mit `forked_from_project` und `forked_from_version`. Version 1 des Zweigs hat **dasselbe Manifest**, es wird also nichts kopiert, solange der Ort gleich bleibt. Beim Wechsel von „Mit René“ zu „Nur ich“ kopiert der Server die betroffenen Teile in den neuen Ort.
- Das Original bleibt unberührt, wie bei BandLab (Q1, Q2) und Audiotool mit Rückverweis (Q24). Im Zweig steht deshalb: „abgezweigt von Nachtlicht v37 (René, 12.10.)“.

### 8.2 Zurückholen
- Legt eine **neue** Version an, deren Manifest gleich dem alten ist (`kind='restore'`, Label „zurückgeholt aus v37“). Der Verlauf bleibt vollständig. Figma setzt vor Merges ebenfalls einen Sicherungspunkt (Q39).

### 8.3 Übernehmen (Mockup m6)
- Quelle: ein anderer Zweig oder eine beliebige Version. Die App sucht die gemeinsame Basis (letzte gemeinsame Version in `parent`/`merge_from`) und listet **je Teil** die Unterschiede, mit ▶ Deins / ▶ Seins zum Probehören. Das ist ein Musik-Ersatz für Figmas Seite-an-Seite-Vergleich (Q39).
- „Übernehmen“ ersetzt nur den Hash dieses Teils im eigenen Manifest. Das ist billig, denn kein Inhalt wird kopiert. Es ergibt eine neue Version mit `merge_from`.
- Teile, die **beide** geändert haben, gibt es nur als „Als Variante“. So wird auch beim Übernehmen nichts überschrieben.
- Anders als bei Figma ist **Teil-Übernahme ausdrücklich erlaubt** (Figma: nur alles oder nichts, Q39). Kompoz macht etwas Ähnliches: Der Gründer nimmt einzelne Ideen an (Q32).

### 8.4 Änderungen am r7-Entwurf (Vorschlag an den VO-Bau, r7 nicht selbst geändert)
1. `private.thin_versions` und die 10-Minuten-Regel für `auto` **entfallen**. Stattdessen ist jede Speicherung eine Version (Auftrag r8, fragen-xander-8 O4).
2. `project_versions.body` (ganzer Text) wird ersetzt durch `versions.manifest` plus die Tabelle `parts`. `project_data` entfällt oder dient nur als Cache „Kopf-Text“ für schnelles Laden.
3. `save_project` → `commit_version` (unten). Status `conflict` → `behind` mit automatischem Zusammenführen auf dem Client; die Fassung des Verlierers bleibt als Version `parallel`.
4. Projektformat 4: `uid` für Spuren und Szenen. Geräte-Einstellungen und `ui` wandern aus der Projektdatei hinaus.
5. Unverändert übernommen werden Login, Paar-Räume, Anfragen und Zustimmung (O2, O3), die RLS-Hilfen, die privaten Realtime-Kanäle, der Versions-Wächter für ältere Apps, Papierkorb und `storage_report`.

## 9. Abbildung auf Supabase (Skizze, nicht gegen das echte Projekt ausgeführt)

```sql
-- Ort eines Teils: space_id (geteilt) oder owner uid (Nur ich)
create table public.parts (
  scope      uuid not null,
  hash       text not null check (hash ~ '^[0-9a-f]{32}$'),      -- md5(body::text), json bleibt bytegenau (wie r7)
  kind       text not null check (kind in ('kopf','spur','klang','clip','song')),
  body       json not null check (octet_length(body::text) <= 300000),
  size_bytes integer not null,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  primary key (scope, hash)
);
create table public.versions (                                  -- unveränderlich
  id            bigint generated always as identity primary key,
  project_id    uuid not null references public.projects(id) on delete restrict,
  parent_id     bigint references public.versions(id),
  merge_from_id bigint references public.versions(id),           -- Übernehmen / Zusammenführen
  kind          text not null check (kind in ('save','parallel','merge','adopt','restore','fork','import')),
  label         text check (char_length(label) <= 80),
  manifest      json not null,                                    -- {f:4, kopf:h, spuren:[{u,kopf,klang,song,clips:{<szene-uid>:{h,alt:[{h,by,v}]}}}]}
  changed       text[] not null default '{}',                     -- z. B. {'clip:t_9f3k/s_ab12'} für die Verlaufs-Anzeige
  app_code      integer not null, format integer not null,
  author        uuid not null references auth.users(id),
  client_op     uuid not null unique,                             -- doppelte Sendung = gleiche Antwort
  created_at    timestamptz not null default now()
);
create index versions_proj_idx on public.versions (project_id, id desc);
-- projects (r7) bekommt: head_version bigint, forked_from_project uuid, forked_from_version bigint
-- Unveränderlich: keine update/delete-Rechte + Trigger, der UPDATE/DELETE auf versions und parts mit Fehler abweist
-- (Ausnahme nur purge_project für eigene, private Projekte im Papierkorb, wie r7).
```

**RPC** (SECURITY DEFINER, `search_path=''`, Prüfungen wie r7):
- `commit_version(p_project, p_base, p_manifest, p_new_parts json, p_kind, p_label, p_merge_from, p_client_op)`. Prüft das Recht über `private.can_write`, prüft für jeden neuen Teil `md5(body::text)=hash` und dass jeder Hash im Manifest im Ort existiert. Bei `p_base = head` legt es eine Version an und setzt `head` weiter, Antwort `ok`. Sonst legt es eine Version `parallel` an, Antwort `behind {head}`. Danach wird `projects.updated_at/by` gesetzt; das löst die Realtime-Meldung aus.
- `fork_project(p_version, p_title, p_space)`: kopiert bei Ortswechsel die Teile, legt ein neues Projekt und Version 1 (`fork`) an.
- `get_parts(p_project, p_hashes text[])`: Lesen ginge auch per RLS-Select; die RPC spart Hin und Her.
- `version_list(p_project, p_before, p_limit)`: Liste für den Verlauf (Autor, Zeit, `changed`, Label).

**RLS:** Lesen von `parts` erlaubt, wenn `scope` ein eigener Raum oder die eigene uid ist; Lesen von `versions` über `private.my_project_ids()` (r7). Geschrieben wird nur per RPC.
**Realtime:** Postgres Changes auf `projects` (klein; in r7 schon in der Publikation) melden „Kopf bewegt“. Presence auf `space:<id>` meldet die Anwesenheit (r7-Policy vorhanden). Broadcast ist **nur optional** für Phase D („Vorschau beim Ziehen“). Teile nie über Broadcast verschicken (256-KB-Grenze, Q46).
**Free-Plan:** 200 gleichzeitige Verbindungen, 100 Nachrichten/s, 20 Presence-Nachrichten/s (Q46 BELEGT). Etwa 2 Mio. Realtime-Nachrichten im Monat und 500 MB Datenbank (Q47 WAHRSCHEINLICH). Nach 7 Tagen geringer Aktivität pausiert das Projekt; Wiederherstellen ist 90 Tage möglich (Q51 BELEGT). Der Wach-Ping aus r7 bleibt nötig.

## 10. Konflikt-Erlebnis für einen Musiker ohne Technik-Wissen

Regeln für die Oberfläche (Vorschlag):
1. **Nie die Worte „Konflikt“, „Merge“, „Branch“.** Die App sagt stattdessen „Ihr habt beide … geändert“, „Abzweigen“, „Übernehmen“, „Variante“.
2. **Immer zuerst hören, dann entscheiden.** Jede Wahl hat ▶-Knöpfe, die den Clip im Loop mit dem aktuellen Rest des Songs spielen.
3. **Immer drei Wege und „Später“.** Deine / Seine / Beide behalten. „Beide behalten“ legt den Clip in die nächste freie Szene oder als Variante ab. Ein offener Punkt bleibt als gelber Punkt in der Statuszeile („1 Entscheidung offen · nichts ist verloren“).
4. **Jede Karte sagt, wo die andere Fassung bleibt** („bleibt im Verlauf, Version 49“).
5. **Keine Karte mitten im Spiel:** Läuft der Transport und Xander spielt ein, erscheint nur der gelbe Punkt; die Karte kommt erst beim Stopp.
6. **Wer zuerst kam, behält den Kopf.** Der Zweite sieht seine Fassung lokal weiter. So springt bei niemandem mitten im Arbeiten etwas um.

## 11. Vergleich: CRDT (Yjs über Supabase Realtime) vs. Versionen mit weichen Sperren

| Kriterium | CRDT (Yjs) | Versionen + weiche Sperren (empfohlen) |
|---|---|---|
| Gleichzeitigkeit | auf Noten- und Wert-Ebene, auch offline | je Teil (Clip, Klang …); gleicher Teil → Karte |
| Stilles Überschreiben | **ja, möglich**: `Y.Map` wählt den Sieger nach Client-ID (Q40); Automerge hebt Verlierer zwar auf (Q44), braucht aber eine eigene Oberfläche | **nein**: Der Server nimmt nur Speicherungen auf dem Kopf an, jeder Versuch wird Version |
| Musikalisch sinnvolles Ergebnis | fraglich (Noten aus zwei Händen verzahnt) | ja, eine ganze Fassung je Clip |
| Umbau der App | groß: Jede Änderungsstelle im Zustand `S` muss über Y-Operationen laufen (V0a hat 1,3 MB in einer Datei; BELEGT, Dateigröße `r8/V0a-copy.html`) | klein: Die App behält ihr JSON. Neu sind das Zerlegen in Teile beim Speichern und das Einspielen von Teilen |
| Verlauf / Abzweigen / Übernehmen | zusätzlich zu bauen (Yjs-Snapshots, Dokument wächst) | ergibt sich aus dem Modell (Manifest und Zeiger) |
| Supabase-Anbindung | y-supabase „nicht für Produktion“ (Q42); Speichern und Verdichten der Updates selbst bauen; ganze Dokument-Syncs können 256 KB überschreiten (Q46 + eigene Messung) | Tabellen und RPC wie r7, Realtime nur für Signale |
| Zusätzlicher Code im Browser | Yjs etwa 27 KB gzip (Q52 WAHRSCHEINLICH) plus Provider | 0 KB (md5 bzw. Hash ist schon da, `sum` in der Projektdatei) |
| Aufwand (Schätzung, UNBELEGT) | etwa 22–26 Agenten-Tage, davon Zustandsumbau 6–10, Provider und Persistenz 4, Verlauf und Zweige 4, Konflikt-Sichtbarkeit 3, Tests 4 | etwa 14–16 Agenten-Tage, davon Format 4 und Zerlegen 1,5, SQL/RPC/RLS-Tests 2, Commit, Postausgang und Zusammenführen 3, Anwesenheit und Sperre 1,5, Karte und Varianten 2, Verlauf, Abzweigen und Übernehmen 3, Tests 2 |
| Risiko | hoch: Fehler im Zustandsumbau treffen alles; schwer zu testen; wenig gereifter Provider | mittel-niedrig: Logik liegt auf dem Server in SQL (testbar mit PGlite wie r7), Client-Merge ist ein reiner Vergleich von Hashes |

**Empfehlung: Versionen mit weichen Sperren je Clip.** Später möglich (Phase D): Broadcast-Vorschau, bei der Noten beim Ziehen beim Partner schon halbtransparent erscheinen, ohne Speicherung. Das bringt das Echtzeit-Gefühl ohne CRDT-Risiko.

## 12. Bau-Phasen (Vorschlag, passt in die VO-Reihe aus r7)

| Phase | Inhalt | erfüllt |
|---|---|---|
| **ZA-A** | Format 4 (uids, Geräte-Einstellungen lokal), `parts`/`versions`, `commit_version`, Postausgang, Verlauf, Zurückholen, Abzweigen | O1 (Kumpel sieht nach Speichern), O4, „jede Speicherung eine Version“, Fork |
| **ZA-B** | Anwesenheit, weiche Sperre (m2), taktgenaues Einspielen, Zusammenführen je Teil, Konflikt-Karte (m3), Varianten | „relativ synchron“, nie still überschreiben |
| **ZA-C** | Übernehmen mit A/B (m6) | „Übernehmen“ wie gewünscht |
| ZA-D (optional) | Broadcast-Vorschau beim Ziehen; gemeinsamer Start am Taktanfang | Echtzeit-Gefühl |

## 13. Abnahmetests (Entwurf)

- **ZA-01:** 50 Speicherpunkte hintereinander → 50 Versionen, keine fehlt, keine wird je gelöscht (auch nicht nach einer simulierten Zeit von 31 Tagen).
- **ZA-02:** `update`/`delete` auf `versions` und `parts` als `authenticated` scheitern.
- **ZA-03:** Zwei Clients ändern verschiedene Clips gleichzeitig → beide Änderungen im Kopf, ohne Karte.
- **ZA-04:** Zwei Clients ändern denselben Clip gleichzeitig → Kopf = Erster; die Fassung des Zweiten liegt als Version `parallel` und als Variante vor; der Zweite sieht die Karte. Nichts geht verloren (Hash-Vergleich).
- **ZA-05:** Verzögerung Speichern bei A → sichtbar bei B: Median ≤ 3 s (gegen das echte Free-Projekt messen).
- **ZA-06:** Eingehende Änderung bei laufendem Transport wird exakt am nächsten Takt hörbar, ohne Knackser.
- **ZA-07:** Löschen gegen Ändern → Clip bleibt, Hinweis erscheint.
- **ZA-08:** Beide fügen eine Szene ein → beide Szenen da; Clips landen an der richtigen Szene (uid statt Index).
- **ZA-09:** Abzweigen aus v37 → Original-Kopf und alle Versionen unverändert (Byte-Vergleich der Manifeste).
- **ZA-10:** Zurückholen v37 → neue Version mit Manifest = v37; v38 und folgende weiter vorhanden.
- **ZA-11:** Übernehmen eines Clips aus dem Zweig → nur dieser Teil-Hash ändert sich; die Version hat `merge_from`.
- **ZA-12:** Offline 10 Änderungen, Seite neu laden, wieder online → alle 10 auf dem Server, in Reihenfolge.
- **ZA-13:** Geräte-Einstellungen (Metronom, Auswahl) von A ändern sich bei B nicht.
- **ZA-14:** Raum-Trennung (O3): David sieht keine Teile oder Versionen aus dem Raum Xander–René (RLS-Matrix wie r7).
- **ZA-15:** Presence: Fokus-Ring erscheint ≤ 2 s nach Antippen und verschwindet beim Trennen.

## 14. Mockups (390×844)

| Datei | Bildschirm |
|---|---|
| `zusammenarbeit-mockups/m1.png` | Projekt mit Anwesenheit: oranger Ring = René arbeitet dort; Hinweis „René hat Fläche · Refrain geändert“; Statuszeile „Online gespeichert · Version 48“ |
| `zusammenarbeit-mockups/m2.png` | Weiche Sperre: „René arbeitet gerade an diesem Clip“ → Zuschauen / Eigene Variante / René fragen |
| `zusammenarbeit-mockups/m3.png` | Konflikt-Karte: ▶ Deine / ▶ Renés, Beide behalten / Deine / Renés / Später |
| `zusammenarbeit-mockups/m4.png` | Verlauf: Versionen mit Autor, Zeit, geändertem Teil; Aktionen Anhören / Abzweigen / Zurückholen; Zweig-Baum |
| `zusammenarbeit-mockups/m5.png` | Abzweigen aus Version 37: Name, „Nur ich / Mit René“, „Das Original bleibt genau so, wie es ist.“ |
| `zusammenarbeit-mockups/m6.png` | Übernehmen von René: je Spur/Clip ▶ Deins / ▶ Seins, Übernehmen; Überschneidung nur „Als Variante“ |

## 15. Offene Fragen an Xander (kurz)

1. „die Music“: welcher Dienst? (Splice, Ohm Studio, Endlesss, Blend, Indaba, etwas anderes)
2. Bei „Beide behalten“: Soll die zweite Fassung in die **nächste freie Szene** oder als **Variante im selben Feld** (umschaltbar)?
3. Renés Änderungen: **am nächsten Taktanfang** einspielen (Vorschlag) oder sofort?
4. Abzweigen: Standard „Nur ich“ oder „Mit René“?

---

## Quellen

- Q1 BandLab Hilfe „What is Forking“ (Fork-Symbol Ψ, „Allow Forks“ in den Projekteinstellungen): https://help.bandlab.com/hc/en-us/articles/48041963115033-What-is-Forking — BELEGT (Auszug)
- Q2 Audeobox, BandLab Collaboration Features (Fork = vollständige Kopie, Original bleibt; Echtzeit-Bearbeitung eingeschränkt): https://www.audeobox.com/learn/bandlab/bandlab-collaboration-features/ — WAHRSCHEINLICH
- Q3 BandLab Hilfe „Navigating the Project Page“ (Revisions-Verlauf, Mitwirkende, Projekt-Link): https://help.bandlab.com/hc/en-us/articles/4402292152857-Navigating-the-Project-Page — BELEGT (Auszug)
- Q4 BandLab Hilfe „Saving Issues“ (keine lokale Kopie, oft Revisionen speichern): https://help.bandlab.com/hc/en-us/articles/115002945193-Saving-Issues — BELEGT (Auszug)
- Q5 BandLab Hilfe „Protecting my Content“ (Revision History): https://help.bandlab.com/hc/en-us/articles/360018947313-Protecting-my-Content-on-BandLab — BELEGT (Auszug)
- Q6 Jack Righteous, BandLab Forking Checklist (Wiederveröffentlichen mit Namensnennung): https://jackrighteous.com/blogs/bandlab-guides/bandlab-sounds-loops-forking-ai-music-release-checklist — WAHRSCHEINLICH
- Q7 Splice, Brief des CEO zum Ende von Studio (Zeitplan 2023): https://splice.com/blog/?p=25244 (auch https://splice.com/studio) — BELEGT (Auszug)
- Q8 Sonicstate, „Splice to end ‘Studio’ feature“ (10.03.2023): https://sonicstate.com/news/2023/03/10/splice-to-end-studio-feature-/ — BELEGT (Auszug)
- Q9 CDM, „Splice Studio is free backup, version control and collaboration for your DAW“: https://cdm.link/splice-studio-is-free-backup-version-control-and-collaboration-for-your-daw/ — BELEGT (Auszug)
- Q10 Billboard über Splice („GitHub of music“): https://www.billboard.com/?p=5930356 — WAHRSCHEINLICH
- Q11 sep-lab/Wit README (Kritik: Splice Studio zeigte nicht, was sich geändert hat, kein Merge): https://github.com/sep-lab/Wit — WAHRSCHEINLICH (Meinung)
- Q12 Synthtopia, „Ohm Studio, the first real-time collaborative DAW, now available“: https://www.synthtopia.com/?p=40752 — BELEGT (Auszug)
- Q13 MusicRadar, Test Ohm Studio (Projekt liegt auf Ohm-Force-Servern): https://www.musicradar.com/reviews/tech/ohm-force-ohm-studio-590570 — BELEGT (Auszug)
- Q14 CDM, „Ohm teases collaborative music host“ (Server führt Versionen, Frage nach Forks): https://cdm.link/ohm-teases-collaborative-music-host-how-should-collaboration-work/ — BELEGT (Auszug)
- Q15 Steam-Forum Ohm Studio (keine Updates seit 2013, Nutzerangabe): https://steamcommunity.com/app/241660/discussions/0/364039785169696950 — WAHRSCHEINLICH; Hongkiat (gleiche Spur gleichzeitig): https://www.hongkiat.com/blog/record-music-collaboratively-ohmstudio — WAHRSCHEINLICH
- Q16 Flip-Framework: https://ohmflip.sourceforge.net/ohm.flip.overview.about.html und https://isocpp.org/blog/2016/12/flip-a-new-data-model-cpp-framework-focused-on-real-time-collaboration — BELEGT (Auszug)
- Q17 Music Business Worldwide, Soundtrap Live-Zusammenarbeit und Auto-Save (Beta, „ohne Sync-Knopf“, vorher einschalten): https://www.musicbusinessworldwide.com/spotifys-online-studio-soundtrap-launches-live-collaboration-auto-save-tools — BELEGT (Auszug)
- Q18 Soundtrap Blog „Made Together“: https://blog.soundtrap.com/collaboration — WAHRSCHEINLICH
- Q19 FACT, Endlesss (Jams, Rifffs, Takt-Synchronität): https://factmag.com/2019/03/01/endlesss-collaborative-music-platform und Forte Magazine: https://www.fortemagazine.com.au/?p=51862 — WAHRSCHEINLICH (Auszug, Zuordnung der Zitate nicht eindeutig)
- Q20 Synth Anatomy, Endlesss 2020: https://synthanatomy.com/2020/03/endlesss-collaborative-music-making-app-that-virtually-brings-musicians-together.html — WAHRSCHEINLICH
- Q21 CDM, „Endlesss discontinued“ (Mai 2024; Blend.io wird ebenfalls eingestellt, Herunterladen bis 4.6.2024): https://cdm.link/2024/05/endlesss-discontinued/ — BELEGT (Auszug)
- Q22 Wikipedia, Tim Exile (Endlesss 2024 geschlossen, HabLab London): https://en.wikipedia.org/wiki/Tim_Exile ; MusicTech: https://musictech.com/news/gear/tim-exile-endlesss-app-shut-down — BELEGT (Auszug)
- Q23 TechCrunch 2013, Blend.io (komplette Projektdateien, Ableton): https://techcrunch.com/2013/04/24/betaworks-backed-blend-io-lets-musicians-collaborate-without-ever-abandoning-ableton — BELEGT (Auszug)
- Q24 Audiotool, Collaborate (Link-Einladung, Fork mit Rückverweis): https://www.audiotool.com/collaborate — BELEGT (Auszug)
- Q25 Mixdown, „Audiotool 3.0 … multiplayer“ (8.7.2026): https://mixdownmag.com.au/news/audiotool-3-0-launches-with-multiplayer-daw-and-open-sdk/ ; Sonicstate: https://sonicstate.com/news/2026/07/09/-audiotool-launches-audiotool-30/ — BELEGT (Auszug)
- Q26 Sound On Sound, Cloud Collaboration in Pro Tools 12.5, Teil 2 (Knöpfe je Spur, Hoch- und Herunterladen): https://www.soundonsound.com/techniques/part-2-cloud-collaboration-pro-tools-125 — BELEGT (Auszug)
- Q27 Gearnews, Pro Tools 12.5 (bis zu 2 Mitwirkende gleichzeitig): https://www.gearnews.com/avid-pro-tools-12-5-now-available-get-collaborating-cloud — BELEGT (Auszug)
- Q28 Tape Op, Pro Tools 2018.7 (Revisionen): https://tapeop.com/reviews/gear/126/pro-tools-20187 ; Production Expert 2017: https://www.production-expert.com/home-page/2017/5/10/pro-tools-cloud-collaboration-1-year-on — WAHRSCHEINLICH
- Q29 Ableton Hilfe, Link FAQ (Schlag, Tempo, Phase; keine MIDI-Daten): https://help.ableton.com/hc/articles/209776125 — BELEGT (Auszug)
- Q30 Bitwig Support, „When will the collaboration features become available“: https://www.bitwig.com/support/technical_support/when-will-the-collaboration-features-become-available-16/ — BELEGT (Auszug)
- Q31 MusicTech, Bitwig Connect 4/12 (Hardware): https://musictech.com/news/gear/bitwig-first-hardware-connect-namm/ — BELEGT (Auszug)
- Q32 Reunion Blues, „How To Use Kompoz“ (Idee annehmen oder archivieren): https://reunionblues.com/blogs/news/how-to-use-kompoz-part-1-2 — WAHRSCHEINLICH
- Q33 Creative Commons 2007 über Kompoz: https://creativecommons.org/2007/03/21/kompoz/ — BELEGT (Auszug)
- Q34 Wikipedia, Indaba Music: https://en.wikipedia.org/wiki/Indaba_Music — BELEGT (Auszug)
- Q35 Highperformr, Indaba-Übernahme durch Splice 2018: https://www.highperformr.ai/company/indaba-music — UNBELEGT (einzige Quelle, Firmenprofil)
- Q36 OT-Erklärungen (Sekundärquellen): https://systemdr.substack.com/p/crdts-vs-operational-transformation , https://singhajit.com/how-google-docs-works/ — WAHRSCHEINLICH
- Q37 Masterarbeit Bologna, OT auf strukturierten Dokumenten: https://amslaurea.unibo.it/id/eprint/14894/1/Operational%20Transformation%20su%20documenti%20strutturati.pdf — WAHRSCHEINLICH
- Q38 Figma, „How Figma’s multiplayer technology works“: https://www.figma.com/blog/how-figmas-multiplayer-technology-works/ (Spiegel: https://madebyevan.com/figma/how-figmas-multiplayer-technology-works/) — BELEGT (über Zusammenfassungen)
- Q39 Figma Hilfe, Branching und Merge: https://help.figma.com/hc/en-us/articles/5691189138839/ , https://help.figma.com/hc/en-us/articles/360063144053 — BELEGT (Auszug)
- Q40 Yjs `Y.Map`-Gleichstand nach Client-ID (Issue #520, Zusammenfassung): https://github.com/yjs/yjs/issues/520 — WAHRSCHEINLICH
- Q41 Yjs-Forum „Locking using Yjs“: https://discuss.yjs.dev/t/locking-using-yjs/801 — BELEGT (Auszug)
- Q42 npm y-supabase (nicht für Produktion empfohlen): https://npmjs.com/package/y-supabase — BELEGT (Auszug)
- Q43 Yjs-Forum „Y-supabase: Too many message events“: https://discuss.yjs.dev/t/y-supabase-too-many-message-events/2447 — WAHRSCHEINLICH
- Q44 Automerge, Conflicts: https://automerge.org/docs/reference/documents/conflicts/ — BELEGT (Auszug)
- Q45 git, Branches in a Nutshell: https://git-scm.com/book/en/v2/Git-Branching-Branches-in-a-Nutshell — WAHRSCHEINLICH (nicht abgerufen)
- Q46 Supabase, Realtime Limits (Free: 200 Verbindungen, 100 Nachrichten/s, 20 Presence/s, Broadcast 256 KB, Postgres Changes 1.024 KB): https://supabase.com/docs/guides/realtime/limits — BELEGT (offizielle Doku über Supabase-MCP, 17.10.2026)
- Q47 Supabase Pricing (500 MB DB, etwa 2 Mio. Realtime-Nachrichten/Monat): https://supabase.com/pricing , Drittquelle https://www.jetadmin.io/blog/supabase-pricing-2026-guide-to-plans-limits-and-real-world-costs/ — WAHRSCHEINLICH
- Q48 PostgreSQL, TOAST: https://www.postgresql.org/docs/current/storage-toast.html — WAHRSCHEINLICH (nicht abgerufen)
- Q49 Supabase, Presence (sync, join, leave; nicht für hohe Raten): https://supabase.com/docs/guides/realtime/presence — BELEGT (offizielle Doku über MCP)
- Q50 Supabase, Postgres Changes (Prüfung je Abonnent, ein Thread): https://supabase.com/docs/guides/realtime/postgres-changes — BELEGT (offizielle Doku über MCP)
- Q51 Supabase, Project Pausing (7 Tage, 90 Tage Wiederherstellung): https://supabase.com/docs/guides/platform/free-project-pausing — BELEGT (offizielle Doku über MCP)
- Q52 DepScope, yjs 13.6.30 Bundle-Größe: https://mcp.depscope.dev/pkg/npm/yjs — WAHRSCHEINLICH (Drittquelle)
- Eigene Messungen: `v3-ideen/r7/online-test/demo.json`, `big.json` (Größen, Felder), `v3-ideen/r7/online-schema.sql` (gelesen), `v3-ideen/r8/V0a-copy.html` (1.310.652 B), Supabase-MCP `get_project`/`list_tables` für dbdnsryoivvezspgydpx (17.10.2026) — BELEGT

---

## Nachtrag Digital Musician (17.10.2026)

> **Klar markierter Nachtrag.** Alles oberhalb dieser Linie ist **unverändert**. Grundlage: Xanders Klarstellung in `fragen-xander-9.md`, Abschnitt „Klarstellungen (17.10., späte Nachricht)“: Mit „die Music“ war **Digital Musician** gemeint (digitalmusician.net, „Digital Musician Recording Link“). Einzelheiten, Zeitleiste, Vergleichstabelle und alle Belege: `r7/spezial-digitalmusician.md`.
>
> **Methode:** WebFetch scheiterte mit DNS-Fehlern, curl wurde vom Proxy abgewiesen (403). Alle Angaben stammen aus **WebSearch-Auszügen** („Auszug“); die Seiten selbst wurden nicht gelesen. Kennzeichen wie oben: BELEGT, WAHRSCHEINLICH, UNBELEGT. Quellen D1–D22 am Ende dieses Nachtrags.

### N-DM.1 Was gilt jetzt statt der alten Stellen (Hinweise, oben **nicht** eingearbeitet)

- **Abschnitt 0, Punkt „die Music“** und **Abschnitt 3 (Kandidaten)** sind überholt: „die Music“ = **Digital Musician** (2005–2018).
- **Abschnitt 15, Frage 1** ist beantwortet und entfällt.
- **Abschnitt 5 (Begriffe):** neue Fokus-Art `{art:'spur', spur:uid}` (siehe L3).
- **Abschnitt 12 (Bau-Phasen):** ZA-A + „Alles exportieren / Importieren mit Verlauf“ (L7). ZA-D (optional) + „Fern-Einspielen (VC3-R1b), Jam-Take als Version“ (L1, L2).
- **Abschnitt 13 (Abnahme):** + DM-01 … DM-06 (N-DM.4).

### N-DM.2 Was Digital Musician war (kurz)

- Online-Dienst aus Deutschland, gegründet von **Charlie (Karl) Steinberg und Manfred Rürup**, den Gründern von Steinberg (Cubase). BELEGT (D9, D1; Auszug).
- **Start August 2005**, **abgeschaltet am 30.06.2018**; seither nur eine Offline-Seite, **ohne** genannten Grund. BELEGT (D1, D19; Auszug).
- Ein Plug-in im Sequencer (**DML**, später **DMP/DMC**) verband zwei Studios über eine normale DSL-Leitung. Der Partner spielte zur Wiedergabe des Besitzers ein; die Aufnahme kam „in sync with your playback“ ins Projekt. BELEGT (D3; Auszug).
- **Technik:** Audio und MIDI mit **Zeitstempel** über TCP/IP, ein Puffer gleicht Latenz aus, „patent pending“. WAHRSCHEINLICH (D4; Auszug). Ein Patent fand ich nicht: UNBELEGT.
- **Kein symmetrisches Jammen**, sondern **Fern-Aufnahme**: Ein Studio gibt den Takt vor, das andere spielt dazu. WAHRSCHEINLICH (eigener Schluss aus D3, D4).
- Live lief der Ton **mp3-komprimiert** (bis 256 kbit/s); verlustfreie Takes kamen per „Send File“ nach. WAHRSCHEINLICH (D4, D11).
- Beim DM-Recorder **teilte der Projektbesitzer Spuren zu**, die Dateien lagen auf einem zentralen Server. BELEGT (D10; Auszug).
- **Versionen, Zweige oder Zusammenführen:** nirgends belegt. UNBELEGT.
- **Nutzer lobten** die Synchronität („pretty cool“, D16) und den kostenlosen Einstieg (D1, D2, D7). **Sie klagten**, dass „meist niemand online“ war (D17, WAHRSCHEINLICH, Meinung), über Monatsgebühr und „nur VST“ (D16) und über die späte AU-Version (D15).
- **Einordnung:** Digital Musician war das einzige System im Vergleich, das **Fern-Aufnahme mit Ausrichtung auf die Zeitachse** zum Kern machte. Was danach mit dem Projekt geschah (Versionen, Zweige), löste es nicht. Damit ergänzt es dieses Modell genau beim **Live-Einspielen (VC3)**. WAHRSCHEINLICH (eigener Schluss).

### N-DM.3 Lehren für SYNQUENZER

Bezug: Paar-Räume (VO2), Versionen und Zweige (ZA-A … ZA-D oben), Live-Jam VC3 aus `r6/nachtrag/p4-teilB.md` (R0 Raum-Check, R1 Taktsynchron).

**L1 · Song-Position statt Uhrzeit (aus D1, D3).**
- Jedes live gespielte Ereignis trägt `{szene:uid, spur:uid, takt, tick}` relativ zum Taktanker des TAKTGEBERs aus R1, keine Uhrzeit.
- Beim Partner erklingt es an genau dieser Song-Position, also **im nächsten Loop-Durchlauf desselben Clips**. Das ist das Intervall-Prinzip von NINJAM (D22), angewendet auf unsere Clip-Länge. Musikalisch passend, weil Clips Loops sind: WAHRSCHEINLICH, Hörtest nötig.
- Neues Teilpaket **VC3-R1b „Fern-Einspielen“**: ohne Audio-Übertragung.
- Last (Rechnung, WAHRSCHEINLICH): Noten **pro Schlag gebündelt**. Bei 124 BPM ≈ 2,1 Nachrichten/s je Spieler, < 0,5 KB je Nachricht (≈ 25 B je Note, ≤ 16 Noten). Das liegt unter den VC3-Grenzen (≤ 10 Nachrichten/s, ≤ 4 KiB) und den Free-Plan-Grenzen (Q46). Einzelne Note-An/Aus-Nachrichten wären bei Sechzehnteln ≈ 16/s: zu viel.

**L2 · Jam-Take wird Version (aus „Send File“, D4, D11).**
- Vorschau = Broadcast der Noten (L1). Ergebnis = Version über `commit_version`.
- Regel: Endet ein eingespielter Durchlauf (Loop-Ende oder Stopp), speichert das Gerät des Spielers den Clip **automatisch als Version** (`kind='save'`, Label „Jam-Take 3 · René“). Passt zu „jede Speicherung eine Version“ (Abschnitt 6).
- Noten sind verlustfrei; der mp3-Schwachpunkt von Digital Musician (D16) entfällt.

**L3 · Ungleiche Rollen nur im Live-Modus (aus D10).**
- Die VC3-Spur-Zuteilung („Dieses Gerät spielt: …“) setzt automatisch die **Anwesenheit** (Abschnitt 7) mit der neuen Fokus-Art `{art:'spur', spur:uid}`. Auf der zugeteilten Spur gilt für den anderen die **weiche Sperre**.
- Außerhalb des Jams bleiben beide gleichberechtigt; Besitzer-Rechte wie bei Digital Musician gibt es im Paar-Raum nicht.

**L4 · Keine öffentliche Börse, Paar-Räume zuerst (aus D17).**
- Fremde finden, die gerade online sind, hat nicht getragen. SYNQUENZER bleibt bei **Paar-Räumen mit Zustimmung** (O2/O3), ohne Lobby.
- Die zeitversetzte Arbeit (ZA-A/B) muss allein voll tragen; der Jam (VO3/VC3) bleibt optional.
- Zum Verabreden genügt der Hinweis „René ist da“ (VO3). Keine Termin-Funktion.

**L5 · Keine Einstiegshürden (aus D14, D15, D18).**
- Digital Musician verlangte Plug-in, ASIO/Core Audio, schnelle Leitung und ein vorab angelegtes Online-Projekt. Bei uns genügt **ein Link** im Paar-Raum.
- Der R0-Raum-Check sagt das Ergebnis in Klartext: „Jam geht gut“ / „Jam geht, Partner hört dich einen Durchlauf später“ / „Nur zeitversetzt“.
- Fern-Einspielen (L1) braucht keine kurze Laufzeit, nur Ordnung. Die R0-Schwelle (Median ≤ 150 ms) gilt dann nur noch für das **gemeinsame Starten**. WAHRSCHEINLICH (eigener Schluss).

**L6 · Kein eigenes Gegensprechen oder Video (aus D5, D13).**
- Lohnt sich nicht (Budget; Supabase ist kein Medien-Server). Empfehlung: parallel telefonieren, mit Kopfhörern.
- Ob Safari die Web-Audio-Wiedergabe während eines Telefonats oder FaceTime-Anrufs weiterspielt: **UNBELEGT**, am iPhone prüfen (DM-06).

**L7 · Raus-Garantie (aus D19, D20).**
- Digital Musician verschwand mit einer Offline-Seite; Jahre später suchten Nutzer Ersatz. Das bestätigt Lehre 5 oben.
- **„Alles exportieren“**: alle Projekte **mit vollständigem Verlauf** (Manifeste und Teile) als eine Datei. Einlesen **ohne Server** (`kind='import'` gibt es schon im Schema).
- Erinnerung an den Export bei der Füllstand-Warnung (80 %) und einmal im Jahr.
- Selbst betreiben wäre notfalls möglich, weil alles in normalem Postgres liegt: WAHRSCHEINLICH, nicht geprüft.

**L8 · Mitwirkende statt Verträge (aus D10, D11).**
- Keine Rechte- oder Vertragsverwaltung. Aus `versions.author` und `parts.created_by` (Abschnitt 9) entsteht billig eine **Mitwirkenden-Liste je Song** für Export und Projektinfo. Vorschlag; ob Xander das braucht, ist offen (F2).

**L9 · Standard statt Sondertechnik (aus D4).**
- Keine eigene Peer-to-Peer-Technik. Supabase Realtime (Broadcast und Presence) genügt, weil nur winzige Ereignisse reisen (L1); WebRTC ist nicht nötig.
- Die echte Laufzeit über Supabase am iPhone ist ungemessen (ZA-05); R0 misst sie.

### N-DM.4 Abnahme-Ergänzungen (Entwurf)

- [ ] **DM-01** Fern-Einspielen: Mock-Raum mit 150 ms Laufzeit und ±15 ms Schwankung. Der MITSPIELER spielt 4 Takte Sechzehntel. Beim TAKTGEBER erklingen sie ab dem nächsten Durchlauf, jede Note an derselben Song-Position (Abweichung 0 Ticks).
- [ ] **DM-02** Bündelung: Bei 124 BPM im Mittel ≤ 2,5 Nachrichten/s je Spieler, keine Nachricht > 4 KiB.
- [ ] **DM-03** Jam-Take: Nach Loop-Ende oder Stopp liegt genau eine neue Version „Jam-Take n · Name“ vor; bei Funkloch landet sie im Postausgang und geht nicht verloren.
- [ ] **DM-04** Spur-Zuteilung → Anwesenheit: Ist „Bass“ René zugeteilt, zeigt Xanders Gerät am Bass den orangen Ring; Antippen eines Bass-Clips zeigt die weiche Sperre (m2).
- [ ] **DM-05** Export/Import: „Alles exportieren“, dann Import auf einem frischen Gerät ohne Netz → derselbe Verlauf (gleiche Anzahl Versionen, gleiche Manifest-Hashes).
- [ ] **DM-06** iPhone (eK): Während eines Telefonats bzw. FaceTime-Anrufs spielt die App weiter; Pegel und Unterbrechungen protokollieren. Ergebnis offen.

### N-DM.5 Neue offene Fragen an Xander (kurz)

- **F1:** „Bei Digital Musician hat einer gespielt und der andere aufgenommen. Reicht dir das für den Jam (René hört dich einen Durchlauf später), oder wollt ihr gleichzeitig starten und euch sofort hören?“ Das Zweite geht nur bei kurzer Laufzeit (R0) und auch dann nicht ohne Versatz.
- **F2:** Brauchst du eine Mitwirkenden-Liste je Song (L8)?
- **Recherche-Lücken (UNBELEGT):** Preise der Kontostufen, das Patent, der Abschalt-Grund, eine Verbindung zu Steinberg VST Connect. Prüfbar mit Zugriff auf web.archive.org (vom Proxy gesperrt).

### N-DM.6 Quellen (alle WebSearch-Auszüge vom 17.10.2026)

- D1 KVR Audio, „digitalmusician.net goes live“ (Aug. 2005): https://www.kvraudio.com/news-print.php?id=3876 — BELEGT (Auszug)
- D2 CDM, „digitalmusician.net goes public“: https://cdm.link/digitalmusiciannet-goes-public-online-music-collaboration/ — BELEGT (Auszug)
- D3 Mix Online, Digital Musician Link (VST 2, DSL, „remote record … in sync with your playback“): https://www.mixonline.com/?p=89419 — BELEGT (Auszug)
- D4 KVR Audio, „Online Collaboration via VST announced“ (Zeitstempel, Puffer, „patent pending“, mp3, Send File, MTC): https://www.kvraudio.com/news/digitalmusician_net_online_collaboration_via_vst_announced_3298 — WAHRSCHEINLICH (Auszug, vom Suchwerkzeug zusammengefasst)
- D5 KVR Audio, DML 1.5 (Gegensprechen, Webcam, Chat, Live-Input): https://www.kvraudio.com/news/5015 — BELEGT (Auszug); Jahr UNBELEGT
- D6 Synthtopia, „Free Plug-In Lets You Collaborate From Pro Tools, Logic“ (21.11.2006): https://www.synthtopia.com/content/2006/11/21/free-plug-in-lets-you-collaborate-from-pro-tools-logic/ — WAHRSCHEINLICH (nur Titel)
- D7 pressetext (07.02.2006, fast 4.000 Musiker): https://www.pressetext.com/news/online-musikstudio-digitalmusiciannet-schafft-globale-musiker-community.html — BELEGT (Auszug)
- D8 RME, Interview Charlie Steinberg: https://www.archiv.rme-audio.de/en/artists/charlie_steinberg.php — BELEGT (Auszug)
- D9 Wikipedia, „Karl Steinberg“: https://en.wikipedia.org/wiki/Karl_Steinberg — BELEGT (Auszug)
- D10 Audio Masterclass, DM-Recorder (Spuren zuteilen, zentraler Server): https://www.audiomasterclass.com/blog/dm-digital-musician-debuts-dm-recorder-online-multitrack-recording-software — BELEGT (Auszug); Datum UNBELEGT
- D11 KVR, Digital Musician Messenger (DMM): https://www.kvraudio.com/product/digital_musician_messenger_dmm_by_digitalmusician_net — BELEGT (Auszug)
- D12 KVR, Digital Musician Container (DMC): https://www.kvraudio.com/product/digital_musician_container_dmc_by_digitalmusician_net — BELEGT (Auszug)
- D13 Synthtopia, DMP (20.11.2010): https://www.synthtopia.com/content/2010/11/20/digital-musician-intros-online-music-collaboration-plugin/ — BELEGT (Auszug)
- D14 rekkerd.org: https://rekkerd.org/?p=27295 ; Rapmag: https://rapmag.com/a/11/mar11/production-news-march-2011 ; Mix Online: https://www.mixonline.com/?p=60844 — BELEGT (Auszug)
- D15 Gearspace (keine AU-Version, 22.11.2010): https://gearspace.com/threads/digitalmusician-net-launches-the-digitalmusician-plug-in.552037/ — WAHRSCHEINLICH (Auszug)
- D16 KVR-Forum „Audio over IP“: https://www.kvraudio.com/forum/viewtopic.php?t=141526 — WAHRSCHEINLICH (Meinung)
- D17 Image-Line-Forum (2009, „meist niemand online“): https://forum.image-line.com/viewtopic.php?p=303933 — WAHRSCHEINLICH (Meinung, Auszug abgeschnitten)
- D18 Sound On Sound, „Remote Collaboration“: https://www.soundonsound.com/techniques/remote-collaboration — WAHRSCHEINLICH (Auszug)
- D19 digitalmusician.net, Offline-Seite („closed down on June 30, 2018“): https://www.digitalmusician.net/ — BELEGT (Auszug)
- D20 VI-Control, „Remote session – what after digitalmusicion?“ (ca. 2020): https://vi-control.net/community/threads/remote-session-what-after-digitalmusicion.91049/ — WAHRSCHEINLICH (Auszug)
- D21 VST Connect seit 2012 / Cubase 7: https://musictech.com/tutorials/cubase/collaborate-with-vst-connect-in-cubase/ , https://www.steinberg.net/vst-connect/ — BELEGT (Auszug); Verbindung zu Digital Musician UNBELEGT
- D22 Cockos, NINJAM (Intervall-Prinzip): https://www.cockos.com/ninjam/ — BELEGT (Auszug)
