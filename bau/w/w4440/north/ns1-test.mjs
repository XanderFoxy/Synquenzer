// NS1 – North-Klang: ein gezielter Prüflauf (Chromium). Aufruf: node ns1-test.mjs <neu.html> <basis.html>
// 1 Werks-Golden: alle 45 Programme + 4 Kits offline in NEU und BASIS rendern, Prüfsumme bitgleich
// 2 H-Familie: Pegel bei SPECTRA 0 (Formant auf dem Grundton) jetzt im Rahmen der anderen Wellen
// 3 live: Kicks über den Transport; ■ und sofort ▶ (Song ab Takt im Lauf): der erste Kick nach dem Neustart klingt
// 4 erster Tipp, bevor das Modul geladen ist, klingt (verspätet, nicht verworfen)
// 5 Fotos: Drum-Editor (Kick H1, Formant-Zeile) hochkant 428x926, Platte quer 926x428; das ✕ ist sichtbar
import { chromium } from '/opt/node-tools/node_modules/playwright/index.mjs'; import path from 'node:path';
const NEW = path.resolve(process.argv[2] || 'index.html'), OLD = path.resolve(process.argv[3] || '../basis.html'), DIR = path.dirname(NEW);
const res = {}; const ok = (k, v, info) => { res[k] = {ok: !!v, ...(info || {})}; console.log((v ? 'OK   ' : 'FAIL ') + k + ' ' + JSON.stringify(info || {})); };
const b = await chromium.launch({args: ['--autoplay-policy=no-user-gesture-required']});
async function open(file, vp) { const p = await b.newPage({viewport: vp || {width: 428, height: 926}}); p.errs = []; p.on('pageerror', e => p.errs.push(String(e))); p.on('console', m => { if (m.type() === 'error') p.errs.push(m.text()); });
  await p.goto('file://' + file); await p.waitForFunction(() => window.SYNQUENZER && SYNQUENZER.version, null, {timeout: 30000}); await p.waitForTimeout(500); return p; }
// ---------- 1 + 2 offline ----------
const offline = async p => p.evaluate(async () => {
  const hash = x => { let h1 = 0x811c9dc5 >>> 0, h2 = 0; const u = new Uint32Array(x.buffer, x.byteOffset, x.length); for (let i = 0; i < u.length; i++) { h1 = Math.imul(h1 ^ u[i], 16777619) >>> 0; h2 = (h2 + u[i] * (i % 997 + 1)) % 4294967291; } return h1.toString(16) + ':' + h2; };
  const pk = x => { let m = 0; for (const v of x) m = Math.max(m, Math.abs(v)); return 20 * Math.log10(m || 1e-12); };
  const out = {progs: {}, kits: {}, h: {}};
  for (const p of MDX.progs) { const r = await MDX.render({sr: 48000, sec: 1.5, chans: {0: p}, hits: [{ch: 0, at: 0.01, v: 1}, {ch: 0, at: 0.8, v: 0.5, acc: 0.5, tune: 3, dec: 1.5}]}); out.progs[p.mName] = hash(r.l) + '/' + hash(r.r); }
  const PAT = [[0, 4, 8, 12], [4, 12], [7, 15], [12], [0, 2, 4, 6, 8, 10, 12, 14], [14], [9], [10], [11], [0], [3, 7, 11, 15], [1, 5, 9, 13]];
  for (const K of MDX.kits) { const chans = {}; MDX.ORDER.forEach((id, i) => { chans[i] = K.slots[id]; }); const hits = []; for (let s = 0; s < 16; s++) PAT.forEach((P, ch) => { if (P.includes(s)) hits.push({ch, at: 0.05 + s * 0.125, v: s % 4 ? 0.7 : 1}); });
    const r = await MDX.render({sr: 48000, sec: 3, chans, hits, kit: K.md}); out.kits[K.name] = hash(r.l) + '/' + hash(r.r); }
  for (const w of ['A1', 'A4', 'd6', 'H1', 'H2', 'H5', 'H6']) { const r = await MDX.render({sr: 48000, sec: 1, chans: {0: Object.assign({}, MDX.INIT, {mWav: w})}, hits: [{ch: 0, at: 0.01, v: 1}]}); out.h[w] = +pk(r.l).toFixed(1); }
  return out;
});
const pn = await open(NEW), po = await open(OLD);
const on = await offline(pn), oo = await offline(po);
const diffP = Object.keys(oo.progs).filter(k => oo.progs[k] !== on.progs[k]), diffK = Object.keys(oo.kits).filter(k => oo.kits[k] !== on.kits[k]);
ok('1 Werksprogramme bitgleich (45, je 2 Schläge)', Object.keys(oo.progs).length === 45 && !diffP.length, {anders: diffP});
ok('1 Werks-Kits bitgleich (4, Groove 1 Takt)', Object.keys(oo.kits).length === 4 && !diffK.length, {anders: diffK});
const hMax = Math.max(on.h.H1, on.h.H2, on.h.H5, on.h.H6), hOld = Math.max(oo.h.H1, oo.h.H2, oo.h.H5, oo.h.H6);
ok('2 H-Wellen bei INIT nicht mehr heiß (Spitze <= -3 dBFS, vorher > 0)', hMax <= -3 && hOld > 0, {neu: on.h, alt: oo.h});
await po.close();
// ---------- 3 + 4 live ----------
const live = await pn.evaluate(async () => {
  const sleep = ms => new Promise(r => setTimeout(r, ms)), Q = SYNQUENZER, out = {};
  Q.newProject(); await sleep(300); ensureAudio();
  // 4: erster Tipp vor dem Laden des Moduls (das Modul lädt erst mit dem ersten North-Pad)
  out.stBefore = MDS.st; Q.setPadSource('kick', 'md'); drumAudition(0, 1);
  for (let k = 0; k < 80 && !(AU.ctx && AU.ctx.state === 'running' && MDS.st === 'ready'); k++) await sleep(50);
  await sleep(30); const s1 = await MDS.E.test({q: 'state'}); out.firstTap = s1 && s1.state ? s1.state.voices[0] : -1;
  await sleep(600);
  // 3: Kicks auf jeder Viertel, Abgriff am Ausgang des North-Knotens
  const s = R.selS; Q.setClip(DRUM_T, s, null); for (const st of [0, 4, 8, 12]) toggleStep('kick', st, 0);
  const c = AU.ctx, sp = c.createScriptProcessor(2048, 2, 2), g = c.createGain(); g.gain.value = 0; const rec = [];
  sp.onaudioprocess = e => rec.push({t: e.playbackTime, d: e.inputBuffer.getChannelData(0).slice()}); MDS.node.connect(sp); sp.connect(g); g.connect(c.destination);
  const port = MDS.node.port, orig = port.postMessage.bind(port), sent = [];
  port.postMessage = m => { if (m && m.t === 'hit') for (const h of m.list) sent.push(h.at); return orig(m); };
  let OFF = null;
  const pkAt = (a, b2) => { let pk = 0, on = null; for (const bl of rec) { const t0 = bl.t, n = bl.d.length; if (t0 > b2 + 0.1 || t0 + n / c.sampleRate < a - 0.1) continue; for (let i = 0; i < n; i++) { const t = t0 + i / c.sampleRate; if (t < a || t > b2) continue; const x = Math.abs(bl.d[i]); if (on == null && x > 0.003) on = t; if (x > pk) pk = x; } } return {pk, on}; };
  const kicks = (a, b2) => sent.filter(t => t >= a && t <= b2).map(t => { if (OFF == null) { const q = pkAt(t - 0.02, t + 0.3); OFF = q.on - t; } return +(20 * Math.log10(pkAt(t + OFF - 0.004, t + OFF + 0.05).pk || 1e-9)).toFixed(1); });
  const tA = c.currentTime; launch(DRUM_T, s); play(); await sleep(2 * 2000 + 200); stop(); await sleep(400); out.A = kicks(tA - 0.2, c.currentTime);
  const tB = c.currentTime; for (let k = 0; k < 5; k++) { launch(DRUM_T, s); play(); await sleep(700); stop(); play(); await sleep(700); stop(); await sleep(300); } out.B = kicks(tB, c.currentTime);
  out.late = MDS.E.late; return out;
});
ok('4 erster Tipp vor dem Laden klingt', live.stBefore !== 'ready' && live.firstTap === 1, {stVorher: live.stBefore, stimmen: live.firstTap});
ok('3a Kicks im Lauf: alle hörbar (> -20 dBFS am North-Ausgang)', live.A.length >= 8 && live.A.every(x => x > -20), {kicks: live.A});
ok('3b ■ und sofort ▶ (5×): jeder Kick klingt, auch der erste nach dem Neustart', live.B.length >= 15 && live.B.every(x => x > -20), {kicks: live.B});
// ---------- 5 Fotos ----------
await pn.evaluate(async () => { soundEdit(DRUM_T, 'NS1 Foto', () => { Object.assign(drumSnd().p.slots.kick.md, {mWav: 'H1', mSpc: 20}); drumChanged('kick'); });
  R.selT = DRUM_T; openEditor(); ED.dVoice = 0; ED.dTab = 'sound'; MDE.sub = 'tone'; buildDrumEd(); await new Promise(r => setTimeout(r, 400)); });
