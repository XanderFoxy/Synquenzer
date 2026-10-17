# SYNQUENZER · Spezial: Digital Musician (digitalmusician.net, DML) und was wir daraus lernen

Stand 17.10.2026. Auftrag: Klarstellung von Xander in `v3-ideen/fragen-xander-9.md`, Abschnitt „Klarstellungen (17.10., späte Nachricht)“: Mit „die Music“ war **Digital Musician** gemeint (DigitalMusician.net, Digital Musician Recording Link). Es soll ins Zusammenarbeits-Modell einfließen.
Baut auf `v3-ideen/r8/zusammenarbeit-modell.md` (Q1–Q52) und auf VC3 aus `v3-ideen/r6/nachtrag/p4-teilB.md` auf. Beide Dateien wurden nur gelesen und **nicht** geändert. Der Nachtrag für das Modell steht in Abschnitt 8 dieser Datei und kann dort eingefügt werden.

**Belegstatus.** BELEGT: Die Quelle sagt es direkt. WAHRSCHEINLICH: Drittquelle, Forenmeinung, eine Zusammenfassung des Suchwerkzeugs oder ein plausibler Schluss. UNBELEGT: kein Beleg gefunden, nur Vermutung.
**Methode.** Direkte Seitenabrufe gingen nicht. WebFetch scheiterte mit DNS-Fehlern (`getaddrinfo ENOTFOUND`, u. a. bei en.wikipedia.org, kvraudio.com und synthtopia.com), und curl wurde vom Proxy abgewiesen (403 bei web.archive.org und vi-control.net). Alle Angaben stammen deshalb aus **Suchauszügen** (WebSearch) und sind mit „(Auszug)“ markiert. Die Originalseiten habe ich nicht selbst gelesen.
**Namen.** Die Firma nennt ihre Produkte nicht immer gleich: DML = *Digital Musician Link* (die Presse schreibt auch „Recording Link“), DMR / DM-Recorder, DMM = *Digital Musician Messenger*, DMC = *Digital Musician Container*, DMP = *Digital Musician Plug-in*.

---

## 0. Kurzantwort für Xander

- **Was es war:** Ein Online-Dienst aus Deutschland, gegründet von **Charlie (Karl) Steinberg und Manfred Rürup**, also den Gründern der Firma Steinberg (Cubase). Ein Plug-in im Sequencer verband zwei Studios übers Internet. Der Partner spielte zu deiner Wiedergabe ein, und seine Aufnahme landete **sample-genau im Takt** in deinem Projekt, trotz Internet-Verzögerung. (D1, D3, D8, D9)
- **Laufzeit:** Start im August 2005. Am **30. Juni 2018** wurde der Dienst abgeschaltet; seitdem steht auf der Seite nur „offline“. (D1, D19)
- **Was es *nicht* war:** Ein echtes gleichzeitiges Jammen, bei dem beide sich ohne Verzögerung hören, war es nicht. Es war **Fern-Aufnahme**: Ein Studio gibt den Takt vor, das andere spielt dazu, und die Aufnahme wird zeitlich ausgerichtet. Das ist ein Schluss aus D3 und D4, also WAHRSCHEINLICH.
- **Was wir übernehmen:** (1) Live gespielte Noten tragen die **Song-Position**, nicht die Uhrzeit, und erklingen beim Partner im **nächsten Loop-Durchlauf**. (2) Was im Jam entsteht, wird automatisch eine **Version**. (3) Wir setzen auf **Paar-Räume statt öffentlicher Börse**, denn bei Digital Musician war oft niemand online. (4) Es gibt eine **Raus-Garantie**: Alles lässt sich exportieren, weil auch Dienste wie dieser einfach abgeschaltet werden. Details in Abschnitt 6.

---

## 1. Was es war: Zeitleiste

