// Wie ich ticke – gemeinsame Quellen und die drei Evidenz-Stufen (ARCH.md §6). Wird erst geladen, wenn jemand eine Marke antippt.
// Quellen-Format: id → { text (volle Angabe), url (DOI-Link), notiz? (was sie zeigt, ein Satz, einfach) }.
// IDs: nachnameJahr (klein, ohne Umlaute), bei Gleichheit a/b anhängen. Modul-Quellen stehen in module/<id>/quellen.js.

export const STUFEN = {
  belegt: { name: 'belegt', kurz: 'Direkt aus der Forschung', text: 'Gute Studien zeigen das, meist mehrere und mit vielen Menschen. Es sind Durchschnitts-Befunde – bei dir kann es anders sein.' },
  abgeleitet: { name: 'abgeleitet', kurz: 'Aus der Forschung übertragen', text: 'Das folgt aus belegten Befunden, wurde aber genau so nicht eigens geprüft. Nimm es als gut begründete Vermutung.' },
  idee: { name: 'Idee', kurz: 'Zum Ausprobieren', text: 'Eine Anregung, nicht geprüft. Probier es aus und schau ehrlich, ob es dir hilft.' }
};

export const QUELLEN = {
  goldberg2006: {
    text: 'Goldberg, L. R., Johnson, J. A., Eber, H. W., Hogan, R., Ashton, M. C., Cloninger, C. R., & Gough, H. G. (2006). The International Personality Item Pool and the future of public-domain personality measures. Journal of Research in Personality, 40, 84–96.',
    url: 'https://doi.org/10.1016/j.jrp.2005.08.007',
    notiz: 'Der IPIP: frei nutzbare (gemeinfreie) Fragen für Persönlichkeits-Fragebögen.'
  },
  soto2019: {
    text: 'Soto, C. J. (2019). How replicable are links between personality traits and consequential life outcomes? The Life Outcomes of Personality Replication Project. Psychological Science, 30, 711–727.',
    url: 'https://doi.org/10.1177/0956797619831612',
    notiz: '87 % von 78 Zusammenhängen zwischen Big Five und Lebensbereichen ließen sich bestätigen, im Mittel mit 77 % der ursprünglichen Stärke.'
  },
  roberts2017: {
    text: 'Roberts, B. W., Luo, J., Briley, D. A., Chow, P. I., Su, R., & Hill, P. L. (2017). A systematic review of personality trait change through intervention. Psychological Bulletin, 143(2), 117–141.',
    url: 'https://doi.org/10.1037/bul0000088',
    notiz: 'Persönlichkeit ändert sich durch gezielte Begleitung messbar (vor allem Therapie), im Mittel etwa d = .37 über rund 24 Wochen, am deutlichsten bei emotionaler Stabilität.'
  },
  nye2012: {
    text: 'Nye, C. D., Su, R., Rounds, J., & Drasgow, F. (2012). Vocational interests and performance: A quantitative summary of over 60 years of research. Perspectives on Psychological Science, 7(4), 384–403.',
    url: 'https://doi.org/10.1177/1745691612449021',
    notiz: 'Wer Tätigkeiten macht, die zu seinen Interessen passen, leistet im Mittel mehr und bleibt eher dabei.'
  },
  dunlosky2013: {
    text: 'Dunlosky, J., Rawson, K. A., Marsh, E. J., Nathan, M. J., & Willingham, D. T. (2013). Improving students’ learning with effective learning techniques. Psychological Science in the Public Interest, 14(1), 4–58.',
    url: 'https://doi.org/10.1177/1529100612453266',
    notiz: 'Sich selbst abfragen und über die Zeit verteilt üben haben den größten Nutzen; Markieren und bloßes Wiederlesen bringen wenig.'
  },
  pashler2008: {
    text: 'Pashler, H., McDaniel, M., Rohrer, D., & Bjork, R. (2008). Learning styles: Concepts and evidence. Psychological Science in the Public Interest, 9(3), 105–119.',
    url: 'https://doi.org/10.1111/j.1539-6053.2009.01038.x',
    notiz: 'Für das Anpassen des Lernens an einen „Lernstil“ fehlt der Nachweis.'
  },
  pittenger2005: {
    text: 'Pittenger, D. J. (2005). Cautionary comments regarding the Myers-Briggs Type Indicator. Consulting Psychology Journal: Practice and Research, 57(3), 210–221.',
    url: 'https://doi.org/10.1037/1065-9293.57.3.210',
    notiz: 'MBTI-Typen sind wenig stabil: Bei einer Wiederholung bekommt ein großer Teil einen anderen Typ.'
  },
  carlson1985: {
    text: 'Carlson, S. (1985). A double-blind test of astrology. Nature, 318, 419–425.',
    url: 'https://doi.org/10.1038/318419a0',
    notiz: 'Im Doppelblind-Test trafen Astrologen nicht besser als der Zufall.'
  },
  forer1949: {
    text: 'Forer, B. R. (1949). The fallacy of personal validation: A classroom demonstration of gullibility. Journal of Abnormal and Social Psychology, 44(1), 118–123.',
    url: 'https://doi.org/10.1037/h0059240',
    notiz: 'Der Barnum-Effekt: Allgemeine Sätze wirken persönlich zutreffend, obwohl sie auf fast alle passen.'
  },
  // Gemeinsam genutzt (bei der Integration aus den Modulen hierher gebündelt; IDs unverändert)
  ackerman1997: {
    text: "Ackerman, P. L., & Heggestad, E. D. (1997). Intelligence, personality, and interests: Evidence for overlapping traits. Psychological Bulletin, 121(2), 219–245.",
    url: "https://doi.org/10.1037/0033-2909.121.2.219",
    notiz: "Interessen, Fähigkeiten und Persönlichkeit hängen zusammen, aber nur mäßig – was dich anzieht, ist nicht dasselbe wie das, was du kannst."
  },
  ashton2007: {
    text: "Ashton, M. C., Lee, K., & Goldberg, L. R. (2007). The IPIP–HEXACO scales: An alternative, public-domain measure of the personality constructs in the HEXACO model. Personality and Individual Differences, 42(8), 1515–1526.",
    url: "https://doi.org/10.1016/j.paid.2006.10.027",
    notiz: "Gemeinfreie Fragen zum HEXACO-Modell, darunter Ehrlichkeit-Bescheidenheit mit den vier Teilen Aufrichtigkeit, Fairness, Genügsamkeit und Bescheidenheit."
  },
  barrick1991: {
    text: "Barrick, M. R., & Mount, M. K. (1991). The Big Five personality dimensions and job performance: A meta-analysis. Personnel Psychology, 44(1), 1–26.",
    url: "https://doi.org/10.1111/j.1744-6570.1991.tb00688.x",
    notiz: "Gewissenhaftigkeit hängt in allen untersuchten Berufsgruppen mit besserer Arbeitsleistung zusammen."
  },
  ferrari2019: {
    text: "Ferrari, M., Hunt, C., Harrysunker, A., Abbott, M. J., Beath, A. P., & Einstein, D. A. (2019). Self-compassion interventions and psychosocial outcomes: A meta-analysis of RCTs. Mindfulness, 10, 1455–1473.",
    url: "https://doi.org/10.1007/s12671-019-01134-6",
    notiz: "27 Studien: Übungen zu freundlichem Umgang mit sich selbst stärken das Selbstmitgefühl und senken im Mittel Stress und Grübeln."
  },
  gollwitzer2006: {
    text: "Gollwitzer, P. M., & Sheeran, P. (2006). Implementation intentions and goal achievement: A meta-analysis of effects and processes. Advances in Experimental Social Psychology, 38, 69–119.",
    url: "https://doi.org/10.1016/S0065-2601(06)38002-1",
    notiz: "94 Tests: „Wenn X passiert, dann mache ich Y“-Pläne helfen, Ziele zu erreichen (d = .65; neuere Auswertungen finden kleinere Werte)."
  },
  hudson2015: {
    text: "Hudson, N. W., & Fraley, R. C. (2015). Volitional personality trait change: Can people choose to change their personality traits? Journal of Personality and Social Psychology, 109(3), 490–507.",
    url: "https://doi.org/10.1037/pspp0000021",
    notiz: "16 Wochen, 135 Studierende: Wer einen Grundzug ändern wollte, veränderte sich im Mittel etwas in diese Richtung – kleine, aber messbare Schritte."
  },
  hudson2019: {
    text: "Hudson, N. W., Briley, D. A., Chopik, W. J., & Derringer, J. (2019). You have to follow through: Attaining behavioral change goals predicts volitional personality change. Journal of Personality and Social Psychology, 117(4), 839–857.",
    url: "https://doi.org/10.1037/pspp0000221",
    notiz: "15 Wochen mit wöchentlichen kleinen Herausforderungen: Nur wer sie wirklich machte, veränderte sich. Annehmen und nicht machen ging eher in die Gegenrichtung."
  },
  jacqueshamilton2019: {
    text: "Jacques-Hamilton, R., Sun, J., & Smillie, L. D. (2019). Costs and benefits of acting extraverted: A randomized controlled trial. Journal of Experimental Psychology: General, 148(9), 1538–1556.",
    url: "https://doi.org/10.1037/xge0000516",
    notiz: "Eine Woche „extravertiert handeln“ hob im Mittel die Stimmung – ruhigere Menschen hatten weniger davon und waren eher müder und fühlten sich weniger echt."
  },
  judge2012: {
    text: "Judge, T. A., Livingston, B. A., & Hurst, C. (2012). Do nice guys – and gals – really finish last? The joint effects of sex and agreeableness on income. Journal of Personality and Social Psychology, 102(2), 390–407.",
    url: "https://doi.org/10.1037/a0026021",
    notiz: "Höhere Verträglichkeit geht mit etwas geringerem Einkommen einher, bei Männern deutlicher."
  },
  nettle2006: {
    text: "Nettle, D. (2006). The evolution of personality variation in humans and other animals. American Psychologist, 61(6), 622–631.",
    url: "https://doi.org/10.1037/0003-066X.61.6.622",
    notiz: "Jede Ausprägung eines Grundzugs hat Vorteile und Nachteile – es gibt kein „bestes“ Maß für alle."
  },
  poropat2009: {
    text: "Poropat, A. E. (2009). A meta-analysis of the five-factor model of personality and academic performance. Psychological Bulletin, 135(2), 322–338.",
    url: "https://doi.org/10.1037/a0014996",
    notiz: "Gewissenhaftigkeit sagt Schul- und Studienleistung etwa so gut vorher wie Intelligenz – im Mittel, mit kleinem bis mittlerem Zusammenhang."
  },
  roenneberg2003: {
    text: "Roenneberg, T., Wirz-Justice, A., & Merrow, M. (2003). Life between clocks: Daily temporal patterns of human chronotypes. Journal of Biological Rhythms, 18(1), 80–90.",
    url: "https://doi.org/10.1177/0748730402239679",
    notiz: "Die Schlafmitte an freien Tagen zeigt, ob jemand eher Morgen- oder Abendtyp ist; Schlaf, der am Wochenende nachgeholt wird, wird herausgerechnet."
  },
  schmidt2007: {
    text: "Schmidt, C., Collette, F., Cajochen, C., & Peigneux, P. (2007). A time to think: Circadian rhythms in human cognition. Cognitive Neuropsychology, 24(7), 755–789.",
    url: "https://doi.org/10.1080/02643290701754158",
    notiz: "Übersicht: Aufmerksamkeit und Gedächtnis schwanken über den Tag; man ist meist besser, wenn die Aufgabe in die eigene „wache“ Tageszeit fällt."
  },
  steel2007: {
    text: "Steel, P. (2007). The nature of procrastination: A meta-analytic and theoretical review of quintessential self-regulatory failure. Psychological Bulletin, 133(1), 65–94.",
    url: "https://doi.org/10.1037/0033-2909.133.1.65",
    notiz: "Aufschieben hängt deutlich mit geringerer Gewissenhaftigkeit zusammen (Selbstkontrolle, Ordnung, Ablenkbarkeit)."
  },
  steel2008: {
    text: "Steel, P., Schmidt, J., & Shultz, J. (2008). Refining the relationship between personality and subjective well-being. Psychological Bulletin, 134(1), 138–161.",
    url: "https://doi.org/10.1037/0033-2909.134.1.138",
    notiz: "Emotionale Stabilität (wenig Neurotizismus) und Extraversion hängen am stärksten mit Wohlbefinden zusammen."
  },
  thielmann2020: {
    text: "Thielmann, I., Spadaro, G., & Balliet, D. (2020). Personality and prosocial behavior: A theoretical framework and meta-analysis. Psychological Bulletin, 146(1), 30–90.",
    url: "https://doi.org/10.1037/bul0000217",
    notiz: "770 Studien mit Geld-Spielen: Wer mehr Ehrlichkeit-Bescheidenheit hat, teilt fairer – vor allem dort, wo man andere ausnutzen könnte. Die Zusammenhänge sind mäßig (r höchstens etwa .26)."
  },
  wieth2011: {
    text: "Wieth, M. B., & Zacks, R. T. (2011). Time of day effects on problem solving: When the non-optimal is optimal. Thinking & Reasoning, 17(4), 387–401.",
    url: "https://doi.org/10.1080/13546783.2011.625663",
    notiz: "428 Studierende: Aufgaben, die einen Geistesblitz brauchen, lösten sie zur „falschen“ Tageszeit besser; bei Rechen-Aufgaben gab es keinen klaren Unterschied."
  },
  wittmann2006: {
    text: "Wittmann, M., Dinich, J., Merrow, M., & Roenneberg, T. (2006). Social jetlag: Misalignment of biological and social time. Chronobiology International, 23(1–2), 497–509.",
    url: "https://doi.org/10.1080/07420520500545979",
    notiz: "„Sozialer Jetlag“: Späte Typen schlafen an Arbeitstagen zu wenig und holen am Wochenende nach; der Unterschied hängt mit schlechterem Schlaf und Befinden zusammen."
  },
  wright2013: {
    text: "Wright, K. P., McHill, A. W., Birks, B. R., Griffin, B. R., Rusterholz, T., & Chinoy, E. D. (2013). Entrainment of the human circadian clock to the natural light-dark cycle. Current Biology, 23(16), 1554–1558.",
    url: "https://doi.org/10.1016/j.cub.2013.06.039",
    notiz: "Kleine Studie (8 Personen): Eine Woche nur mit Tageslicht und ohne Lampen verschob die innere Uhr um etwa 2 Stunden nach vorn."
  }
};
