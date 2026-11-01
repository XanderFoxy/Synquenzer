// EDIT 4.29.0 – Zusammenspiel der drei Pakete (KON + MAGIC + PINSEL) auf 4.27.0:
// 1. Bereich mit Chor-Gruppe-Stimme (song.vox, chor v2) konsolidieren → Chor bleibt; zurückholen → exakt Ursprung, Chor bleibt
// 2. im konsolidierten Teil (Takt 3–10) in der Song-Melodie mit [Wischen] (Magic) und [Pinsel] Noten ändern (echte Touch-Gesten)
// 3. Undo/Redo über alle drei (Pinsel, Wischen, Konsolidieren) – je ein Schritt, exakt
// 4. Speichern → Laden (Rundreise + Neuladen): Teil, Ursprung, Chor, Melodie-Änderungen bleiben
// 5. Werkzeugleiste: Pinsel · Magic · Mithören nebeneinander, umschaltbar, Touch-Ziele ≥ 44 px, nichts überdeckt (hoch + quer)
import { open, buildSong, ok, summary, diff, state } from './KON/lib.mjs';
const sleep = ms => new Promise(r => setTimeout(r, ms));
const CHOR = {v: 2, style: null, grp: {}, rec: 'third', dir: 'up', mix: '80',
  voices: [{lane: 'c1', rule: 'st+2', n: [{t0: 0, t1: .8, m: 69, d: 2}, {t0: 1, t1: 1.8, m: 71, d: 2}], db: -6, pan: -.3},
           {lane: 'c2', rule: 'st+4', n: [{t0: 0, t1: .8, m: 72, d: 4}], db: -8, pan: .3}]};

async function touchLine(p, pts, ms = 12) {
  const cdp = await p.context().newCDPSession(p), tp = (x, y) => [{x, y, id: 1, radiusX: 2, radiusY: 2, force: 1}];
  await cdp.send('Input.dispatchTouchEvent', {type: 'touchStart', touchPoints: tp(pts[0].x, pts[0].y)});
  for (let i = 1; i < pts.length; i++) { await cdp.send('Input.dispatchTouchEvent', {type: 'touchMove', touchPoints: tp(pts[i].x, pts[i].y)}); await sleep(ms); }
  await cdp.send('Input.dispatchTouchEvent', {type: 'touchEnd', touchPoints: []}); await sleep(120); await cdp.detach();
}
const line = (a, b, n) => Array.from({length: n + 1}, (_, i) => ({x: a.x + (b.x - a.x) * i / n, y: a.y + (b.y - a.y) * i / n}));
const xy = (p, beat, note) => p.evaluate(([b, n]) => SYNQUENZER.rollApi()._xy(b, n), [beat, note]);
const mel = p => p.evaluate(() => JSON.parse(JSON.stringify(curMel(S.song).notes)));
const voxOf = p => p.evaluate(() => JSON.parse(JSON.stringify(S.song.vox || null)));
const full = p => p.evaluate(() => JSON.parse(JSON.stringify({song: S.song, parts: S.parts})));

const {b, p, errs} = await open();
await buildSong(p);
// eine Chor-Gruppe-Stimme im Song (Takt 3–6), über Speichern/Laden normalisiert (so liegt sie auch nach dem Laden vor)
const vx = await p.evaluate(C => {
  S.song.vox = [{id: 'V1', bar: 2, len: 4, take: 'a0b1c2d3e4', in: 0, out: 8, at: 0, gain: 1, chor: C}];
  const o = normalizeProject(JSON.parse(serializeProject())); S.song.vox = o.song.vox;
  UNDO.length = 0; REDO.length = 0; return JSON.parse(JSON.stringify(S.song.vox || null));
}, CHOR);
ok(vx && vx.length === 1 && vx[0].chor && vx[0].chor.v === 2 && vx[0].chor.voices.length === 2, 'Song hat eine Chor-Gruppe-Stimme (v2, 2 Stimmen) in Takt 3–6', vx);
const s0 = await full(p);

