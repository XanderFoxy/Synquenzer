// ORI-Test: Wo-bin-ich-Zeile, Farb-Code je Bereich, Raumschiff-Look ohne Layout-Sprung, Menü entschlackt (alles erreichbar), Gesang-Schritte.
// Aufruf: node ori-test.mjs <index.html> <ausgabe-ordner> [basis.html]   (Zeilen OK/FEHLER, Fotos hochkant + quer)
import { chromium } from '/opt/node-tools/node_modules/playwright/index.mjs';
import fs from 'fs';
import path from 'path';
const [fileArg, outArg, basisArg] = process.argv.slice(2);
const BASIS = path.resolve(basisArg || '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/w4500/basis.html');
if (!fileArg || !outArg) { console.log('FEHLER Aufruf: node ori-test.mjs <index.html> <ausgabe-ordner> [basis.html]'); process.exit(2); }
const FILE = path.resolve(fileArg), OUT = path.resolve(outArg);
fs.mkdirSync(OUT, {recursive: true});
const res = []; const ok = (name, pass, info) => { res.push({name, pass: !!pass, info}); console.log((pass ? 'OK ' : 'FEHLER ') + name + (info !== undefined ? '  ' + JSON.stringify(info) : '')); };
const b = await chromium.launch({args: ['--autoplay-policy=no-user-gesture-required']});
const P = {p: [428, 926], q: [926, 428], q2: [926, 370]};
const open = async (f, vp, keepPrefs) => {
  const ctx = await b.newContext({viewport: {width: vp[0], height: vp[1]}, hasTouch: true, isMobile: false});
  const p = await ctx.newPage();
  const errs = []; p.on('pageerror', e => errs.push(String(e))); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  await p.goto('file://' + f); await p.waitForFunction(() => window.SYNQUENZER, null, {timeout: 60000}); await p.waitForTimeout(1200);
  p._errs = errs; p._ctx = ctx; return p;
};
const close = async p => { await p._ctx.close(); };
// Demo + Song (3 Teile; der dritte heißt „Refrain 2“ und spielt die STIMME-Szene 3) + Take auf STIMME Szene 3
const setup = async p => p.evaluate(async () => {
  SYNQUENZER.loadDemo(); ensureAudio();
  const sr = 48000, N = sr * 2, a = new Array(N).fill(0).map((_, i) => Math.round(7000 * Math.sin(i / 19) * (i % 12000 < 9000 ? 1 : 0)));
  window.__tk = await SYNQUENZER.tkInject({pcm: a, sr, scene: 2, len: 2}); await SYNQUENZER.tkInject({pcm: a, sr, scene: 2, len: 2});
  SYNQUENZER.songFromChain([{scene: 0, bars: 4}, {scene: 1, bars: 4}, {scene: 2, bars: 2}]);
  S.song.marks[2].name = 'Refrain 2'; songChanged();
  await new Promise(r => setTimeout(r, 300)); return {tk: window.__tk, marks: S.song.marks.map(m => markLabel(m))};
});
const st = p => p.evaluate(() => ({ed: R.editor || null, pop: UI.pop ? UI.pop.name : null, song: !!UI.songView, vv: typeof VV !== 'undefined' && !!VV.open, selT: R.selT, selS: R.selS, ring: SYNQUENZER.ui1.ring(), back: SYNQUENZER.ori.lastBack()}));
const shot = async (p, name) => { await p.waitForTimeout(200); await p.screenshot({path: path.join(OUT, name)}); };
// der Titel-Platz der obersten Ebene: Text, Bereich, Box, Treffer-Höhe
const host = p => p.evaluate(() => {
  SYNQUENZER.ori.frame();
  const h = document.querySelector('[data-oriwo]:not(.abg [data-oriwo])'), L = SYNQUENZER.ori.layers(), top = L[L.length - 1];
  const all = [...document.querySelectorAll('[data-oriwo]')].filter(x => { const r = x.getBoundingClientRect(); return r.width > 0 && r.height > 0; });
  const vis = all[all.length - 1] || null;
  if (!vis) return {txt: '', top};
  const r = vis.getBoundingClientRect(), be = getComputedStyle(vis, '::before');
  return {txt: vis.dataset.oriwo, area: vis.dataset.oria, app: EL.app.dataset.oria, top, x: Math.round(r.left + r.width / 2), y: Math.round(r.top + r.height / 2), w: Math.round(r.width), h: Math.round(r.height),
    lamp: be.backgroundImage.slice(0, 40), lineH: be.content && be.content !== 'none', cover: (() => { const e = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2); return !!(e && (e === vis || vis.contains(e))); })()};
});
const tapAt = async (p, x, y) => { await p.touchscreen.tap(x, y); await p.waitForTimeout(450); };
const AREA_C = {matrix: '60, 199, 220', song: '255, 178, 46', klang: '139, 147, 255', gesang: '255, 111, 174', mix: '169, 221, 76', video: '197, 141, 255'};

