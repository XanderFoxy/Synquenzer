import * as A from '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/ticke-w/neu/ticke/module/textspiegel/analyse.js';
import * as X from '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/ticke-w/neu/ticke/module/textspiegel/texte.js';
import { P1, P2, P3 } from './proben.mjs';
for (const [n, P] of [['P1', P1], ['P2', P2], ['P3', P3]]) {
  const an = A.analysiere(P, X.REIHE);
  console.log(n, an.woerter, an.umfang, 'satz', an.satzlaenge.mittel, 'vielfalt', an.vielfalt.wert, 'gef', an.merkmale.freude.pro100 + an.merkmale.belastung.pro100, 'begr', an.merkmale.begruenden.pro100);
  for (const r of X.richtungen(an)) console.log('  ', r.id, r.seite, r.deutlich, '|', r.satz, '|', r.woher);
  console.log('  stellen zeit', JSON.stringify(A.fundstellen(P, X.REIHE, ['zukunft'], 2)));
  console.log('  wieder', A.wiederkehrend(P, X.REIHE));
  console.log('  nach', X.nachfragen(an)); console.log('  stil', X.stilNotizen(an));
}
