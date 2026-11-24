// M3 textspiegel – eigenes deutsches Wörterbuch (selbst zusammengestellt, 16.11.2026). KEINE Liste aus LIWC, DE-LIWC, SentiWS
// oder NRC abgeschrieben (deren Lizenzen sperren die Weitergabe bzw. kommerzielle Nutzung). Grammatikwörter sind Allgemeingut.
// Schreibweise: Wörter klein, durch Leerzeichen getrennt. „wort*“ = alle Wörter, die so anfangen (gegen die deutsche Beugung).
// Wörter dürfen in mehreren Gruppen stehen (z. B. „nie“: absolut und Verneinung). „allem“ fehlt bewusst („vor allem“). Dokumentation: ticke/QUELLEN.md §3.3.

export const GRUPPEN = {
  ich: { name: 'Ich-Wörter', kurz: 'ich, mir, mein …',
    liste: 'ich mich mir mein meine meinen meinem meiner meines meins' },
  wir: { name: 'Wir-Wörter', kurz: 'wir, uns, unser …',
    liste: 'wir uns unser unsere unseren unserem unserer unseres unsre' },
  du: { name: 'Du-Wörter', kurz: 'du, dich, dein, euch …',
    liste: 'du dich dir dein deine deinen deinem deiner deines deins euch euer eure euren eurem eurer eures' },
  man: { name: '„man“', kurz: 'man',
    liste: 'man' },
  menschen: { name: 'Andere Menschen', kurz: 'Freunde, Familie, zusammen …',
    liste: `freund* familie* eltern* mutter mütter vater väter mama papa bruder brüder schwester* geschwister* sohn söhne tochter töchter
      kind kinder oma omas opa opas großeltern onkel tante* cousin* partner* ehefrau ehemann leute menschen mensch team* gruppe*
      kolleg* nachbar* verein vereins vereine gemeinsam* zusammen miteinander gespräch* reden rede redest redet redeten geredet sprechen spreche
      sprichst spricht sprach gesprochen treffen treffe triffst trifft traf trafen getroffen besuch* feier* party* gäste gast
      helfen helfe hilfst hilft half halfen geholfen hilfe hilfsbereit* unterstütz* zuhören zugehört jemand jemanden jemandem beziehung*` },
  freude: { name: 'Freude-Wörter', kurz: 'froh, schön, Spaß, stolz …',
    liste: `froh fröhlich* glücklich* glück freude* freue freust freut freuen freute freuten gefreut spaß lachen lache lachst lacht lachte
      gelacht lächel* lächle schön* toll* super genial* wunderbar* herrlich* großartig* lieb liebe lieben liebst liebt liebte geliebt
      liebevoll* liebling* lieblings* mag magst mögen gern gerne stolz* dankbar* danke zufrieden* entspannt* gelassen* gemütlich*
      wohlfühl* wohlgefühlt begeistert* begeisterung neugierig* spannend* lustig* witzig* mutig* mut hoffnung* hoffe hoffst hofft
      zuversicht* vertrau* freiheit gut prima perfekt* erfüllt* erleichtert* motiviert* inspiriert* genieße genießt genießen genoss
      genossen gefällt herzlich* glückwunsch*` },
  belastung: { name: 'Belastungs-Wörter', kurz: 'traurig, Angst, Wut, Stress …',
    liste: `traurig* trauer* unglücklich* angst ängste ängstlich* sorge sorgen besorgt* wut wütend* ärger* sauer genervt* nervt nervig*
      nervös* stress gestresst* stressig* enttäusch* frust* hass* einsam* schlecht* schlimm* furcht* fürchte* panik* verletzt* kränk*
      schäm* scham peinlich* schuld* unsicher* unruhig* verzweifel* hilflos* weinen weine weinst weint weinte geweint schmerz* leid
      leiden leide überfordert* erschöpft* langweil* eifersucht* eifersüchtig* neid* neidisch* bedrückt* niedergeschlagen* blöd*
      doof mist scheiß* stört störe störst gestört traurigkeit` },
  absolut: { name: 'Absolute Wörter', kurz: 'immer, nie, alles, total …',
    liste: `immer nie niemals nimmer alle alles allen aller jeder jede jedes jedem jeden jedesmal jederzeit ständig stets völlig
      total komplett absolut nichts niemand niemanden niemandem vollkommen vollständig ewig überall nirgends nirgendwo unbedingt definitiv` },
  vergangenheit: { name: 'Vergangenheit', kurz: 'war, hatte, früher, gestern …',
    liste: `war warst waren wart gewesen hatte hattest hatten hattet wurde wurdest wurden früher damals gestern vorgestern letztens
      neulich kürzlich einst ehemals ehemalig* vorher zuvor bisher ging gingen kam kamen sagte sagten machte machten dachte dachten
      wollte wolltest wollten konnte konntest konnten musste musstest mussten durfte durften sah sahen fand fanden gab gaben saß
      stand lief liefen fuhr fuhren blieb blieben wusste wussten merkte merkten fühlte fühlten spielte spielten lernte lernten
      arbeitete lebte lebten erzählte` },
  zukunft: { name: 'Zukunft', kurz: 'werde, morgen, bald, will …',
    liste: `werde wirst wird werden werdet morgen übermorgen später bald demnächst künftig* zukünftig* zukunft irgendwann nächste nächsten
      nächster nächstes plane planst plant planen vorhaben vorhabe vornehmen vorgenommen will willst wollen möchte möchtest möchten
      ziel ziele hoffe hoffst hofft hoffen` },
  vorsicht: { name: 'Vorsicht und Zögern', kurz: 'vielleicht, eigentlich, zögern …',
    liste: `vielleicht eventuell möglicherweise vermutlich wahrscheinlich eher irgendwie eigentlich ungefähr scheinbar anscheinend
      unsicher* zweifel* zweifle zögere zögerst zögert zögern gezögert zögerlich* abwarten abwarte warte wartest wartet warten gewartet
      überlege überlegst überlegt überlegen grübel* grüble vorsichtig* vorsicht aufschieb* aufgeschoben verschieb* verschoben
      vermeide vermeidest vermeidet vermeiden vermieden zurückhalt* befürchte* bedenken` },
  handeln: { name: 'Tun und Anpacken', kurz: 'machen, anfangen, schaffen …',
    liste: `mache machst macht machen machte machten gemacht tue tust tut tun tat taten getan fange fängst fängt anfangen angefangen
      beginne beginnst beginnt beginnen begonnen starte startest startet starten gestartet schaffe schaffst schafft schaffen geschafft
      anpacken angepackt umsetzen umgesetzt entscheide entscheidest entscheidet entscheiden entschieden versuche versuchst versucht
      versuchen probiere probierst probiert probieren ausprobieren ausprobiert baue baust baut bauen gebaut erledige erledigst erledigt
      erledigen ändere änderst ändert ändern geändert übe übst übt üben geübt trainiere trainierst trainiert trainieren arbeite
      arbeitest arbeitet arbeiten gearbeitet kämpfe kämpfst kämpft kämpfen gekämpft erreiche erreichst erreicht erreichen durchziehen
      durchgezogen loslegen losgelegt handle handelst handelt handeln gehandelt organisiere organisierst organisiert organisieren` },
  begruenden: { name: 'Begründen und Nachdenken', kurz: 'weil, deshalb, merke …',
    liste: `weil deshalb deswegen darum daher denn warum wieso weshalb grund gründe verstehe verstehst versteht verstehen verstanden
      merke merkst merkt merken gemerkt erkenne erkennst erkennt erkennen erkannt denke denkst denkt denken gedacht glaube glaubst
      glaubt glauben geglaubt weiß weißt wissen gewusst sinn bedeutet bedeutung nachdenken nachgedacht` },
  verneinung: { name: 'Verneinungen', kurz: 'nicht, kein, nie …',
    liste: 'nicht kein keine keinen keinem keiner keines nie niemals nichts niemand niemanden niemandem nein weder' },
  // 0.3: Gegenpol zu „absolut“ – Wörter, die eine Aussage abstufen („Hedges“, Lakoff 1973). Überschneidung mit „vorsicht“ ist gewollt.
  abgestuft: { name: 'Abgestufte Wörter', kurz: 'meistens, oft, eher …',
    liste: `meistens meist oft öfter öfters manchmal gelegentlich selten teilweise teils größtenteils überwiegend ziemlich fast kaum
      halbwegs einigermaßen ungefähr etwa eher vielleicht eventuell möglicherweise vermutlich wahrscheinlich irgendwie gewissermaßen relativ` }
};

