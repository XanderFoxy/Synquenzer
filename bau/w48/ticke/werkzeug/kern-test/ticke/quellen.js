// Wie ich ticke – gemeinsame Quellen und die drei Evidenz-Stufen (ARCH.md §6). Wird erst geladen, wenn jemand eine Marke antippt.
// Quellen-Format: id → { text (volle Angabe, reiner Text), notiz? (was sie zeigt, ein Satz), erklaerung (2–5 Sätze: was dort steht und
// was es bedeutet) }. KEINE Links: Die App führt nie auf fremde Seiten – alles Wissen steht hier in der App.
// IDs: nachnameJahr (klein, ohne Umlaute), bei Gleichheit a/b anhängen. Modul-Quellen stehen in module/<id>/quellen.js.

export const STUFEN = {
  belegt: { name: "belegt", kurz: "Direkt aus der Forschung", text: "Gute Studien zeigen das, meist mehrere und mit vielen Menschen. Es sind Durchschnitts-Befunde – bei dir kann es anders sein." },
  abgeleitet: { name: "abgeleitet", kurz: "Aus der Forschung übertragen", text: "Das folgt aus belegten Befunden, wurde aber genau so nicht eigens geprüft. Nimm es als gut begründete Vermutung." },
  idee: { name: "Idee", kurz: "Zum Ausprobieren", text: "Eine Anregung, nicht geprüft. Probier es aus und schau ehrlich, ob es dir hilft." }
};

