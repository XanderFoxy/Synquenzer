// M5 training – Quellen (Format: quellen.js im App-Ordner): id → { text (volle Angabe), notiz (ein Satz), erklaerung (2–5 Sätze:
// was dort steht, in einfachen Worten) }. Keine Links: alles Wissen steht hier in der App.
// Gemeinsame Quellen (dunlosky2013, pashler2008, roberts2017) und Quellen anderer Module werden nur per ID genutzt, nicht gedoppelt:
// M4 passt: gollwitzer2006, ferrari2019, hudson2015, hudson2019, jacqueshamilton2019, steel2007, nettle2006 · M2 interessen: schmidt2007,
// wright2013, wittmann2006.
export const QUELLEN = {
  // ---------- Fokus & Energie ----------
  rubinstein2001: {
    text: 'Rubinstein, J. S., Meyer, D. E., & Evans, J. E. (2001). Executive control of cognitive processes in task switching. Journal of Experimental Psychology: Human Perception and Performance, 27(4), 763–797.',
    notiz: 'Wer zwischen Aufgaben wechselt, verliert bei jedem Wechsel Zeit – umso mehr, je schwieriger die Aufgaben sind.',
    erklaerung: 'Eine Versuchsreihe zum Wechseln zwischen Aufgaben. Wer von einer Aufgabe zur anderen springt, muss den Kopf jedes Mal neu einstellen: Welche Regeln gelten jetzt? Das kostet bei jedem Wechsel etwas Zeit – und umso mehr, je schwieriger oder ungewohnter die Aufgaben sind. Daraus kommt der Rat, eine Sache nach der anderen zu machen.'
  },
  stothart2015: {
    text: 'Stothart, C., Mitchum, A., & Yehnert, C. (2015). The attentional cost of receiving a cell phone notification. Journal of Experimental Psychology: Human Perception and Performance, 41(4), 893–897.',
    notiz: '166 Studierende: Wer während einer Aufmerksamkeits-Aufgabe eine Mitteilung bekam, machte mehr Fehler – auch ohne aufs Handy zu schauen.',
    erklaerung: 'Ein Versuch mit Studierenden: Sie lösten eine Aufgabe, bei der man dauerhaft aufmerksam bleiben muss. Kam währenddessen eine Handy-Mitteilung, machten sie mehr Fehler – auch wenn sie gar nicht aufs Handy schauten. Schon das Wissen, dass etwas gekommen ist, zieht Gedanken ab.'
  },
  masicampo2011: {
    text: 'Masicampo, E. J., & Baumeister, R. F. (2011). Consider it done! Plan making can eliminate the cognitive effects of unfulfilled goals. Journal of Personality and Social Psychology, 101(4), 667–683.',
    notiz: 'Unerledigte Aufgaben drängen sich in die Gedanken. Ein konkreter Plan, wann man sie erledigt, nahm diese Störung in Versuchen weg.',
    erklaerung: 'Mehrere Versuche zu unerledigten Zielen. Offene Aufgaben drängen sich immer wieder in die Gedanken und stören bei anderen Tätigkeiten. Wer einen konkreten Plan machte, wann und wie er die Aufgabe erledigt, wurde davon nicht mehr gestört – obwohl die Aufgabe noch nicht erledigt war.'
  },
  albulescu2022: {
    text: 'Albulescu, P., Macsinga, I., Rusu, A., Sulea, C., Bodnaru, A., & Tulbure, B. T. (2022). “Give me a break!” A systematic review and meta-analysis on the efficacy of micro-breaks for increasing well-being and performance. PLOS ONE, 17(8), e0272460.',
    notiz: '22 Stichproben: Pausen bis zu zehn Minuten machen etwas frischer (d = .36) und weniger müde (d = .35). Leistung stieg nur bei leichteren Aufgaben sicher.',
    erklaerung: 'Eine Zusammenfassung vieler Studien zu Mini-Pausen von bis zu zehn Minuten. Solche Pausen machten im Mittel etwas frischer und weniger müde. Auf die Leistung wirkten sie nur bei leichteren Aufgaben sicher, bei schweren Denk-Aufgaben nicht eindeutig.'
  },
  // ---------- Ziele ----------
  wang2021: {
    text: 'Wang, G., Wang, Y., & Gai, X. (2021). A meta-analysis of the effects of mental contrasting with implementation intentions on goal attainment. Frontiers in Psychology, 12, 565202.',
    notiz: '21 Studien, rund 15.900 Menschen: WOOP (Wunsch und Hindernis vorstellen, dann Wenn-dann-Plan) half beim Erreichen von Zielen – kleine bis mittlere Wirkung (g = .34), vermutlich etwas überschätzt.',
    erklaerung: 'Eine Zusammenfassung von 21 Studien zu WOOP (Wunsch, Ergebnis, Hindernis, Plan). Wer den Wunsch mit dem inneren Hindernis zusammen dachte und dann einen Wenn-dann-Plan machte, erreichte Ziele im Mittel eher – eine kleine bis mittlere Wirkung. Die Forschenden halten die Wirkung für vermutlich etwas überschätzt.'
  },
  oettingen2012: {
    text: 'Oettingen, G. (2012). Future thought and behaviour change. European Review of Social Psychology, 23(1), 1–63.',
    notiz: 'Übersicht: Nur schön träumen kann den Antrieb senken. Wer den Wunsch mit dem Hindernis davor vergleicht („mentales Kontrastieren“), handelt eher.',
    erklaerung: 'Eine Übersicht von Gabriele Oettingen über Gedanken an die Zukunft. Wer sich die Zukunft nur schön ausmalt, entspannt sich, als wäre das Ziel schon erreicht – der Antrieb kann sogar sinken. Wer den Wunsch danach mit dem Hindernis davor vergleicht („mentales Kontrastieren“), handelt eher. Daraus ist WOOP entstanden.'
  },
  locke2002: {
    text: 'Locke, E. A., & Latham, G. P. (2002). Building a practically useful theory of goal setting and task motivation: A 35-year odyssey. American Psychologist, 57(9), 705–717.',
    notiz: 'Genaue, fordernde Ziele führen im Mittel zu mehr Leistung als „Gib dein Bestes“.',
    erklaerung: 'Eine Zusammenfassung von rund 35 Jahren Forschung zur Zielsetzung. Genaue und fordernde Ziele führen im Mittel zu mehr Leistung als vage Ziele wie „gib dein Bestes“. Das gilt vor allem, wenn man sich dem Ziel verpflichtet fühlt, Rückmeldung bekommt und die Aufgabe nicht zu verworren ist.'
  },
  harkin2016: {
    text: 'Harkin, B., Webb, T. L., Chang, B. P. I., Prestwich, A., Conner, M., Kellar, I., Benn, Y., & Sheeran, P. (2016). Does monitoring goal progress promote goal attainment? A meta-analysis of the experimental evidence. Psychological Bulletin, 142(2), 198–229.',
    notiz: '138 Studien: Wer seinen Fortschritt beobachtet, erreicht Ziele eher – stärker, wenn er ihn aufschreibt oder anderen zeigt. Die meisten Studien betrafen Gesundheit.',
    erklaerung: 'Eine Zusammenfassung von über hundert Versuchen zum Beobachten des eigenen Fortschritts. Wer verfolgt, wie weit er mit einem Ziel ist, erreicht es im Mittel eher. Die Wirkung war größer, wenn der Fortschritt aufgeschrieben oder mit anderen geteilt wurde. Die meisten Studien betrafen Gesundheitsziele wie Ernährung oder Bewegung.'
  },
  carrillo2019: {
    text: 'Carrillo, A., Rubio-Aparicio, M., Molinari, G., Enrique, Á., Sánchez-Meca, J., & Baños, R. M. (2019). Effects of the Best Possible Self intervention: A systematic review and meta-analysis. PLOS ONE, 14(9), e0222386.',
    notiz: '29 Studien: Über das „beste mögliche Selbst“ zu schreiben hob im Mittel Zuversicht (d = .33) und Wohlbefinden (d = .33).',
    erklaerung: 'Eine Zusammenfassung von 29 Studien zur Übung „bestes mögliches Selbst“: Man schreibt, wie das eigene Leben in einigen Jahren aussieht, wenn vieles gut gelaufen ist. Danach waren die Teilnehmenden im Mittel etwas zuversichtlicher und fühlten sich etwas wohler. Die Wirkungen waren klein bis mittel.'
  },
  // ---------- Gewohnheiten ----------
  lally2010: {
    text: 'Lally, P., van Jaarsveld, C. H. M., Potts, H. W. W., & Wardle, J. (2010). How are habits formed: Modelling habit formation in the real world. European Journal of Social Psychology, 40(6), 998–1009.',
    notiz: '96 Menschen, eine neue tägliche Gewohnheit: Bis sie automatisch lief, dauerte es im Mittel 66 Tage (18 bis 254). Einmal auslassen störte kaum.',
    erklaerung: 'Eine Studie mit 96 Menschen, die sich eine neue tägliche Gewohnheit vornahmen, etwa ein Glas Wasser zum Mittagessen. Bis das Verhalten automatisch lief, dauerte es im Mittel etwa zwei Monate – bei manchen nur wenige Wochen, bei anderen deutlich länger als ein halbes Jahr. Einen einzelnen Tag auszulassen, störte das Entstehen der Gewohnheit kaum.'
  },
  gardner2012: {
    text: 'Gardner, B., Lally, P., & Wardle, J. (2012). Making health habitual: The psychology of ‘habit-formation’ and general practice. British Journal of General Practice, 62(605), 664–666.',
    notiz: 'Gewohnheiten entstehen, wenn man ein Verhalten immer wieder in derselben Situation macht. Die Situation wird zum Auslöser.',
    erklaerung: 'Ein Fachartikel für Hausärzte darüber, wie Gewohnheiten entstehen. Wird ein Verhalten immer wieder in derselben Situation gemacht, wird die Situation selbst zum Auslöser – das Verhalten startet dann fast von allein. Der Artikel rät deshalb zu kleinen, festen Handlungen an festen Momenten des Tages.'
  },
  wood2016: {
    text: 'Wood, W., & Rünger, D. (2016). Psychology of habit. Annual Review of Psychology, 67, 289–314.',
    notiz: 'Übersicht: Gewohnheiten hängen stark an Ort und Situation. Wer die Umgebung ändert, ändert oft auch das Verhalten.',
    erklaerung: 'Eine Übersicht zur Psychologie der Gewohnheit. Gewohnheiten sind eng an Orte, Zeiten und Dinge gebunden und laufen oft ab, ohne dass man darüber nachdenkt. Darum ändert sich Verhalten häufig am leichtesten, wenn sich die Umgebung ändert – etwa nach einem Umzug oder wenn man Dinge anders hinstellt.'
  },
  milkman2014: {
    text: 'Milkman, K. L., Minson, J. A., & Volpp, K. G. M. (2014). Holding the Hunger Games hostage at the gym: An evaluation of temptation bundling. Management Science, 60(2), 283–299.',
    notiz: '226 Menschen: Wer spannende Hörbücher nur im Fitnessstudio hören durfte, ging öfter hin. Die Wirkung ließ nach einigen Wochen nach.',
    erklaerung: 'Ein Feldversuch in einem Fitnessstudio. Wer spannende Hörbücher nur beim Training hören durfte, ging in den ersten Wochen öfter hin als die Vergleichsgruppe. Die Forschenden nennen das „Versuchungs-Bündeln“. Die Wirkung ließ nach einigen Wochen nach, vor allem über die Feiertage.'
  },
  // ---------- Lernen & Gedächtnis ----------
  roediger2006: {
    text: 'Roediger, H. L., & Karpicke, J. D. (2006). Test-enhanced learning: Taking memory tests improves long-term retention. Psychological Science, 17(3), 249–255.',
    notiz: 'Wer sich selbst abfragte, wusste eine Woche später deutlich mehr als jemand, der den Text noch einmal las.',
    erklaerung: 'Zwei Versuche mit Studierenden, die kurze Sachtexte lernten. Wer sich nach dem Lesen selbst abfragte, wusste eine Woche später deutlich mehr als jemand, der den Text noch einmal las – obwohl sich das Wiederlesen sicherer anfühlte. Das nennt man den Test-Effekt.'
  },
  cepeda2006: {
    text: 'Cepeda, N. J., Pashler, H., Vul, E., Wixted, J. T., & Rohrer, D. (2006). Distributed practice in verbal recall tasks: A review and quantitative synthesis. Psychological Bulletin, 132(3), 354–380.',
    notiz: 'Über 300 Versuche: Lernen mit Pausen dazwischen hält länger als alles am Stück.',
    erklaerung: 'Eine große Auswertung von mehreren hundert Lernversuchen. Wer den Stoff auf mehrere Zeitpunkte mit Pausen dazwischen verteilt, behält ihn länger als jemand, der alles am Stück lernt. Je länger man etwas behalten will, desto größer dürfen die Abstände zwischen den Wiederholungen sein.'
  },
  bisra2018: {
    text: 'Bisra, K., Liu, Q., Nesbit, J. C., Salimi, F., & Winne, P. H. (2018). Inducing self-explanation: A meta-analysis. Educational Psychology Review, 30, 703–725.',
    notiz: '64 Studien: Sich den Stoff selbst zu erklären, half beim Lernen mit mittlerer Wirkung (g = .55).',
    erklaerung: 'Eine Zusammenfassung von 64 Studien zum Selbst-Erklären. Wer beim Lernen angeleitet wurde, sich den Stoff in eigenen Worten zu erklären, lernte im Mittel mehr – eine mittlere Wirkung. Das klappte in vielen Fächern und Altersgruppen.'
  },
  brunmair2019: {
    text: 'Brunmair, M., & Richter, T. (2019). Similarity matters: A meta-analysis of interleaved learning and its moderators. Psychological Bulletin, 145(11), 1029–1052.',
    notiz: '59 Studien: Gemischtes Üben hilft im Mittel, besonders bei ähnlichen Kategorien (z. B. Malstile). Bei Wörtern und Texten half es eher nicht.',
    erklaerung: 'Eine Zusammenfassung von 59 Studien zum gemischten Üben: verschiedene Aufgabenarten abwechseln statt eine Art im Block. Mischen half im Mittel, besonders wenn sich die Arten ähnlich sind und man lernen muss, sie auseinanderzuhalten, etwa Malstile. Bei Wörtern und Texten half es eher nicht.'
  },
  rasch2013: {
    text: 'Rasch, B., & Born, J. (2013). About sleep’s role in memory. Physiological Reviews, 93(2), 681–766.',
    notiz: 'Übersicht: Im Schlaf wird Gelerntes gefestigt.',
    erklaerung: 'Eine ausführliche Übersicht darüber, was Schlaf für das Gedächtnis tut. Im Schlaf wird Gelerntes vom Tag noch einmal verarbeitet und gefestigt. Vor allem der Tiefschlaf spielt dabei eine Rolle. Daraus leitet die App ab, dass eine kurze Wiederholung am Abend sinnvoll ist.'
  },
  // ---------- Kopf & Gefühle ----------
  webb2012: {
    text: 'Webb, T. L., Miles, E., & Sheeran, P. (2012). Dealing with feeling: A meta-analysis of the effectiveness of strategies derived from the process model of emotion regulation. Psychological Bulletin, 138(4), 775–808.',
    notiz: '190 Studien: Eine Lage neu zu bewerten lenkt Gefühle im Mittel etwas; den Gefühlsausdruck nur zu unterdrücken, ändert am Gefühl kaum etwas.',
    erklaerung: 'Eine Zusammenfassung von rund 190 Versuchen dazu, wie man Gefühle lenken kann. Am besten wirkte es, eine Lage neu zu bewerten, also eine andere Sichtweise zu finden. Den Gefühlsausdruck nur zu unterdrücken, änderte am Gefühl selbst kaum etwas.'
  },
  torre2018: {
    text: 'Torre, J. B., & Lieberman, M. D. (2018). Putting feelings into words: Affect labeling as implicit emotion regulation. Emotion Review, 10(2), 116–124.',
    notiz: 'Übersicht: Gefühle in Worte zu fassen kann sie ähnlich dämpfen wie bewusstes Umdenken. Die Forschung dazu steht noch am Anfang.',
    erklaerung: 'Eine Übersicht zum „Benennen von Gefühlen“. Wer ein Gefühl in Worte fasst, etwa „ich bin wütend“, erlebt es danach oft etwas schwächer – auch ohne das zu wollen. Die Forschung dazu ist noch jung, und viele Studien wurden im Labor gemacht.'
  },
  kross2014: {
    text: 'Kross, E., Bruehlman-Senecal, E., Park, J., Burson, A., Dougherty, A., Shablack, H., Bremner, R., Moser, J., & Ayduk, O. (2014). Self-talk as a regulatory mechanism: How you do it matters. Journal of Personality and Social Psychology, 106(2), 304–324.',
    notiz: 'Studienreihe: Wer vor einer Rede in der Du-Form oder mit dem eigenen Namen zu sich sprach, war weniger aufgeregt und wirkte auf andere besser.',
    erklaerung: 'Eine Reihe von Versuchen zum Selbstgespräch. Wer sich vor einer aufregenden Aufgabe, etwa einer Rede, in der Du-Form oder mit dem eigenen Vornamen ansprach statt mit „ich“, war weniger aufgeregt und wurde von anderen als besser eingeschätzt. Die Erklärung: So betrachtet man sich ein wenig von außen.'
  },
  cregg2021: {
    text: 'Cregg, D. R., & Cheavens, J. S. (2021). Gratitude interventions: Effective self-help? A meta-analysis of the impact on symptoms of depression and anxiety. Journal of Happiness Studies, 22, 413–445.',
    notiz: '27 Studien: Dankbarkeits-Übungen wirkten nur schwach auf gedrückte Stimmung und Ängstlichkeit (g ≈ .29) – gegen andere sinnvolle Übungen kaum besser.',
    erklaerung: 'Eine Zusammenfassung von 27 Studien zu Dankbarkeits-Übungen wie Dankbarkeits-Listen oder Danke-Briefen. Die Wirkung auf gedrückte Stimmung und Ängstlichkeit war im Mittel nur schwach. Im Vergleich mit anderen sinnvollen Übungen schnitten sie kaum besser ab. Als Hilfe gegen gedrückte Stimmung oder Ängstlichkeit sehen die Autorinnen sie darum nur begrenzt.'
  },
  mcgowan2013: {
    text: 'McGowan, S. K., & Behar, E. (2013). A preliminary investigation of stimulus control training for worry: Effects on anxiety and insomnia. Behavior Modification, 37(1), 90–112.',
    notiz: 'Kleine Studie (53 Menschen, die viel grübeln): Eine feste tägliche Sorgen-Zeit an einem festen Ort half nach zwei Wochen gegen Grübeln und unruhigen Schlaf. Ein erster Befund.',
    erklaerung: 'Eine kleine erste Studie mit Menschen, die sehr viel grübeln. Sie legten sich eine feste tägliche Sorgen-Zeit an einem festen Ort fest und verschoben Sorgen zu anderen Zeiten dorthin. Nach zwei Wochen grübelten sie weniger und schliefen ruhiger als die Vergleichsgruppe. Weil die Studie klein war, ist das ein vorsichtiger Befund.'
  },
  // ---------- Gesundheit-Grundlagen ----------
  phillips2017: {
    text: 'Phillips, A. J. K., Clerx, W. M., O’Brien, C. S., Sano, A., Barger, L. K., Picard, R. W., Lockley, S. W., Klerman, E. B., & Czeisler, C. A. (2017). Irregular sleep/wake patterns are associated with poorer academic performance and delayed circadian and sleep/wake timing. Scientific Reports, 7, 3216.',
    notiz: '61 Studierende: Wer unregelmäßig schlief, hatte schlechtere Noten und eine spätere innere Uhr – ein Zusammenhang, kein Beweis für die Ursache.',
    erklaerung: 'Eine Studie mit Studierenden, die einen Monat lang ihren Schlaf aufzeichneten. Wer sehr unregelmäßig schlief, hatte im Mittel schlechtere Noten und eine nach hinten verschobene innere Uhr. Das ist ein Zusammenhang – die Studie zeigt nicht, dass die Unregelmäßigkeit die Ursache ist.'
  },
  windred2024: {
    text: 'Windred, D. P., Burns, A. C., Lane, J. M., Saxena, R., Rutter, M. K., Scheer, F. A. J. L., Cain, S. W., & Phillips, A. J. K. (2024). Sleep regularity is a stronger predictor of mortality risk than sleep duration: A prospective cohort study. Sleep, 47(1), zsad253.',
    notiz: 'Rund 61.000 Menschen mit Bewegungsmesser: Regelmäßiger Schlaf hing stärker mit einem geringeren Sterberisiko zusammen als die Schlafdauer. Beobachtung, kein Versuch.',
    erklaerung: 'Eine große Langzeit-Beobachtung mit Zehntausenden Menschen, die eine Woche lang einen Bewegungsmesser trugen. Wie regelmäßig jemand schlief, hing stärker mit dem späteren Sterberisiko zusammen als die Schlafdauer. Es ist eine Beobachtung, kein Versuch – andere Ursachen können mitspielen.'
  },
  blume2019: {
    text: 'Blume, C., Garbazza, C., & Spitschan, M. (2019). Effects of light on human circadian rhythms, sleep and mood. Somnologie, 23(3), 147–156.',
    notiz: 'Übersicht: Licht ist der wichtigste Taktgeber der inneren Uhr. Licht am Abend und in der Nacht verschiebt sie und kann den Schlaf stören.',
    erklaerung: 'Eine Übersicht darüber, wie Licht die innere Uhr, den Schlaf und die Stimmung beeinflusst. Licht ist der wichtigste Taktgeber der inneren Uhr: Licht am Morgen stellt sie früher, helles Licht am Abend und in der Nacht stellt sie später und kann den Schlaf stören.'
  },
  chang2015: {
    text: 'Chang, A.-M., Aeschbach, D., Duffy, J. F., & Czeisler, C. A. (2015). Evening use of light-emitting eReaders negatively affects sleep, circadian timing, and next-morning alertness. Proceedings of the National Academy of Sciences, 112(4), 1232–1237.',
    notiz: '12 Erwachsene: Wer abends auf einem leuchtenden Tablet statt im Buch las, wurde später müde, hatte weniger Melatonin und war am Morgen weniger wach.',
    erklaerung: 'Ein kleiner, genau kontrollierter Versuch mit zwölf Erwachsenen im Schlaflabor. Wer abends vor dem Schlafen auf einem leuchtenden Lese-Tablet las statt in einem gedruckten Buch, wurde später müde, bildete weniger vom Schlafhormon Melatonin und war am nächsten Morgen weniger wach.'
  },
  gardiner2023: {
    text: 'Gardiner, C., Weakley, J., Burke, L. M., Roach, G. D., Sargent, C., Maniar, N., Townshend, A., & Halson, S. L. (2023). The effect of caffeine on subsequent sleep: A systematic review and meta-analysis. Sleep Medicine Reviews, 69, 101764.',
    notiz: '24 Studien: Koffein verkürzte den Schlaf im Mittel um etwa 45 Minuten. Für eine Tasse Kaffee schlagen die Forschenden rund 9 Stunden Abstand zum Schlafen vor – ein vorsichtiger Richtwert.',
    erklaerung: 'Eine Zusammenfassung von 24 Studien zu Koffein und Schlaf. Koffein verkürzte den Schlaf im Mittel um etwa eine Dreiviertelstunde und machte ihn leichter. Für eine Tasse Kaffee schlagen die Forschenden etwa neun Stunden Abstand zum Schlafengehen vor, für sehr starke Mengen wie in manchen Pre-Workout-Getränken etwa 13 Stunden. Menschen reagieren unterschiedlich stark.'
  },
  bull2020: {
    text: 'Bull, F. C., Al-Ansari, S. S., Biddle, S., et al. (2020). World Health Organization 2020 guidelines on physical activity and sedentary behaviour. British Journal of Sports Medicine, 54(24), 1451–1462.',
    notiz: 'WHO-Empfehlung: Erwachsene 150–300 Minuten mäßige Bewegung pro Woche, langes Sitzen unterbrechen. Jede Bewegung zählt.',
    erklaerung: 'Die Bewegungs-Empfehlungen der Weltgesundheitsorganisation von 2020. Erwachsenen werden pro Woche 150 bis 300 Minuten mäßige Bewegung empfohlen, dazu Kräftigung an zwei Tagen. Langes Sitzen soll man unterbrechen. Die Kernbotschaft: Jede Bewegung zählt, auch kleine Einheiten.'
  },
  oppezzo2014: {
    text: 'Oppezzo, M., & Schwartz, D. L. (2014). Give your ideas some legs: The positive effect of walking on creative thinking. Journal of Experimental Psychology: Learning, Memory, and Cognition, 40(4), 1142–1152.',
    notiz: '176 Menschen: Beim Gehen und kurz danach kamen deutlich mehr Einfälle als im Sitzen – nicht aber bei Aufgaben mit nur einer richtigen Lösung.',
    erklaerung: 'Vier Versuche zu Gehen und Einfällen. Beim Gehen – drinnen auf dem Laufband wie draußen – und kurz danach fielen den Teilnehmenden deutlich mehr Ideen ein als im Sitzen. Bei Aufgaben mit nur einer richtigen Lösung half das Gehen dagegen nicht.'
  },
  fincham2023: {
    text: 'Fincham, G. W., Strauss, C., Montero-Marin, J., & Cavanagh, K. (2023). Effect of breathwork on stress and mental health: A meta-analysis of randomised-controlled trials. Scientific Reports, 13, 432.',
    notiz: '12 Studien, 785 Menschen: Atemübungen senkten das Stress-Gefühl im Mittel etwas (g = −.35). Die Studien hatten Schwächen – vorsichtig deuten.',
    erklaerung: 'Eine Zusammenfassung von zwölf Versuchen zu Atemübungen. Gezieltes, ruhiges Atmen senkte das Stress-Gefühl im Mittel etwas. Viele Studien hatten Schwächen, etwa wenige Teilnehmende – darum ist der Befund vorsichtig zu deuten.'
  },
  stevenson2018: {
    text: 'Stevenson, M. P., Schilhab, T., & Bentsen, P. (2018). Attention Restoration Theory II: A systematic review to clarify attention processes affected by exposure to natural environments. Journal of Toxicology and Environmental Health, Part B, 21(4), 227–268.',
    notiz: 'Nach Zeit in der Natur waren Arbeitsgedächtnis und gedankliche Beweglichkeit etwas besser (kleine bis mittlere Wirkung).',
    erklaerung: 'Eine Übersicht über Studien dazu, wie Zeit in der Natur die Aufmerksamkeit beeinflusst. Nach Aufenthalten im Grünen schnitten Menschen bei manchen Aufgaben etwas besser ab, vor allem beim Arbeitsgedächtnis und bei der gedanklichen Beweglichkeit. Bei anderen Aufmerksamkeits-Aufgaben zeigte sich kaum etwas.'
  },
  // ---------- Umgang mit anderen ----------
  weger2014: {
    text: 'Weger, H., Castle Bell, G., Minei, E. M., & Robinson, M. C. (2014). The relative effectiveness of active listening in initial interactions. International Journal of Listening, 28(1), 13–31.',
    notiz: '115 Menschen: Wer zusammenfassend zuhörte und nachfragte, gab dem Gegenüber eher das Gefühl, verstanden zu werden, als mit Ratschlägen.',
    erklaerung: 'Ein Versuch mit Gesprächen zwischen Menschen, die sich nicht kannten. Wer aktiv zuhörte – zusammenfasste, was der andere gesagt hatte, und nachfragte –, gab dem Gegenüber eher das Gefühl, verstanden zu werden, als jemand, der schnell Ratschläge gab oder nur kurz bestätigte.'
  },
  huang2017: {
    text: 'Huang, K., Yeomans, M., Brooks, A. W., Minson, J., & Gino, F. (2017). It doesn’t hurt to ask: Question-asking increases liking. Journal of Personality and Social Psychology, 113(3), 430–452.',
    notiz: 'Wer in Gesprächen mehr Fragen stellt – vor allem Folgefragen –, wird im Mittel sympathischer gefunden.',
    erklaerung: 'Mehrere Studien zu Fragen in Gesprächen, darunter Kennenlern-Gespräche. Wer mehr Fragen stellte, wurde im Mittel sympathischer gefunden. Besonders wirkten Folgefragen, die an das Gesagte anknüpfen – sie zeigen, dass man wirklich zuhört.'
  },
  rogers2018: {
    text: 'Rogers, S. L., Howieson, J., & Neame, C. (2018). I understand you feel that way, but I feel this way: The benefits of I-language and communicating perspective during conflict. PeerJ, 6, e4831.',
    notiz: 'Ich-Sätze und das Anerkennen der anderen Sicht wirkten zu Beginn eines Streits weniger feindselig als Du-Sätze (Bewertung ausgedachter Szenen).',
    erklaerung: 'Ein Versuch, in dem Menschen kurze, ausgedachte Streit-Szenen bewerteten. Sätze mit „ich“ („ich fühle mich …“) wirkten zu Beginn eines Konflikts weniger feindselig als Sätze mit „du“ („du machst immer …“). Noch besser kam es an, wenn auch die Sicht des anderen anerkannt wurde.'
  },
  boothby2021: {
    text: 'Boothby, E. J., & Bohns, V. K. (2021). Why a simple act of kindness is not as simple as it seems: Underestimating the positive impact of our compliments on others. Personality and Social Psychology Bulletin, 47(5), 826–840.',
    notiz: 'Fünf Studien: Wer ein ehrliches Kompliment macht, unterschätzt, wie sehr es freut, und überschätzt, wie unangenehm es ist.',
    erklaerung: 'Fünf Studien zu Komplimenten. Wer einem anderen ein ehrliches Kompliment macht, unterschätzt, wie sehr es die Person freut, und überschätzt, wie unangenehm oder peinlich es für sie ist. Diese Fehleinschätzung hält Menschen davon ab, öfter Nettes zu sagen.'
  },
  liu2023: {
    text: 'Liu, P. J., Rim, S., Min, L., & Min, K. E. (2023). The surprise of reaching out: Appreciated more than we think. Journal of Personality and Social Psychology, 124(4), 754–771.',
    notiz: 'Über 5.900 Menschen: Wer sich einfach so meldet, unterschätzt, wie sehr sich die andere Person freut – besonders bei loseren Kontakten.',
    erklaerung: 'Eine Reihe von Studien mit mehreren tausend Menschen zum Melden ohne Anlass, etwa eine kurze Nachricht an einen alten Bekannten. Die Schreibenden unterschätzten, wie sehr sich die andere Person darüber freut – besonders, wenn die Nachricht überraschend kam und der Kontakt eher locker war.'
  },
  kumar2018: {
    text: 'Kumar, A., & Epley, N. (2018). Undervaluing gratitude: Expressers misunderstand the consequences of showing appreciation. Psychological Science, 29(9), 1423–1435.',
    notiz: 'Wer einen Danke-Brief schreibt, unterschätzt die Freude der Empfänger und macht sich zu viele Sorgen um die richtigen Worte.',
    erklaerung: 'Mehrere Versuche, in denen Menschen Danke-Briefe schrieben. Die Schreibenden unterschätzten, wie sehr sich die Empfänger freuten, und überschätzten, wie unbeholfen ihre Worte wirkten. Die Empfänger achteten vor allem auf die Wärme, kaum auf die Formulierung.'
  },
  gable2004: {
    text: 'Gable, S. L., Reis, H. T., Impett, E. A., & Asher, E. R. (2004). What do you do when things go right? The intrapersonal and interpersonal benefits of sharing positive events. Journal of Personality and Social Psychology, 87(2), 228–245.',
    notiz: 'Wer auf gute Nachrichten anderer echt und interessiert reagiert, hat im Mittel engere und zufriedenere Beziehungen (Zusammenhang).',
    erklaerung: 'Mehrere Studien dazu, wie Menschen reagieren, wenn jemand Gutes erzählt. Wer echt, interessiert und begeistert reagiert, hat im Mittel engere und zufriedenere Beziehungen. Auch wer seine guten Nachrichten teilt, fühlt sich danach meist besser. Es sind vor allem Zusammenhänge.'
  },
  curry2018: {
    text: 'Curry, O. S., Rowland, L. A., Van Lissa, C. J., Zlotowitz, S., McAlaney, J., & Whitehouse, H. (2018). Happy to help? A systematic review and meta-analysis of the effects of performing acts of kindness on the well-being of the actor. Journal of Experimental Social Psychology, 76, 320–329.',
    notiz: '27 Studien: Freundlichkeiten tun auch dem gut, der sie tut – kleine bis mittlere Wirkung (δ = .28).',
    erklaerung: 'Eine Zusammenfassung von 27 Versuchen zu Freundlichkeiten. Wer anderen Gutes tut, fühlt sich im Mittel selbst etwas wohler – eine kleine bis mittlere Wirkung. Die Forschenden mahnen zur Vorsicht, weil die Qualität vieler Studien begrenzt war.'
  },
  // ---------- Persönlichkeit wachsen ----------
  seligman2005: {
    text: 'Seligman, M. E. P., Steen, T. A., Park, N., & Peterson, C. (2005). Positive psychology progress: Empirical validation of interventions. American Psychologist, 60(5), 410–421.',
    notiz: 'Online-Versuch: Eine eigene Stärke eine Woche lang jeden Tag neu einzusetzen, hob die Stimmung über Monate. Nachprüfungen fanden teils kleinere Wirkungen.',
    erklaerung: 'Ein Online-Versuch mit mehreren kurzen Übungen aus der positiven Psychologie. Wer eine Woche lang jeden Tag eine eigene Stärke auf neue Art einsetzte, war noch Monate später etwas zufriedener. Spätere Nachprüfungen fanden teils kleinere Wirkungen.'
  }
};
