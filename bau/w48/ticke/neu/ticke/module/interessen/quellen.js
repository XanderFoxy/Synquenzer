// M2 interessen – Quellen (Format: quellen.js im App-Ordner). Gemeinsame Quellen (nye2012 …) nicht doppeln.
// Prüf-Status je Quelle steht in QUELLEN.md §3.2 ([S] per Websuche bestätigt, [F] aus Fachwissen/Recherche-Datei).
export const QUELLEN = {
  armstrong2008: {
    text: 'Armstrong, P. I., Allison, W., & Rounds, J. (2008). Development and initial validation of brief public domain RIASEC marker scales. Journal of Vocational Behavior, 73(2), 287–299.',
    url: 'https://doi.org/10.1016/j.jvb.2008.06.003',
    notiz: 'Kurze Fragen zu den sechs Interessen-Bereichen nach Holland (RIASEC), ausgewählt aus dem O*NET Interest Profiler und von den Autoren als „public domain“ veröffentlicht. Die App nutzt eine eigene, vorläufige Übersetzung.'
  },
  onet: {
    text: 'O*NET Resource Center: O*NET Career Exploration Tools – Content License (CC BY-ND 4.0 oder O*NET Tools Developer License). U.S. Department of Labor, Employment and Training Administration (USDOL/ETA).',
    url: 'https://www.onetcenter.org/license_tools.html',
    notiz: 'Die Interessen-Fragen stammen aus dem O*NET Interest Profiler. Diese App hat sie ausgewählt, gekürzt und übersetzt. This app includes information from O*NET Career Exploration Tools by the U.S. Department of Labor, Employment and Training Administration (USDOL/ETA). Used under the O*NET Tools Developer License. O*NET® is a trademark of USDOL/ETA. This app has modified all or some of this information. USDOL/ETA has not approved, endorsed, or tested these modifications.'
  },
  tracey1993: {
    text: 'Tracey, T. J., & Rounds, J. B. (1993). Evaluating Holland’s and Gati’s vocational-interest models: A structural meta-analysis. Psychological Bulletin, 113(2), 229–246.',
    url: 'https://doi.org/10.1037/0033-2909.113.2.229',
    notiz: 'Über 100 Studien: Die sechs Interessen-Bereiche ordnen sich wie ein Kreis – Nachbarn ähneln sich, Gegenüber sind sich fremd.'
  },
  low2005: {
    text: 'Low, K. S. D., Yoon, M., Roberts, B. W., & Rounds, J. (2005). The stability of vocational interests from early adolescence to middle adulthood: A quantitative review of longitudinal studies. Psychological Bulletin, 131(5), 713–737.',
    url: 'https://doi.org/10.1037/0033-2909.131.5.713',
    notiz: 'Interessen sind ziemlich beständig; besonders ab Anfang 20 ändern sie sich nur noch wenig.'
  },
  sibley2011: {
    text: 'Sibley, C. G., et al. (2011). The Mini-IPIP6: Validation and extension of a short measure of the Big-Six factors of personality in New Zealand. New Zealand Journal of Psychology, 40(3), 142–159.',
    url: 'https://www.psychology.org.nz/journal-archive/SibleyIPIP.pdf',
    notiz: 'Kurzform mit vier Fragen je Grundzug, darunter Ehrlichkeit-Bescheidenheit; eine Frage („teures Auto“) stammt von hier.'
  },
  roenneberg2004: {
    text: 'Roenneberg, T., Kuehnle, T., Pramstaller, P. P., Ricken, J., Havel, M., Guth, A., & Merrow, M. (2004). A marker for the end of adolescence. Current Biology, 14(24), R1038–R1039.',
    url: 'https://doi.org/10.1016/j.cub.2004.11.039',
    notiz: 'Rund 25.000 Menschen: Die innere Uhr wird in der Jugend immer später, ist um die 20 am spätesten und wird danach langsam wieder früher.'
  }
};