export const QUELLEN = {
  goldberg2006: {
    text: "Goldberg, L. R., Johnson, J. A., Eber, H. W., Hogan, R., Ashton, M. C., Cloninger, C. R., & Gough, H. G. (2006). The International Personality Item Pool and the future of public-domain personality measures. Journal of Research in Personality, 40, 84–96.",
    notiz: "Der IPIP: frei nutzbare (gemeinfreie) Fragen für Persönlichkeits-Fragebögen.",
    erklaerung: "Der Artikel stellt den International Personality Item Pool (IPIP) vor: eine frei zugängliche Sammlung von über 2.000 kurzen Aussagen, aus denen sich Persönlichkeits-Fragebögen bauen lassen. Die Autoren zeigen, dass Skalen aus diesem Pool ähnlich gut messen wie bekannte kommerzielle Fragebögen. Weil die Aussagen gemeinfrei sind, darf jede und jeder sie nutzen, übersetzen und anpassen. Die Fragen zur Persönlichkeit in dieser App gehen darauf zurück."
  },
  soto2019: {
    text: "Soto, C. J. (2019). How replicable are links between personality traits and consequential life outcomes? The Life Outcomes of Personality Replication Project. Psychological Science, 30, 711–727.",
    notiz: "87 % von 78 Zusammenhängen zwischen Big Five und Lebensbereichen ließen sich bestätigen, im Mittel mit 77 % der ursprünglichen Stärke.",
    erklaerung: "Soto hat 78 bekannte Befunde darüber, wie die fünf großen Grundzüge mit Lebensbereichen zusammenhängen (etwa Beziehungen, Arbeit, Gesundheit), mit großen neuen Stichproben noch einmal geprüft – und vorher festgelegt, wie ausgewertet wird. 87 % der Zusammenhänge zeigten sich wieder in derselben Richtung, im Mittel mit etwa drei Vierteln der ursprünglichen Stärke. Die Verbindungen sind also echt, aber meist kleiner als zuerst berichtet. Sie beschreiben Gruppen von Menschen und sind keine Vorhersage für einen einzelnen Menschen."
  },
  roberts2017: {
    text: "Roberts, B. W., Luo, J., Briley, D. A., Chow, P. I., Su, R., & Hill, P. L. (2017). A systematic review of personality trait change through intervention. Psychological Bulletin, 143(2), 117–141.",
    notiz: "Persönlichkeit ändert sich durch gezielte Begleitung messbar (vor allem Therapie), im Mittel etwa d = .37 über rund 24 Wochen, am deutlichsten bei emotionaler Stabilität.",
    erklaerung: "Die Übersicht fasst über 200 Studien zusammen, in denen Menschen eine Begleitung bekamen – meist eine Therapie – und vorher und nachher ihre Persönlichkeit beschrieben. Im Mittel veränderten sich Grundzüge innerhalb von etwa 24 Wochen spürbar, am deutlichsten die emotionale Stabilität, danach die Extraversion. In späteren Nachbefragungen hielten die Veränderungen meist an. Persönlichkeit ist also kein fester Stein, sie bewegt sich – besonders, wenn man bewusst daran arbeitet."
  },
  nye2012: {
    text: "Nye, C. D., Su, R., Rounds, J., & Drasgow, F. (2012). Vocational interests and performance: A quantitative summary of over 60 years of research. Perspectives on Psychological Science, 7(4), 384–403.",
    notiz: "Wer Tätigkeiten macht, die zu seinen Interessen passen, leistet im Mittel mehr und bleibt eher dabei.",
    erklaerung: "Die Auswertung fasst Studien aus über 60 Jahren zusammen und fragt, ob berufliche Interessen mit Leistung und Durchhalten zusammenhängen. Am deutlichsten wird es, wenn die Interessen zur Art der Tätigkeit passen: Dann sind Leistung in Arbeit und Ausbildung im Mittel besser, und Menschen bleiben eher dabei. Interessen sind damit mehr als Geschmack – sie zeigen, wo jemand Energie hat."
  },
  dunlosky2013: {
    text: "Dunlosky, J., Rawson, K. A., Marsh, E. J., Nathan, M. J., & Willingham, D. T. (2013). Improving students’ learning with effective learning techniques. Psychological Science in the Public Interest, 14(1), 4–58.",
    notiz: "Sich selbst abfragen und über die Zeit verteilt üben haben den größten Nutzen; Markieren und bloßes Wiederlesen bringen wenig.",
    erklaerung: "Die Autoren haben zehn verbreitete Lern-Techniken danach eingeordnet, wie gut die Forschung ihren Nutzen belegt. Am meisten bringen: sich selbst abfragen (zum Beispiel mit Karteikarten) und das Üben auf mehrere Tage verteilen, statt alles auf einmal zu machen. Mittel hilfreich sind: sich selbst erklären, warum etwas stimmt, und verschiedene Aufgabenarten mischen. Markieren, Zusammenfassen und bloßes Wiederlesen bringen wenig, obwohl sie sich gut anfühlen."
  },
  pashler2008: {
    text: "Pashler, H., McDaniel, M., Rohrer, D., & Bjork, R. (2008). Learning styles: Concepts and evidence. Psychological Science in the Public Interest, 9(3), 105–119.",
    notiz: "Für das Anpassen des Lernens an einen „Lernstil“ fehlt der Nachweis.",
    erklaerung: "Die Übersicht fragt: Lernen Menschen besser, wenn der Unterricht zu ihrem „Lernstil“ passt, etwa „visuell“ oder „auditiv“? Um das zu zeigen, bräuchte es Versuche, in denen Menschen zufällig passenden oder unpassenden Unterricht bekommen. Solche Versuche gab es kaum, und die wenigen sprachen eher dagegen. Darum nutzt diese App keine Lernstile: Welche Methode hilft, hängt mehr vom Stoff ab als von einem Typ."
  },
  pittenger2005: {
    text: "Pittenger, D. J. (2005). Cautionary comments regarding the Myers-Briggs Type Indicator. Consulting Psychology Journal: Practice and Research, 57(3), 210–221.",
    notiz: "MBTI-Typen sind wenig stabil: Bei einer Wiederholung bekommt ein großer Teil einen anderen Typ.",
    erklaerung: "Der Artikel prüft den bekannten Typen-Test MBTI mit seinen 16 Typen. Viele Menschen bekommen bei einer Wiederholung nach einigen Wochen einen anderen Typ, weil schon kleine Unterschiede über die Grenze zwischen zwei Typen schieben. Die Antworten verteilen sich außerdem nicht in zwei klare Gruppen, sondern fließend. Darum beschreibt diese App Richtungen in Worten statt fester Typen."
  },
  carlson1985: {
    text: "Carlson, S. (1985). A double-blind test of astrology. Nature, 318, 419–425.",
    notiz: "Im Doppelblind-Test trafen Astrologen nicht besser als der Zufall.",
    erklaerung: "Carlson ließ Astrologen in einem Doppelblind-Versuch Geburtshoroskope den passenden Persönlichkeits-Beschreibungen zuordnen – vorher hatten sie selbst gesagt, dass sie das können. Sie trafen nicht häufiger als der Zufall. Auch die Versuchspersonen erkannten die Deutung ihres eigenen Horoskops nicht besser als zufällig. Darum gibt es in dieser App keine Horoskope."
  },
  forer1949: {
    text: "Forer, B. R. (1949). The fallacy of personal validation: A classroom demonstration of gullibility. Journal of Abnormal and Social Psychology, 44(1), 118–123.",
    notiz: "Der Barnum-Effekt: Allgemeine Sätze wirken persönlich zutreffend, obwohl sie auf fast alle passen.",
    erklaerung: "Forer gab seinen Studierenden scheinbar persönliche Auswertungen eines Persönlichkeitstests – in Wahrheit bekamen alle denselben Text aus allgemeinen Sätzen, etwa „Du hast ein großes Bedürfnis, von anderen gemocht zu werden“. Fast alle fanden den Text sehr zutreffend. Das heißt seitdem Barnum- oder Forer-Effekt. Diese App versucht ihn zu vermeiden: Jede Aussage sagt, woher sie kommt, und du prüfst selbst, ob sie zu dir passt."
  },
  ackerman1997: {
    text: "Ackerman, P. L., & Heggestad, E. D. (1997). Intelligence, personality, and interests: Evidence for overlapping traits. Psychological Bulletin, 121(2), 219–245.",
    notiz: "Interessen, Fähigkeiten und Persönlichkeit hängen zusammen, aber nur mäßig – was dich anzieht, ist nicht dasselbe wie das, was du kannst.",
    erklaerung: "Die Übersicht trägt zusammen, wie Intelligenz, Persönlichkeit und Interessen zusammenhängen. Es gibt Überschneidungen – zum Beispiel gehen Offenheit und Interesse an Ideen, Kunst und Wissenschaft oft zusammen –, aber sie sind mäßig. Die Autoren beschreiben Bündel, in denen Fähigkeiten, Grundzüge und Interessen gemeinsam auftreten. Was dich anzieht, ist damit ein eigener Teil deines Musters und nicht dasselbe wie das, was du kannst."
  },
  ashton2007: {
    text: "Ashton, M. C., Lee, K., & Goldberg, L. R. (2007). The IPIP–HEXACO scales: An alternative, public-domain measure of the personality constructs in the HEXACO model. Personality and Individual Differences, 42(8), 1515–1526.",
    notiz: "Gemeinfreie Fragen zum HEXACO-Modell, darunter Ehrlichkeit-Bescheidenheit mit den vier Teilen Aufrichtigkeit, Fairness, Genügsamkeit und Bescheidenheit.",
    erklaerung: "Die Autoren haben aus dem frei nutzbaren IPIP Fragen zusammengestellt, die das HEXACO-Modell messen – sechs Grundzüge statt fünf. Der zusätzliche Grundzug heißt Ehrlichkeit-Bescheidenheit und hat vier Teile: Aufrichtigkeit, Fairness, Genügsamkeit und Bescheidenheit. Die freien Skalen hängen eng mit dem ursprünglichen HEXACO-Fragebogen zusammen. Die Fragen zu Ehrlichkeit und Bescheidenheit in dieser App gehen darauf zurück."
  },
  barrick1991: {
    text: "Barrick, M. R., & Mount, M. K. (1991). The Big Five personality dimensions and job performance: A meta-analysis. Personnel Psychology, 44(1), 1–26.",
    notiz: "Gewissenhaftigkeit hängt in allen untersuchten Berufsgruppen mit besserer Arbeitsleistung zusammen.",
    erklaerung: "Die Meta-Analyse fasst viele Studien zusammen, die die fünf großen Grundzüge mit der Leistung im Beruf vergleichen. Gewissenhaftigkeit hing in allen untersuchten Berufsgruppen mit besserer Leistung zusammen, wenn auch nicht stark. Extraversion half vor allem in Berufen mit viel Kontakt, etwa im Verkauf und in Führung; Offenheit und Extraversion hingen mit dem Lernerfolg in Schulungen zusammen. Das sind Durchschnitte über viele Menschen, kein Urteil über eine einzelne Person."
  },
  ferrari2019: {
    text: "Ferrari, M., Hunt, C., Harrysunker, A., Abbott, M. J., Beath, A. P., & Einstein, D. A. (2019). Self-compassion interventions and psychosocial outcomes: A meta-analysis of RCTs. Mindfulness, 10, 1455–1473.",
    notiz: "27 Studien: Übungen zu freundlichem Umgang mit sich selbst stärken das Selbstmitgefühl und senken im Mittel Stress und Grübeln.",
    erklaerung: "Die Meta-Analyse fasst 27 Studien zusammen, in denen Menschen zufällig Übungen zu Selbstmitgefühl bekamen oder nicht – also lernten, freundlich mit sich umzugehen, wenn etwas schwer ist. Die Übungen stärkten das Selbstmitgefühl und verringerten im Mittel Grübeln, Stress und Selbstkritik sowie gedrückte und ängstliche Stimmung. Die Effekte waren klein bis mittel. Selbstmitgefühl ist demnach etwas, das man üben kann."
  },
  gollwitzer2006: {
    text: "Gollwitzer, P. M., & Sheeran, P. (2006). Implementation intentions and goal achievement: A meta-analysis of effects and processes. Advances in Experimental Social Psychology, 38, 69–119.",
    notiz: "94 Tests: „Wenn X passiert, dann mache ich Y“-Pläne helfen, Ziele zu erreichen (d = .65; neuere Auswertungen finden kleinere Werte).",
    erklaerung: "Die Meta-Analyse wertet 94 Untersuchungen zu „Wenn-dann-Plänen“ aus: Man legt vorher fest, wann und wo man etwas tut („Wenn ich vom Essen aufstehe, dann gehe ich zehn Minuten raus“). Solche Pläne halfen im Mittel deutlich, Vorhaben auch umzusetzen – beim Anfangen, beim Dranbleiben und gegen Ablenkung. Neuere Auswertungen finden kleinere, aber weiter positive Effekte."
  },
  hudson2015: {
    text: "Hudson, N. W., & Fraley, R. C. (2015). Volitional personality trait change: Can people choose to change their personality traits? Journal of Personality and Social Psychology, 109(3), 490–507.",
    notiz: "16 Wochen, 135 Studierende: Wer einen Grundzug ändern wollte, veränderte sich im Mittel etwas in diese Richtung – kleine, aber messbare Schritte.",
    erklaerung: "In dieser Untersuchung mit 135 Studierenden über 16 Wochen gaben die Teilnehmenden an, welche Grundzüge sie gern ändern würden. Wer etwas mehr von einem Grundzug wollte, beschrieb sich nach einigen Wochen im Mittel auch etwas mehr so. Die Schritte waren klein, aber messbar. Persönlichkeit lässt sich also auch aus eigenem Wunsch ein Stück verschieben."
  },
  hudson2019: {
    text: "Hudson, N. W., Briley, D. A., Chopik, W. J., & Derringer, J. (2019). You have to follow through: Attaining behavioral change goals predicts volitional personality change. Journal of Personality and Social Psychology, 117(4), 839–857.",
    notiz: "15 Wochen mit wöchentlichen kleinen Herausforderungen: Nur wer sie wirklich machte, veränderte sich. Annehmen und nicht machen ging eher in die Gegenrichtung.",
    erklaerung: "Die Teilnehmenden wählten 15 Wochen lang jede Woche kleine Herausforderungen, die zu ihrem Veränderungswunsch passten, etwa jemanden Neues ansprechen. Verändert hat sich nur, wer die Herausforderungen auch wirklich machte. Wer sie annahm und dann nicht machte, veränderte sich eher in die Gegenrichtung. Die Lehre daraus: Kleine Schritte wählen, die man wirklich geht."
  },
  jacqueshamilton2019: {
    text: "Jacques-Hamilton, R., Sun, J., & Smillie, L. D. (2019). Costs and benefits of acting extraverted: A randomized controlled trial. Journal of Experimental Psychology: General, 148(9), 1538–1556.",
    notiz: "Eine Woche „extravertiert handeln“ hob im Mittel die Stimmung – ruhigere Menschen hatten weniger davon und waren eher müder und fühlten sich weniger echt.",
    erklaerung: "In einem Versuch sollten Menschen eine Woche lang bewusst „extravertiert handeln“ – gesprächig, durchsetzungsfreudig, spontan –, eine Vergleichsgruppe sollte eher ruhig handeln. Im Mittel hob das extravertierte Handeln die gute Stimmung. Wer von Natur aus ruhiger war, hatte davon aber weniger und fühlte sich eher müde und weniger echt. Beide Seiten haben ihren Wert und ihren Preis – es kommt darauf an, was zu dir passt."
  },
  judge2012: {
    text: "Judge, T. A., Livingston, B. A., & Hurst, C. (2012). Do nice guys – and gals – really finish last? The joint effects of sex and agreeableness on income. Journal of Personality and Social Psychology, 102(2), 390–407.",
    notiz: "Höhere Verträglichkeit geht mit etwas geringerem Einkommen einher, bei Männern deutlicher.",
    erklaerung: "Mehrere Studien, unter anderem mit Befragungen über viele Jahre, zeigen: Wer verträglicher ist – rücksichtsvoll, nachgiebig, auf Harmonie bedacht –, verdient im Mittel etwas weniger. Bei Männern war der Unterschied deutlicher als bei Frauen. Das sagt nichts darüber, welche Seite „besser“ ist: Verträglichkeit hilft Beziehungen und Zusammenarbeit, kann aber beim Verhandeln um Geld etwas kosten."
  },
  nettle2006: {
    text: "Nettle, D. (2006). The evolution of personality variation in humans and other animals. American Psychologist, 61(6), 622–631.",
    notiz: "Jede Ausprägung eines Grundzugs hat Vorteile und Nachteile – es gibt kein „bestes“ Maß für alle.",
    erklaerung: "Nettle erklärt aus Sicht der Evolution, warum Menschen und Tiere so verschieden sind. Seine Kernidee: Jede Ausprägung eines Grundzugs bringt Vorteile und Nachteile mit sich – wer viel Neues sucht, entdeckt mehr, geht aber auch mehr Risiken ein; wer vorsichtig ist, ist sicherer, verpasst aber manches. Welche Seite sich auszahlt, hängt von der Umgebung ab. Darum gibt es kein „bestes“ Maß, und genau deshalb beschreibt diese App beide Pole als gleichwertig."
  },
  poropat2009: {
    text: "Poropat, A. E. (2009). A meta-analysis of the five-factor model of personality and academic performance. Psychological Bulletin, 135(2), 322–338.",
    notiz: "Gewissenhaftigkeit sagt Schul- und Studienleistung etwa so gut vorher wie Intelligenz – im Mittel, mit kleinem bis mittlerem Zusammenhang.",
    erklaerung: "Die Meta-Analyse fasst Studien mit insgesamt sehr vielen Schülerinnen, Schülern und Studierenden zusammen. Gewissenhaftigkeit – planvoll, ausdauernd, sorgfältig – hing mit Schul- und Studienleistung etwa so stark zusammen wie Intelligenz, und zwar weitgehend unabhängig von ihr. Auch Offenheit und Verträglichkeit hatten kleine Zusammenhänge. Es sind Mittelwerte über Gruppen, keine Aussage über dich allein."
  },
  roenneberg2003: {
    text: "Roenneberg, T., Wirz-Justice, A., & Merrow, M. (2003). Life between clocks: Daily temporal patterns of human chronotypes. Journal of Biological Rhythms, 18(1), 80–90.",
    notiz: "Die Schlafmitte an freien Tagen zeigt, ob jemand eher Morgen- oder Abendtyp ist; Schlaf, der am Wochenende nachgeholt wird, wird herausgerechnet.",
    erklaerung: "Die Autoren haben mit einem kurzen Fragebogen (Munich ChronoType Questionnaire) die Schlafzeiten vieler Menschen erfasst. Als Maß für den inneren Rhythmus nehmen sie die Mitte des Schlafs an freien Tagen, wenn kein Wecker zwingt; Schlaf, der am Wochenende nachgeholt wird, rechnen sie heraus. Die Verteilung ist fließend: Es gibt keine zwei Typen, sondern alles zwischen sehr früh und sehr spät, und der Rhythmus verschiebt sich mit dem Alter."
  },
  schmidt2007: {
    text: "Schmidt, C., Collette, F., Cajochen, C., & Peigneux, P. (2007). A time to think: Circadian rhythms in human cognition. Cognitive Neuropsychology, 24(7), 755–789.",
    notiz: "Übersicht: Aufmerksamkeit und Gedächtnis schwanken über den Tag; man ist meist besser, wenn die Aufgabe in die eigene „wache“ Tageszeit fällt.",
    erklaerung: "Die Übersicht trägt zusammen, wie Aufmerksamkeit, Gedächtnis und Denken über den Tag schwanken. Viele Leistungen folgen der inneren Uhr und dem wachsenden Schlafdruck. Oft gelingt etwas besser, wenn die Aufgabe in die eigene wache Tageszeit fällt – bei Frühen eher morgens, bei Späten eher später am Tag. Wie groß der Unterschied ist, hängt stark von der Aufgabe ab."
  },
  steel2007: {
    text: "Steel, P. (2007). The nature of procrastination: A meta-analytic and theoretical review of quintessential self-regulatory failure. Psychological Bulletin, 133(1), 65–94.",
    notiz: "Aufschieben hängt deutlich mit geringerer Gewissenhaftigkeit zusammen (Selbstkontrolle, Ordnung, Ablenkbarkeit).",
    erklaerung: "Die große Übersicht fragt, was Aufschieben ausmacht. Am engsten hängt es zusammen mit unangenehmen Aufgaben, Belohnungen, die weit in der Zukunft liegen, Ablenkbarkeit und Impulsivität sowie weniger Ordnung und Selbststeuerung. Steel beschreibt Aufschieben so: Nahe Dinge ziehen stärker als ferne. Das ist ein Muster, mit dem man arbeiten kann – zum Beispiel mit kleinen, nahen Zielen."
  },
  steel2008: {
    text: "Steel, P., Schmidt, J., & Shultz, J. (2008). Refining the relationship between personality and subjective well-being. Psychological Bulletin, 134(1), 138–161.",
    notiz: "Emotionale Stabilität (wenig Neurotizismus) und Extraversion hängen am stärksten mit Wohlbefinden zusammen.",
    erklaerung: "Die Meta-Analyse untersucht, wie eng Persönlichkeit mit Wohlbefinden zusammenhängt – also mit Zufriedenheit und guten Gefühlen. Der Zusammenhang ist größer als früher angenommen. Am deutlichsten sind emotionale Stabilität und Extraversion, aber auch Gewissenhaftigkeit und Verträglichkeit spielen mit. Persönlichkeit ist damit ein wichtiger Teil davon, wie man sich im Leben fühlt, aber nicht der einzige."
  },
  thielmann2020: {
    text: "Thielmann, I., Spadaro, G., & Balliet, D. (2020). Personality and prosocial behavior: A theoretical framework and meta-analysis. Psychological Bulletin, 146(1), 30–90.",
    notiz: "770 Studien mit Geld-Spielen: Wer mehr Ehrlichkeit-Bescheidenheit hat, teilt fairer – vor allem dort, wo man andere ausnutzen könnte. Die Zusammenhänge sind mäßig (r höchstens etwa .26).",
    erklaerung: "Die Meta-Analyse fasst 770 Studien zusammen, in denen Menschen in Spielen mit echtem Geld entscheiden, wie viel sie teilen oder ob sie andere ausnutzen. Wer mehr Ehrlichkeit-Bescheidenheit hat, teilt im Mittel fairer – vor allem dort, wo man andere ausnutzen könnte, ohne dass es auffällt. Die Zusammenhänge sind mäßig: Die Situation zählt mindestens so viel wie der Grundzug."
  },
  wieth2011: {
    text: "Wieth, M. B., & Zacks, R. T. (2011). Time of day effects on problem solving: When the non-optimal is optimal. Thinking & Reasoning, 17(4), 387–401.",
    notiz: "428 Studierende: Aufgaben, die einen Geistesblitz brauchen, lösten sie zur „falschen“ Tageszeit besser; bei Rechen-Aufgaben gab es keinen klaren Unterschied.",
    erklaerung: "428 Studierende lösten Denkaufgaben morgens oder nachmittags; vorher wurde erfasst, ob sie eher früh oder eher spät wach sind. Aufgaben, die einen Geistesblitz brauchen, gelangen zur eigentlich ungünstigen Tageszeit besser – vermutlich, weil man dann weniger fest an einem Lösungsweg klebt und die Gedanken freier wandern. Bei Aufgaben mit klarem Rechenweg gab es keinen deutlichen Unterschied. Auch die „falsche“ Tageszeit hat also ihre Stärke."
  },
  wittmann2006: {
    text: "Wittmann, M., Dinich, J., Merrow, M., & Roenneberg, T. (2006). Social jetlag: Misalignment of biological and social time. Chronobiology International, 23(1–2), 497–509.",
    notiz: "„Sozialer Jetlag“: Späte Typen schlafen an Arbeitstagen zu wenig und holen am Wochenende nach; der Unterschied hängt mit schlechterem Schlaf und Befinden zusammen.",
    erklaerung: "Die Autoren beschreiben den „sozialen Jetlag“: den Unterschied zwischen der inneren Uhr und den Zeiten, die Schule oder Arbeit vorgeben. Späte Typen schlafen an Arbeitstagen oft zu wenig und holen am Wochenende nach – als würden sie jede Woche zwischen zwei Zeitzonen reisen. Ein größerer Unterschied hing mit schlechterem Schlaf und Befinden zusammen. Wer spät ist, ist dabei nicht „falsch“, sondern lebt gegen eine Uhr, die für Frühe gebaut ist."
  },
  wright2013: {
    text: "Wright, K. P., McHill, A. W., Birks, B. R., Griffin, B. R., Rusterholz, T., & Chinoy, E. D. (2013). Entrainment of the human circadian clock to the natural light-dark cycle. Current Biology, 23(16), 1554–1558.",
    notiz: "Kleine Studie (8 Personen): Eine Woche nur mit Tageslicht und ohne Lampen verschob die innere Uhr um etwa 2 Stunden nach vorn.",
    erklaerung: "In einer kleinen Studie mit 8 Personen zelteten die Teilnehmenden eine Woche lang nur mit Tageslicht und Lagerfeuer, ohne elektrisches Licht. Danach lag ihre innere Uhr im Mittel etwa zwei Stunden früher, näher an Sonnenaufgang und Sonnenuntergang, und frühe und späte Typen rückten näher zusammen. Licht am Tag und wenig Licht am Abend verschieben den Rhythmus also spürbar."
  }
};
