// M2 interessen – Quellen (Format: quellen.js im App-Ordner). Gemeinsame Quellen (nye2012 …) nicht doppeln.
// Keine Links nach draußen: text (volle Angabe, reiner Text), notiz (ein Satz), erklaerung (2–5 Sätze: was dort steht und was es bedeutet).
export const QUELLEN = {
  holland1997: {
    text: 'Holland, J. L. (1997). Making vocational choices: A theory of vocational personalities and work environments (3. Aufl.). Odessa, FL: Psychological Assessment Resources.',
    notiz: 'Die Theorie der sechs Interessen-Bereiche (RIASEC) und des Sechsecks.',
    erklaerung: 'John Holland beschreibt sechs Interessen-Bereiche: praktisch-technisch, forschend, künstlerisch-gestaltend, sozial, unternehmerisch und ordnend. Er ordnet sie als Sechseck an – Nachbarn ähneln sich, Gegenüber sind sich am fremdesten. Seine Grundidee: Menschen suchen sich Umgebungen, in denen sie tun können, was sie anzieht, und fühlen sich dort eher wohl. Meist beschreibt er einen Menschen mit den drei Bereichen, die ihn am meisten anziehen (dem „Holland-Code“). Das Modell ist das bekannteste für Interessen und die Grundlage vieler Fragebögen.'
  },
  prediger1982: {
    text: 'Prediger, D. J. (1982). Dimensions underlying Holland’s hexagon: Missing link between interests and occupations? Journal of Vocational Behavior, 21(3), 259–287.',
    notiz: 'Hinter dem Sechseck stecken zwei Achsen: Dinge oder Menschen, Daten oder Ideen.',
    erklaerung: 'Prediger zeigt, dass sich Hollands Sechseck mit zwei einfachen Achsen beschreiben lässt. Die eine: ob dich eher die Arbeit mit Dingen (Material, Werkzeug, Technik, Natur) oder mit Menschen anzieht. Die andere: ob dich eher Daten (Fakten, Zahlen, Ordnung, Abläufe) oder Ideen (Einfälle, Theorien, Ausdruck) anziehen. Jeder der sechs Bereiche liegt irgendwo auf diesen Achsen – praktisch-technisch nah bei den Dingen, sozial nah bei den Menschen, ordnend bei den Daten, künstlerisch bei den Ideen. Auf diesen Achsen beruht auch eine bekannte Berufs-Landkarte aus den USA, die „World-of-Work Map“.'
  },
  armstrong2008: {
    text: 'Armstrong, P. I., Allison, W., & Rounds, J. (2008). Development and initial validation of brief public domain RIASEC marker scales. Journal of Vocational Behavior, 73(2), 287–299.',
    notiz: 'Kurze Fragen zu den sechs Interessen-Bereichen nach Holland (RIASEC), ausgewählt aus dem O*NET Interest Profiler und von den Autoren als „public domain“ veröffentlicht. Die App nutzt eine eigene, vorläufige Übersetzung.',
    erklaerung: 'Die Autoren haben aus dem großen O*NET Interest Profiler kurze Fragen-Sätze ausgewählt: acht Tätigkeiten je Holland-Bereich. Sie prüften, ob die Fragen eines Bereichs zusammenpassen und ob sich die sechs Bereiche wieder in der erwarteten Kreis-Ordnung zeigen; beides traf im Großen und Ganzen zu. Die Fragen sind frei nutzbar. Sie sind englisch und auf ältere US-Berufe zugeschnitten – die Tätigkeiten in dieser App sind eine eigene, vorläufige Übersetzung davon.'
  },
  onet: {
    text: 'O*NET Resource Center: O*NET Career Exploration Tools – Content License (CC BY-ND 4.0 oder O*NET Tools Developer License). U.S. Department of Labor, Employment and Training Administration (USDOL/ETA).',
    notiz: 'Die Interessen-Fragen stammen aus dem O*NET Interest Profiler. Diese App hat sie ausgewählt, gekürzt und übersetzt. This app includes information from O*NET Career Exploration Tools by the U.S. Department of Labor, Employment and Training Administration (USDOL/ETA). Used under the O*NET Tools Developer License. O*NET® is a trademark of USDOL/ETA. This app has modified all or some of this information. USDOL/ETA has not approved, endorsed, or tested these modifications.',
    erklaerung: 'O*NET ist die Berufs-Datenbank des US-Arbeitsministeriums. Dazu gehört der Interest Profiler, ein Fragebogen mit vielen Tätigkeiten zu den sechs Holland-Bereichen. Die Lizenz erlaubt die Nutzung, verlangt aber, dass Änderungen gekennzeichnet werden. Diese App hat die Fragen ausgewählt, gekürzt und ins Deutsche übertragen; das Ministerium hat diese Fassung nicht geprüft.'
  },
  tracey1993: {
    text: 'Tracey, T. J., & Rounds, J. B. (1993). Evaluating Holland’s and Gati’s vocational-interest models: A structural meta-analysis. Psychological Bulletin, 113(2), 229–246.',
    notiz: 'Über 100 Studien: Die sechs Interessen-Bereiche ordnen sich wie ein Kreis – Nachbarn ähneln sich, Gegenüber sind sich fremd.',
    erklaerung: 'Tracey und Rounds haben sehr viele Datensätze gemeinsam ausgewertet, um zu prüfen, ob die sechs Holland-Bereiche wirklich im Kreis geordnet sind. Die Kreis-Reihenfolge bestätigte sich gut: Bereiche, die im Sechseck nebeneinander liegen, hängen enger zusammen als gegenüberliegende. Dass die Abstände so gleichmäßig sind wie in einem perfekten Sechseck, bestätigte sich dagegen weniger. Für dich heißt das: Das Sechseck ist eine gute Landkarte, aber kein exakter Bauplan.'
  },
  low2005: {
    text: 'Low, K. S. D., Yoon, M., Roberts, B. W., & Rounds, J. (2005). The stability of vocational interests from early adolescence to middle adulthood: A quantitative review of longitudinal studies. Psychological Bulletin, 131(5), 713–737.',
    notiz: 'Interessen sind ziemlich beständig; besonders ab Anfang 20 ändern sie sich nur noch wenig.',
    erklaerung: 'Die Autoren haben viele Langzeit-Studien zusammengefasst, in denen dieselben Menschen über Jahre immer wieder nach ihren Interessen gefragt wurden. Interessen erwiesen sich als recht beständig – in der frühen Jugend noch weniger, ab etwa Anfang 20 deutlich mehr. Sie sind damit ähnlich beständig wie Persönlichkeits-Grundzüge. Verschieben können sie sich trotzdem, zum Beispiel durch neue Erfahrungen und Aufgaben.'
  },
  sibley2011: {
    text: 'Sibley, C. G., et al. (2011). The Mini-IPIP6: Validation and extension of a short measure of the Big-Six factors of personality in New Zealand. New Zealand Journal of Psychology, 40(3), 142–159.',
    notiz: 'Kurzform mit vier Fragen je Grundzug, darunter Ehrlichkeit-Bescheidenheit; eine Frage („teures Auto“) stammt von hier.',
    erklaerung: 'Sibley und Kollegen haben in Neuseeland eine sehr kurze Fassung eines Persönlichkeits-Fragebogens geprüft: vier Fragen je Grundzug, für die fünf großen Grundzüge und zusätzlich Ehrlichkeit-Bescheidenheit. Für einen groben Überblick reichten diese kurzen Skalen aus. Eine Aussage dieser App („in einem sehr teuren Auto gesehen werden“) stammt aus dieser Kurzform.'
  },
  roenneberg2004: {
    text: 'Roenneberg, T., Kuehnle, T., Pramstaller, P. P., Ricken, J., Havel, M., Guth, A., & Merrow, M. (2004). A marker for the end of adolescence. Current Biology, 14(24), R1038–R1039.',
    notiz: 'Rund 25.000 Menschen: Die innere Uhr wird in der Jugend immer später, ist um die 20 am spätesten und wird danach langsam wieder früher.',
    erklaerung: 'Roenneberg und Kollegen haben die Schlafzeiten von rund 25.000 Menschen ausgewertet. Die Mitte des Schlafs an freien Tagen wird in Kindheit und Jugend immer später, ist um das 20. Lebensjahr am spätesten und wird danach langsam wieder früher. Die Forscher schlugen diesen Wendepunkt als biologisches Zeichen für das Ende der Jugend vor. Ein später Rhythmus in jungen Jahren ist also weit verbreitet und hat viel mit Biologie zu tun.'
  }
};
