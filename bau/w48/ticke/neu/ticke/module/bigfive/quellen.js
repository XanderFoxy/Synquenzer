// M1 bigfive – Quellen (Format: quellen.js im App-Ordner). Gemeinsame Quellen (goldberg2006, soto2019, roberts2017 …) nicht doppeln.
// Prüf-Status je Quelle steht in QUELLEN.md §3.1 / NOTES-bigfive.md.
export const QUELLEN = {
  johnson2014: {
    text: 'Johnson, J. A. (2014). Measuring thirty facets of the Five Factor Model with a 120-item public domain inventory: Development of the IPIP-NEO-120. Journal of Research in Personality, 51, 78–89.',
    url: 'https://doi.org/10.1016/j.jrp.2014.05.003',
    notiz: 'Der IPIP-NEO-120: 120 frei nutzbare Fragen zu den Big Five und ihren 30 Facetten.'
  },
  johnsonnormen: {
    text: 'Johnson, J. A. (o. J.). IPIP-NEO-120, Auswertungsprogramm mit Vergleichswerten nach Alter und Geschlecht (englischsprachige Online-Stichprobe). Zahlen übernommen aus: Corbari, E. / NeuroQuest (2025). five-factor-e, Version 1.13.1 [Software, MIT-Lizenz].',
    url: 'https://pypi.org/project/five-factor-e/1.13.1/',
    notiz: 'Mittelwerte und Streuungen je Bereich und Facette für 8 Gruppen (Frauen/Männer × 4 Altersgruppen). Keine deutschen Werte – deshalb „vorläufig“.'
  },
  johnson2005: {
    text: 'Johnson, J. A. (2005). Ascertaining the validity of individual protocols from Web-based personality inventories. Journal of Research in Personality, 39(1), 103–129.',
    url: 'https://doi.org/10.1016/j.jrp.2004.09.009',
    notiz: 'Wie man im Netz unsorgfältige Antworten erkennt, z. B. sehr lange Reihen derselben Antwort.'
  },
  huang2012: {
    text: 'Huang, J. L., Curran, P. G., Keeney, J., Poposki, E. M., & DeShon, R. P. (2012). Detecting and deterring insufficient effort responding to surveys. Journal of Business and Psychology, 27(1), 99–114.',
    url: 'https://doi.org/10.1007/s10869-011-9231-8',
    notiz: 'Sehr schnelle Antworten (unter etwa 2 Sekunden je Frage) sind ein Zeichen für wenig Sorgfalt.'
  },
  itc2018: {
    text: 'International Test Commission (2018). ITC Guidelines for Translating and Adapting Tests (2nd ed.). International Journal of Testing, 18(2), 101–134.',
    url: 'https://doi.org/10.1080/15305058.2017.1398166',
    notiz: 'Regeln, wie man Fragebögen sauber übersetzt und prüft (Rück-Übersetzung, Testgruppe).'
  },
  larson2002: {
    text: 'Larson, L. M., Rottinghaus, P. J., & Borgen, F. H. (2002). Meta-analyses of Big Six interests and Big Five personality factors. Journal of Vocational Behavior, 61(2), 217–239.',
    url: 'https://doi.org/10.1006/jvbe.2001.1854',
    notiz: 'Offenheit hängt mit künstlerischen und forschenden Interessen zusammen, Extraversion mit unternehmerischen und sozialen.'
  }
};
