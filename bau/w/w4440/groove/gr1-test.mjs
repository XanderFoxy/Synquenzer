// GR1 – ein gezielter Test: Song mit 2 Teilen → Remix New Jack Swing → Drum-Version neu, eigene Kit-Pads, Swing messbar; A/B; Zwingen;
// Small/Full (Clip-Blatt, Vorschlag, Teil-Schalter); Grundmuster; Song transponieren; Undo; Speichern/Laden; 4 Fotos (hochkant + quer).
import { chromium } from '/opt/node-tools/node_modules/playwright/index.mjs';
const file = process.argv[2], dir = process.argv[3];
const b = await chromium.launch();
const res = []; const ok = (name, cond, info) => { res.push({name, ok: !!cond, info}); };
const errs = [];
async function page(w, h) {
  const p = await b.newPage({viewport: {width: w, height: h}});
  p.on('pageerror', e => errs.push(String(e))); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  await p.goto('file://' + file); await p.waitForTimeout(1500);
  return p;
}
// a song with 2 parts (Szene 1, Szene 2)
const build = () => { const D = window.SYNQUENZER; D.placePart('S1', 0, 'insert'); D.placePart('S2', D.song().bars, 'insert'); D.songView(true); return D.song(); };

const p = await page(428, 926);
const s0 = await p.evaluate(build);
ok('Song mit 2 Teilen', s0.marks.length === 2, s0.marks.map(m => m.part + '@' + m.a + '+' + m.len).join(' '));
const r = await p.evaluate(() => {
  const D = window.SYNQUENZER, out = {};
  out.kitBefore = JSON.stringify(D.getSound ? D.getSound(4) : null);
  out.v1Before = [D.getClip(4, 0), D.getClip(4, 1), D.getClip(0, 0)];
  out.remix = D.grRemix('njs', {z: 0});
  const sg = D.song(), own = sg.own || {};
  out.vers = Object.entries(own).map(([id, c]) => ({id, t: c.from.t, s: c.from.s, ver: c.ver, gr: c.gr, n: c.notes.length}));
  out.lane4 = sg.lanes[4];
  const dv = Object.values(own).find(c => c.from.t === 4 && c.from.s === 0 && c.gr && c.gr.s === 'njs');
  out.dv = dv;
  out.kitAfter = JSON.stringify(D.getSound ? D.getSound(4) : null);
  out.v1After = [D.getClip(4, 0), D.getClip(4, 1), D.getClip(0, 0)];
  out.info = D.grRemixInfo({st: 'njs'});
  out.undoTop = D.undoInfo().top;
  return out;
});
ok('Remix NJS: Drum- und Bass-Versionen', r.remix.ok && r.remix.dr >= 2 && r.remix.bass >= 1, JSON.stringify(r.remix));
ok('Drum-Version neu (v2, gr njs, Quelle v1)', !!r.dv && r.dv.ver >= 2 && r.dv.gr.v === 1, r.dv && JSON.stringify({ver: r.dv.ver, gr: r.dv.gr}));
const GMS = new Set([36, 38, 37, 39, 42, 46, 45, 47, 50, 49, 56, 70]);
ok('nur Pads des eigenen Kits, Kit unverändert', r.dv && r.dv.notes.every(n => GMS.has(n.n)) && r.kitBefore === r.kitAfter, r.dv && [...new Set(r.dv.notes.map(n => n.n))].join(','));
ok('Backbeat nimmt die Pads, die der Clip benutzt (Snare 38 + Clap 39)', r.dv && r.dv.notes.some(n => n.n === 38) && r.dv.notes.some(n => n.n === 39));
// Swing: the 2nd 16th of every 8th pair sits at 0.31 (62 %)
const odd = r.dv ? r.dv.notes.filter(n => n.n === 42 && Math.abs((n.t % .5) - .25) < .1) : [];
const sw = odd.length ? odd.reduce((s, n) => s + (n.t % .5) / .5, 0) / odd.length : 0;
ok('Swing messbar (Hi-Hat-Off-Sechzehntel ≈ 62 %)', Math.abs(sw - .62) < .005, 'swing ' + sw.toFixed(3) + ' aus ' + odd.length + ' Schlägen');
ok('Original v1 bleibt unverändert', JSON.stringify(r.v1Before) === JSON.stringify(r.v1After));
ok('Drum-Spur spielt die Remix-Version', r.lane4.some(e => e.own), JSON.stringify(r.lane4));
ok('Ein Undo-Schritt „Remix …“', r.undoTop && r.undoTop.kind === 'song' && /Remix New Jack Swing/.test(r.undoTop.label), JSON.stringify(r.undoTop));
// bass: roots from the original clip (Synth 1 = bass, scene 1: C2 …)
const bv = r.vers.find(v => v.gr && v.t !== 4);
ok('Bass-Version (Synth 1) mit Stil-Rhythmus', !!bv, JSON.stringify(r.vers));
const ab = await p.evaluate(() => {
  const D = window.SYNQUENZER, o = {};
  o.a = D.grAB('a', {st: 'njs'}); o.laneA = D.song().lanes[4]; o.infoA = D.grRemixInfo({st: 'njs'});
  o.b = D.grAB('b', {st: 'njs'}); o.laneB = D.song().lanes[4]; o.infoB = D.grRemixInfo({st: 'njs'});
  return o;
});
ok('A = Original (keine Version mehr auf der Drum-Spur)', ab.a > 0 && !ab.laneA.some(e => e.own) && ab.infoA.on === 0, JSON.stringify(ab.laneA));
ok('B = Remix zurück', ab.b === ab.a && ab.laneB.some(e => e.own) && ab.infoB.canB === 0, JSON.stringify(ab.infoB));
// Zwingen 100 %: the other tracks get versions on the NJS grid
const z = await p.evaluate(() => {
  const D = window.SYNQUENZER, r = D.grRemix('njs', {z: 100}), sg = D.song();
  const zv = Object.values(sg.own).filter(c => c.gr && c.gr.z === 100);
  const offGrid = zv.flatMap(c => c.notes).filter(n => { const k = Math.round(n.t / .25), q = k * .25 + (k & 1 ? .06 : 0); return Math.abs(n.t - q) > 1e-3; });
  return {r, nz: zv.length, tracks: [...new Set(zv.map(c => c.from.t))], offGrid: offGrid.length};
});
ok('Zwingen 100 %: übrige Spuren auf Raster + Swing', z.r.ok && z.nz > 0 && z.offGrid === 0, JSON.stringify(z));
const z0 = await p.evaluate(() => { const D = window.SYNQUENZER, r = D.grRemix('njs', {z: 0}), sg = D.song(); return {r, playZ: sg.lanes.some((l, t) => l.some(e => e.own && sg.own[e.own].gr && sg.own[e.own].gr.z))}; });
ok('Zwingen 0 % = übrige Spuren unverändert', !z0.playZ, JSON.stringify(z0));
const un = await p.evaluate(() => {
  const D = window.SYNQUENZER; const before = JSON.stringify(D.song().lanes);
  D.undo(); const mid = JSON.stringify(D.song().lanes); D.redo(); const after = JSON.stringify(D.song().lanes);
  return {back: before !== mid, again: before === after};
});
ok('↶ / ↷ eines Remix', un.back && un.again, JSON.stringify(un));
// Small / Full
const sf = await p.evaluate(() => {
  const D = window.SYNQUENZER, o = {}, m = D.song().marks;
  D.grAB('a', {st: 'njs'});                                    // drums back to v1
  o.mark = D.grClipSf(4, 0, 'f'); o.clip = D.getClip(4, 0).sf;
  o.vs = D.grVorschlag(m[0].id);
  o.small = D.grMarkSf(m[0].id, 's'); const sg = D.song(), l = sg.lanes[4];
  const e0 = l.filter(e => e.bar >= m[0].a && e.bar < m[0].a + m[0].len);
  o.playSmall = e0.length && e0.every(e => e.own && sg.own[e.own].sf === 's');
  o.infoS = D.grMarkInfo(m[0].id);
  o.full = D.grMarkSf(m[0].id, 'f'); o.infoF = D.grMarkInfo(m[0].id);
  const thin = Object.values(D.song().own).find(c => c.sf === 's'), v1 = D.getClip(4, 0);
  o.thinN = thin ? thin.notes.length : -1; o.v1N = v1.notes.length;
  o.other = D.grMarkInfo(m[1].id);
  return o;
});
ok('Clip-Blatt: Szenen-Clip als Full markiert', sf.mark && sf.clip === 'f');
ok('Vorschlag: ausgedünnte Version als Small', sf.vs && sf.vs.some(x => x.f === 's' && x.neu) && sf.thinN > 0 && sf.thinN < sf.v1N, JSON.stringify(sf.vs) + ' ' + sf.thinN + '/' + sf.v1N);
ok('Teil-Schalter Small spielt die Small-Version', sf.small.ok && sf.playSmall && sf.infoS.cur === 's', JSON.stringify(sf.infoS));
ok('Teil-Schalter Full zurück auf v1', sf.full.ok && sf.infoF.cur === 'f', JSON.stringify(sf.infoF));
// Grundmuster (Drums Szene 3 leer → neu; Bass Synth 1 Szene 1)
const gm = await p.evaluate(() => {
  const D = window.SYNQUENZER, o = {};
  o.d = D.grPattern(4, 2, 'euro'); const c = D.getClip(4, 2); o.dn = c ? c.notes.length : 0; o.kick = c ? c.notes.filter(n => n.n === 36).map(n => n.t) : [];
  o.u = D.undoInfo().top;
  const b0 = D.getClip(0, 0); o.b = D.grPattern(0, 0, 'euro'); const b1 = D.getClip(0, 0);
  o.bassRoots = [...new Set(b1.notes.map(n => n.n))].sort(); o.bassBefore = [...new Set(b0.notes.map(n => n.n))].sort();
  D.undo(); o.bassUndo = JSON.stringify(D.getClip(0, 0)) === JSON.stringify(b0);
  return o;
});
ok('Grundmuster Drums (leere Szene): Four-to-the-floor', gm.d && JSON.stringify(gm.kick) === '[0,1,2,3]' && gm.u.label === 'Grundmuster Euro Disco', JSON.stringify(gm));
ok('Grundmuster Bass: Grundtöne aus dem Clip, ↶ holt ihn zurück', gm.b && gm.bassRoots.length >= 2 && gm.bassUndo, JSON.stringify({r: gm.bassRoots, b: gm.bassBefore}));
// Song transponieren
const xp = await p.evaluate(() => {
  const D = window.SYNQUENZER, o = {};
  o.i0 = D.grXpInfo(); o.up = D.grXp(2); o.i1 = D.grXpInfo(); o.xp = D.song().xp;
  o.dn = D.grXp(-2); o.i2 = D.grXpInfo(); o.xp2 = D.song().xp || [];
  o.big = D.grXp(13);
  D.grXp(3);
  return o;
});
ok('Song transponieren +2 / −2 (song.xp)', xp.up && xp.i1.base === 2 && xp.i1.uniform && xp.dn && xp.i2.base === 0 && !xp.xp2.length && !xp.big, JSON.stringify(xp));
// Speichern / Laden (serialize → normalize → apply), deep-equal song + clips
const sl = await p.evaluate(() => {
  const D = window.SYNQUENZER, a = D.project();
  applyProject(normalizeProject(JSON.parse(JSON.stringify(a))), {});
  const bb = D.project();
  const canon = o => JSON.stringify(o, (k, v) => (v && typeof v === 'object' && !Array.isArray(v) ? Object.keys(v).sort().reduce((r, x) => (r[x] = v[x], r), {}) : v));
  return {songEq: canon(a.song) === canon(bb.song), tracksEq: canon(a.tracks.map(t => t.clips)) === canon(bb.tracks.map(t => t.clips)),
    sf: bb.tracks[4].clips[0].sf, gr: Object.values(bb.song.own).filter(c => c.gr).length, xp: bb.song.xp};
});
ok('Speichern/Laden: Song + Clips gleich (sf, gr, xp bleiben)', sl.songEq && sl.tracksEq && sl.sf === 'f' && sl.gr > 0 && sl.xp && sl.xp[0].semi === 3, JSON.stringify(sl));
// photos: Marken-Blatt (hochkant), Remix-Blatt (hochkant)
await p.evaluate(() => { const D = window.SYNQUENZER; D.openMarkSheet(D.song().marks[0].id); });
await p.waitForTimeout(300);
const markRow = await p.evaluate(() => { const r = document.querySelector('.gr1r'); if (!r) return null; const bs = [...r.querySelectorAll('button')].map(x => { const q = x.getBoundingClientRect(); return {t: x.textContent, w: Math.round(q.width), h: Math.round(q.height), cut: x.scrollWidth > x.clientWidth + 1}; }); const x = document.querySelector('.msheet .ms-x').getBoundingClientRect(); return {bs, x: {top: x.top, right: x.right}}; });
ok('Marken-Blatt: Zeile Rhythmus, Tasten ≥ 44 px, nichts abgeschnitten, ✕ sichtbar', markRow && markRow.bs.every(x => x.h >= 44 && x.w >= 44 && !x.cut) && markRow.x.top >= 0 && markRow.x.right <= 428, JSON.stringify(markRow));
await p.screenshot({path: dir + '/gr1-marke-hochkant.png'});
await p.evaluate(() => { window.SYNQUENZER.grSetUi({st: 'njs', z: 25}); window.SYNQUENZER.grRemixOpen(); });
await p.waitForTimeout(300);
const rx = await p.evaluate(() => { const P = document.querySelector('.gr1sheet'); const bs = [...P.querySelectorAll('button:not(.ms-x)')].map(x => { const q = x.getBoundingClientRect(); return {t: x.textContent, h: Math.round(q.height), w: Math.round(q.width), cut: x.scrollWidth > x.clientWidth + 1}; }); const q = P.getBoundingClientRect(), x = P.querySelector('.ms-x').getBoundingClientRect(); return {bs, top: q.top, bottom: q.bottom, x: {top: x.top, right: x.right}}; });
ok('Remix-Blatt hochkant: Tasten ≥ 44 px, ✕ sichtbar', rx.bs.every(x => x.h >= 44 && x.w >= 44 && !x.cut) && rx.x.top >= 0 && rx.x.right <= 428 && rx.bottom <= 926, JSON.stringify(rx).slice(0, 600));
await p.screenshot({path: dir + '/gr1-remix-hochkant.png'});
// echte Tipps im Blatt während ▶ SONG läuft: Remix erzeugen → A → B (je ab dem nächsten Takt), dann Stopp
await p.evaluate(() => { const D = window.SYNQUENZER; D.songPlay(0); });
await p.waitForTimeout(400);
await p.click('.gr1sheet [data-gr="go"]'); await p.waitForTimeout(250);
const t1 = await p.evaluate(() => window.SYNQUENZER.grRemixInfo({st: 'njs'}));
await p.click('.gr1sheet [data-gr="a"]'); await p.waitForTimeout(250);
const t2 = await p.evaluate(() => window.SYNQUENZER.grRemixInfo({st: 'njs'}));
await p.click('.gr1sheet [data-gr="b"]'); await p.waitForTimeout(900);
const t3 = await p.evaluate(() => { const D = window.SYNQUENZER, i = D.grRemixInfo({st: 'njs'}); D.songPlay(false); D.stop(); return i; });
ok('Tipps im Remix-Blatt beim Abspielen: erzeugen → A → B', t1.onSt > 0 && t2.on === 0 && t3.onSt > 0 && t3.canB === 0, JSON.stringify({t1, t2, t3}));
// Menü › Song und Drum-Editor › Muster ▾ › Stil-Grundmuster
const ent = await p.evaluate(() => {
  closePop(); openMenu(); const mb = [...document.querySelectorAll('#menu button')].map(x => x.textContent.trim()); closeMenu();
  const D = window.SYNQUENZER; D.selectTrack(4); D.openEditor(); const a = document.querySelector('#drumSheet') || document.body; openPatterns(a);
  const pk = !!document.querySelector('.pop [data-gr1p]'); closePop();
  return {remix: mb.includes('Remix …'), xp: mb.includes('Transponieren …'), pk};
});
ok('Einstiege: Menü › Song [Remix …] [Transponieren …], Muster ▾ › Stil-Grundmuster', ent.remix && ent.xp && ent.pk, JSON.stringify(ent));
await p.close();