console.log('1) Konsolidieren mit Chor-Gruppe, zurückholen');
const r = await p.evaluate(() => SYNQUENZER.konsolidieren(2, 9, 'Kern'));
ok(r && r.part >= 0 && r.mark, 'Takt 3–10 als Teil „Kern“ konsolidiert', r);
const s1 = await full(p);
ok(diff(s0.song.vox, s1.song.vox).length === 0, 'Chor-Gruppe im Song unverändert (Stimmen, Noten, Pegel)', diff(s0.song.vox, s1.song.vox).slice(0, 3));
const P = s1.parts[r.part];
ok(P && Array.isArray(P.vox) && P.vox.length === 1 && P.vox[0].chor && diff(s0.song.vox[0].chor, P.vox[0].chor).length === 0, 'der neue Teil trägt die Stimme mit derselben Chor-Gruppe', P && P.vox);
ok(await p.evaluate(id => SYNQUENZER.zurueckholen(id), r.mark), 'zurückgeholt');
const s2 = await full(p);
ok(diff(s0, s2).length === 0, 'Zurückholen = exakt Ursprung (Chor bleibt)', diff(s0, s2).slice(0, 4));
await p.evaluate(() => SYNQUENZER.undo());
ok(diff(s1, await full(p)).length === 0, 'Undo Zurückholen = wieder konsolidiert');
const u1 = await p.evaluate(() => UNDO.length);

console.log('2) Im konsolidierten Teil mit Wischen und Pinsel Noten ändern (Song-Melodie, Takt 7–10)');
await p.evaluate(() => { SYNQUENZER.openMelody(); });
await sleep(600);
const ed0 = await p.evaluate(() => { const e = SYNQUENZER.rollApi(); return {ms: !!e.ms, mp: !!e.mp}; });
ok(ed0.ms && ed0.mp, 'Melodie-Editor hat Magic Scale und Pinsel', ed0);
await p.evaluate(() => { const e = SYNQUENZER.rollApi(); e.setGrid('1/16'); e.fitView('bar'); e.showPage(28); e.centerOn(74); });
await sleep(200);
const m0 = await mel(p);
// Wischen über Takt 8 (Schlag 28–32): 16 neue Noten im Raster, ein Undo
await p.evaluate(() => { const e = SYNQUENZER.rollApi(); e.ms.setOn(true); e.ms.setTool('msWipe'); e.ms.setMode('scale'); });
{ const a = await xy(p, 28.05, 69), c = await xy(p, 31.95, 79); await touchLine(p, line(a, c, 30), 8); }
const m1 = await mel(p);
const added = m1.filter(n => n.t >= 28 - 1e-6 && n.t < 32 && !m0.some(o => o.t === n.t && o.n === n.n));
ok(added.length >= 12, 'Wischen: neue Noten in Takt 8 (' + added.length + ')', m1.length - m0.length);
ok(added.every(n => Math.abs(n.t * 4 - Math.round(n.t * 4)) < 1e-6), 'Wischen: alle Noten auf dem 1/16-Raster');
const k8 = await p.evaluate(() => { const k = songKeyAtBar(7); return {root: k.root, scale: k.scale}; });
const SCL = {ionian: [0, 2, 4, 5, 7, 9, 11], aeolian: [0, 2, 3, 5, 7, 8, 10], dorian: [0, 2, 3, 5, 7, 9, 10], mixolydian: [0, 2, 4, 5, 7, 9, 10], lydian: [0, 2, 4, 6, 7, 9, 11], phrygian: [0, 1, 3, 5, 7, 8, 10], locrian: [0, 1, 3, 5, 6, 8, 10]};
ok(added.every(n => SCL[k8.scale].includes(((n.n - k8.root) % 12 + 12) % 12)), 'Wischen: nur Töne der Tonart der Stelle (' + JSON.stringify(k8) + ')');
const u2 = await p.evaluate(() => UNDO.length);
ok(u2 === u1 + 1, 'Wischen = ein Undo-Schritt', [u1, u2]);
// Pinsel über die Noten von Takt 7 (Schlag 24–28): Noten folgen dem Finger, ein Undo
await p.evaluate(() => { const e = SYNQUENZER.rollApi(); e.setTool('mpBrush'); e.mp.setWidth('mittel'); e.showPage(24); e.centerOn(74); });
await sleep(150);
const msOff = await p.evaluate(() => SYNQUENZER.rollApi().ms.state.on);
ok(!msOff, 'Pinsel gewählt → Magic-Zeile zu (umschaltbar, nichts übereinander)');
{ const a = await xy(p, 24.2, 81), c = await xy(p, 27.8, 81); await touchLine(p, line(a, c, 24), 10); }
const m2 = await mel(p);
const ch = m2.filter(n => n.t >= 24 && n.t < 28), was = m1.filter(n => n.t >= 24 && n.t < 28);
ok(ch.length === was.length && ch.some((n, i) => n.n !== was[i].n), 'Pinsel: Noten in Takt 7 folgen dem Finger', {vor: was.map(n => n.n), nach: ch.map(n => n.n)});
ok(diff(m1.filter(n => n.t >= 32), m2.filter(n => n.t >= 32)).length === 0, 'Pinsel: außerhalb des Einzugs nichts verändert');
const u3 = await p.evaluate(() => UNDO.length);
ok(u3 === u2 + 1, 'Pinsel = ein Undo-Schritt', [u2, u3]);
ok(diff(s1.song.vox, (await full(p)).song.vox).length === 0, 'Chor-Gruppe nach dem Bearbeiten unverändert');
const sE = await full(p);