| Zeit | Ereignis | Beleg |
|---|---|---|
| April 2005 | Ankündigung; öffentlicher Start für August versprochen | D2 BELEGT (Auszug), D4 WAHRSCHEINLICH |
| Aug. 2005 | digitalmusician.net geht nach der Beta online. Kern ist der **DML**, ein VST-Plug-in, das MIDI und Audio übers Internet sendet und empfängt. Das Standard-Konto ist kostenlos. Partner sind Steinberg, Native Instruments und Ableton | D1 BELEGT (Auszug), D2 BELEGT (Auszug) |
| 2005 | Mix beschreibt den DML so: Er verbindet zwei VST-2-Programme per Audio und MIDI über eine **normale DSL-Leitung** und erlaubt „remote record … in sync with your playback“ | D3 BELEGT (Auszug) |
| 07.02.2006 | Pressemitteilung (Berlin): fast **4.000 Musiker** nutzen die Plattform. Betreiber ist die DM Digital Musician GmbH, Geschäftsführer Hans Jörg Bordin. Der DML ist kostenlos | D7 BELEGT (Auszug) |
| Jahr unklar (Musikmesse) | **DML 1.5**: Gegensprech-Mikrofon und Webcam gehören zum Standard, dazu Chat. Eine „Live-Input“-Funktion gleicht für Cubase- und Nuendo-Nutzer die Eingangs-Latenz von Live-Instrumenten aus | D5 BELEGT (Auszug); das Jahr ist UNBELEGT, 2006 ist WAHRSCHEINLICH |
| Nov. 2006 | Synthtopia: „Free Plug-In Lets You Collaborate From Pro Tools, Logic“, also ein Weg über VST hinaus | D6 WAHRSCHEINLICH (nur Titel und URL-Datum) |
| ca. 2007–2008 | **DM-Recorder**: 16-Spur-Rekorder für Live- oder zeitversetzte Sitzungen. Der Projektbesitzer **teilt Spuren einzelnen Mitgliedern zu**, die Dateien liegen auf einem **zentralen Server**. Dazu Gegensprechen, Video und ReWire zu Cubase und Logic; läuft unter Windows XP/Vista und Mac OS X | D10 BELEGT (Auszug); das Datum ist WAHRSCHEINLICH (wegen „Vista“) |
| danach | **DMC** (Container) vereint DMR und DML in einem Programm, mit ReWire und Peer-to-Peer-Aufnahme in Echtzeit; Version 2.0.1 | D12 BELEGT (Auszug) |
| Dez. 2009 | Nutzer im Image-Line-Forum: Der DML sei „nicht sehr beliebt, weil meist niemand online ist“. Ein Beitrag vom 04.12.2009 sagt, der DML-Dienst sei beendet worden; der Auszug ist abgeschnitten | D17 WAHRSCHEINLICH (Meinung) |
| Nov. 2010 / März 2011 | **DMP 2.0**: Insert-Plug-in (VST/AU) mit einem Audio- und einem Videostrom. Es arbeitet Peer-to-Peer, braucht ASIO oder Core Audio und eine schnelle Leitung, bietet sample-genaue Synchronisation, Drag-and-drop für Audiodateien, Video, Gegensprechen und Chat und ist für registrierte Mitglieder kostenlos. Gleichzeitig erscheint **DMC 2.0** als eigenständiges Programm | D13 BELEGT (Auszug), D14 BELEGT (Auszug) |
| 22.11.2010 | Gearspace: noch **keine AU-Version** | D15 WAHRSCHEINLICH; widerspricht D13 („VST or AU“), offen |
| **30.06.2018** | Abschaltung. Die Seite meldet sinngemäß „closed down on June 30, 2018“, nennt aber keinen Grund | D19 BELEGT (Auszug) |
| ca. 2020 | Forum: „Now this is all down“. Jemand fragt nach Ersatz, die Antworten nennen Steinberg **VST Connect** | D20 WAHRSCHEINLICH (Auszug) |

**Widerspruch geklärt (WAHRSCHEINLICH):** „DML-Dienst beendet“ (2009, D17) und „Abschaltung 2018“ (D19) passen zusammen, wenn 2009 nur der alte DML 1.x durch DMC und DMP abgelöst wurde und die Plattform selbst bis 2018 lief. Dass DMP und DMC erst 2010/11 erschienen (D13, D14), stützt diese Lesart.

---

## 2. Wie die Zusammenarbeit funktionierte

