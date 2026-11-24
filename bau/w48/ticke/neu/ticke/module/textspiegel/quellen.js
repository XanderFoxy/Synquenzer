// M3 textspiegel – Quellen (Format: quellen.js im App-Ordner). Gemeinsame Quellen (forer1949 …) nicht doppeln.
// Seit 0.3 (Xander, 24.11.2026): KEINE Links nach draußen. Jede Quelle als reiner Text (text), dazu notiz (ein Satz) und
// erklaerung (2–5 Sätze in der App: was dort steht und was es für den Spiegel bedeutet). peters2024/peters2024b entfallen mit
// „Mit Claude tiefer lesen“. Angaben aus persoenlichkeit/SPRACHANALYSE.md §8; covington2010 und dodds2015 am 16.11.2026 geprüft.
export const QUELLEN = {
  koutsoumpis2022: {
    text: 'Koutsoumpis, A., Oostrom, J. K., Holtrop, D., van Breda, W., Ghassemi, S., & de Vries, R. E. (2022). The kernel of truth in text-based personality assessment: A meta-analysis of the relations between the Big Five and the Linguistic Inquiry and Word Count (LIWC). Psychological Bulletin, 148(11–12), 843–868.',
    notiz: 'Wortgruppen hängen mit den fünf großen Persönlichkeitszügen nur sehr schwach zusammen – etwas stärker mit dem Urteil anderer als mit der Selbsteinschätzung.',
    erklaerung: 'Eine Meta-Analyse, also eine gemeinsame Auswertung vieler einzelner Studien. Sie prüfte, wie eng die Wortgruppen des Zählprogramms LIWC mit den fünf großen Persönlichkeitszügen zusammenhängen. Ergebnis: Es gibt einen „wahren Kern“, aber die Zusammenhänge sind sehr schwach. Mit dem Urteil anderer Menschen über jemanden hängen die Wörter etwas stärker zusammen als mit der eigenen Einschätzung. Darum beschreibt der Spiegel deine Texte und urteilt nicht über dich.'
  },
  carey2015: {
    text: 'Carey, A. L., Brucks, M. S., Küfner, A. C. P., Holtzman, N. S., große Deters, F., Back, M. D., Donnellan, M. B., Pennebaker, J. W., & Mehl, M. R. (2015). Narcissism and the use of personal pronouns revisited. Journal of Personality and Social Psychology, 109(3), e1–e15.',
    notiz: 'Viele Ich-Wörter bedeuten nicht, dass jemand selbstverliebt ist (Zusammenhang nahe null).',
    erklaerung: 'Die Forscher prüften mit Tausenden Menschen aus mehreren Ländern, ob Leute, die oft „ich“, „mir“ und „mein“ sagen, selbstverliebter sind. Das war praktisch nicht der Fall – der Zusammenhang lag nahe null. Ich-Wörter sagen also nichts darüber, ob jemand eitel ist. Bei Aufgaben, die nach dir fragen, sind viele Ich-Wörter ohnehin naheliegend.'
  },
  chen2020: {
    text: 'Chen, J., Qiu, L., & Ho, M.-H. R. (2020). A meta-analysis of linguistic markers of extraversion: Positive emotion and social process words. Journal of Research in Personality, 89, 104035.',
    notiz: 'Wörter für Freude und für andere Menschen hängen nur sehr schwach mit Geselligkeit zusammen.',
    erklaerung: 'Eine Meta-Analyse über 37 Studien. Sie fragte, ob gesellige Menschen mehr Wörter für Freude und für andere Menschen benutzen. Die Antwort: ja, aber nur ganz wenig – zu wenig, um aus den Wörtern eines einzelnen Menschen auf seine Geselligkeit zu schließen.'
  },
  tackman2019: {
    text: 'Tackman, A. M., et al. (2019). Depression, negative emotionality, and self-referential language: A multi-lab, multi-measure, and multi-language-task research synthesis. Journal of Personality and Social Psychology, 116(5), 817–834.',
    notiz: 'Ich-Wörter hängen sehr schwach damit zusammen, wie stark jemand Stress und Sorgen spürt – zu schwach für eine Aussage über einen einzelnen Menschen.',
    erklaerung: 'Ein Zusammenschluss vieler Forschungsgruppen, mit Texten und Gesprächen in mehreren Sprachen. Untersucht wurde, ob Menschen, die Stress, Sorgen und schwere Gefühle stärker spüren, mehr Ich-Wörter benutzen. Es gab einen kleinen Zusammenhang im Durchschnitt vieler Menschen. Für einen einzelnen Menschen lässt sich daraus nichts ablesen.'
  },
  dodds2015: {
    text: 'Dodds, P. S., Clark, E. M., Desu, S., Frank, M. R., Reagan, A. J., Williams, J. R., et al. (2015). Human language reveals a universal positivity bias. Proceedings of the National Academy of Sciences, 112(8), 2389–2394.',
    notiz: 'In 24 Textsammlungen aus 10 Sprachen benutzen Menschen insgesamt mehr freundliche als belastende Wörter.',
    erklaerung: 'Die Forscher werteten riesige Textsammlungen in zehn Sprachen aus – Bücher, Nachrichten, Filmuntertitel und Texte aus dem Internet. In allen Sprachen benutzen Menschen insgesamt mehr freundliche als belastende Wörter. Darum sagt es wenig, wenn ein Text mehr Freude- als Belastungs-Wörter hat: Das ist fast immer so.'
  },
  newman2008: {
    text: 'Newman, M. L., Groom, C. J., Handelman, L. D., & Pennebaker, J. W. (2008). Gender differences in language use: An analysis of 14,000 text samples. Discourse Processes, 45(3), 211–236.',
    notiz: 'Wortgebrauch unterscheidet sich im Mittel nach Geschlecht – eine Wortzählung misst darum leicht etwas anderes als Persönlichkeit.',
    erklaerung: 'Eine Auswertung von rund 14.000 Texten. Sie zeigt, dass sich der Wortgebrauch im Durchschnitt zwischen Frauen und Männern ein wenig unterscheidet. Für den Spiegel heißt das: Wörter hängen von vielem ab – Alter, Geschlecht, Thema, Stimmung –, nicht nur von der Persönlichkeit.'
  },
  azucar2018: {
    text: 'Azucar, D., Marengo, D., & Settanni, M. (2018). Predicting the Big 5 personality traits from digital footprints on social media: A meta-analysis. Personality and Individual Differences, 124, 150–159.',
    notiz: 'Computer-Modelle mit sehr vielen digitalen Spuren je Person erreichen nur mäßige Zusammenhänge.',
    erklaerung: 'Eine Meta-Analyse darüber, wie gut Computer-Modelle die fünf großen Persönlichkeitszüge aus Spuren in sozialen Netzwerken schätzen – aus Likes, Texten und Bildern. Selbst mit sehr vielen Daten je Person sind die Zusammenhänge nur mäßig. Für ein paar kurze Texte wie hier reicht das erst recht nicht für ein Urteil.'
  },
  moreno2021: {
    text: 'Moreno, J. D., Martínez-Huertas, J. Á., Olmos, R., Jorge-Botana, G., & Botella, J. (2021). Can personality traits be measured analyzing written language? A meta-analytic study on computational methods. Personality and Individual Differences, 177, 110818.',
    notiz: 'Computer-Methoden für geschriebene Sprache: Zusammenhänge „klein bis mittel“; für Einzelne braucht es noch Forschung.',
    erklaerung: 'Eine Meta-Analyse über Computer-Verfahren, die Persönlichkeit aus geschriebener Sprache schätzen. Die Zusammenhänge liegen im Bereich „klein bis mittel“. Die Autoren schreiben selbst, dass es für Aussagen über einzelne Menschen noch mehr Forschung braucht.'
  },
  covington2010: {
    text: 'Covington, M. A., & McFall, J. D. (2010). Cutting the Gordian knot: The moving-average type–token ratio (MATTR). Journal of Quantitative Linguistics, 17(2), 94–100.',
    notiz: 'Wortvielfalt über ein wanderndes Fenster gemessen – so hängt sie kaum noch von der Textlänge ab.',
    erklaerung: 'Ein Vorschlag aus der Sprachwissenschaft, Wortvielfalt fair zu messen. Statt alle Wörter eines Textes auf einmal zu nehmen, schaut man auf ein Fenster von zum Beispiel 50 Wörtern, das durch den Text wandert, und bildet den Durchschnitt. So lassen sich lange und kurze Texte vergleichen. Die App nutzt genau dieses Verfahren.'
  },
  almosaiwi2018: {
    text: 'Al-Mosaiwi, M., & Johnstone, T. (2018). In an absolute state: Elevated use of absolutist words is a marker specific to anxiety, depression, and suicidal ideation. Clinical Psychological Science, 6(4), 529–542.',
    notiz: 'Ein Befund über Online-Foren, nicht über einzelne Menschen. Darum zeigt die App zu „immer/nie“-Wörtern keine Warnung.',
    erklaerung: 'Eine Studie über Beiträge in vielen Online-Foren. In Foren, in denen es um seelische Belastungen ging, standen Wörter wie „immer“, „nie“ und „alles“ häufiger als in anderen Foren. Das ist ein Befund über sehr viele Texte, nicht über einzelne Menschen – im Alltag sagt fast jeder „immer“, wenn er „oft“ meint. Darum zeigt die App zu solchen Wörtern keine Warnung.'
  },
  tausczik2010: {
    text: 'Tausczik, Y. R., & Pennebaker, J. W. (2010). The psychological meaning of words: LIWC and computerized text analysis methods. Journal of Language and Social Psychology, 29(1), 24–54.',
    notiz: 'Kleine Wörter wie ich, wir, nicht oder weil zu zählen ist eine bekannte Methode – mit kleinen Effekten.',
    erklaerung: 'Ein Überblick über die Methode, Wörter in Gruppen zu zählen. Er zeigt, dass gerade kleine Wörter – ich, wir, nicht, weil – etwas über Aufmerksamkeit, Denken und Beziehungen verraten können. Die Effekte sind klein und gelten im Durchschnitt vieler Menschen, nicht sicher für einen Einzelnen.'
  },
  pennebaker2011: {
    text: 'Pennebaker, J. W. (2011). The secret life of pronouns: What our words say about us. New York: Bloomsbury Press.',
    notiz: 'Sachbuch über kleine Wörter wie „ich“, „wir“ und „nicht“ und was sie zeigen können.',
    erklaerung: 'Ein Sachbuch des Sprachforschers James Pennebaker. Er beschreibt, was unscheinbare Wörter wie „ich“, „wir“, „du“ oder „nicht“ über die Aufmerksamkeit eines Menschen zeigen können – etwa ob jemand gerade eher bei sich oder eher bei anderen ist. Er betont auch, dass man aus wenigen Wörtern nicht viel ablesen sollte.'
  },
  pennebaker1999: {
    text: 'Pennebaker, J. W., & King, L. A. (1999). Linguistic styles: Language use as an individual difference. Journal of Personality and Social Psychology, 77(6), 1296–1312.',
    notiz: 'Der Schreibstil eines Menschen bleibt über verschiedene Texte hinweg recht stabil.',
    erklaerung: 'Die Forscher verglichen viele Texte derselben Menschen, geschrieben zu verschiedenen Zeiten und Themen. Der Schreibstil – etwa welche kleinen Wörter jemand benutzt und wie er Sätze baut – blieb recht stabil. Schreibstil ist also eine persönliche Eigenart, so wie eine Handschrift.'
  },
  pennebaker1997: {
    text: 'Pennebaker, J. W., Mayne, T. J., & Francis, M. E. (1997). Linguistic predictors of adaptive bereavement. Journal of Personality and Social Psychology, 72(4), 863–871.',
    notiz: 'Wörter wie „weil“, „verstehen“ und „merken“ nahmen bei manchen Menschen beim wiederholten Erzählen zu.',
    erklaerung: 'Die Forscher werteten aus, wie Menschen über einen Verlust sprachen und schrieben – zu mehreren Zeitpunkten. Manche benutzten von Mal zu Mal mehr Wörter wie „weil“, „verstehen“ und „merken“. Die Forscher deuten das so, dass beim Erzählen Zusammenhänge entstehen. Es ist ein Durchschnittsbefund, kein Maßstab für den Einzelnen.'
  },
  pennebaker1986: {
    text: 'Pennebaker, J. W., & Beall, S. K. (1986). Confronting a traumatic event: Toward an understanding of inhibition and disease. Journal of Abnormal Psychology, 95(3), 274–281.',
    notiz: 'Die erste bekannte Studie zum Schreiben über bewegende Erlebnisse.',
    erklaerung: 'Studierende schrieben an vier Tagen hintereinander jeweils etwa eine Viertelstunde – entweder über ein belastendes Erlebnis oder über Alltägliches. Wer über seine Gedanken und Gefühle zum Erlebnis schrieb, fand das zunächst oft aufwühlend, ging in den Monaten danach aber seltener zum Arzt. Seitdem wurde das in vielen Studien geprüft – mit im Mittel kleinen Effekten.'
  },
  frattaroli2006: {
    text: 'Frattaroli, J. (2006). Experimental disclosure and its moderators: A meta-analysis. Psychological Bulletin, 132(6), 823–865.',
    notiz: 'Über bewegende Erlebnisse zu schreiben oder zu sprechen, zeigte im Mittel kleine Effekte.',
    erklaerung: 'Eine Meta-Analyse über viele Studien, in denen Menschen über bewegende Erlebnisse schrieben oder sprachen. Im Mittel fand sie kleine positive Effekte, mit großen Unterschieden zwischen den Studien. Schreiben ist also eine Möglichkeit unter vielen, kein Allheilmittel.'
  },
  lieberman2007: {
    text: 'Lieberman, M. D., Eisenberger, N. I., Crockett, M. J., Tom, S. M., Pfeifer, J. H., & Way, B. M. (2007). Putting feelings into words: Affect labeling disrupts amygdala activity in response to affective stimuli. Psychological Science, 18(5), 421–428.',
    notiz: 'Ein Gefühl in ein Wort zu fassen, schwächte die Gefühlsreaktion im Gehirn etwas ab.',
    erklaerung: 'Menschen sahen Bilder von Gesichtern mit starken Gefühlen. Wenn sie das Gefühl mit einem Wort benannten, war die Reaktion in einem Gefühlszentrum des Gehirns (der Amygdala) schwächer, als wenn sie nur hinschauten. Die Forscher nennen das „Affect Labeling“: Gefühle in Worte zu fassen, schafft offenbar etwas Abstand.'
  },
  kashdan2015: {
    text: 'Kashdan, T. B., Barrett, L. F., & McKnight, P. E. (2015). Unpacking emotion differentiation: Transforming unpleasant experience by perceiving distinctions in negativity. Current Directions in Psychological Science, 24(1), 10–16.',
    notiz: 'Wer Gefühle fein unterscheidet, kann im Mittel besser mit ihnen umgehen.',
    erklaerung: 'Ein Überblicksartikel zur Frage, wie fein Menschen ihre Gefühle unterscheiden – etwa „enttäuscht“ oder „gereizt“ statt nur „schlecht“. Wer unangenehme Gefühle feiner unterscheidet, kann im Durchschnitt besser mit ihnen umgehen. Die Autoren beschreiben das als Fähigkeit, die sich üben lässt, zum Beispiel durch genaues Benennen.'
  },
  zimbardo1999: {
    text: 'Zimbardo, P. G., & Boyd, J. N. (1999). Putting time in perspective: A valid, reliable individual-differences metric. Journal of Personality and Social Psychology, 77(6), 1271–1288.',
    notiz: 'Menschen unterscheiden sich darin, wie stark sie gedanklich in Vergangenheit, Gegenwart und Zukunft leben.',
    erklaerung: 'Die Forscher entwickelten einen Fragebogen dazu, wie Menschen über Zeit denken: wie oft und wie gern sie an Vergangenes denken, wie sehr sie im Jetzt leben und wie sehr sie für die Zukunft planen. Menschen unterscheiden sich darin deutlich. Jede Zeitperspektive hat Stärken und Kehrseiten – viele Fachleute halten eine Mischung für hilfreich.'
  },
  gollwitzer1999: {
    text: 'Gollwitzer, P. M. (1999). Implementation intentions: Strong effects of simple plans. American Psychologist, 54(7), 493–503.',
    notiz: 'Wenn-dann-Pläne helfen, Vorhaben wirklich anzufangen.',
    erklaerung: 'Ein Überblick über Wenn-dann-Pläne. Wer sich vornimmt „Wenn Situation X kommt, dann mache ich Y“, setzt Vorhaben im Durchschnitt öfter um als mit einem bloßen Ziel. Der Plan nimmt die Entscheidung im Moment ab, weil die Situation selbst zum Startzeichen wird.'
  },
  schwartz2002: {
    text: 'Schwartz, B., Ward, A., Monterosso, J., Lyubomirsky, S., White, K., & Lehman, D. R. (2002). Maximizing versus satisficing: Happiness is a matter of choice. Journal of Personality and Social Psychology, 83(5), 1178–1197.',
    notiz: 'Manche suchen bei Entscheidungen das Beste, andere nehmen, was gut genug ist.',
    erklaerung: 'Die Forscher unterscheiden Menschen, die bei Entscheidungen das Beste suchen, von Menschen, die nehmen, was gut genug ist. Wer das Beste sucht, vergleicht mehr Möglichkeiten und denkt danach öfter an die anderen Möglichkeiten zurück. Wer „gut genug“ wählt, ist schneller fertig und mit der Wahl im Durchschnitt zufriedener.'
  },
  bruner1986: {
    text: 'Bruner, J. (1986). Actual minds, possible worlds. Cambridge, MA: Harvard University Press.',
    notiz: 'Zwei Arten zu denken: erzählend und erklärend.',
    erklaerung: 'Ein Buch des Psychologen Jerome Bruner. Er beschreibt zwei Arten zu denken: die erzählende, die in Geschichten mit Menschen, Absichten und Wendungen denkt, und die erklärende (er nennt sie „paradigmatisch“), die nach Gründen, Regeln und Beweisen sucht. Beide sind eigenständig; keine lässt sich auf die andere zurückführen.'
  },
  mcadams2001: {
    text: 'McAdams, D. P. (2001). The psychology of life stories. Review of General Psychology, 5(2), 100–122.',
    notiz: 'Menschen erzählen ihr Leben als Geschichte – mit Kapiteln und Wendepunkten.',
    erklaerung: 'Ein Überblick darüber, wie Menschen ihr Leben als Geschichte erzählen – mit Kapiteln, Wendepunkten und wiederkehrenden Themen. Diese Lebensgeschichte hilft, sich über die Zeit als dieselbe Person zu erleben. Sie ist nicht fest, sondern verändert sich mit dem, was man erlebt und wie man es erzählt.'
  },
  lakoff1973: {
    text: 'Lakoff, G. (1973). Hedges: A study in meaning criteria and the logic of fuzzy concepts. Journal of Philosophical Logic, 2(4), 458–508.',
    notiz: 'Wörter wie „ziemlich“ oder „eigentlich“ stufen Aussagen ab („Hedges“).',
    erklaerung: 'Der Sprachwissenschaftler George Lakoff untersuchte Wörter wie „ziemlich“, „eigentlich“ oder „sozusagen“, mit denen man Aussagen abstuft. Er nannte sie „Hedges“ – wörtlich „Hecken“. Sie zeigen, dass Bedeutung oft eine Frage des Grades ist und nicht nur von ja oder nein.'
  },
  gordon1970: {
    text: 'Gordon, T. (1970). Parent effectiveness training. New York: Wyden. Deutsch: Familienkonferenz.',
    notiz: 'Ich-Botschaften: von der eigenen Sicht sprechen statt den anderen zu bewerten.',
    erklaerung: 'Ein Buch des Psychologen Thomas Gordon über Gespräche in Familien. Bekannt wurde daraus die Ich-Botschaft: „Ich ärgere mich, wenn …“ statt „Du machst immer …“. Wer von der eigenen Sicht spricht, lässt dem anderen Raum, ohne ihn anzugreifen. Die Idee wird heute in vielen Kommunikations-Kursen geübt.'
  }
};
