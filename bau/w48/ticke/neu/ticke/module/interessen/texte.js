// M2 interessen – Lern-Inhalt der Äste (reine Daten, kein DOM, kein Import → auch in Node testbar).
// Vertrag „aeste()“: Inhalt unabhängig von den Antworten. Keine Zahl über ihn, keine Wertung, keine Links nach draußen.
// Ast-IDs = vorhandene Ergebnis-Schlüssel (interessen.ehrlichkeit, interessen.rhythmus) bzw. Bereichs-IDs (R I A S E C).
const ue = (titel, id) => ({ titel, route: 'training/uebung/' + id });

export const AESTE = [
  {
    id: 'interessen.ehrlichkeit', titel: 'Ehrlichkeit und Bescheidenheit', bereich: 'Persönlichkeit',
    pole: [
      { name: 'Strategisch und statusbewusst', text: 'Du setzt dich für deinen Vorteil ein, verhandelst gut, zeigst, was du kannst, und genießt schöne Dinge und Anerkennung.' },
      { name: 'Fair und bescheiden', text: 'Du spielst mit offenen Karten, nimmst dir nicht mehr, als dir zusteht, und stellst dich nicht über andere.' }
    ],
    wasEsIst: 'Ehrlichkeit-Bescheidenheit ist im HEXACO-Modell ein eigener, sechster Grundzug neben den bekannten Big Five. Er beschreibt, wie viel Raum jemand dem eigenen Vorteil gibt – und wie viel dem fairen Ausgleich mit anderen, auch dann, wenn es niemand merken würde. Dazu gehören vier Teile: Aufrichtigkeit, Fairness, Genügsamkeit und Bescheidenheit. Beide Richtungen kommen bei Menschen ganz normal vor, und beide haben ihren Nutzen: Die eine schafft Vertrauen, die andere sorgt dafür, dass man nicht zu kurz kommt. Die meisten Menschen tragen etwas von beiden Seiten in sich, je nach Lage mehr von der einen oder der anderen.',
    imAlltag: [
      'Was du tust, wenn du an der Kasse zu viel Wechselgeld bekommst.',
      'Wie du über deine Erfolge sprichst – ob du sie zeigst oder eher kleinredest.',
      'Wie wichtig dir Marken, ein teures Auto oder ein bestimmter Status sind.',
      'Wie du verhandelst: um jeden Vorteil oder um einen Ausgleich, mit dem beide gut leben.',
      'Ob du anderen sagst, was sie hören wollen, oder geradeheraus bist.'
    ],
    staerken: [
      'Fair und bescheiden: Andere vertrauen dir leichter, und Zusammenarbeit läuft oft reibungslos.',
      'Fair und bescheiden: Du nutzt Lücken nicht aus – das macht dich verlässlich.',
      'Strategisch und statusbewusst: Du setzt dich für dich ein und lässt dir nicht leicht etwas wegnehmen.',
      'Strategisch und statusbewusst: Du zeigst, was du kannst – das hilft bei Preisen, Bewerbungen und wenn deine Arbeit gesehen werden soll.',
      'Strategisch und statusbewusst: Der Wunsch nach Anerkennung und schönen Dingen kann ein starker Antrieb sein.'
    ],
    reibung: [
      'Wer sehr bescheiden ist, verkauft sich womöglich unter Wert – bei Preisen, in Verhandlungen oder beim Zeigen der eigenen Arbeit.',
      'Wer sehr fair spielt, ärgert sich leicht über andere, die es nicht tun.',
      'Merken andere, dass es vor allem um den eigenen Vorteil geht, kann ihr Vertrauen sinken – und Zusammenarbeit wird schwerer.',
      'Status und Luxus können viel Geld und Aufmerksamkeit binden.',
      'Im Wettbewerb kann Bescheidenheit bremsen, in langen Freundschaften kann der eigene Vorteil bremsen.'
    ],
    weiterdenken: [
      'In welchen Momenten ist dir Fairness wichtiger als dein Vorteil – und wann ist es umgekehrt?',
      'Wann hast du zuletzt etwas Gutes von dir erzählt? Wie hat es sich angefühlt?',
      'Wo verkaufst du dich vielleicht unter Wert – und wo vielleicht über Wert?',
      'Was würdest du mit Geld tun, das niemand sieht?',
      'Woran merkst du, dass jemand fair zu dir ist?'
    ],
    ueben: [ue('Was dir wichtig ist', 'w-werte'), ue('Danke-Nachricht', 'a-danke'), ue('Um eine Rückmeldung bitten', 'w-rueckmeldung')],
    verwandt: ['bigfive.vertraeglichkeit', 'interessen.E', 'interessen.S'],
    unteraeste: [
      { id: 'interessen.ehrlichkeit.aufrichtigkeit', titel: 'Aufrichtigkeit', text: 'Ob du anderen geradeheraus begegnest oder auch mal schmeichelst und taktierst, um etwas zu erreichen. Die eine Seite ist klar und direkt, die andere diplomatisch – beides kann in Gesprächen helfen.' },
      { id: 'interessen.ehrlichkeit.fairness', titel: 'Fairness', text: 'Wie streng du es mit Regeln nimmst, wenn es um deinen Vorteil geht – auch wenn niemand hinsieht. Die eine Seite ist verlässlich, die andere beweglich.' },
      { id: 'interessen.ehrlichkeit.genuegsamkeit', titel: 'Genügsamkeit', text: 'Wie wichtig dir Geld, Luxus und Status sind. Die eine Seite braucht wenig, die andere genießt schöne Dinge und zieht Antrieb daraus.' },
      { id: 'interessen.ehrlichkeit.bescheidenheit', titel: 'Bescheidenheit', text: 'Ob du dich mit anderen auf eine Stufe stellst oder gern zeigst, was du kannst. Die eine Seite wirkt zugänglich, die andere selbstbewusst.' }
    ],
    wissen: 'HEXACO-Modell nach Kibeom Lee und Michael Ashton. Die Aussagen in dieser App sind angelehnt an die gemeinfreien IPIP-HEXACO-Skalen (Ashton, Lee & Goldberg 2007) und die Kurzform Mini-IPIP6 (Sibley u. a. 2011), eigene Übersetzung. Eine große Zusammenfassung von Studien mit Geld-Spielen (Thielmann, Spadaro & Balliet 2020) fand: Wer sich fairer und bescheidener beschreibt, teilt im Mittel etwas fairer – vor allem dort, wo man andere ausnutzen könnte. Die Zusammenhänge sind mäßig.'
  },
  {
    id: 'interessen.riasec', titel: 'Interessen: das Sechseck', bereich: 'Interessen',
    wasEsIst: 'Interessen beschreiben, welche Tätigkeiten dich anziehen – nicht, was du kannst. Der Forscher John Holland hat sie in sechs Bereiche eingeteilt: praktisch-technisch (R), forschend (I), künstlerisch-gestaltend (A), sozial (S), unternehmerisch (E) und ordnend (C); die Buchstaben kommen aus dem Englischen. Die Bereiche liegen wie ein Sechseck im Kreis: Nachbarn ähneln sich, Gegenüber sind sich am fremdesten. Fast jeder Mensch wird von mehreren Bereichen angezogen – das Muster aus allen sechs sagt mehr als ein einzelner. Hinter dem Sechseck stecken zwei Achsen: Dinge oder Menschen, Daten oder Ideen.',
    imAlltag: [
      'Welche Aufgaben du freiwillig machst, wenn dir niemand etwas vorgibt.',
      'Wobei du die Zeit vergisst.',
      'Welche Videos, Bücher oder Gespräche dich fesseln.',
      'Welche Teile eines Projekts du gern übernimmst – und welche du lieber abgibst.'
    ],
    staerken: [
      'Wer weiß, was ihn anzieht, kann Aufgaben und Projekte gezielter wählen.',
      'Tätigkeiten, die zu den eigenen Interessen passen, gehen im Mittel leichter von der Hand, und man bleibt eher dabei.',
      'Mehrere Bereiche, die dich anziehen, lassen sich oft in einem Projekt verbinden.',
      'Auch Bereiche, die dich wenig rufen, sind nützlich zu kennen: Dort kannst du dir Menschen suchen, die genau das gern machen.'
    ],
    reibung: [
      'Interessen und Können sind nicht dasselbe – manches, das dich anzieht, musst du erst lernen.',
      'Ziehen dich zwei gegenüberliegende Bereiche an, musst du Tätigkeiten, die beides verbinden, bewusster suchen.',
      'Was dich anzieht, passt nicht immer zu dem, was gerade verlangt wird – dann hilft es, Aufgaben anders zuzuschneiden.',
      'Interessen können sich mit neuen Erfahrungen verschieben – ein Bild von heute legt dich nicht für immer fest.'
    ],
    weiterdenken: [
      'Welche zwei Bereiche würdest du gern in einem Projekt verbinden?',
      'Was hast du als Kind am liebsten gemacht – und was davon steckt heute noch in dir?',
      'Wo kannst du etwas gut, das dich gar nicht so sehr anzieht?',
      'Welcher Bereich ruft dich wenig – und wer in deinem Umfeld liebt genau den?'
    ],
    verwandt: ['interessen.R', 'interessen.I', 'interessen.A', 'interessen.S', 'interessen.E', 'interessen.C', 'bigfive.offenheit', 'bigfive.extraversion'],
    unteraeste: [
      { id: 'interessen.riasec.dinge-menschen', titel: 'Dinge oder Menschen', text: 'Die erste Achse hinter dem Sechseck: Zieht dich eher die Arbeit mit Material, Werkzeug, Technik und Natur an – oder die Arbeit mit Menschen, die man berät, unterrichtet oder überzeugt? Praktisch-technisch liegt am nächsten bei den Dingen, sozial am nächsten bei den Menschen. Beide Pole sind gleich viel wert.' },
      { id: 'interessen.riasec.daten-ideen', titel: 'Daten oder Ideen', text: 'Die zweite Achse: Ziehen dich eher klare Fakten, Zahlen, Ordnung und Abläufe an – oder Einfälle, Theorien, Bilder und Klänge? Ordnend und unternehmerisch liegen näher bei den Daten, forschend und künstlerisch näher bei den Ideen.' },
      { id: 'interessen.riasec.nachbarn', titel: 'Nachbarn und Gegenüber', text: 'Im Sechseck liegen sich praktisch-technisch und sozial, forschend und unternehmerisch, künstlerisch und ordnend gegenüber. Nachbarn lassen sich leicht in einer Tätigkeit verbinden; bei Gegenübern braucht es eine bewusst gesuchte Verbindung.' }
    ],
    wissen: 'Holland (1997) beschreibt die sechs Bereiche und das Sechseck. Tracey & Rounds (1993) haben über viele Studien geprüft, dass die Bereiche tatsächlich im Kreis geordnet sind. Prediger (1982) beschreibt die zwei Achsen Dinge–Menschen und Daten–Ideen. Nye, Su, Rounds & Drasgow (2012): Wer Tätigkeiten macht, die zu seinen Interessen passen, leistet im Mittel mehr und bleibt eher dabei. Low, Yoon, Roberts & Rounds (2005): Interessen sind ab Anfang 20 recht beständig.'
  },
  {
    id: 'interessen.R', titel: 'Praktisch-technisch', bereich: 'Interessen',
    wasEsIst: 'Der praktisch-technische Bereich (R, vom englischen „realistic“) steht für Tätigkeiten mit den Händen, mit Werkzeug, Maschinen, Technik, Tieren oder in der Natur. Hier zählt, was man anfassen kann: Am Ende steht etwas, das gebaut, repariert, gepflanzt oder eingerichtet ist. Wen dieser Bereich anzieht, lernt oft am liebsten durch Ausprobieren. Im Sechseck liegt er neben forschend und ordnend und gegenüber von sozial.',
    imAlltag: [
      'Kabel, Geräte und Technik selbst aufbauen, statt jemanden zu rufen.',
      'Etwas reparieren, statt es neu zu kaufen.',
      'Kochen, Gärtnern, Sport – Tätigkeiten, bei denen man am Ende etwas sieht.',
      'Lieber machen als lange darüber reden.'
    ],
    staerken: [
      'Ein schneller Blick dafür, wie etwas funktioniert und was fehlt.',
      'Greifbare Ergebnisse, die zufrieden machen.',
      'Praktische Lösungen statt endloser Planung.',
      'Vieles selbst können und dadurch unabhängig sein.'
    ],
    reibung: [
      'Lange Besprechungen und reine Theorie können zäh wirken.',
      'Gespräche ohne greifbares Ergebnis können anstrengen – hier liegt das Gegenüber im Sechseck, der soziale Bereich.',
      'Wer am liebsten selbst anpackt, gibt Arbeit ungern ab.',
      'Viele Tätigkeiten am Schreibtisch und am Bildschirm bieten wenig zum Anfassen.'
    ],
    weiterdenken: [
      'Was hast du zuletzt mit deinen Händen gebaut oder repariert – und wie hat es sich angefühlt?',
      'Welche Technik in deinem Alltag würdest du gern verstehen statt nur benutzen?',
      'Wo könntest du ein Projekt anfassbarer machen – etwas bauen statt nur planen?'
    ],
    ueben: [ue('Umgebung umbauen', 'g-umgebung'), ue('Kurz ins Grüne', 'h-gruen')],
    verwandt: ['interessen.I', 'interessen.C', 'interessen.S', 'interessen.riasec'],
    unteraeste: [
      { id: 'interessen.R.technik', titel: 'Technik und Geräte', text: 'Bauen, verkabeln, einrichten, reparieren: Geräte, Elektronik, Studio, Fahrzeuge.' },
      { id: 'interessen.R.handwerk', titel: 'Handwerk und Material', text: 'Holz, Stein, Stoff, Metall: aus Material etwas Haltbares machen.' },
      { id: 'interessen.R.natur', titel: 'Natur und Tiere', text: 'Draußen arbeiten, Pflanzen und Tiere versorgen, mit dem Wetter leben.' }
    ],
    wissen: 'Holland (1997). Die Tätigkeiten in dieser App stammen aus den RIASEC-Markern von Armstrong, Allison & Rounds (2008), ausgewählt aus dem O*NET Interest Profiler. Lage im Sechseck: Tracey & Rounds (1993).'
  },
  {
    id: 'interessen.I', titel: 'Forschend', bereich: 'Interessen',
    wasEsIst: 'Der forschende Bereich (I, vom englischen „investigative“) steht für Verstehen, Untersuchen und Rätsel lösen. Wen er anzieht, will wissen, warum etwas so ist, wie es ist – und gibt sich mit „ist halt so“ ungern zufrieden. Forschen heißt dabei nicht nur Labor und Medizin: Man kann genauso Klänge, Sprache, Technik, Geschichte oder das eigene Lernen untersuchen. Im Sechseck liegt der Bereich neben praktisch-technisch und künstlerisch und gegenüber von unternehmerisch. Die Fragen in dieser App drehen sich vor allem um Natur und Medizin – wer lieber Technik, Musik oder Sprache untersucht, findet sich darin weniger wieder.',
    imAlltag: [
      'Ein Thema recherchieren, bis es wirklich verstanden ist.',
      'Behauptungen prüfen: Stimmt das eigentlich?',
      'Kleine Versuche machen: Was passiert, wenn ich das ändere?',
      'Dokus, Erklär-Videos oder Sachbücher, bei denen die Zeit vergeht.',
      'Muster in eigenen Aufzeichnungen suchen, etwa beim Schlaf oder beim Üben.'
    ],
    staerken: [
      'Gründlichkeit, wo andere an der Oberfläche bleiben.',
      'Neugier als Motor, auch ohne Belohnung von außen.',
      'Schwierige Dinge in Ruhe durchdenken können.',
      'Ein eigenes Urteil statt nachgesprochener Meinungen.'
    ],
    reibung: [
      'Vor lauter Verstehen-Wollen kann das Machen warten.',
      'Verkaufen, Überzeugen und schnelle Entscheidungen ohne alle Fakten – das Gegenüber, unternehmerisch – können fremd wirken.',
      'Anderen sind die Fragen manchmal zu genau oder zu viele.',
      'Routine ohne neue Rätsel kann schnell langweilen.'
    ],
    weiterdenken: [
      'Welche Frage beschäftigt dich gerade, ohne dass dich jemand darum gebeten hat?',
      'Was untersuchst du am liebsten – Natur, Technik, Klang, Sprache oder Menschen?',
      'Wann bist du mit einer Antwort zufrieden – und wann gräbst du weiter?'
    ],
    ueben: [ue('Warum-Fragen stellen', 'l-warum'), ue('Erklär es ganz einfach', 'l-erklaeren')],
    verwandt: ['interessen.R', 'interessen.A', 'interessen.E', 'bigfive.offenheit', 'interessen.riasec'],
    unteraeste: [
      { id: 'interessen.I.natur', titel: 'Natur und Medizin', text: 'Körper, Tiere, Pflanzen, Meer – darum drehen sich die Fragen dieser App vor allem.' },
      { id: 'interessen.I.technik', titel: 'Technik und Zahlen', text: 'Wie Geräte, Programme oder Klänge funktionieren; Daten auswerten und Muster finden.' },
      { id: 'interessen.I.mensch', titel: 'Mensch und Gesellschaft', text: 'Wie Menschen denken, lernen und zusammenleben; Sprache, Geschichte, Psychologie.' }
    ],
    wissen: 'Holland (1997); Tätigkeiten nach Armstrong, Allison & Rounds (2008). Barrick, Mount & Gupta (2003) fassten viele Studien zusammen: Offenheit für Neues hängt im Mittel mit forschenden und künstlerischen Interessen zusammen.'
  },
  {
    id: 'interessen.A', titel: 'Künstlerisch-gestaltend', bereich: 'Interessen',
    wasEsIst: 'Der künstlerisch-gestaltende Bereich (A, vom englischen „artistic“) steht für Ausdruck und Eigenes erschaffen: Musik, Texte, Bilder, Videos, Bühne, Gestaltung. Wen er anzieht, möchte etwas machen, das es so noch nicht gab, und mag Freiraum statt fester Vorgaben. Gestalten ist dabei nicht nur „Kunst“: Auch ein gut gebautes Video, eine besondere Präsentation oder ein eigener Stil beim Kochen gehören dazu. Im Sechseck liegt der Bereich neben forschend und sozial und gegenüber von ordnend.',
    imAlltag: [
      'Songs schreiben, Beats bauen, mit Klängen spielen.',
      'Cover, Logos und kurze Videos gestalten und schneiden.',
      'Einen eigenen Stil entwickeln – in Kleidung, Sprache oder Arbeit.',
      'Aus Vorhandenem etwas Neues machen: Remix, Collage, Sampling.'
    ],
    staerken: [
      'Einfälle und ungewöhnliche Verbindungen.',
      'Gespür für Wirkung: wie etwas klingt, aussieht, sich anfühlt.',
      'Freude am Ausprobieren, auch ohne sicheren Ausgang.',
      'Eine eigene Stimme – Arbeit, die man wiedererkennt.'
    ],
    reibung: [
      'Feste Abläufe, Formulare und viel Ordnung – das Gegenüber, ordnend – können einengen.',
      'Eigenes Werk ist persönlich – Rückmeldungen treffen manchmal tiefer.',
      'Bei vielen Ideen gleichzeitig kann das Fertigmachen schwerer fallen als das Anfangen.',
      'Kreative Arbeit lässt sich oft schwer planen.'
    ],
    weiterdenken: [
      'Was hast du zuletzt erschaffen, worauf du stolz warst?',
      'Wie viel Ordnung braucht deine Kreativität – und wo wird es zu viel?',
      'Welche feste Reihe, zum Beispiel jede Woche ein Stück, würde dir helfen, dranzubleiben?'
    ],
    ueben: [ue('Eine Stärke neu einsetzen', 'w-staerke')],
    verwandt: ['interessen.I', 'interessen.S', 'interessen.C', 'bigfive.offenheit', 'interessen.riasec'],
    unteraeste: [
      { id: 'interessen.A.musik', titel: 'Musik und Klang', text: 'Spielen, schreiben, produzieren, Klänge entwerfen.' },
      { id: 'interessen.A.bild', titel: 'Bild und Gestaltung', text: 'Zeichnen, fotografieren, gestalten, Videos schneiden.' },
      { id: 'interessen.A.wort', titel: 'Wort und Bühne', text: 'Geschichten, Texte, Theater, Auftritte.' }
    ],
    wissen: 'Holland (1997); Tätigkeiten nach Armstrong, Allison & Rounds (2008). Barrick, Mount & Gupta (2003): Offenheit für Neues hängt im Mittel am deutlichsten mit künstlerischen Interessen zusammen.'
  },
  {
    id: 'interessen.S', titel: 'Sozial', bereich: 'Interessen',
    wasEsIst: 'Der soziale Bereich (S, vom englischen „social“) steht für Tätigkeiten mit und für Menschen: helfen, beraten, unterrichten, begleiten, pflegen. Wen er anzieht, freut sich, wenn andere durch ihn etwas verstehen oder es ihnen besser geht. Wichtig sind Gespräche, Zuhören und Zusammenarbeit. Im Sechseck liegt der Bereich neben künstlerisch und unternehmerisch und gegenüber von praktisch-technisch.',
    imAlltag: [
      'Freunden etwas erklären oder beibringen.',
      'Fragen von anderen beantworten, die dir folgen oder dich um Rat bitten.',
      'Zuhören, wenn jemand Sorgen hat.',
      'Gemeinsame Projekte: Band, Chor, Team, Verein.'
    ],
    staerken: [
      'Gespür für das, was andere brauchen.',
      'Geduld beim Erklären.',
      'Menschen fühlen sich gesehen und gut aufgehoben.',
      'Gruppen zusammenhalten.'
    ],
    reibung: [
      'Eigene Bedürfnisse können hinter denen der anderen verschwinden.',
      'Reine Arbeit mit Geräten und Material – das Gegenüber, praktisch-technisch – kann sich leer anfühlen.',
      'Viel Kontakt kostet auch Kraft – Pausen gehören dazu.',
      'Konflikte schmerzen mehr, wenn einem die Beziehung wichtig ist.'
    ],
    weiterdenken: [
      'Wem hast du zuletzt etwas beigebracht – und was hat dir daran gefallen?',
      'Hilfst du lieber einzelnen Menschen oder einer ganzen Gruppe?',
      'Wo endet Helfen für dich, und wo fängt es an, dich zu viel zu kosten?'
    ],
    ueben: [ue('Aktiv zuhören', 'a-zuhoeren'), ue('Eine Nachfrage mehr', 'a-nachfragen')],
    verwandt: ['interessen.A', 'interessen.E', 'interessen.R', 'bigfive.vertraeglichkeit', 'bigfive.extraversion', 'interessen.ehrlichkeit'],
    unteraeste: [
      { id: 'interessen.S.lehren', titel: 'Lehren und Erklären', text: 'Wissen weitergeben: Nachhilfe, Kurse, Anleitungen.' },
      { id: 'interessen.S.helfen', titel: 'Helfen und Begleiten', text: 'Für andere da sein: beraten, pflegen, unterstützen.' },
      { id: 'interessen.S.gemeinschaft', titel: 'Gemeinschaft', text: 'Gruppen zusammenbringen und zusammen etwas machen.' }
    ],
    wissen: 'Holland (1997); Tätigkeiten nach Armstrong, Allison & Rounds (2008). Barrick, Mount & Gupta (2003): Soziale Interessen hängen im Mittel etwas mit Extraversion und Verträglichkeit zusammen.'
  },
  {
    id: 'interessen.E', titel: 'Unternehmerisch', bereich: 'Interessen',
    wasEsIst: 'Der unternehmerische Bereich (E, vom englischen „enterprising“) steht für Anstoßen, Überzeugen, Führen und Verkaufen. Wen er anzieht, möchte etwas in Bewegung bringen, andere für eine Idee gewinnen und Verantwortung übernehmen. Dazu gehören Mut zum Risiko, Verhandeln und Entscheidungen auch dann, wenn noch nicht alles klar ist. Im Sechseck liegt der Bereich neben sozial und ordnend und gegenüber von forschend.',
    imAlltag: [
      'Ein eigenes Angebot starten und verkaufen, etwa Musik, Merch oder einen Kurs.',
      'Live-Formate moderieren und Gäste einladen.',
      'Zusammenarbeit anfragen und Auftritte organisieren.',
      'In der Gruppe sagen: „Lasst uns das so machen.“'
    ],
    staerken: [
      'Antrieb und Tatkraft – Dinge passieren.',
      'Andere mitreißen und für eine Idee gewinnen.',
      'Mut, Chancen zu ergreifen.',
      'Entscheiden können, auch wenn nicht alles klar ist.'
    ],
    reibung: [
      'Langes Untersuchen ohne Ergebnis – das Gegenüber, forschend – kann ungeduldig machen.',
      'Tempo und Ehrgeiz können andere überfahren.',
      'Wer viel wagt, erlebt auch mehr Rückschläge.',
      'Wer viel anstößt, muss darauf achten, dass Angefangenes auch fertig wird.'
    ],
    weiterdenken: [
      'Welche Idee würdest du gern bekannt machen – und wen bräuchtest du dafür?',
      'Wann führst du gern, und wann lässt du lieber andere vorangehen?',
      'Welches Risiko würdest du eingehen, wenn Scheitern okay wäre?'
    ],
    ueben: [ue('Eine kleine Mutprobe', 'w-mutprobe'), ue('WOOP: Wunsch, Ergebnis, Hindernis, Plan', 'z-woop')],
    verwandt: ['interessen.S', 'interessen.C', 'interessen.I', 'bigfive.extraversion', 'interessen.ehrlichkeit', 'interessen.riasec'],
    unteraeste: [
      { id: 'interessen.E.fuehren', titel: 'Führen und Leiten', text: 'Teams aufstellen, Richtung geben, Verantwortung übernehmen.' },
      { id: 'interessen.E.verkaufen', titel: 'Verkaufen und Überzeugen', text: 'Ideen, Angebote oder die eigene Arbeit gut zeigen.' },
      { id: 'interessen.E.gruenden', titel: 'Gründen und Anstoßen', text: 'Eigene Projekte starten, Chancen sehen, etwas aufbauen.' }
    ],
    wissen: 'Holland (1997); Tätigkeiten nach Armstrong, Allison & Rounds (2008). Barrick, Mount & Gupta (2003): Unternehmerische Interessen hängen im Mittel am deutlichsten mit Extraversion zusammen.'
  },
  {
    id: 'interessen.C', titel: 'Ordnend', bereich: 'Interessen',
    wasEsIst: 'Der ordnende Bereich (C, vom englischen „conventional“) steht für Ordnung, Zahlen, Listen und klare Abläufe. Wen er anzieht, mag es, wenn alles seinen Platz hat, Zahlen stimmen und man sich auf ein System verlassen kann. Dazu gehören Planen, Sortieren, Festhalten und sorgfältiges Prüfen. Im Sechseck liegt der Bereich neben unternehmerisch und praktisch-technisch und gegenüber von künstlerisch.',
    imAlltag: [
      'Einen Plan oder Kalender für Projekte führen.',
      'Sammlungen ordnen: Klänge, Fotos, Notizen mit klaren Namen.',
      'Checklisten und Vorlagen bauen, die Zeit sparen.',
      'Einnahmen und Ausgaben im Blick behalten.'
    ],
    staerken: [
      'Verlässlichkeit: Nichts geht verloren.',
      'Überblick, auch wenn es viel wird.',
      'Sorgfalt bei Einzelheiten, die andere übersehen.',
      'Systeme, die allen die Arbeit leichter machen.'
    ],
    reibung: [
      'Viel Freiraum ohne Vorgaben – das Gegenüber, künstlerisch – kann unruhig machen.',
      'Wenn sich Pläne oft ändern, kostet das Nerven.',
      'Andere empfinden Ordnung manchmal als streng.',
      'Perfekte Ordnung kann mehr Zeit kosten, als sie spart.'
    ],
    weiterdenken: [
      'Welches System in deinem Alltag spart dir am meisten Zeit?',
      'Wo würde dir mehr Ordnung guttun – und wo lieber weniger?',
      'Wie könntest du kreative Projekte mit einem klaren Ablauf verbinden?'
    ],
    ueben: [ue('Sichtbar abhaken', 'g-abhaken'), ue('Fortschritt aufschreiben', 'z-fortschritt')],
    verwandt: ['interessen.E', 'interessen.R', 'interessen.A', 'bigfive.gewissenhaftigkeit', 'interessen.riasec'],
    unteraeste: [
      { id: 'interessen.C.zahlen', titel: 'Zahlen und Daten', text: 'Rechnen, auswerten, festhalten.' },
      { id: 'interessen.C.ablaeufe', titel: 'Abläufe und Pläne', text: 'Termine, Listen, Vorlagen – damit alles läuft.' },
      { id: 'interessen.C.archiv', titel: 'Ordnen und Archivieren', text: 'Sammlungen pflegen, sodass man alles wiederfindet.' }
    ],
    wissen: 'Holland (1997); Tätigkeiten nach Armstrong, Allison & Rounds (2008). Barrick, Mount & Gupta (2003): Ordnende Interessen hängen im Mittel etwas mit Gewissenhaftigkeit zusammen.'
  },
  {
    id: 'interessen.rhythmus', titel: 'Tagesrhythmus', bereich: 'Rhythmus',
    pole: [
      { name: 'Früh', text: 'Morgens schnell wach und klar; früh am Tag ist schon viel geschafft; abends kommt die Müdigkeit eher früh.' },
      { name: 'Spät', text: 'Abends wach und voller Einfälle; wenn es draußen ruhig wird, kommt der Schwung; morgens braucht es Anlauf.' }
    ],
    wasEsIst: 'Jeder Mensch hat eine innere Uhr, die mitbestimmt, wann er müde und wann er wach ist. Bei manchen läuft sie früh, bei anderen spät, bei vielen dazwischen – Forscher nennen das den Chronotyp. Ein guter einfacher Hinweis darauf ist die Mitte des Schlafs an freien Tagen, wenn kein Wecker klingelt. Die innere Uhr hängt stark von Biologie und Alter ab: In der Jugend wird sie später, um die 20 ist sie am spätesten, danach wird sie langsam wieder früher. Tageslicht stellt sie jeden Tag ein Stück nach.',
    imAlltag: [
      'Wann du an freien Tagen von selbst einschläfst und aufwachst.',
      'Zu welcher Tageszeit dir Lernen, Schreiben oder Musikmachen leichtfallen.',
      'Ob du am Wochenende viel Schlaf nachholst.',
      'Wann dir die besten Einfälle kommen.',
      'Wie du dich an Tagen mit frühem Termin fühlst.'
    ],
    staerken: [
      'Früh: Die ruhigen Morgenstunden gehören dir, und frühe Termine fallen leichter.',
      'Früh: Schwere Aufgaben sind oft erledigt, bevor der Tag für andere richtig beginnt.',
      'Spät: Abends, wenn es still wird, gelingt oft konzentrierte und kreative Arbeit.',
      'Spät: Abendtermine, Auftritte und Live-Formate liegen in deinen wachen Stunden.',
      'Dazwischen: Du kommst mit vielen Zeitplänen zurecht.'
    ],
    reibung: [
      'Spät: Frühe Termine passen schlecht zur inneren Uhr – unter der Woche kann Schlaf fehlen.',
      'Früh: Späte Veranstaltungen und Abendtermine können schwerfallen.',
      'Ein großer Unterschied zwischen Tagen mit Termin und freien Tagen („sozialer Jetlag“) hängt in Studien mit schlechterem Schlaf und Befinden zusammen.',
      'Wer gegen die eigene Uhr arbeiten muss, braucht für dieselbe Denk-Aufgabe oft mehr Kraft.'
    ],
    weiterdenken: [
      'Wann warst du zuletzt richtig konzentriert – zu welcher Tageszeit war das?',
      'Wie würde dein Tag aussehen, wenn du ihn ganz nach deiner inneren Uhr legen könntest?',
      'Welche Termine könntest du in deine wachen Stunden verschieben?',
      'Was passiert mit deinen Einfällen zur „falschen“ Tageszeit?'
    ],
    ueben: [ue('Dein bestes Zeitfenster nutzen', 'f-fenster'), ue('Morgens raus ins Licht', 'h-morgenlicht'), ue('Abends Licht runter', 'h-abendlicht'), ue('Feste Aufstehzeit', 'h-aufstehen')],
    verwandt: ['bigfive.gewissenhaftigkeit'],
    unteraeste: [
      { id: 'interessen.rhythmus.schlafmitte', titel: 'Die Schlafmitte', text: 'Die Uhrzeit genau in der Mitte zwischen Einschlafen und Aufwachen. An freien Tagen zeigt sie am besten, wann dich die innere Uhr schlafen lässt. Holst du an freien Tagen Schlaf nach, wird das herausgerechnet.' },
      { id: 'interessen.rhythmus.jetlag', titel: 'Sozialer Jetlag', text: 'Der Unterschied zwischen deinem Schlaf an Tagen mit Termin und an freien Tagen – wie eine kleine Zeitreise jede Woche. Je größer er ist, desto mehr arbeitet der Alltag gegen die innere Uhr.' },
      { id: 'interessen.rhythmus.fenster', titel: 'Tagesfenster', text: 'Aufmerksamkeit und Gedächtnis schwanken über den Tag. Meist gibt es einige Stunden nach dem Aufwachen ein gutes Fenster, danach ein Tief und später ein zweites Hoch. Für Einfälle kann gerade die „falsche“ Tageszeit helfen, weil der Kopf dann weniger streng filtert.' }
    ],
    wissen: 'Schlafmitte und Chronotyp nach Roenneberg, Wirz-Justice & Merrow (2003); Verlauf mit dem Alter: Roenneberg u. a. (2004), rund 25.000 Menschen. Sozialer Jetlag: Wittmann, Dinich, Merrow & Roenneberg (2006). Schwankungen beim Denken über den Tag: Schmidt, Collette, Cajochen & Peigneux (2007). Einfälle zur „falschen“ Zeit: Wieth & Zacks (2011). Tageslicht stellt die innere Uhr: Wright u. a. (2013). Die Fragen in dieser App sind eigene, angelehnt an die Schlafmitte – nicht der Münchner Chronotyp-Fragebogen selbst.'
  }
];