| Thema | So machte es Digital Musician | Beleg |
|---|---|---|
| **Grundidee** | Charlie Steinberg sagt im RME-Interview, die Idee komme aus der Audio-Synchronisation in Netzwerken. Diese lasse sich „auch im Web“ nutzen. Später sei das Konzept auf zeitversetzte Projekte und Studioarbeit erweitert worden | D8 BELEGT (Auszug) |
| **Echtzeit?** | „Remote record … in sync with your playback“: Der Partner hört deine Wiedergabe und spielt dazu. Seine Aufnahme wird in deine Zeitachse eingepasst. Ein **symmetrisches Jammen**, bei dem beide sich gleichzeitig hören, wird nirgends behauptet | D3 BELEGT (Auszug); „nicht symmetrisch“ ist ein eigener Schluss, WAHRSCHEINLICH |
| **Latenz** | Audio und MIDI werden **mit Zeitstempel** über TCP/IP verschickt. Ein Puffer gleicht Latenz und Netzstau aus, damit die Aufnahme „für den Nutzer immer synchron“ ist. Die Technik war „patent pending“ | D1 BELEGT (Auszug), D4 WAHRSCHEINLICH (Auszug); ein Patent habe ich nicht gefunden, UNBELEGT |
| **Eingangs-Latenz** | „Live-Input“ gleicht die Latenz von live eingespielten Instrumenten aus (Cubase/Nuendo) | D5 BELEGT (Auszug) |
| **Transport** | In passenden Programmen steuert man den Transport des Partners per MTC fern, in anderen startet der Partner von Hand | D4 WAHRSCHEINLICH (Auszug) |
| **Tonqualität live** | Während der Sitzung läuft der Ton **mp3-komprimiert**, bis 256 kbit/s einstellbar. Ein Nutzer: „kostenlos, wenn 128 kbit/s mp3 reichen“ | D4 WAHRSCHEINLICH, D16 WAHRSCHEINLICH (Meinung) |
| **Dateiaustausch** | „Send File“: Lieblings-Takes gehen **später verlustfrei** hinterher. Beim DMM laufen unkomprimierte Takes, Texte oder **Verträge im Hintergrund** während der Sitzung. Beim DM-Recorder liegen die Projektdateien auf einem zentralen Server, ohne E-Mail- oder FTP-Grenzen. DMP 2.0 kann Audiodateien per Drag-and-drop übernehmen | D4 WAHRSCHEINLICH, D11 BELEGT (Auszug), D10 BELEGT (Auszug), D13 BELEGT (Auszug) |
| **Versionen** | Ein Versionsverlauf, Zweige oder ein Zusammenführen sind **nirgends belegt**. Der Stand lag im DAW-Projekt des Besitzers; der Server diente als Dateiablage | UNBELEGT (nichts gefunden) |
| **Rollen und Rechte** | Der **Projektbesitzer teilt Spuren zu** (DM-Recorder). Verträge konnten als Datei mitgeschickt werden (DMM). Vor der Nutzung musste man ein **Online-Projekt auf der Website** anlegen | D10 BELEGT (Auszug), D11 BELEGT (Auszug), D18 WAHRSCHEINLICH (Auszug) |
| **Kommunikation** | Gegensprechen, Webcam und Chat im Plug-in. Eine Liste der angemeldeten Nutzer mit Einladungen | D5 BELEGT (Auszug), D13 BELEGT (Auszug), D17 WAHRSCHEINLICH |
| **Konten** | Standard-Konto kostenlos. Ein Nutzer nennt drei Kontostufen, die erste kostenlos, und kritisiert eine „Monatsgebühr“. Preise habe ich nicht gefunden | D1, D2 BELEGT (Auszug); D16 WAHRSCHEINLICH; Preise UNBELEGT |
| **Gemeinschaft** | „Gelbe Seiten“ für Session-Musiker: Man findet Fremde für Aufnahmen | D3 WAHRSCHEINLICH (Auszug, Mix-Formulierung über das Suchwerkzeug) |

---

## 3. Warum es endete

- **Offiziell:** Es gibt **keinen** genannten Grund. Die Seite meldet nur die Abschaltung zum 30.06.2018 (D19, BELEGT, Auszug).
- **Mögliche Gründe (alle UNBELEGT, eigene Deutung):**
  1. **Zu wenige gleichzeitig online.** Echtzeit-Fernaufnahme mit Fremden braucht viele Nutzer zur selben Zeit. Der Forenbefund von 2009 (D17) passt dazu.
  2. **Konkurrenz im eigenen Programm.** Steinberg liefert seit **2012 bzw. Cubase 7** VST Connect SE in Cubase und Nuendo mit (D21 BELEGT, Auszug). Ob VST Connect auf Technik von Digital Musician beruht, ist UNBELEGT; ich habe keine Quelle dafür gefunden.
  3. **Pflegeaufwand.** Plug-in-Formate (VST, AU, RTAS), ASIO/Core Audio und Betriebssysteme mussten über 13 Jahre gepflegt werden; AU kam spät (D15).
  4. **Technikwandel.** Die Lösung war für DSL-Zeiten und Desktop-Programme gebaut, nicht für Browser und Handy.

