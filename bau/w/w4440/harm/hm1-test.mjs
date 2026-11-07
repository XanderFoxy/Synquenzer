// HM1 – ein gezielter Test: Glätten, Skalen-/Akkord-Sperre beim Wischen, Lauf verlängern, Gegenstimme, Akkordvorschläge, Undo, Speichern/Laden
// node hm1-test.mjs <index.html> <Ausgabe-Ordner>
import { chromium } from '/opt/node-tools/node_modules/playwright/index.mjs';
const file = process.argv[2], out = process.argv[3] || '.';
const res = []; const ok = (name, cond, info) => { res.push({name, ok: !!cond, info}); console.log((cond ? 'OK  ' : 'FEHLER ') + name + (info !== undefined ? '  ' + JSON.stringify(info) : '')); };
const b = await chromium.launch();
const errs = [];
async function page(w, h) {
  const p = await b.newPage({viewport: {width: w, height: h}, hasTouch: true, isMobile: true, deviceScaleFactor: 2});
  p.on('pageerror', e => errs.push(String(e))); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  await p.goto('file://' + file); await p.waitForTimeout(1500);
  return p;
}
const E = (p, f, a) => p.evaluate(f, a);
const p = await page(428, 926);
await E(p, () => { document.body.dispatchEvent(new PointerEvent('pointerdown', {bubbles: true})); });

// ---------- Daten: 4 Takte C | Am | F | G (Bass, Fläche, Lauf mit Durchgang) auf Synth 1 (Spur 0), Szene 5 ----------
const prog = [[0, 'C', 48, [60, 64, 67]], [4, 'Am', 45, [57, 60, 64]], [8, 'F', 41, [53, 57, 60]], [12, 'G', 43, [55, 59, 62]]];
const notes = [];
for (const [t, , bass, ch] of prog) {
  notes.push({t, d: 4, n: bass, v: .9});
  for (const n of ch) notes.push({t, d: 2, n, v: .6});
  const top = ch[2] + 12; notes.push({t: t + 2, d: .5, n: top, v: .8}, {t: t + 2.5, d: .5, n: top + 1 + (t === 4 ? 0 : 1), v: .7}, {t: t + 3, d: 1, n: top + 2, v: .8});   // Lauf mit Nachbarton
}
await E(p, ns => { const A = window.SYNQUENZER; A.setClip(0, 4, {len: 4, key: {root: 0, scale: 'ionian', src: 'user'}, notes: ns}); }, notes);
const segs = await E(p, () => window.SYNQUENZER.hm1.segs(0, 4, 'bar'));
ok('1 Glätten: Akkorde je Takt erkannt C · Am · F · G', segs.map(s => s.name).join(' ') === 'C Am F G', segs.map(s => s.name));
const half = await E(p, () => window.SYNQUENZER.hm1.segs(0, 4, 'half').length);
ok('1 Glätten: ½ Takt = 8 Stücke', half === 8, half);
const sm = await E(p, () => window.SYNQUENZER.hm1.smooth(0, 4, 'bar'));
const rowT = await E(p, () => { const A = window.SYNQUENZER; A.setChordRow('S5', {len: 4, ch: ['C', 'Am', 'F', 'G'].map((x, k) => ({b: 4 * k, tg: {kind: 'chord', root: [0, 9, 5, 7][k], quality: k === 1 ? 'min' : 'maj'}}))}); const r = {segs: A.hm1.segs(0, 4, 'row').map(g => g.name).join(' '), sm: A.hm1.smooth(0, 4, 'row').map(n => n.n)}; A.setChordRow('S5', null); return r; });
ok('1 Glätten aus der Akkord-Zeile: gleiche Akkorde, gleiches Grundmuster', rowT.segs === 'C Am F G' && rowT.sm.join(',') === sm.map(n => n.n).join(','), rowT.segs);
const inC = n => [0, 2, 4, 5, 7, 9, 11].includes(((n % 12) + 12) % 12);
ok('1 Glätten: alle Töne in C-Dur (stufentreu)', sm.every(n => inC(n.n)), sm.filter(n => !inC(n.n)).map(n => n.n));
const pcsBar = k => [...new Set(sm.filter(n => n.t >= 4 * k && n.t < 4 * k + 2 && n.d >= 2).map(n => n.n % 12))].sort((a, b) => a - b).join(',');
ok('1 Glätten: jeder Takt liegt auf der Grundstufe (C-E-G)', [0, 1, 2, 3].every(k => pcsBar(k) === '0,4,7'), [0, 1, 2, 3].map(pcsBar));
const bassN = sm.filter(n => n.d === 4).map(n => n.n);
ok('1 Glätten: Bass auf C, höchstens ±6 Halbtöne gerückt', bassN.every(n => n % 12 === 0) && bassN.every((n, k) => Math.abs(n - prog[k][2]) <= 6), bassN);
// Rückweg: unter dem Akkord des Takts klingt das Grundmuster wie gespielt (Akkordtöne exakt)
const back = await E(p, ({sm, prog}) => { const A = window.SYNQUENZER, key = {root: 0, scale: 'ionian'}; return sm.map(n => { const k = Math.floor(n.t / 4); return A.hm1.mapUnder(n.n, key, prog[k][1]); }); }, {sm, prog});
const orig = notes.slice().sort((a, b) => a.t - b.t);
const smS = sm.map((n, i) => ({...n, b: back[i]}));
const chordTones = smS.filter(n => n.d >= 2);
const origCT = orig.filter(n => n.d >= 2);
ok('1 Glätten: unter C · Am · F · G klingt es wieder wie gespielt', chordTones.every(n => origCT.some(o => Math.abs(o.t - n.t) < 1e-6 && o.n === n.b)), chordTones.map(n => n.b));
const selR = await E(p, () => { const A = window.SYNQUENZER, c = A.getClip(0, 4), idx = c.notes.map((n, i) => (n.t === 4 ? i : -1)).filter(i => i >= 0); return {idx, c: c.notes, s: A.hm1.smooth(0, 4, 'bar', idx)}; });
ok('1 Glätten mit Auswahl: nur gewählte Noten (Takt 2) rücken', selR.idx.length === 4 && selR.s.every((n, i) => (selR.idx.includes(i) ? n.n !== selR.c[i].n || n.n % 12 === 0 : n.n === selR.c[i].n)), selR.s.map(n => n.n));