/* ============ A) Wo bin ich: 10 Stellen hochkant, Tipp führt zurück ============ */
const STELLEN = [
  {k: 'klang', go: "ui1Home(); setSongView(false); selectSlot(0, 0); openEditor()", want: /Szene 1/, area: 'klang', back: {song: false, selT: 0, selS: 0}},
  {k: 'drums', go: "ui1Home(); setSongView(false); selectSlot(DRUM_T, 1); openEditor()", want: /Szene 2/, area: 'klang', back: {song: false, selT: 'DRUM', selS: 1}},
  {k: 'sounds', go: "ui1Home(); setSongView(false); selectSlot(1, 1); openBrowser(1)", want: /Szene 2/, area: 'klang', back: {song: false, selT: 1, selS: 1}},
  {k: 'takes', go: "ui1Home(); setSongView(false); tkSheet({t: window.__tk.track, s: 2})", want: /Szene 3 › STIMME/, area: 'gesang', back: {song: false, selT: 'ST', selS: 2}},
  {k: 'chor-song', go: "ui1Home(); setSongView(true); SV.pos = 8; g6Sheet({t: window.__tk.track, s: 2})", want: /Refrain 2 › STIMME/, area: 'gesang', back: {song: true, selT: 'ST'}},
  {k: 'mikro', go: "ui1Home(); setSongView(false); selectTrack(window.__tk.track); stSheet()", want: /STIMME/, area: 'gesang', back: {song: false, selT: 'ST'}},
  {k: 'mix', go: "ui1Home(); setSongView(true); SV.pos = 4; mx2Sheet()", want: /Song › Szene 2/, area: 'mix', back: {song: true}},
  {k: 'export', go: "ui1Home(); setSongView(true); SV.pos = 0; va1Sheet()", want: /Song › Szene 1/, area: 'song', back: {song: true}},
  {k: 'video', go: "ui1Home(); setSongView(true); vvOpen()", want: /^Song/, area: 'video', back: {song: true}},
  {k: 'klang-song', go: "ui1Home(); setSongView(true); SV.pos = 4; selectTrack(2); openEditor()", want: /Szene 2/, area: 'klang', back: {song: true, selT: 2}},
];
for (const [vk, vp] of [['p', P.p], ['q', P.q]]) {
  const p = await open(FILE, vp); await setup(p);
  const ids = await p.evaluate(() => ({DRUM: DRUM_T, ST: window.__tk.track}));
  let n = 0;
  for (const S_ of STELLEN) {
    await p.evaluate(S_.go); await p.waitForTimeout(500);
    const h = await host(p);
    const hit = (vk === 'p' ? h.h >= 44 : h.h >= 39) && h.w >= 44;   // quer ist der Blatt-Kopf nur 40 px hoch: die Zeile nimmt die volle Kopfhöhe
    const good = h.txt && S_.want.test(h.top.txt) && h.top.txt.endsWith(h.txt) || (h.txt && S_.want.test(h.txt));
    const area = h.area === S_.area && h.app === S_.area;
    if (vk === 'p' && ['takes', 'chor-song', 'klang'].includes(S_.k)) await shot(p, `ori-wo-${S_.k}-hochkant.png`);
    if (vk === 'q' && ['takes', 'klang'].includes(S_.k)) await shot(p, `ori-wo-${S_.k}-quer.png`);
    // Tipp (Finger) auf die Zeile
    if (h.x != null) await tapAt(p, h.x, h.y);
    const s = await st(p), wantT = S_.back.selT === 'DRUM' ? ids.DRUM : S_.back.selT === 'ST' ? ids.ST : S_.back.selT;
    const backOk = !s.ed && !s.pop && !s.vv && s.song === S_.back.song && (wantT == null || s.selT === wantT) && (S_.back.selS == null || s.selS === S_.back.selS);
    const pass = good && area && hit && h.cover && backOk;
    if (pass) n++;
    ok(`Wo bin ich ${vk === 'p' ? 'hochkant' : 'quer'} · ${S_.k}: Zeile „${h.txt}“, Bereich ${S_.area}, Tipp → zurück`, pass, {zeile: h.txt, ganz: h.top.txt, area: h.area, app: h.app, w: h.w, h: h.h, cover: h.cover, nach: {ed: s.ed, pop: s.pop, song: s.song, selT: s.selT, selS: s.selS, ring: !!s.ring}});
  }
  ok(`Wo bin ich ${vk === 'p' ? 'hochkant' : 'quer'}: ${n}/${STELLEN.length} Stellen richtig (mind. 8)`, n >= 8 && n === STELLEN.length, {n});
  ok(`keine Konsolenfehler (Wo bin ich ${vk})`, p._errs.length === 0, p._errs.slice(0, 3));
  await close(p);
}

/* ============ B) Farb-Code je Bereich: Kopfleiste unten + Blatt-Kopf oben, sechs verschiedene Farben ============ */
{
  const p = await open(FILE, P.p); await setup(p);
  const cases = [['matrix', "ui1Home(); setSongView(false)", null], ['song', "ui1Home(); setSongView(true)", null], ['klang', "ui1Home(); setSongView(false); selectTrack(0); openEditor()", '#synthSheet .sh-head'],
    ['gesang', "ui1Home(); tkSheet({t: window.__tk.track, s: 2})", '.pop .psh-h'], ['mix', "ui1Home(); mx2Sheet()", '.pop .psh-h'], ['video', "ui1Home(); vvOpen()", '#vvSheet .vvh']];
  const got = {};
  for (const [a, go, hd] of cases) {
    await p.evaluate(go); await p.waitForTimeout(400);
    got[a] = await p.evaluate(([hd]) => { SYNQUENZER.ori.frame(); const top = getComputedStyle(document.getElementById('top')).boxShadow, h = hd ? document.querySelector(hd) : null; return {app: EL.app.dataset.oria, top, head: h ? getComputedStyle(h).boxShadow : null}; }, [hd]);
    const c = AREA_C[a], g = got[a];
    ok(`Farb-Code ${a}: Kopfleiste${hd ? ' + Blatt-Kopf' : ''} in der Bereichsfarbe (rgb ${c})`, g.app === a && g.top.includes(c) && (!hd || (g.head && g.head.includes(c))), {app: g.app, top: g.top.slice(0, 60), head: g.head && g.head.slice(0, 60)});
  }
  ok('Farb-Code: sechs Bereiche, sechs verschiedene Farben', new Set(Object.values(AREA_C)).size === 6 && Object.keys(got).length === 6);
  await close(p);
}

/* ============ C) Raumschiff-Look an/aus ohne Layout-Sprung (Box-Vergleich), per Finger im Menü, gemerkt ============ */
const boxes = p => p.evaluate(() => {
  const out = []; const roots = [EL.app, EL.menu, EL.popLayer, document.getElementById('vvSheet')].filter(Boolean);
  for (const r of roots) for (const e of r.querySelectorAll('*')) { const b = e.getBoundingClientRect(); if (b.width || b.height) out.push([Math.round(b.left * 10) / 10, Math.round(b.top * 10) / 10, Math.round(b.width * 10) / 10, Math.round(b.height * 10) / 10]); }
  return out;
});
for (const [vk, vp] of [['hochkant', P.p], ['quer', P.q], ['quer-370', P.q2]]) {
  const p = await open(FILE, vp); await setup(p);
  let worst = 0, cnt = 0, look = 0; const where = [];
  for (const [k, go] of [['matrix', "ui1Home(); setSongView(false)"], ['song', "ui1Home(); setSongView(true)"], ['klang', "ui1Home(); setSongView(false); selectTrack(0); openEditor()"],
    ['takes', "ui1Home(); setSongView(false); tkSheet({t: window.__tk.track, s: 2})"], ['chor', "ui1Home(); g6Sheet({t: window.__tk.track, s: 2})"], ['menu', "ui1Home(); openMenu(); for (const k of ['Harmonie','Projekt','Bedienung']) SYNQUENZER.ori.more(k, true)"], ['video', "ui1Home(); vvOpen()"]]) {
    await p.evaluate(go); await p.waitForTimeout(450);
    await p.evaluate(() => SYNQUENZER.ori.rs(false)); await p.waitForTimeout(250); const A = await boxes(p);
    const rA = await p.evaluate(() => getComputedStyle(document.querySelector('.rb')).borderRadius);
    await p.evaluate(() => SYNQUENZER.ori.rs(true)); await p.waitForTimeout(250); const B = await boxes(p);
    const rB = await p.evaluate(() => getComputedStyle(document.querySelector('.rb')).borderRadius);
    if (vk === 'hochkant' && ['matrix', 'takes', 'menu'].includes(k)) await shot(p, `ori-raumschiff-${k}-hochkant.png`);
    if (vk === 'quer' && ['matrix', 'klang'].includes(k)) await shot(p, `ori-raumschiff-${k}-quer.png`);
    await p.evaluate(() => SYNQUENZER.ori.rs(false)); await p.waitForTimeout(150);
    let d = A.length === B.length ? 0 : 999;
    if (!d) for (let i = 0; i < A.length; i++) for (let j = 0; j < 4; j++) d = Math.max(d, Math.abs(A[i][j] - B[i][j]));
    if (d > worst) worst = d; cnt += A.length; if (rA !== rB) look++;
    if (d > 0) where.push(k + ':' + d);
  }
  ok(`Raumschiff-Look ${vk}: an/aus ohne Layout-Sprung (${cnt} Boxen in 7 Ansichten gleich)`, worst === 0, {worst, where});
  ok(`Raumschiff-Look ${vk}: sichtbar anders (Rundungen geändert)`, look === 7, {look});
  ok(`keine Konsolenfehler (Raumschiff ${vk})`, p._errs.length === 0, p._errs.slice(0, 3));
  await close(p);
}
{ // per Finger im Menü, gemerkt über Neuladen
  const p = await open(FILE, P.p); await setup(p);
  await p.evaluate(() => { ui1Home(); openMenu(); }); await p.waitForTimeout(400);
  const bt = await p.evaluate(() => { const r = [...EL.menu.querySelectorAll('.mrow.orirsrow button')].find(x => x.textContent.trim() === 'An'); r.scrollIntoView({block: 'center'}); const q = r.getBoundingClientRect(); return {x: q.left + q.width / 2, y: q.top + q.height / 2, w: q.width, h: q.height}; });
  await p.waitForTimeout(200); await tapAt(p, bt.x, bt.y);
  const on1 = await p.evaluate(() => ({on: document.body.classList.contains('orirs'), pref: uiPrefs().orirs}));
  await p.reload(); await p.waitForFunction(() => window.SYNQUENZER); await p.waitForTimeout(1000);
  const on2 = await p.evaluate(() => document.body.classList.contains('orirs'));
  await p.evaluate(() => SYNQUENZER.ori.rs(false));
  ok('Raumschiff-Look per Finger an (≡ › Bedienung), Taste ≥ 44 px, nach Neuladen noch an', on1.on && on1.pref === true && on2 && bt.w >= 44 && bt.h >= 44, {on1, on2, bt});
  await close(p);
}