## 4. Was Nutzer mochten und was nicht

| mochten | Beleg | mochten nicht | Beleg |
|---|---|---|---|
| sample-genau im Takt trotz Internet | D1, D8 (Hersteller), D16 „pretty cool“ | **meist niemand online** | D17 WAHRSCHEINLICH |
| kostenloser Einstieg | D1, D2, D7 | Monatsgebühr für mehr Qualität; „nur VST“ | D16 WAHRSCHEINLICH |
| Video, Gegensprechen und Chat direkt im Programm | D5, D13 | „braucht etwas Feinarbeit“, bis es passt | D16 WAHRSCHEINLICH |
| verlustfreie Takes kommen nach | D4, D11 | lange keine AU-Version | D15 WAHRSCHEINLICH |
| – | – | Vorbereitung nötig: erst ein Online-Projekt auf der Website, dazu schnelle Leitung und ASIO | D18, D14 |
| – | – | plötzlich weg, Nutzer suchen Ersatz | D19, D20 |

Unabhängige Messungen oder Tests der Latenz habe ich **nicht** gefunden. Die KVR-Produktseiten zeigen null Bewertungen (Auszug, WAHRSCHEINLICH).

---

## 5. Vergleich (nur das Neue; die Einzelheiten zu den anderen stehen in `r8/zusammenarbeit-modell.md`, Abschnitt 1)

| | Digital Musician (2005–2018) | Ohm Studio | Splice Studio | BandLab (Fork) | Endlesss | NINJAM (zum Vergleich) |
|---|---|---|---|---|---|---|
| **Was reist übers Netz?** | Audio- und MIDI-Strom mit Zeitstempel, später verlustfreie Dateien (D1, D4, D11) | Projekt-Änderungen, das Projekt liegt auf dem Server (Q12–Q14) | ganze DAW-Projektdateien (Q7, Q9) | Revisionen im Browser-Projekt (Q1–Q4) | Loop-Schichten = Rifffs (Q19) | Audio-Intervalle (D22) |
| **Umgang mit Latenz** | ausgleichen: Puffer plus Ausrichten auf die Zeitachse des Besitzers | nicht live hörbar, nur Änderungen synchronisieren | keine Echtzeit | eingeschränkt live | taktgenau, Loop-basiert | **absichtlich verlängern**: Man hört die anderen ein Intervall später, z. B. 16 Schläge (D22) |
| **Rollen** | Besitzer/Taktgeber und Partner; Spuren zuteilen (D10) | gleichberechtigt | Besitzer und Mitwirkende | Ersteller erlaubt Forks | gleichberechtigt im Jam | gleichberechtigt |
| **Versionen / Zweige** | keine belegt | Server-Versionen, Zweige offen | Liste ohne Unterschiede, kein Merge (Q11) | Revisionen und Fork, das Original bleibt | Rifff-Kette, jeder Stand bleibt | keine (Mitschnitt möglich) |
| **Ende** | 30.06.2018 (D19) | seit ca. 2013 keine Updates (Q15) | 2023 (Q7) | aktiv | Mai 2024 (Q21) | aktiv (D22) |

**Was Digital Musician von allen anderen unterscheidet:** Es war das einzige System, das **Fern-Aufnahme mit Ausrichtung auf die Zeitachse** zum Kern machte, für ein **ungleiches Paar** wie Produzent und Session-Musiker. Was danach mit dem Projekt geschah, also Versionen, Zweige oder Übernehmen, löste es nicht; das blieb im DAW-Projekt des Besitzers. Damit ergänzt es das r8-Modell genau an der Stelle, die dort noch offen ist: das **Live-Einspielen in VC3**. WAHRSCHEINLICH, eigener Schluss aus der Tabelle.

---

## 6. Lehren für SYNQUENZER (konkret)

Kurzbezug: Supabase-Paar-Räume (VO2), Versionen und Zweige (ZA-A … ZA-D in `r8/zusammenarbeit-modell.md`), Live-Jam VC3 (R0 Raum-Check, R1 Taktsynchron; „Live-Noten aus der Ferne“ steht bisher im Nicht-Umfang).

