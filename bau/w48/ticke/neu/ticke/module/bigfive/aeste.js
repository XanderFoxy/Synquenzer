// M1 bigfive – Lern-Äste (Vertrag „aeste()“, Fassung 24.11.2026). Inhalt unabhängig von den Antworten, ohne Wertung, ohne Links.
// Ast-IDs: 'bigfive.<bereich>' (Ergebnis-Schlüssel der Vorlage), Unteräste: 'bigfive.<bereich>.<facette>' (Schlüssel aus FACETTEN).
// pole: [erster Pol, Gegenpol] wie texte.js. ueben: Routen in der App (Training-Übungen, Vertiefung). verwandt: auch geraten.
import { TEXTE } from './texte.js';
import { FACETTEN_POLE } from './daten.js';

const VERTIEFEN = (b) => ({ titel: 'Genauer hinschauen: weitere Sätze zu diesem Bereich', route: 'fragen/bigfive/vertiefung?bereich=' + b });
const ANTWORTEN = { titel: 'Deine Antworten ansehen und ändern', route: 'fragen/bigfive/antworten' };
const WISSEN_ALLE = 'Die Sätze in dieser App stammen aus dem frei nutzbaren IPIP-NEO-120 von John A. Johnson (2014), deutsch in eigener, vorläufiger Übersetzung. Die Beschreibungen der beiden Seiten sind eigene Zusammenfassungen; die Forschung beschreibt Unterschiede zwischen Menschen, keine Werturteile.';

