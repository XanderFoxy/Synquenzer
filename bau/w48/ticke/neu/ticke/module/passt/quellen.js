// M4 passt – Quellen (Format: quellen.js im App-Ordner). Gemeinsame Quellen (soto2019, nye2012, roberts2017, dunlosky2013 …)
// und Quellen anderer Module (larson2002, barrick1991, steel2008, judge2012, thielmann2020, schmidt2007 …) werden nur per ID
// genutzt, nicht gedoppelt. Prüf-Status je Quelle: QUELLEN.md §3.4 und NOTES-passt.md.
export const QUELLEN = {
  gerlach2018: {
    text: 'Gerlach, M., Farb, B., Revelle, W., & Nunes Amaral, L. A. (2018). A robust data-driven approach identifies four personality types across four large data sets. Nature Human Behaviour, 2, 735–742.',
    url: 'https://doi.org/10.1038/s41562-018-0419-z',
    notiz: 'Profil-Gruppen sind eine Vereinfachung; dieser Befund ist umstritten.'
  },
  freudenstein2019: {
    text: 'Freudenstein, J.-P., Strauch, C., Mussel, P., & Ziegler, M. (2019). Four personality types may be neither robust nor exhaustive. Nature Human Behaviour, 3, 1045–1046.',
    notiz: 'Kritik an festen Persönlichkeits-Typen: Die Gruppen überlappen stark, viele Menschen passen in keine richtig.'
  },
  feist1998: {
    text: 'Feist, G. J. (1998). A meta-analysis of personality in scientific and artistic creativity. Personality and Social Psychology Review, 2(4), 290–309.',
    url: 'https://doi.org/10.1207/s15327957pspr0204_5',
    notiz: 'Kreative Menschen in Kunst und Wissenschaft sind im Mittel offener für Neues.'
  },
  judge2002: {
    text: 'Judge, T. A., Bono, J. E., Ilies, R., & Gerhardt, M. W. (2002). Personality and leadership: A qualitative and quantitative review. Journal of Applied Psychology, 87(4), 765–780.',
    url: 'https://doi.org/10.1037/0021-9010.87.4.765',
    notiz: 'Extraversion hängt am beständigsten damit zusammen, dass jemand in Gruppen die Führung übernimmt (im Mittel r ≈ .31).'
  },
  antonioni1998: {
    text: 'Antonioni, D. (1998). Relationship between the Big Five personality factors and conflict management styles. International Journal of Conflict Management, 9(4), 336–355.',
    url: 'https://doi.org/10.1108/eb022814',
    notiz: 'Wer verträglicher ist, weicht im Streit eher aus; wer extravertierter ist, setzt sich eher durch; Offenheit, Gewissenhaftigkeit und Extraversion gehen mit „gemeinsam lösen“ einher. Nicht überall bestätigt.'
  },
  bogg2004: {
    text: 'Bogg, T., & Roberts, B. W. (2004). Conscientiousness and health-related behaviors: A meta-analysis of the leading behavioral contributors to mortality. Psychological Bulletin, 130(6), 887–919.',
    url: 'https://doi.org/10.1037/0033-2909.130.6.887',
    notiz: 'Gewissenhaftere Menschen verhalten sich im Mittel gesünder (Bewegung, Ernährung, weniger Rauchen und Alkohol).'
  },
  malouff2010: {
    text: 'Malouff, J. M., Thorsteinsson, E. B., Schutte, N. S., Bhullar, N., & Rooke, S. E. (2010). The Five-Factor Model of personality and relationship satisfaction of intimate partners: A meta-analysis. Journal of Research in Personality, 44(1), 124–127.',
    url: 'https://doi.org/10.1016/j.jrp.2009.09.004',
    notiz: '19 Stichproben: Partner von verträglicheren, gewissenhafteren, emotional stabileren und extravertierteren Menschen sind im Mittel etwas zufriedener.'
  },
  hudson2014: {
    text: 'Hudson, N. W., & Roberts, B. W. (2014). Goals to change personality traits: Concurrent links between personality traits, daily behavior, and goals to change oneself. Journal of Research in Personality, 53, 68–83.',
    url: 'https://doi.org/10.1016/j.jrp.2014.08.008',
    notiz: 'Die meisten Menschen möchten etwas an ihrer Persönlichkeit ändern – am häufigsten mehr Gewissenhaftigkeit, mehr Extraversion und mehr Gelassenheit.'
  },
  stieger2021: {
    text: 'Stieger, M., Flückiger, C., Rüegger, D., Kowatsch, T., Roberts, B. W., & Allemand, M. (2021). Changing personality traits with the help of a digital personality change intervention. Proceedings of the National Academy of Sciences, 118(8), e2017548118.',
    url: 'https://doi.org/10.1073/pnas.2017548118',
    notiz: '1.523 Menschen, 3 Monate Training per App: Veränderung in die gewünschte Richtung, beim „mehr davon“ auch von Freunden bemerkt, noch 3 Monate später messbar.'
  },
  roberts2006: {
    text: 'Roberts, B. W., Walton, K. E., & Viechtbauer, W. (2006). Patterns of mean-level change in personality traits across the life course: A meta-analysis of longitudinal studies. Psychological Bulletin, 132(1), 1–25.',
    url: 'https://doi.org/10.1037/0033-2909.132.1.1',
    notiz: 'Persönlichkeit verändert sich auch von selbst: Zwischen 20 und 40 werden Menschen im Mittel gewissenhafter und gelassener.'
  }
};