**L1 · Zeitstempel in Musik-Zeit statt Uhrzeit (aus D1/D3).**
- Jedes live gespielte Ereignis trägt `{szene:uid, spur:uid, takt, tick}` relativ zum Taktanker des TAKTGEBERs aus R1, keine Wanduhr-Zeit.
- Der Empfänger spielt es an genau dieser Song-Position. Es ist immer zu spät für den laufenden Durchlauf. Deshalb gilt die Regel: **Es erklingt beim Partner im nächsten Loop-Durchlauf desselben Clips.** Das ist NINJAMs Intervall (D22), angewendet auf unsere Clip-Länge.
- Musikalisch passt das, weil SYNQUENZER-Clips Loops sind. Eigener Schluss, WAHRSCHEINLICH; Hörtest nötig.
- So wird „Live-Noten aus der Ferne“ zu einem **kleinen** Schritt ohne Audio-Übertragung. Neues Teilpaket **VC3-R1b „Fern-Einspielen“**.
- Last-Rechnung, Status WAHRSCHEINLICH:
  - Die Noten werden **pro Schlag gebündelt** in einer Nachricht verschickt. Bei 124 BPM sind das etwa 2,1 Nachrichten/s je Spieler, auch bei Sechzehnteln.
  - Eine Note ist etwa 25 B JSON groß. Bei bis zu 16 Noten je Schlag ergibt das unter 0,5 KB je Nachricht.
  - Beides liegt deutlich unter den VC3-Grenzen (≤ 10 Nachrichten/s, ≤ 4 KiB) und unter den Free-Plan-Grenzen (Q46).
  - Würde jedes Note-An und Note-Aus einzeln verschickt, kämen bei Sechzehnteln etwa 16 Nachrichten/s zusammen. Das wäre zu viel.

**L2 · Jam-Take wird Version (aus „Send File“, D4/D11).**
- Digital Musician trennte die flüchtige Vorschau (mp3-Strom) vom verlässlichen Ergebnis (verlustfreie Datei danach).
- Bei uns ist die Vorschau der Broadcast der Noten (L1), das Ergebnis eine Version über `commit_version`.
- Regel: Endet ein eingespielter Durchlauf (Loop-Ende oder Stopp), speichert das Gerät des Spielers den Clip **automatisch als Version** (`kind='save'`, Label „Jam-Take 3 · René“). Das erfüllt „jede Speicherung eine Version“ (r8, Abschnitt 6) und ähnelt der Rifff-Kette von Endlesss (Q19).
- Bei uns gibt es keinen Qualitätsverlust, denn Noten sind verlustfrei. Damit fällt der Schwachpunkt „128 kbit/s mp3“ von Digital Musician weg (D16).

**L3 · Ungleiche Rollen nur im Live-Modus (aus DM-Recorder, D10).**
- VC3 hat schon TAKTGEBER/MITSPIELER und die Spur-Zuteilung „Dieses Gerät spielt: …“.
- Neu: Die Zuteilung setzt automatisch die **Anwesenheit** aus r8, Abschnitt 7, mit einem neuen Fokus-Typ `{art:'spur', spur:uid}`. Damit gilt auf der zugeteilten Spur die **weiche Sperre** für den anderen.
- Außerhalb des Jams bleiben beide gleichberechtigt; Besitzer-Rechte wie bei DM gibt es im Paar-Raum nicht.

**L4 · Keine öffentliche Börse, Paar-Räume zuerst (aus D17).**
- Fremde zu finden, die gerade online sind, hat bei Digital Musician nicht getragen. SYNQUENZER bleibt bei **Paar-Räumen mit Zustimmung** (O2/O3) und bekommt keine Lobby.
- Die zeitversetzte Arbeit (ZA-A/B) muss allein voll tragen; der Jam (VO3/VC3) bleibt **optional**, wie in r6 schon geplant.
- Zum Verabreden genügt der vorhandene Hinweis „René ist da“ (VO3). Eine eigene Termin-Funktion bauen wir nicht.

**L5 · Keine Einstiegshürden (aus D14, D15, D18).**
- Digital Musician verlangte Plug-in-Installation, ASIO/Core Audio, eine schnelle Leitung und ein vorab angelegtes Online-Projekt.
- Bei uns genügt **ein Link** im Paar-Raum. Der R0-Raum-Check sagt das Ergebnis in Klartext: „Jam geht gut“, „Jam geht, Partner hört dich einen Durchlauf später“ oder „Nur zeitversetzt“.
- Fällt R0 schlecht aus, bleibt Fern-Einspielen (L1) trotzdem möglich, denn es braucht keine kurze Laufzeit, nur Ordnung. Eigener Schluss, WAHRSCHEINLICH. Damit wird die R0-Schwelle (Median ≤ 150 ms) nur noch für das **gemeinsame Starten** gebraucht, nicht für das Fern-Einspielen.

