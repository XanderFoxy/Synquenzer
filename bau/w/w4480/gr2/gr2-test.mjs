// GR2 – ein gezielter Test: Stil-Bibliothek, Remix übersetzt eigene Noten (Bass-Lauf + Drums → Italo-Disco 70 %: Tonhöhen bleiben,
// Raster/Swing messbar), Stärke, Reggae One Drop, Walzer setzt 3/4 sauber (A/B), Speichern/Laden, REMIX in der Song-Leiste (hochkant +
// quer), Blatt (Kacheln, Stärke, Hören, Stilwechsel beim Abspielen), Einstiege (≡, Marken-Blatt), Genre-Fills (Übergänge, Werkzeugkasten).
import { chromium } from '/opt/node-tools/node_modules/playwright/index.mjs';
const file = process.argv[2], dir = process.argv[3];
const b = await chromium.launch();
const res = []; const ok = (name, cond, info) => { res.push({name, ok: !!cond, info}); };
const errs = [];
async function page(w, h) {
  const p = await b.newPage({viewport: {width: w, height: h}, hasTouch: true});
  p.on('pageerror', e => errs.push(String(e))); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  await p.goto('file://' + file); await p.waitForTimeout(1500);
  return p;
}
// Szene 1: eigener Bass-Lauf (2 Takte, synkopiert, lange Töne) + eigene Drums (Kick neben der Zählzeit, Ghost-Snare); Song = S1 + S2
const BASS = [[0, .75, 36, .9], [.77, .23, 36, .6], [1.52, .5, 43, .8], [2.25, .75, 41, .7], [3.02, 1, 39, .8], [4, 1.5, 36, .9], [5.73, .25, 48, .6], [6, .5, 46, .7], [6.71, 1.25, 43, .8]];   // eingespielt: nicht ganz im Raster
const build = (BASS) => {
  const D = window.SYNQUENZER;
  D.setClip(0, 0, {len: 2, notes: BASS.map(([t, d, n, v]) => ({t, d, n, v}))});
  D.setClip(4, 0, {len: 1, notes: [[0, 36, .95], [.75, 36, .6], [1, 38, .9], [1.75, 36, .7], [2.5, 36, .85], [3, 38, .9], [3.75, 38, .3]].map(([t, n, v]) => ({t, d: .1, n, v}))
    .concat([0, .5, 1, 1.5, 2, 2.5, 3, 3.5].map(t => ({t, d: .1, n: 42, v: .6})))});
  D.placePart('S1', 0, 'insert'); D.placePart('S2', D.song().bars, 'insert'); D.songView(true);
  return D.song().marks.length;
};
const p = await page(428, 926);
ok('Song mit eigenem Bass-Lauf + Drums (2 Teile)', await p.evaluate(build, BASS) === 2);
// 1) Stil-Bibliothek
const lib = await p.evaluate(() => { const G = window.SYNQUENZER.gr2; return {st: G.styles(), fills: G.fills(), gr1: window.SYNQUENZER.grStyles().map(x => x.name)}; });
const names = lib.st.map(x => x.name);
const need = ['Euro-Disco', 'Italo-Disco', 'Italo-Dance', 'Hi-NRG', 'Minimal Techno', 'Industrial/EBM', 'Dark Wave', 'Reggae One Drop', 'Country Train-Beat', 'Country Shuffle', 'Walzer 3/4', 'Synth-Pop', 'Soul-Pop 60er'];
ok('Stil-Bibliothek: alle verlangten Stile (17), „Detroit Pop“ heißt jetzt „Soul-Pop 60er“', need.every(n => names.includes(n)) && !names.includes('Detroit Pop') && !names.includes('Euro Disco') && lib.st.length === 17, names.join(', '));
ok('Grundmuster (GR1) kennt die neuen 4/4-Stile (15), Walzer/Shuffle nur im Remix', lib.gr1.length === 15 && lib.gr1.includes('Italo-Disco') && !lib.gr1.includes('Walzer 3/4'), lib.gr1.join(', '));
// 2) Übersetzen: Italo-Disco 70 % (Bass + Drums, ohne Song)
const tr = await p.evaluate(() => {
  const D = window.SYNQUENZER, G = D.gr2, bass = D.getClip(0, 0), dr = D.getClip(4, 0);
  return {bass: bass.notes, it: G.translate(bass, 'italo', 70, 'bass'), it30: G.translate(bass, 'italo', 30, 'bass'), it100: G.translate(bass, 'italo', 100, 'bass'),
    dr: dr.notes, dIt: G.translate(dr, 'italo', 70, 'dr'), dIt30: G.translate(dr, 'italo', 30, 'dr'),
    dReg: G.translate(dr, 'reggae', 100, 'dr'), dNjs: G.translate(dr, 'njs', 100, 'dr'), roles: [0, 1, 2, 4].map(t => G.role(t, 0)),
    skank: G.translate(D.getClip(2, 0), 'reggae', 100, 'comp')};
});
const pcs = ns => [...new Set(ns.map(n => n.n))].sort((x, y) => x - y);
const seq = ns => ns.map(n => n.n).filter((n, i, a) => i === 0 || a[i - 1] !== n);
const isSub = (s, o) => { let j = 0; for (const x of o) if (j < s.length && s[j] === x) j++; return j === s.length; };
const onGrid = ns => ns.every(n => Math.abs(n.t * 4 - Math.round(n.t * 4)) < 1e-3);
ok('Rollen erkannt: Bass · Sequenz · Fläche · Drums', tr.roles.join() === 'bass,seq,pad,dr', tr.roles.join());
ok('Italo 70 %: Motiv-Tonhöhen bleiben (nur eigene Töne, Reihenfolge der Tonwechsel gleich)', pcs(tr.it).every(n => pcs(tr.bass).includes(n)) && isSub(seq(tr.it.filter((n, i, a) => !i || a[i - 1].n !== n.n)), seq(tr.bass)) && pcs(tr.it).length >= pcs(tr.bass).length - 1,
  'vorher ' + seq(tr.bass).join(' ') + ' · nachher ' + seq(tr.it).join(' '));
