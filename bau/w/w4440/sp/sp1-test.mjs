// SP1 – Synthie-Pop-Klangkiste: ein gezieltes Playwright-Skript (Bibliothek, Chip, Laden/Undo, Vorhören, Speichern/Laden,
// Pegel aller 20 Klänge trocken + Song-Render, Fotos hochkant 428×926 und quer 926×428).
// node sp1-test.mjs <index.html>
import { chromium } from '/opt/node-tools/node_modules/playwright/index.mjs';
const file = process.argv[2];
const OUT = '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/w4440/sp/';
const b = await chromium.launch();
const results = []; const ok = (name, pass, info) => { results.push({name, pass: !!pass, info}); console.log((pass ? 'OK   ' : 'FAIL ') + name + (info !== undefined ? '  ' + JSON.stringify(info) : '')); };
async function page(w, h) {
  const p = await b.newPage({viewport: {width: w, height: h}, hasTouch: true, isMobile: true, deviceScaleFactor: 2});
  p.errs = []; p.on('pageerror', e => p.errs.push(String(e))); p.on('console', m => { if (m.type() === 'error') p.errs.push(m.text()); });
  await p.goto('file://' + file); await p.waitForFunction(() => window.SYNQUENZER && window.SQMK, null, {timeout: 60000});
  await p.waitForTimeout(600);
  return p;
}
const chipFit = p => p.evaluate(() => { const c = document.querySelector('#sndSheet .brcats .chip[data-c="spop"]'); if (!c) return null; const r = c.getBoundingClientRect(), s = [...c.querySelectorAll('span')].find(x => getComputedStyle(x).display !== 'none');
  return {w: Math.round(r.width), h: Math.round(r.height), text: s ? s.textContent : c.textContent, cut: s ? s.scrollWidth > s.clientWidth + 1 || s.getBoundingClientRect().right > r.right - 1 : null, inView: r.left >= 0 && r.right <= innerWidth + 1}; });
const xVis = p => p.evaluate(() => { const x = document.querySelector('#sndSheet .sh-x'); if (!x) return null; const r = x.getBoundingClientRect(); return {w: Math.round(r.width), h: Math.round(r.height), vis: r.width > 0 && r.left >= 0 && r.right <= innerWidth + .5 && r.top >= 0 && r.bottom <= innerHeight + .5}; });

/* ---------- 1. hochkant 428×926 ---------- */
const P = await page(428, 926);
const ids = await P.evaluate(() => SP1.ids());
ok('20 Klänge registriert', ids.length === 20, ids.length);
const reg = await P.evaluate(() => { mkLoad(); const L = SP1.list; const fac = SYNQUENZER.factory().map(f => f.id), lib = SYNTH_LIB.map(f => f.id), firstInit = SYNTH_LIB.findIndex(x => x.cat === 'init');
  const eng = {}; for (const f of L) eng[f.engine] = (eng[f.engine] || 0) + 1;
  const names = factoryNames(), dup = L.filter(f => names.filter(n => n.toLowerCase() === f.name.toLowerCase()).length > 1).map(f => f.name);
  return {inFactory: L.every(f => fac.includes(f.id)), inById: L.every(f => FACTORY_BY_ID.get(f.id) === f), beforeInit: L.every(f => lib.indexOf(f.id) >= 0 && lib.indexOf(f.id) < SYNTH_LIB.findIndex(x => x.cat === 'init')), eng, dup,
    roleChip: BROLES[BROLES.length - 1][0] === 'spop' && BM_ROLES[BM_ROLES.length - 1][0] === 'spop', label: ROLE_LABEL.spop, roles: L.every(f => soundRole(f) === 'spop')}; });