const minor = await E(p, () => { const A = window.SYNQUENZER, ns = []; for (const [t, ch, bs] of [[0, [57, 60, 64], 45], [4, [53, 57, 60], 41], [8, [60, 64, 67], 48], [12, [55, 59, 62], 43]]) { ns.push({t, d: 4, n: bs, v: .9}); for (const n of ch) ns.push({t, d: 2, n, v: .6}); ns.push({t: t + 2, d: 1, n: ch[2] + 12, v: .8}); }
  A.setClip(1, 3, {len: 4, key: {root: 9, scale: 'aeolian', src: 'user'}, notes: ns}); const sm = A.hm1.smooth(1, 3, 'bar');
  const r = {segs: A.hm1.segs(1, 3, 'bar').map(g => g.name).join(' '), pcs: [0, 1, 2, 3].map(k => [...new Set(sm.filter(n => n.t >= 4 * k && n.t < 4 * k + 2 && n.d >= 2).map(n => n.n % 12))].sort((a, b) => a - b).join(','))}; A.setClip(1, 3, null); return r; });
ok('1 Glätten in Moll: Am · F · C · G → jeder Takt auf i (A-C-E)', minor.segs === 'Am F C G' && minor.pcs.every(x => x === '0,4,9'), minor);
// UI: Noten-Editor → [Harmonie] → Vorschau → Als Clip (+ Akkord-Zeile) – ein Undo-Schritt
await E(p, () => window.SYNQUENZER.openRoll(0, 4)); await p.waitForTimeout(400);
const hb = await E(p, () => { const b = [...document.querySelectorAll('#rollSheet .pr-bar.pra button')].find(x => x.textContent === 'Harmonie'); if (!b) return null; b.scrollIntoView({inline: 'center'}); const a = b.parentNode, r = b.getBoundingClientRect(), cx = r.left + r.width / 2;
  const ar = a.getBoundingClientRect(), hitTop = document.elementFromPoint(cx, ar.top + .5) === b, hitBot = document.elementFromPoint(cx, ar.bottom - .5) === b;
  const vis = [...a.children].filter(x => !x.hidden && x.tagName === 'BUTTON'); return {last: vis[vis.length - 1] === b, h: r.height, hit: hitTop && hitBot ? ar.height : r.height, w: r.width}; });