const U = {
  offenheit: {
    fantasie: 'Wie gern du träumst, dir Dinge ausmalst und Gedanken schweifen lässt. Die eine Seite lebt gern in Bildern und Möglichkeiten – daraus entstehen Geschichten und Einfälle. Die andere Seite bleibt nah am Wirklichen – das hilft, beim Hier und Jetzt zu bleiben.',
    kunst: 'Wie stark dich Kunst, Musik, Gedichte oder Schönes in der Natur berühren. Die eine Seite entdeckt Schönheit, wo andere vorbeigehen. Die andere Seite schaut nüchterner hin und fragt eher, wozu etwas gut ist.',
    gefuehle: 'Wie deutlich du eigene und fremde Gefühle wahrnimmst. Die eine Seite erlebt Gefühle stark und kann sie gut benennen. Die andere Seite bleibt bei Gefühlen sachlicher – das hilft, in aufgeladenen Momenten einen kühlen Kopf zu behalten.',
    abenteuer: 'Ob du Abwechslung oder vertraute Abläufe vorziehst – beim Essen, bei Wegen, bei Gewohnheiten. Die eine Seite probiert gern aus. Die andere Seite weiß, was ihr guttut, und spart Kraft, weil nicht alles neu entschieden werden muss.',
    intellekt: 'Wie gern du dich mit schwierigen Texten, Theorien und großen Fragen beschäftigst. Die eine Seite hat Freude an Gedanken um ihrer selbst willen. Die andere Seite denkt lieber praktisch und fragt: Was bringt das konkret? Das sagt nichts darüber, wie klug jemand ist.',
    liberalitaet: 'Ob du Regeln und Werte eher als veränderbar oder als festen Halt siehst. Die eine Seite fragt gern nach, ob etwas noch passt. Die andere Seite schätzt klare Maßstäbe, auf die man sich verlassen kann. In dieser App beruht diese Facette nur auf zwei Sätzen und ist deshalb besonders grob.'
  },
  gewissenhaftigkeit: {
    selbstwirksamkeit: 'Wie sehr du dir zutraust, Aufgaben gut zu schaffen. Die eine Seite geht mit dem Gefühl „Ich krieg das hin“ an Dinge heran. Die andere Seite schaut kritischer auf das eigene Können – das schützt vor Übermut und hält offen fürs Dazulernen.',
    ordnung: 'Wie wichtig dir ist, dass Dinge an ihrem Platz sind. Die eine Seite findet Ruhe in Ordnung und spart Zeit beim Suchen. Die andere Seite kommt mit Durcheinander gut zurecht und steckt ihre Kraft lieber in anderes.',
    pflichtgefuehl: 'Wie eng du dich an Versprechen und Regeln hältst. Die eine Seite ist sehr verlässlich – andere wissen, woran sie sind. Die andere Seite sieht Regeln lockerer und fragt, ob sie im Einzelfall Sinn ergeben.',
    leistungsstreben: 'Wie viel du dir vornimmst und wie hart du dafür arbeitest. Die eine Seite will mehr als nötig und setzt sich hohe Ziele. Die andere Seite setzt ihre Kraft gezielt ein und lässt Platz für anderes im Leben.',
    selbstdisziplin: 'Wie leicht es dir fällt, mit Aufgaben anzufangen und sie durchzuziehen, auch ohne Lust. Die eine Seite zieht durch. Die andere Seite folgt eher ihrer Energie – das kann sehr ergiebig sein, wenn die Lust gerade da ist.',
    besonnenheit: 'Ob du vor dem Handeln lange abwägst oder schnell entscheidest. Die eine Seite vermeidet Schnellschüsse. Die andere Seite ist rasch entschlossen und handelt, wo andere noch überlegen.'
  },
  extraversion: {
    freundlichkeit: 'Wie schnell du anderen gegenüber warm wirst. Die eine Seite geht offen auf Menschen zu und findet leicht Freunde. Die andere Seite hält erst Abstand, lässt Nähe langsam wachsen und wählt genau, wem sie sich öffnet.',
    geselligkeit: 'Wie gern du unter vielen Menschen bist. Die eine Seite liebt Feiern und volle Räume. Die andere Seite ist lieber im kleinen Kreis oder allein und genießt Gespräche unter vier Augen.',
    durchsetzung: 'Ob du gern die Führung übernimmst. Die eine Seite nimmt Dinge in die Hand und sagt, wo es langgeht. Die andere Seite lässt anderen den Vortritt, unterstützt aus der zweiten Reihe und behält von dort den Überblick.',
    aktivitaet: 'Wie viel du unternimmst und wie schnell dein Alltag läuft. Die eine Seite ist ständig in Bewegung. Die andere Seite lässt es gern ruhig angehen und hat dadurch Zeit für Genauigkeit und Erholung.',
    erlebnishunger: 'Wie sehr du Nervenkitzel und Abenteuer suchst. Die eine Seite liebt es, wenn es aufregend wird. Die andere Seite mag es ruhiger und sicherer – und spart sich so manches Risiko.',
    frohsinn: 'Wie viel Freude und Begeisterung du nach außen zeigst. Die eine Seite strahlt Freude aus und steckt andere an. Die andere Seite erlebt Freude eher still und nach innen – sie ist deshalb nicht kleiner.'
  },
  vertraeglichkeit: {
    vertrauen: 'Ob du davon ausgehst, dass andere es gut meinen. Die eine Seite schenkt Vertrauen vorab – das öffnet Türen. Die andere Seite prüft erst – das schützt davor, enttäuscht oder ausgenutzt zu werden.',
    aufrichtigkeit: 'Wie offen und ohne Hintergedanken du deine Ziele verfolgst. Die eine Seite spielt mit offenen Karten. Die andere Seite geht taktischer vor und behält den eigenen Vorteil im Blick.',
    hilfsbereitschaft: 'Wie gern du dir Zeit für andere nimmst. Die eine Seite hilft schnell und gern. Die andere Seite bleibt eher bei den eigenen Aufgaben – und hat dadurch Kraft für das, was sie sich vorgenommen hat.',
    kooperation: 'Wie du dich verhältst, wenn es Streit gibt. Die eine Seite vermeidet Streit und bleibt freundlich. Die andere Seite trägt Streit aus, wird auch mal laut – und bringt dadurch Dinge auf den Tisch.',
    bescheidenheit: 'Wie du über dich selbst sprichst. Die eine Seite nimmt sich zurück und stellt sich nicht über andere. Die andere Seite steht selbstbewusst zu den eigenen Stärken und zeigt sie auch.',
    mitgefuehl: 'Wie sehr dich die Not anderer bewegt. Die eine Seite fühlt stark mit und lässt sich berühren. Die andere Seite hält mehr Abstand zu fremdem Leid – das schützt die eigene Kraft und hilft, nüchtern zu bleiben.'
  },
  stabilitaet: {
    gelassenheit: 'Wie viel du dir Sorgen machst. Die eine Seite lässt Sorgen leicht los und geht entspannt in den Tag. Die andere Seite bemerkt mögliche Probleme früh – das hilft, vorzusorgen, kostet aber auch Kraft.',
    ausgeglichenheit: 'Wie schnell du wütend oder genervt bist. Die eine Seite bleibt ruhig, wenn etwas schiefläuft. Die andere Seite spürt Ärger deutlich und schnell – Ärger zeigt oft, dass eine Grenze oder etwas Wichtiges berührt ist.',
    grundstimmung: 'Wie hell oder schwer sich deine Grundstimmung anfühlt und wie du zu dir selbst stehst. Die eine Seite fühlt sich meist wohl mit sich. Die andere Seite kennt Traurigkeit und schwere Gefühle gut – das kann Tiefe und Verständnis für andere geben. Wenn Niedergeschlagenheit lange bleibt, tut es gut, mit jemandem darüber zu sprechen.',
    selbstsicherheit: 'Wie unbefangen du auf andere zugehst und wie sehr du darauf achtest, wie du wirkst. Die eine Seite geht ohne Scheu auf Menschen zu. Die andere Seite ist vorsichtiger und achtet genau darauf, wie etwas ankommt.',
    masshalten: 'Wie leicht du Versuchungen widerstehst – beim Essen, Einkaufen oder Spielen. Die eine Seite hält gut Maß. Die andere Seite lässt sich von Lust und Genuss im Moment mitnehmen und erlebt ihn dafür ganz.',
    belastbarkeit: 'Wie du reagierst, wenn vieles auf einmal kommt. Die eine Seite bleibt unter Druck ruhig und handlungsfähig. Die andere Seite spürt Druck stark und schnell – sie merkt früher als andere, wann es zu viel wird.'
  }
};