ok('Italo 70 %: Raster des Stils (vorher eingespielt, nachher alle Anfänge auf geraden 16teln; 2,25 → 2), lange Töne im Galopp neu angeschlagen', !onGrid(tr.bass) && onGrid(tr.it) && tr.it.some(n => n.t === 2 && n.n === 41) && tr.it.filter(n => n.n === 39).length >= 3,
  tr.it.map(n => n.t + ':' + n.n).join(' '));
ok('Italo 70 %: Längen im Stil (kurzer Disco-Bass)', Math.max(...tr.it.map(n => n.d)) < Math.max(...tr.bass.map(n => n.d)) * .5, 'max d ' + Math.max(...tr.it.map(n => n.d)));
const kicks = ns => ns.filter(n => n.n === 36).map(n => n.t).join(',');
ok('Drums Italo 70 %: eigene Kicks rücken auf die Viertel (Four-to-the-floor), Ghost-Snare fällt weg, nur eigene Pads', kicks(tr.dIt) === '0,1,2,3' && !tr.dIt.some(n => n.n === 38 && n.t > 3.5) && tr.dIt.every(n => [36, 38, 42].includes(n.n)),
  kicks(tr.dIt) + ' | ' + tr.dIt.map(n => n.t + ':' + n.n).join(' '));