ok('Noten-Editor: [Harmonie] am Ende der Aktionsleiste, Trefferfläche ≥ 44 px', hb && hb.last && hb.hit >= 44 && hb.w >= 44, hb);
await E(p, () => { const b = [...document.querySelectorAll('#rollSheet .pr-bar.pra button')].find(x => x.textContent === 'Harmonie'); b.scrollIntoView(); b.click(); }); await p.waitForTimeout(300);
const st0 = await E(p, () => window.SYNQUENZER.hm1.state());
ok('Harmonie-Blatt offen (Reiter Glätten)', st0.open && st0.tab === 'glatt', st0);
const geo = await E(p, () => { const P = document.querySelector('.pop.hm1p'), x = P.querySelector('.hm1-x').getBoundingClientRect(), bs = [...P.querySelectorAll('button')].filter(b => b.offsetParent).map(b => b.getBoundingClientRect()); return {x: [x.left, x.top, x.right, x.bottom], vw: innerWidth, vh: innerHeight, minH: Math.min(...bs.map(r => r.height)), minW: Math.min(...bs.map(r => r.width)), over: P.scrollWidth > P.clientWidth + 1, ph: P.getBoundingClientRect().height}; });
ok('Blatt: ✕ sichtbar, Tasten ≥ 44 px, nichts läuft über', geo.x[0] >= 0 && geo.x[2] <= geo.vw && geo.x[1] >= 0 && geo.x[3] <= geo.vh && geo.minH >= 44 && geo.minW >= 44 && !geo.over, geo);
await p.screenshot({path: out + '/hm1-glaetten-hoch.png'});
await E(p, () => window.SYNQUENZER.hm1.act('[data-a="pv"]')); await p.waitForTimeout(250);
const pv = await E(p, () => ({st: window.SYNQUENZER.hm1.state().pv, v: window.SYNQUENZER.voices ? window.SYNQUENZER.voices().length : null}));
await E(p, () => window.SYNQUENZER.hm1.act('[data-a="pv"]'));
const pv2 = await E(p, () => window.SYNQUENZER.hm1.state().pv);
ok('Vorschau startet und stoppt', pv.st === true && pv2 === false, {pv, pv2});
const u0 = await E(p, () => window.SYNQUENZER.undoInfo().n);
const g = await E(p, () => window.SYNQUENZER.hm1.glatt());
const after = await E(p, g => ({c: window.SYNQUENZER.getClip(0, g.s), row: window.SYNQUENZER.chordRow('S' + (g.s + 1)), orig: window.SYNQUENZER.getClip(0, 4), u: window.SYNQUENZER.undoInfo()}), g);
ok('Als Clip: neuer Clip auf freiem Platz, Original bleibt', g && g.s !== 4 && after.c && after.orig && after.orig.notes.length === notes.length && after.c.notes.length === sm.length, g);
ok('Als Clip: Tonart C-Dur fest (user), Noten = Grundmuster', after.c.key.root === 0 && after.c.key.scale === 'ionian' && after.c.key.src === 'user' && after.c.notes.every((n, i) => n.n === sm.slice().sort((a, b) => a.t - b.t)[i].n));
ok('Als Clip: Akkord-Zeile C · Am · F · G in der neuen Szene', after.row && after.row.ch.map(c => c.tg && c.tg.name).join(' ') === 'C Am F G', after.row && after.row.ch.map(c => [c.b, c.tg && c.tg.name]));
ok('Als Clip: genau ein Undo-Schritt (Gruppe)', after.u.n === u0 + 1 && after.u.top.kind === 'group', after.u.top);
await E(p, () => window.SYNQUENZER.undo());
const un = await E(p, g => ({c: window.SYNQUENZER.getClip(0, g.s), row: window.SYNQUENZER.chordRow('S' + (g.s + 1))}), g);
ok('Undo: Clip und Akkord-Zeile weg', !un.c && !un.row, un);
await E(p, () => window.SYNQUENZER.redo());
const re = await E(p, g => ({c: window.SYNQUENZER.getClip(0, g.s), row: window.SYNQUENZER.chordRow('S' + (g.s + 1))}), g);
ok('Redo: beides wieder da', re.c && re.row && re.row.ch.length === 4);
// Abspielen der Szene mit der Akkord-Zeile: klingende Töne = Original
const heard = await E(p, async g => { const A = window.SYNQUENZER; A.clearLog && A.clearLog(); A.launchScene ? A.launchScene(g.s) : A.launchClip(0, g.s); A.play(); await new Promise(r => setTimeout(r, 4600)); A.stop(); return (A.noteLog() || []).filter(e => e.track === 0 && e.src === 'clip').map(e => e.out); }, g);
ok('Abspielen: Grundmuster unter der Akkord-Zeile klingt wie gespielt (Bass Takt 1–2)', heard.length > 0 && heard.includes(48) && heard.includes(45), heard.slice(0, 16));