**L6 · Kein eigenes Gegensprechen oder Video.**
- Digital Musician baute Talkback, Webcam und Chat ein (D5, D13). Für uns lohnt das nicht: Budget, und Supabase ist kein Medien-Server.
- Empfehlung: Parallel telefonieren, mit Kopfhörern.
- Ob Safari die Web-Audio-Wiedergabe während eines laufenden Telefonats oder FaceTime-Anrufs weiter spielt oder leiser macht, ist **UNBELEGT** und muss am iPhone geprüft werden (Abnahme DM-06).

**L7 · Raus-Garantie (aus D19/D20).**
- Digital Musician verschwand mit einer einzigen Offline-Seite (D19); Jahre später suchten Nutzer noch Ersatz (D20). Das bestätigt r8, Lehre 5.
- Konkret:
  - Im Menü gibt es **„Alles exportieren“**: alle Projekte **mit vollständigem Verlauf** (Manifeste und Teile) als eine Datei.
  - Die App kann diese Datei **ohne Server** wieder einlesen (`kind='import'` gibt es im r8-Schema schon).
  - Bei der Füllstand-Warnung (80 %) und einmal im Jahr erinnert die App an den Export.
  - Weil alles in normalem Postgres liegt, ließe sich der Dienst notfalls selbst betreiben. Das ist eine Eigenschaft von Supabase, hier nicht geprüft: WAHRSCHEINLICH.

**L8 · Mitwirkende statt Verträge (aus D10/D11).**
- Digital Musician verschickte Verträge als Dateien. Wir bauen keine Rechte- oder Vertragsverwaltung.
- Aus `versions.author` und `parts.created_by` (r8, Abschnitt 9) lässt sich aber billig eine **Mitwirkenden-Liste je Song** erzeugen: wer welche Spur im aktuellen Stand gespielt hat. Sie kommt in den Export und in die Projektinfo.
- Das ist ein Vorschlag. Ob Xander das braucht, ist offen (Frage F2).

**L9 · Standard statt Sondertechnik.**
- DM nutzte eine eigene Peer-to-Peer-Technik („patent pending“, D4). Wir bleiben bei Supabase Realtime (Broadcast und Presence). WebRTC brauchen wir nicht, weil nur winzige Ereignisse reisen (L1).
- Die tatsächliche Laufzeit über Supabase am iPhone ist ungemessen (r8 ZA-05, r7 online.md „Echte Latenz … ungemessen“); R0 misst sie.

---

## 7. Abnahme-Ergänzungen (Entwurf, passend zu VC3 und ZA)

- [ ] **DM-01** Fern-Einspielen: Ein Mock-Raum mit 150 ms Laufzeit und ±15 ms Schwankung. Der MITSPIELER spielt 4 Takte Sechzehntel. Beim TAKTGEBER erklingen sie ab dem nächsten Durchlauf, jede Note an derselben Song-Position (Tick-genau, Abweichung 0 Ticks).
- [ ] **DM-02** Bündelung: Bei 124 BPM sendet ein Spieler im Mittel ≤ 2,5 Nachrichten/s, keine Nachricht ist größer als 4 KiB.
- [ ] **DM-03** Jam-Take: Nach Loop-Ende oder Stopp liegt genau eine neue Version mit Label „Jam-Take n · Name“ vor; bei Funkloch landet sie im Postausgang und geht nicht verloren.
- [ ] **DM-04** Spur-Zuteilung → Anwesenheit: Ist „Bass“ René zugeteilt, zeigt Xanders Gerät am Bass den orangen Ring. Tippt Xander auf einen Bass-Clip, erscheint die weiche Sperre (Mockup m2).
- [ ] **DM-05** Export/Import: „Alles exportieren“ und danach Import auf einem frischen Gerät ohne Netz ergeben denselben Verlauf (gleiche Anzahl Versionen, gleiche Manifest-Hashes).
- [ ] **DM-06** iPhone (eK): Während eines Telefonats bzw. FaceTime-Anrufs spielt die App weiter; Pegel und Unterbrechungen protokollieren. Ergebnis offen.

## 8. NACHTRAG für `r8/zusammenarbeit-modell.md` (zum Einfügen; die Datei wurde nicht geändert)