await pn.screenshot({path: path.join(DIR, 'ns1-hoch-editor.png')});
const lab = await pn.evaluate(() => { const t = [...document.querySelectorAll('#drumSheet *, .sheet.open *')].map(e => e.childElementCount === 0 ? e.textContent : '').filter(s => /Formant/.test(s)); const fc = 440 * Math.pow(2, (MDX.INIT.mPit - 69) / 12); return {labels: t.slice(0, 3), pit: drumSnd().p.slots.kick.md.mPit}; });
const want = Math.round(440 * Math.pow(2, (lab.pit - 69) / 12) * Math.pow(2, 5 * 20 / 99));
ok('5a SPECTRA-Zeile zeigt den Formant der Engine (H1, SPECTRA 20)', lab.labels.some(s => s.includes(String(want))), {zeile: lab.labels, soll: want + ' Hz'});
const xVis = async (p, sel) => p.evaluate(sel => { const vw = innerWidth, vh = innerHeight; return [...document.querySelectorAll(sel)].some(e => { const r = e.getBoundingClientRect(); return r.width >= 1 && r.left >= 0 && r.right <= vw && r.top >= 0 && r.bottom <= vh && getComputedStyle(e).visibility !== 'hidden'; }); }, sel);
ok('5b ✕ hochkant sichtbar', await xVis(pn, '[aria-label="Schließen"], .ashx'), {});
await pn.setViewportSize({width: 926, height: 428}); await pn.evaluate(async () => { ndpOpen(); await new Promise(r => setTimeout(r, 600)); });
await pn.screenshot({path: path.join(DIR, 'ns1-quer-platte.png')});
ok('5c ✕ der Platte quer sichtbar', await xVis(pn, '.ndpx'), {});
ok('Konsole ohne Fehler', !pn.errs.length, {fehler: pn.errs.slice(0, 3)});
const n = Object.values(res).filter(x => x.ok).length; console.log(`\nNS1: ${n}/${Object.keys(res).length} OK`);
await b.close();
