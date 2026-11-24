// M1 bigfive – Quellen (Format: quellen.js im App-Ordner). Gemeinsame Quellen (goldberg2006, soto2019, roberts2017, nettle2006 …) nicht doppeln.
// Fassung 24.11.2026: keine Links nach draußen. Jede Quelle als reiner Text (Autor, Jahr, Werk) + notiz (ein Satz) + erklaerung
// (2–5 Sätze in der App: was dort steht und was es hier bedeutet).
export const QUELLEN = {
  johnson2014: {
    text: 'Johnson, J. A. (2014). Measuring thirty facets of the Five Factor Model with a 120-item public domain inventory: Development of the IPIP-NEO-120. Journal of Research in Personality, 51, 78–89.',
    notiz: 'Der IPIP-NEO-120: 120 frei nutzbare Sätze zu den Big Five und ihren 30 Facetten.',
    erklaerung: 'Johnson stellt hier den IPIP-NEO-120 vor: 120 kurze Sätze, je vier für jede der 30 Facetten der Big Five. Die Sätze stammen aus dem International Personality Item Pool (IPIP), einer frei nutzbaren Sammlung, und wurden aus einer längeren Fassung mit 300 Sätzen ausgewählt. Er hat sie an einer großen englischsprachigen Online-Stichprobe geprüft. Die Kurzform in dieser App nimmt je Facette einen dieser Sätze, „Genauer hinschauen“ die übrigen.'
  },
  johnsonnormen: {
    text: 'Johnson, J. A. (o. J.). IPIP-NEO-120, Auswertungsprogramm mit Vergleichswerten nach Alter und Geschlecht (englischsprachige Online-Stichprobe). Zahlen übernommen aus: Corbari, E. / NeuroQuest (2025). five-factor-e, Version 1.13.1 [Software, MIT-Lizenz].',
    notiz: 'Mittelwerte und Streuungen je Bereich und Facette für 8 Gruppen (Frauen/Männer × 4 Altersgruppen).',
    erklaerung: 'Zu seinem Fragebogen gibt es Vergleichstabellen aus einer großen englischsprachigen Online-Stichprobe, getrennt nach Alter und Geschlecht. Frühere Fassungen dieser App haben damit angezeigt, wie viele Menschen „darunter“ liegen. Diese Fassung zeigt keinen Vergleich mehr: Dein Muster kommt nur aus deinen eigenen Antworten. Intern nutzt die App die Tabellen nur noch, um vorzuschlagen, wo „Genauer hinschauen“ lohnen könnte.'
  },
  johnson2005: {
    text: 'Johnson, J. A. (2005). Ascertaining the validity of individual protocols from Web-based personality inventories. Journal of Research in Personality, 39(1), 103–129.',
    notiz: 'Woran man bei Online-Fragebögen eilige Antworten erkennt, z. B. lange Reihen derselben Antwort.',
    erklaerung: 'Johnson untersuchte, woran man bei Fragebögen im Netz unsorgfältige Antworten erkennt: zum Beispiel sehr lange Reihen derselben Antwort oder widersprüchliche Antworten auf fast gleiche Sätze. Solche Muster machen eine Auswertung unsicherer. Die App nutzt diese Idee nur, um freundlich nachzufragen – nicht, um dich zu bewerten.'
  },
  huang2012: {
    text: 'Huang, J. L., Curran, P. G., Keeney, J., Poposki, E. M., & DeShon, R. P. (2012). Detecting and deterring insufficient effort responding to surveys. Journal of Business and Psychology, 27(1), 99–114.',
    notiz: 'Sehr schnelle Antworten sind ein Zeichen, dass jemand die Sätze nur überfliegt.',
    erklaerung: 'Die Autoren untersuchten, wie man erkennt, dass jemand einen Fragebogen ohne viel Aufmerksamkeit ausfüllt, und wie man das vermeiden kann. Ein deutliches Zeichen sind sehr kurze Antwortzeiten, etwa unter zwei Sekunden je Satz. Ein freundlicher Hinweis vor dem Ausfüllen half in ihren Studien, sorgfältiger zu antworten. Darum sagt die App „Lies die Sätze ruhig“, wenn es sehr schnell geht.'
  },
  itc2018: {
    text: 'International Test Commission (2018). ITC Guidelines for Translating and Adapting Tests (2nd ed.). International Journal of Testing, 18(2), 101–134.',
    notiz: 'Regeln, wie man Fragebögen sauber übersetzt und prüft.',
    erklaerung: 'Die Internationale Test-Kommission beschreibt, wie man einen Fragebogen sorgfältig in eine andere Sprache überträgt: mehrere Übersetzer, Rück-Übersetzung in die Ausgangssprache und eine Prüfung mit Menschen, die die neue Sprache sprechen. Die deutschen Sätze dieser App sind eine eigene, vorläufige Übersetzung und noch nicht auf diese Weise geprüft.'
  },
  larson2002: {
    text: 'Larson, L. M., Rottinghaus, P. J., & Borgen, F. H. (2002). Meta-analyses of Big Six interests and Big Five personality factors. Journal of Vocational Behavior, 61(2), 217–239.',
    notiz: 'Offenheit hängt mit künstlerischen und forschenden Interessen zusammen, Extraversion mit unternehmerischen und sozialen.',
    erklaerung: 'Larson und Kollegen haben viele Studien zusammengefasst, in denen Persönlichkeit und berufliche Interessen gemeinsam erfragt wurden. Am deutlichsten: Die Seite „Neugier auf Neues“ hängt mit künstlerischen und forschenden Interessen zusammen, die Seite „Kontakt und Schwung“ mit unternehmerischen und sozialen. Das sind Tendenzen über viele Menschen – kein Hinweis darauf, was du tun solltest.'
  }
};