// ---------- 2 Skalen-/Akkord-Sperre beim Wischen ----------
await E(p, () => { const A = window.SYNQUENZER; if (document.querySelector('.pop.hm1p')) A.hm1.act('[data-a="x"]'); A.closeRoll(); A.stop(); A.selectTrack ? A.selectTrack(0) : null; });
await p.waitForTimeout(300);
const hold = async () => { const r = await p.$eval('#segPlay', e => { const b = e.getBoundingClientRect(); return {x: b.left + b.width / 2, y: b.top + b.height / 2}; }); await p.mouse.move(r.x, r.y); await p.mouse.down(); await p.waitForTimeout(650); await p.mouse.up(); await p.waitForTimeout(150); };
const ks0 = await E(p, () => window.SYNQUENZER.state().project.settings.kbScale);
await hold();
const ks1 = await E(p, () => ({k: window.SYNQUENZER.project().settings.kbScale, lk: document.getElementById('kbRef').classList.contains('hm1lk'), t: document.getElementById('toast').textContent, mode: window.SYNQUENZER.runtime().kbMode}));
ok('SPIELEN halten → Skala gesperrt (Schloss + Hinweis)', ks1.k === 'lock' && ks1.lk && /Skala gesperrt/.test(ks1.t) && ks1.mode === 'play', {ks0, ks1});
// über die Tasten wischen: C4 … E4 durch die schwarzen Tasten
const glide = async (from, to) => {
  const pts = await E(p, ({from, to}) => { const kb = document.getElementById('kb'), r = kb.getBoundingClientRect(), out = []; for (let n = from; n <= to; n++) { const k = KB.byNote.get(n); if (!k) continue; const e = k.el.getBoundingClientRect(); out.push({n, x: e.left + e.width / 2, y: r.top + r.height * (k.el.classList.contains('b') ? .3 : .85)}); } return out; }, {from, to});
  await E(p, () => window.SYNQUENZER.clearLog());
  await p.mouse.move(pts[0].x, pts[0].y); await p.mouse.down();
  for (const q of pts.slice(1)) { await p.mouse.move(q.x, q.y, {steps: 3}); await p.waitForTimeout(40); }
  await p.mouse.up(); await p.waitForTimeout(100);
  return E(p, () => (window.SYNQUENZER.noteLog() || []).filter(e => e.src === 'live').map(e => e.out));
};
const C0 = await E(p, () => KB.low);
const rel = a => a.map(n => n - C0).join(',');
const g1 = await glide(C0, C0 + 4);
ok('Wischen C…E mit Skalen-Sperre: nur C D E, kein Doppelanschlag', rel(g1) === '0,2,4', g1);
await hold();
const ks2 = await E(p, () => ({k: window.SYNQUENZER.project().settings.kbScale, ref: document.getElementById('kbRef').textContent, ch: window.SYNQUENZER.hm1.kbChord()}));
ok('SPIELEN nochmal halten → Akkord gesperrt (Grundakkord C)', ks2.k === 'chord' && ks2.ch.z.join(',') === '0,4,7', ks2);
const g2 = await glide(C0, C0 + 7);
ok('Wischen C…G mit Akkord-Sperre: nur C E G', rel(g2) === '0,4,7', g2);
const tap1 = await E(p, c => window.SYNQUENZER.hm1.kbNote(c + 2), C0);
ok('Akkord-Sperre: D (Taste) spielt C (nächster Akkordton, tiefer bei Gleichstand)', tap1 === C0, tap1);
await hold();
const ks3 = await E(p, () => window.SYNQUENZER.project().settings.kbScale);
const g3 = await glide(C0, C0 + 2);
ok('nochmal halten → frei: C C♯ D', ks3 === 'show' && rel(g3) === '0,1,2', {ks3, g3});
const tapSeg = await E(p, () => { const A = window.SYNQUENZER; document.getElementById('segPlay').click(); return A.project().settings.kbScale; });
ok('ein Tipp auf SPIELEN ändert nichts an der Sperre', tapSeg === 'show', tapSeg);