console.log('3) Undo/Redo über alle drei');
await p.evaluate(() => SYNQUENZER.undo()); ok(diff(m1, await mel(p)).length === 0, 'Undo Pinsel');
await p.evaluate(() => SYNQUENZER.undo()); ok(diff(m0, await mel(p)).length === 0, 'Undo Wischen');
await p.evaluate(() => { SYNQUENZER.closeRoll && SYNQUENZER.closeRoll(); });
await p.evaluate(() => SYNQUENZER.undo());
ok(diff(s0, await full(p)).length === 0, 'Undo Konsolidieren = Ursprung (mit Chor)', diff(s0, await full(p)).slice(0, 3));
await p.evaluate(() => { SYNQUENZER.redo(); SYNQUENZER.redo(); SYNQUENZER.redo(); });
const sR = await full(p);
ok(diff(sE, sR).length === 0, 'Redo ×3 = konsolidiert + Wischen + Pinsel, exakt', diff(sE, sR).slice(0, 4));

console.log('4) Speichern / Laden');
const rt = await p.evaluate(() => { const o = normalizeProject(JSON.parse(serializeProject())); return JSON.parse(JSON.stringify({song: o.song, parts: o.parts})); });
ok(diff(sR, rt).length === 0, 'Rundreise serialize → normalize deep-equal', diff(sR, rt).slice(0, 4));
await p.evaluate(async () => { const x = SYNQUENZER.save(); if (x && x.then) await x; });
await sleep(800); await p.reload(); await sleep(2000);
const sL = await full(p);
ok(diff(sR, sL).length === 0, 'nach Neuladen: Teil, Ursprung, Chor, Melodie wie vorher', diff(sR, sL).slice(0, 4));
const mk = await p.evaluate(() => S.song.kons && S.song.kons[0] && S.song.kons[0].mark);
ok(await p.evaluate(m => SYNQUENZER.zurueckholen(m), mk), 'Zurückholen nach dem Laden');
const sZ = await full(p);
ok(diff(sR.song.vox, sZ.song.vox).length === 0 && sZ.song.vox && sZ.song.vox[0].chor && sZ.song.vox[0].chor.v === 2, 'Chor-Gruppe bleibt auch nach dem Zurückholen');
const e1 = errs.filter(x => !/AudioContext|autoplay/i.test(x));
ok(!e1.length, 'keine Konsolenfehler', e1.slice(0, 3));
await b.close();