> **Ersetzt Abschnitt 3 „‚die Music‘: Kandidaten“:**
>
> ## 3. „die Music“ = Digital Musician (geklärt 17.10.)
> Xander meinte **Digital Musician** (digitalmusician.net), gegründet 2005 von Charlie Steinberg und Manfred Rürup und am **30.06.2018 abgeschaltet** (D9, D1, D19). Ein Plug-in (DML, später DMP/DMC) verband zwei Sequencer übers Internet. Der Partner spielte zur Wiedergabe des Besitzers ein, und die Aufnahme wurde trotz Latenz **sample-genau auf die Zeitachse** gelegt (Zeitstempel und Puffer, D3, D4). Live lief der Ton als mp3, verlustfreie Takes kamen per „Send File“ nach (D4, D11). Der Besitzer teilte Spuren zu (D10). Versionen oder Zweige sind nicht belegt. Nutzer lobten die Synchronität und klagten, dass meist niemand online war (D17). Einzelheiten und Belege: `r7/spezial-digitalmusician.md`.
> **Folgen für das Modell:** Fern-Einspielen mit Song-Position und einem Durchlauf Versatz (VC3-R1b), Jam-Take wird automatisch Version, Spur-Zuteilung setzt Anwesenheit und weiche Sperre, keine öffentliche Börse, „Alles exportieren“ samt Verlauf (L1–L8 dort).
>
> **In Abschnitt 0 ersetzen:** „‚die Music‘: unklar …“ → „**‚die Music‘** = Digital Musician (2005–2018): Fern-Aufnahme im Takt. Wir übernehmen das Prinzip für den Jam: Noten statt Ton, der Partner hört sie im nächsten Durchlauf, jeder Take wird eine Version.“
> **In Abschnitt 5 ergänzen:** Fokus-Art `'spur'` (gesetzt durch die Jam-Spur-Zuteilung).
> **In Abschnitt 12 ergänzen:** ZA-D (optional) + „Fern-Einspielen (VC3-R1b), Jam-Take als Version“. ZA-A + „Alles exportieren / Importieren mit Verlauf“.
> **In Abschnitt 13 ergänzen:** DM-01 … DM-06.
> **In Abschnitt 15 streichen:** Frage 1 („die Music“: welcher Dienst?).

## 9. Offene Punkte

- **F1 (an Xander, eine Zeile):** „Bei Digital Musician hat einer gespielt und der andere aufgenommen. Reicht dir das für den Jam (René hört dich einen Durchlauf später), oder willst du, dass ihr gleichzeitig startet und euch sofort hört?“ Das Zweite ginge nur bei kurzer Laufzeit (R0) und auch dann nicht ohne Versatz.
- **F2 (an Xander):** Brauchst du eine Mitwirkenden-Liste je Song (L8)?
- **Recherche-Lücken:** Preise der Kontostufen, das Patent, der genaue Abschalt-Grund und eine Verbindung zu VST Connect: alles UNBELEGT. Mit Zugriff auf web.archive.org (vom Proxy gesperrt) ließe sich das nachprüfen.

---

## Quellen