// ---------- 3 Lauf verlängern ----------
await E(p, () => window.SYNQUENZER.setClip(0, 6, {len: 1, key: {root: 0, scale: 'ionian', src: 'user'}, notes: [60, 62, 64, 65].map((n, k) => ({t: k * .25, d: .25, n, v: .8}))}));
await E(p, () => { window.SYNQUENZER.openRoll(0, 6); }); await p.waitForTimeout(300);
await E(p, () => window.SYNQUENZER.rollApi().selectIdx([0, 1, 2, 3]));
await E(p, () => window.SYNQUENZER.hm1.open(0, 6, 'lauf')); await p.waitForTimeout(150);
await E(p, () => window.SYNQUENZER.hm1.act('[data-a="fup"]'));
await E(p, () => window.SYNQUENZER.hm1.act('[data-a="fup"]'));
const l1 = await E(p, () => ({c: window.SYNQUENZER.getClip(0, 6), sel: window.SYNQUENZER.roll().sel, u: window.SYNQUENZER.undoInfo().top}));
ok('Fortsetzen ▲ ×2: C D E F | D E F G | E F G A', l1.c.notes.map(n => n.n).join(',') === '60,62,64,65,62,64,65,67,64,65,67,69' && l1.c.notes[4].t === 1 && l1.c.notes[8].t === 2, l1.c.notes.map(n => [n.t, n.n]));
ok('Fortsetzen: neue Noten gewählt (weiter tippen = weiter)', l1.sel === 4, l1.sel);
await E(p, () => window.SYNQUENZER.hm1.act('[data-a="fup"]')); await E(p, () => window.SYNQUENZER.hm1.act('[data-a="fup"]'));
const l2 = await E(p, () => window.SYNQUENZER.getClip(0, 6));
ok('Fortsetzen wächst über den Takt: Clip 2 Takte', l2.len === 2 && l2.notes.length === 20 && Math.max(...l2.notes.map(n => n.t)) === 4.75, {len: l2.len, n: l2.notes.length});
await E(p, () => window.SYNQUENZER.rollApi().select([]));
await E(p, () => window.SYNQUENZER.hm1.act('[data-a="dbl"]'));
const l3 = await E(p, () => window.SYNQUENZER.getClip(0, 6));
ok('Doppeln ohne Auswahl: ganzer Clip ×2 (4 Takte, 40 Noten)', l3.len === 4 && l3.notes.length === 40, {len: l3.len, n: l3.notes.length});
await E(p, () => window.SYNQUENZER.hm1.act('[data-a="lp"]'));
const l4 = await E(p, () => window.SYNQUENZER.getClip(0, 6).len);
ok('Takte +: 5 Takte', l4 === 5, l4);
for (let k = 0; k < 6; k++) await E(p, () => window.SYNQUENZER.undo());
const l5 = await E(p, () => window.SYNQUENZER.getClip(0, 6));
ok('Undo je Tipp ein Schritt: wieder C D E F (1 Takt)', l5.len === 1 && l5.notes.map(n => n.n).join(',') === '60,62,64,65', {len: l5.len, n: l5.notes.length});
await E(p, () => { window.SYNQUENZER.hm1.act('[data-a="x"]'); window.SYNQUENZER.closeRoll(); });

