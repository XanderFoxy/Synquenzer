// Modul spiel (Entweder – oder) – Quellen. Gemeinsame Quellen anderer Module (johnson2014, armstrong2008, onet) werden nur per ID
// genutzt, nicht gedoppelt. 0.3: keine Links mehr (nichts nach draußen); je Quelle eine Erklärung in der App (erklaerung), was dort
// steht und wofür die App es nutzt. Quellen zu den entfernten Kontroll- und Kopfnuss-Fragen (meade2012, curran2016, frederick2005,
// thomson2016, erickson1981, speckmann2021, meyer1971, rabbitt1966, brysbaert2019) sind mit diesen Fragen entfallen.
// Stand 22.11.2026: brown2011, brown2013, buerkner2019, cao2019 per Websuche geprüft (Titel, Zeitschrift, Jahr); die übrigen aus
// Fachwissen, ferrando2007 ohne erneute Prüfung der Fundstelle.
export const QUELLEN = {
  thurstone1927: {
    text: 'Thurstone, L. L. (1927). A law of comparative judgment. Psychological Review, 34(4), 273–286.',
    notiz: 'Die Grundidee: Jede Wahl zwischen zwei Dingen ist ein Vergleich zweier „Reize“, die jedes Mal ein wenig schwanken.',
    erklaerung: 'Der Psychologe Louis Thurstone beschreibt hier ein „Gesetz des vergleichenden Urteils“: Wenn ein Mensch zwischen zwei Dingen wählt, vergleicht er innerlich, wie stark ihn jedes anspricht. Dieser Eindruck schwankt von Mal zu Mal ein wenig, darum fällt dieselbe Wahl nicht immer gleich aus. Aus vielen solchen Vergleichen lässt sich eine Reihenfolge oder Richtung ablesen. „Entweder – oder“ beruht auf genau diesem Gedanken.'
  },
  brown2011: {
    text: 'Brown, A., & Maydeu-Olivares, A. (2011). Item response modeling of forced-choice questionnaires. Educational and Psychological Measurement, 71(3), 460–502.',
    notiz: 'Das Thurstone-Modell für Zwangswahl-Fragebögen (Thurstonian IRT). Die App nutzt seine einfachste Form für Paare – mit angenommenen statt geschätzten Werten.',
    erklaerung: 'Die Autorinnen zeigen, wie man Fragebögen mit „Zwangswahl“ – man muss sich zwischen Aussagen entscheiden – mit dem Thurstone-Gedanken auswerten kann. So ergibt sich nicht nur eine Reihenfolge der Bereiche, sondern auch eine Richtung je Bereich. Die App nutzt die einfachste Form dieses Modells für Paare. Die Werte der einzelnen Aussagen sind dabei angenommen, nicht an vielen Menschen geschätzt – darum zeigt die App nur Richtungen in Worten.'
  },
  brown2013: {
    text: 'Brown, A., & Maydeu-Olivares, A. (2013). How IRT can solve problems of ipsative data in forced-choice questionnaires. Psychological Methods, 18(1), 36–52.',
    notiz: 'Warum bloßes Zählen von Wahlen nur eine Rangfolge ergibt und wie das Modell trotzdem Richtungen schätzt.',
    erklaerung: 'Hier geht es um ein bekanntes Problem: Zählt man nur, wie oft jemand Aussagen eines Bereichs gewählt hat, kommt immer eine Rangfolge heraus – auch dann, wenn alle Bereiche gleich stark sind. Fachleute nennen solche Daten „ipsativ“. Der Artikel zeigt, dass ein Thurstone-Modell dieses Problem weitgehend löst, besonders wenn Aussagen für und gegen einen Bereich gemischt werden. Darum stehen in den Paaren hier oft eine Aussage für und eine gegen ihren Bereich.'
  },
  buerkner2019: {
    text: 'Bürkner, P.-C., Schulte, N., & Holling, H. (2019). On the statistical and practical limitations of Thurstonian IRT models. Educational and Psychological Measurement, 79(5), 827–854.',
    notiz: 'Simulationen: Mit nur gleich gepolten Paaren werden die Werte ungenau; gemischt gepolte Paare helfen.',
    erklaerung: 'Mit vielen durchgerechneten Beispielen zeigen die Autoren, wo das Thurstone-Modell an Grenzen stößt: Stehen nur Aussagen gegeneinander, die alle für ihren Bereich sprechen, wird das Ergebnis ungenau. Gemischte Paare – eine Aussage dafür, eine dagegen – helfen deutlich. Die App hat deshalb die Hälfte der 30 Paare gemischt gebaut und spricht trotzdem nur vorsichtig von Richtungen.'
  },
  cao2019: {
    text: 'Cao, M., & Drasgow, F. (2019). Does forcing reduce faking? A meta-analytic review of forced-choice personality measures in high-stakes situations. Journal of Applied Psychology, 104(11), 1347–1368.',
    notiz: 'Zusammenfassung vieler Studien: Bei Zwangswahl schönen Menschen ihre Antworten weniger als bei einzelnen Aussagen.',
    erklaerung: 'Diese Übersicht fasst viele Studien zusammen, in denen Menschen bei Fragebögen einen guten Eindruck machen wollten, etwa bei Bewerbungen. Ergebnis: Wenn man sich zwischen zwei Aussagen entscheiden muss, die beide gut klingen können, fällt das Schönfärben schwerer als bei einzelnen Aussagen – ganz verschwindet es nicht. Darum fragt „Entweder – oder“ nicht „Stimmt das?“, sondern „Was passt eher?“.'
  },
  kendall1940: {
    text: 'Kendall, M. G., & Babington Smith, B. (1940). On the method of paired comparisons. Biometrika, 31(3/4), 324–345.',
    notiz: 'Paarvergleiche und „Kreise“ (A vor B, B vor C, aber C vor A).',
    erklaerung: 'Die Statistiker beschreiben, wie man Paarvergleiche auswertet, bei denen jede Möglichkeit gegen jede antritt. Dabei können „Kreise“ entstehen: A vor B, B vor C, aber C vor A. Ein Kreis ist kein Fehler, sondern ein Hinweis, dass die Dinge einem ähnlich wichtig sind. Bei den Dreier-Vergleichen der App heißt ein Kreis darum nur: Diese drei Aussagen sprechen dich ähnlich an.'
  },
  ferrando2007: {
    text: 'Ferrando, P. J., & Lorenzo-Seva, U. (2007). An item response theory model for incorporating response time data in binary personality items. Applied Psychological Measurement, 31(6), 525–543.',
    notiz: 'Wer zwischen beiden Antworten steht, braucht länger. Die Fundstelle wurde nicht noch einmal geprüft.',
    erklaerung: 'Die Autoren verbinden die Antworten in Persönlichkeitsfragebögen mit der Zeit, die man dafür braucht. Ihr Gedanke: Wer bei einer Aussage zwischen beiden Antworten steht, braucht länger; wer eindeutig ist, antwortet schnell. Die App nutzt das nur als Spiegel: Sie zeigt in Worten, wo du länger überlegt hast – oft passt dort beides ein bisschen. Die Fundstelle stammt aus der Fachliteratur und wurde nicht noch einmal geprüft.'
  }
};