// Reihenfolge und Gruppen der Anzeige
export const ORDNUNG = [
  { id: 'wer', titel: 'Wer kommt vor', gruppen: ['ich', 'wir', 'du', 'man', 'menschen'] },
  { id: 'gefuehl', titel: 'Gefühle', gruppen: ['freude', 'belastung'] },
  { id: 'zeit', titel: 'Zeit', gruppen: ['vergangenheit', 'zukunft'] },
  { id: 'haltung', titel: 'Haltung', gruppen: ['vorsicht', 'handeln', 'absolut', 'begruenden', 'verneinung'] }
];

// Wörter vor einem Gefühlswort, die es umdrehen („nicht glücklich“). Fenster: 3 Wörter davor, im selben Satzteil.
export const VERNEINER = 'nicht kein keine keinen keinem keiner keines nie niemals nichts ohne kaum nimmer weder';
// Gefühls-Verben, bei denen das „nicht“ meist DAHINTER steht („Ich freue mich nicht“). Fenster: 3 Wörter danach, im selben Satzteil.
export const VERB_NACH = 'freue freust freut freuen mag magst mögen liebe liebst liebt lieben genieße genießt genießen gefällt hoffe hofft lache lacht ' +
  'hasse hasst ärgere ärgert fürchte fürchtet schäme schämt nervt stört weine weint';