const INHALT = {
  offenheit: {
    wasEsIst: 'Offenheit beschreibt, wie stark dich Neues, Ideen, Fantasie und Schönes anziehen – und wie viel Halt dir das Vertraute gibt. Die eine Seite sucht Abwechslung, stellt gern Fragen und mag es, wenn etwas noch nicht fertig gedacht ist. Die andere Seite schätzt Bewährtes, bleibt beim Konkreten und weiß, was sie an ihren Gewohnheiten hat. Beide Seiten sind Wege, mit der Welt umzugehen: Die eine entdeckt, die andere bewahrt. Die meisten Menschen tragen beides in sich und zeigen je nach Thema mehr vom einen oder vom anderen.',
    imAlltag: [
      'Im Urlaub: lieber ein unbekannter Ort – oder der Ort, an dem es schon einmal schön war.',
      'Beim Lernen: lieber das Warum und die großen Zusammenhänge – oder das, was man sofort anwenden kann.',
      'Bei Essen, Musik und Filmen: Lust auf Unbekanntes – oder Freude am Lieblingsgericht und Lieblingslied.',
      'In Gesprächen: Spaß an „Was wäre, wenn …?“ – oder lieber bei dem, was wirklich ist.',
      'Bei Regeln: prüfen, ob sie noch passen – oder schätzen, dass sie Orientierung geben.'
    ],
    staerken: [
      'Neugier auf Neues: Einfälle, Fantasie, Lust zu lernen und Dinge neu zu verbinden.',
      'Neugier auf Neues: Offenes und Unfertiges gut aushalten, Ungewohntes ausprobieren.',
      'Halt im Bewährten: Bodenhaftung – du prüfst, ob eine neue Idee wirklich trägt.',
      'Halt im Bewährten: Verlässlichkeit, Ausdauer bei Routinen, Wissen vertiefen statt ständig wechseln.',
      'Beide zusammen: Die eine Seite bringt Ideen, die andere macht sie alltagstauglich.'
    ],
    reibung: [
      'Wer Neues sucht, langweilt sich bei Wiederholung leicht – auch wenn Übung gerade nötig wäre.',
      'Viele Ideen zugleich können dazu führen, dass wenig davon fertig wird.',
      'Wer Bewährtes schätzt, erlebt plötzliche Veränderungen leicht als Störung.',
      'Zwischen beiden Seiten reibt es oft: Die eine findet die andere „zu verkopft“, die andere die eine „zu festgefahren“.'
    ],
    weiterdenken: [
      'Wann hast du zuletzt etwas zum ersten Mal gemacht – und wie hat es sich angefühlt?',
      'Welche Gewohnheit gibt dir Halt, und welche hältst du nur aus Gewohnheit fest?',
      'Bei welchen Themen bist du neugierig, bei welchen eher nicht?',
      'Was brauchst du, damit sich Neues sicher genug anfühlt?'
    ],
    ueben: [{ titel: 'Warum-Fragen stellen', route: 'training/uebung/l-warum' }, { titel: 'Aufgaben mischen', route: 'training/uebung/l-mischen' }, { titel: 'Gewohnheit an einen Anker hängen', route: 'training/uebung/g-anker' }],
    verwandt: ['muster.neugier_denken', 'muster.ungewissheit', 'muster.werte_wandel', 'interessen.riasec.A', 'interessen.riasec.I', 'bigfive.extraversion'],
    wissen: 'Offenheit für Erfahrungen ist einer der fünf großen Grundzüge der Persönlichkeit, der „Big Five“. Paul Costa und Robert McCrae beschrieben sie in ihrem Fragebogen NEO-PI-R (1992) mit sechs Facetten: Fantasie, Ästhetik, Gefühle, Handlungen, Ideen und Werte. Eine Zusammenfassung vieler Studien (Larson, Rottinghaus und Borgen, 2002) fand, dass Offenheit am deutlichsten mit künstlerischen und forschenden Interessen zusammenhängt. ' + WISSEN_ALLE
  },
  gewissenhaftigkeit: {
    wasEsIst: 'Gewissenhaftigkeit beschreibt, wie du an Aufgaben herangehst: eher mit Plan, Ordnung und Ausdauer – oder eher spontan, beweglich und aus dem Moment heraus. Die eine Seite denkt voraus, macht Listen und bleibt dran, bis etwas fertig ist. Die andere Seite reagiert schnell auf Neues, improvisiert gern und lässt sich von Plänen nicht festlegen. Beides hat seinen Platz: Manche Aufgaben brauchen einen langen Atem, andere ein schnelles Umschwenken. Bei vielen Menschen wächst die Planungs-Seite im jungen Erwachsenenalter, wenn neue Aufgaben im Leben dazukommen.',
    imAlltag: [
      'Vor einer Prüfung oder Abgabe: früh anfangen und einteilen – oder kurz vorher mit viel Energie.',
      'Im Zimmer oder auf dem Handy: alles an seinem Platz – oder ein Durcheinander, in dem du dich trotzdem zurechtfindest.',
      'Bei Zusagen: du hältst sie sehr genau – oder du siehst sie als Absicht, die sich ändern darf.',
      'Bei Entscheidungen: erst überlegen und abwägen – oder schnell loslegen und unterwegs anpassen.',
      'In der Freizeit: gern geplant – oder lieber offen, was der Tag bringt.'
    ],
    staerken: [
      'Plan und Struktur: Ausdauer, Verlässlichkeit, Dinge wirklich zu Ende bringen.',
      'Plan und Struktur: Überblick behalten, auch wenn viel auf einmal kommt.',
      'Spontan und beweglich: schnell umplanen, Gelegenheiten sehen und nutzen.',
      'Spontan und beweglich: Leichtigkeit – du hältst es aus, wenn etwas unfertig ist.',
      'Beide zusammen: Die eine Seite sorgt dafür, dass etwas fertig wird, die andere dafür, dass es lebendig bleibt.'
    ],
    reibung: [
      'Wer viel plant, tut sich schwer, wenn Pläne platzen – und vergisst leicht die Pause.',
      'Hohe eigene Ansprüche können dazu führen, dass nichts „gut genug“ wirkt.',
      'Wer spontan ist, schiebt lange Aufgaben ohne feste Struktur leichter auf.',
      'Zusammen kann es reiben: Die eine Seite erlebt die andere als „chaotisch“, die andere die eine als „starr“.'
    ],
    weiterdenken: [
      'Bei welchen Aufgaben hilft dir ein Plan – und wo engt er dich ein?',
      'Was bringt dich ins Anfangen, wenn du keine Lust hast?',
      'Wann hat dir Spontaneität schon einmal etwas Gutes gebracht?',
      'Welche Zusage ist dir besonders wichtig, und warum?'
    ],
    ueben: [{ titel: 'Ein Ding, zehn Minuten', route: 'training/uebung/f-ein-ding' }, { titel: 'Wenn-dann-Plan', route: 'training/uebung/z-wenndann' }, { titel: 'Echte Mini-Pause', route: 'training/uebung/f-pause' }],
    verwandt: ['muster.kontrolle', 'muster.entscheiden', 'muster.lernen', 'interessen.rhythmus', 'interessen.riasec.C', 'bigfive.stabilitaet'],
    wissen: 'Gewissenhaftigkeit gehört zu den Big Five. Im NEO-Modell von Costa und McCrae hat sie sechs Facetten: Kompetenz, Ordnung, Pflichtbewusstsein, Leistungsstreben, Selbstdisziplin und Besonnenheit. Zusammenfassungen vieler Studien finden im Mittel Zusammenhänge mit Schulnoten (Poropat, 2009) und mit Arbeitsleistung (Barrick und Mount, 1991). Langzeitstudien zeigen, dass diese Seite bei vielen Menschen zwischen etwa 20 und 40 Jahren zunimmt (Roberts, Walton und Viechtbauer, 2006). ' + WISSEN_ALLE
  },
  extraversion: {
    wasEsIst: 'Extraversion beschreibt, woher du Energie bekommst und wie viel Anregung dir guttut. Die eine Seite tankt unter Menschen auf, sucht Bewegung und Aufregung und spricht gern zuerst. Die andere Seite tankt in der Ruhe auf, mag wenige enge Kontakte und denkt gern nach, bevor sie spricht. Ruhig sein ist nicht dasselbe wie schüchtern sein: Schüchternheit ist eher Sorge vor dem Urteil anderer, Ruhe ist eine Vorliebe. Die heutige Forschung sieht darin keine zwei Lager, sondern zwei Richtungen, zwischen denen sich jeder Mensch bewegt.',
    imAlltag: [
      'Nach einer Feier: aufgedreht und voller Energie – oder erst einmal Ruhe gebraucht.',
      'In der Gruppe: du ergreifst gern das Wort – oder du hörst erst zu und sagst dann etwas Durchdachtes.',
      'Am freien Tag: viel unternehmen – oder ein ruhiger Tag für dich.',
      'Beim Nachdenken: laut, im Gespräch mit anderen – oder still, für dich.',
      'Bei Freundschaften: viele Bekannte – oder wenige, dafür sehr enge.'
    ],
    staerken: [
      'Kontakt und Schwung: leicht in Kontakt kommen, Begeisterung wecken, Gruppen in Bewegung bringen.',
      'Kontakt und Schwung: Tatkraft, vorangehen, Freude ausstrahlen.',
      'Ruhe und Tiefe: Konzentration, lange bei einer Sache bleiben, genau beobachten.',
      'Ruhe und Tiefe: zuhören, Tiefe in Freundschaften, gut allein sein können.',
      'Beide zusammen: Gruppen brauchen Stimmen, die vorangehen, und Stimmen, die genau hinschauen.'
    ],
    reibung: [
      'Wer Kontakt sucht, fühlt sich bei langer Stille oder viel Alleinsein schnell ausgebremst.',
      'Wer gern zuerst spricht, überhört manchmal die Leiseren.',
      'Wer Ruhe braucht, erlebt viel Trubel und ständigen Kontakt als anstrengend.',
      'Wer erst denkt, kommt in schnellen Runden manchmal nicht zu Wort – obwohl er etwas zu sagen hätte.'
    ],
    weiterdenken: [
      'Nach welchen Begegnungen fühlst du dich voller – und nach welchen leerer?',
      'Wie viel Zeit für dich brauchst du in einer Woche, damit es dir gut geht?',
      'Wo würdest du gern öfter vorangehen – und wo lieber anderen den Vortritt lassen?',
      'Welche Art von Treffen passt zu dir: groß und laut oder klein und ruhig?'
    ],
    ueben: [{ titel: 'Einfach mal melden', route: 'training/uebung/a-melden' }, { titel: 'Aktiv zuhören', route: 'training/uebung/a-zuhoeren' }, { titel: 'Erklär es ganz einfach', route: 'training/uebung/l-erklaeren' }],
    verwandt: ['bigfive.stabilitaet', 'bigfive.vertraeglichkeit', 'muster.werte_ich_wir', 'interessen.riasec.S', 'interessen.riasec.E', 'interessen.rhythmus'],
    wissen: 'Extraversion ist einer der Big-Five-Grundzüge. Costa und McCrae beschreiben sechs Facetten: Herzlichkeit, Geselligkeit, Durchsetzungsfähigkeit, Aktivität, Erlebnissuche und Frohsinn. Die Wörter „introvertiert“ und „extravertiert“ machte Carl Gustav Jung bekannt (Psychologische Typen, 1921). Studien, die Menschen über viele Tage begleiten, zeigen: Jeder verhält sich mal gesellig, mal zurückhaltend – Menschen unterscheiden sich eher darin, was häufiger vorkommt (Fleeson, 2001). ' + WISSEN_ALLE
  },
  vertraeglichkeit: {
    wasEsIst: 'Verträglichkeit beschreibt, wie du mit anderen umgehst, wenn Wünsche aufeinandertreffen. Die eine Seite stellt das Miteinander nach vorn: vertrauen, helfen, ausgleichen, Streit vermeiden. Die andere Seite stellt Klarheit nach vorn: prüfen, bevor man vertraut, die eigene Meinung sagen, auch wenn es Reibung gibt. Beide Seiten können freundlich sein – sie zeigen es nur unterschiedlich. Ein Mensch mit eigenem Kopf ist nicht unfreundlich, und ein rücksichtsvoller Mensch ist nicht schwach.',
    imAlltag: [
      'Bei einem Streit: eher schlichten – oder die Sache klar ausdiskutieren.',
      'Wenn dich jemand um Hilfe bittet: sofort ja – oder erst prüfen, ob es gerade passt.',
      'Bei neuen Menschen: Vertrauen vorschießen – oder erst einmal abwarten.',
      'Bei Lob: lieber abwinken – oder es annehmen und zu deinen Stärken stehen.',
      'Beim Verhandeln: auf eine Lösung für alle achten – oder deine Seite deutlich vertreten.'
    ],
    staerken: [
      'Rücksicht und Miteinander: Hilfsbereitschaft, Fairness, Gruppen zusammenhalten.',
      'Rücksicht und Miteinander: Mitgefühl, gut zuhören, Streit entschärfen.',
      'Klarheit und eigener Kopf: ehrliche Rückmeldung geben, auch wenn sie unbequem ist.',
      'Klarheit und eigener Kopf: kritisch prüfen, sich nicht ausnutzen lassen, für sich einstehen.',
      'Beide zusammen: Gute Entscheidungen brauchen Rücksicht auf alle und jemanden, der Probleme ausspricht.'
    ],
    reibung: [
      'Wer viel Rücksicht nimmt, sagt manchmal zu selten Nein – eigene Wünsche kommen dann zu kurz.',
      'Wer Streit vermeidet, lässt Probleme manchmal zu lange liegen.',
      'Wer direkt ist, wird manchmal als kühl oder streitlustig erlebt, obwohl es nicht so gemeint ist.',
      'Wer erst prüft, bevor er vertraut, braucht länger, bis Nähe entsteht.'
    ],
    weiterdenken: [
      'Wann hast du zuletzt Nein gesagt – und wie ging es dir damit?',
      'Wem vertraust du sofort, und woran merkst du, wem eher nicht?',
      'Wie sagst du etwas Unbequemes so, dass es beim anderen ankommt?',
      'Wann ist dir Harmonie wichtiger als Recht haben – und wann nicht?'
    ],
    ueben: [{ titel: 'Freundlich Nein sagen', route: 'training/uebung/a-grenze' }, { titel: 'Ich-Botschaft statt Vorwurf', route: 'training/uebung/a-ich' }, { titel: 'Ein ehrliches Kompliment', route: 'training/uebung/a-kompliment' }],
    verwandt: ['interessen.ehrlichkeit', 'muster.werte_ich_wir', 'bigfive.extraversion', 'interessen.riasec.S', 'muster.entscheiden'],
    wissen: 'Verträglichkeit ist einer der Big-Five-Grundzüge. Costa und McCrae beschreiben sechs Facetten: Vertrauen, Freimütigkeit, Altruismus, Entgegenkommen, Bescheidenheit und Gutherzigkeit. Im HEXACO-Modell von Kibeom Lee und Michael Ashton gelten Fairness und Bescheidenheit als eigener, sechster Grundzug „Ehrlichkeit-Bescheidenheit“. Eine Untersuchung von Judge, Livingston und Hurst (2012) fand, dass Menschen mit viel Rücksicht im Mittel etwas weniger verdienen – ein Hinweis, dass Rücksicht nicht überall belohnt wird, kein Urteil über sie. ' + WISSEN_ALLE
  },
  stabilitaet: {
    wasEsIst: 'Dieser Bereich beschreibt, wie stark Stress, Sorgen, Ärger und Rückschläge dich bewegen. Die eine Seite bleibt eher ruhig, fängt sich schnell wieder und lässt Sorgen leichter los. Die andere Seite spürt Gefühle und Spannungen deutlicher und früher – sie merkt, wenn etwas nicht stimmt, und nimmt es ernst. In der Forschung heißt der Bereich „emotionale Stabilität“, die Gegenseite „Neurotizismus“ – das Wort klingt nach Krankheit, meint aber nur, wie stark jemand auf Belastung anspricht. Der Bereich ist nicht festgeschrieben: Viele Menschen werden mit den Jahren gelassener.',
    imAlltag: [
      'Vor einer Prüfung: eher locker – oder schon Tage vorher angespannt.',
      'Nach einer Kritik: schnell abgehakt – oder sie geht dir noch lange nach.',
      'Wenn etwas schiefgeht: ruhig weitermachen – oder es erst einmal deutlich spüren.',
      'In einem Raum voller Menschen: unbefangen – oder aufmerksam, wie du wirkst.',
      'Wenn jemand traurig ist: du bleibst ruhig daneben – oder du spürst seine Stimmung stark mit.'
    ],
    staerken: [
      'Gelassene Ruhe: in Krisen einen kühlen Kopf behalten und andere beruhigen.',
      'Gelassene Ruhe: nach Rückschlägen schnell wieder aufstehen.',
      'Feines Gespür: Warnzeichen früh bemerken und vorsorgen.',
      'Feines Gespür: Gefühle ernst nehmen, Tiefe im Erleben, Verständnis für andere, denen es schwer geht.',
      'Beide zusammen: Die eine Seite sieht die Gefahr, die andere behält die Ruhe.'
    ],
    reibung: [
      'Wer sehr gelassen ist, nimmt Warnzeichen manchmal weniger ernst, als sie es verdienen.',
      'Gelassene Menschen verstehen manchmal schwer, warum etwas andere so stark trifft.',
      'Wer viel spürt, den treffen Stress, Ärger und Sorgen stärker, und sie halten länger an.',
      'Wenn schwere Gefühle lange bleiben, tut es gut, mit jemandem zu sprechen – das ist keine Schwäche.'
    ],
    weiterdenken: [
      'Woran merkst du zuerst, dass dich etwas stresst – im Kopf, im Körper, im Verhalten?',
      'Was hilft dir, nach einem schweren Tag wieder zur Ruhe zu kommen?',
      'Welche Sorge hat sich schon einmal als berechtigt erwiesen – und welche nicht?',
      'Mit wem kannst du sprechen, wenn dir etwas zu viel wird?'
    ],
    ueben: [{ titel: 'Langsam atmen', route: 'training/uebung/h-atem' }, { titel: 'Gefühl benennen', route: 'training/uebung/k-benennen' }, { titel: 'Feste Grübel-Zeit', route: 'training/uebung/k-sorgen-zeit' }, { titel: 'Selbstmitgefühl-Pause', route: 'training/uebung/k-selbstmitgefuehl' }],
    verwandt: ['muster.ungewissheit', 'muster.kontrolle', 'bigfive.extraversion', 'bigfive.gewissenhaftigkeit', 'interessen.rhythmus'],
    wissen: 'Emotionale Stabilität (Gegenseite: Neurotizismus) gehört zu den Big Five. Costa und McCrae beschreiben für Neurotizismus sechs Facetten: Ängstlichkeit, Reizbarkeit, Depression, soziale Befangenheit, Impulsivität und Verletzlichkeit. Langzeitstudien zeigen, dass viele Menschen mit den Jahren gelassener werden (Roberts, Walton und Viechtbauer, 2006). In einer Zusammenfassung von Studien zu Therapie und gezielter Begleitung veränderte sich dieser Bereich am deutlichsten (Roberts und andere, 2017). Elaine und Arthur Aron beschrieben 1997 „Hochsensibilität“ als verwandtes, aber eigenes Konzept: feine Wahrnehmung von Reizen und Stimmungen. Das hier ist keine Diagnose. ' + WISSEN_ALLE
  }
};

