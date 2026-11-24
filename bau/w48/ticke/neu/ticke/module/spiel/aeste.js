// Entweder – oder – Äste (Lerninhalt je Richtung), unabhängig von den Antworten. Kein DOM, kein Import.
// Vertrag 0.3: aeste() → [{ id, titel, bereich, pole, wasEsIst, imAlltag, staerken, reibung, weiterdenken, ueben, verwandt, unteraeste, wissen }].
// Ton: beschreibend, beide Pole gleichwertig, keine Diagnose. ueben.route = Hash-Route ohne „#“. verwandt: auch geratene IDs
// anderer Module (der Zusammenbau gleicht ab und lässt fehlende weg).
const WISSEN_PAARE = 'Die Aussagen stammen aus dem gemeinfreien IPIP-NEO-120 (Johnson 2014), in eigener, vorläufiger deutscher Übersetzung. '
  + 'Die Wahl zwischen zwei Aussagen folgt dem Gedanken von Thurstone (1927): Jede Wahl ist ein Vergleich, und aus vielen Vergleichen ergibt sich eine Richtung – '
  + 'heute „Thurstone-Modell für Zwangswahl“ genannt (Brown & Maydeu-Olivares 2011).';

export const AESTE = [
  {
    id: 'spiel.offenheit', titel: 'Neues oder Vertrautes', bereich: 'Persönlichkeit',
    pole: [
      { name: 'Vertrautes', text: 'Du schätzt, was sich bewährt hat, gehst Dingen lieber in die Tiefe als in die Breite und bleibst deinen Wegen treu. Das gibt dir und anderen Verlässlichkeit.' },
      { name: 'Neues', text: 'Dich ziehen Ideen, Fantasie, Kunst und Abwechslung an. Du probierst gern aus und siehst Verbindungen, wo andere noch keine sehen.' }
    ],
    wasEsIst: 'In der Persönlichkeitsforschung heißt diese Richtung „Offenheit für Erfahrungen“. Sie beschreibt, wie stark dich Neues, Ungewohntes und Fantasie anziehen – im Denken, im Fühlen und im Alltag. '
      + 'Der eine Pol sucht Abwechslung, Kunst, Ideen und Gedankenspiele; der andere schätzt das Bewährte, Konkrete und Vertraute. '
      + 'Keiner der beiden Pole ist klüger oder besser: Wer Neues sucht, gewinnt Breite, wer beim Vertrauten bleibt, gewinnt oft Tiefe und Beständigkeit. '
      + 'Bei „Entweder – oder“ zeigt sich die Richtung daran, welche Aussage du nimmst, wenn eine Aussage über Neues oder Vertrautes gegen eine aus einem anderen Bereich steht.',
    imAlltag: [
      'Ob du im Urlaub lieber einen neuen Ort ausprobierst oder an einen Lieblingsort zurückkehrst.',
      'Ob dich ein Film, ein Buch oder ein Lied reizt, weil es ungewohnt ist – oder weil du weißt, was dich erwartet.',
      'Wie gern du über Ideen sprichst, die (noch) nichts Praktisches bringen.',
      'Ob du bei einer Aufgabe lieber einen eigenen Weg suchst oder einen bewährten nimmst.',
      'Wie stark dich Schönheit in Kleinigkeiten berührt – ein Klang, ein Licht, ein gut gewählter Satz.'
    ],
    staerken: [
      'Richtung Neues: Neugier, Fantasie und Freude am Lernen und an Ideen.',
      'Richtung Neues: Du lässt dich gut auf Veränderungen und fremde Sichtweisen ein.',
      'Richtung Vertrautes: Beständigkeit – du bleibst bei einer Sache und vertiefst sie.',
      'Richtung Vertrautes: ein klarer, praktischer Blick, der nicht jeder neuen Mode hinterherläuft.',
      'Beides: Du kannst Neues ausprobieren und weißt trotzdem, wo du zu Hause bist.'
    ],
    reibung: [
      'Wer viel Neues sucht, springt manchmal schon weiter, bevor etwas fertig ist.',
      'Wer Vertrautes liebt, gerät bei plötzlichen Änderungen schneller aus dem Takt.',
      'Zwischen Menschen mit verschiedener Richtung kann es reiben: Der eine findet Routine langweilig, der andere ständigen Wechsel anstrengend.',
      'Zu viel Neues auf einmal kann auch neugierige Menschen überfordern.'
    ],
    weiterdenken: [
      'Wann hat dich zuletzt etwas Neues so richtig gepackt – und was genau daran?',
      'Welche vertrauten Dinge, Orte oder Menschen geben dir Halt?',
      'Wo wünschst du dir gerade mehr Abwechslung – und wo mehr Ruhe und Wiederholung?',
      'Wie gehst du damit um, wenn jemand in dieser Richtung ganz anders tickt als du?'
    ],
    ueben: [{ titel: 'Warum-Fragen stellen', route: 'training/uebung/l-warum' }, { titel: 'Eine kleine Mutprobe', route: 'training/uebung/w-mutprobe' }],
    verwandt: ['bigfive.offenheit', 'muster.neugier_denken', 'muster.ungewissheit', 'muster.werte_wandel', 'spiel.interessen'],
    unteraeste: [
      { id: 'spiel.offenheit.fantasie', titel: 'Fantasie', text: 'Wie gern du in Gedanken eigene Welten baust, träumst und dir Dinge ausmalst. Dazu gehören hier Aussagen wie „Ich habe eine lebhafte Fantasie.“ und „Ich träume gern vor mich hin.“' },
      { id: 'spiel.offenheit.schoenheit', titel: 'Kunst und Schönheit', text: 'Wie stark dich Musik, Bilder, Sprache oder Natur berühren. Wer hier stark anspricht, bleibt an Dingen hängen, die anderen vielleicht gar nicht auffallen.' },
      { id: 'spiel.offenheit.gefuehle', titel: 'Gefühle wahrnehmen', text: 'Wie deutlich du deine eigenen Gefühle erlebst und beachtest. Das ist kein Maß für „zu viel“ oder „zu wenig“ Gefühl, sondern dafür, wie viel Raum sie in deinem Erleben bekommen.' },
      { id: 'spiel.offenheit.abwechslung', titel: 'Abwechslung', text: 'Ob du Routine als Halt oder als Enge erlebst. Manche blühen auf, wenn jeder Tag anders ist, andere, wenn der Tag einen festen Rhythmus hat.' },
      { id: 'spiel.offenheit.ideen', titel: 'Ideen und Gedankenspiele', text: 'Wie viel Freude dir anspruchsvolle Texte, Theorien und Diskussionen machen – auch dann, wenn sie keinen direkten Nutzen haben.' }
    ],
    wissen: 'Offenheit für Erfahrungen ist einer der fünf großen Bereiche im Fünf-Faktoren-Modell der Persönlichkeit, das aus der Sprache entstanden ist: Forschende haben untersucht, mit welchen Wörtern Menschen einander beschreiben, und fünf große Gruppen gefunden. ' + WISSEN_PAARE
  },
  {
    id: 'spiel.gewissenhaftigkeit', titel: 'Spontan oder geplant', bereich: 'Persönlichkeit',
    pole: [
      { name: 'spontan, beweglich', text: 'Du lässt dich vom Moment leiten, kannst gut umplanen und findest auch ohne festen Plan einen Weg. Das macht dich beweglich, wenn sich Dinge ändern.' },
      { name: 'geplant, gründlich', text: 'Du gehst geordnet vor, bereitest dich vor und bringst Dinge zu Ende. Auf dich ist Verlass, und ein klarer Weg gibt dir Ruhe.' }
    ],
    wasEsIst: 'In der Persönlichkeitsforschung heißt diese Richtung „Gewissenhaftigkeit“. Sie beschreibt, wie sehr du planst, ordnest, dich an Vorhaben hältst und Dinge gründlich zu Ende bringst. '
      + 'Der eine Pol mag Pläne, Listen und Ordnung; der andere lebt mehr aus dem Augenblick, ist locker und lässt Dinge auf sich zukommen. '
      + 'Das Wort „gewissenhaft“ klingt nach Lob, aber beide Pole haben ihre Stärken: Planung gibt Verlässlichkeit, Spontaneität gibt Beweglichkeit und Leichtigkeit. '
      + 'Hier zeigt sich die Richtung daran, ob du Aussagen wie „Ich setze meine Pläne um.“ oder eher die andere Seite eines Paars nimmst.',
    imAlltag: [
      'Ob dein Tag einen Plan hat oder sich eher ergibt.',
      'Wie dein Schreibtisch, deine Tasche oder dein Zimmer meistens aussieht.',
      'Ob du lieber früh anfängst oder kurz vor Schluss mit voller Kraft loslegst.',
      'Wie du reagierst, wenn ein Plan plötzlich nicht mehr gilt.',
      'Ob du dir Dinge aufschreibst oder sie lieber im Kopf behältst.'
    ],
    staerken: [
      'Richtung geplant: Verlässlichkeit – Versprechen und Vorhaben werden eingehalten.',
      'Richtung geplant: Ausdauer bei langen Aufgaben, Blick für Einzelheiten.',
      'Richtung spontan: Leichtigkeit und die Fähigkeit, im Moment gute Entscheidungen zu treffen.',
      'Richtung spontan: Beweglichkeit, wenn sich etwas ändert – du klebst nicht am alten Plan.',
      'Beides: Du kannst planen, wenn es nötig ist, und loslassen, wenn es passt.'
    ],
    reibung: [
      'Wer sehr geplant lebt, kann sich über Unordnung oder Unpünktlichkeit anderer stark ärgern.',
      'Wer sehr spontan lebt, schiebt manches auf, bis es eng wird.',
      'Planer und Spontane erleben dieselbe Lage oft ganz anders: Für den einen ist sie Chaos, für den anderen Freiheit.',
      'Hohe eigene Ansprüche an Gründlichkeit können Druck machen.'
    ],
    weiterdenken: [
      'Bei welchen Dingen ist dir ein Plan wichtig – und wo lässt du es lieber laufen?',
      'Wie fühlt sich ein Tag ohne jeden Plan für dich an?',
      'Was hilft dir, eine Sache zu Ende zu bringen, wenn die Lust nachlässt?',
      'Wo könnte dir ein kleines Stück der anderen Seite gerade guttun?'
    ],
    ueben: [{ titel: 'Wenn-dann-Plan', route: 'training/uebung/z-wenndann' }, { titel: 'So klein, dass es fast lächerlich ist', route: 'training/uebung/g-mini' }],
    verwandt: ['bigfive.gewissenhaftigkeit', 'muster.kontrolle', 'muster.entscheiden', 'muster.lernen', 'interessen.rhythmus'],
    unteraeste: [
      { id: 'spiel.gewissenhaftigkeit.ordnung', titel: 'Ordnung', text: 'Wie wichtig es dir ist, dass Dinge ihren Platz haben. Aussagen wie „Ich räume gern auf.“ gegen „Ich lasse meine Sachen herumliegen.“ gehören hierher.' },
      { id: 'spiel.gewissenhaftigkeit.vorbereitet', titel: 'Vorbereitet sein', text: 'Ob du lieber gut vorbereitet in eine Lage gehst oder dich auf deine Fähigkeit verlässt, im Moment etwas daraus zu machen.' },
      { id: 'spiel.gewissenhaftigkeit.dranbleiben', titel: 'Dranbleiben', text: 'Wie leicht es dir fällt, mit einer Aufgabe anzufangen und bei ihr zu bleiben. Das hängt auch stark vom Tag, vom Thema und vom Schlaf ab.' },
      { id: 'spiel.gewissenhaftigkeit.bedacht', titel: 'Erst denken, dann tun', text: 'Ob du dich lieber erst besinnst oder dich in Dinge stürzt. Wer sich hineinstürzt, ist oft mutig und schnell, wer abwartet, oft umsichtig.' }
    ],
    wissen: 'Gewissenhaftigkeit ist einer der fünf großen Bereiche im Fünf-Faktoren-Modell der Persönlichkeit. In der Forschung hängt sie mit Ordnung, Pflichtgefühl, Leistungsstreben, Selbstdisziplin und Besonnenheit zusammen – jeweils mit einer ebenso beschreibbaren lockeren, spontanen Seite. ' + WISSEN_PAARE
  },
  {
    id: 'spiel.extraversion', titel: 'Ruhe oder Trubel', bereich: 'Persönlichkeit',
    pole: [
      { name: 'ruhig, für dich', text: 'Du tankst in der Ruhe auf, bist gern für dich oder mit wenigen, nahen Menschen und denkst erst nach, bevor du sprichst. Das schenkt dir Tiefe und Konzentration.' },
      { name: 'gesellig, aktiv', text: 'Menschen, Bewegung und Erlebnisse geben dir Schwung. Du gehst leicht auf andere zu, übernimmst gern die Führung und bringst Leben in eine Runde.' }
    ],
    wasEsIst: 'In der Persönlichkeitsforschung heißt diese Richtung „Extraversion“, ihr Gegenpol wird oft „Introversion“ genannt. Sie beschreibt, wie viel Anregung, Gesellschaft und Aktivität dir guttut. '
      + 'Extravertierte Menschen holen sich Energie eher draußen, im Kontakt; introvertierte eher drinnen, in der Ruhe. '
      + 'Das sagt nichts darüber, wie freundlich oder wie mutig jemand ist – ruhige Menschen können sehr warm und sehr entschlossen sein, gesellige sehr nachdenklich. '
      + 'Bei „Entweder – oder“ zeigt sich die Richtung daran, wie oft du Aussagen wie „Unter Menschen fühle ich mich wohl.“ oder „Ich bin lieber allein.“ vor die andere Seite stellst.',
    imAlltag: [
      'Wie du dich nach einem langen Abend mit vielen Menschen fühlst: aufgeladen oder eher leer.',
      'Ob du in einer neuen Gruppe schnell ins Gespräch kommst oder erst einmal beobachtest.',
      'Ob du Gedanken lieber beim Reden oder beim Alleinsein sortierst.',
      'Wie du am liebsten deine Freizeit verbringst – unterwegs oder zu Hause.',
      'Ob du in einer Runde gern vorangehst oder lieber abwartest, bis andere den Anfang machen.'
    ],
    staerken: [
      'Richtung gesellig: Du knüpfst leicht Kontakte und bringst Menschen zusammen.',
      'Richtung gesellig: Tatkraft, Begeisterung und die Lust, Dinge anzustoßen.',
      'Richtung ruhig: Konzentration, gutes Zuhören und Gespür für das, was unter der Oberfläche liegt.',
      'Richtung ruhig: Du brauchst wenig Bestätigung von außen und kannst gut allein an etwas arbeiten.',
      'Beides: Du kannst in Gesellschaft aufblühen und weißt trotzdem, wann du Rückzug brauchst.'
    ],
    reibung: [
      'Gesellige Menschen fühlen sich in langen stillen Phasen schnell unruhig.',
      'Ruhige Menschen erschöpfen sich, wenn der Kalender voller Treffen ist.',
      'In einer Beziehung oder Familie kann es reiben, wenn einer nach Hause will und der andere gerade erst in Fahrt kommt.',
      'Viele Schulen und Arbeitsplätze sind eher auf lautes Mitmachen ausgerichtet – das kann ruhigen Menschen unrecht tun.'
    ],
    weiterdenken: [
      'Wobei tankst du am zuverlässigsten auf?',
      'Welche Art von Treffen tut dir gut – und welche kostet dich eher Kraft?',
      'Wann hast du dich zuletzt in einer Gruppe richtig wohl gefühlt, und was war anders als sonst?',
      'Wie sagst du anderen, was du gerade brauchst: Gesellschaft oder Ruhe?'
    ],
    ueben: [{ titel: 'Einfach mal melden', route: 'training/uebung/a-melden' }, { titel: 'Echte Mini-Pause', route: 'training/uebung/f-pause' }],
    verwandt: ['bigfive.extraversion', 'muster.werte_ich_wir', 'interessen.riasec', 'spiel.vertraeglichkeit'],
    unteraeste: [
      { id: 'spiel.extraversion.gesellig', titel: 'Geselligkeit', text: 'Wie gern du unter Menschen bist und große Runden magst. Manche lieben Feiern mit vielen Leuten, andere ein Gespräch zu zweit.' },
      { id: 'spiel.extraversion.fuehren', titel: 'Vorangehen', text: 'Ob du in einer Gruppe gern die Führung übernimmst oder lieber andere vorgehen lässt. Beides kann eine Gruppe tragen.' },
      { id: 'spiel.extraversion.tempo', titel: 'Tempo und Aktivität', text: 'Wie viel du unternimmst und wie schnell dein Alltag läuft. Wer es gern ruhig angehen lässt, ist nicht träge, sondern hat oft einen anderen Rhythmus.' },
      { id: 'spiel.extraversion.aufregung', titel: 'Lust auf Aufregung', text: 'Wie sehr dich Spannung, Abenteuer und Trubel reizen – oder ob dir eher Gelassenheit und Überschaubarkeit guttun.' }
    ],
    wissen: 'Extraversion ist einer der fünf großen Bereiche im Fünf-Faktoren-Modell der Persönlichkeit; die Begriffe „extravertiert“ und „introvertiert“ gehen auf den Psychiater C. G. Jung (1921) zurück. Heute beschreibt die Forschung Extraversion als ein Bündel aus Geselligkeit, Durchsetzungsfreude, Aktivität, Lust auf Anregung und Fröhlichkeit. ' + WISSEN_PAARE
  },
  {
    id: 'spiel.vertraeglichkeit', titel: 'Direkt oder rücksichtsvoll', bereich: 'Beziehungen',
    pole: [
      { name: 'direkt, kritisch', text: 'Du sagst, was du denkst, prüfst, bevor du vertraust, und stehst für dich und deine Sicht ein. Das macht dich klar, ehrlich und schwer zu täuschen.' },
      { name: 'rücksichtsvoll, mitfühlend', text: 'Du achtest darauf, wie es anderen geht, hilfst gern und gehst davon aus, dass andere es gut meinen. Das macht dich warm und verbindend.' }
    ],
    wasEsIst: 'In der Persönlichkeitsforschung heißt diese Richtung „Verträglichkeit“. Sie beschreibt, wie du anderen begegnest: eher mit Vertrauen, Mitgefühl und Rücksicht – oder eher kritisch, direkt und mit dem Blick auf dich selbst und deine Sache. '
      + 'Das Wort „verträglich“ klingt nach der besseren Seite, aber beide Pole brauchen Menschen und Gruppen: Die einen halten zusammen, die anderen sprechen Probleme an und lassen sich nichts vormachen. '
      + 'Bei „Entweder – oder“ stehen Aussagen wie „Ich helfe anderen sehr gern.“ gegen Aussagen aus anderen Bereichen oder gegen die direkte Seite, etwa „Ich streite mich gern so richtig.“',
    imAlltag: [
      'Wie du reagierst, wenn dich jemand um einen Gefallen bittet, für den du eigentlich keine Zeit hast.',
      'Ob du bei einem Streit eher nach einem Ausgleich suchst oder deine Sicht klar vertrittst.',
      'Wie schnell du Fremden vertraust.',
      'Ob dich das Leid anderer im Alltag stark beschäftigt.',
      'Wie du Kritik äußerst – sanft verpackt oder geradeheraus.'
    ],
    staerken: [
      'Richtung rücksichtsvoll: Mitgefühl, Hilfsbereitschaft und ein Gespür für Stimmungen.',
      'Richtung rücksichtsvoll: Du kannst Gruppen zusammenhalten und Streit entschärfen.',
      'Richtung direkt: Ehrlichkeit und Klarheit – andere wissen, woran sie bei dir sind.',
      'Richtung direkt: Du lässt dich nicht leicht ausnutzen und kannst für dich einstehen.',
      'Beides: Du kannst freundlich sein und trotzdem klar sagen, was nicht geht.'
    ],
    reibung: [
      'Wer sehr rücksichtsvoll ist, sagt manchmal Ja, obwohl er Nein meint.',
      'Wer sehr direkt ist, wirkt auf andere manchmal härter, als er es meint.',
      'Viel Vertrauen kann enttäuscht werden, viel Misstrauen kann Nähe schwer machen.',
      'Zwischen einem direkten und einem rücksichtsvollen Menschen entstehen leicht Missverständnisse: Der eine hört Angriff, der andere Ausweichen.'
    ],
    weiterdenken: [
      'Wann fällt es dir leicht, Nein zu sagen – und wann schwer?',
      'Wem vertraust du schnell, und woran merkst du, dass Vorsicht gut wäre?',
      'Wie möchtest du, dass andere dir Kritik sagen?',
      'Wo hat dir deine direkte oder deine rücksichtsvolle Seite schon einmal sehr geholfen?'
    ],
    ueben: [{ titel: 'Ich-Botschaft statt Vorwurf', route: 'training/uebung/a-ich' }, { titel: 'Freundlich Nein sagen', route: 'training/uebung/a-grenze' }],
    verwandt: ['bigfive.vertraeglichkeit', 'interessen.ehrlichkeit', 'muster.werte_ich_wir', 'spiel.extraversion'],
    unteraeste: [
      { id: 'spiel.vertraeglichkeit.vertrauen', titel: 'Vertrauen', text: 'Ob du zuerst das Gute in anderen siehst oder erst einmal prüfst. Aussagen wie „Ich vertraue anderen.“ und „Ich misstraue Menschen.“ gehören hierher.' },
      { id: 'spiel.vertraeglichkeit.mitgefuehl', titel: 'Mitgefühl', text: 'Wie sehr dich das Schicksal anderer berührt, auch von Menschen, die du nicht kennst.' },
      { id: 'spiel.vertraeglichkeit.bescheiden', titel: 'Bescheidenheit und Selbstwert', text: 'Wie du über dich im Verhältnis zu anderen sprichst. Wer viel von sich hält, steht oft gut für sich ein; wer bescheiden ist, lässt anderen gern den Vortritt.' },
      { id: 'spiel.vertraeglichkeit.streit', titel: 'Umgang mit Streit', text: 'Ob du Konflikte eher meidest und ausgleichst oder sie offen austrägst. Beides kann klären – auf unterschiedliche Weise.' }
    ],
    wissen: 'Verträglichkeit ist einer der fünf großen Bereiche im Fünf-Faktoren-Modell der Persönlichkeit. Die Forschung zählt dazu Vertrauen, Aufrichtigkeit, Hilfsbereitschaft, Entgegenkommen, Bescheidenheit und Mitgefühl. ' + WISSEN_PAARE
  },
  {
    id: 'spiel.stabilitaet', titel: 'Feinfühlig oder gelassen', bereich: 'Persönlichkeit',
    pole: [
      { name: 'feinfühlig, wachsam', text: 'Du spürst Stimmungen, Spannungen und Gefahren früh und deutlich. Das macht dich aufmerksam, vorsichtig und oft sehr einfühlsam.' },
      { name: 'gelassen, ruhig', text: 'Vieles bringt dich nicht so schnell aus der Ruhe. Du bleibst auch unter Druck eher bei dir und kannst anderen in schwierigen Lagen Halt geben.' }
    ],
    wasEsIst: 'In der Persönlichkeitsforschung heißt diese Richtung „emotionale Stabilität“, ihr Gegenpol „Neurotizismus“ – ein altes Fachwort, das nichts mit Krankheit zu tun hat. Gemeint ist, wie stark Gefühle wie Sorge, Ärger oder Anspannung bei dir anschlagen. '
      + 'Feinfühlige Menschen haben eine empfindliche innere Antenne: Sie merken früh, wenn etwas nicht stimmt, und erleben Gefühle intensiver. Gelassene Menschen haben eine ruhigere Antenne und lassen mehr an sich abperlen. '
      + 'Beides hat seinen Sinn: Wachsamkeit schützt und macht vorsichtig, Gelassenheit hilft, in schwierigen Lagen ruhig zu handeln. '
      + 'Die Richtung kann sich mit der Lebenslage verschieben – in anstrengenden Zeiten spüren fast alle Menschen mehr.',
    imAlltag: [
      'Wie lange dich ein schwieriges Gespräch noch beschäftigt.',
      'Ob du vor einer Prüfung oder einem wichtigen Termin eher aufgeregt oder eher ruhig bist.',
      'Wie schnell du merkst, dass in einem Raum dicke Luft ist.',
      'Ob dich kleine Ärgernisse im Alltag lange begleiten oder schnell vergehen.',
      'Wie du mit Versuchungen und plötzlichen Wünschen umgehst.'
    ],
    staerken: [
      'Richtung feinfühlig: ein frühes Gespür für Probleme und für die Gefühle anderer.',
      'Richtung feinfühlig: Vorsicht und Gewissenhaftigkeit, wo es darauf ankommt.',
      'Richtung feinfühlig: intensives Erleben – auch Freude und Schönheit kommen stark an.',
      'Richtung gelassen: Ruhe unter Druck und ein klarer Kopf in schwierigen Lagen.',
      'Richtung gelassen: Du kannst anderen Halt geben, wenn sie aufgewühlt sind.'
    ],
    reibung: [
      'Eine feine Antenne kann viel Kraft kosten, wenn ständig viel auf dich einströmt.',
      'Sorgen können sich verselbstständigen und mehr Raum einnehmen, als die Lage braucht.',
      'Sehr gelassene Menschen übersehen manchmal Warnzeichen oder wirken auf andere unberührt.',
      'Wenn ein feinfühliger und ein gelassener Mensch zusammen sind, fühlt sich der eine schnell nicht ernst genommen, der andere überrollt.',
      'Wenn Anspannung oder Sorgen dich über längere Zeit sehr belasten, tut es gut, mit jemandem darüber zu sprechen.'
    ],
    weiterdenken: [
      'Woran merkst du in deinem Körper zuerst, dass dich etwas anspannt?',
      'Was hilft dir, wieder ruhig zu werden – und was eher nicht?',
      'In welchen Lagen ist deine feine Antenne ein Geschenk?',
      'Wann warst du zuletzt überraschend gelassen, und was war da anders?'
    ],
    ueben: [{ titel: 'Langsam atmen', route: 'training/uebung/h-atem' }, { titel: 'Gefühl benennen', route: 'training/uebung/k-benennen' }, { titel: 'Feste Grübel-Zeit', route: 'training/uebung/k-sorgen-zeit' }],
    verwandt: ['bigfive.stabilitaet', 'muster.ungewissheit', 'muster.kontrolle', 'muster.stress', 'muster.selbstmitgefuehl'],
    unteraeste: [
      { id: 'spiel.stabilitaet.sorgen', titel: 'Sorgen', text: 'Wie viel Raum Gedanken an mögliche Probleme bei dir bekommen. Sorgen sind ein Versuch des Kopfes, vorzubeugen – manchmal hilfreich, manchmal laut.' },
      { id: 'spiel.stabilitaet.aerger', titel: 'Ärger', text: 'Wie schnell dich etwas reizt oder nervt. Ärger zeigt oft, dass dir etwas wichtig ist oder eine Grenze berührt wird.' },
      { id: 'spiel.stabilitaet.druck', titel: 'Ruhe unter Druck', text: 'Wie du in Stress-Lagen reagierst: eher ruhig und klar oder eher angespannt und hellwach.' },
      { id: 'spiel.stabilitaet.verlockung', titel: 'Umgang mit Verlockungen', text: 'Wie leicht du plötzlichen Wünschen widerstehst. Aussagen wie „Ich kann Versuchungen leicht widerstehen.“ gehören hierher.' },
      { id: 'spiel.stabilitaet.selbst', titel: 'Mit dir im Reinen', text: 'Wie wohl du dich mit dir selbst fühlst und wie leicht du auf andere zugehst, wenn es heikel wird.' }
    ],
    wissen: 'Emotionale Stabilität ist die umgedrehte Seite von „Neurotizismus“, einem der fünf großen Bereiche im Fünf-Faktoren-Modell der Persönlichkeit. Die Forschung zählt dazu Ängstlichkeit, Ärger, Niedergeschlagenheit, Befangenheit, Unmäßigkeit und Verletzlichkeit unter Stress – das sind Beschreibungen von Neigungen, keine Diagnosen. ' + WISSEN_PAARE
  },
  {
    id: 'spiel.interessen', titel: 'Was du lieber tun würdest', bereich: 'Interessen',
    wasEsIst: 'Bei den freiwilligen Wahlen zu Tätigkeiten stehen immer zwei Beschäftigungen nebeneinander, und du nimmst die, die du lieber tun würdest – ganz gleich, ob du sie kannst. '
      + 'Dahinter steht das Modell des Berufsforschers John Holland mit sechs Interessen-Bereichen: praktisch-technisch, forschend, künstlerisch-gestaltend, sozial, unternehmerisch und ordnend. '
      + 'Die meisten Menschen haben zwei oder drei Bereiche, die sie besonders anziehen; zusammen ergeben sie ein eigenes Interessen-Muster. '
      + 'Interessen sind über die Jahre recht beständig, können sich aber mit neuen Erfahrungen verschieben. Es geht dabei nicht um Begabung, sondern darum, was dir Freude macht.',
    imAlltag: [
      'Womit du dich beschäftigst, wenn dich niemand dazu zwingt.',
      'Welche Teile einer Arbeit oder eines Hobbys dir die Zeit vergessen lassen.',
      'Ob du lieber mit Dingen, mit Ideen, mit Menschen oder mit Zahlen und Abläufen zu tun hast.',
      'Welche Aufgaben du in einer Gruppe von selbst übernimmst.'
    ],
    staerken: [
      'Praktisch-technisch: Geschick mit Händen, Werkzeug und Technik.',
      'Forschend: Neugier, genaues Hinsehen, Freude am Verstehen.',
      'Künstlerisch-gestaltend: eigene Ideen, Ausdruck und Gestaltung.',
      'Sozial: helfen, beraten, beibringen – Freude am Kontakt.',
      'Unternehmerisch und ordnend: Dinge anstoßen und leiten – oder Ordnung schaffen, auf die sich andere verlassen.'
    ],
    reibung: [
      'Wenn deine Arbeit oder Schule kaum etwas von deinen Interessen-Bereichen enthält, kostet sie mehr Kraft.',
      'Zwei Bereiche können sich ziehen, zum Beispiel Lust auf Ordnung und Lust auf freies Gestalten.',
      'Interessen-Bereiche sagen nichts darüber, was du kannst – manchmal liegt Begabung woanders als Freude.',
      'Die Tätigkeiten hier sind nur Beispiele; ein Bereich kann dich anziehen, auch wenn dir die Beispiele fremd vorkommen.'
    ],
    weiterdenken: [
      'Welche zwei Bereiche fühlen sich am meisten nach dir an?',
      'Wo in deinem Alltag kommen sie schon vor – und wo fehlen sie?',
      'Gibt es eine Tätigkeit, die mehrere deiner Bereiche verbindet?',
      'Was hast du als Kind gern gemacht, und passt das noch zu deinem Muster?'
    ],
    ueben: [{ titel: 'Interessen genauer erkunden', route: 'fragen/interessen/riasec' }, { titel: 'Eine Stärke neu einsetzen', route: 'training/uebung/w-staerke' }],
    verwandt: ['interessen.riasec', 'spiel.offenheit', 'spiel.extraversion', 'muster.sinn'],
    unteraeste: [
      { id: 'spiel.interessen.R', titel: 'Praktisch-technisch', text: 'Mit Händen, Werkzeug, Maschinen, Pflanzen oder Tieren arbeiten – etwas reparieren, bauen, anpacken.' },
      { id: 'spiel.interessen.I', titel: 'Forschend', text: 'Verstehen und untersuchen: Fragen stellen, beobachten, Zusammenhänge herausfinden.' },
      { id: 'spiel.interessen.A', titel: 'Künstlerisch-gestaltend', text: 'Eigenes erschaffen: schreiben, Musik machen, gestalten, spielen, sich ausdrücken.' },
      { id: 'spiel.interessen.S', titel: 'Sozial', text: 'Mit Menschen: helfen, beraten, beibringen, pflegen, begleiten.' },
      { id: 'spiel.interessen.E', titel: 'Unternehmerisch', text: 'Anstoßen, leiten, überzeugen, verkaufen, Verantwortung übernehmen.' },
      { id: 'spiel.interessen.C', titel: 'Ordnend', text: 'Ordnung, Zahlen und Abläufe: festhalten, rechnen, planen, verwalten.' }
    ],
    wissen: 'Die sechs Interessen-Bereiche gehen auf John L. Holland zurück (Modell „RIASEC“, nach den englischen Anfangsbuchstaben). Die Tätigkeiten hier stammen aus den IIP RIASEC Markers (Armstrong, Allison & Rounds 2008), kurzen Listen aus dem O*NET Interest Profiler des US-Arbeitsministeriums, in eigener Übersetzung. Ausgewertet wird nach Thurstone (1927): welcher Bereich bei dir im Vergleich der Paare öfter vorn liegt.'
  }
];