// quer: Remix-Blatt + Clip-Blatt der Drum-Spur
const q = await page(926, 428);
await q.evaluate(build);
await q.evaluate(() => { const D = window.SYNQUENZER; D.grRemix('garage', {z: 50}); D.grRemixOpen(); });
await q.waitForTimeout(300);
const rxl = await q.evaluate(() => { const P = document.querySelector('.gr1sheet'); const bs = [...P.querySelectorAll('button:not(.ms-x)')].map(x => { const r = x.getBoundingClientRect(); return {t: x.textContent, h: Math.round(r.height), w: Math.round(r.width), cut: x.scrollWidth > x.clientWidth + 1}; }); const r = P.getBoundingClientRect(), x = P.querySelector('.ms-x').getBoundingClientRect(); return {bs, top: r.top, bottom: r.bottom, x: {top: x.top, right: x.right}}; });
ok('Remix-Blatt quer: Tasten ≥ 44 px, ✕ sichtbar, passt ins Bild', rxl.bs.every(x => x.h >= 44 && x.w >= 44 && !x.cut) && rxl.x.top >= 0 && rxl.x.right <= 926 && rxl.top >= 0, JSON.stringify(rxl).slice(0, 600));
const pre = await q.evaluate(() => ({on: document.querySelector('.gr1sheet .gr1-st .on').textContent, b: document.querySelector('.gr1sheet [data-gr="b"]').classList.contains('on'), z: document.querySelector('.gr1sheet .gr1-zr .on').textContent}));
ok('Blatt zeigt Stil und Zwingen, die spielen (Garage 2-Step, 50 %, B an)', pre.on === 'Garage 2-Step' && pre.b && pre.z === '50 %', JSON.stringify(pre));
await q.screenshot({path: dir + '/gr1-remix-quer.png'});
await q.evaluate(() => { const D = window.SYNQUENZER; document.querySelector('.gr1sheet [data-gr="x"]').click(); D.songView(false); D.clipMenuItems(4, 0); });
await q.waitForTimeout(300);
const cl = await q.evaluate(() => { const bs = [...document.querySelectorAll('#clipSheet button')].filter(x => /Grundmuster|Small|Full/.test(x.textContent)).map(x => { const r = x.getBoundingClientRect(); return {t: x.textContent, h: Math.round(r.height), w: Math.round(r.width), vis: r.bottom <= innerHeight && r.top >= 0}; }); const x = document.querySelector('#clipSheet .sh-x').getBoundingClientRect(); return {bs, x: {top: x.top, right: x.right, bottom: x.bottom}}; });
ok('Clip-Blatt quer: [Grundmuster ▾] und Small │ Full, ≥ 44 px, ✕ sichtbar', cl.bs.length === 3 && cl.bs.every(x => x.h >= 44 && x.w >= 44) && cl.x.top >= 0 && cl.x.right <= 926, JSON.stringify(cl));
await q.screenshot({path: dir + '/gr1-clipblatt-quer.png'});
await q.close();
await b.close();
for (const x of res) console.log((x.ok ? 'OK   ' : 'FAIL ') + x.name + (x.ok ? '' : '  → ' + (x.info || '')));
console.log('Fehler (Seite/Konsole):', JSON.stringify(errs));
console.log(res.filter(x => x.ok).length + '/' + res.length + ' OK');