Alle Angaben stammen aus WebSearch-Auszügen vom 17.10.2026; ich habe keine Seite direkt gelesen (siehe Methode).
- D1 KVR Audio, „digitalmusician.net goes live“ (Aug. 2005): https://www.kvraudio.com/news-print.php?id=3876 — BELEGT (Auszug)
- D2 CDM, „digitalmusician.net goes public: online music collaboration“: https://cdm.link/digitalmusiciannet-goes-public-online-music-collaboration/ — BELEGT (Auszug)
- D3 Mix Online über den Digital Musician Link (VST 2, DSL, „remote record … in sync with your playback“): https://www.mixonline.com/?p=89419 — BELEGT (Auszug)
- D4 KVR Audio, „digitalmusician.net – Online Collaboration via VST announced“ (Zeitstempel, TCP/IP, Puffer, „patent pending“, mp3 bis 256 kbit/s, Send File, MTC): https://www.kvraudio.com/news/digitalmusician_net_online_collaboration_via_vst_announced_3298 — WAHRSCHEINLICH (Auszug; das Suchwerkzeug hat Einzelaussagen mehrerer Treffer zusammengefasst)
- D5 KVR Audio, DML 1.5 (Gegensprech-Mikrofon, Webcam, Chat, Live-Input): https://www.kvraudio.com/news/5015 — BELEGT (Auszug); Jahr UNBELEGT
- D6 Synthtopia, „Free Plug-In Lets You Collaborate From Pro Tools, Logic“ (21.11.2006): https://www.synthtopia.com/content/2006/11/21/free-plug-in-lets-you-collaborate-from-pro-tools-logic/ — WAHRSCHEINLICH (nur Titel)
- D7 pressetext, „Online-Musikstudio digitalmusician.net schafft globale Musiker-Community“ (07.02.2006): https://www.pressetext.com/news/online-musikstudio-digitalmusiciannet-schafft-globale-musiker-community.html — BELEGT (Auszug)
- D8 RME, Künstlerseite/Interview Charlie Steinberg: https://www.archiv.rme-audio.de/en/artists/charlie_steinberg.php — BELEGT (Auszug)
- D9 Wikipedia, „Karl Steinberg“ (Mitgründer von digitalmusician.net, „now-discontinued“): https://en.wikipedia.org/wiki/Karl_Steinberg — BELEGT (Auszug)
- D10 Audio Masterclass, „DM Digital Musician debuts DM-Recorder online multitrack recording software“: https://www.audiomasterclass.com/blog/dm-digital-musician-debuts-dm-recorder-online-multitrack-recording-software — BELEGT (Auszug); Datum UNBELEGT
- D11 KVR, Produktseite Digital Musician Messenger (DMM): https://www.kvraudio.com/product/digital_musician_messenger_dmm_by_digitalmusician_net — BELEGT (Auszug)
- D12 KVR, Produktseite Digital Musician Container (DMC): https://www.kvraudio.com/product/digital_musician_container_dmc_by_digitalmusician_net — BELEGT (Auszug)
- D13 Synthtopia, „Digital Musician Intros Online Music Collaboration Plugin“ (20.11.2010): https://www.synthtopia.com/content/2010/11/20/digital-musician-intros-online-music-collaboration-plugin/ — BELEGT (Auszug)
- D14 rekkerd.org (DMP 2.0 / DMC 2.0): https://rekkerd.org/?p=27295 ; Rapmag, Production News März 2011: https://rapmag.com/a/11/mar11/production-news-march-2011 ; Mix Online: https://www.mixonline.com/?p=60844 — BELEGT (Auszug)
- D15 Gearspace, „Digitalmusician.net Launches the Digitalmusician Plug-In“ (keine AU-Version, 22.11.2010): https://gearspace.com/threads/digitalmusician-net-launches-the-digitalmusician-plug-in.552037/ — WAHRSCHEINLICH (Auszug)
- D16 KVR-Forum, „Audio over IP“ (Monatsgebühr, nur VST, 128 kbit/s mp3 kostenlos, drei Kontostufen, „pretty cool“): https://www.kvraudio.com/forum/viewtopic.php?t=141526 — WAHRSCHEINLICH (Meinung; die Zuordnung der Zitate zu genau diesem Faden hat das Suchwerkzeug vorgenommen)
- D17 Image-Line-Forum, „FL Community integration with Collaboration tool“ (2009): https://forum.image-line.com/viewtopic.php?p=303933 (auch p=304386, p=304761, p=304827) — WAHRSCHEINLICH (Meinung, Auszug abgeschnitten)
- D18 Sound On Sound, „Remote Collaboration“ (Online-Projekt zuerst auf der Website anlegen): https://www.soundonsound.com/techniques/remote-collaboration — WAHRSCHEINLICH (Auszug)
- D19 digitalmusician.net, Offline-Seite („closed down on June 30, 2018“): https://www.digitalmusician.net/ — BELEGT (Auszug)
- D20 VI-Control, „Remote session – what after digitalmusicion?“ (ca. 2020, VST Connect als Ersatz): https://vi-control.net/community/threads/remote-session-what-after-digitalmusicion.91049/ — WAHRSCHEINLICH (Auszug)
- D21 VST Connect seit 2012 / Cubase 7, SE in Cubase 7/7.5 und Nuendo 6/6.5: https://musictech.com/tutorials/cubase/collaborate-with-vst-connect-in-cubase/ , https://sonicstate.com/news/2014/07/16/control-cubase-from-your-ipad/ , https://www.steinberg.net/vst-connect/ — BELEGT (Auszug); Verbindung zu Digital Musician UNBELEGT
- D22 Cockos, NINJAM (Intervall-Prinzip): https://www.cockos.com/ninjam/ — BELEGT (Auszug)
- Q1–Q52: siehe `v3-ideen/r8/zusammenarbeit-modell.md`, Abschnitt „Quellen“ (nicht wiederholt).
