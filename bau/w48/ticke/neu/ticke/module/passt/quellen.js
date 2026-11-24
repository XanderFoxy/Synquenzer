// M4 passt – Quellen (Format: quellen.js im App-Ordner). Gemeinsame Quellen (soto2019, nye2012, roberts2017, dunlosky2013 …)
// und Quellen anderer Module (larson2002, barrick1991, steel2008, judge2012, thielmann2020, schmidt2007 …) werden nur per ID
// genutzt, nicht gedoppelt. Prüf-Status je Quelle: QUELLEN.md §3.4 und NOTES-passt.md.
// Keine Links nach draußen (Wunsch Xander 24.11.2026): text = Autor, Jahr, Werk als reiner Text; erklaerung = was dort steht, in der App.
export const QUELLEN = {
  gerlach2018: {
    text: 'Gerlach, M., Farb, B., Revelle, W., & Nunes Amaral, L. A. (2018). A robust data-driven approach identifies four personality types across four large data sets. Nature Human Behaviour, 2, 735–742.',
    notiz: 'Profil-Gruppen sind eine Vereinfachung; dieser Befund ist umstritten.',
    erklaerung: 'Die Forschenden werteten Big-Five-Fragebögen von weit über einer Million Menschen aus vier großen Online-Sammlungen aus. Mit einem Rechenverfahren suchten sie Häufungen und fanden vier Gruppen, die sie „durchschnittlich“, „zurückhaltend“, „selbstbezogen“ und „Vorbild“ nannten. Wichtig: Die meisten Menschen liegen zwischen den Gruppen, die Gruppen sind keine scharfen Typen. Darum nutzt die App höchstens ein Wort-Bild und keine festen Typen.'
  },
  freudenstein2019: {
    text: 'Freudenstein, J.-P., Strauch, C., Mussel, P., & Ziegler, M. (2019). Four personality types may be neither robust nor exhaustive. Nature Human Behaviour, 3, 1045–1046.',
    notiz: 'Kritik an festen Persönlichkeits-Typen: Die Gruppen überlappen stark, viele Menschen passen in keine richtig.',
    erklaerung: 'Eine kurze Antwort auf die Studie von Gerlach und anderen (2018). Die Autoren zeigen, dass die vier Gruppen stark davon abhängen, wie man rechnet, und sich stark überlappen. Viele Menschen passen in keine Gruppe richtig. Ihr Fazit: Persönlichkeit lässt sich besser als Mischung vieler Richtungen beschreiben als mit wenigen Typen.'
  },
  feist1998: {
    text: 'Feist, G. J. (1998). A meta-analysis of personality in scientific and artistic creativity. Personality and Social Psychology Review, 2(4), 290–309.',
    notiz: 'Kreative Menschen in Kunst und Wissenschaft sind im Mittel offener für Neues.',
    erklaerung: 'Feist fasste viele Studien zusammen, in denen die Persönlichkeit von Künstlerinnen, Künstlern, Wissenschaftlerinnen und Wissenschaftlern mit der anderer Menschen verglichen wurde. Ein Befund zog sich durch: Kreative Menschen in beiden Feldern waren im Mittel offener für neue Erfahrungen. Künstlerisch Tätige waren außerdem im Mittel weniger an Regeln und Gewohnheiten gebunden. Es geht um Mittelwerte großer Gruppen, nicht um einzelne Menschen.'
  },
  judge2002: {
    text: 'Judge, T. A., Bono, J. E., Ilies, R., & Gerhardt, M. W. (2002). Personality and leadership: A qualitative and quantitative review. Journal of Applied Psychology, 87(4), 765–780.',
    notiz: 'Extraversion hängt am beständigsten damit zusammen, dass jemand in Gruppen die Führung übernimmt.',
    erklaerung: 'Eine Zusammenschau vieler Studien zu Persönlichkeit und Führung. Am beständigsten hing Extraversion damit zusammen, dass jemand in Gruppen die Führung übernimmt und als Führungsperson erlebt wird. Auch Gewissenhaftigkeit, Offenheit und emotionale Stabilität spielten eine Rolle, Verträglichkeit kaum. Die Zusammenhänge gelten im Mittel – führen können auch ruhige Menschen, oft auf eine andere Art.'
  },
  antonioni1998: {
    text: 'Antonioni, D. (1998). Relationship between the Big Five personality factors and conflict management styles. International Journal of Conflict Management, 9(4), 336–355.',
    notiz: 'Wer verträglicher ist, weicht im Streit eher aus; wer extravertierter ist, setzt sich eher durch; Offenheit, Gewissenhaftigkeit und Extraversion gehen mit „gemeinsam lösen“ einher. Nicht überall bestätigt.',
    erklaerung: 'Antonioni befragte Menschen zu ihrer Persönlichkeit und dazu, wie sie mit Streit umgehen – etwa ausweichen, nachgeben, sich durchsetzen, einen Kompromiss suchen oder gemeinsam eine Lösung finden. Verträglichere Menschen wichen eher aus, extravertiertere setzten sich eher durch, und Offenheit, Gewissenhaftigkeit und Extraversion gingen mit gemeinsamem Lösen einher. Die Zusammenhänge waren eher klein und wurden in späteren Studien nicht überall bestätigt. Die App leitet daraus nur eine vorsichtige Vermutung ab.'
  },
  bogg2004: {
    text: 'Bogg, T., & Roberts, B. W. (2004). Conscientiousness and health-related behaviors: A meta-analysis of the leading behavioral contributors to mortality. Psychological Bulletin, 130(6), 887–919.',
    notiz: 'Gewissenhaftere Menschen verhalten sich im Mittel gesünder (Bewegung, Ernährung, weniger Rauchen und Alkohol).',
    erklaerung: 'Eine Zusammenschau vieler Studien zu Gewissenhaftigkeit und Gesundheitsverhalten. Gewissenhaftere Menschen bewegten sich im Mittel mehr, aßen gesünder, rauchten und tranken weniger und gingen seltener riskante Wege, etwa im Straßenverkehr. Die Autoren deuten das so: Wer gern plant und dranbleibt, hält auch gesunde Gewohnheiten leichter durch. Für alle anderen helfen Gewohnheiten, die von allein laufen.'
  },
  malouff2010: {
    text: 'Malouff, J. M., Thorsteinsson, E. B., Schutte, N. S., Bhullar, N., & Rooke, S. E. (2010). The Five-Factor Model of personality and relationship satisfaction of intimate partners: A meta-analysis. Journal of Research in Personality, 44(1), 124–127.',
    notiz: '19 Stichproben: Partner von verträglicheren, gewissenhafteren, emotional stabileren und extravertierteren Menschen sind im Mittel etwas zufriedener.',
    erklaerung: 'Die Forschenden fassten 19 Stichproben zusammen und fragten: Wie hängt die Persönlichkeit eines Menschen mit der Zufriedenheit seines Partners oder seiner Partnerin zusammen? Partner von verträglicheren, gewissenhafteren, emotional stabileren und extravertierteren Menschen waren im Mittel etwas zufriedener. Die Zusammenhänge waren klein und sagen nichts darüber, ob eine bestimmte Beziehung gelingt.'
  },
  hudson2014: {
    text: 'Hudson, N. W., & Roberts, B. W. (2014). Goals to change personality traits: Concurrent links between personality traits, daily behavior, and goals to change oneself. Journal of Research in Personality, 53, 68–83.',
    notiz: 'Die meisten Menschen möchten etwas an ihrer Persönlichkeit ändern – am häufigsten mehr Gewissenhaftigkeit, mehr Extraversion und mehr Gelassenheit.',
    erklaerung: 'Die Forschenden fragten Menschen, ob sie etwas an ihrer Persönlichkeit ändern möchten. Die allermeisten wollten das – am häufigsten gewissenhafter, geselliger und gelassener werden. Der Wunsch nach Veränderung ist also sehr verbreitet und kein Zeichen, dass mit jemandem etwas nicht stimmt.'
  },
  stieger2021: {
    text: 'Stieger, M., Flückiger, C., Rüegger, D., Kowatsch, T., Roberts, B. W., & Allemand, M. (2021). Changing personality traits with the help of a digital personality change intervention. Proceedings of the National Academy of Sciences, 118(8), e2017548118.',
    notiz: 'Viele Menschen, 3 Monate Training per App: Veränderung in die gewünschte Richtung, beim „mehr davon“ auch von Freunden bemerkt, noch 3 Monate später messbar.',
    erklaerung: 'Erwachsene, die etwas an ihrer Persönlichkeit ändern wollten, übten drei Monate lang mit einer Smartphone-App, die kleine Schritte vorschlug und nachfragte. Im Mittel veränderten sie sich in die gewünschte Richtung. Wer „mehr davon“ wollte, wurde auch von nahestehenden Menschen so erlebt. Drei Monate nach dem Ende war die Veränderung noch zu sehen.'
  },
  roberts2006: {
    text: 'Roberts, B. W., Walton, K. E., & Viechtbauer, W. (2006). Patterns of mean-level change in personality traits across the life course: A meta-analysis of longitudinal studies. Psychological Bulletin, 132(1), 1–25.',
    notiz: 'Persönlichkeit verändert sich auch von selbst: Zwischen 20 und 40 werden Menschen im Mittel gewissenhafter und gelassener.',
    erklaerung: 'Eine Zusammenschau vieler Langzeitstudien, in denen dieselben Menschen über Jahre immer wieder befragt wurden. Im Mittel wurden Menschen vor allem zwischen 20 und 40 gewissenhafter, gelassener und sicherer im Auftreten. Verträglichkeit nahm eher im späteren Leben zu. Persönlichkeit ist also kein fester Stempel, sondern verändert sich über das ganze Leben.'
  }
};