console.log('5) Werkzeugleiste hoch 428×926 und quer 926×428');
for (const [w, h, nm] of [[428, 926, 'hoch'], [926, 428, 'quer']]) {
  const o = await open({w, h});
  await o.p.evaluate(() => { const D = SYNQUENZER; D.setClip(0, 0, {len: 2, key: {root: 0, scale: 'ionian', src: 'user'}, notes: [{t: 0, d: 1, n: 60, v: .8}]}); D.openRoll(0, 0); });
  await sleep(700);
  const bar = async () => o.p.evaluate(() => {
    const e = SYNQUENZER.rollApi(), bar = e.el && e.el.bar || document.querySelector('#rollSheet .pr-bar.prt'), kids = [...bar.children].filter(x => x.tagName === 'BUTTON');
    const names = kids.map(x => x.textContent.trim()), i = names.indexOf('Pinsel');
    const vis = [...document.querySelectorAll('#rollSheet button')].filter(x => x.offsetWidth && x.offsetHeight);
    const hit = x => { const q = x.getBoundingClientRect(), a = getComputedStyle(x, '::after'); const ex = a.content !== 'none' && a.position === 'absolute' ? Math.max(0, -parseFloat(a.top) || 0) + Math.max(0, -parseFloat(a.bottom) || 0) : 0; return {w: q.width, h: q.height + ex}; };
    const tools = vis.filter(x => /^(Pinsel|Magic|Mithören|Wischen|Pause|Pause \+|Akkorde|Tonart|Terzen|Terz\+Quinte|Umk\. ▲|Umk\. ▼|Glatt|schmal|mittel|breit|Tonart: .*|Auto.*|Umkehren ↕|Krebs ↔|Tauschen ⇆|Achse: .*)$/.test(x.textContent.trim()) && (x.closest('.pr-bar.prms') || x.classList.contains('mpb') || x.textContent.trim() === 'Magic'));
    const small = tools.map(x => ({t: x.textContent.trim(), ...hit(x)})).filter(q => (q.h < 44 && !x0(q.t)));
    function x0(t) { return t === 'Magic' && false; }
    // overlaps: a tool button covered by another element at its centre (scrolled-out ones skipped)
    const cover = tools.filter(x => { const q = x.getBoundingClientRect(), cx = q.left + q.width / 2, cy = q.top + q.height / 2; if (cx < 0 || cx > innerWidth || cy < 0 || cy > innerHeight) return false;
      const sc = x.closest('.pr-bar'); if (sc) { const s = sc.getBoundingClientRect(); if (cx < s.left || cx > s.right) return false; }
      const t = document.elementFromPoint(cx, cy); return t && t !== x && !x.contains(t); }).map(x => x.textContent.trim());
    return {group: names.slice(i, i + 3), small, cover, sh: document.documentElement.scrollHeight, ih: innerHeight, sw: document.documentElement.scrollWidth, iw: innerWidth};
  });
  let q = await bar();
  ok(q.group.join('|') === 'Pinsel|Magic|Mithören', nm + ': eine Gruppe Pinsel · Magic · Mithören', q.group);
  ok(q.sh <= q.ih && q.sw <= q.iw, nm + ': kein Seiten-Überlauf', [q.sw, q.sh]);
  for (const step of ['magic', 'pinsel']) {
    await o.p.evaluate(s => { const e = SYNQUENZER.rollApi(); if (s === 'magic') { e.ms.setOn(true); } else e.setTool('mpBrush'); }, step);
    await sleep(250); q = await bar();
    ok(!q.small.length, `${nm} ${step}: Touch-Ziele ≥ 44 px`, q.small.slice(0, 4));
    ok(!q.cover.length, `${nm} ${step}: nichts überdeckt`, q.cover.slice(0, 4));
    ok(q.sh <= q.ih && q.sw <= q.iw, `${nm} ${step}: kein Seiten-Überlauf`);
    await o.p.screenshot({path: (process.env.SHOTS || '/tmp') + `/edit-${nm}-${step}.png`});
  }
  const st = await o.p.evaluate(() => { const e = SYNQUENZER.rollApi(); return {ms: e.ms.state.on, tool: e.state.tool}; });
  ok(!st.ms && st.tool === 'mpBrush', nm + ': Pinsel schließt die Magic-Zeile', st);
  await o.p.evaluate(() => SYNQUENZER.rollApi().ms.setOn(true)); await sleep(100);
  const st2 = await o.p.evaluate(() => { const e = SYNQUENZER.rollApi(); return {ms: e.ms.state.on, tool: e.state.tool}; });
  ok(st2.ms && st2.tool === 'msWipe', nm + ': Magic beendet den Pinsel (Wischen aktiv)', st2);
  const e2 = o.errs.filter(x => !/AudioContext|autoplay/i.test(x));
  ok(!e2.length, nm + ': keine Konsolenfehler', e2.slice(0, 3));
  await o.b.close();
}
process.exitCode = summary('EDIT-Zusammenspiel') ? 1 : 0;