// ---------- 4 Gegenstimme ----------
const mel = [[0, 1, 72], [1, 1, 76], [2, .5, 79], [2.5, .5, 77], [3, 1, 76], [4, 1, 74], [5, 1, 77], [6, 2, 71], [8, 2, 72], [10, 1, 69], [11, 1, 72], [12, 1, 74], [13, 1, 71], [14, 2, 67]].map(([t, d, n]) => ({t, d, n, v: .8}));
await E(p, ns => window.SYNQUENZER.setClip(0, 7, {len: 4, key: {root: 0, scale: 'ionian', src: 'user'}, notes: ns}), mel);
const cs = await E(p, () => [0, 1, 2].map(v => window.SYNQUENZER.hm1.counter(0, 7, v)));
ok('Gegenstimme Terzen: so viele Noten wie die Melodie, alle darunter, in C-Dur', cs[0].length === mel.length && cs[0].every((n, i) => n.n < mel[i].n && inC(n.n)), cs[0].map(n => n.n));
ok('Gegenstimme Sexten: darunter, Abstand 7–10 Halbtöne meist', cs[1].length === mel.length && cs[1].every((n, i) => n.n < mel[i].n) && cs[1].filter((n, i) => mel[i].n - n.n >= 7 && mel[i].n - n.n <= 12).length >= mel.length * .7, cs[1].map((n, i) => mel[i].n - n.n));
const v3 = cs[2];
const melAt = x => { let r = mel[0]; for (const m of mel) if (m.t <= x + 1e-6) r = m; return r; };
let contra = 0, moves = 0; for (let i = 1; i < v3.length; i++) { const dm = Math.sign(melAt(v3[i].t).n - melAt(v3[i - 1].t).n), dc = Math.sign(v3[i].n - v3[i - 1].n); if (dm) { moves++; if (dc !== dm) contra++; } }
ok('Gegenbewegung: unter der Melodie, meist gegenläufig/ruhend', v3.length >= 4 && v3.every(n => n.n < melAt(n.t).n) && contra >= moves * .6, {n: v3.length, contra, moves, ns: v3.map(n => [n.t, n.n])});
await E(p, () => window.SYNQUENZER.openRoll(0, 7)); await p.waitForTimeout(300);
await E(p, () => window.SYNQUENZER.hm1.open(0, 7, 'gegen')); await p.waitForTimeout(150);
await E(p, () => window.SYNQUENZER.hm1.act('[data-var="2"]'));
await E(p, () => window.SYNQUENZER.hm1.act('[data-a="tgt"]'));
const gs = await E(p, () => ({st: window.SYNQUENZER.hm1.state(), lbl: document.querySelector('.hm1p [data-a="tgt"]').textContent}));
await p.screenshot({path: out + '/hm1-gegenstimme-hoch.png'});
const gg = await E(p, () => window.SYNQUENZER.hm1.gegen());
const gc = await E(p, gg => gg ? window.SYNQUENZER.getClip(gg.t, gg.s) : null, gg);
ok('Übernehmen: Gegenstimme als Clip auf anderer Spur, gleiche Szene', gg && gg.t !== 0 && gg.s === 7 && gc && gc.notes.length === v3.length, {gg, gs, n: gc && gc.notes.length});
await E(p, () => window.SYNQUENZER.undo());
const gu = await E(p, gg => window.SYNQUENZER.getClip(gg.t, gg.s), gg);
ok('Undo: Gegenstimme weg', !gu);
await E(p, () => window.SYNQUENZER.redo());
await E(p, () => window.SYNQUENZER.closeRoll());