/* ============ D) Menü entschlackt: alles noch da, Guide springt überall hin (wie in der Basis), Mehr ▾ per Finger + gemerkt ============ */
const inventory = p => p.evaluate(() => {
  ui1Home(); openMenu(); for (const g of EL.menu.querySelectorAll('.orimore')) g.hidden = false;
  const L = [...EL.menu.querySelectorAll('button, .lbl, h3, input, select')].map(e => e.tagName[0] + ':' + (e.tagName === 'INPUT' || e.tagName === 'SELECT' ? (e.getAttribute('aria-label') || e.type) : e.textContent.trim().replace(/\s+/g, ' ').slice(0, 40)));
  return L;
});
const jumps = async p => {
  const ids = await p.evaluate(() => SYNQUENZER.ui1.entries().map(e => e.id)), o = {};
  for (const id of ids) {
    await p.evaluate(() => { ui1Home(); for (const k of Object.keys(uiPrefs().oriMore || {})) {} });
    await p.evaluate(id => SYNQUENZER.ui1.jump(id), id); await p.waitForTimeout(820);
    const r = await p.evaluate(() => ({j: SYNQUENZER.ui1.lastJump(), ring: !!SYNQUENZER.ui1.ring()}));
    o[id] = {ok: !!(r.j && r.j.ok && r.j.target && r.ring), txt: r.j && r.j.txt ? String(r.j.txt).replace(/\s+/g, ' ').replace(/\d/g, '#').slice(0, 40) : null};   // Ziffern: Uhrzeiten im Verlauf
  }
  return o;
};
{
  const pb = await open(BASIS, P.p); await setup(pb);
  const invB = await inventory(pb), hB = await pb.evaluate(() => { ui1Home(); openMenu(); const m = EL.menu.querySelector('.mb'); return m.scrollHeight; });
  const jB = await jumps(pb); await close(pb);
  const p = await open(FILE, P.p); await setup(p);
  const invO = await inventory(p);
  const hO = await p.evaluate(() => { ui1Home(); openMenu(); return EL.menu.querySelector('.mb').scrollHeight; });
  await shot(p, 'ori-menue-eingeklappt-hochkant.png');
  const cnt = a => a.reduce((m, x) => (m[x] = (m[x] || 0) + 1, m), {}), cB = cnt(invB), cO = cnt(invO);
  const missing = Object.keys(cB).filter(k => (cO[k] || 0) < cB[k]), extra = Object.keys(cO).filter(k => (cB[k] || 0) < cO[k]);
  ok('Menü: jeder Eintrag der Basis ist noch da (nichts entfernt)', missing.length === 0, {missing, extra});
  ok('Menü: kürzer (Seltenes eingeklappt)', hO < hB * 0.5, {basis: hB, ori: hO});
  const jO = await jumps(p);
  // XD1-Anpassung: „Beim Singen hören“ (vox2sing) springt bewusst ins Mikrofon-Blatt (XD1 Punkt 1) – eigene Prüfung unten, sonst alles wie in der Basis
  const bad = Object.keys(jO).filter(id => !jO[id].ok), diff = Object.keys(jB).filter(id => id !== 'vox2sing' && jB[id].ok && (!jO[id] || !jO[id].ok || jO[id].txt !== jB[id].txt));
  ok('Guide (XD1): „Beim Singen hören“ springt ins Mikrofon-Blatt zu „Beim Singen hören“', jO.vox2sing && jO.vox2sing.ok && /Beim Singen hören/.test(jO.vox2sing.txt), jO.vox2sing);
  ok(`Guide „Wo finde ich …?“: alle ${Object.keys(jO).length} Sprünge grün (Rahmen sitzt)`, bad.length === 0, {bad: bad.map(id => id + ':' + JSON.stringify(jO[id]))});
  ok('Guide: jeder Sprung der Basis landet auf derselben Stelle (auch eingeklappte Einträge)', diff.length === 0, {diff: diff.map(id => id + ' B:' + jB[id].txt + ' O:' + (jO[id] && jO[id].txt))});
  ok('Guide: 4 neue Einträge (Wo bin ich, Raumschiff-Look, Mehr ▾, Gesang-Schritte) springen', ['oriwo', 'orirs', 'orimehr', 'origs'].every(id => jO[id] && jO[id].ok), ['oriwo', 'orirs', 'orimehr', 'origs'].map(id => id + ':' + JSON.stringify(jO[id])));
  // eingeklappt + Sprung: Swing liegt sichtbar, Projekt-Tonart sichtbar, „Eine Skala“ klappt Harmonie auf (nicht gemerkt)
  await p.evaluate(() => { ui1Home(); setUiPref('oriMore', {}); }); await p.evaluate(() => SYNQUENZER.ui1.jump('onescale')); await p.waitForTimeout(820);
  const sk = await p.evaluate(() => ({j: SYNQUENZER.ui1.lastJump(), open: SYNQUENZER.ori.more('Harmonie'), pref: uiPrefs().oriMore || {}}));
  ok('Guide-Sprung in Eingeklapptes (Eine Skala): klappt auf, Rahmen sitzt, nicht gemerkt', sk.j.ok && sk.j.target && sk.open === true && !sk.pref.Harmonie, sk);
  // Mehr ▾ per Finger
  await p.evaluate(() => { ui1Home(); openMenu(); }); await p.waitForTimeout(300);
  const mb = await p.evaluate(() => { const sec = [...EL.menu.querySelectorAll('.msec')].find(s => s.querySelector('h3').textContent.trim() === 'Harmonie'); const b = sec.querySelector('.orimb'); b.scrollIntoView({block: 'center'}); const r = b.getBoundingClientRect(); return {x: r.left + r.width / 2, y: r.top + r.height / 2, w: r.width, h: r.height, txt: b.textContent, hidden: sec.querySelector('.orimore').hidden}; });
  await p.waitForTimeout(150); await tapAt(p, mb.x, mb.y);
  const m2 = await p.evaluate(() => ({open: SYNQUENZER.ori.more('Harmonie'), pref: (uiPrefs().oriMore || {}).Harmonie === true, txt: EL.menu.querySelector('.orimb[data-k="Harmonie"]').textContent}));
  await p.evaluate(() => { closeMenu(); openMenu(); }); await p.waitForTimeout(300);
  const m3 = await p.evaluate(() => SYNQUENZER.ori.more('Harmonie'));
  await shot(p, 'ori-menue-mehr-offen-hochkant.png');
  ok('Mehr ▾ per Finger: klappt auf (▴), ≥ 44 px, bleibt beim nächsten Öffnen offen', mb.hidden && m2.open && m2.pref && m3 === true && mb.h >= 44 && /▴/.test(m2.txt), {mb, m2, m3});
  await p.evaluate(() => SYNQUENZER.ori.more('Harmonie', false));
  ok('keine Konsolenfehler (Menü/Guide)', p._errs.length === 0, p._errs.slice(0, 3));
  await close(p);
}
{ // quer: Menü kürzer, Mehr da
  const p = await open(FILE, P.q); await setup(p);
  await p.evaluate(() => { ui1Home(); openMenu(); }); await p.waitForTimeout(400);
  const q = await p.evaluate(() => ({n: EL.menu.querySelectorAll('.orimb').length, min: Math.min(...[...EL.menu.querySelectorAll('.orimb')].map(b => b.getBoundingClientRect().height))}));
  await shot(p, 'ori-menue-quer.png');
  ok('Menü quer: 7 Klapp-Tasten (Projekt, Harmonie, Aufnahme, Klang, Bedienung, Hilfe, Info), je ≥ 44 px', q.n === 7 && q.min >= 44, q);
  await p.evaluate(() => { closeMenu(); openMenu('info'); }); await p.waitForTimeout(400);
  const inf = await p.evaluate(() => ({open: SYNQUENZER.ori.more('Info'), pref: !!(uiPrefs().oriMore || {}).Info, txt: EL.menu.querySelector('.minfo') ? EL.menu.querySelector('.minfo').getBoundingClientRect().height : 0}));
  ok('≡ über die CPU-/TAKT-Anzeige (Info): Info gleich aufgeklappt (nicht gemerkt)', inf.open === true && !inf.pref && inf.txt > 20, inf);
  await close(p);
}