const TITEL = { offenheit: 'Offenheit', gewissenhaftigkeit: 'Gewissenhaftigkeit', extraversion: 'Extraversion', vertraeglichkeit: 'Verträglichkeit', stabilitaet: 'Gelassenheit und Gespür' };

let CACHE = null;
export function aeste() {
  if (CACHE) return CACHE.map((a) => ({ ...a }));
  CACHE = Object.keys(INHALT).map((b) => {
    const I = INHALT[b], T = TEXTE[b];
    return {
      id: 'bigfive.' + b, titel: TITEL[b], bereich: 'Persönlichkeit',
      pole: T.pole.map((p) => ({ name: p.name, text: p.text })),
      wasEsIst: I.wasEsIst, imAlltag: [...I.imAlltag], staerken: [...I.staerken], reibung: [...I.reibung], weiterdenken: [...I.weiterdenken],
      ueben: [...I.ueben, VERTIEFEN(b), ANTWORTEN], verwandt: [...I.verwandt],
      unteraeste: Object.entries(FACETTEN_POLE[b]).map(([f, [titel, a, z]]) => ({ id: `bigfive.${b}.${f}`, titel, text: `${U[b][f]} Die zwei Seiten: „${a}“ und „${z}“.`, pole: [a, z] })),
      wissen: I.wissen
    };
  });
  return CACHE.map((a) => ({ ...a }));
}
export const AST_TITEL = TITEL;