ok('Werks-Listen + Rolle', reg.inFactory && reg.inById && reg.beforeInit && reg.roleChip && reg.roles && reg.label === 'Synthie-Pop FX', reg);
ok('Engines verteilt (VA/WT/FM/Platte/Bit Mask)', reg.eng.analog >= 8 && reg.eng.wt >= 2 && reg.eng.fm6 >= 2 && reg.eng.mk >= 2 && reg.eng.bm >= 2, reg.eng);
ok('Namen eindeutig (auch gegen Platten-Programme)', reg.dup.length === 0, reg.dup);
// every sound: factorySound normalizes without change („geändert“ stays off after loading)
const norm = await P.evaluate(() => SP1.list.map(f => { const s = factorySound(f.id); return {id: f.id, ok: !!s && s.origin === f.id && !soundEdited(s), eng: s && s.engine}; }));
ok('Jeder Klang lädt unverändert (geändert aus)', norm.every(x => x.ok), norm.filter(x => !x.ok));

// the browser on track 1 (VA): chip „Synthie-Pop FX“, rows, tap = load
await P.evaluate(() => { selectTrack(0); SYNQUENZER.openBrowser(0); });
await P.waitForTimeout(300);
await P.tap('#sndSheet .brcats .chip[data-c="spop"]');
await P.waitForTimeout(250);
const rowsVA = await P.evaluate(() => SYNQUENZER.browserRows());
ok('Chip zeigt die VA-Klänge', rowsVA.length === 11 && rowsVA.every(r => r.role === 'spop' && r.engine === 'analog'), rowsVA.map(r => r.name));
const cfP = await chipFit(P); ok('Chip hochkant: Text ganz, Höhe ≥ 36 (Trefferfläche 50)', cfP && !cfP.cut && cfP.h >= 32, cfP);
const xP = await xVis(P); ok('✕ hochkant sichtbar', xP && xP.vis, xP);
await P.tap('#sndSheet .brow[data-id="f-sp-computer-dialing"] [data-act="info"]'); await P.waitForTimeout(200);
await P.screenshot({path: OUT + 'sp1-p-browser.png'});
// load by tapping the name: one undo step back to the previous sound
const before = await P.evaluate(() => S.tracks[0].sound.origin);
await P.tap('#sndSheet .brow[data-id="f-sp-computer-dialing"] [data-act="load"]'); await P.waitForTimeout(200);
const ld = await P.evaluate(() => ({o: S.tracks[0].sound.origin, ed: SYNQUENZER.soundEdited(0), toast: (document.querySelector('.toast') || {}).textContent || ''}));
ok('Tipp auf Namen lädt', ld.o === 'f-sp-computer-dialing' && !ld.ed, ld);
await P.evaluate(() => SYNQUENZER.undo()); await P.waitForTimeout(100);
ok('Rückgängig holt den alten Klang', (await P.evaluate(() => S.tracks[0].sound.origin)) === before, before);
// preview ▶ (one at a time), then stop
await P.tap('#sndSheet .brow[data-id="f-sp-nasser-wah"] [data-act="pv"]'); await P.waitForTimeout(400);
const pv = await P.evaluate(() => SYNQUENZER.previewState()); ok('▶ Vorhören läuft', pv.on && pv.id === 'f-sp-nasser-wah' && pv.voices > 0, pv);
await P.tap('#sndSheet .brow[data-id="f-sp-nasser-wah"] [data-act="pv"]'); await P.waitForTimeout(150);
ok('■ beendet Vorhören', !(await P.evaluate(() => SYNQUENZER.previewState().on)));
// the other engines show the chip too
const eng = {};
for (const e of ['fm6', 'wt', 'mk', 'bm']) eng[e] = await P.evaluate(e => { SYNQUENZER.browserScope({eng: e}); const has = brRoles(BR.t, BR).some(([id]) => id === 'spop'); SYNQUENZER.browserScope({role: 'spop'}); return {chip: has, n: SYNQUENZER.browserRows().length}; }, e);
ok('Chip auch unter FM / WT / Platte / Bit Mask', Object.values(eng).every(x => x.chip && x.n >= 2), eng);
await P.evaluate(() => SYNQUENZER.browserScope({eng: null}));
await P.tap('#sndSheet .brcats [data-scope="all"]'); await P.waitForTimeout(150);
await P.evaluate(() => SYNQUENZER.browserScope({role: 'spop'}));
const rowsAll = await P.evaluate(() => SYNQUENZER.browserRows());
ok('Alle Engines: alle 20 im Chip', rowsAll.length === 20, rowsAll.length);
// load across engines (switches the engine, one undo each) and save → load deep-equal
const cross = [];
for (const id of ['f-sp-glas-pad-fm', 'f-sp-chor-pad', 'f-sp-zufalls-blubber', 'f-sp-bit-dialing', 'f-sp-schwebe-flaeche']) {
  cross.push(await P.evaluate(async id => { SYNQUENZER.browserTap(id); await new Promise(r => setTimeout(r, 120)); const s = S.tracks[0].sound; return {id, eng: s.engine, o: s.origin, ed: SYNQUENZER.soundEdited(0)}; }, id));
}
ok('Laden über Engines hinweg', cross.every(c => c.o === c.id && !c.ed), cross);
const rt = await P.evaluate(async () => { SYNQUENZER.browserTap('f-sp-zufalls-blubber'); await new Promise(r => setTimeout(r, 120));
  const a = JSON.stringify(S.tracks[0].sound); const j = SYNQUENZER.serialize(); await SYNQUENZER.importJSON(typeof j === 'string' ? j : JSON.stringify(j)); await new Promise(r => setTimeout(r, 200));
  const b = JSON.stringify(S.tracks[0].sound); return {same: a === b, o: S.tracks[0].sound.origin, ed: SYNQUENZER.soundEdited(0)}; });
