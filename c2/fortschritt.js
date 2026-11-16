// Feinschliff – Fortschritt: Punkte, Ziel, Serie, Verlauf je Bereich (SVG-Kurve der letzten 14 Tage), Stärken und Baustellen.
import { esc, speicher, tag, tagPlus } from './speicher.js';
import { SYM } from './symbole.js';
import { liste } from './daten.js';
import { tage, summe, serie, zielStand } from './konto.js';
import { kopf, BEREICHE } from './app.js';

export const TAGE_KURVE = 14;
export function kurve(werte, { b = 300, h = 72, farbe = 'currentColor' } = {}) {   // einfache Linie + Fläche, 0 = Grundlinie
  const max = Math.max(1, ...werte), n = werte.length, dx = b / Math.max(1, n - 1);
  const pkt = werte.map((v, i) => [i * dx, h - 6 - (v / max) * (h - 14)]);
  const linie = pkt.map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(1)},${y.toFixed(1)}`).join('');
  return `<svg class="kurve" viewBox="0 0 ${b} ${h}" preserveAspectRatio="none" role="img" aria-label="Verlauf der letzten ${n} Tage"><path d="${linie}L${b},${h}L0,${h}Z" fill="${farbe}" opacity=".14"/><path d="${linie}" fill="none" stroke="${farbe}" stroke-width="2.2" vector-effect="non-scaling-stroke" stroke-linejoin="round"/>${pkt.map(([x, y], i) => (werte[i] ? `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="2.6" fill="${farbe}"/>` : '')).join('')}</svg>`;
}
export function verlauf(bereich, heute = tag()) {
  const ts = tage(); return Array.from({ length: TAGE_KURVE }, (_, i) => { const d = ts[tagPlus(heute, i - TAGE_KURVE + 1)]; return d?.b?.[bereich]?.p || 0; });
}
const B_FUER = { hoeren: ['hoeren'], lesen: ['lesen'], grammatik: ['grammatik'], schreiben: ['schreiben'], sprechen: ['sprechen'], wortschatz: ['wortschatz'], pruefung: [], quiz: ['quiz'] };
const MODUL = { lesen: 'Lesen', hoeren: 'Hören', schreiben: 'Schreiben', sprechen: 'Sprechen' };
export async function seite(view) {
  const ts = tage(), s = serie(), z = zielStand(); const heute = tag(); const pr = speicher.lies('pruefungen', []).slice(-5).reverse();
  let woche = 0; for (let i = 0; i < 7; i++) woche += ts[tagPlus(heute, -i)]?.p || 0;
  const aktivTage = Object.values(ts).filter((d) => d.n || d.e).length;
  // Stärken/Baustellen aus der Statistik je Thema (mind. 4 Antworten)
  const th = speicher.lies('themen', {}); const namen = {};
  for (const b of ['grammatik', 'hoeren', 'lesen', 'wortschatz']) for (const e of await liste(b)) namen[`${b}/${e.id}`] = e.titel || e.thema;
  const st = Object.entries(th).filter(([, x]) => x.n >= 4).map(([k, x]) => ({ k, q: x.r / x.n, n: x.n, name: namen[k] || k.split('/').pop() }));
  const stark = [...st].sort((a, b) => b.q - a.q).filter((x) => x.q >= 0.75).slice(0, 3);
  const schwach = [...st].sort((a, b) => a.q - b.q).filter((x) => x.q < 0.75).slice(0, 3);
  const link = (k) => { const [b, id] = k.split('/'); return b === 'grammatik' ? `#/grammatik/${id}` : b === 'wortschatz' ? `#/wortschatz/${id}` : `#/${b}/${id}`; };
  const zeile = (x) => `<li><a href="${link(x.k)}"><span class="l-text"><b>${esc(x.name)}</b><small>${Math.round(x.q * 100)} % richtig · ${x.n} Antworten</small></span><span class="balken mini"><i style="width:${Math.round(x.q * 100)}%"></i></span></a></li>`;
  const kurven = [...BEREICHE.filter((b) => B_FUER[b.id].length), { id: 'quiz', name: 'Quiz' }].map((b) => {
    const w = verlauf(b.id); const sum = w.reduce((a, x) => a + x, 0);
    return `<div class="karte verlauf" data-bereich="${b.id}"><div class="v-kopf"><span class="k-sym">${SYM[b.id] || SYM.quiz}</span><b>${b.name}</b><span class="leise">${sum} P. in ${TAGE_KURVE} Tagen</span></div>${kurve(w, { farbe: `var(--c-${b.id})` })}</div>`;
  }).join('');
  view.innerHTML = `${kopf('Fortschritt')}<div class="bereich-seite">
    <div class="zahlen"><div class="karte zahl"><b data-summe>${summe()}</b><span>Punkte gesamt</span></div><div class="karte zahl"><b>${woche}</b><span>diese 7 Tage</span></div><div class="karte zahl"><b data-serie>${s.tage}</b><span>Serie (Lerntage)</span></div><div class="karte zahl"><b>${aktivTage}</b><span>Lerntage insgesamt</span></div></div>
    <div class="karte klein">${SYM.ziel}<div><b>${z.erreicht} von ${z.wert} Einheiten</b><p class="leise">Ziel ${z.art === 'monat' ? 'diesen Monat' : 'diese Woche'} · <a href="#/mehr">ändern</a></p></div></div>
    <h3 class="zwischen">Verlauf je Bereich</h3><div class="kurven">${kurven}</div>
    <div class="zwei"><section class="karte"><h3>Das sitzt</h3>${stark.length ? `<ul class="liste kompakt">${stark.map(zeile).join('')}</ul>` : '<p class="leise">Nach ein paar Runden siehst du hier deine Stärken.</p>'}</section>
      <section class="karte"><h3>Baustellen</h3>${schwach.length ? `<ul class="liste kompakt">${schwach.map(zeile).join('')}</ul>` : '<p class="leise">Noch keine Baustellen erkannt.</p>'}</section></div>
    <section class="karte"><h3>${SYM.pruefung} Prüfungssimulationen</h3>${pr.length ? `<ul class="liste kompakt">${pr.map((r) => `<li><span class="l-text"><b>${esc(MODUL[r.modul] || r.modul)}</b><small>${esc(r.tag)}${r.minuten ? ` · ${r.minuten} Min.` : ''}</small></span><span class="teil-punkte">${r.max ? `<b>${r.punkte}</b>/${r.max}` : 'selbst'}</span></li>`).join('')}</ul>` : '<p class="leise">Noch keine ganze Simulation. Unter „Prüfung“ kannst du ein Modul mit den echten Zeiten durchspielen.</p>'}</section></div>`;
}
