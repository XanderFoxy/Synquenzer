// muster – der Baum als selbst gezeichnetes SVG: Stamm „Du“ (oben) → Hauptäste je Bereich (Knoten auf dem Stamm, einklappbar)
// → Zweige = Äste links und rechts vom Stamm (beantwortet: kräftig mit Richtungs-Wort; offen: zart, „noch offen“).
// Der Baum wächst nach unten. Breite = Breite des Behälters (1:1 in Pixeln), Text wird mit Canvas gemessen und umbrochen.
// Farben nur über CSS-Variablen (stil.css), dadurch hell/dunkel. Äste sind <a href> (Tastatur: Tab + Enter), Hauptäste
// und „Du“ sind role=button mit tabindex (Enter/Leertaste). Jede Tippfläche ist mindestens 44 px hoch.
import { slug } from './sammeln.js';

const esc = (t) => String(t ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
let CTX = null;
function messer(familie) {
  if (CTX === null) { try { CTX = document.createElement('canvas').getContext('2d') || false; } catch { CTX = false; } }
  return (t, px, gewicht = 400) => {
    if (CTX) { CTX.font = `${gewicht} ${px}px ${familie}`; return CTX.measureText(t).width; }
    return String(t).length * px * (gewicht >= 600 ? 0.58 : 0.52);
  };
}
// Umbruch in höchstens max Zeilen; zu lange Wörter werden getrennt, die letzte Zeile bekommt notfalls „…“.
function umbrich(text, breite, px, gewicht, max, miss) {
  const woerter = String(text).split(/\s+/).filter(Boolean), zeilen = [];
  let z = '';
  const passt = (t) => miss(t, px, gewicht) <= breite;
  for (let w of woerter) {
    while (!passt(w)) {                                   // Wort länger als die Zeile → am Zeichen trennen
      let n = w.length - 1; while (n > 1 && !passt((z ? z + ' ' : '') + w.slice(0, n) + '-')) n--;
      if (z && n <= 3) { zeilen.push(z); z = ''; continue; }
      zeilen.push((z ? z + ' ' : '') + w.slice(0, n) + '-'); z = ''; w = w.slice(n);
    }
    const t = z ? z + ' ' + w : w;
    if (passt(t)) z = t; else { zeilen.push(z); z = w; }
  }
  if (z) zeilen.push(z);
  if (zeilen.length > max) {
    const rest = zeilen.slice(0, max); let l = rest[max - 1] + ' …';
    while (!passt(l) && l.length > 2) l = l.slice(0, -3).replace(/\s*\S$/, '') + ' …';
    rest[max - 1] = l; return rest;
  }
  return zeilen.length ? zeilen : [''];
}

// Zustand eines Astes für den Baum
export function zustand(S, a) {
  const e = S.richtung.get(a.id);
  if (e) return { art: 'da', wort: e.deutlich === 'beides' ? (e.wort && e.wort !== 'beides' ? e.wort : 'beides') : `${e.deutlich} · ${e.wort}`, e };
  if (a.nurLernen || a.bereich === 'Üben') return { art: 'lernen', wort: 'zum Entdecken', e: null };
  return { art: 'offen', wort: 'noch offen', e: null };
}
export function bereichStand(S, B) {
  let da = 0, offen = 0, lernen = 0;
  for (const a of B.aeste) { const z = zustand(S, a).art; if (z === 'da') da++; else if (z === 'offen') offen++; else lernen++; }
  const t = [];
  if (da) t.push(`${da} gewachsen`);
  if (offen) t.push(`${offen} noch offen`);
  if (lernen) t.push(`${lernen} zum Entdecken`);
  return { da, offen, lernen, text: t.join(' · ') };
}

// S: Sammlung (sammeln.js), offen: Set der offenen Bereich-Slugs, W: Breite in px, rem: Pixel je rem.
export function baumSvg(S, offen, W, rem = 17, familie = 'sans-serif') {
  const miss = messer(familie);
  W = Math.max(280, Math.floor(W));
  const f1 = Math.round(rem * 0.86 * 10) / 10, f2 = Math.round(rem * 0.78 * 10) / 10, fb = Math.round(rem * 0.95 * 10) / 10;
  const lh1 = Math.round(f1 * 1.25), lh2 = Math.round(f2 * 1.3), lhb = Math.round(fb * 1.25);
  const xT = Math.round(W / 2), gapT = Math.round(rem * 1.2), rand = 2, gapC = 10;
  const spalten = Math.max(1, Math.min(3, Math.floor((W / 2 - gapT / 2 - rand) / (rem * 10))));
  const nw = Math.floor((W / 2 - gapT / 2 - rand - (spalten - 1) * gapC) / spalten);
  const padX = 10, padY = 8, innen = nw - 2 * padX;
  const teile = [], zweige = [];
  let y = 4;
  // Stamm „Du“
  const rDu = Math.max(27, Math.round(rem * 1.6));
  const cyDu = y + rDu;
  const alleOffen = S.bereiche.length > 0 && S.bereiche.every((B) => offen.has(B.slug));
  teile.push(`<g class="mu-k mu-du" role="button" tabindex="0" data-alle="1" aria-expanded="${alleOffen}" aria-label="Du – alle Hauptäste ${alleOffen ? 'zuklappen' : 'aufklappen'}">
    <circle cx="${xT}" cy="${cyDu}" r="${rDu}"/><text x="${xT}" y="${cyDu + Math.round(fb * 0.36)}" text-anchor="middle" font-size="${fb + 2}" class="mu-du-t">Du</text></g>`);
  y = cyDu + rDu;
  let stammEnde = y;
  for (const B of S.bereiche) {
    y += Math.round(rem * 1.5);
    const st = bereichStand(S, B), auf = offen.has(B.slug);
    const tw = Math.max(miss(B.name, fb, 700), miss(st.text, f2, 400));
    const bw = Math.min(W - 2 * rand, Math.ceil(tw) + 2 * 18 + 22), bh = Math.max(48, padY * 2 + lhb + lh2);
    const bx = Math.round(xT - bw / 2);
    const kx = bx + bw - 22, ky = y + bh / 2;
    teile.push(`<g class="mu-k mu-bereich${st.da ? ' hat' : ''}" role="button" tabindex="0" data-bereich="${esc(B.slug)}" aria-expanded="${auf}" id="mu-b-${esc(B.slug)}"
      aria-label="${esc(B.name)}: ${esc(st.text || 'keine Zweige')}. ${auf ? 'Zuklappen' : 'Aufklappen'}">
      <rect x="${bx}" y="${y}" width="${bw}" height="${bh}" rx="${Math.round(bh / 2)}"/>
      <text x="${bx + 18}" y="${y + padY + Math.round(lhb * 0.8)}" font-size="${fb}" class="mu-bt">${esc(B.name)}</text>
      <text x="${bx + 18}" y="${y + padY + lhb + Math.round(lh2 * 0.78)}" font-size="${f2}" class="mu-bs">${esc(st.text)}</text>
      <path class="mu-pfeil" d="${auf ? `M${kx - 5} ${ky - 2}l5 5 5-5` : `M${kx - 2} ${ky - 5}l5 5-5 5`}"/></g>`);
    stammEnde = y + bh / 2;
    y += bh;
    if (!auf || !B.aeste.length) continue;
    y += Math.round(rem * 1.5);
    // Plätze je Reihe: links innen, rechts innen, links außen, rechts außen …
    const proReihe = spalten * 2;
    for (let i = 0; i < B.aeste.length; i += proReihe) {
      const reihe = B.aeste.slice(i, i + proReihe).map((a, j) => {
        const seite = j % 2 === 0 ? -1 : 1, tiefe = Math.floor(j / 2);
        const x = seite < 0 ? Math.round(xT - gapT / 2 - (tiefe + 1) * nw - tiefe * gapC) : Math.round(xT + gapT / 2 + tiefe * (nw + gapC));
        const z = zustand(S, a);
        const t1 = umbrich(a.titel, innen, f1, 650, 3, miss), t2 = umbrich(z.wort, innen, f2, z.art === 'da' ? 600 : 400, 2, miss);
        const h = Math.max(46, padY * 2 + t1.length * lh1 + 2 + t2.length * lh2);
        return { a, z, x, tiefe, t1, t2, h };
      });
      const rh = Math.max(...reihe.map((r) => r.h));
      for (const r of reihe) {
        const cx = r.x + nw / 2, y0 = y - 14 - r.tiefe * 6;
        zweige.push(`<path class="mu-zweig ${r.z.art}" d="M${xT} ${y0} C${Math.round(xT + (cx - xT) * 0.55)} ${y0} ${Math.round(cx)} ${y0 + 2} ${Math.round(cx)} ${y}"/>`);
        stammEnde = Math.max(stammEnde, y0);
        const label = `${r.a.titel}: ${r.z.e ? r.z.e.richtung : r.z.wort}`;
        let ty = y + padY;
        const tx = r.x + padX;
        const z1 = r.t1.map((l) => { ty += lh1; return `<tspan x="${tx}" y="${ty - Math.round(lh1 * 0.22)}">${esc(l)}</tspan>`; }).join('');
        ty += 2;
        const z2 = r.t2.map((l) => { ty += lh2; return `<tspan x="${tx}" y="${ty - Math.round(lh2 * 0.24)}">${esc(l)}</tspan>`; }).join('');
        teile.push(`<a class="mu-k mu-ast ${r.z.art}" href="#muster/ast/${esc(r.a.id)}" aria-label="${esc(label)}">
          <rect x="${r.x}" y="${y}" width="${nw}" height="${rh}" rx="12"/>
          <text font-size="${f1}" class="mu-t1">${z1}</text><text font-size="${f2}" class="mu-t2">${z2}</text></a>`);
      }
      y += rh + 24;
    }
    y -= 8;
  }
  const H = Math.ceil(y + 8);
  const stamm = `<path class="mu-stamm" d="M${xT} ${cyDu + rDu - 2} L${xT} ${Math.round(stammEnde)}"/>`;
  return `<svg class="mu-baum" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="group" aria-label="Dein Baum: Stamm „Du“, Hauptäste je Bereich, Zweige je Ast">
    ${stamm}${zweige.join('')}${teile.join('')}</svg>`;
}
export { slug };