/* ============ E) Gesang-Schritte: gleiche Leiste an gleicher Stelle, Reihenfolge, per Finger ============ */
const gs = p => p.evaluate(() => {
  const pop = UI.pop && UI.pop.el; if (!pop) return null;
  const bar = pop.querySelector(':scope > .origs'), hd = pop.querySelector(':scope > .psh-h') || bar.previousElementSibling; if (!bar) return {name: UI.pop.name, bar: false};
  const cs = getComputedStyle(bar), pl = parseFloat(cs.paddingLeft) || 0, pr_ = parseFloat(cs.paddingRight) || 0, br0 = bar.getBoundingClientRect(), hr = hd.getBoundingClientRect();
  const br = {left: br0.left + pl, width: br0.width - pl - pr_, top: br0.top};   // Inhalts-Box der Leiste
  const tr = hd.querySelector('.psh-t') && hd.querySelector('.psh-t').getBoundingClientRect(), hb = [...hd.querySelectorAll('.psh-b')].map(x => x.getBoundingClientRect().left);
  const inHead = br0.top >= hr.top - 1 && br0.bottom <= hr.bottom + 1 && (!tr || tr.right <= br0.left + 1) && hb.every(l => br0.right <= l + 1);   // ORI-P: quer liegt die Leiste im Mikrofon-Blatt in der Kopf-Zeile
  return {name: UI.pop.name, bar: true, inHead, afterHead: hd.nextElementSibling === bar, gapHead: Math.round(br.top - hr.bottom), rel: [...bar.children].map(b => { const r = b.getBoundingClientRect(); return [+((r.left - br.left) / br.width).toFixed(3), +(r.width / br.width).toFixed(3), Math.round(r.height)]; }),
    lit: [...bar.children].filter(b => b.classList.contains('on')).map(b => b.dataset.origs), keys: [...bar.children].map(b => b.dataset.origs), txt: [...bar.children].map(b => b.textContent.trim()),
    btn: [...bar.children].map(b => { const r = b.getBoundingClientRect(); return {k: b.dataset.origs, x: r.left + r.width / 2, y: r.top + r.height / 2, w: r.width, h: r.height}; })};
});
for (const [vk, vp] of [['hochkant', P.p], ['quer', P.q]]) {
  const p = await open(FILE, vp); await setup(p);
  await p.evaluate(() => { ui1Home(); setSongView(false); selectTrack(window.__tk.track); stSheet(); }); await p.waitForTimeout(500);
  const m = await gs(p);
  await p.evaluate(() => { ui1Home(); tkSheet({t: window.__tk.track, s: 2}); }); await p.waitForTimeout(500);
  const t = await gs(p); if (vk === 'hochkant') await shot(p, 'ori-gesang-takes-hochkant.png'); else await shot(p, 'ori-gesang-takes-quer.png');
  await p.evaluate(() => { ui1Home(); g6Sheet({t: window.__tk.track, s: 2}); }); await p.waitForTimeout(500);
  const c = await gs(p); if (vk === 'hochkant') await shot(p, 'ori-gesang-chor-hochkant.png');
  // quer: im Mikrofon-Blatt liegt die Leiste in der Kopf-Zeile (das Blatt passt sonst nicht ins Bild, ORI-P 1); Takes und Chor wie hochkant
  const same = [m, t, c].every((x, j) => x && x.bar && x.keys.join() === 'rec,pick,edit,chor' && x.rel.every(r => r[2] >= 44) &&
    (vk === 'quer' && j === 0 ? x.inHead : x.afterHead && x.rel.every((r, i) => Math.abs(r[0] - t.rel[i][0]) <= 0.01 && Math.abs(r[1] - t.rel[i][1]) <= 0.01)));
  ok(`Gesang-Schritte ${vk}: ${vk === 'quer' ? 'Takes, Chor – dieselbe Leiste direkt unter dem Kopf; Mikrofon – in der Kopf-Zeile' : 'Mikrofon, Takes, Chor – dieselbe Leiste direkt unter dem Kopf'}, gleiche Knopf-Positionen, ≥ 44 px`, same, {m: m && m.rel, mInHead: m && m.inHead, t: t && t.rel, c: c && c.rel, gap: [m && m.gapHead, t && t.gapHead, c && c.gapHead]});
  ok(`Gesang-Schritte ${vk}: Lampe am richtigen Schritt (Mikrofon = Aufnehmen, Takes = Auswählen, Chor = Chor)`, m && m.lit.join() === 'rec' && t && t.lit.join() === 'pick' && c && c.lit.join() === 'chor', {m: m && m.lit, t: t && t.lit, c: c && c.lit, txt: t && t.txt});
  // per Finger: Chor → Aufnehmen → Auswählen → Bearbeiten → Chor
  const tapK = async k => { const g = await gs(p); const b = g && g.btn.find(x => x.k === k); if (b) await tapAt(p, b.x, b.y); await p.waitForTimeout(250); return p.evaluate(() => UI.pop && UI.pop.name); };
  const seq = [];
  seq.push(await tapK('rec')); seq.push(await tapK('pick'));
  const e0 = await p.evaluate(() => UI.pop.el.scrollTop);
  seq.push(await tapK('edit'));
  const ed = await p.evaluate(() => { const q = UI.pop.el, s = q.querySelector('.orisec[data-sec="edit"]'), r = s.getBoundingClientRect(), qr = q.getBoundingClientRect(); return {scroll: q.scrollTop, top: Math.round(r.top - qr.top), vis: r.top >= qr.top && r.bottom <= qr.bottom, lit: [...q.querySelectorAll('.origs > .on')].map(b => b.dataset.origs)}; });
  if (vk === 'hochkant') await shot(p, 'ori-gesang-bearbeiten-hochkant.png');
  seq.push(await tapK('chor'));
  ok(`Gesang-Schritte ${vk} per Finger: Aufnehmen → Mikrofon, Auswählen → Takes, Bearbeiten → Takes beim Teil „Bearbeiten“, Chor → Chor`, seq.join() === 'stimme,takes,takes,chor' && ed.vis && ed.lit.join() === 'edit', {seq, ed, e0});
  // Takes-Blatt: Reihenfolge der Teile, alles noch da, Chor nur einmal
  await p.evaluate(() => { ui1Home(); SYNQUENZER.ori.gsStep && null; tkSheet({t: window.__tk.track, s: 2}); }); await p.waitForTimeout(500);
  const ord = await p.evaluate(() => {
    const q = UI.pop.el, bd = q.querySelector('.g10c-bd'), kids = [...bd.children], ix = sel => kids.findIndex(k => k.matches(sel) || k.querySelector(sel));
    return {pick: ix('.orisec[data-sec="pick"]'), list: ix('.tklist'), ab: ix('[data-a="ab"]'), edit: ix('.orisec[data-sec="edit"]'), clean: ix('.clbox'), wp: ix('.tk-wp'), g2: ix('[data-a="g2"]'), chor: ix('.orisec[data-sec="chor"]'), dup: ix('[data-a="dup"]'),
      g6InBar: !!q.querySelector('.origs [data-a="g6"]'), chorBtns: [...q.querySelectorAll('button')].filter(b => b.textContent.trim().replace(/^\d\s*/, '') === 'Chor' || /^.?4?Chor$/.test(b.textContent.trim())).length,
      acts: [...q.querySelectorAll('button[data-a]')].map(b => b.dataset.a).sort()};
  });
  const pb = await open(BASIS, vp); await setup(pb);
  await pb.evaluate(() => { ui1Home(); tkSheet({t: window.__tk.track, s: 2}); }); await pb.waitForTimeout(500);
  const actsB = await pb.evaluate(() => [...UI.pop.el.querySelectorAll('button[data-a]')].map(b => b.dataset.a).sort());
  await close(pb);
  ok(`Takes ${vk}: Auswählen (Liste, A/B) → Bearbeiten (Säubern, Marken & Timing, Tonhöhe) → Chor (duplizieren)`, ord.pick < ord.list && ord.list < ord.ab && ord.ab < ord.edit && ord.edit < ord.clean && ord.clean < ord.wp && ord.wp < ord.g2 && ord.g2 < ord.chor && ord.chor < ord.dup, ord);
  // XD1-Anpassung: die drei Tasten „Beim Singen“ (vox2s:…) stehen bewusst nicht mehr im Takes-Blatt, sondern im Mikrofon-Blatt (XD1 Punkt 1)
  const actsBX = actsB.filter(a => !/^vox2s:/.test(a));
  ok(`Takes ${vk}: alle Tasten der Basis noch da (ohne „Beim Singen“, XD1), [Chor] ist Schritt 4 der Leiste (nicht doppelt)`, JSON.stringify(ord.acts) === JSON.stringify(actsBX) && ord.g6InBar && ord.chorBtns === 1, {basis: actsBX.join(), ori: ord.acts.join(), chorBtns: ord.chorBtns});
  ok(`keine Konsolenfehler (Gesang ${vk})`, p._errs.length === 0, p._errs.slice(0, 3));
  await close(p);
}