ok('Stärke wirkt: 30 % rückt nur anteilig (Kick 0,75 → zwischen 0,75 und 1), 70 % ganz', tr.dIt30.some(n => n.n === 36 && n.t > .75 && n.t < 1) && kicks(tr.dIt).includes('1'), kicks(tr.dIt30));
ok('Reggae One Drop 100 %: Bassdrum nur auf der Drei, Rim/Snare dort, Hats bleiben', kicks(tr.dReg) === '2' && tr.dReg.some(n => [37, 38].includes(n.n) && n.t === 2) && tr.dReg.filter(n => n.n === 42).length >= 6, tr.dReg.map(n => n.t + ':' + n.n).join(' '));
ok('Reggae-Skank: die Fläche wird kurz auf 2 und 4 angeschlagen', tr.skank.length && tr.skank.every(n => [1, 3].includes(n.t % 4) && n.d <= .3), tr.skank.map(n => n.t + '/' + n.d).slice(0, 8).join(' '));
const odd = tr.dNjs.filter(n => n.n === 42 && Math.abs((n.t % .5) - .25) < .1), sw = odd.length ? odd.reduce((s, n) => s + (n.t % .5) / .5, 0) / odd.length : 0;
ok('Swing messbar (New Jack Swing 100 %: Off-16tel bei 62 %)', !odd.length ? tr.dNjs.every(n => Math.abs((n.t % .5) - .25) > .1 || Math.abs((n.t % .5) / .5 - .62) < .01) : Math.abs(sw - .62) < .01, 'swing ' + sw.toFixed(3) + ' aus ' + odd.length);
// 3) Remix im Song: Italo-Disco 70 % → Versionen, A/B, Undo
const rx = await p.evaluate(() => {
  const D = window.SYNQUENZER, G = D.gr2, o = {};
  o.v1 = [D.getClip(0, 0), D.getClip(4, 0)].map(c => JSON.stringify(c));
  o.r = G.remix('italo', {k: 70}); o.undo = D.undoInfo().top; o.info = G.info({st: 'italo'});
  const own = D.song().own || {}; o.vers = Object.values(own).map(c => ({t: c.from.t, s: c.from.s, ver: c.ver, gr: c.gr, n: c.notes.length}));
  o.v1b = [D.getClip(0, 0), D.getClip(4, 0)].map(c => JSON.stringify(c));
  o.a = G.ab('a', {st: 'italo'}); o.infoA = G.info({st: 'italo'});
  o.b = G.ab('b', {st: 'italo'}); o.infoB = G.info({st: 'italo'});
  D.undo(); o.afterUndo = G.info({st: 'italo'}); D.redo(); o.afterRedo = G.info({st: 'italo'});
  return o;
});
ok('Remix Italo-Disco 70 %: Drums, Bass und weitere Spuren als neue Versionen (gr.u = 70)', rx.r.ok && rx.r.dr === 2 && rx.r.bass === 1 && rx.r.other >= 3 && rx.vers.every(v => v.gr && v.gr.s === 'italo' && v.gr.u === 70 && v.ver >= 2), JSON.stringify(rx.r));
ok('Original v1 bleibt unverändert, ein Undo-Schritt „Remix Italo-Disco 70 %“', JSON.stringify(rx.v1) === JSON.stringify(rx.v1b) && rx.undo.kind === 'song' && rx.undo.label === 'Remix Italo-Disco 70 %', JSON.stringify(rx.undo));
ok('A Original / B Remix / ↶ ↷', rx.a > 0 && rx.infoA.on === 0 && rx.b === rx.a && rx.infoB.onSt > 0 && rx.infoB.u === 70 && rx.afterUndo.on === 0 && rx.afterRedo.onSt > 0, JSON.stringify({a: rx.a, b: rx.b, A: rx.infoA.on, B: rx.infoB.onSt}));
// 4) Walzer 70 %: Teile in 3/4, Clips gefaltet; A zurück 4/4; B wieder 3/4
const wz = await p.evaluate(() => {
  const D = window.SYNQUENZER, G = D.gr2, o = {};
  o.r = G.remix('walzer', {k: 70}); o.marks = G.marksTs(); o.beats = barBeat(D.song().bars);
  const own = Object.values(D.song().own), wv = own.filter(c => c.gr && c.gr.s === 'walzer');
  o.wv = wv.map(c => ({t: c.from.t, ts: c.ts || null, len: c.len, max: Math.max(0, ...c.notes.map(n => n.t + 1e-9)), bad: c.notes.filter(n => n.t >= c.len * 3).length}));
  const wb = wv.find(c => c.from.t === 0); o.wbass = wb ? wb.notes.map(n => n.n) : [];
  const wd = wv.find(c => c.from.t === 4 && c.from.s === 0); o.wdr = wd ? wd.notes.map(n => n.t + ':' + n.n) : [];
  o.a = G.ab('a', {st: 'walzer'}); o.marksA = G.marksTs(); o.beatsA = barBeat(D.song().bars);
  o.b = G.ab('b', {st: 'walzer'}); o.marksB = G.marksTs(); o.beatsB = barBeat(D.song().bars);
  o.lanes = D.song().lanes.map(l => l.filter(e => e.bar === 2).map(e => ({own: !!e.own, ph: e.ph == null ? null : e.ph, re: e.re || 0})));
  return o;
});
ok('Walzer 70 %: beide Teile in 3/4, Song 4 Takte = 12 Schläge', wz.r.ok && wz.r.tsSet === 2 && wz.marks.every(m => m.ts === '3/4') && wz.beats === 12, JSON.stringify({r: wz.r, marks: wz.marks, beats: wz.beats}));
ok('Walzer: alle Versionen 3/4, Noten im 3/4-Raster (nichts hinter dem Clip-Ende)', wz.wv.length >= 7 && wz.wv.every(v => v.ts === '3/4' && !v.bad), JSON.stringify(wz.wv));
ok('Walzer: Bass behält seine Töne, Drums: Kick nur auf der Eins, Snare auf zwei und drei (Um-pa-pa)', wz.wbass.every(n => [36, 39, 41, 43, 46, 48].includes(n)) && wz.wdr.filter(x => x.endsWith(':36')).join() === '0:36' && wz.wdr.includes('1:38') && wz.wdr.includes('2:38'), wz.wbass.join(',') + ' | ' + wz.wdr.join(' '));
ok('Walzer A → 4/4 (16 Schläge), B → 3/4 (12 Schläge); Teilgrenze ohne Phasen-Versatz', wz.a > 0 && wz.marksA.every(m => !m.ts) && wz.beatsA === 16 && wz.b > 0 && wz.marksB.every(m => m.ts === '3/4') && wz.beatsB === 12 && wz.lanes.flat().every(e => e.ph == null),
  JSON.stringify({a: wz.a, b: wz.b, beatsA: wz.beatsA, beatsB: wz.beatsB, lanes: wz.lanes}));
