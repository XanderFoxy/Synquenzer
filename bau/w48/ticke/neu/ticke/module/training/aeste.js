// M5 training – Äste für „Dein Muster“ (reine Daten + Rechnen, kein DOM, in Node testbar).
// Je Übungsbereich ein Ast 'training.<gruppe>' (bereich 'Üben') mit zwei gleichwertigen Polen, Lerninhalt und Sprüngen zu den
// eigenen Übungen ('training/uebung/<id>'). musterAusDaten() liest nur, was du selbst eingetragen hast: welche Übungen du gemacht
// hast und wie sie sich für dich angefühlt haben – in Worten, ohne Zahl, ohne richtig oder falsch.
import { GRUPPEN, GRUPPE, UEBUNGEN, UEBUNG } from './uebungen.js';
import { juengstesGefuehl, gemachteIds, gruppeVon } from './plan.js';

const INHALT = {
  fokus: {
    pole: [
      { name: 'Eine Sache in der Tiefe', text: 'Du bleibst lange an einer Aufgabe, tauchst ein und kommst weit, ohne dich zu verzetteln.' },
      { name: 'Beweglich zwischen vielem', text: 'Du hältst mehrere Fäden in der Hand, reagierst schnell und siehst Verbindungen zwischen verschiedenen Dingen.' }
    ],
    wasEsIst: 'Fokus heißt: Die Aufmerksamkeit bleibt eine Weile bei einer Sache. Der Kopf kann nicht wirklich zwei anspruchsvolle Dinge zugleich denken – er schaltet hin und her, und jedes Umschalten kostet etwas Zeit und Genauigkeit. Schon kleine Unterbrechungen wie ein Pling vom Handy ziehen einen Teil der Aufmerksamkeit ab, auch wenn man nicht hinschaut. Fokus ist darum weniger eine Frage von Willenskraft als von Umgebung: Was stört, lässt sich vorher wegräumen. Dazu gehören ein Wechsel aus Anspannung und echter Pause und die Tageszeit, zu der der eigene Kopf am wachsten ist.',
    imAlltag: ['Nach einer Unterbrechung musst du beim Musikmachen oder Schreiben den Faden erst wieder finden.', 'Das Handy auf dem Tisch zieht Blicke an, auch wenn es still ist.',
      'Ein Einfall zu etwas ganz anderem drängt sich mitten in die Arbeit.', 'Nach langer Konzentration wird der Kopf zäh – eine kurze Pause macht ihn wieder frisch.', 'Zu manchen Tageszeiten geht Schweres leichter als zu anderen.'],
    staerken: ['Wer tief bei einer Sache bleibt, kommt bei schwierigen Aufgaben weit und macht weniger Fehler.', 'Wer beweglich zwischen Dingen springt, reagiert schnell und entdeckt Querverbindungen.',
      'Ablenkung vorher zu planen nimmt dem Willen Arbeit ab.', 'Echte Pausen halten die Kraft über den Tag.', 'Wer sein wachstes Zeitfenster kennt, spart Mühe.'],
    reibung: ['Tief eintauchen heißt manchmal, dass Nachrichten und Menschen eine Weile warten müssen.', 'Viel Springen fühlt sich lebendig an, kann Schweres aber in die Länge ziehen.',
      'Feste Regeln wie „Handy weg“ passen nicht in jede Lage, etwa wenn dich jemand erreichen muss.', 'Pausen fühlen sich manchmal wie verlorene Zeit an, obwohl sie Kraft zurückgeben.'],
    weiterdenken: ['Bei welcher Tätigkeit vergisst du die Zeit – und was ist dann anders um dich herum?', 'Was holt dich am häufigsten aus einer Sache heraus: etwas von außen oder ein Gedanke von innen?',
      'Wann am Tag fällt dir Schweres am leichtesten?', 'Welche Art von Pause gibt dir wirklich Kraft zurück?', 'Wo ist dein Springen zwischen Dingen eine Stärke – und wo kostet es dich etwas?'],
    unteraeste: [
      { id: 'umschalten', titel: 'Umschalt-Kosten', text: 'Bei jedem Wechsel zwischen Aufgaben muss sich der Kopf neu einstellen: Welche Regeln gelten jetzt, wo war ich stehen geblieben? Das dauert jedes Mal einen Moment, bei schwierigen Aufgaben länger. Darum ist eine Sache nach der anderen meist schneller als beides zugleich.' },
      { id: 'unterbrechung', titel: 'Unterbrechungen', text: 'Eine Mitteilung muss man nicht einmal lesen, damit sie wirkt: Schon das Wissen, dass etwas gekommen ist, zieht Gedanken ab. Wer Mitteilungen eine Weile stumm schaltet, schützt die Aufmerksamkeit und verpasst trotzdem nichts – nachschauen geht später.' },
      { id: 'offene-schleifen', titel: 'Offene Schleifen', text: 'Unerledigtes meldet sich immer wieder im Kopf. Es hilft schon, es aufzuschreiben und festzulegen, wann du dich darum kümmerst – dann darf der Kopf loslassen.' },
      { id: 'pausen', titel: 'Pausen und Zeitfenster', text: 'Aufmerksamkeit schwankt über den Tag und ermüdet bei langer Anstrengung. Kurze, echte Pausen machen frischer; Schweres gelingt meist besser in der eigenen wachen Zeit.' }
    ],
    verwandt: ['bigfive.gewissenhaftigkeit', 'interessen.rhythmus', 'muster.kontrolle', 'muster.neugier_denken', 'training.gewohnheiten', 'training.gesundheit'],
    wissen: 'Rubinstein, Meyer und Evans (2001) zu den Kosten von Aufgabenwechseln; Stothart, Mitchum und Yehnert (2015) zur Ablenkung durch Handy-Mitteilungen; Masicampo und Baumeister (2011) zu offenen Aufgaben und Plänen; Albulescu und Kollegen (2022) zu kurzen Pausen; Schmidt und Kollegen (2007) zu Tageszeit und Denken.'
  },
  ziele: {
    pole: [
      { name: 'Mit klarem Ziel', text: 'Du weißt, wohin du willst, planst Schritte und bleibst dran – das gibt Richtung und Halt.' },
      { name: 'Offen unterwegs', text: 'Du lässt dich von dem leiten, was unterwegs auftaucht, und findest Wege, die kein Plan vorhergesehen hätte.' }
    ],
    wasEsIst: 'Ein Ziel ist ein Wunsch, der eine Richtung bekommt. Die Forschung zeigt: Schön träumen allein bringt wenig, manchmal sinkt dabei sogar der Antrieb. Hilfreicher ist, den Wunsch mit dem inneren Hindernis zusammen zu denken und festzulegen, was du tust, wenn das Hindernis kommt – so funktionieren WOOP und Wenn-dann-Pläne. Genaue Ziele (was, wie viel, bis wann) geben mehr Halt als „ich gebe mein Bestes“, und wer seinen Weg aufschreibt, sieht, was vorangeht. Ziele sind Werkzeuge: Sie dürfen sich ändern, wenn du dich änderst.',
    imAlltag: ['Ein großes Vorhaben wie ein Album fühlt sich lähmend an, bis der erste kleine Schritt klar ist.', '„Mehr üben“ passiert selten – „nach dem Abendessen Gitarre“ öfter.',
      'Das Hindernis liegt oft innen: Müdigkeit, Scrollen, Zweifel.', 'Ein Blick zurück auf das, was schon vorangegangen ist, gibt neuen Schwung.', 'Manche Ziele passen nach ein paar Wochen nicht mehr – und dürfen gehen.'],
    staerken: ['Mit klarem Ziel lassen sich Kräfte bündeln und Ablenkungen leichter ablehnen.', 'Wer offen unterwegs ist, bleibt beweglich und erkennt Chancen, die auf keinem Plan standen.',
      'Wer das Hindernis vorher kennt, wird von Rückschlägen weniger überrascht.', 'Ein Wenn-dann-Plan nimmt dir die Entscheidung im Moment ab.', 'Kleine nächste Schritte machen große Vorhaben greifbar.'],
    reibung: ['Ein festes Ziel kann den Blick für Umwege und Überraschungen verengen.', 'Ohne Ziel verteilt sich Kraft leicht auf viele Dinge.',
      'Sehr genaue Pläne brauchen Pflege, wenn sich das Leben ändert.', 'Ziele, die von anderen kommen, ziehen oft weniger als eigene.'],
    weiterdenken: ['Welches Ziel trägst du gerade wirklich in dir – und welches nur, weil es erwartet wird?', 'Was ist dein häufigstes inneres Hindernis?',
      'Wie fühlt es sich an, ohne Plan einfach loszugehen?', 'Woran merkst du, dass ein Ziel nicht mehr zu dir passt?', 'Was wäre der kleinste nächste Schritt bei deinem größten Vorhaben?'],
    unteraeste: [
      { id: 'woop', titel: 'WOOP: Wunsch, Ergebnis, Hindernis, Plan', text: 'Gabriele Oettingen fand: Wer sich nur das Gute ausmalt, entspannt sich, als wäre es schon erreicht. Wer danach das innere Hindernis anschaut und einen Plan dafür macht, handelt eher. WOOP verbindet beides in vier kurzen Schritten.' },
      { id: 'wenn-dann', titel: 'Wenn-dann-Pläne', text: 'Ein Satz wie „Wenn ich nach Hause komme, dann übe ich zehn Minuten“ verknüpft eine Situation mit einer Handlung. Kommt die Situation, ist die Entscheidung schon gefallen. Peter Gollwitzer nennt das Durchführungs-Absichten.' },
      { id: 'genau', titel: 'Genaue Ziele', text: 'Edwin Locke und Gary Latham zeigten über Jahrzehnte: Genaue, fordernde Ziele führen im Mittel weiter als ungenaue. Wichtig ist, dass das Ziel reizt und machbar bleibt.' },
      { id: 'bestes-selbst', titel: 'Das beste mögliche Selbst', text: 'Über ein gelungenes Leben in ein paar Jahren zu schreiben, hebt im Mittel etwas die Zuversicht. Danach lohnt der Blick auf das Hindernis, damit aus dem Bild ein Weg wird.' }
    ],
    verwandt: ['bigfive.gewissenhaftigkeit', 'passt.wachstum', 'muster.kontrolle', 'muster.sinn', 'training.gewohnheiten', 'training.wachsen'],
    wissen: 'Oettingen (2012) zum mentalen Kontrastieren; Wang, Wang und Gai (2021), eine Zusammenfassung von 21 Studien zu WOOP; Gollwitzer und Sheeran (2006) zu Wenn-dann-Plänen; Locke und Latham (2002) zur Zielsetzung; Harkin und Kollegen (2016) zum Beobachten des eigenen Fortschritts; Carrillo und Kollegen (2019) zum besten möglichen Selbst.'
  },
  gewohnheiten: {
    pole: [
      { name: 'Feste Abläufe', text: 'Wiederkehrende Abläufe tragen dich durch den Tag; vieles läuft von allein, und Kraft bleibt für Neues.' },
      { name: 'Jeder Tag anders', text: 'Du gestaltest jeden Tag neu, bleibst überraschbar und passt dich leicht an, wenn sich etwas ändert.' }
    ],
    wasEsIst: 'Eine Gewohnheit ist ein Verhalten, das fast von selbst startet, weil eine bestimmte Situation es auslöst – der Kaffee am Morgen, das Nach-Hause-Kommen. Sie entsteht durch Wiederholung in derselben Lage, nicht durch einen einzigen starken Entschluss. In einer bekannten Studie dauerte es im Mittel etwa zwei Monate, bis etwas automatisch lief, mit großen Unterschieden zwischen den Menschen. Einzelne ausgelassene Tage störten dabei kaum. Wer Gewohnheiten ändern will, setzt am besten an der Umgebung und an kleinen Startschritten an.',
    imAlltag: ['Nach dem Zähneputzen greifst du ohne Nachdenken zum Handy – oder zu etwas anderem.', 'Eine Gitarre, die sichtbar auf dem Ständer steht, wird öfter gespielt als eine im Koffer.',
      'Ein Vorsatz klappt ein paar Tage und schläft dann ein, wenn kein fester Auslöser da ist.', 'Etwas Angenehmes wie ein Hörbuch macht etwas Lästiges leichter.', 'Nach einer Reise sind alte Abläufe plötzlich weg – oder neue entstehen.'],
    staerken: ['Feste Abläufe sparen Entscheidungen und geben Halt in unruhigen Zeiten.', 'Wer jeden Tag neu gestaltet, bleibt beweglich und offen für Gelegenheiten.',
      'Kleine Startschritte machen den Anfang leicht.', 'Wer die Umgebung umbaut, braucht weniger Willenskraft.', 'Ein ausgelassener Tag ist kein Rückschritt – Gewohnheiten halten das aus.'],
    reibung: ['Feste Abläufe können eng werden, wenn sich das Leben ändert.', 'Ohne Abläufe muss vieles jeden Tag neu entschieden werden, und das kostet Kraft.',
      'Alte Gewohnheiten laufen auch dann weiter, wenn man sie nicht mehr will.', 'Strenges Abhaken kann aus etwas Schönem eine Pflicht machen.'],
    weiterdenken: ['Welche deiner Gewohnheiten tun dir gut, ohne dass du je darüber nachdenkst?', 'Welcher feste Moment in deinem Tag könnte ein Anker für etwas Neues sein?',
      'Was in deiner Umgebung macht Gutes leicht – und was macht es schwer?', 'Brauchst du gerade mehr Halt oder mehr Abwechslung?', 'Wie gehst du mit einem ausgelassenen Tag um – streng oder freundlich?'],
    unteraeste: [
      { id: 'anker', titel: 'Anker und Auslöser', text: 'Eine neue Gewohnheit hält besser, wenn sie an etwas hängt, das ohnehin jeden Tag passiert: „Nachdem ich …, mache ich …“. Die vorhandene Handlung wird zum Auslöser für die neue.' },
      { id: 'klein', titel: 'Klein anfangen', text: 'Wiederholung zählt mehr als Größe. Eine sehr kleine Fassung, die fast nichts kostet, startet leichter und lässt sich später ausbauen.' },
      { id: 'umgebung', titel: 'Umgebung', text: 'Gewohnheiten hängen an Orten und Dingen. Was sichtbar und griffbereit ist, passiert öfter; was einen Schritt umständlicher ist, seltener.' },
      { id: 'koppeln', titel: 'Angenehmes koppeln', text: 'Wer sich etwas Geliebtes nur zusammen mit etwas Aufgeschobenem erlaubt, macht das Aufgeschobene anziehender. In einer Studie wirkte das einige Wochen lang.' }
    ],
    verwandt: ['bigfive.gewissenhaftigkeit', 'bigfive.offenheit', 'muster.werte_wandel', 'muster.gewohnheiten', 'training.ziele', 'training.gesundheit'],
    wissen: 'Lally und Kollegen (2010) zur Entstehung von Gewohnheiten im Alltag; Gardner, Lally und Wardle (2012) zu Gewohnheit und Gesundheit; Wood und Rünger (2016), eine Übersicht zur Psychologie der Gewohnheit; Milkman, Minson und Volpp (2014) zum Koppeln von Angenehmem und Aufgeschobenem.'
  },
  lernen: {
    pole: [
      { name: 'Festigen', text: 'Du wiederholst, fragst dich ab und baust Wissen Stück für Stück so, dass es lange hält.' },
      { name: 'Erkunden', text: 'Du springst neugierig in Neues, verbindest Gebiete und lernst durch Ausprobieren.' }
    ],
    wasEsIst: 'Lernen heißt, dass etwas im Gedächtnis bleibt und sich später wieder abrufen lässt. Die Forschung ist hier erstaunlich klar: Am meisten bringt es, sich selbst abzufragen und das Üben über die Zeit zu verteilen. Markieren und bloßes Wiederlesen fühlen sich gut an, bringen aber wenig, gerade weil sie leicht sind. Etwas in eigenen Worten zu erklären oder nach dem Warum zu fragen, verknüpft Neues mit Bekanntem, und Schlaf festigt, was tagsüber gelernt wurde. Lernstile wie „visuell“ oder „auditiv“ sind dagegen nicht belegt.',
    imAlltag: ['Vokabeln sitzen nach dem Wiederlesen scheinbar – und sind am nächsten Tag weg.', 'Beim Auswendiglernen eines Songs hängen genau die Stellen, die du nie ohne Blatt gespielt hast.',
      'Wenn du jemandem etwas erklärst, zeigen sich sofort die Lücken.', 'Gemischtes Üben fühlt sich schwerer an und hält trotzdem besser.', 'Nach einer Nacht Schlaf geht ein neuer Griff manchmal plötzlich leichter.'],
    staerken: ['Wer festigt, baut Wissen, auf das er sich verlassen kann.', 'Wer erkundet, findet Verbindungen zwischen Gebieten und bleibt neugierig.',
      'Abfragen zeigt ehrlich, was schon sitzt.', 'Verteiltes Üben spart am Ende Zeit.', 'Erklären macht aus Wissen Verstehen.'],
    reibung: ['Abfragen fühlt sich anstrengender an als Wiederlesen – das ist gewollt, aber nicht immer angenehm.', 'Viel Erkunden kann heißen, dass wenig tief sitzt.',
      'Viel Festigen kann heißen, dass Neues lange warten muss.', 'Was sich beim Lernen leicht anfühlt, ist nicht immer das, was hält.'],
    weiterdenken: ['Was hast du zuletzt wirklich gelernt – und wie?', 'Lernst du lieber in die Tiefe oder in die Breite?',
      'Welches Thema würdest du gern einem Kind erklären?', 'Wann hast du zuletzt gemerkt, dass dein Kopf nach einer Nacht etwas besser konnte?', 'Welches Wissen möchtest du in ein paar Jahren noch sicher haben?'],
    unteraeste: [
      { id: 'abfragen', titel: 'Abfragen', text: 'Wer sich selbst abfragt, holt Wissen aktiv aus dem Gedächtnis. Genau dieses Holen macht es haltbarer – stärker als noch einmal zu lesen.' },
      { id: 'verteilen', titel: 'Verteilen', text: 'Mehrere kurze Einheiten mit Pausen dazwischen halten länger als eine lange. Dazwischen vergisst man ein wenig – und das erneute Erinnern festigt.' },
      { id: 'erklaeren', titel: 'Erklären und Warum-Fragen', text: 'Sich den Stoff selbst zu erklären oder zu fragen, warum etwas so ist, knüpft ihn an Bekanntes. Wo man stockt, zeigt sich eine Lücke.' },
      { id: 'schlaf', titel: 'Schlaf', text: 'Im Schlaf wird Gelerntes gefestigt. Darum lohnt eine kurze Wiederholung am Abend und ein Abfragen am Morgen.' },
      { id: 'lernstile', titel: 'Mythos Lernstile', text: 'Die Idee, jeder lerne am besten über einen bestimmten Sinn, ist weit verbreitet, aber nicht belegt. Wichtiger ist die Art des Übens.' }
    ],
    verwandt: ['bigfive.offenheit', 'muster.lernen', 'muster.neugier_denken', 'interessen.riasec', 'training.fokus', 'training.gesundheit'],
    wissen: 'Dunlosky und Kollegen (2013), eine große Übersicht über Lerntechniken; Roediger und Karpicke (2006) zum Lernen durch Abfragen; Cepeda und Kollegen (2006) zum verteilten Üben; Bisra und Kollegen (2018) zum Selbst-Erklären; Brunmair und Richter (2019) zum gemischten Üben; Rasch und Born (2013) zu Schlaf und Gedächtnis; Pashler und Kollegen (2008) zu Lernstilen.'
  },
  gefuehle: {
    pole: [
      { name: 'Nach innen schauen', text: 'Du nimmst Gefühle wahr, gibst ihnen Worte und verstehst dich dadurch besser.' },
      { name: 'Durch Tun ordnen', text: 'Du sortierst Gefühle, indem du handelst, dich bewegst oder etwas schaffst – und kommst so in Bewegung.' }
    ],
    wasEsIst: 'Gefühle sind Botschaften: Sie zeigen, was dir wichtig ist und was gerade passiert. Man kann sie nicht abschalten, aber ein Stück weit lenken. Am besten belegt ist, eine Lage anders anzusehen – eine zweite Sichtweise zu finden, ohne das Gefühl wegzudrücken; nur unterdrücken ändert am Gefühl selbst wenig. Es hilft auch, Gefühle zu benennen, freundlich mit sich zu sprechen und dem Grübeln einen festen Platz zu geben. Diese Übungen sind für den Alltag – wenn es dir länger schlecht geht, gehört das in gute Hände, etwa zur TelefonSeelsorge oder in eine ärztliche Praxis.',
    imAlltag: ['Ein ärgerlicher Satz von jemandem klingt nach, bis du eine andere Deutung findest.', 'Vor einem Auftritt rast das Herz – ein ruhiger Satz in der Du-Form schafft Abstand.',
      'Abends kreisen Gedanken, die tagsüber keinen Platz hatten.', 'Ein kleiner schöner Moment geht unter, wenn man nicht hinschaut.', 'Nach einem Fehler bist du mit dir strenger, als du es mit einem Freund wärst.'],
    staerken: ['Wer nach innen schaut, versteht seine Gefühle und kann sie anderen erklären.', 'Wer durch Tun ordnet, kommt schnell aus dem Grübeln in die Handlung.',
      'Eine Lage anders zu sehen schafft Spielraum.', 'Freundlich mit sich zu sein macht Fehler leichter tragbar.', 'Ein Gefühl zu benennen dämpft es oft schon ein wenig.'],
    reibung: ['Viel Nachspüren kann in Grübeln übergehen.', 'Viel Tun kann Gefühle überspringen, die eigentlich gehört werden wollen.',
      'Neu bewerten passt nicht immer – manches ist einfach schwer und darf es sein.', 'Übungen ersetzen keine Hilfe, wenn es länger dunkel bleibt.'],
    weiterdenken: ['Welches Gefühl kennst du an dir besonders gut – und welches kaum?', 'Was sagst du dir selbst, wenn etwas schiefgeht?',
      'Wann hilft dir Reden, wann hilft dir Tun?', 'Welche zweite Sichtweise fällt dir zu einer Lage ein, die dich gerade beschäftigt?', 'Welchen kleinen Moment könntest du heute bewusst genießen?'],
    unteraeste: [
      { id: 'neu-bewerten', titel: 'Anders hinschauen', text: 'Eine Lage neu zu deuten – „vielleicht hatte sie einen schweren Tag“ – verändert das Gefühl oft mehr, als es wegzudrücken. Das ist der am besten belegte Weg, Gefühle zu lenken.' },
      { id: 'benennen', titel: 'Gefühle benennen', text: 'Ein Gefühl in ein, zwei Worte zu fassen, schafft einen kleinen Abstand. Die Forschung dazu ist jung, die Befunde sind vorsichtig ermutigend.' },
      { id: 'abstand', titel: 'Abstand durch die Du-Form', text: 'Wer im Stress in der Du-Form oder mit dem eigenen Namen zu sich spricht, sieht die Lage eher von außen – so, wie ein Freund sie sehen würde.' },
      { id: 'selbstmitgefuehl', titel: 'Selbstmitgefühl', text: 'So freundlich mit sich zu sprechen wie mit einem guten Freund, senkt im Mittel Stress und Grübeln. Das heißt nicht, alles gutzuheißen, sondern sich nicht zusätzlich selbst zu treten.' },
      { id: 'gruebeln', titel: 'Dem Grübeln einen Platz geben', text: 'Eine feste, kurze Sorgen-Zeit am Tag kann das Grübeln zu anderen Zeiten leiser machen. Das ist ein erster, kleiner Befund.' }
    ],
    verwandt: ['bigfive.stabilitaet', 'muster.selbstmitgefuehl', 'muster.emotionen', 'muster.stress', 'muster.ungewissheit', 'training.gesundheit'],
    wissen: 'Webb, Miles und Sheeran (2012) zu Wegen, Gefühle zu lenken; Torre und Lieberman (2018) zum Benennen von Gefühlen; Kross und Kollegen (2014) zum Selbstgespräch in der Du-Form; Ferrari und Kollegen (2019) zu Selbstmitgefühl; McGowan und Behar (2013) zur festen Sorgen-Zeit; Cregg und Cheavens (2021) zu Dankbarkeits-Übungen.'
  },
  gesundheit: {
    pole: [
      { name: 'Fester Rhythmus', text: 'Gleiche Zeiten für Schlaf, Licht und Bewegung geben deinem Körper einen verlässlichen Takt.' },
      { name: 'Freier Rhythmus', text: 'Du folgst deinem Gefühl, schläfst, wenn du müde bist, und bewegst dich, wenn es dich zieht – beweglich und selbstbestimmt.' }
    ],
    wasEsIst: 'Körper und Kopf hängen eng zusammen. Eine innere Uhr steuert, wann du wach und wann du müde bist, und ihr wichtigster Taktgeber ist Licht: Licht am Morgen stellt sie früher, helles Licht am Abend später. Regelmäßige Schlafzeiten hängen mit besserem Befinden zusammen, und Koffein am späten Tag verkürzt den Schlaf. Bewegung tut dem Körper gut, und beim Gehen kommen oft mehr Einfälle. Das alles sind Durchschnitts-Befunde – kleine Schritte für den Alltag, keine Behandlung.',
    imAlltag: ['Am Wochenende schläfst du später – und der Montag fühlt sich an wie eine kleine Zeitreise.', 'Nach einem Spaziergang ist eine Idee plötzlich da.',
      'Ein Energydrink am Nachmittag macht das Einschlafen schwerer.', 'Helles Handylicht am Abend hält wach.', 'Nach langem Sitzen fühlt sich der Kopf schwer an.'],
    staerken: ['Ein fester Rhythmus macht Schlaf und Energie verlässlicher.', 'Ein freier Rhythmus lässt Raum für spontane Nächte, Musik und Gelegenheiten.',
      'Morgenlicht hilft der inneren Uhr ganz ohne Aufwand.', 'Bewegung kann Gedanken lösen und Einfälle bringen.', 'Kleine Änderungen bei Licht und Koffein wirken oft spürbar.'],
    reibung: ['Ein fester Rhythmus kann mit Auftritten, Studio-Nächten oder Familie kollidieren.', 'Ein freier Rhythmus kann den Schlaf so verschieben, dass frühe Termine schwer werden.',
      'Gesundheits-Tipps können sich wie Pflicht anfühlen – sie sind Angebote.', 'Bei Beschwerden reichen Alltags-Schritte nicht; dann ist ärztlicher Rat dran.'],
    weiterdenken: ['Wann wirst du von selbst müde, wenn dich nichts hält?', 'Wie unterscheiden sich deine freien Tage von Tagen mit Termin?',
      'Welche Bewegung macht dir wirklich Freude?', 'Wo kommen dir die besten Einfälle – im Sitzen oder unterwegs?', 'Was hilft dir abends, zur Ruhe zu kommen?'],
    unteraeste: [
      { id: 'innere-uhr', titel: 'Innere Uhr und Licht', text: 'Licht ist der stärkste Taktgeber der inneren Uhr. Tageslicht am Morgen stellt sie früher, helles Licht am Abend später – deshalb wirken Morgenspaziergang und gedämpftes Abendlicht.' },
      { id: 'regelmaessig', titel: 'Regelmäßig schlafen', text: 'Wer jeden Tag ähnlich aufsteht, hat im Mittel bessere Leistungen und ein geringeres Gesundheitsrisiko. Das sind Zusammenhänge; ob die Regelmäßigkeit selbst die Ursache ist, ist nicht sicher.' },
      { id: 'koffein', titel: 'Koffein', text: 'Koffein wirkt lange nach. Für eine Tasse Kaffee schlagen Forschende rund neun Stunden Abstand zum Schlafen vor, für sehr starke Mengen mehr.' },
      { id: 'bewegung', titel: 'Bewegung und Natur', text: 'Jede Bewegung zählt, und langes Sitzen zu unterbrechen tut gut. Beim Gehen kommen mehr Einfälle, und nach Zeit im Grünen ist die Aufmerksamkeit oft etwas frischer.' },
      { id: 'atem', titel: 'Langsam atmen', text: 'Ruhiges, langsames Atmen senkte in Studien das Stress-Gefühl im Mittel etwas. Länger aus- als einzuatmen ist eine einfache Form davon.' }
    ],
    verwandt: ['interessen.rhythmus', 'muster.stress', 'bigfive.stabilitaet', 'training.fokus', 'training.gefuehle', 'training.gewohnheiten'],
    wissen: 'Blume, Garbazza und Spitschan (2019) zu Licht und innerer Uhr; Phillips und Kollegen (2017) sowie Windred und Kollegen (2024) zu regelmäßigem Schlaf; Chang und Kollegen (2015) zu Bildschirmlicht am Abend; Gardiner und Kollegen (2023) zu Koffein und Schlaf; die Bewegungs-Empfehlungen der Weltgesundheitsorganisation (Bull und Kollegen, 2020); Oppezzo und Schwartz (2014) zu Gehen und Einfällen; Stevenson und Kollegen (2018) zu Natur und Aufmerksamkeit; Fincham und Kollegen (2023) zu Atemübungen.'
  },
  andere: {
    pole: [
      { name: 'Nah und im Austausch', text: 'Du suchst Kontakt, fragst nach, teilst Freude – und stärkst damit Beziehungen.' },
      { name: 'Eigener Raum', text: 'Du brauchst Abstand und Ruhe, wählst Kontakte bewusst und schützt deine Kraft mit klaren Grenzen.' }
    ],
    wasEsIst: 'Beziehungen leben von vielen kleinen Momenten: wie wir zuhören, nachfragen, uns melden, danken oder Nein sagen. Studien zeigen immer wieder, dass Menschen unterschätzen, wie sehr sich andere über eine kurze Nachricht, ein Danke oder ein ehrliches Kompliment freuen. Wer zuhört und zusammenfasst, gibt eher das Gefühl, verstanden zu werden, als mit schnellen Ratschlägen. Im Streit wirken Ich-Sätze weniger feindselig als Du-Vorwürfe. Und Grenzen gehören dazu: Ein freundliches Nein schützt Zeit und Kraft.',
    imAlltag: ['Du denkst an jemanden, schreibst aber nicht, weil kein Anlass da ist.', 'Jemand erzählt von etwas Gutem – und du überlegst schon, was du selbst erzählst.',
      '„Du kommst immer zu spät“ bringt Streit, „Ich mache mir Sorgen, wenn …“ eher ein Gespräch.', 'Eine Bitte kommt, und das Ja ist schneller da als das Nachdenken.', 'Ein kurzes Danke wirkt länger, als es dauert.'],
    staerken: ['Wer Nähe sucht, baut Vertrauen und ein Netz, das trägt.', 'Wer eigenen Raum braucht, hört oft genau hin und wählt Worte mit Bedacht.',
      'Nachfragen zeigt echtes Interesse.', 'Ich-Sätze machen Konflikte lösbarer.', 'Klare Grenzen machen Zusagen ehrlicher.'],
    reibung: ['Viel Nähe kann eigene Bedürfnisse verdrängen.', 'Viel Rückzug kann wie Desinteresse wirken, obwohl es keines ist.',
      'Ein Nein fühlt sich anfangs oft unangenehm an – für beide Seiten.', 'Ratschläge sind oft gut gemeint, kommen aber manchmal zu früh.'],
    weiterdenken: ['Bei wem würdest du dich gern wieder melden?', 'Wann fühlst du dich wirklich verstanden – was tut der andere dann?',
      'Wozu sagst du Ja, obwohl du Nein meinst?', 'Wie viel Nähe tut dir gut, und wann brauchst du Raum?', 'Wem könntest du heute für etwas Bestimmtes danken?'],
    unteraeste: [
      { id: 'zuhoeren', titel: 'Aktiv zuhören', text: 'Ausreden lassen, in eigenen Worten zusammenfassen, nachfragen: So fühlt sich das Gegenüber eher verstanden als mit schnellen Ratschlägen.' },
      { id: 'fragen', titel: 'Folgefragen', text: 'Wer mehr Fragen stellt – vor allem solche, die an das Gesagte anknüpfen –, wird im Mittel sympathischer gefunden.' },
      { id: 'ich-saetze', titel: 'Ich-Sätze', text: 'Zu sagen, was man erlebt und braucht, statt dem anderen etwas vorzuwerfen, nimmt Schärfe aus einem Streit – vor allem, wenn man auch die andere Sicht anerkennt.' },
      { id: 'kleine-gesten', titel: 'Kleine Gesten', text: 'Sich ohne Anlass melden, Danke sagen, ein ehrliches Kompliment machen: Menschen unterschätzen regelmäßig, wie sehr das freut, und überschätzen, wie unangenehm es ist.' },
      { id: 'grenzen', titel: 'Grenzen', text: 'Ein kurzes, freundliches Nein schützt Zeit und Kraft. Eine Begründung ist erlaubt, aber keine Pflicht.' }
    ],
    verwandt: ['bigfive.extraversion', 'bigfive.vertraeglichkeit', 'muster.werte_ich_wir', 'muster.kommunikation', 'muster.grenzen', 'interessen.ehrlichkeit'],
    wissen: 'Weger und Kollegen (2014) zum aktiven Zuhören; Huang und Kollegen (2017) zu Fragen in Gesprächen; Rogers, Howieson und Neame (2018) zu Ich-Sätzen im Streit; Boothby und Bohns (2021) zu Komplimenten; Liu und Kollegen (2023) zum Melden ohne Anlass; Kumar und Epley (2018) zu Danke-Briefen; Gable und Kollegen (2004) zum Mitfreuen; Curry und Kollegen (2018) zu Freundlichkeiten.'
  },
  wachsen: {
    pole: [
      { name: 'Bewusst verändern', text: 'Du übst gezielt eine neue Seite an dir und erweiterst, was dir möglich ist.' },
      { name: 'Bei dir bleiben', text: 'Du kennst dich, nimmst deine Art an und setzt sie dort ein, wo sie passt – ohne dich zu verbiegen.' }
    ],
    wasEsIst: 'Persönlichkeit ist nicht in Stein gemeißelt. Sie verändert sich über das Leben langsam, und ein Stück weit auch gezielt: In Studien veränderten sich Menschen, die sich etwas vornahmen und dazu kleine Herausforderungen wirklich machten. Wer sich Herausforderungen vornahm, sie aber nicht machte, veränderte sich eher in die Gegenrichtung. Genauso wichtig: Du musst nichts ändern. Jede Ausprägung hat Stärken und Kosten, und anders ist nicht schlechter – wachsen kann auch heißen, die eigene Art bewusster einzusetzen.',
    imAlltag: ['Du merkst, dass du in einer Lage gern anders reagieren würdest – ruhiger, mutiger, offener.', 'Eine kleine Mutprobe kostet vorher viel und hinterher wenig.',
      'Eine ehrliche Rückmeldung zeigt eine Seite, die du selbst nicht siehst.', 'Eine Stärke, auf neue Art eingesetzt, fühlt sich frisch an.', 'Manches an dir willst du gar nicht ändern – und auch das ist eine Entscheidung.'],
    staerken: ['Bewusstes Verändern erweitert, was dir in schwierigen Lagen möglich ist.', 'Bei dir zu bleiben spart Kraft und macht dich für dich selbst verlässlich.',
      'Kleine Herausforderungen machen Veränderung greifbar.', 'Rückmeldungen von anderen ergänzen den eigenen Blick.', 'Zu wissen, was dir wichtig ist, gibt dem Wachsen eine Richtung.'],
    reibung: ['Sich gegen die eigene Art zu verhalten, kann müde machen.', 'Nur bei dir zu bleiben, kann Möglichkeiten ungenutzt lassen.',
      'Veränderung braucht Zeit; schnelle Ergebnisse sind selten.', 'Ein Ziel, das von außen kommt, fühlt sich anders an als ein eigenes.'],
    weiterdenken: ['Was möchtest du an dir wachsen lassen – und warum gerade das?', 'Was an dir möchtest du genau so behalten?',
      'Welche kleine Mutprobe wäre diese Woche machbar?', 'Wem würdest du eine ehrliche Rückmeldung zutrauen?', 'Welche deiner Stärken hast du lange nicht mehr auf neue Art eingesetzt?'],
    unteraeste: [
      { id: 'gewollt', titel: 'Gewollte Veränderung', text: 'Nathan Hudson und Chris Fraley zeigten: Wer sich wünscht, sich zu verändern, und dazu regelmäßig kleine passende Aufgaben macht, verändert sich über Wochen ein Stück in diese Richtung.' },
      { id: 'machen', titel: 'Machen statt nur vornehmen', text: 'Entscheidend war, die Herausforderungen wirklich zu tun. Annehmen und nicht machen ging eher in die Gegenrichtung – darum lieber klein und echt.' },
      { id: 'kosten', titel: 'Veränderung kostet Kraft', text: 'Wer sich eine Woche lang bewusst geselliger verhielt, hatte im Mittel bessere Laune; ruhigere Menschen hatten weniger davon und wurden eher müde. Sich gegen die eigene Art zu verhalten, darf man dosieren.' },
      { id: 'zwei-seiten', titel: 'Zwei Seiten jeder Eigenart', text: 'Daniel Nettle beschreibt Persönlichkeit aus Sicht der Evolution: Jede Ausprägung hat je nach Umgebung Vorteile und Kosten. Darum ist keine Richtung die bessere.' },
      { id: 'staerken-neu', titel: 'Stärken neu einsetzen', text: 'Eine eigene Stärke jeden Tag auf neue Art zu nutzen, hob in einem Versuch die Stimmung über Monate. Nachprüfungen fanden teils kleinere Wirkungen.' }
    ],
    verwandt: ['passt.wachstum', 'passt.staerken', 'muster.lernen', 'muster.werte_wandel', 'muster.sinn', 'bigfive.offenheit'],
    wissen: 'Hudson und Fraley (2015) zu gewollter Persönlichkeits-Veränderung; Hudson, Briley, Chopik und Derringer (2019) dazu, Herausforderungen wirklich zu machen; Jacques-Hamilton, Sun und Smillie (2019) zu bewusst geselligem Verhalten; Nettle (2006) zu Stärken und Kosten jeder Ausprägung; Roberts und Kollegen (2017) zu Veränderung durch Begleitung; Seligman und Kollegen (2005) zum Einsetzen eigener Stärken.'
  }
};