// ---------- 5 Akkordvorschläge ----------
await E(p, () => { const A = window.SYNQUENZER; A.setChordRow('S6', {len: 4, ch: [{b: 0, tg: {kind: 'chord', root: 0, quality: 'maj'}}]}); });
const s1 = await E(p, () => window.SYNQUENZER.hm1.suggest('S6', 4, 8));
ok('Vorschläge nach C: 3–4 Akkorde, darunter F, G, Am', s1.length >= 3 && s1.length <= 4 && ['F', 'G', 'Am'].every(x => s1.some(s => s.name === x)), s1);
// feste Melodie (MELODIE folgt nicht) mit H und D in Takt 2 → G zuerst
const melT = await E(p, () => { const A = window.SYNQUENZER; return A.tracks().find(t => t.mel) ? A.tracks().find(t => t.mel).i : 4; });
await E(p, mt => window.SYNQUENZER.setClip(mt, 5, {len: 2, key: {root: 0, scale: 'ionian', src: 'user'}, notes: [{t: 0, d: 4, n: 72, v: .8}, {t: 4, d: 2, n: 71, v: .8}, {t: 6, d: 2, n: 74, v: .8}]}), melT);
const fol = await E(p, mt => window.SYNQUENZER.project().tracks[mt].follow, melT);
const s2 = await E(p, () => window.SYNQUENZER.hm1.suggest('S6', 4, 8));
ok('Vorschläge mit fester Melodie H · D im Takt 2: G zuerst', fol === false && s2[0].name === 'G', {fol, s2});
await E(p, () => window.SYNQUENZER.openRoll(0, 5)); await p.waitForTimeout(200);
await E(p, () => window.SYNQUENZER.closeRoll());
await E(p, () => { openChordRowSheet('S6'); }); await p.waitForTimeout(250);
const mk = await E(p, () => [...document.querySelectorAll('.crsheet .cp-st .cp-c.hm1s')].map(b => b.textContent));
ok('Akkord-Zeilen-Blatt: 3–4 Stufen tragen eine Vorschlags-Nummer', mk.length >= 3 && mk.length <= 4 && /1/.test(mk.join('')), mk);
await p.screenshot({path: out + '/hm1-akkorde-hoch.png'});
await E(p, () => closePop());
// Reiter Akkorde: Tipp schreibt in das nächste freie Kästchen
await E(p, () => window.SYNQUENZER.setClip(1, 5, {len: 1, key: {root: 0, scale: 'ionian', src: 'user'}, notes: [{t: 0, d: 1, n: 60, v: .8}]}));
await E(p, () => window.SYNQUENZER.openRoll(1, 5)); await p.waitForTimeout(200);
await E(p, () => window.SYNQUENZER.hm1.open(1, 5, 'akk')); await p.waitForTimeout(100);
const first = await E(p, () => { const b = document.querySelector('.hm1p [data-sg]'); const t = b.lastChild.textContent; b.click(); return t; });
const rw = await E(p, () => window.SYNQUENZER.chordRow('S6'));
ok('Reiter Akkorde: Tipp → Akkord in Takt 2 der Akkord-Zeile', rw.ch.length === 2 && rw.ch[1].b === 4 && rw.ch[1].tg.name === first, {first, ch: rw.ch.map(c => [c.b, c.tg && c.tg.name])});
await E(p, () => { window.SYNQUENZER.hm1.act('[data-a="x"]'); window.SYNQUENZER.closeRoll(); });

