// M3 textspiegel – Äste (Lerninhalt je Sprachmerkmal), unabhängig von Xanders Antworten. Vertrag: auftrag/textspiegel.txt Regel 4.
// Jeder Ast hat zwei gleichwertige Pole (pole[0] = Seite „a“, pole[1] = Seite „b“ in texte.js RICHTUNGEN), beide mit Stärken.
// Zusätzliche Felder nur für dieses Modul: saetze (Richtungs-Satz je Seite, {d} = „deutlich“/„eher“), grenze (was die Zählung nicht sieht).
// IDs = vorhandene Schlüssel der Vorlage: Waagen zeit/haltung/gefuehl/wer, Ergebnis-Felder satzlaenge/vielfalt, Wortgruppen absolut/begruenden.

export const ASTE = [
  {
    id: 'textspiegel.zeit', titel: 'Zurück oder nach vorn', bereich: 'Sprache',
    pole: [
      { name: 'Zurückschauen', text: 'Erlebtes, Erinnerungen und Erfahrungen bekommen viele Worte. Darin steckt die Stärke, aus dem Gewesenen zu lernen und die eigenen Wurzeln zu spüren.' },
      { name: 'Nach vorn schauen', text: 'Pläne, Vorhaben und Wünsche bekommen viele Worte. Darin steckt die Stärke, Ziele zu setzen und Kraft aus dem Kommenden zu ziehen.' }
    ],
    wasEsIst: 'Jede Sprache hat Wörter, die in eine Zeit zeigen: „war“, „gestern“ und „damals“ zeigen zurück, „werde“, „morgen“ und „bald“ zeigen nach vorn. Wenn du über dich schreibst, verteilt sich dein Blick auf eine eigene Art auf diese Zeiten. Die Psychologie nennt das Zeitperspektive: wie sehr jemand mit seinen Gedanken in der Vergangenheit, in der Gegenwart oder in der Zukunft unterwegs ist. Keine Zeit ist besser als eine andere – Erinnern gibt Halt und Erfahrung, Vorausdenken gibt Richtung. Der Spiegel sieht nur, welche Zeit-Wörter in deinen Texten stehen; was sie für dich bedeuten, weißt du selbst.',
    imAlltag: [
      'Beim Erzählen beginnst du eher mit „Früher war …“ – oder eher mit „Als Nächstes will ich …“.',
      'Vor einer Entscheidung schaust du eher, wie es beim letzten Mal lief – oder eher, wohin es führen soll.',
      'Mit Freunden bringst du eher gemeinsame Erinnerungen ins Gespräch – oder eher Pläne fürs Wochenende.',
      'Nach einem schwierigen Tag denkst du ihn eher noch einmal durch – oder eher schon an morgen.'
    ],
    staerken: [
      'Zurückschauen: Erfahrungen werden zu Wissen, Fehler zu Lehren.',
      'Zurückschauen: Dankbarkeit für Menschen und Momente, die dich geprägt haben.',
      'Nach vorn schauen: Ziele geben Richtung und Antrieb.',
      'Nach vorn schauen: Vorfreude – schon das Planen kann gute Laune machen.',
      'Beides zusammen: aus dem Gestern lernen und das Morgen gestalten.'
    ],
    reibung: [
      'Wer viel zurückschaut, bleibt manchmal an Dingen hängen, die sich nicht mehr ändern lassen.',
      'Wer viel nach vorn schaut, übersieht manchmal, was er schon geschafft hat.',
      'Zwei Menschen mit verschiedenem Zeitblick planen anders: Der eine will erst klären, was war, der andere will schon los.',
      'Das Jetzt kann zwischen Erinnern und Planen zu kurz kommen.'
    ],
    weiterdenken: [
      'Welche Erinnerung gibt dir heute noch Kraft?',
      'Welcher Plan beschäftigt dich gerade am meisten – und warum gerade dieser?',
      'Wann warst du zuletzt ganz im Jetzt, ohne an gestern oder morgen zu denken?',
      'Was aus deiner Vergangenheit möchtest du mitnehmen – und was darf bleiben, wo es ist?'
    ],
    ueben: [
      { titel: 'Schreib über einen Tag, an dem du ganz du warst', route: 'text/schreiben/tag' },
      { titel: 'Schreib, was dich antreibt – und was als Nächstes kommt', route: 'text/schreiben/antrieb' }
    ],
    verwandt: ['textspiegel.haltung', 'muster.werte_wandel', 'muster.sinn', 'bigfive.gewissenhaftigkeit', 'interessen.rhythmus'],
    unteraeste: [
      { id: 'textspiegel.zeit.erinnern', titel: 'Erinnern', text: 'Erinnerungen sind keine Kopien. Sie werden bei jedem Erinnern neu zusammengesetzt, darum verändert sich eine Geschichte mit dem, der sie erzählt. Wer zurückschaut, ordnet oft, was geschehen ist, und findet darin einen roten Faden.' },
      { id: 'textspiegel.zeit.planen', titel: 'Planen', text: 'Pläne helfen am meisten, wenn sie konkret sind: wann, wo, was genau. Die Forschung zu Wenn-dann-Plänen zeigt: Ein Satz wie „Wenn ich nach Hause komme, dann übe ich zehn Minuten“ macht den Anfang leichter als ein bloßes Ziel.' },
      { id: 'textspiegel.zeit.jetzt', titel: 'Das Jetzt', text: 'Zwischen Erinnern und Planen liegt die Gegenwart. In Texten zeigt sie sich in der Gegenwartsform („ich sitze“, „ich spüre“). Die Zählung hier erfasst sie nicht eigens – beim Wiederlesen deiner Texte kannst du selbst darauf achten.' }
    ],
    wissen: 'Zeitperspektive: Philip Zimbardo und John Boyd (1999) beschrieben, dass Menschen sich darin unterscheiden, wie stark sie gedanklich in Vergangenheit, Gegenwart und Zukunft leben – jede Perspektive mit Stärken und Kehrseiten. Wenn-dann-Pläne: Peter Gollwitzer (1999). Dass kleine Zeit-Wörter etwas über den Blick des Schreibenden zeigen können, gehört zur Sprachforschung von James Pennebaker (Tausczik & Pennebaker, 2010). Die Zeit-Wörter dieser App sind selbst zusammengestellt.',
    grenze: 'Die Zählung erkennt die Zeit nur an einzelnen Wörtern. „Ich wollte“ zählt zurück, „ich will“ nach vorn – auch wenn es um dieselbe Sache geht.',
    saetze: {
      a: 'Deine Texte schauen {d} zurück: Erlebtes und Erinnerungen bekommen mehr Worte als Pläne.',
      b: 'Deine Texte schauen {d} nach vorn: Pläne und Vorhaben bekommen mehr Worte als Erinnerungen.',
      beide: 'In deinen Texten halten sich Zurückschauen und Nach-vorn-Schauen die Waage – beides gehört zu deinen Texten.'
    }
  },
  {
    id: 'textspiegel.haltung', titel: 'Abwägen oder anpacken', bereich: 'Sprache',
    pole: [
      { name: 'Abwägen', text: 'Wörter wie „vielleicht“, „überlegen“ oder „warten“ stehen oft. Darin steckt die Stärke, gründlich hinzuschauen, bevor man handelt.' },
      { name: 'Anpacken', text: 'Wörter wie „machen“, „anfangen“ oder „schaffen“ stehen oft. Darin steckt die Stärke, ins Tun zu kommen und Dinge anzustoßen.' }
    ],
    wasEsIst: 'Wenn Menschen von sich erzählen, schreiben manche eher vom Überlegen, Abwarten und Zweifeln, andere eher vom Machen, Anfangen und Schaffen. Das ist kein Maß für Mut oder Fleiß, sondern ein Hinweis darauf, wo deine Aufmerksamkeit beim Schreiben liegt: eher beim Prüfen oder eher beim Handeln. Der Psychologe Julius Kuhl hat beschrieben, dass Menschen unterschiedlich schnell vom Nachdenken ins Tun wechseln – etwa vor einer Entscheidung oder nach einem Rückschlag. Beide Wege haben ihren Wert: Wer abwägt, macht weniger vorschnelle Fehler; wer anpackt, sammelt schneller Erfahrungen. Viele Menschen wechseln je nach Lage zwischen beidem.',
    imAlltag: [
      'Vor einem Kauf liest du eher alle Bewertungen – oder du nimmst, was passt.',
      'Bei einer neuen Aufgabe planst du erst – oder du fängst an und schaust unterwegs.',
      'Wenn etwas schiefgeht, denkst du erst darüber nach – oder du versuchst gleich etwas Neues.',
      'In einer Gruppe bist du eher die Person, die Fragen stellt – oder die, die sagt: „Los geht’s.“'
    ],
    staerken: [
      'Abwägen: Risiken früh sehen.',
      'Abwägen: Entscheidungen, hinter denen man lange stehen kann.',
      'Anpacken: Dinge kommen in Gang, auch wenn noch nicht alles klar ist.',
      'Anpacken: Man lernt durch Ausprobieren.',
      'Beides: erst kurz prüfen, dann handeln.'
    ],
    reibung: [
      'Langes Abwägen kann Dinge liegen lassen, die eigentlich schon reif wären.',
      'Schnelles Anpacken kann Fehler bringen, die mit etwas Prüfen vermeidbar gewesen wären.',
      'Jemand, der abwägt, und jemand, der anpackt, können sich im selben Team bremsen – oder sehr gut ergänzen.',
      'Wer alles abwägt, ist manchmal müde von Entscheidungen, die anderen leichtfallen.'
    ],
    weiterdenken: [
      'Bei welcher Sache wartest du gerade – und worauf eigentlich?',
      'Wann hat dir Abwarten schon einmal mehr gebracht als schnelles Handeln?',
      'Wann war es gut, einfach anzufangen?',
      'Was ist der kleinste Schritt, mit dem du eine Sache diese Woche beginnen könntest?'
    ],
    ueben: [
      { titel: 'Schreib über das, was dich bremst', route: 'text/schreiben/bremse' },
      { titel: 'Kleine Übungen im Training', route: 'training' }
    ],
    verwandt: ['textspiegel.zeit', 'textspiegel.absolut', 'muster.entscheiden', 'muster.ungewissheit', 'muster.kontrolle', 'bigfive.gewissenhaftigkeit'],
    unteraeste: [
      { id: 'textspiegel.haltung.gut_genug', titel: 'Das Beste oder gut genug', text: 'Barry Schwartz unterschied Menschen, die bei Entscheidungen das Beste suchen, von Menschen, die nehmen, was gut genug ist. Wer das Beste sucht, findet oft eine sehr gute Wahl – vergleicht dafür aber länger und zweifelt öfter. Wer „gut genug“ wählt, ist schneller fertig und mit der Wahl oft zufrieden.' },
      { id: 'textspiegel.haltung.wenn_dann', titel: 'Vom Denken ins Tun', text: 'Ein Wenn-dann-Plan verbindet eine Lage mit einer Handlung: „Wenn ich nach dem Essen aufstehe, dann schreibe ich zehn Minuten.“ So muss man im Moment nicht mehr entscheiden – der Plan nimmt den ersten Schritt ab.' },
      { id: 'textspiegel.haltung.pause', titel: 'Die bewusste Pause', text: 'Abwarten ist nicht dasselbe wie Aufschieben. Eine bewusste Pause hat ein Ende: Man wartet auf eine Information, auf eine Nacht Schlaf oder auf einen ruhigeren Moment – und entscheidet dann.' }
    ],
    wissen: 'Handlungs- und Lageorientierung: Julius Kuhl (ab den 1980er-Jahren). Das Beste suchen oder „gut genug“ nehmen: Barry Schwartz und Kollegen (2002). Wenn-dann-Pläne: Peter Gollwitzer (1999). Die Wörter für Abwägen und Tun in dieser App sind selbst zusammengestellt und nicht eigens geprüft.',
    grenze: 'Die Zählung sieht „macht“ auch in „Das macht mir Sorgen“. Sie zählt Wörter, keine Taten.',
    saetze: {
      a: 'Deine Texte sprechen {d} vom Abwägen: Überlegen, Zögern und Prüfen bekommen mehr Worte als das Tun.',
      b: 'Deine Texte sprechen {d} vom Anpacken: Machen, Anfangen und Schaffen bekommen mehr Worte als das Zögern.',
      beide: 'In deinen Texten stehen Abwägen und Anpacken nebeneinander – beides gehört zu deinen Texten.'
    }
  },
  {
    id: 'textspiegel.gefuehl', titel: 'Sachlich oder gefühlsnah', bereich: 'Sprache',
    pole: [
      { name: 'Sachlich erzählen', text: 'Ereignisse und Dinge stehen im Vordergrund, Gefühle eher zwischen den Zeilen. Darin steckt die Stärke, klar und ruhig zu beschreiben.' },
      { name: 'Gefühle benennen', text: 'Freude, Sorge, Ärger oder Stolz werden beim Namen genannt. Darin steckt die Stärke, Inneres sichtbar und besprechbar zu machen.' }
    ],
    wasEsIst: 'Manche Menschen schreiben über einen Tag, indem sie erzählen, was geschah. Andere schreiben, wie er sich angefühlt hat. Beides sind Arten, Erlebtes festzuhalten. Der Spiegel zählt Gefühlswörter – freundliche wie „froh“ oder „stolz“ und schwere wie „Angst“ oder „traurig“ – und sieht, wie dicht sie in deinen Texten stehen. Steht ein „nicht“ davor, zählt das Wort nicht mit. Wenige Gefühlswörter heißen nicht wenige Gefühle: Viele Menschen zeigen sie lieber durch das, was sie erzählen.',
    imAlltag: [
      'Auf die Frage „Wie war’s?“ erzählst du eher, was passiert ist – oder eher, wie es dir ging.',
      'In Nachrichten an Freunde schreibst du eher, was los ist – oder eher, was dich freut oder nervt.',
      'Wenn dich etwas beschäftigt, beschreibst du eher die Lage – oder eher dein Gefühl dazu.',
      'Bei Filmen und Musik achtest du eher auf die Handlung – oder eher auf die Stimmung.'
    ],
    staerken: [
      'Sachlich: Ruhe und Klarheit, auch wenn es turbulent wird.',
      'Sachlich: Andere können sich ein genaues Bild von der Lage machen.',
      'Gefühlsnah: Andere verstehen schnell, was dir wichtig ist.',
      'Gefühlsnah: Ein Gefühl beim Namen zu nennen, kann helfen, es zu ordnen.',
      'Beides: erzählen, was war, und sagen, wie es war.'
    ],
    reibung: [
      'Sachliche Texte wirken auf manche Leser kühler, als sie gemeint sind.',
      'Gefühlsnahe Texte wirken auf manche Leser persönlicher, als es dir in dem Moment lieb ist.',
      'Wer sachlich erzählt und mit jemandem spricht, der gefühlsnah erzählt, fühlt sich manchmal missverstanden – obwohl beide dasselbe Erlebnis meinen.',
      'Gefühlswörter hängen stark vom Tag ab: Ein Text an einem schweren Tag klingt anders als einer an einem leichten.'
    ],
    weiterdenken: [
      'Wie hat sich der Tag aus deiner ersten Aufgabe angefühlt – in einem Wort?',
      'Welches Gefühl kennst du gut, nennst es aber selten beim Namen?',
      'Wem erzählst du eher Gefühle, wem eher, was passiert ist?',
      'Welche Kleinigkeit hat dir in letzter Zeit gutgetan?'
    ],
    ueben: [
      { titel: 'Schreib über einen Tag, an dem du ganz du warst – und wie er sich anfühlte', route: 'text/schreiben/tag' },
      { titel: 'Ruhe-Übungen im Training', route: 'training' }
    ],
    verwandt: ['textspiegel.wer', 'muster.emotionen', 'muster.selbstmitgefuehl', 'bigfive.stabilitaet', 'bigfive.extraversion'],
    unteraeste: [
      { id: 'textspiegel.gefuehl.benennen', titel: 'Gefühle in Worte fassen', text: 'In einer Studie von Matthew Lieberman und Kollegen (2007) war die Gefühlsreaktion im Gehirn schwächer, wenn Menschen ein Gefühl in ein Wort fassten, als wenn sie nur hinschauten. Das Benennen schafft offenbar etwas Abstand. Es ist kein Muss – aber ein Werkzeug, das man ausprobieren kann.' },
      { id: 'textspiegel.gefuehl.feinheit', titel: 'Feine Unterschiede', text: 'Manche Menschen unterscheiden Gefühle sehr fein: nicht nur „schlecht“, sondern „enttäuscht“, „gereizt“ oder „müde“. Die Forschung nennt das Gefühls-Differenzierung. Feinere Worte machen es oft leichter zu merken, was man gerade braucht – und lassen sich üben.' },
      { id: 'textspiegel.gefuehl.schweres_schoenes', titel: 'Schweres und Schönes', text: 'In fast allen Sprachen benutzen Menschen insgesamt mehr freundliche als schwere Wörter. Stehen in deinen Texten viele schwere Wörter, liegt das oft am Thema – etwa bei der Frage, was dich bremst – oder an der Stimmung des Tages. Beides gehört zum Leben und darf in einen Text.' },
      { id: 'textspiegel.gefuehl.schreiben', titel: 'Schreiben über Erlebtes', text: 'James Pennebaker ließ ab 1986 Menschen an mehreren Tagen über bewegende Erlebnisse schreiben. Viele empfanden das als entlastend; eine Übersicht über viele solche Studien fand im Mittel kleine Effekte. Schreiben ist eine Möglichkeit unter vielen, mit Erlebtem umzugehen – kein Ersatz für Menschen, mit denen man redet.' }
    ],
    wissen: 'Gefühle benennen: Lieberman und Kollegen (2007). Feine Gefühlsunterschiede: Kashdan, Barrett und McKnight (2015). Mehr freundliche als schwere Wörter in der Sprache: Dodds und Kollegen (2015). Schreiben über Erlebtes: Pennebaker und Beall (1986), Übersicht vieler Studien von Frattaroli (2006). Die Gefühlswörter dieser App sind selbst zusammengestellt (keine fremde Wortliste).',
    grenze: 'Ironie („na toll“) und Gefühle ohne Gefühlswort („mir zitterten die Hände“) erkennt die Zählung nicht.',
    saetze: {
      a: 'Deine Texte erzählen {d} sachlich: Ereignisse stehen im Vordergrund, Gefühle eher zwischen den Zeilen.',
      b: 'Deine Texte sind {d} gefühlsnah: Du nennst Gefühle gern beim Namen.',
      beide: 'Deine Texte erzählen sachlich und nennen auch Gefühle – beides gehört zu deinen Texten.'
    }
  },
  {
    id: 'textspiegel.wer', titel: 'Von dir oder mit anderen', bereich: 'Sprache',
    pole: [
      { name: 'Von dir aus erzählen', text: '„Ich“, „mir“ und „mein“ stehen oft. Darin steckt die Stärke, für sich selbst zu sprechen und zur eigenen Sicht zu stehen.' },
      { name: 'Mit anderen erzählen', text: '„Wir“, „du“, Freunde und Familie stehen oft. Darin steckt die Stärke, Menschen mitzudenken und Verbindungen sichtbar zu machen.' }
    ],
    wasEsIst: 'Kleine Wörter wie „ich“, „wir“ und „du“ zeigen, wer in einem Text vorkommt. Der Sprachforscher James Pennebaker hat beschrieben, dass gerade diese unscheinbaren Wörter etwas über die Sicht des Schreibenden verraten – aber nur ein wenig und nur im Durchschnitt vieler Menschen. Die Aufgaben hier fragen nach dir; viele Ich-Wörter liegen darum nahe. Spannend ist, wo andere Menschen auftauchen: als „wir“, als „du“ oder als Freunde, Familie, Team. Viele Ich-Wörter heißen übrigens nicht, dass jemand eitel ist – das hat eine große Studie ausdrücklich nicht gefunden.',
    imAlltag: [
      'Erzählst du von einem Erfolg, sagst du eher „ich habe …“ – oder eher „wir haben …“.',
      'In einer Diskussion sprichst du eher für dich – oder eher für die Gruppe.',
      'Wenn du von deinem Tag erzählst, kommen eher deine Gedanken vor – oder eher die Menschen, die du getroffen hast.',
      '„Man“ statt „ich“ schafft Abstand: „Man fühlt sich dann blöd“ klingt anders als „Ich fühle mich dann blöd“.'
    ],
    staerken: [
      'Von dir aus: klare Ich-Botschaften, die andere gut verstehen.',
      'Von dir aus: Du stehst für deine Sicht ein.',
      'Mit anderen: Du denkst Menschen mit und teilst Erfolge.',
      'Mit anderen: Zusammenhalt wird hörbar.',
      'Beides: für sich sprechen und andere einbeziehen.'
    ],
    reibung: [
      'Viele Ich-Sätze können für andere so klingen, als gäbe es nur deine Sicht – auch wenn du es nicht so meinst.',
      'Viel „wir“ kann die eigene Meinung verstecken.',
      '„Man“ verallgemeinert: Was für dich gilt, klingt dann wie eine Regel für alle.',
      'Wer viel von anderen erzählt, verliert manchmal aus dem Blick, was er selbst will.'
    ],
    weiterdenken: [
      'Bei welchen Themen sagst du eher „wir“, bei welchen eher „ich“?',
      'Lies einen Satz mit „man“ noch einmal mit „ich“. Klingt er dann anders?',
      'Welche Menschen tauchen in deinen Texten auf – und welche fehlen?',
      'Wann sprichst du lieber für dich, wann lieber für andere?'
    ],
    ueben: [
      { titel: 'Schreib, wie dich ein guter Freund beschreiben würde', route: 'text/schreiben/freund' }
    ],
    verwandt: ['textspiegel.gefuehl', 'muster.werte_ich_wir', 'muster.kommunikation', 'bigfive.extraversion', 'bigfive.vertraeglichkeit'],
    unteraeste: [
      { id: 'textspiegel.wer.man', titel: '„Man“ statt „ich“', text: '„Man“ macht aus einem eigenen Erlebnis eine allgemeine Aussage. Das kann Abstand schaffen, wenn etwas nahegeht, oder höflich klingen. Es kann aber auch verdecken, dass man selbst gemeint ist. Ein Satz mit „ich“ statt „man“ ist oft genauer.' },
      { id: 'textspiegel.wer.wir', titel: 'Die Kraft des „Wir“', text: '„Wir“ zeigt Zugehörigkeit: zu Familie, Freunden, Team. Wer viel „wir“ schreibt, erlebt sich oft als Teil von etwas. Gleichzeitig kann im „wir“ die eigene Stimme leiser werden.' },
      { id: 'textspiegel.wer.ich_botschaft', titel: 'Ich-Botschaften', text: '„Ich ärgere mich, wenn …“ statt „Du machst immer …“: Ich-Botschaften sprechen von der eigenen Sicht und lassen dem anderen Raum. Die Idee stammt aus der Gesprächsführung von Thomas Gordon und wird in vielen Kommunikations-Kursen geübt.' }
    ],
    wissen: 'Kleine Wörter und was sie zeigen: James Pennebaker (2011, „The Secret Life of Pronouns“) und Tausczik & Pennebaker (2010). Viele Ich-Wörter bedeuten nicht Eitelkeit: Carey und Kollegen (2015). Ich-Botschaften: Thomas Gordon (1970). Die Wortlisten dieser App sind selbst zusammengestellt.',
    grenze: 'Die Aufgaben fragen nach dir – darum zeigt der Spiegel die Seite „von dir aus“ höchstens als „eher“.',
    saetze: {
      a: 'Deine Texte erzählen {d} von dir aus: Deine eigene Sicht steht im Mittelpunkt.',
      b: 'Deine Texte erzählen {d} mit anderen: Freunde, Familie, „wir“ und „du“ kommen oft vor.',
      beide: 'In deinen Texten kommen du und andere Menschen vor – beides gehört zu deinen Texten.'
    }
  },
  {
    id: 'textspiegel.satzlaenge', titel: 'Knapp oder ausführlich', bereich: 'Sprache',
    pole: [
      { name: 'Knapp', text: 'Kurze Sätze, die schnell auf den Punkt kommen. Darin steckt die Stärke, klar und leicht verständlich zu sein.' },
      { name: 'Ausführlich', text: 'Lange Sätze, die Gedanken mit „und“, „weil“ und „aber“ verbinden. Darin steckt die Stärke, Zusammenhänge zu zeigen.' }
    ],
    wasEsIst: 'Wie lang Sätze sind, gehört zur eigenen Schreibstimme. Manche schreiben kurz. Punkt. Andere verbinden einen Gedanken mit dem nächsten, hängen ein „weil“ an und ein „aber“, bis ein langer Satz entsteht. Beides kann sehr gut lesbar sein: Kurze Sätze wirken direkt und kraftvoll, lange Sätze tragen Feinheiten und Zusammenhänge. Auch das Handy prägt das – wer viele Nachrichten schreibt, schreibt oft kürzer.',
    imAlltag: [
      'In Nachrichten schreibst du eher „Komme gleich.“ – oder eher einen ganzen Absatz.',
      'Beim Erklären sagst du eher das Ergebnis – oder eher den ganzen Weg dorthin.',
      'Beim Erzählen springst du eher von Bild zu Bild – oder du verbindest alles zu einer Kette.',
      'Beim Lesen magst du eher kurze, schnelle Texte – oder eher lange, ruhige.'
    ],
    staerken: [
      'Knapp: schnell verständlich, auch für Menschen, die Deutsch lernen.',
      'Knapp: Wichtiges fällt auf.',
      'Ausführlich: Zusammenhänge und Gründe werden sichtbar.',
      'Ausführlich: Feine Unterschiede haben Platz.',
      'Beides: kurz, wo es klar sein soll, lang, wo es etwas zu verbinden gibt.'
    ],
    reibung: [
      'Sehr knappe Texte wirken auf manche Leser kühl oder abgehackt.',
      'Sehr lange Sätze verlieren manche Leser unterwegs.',
      'Was für dich klar ist, braucht für andere vielleicht einen Satz mehr – oder einen weniger.',
      'In Nachrichten und in längeren Texten passt oft eine andere Länge.'
    ],
    weiterdenken: [
      'Schreibst du in Nachrichten anders als hier – und warum?',
      'Welcher deiner Sätze ist dir am wichtigsten? Ist er kurz oder lang?',
      'Wann hilft dir ein kurzer Satz, wann ein langer?',
      'Wie würde dein liebster Text klingen, wenn du ihn halb so lang schreibst?'
    ],
    ueben: [
      { titel: 'Schreib einen deiner Texte neu – einmal ganz knapp', route: 'text/schreiben/antrieb' }
    ],
    verwandt: ['textspiegel.vielfalt', 'textspiegel.begruenden', 'muster.neugier_denken', 'bigfive.offenheit'],
    unteraeste: [
      { id: 'textspiegel.satzlaenge.rhythmus', titel: 'Rhythmus', text: 'Viele lebendige Texte mischen: ein langer Satz, der etwas aufbaut, dann ein kurzer, der es festhält. Der Wechsel gibt einem Text Rhythmus.' },
      { id: 'textspiegel.satzlaenge.verbinden', titel: 'Verbindungswörter', text: '„Und“, „aber“, „weil“ und „obwohl“ verbinden Gedanken. Welche man benutzt, zeigt, wie man Gedanken ordnet: aneinanderreihen (und), gegenüberstellen (aber) oder begründen (weil).' }
    ],
    wissen: 'Schreibstil als persönliche Eigenart: James Pennebaker und Laura King (1999) fanden, dass Menschen ihren Schreibstil über verschiedene Texte hinweg recht stabil behalten. Die Grenzen für „knapp“ und „ausführlich“ in dieser App sind eigene, grobe Grenzen.',
    grenze: 'Ohne Satzzeichen erkennt die Zählung keine Sätze – dann sagt sie zur Satzlänge nichts.',
    saetze: {
      a: 'Deine Texte sind {d} knapp: kurze Sätze, die schnell auf den Punkt kommen.',
      b: 'Deine Texte sind {d} ausführlich: lange Sätze, die Gedanken miteinander verbinden.',
      beide: 'Deine Sätze liegen zwischen knapp und ausführlich – beides gehört zu deinen Texten.'
    }
  },
  {
    id: 'textspiegel.absolut', titel: 'Ganz oder abgestuft', bereich: 'Sprache',
    pole: [
      { name: 'Ganze Worte', text: '„Immer“, „nie“, „alles“, „total“. Darin steckt die Stärke, klar, entschieden und mit Nachdruck zu sprechen.' },
      { name: 'Abgestufte Worte', text: '„Meistens“, „oft“, „eher“, „vielleicht“. Darin steckt die Stärke, genau zu sein und Raum für Ausnahmen zu lassen.' }
    ],
    wasEsIst: 'Manche Wörter machen eine Aussage ganz: „immer“, „nie“, „alles“, „niemand“. Andere stufen ab: „meistens“, „oft“, „ziemlich“, „eher“. Die Sprachwissenschaft nennt solche Abstufungs-Wörter „Hedges“ – kleine Absicherungen. Ganze Worte geben Sätzen Kraft und Klarheit, abgestufte Worte machen sie genauer. Fast jeder sagt mal „immer“, wenn er „oft“ meint – das ist Teil lebendiger Sprache.',
    imAlltag: [
      '„Das klappt nie“ oder „Das klappt selten“ – beides kann dasselbe Erlebnis meinen.',
      'Beim Begeistern sagst du vielleicht „total“ und „absolut“, beim Abwägen eher „ziemlich“ und „eher“.',
      'In einem Streit fallen ganze Worte leicht: „Du kommst immer zu spät.“',
      'Beim Erklären sicherst du dich vielleicht mit „eigentlich“ oder „vielleicht“ ab.'
    ],
    staerken: [
      'Ganze Worte: Klarheit und Nachdruck.',
      'Ganze Worte: Begeisterung wird hörbar.',
      'Abgestufte Worte: Genauigkeit.',
      'Abgestufte Worte: Raum für andere Sichtweisen.',
      'Beides: mit Nachdruck sprechen, wo es zählt, und abstufen, wo es genauer stimmt.'
    ],
    reibung: [
      'Ganze Worte kommen in Gesprächen manchmal härter an, als sie gemeint sind.',
      'Ganze Worte machen aus einem schweren Tag schnell ein „alles ist schlecht“ – auch in den eigenen Gedanken.',
      'Viele abgestufte Worte können unsicher klingen, auch wenn du dir sicher bist.',
      'Wer ganz spricht und wer abstuft, hören beim anderen manchmal etwas, das gar nicht gemeint war.'
    ],
    weiterdenken: [
      'Stimmt ein „immer“ in deinen Texten ganz genau – oder eher meistens?',
      'Wo in deinem Leben passt ein „nie“ wirklich?',
      'Bei welchem Thema sprichst du mit Nachdruck – und warum gerade da?',
      'Wann sicherst du dich mit „vielleicht“ ab, obwohl du es eigentlich genau weißt?'
    ],
    ueben: [
      { titel: 'Lies deinen Text „Was mich bremst“ und tausche ein „immer“ gegen „oft“', route: 'text/schreiben/bremse' }
    ],
    verwandt: ['textspiegel.haltung', 'textspiegel.begruenden', 'muster.ungewissheit', 'muster.kommunikation'],
    unteraeste: [
      { id: 'textspiegel.absolut.nachdruck', titel: 'Nachdruck', text: 'Ganze Worte sind ein Stilmittel: Lieder, Reden und Werbung leben davon. „Ich gebe nie auf“ klingt stärker als „Ich gebe wahrscheinlich nicht auf“.' },
      { id: 'textspiegel.absolut.genauigkeit', titel: 'Genauigkeit', text: 'Abstufungen machen Aussagen genauer: „Ich komme oft zu spät“ lässt Platz für die Tage, an denen es klappt. Wer so über sich spricht, lässt auch sich selbst Raum für Ausnahmen.' }
    ],
    wissen: 'Abstufungs-Wörter („Hedges“): George Lakoff (1973). Die ganzen und die abgestuften Wörter dieser App sind selbst zusammengestellt.',
    grenze: '„Nie wieder Pizza!“ ist ein Witz, kein Lebensmotto – die Zählung merkt den Unterschied nicht.',
    saetze: {
      a: 'Deine Texte sprechen {d} in ganzen Worten: „immer“, „nie“ und „alles“ geben ihnen Nachdruck.',
      b: 'Deine Texte sprechen {d} abgestuft: „oft“, „eher“ und „vielleicht“ lassen Raum für Ausnahmen.',
      beide: 'In deinen Texten stehen ganze und abgestufte Worte nebeneinander – beides gehört zu deinen Texten.'
    }
  },
  {
    id: 'textspiegel.begruenden', titel: 'Erzählen oder erklären', bereich: 'Sprache',
    pole: [
      { name: 'Erzählen', text: 'Was geschah, wer da war, wie es weiterging. Darin steckt die Stärke, Erlebtes lebendig und anschaulich zu machen.' },
      { name: 'Erklären', text: '„Weil“, „deshalb“, „ich merke“, „ich verstehe“. Darin steckt die Stärke, Gründe zu suchen und Zusammenhänge zu bauen.' }
    ],
    wasEsIst: 'Der Psychologe Jerome Bruner beschrieb zwei Arten zu denken: erzählend, in Geschichten mit Menschen, Orten und Wendungen – und erklärend, in Gründen, Regeln und Zusammenhängen. Beide sind gleich alt und gleich menschlich. In Texten zeigt sich das an kleinen Wörtern: Beim Erklären stehen „weil“, „deshalb“, „ich merke“ oder „ich verstehe“, beim Erzählen eher „dann“, „und“ oder „da war“. Der Spiegel zählt die Erklär- und Nachdenk-Wörter und sieht, ob deine Texte eher zeigen oder eher begründen.',
    imAlltag: [
      'Fragt jemand „Wie war der Urlaub?“, erzählst du eher eine Geschichte – oder eher, warum er schön war.',
      'Nach einem Streit erzählst du eher, was passiert ist – oder eher, warum es passiert ist.',
      'Beim Lernen merkst du dir eher Beispiele – oder eher Regeln.',
      'Beim Nachdenken über dich fragst du eher „Was ist passiert?“ – oder eher „Warum bin ich so?“.'
    ],
    staerken: [
      'Erzählen: Andere können sich alles vorstellen.',
      'Erzählen: Erinnerungen bleiben lebendig.',
      'Erklären: Zusammenhänge werden klar.',
      'Erklären: Man versteht sich selbst und andere besser.',
      'Beides: eine Geschichte erzählen und sagen, was man daraus mitnimmt.'
    ],
    reibung: [
      'Reines Erzählen lässt manchmal offen, was man daraus mitnimmt.',
      'Viel Erklären kann trocken wirken oder ins Grübeln führen.',
      'Wer erzählt und wer erklärt, wollen im Gespräch oft Verschiedenes: der eine die Geschichte, der andere den Grund.',
      'Nicht alles hat einen Grund, den man finden kann – manches ist einfach so.'
    ],
    weiterdenken: [
      'Welche Geschichte aus deinem Leben erzählst du am liebsten?',
      'Welche Frage nach dem „Warum“ beschäftigt dich gerade?',
      'Was nimmst du aus der Sache mit, die dich zuletzt gebremst hat?',
      'Gibt es etwas, das du lieber erzählst als erklärst?'
    ],
    ueben: [
      { titel: 'Schreib, was dich bremst – und was du dann machst', route: 'text/schreiben/bremse' }
    ],
    verwandt: ['textspiegel.satzlaenge', 'textspiegel.zeit', 'muster.neugier_denken', 'muster.lernen', 'bigfive.offenheit'],
    unteraeste: [
      { id: 'textspiegel.begruenden.geschichte', titel: 'Das eigene Leben als Geschichte', text: 'Dan McAdams beschreibt, dass Menschen ihr Leben als Geschichte erzählen – mit Kapiteln, Wendepunkten und einem roten Faden. Diese Geschichte verändert sich mit dem, was man erlebt. Sie zu erzählen, ist eine Art, sich selbst zu verstehen.' },
      { id: 'textspiegel.begruenden.verstehen', titel: 'Wörter des Verstehens', text: 'In Schreibstudien von James Pennebaker fiel auf: Manche Menschen benutzten beim wiederholten Schreiben über ein Erlebnis von Mal zu Mal mehr Wörter wie „weil“, „verstehen“ und „merken“ – als würden sie dabei Zusammenhänge bauen.' },
      { id: 'textspiegel.begruenden.fragen', titel: 'Fragen im eigenen Text', text: 'Fragen in einem eigenen Text („Warum mache ich das eigentlich?“) zeigen, dass jemand mit sich im Gespräch ist. Der Spiegel zeigt dir, ob deine Texte Fragen stellen.' }
    ],
    wissen: 'Zwei Arten zu denken – erzählend und erklärend: Jerome Bruner (1986). Das Leben als Geschichte: Dan McAdams (2001). Erklär- und Verstehens-Wörter in Texten: Pennebaker, Mayne und Francis (1997) sowie Tausczik & Pennebaker (2010). Die Grenzen für „erzählen“ und „erklären“ in dieser App sind eigene, grobe Grenzen.',
    grenze: '„Denn“ und „weil“ stehen auch in Sätzen, die gar nichts erklären. Die Zählung sieht nur das Wort.',
    saetze: {
      a: 'Deine Texte erzählen {d}: Sie zeigen, was geschah, mehr als sie es begründen.',
      b: 'Deine Texte erklären {d}: Wörter wie „weil“, „merke“ und „verstehe“ zeigen, dass du nach Gründen suchst.',
      beide: 'Deine Texte erzählen und erklären – beides gehört zu deinen Texten.'
    }
  },
  {
    id: 'textspiegel.vielfalt', titel: 'Wiederkehrend oder wechselnd', bereich: 'Sprache',
    pole: [
      { name: 'Wiederkehrende Worte', text: 'Dieselben Wörter kommen wieder. Darin steckt die Stärke, einen roten Faden zu halten und Wichtiges zu betonen.' },
      { name: 'Wechselnde Worte', text: 'Immer wieder neue Wörter. Darin steckt die Stärke, Abwechslung und feine Unterschiede in einen Text zu bringen.' }
    ],
    wasEsIst: 'Wie oft in einem Text neue Wörter auftauchen, nennt die Sprachforschung Wortvielfalt. Die App schaut dafür immer auf ein Stück von 50 Wörtern, das durch deinen Text wandert, und sieht, wie viele davon verschieden sind. So hängt das Ergebnis kaum davon ab, wie lang ein Text ist. Wiederholung ist kein Mangel: Sie macht Texte rhythmisch und klar, Lieder leben davon. Wechselnde Wörter machen Texte bunt. Auch Thema und Stimmung spielen hinein – wer aufgeregt erzählt, wiederholt oft mehr.',
    imAlltag: [
      'Beim Erzählen kehrst du eher zu einem Wort zurück, das dir wichtig ist – oder du suchst gern ein neues.',
      'In Liedern magst du eher den Refrain – oder eher die Strophen, die immer anders sind.',
      'Beim Erklären bleibst du eher bei einem Begriff, damit es klar bleibt – oder du sagst es jedes Mal etwas anders.',
      'Beim Lesen fallen dir eher ungewöhnliche Wörter auf – oder eher der rote Faden.'
    ],
    staerken: [
      'Wiederkehrend: klar und leicht zu folgen.',
      'Wiederkehrend: Wichtiges bleibt im Ohr.',
      'Wechselnd: lebendig und abwechslungsreich.',
      'Wechselnd: Feine Unterschiede bekommen eigene Wörter.',
      'Beides: ein roter Faden mit bunten Stellen.'
    ],
    reibung: [
      'Viel Wiederholung kann manche Leser ermüden.',
      'Viel Abwechslung kann den roten Faden verdecken.',
      'Wer Deutsch lernt, wiederholt oft Wörter, die er sicher kennt – das sagt dann mehr über die Sprache als über den Menschen.',
      'Kurze Texte geben dazu nur ein ungefähres Bild.'
    ],
    weiterdenken: [
      'Welches Wort taucht in deinen Texten immer wieder auf – und warum gerade dieses?',
      'Gibt es ein Wort, das du gern öfter benutzen würdest?',
      'Wie klingt dein liebster Satz, wenn du ein Wort darin austauschst?',
      'Welche Wörter benutzt du beim Schreiben, aber nie beim Reden?'
    ],
    ueben: [
      { titel: 'Tiefer lesen: Wörter, die in deinen Texten wiederkehren', route: 'text/tiefer' }
    ],
    verwandt: ['textspiegel.satzlaenge', 'muster.neugier_denken', 'bigfive.offenheit'],
    unteraeste: [
      { id: 'textspiegel.vielfalt.lieblingswoerter', titel: 'Lieblingswörter', text: 'Fast jeder Mensch hat Wörter, die er besonders oft benutzt – „eigentlich“, „krass“, „halt“, „irgendwie“. Freunde erkennen einen daran. In „Tiefer lesen“ zeigt dir die App, welche Wörter in deinen Texten wiederkehren.' },
      { id: 'textspiegel.vielfalt.refrain', titel: 'Wiederholung als Stilmittel', text: 'Reden, Gedichte und Lieder wiederholen bewusst. Wiederholung gibt einem Text Rhythmus und macht einen Gedanken stark.' }
    ],
    wissen: 'Wortvielfalt über ein wanderndes Fenster (MATTR): Michael Covington und Joe McFall (2010). Die Grenzen für „wiederkehrend“ und „wechselnd“ in dieser App sind eigene, grobe Grenzen.',
    grenze: 'Tippfehler zählen als neue Wörter. Bei sehr kurzen Texten ist die Vielfalt kaum aussagekräftig.',
    saetze: {
      a: 'Deine Texte kehren {d} zu denselben Wörtern zurück: ein roter Faden, der Wichtiges betont.',
      b: 'Deine Texte wechseln {d} die Wörter: viel Abwechslung, viele verschiedene Worte.',
      beide: 'Deine Texte mischen wiederkehrende und neue Wörter – beides gehört zu deinen Texten.'
    }
  }
];
export const AST = Object.fromEntries(ASTE.map((a) => [a.id.split('.')[1], a]));