// 5) Speichern / Laden (serialisieren → normalisieren → anwenden): gr.u und Taktart der Teile bleiben
const sl = await p.evaluate(() => {
  const D = window.SYNQUENZER, a = D.project();
  applyProject(normalizeProject(JSON.parse(JSON.stringify(a))), {});
  const bb = D.project(), canon = o => JSON.stringify(o, (k, v) => (v && typeof v === 'object' && !Array.isArray(v) ? Object.keys(v).sort().reduce((r, x) => (r[x] = v[x], r), {}) : v));
  return {eq: canon(a.song) === canon(bb.song), tracks: canon(a.tracks.map(t => t.clips)) === canon(bb.tracks.map(t => t.clips)), u: Object.values(bb.song.own).filter(c => c.gr && c.gr.u === 70).length, ts: bb.song.marks.map(m => m.ts || null)};
});
ok('Speichern/Laden: Song + Clips gleich (gr.u, 3/4-Teile bleiben)', sl.eq && sl.tracks && sl.u >= 7 && sl.ts.every(x => x === '3/4'), JSON.stringify(sl));
// 6) Song-Leiste hochkant: [⇋ REMIX] (≥ 44 px, nichts abgeschnitten), Blatt öffnen, Kacheln/Stärke/Hören, Stilwechsel beim Abspielen
await p.evaluate(() => { const G = window.SYNQUENZER.gr2; G.ab('a', {st: 'walzer'}); });
const bar = await p.evaluate(() => { const r = [...document.querySelectorAll('.sv-top > *')].filter(x => !x.hidden && getComputedStyle(x).display !== 'none').map(x => { const q = x.getBoundingClientRect(); return {c: x.className.split(' ').pop(), l: Math.round(q.left), r: Math.round(q.right), w: Math.round(q.width), h: Math.round(q.height), cut: x.scrollWidth > x.clientWidth + 1}; }); return r; });
const rxb = bar.find(x => x.c === 'sv-rx');
ok('Song-Leiste hochkant: [⇋ REMIX] neben [◆ ÜBERG.], alle Tasten ≥ 44 px, nichts abgeschnitten, passt in 428 px', rxb && bar.every(x => x.w >= 44 && x.h >= 44 && !x.cut && x.r <= 428), JSON.stringify(bar));
await p.tap('.sv-top > .sv-rx'); await p.waitForTimeout(300);
const sh = await p.evaluate(() => { const P = document.querySelector('.pop.gr2s'); if (!P) return null; const bs = [...P.querySelectorAll('button')].map(x => { const q = x.getBoundingClientRect(); return {t: x.textContent.slice(0, 16), w: Math.round(q.width), h: Math.round(q.height), vis: q.top >= 0 && q.bottom <= innerHeight + 1}; }); const x = P.querySelector('.ms-x').getBoundingClientRect(); return {n: bs.length, tiles: P.querySelectorAll('.gr2-t').length, small: bs.filter(q => q.h < 44 || q.w < 44), hid: bs.filter(q => !q.vis), x: {top: Math.round(x.top), right: Math.round(x.right)}, slider: !!P.querySelector('input.gr2-k')}; });
ok('REMIX-Blatt hochkant: 17 Stil-Kacheln, Stärke-Regler, Tasten ≥ 44 px, alles sichtbar, ✕ sichtbar', sh && sh.tiles === 17 && sh.slider && !sh.small.length && !sh.hid.length && sh.x.top >= 0 && sh.x.right <= 428, JSON.stringify(sh));
await p.tap('.gr2s [data-g2="st:hinrg"]'); await p.waitForTimeout(150);
await p.evaluate(() => { const i = document.querySelector('.gr2s input.gr2-k'); i.value = '60'; i.dispatchEvent(new Event('input', {bubbles: true})); i.dispatchEvent(new Event('change', {bubbles: true})); });
await p.waitForTimeout(150);
await p.screenshot({path: dir + '/gr2-remix-hochkant.png'});
const st1 = await p.evaluate(() => Object.assign(window.SYNQUENZER.gr2.state(), {on: window.SYNQUENZER.gr2.info({st: 'hinrg'}).on}));
ok('Kachel + Stärke-Regler wählen (Hi-NRG, 60 %), ohne Abspielen noch kein Remix', st1.st === 'hinrg' && st1.k === 60 && st1.on === 0, JSON.stringify(st1));
const nv0 = await p.evaluate(() => Object.keys(window.SYNQUENZER.song().own || {}).length);
await p.tap('.gr2s [data-g2="go"]'); await p.waitForTimeout(500);
const pl1 = await p.evaluate(() => ({play: !!(R.songPlay && R.playing), info: window.SYNQUENZER.gr2.info({st: 'hinrg'}), n: Object.keys(window.SYNQUENZER.song().own).length, go: document.querySelector('.gr2s [data-g2="go"]').textContent}));
ok('[▶ Hören]: erzeugt Hi-NRG 60 % und spielt den Song', pl1.play && pl1.info.onSt > 0 && pl1.info.u === 60 && /Stopp/.test(pl1.go), JSON.stringify(pl1));
await p.tap('.gr2s [data-g2="st:reggae"]'); await p.waitForTimeout(400);
await p.tap('.gr2s [data-g2="st:euro"]'); await p.waitForTimeout(400);
const pl2 = await p.evaluate(() => ({play: !!(R.songPlay && R.playing), eu: window.SYNQUENZER.gr2.info({st: 'euro'}), hi: window.SYNQUENZER.gr2.info({st: 'hinrg'}), n: Object.keys(window.SYNQUENZER.song().own).length}));
ok('Beim Abspielen: Stil-Kachel = sofort dieser Stil (ab dem nächsten Takt), keine neuen Versionen beim Durchprobieren', pl2.play && pl2.eu.onSt > 0 && pl2.hi.onSt === 0 && pl2.n === pl1.n, JSON.stringify({n0: nv0, n1: pl1.n, n2: pl2.n, eu: pl2.eu.onSt}));
await p.tap('.gr2s [data-g2="a"]'); await p.waitForTimeout(250);
const pa = await p.evaluate(() => window.SYNQUENZER.gr2.info({st: 'euro'}));
await p.tap('.gr2s [data-g2="b"]'); await p.waitForTimeout(250);
const pb = await p.evaluate(() => window.SYNQUENZER.gr2.info({st: 'euro'}));
await p.tap('.gr2s [data-g2="go"]'); await p.waitForTimeout(250);
const stop = await p.evaluate(() => !!(R.songPlay && R.playing));
ok('Tipps A → B beim Abspielen, dann ■ Stopp', pa.on === 0 && pb.onSt > 0 && !stop, JSON.stringify({a: pa.on, b: pb.onSt, stop}));
await p.tap('.gr2s [data-g2="x"]'); await p.waitForTimeout(200);
// Einstiege: ≡ › Song › Remix … und Marken-Blatt › Remix … (Teil)
const ent = await p.evaluate(() => {
  openMenu(); const btn = [...document.querySelectorAll('#menu button')].find(x => x.textContent.trim() === 'Remix …'); if (btn) btn.click(); const m = !!(UI.pop && UI.pop.name === 'gr2remix'); closePop(); if (typeof closeMenu === 'function') closeMenu();
  const D = window.SYNQUENZER; D.openMarkSheet(D.song().marks[1].id);
  const rb = document.querySelector('.gr1r [data-gr1="rx"]'); if (rb) rb.click();
  const st = D.gr2.state(), hd = UI.pop && UI.pop.el.querySelector('.ms-h span') ? UI.pop.el.querySelector('.ms-h span').textContent : '';
  return {menu: m, mark: !!(UI.pop && UI.pop.name === 'gr2remix'), part: st.part, hd};
});
ok('Einstiege: ≡ › Song › Remix … und Marken-Blatt › Remix … (nur dieser Teil) öffnen das REMIX-Blatt', ent.menu && ent.mark && ent.part && /Takt 3–4/.test(ent.hd), JSON.stringify(ent));
await p.evaluate(() => closePop());
// 7) Genre-Fills: ◆ ÜBERGÄNGE (Knopf Genre filtert), FX1 frei setzen, Werkzeugkasten
const fx = await p.evaluate(() => {
  const D = window.SYNQUENZER, o = {};
  o.lib = D.ueLib().filter(x => /^gr2f-/.test(x.id)).map(x => x.id);
  ueBar(true); D.gr2.set({ueg: 'reggae'}); uePaintBar();
  o.vis = [...document.querySelectorAll('.ue-tile')].filter(x => getComputedStyle(x).display !== 'none').map(x => x.dataset.id);
  o.chip = !!document.querySelector('.gr2-ueg');
  o.place = D.fllPlace('gr2f-reggae', 6); o.ue = (D.song().ue || []).map(e => e.src);
  o.bbFig = D.bb1.figs().filter(f => /^gr2b-/.test(f.id)).map(f => f.g);
  o.gens = D.bb1.genres();
  const bd = D.bb1.build(4, 0, 'gr2b-reggae', 'ver'); o.bb = bd ? bd.notes.filter(n => n.t >= 2).map(n => n.t + ':' + n.n) : null;
  return o;
});
ok('Genre-Fills: 17 Vorlagen in ◆ ÜBERGÄNGE, Knopf „Genre“ zeigt nur die des Stils', fx.lib.length === 17 && fx.chip && fx.vis.length === 1 && fx.vis[0] === 'gr2f-reggae', JSON.stringify({n: fx.lib.length, vis: fx.vis}));
ok('Genre-Fill frei gesetzt (FX1) und im Werkzeugkasten als Drums-Füller (neue Genres)', fx.place && fx.ue.includes('gr2f-reggae') && fx.bbFig.length === 16 && ['reggae', 'country', 'minimal', 'ebm', 'darkwave', 'italodance'].every(g => fx.gens.includes(g)) && fx.bb && fx.bb.some(x => x.endsWith(':45')),
  JSON.stringify({place: fx.place, figs: fx.bbFig.length, bb: fx.bb}));