{ // STIMME-Kopf: Spur-Blatt der STIMME hat dieselbe Leiste (ohne Lampe), Tipp führt in den Schritt
  const p = await open(FILE, P.p); await setup(p);
  await p.evaluate(() => { ui1Home(); setSongView(false); const t = window.__tk.track; openTrackSheet(t, UI.heads[t].el); }); await p.waitForTimeout(450);
  const g = await gs(p), pos = await p.evaluate(() => { const q = UI.pop.el, bar = q.querySelector('.origs'), sm = q.querySelector(':scope > .small'); return {afterSub: !!(sm && sm.nextElementSibling === bar), inView: (() => { const r = bar.getBoundingClientRect(); return r.top >= 0 && r.bottom <= innerHeight; })()}; });
  await shot(p, 'ori-gesang-stimmekopf-hochkant.png');
  const b2 = g && g.btn.find(x => x.k === 'pick'); if (b2) await tapAt(p, b2.x, b2.y);
  const after = await p.evaluate(() => UI.pop && UI.pop.name);
  ok('STIMME-Kopf (Spur-Blatt): dieselbe Leiste unter Name/Klang, ≥ 44 px, keine Lampe an, Tipp Auswählen → Takes', g && g.keys.join() === 'rec,pick,edit,chor' && g.lit.length === 0 && g.rel.every(r => r[2] >= 44) && pos.afterSub && pos.inView && after === 'takes', {g: g && {keys: g.keys, lit: g.lit, rel: g.rel}, pos, after});
  ok('keine Konsolenfehler (STIMME-Kopf)', p._errs.length === 0, p._errs.slice(0, 3));
  await close(p);
}

