// Welche aufgezeichnete Antwort gehört zu welcher URL (erster Treffer gewinnt). '!fehler' simuliert einen Ausfall.
export const FIXTURE_KARTE = [
  ['schnaeppchen-daten', 'schnaeppchen-current.json'],
  ['rss/gruppe/lebensmittel', 'mydealz-lebensmittel.xml'],
  ['rss/gruppe/drogerie', '!fehler'],
  ['rss/gruppe/preisfehler', 'mydealz-preisfehler.xml'],
  ['search?q=Therme', 'mydealz-therme.xml'],
  ['q=D%C3%B6beln%20Stadtfest', 'news-doebeln-stadtfest.xml'],
  ['rss/gruppe/reisen', 'mydealz-reisen.xml'],
  ['urlaubspiraten', 'urlaubspiraten.xml'],
  ['urlaubsguru', 'kaputt.txt'],
  ['search?q=microfreak', 'mydealz-microfreak.xml'],
  ['q=%22Bands%20gesucht%22%20Stadtfest', 'news-bands-gesucht.xml'],
  ['arbeitsagentur.de/jobboerse/jobsuche-service/pc/v4/jobs?was=Deutschlehrer+online', 'ba-deutschlehrer.json'],
  ['arbeitsagentur.de/jobboerse/jobsuche-service/pc/v4/jobs?was=%C3%9Cbersetzer+Arabisch', 'ba-arabisch.json'],
  ['rss/gruppe/freebies', 'mydealz-freebies.xml'],
  ['rss/gruppe/gewinnspiele', 'mydealz-gewinnspiele.xml'],
];
