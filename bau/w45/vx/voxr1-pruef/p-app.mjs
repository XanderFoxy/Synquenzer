// Unabhängige Prüfung VOX-R1 im Browser (Abbrechen, nur Entferntes, Speichern/Laden, Marken-Tipp, Speicher, Zusammenspiel G4)
import fs from 'fs';
const file = process.argv[2];
const RV = '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/realvox/dl/';
const SRC = fs.readdirSync(RV).filter(f => /\.wav$/.test(f)).sort((a, b) => parseInt(a.replace(/\D/g, '')) - parseInt(b.replace(/\D/g, '')));
const wav = f => { const b = fs.readFileSync(f); let o = 12, sr = 0, d = null; while (o < b.length) { const id = b.toString('ascii', o, o + 4), n = b.readUInt32LE(o + 4); if (id === 'fmt ') sr = b.readUInt32LE(o + 12); if (id === 'data') d = b.subarray(o + 8, o + 8 + n); o += 8 + n + (n & 1); } return {d, sr}; };
const A = wav(RV + SRC[0]);
const { chromium } = await import('/opt/node-tools/node_modules/playwright/index.mjs');
const b = await chromium.launch(), errs = [];
const p = await b.newPage({viewport: {width: 428, height: 926}, hasTouch: true, isMobile: true});
p.on('pageerror', e => errs.push(String(e))); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
await p.goto('file://' + file); await p.waitForTimeout(2000);
const run = (fn, arg) => p.evaluate('(async () => { const wait = ms => new Promise(r => setTimeout(r, ms)); return (' + fn.toString() + ')(' + JSON.stringify(arg == null ? null : arg) + '); })()');
const OUT = {};
const tk = await run(async o => { const s = atob(o.b), u = new Uint8Array(s.length); for (let i = 0; i < s.length; i++) u[i] = s.charCodeAt(i); const pcm = Array.from(new Int16Array(u.buffer));
  const r = await SYNQUENZER.tkInject({pcm, sr: o.sr, scene: 0, at: 0, len: 2}); await wait(400); window.__tk = r; return r; }, {b: A.d.toString('base64'), sr: A.sr});