/* ============ F) Nichts verschiebt sich: Hauptansichten und Blatt-Köpfe wie die Basis; nichts im Projekt ============ */
const mainBoxes = p => p.evaluate(() => {
  const sel = ['#top > *', '#gridArea', '#strip > *', '#carrier > *', '#modebar > *', '#kbArea', '#clipGrid > *', '.sv-top > *', '.sheet.open .sh-head button', '.pop .psh-h button', '#vvSheet .vvh button'];
  const o = {}; for (const s of sel) o[s] = [...document.querySelectorAll(s)].filter(e => e.getBoundingClientRect().width > 0).map(e => { const r = e.getBoundingClientRect(); return [Math.round(r.left), Math.round(r.top), Math.round(r.width), Math.round(r.height)].join(','); }).join(' ');
  return o;
});
for (const [vk, vp] of [['hochkant', P.p], ['quer', P.q], ['quer-370', P.q2]]) {
  const pb = await open(BASIS, vp), po = await open(FILE, vp); await setup(pb); await setup(po);
  const diffs = [];
  for (const [k, go] of [['matrix', "ui1Home(); setSongView(false); selectSlot(0,0)"], ['song', "ui1Home(); setSongView(true)"], ['klang', "ui1Home(); setSongView(false); selectTrack(0); openEditor()"], ['drum', "ui1Home(); selectTrack(DRUM_T); openEditor()"], ['clip', "ui1Home(); setSongView(false); selectSlot(0,0); openClipSheet(0,0)"], ['mix', "ui1Home(); mx2Sheet()"], ['video', "ui1Home(); vvOpen()"]]) {
    await pb.evaluate(go); await po.evaluate(go); await pb.waitForTimeout(450); await po.waitForTimeout(450);
    const A = await mainBoxes(pb), B = await mainBoxes(po);
    for (const s of Object.keys(A)) if (A[s] !== B[s]) diffs.push(k + ' ' + s);
  }
  ok(`Nichts verschiebt sich ${vk}: Kopfleiste, Matrix, Song, Leisten, Tastatur und alle Tasten der Blatt-Köpfe liegen wie in der Basis`, diffs.length === 0, diffs.slice(0, 6));
  await close(pb); await close(po);
}
{
  const p = await open(FILE, P.p); await setup(p);
  const j0 = await p.evaluate(() => JSON.stringify(SYNQUENZER.project()));
  await p.evaluate(async () => { SYNQUENZER.ori.rs(true); openMenu(); SYNQUENZER.ori.more('Klang', true); ui1Home(); tkSheet({t: window.__tk.track, s: 2}); SYNQUENZER.ori.frame(); SYNQUENZER.ori.back(); SYNQUENZER.ori.rs(false); SYNQUENZER.ori.more('Klang', false); });
  await p.waitForTimeout(400);
  const j1 = await p.evaluate(() => JSON.stringify(SYNQUENZER.project()));
  const strip = s => { const o = JSON.parse(s); delete o.ui; return JSON.stringify(o); };   // ui.selT/selS = die gewählte Spur (Tipp zurück wählt sie, wie jeder Tipp)
  ok('Nichts im Projekt: Projekt-Datei vor/nach Wo-bin-ich, Mehr ▾, Raumschiff-Look gleich (außer der gewählten Spur); kein „ori“ darin', strip(j0) === strip(j1) && !/"(orirs|oriMore|oriwo|oria|ori)"/.test(j1), {len: [j0.length, j1.length]});
  await close(p);
}
{ // altes Projekt (Datei der Basis) lädt gleich
  const pb = await open(BASIS, P.p); await setup(pb); const jb = await pb.evaluate(() => serializeProject()); await close(pb);
  const p = await open(FILE, P.p); const r = await p.evaluate(j => { importJSON(j); return serializeProject(); }, jb);
  const pb2 = await open(BASIS, P.p); const rb = await pb2.evaluate(j => { importJSON(j); return serializeProject(); }, jb); await close(pb2);
  ok('Altes Projekt lädt gleich (Basis-Datei → Basis vs ORI: gleiche Projekt-Datei)', r === rb, {len: [r.length, rb.length]});
  await close(p);
}