export const ASTE = GRUPPEN.map((g) => {
  const I = INHALT[g.id];
  const ueben = UEBUNGEN.filter((u) => u.gruppe === g.id).map((u) => ({ titel: u.titel, route: 'training/uebung/' + u.id }));
  if (g.id === 'wachsen') ueben.unshift({ titel: 'Kleine Herausforderungen zu deiner Richtung', route: 'training/wachsen' });
  return {
    id: 'training.' + g.id, titel: g.titel, bereich: 'Üben', pole: I.pole, wasEsIst: I.wasEsIst, imAlltag: I.imAlltag, staerken: I.staerken,
    reibung: I.reibung, weiterdenken: I.weiterdenken, ueben, verwandt: I.verwandt, unteraeste: I.unteraeste, wissen: I.wissen,
    route: 'training/gruppe/' + g.id
  };
});
export const AST = Object.fromEntries(ASTE.map((a) => [a.id, a]));

// ---------- Muster aus deinen eigenen Einträgen ----------
const liste = (namen) => {
  const n = [...new Set(namen)].filter(Boolean); if (!n.length) return '';
  const k = n.slice(0, 3).map((x) => `„${x}“`), rest = n.length > 3 ? ' und weitere' : '';
  return (k.length === 1 ? k[0] : k.slice(0, -1).join(', ') + (rest ? ', ' + k[k.length - 1] : ' und ' + k[k.length - 1])) + rest;
};
const nameVon = (id) => (UEBUNG[id] ? UEBUNG[id].titel : String(id).startsWith('hf-') ? 'deine Herausforderungen' : null);

