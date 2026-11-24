// Modul spiel (Entweder – oder) – Quellen. Gemeinsame Quellen anderer Module (johnson2014, huang2012, armstrong2008, onet)
// werden nur per ID genutzt, nicht gedoppelt. Stand 22.11.2026: brown2011, brown2013, buerkner2019, meade2012, frederick2005,
// thomson2016, erickson1981, cao2019 per Websuche geprüft (Titel, Zeitschrift, Jahr); die übrigen aus Fachwissen, ferrando2007 ohne DOI.
// 0.2.1: meyer1971 und speckmann2021 per Websuche geprüft (Titel, Zeitschrift, Band, Seiten, DOI).
export const QUELLEN = {
  thurstone1927: {
    text: 'Thurstone, L. L. (1927). A law of comparative judgment. Psychological Review, 34(4), 273–286.',
    url: 'https://doi.org/10.1037/h0070288',
    notiz: 'Die Grundidee: Jede Wahl zwischen zwei Dingen ist ein Vergleich zweier „Reize“, die jedes Mal ein wenig schwanken.'
  },
  brown2011: {
    text: 'Brown, A., & Maydeu-Olivares, A. (2011). Item response modeling of forced-choice questionnaires. Educational and Psychological Measurement, 71(3), 460–502.',
    url: 'https://doi.org/10.1177/0013164410375112',
    notiz: 'Das Thurstone-Modell für Zwangswahl-Fragebögen (Thurstonian IRT). Die App nutzt seine einfachste Form für Paare – mit angenommenen statt geschätzten Werten.'
  },
  brown2013: {
    text: 'Brown, A., & Maydeu-Olivares, A. (2013). How IRT can solve problems of ipsative data in forced-choice questionnaires. Psychological Methods, 18(1), 36–52.',
    url: 'https://doi.org/10.1037/a0030641',
    notiz: 'Warum bloßes Zählen von Wahlen nur eine Rangfolge ergibt und wie das Modell trotzdem Lagen auf der Skala schätzt – auch für die Big Five.'
  },
  buerkner2019: {
    text: 'Bürkner, P.-C., Schulte, N., & Holling, H. (2019). On the statistical and practical limitations of Thurstonian IRT models. Educational and Psychological Measurement, 79(5), 827–854.',
    url: 'https://doi.org/10.1177/0013164419832063',
    notiz: 'Simulationen: Mit nur gleich gepolten Paaren werden die Werte ungenau; gemischt gepolte Paare helfen. Darum ist die Hälfte der Paare hier gemischt.'
  },
  cao2019: {
    text: 'Cao, M., & Drasgow, F. (2019). Does forcing reduce faking? A meta-analytic review of forced-choice personality measures in high-stakes situations. Journal of Applied Psychology, 104(11), 1347–1368.',
    url: 'https://doi.org/10.1037/apl0000414',
    notiz: 'Zusammenfassung vieler Studien: Bei Zwangswahl schönen Menschen ihre Antworten deutlich weniger als bei einzelnen Aussagen – ganz verschwindet es nicht.'
  },
  meade2012: {
    text: 'Meade, A. W., & Craig, S. B. (2012). Identifying careless responses in survey data. Psychological Methods, 17(3), 437–455.',
    url: 'https://doi.org/10.1037/a0028085',
    notiz: 'Kontrollfragen („Ich war schon einmal auf dem Mond“) und Anweisungen („Tippe auf …“) zeigen unaufmerksames Antworten. Vorsicht: Auch Aufmerksame irren sich manchmal.'
  },
  curran2016: {
    text: 'Curran, P. G. (2016). Methods for the detection of carelessly invalid responses in survey data. Journal of Experimental Social Psychology, 66, 4–19.',
    url: 'https://doi.org/10.1016/j.jesp.2015.07.006',
    notiz: 'Überblick: Antwortzeiten, immer gleiche Antworten (lange Ketten auf derselben Seite), Wiederholungs-Paare und Kontrollfragen – am besten mehrere zusammen.'
  },
  kendall1940: {
    text: 'Kendall, M. G., & Babington Smith, B. (1940). On the method of paired comparisons. Biometrika, 31(3/4), 324–345.',
    url: 'https://doi.org/10.2307/2332613',
    notiz: 'Paarvergleiche und „Kreise“ (A vor B, B vor C, aber C vor A) als Maß dafür, wie beständig jemand vergleicht.'
  },
  frederick2005: {
    text: 'Frederick, S. (2005). Cognitive reflection and decision making. Journal of Economic Perspectives, 19(4), 25–42.',
    url: 'https://doi.org/10.1257/089533005775196732',
    notiz: 'Der „Test zum Nachdenken“ (Cognitive Reflection Test): Aufgaben mit einer schnellen, falschen Antwort, die man erst bremsen muss. Die Seerosen-Aufgabe hier ist eine Abwandlung.'
  },
  thomson2016: {
    text: 'Thomson, K. S., & Oppenheimer, D. M. (2016). Investigating an alternate form of the cognitive reflection test. Judgment and Decision Making, 11(1), 99–113.',
    url: 'https://doi.org/10.1017/S1930297500007622',
    notiz: 'Neue Aufgaben dieser Art mit weniger Rechnen (zum Beispiel das Überholen im Rennen und die Schafe), weil die alten schon sehr bekannt sind.'
  },
  erickson1981: {
    text: 'Erickson, T. D., & Mattson, M. E. (1981). From words to meaning: A semantic illusion. Journal of Verbal Learning and Verbal Behavior, 20(5), 540–551.',
    url: 'https://doi.org/10.1016/S0022-5371(81)90165-1',
    notiz: 'Die „Moses-Täuschung“: Ein falsches Wort in einer vertraut klingenden Frage fällt oft nicht auf – besonders, wenn es gut zum Thema passt. Im Original antworten die Leute frei; die Eisbär-Frage hier ist eine Abwandlung mit zwei Knöpfen.'
  },
  speckmann2021: {
    text: 'Speckmann, F., & Unkelbach, C. (2021). Moses, money, and multiple-choice: The Moses illusion in a multiple-choice format with high incentives. Memory & Cognition, 49, 843–862.',
    url: 'https://doi.org/10.3758/s13421-020-01128-z',
    notiz: 'Die Moses-Täuschung bleibt auch bestehen, wenn die richtige Antwort („kann man nicht beantworten“) zur Auswahl steht – und sogar, wenn es Geld für richtige Antworten gibt. Darum steht hier „Da stimmt was nicht“ als Knopf da.'
  },
  meyer1971: {
    text: 'Meyer, D. E., & Schvaneveldt, R. W. (1971). Facilitation in recognizing pairs of words: Evidence of a dependence between retrieval operations. Journal of Experimental Psychology, 90(2), 227–234.',
    url: 'https://doi.org/10.1037/h0031564',
    notiz: 'Bahnung („Priming“): Ein Wort wird schneller erkannt, wenn kurz vorher ein passendes Wort kam. Die Milch-Falle ist ein bekanntes Rätsel, das darauf beruht – sie selbst wurde hier nicht eigens erforscht, darum „abgeleitet“.'
  },
  ferrando2007: {
    text: 'Ferrando, P. J., & Lorenzo-Seva, U. (2007). An item response theory model for incorporating response time data in binary personality items. Applied Psychological Measurement, 31(6), 525–543.',
    notiz: 'Wer bei einer Aussage zwischen beiden Antworten steht, braucht länger („Distanz-Schwierigkeit“). Angabe aus der Fachliteratur; die Fundstelle wurde nicht noch einmal geprüft.'
  },
  rabbitt1966: {
    text: 'Rabbitt, P. M. A. (1966). Errors and error correction in choice-response tasks. Journal of Experimental Psychology, 71(2), 264–272.',
    url: 'https://doi.org/10.1037/h0022853',
    notiz: 'Nach einem Fehler werden Menschen bei der nächsten Aufgabe meist langsamer („Verlangsamung nach Fehlern“). Gemessen bei einfachen Wahl-Aufgaben – hier nur übertragen.'
  },
  brysbaert2019: {
    text: 'Brysbaert, M. (2019). How many words do we read per minute? A review and meta-analysis of reading rate. Journal of Memory and Language, 109, 104047.',
    url: 'https://doi.org/10.1016/j.jml.2019.104047',
    notiz: 'Erwachsene lesen still im Mittel etwa 240 Wörter pro Minute. Die App nennt eine Wahl erst „sehr schnell“, wenn sie unter etwa 500 Wörtern pro Minute lag.'
  }
};