/* ============ H) ORI-P: Befunde des Prüfers (Mikrofon quer, Wo bin ich ohne Song-Stelle, eingeklappte Zeilen im Guide, Lampe, REC, Speicher) ============ */
{
  const bm = await chromium.launch({args: ['--autoplay-policy=no-user-gesture-required', '--use-fake-ui-for-media-stream', '--use-fake-device-for-media-stream']});
  const openM = async (f, vp) => {
    const ctx = await bm.newContext({viewport: {width: vp[0], height: vp[1]}, hasTouch: true, permissions: ['microphone']});
    const p = await ctx.newPage(); const errs = []; p.on('pageerror', e => errs.push(String(e))); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
    await p.goto('file://' + f); await p.waitForFunction(() => window.SYNQUENZER, null, {timeout: 60000}); await p.waitForTimeout(1200); p._errs = errs; p._ctx = ctx; return p;
  };
  const mik = p => p.evaluate(() => {
    const q = UI.pop.el, r = q.getBoundingClientRect(), R_ = e => { const x = e && e.getBoundingClientRect(); return x ? [Math.round(x.top), Math.round(x.bottom)] : null; };
    const go = q.querySelector('.st-go'), hint = q.querySelector('.st-hint'), rb = q.querySelector('.orirec');
    const sc0 = q.scrollTop; q.scrollTop = q.scrollHeight; const hEnd = R_(hint), goEnd = R_(go); q.scrollTop = sc0;
    return {pop: [Math.round(r.top), Math.round(r.bottom)], h: Math.round(r.height), vh: innerHeight, go: R_(go), goTxt: go && go.textContent.trim(), hintEnd: hEnd, goEnd, rec: rb ? {t: R_(rb), w: Math.round(rb.getBoundingClientRect().width), txt: rb.textContent.trim()} : null};
  });
  // (1) Mikrofon-Blatt quer: ganz im Bild (Mikro aus und an), so hoch wie in der Basis; [Mikro an/aus] und der Hinweis erreichbar
  for (const vp of [P.q, P.q2]) {
    const R1 = {};
    for (const [k, f] of [['basis', BASIS], ['ori', FILE]]) {
      const p = await openM(f, vp);
      await p.evaluate(async () => { SYNQUENZER.loadDemo(); ensureAudio(); const sr = 48000, a = new Array(sr * 2).fill(0).map((_, i) => Math.round(7000 * Math.sin(i / 19))); window.__tk = await SYNQUENZER.tkInject({pcm: a, sr, scene: 2, len: 2}); selectTrack(window.__tk.track); stSheet(); });
      await p.waitForTimeout(800); const aus = await mik(p);
      await p.evaluate(() => stStart()); await p.waitForTimeout(2500); const an = await mik(p);
      if (k === 'ori' && vp === P.q) await shot(p, 'ori-mikro-quer.png');
      R1[k] = {aus, an, errs: p._errs.slice(0, 2)}; await close(p);
    }
    const O = R1.ori, B = R1.basis, vh = vp[1];
    const fits = x => x.pop[1] <= vh - 8 + 0.5 && x.goEnd[1] <= vh - 8 + 0.5 && x.hintEnd[1] <= vh - 8 + 0.5;
    // XD1-Anpassung: das Mikrofon-Blatt hat jetzt „Beim Singen hören“ + „Mich selbst hören“ (rechte Spalte) und ist darum höher als in der Basis;
    // [Mikro an/aus] liegt dabei weiter ohne Rollen im Bild (links unter Weg/Verzögerung)
    const inV = x => x.go && x.go[1] <= vh - 8 + 0.5 && x.pop[1] <= vh + 0.5;
    ok(`ORI-P 1 Mikrofon-Blatt quer ${vp.join('×')}: Mikro aus und an ganz im Bild, [Mikro an/aus] und Hinweis erreichbar (XD1: höher, [Mikro an] ohne Rollen sichtbar)`,
      fits(O.aus) && fits(O.an) && inV(O.aus) && inV(O.an) && !O.errs.length, {ori: O, basisH: [B.aus.h, B.an.h]});
  }
  // (6) [● REC] im Mikrofon-Blatt (Schritt 1): ≥ 44 px neben [Mikro an], kein Blatt höher; Fingertipp → Blatt zu, STIMME gewählt, Aufnahme läuft an
  for (const [vk, vp] of [['hochkant', P.p], ['quer', P.q]]) {
    const p = await openM(FILE, vp);
    await p.evaluate(async () => { SYNQUENZER.loadDemo(); ensureAudio(); const sr = 48000, a = new Array(sr * 2).fill(0).map((_, i) => Math.round(7000 * Math.sin(i / 19))); window.__tk = await SYNQUENZER.tkInject({pcm: a, sr, scene: 2, len: 2}); selectSlot(0, 3); stSheet(); });
    await p.waitForTimeout(800); const m0 = await mik(p);
    if (vk === 'hochkant') await shot(p, 'ori-mikro-hochkant.png');
    const rb = await p.evaluate(() => { const r = UI.pop.el.querySelector('.orirec').getBoundingClientRect(), g = UI.pop.el.querySelector('.st-go').getBoundingClientRect(); return {x: r.left + r.width / 2, y: r.top + r.height / 2, w: r.width, h: r.height, sameRow: Math.abs(r.top - g.top) < 1}; });
    await tapAt(p, rb.x, rb.y); await p.waitForTimeout(2500);
    const r = await p.evaluate(() => ({pop: UI.pop ? UI.pop.name : null, selT: R.selT, st: window.__tk.track, rec: rec.state, wait: !!MICW.iv, mic: !!ST.on}));
    await p.evaluate(() => { try { if (rec.state !== 'off') recPress(); stop(); } catch (e) {} }); await p.waitForTimeout(300);
    ok(`ORI-P 6 Mikrofon-Blatt ${vk}: [● REC] (≥ 44 px, in der Zeile von [Mikro an]) – Tipp: Blatt zu, STIMME gewählt, Aufnahme startet (Mikro geht an)`,
      m0.rec && m0.rec.txt === '● REC' && rb.w >= 44 && rb.h >= 44 && rb.sameRow && !r.pop && r.selT === r.st && r.mic && (r.rec !== 'off' || r.wait) && !p._errs.length, {rb, r, errs: p._errs.slice(0, 2)});
    await close(p);
  }
  await bm.close();
}
{ // (2) Wo bin ich: die STIMME-Szene 3 kommt im Song nicht vor → Matrix › Szene 3 › STIMME, Tipp führt in die Matrix
  const p = await open(FILE, P.q);
  await p.evaluate(async () => { SYNQUENZER.loadDemo(); ensureAudio(); const sr = 48000, a = new Array(sr * 2).fill(0).map((_, i) => Math.round(7000 * Math.sin(i / 19))); window.__tk = await SYNQUENZER.tkInject({pcm: a, sr, scene: 2, len: 2});
    SYNQUENZER.songFromChain([{scene: 0, bars: 4}, {scene: 1, bars: 4}]); S.song.marks[0].name = 'Strophe'; S.song.marks[1].name = 'Refrain'; songChanged(); });
  const W2 = {};
  for (const [k, go] of [['takesTakt1', "ui1Home(); setSongView(true); SV.pos = 0; tkSheet({t: window.__tk.track, s: 2})"], ['takesTakt6', "ui1Home(); setSongView(true); SV.pos = 5; tkSheet({t: window.__tk.track, s: 2})"], ['chor', "ui1Home(); setSongView(true); SV.pos = 5; g6Sheet({t: window.__tk.track, s: 2})"]]) {
    await p.evaluate(go); await p.waitForTimeout(500); W2[k] = await p.evaluate(() => SYNQUENZER.ori.ctx().txt);
  }
  const h = await host(p); if (h.x != null) await tapAt(p, h.x, h.y);
  const s = await st(p);
  // Gegenprobe: spielt die Spur die Szene im Song, bleibt es der Teil
  await p.evaluate(() => { ui1Home(); SYNQUENZER.songFromChain([{scene: 0, bars: 4}, {scene: 2, bars: 4}]); S.song.marks[1].name = 'Refrain'; songChanged(); setSongView(true); SV.pos = 0; tkSheet({t: window.__tk.track, s: 2}); });
  await p.waitForTimeout(500); const im = await p.evaluate(() => SYNQUENZER.ori.ctx().txt);
  ok('ORI-P 2 Wo bin ich: Szene nicht im Song → „Matrix › Szene 3 › STIMME“ (Takes Takt 1/6, Chor), Tipp → Matrix, Szene 3; im Song → „Song › Refrain › STIMME“',
    Object.values(W2).every(x => x === 'Matrix › Szene 3 › STIMME') && !s.song && s.selS === 2 && !s.pop && im === 'Song › Refrain › STIMME' && !p._errs.length, {W2, nach: {song: s.song, selT: s.selT, selS: s.selS, pop: s.pop}, im});
  await close(p);
}
{ // (3) + (5) jede eingeklappte Zeile: der eigene Name findet sie zuerst, der Sprung landet genau dort, sichtbar; nur ihr Abschnitt geht auf
  const p = await open(FILE, P.p); await setup(p);
  const rare = await p.evaluate(() => SYNQUENZER.ori.rare()), bad = [], open1 = [];
  let n = 0, hMax = 0;
  const h0 = await p.evaluate(async () => { ui1Home(); setUiPref('oriMore', {}); openMenu(); await new Promise(r => setTimeout(r, 150)); return EL.menu.querySelector('.mb').scrollHeight; });
  for (const [sec, rows] of Object.entries(rare)) for (const k of rows) {
    const r = await p.evaluate(async ([sec, k]) => {
      ui1Home(); openMenu(); await new Promise(r => setTimeout(r, 120));
      const hit = ui1Search(k)[0]; if (!hit) return {hit: null};
      SYNQUENZER.ui1.jump(hit.id); await new Promise(r => setTimeout(r, 820));
      const t = SYNQUENZER.ui1.ring() ? UI1.ring.t : null, rr = t && t.getBoundingClientRect();
      const lbl = t && t.matches && t.matches('.mrow') ? (t.querySelector(':scope > .lbl') ? t.querySelector(':scope > .lbl').textContent.trim() : (t.querySelector('button') || {}).textContent) : null;
      const secOf = t && t.closest('.msec'), h3 = secOf && secOf.querySelector(':scope > h3');
      return {hit: hit.n, id: hit.id, lbl: lbl && lbl.trim(), sec: h3 && h3.textContent.trim(), vis: !!(rr && rr.top >= 0 && rr.bottom <= innerHeight), open: [...EL.menu.querySelectorAll('.orimore')].filter(g => !g.hidden).length, mh: EL.menu.querySelector('.mb').scrollHeight};
    }, [sec, k]);
    // eigene Einträge (orizeile…): genau die Zeile; Einträge anderer Pakete (Haptik, Eine Skala, Aufzeichnung): ihr Eintrag zuerst, Ziel im Abschnitt wie in der Basis
    const good = r.hit && r.sec === sec && r.vis && r.open === 1 && (/^orizeile/.test(r.id) ? r.lbl === k : r.hit === k);
    if (good) n++; else bad.push(sec + ' › ' + k + ' ' + JSON.stringify(r));
    if (r.mh > hMax) hMax = r.mh;
  }
  const total = Object.values(rare).reduce((a, x) => a + x.length, 0);
  ok(`ORI-P 3 Guide: alle ${total} eingeklappten Zeilen – eigener Name findet sie zuerst, Sprung landet genau dort und ist sichtbar`, n === total, {n, bad: bad.slice(0, 6)});
  const nE = await p.evaluate(() => ({all: SYNQUENZER.ui1.entries().length, orizeile: SYNQUENZER.ui1.entries().filter(e => /^orizeile/.test(e.id)).length}));
  ok('ORI-P 3 Guide: 20 neue Einträge für eingeklappte Zeilen (3 hatten schon einen)', nE.orizeile === total - 3, nE);
  ok('ORI-P 5 Guide-Sprung in Eingeklapptes: nur der eine Abschnitt geht auf (Menü bleibt kurz), nicht gemerkt', !bad.some(x => /"open":(?!1)/.test(x)) && hMax < h0 * 2.2 && !Object.keys(await p.evaluate(() => uiPrefs().oriMore || {})).length, {zu: h0, hoechstens: hMax});
  ok('keine Konsolenfehler (ORI-P Guide)', p._errs.length === 0, p._errs.slice(0, 3));
  await close(p);
}
for (const [vk, vp] of [['hochkant', P.p], ['quer', P.q]]) { // (4) Lampe: neu geöffnet = Auswählen; folgt dem Rollen; (7) Speicher-Zeile unter Aufräumen
  const p = await open(FILE, vp); await setup(p);
  const lit = () => p.evaluate(() => ({bar: [...UI.pop.el.querySelectorAll('.origs > .on')].map(b => b.dataset.origs).join(), sec: [...UI.pop.el.querySelectorAll('.orisec.on')].map(s => s.dataset.sec).join(), top: Math.round(UI.pop.el.scrollTop)}));
  await p.evaluate(() => { ui1Home(); tkSheet({t: window.__tk.track, s: 2}); }); await p.waitForTimeout(500);
  const g = await gs(p), be = g.btn.find(x => x.k === 'edit'); await tapAt(p, be.x, be.y); await p.waitForTimeout(500);
  const a1 = await lit();
  const x = await p.evaluate(() => { const r = UI.pop.el.querySelector('.psh-x').getBoundingClientRect(); return {x: r.left + r.width / 2, y: r.top + r.height / 2}; }); await tapAt(p, x.x, x.y);
  await p.evaluate(() => tkSheet({t: window.__tk.track, s: 2})); await p.waitForTimeout(500);
  const a2 = await lit();
  // von Hand rollen: in den Teil Bearbeiten (nur wo das Blatt rollt), dann zurück nach oben
  const canScroll = await p.evaluate(() => UI.pop.el.scrollHeight > UI.pop.el.clientHeight + 40);
  let a3 = null, a4 = null;
  if (canScroll) {
    await p.evaluate(() => { const q = UI.pop.el, s = q.querySelector('.orisec[data-sec="edit"]'), br = q.querySelector(':scope > .origs').getBoundingClientRect().bottom; q.scrollTop += s.getBoundingClientRect().top - br - 2; }); await p.waitForTimeout(300); a3 = await lit();
    await p.evaluate(() => { UI.pop.el.scrollTop = 0; }); await p.waitForTimeout(300); a4 = await lit();
  }
  const mem = await p.evaluate(() => { const bd = UI.pop.el.querySelector('.g10c-bd'), f = bd.querySelector(':scope > .g10c-foot'), n = f && f.nextElementSibling; return {after: !!(n && /^Speicher\b/.test(n.textContent.trim())), txt: n && n.textContent.trim().slice(0, 24), beforeEdit: !!(n && n.nextElementSibling && n.nextElementSibling.matches('.orisec[data-sec="edit"]'))}; });
  ok(`ORI-P 4 Gesang-Lampe ${vk}: Bearbeiten → an; Blatt zu und wieder auf → Auswählen${canScroll ? '; von Hand in Bearbeiten gerollt → Bearbeiten, zurück → Auswählen' : ' (Blatt rollt nicht)'}`,
    a1.bar === 'edit' && a1.sec === 'edit' && a2.bar === 'pick' && a2.sec === 'pick' && a2.top === 0 && (!canScroll || (a3.bar === 'edit' && a3.sec === 'edit' && a4.bar === 'pick')), {a1, a2, a3, a4, canScroll});
  ok(`ORI-P 7 Takes ${vk}: die Speicher-Zeile steht im Teil „2 · Auswählen“ direkt unter Aufräumen`, mem.after && mem.beforeEdit, mem);
  ok(`keine Konsolenfehler (ORI-P Lampe ${vk})`, p._errs.length === 0, p._errs.slice(0, 3));
  await close(p);
}