const id = tk.id;
// 1) „nur Entferntes“ mit SÄUBERN allein (Gesang reinigen nicht angewandt)
OUT.nurEntferntOhneAnwenden = await run(async o => {
  tkSheet({t: window.__tk.track, s: window.__tk.scene}); await wait(400);
  clSet(o.id, 60); let t0 = Date.now(); while (Date.now() - t0 < 20000) { await wait(200); if (!CL.job.get(o.id) && CL.buf.has(o.id)) break; }
  const hs = SYNQUENZER.clPlayHash(o.id); const bt = document.querySelector('[data-vr1ab]'); const dis = bt ? bt.disabled : null;
  const ab = SYNQUENZER.vr1Ab('weg'); await wait(300); const hw = SYNQUENZER.clPlayHash(o.id); const pressed = bt ? bt.getAttribute('aria-pressed') : null;
  SYNQUENZER.vr1Ab('sauber'); clSet(o.id, 0); await wait(300);
  return {knopfGesperrt: dis, ab, gedrueckt: pressed, gleichWieSauber: hs === hw};
}, {id});
console.log('NUR-ENTFERNT-OHNE', JSON.stringify(OUT.nurEntferntOhneAnwenden));
// 2) Anwenden + Abbrechen mitten in der Rechnung (wie der Knopf: vjob.abort)
OUT.abbrechen = await run(async o => {
  await SYNQUENZER.vr1Pick(o.id, 'mittel'); SYNQUENZER.vr1Apply(o.id); tkPlayBuf(o.id, null); await wait(120);
  const vor = {busy: VXR1.vjob.has(o.id), renders: VXR1.renders};
  const q = VXR1.vjob.get(o.id); if (q) q.j.abort();
  await wait(60); const nach60 = {busy: VXR1.vjob.has(o.id), renders: VXR1.renders, angewandt: !!S.takes[o.id].vr1, knopf: (document.querySelector('[data-vr1a="ap"]') || {}).textContent, st: (document.querySelector('.vr1st') || {}).textContent};
  let t0 = Date.now(); while (Date.now() - t0 < 30000 && VXR1.vjob.has(o.id)) await wait(200);
  return {vor, nach60, fertigNachMs: Date.now() - t0, renders: VXR1.renders, ready: SYNQUENZER.vr1Ver(o.id).ready};
}, {id});
console.log('ABBRECHEN', JSON.stringify(OUT.abbrechen));
// 3) Speichern/Laden: take.vr1 im Projekt, nach dem Laden wieder angewandt?
OUT.speichern = await run(async o => {
  const j = serialize(), has = /"vr1":\{"lv":"mittel"/.test(j);
  const v0 = SYNQUENZER.vr1Ver(o.id);
  applyProject(normalizeProject(JSON.parse(j)), {ui: true}); await wait(800);
  const m = S.takes && S.takes[o.id];
  let b = null; try { b = tkPlayBuf(o.id, null); } catch (e) {}
  const sofort = {vr1: m ? !!m.vr1 : null, lv: m && m.vr1 ? m.vr1.lv : null, rechnet: VXR1.vjob.has(o.id), spieltRoh: b ? b === tkBuffer(o.id) : null};
  let t0 = Date.now(); while (Date.now() - t0 < 30000 && VXR1.vjob.has(o.id)) await wait(200);
  return {imProjekt: has, sofort, fertigNachMs: Date.now() - t0, ready: SYNQUENZER.vr1Ver(o.id).ready, marken: SYNQUENZER.vr1Breaths(o.id).length};
}, {id});
console.log('SPEICHERN', JSON.stringify(OUT.speichern));
// 4) Speicher: was hält VXR1.ver je Take (Fassung + nur Entferntes)
OUT.speicher = await run(async o => { let by = 0, n = 0; for (const [k, c] of VXR1.ver) { if (c.buf) by += c.buf.length * 4 * c.buf.numberOfChannels; if (c.weg) by += c.weg.length * 4; n++; } const m = S.takes[o.id]; return {takes: n, mb: +(by / 1048576).toFixed(1), takeSek: +(m.len / m.sr).toFixed(1), mbJeMinute: +((by / 1048576) / (m.len / m.sr / 60)).toFixed(1)}; }, {id});
console.log('SPEICHER', JSON.stringify(OUT.speicher));
// 5) Gesangs-Effekte an: entzischt die Kette und danach noch einmal G4? (Info der G4-Fassung)
OUT.g4 = await run(async o => { const st = stimmeT(); const g = st >= 0 ? S.tracks[st].gfx : null; let t0 = Date.now(); while (Date.now() - t0 < 30000) { tkPlayBuf(o.id, null); await wait(300); if (!(G4.job.has(o.id) || G4.dq.has(o.id))) break; } const c = G4.cache.get(o.id); return {g4an: !!(g && g.on), ds: g ? g.ds : null, g4Entzischer: c && c.info ? c.info.ds : null, vr1Zischen: (SYNQUENZER.vr1Ver(o.id).info || {}).ess || null}; }, {id});
console.log('G4', JSON.stringify(OUT.g4));
// 6) A/B „nur Entferntes“ bei angewandter Fassung mit Gesangs-Effekten: sofort oder neu rechnen?
OUT.abAngewandt = await run(async o => { tkSheet({t: window.__tk.track, s: window.__tk.scene}); await wait(300); const r0 = G4.renders; SYNQUENZER.vr1Ab('weg'); const b = tkPlayBuf(o.id, null); const g4job = G4.job.has(o.id); await wait(50); let t0 = Date.now(); while (Date.now() - t0 < 30000 && (G4.job.has(o.id) || G4.dq.has(o.id))) { await wait(200); tkPlayBuf(o.id, null); } const ms = Date.now() - t0;
  const c = G4.cache.get(o.id), d = c && c.buf ? c.buf.getChannelData(0) : null, v = VXR1.ver.get(o.id), w = v && v.weg ? v.weg.getChannelData(0) : null; const L = a => { let s = 0; for (let i = 0; i < a.length; i++) s += a[i] * a[i]; return 10 * Math.log10(s / a.length + 1e-20); };
  const res = {g4RechnetNeu: g4job, g4Renders: G4.renders - r0, wartenMs: ms, pegelNurEntferntRoh: w ? +L(w).toFixed(1) : null, pegelNachG4: d ? +L(d).toFixed(1) : null};
  SYNQUENZER.vr1Ab('sauber'); return res; }, {id});
console.log('AB-ANGEWANDT', JSON.stringify(OUT.abAngewandt));
// 7) Marken-Tipp im oberen Streifen: löst er zusätzlich die vorhandene Tipp-Aktion des Editors aus?
OUT.markenTipp = await run(async o => { closePop && closePop(); await wait(200); await SYNQUENZER.vr1Check(o.id); wpOpen({t: window.__tk.track, s: window.__tk.scene}); await wait(700); const E = WP.ed; if (!E || !E.vr1b || !E.vr1b.length) return {hits: E && E.vr1b ? E.vr1b.length : null}; const r = E.cv.getBoundingClientRect(), h = E.vr1b[0];
  return {hits: E.vr1b.length, x: r.x + (h.x0 + h.x1) / 2, y: r.y + 22, breite: +(h.x1 - h.x0).toFixed(1), mk0: JSON.stringify(S.takes[o.id].marks || null).length, sel: JSON.stringify(E.sel || E.vsel || null), play: R.playing, cur: typeof E.cur === 'number' ? E.cur : null}; }, {id});
if (OUT.markenTipp && OUT.markenTipp.x) { const cdp = await p.context().newCDPSession(p); await cdp.send('Input.dispatchTouchEvent', {type: 'touchStart', touchPoints: [{x: OUT.markenTipp.x, y: OUT.markenTipp.y}]}); await cdp.send('Input.dispatchTouchEvent', {type: 'touchEnd', touchPoints: []}); await p.waitForTimeout(400);
  OUT.markenTippNach = await run(async o => { const E = WP.ed; return {offen: !!E, act: SYNQUENZER.vr1Breaths(o.id)[0] && SYNQUENZER.vr1Breaths(o.id)[0].act, mk: JSON.stringify(S.takes[o.id].marks || null).length, sel: JSON.stringify(E && (E.sel || E.vsel) || null), play: R.playing, cur: E && typeof E.cur === 'number' ? E.cur : null}; }, {id}); }
console.log('MARKEN-TIPP', JSON.stringify(OUT.markenTipp), JSON.stringify(OUT.markenTippNach || null));
OUT.fehler = errs.slice(0, 10); console.log('FEHLER', JSON.stringify(OUT.fehler));
fs.writeFileSync(new URL('./p-app.json', import.meta.url), JSON.stringify(OUT, null, 1));
await b.close();