// tage: Modul-Daten 'tage', schwerpunkt: gewählter Schwerpunkt. Rückgabe nach Vertrag: [{ ast, titel, richtung, deutlich, woher }].
export function musterAusDaten({ tage = {}, schwerpunkt = null } = {}) {
  const je = {};
  for (const id of gemachteIds(tage)) {
    const g = gruppeVon(id); if (!g || !GRUPPE[g]) continue;
    const x = je[g] || (je[g] = { gut: [], mittel: [], nicht: [], offen: [] });
    const n = nameVon(id), f = juengstesGefuehl(tage, id);
    (f === 2 ? x.gut : f === 1 ? x.mittel : f === 0 ? x.nicht : x.offen).push(n);
  }
  const r = [];
  for (const g of GRUPPEN) {
    const x = je[g.id], a = AST['training.' + g.id], [A, B] = a.pole, sp = schwerpunkt === g.id;
    if (!x && !sp) continue;
    const woher = [];
    let richtung = '', deutlich = 'leicht';
    if (x) {
      const gut = liste(x.gut), nicht = liste(x.nicht), mittel = liste(x.mittel), offen = liste(x.offen);
      if (x.gut.length && x.nicht.length) {
        deutlich = 'beides';
        richtung = `Beides gehört zu dir: ${gut} ${x.gut.length > 1 ? 'tun' : 'tut'} dir gut, ${nicht} ${x.nicht.length > 1 ? 'passen' : 'passt'} gerade weniger – „${A.name}“ und „${B.name}“ haben bei dir beide Platz.`;
      } else if (x.gut.length) {
        deutlich = x.gut.length >= 2 ? 'klar' : 'leicht';
        richtung = `${deutlich === 'klar' ? 'Klar' : 'Leicht'} in Richtung „${A.name}“: ${gut} ${x.gut.length > 1 ? 'tun' : 'tut'} dir gut.`;
      } else if (x.nicht.length) {
        deutlich = 'leicht';
        richtung = `Leicht in Richtung „${B.name}“: ${nicht} ${x.nicht.length > 1 ? 'passen' : 'passt'} gerade weniger zu dir – vielleicht liegt dir die andere Seite näher.`;
      } else if (x.mittel.length) {
        deutlich = 'beides';
        richtung = `Beides gehört zu dir: ${mittel} ${x.mittel.length > 1 ? 'fühlten' : 'fühlte'} sich weder besonders gut noch unpassend an.`;
      } else {
        deutlich = 'leicht';
        richtung = `Du schaust dich hier um (${offen}); wie es dir damit geht, ist noch offen.`;
      }
      woher.push(x.gut.length + x.nicht.length + x.mittel.length ? 'aus deinem Gefühl nach den Übungen („Wie war das für dich?“)' : 'aus den Übungen, die du gemacht hast');
    } else {
      richtung = `Du hast „${g.titel}“ als Schwerpunkt gewählt – das beschäftigt dich gerade.`;
    }
    if (sp) woher.push('aus deinem gewählten Schwerpunkt');
    r.push({ ast: a.id, titel: a.titel, richtung, deutlich, woher: woher.join(' und ').replace(/^./, (c) => c.toUpperCase()) + '.' });
  }
  return r;
}
