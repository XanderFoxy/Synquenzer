// M3 textspiegel – Quellen (Format: quellen.js im App-Ordner). Gemeinsame Quellen (forer1949 …) nicht doppeln.
// Angaben aus persoenlichkeit/SPRACHANALYSE.md §8; covington2010 und dodds2015 am 16.11.2026 per Websuche bestätigt.
export const QUELLEN = {
  koutsoumpis2022: {
    text: 'Koutsoumpis, A., Oostrom, J. K., Holtrop, D., van Breda, W., Ghassemi, S., & de Vries, R. E. (2022). The kernel of truth in text-based personality assessment: A meta-analysis of the relations between the Big Five and the Linguistic Inquiry and Word Count (LIWC). Psychological Bulletin, 148(11–12), 843–868.',
    url: 'https://doi.org/10.1037/bul0000381',
    notiz: 'Wortgruppen hängen mit den Big Five nur schwach zusammen (etwa r = .1) – etwas stärker mit dem Urteil anderer als mit der Selbsteinschätzung.'
  },
  carey2015: {
    text: 'Carey, A. L., Brucks, M. S., Küfner, A. C. P., Holtzman, N. S., große Deters, F., Back, M. D., Donnellan, M. B., Pennebaker, J. W., & Mehl, M. R. (2015). Narcissism and the use of personal pronouns revisited. Journal of Personality and Social Psychology, 109(3), e1–e15.',
    url: 'https://doi.org/10.1037/pspp0000029',
    notiz: 'Viele Ich-Wörter bedeuten nicht Narzissmus (Zusammenhang nahe null).'
  },
  chen2020: {
    text: 'Chen, J., Qiu, L., & Ho, M.-H. R. (2020). A meta-analysis of linguistic markers of extraversion: Positive emotion and social process words. Journal of Research in Personality, 89, 104035.',
    url: 'https://doi.org/10.1016/j.jrp.2020.104035',
    notiz: '37 Studien: Wörter für Freude (r = .07) und für andere Menschen (r = .08) hängen nur sehr schwach mit Extraversion zusammen.'
  },
  tackman2019: {
    text: 'Tackman, A. M., et al. (2019). Depression, negative emotionality, and self-referential language: A multi-lab, multi-measure, and multi-language-task research synthesis. Journal of Personality and Social Psychology, 116(5), 817–834.',
    url: 'https://doi.org/10.1037/pspp0000187',
    notiz: 'Ich-Wörter hängen sehr schwach (etwa r = .1) damit zusammen, wie stark jemand negative Gefühle spürt – zu schwach für eine Aussage über einen einzelnen Menschen.'
  },
  dodds2015: {
    text: 'Dodds, P. S., Clark, E. M., Desu, S., Frank, M. R., Reagan, A. J., Williams, J. R., et al. (2015). Human language reveals a universal positivity bias. Proceedings of the National Academy of Sciences, 112(8), 2389–2394.',
    url: 'https://doi.org/10.1073/pnas.1411678112',
    notiz: '24 Textsammlungen in 10 Sprachen: Menschen benutzen insgesamt mehr freundliche als belastende Wörter.'
  },
  newman2008: {
    text: 'Newman, M. L., Groom, C. J., Handelman, L. D., & Pennebaker, J. W. (2008). Gender differences in language use: An analysis of 14,000 text samples. Discourse Processes, 45(3), 211–236.',
    url: 'https://doi.org/10.1080/01638530802073712',
    notiz: 'Wortgebrauch unterscheidet sich im Mittel nach Geschlecht – eine Wortzählung misst darum leicht etwas anderes als Persönlichkeit.'
  },
  azucar2018: {
    text: 'Azucar, D., Marengo, D., & Settanni, M. (2018). Predicting the Big 5 personality traits from digital footprints on social media: A meta-analysis. Personality and Individual Differences, 124, 150–159.',
    url: 'https://doi.org/10.1016/j.paid.2017.12.018',
    notiz: 'Computer-Modelle mit vielen digitalen Spuren erreichen im Mittel etwa r = .3 bis .4.'
  },
  moreno2021: {
    text: 'Moreno, J. D., Martínez-Huertas, J. Á., Olmos, R., Jorge-Botana, G., & Botella, J. (2021). Can personality traits be measured analyzing written language? A meta-analytic study on computational methods. Personality and Individual Differences, 177, 110818.',
    url: 'https://doi.org/10.1016/j.paid.2021.110818',
    notiz: 'Geschriebene Sprache mit Computer-Methoden: etwa r = .26 bis .30 – „klein bis mittel“; für Einzelne braucht es noch Forschung.'
  },
  peters2024: {
    text: 'Peters, H., & Matz, S. C. (2024). Large language models can infer psychological dispositions of social media users. PNAS Nexus, 3(6), pgae231.',
    url: 'https://doi.org/10.1093/pnasnexus/pgae231',
    notiz: 'Sprachmodelle ohne Training schätzten die Big Five aus Facebook-Texten etwa mit r = .29 – bei manchen Gruppen genauer als bei anderen.'
  },
  peters2024b: {
    text: 'Peters, H., Cerf, M., & Matz, S. C. (2024). Large language models can infer personality from free-form user interactions. arXiv:2405.13052 (Vorabdruck, noch nicht begutachtet).',
    url: 'https://arxiv.org/abs/2405.13052',
    notiz: 'Gezieltes Nachfragen half am meisten (r ≈ .44 statt .22 beim freien Plaudern) – noch nicht begutachtet.'
  },
  covington2010: {
    text: 'Covington, M. A., & McFall, J. D. (2010). Cutting the Gordian knot: The moving-average type–token ratio (MATTR). Journal of Quantitative Linguistics, 17(2), 94–100.',
    url: 'https://doi.org/10.1080/09296171003643098',
    notiz: 'Wortvielfalt über ein gleitendes Fenster gemessen – so hängt sie kaum noch von der Textlänge ab.'
  },
  almosaiwi2018: {
    text: 'Al-Mosaiwi, M., & Johnstone, T. (2018). In an absolute state: Elevated use of absolutist words is a marker specific to anxiety, depression, and suicidal ideation. Clinical Psychological Science, 6(4), 529–542.',
    url: 'https://doi.org/10.1177/2167702617747074',
    notiz: 'Ein Befund über Online-Foren, nicht über einzelne Menschen. Darum zeigt die App zu „immer/nie“-Wörtern keine Warnung.'
  },
  tausczik2010: {
    text: 'Tausczik, Y. R., & Pennebaker, J. W. (2010). The psychological meaning of words: LIWC and computerized text analysis methods. Journal of Language and Social Psychology, 29(1), 24–54.',
    url: 'https://doi.org/10.1177/0261927X09351676',
    notiz: 'Überblick: Kleine Wörter wie ich, wir, nicht oder weil zu zählen ist eine etablierte Methode – mit kleinen Effekten.'
  }
};