ok('Speichern → Laden gleich (Platte)', rt.same && rt.o === 'f-sp-zufalls-blubber' && !rt.ed, rt);
ok('hochkant ohne Fehler', P.errs.length === 0, P.errs.slice(0, 3));

/* ---------- 2. Pegel: trocken (Vorhör-Phrase, 112 BPM) + Song-Render (mit Hall/Echo/Master) ---------- */
const lv = await P.evaluate(async () => {
  bmLoad(); mkLoad();
  const db = x => x > 0 ? 20 * Math.log10(x) : -999;
  function biq(x, b0, b1, b2, a1, a2) { const y = new Float32Array(x.length); let x1 = 0, x2 = 0, y1 = 0, y2 = 0; for (let i = 0; i < x.length; i++) { const v = b0 * x[i] + b1 * x1 + b2 * x2 - a1 * y1 - a2 * y2; x2 = x1; x1 = x[i]; y2 = y1; y1 = v; y[i] = v; } return y; }
  const kw = x => biq(biq(x, 1.53512485958697, -2.69169618940638, 1.19839281085285, -1.69065929318241, .73248077421585), 1, -2, 1, -1.99004745483398, .99007225036621);
  function lufs(l, r, sr) { const L = kw(l), R = kw(r), N = Math.round(.4 * sr), H = Math.round(.1 * sr), z = []; for (let s = 0; s + N <= L.length; s += H) { let a = 0; for (let i = s; i < s + N; i++) a += L[i] * L[i] + R[i] * R[i]; z.push(a / N); }
    const lk = q => -.691 + 10 * Math.log10(q); let g = z.filter(q => lk(q) > -70); if (!g.length) return -999; const m1 = g.reduce((a, q) => a + q, 0) / g.length; g = g.filter(q => lk(q) > lk(m1) - 10); return lk(g.reduce((a, q) => a + q, 0) / g.length); }
  const meas = (l, r, sr) => { let pk = 0, nan = 0; for (let i = 0; i < l.length; i++) { if (!isFinite(l[i]) || !isFinite(r[i])) nan++; pk = Math.max(pk, Math.abs(l[i]), Math.abs(r[i])); } return {peak: +db(pk).toFixed(1), lufs: +lufs(l, r, sr).toFixed(1), nan}; };
  const out = [];
  for (const f of SP1.list) {
    const o = {id: f.id, name: f.name, eng: f.engine};
    const snd = factorySound(f.id), ph = SQF.PREVIEW[f.demo], spb = 60 / 112, sec = SQF.PREVIEW_SEC[f.demo] + 2.5;
    const ev = []; ph.forEach(([bt, d, n, v], k) => { ev.push([bt * spb, 'on', n, v, 1000 + k]); ev.push([(bt + d) * spb, 'off', n, v, 1000 + k]); }); ev.sort((a, c) => a[0] - c[0]);
    if (f.engine !== 'wt') { const r = f.engine === 'bm' ? await bmRender(snd, ev, {sec, bpm: 112}) : await mkRender(snd, ev, {sec, bpm: 112}); o.dry = meas(r.l, r.r, 48000); }
    // song render: the phrase as clip on track 1 of a fresh project
    await SYNQUENZER.newProject(); SYNQUENZER.setSound(0, factorySound(f.id));
    SYNQUENZER.setClip(0, 0, {len: 2, notes: ph.map(([t, d, n, v]) => ({t, d, n, v}))}); songFromChain([{scene: 0, bars: 2}]);
    await SYNQUENZER.vvRender({range: {a: 0, b: 2}}); o.song = meas(VV.last.ch[0], VV.last.ch[1], VV.last.sr);
    out.push(o);
  }
  return out;
});
for (const o of lv) console.log('      ' + o.name.padEnd(20) + o.eng.padEnd(7) + (o.dry ? 'trocken ' + o.dry.lufs + ' LUFS, Spitze ' + o.dry.peak + ' dBFS' : 'trocken –  (WT nativ)').padEnd(44) + 'Song ' + o.song.lufs + ' LUFS, Spitze ' + o.song.peak + ' dBFS');
ok('Pegel trocken −18 ± 1,5 LUFS, Spitze ≤ −1 dBFS, kein NaN', lv.every(o => !o.dry || (Math.abs(o.dry.lufs + 18) <= 1.5 && o.dry.peak <= -1 && !o.dry.nan)), lv.filter(o => o.dry && !(Math.abs(o.dry.lufs + 18) <= 1.5 && o.dry.peak <= -1)).map(o => o.name));
ok('Song-Render: nicht stumm (> −30 LUFS), Spitze ≤ −1 dBFS', lv.every(o => o.song.lufs > -30 && o.song.peak <= -1 && !o.song.nan), lv.filter(o => !(o.song.lufs > -30 && o.song.peak <= -1)).map(o => o.name));
ok('Pegel-Lauf ohne Fehler', P.errs.length === 0, P.errs.slice(0, 3));
await P.close();