/* ============ G) Regeln im ORI-Block ============ */
{
  const html = fs.readFileSync(FILE, 'utf8'), a = html.indexOf('/* ===== ORI-BEGIN'), e = html.indexOf('/* ===== ORI-END ===== */'), blk = html.slice(a, e);
  const brands = ['Korg', 'microKORG', 'RADIAS', 'DWGS', 'Kodamo', 'Mask1', 'Nord', 'Kompakt', 'Clavia', 'Star Trek', 'Star-Trek', 'LCARS', 'Enterprise'].filter(w => blk.includes(w));
  const emo = blk.match(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu) || [];
  ok('ORI-Block: keine Marken-/Serien-Namen, keine Emojis', a > 0 && e > a && !brands.length && !emo.length, {brands, emo: emo.slice(0, 5)});
  const all = ['Korg', 'microKORG', 'RADIAS', 'DWGS', 'Kodamo', 'Mask1', 'Nord', 'Kompakt', 'Clavia'].map(w => [w, html.split(w).length - 1]).filter(x => x[1]);
  ok('Datei: Markenwörter 0, „MS 2000“ genau 1×, „  live: true,“ genau 1×', !all.length && html.split('MS 2000').length - 1 === 1 && html.split('  live: true,').length - 1 === 1, {all, ms: html.split('MS 2000').length - 1, live: html.split('  live: true,').length - 1});
}

await b.close();
const nOk = res.filter(r => r.pass).length;
fs.writeFileSync(path.join(OUT, 'ori-ergebnis.json'), JSON.stringify(res, null, 1));
console.log((nOk === res.length ? 'ALLE OK' : 'FEHLER') + ' (' + nOk + '/' + res.length + ')');
process.exit(nOk === res.length ? 0 : 1);