// „meine/meinen“ ist nach diesen Wörtern ein Verb („ich meine“, „was meinen sie“), kein Ich-Wort.
export const MEINEN_VERB_NACH = 'ich du er sie es wir ihr man was das wer die der dies';

// Vergangenheit, zusammengesetzt: Hilfsverb + Partizip im selben Satz („habe … gemacht“, „bin … gegangen“).
export const HILFSVERBEN = 'habe hast hat haben habt bin bist ist sind seid';
// Partizipien ohne „ge-“ (nur gezählt, wenn ein Hilfsverb im Satz steht)
export const PARTIZIP_OHNE_GE = `bekommen verloren vergessen verstanden erlebt erzählt entschieden begonnen besucht passiert probiert ausprobiert versucht
  erreicht erkannt verändert studiert trainiert telefoniert entdeckt verbracht organisiert reagiert diskutiert beschlossen empfunden
  bemerkt erfahren`;
// Wörter mit „ge…t/en“, die meist KEIN Partizip sind (Adjektive, Verben auf ge-, Ortswörter)
export const GE_AUSNAHMEN = `gestern gegen genau gerne gern gesund gemeinsam gelten gewinnen gewinnt genießen genießt gehören gewöhnen gestalten
  gestaltet gelingen gelingt geschehen geschieht gebrauchen gefallen gefällt gestehen gelangen gerecht gesamt gerät gelassen gespannt
  gestresst genervt gelangweilt geeignet gewohnt getrennt gebunden geduldet gewiss geheim gesellt geborgen geliebt`;

// Abkürzungen, deren Punkt KEIN Satzende ist (als reguläre Ausdrücke, ohne Groß/klein)
export const ABKUERZUNGEN = ['z\\.\\s?b\\.', 'd\\.\\s?h\\.', 'u\\.\\s?a\\.', 'u\\.\\s?u\\.', 'z\\.\\s?t\\.', 'o\\.\\s?ä\\.', 'usw\\.', 'bzw\\.', 'ca\\.',
  'etc\\.', 'evtl\\.', 'ggf\\.', 'vgl\\.', 'nr\\.', 'bspw\\.', 'inkl\\.', 'sog\\.', 'dr\\.', 'mio\\.', 'mrd\\.', 'std\\.', 'min\\.', 'max\\.', 'str\\.', 'st\\.', 'jh\\.', 'abs\\.', 'gr\\.'];

// Wörter, die für „Wörter, die wiederkehren“ (Tiefer lesen) nicht zählen: Artikel, Fürwörter, Bindewörter, Hilfs- und Allerweltsverben.
export const STOPP = `aber alle allem allen aller alles als also am an andere anderen anderer anderes auch auf aus bei beim bin bis bist bloß da dabei dadurch
  dafür dagegen daher damit dann daran darauf darin darüber das dass davon dazu dem den denen denn der deren des dessen dich die dies diese
  diesem diesen dieser dieses dir doch dort du durch eben echt ein eine einem einen einer eines einfach einige einmal er es etwas euch euer
  für gab gar geben gegen geht gehen ging gibt habe haben hast hat hatte hatten her hier hin hinter ich ihm ihn ihnen ihr ihre ihrem ihren
  ihrer im immer in ins ist ja jede jedem jeden jeder jedes jetzt kann kannst kein keine keinem keinen keiner können könnte machen macht
  mache machte mal man manche manchmal mehr mein meine meinem meinen meiner mich mir mit muss musste müssen nach nicht nichts noch nun nur
  ob oder ohne schon sehr sein seine seinem seinen seiner seit selbst sich sie sind so soll sollte sondern sonst über um und uns unser
  unsere unter viel viele vielen vom von vor war waren warst was weil weiter welche welchem welchen welcher wenn wer werde werden wie wieder
  will wir wird wirklich wo wollen wollte würde würden wurde wurden zu zum zur zwar zwischen sagen sagt sage sagte gesagt finde findet
  fand gefunden kommt komme kam kommen sehe sieht sah sehen lässt lasse dinge ding sache sachen halt total ganz genau gerade gern gerne
  okay klar natürlich eigentlich vielleicht irgendwie ziemlich wirklich besonders bisschen dafür denke denkt glaube weiß einen eins zwei
  drei mehr meisten oft eher fast kaum bald heute morgen gestern dort hier dabei danach davor deshalb deswegen darum trotzdem obwohl
  sowie sowohl weder noch beide beiden beim seid sei wäre wären hätte hätten habt hab tun tut tue getan gemacht mag möchte darf kann
  wenig lange lang später danach dabei paar viel vielleicht dass einem einfach weiß`;

// Zahl der Einträge (für die Methoden-Anzeige)
export const ANZAHL = Object.values(GRUPPEN).reduce((s, g) => s + g.liste.split(/\s+/).filter(Boolean).length, 0);