await p.waitForTimeout(200);
await p.screenshot({path: dir + '/gr2-fills-hochkant.png'});
await p.evaluate(() => { window.SYNQUENZER.gr2.set({ueg: 'alle'}); ueBar(false); });
await p.close();

// quer 926 × 428: REMIX in der Spalte neben ◆ ÜBERG.; Blatt passt; 926 × 370 auch
for (const [w, h] of [[926, 428], [926, 370]]) {
  const q = await page(w, h);
  await q.evaluate(build, BASS);
  const side = await q.evaluate(() => { const g = s => { const e = document.querySelector('.sv-top > ' + s); const r = e.getBoundingClientRect(); return {l: Math.round(r.left), t: Math.round(r.top), w: Math.round(r.width), h: Math.round(r.height), cut: e.scrollWidth > e.clientWidth + 1}; }; return {ue: g('.sv-ue'), rx: g('.sv-rx'), home: g('.sv-home'), sw: g('.sv-sw')}; });
  ok(`quer ${w}×${h}: [◆ ÜBERG.] [⇋ REMIX] in einer Zeile unter [CLIPS] [⏮]`, side.ue.t === side.rx.t && side.rx.l > side.ue.l && side.home.t === side.sw.t && side.ue.t > side.sw.t && side.rx.w >= 44 && !side.rx.cut, JSON.stringify(side));
  await q.tap('.sv-top > .sv-rx'); await q.waitForTimeout(250);
  await q.evaluate(() => { const D = window.SYNQUENZER; D.gr2.set({st: 'walzer', k: 70}); D.gr2.remix('walzer', {k: 70}); const P = UI.pop.el; gr2Paint(P); });
  await q.waitForTimeout(250);
  const shq = await q.evaluate(() => { const P = document.querySelector('.pop.gr2s'); const r = P.getBoundingClientRect(); const bs = [...P.querySelectorAll('button')].map(x => { const q = x.getBoundingClientRect(); return {t: x.textContent.slice(0, 12), w: Math.round(q.width), h: Math.round(q.height), vis: q.top >= 0 && q.bottom <= innerHeight + 1}; }); const x = P.querySelector('.ms-x').getBoundingClientRect(); return {top: Math.round(r.top), bottom: Math.round(r.bottom), small: bs.filter(q => q.h < 44 || q.w < 44), hid: bs.filter(q => !q.vis), x: {top: Math.round(x.top), right: Math.round(x.right)}, onTile: P.querySelector('.gr2-t.on b').textContent, pl: [...P.querySelectorAll('.gr2-t.pl b')].map(b => b.textContent)}; });
  ok(`REMIX-Blatt quer ${w}×${h}: passt ganz ins Bild, Tasten ≥ 44 px, ✕ sichtbar, Walzer spielt`, shq.top >= 0 && shq.bottom <= h && !shq.small.length && !shq.hid.length && shq.x.top >= 0 && shq.x.right <= w && shq.onTile === 'Walzer 3/4' && shq.pl.includes('Walzer 3/4'), JSON.stringify(shq));
  if (h === 428) await q.screenshot({path: dir + '/gr2-remix-quer.png'});
  if (h === 428) {   // Grundmuster ▾ (GR1) mit den neuen Stilen: als Raster, passt quer
    await q.evaluate(() => { closePop(); const D = window.SYNQUENZER; D.songView(false); D.clipMenuItems(4, 0); });
    await q.waitForTimeout(250);
    const gm = await q.evaluate(() => { const b = [...document.querySelectorAll('#clipSheet button')].find(x => /Grundmuster/.test(x.textContent)); if (!b) return null; b.click(); const P = document.querySelector('.pop.gr1pat'); if (!P) return null; const r = P.getBoundingClientRect(), bs = [...P.querySelectorAll('button[data-gs]')]; return {n: bs.length, top: Math.round(r.top), bottom: Math.round(r.bottom), small: bs.filter(x => x.getBoundingClientRect().height < 44).length}; });
    ok('Clip-Blatt › Grundmuster ▾ quer: 15 Stile, ganz im Bild, ≥ 44 px', gm && gm.n === 15 && gm.top >= 0 && gm.bottom <= h && !gm.small, JSON.stringify(gm));
    await q.screenshot({path: dir + '/gr2-grundmuster-quer.png'});
  }
  await q.close();
}
await b.close();
for (const x of res) console.log((x.ok ? 'OK   ' : 'FAIL ') + x.name + (x.ok ? '' : '  → ' + (x.info || '')));
console.log('Fehler (Seite/Konsole):', JSON.stringify(errs));
console.log(res.filter(x => x.ok).length + '/' + res.length + ' OK');
