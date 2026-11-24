// M5 training – Quellen (Format: quellen.js im App-Ordner). Prüf-Status je Quelle: QUELLEN.md §3.5 und NOTES-training.md.
// Gemeinsame Quellen (dunlosky2013, pashler2008, roberts2017) und Quellen anderer Module werden nur per ID genutzt, nicht gedoppelt:
// M4 passt: gollwitzer2006, ferrari2019, hudson2015, hudson2019, jacqueshamilton2019, steel2007, nettle2006 · M2 interessen: schmidt2007,
// wright2013, wittmann2006. test/training/plan-test.mjs prüft, dass jede genutzte ID in einer Quellen-Datei steht.
export const QUELLEN = {
  // ---------- Fokus & Energie ----------
  rubinstein2001: {
    text: 'Rubinstein, J. S., Meyer, D. E., & Evans, J. E. (2001). Executive control of cognitive processes in task switching. Journal of Experimental Psychology: Human Perception and Performance, 27(4), 763–797.',
    url: 'https://doi.org/10.1037/0096-1523.27.4.763',
    notiz: 'Wer zwischen Aufgaben wechselt, verliert bei jedem Wechsel Zeit – umso mehr, je schwieriger die Aufgaben sind.'
  },
  stothart2015: {
    text: 'Stothart, C., Mitchum, A., & Yehnert, C. (2015). The attentional cost of receiving a cell phone notification. Journal of Experimental Psychology: Human Perception and Performance, 41(4), 893–897.',
    url: 'https://doi.org/10.1037/xhp0000100',
    notiz: '166 Studierende: Wer während einer Aufmerksamkeits-Aufgabe eine Mitteilung bekam, machte mehr Fehler – auch ohne aufs Handy zu schauen.'
  },
  masicampo2011: {
    text: 'Masicampo, E. J., & Baumeister, R. F. (2011). Consider it done! Plan making can eliminate the cognitive effects of unfulfilled goals. Journal of Personality and Social Psychology, 101(4), 667–683.',
    url: 'https://doi.org/10.1037/a0024192',
    notiz: 'Unerledigte Aufgaben drängen sich in die Gedanken. Ein konkreter Plan, wann man sie erledigt, nahm diese Störung in Versuchen weg.'
  },
  albulescu2022: {
    text: 'Albulescu, P., Macsinga, I., Rusu, A., Sulea, C., Bodnaru, A., & Tulbure, B. T. (2022). “Give me a break!” A systematic review and meta-analysis on the efficacy of micro-breaks for increasing well-being and performance. PLOS ONE, 17(8), e0272460.',
    url: 'https://doi.org/10.1371/journal.pone.0272460',
    notiz: '22 Stichproben: Pausen bis zu zehn Minuten machen etwas frischer (d = .36) und weniger müde (d = .35). Leistung stieg nur bei leichteren Aufgaben sicher.'
  },
  // ---------- Ziele ----------
  wang2021: {
    text: 'Wang, G., Wang, Y., & Gai, X. (2021). A meta-analysis of the effects of mental contrasting with implementation intentions on goal attainment. Frontiers in Psychology, 12, 565202.',
    url: 'https://doi.org/10.3389/fpsyg.2021.565202',
    notiz: '21 Studien, rund 15.900 Menschen: WOOP (Wunsch und Hindernis vorstellen, dann Wenn-dann-Plan) half beim Erreichen von Zielen – kleine bis mittlere Wirkung (g = .34), vermutlich etwas überschätzt.'
  },
  oettingen2012: {
    text: 'Oettingen, G. (2012). Future thought and behaviour change. European Review of Social Psychology, 23(1), 1–63.',
    url: 'https://doi.org/10.1080/10463283.2011.643698',
    notiz: 'Übersicht: Nur schön träumen kann den Antrieb senken. Wer den Wunsch mit dem Hindernis davor vergleicht („mentales Kontrastieren“), handelt eher.'
  },
  locke2002: {
    text: 'Locke, E. A., & Latham, G. P. (2002). Building a practically useful theory of goal setting and task motivation: A 35-year odyssey. American Psychologist, 57(9), 705–717.',
    url: 'https://doi.org/10.1037/0003-066X.57.9.705',
    notiz: 'Genaue, fordernde Ziele führen im Mittel zu mehr Leistung als „Gib dein Bestes“.'
  },
  harkin2016: {
    text: 'Harkin, B., Webb, T. L., Chang, B. P. I., Prestwich, A., Conner, M., Kellar, I., Benn, Y., & Sheeran, P. (2016). Does monitoring goal progress promote goal attainment? A meta-analysis of the experimental evidence. Psychological Bulletin, 142(2), 198–229.',
    url: 'https://doi.org/10.1037/bul0000025',
    notiz: '138 Studien: Wer seinen Fortschritt beobachtet, erreicht Ziele eher – stärker, wenn er ihn aufschreibt oder anderen zeigt. Die meisten Studien betrafen Gesundheit.'
  },
  carrillo2019: {
    text: 'Carrillo, A., Rubio-Aparicio, M., Molinari, G., Enrique, Á., Sánchez-Meca, J., & Baños, R. M. (2019). Effects of the Best Possible Self intervention: A systematic review and meta-analysis. PLOS ONE, 14(9), e0222386.',
    url: 'https://doi.org/10.1371/journal.pone.0222386',
    notiz: '29 Studien: Über das „beste mögliche Selbst“ zu schreiben hob im Mittel Zuversicht (d = .33) und Wohlbefinden (d = .33).'
  },
  // ---------- Gewohnheiten ----------
  lally2010: {
    text: 'Lally, P., van Jaarsveld, C. H. M., Potts, H. W. W., & Wardle, J. (2010). How are habits formed: Modelling habit formation in the real world. European Journal of Social Psychology, 40(6), 998–1009.',
    url: 'https://doi.org/10.1002/ejsp.674',
    notiz: '96 Menschen, eine neue tägliche Gewohnheit: Bis sie automatisch lief, dauerte es im Mittel 66 Tage (18 bis 254). Einmal auslassen störte kaum.'
  },
  gardner2012: {
    text: 'Gardner, B., Lally, P., & Wardle, J. (2012). Making health habitual: The psychology of ‘habit-formation’ and general practice. British Journal of General Practice, 62(605), 664–666.',
    url: 'https://doi.org/10.3399/bjgp12X659466',
    notiz: 'Gewohnheiten entstehen, wenn man ein Verhalten immer wieder in derselben Situation macht. Die Situation wird zum Auslöser.'
  },
  wood2016: {
    text: 'Wood, W., & Rünger, D. (2016). Psychology of habit. Annual Review of Psychology, 67, 289–314.',
    url: 'https://doi.org/10.1146/annurev-psych-122414-033417',
    notiz: 'Übersicht: Gewohnheiten hängen stark an Ort und Situation. Wer die Umgebung ändert, ändert oft auch das Verhalten.'
  },
  milkman2014: {
    text: 'Milkman, K. L., Minson, J. A., & Volpp, K. G. M. (2014). Holding the Hunger Games hostage at the gym: An evaluation of temptation bundling. Management Science, 60(2), 283–299.',
    url: 'https://doi.org/10.1287/mnsc.2013.1784',
    notiz: '226 Menschen: Wer spannende Hörbücher nur im Fitnessstudio hören durfte, ging öfter hin. Die Wirkung ließ nach einigen Wochen nach.'
  },
  // ---------- Lernen & Gedächtnis ----------
  roediger2006: {
    text: 'Roediger, H. L., & Karpicke, J. D. (2006). Test-enhanced learning: Taking memory tests improves long-term retention. Psychological Science, 17(3), 249–255.',
    url: 'https://doi.org/10.1111/j.1467-9280.2006.01693.x',
    notiz: 'Wer sich selbst abfragte, wusste eine Woche später deutlich mehr als jemand, der den Text noch einmal las.'
  },
  cepeda2006: {
    text: 'Cepeda, N. J., Pashler, H., Vul, E., Wixted, J. T., & Rohrer, D. (2006). Distributed practice in verbal recall tasks: A review and quantitative synthesis. Psychological Bulletin, 132(3), 354–380.',
    url: 'https://doi.org/10.1037/0033-2909.132.3.354',
    notiz: 'Über 300 Versuche: Lernen mit Pausen dazwischen hält länger als alles am Stück.'
  },
  bisra2018: {
    text: 'Bisra, K., Liu, Q., Nesbit, J. C., Salimi, F., & Winne, P. H. (2018). Inducing self-explanation: A meta-analysis. Educational Psychology Review, 30, 703–725.',
    url: 'https://doi.org/10.1007/s10648-018-9434-x',
    notiz: '64 Studien: Sich den Stoff selbst zu erklären, half beim Lernen mit mittlerer Wirkung (g = .55).'
  },
  brunmair2019: {
    text: 'Brunmair, M., & Richter, T. (2019). Similarity matters: A meta-analysis of interleaved learning and its moderators. Psychological Bulletin, 145(11), 1029–1052.',
    url: 'https://doi.org/10.1037/bul0000209',
    notiz: '59 Studien: Gemischtes Üben hilft im Mittel, besonders bei ähnlichen Kategorien (z. B. Malstile). Bei Wörtern und Texten half es eher nicht.'
  },
  rasch2013: {
    text: 'Rasch, B., & Born, J. (2013). About sleep’s role in memory. Physiological Reviews, 93(2), 681–766.',
    url: 'https://doi.org/10.1152/physrev.00032.2012',
    notiz: 'Übersicht: Im Schlaf wird Gelerntes gefestigt.'
  },
  // ---------- Kopf & Gefühle ----------
  webb2012: {
    text: 'Webb, T. L., Miles, E., & Sheeran, P. (2012). Dealing with feeling: A meta-analysis of the effectiveness of strategies derived from the process model of emotion regulation. Psychological Bulletin, 138(4), 775–808.',
    url: 'https://doi.org/10.1037/a0027600',
    notiz: '190 Studien: Eine Lage neu zu bewerten lenkt Gefühle im Mittel etwas; den Gefühlsausdruck nur zu unterdrücken, ändert am Gefühl kaum etwas.'
  },
  torre2018: {
    text: 'Torre, J. B., & Lieberman, M. D. (2018). Putting feelings into words: Affect labeling as implicit emotion regulation. Emotion Review, 10(2), 116–124.',
    url: 'https://doi.org/10.1177/1754073917742706',
    notiz: 'Übersicht: Gefühle in Worte zu fassen kann sie ähnlich dämpfen wie bewusstes Umdenken. Die Forschung dazu steht noch am Anfang.'
  },
  kross2014: {
    text: 'Kross, E., Bruehlman-Senecal, E., Park, J., Burson, A., Dougherty, A., Shablack, H., Bremner, R., Moser, J., & Ayduk, O. (2014). Self-talk as a regulatory mechanism: How you do it matters. Journal of Personality and Social Psychology, 106(2), 304–324.',
    url: 'https://doi.org/10.1037/a0035173',
    notiz: 'Studienreihe: Wer vor einer Rede in der Du-Form oder mit dem eigenen Namen zu sich sprach, war weniger aufgeregt und wirkte auf andere besser.'
  },
  cregg2021: {
    text: 'Cregg, D. R., & Cheavens, J. S. (2021). Gratitude interventions: Effective self-help? A meta-analysis of the impact on symptoms of depression and anxiety. Journal of Happiness Studies, 22, 413–445.',
    url: 'https://doi.org/10.1007/s10902-020-00236-6',
    notiz: '27 Studien: Dankbarkeits-Übungen wirkten nur schwach auf gedrückte Stimmung und Ängstlichkeit (g ≈ .29) – gegen andere sinnvolle Übungen kaum besser.'
  },
  mcgowan2013: {
    text: 'McGowan, S. K., & Behar, E. (2013). A preliminary investigation of stimulus control training for worry: Effects on anxiety and insomnia. Behavior Modification, 37(1), 90–112.',
    url: 'https://doi.org/10.1177/0145445512455661',
    notiz: 'Kleine Studie (53 Menschen, die viel grübeln): Eine feste tägliche Sorgen-Zeit an einem festen Ort half nach zwei Wochen gegen Grübeln und unruhigen Schlaf. Ein erster Befund.'
  },
  // ---------- Gesundheit-Grundlagen ----------
  phillips2017: {
    text: 'Phillips, A. J. K., Clerx, W. M., O’Brien, C. S., Sano, A., Barger, L. K., Picard, R. W., Lockley, S. W., Klerman, E. B., & Czeisler, C. A. (2017). Irregular sleep/wake patterns are associated with poorer academic performance and delayed circadian and sleep/wake timing. Scientific Reports, 7, 3216.',
    url: 'https://doi.org/10.1038/s41598-017-03171-4',
    notiz: '61 Studierende: Wer unregelmäßig schlief, hatte schlechtere Noten und eine spätere innere Uhr – ein Zusammenhang, kein Beweis für die Ursache.'
  },
  windred2024: {
    text: 'Windred, D. P., Burns, A. C., Lane, J. M., Saxena, R., Rutter, M. K., Scheer, F. A. J. L., Cain, S. W., & Phillips, A. J. K. (2024). Sleep regularity is a stronger predictor of mortality risk than sleep duration: A prospective cohort study. Sleep, 47(1), zsad253.',
    url: 'https://doi.org/10.1093/sleep/zsad253',
    notiz: 'Rund 61.000 Menschen mit Bewegungsmesser: Regelmäßiger Schlaf hing stärker mit einem geringeren Sterberisiko zusammen als die Schlafdauer. Beobachtung, kein Versuch.'
  },
  blume2019: {
    text: 'Blume, C., Garbazza, C., & Spitschan, M. (2019). Effects of light on human circadian rhythms, sleep and mood. Somnologie, 23(3), 147–156.',
    url: 'https://doi.org/10.1007/s11818-019-00215-x',
    notiz: 'Übersicht: Licht ist der wichtigste Taktgeber der inneren Uhr. Licht am Abend und in der Nacht verschiebt sie und kann den Schlaf stören.'
  },
  chang2015: {
    text: 'Chang, A.-M., Aeschbach, D., Duffy, J. F., & Czeisler, C. A. (2015). Evening use of light-emitting eReaders negatively affects sleep, circadian timing, and next-morning alertness. Proceedings of the National Academy of Sciences, 112(4), 1232–1237.',
    url: 'https://doi.org/10.1073/pnas.1418490112',
    notiz: '12 Erwachsene: Wer abends auf einem leuchtenden Tablet statt im Buch las, wurde später müde, hatte weniger Melatonin und war am Morgen weniger wach.'
  },
  gardiner2023: {
    text: 'Gardiner, C., Weakley, J., Burke, L. M., Roach, G. D., Sargent, C., Maniar, N., Townshend, A., & Halson, S. L. (2023). The effect of caffeine on subsequent sleep: A systematic review and meta-analysis. Sleep Medicine Reviews, 69, 101764.',
    url: 'https://doi.org/10.1016/j.smrv.2023.101764',
    notiz: '24 Studien: Koffein verkürzte den Schlaf im Mittel um etwa 45 Minuten. Für eine Tasse Kaffee schlagen die Forschenden rund 9 Stunden Abstand zum Schlafen vor – ein vorsichtiger Richtwert.'
  },
  bull2020: {
    text: 'Bull, F. C., Al-Ansari, S. S., Biddle, S., et al. (2020). World Health Organization 2020 guidelines on physical activity and sedentary behaviour. British Journal of Sports Medicine, 54(24), 1451–1462.',
    url: 'https://doi.org/10.1136/bjsports-2020-102955',
    notiz: 'WHO-Empfehlung: Erwachsene 150–300 Minuten mäßige Bewegung pro Woche, langes Sitzen unterbrechen. Jede Bewegung zählt.'
  },
  oppezzo2014: {
    text: 'Oppezzo, M., & Schwartz, D. L. (2014). Give your ideas some legs: The positive effect of walking on creative thinking. Journal of Experimental Psychology: Learning, Memory, and Cognition, 40(4), 1142–1152.',
    url: 'https://doi.org/10.1037/a0036577',
    notiz: '176 Menschen: Beim Gehen und kurz danach kamen deutlich mehr Einfälle als im Sitzen – nicht aber bei Aufgaben mit nur einer richtigen Lösung.'
  },
  fincham2023: {
    text: 'Fincham, G. W., Strauss, C., Montero-Marin, J., & Cavanagh, K. (2023). Effect of breathwork on stress and mental health: A meta-analysis of randomised-controlled trials. Scientific Reports, 13, 432.',
    url: 'https://doi.org/10.1038/s41598-022-27247-y',
    notiz: '12 Studien, 785 Menschen: Atemübungen senkten das Stress-Gefühl im Mittel etwas (g = −.35). Die Studien hatten Schwächen – vorsichtig deuten.'
  },
  stevenson2018: {
    text: 'Stevenson, M. P., Schilhab, T., & Bentsen, P. (2018). Attention Restoration Theory II: A systematic review to clarify attention processes affected by exposure to natural environments. Journal of Toxicology and Environmental Health, Part B, 21(4), 227–268.',
    url: 'https://doi.org/10.1080/10937404.2018.1505571',
    notiz: 'Nach Zeit in der Natur waren Arbeitsgedächtnis und gedankliche Beweglichkeit etwas besser (kleine bis mittlere Wirkung).'
  },
  // ---------- Umgang mit anderen ----------
  weger2014: {
    text: 'Weger, H., Castle Bell, G., Minei, E. M., & Robinson, M. C. (2014). The relative effectiveness of active listening in initial interactions. International Journal of Listening, 28(1), 13–31.',
    url: 'https://doi.org/10.1080/10904018.2013.813234',
    notiz: '115 Menschen: Wer zusammenfassend zuhörte und nachfragte, gab dem Gegenüber eher das Gefühl, verstanden zu werden, als mit Ratschlägen.'
  },
  huang2017: {
    text: 'Huang, K., Yeomans, M., Brooks, A. W., Minson, J., & Gino, F. (2017). It doesn’t hurt to ask: Question-asking increases liking. Journal of Personality and Social Psychology, 113(3), 430–452.',
    url: 'https://doi.org/10.1037/pspi0000097',
    notiz: 'Wer in Gesprächen mehr Fragen stellt – vor allem Folgefragen –, wird im Mittel sympathischer gefunden.'
  },
  rogers2018: {
    text: 'Rogers, S. L., Howieson, J., & Neame, C. (2018). I understand you feel that way, but I feel this way: The benefits of I-language and communicating perspective during conflict. PeerJ, 6, e4831.',
    url: 'https://doi.org/10.7717/peerj.4831',
    notiz: 'Ich-Sätze und das Anerkennen der anderen Sicht wirkten zu Beginn eines Streits weniger feindselig als Du-Sätze (Bewertung ausgedachter Szenen).'
  },
  boothby2021: {
    text: 'Boothby, E. J., & Bohns, V. K. (2021). Why a simple act of kindness is not as simple as it seems: Underestimating the positive impact of our compliments on others. Personality and Social Psychology Bulletin, 47(5), 826–840.',
    url: 'https://doi.org/10.1177/0146167220949003',
    notiz: 'Fünf Studien: Wer ein ehrliches Kompliment macht, unterschätzt, wie sehr es freut, und überschätzt, wie unangenehm es ist.'
  },
  liu2023: {
    text: 'Liu, P. J., Rim, S., Min, L., & Min, K. E. (2023). The surprise of reaching out: Appreciated more than we think. Journal of Personality and Social Psychology, 124(4), 754–771.',
    url: 'https://doi.org/10.1037/pspi0000402',
    notiz: 'Über 5.900 Menschen: Wer sich einfach so meldet, unterschätzt, wie sehr sich die andere Person freut – besonders bei loseren Kontakten.'
  },
  kumar2018: {
    text: 'Kumar, A., & Epley, N. (2018). Undervaluing gratitude: Expressers misunderstand the consequences of showing appreciation. Psychological Science, 29(9), 1423–1435.',
    url: 'https://doi.org/10.1177/0956797618772506',
    notiz: 'Wer einen Danke-Brief schreibt, unterschätzt die Freude der Empfänger und macht sich zu viele Sorgen um die richtigen Worte.'
  },
  gable2004: {
    text: 'Gable, S. L., Reis, H. T., Impett, E. A., & Asher, E. R. (2004). What do you do when things go right? The intrapersonal and interpersonal benefits of sharing positive events. Journal of Personality and Social Psychology, 87(2), 228–245.',
    url: 'https://doi.org/10.1037/0022-3514.87.2.228',
    notiz: 'Wer auf gute Nachrichten anderer echt und interessiert reagiert, hat im Mittel engere und zufriedenere Beziehungen (Zusammenhang).'
  },
  curry2018: {
    text: 'Curry, O. S., Rowland, L. A., Van Lissa, C. J., Zlotowitz, S., McAlaney, J., & Whitehouse, H. (2018). Happy to help? A systematic review and meta-analysis of the effects of performing acts of kindness on the well-being of the actor. Journal of Experimental Social Psychology, 76, 320–329.',
    url: 'https://doi.org/10.1016/j.jesp.2018.02.014',
    notiz: '27 Studien: Freundlichkeiten tun auch dem gut, der sie tut – kleine bis mittlere Wirkung (δ = .28).'
  },
  // ---------- Persönlichkeit wachsen ----------
  seligman2005: {
    text: 'Seligman, M. E. P., Steen, T. A., Park, N., & Peterson, C. (2005). Positive psychology progress: Empirical validation of interventions. American Psychologist, 60(5), 410–421.',
    url: 'https://doi.org/10.1037/0003-066X.60.5.410',
    notiz: 'Online-Versuch: Eine eigene Stärke eine Woche lang jeden Tag neu einzusetzen, hob die Stimmung über Monate. Nachprüfungen fanden teils kleinere Wirkungen.'
  }
};