// ---------- Speichern / Laden ----------
await E(p, () => window.SYNQUENZER.setKbScale('chord'));
const before = await E(p, () => { const pr = window.SYNQUENZER.project(); return JSON.stringify({c: pr.tracks.map(t => t.clips), s: pr.scenes.map(x => x && x.chords || null), k: pr.settings.kbScale}); });
const ld = await E(p, async () => { const A = window.SYNQUENZER, j = A.serialize(); const r = A.importJSON(j); await new Promise(r => setTimeout(r, 800)); const pr = A.project(); return {r, after: JSON.stringify({c: pr.tracks.map(t => t.clips), s: pr.scenes.map(x => x && x.chords || null), k: pr.settings.kbScale})}; });
ok('Speichern → Laden: Clips, Akkord-Zeilen und Sperre gleich', ld.after === before, {r: ld.r, same: ld.after === before, len: [before.length, ld.after.length]});
const oldP = await E(p, () => { const A = window.SYNQUENZER, pr = A.project(); pr.settings.kbScale = 'lock'; const r = A.importJSON(JSON.stringify(pr)); return A.project().settings.kbScale; });
ok('altes Projekt (Sperre „lock“) lädt unverändert', oldP === 'lock', oldP);

// ---------- quer: Blatt im Querformat ----------
const q = await page(926, 428);
await E(q, ns => { const A = window.SYNQUENZER; A.setClip(0, 4, {len: 4, key: {root: 0, scale: 'ionian', src: 'user'}, notes: ns}); A.openRoll(0, 4); }, notes); await q.waitForTimeout(400);
await E(q, () => window.SYNQUENZER.hm1.open(0, 4, 'glatt')); await q.waitForTimeout(200);
const gq = await E(q, () => { const P = document.querySelector('.pop.hm1p'), x = P.querySelector('.hm1-x').getBoundingClientRect(), r = P.getBoundingClientRect(), bs = [...P.querySelectorAll('button')].filter(b => b.offsetParent).map(b => b.getBoundingClientRect()); return {x: [x.left, x.top, x.right, x.bottom], top: r.top, h: r.height, minH: Math.min(...bs.map(r => r.height)), vw: innerWidth, vh: innerHeight}; });
ok('quer 926×428: Blatt passt, ✕ sichtbar, Tasten ≥ 44 px', gq.top >= 0 && gq.x[2] <= gq.vw && gq.x[1] >= 0 && gq.minH >= 44, gq);
await q.screenshot({path: out + '/hm1-glaetten-quer.png'});
const lay = await E(q, () => { window.SYNQUENZER.hm1.act('[data-a="x"]'); window.SYNQUENZER.closeRoll(); return document.documentElement.scrollHeight <= innerHeight + 1; });
ok('quer: Seite springt nicht (kein Überlauf)', lay);

ok('keine Fehler in der Konsole', errs.length === 0, errs.slice(0, 5));
const bad = res.filter(r => !r.ok);
console.log('\nERGEBNIS: ' + (res.length - bad.length) + '/' + res.length + ' OK');
await b.close();
process.exit(bad.length ? 1 : 0);