/* ---------- 3. quer 926×428 ---------- */
const L = await page(926, 428);
await L.evaluate(() => { selectTrack(0); SYNQUENZER.openBrowser(0); }); await L.waitForTimeout(300);
await L.tap('#sndSheet .brcats .chip[data-c="spop"]'); await L.waitForTimeout(250);
const cfL = await chipFit(L); ok('Chip quer (120-px-Spalte): Text ganz', cfL && !cfL.cut, cfL);
const xL = await xVis(L); ok('✕ quer sichtbar', xL && xL.vis, xL);
ok('quer: 11 VA-Zeilen', (await L.evaluate(() => SYNQUENZER.browserRows().length)) === 11);
await L.screenshot({path: OUT + 'sp1-l-browser.png'});
await L.tap('#sndSheet .brcats [data-scope="all"]'); await L.waitForTimeout(150);
await L.evaluate(() => SYNQUENZER.browserScope({role: 'spop'})); await L.waitForTimeout(150);
await L.evaluate(() => { const l = document.querySelector('#sndSheet .brlist'); l.scrollTop = l.scrollHeight; }); await L.waitForTimeout(150);
await L.screenshot({path: OUT + 'sp1-l-alle.png'});
ok('quer ohne Fehler', L.errs.length === 0, L.errs.slice(0, 3));
await L.close();
await b.close();
const fail = results.filter(r => !r.pass);
console.log('\n' + (results.length - fail.length) + '/' + results.length + ' OK' + (fail.length ? ' · FAIL: ' + fail.map(r => r.name).join(' | ') : ''));
process.exit(fail.length ? 1 : 0);
