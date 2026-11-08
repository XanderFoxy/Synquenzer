// VOX2 – Einsingen ohne Chaos (Hören beim Singen / Abhören) + feiner Schneiden (Marken-Editor, ROLLE)
// node vox2-test.mjs <index.html> <ausgabeordner> [basis.html]     – Zeilen OK/FEHLER, Fotos vox2-*.png im Ausgabeordner
import { chromium } from '/opt/node-tools/node_modules/playwright/index.mjs';
import fs from 'node:fs';
const APP = process.argv[2], OUT = (process.argv[3] || '.').replace(/\/$/, '');
const BASE = process.argv[4] || '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/w4500/basis.html';
if (!APP || !APP.startsWith('/')) { console.log('Aufruf: node vox2-test.mjs /abs/index.html /abs/ausgabe [/abs/basis.html]'); process.exit(2); }
fs.mkdirSync(OUT, {recursive: true});
let fail = 0, okN = 0;
const ok = (c, m) => { console.log((c ? 'OK     ' : 'FEHLER ') + m); if (c) okN++; else fail++; };
const sleep = ms => new Promise(r => setTimeout(r, ms));
const MIC = () => {   // Mikro-Attrappe im selben AudioContext (leises Rauschen) – wie vx1-test
  const O = window.AudioContext; window.AudioContext = class extends O { constructor(o) { super(o); window.__ctx = this; } }; window.webkitAudioContext = window.AudioContext;
  if (navigator.mediaDevices) navigator.mediaDevices.getUserMedia = async () => {
    const ctx = window.__ctx, dest = ctx.createMediaStreamDestination(); dest.channelCount = 1; const g = ctx.createGain(); g.gain.value = .0005; g.connect(dest);
    const b = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate), d = b.getChannelData(0); let s = 7; for (let i = 0; i < d.length; i++) { s = (s * 16807) % 2147483647; d[i] = s / 2147483647 - .5; }
    const n = ctx.createBufferSource(); n.buffer = b; n.loop = true; n.connect(g); n.start(); return dest.stream;
  };
};
async function open(br, file, vp, o = {}) {
  const ctx = await br.newContext({viewport: vp, hasTouch: !!o.touch, deviceScaleFactor: 1}), p = await ctx.newPage(), errs = [];
  p.on('pageerror', e => errs.push(String(e))); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  if (o.mic) await p.addInitScript(MIC);
  await p.goto('file://' + file); await p.waitForFunction(() => window.SYNQUENZER && SYNQUENZER.version); await sleep(400);
  return {ctx, p, errs};
}
// Szene 0: STIMME-Take (Ton 330 Hz von 2,5 s bis 6,5 s bei 120 BPM = Takt 2.2 bis 4.2) + MELODIE-Clip aus demselben Take (Noten Schlag 5 … 12)
async function setup(p, full) {
  await p.evaluate(() => { SYNQUENZER.setBpm(120); SYNQUENZER.setMetronome && SYNQUENZER.setMetronome(false); });
  const sr = 48000, n = sr * 8, pcm = new Array(n).fill(0);
  for (let i = full ? 0 : sr * 2.5; i < (full ? n : sr * 6.5); i++) pcm[i] = Math.round(8000 * Math.sin(2 * Math.PI * 330 * i / sr));
  const inj = await p.evaluate(o => SYNQUENZER.tkInject(o), {pcm, sr, scene: 0, len: 4});
  await p.evaluate(id => { const notes = []; for (let b = (id ? 5 : 0); b < (id ? 13 : 16); b++) notes.push({t: b, d: .9, n: 60 + (b % 5), v: .9}); SYNQUENZER.setClip(5, 0, Object.assign({len: 4, key: {root: 0, scale: 'ionian'}, notes}, id ? {take: id} : {})); }, full ? null : inj.id);
  if (full) await p.evaluate(id => { const c = SYNQUENZER.getClip(5, 0); c.take = id; SYNQUENZER.setClip(5, 0, c); }, inj.id);
  return inj;
}
// Pegel je Spur (nach dem Regler = am Knoten cut) und Master, Spitze über ~1 s, dB
const LEVELS = async p => p.evaluate(async () => {
  const c = AU.ctx, buf = new Float32Array(2048), an = AU.tracks.slice(0, NT()).map(A => { if (!A || !A.cut) return null; const a = c.createAnalyser(); a.fftSize = 2048; A.cut.connect(a); return a; });
  const am = c.createAnalyser(); am.fftSize = 2048; AU.masterSum.connect(am);
  const acc = an.map(() => 0); let m = 0;
  for (let k = 0; k < 24; k++) { await new Promise(r => setTimeout(r, 45)); an.forEach((a, i) => { if (!a) return; a.getFloatTimeDomainData(buf); let s = 0; for (const v of buf) s += v * v; acc[i] = Math.max(acc[i], s / buf.length); }); am.getFloatTimeDomainData(buf); for (const v of buf) m = Math.max(m, Math.abs(v)); }
  an.forEach((a, i) => { if (a) try { AU.tracks[i].cut.disconnect(a); } catch (e) {} }); try { AU.masterSum.disconnect(am); } catch (e) {}
  return {tr: acc.map(v => +(10 * Math.log10(v + 1e-12)).toFixed(1)), master: +(20 * Math.log10(m + 1e-9)).toFixed(1)};
});
const SILENT = -90, LOUD = -45;
const br = await chromium.launch();

// ================= A: Hören beim Singen / Abhören =================
console.log('— A: Hören beim Singen / beim Abhören');
{
  const H = await open(br, APP, {width: 428, height: 926}, {mic: true}), p = H.p;
  const inj = await setup(p, true), st = inj.track;
  ok(await p.evaluate(() => { const i = SYNQUENZER.vox2.info(); return i.sm === 'beg' && i.lm === 'b' && i.rs === 'frei'; }), 'Standard: Beim Singen = Begleitung, Abhören = beides, Raster frei');
  await p.evaluate(() => { SYNQUENZER.play(); SYNQUENZER.launchScene(0); }); await sleep(1400);
  const L0 = await LEVELS(p);
  ok(L0.tr[5] > LOUD && L0.tr[st] > LOUD, `Abhören „beides“: MELODIE ${L0.tr[5]} dB und STIMME ${L0.tr[st]} dB klingen`);
  ok(await p.evaluate(() => SYNQUENZER.vox2.info().gains.every(g => g === 1)), 'Abhören „beides“: alle Vorlage-Knoten genau 1 (bitgleich)');
  await p.evaluate(() => SYNQUENZER.vox2.set({lm: 'g'})); await sleep(250);
  const L1 = await LEVELS(p);
  ok(L1.tr[5] < SILENT && L1.tr[st] > LOUD && L1.tr[0] > LOUD, `Abhören „Gesang“: MELODIE still (${L1.tr[5]} dB), STIMME ${L1.tr[st]} dB, Begleitung ${L1.tr[0]} dB`);
  await p.evaluate(() => SYNQUENZER.vox2.set({lm: 'm'})); await sleep(250);
  const L2 = await LEVELS(p);
  ok(L2.tr[st] < SILENT && L2.tr[5] > LOUD, `Abhören „Melodie“: STIMME still (${L2.tr[st]} dB), MELODIE ${L2.tr[5]} dB`);
  const hd = await p.evaluate(() => SYNQUENZER.vox2.head());
  ok(/nur Melodie/.test(hd.sb) && /vox2q/.test(hd.cls), 'STIMME-Kopf zeigt „' + hd.sb + '“ und ist gedimmt');
  await p.screenshot({path: OUT + '/vox2-matrix-hoeren-hochkant.png'});
  await p.evaluate(() => SYNQUENZER.vox2.set({lm: 'b'})); await sleep(250);
  const g0 = await p.evaluate(async () => { await new Promise(r => setTimeout(r, 120)); return SYNQUENZER.vox2.info().gains; });
  ok(g0.every(g => g === 1), 'zurück auf „beides“: alle Knoten wieder genau 1');
  // Messen in Mix & Master hört alles
  const mx = await p.evaluate(() => { SYNQUENZER.vox2.set({lm: 'g'}); MX3.busy = true; const a = vox2Fac(null); MX3.busy = false; const b = vox2Fac(null); return {a, b: !!b}; });
  ok(mx.a === null && mx.b, 'während Mix & Master misst: keine Faktoren (alles hörbar), danach wieder „Gesang“');
  await p.evaluate(() => SYNQUENZER.vox2.set({lm: 'b'}));
  await p.evaluate(() => SYNQUENZER.vox2.set({sm: 'beg'}));   // VOX2-P: zuletzt getippt = „Beim Singen“ (sonst gilt bei 🎤 an die Zeile „Hören“)
  // Beim Singen: 🎤 an, es spielt
  await p.evaluate(() => SYNQUENZER.stimmeStart({route: 'wired', cal: false}));
  await p.waitForFunction(() => SYNQUENZER.stimme().phase === 'live', null, {timeout: 20000}); await sleep(400);
  const L3 = await LEVELS(p), i3 = await p.evaluate(() => SYNQUENZER.vox2.info());
  ok(i3.sing && L3.tr[5] < SILENT && L3.tr[st] > LOUD && L3.tr[0] > LOUD, `Mikro an + es spielt = singen, „Begleitung“: MELODIE still (${L3.tr[5]} dB), STIMME ${L3.tr[st]} dB, Begleitung ${L3.tr[0]} dB`);
  const hs = await p.evaluate(() => SYNQUENZER.vox2.head());
  ok(/ohne Melodie/.test(hs.sb), 'STIMME-Kopf: „' + hs.sb + '“');
  await p.evaluate(() => SYNQUENZER.vox2.set({sm: 'mel'})); await sleep(250);
  const L4 = await LEVELS(p);
  ok(L4.tr[5] > LOUD && L4.tr[st] > LOUD, `„+ Melodie“: MELODIE ${L4.tr[5]} dB als Führung hörbar, STIMME ${L4.tr[st]} dB`);
  await p.evaluate(() => SYNQUENZER.vox2.set({sm: 'klick'})); await sleep(250);
  const L5 = await LEVELS(p), k5 = await p.evaluate(() => SYNQUENZER.vox2.info());
  ok(L5.tr.every(v => v < SILENT) && k5.klick && L5.master > -40, `„nur Klick“: alle Spuren still (lautester ${Math.max(...L5.tr)} dB), Klick läuft (Master-Spitze ${L5.master} dB, Metronom aus)`);
  await p.evaluate(() => SYNQUENZER.vox2.set({sm: 'beg'})); await sleep(250);
  const L5b = await LEVELS(p), k5b = await p.evaluate(() => SYNQUENZER.vox2.info().klick);
  ok(!k5b && L5b.tr[0] > LOUD && L5b.tr[5] < SILENT, `zurück auf „Begleitung“: Begleitung wieder da (${L5b.tr[0]} dB), kein Zusatz-Klick, MELODIE still`);
  // Take läuft (● auf der STIMME, Overdub): Begleitung ohne Melodie; Vorlage MELODIE wählt sie trotzdem
  await p.evaluate(s => { SYNQUENZER.selectSlot(s, 0); SYNQUENZER.rec(); }, st);
  await p.waitForFunction(() => SYNQUENZER.g10j.info().take, null, {timeout: 8000}).catch(() => {});
  await sleep(300);
  const t6 = await p.evaluate(() => ({take: SYNQUENZER.g10j.info().take, g: SYNQUENZER.vox2.info().gains}));
  ok(t6.take && t6.g[5] === 0 && t6.g[st] === 1, 'Take mit 🎤 läuft: „Begleitung“ → MELODIE-Knoten 0, STIMME (alter Take) 1 ' + JSON.stringify(t6.g));
  await p.evaluate(() => { SYNQUENZER.g10j.set({src: 't:5'}); SYNQUENZER.vox2.set({sm: 'klick'}); }); await sleep(200);
  const t7 = await p.evaluate(() => SYNQUENZER.vox2.info().gains);
  ok(t7[5] >= 1 && t7.filter((g, i) => i !== 5).every(g => g === 0), 'Take + „nur Klick“ + Vorlage MELODIE: nur die Vorlage klingt ' + JSON.stringify(t7));
  await p.evaluate(() => { SYNQUENZER.g10j.set({src: 'off'}); SYNQUENZER.vox2.set({sm: 'beg'}); SYNQUENZER.rec(); }); await sleep(600);
  await p.evaluate(() => SYNQUENZER.stop()); await sleep(200);
  await p.evaluate(() => SYNQUENZER.stimmeStop()); await sleep(300);
  // UI: Takes-Blatt
  await p.evaluate(s => SYNQUENZER.tkSheet({t: s, s: 0}), st); await sleep(400);
  const ui = await p.evaluate(() => { const P = UI.pop && UI.pop.el, b = P ? [...P.querySelectorAll('.vox2tk button')] : []; return {n: b.length, small: b.filter(x => { const r = x.getBoundingClientRect(); return r.width < 44 || r.height < 44; }).length, txt: P ? P.querySelector('.vox2tk').textContent : ''}; });
  ok(ui.n === 3 && !ui.small, `Takes-Blatt: Zeile „Hören“ (3 Knöpfe ≥ 44 px) – „Beim Singen“ steht seit XD1 im Mikrofon-Blatt`);   // XD1-Anpassung: die Zeile „Beim Singen“ ist bewusst ins Mikrofon-Blatt umgezogen
  ok(/MELODIE|Melodie/.test(ui.txt) && /Export und Video/.test(ui.txt), 'Takes-Blatt nennt die Melodie-Spur und „Export und Video bleiben, wie gemischt“');
  await p.click('.pop .vox2tk [data-a="vox2l:g"]'); await sleep(200);
  const t8 = await p.evaluate(() => ({lm: SYNQUENZER.vox2.info().lm, pr: document.querySelector('.pop .vox2tk [data-a="vox2l:g"]').getAttribute('aria-pressed'), keep: JSON.parse(localStorage.getItem([...Array(localStorage.length).keys()].map(i => localStorage.key(i)).find(k => /ui/i.test(k) && /vox2Lm/.test(localStorage.getItem(k))) || 'null') || 'null')}));
  ok(t8.lm === 'g' && t8.pr === 'true' && t8.keep && t8.keep.vox2Lm === 'g', 'Tipp „Gesang“: gewählt, gedrückt, im Gerät gemerkt');
  await p.screenshot({path: OUT + '/vox2-takes-hoeren-hochkant.png'});
  await p.evaluate(() => closePop());
  // Aufnahme-Blatt (● halten)
  await p.evaluate(() => popRecOpts()); await sleep(300);
  const rr = await p.evaluate(() => { const r = document.querySelector('.pop #vox2Rec'); return r ? [...r.querySelectorAll('button')].map(b => { const q = b.getBoundingClientRect(); return [Math.round(q.width), Math.round(q.height)]; }) : null; });
  ok(rr && rr.length === 3 && rr.every(x => x[0] >= 44 && x[1] >= 44), 'Blatt von ● halten: Zeile „Beim Singen“ unter „Vorlage“, 3 Knöpfe ≥ 44 px');
  await p.click('.pop #vox2Rec [data-g10j="vox2s:klick"]'); await sleep(150);
  ok(await p.evaluate(() => SYNQUENZER.vox2.info().sm === 'klick' && document.querySelector('.pop #vox2Rec [data-g10j="vox2s:klick"]').classList.contains('on')), 'Tipp „nur Klick“ im Aufnahme-Blatt: gewählt (Zeile neu gezeichnet)');
  await p.evaluate(() => { closePop(); SYNQUENZER.vox2.set({sm: 'beg', lm: 'b'}); });
  // „Wo finde ich …?“: vier Einträge, Suche und Sprung
  const gd = await p.evaluate(async () => { const e = SYNQUENZER.ui1.entries().filter(x => /^vox2/.test(x.id)).map(x => x.id), s1 = SYNQUENZER.ui1.search('einsingen melodie gleichzeitig').map(x => x.id), s2 = SYNQUENZER.ui1.search('zuschneiden genau').map(x => x.id);
    const j = SYNQUENZER.ui1.jump('vox2hear'); await new Promise(r => setTimeout(r, 500)); const open = !!(UI.pop && UI.pop.name === 'takes' && UI.pop.el.querySelector('.vox2tk')); SYNQUENZER.ui1.home(); return {e, s1, s2, open, j: !!j}; });
  ok(gd.e.length === 4 && gd.s1.includes('vox2sing') && gd.s2.includes('vox2roll') && gd.open, 'Guide „Wo finde ich …?“: ' + gd.e.join(', ') + ' · Suche findet sie · Sprung öffnet das Takes-Blatt mit „Hören“');
  // Projekt unberührt: die Schalter stehen nicht im Projekt
  const pj = await p.evaluate(() => JSON.stringify(SYNQUENZER.project()));
  ok(!/vox2/.test(pj), 'Projekt-JSON enthält nichts von VOX2 (nur Gerät)');
  ok(!H.errs.length, 'keine Konsolenfehler ' + JSON.stringify(H.errs.slice(0, 2)));
  await H.ctx.close();
  // Vergleich mit der Basis: ohne Mikro klingt alles wie vorher
  const B = await open(br, BASE, {width: 428, height: 926}), q = B.p;
  await setup(q, true); await q.evaluate(() => { SYNQUENZER.play(); SYNQUENZER.launchScene(0); }); await sleep(1400);
  const LB = await LEVELS(q);
  ok(Math.abs(LB.tr[5] - L0.tr[5]) < 1.5 && Math.abs(LB.tr[st] - L0.tr[st]) < 1.5, `Basis 4.49.1 zum Vergleich (Abhören „beides“): MELODIE ${LB.tr[5]} / ${L0.tr[5]} dB, STIMME ${LB.tr[st]} / ${L0.tr[st]} dB – gleich`);
  await B.ctx.close();
}

// ================= B: Marken-Editor – Auswahl genau, An Platz =================
console.log('— B: Marken-Editor: Raster, „ab 2.2 bis 4.2“, An Platz');
for (const vp of [{width: 428, height: 926, n: 'hochkant'}, {width: 926, height: 428, n: 'quer'}]) {
  const H = await open(br, APP, vp), p = H.p, quer = vp.n === 'quer';
  const inj = await setup(p, false), st = inj.track, sr = 48000;
  await p.evaluate(r => SYNQUENZER.wpOpen(r), {t: st, s: 0}); await sleep(500);
  // Halten + Ziehen im Raster „Schlag“
  await p.evaluate(() => SYNQUENZER.vox2.set({rs: 'schlag'}));
  const g = await p.evaluate(() => SYNQUENZER.wpGeom()), xOf = t => g.x + (t - g.view.a) / g.view.W * g.w, yM = g.y + g.h / 2 - 4;
  await p.mouse.move(xOf(2.43), yM); await p.mouse.down(); await sleep(560); await p.mouse.move(xOf(4.0), yM, {steps: 6}); await p.mouse.move(xOf(6.62), yM, {steps: 6}); await p.mouse.up(); await sleep(200);
  const s1 = await p.evaluate(() => SYNQUENZER.vox2.info().sel);
  ok(s1 && Math.abs(s1.a - 2.5) < 1e-6 && Math.abs(s1.b - 6.5) < 1e-6 && s1.pa === '2.2' && s1.pb === '4.2', vp.n + ': Halten + Ziehen rastet im Raster „Schlag“: ab ' + (s1 && s1.pa) + ' bis ' + (s1 && s1.pb) + ' (' + (s1 && s1.a) + '–' + (s1 && s1.b) + ' s)');
  const bar = await p.evaluate(() => [...document.querySelectorAll('#wpSheet .vx1bar .rb')].filter(b => !b.hidden && b.offsetParent).map(b => { const r = b.getBoundingClientRect(); return {k: b.dataset.a || b.dataset.vx2, w: Math.round(r.width), h: Math.round(r.height), l: r.left, r: r.right, t: b.textContent}; }));
  const cv = await p.evaluate(() => { const r = document.querySelector('#wpSheet .wpcv').getBoundingClientRect(); return {l: r.left, r: r.right}; });
  ok(bar.length === 6 && bar.every(b => b.w >= 44 && b.h >= 44) && bar.every(b => b.l >= cv.l - 1 && b.r <= cv.r + 1), vp.n + ': Leiste [2.2–4.2 / Raster ▾] [▶] [Löschen] [Lücke] [An Platz] [✕], alle ≥ 44 px, im Bild: ' + bar.map(b => b.k + ' ' + b.w).join(', '));
  ok(/2\.2–4\.2/.test(bar[0].t) && /Raster Schlag/.test(bar[0].t), vp.n + ': Anzeige „' + bar[0].t + '“');
  const xs = await p.evaluate(() => { const b = document.querySelector('#wpSheet .sh-x').getBoundingClientRect(); return {top: b.top, right: b.right, w: b.width}; });
  ok(xs.top >= 0 && xs.right <= vp.width && xs.w >= 44, vp.n + ': ✕ des Editors sichtbar');
  // Blatt „Auswahl genau“
  await p.click('#wpSheet .vx1bar .vx2pos'); await sleep(250);
  const pp = await p.evaluate(() => { const P = UI.pop && UI.pop.name === 'vox2sel' ? UI.pop.el : null; if (!P) return null; const r = P.getBoundingClientRect(), bs = [...P.querySelectorAll('button')].map(b => b.getBoundingClientRect()); return {top: r.top, bottom: r.bottom, left: r.left, right: r.right, n: bs.length, small: bs.filter(b => b.width < 44 || b.height < 44).length, x: !!P.querySelector('[data-vx2="x"]'), head: P.querySelector('.vx2h span').textContent}; });
  ok(pp && pp.n === 12 && !pp.small && pp.x && pp.top >= 0 && pp.bottom <= vp.height && pp.right <= vp.width, vp.n + ': Blatt „Auswahl genau“: Raster (5), Anfang/Ende/Ziel ◀ ▶, ✕ – alle ≥ 44 px, ganz im Bild');
  ok(pp && /ab 2\.2 bis 4\.2 · 2 Takte/.test(pp.head), vp.n + ': Kopf „' + (pp && pp.head) + '“');
  await p.screenshot({path: OUT + '/vox2-auswahl-genau-' + vp.n + '.png'});
  await p.click('.vox2pop [data-vx2="a+"]'); await sleep(80);
  const n1 = await p.evaluate(() => SYNQUENZER.vox2.info().sel.pa);
  await p.click('.vox2pop [data-vx2="r:1/16"]'); await sleep(80);
  await p.click('.vox2pop [data-vx2="a-"]'); await sleep(80);
  const n2 = await p.evaluate(() => SYNQUENZER.vox2.info().sel);
  ok(n1 === '2.3' && n2.pa === '2.2.4' && Math.abs(n2.a - 2.875) < 1e-6, vp.n + ': ◀ ▶ je ein Rasterschritt: Schlag ▶ → ' + n1 + ', Raster 1/16 ◀ → ' + n2.pa);
  await p.click('.vox2pop [data-vx2="a+"]'); await sleep(80); for (let k = 0; k < 4; k++) { await p.click('.vox2pop [data-vx2="a-"]'); await sleep(40); }
  const n3 = await p.evaluate(() => SYNQUENZER.vox2.info().sel);
  ok(n3.pa === '2.2' && n3.pb === '4.2', vp.n + ': zurück auf ab 2.2 bis 4.2');
  await p.click('.vox2pop [data-vx2="x"]'); await sleep(100);
  ok(await p.evaluate(() => !UI.pop || UI.pop.name !== 'vox2sel'), vp.n + ': ✕ schließt das Blatt');
  if (quer) { await p.screenshot({path: OUT + '/vox2-marken-leiste-quer.png'}); await H.ctx.close(); continue; }
  await p.screenshot({path: OUT + '/vox2-marken-leiste-hochkant.png'});
  // An Platz → 1.1: ein Undo-Schritt, MELODIE rückt mit
  const u0 = await p.evaluate(() => SYNQUENZER.undoInfo().n);
  await p.click('#wpSheet .vx1bar .vx2pl'); await sleep(300);
  const pl = await p.evaluate(s => ({a: SYNQUENZER.getClip(s, 0).audio, len: SYNQUENZER.getClip(s, 0).len, m: SYNQUENZER.getClip(5, 0).notes.map(n => [n.t, n.n]), u: SYNQUENZER.undoInfo(), takes: Object.keys(SYNQUENZER.takes()).length}), st);
  ok(pl.a.take === inj.id && Math.abs(pl.a.in - 2.5) < 1e-6 && Math.abs(pl.a.out - 6.5) < 1e-6 && pl.a.at === 0 && pl.len === 4 && pl.takes === 1, 'An Platz: Stück 2,500–6,500 s beginnt bei Schlag 0 (1.1), Clip bleibt 4 Takte, kein neues Audio');
  ok(pl.m.length === 8 && pl.m[0][0] === 0 && pl.m[7][0] === 7 && pl.m[0][1] === 60, 'MELODIE aus diesem Gesang rückt mit: Noten 0 … 7 (vorher 5 … 12)');
  ok(pl.u.n === u0 + 1 && pl.u.top.kind === 'group' && pl.u.top.items.length === 2, 'ein Undo-Schritt „' + pl.u.top.label + '“ (STIMME + MELODIE)');
  // Klingt es dort? Planung: das Stück startet am Clip-Anfang mit Take-Sekunde 2,5 – die erste Probe des Tons liegt genau dort
  await p.evaluate(() => { SYNQUENZER.play(); SYNQUENZER.launchScene(0); }); await sleep(900);
  await p.waitForFunction(s => TK.src.some(r => !r.dead && r.i === s && r.start > AU.ctx.currentTime), st, {timeout: 12000}).catch(() => {});
  const on = await p.evaluate(async s => {
    const r = TK.src.filter(x => !x.dead && x.i === s).sort((a, b) => a.start - b.start).pop(); if (!r) return null;
    const pcm = await SYNQUENZER.tkPcmRange(r.take), m = SYNQUENZER.takes()[r.take]; let f = -1; for (let i = 0; i < pcm.length; i++) if (Math.abs(pcm[i]) > 200) { f = i; break; }
    const cs = R.cstart[s], L = clipB(S.tracks[s].clips[0]), b = t2b(r.start), ph = ((b - cs) % L + L) % L;
    const loopT = b2t(b - (ph > L / 2 ? ph - L : ph));
    return {off: r.off, start: r.start, onsetAt: r.start + (f / m.sr - r.off), loopT, ph};
  }, st);
  const dms = on ? (on.onsetAt - on.loopT) * 1000 : NaN;
  ok(on && Math.abs(on.off - 2.5) < 1e-4 && Math.abs(dms) <= 5, `Wiedergabe: Stück startet am Takt 1.1 mit Take-Sekunde ${on && on.off.toFixed(4)}, Ton-Anfang ${dms.toFixed(3)} ms neben dem Clip-Anfang (≤ 5 ms)`);
  await p.evaluate(() => SYNQUENZER.stop()); await sleep(200);
  await p.screenshot({path: OUT + '/vox2-an-platz-hochkant.png'});
  await p.evaluate(() => SYNQUENZER.undo()); await sleep(200);
  const ud = await p.evaluate(s => ({a: SYNQUENZER.getClip(s, 0).audio, m: SYNQUENZER.getClip(5, 0).notes.map(n => n.t)}), st);
  ok(ud.a.in === 0 && Math.abs(ud.a.out - 8) < 1e-6 && ud.a.at === 0 && ud.m[0] === 5, '↶ holt Stück und MELODIE zurück');
  await p.evaluate(() => SYNQUENZER.redo()); await sleep(200);
  ok(await p.evaluate(s => SYNQUENZER.getClip(s, 0).audio.in === 2.5 && SYNQUENZER.getClip(5, 0).notes[0].t === 0, st), '↷ wieder an Platz');
  // anderes Ziel (Takt 2.1) und „Löschen“ mit Raster (VX1 bleibt)
  await p.evaluate(() => SYNQUENZER.undo()); await sleep(150);
  await p.evaluate(() => { SYNQUENZER.vx1Sel(2.5, 6.5); SYNQUENZER.vox2.set({tgt: 4}); }); await sleep(100);
  await p.evaluate(() => SYNQUENZER.vox2.place()); await sleep(200);
  const z2 = await p.evaluate(s => ({a: SYNQUENZER.getClip(s, 0).audio, m: SYNQUENZER.getClip(5, 0).notes.map(n => n.t)}), st);
  ok(z2.a.at === 4 && z2.a.in === 2.5 && z2.m[0] === 4, 'Ziel 2.1: Stück beginnt bei Schlag 4, MELODIE ab Schlag 4');
  await p.evaluate(() => { SYNQUENZER.undo(); SYNQUENZER.vox2.set({tgt: 0}); }); await sleep(150);
  await p.evaluate(() => SYNQUENZER.vx1Sel(3, 4)); const cut = await p.evaluate(() => SYNQUENZER.vx1Cut(false));
  const ct = await p.evaluate(s => SYNQUENZER.vx1Info().lastCut, st);
  ok(cut && ct && Math.abs(ct.sec - 1) < 1e-3, 'Löschen (VX1) mit Raster: 1,000 s ausgeschnitten, der Rest rückt nach');
  ok(!H.errs.length, 'keine Konsolenfehler ' + JSON.stringify(H.errs.slice(0, 2)));
  await H.ctx.close();
}

// ================= C: ROLLE – gelber Takt-Bereich mit Griffen =================
console.log('— C: ROLLE: Griffe am gelben Bereich, Zuschneiden, Gesang folgt');
async function rollRun(file, vp, br, fine) {
  const H = await open(br, file, vp), p = H.p;
  const inj = await setup(p, false), st = inj.track;
  await p.evaluate(() => { SYNQUENZER.selectSlot(5, 0); SYNQUENZER.openRoll(5, 0); }); await sleep(600);
  await p.evaluate(() => { SYNQUENZER.rollApi().fitView('clip'); SYNQUENZER.rollApi().setGrid('1/4'); }); await sleep(200);
  for (const bar of [1, 3]) { const q = await p.evaluate(b => SYNQUENZER.rollApi()._barNum(b), bar); await p.mouse.click(q.x, q.y); await sleep(150); }
  const R0 = {loop: await p.evaluate(() => SYNQUENZER.rollApi().state.loop)};
  if (fine) {
    const rr = await p.evaluate(() => { const r = SYNQUENZER.rollApi().el.ruler.getBoundingClientRect(); return {x: r.left, y: r.top, h: r.height}; }), ppb = await p.evaluate(() => SYNQUENZER.rollApi().state.view.ppb), y = rr.y + rr.h / 2;
    let inf = await p.evaluate(() => SYNQUENZER.rollApi().vx2.info()); R0.inf0 = inf;
    let gx = rr.x + inf.grips[0] + 14;   // Griff seitlich gefasst (Trefferfläche ±22 px)
    await p.mouse.move(gx, y); await p.mouse.down(); await p.mouse.move(gx + ppb * .5, y, {steps: 4}); await p.mouse.move(gx + ppb * 1.02 - 14, y, {steps: 4}); await p.mouse.up(); await sleep(150);
    inf = await p.evaluate(() => SYNQUENZER.rollApi().vx2.info()); R0.inf1 = inf;
    gx = rr.x + inf.grips[1] - 14;   // Griff B liegt am Clip-Ende: dort hat der Längen-Griff Vorrang (VOX2-P) – gefasst wird die Lasche unter dem Lineal
    const yt = rr.y + rr.h + 10;
    await p.mouse.move(gx + 14, yt); await p.mouse.down(); await p.mouse.move(gx + 14 - ppb * .5, yt, {steps: 4}); await p.mouse.move(gx + 14 - ppb * 3.02, yt, {steps: 4}); await p.mouse.up(); await sleep(150);
    R0.inf2 = await p.evaluate(() => SYNQUENZER.rollApi().vx2.info());
    R0.bubble = await p.evaluate(() => { const b = document.querySelector('#rollSheet .pr-bubble, .pr .pr-bubble, .pr-bub'); return b ? b.textContent : null; });
    await p.screenshot({path: OUT + '/vox2-rolle-griffe-' + vp.n + '.png'});
  }
  R0.u0 = await p.evaluate(() => SYNQUENZER.undoInfo().n);
  await p.locator('button.loopb:visible').first().click({timeout: 3000}).catch(async () => { await p.evaluate(() => SYNQUENZER.rollApi().cropToLoop()); });
  await sleep(300);
  R0.after = await p.evaluate(s => ({mel: SYNQUENZER.getClip(5, 0), vox: SYNQUENZER.getClip(s, 0), u: SYNQUENZER.undoInfo()}), st);
  await p.evaluate(() => SYNQUENZER.undo()); await sleep(200);
  R0.undo = await p.evaluate(s => ({m: SYNQUENZER.getClip(5, 0).notes.map(n => n.t), len: SYNQUENZER.getClip(5, 0).len, a: SYNQUENZER.getClip(s, 0).audio, slen: SYNQUENZER.getClip(s, 0).len}), st);
  R0.errs = H.errs;
  await H.ctx.close();
  return R0;
}
{
  for (const vp of [{width: 428, height: 926, n: 'hochkant'}, {width: 926, height: 428, n: 'quer'}]) {
    const r = await rollRun(APP, vp, br, true);
    ok(r.loop && r.loop.a === 1 && r.loop.b === 3, vp.n + ': Taktnummern 2 und 4 antippen = gelber Bereich Takt 2–4 (wie bisher)');
    ok(r.inf1 && r.inf1.txt === 'ab 2.2 bis 5.1' && r.inf2 && r.inf2.txt === 'ab 2.2 bis 4.2' && r.inf2.fine, vp.n + ': Griffe ziehen (A seitlich im Lineal, B an der Lasche, Raster 1/4): ' + (r.inf1 && r.inf1.txt) + ' → ' + (r.inf2 && r.inf2.txt));
    const m = r.after.mel, v = r.after.vox;
    ok(m.len === 2 && m.notes.length === 8 && m.notes[0].t === 0 && m.notes[7].t === 7, vp.n + ': Zuschneiden nimmt genau 2.2–4.2: 2 Takte, Noten ab 1.1');
    ok(v.audio.in === 2.5 && v.audio.out === 6.5 && v.audio.at === 0 && v.len === 2, vp.n + ': STIMME desselben Takes rückt mit (2,5–6,5 s ab 1.1, 2 Takte)');
    ok(r.after.u.n === r.u0 + 1 && r.after.u.top.kind === 'group' && /Gesang folgt/.test(r.after.u.top.label), vp.n + ': ein Undo-Schritt „' + r.after.u.top.label + '“');
    ok(r.undo.len === 4 && r.undo.m[0] === 5 && r.undo.a.in === 0 && r.undo.slen === 4, vp.n + ': ↶ holt MELODIE und STIMME zurück');
    ok(!r.errs.length, vp.n + ': keine Konsolenfehler ' + JSON.stringify(r.errs.slice(0, 2)));
  }
  // ganze Takte: Zuschneiden der Noten bitgleich zur Basis
  const a = await rollRun(APP, {width: 428, height: 926, n: 'h'}, br, false), b = await rollRun(BASE, {width: 428, height: 926, n: 'h'}, br, false);
  const nt = c => JSON.stringify(Object.assign({}, c, {take: undefined}));
  ok(nt(a.after.mel) === nt(b.after.mel), 'ganze Takte (2–4): MELODIE nach Zuschneiden Zeichen für Zeichen wie Basis 4.49.1 (ohne die zufällige Take-ID)');
  ok(b.after.vox.audio.in === 0 && a.after.vox.audio.in === 2 && a.after.vox.audio.at === 0 && a.after.vox.len === 3, 'ganze Takte: in der Basis blieb die STIMME stehen (in 0), jetzt rückt sie mit (in 2,0 s = Takt 2, 3 Takte)');
}

// ================= P: Prüfer-Befunde (VOX2-P) =================
console.log('— P: Prüfer-Befunde 1–9 (VOX2-P)');
const tdrag = async (cdp, pts, step = 16) => {   // echter Finger über CDP
  await cdp.send('Input.dispatchTouchEvent', {type: 'touchStart', touchPoints: [{x: pts[0][0], y: pts[0][1], id: 1}]});
  for (let i = 1; i < pts.length; i++) { await cdp.send('Input.dispatchTouchEvent', {type: 'touchMove', touchPoints: [{x: pts[i][0], y: pts[i][1], id: 1}]}); await sleep(step); }
  await cdp.send('Input.dispatchTouchEvent', {type: 'touchEnd', touchPoints: []});
};
const tline = (x0, y0, x1, y1, n = 10) => { const o = []; for (let i = 0; i <= n; i++) o.push([x0 + (x1 - x0) * i / n, y0 + (y1 - y0) * i / n]); return o; };
const ttap = async (cdp, x, y) => { await cdp.send('Input.dispatchTouchEvent', {type: 'touchStart', touchPoints: [{x, y, id: 1}]}); await sleep(40); await cdp.send('Input.dispatchTouchEvent', {type: 'touchEnd', touchPoints: []}); };
const keyDb = p => p.evaluate(async () => { const A = AU.tracks[5], a = AU.ctx.createAnalyser(); a.fftSize = 2048; A.cut.connect(a); const b = new Float32Array(2048); let m = 0;
  SYNQUENZER.keyOn(84, 1); for (let k = 0; k < 10; k++) { await new Promise(r => setTimeout(r, 40)); a.getFloatTimeDomainData(b); for (const v of b) m = Math.max(m, Math.abs(v)); } SYNQUENZER.keyOff(84); A.cut.disconnect(a); return +(20 * Math.log10(m + 1e-9)).toFixed(1); });
// Befund 1 + 7: 🎤 an, es spielt – „Hören“ wirkt, sobald man dort tippt; beim Take gilt wieder „Beim Singen“; kurzer Kopf-Text
{
  const H = await open(br, APP, {width: 428, height: 926}, {mic: true}), p = H.p;
  const inj = await setup(p, true), st = inj.track;
  await p.evaluate(() => SYNQUENZER.stimmeStart({route: 'wired', cal: false})); await p.waitForFunction(() => SYNQUENZER.stimme().phase === 'live', null, {timeout: 20000});
  await p.evaluate(() => { SYNQUENZER.play(); SYNQUENZER.launchScene(0); }); await sleep(1400);
  const L0 = await LEVELS(p), i0 = await p.evaluate(() => SYNQUENZER.vox2.info());
  ok(i0.lr === 's' && i0.sing && L0.tr[5] < SILENT, `Befund 1: 🎤 an, nichts getippt → „Beim Singen: Begleitung“ (MELODIE ${L0.tr[5]} dB)`);
  await p.evaluate(s => SYNQUENZER.tkSheet({t: s, s: 0}), st); await sleep(400);
  await p.click('.pop .vox2tk [data-a="vox2l:m"]'); await sleep(300);
  const L1 = await LEVELS(p), i1 = await p.evaluate(() => ({v: SYNQUENZER.vox2.info(), now: [...document.querySelectorAll('.pop .vox2tk .vox2r')].map(r => r.classList.contains('vox2now')), pr: document.querySelector('.pop .vox2tk [data-a="vox2l:m"]').getAttribute('aria-pressed')}));
  ok(!i1.v.sing && L1.tr[5] > LOUD && L1.tr[st] < SILENT && i1.pr === 'true' && i1.now[0] && !i1.now[1], `Befund 1: Tipp „Hören: Melodie“ bei 🎤 an → MELODIE ${L1.tr[5]} dB, STIMME ${L1.tr[st]} dB, Zeile „Hören“ hervorgehoben`);
  await p.screenshot({path: OUT + '/vox2p-takes-gilt-hochkant.png'});
  await p.click('.pop .vox2tk [data-a="vox2l:b"]'); await sleep(300);
  const L2 = await LEVELS(p);
  ok(L2.tr[5] > LOUD && L2.tr[st] > LOUD, `Befund 1: Tipp „beides“ → MELODIE ${L2.tr[5]} dB und STIMME ${L2.tr[st]} dB`);
  await p.evaluate(() => { closePop(); SYNQUENZER.stimmeSheet ? SYNQUENZER.stimmeSheet() : stSheet(); }); await sleep(400);   // XD1-Anpassung: „Beim Singen: Begleitung“ wird im Mikrofon-Blatt getippt (dort liegt die Zeile jetzt)
  await p.click('.pop .xd1mic [data-xd1="vox2s:beg"]'); await sleep(300);
  const L3 = await LEVELS(p), hd = await p.evaluate(() => { const st = stimmeT(), e = UI.heads[st].sb; return {t: e.textContent, sw: e.scrollWidth, cw: e.clientWidth}; });
  ok(L3.tr[5] < SILENT && hd.t === 'ohne Melodie' && hd.sw <= hd.cw + 1, `Befund 1/7: Tipp „Beim Singen: Begleitung“ → MELODIE wieder still; Kopf „${hd.t}“ passt (${hd.sw}/${hd.cw} px)`);
  await p.evaluate(() => { closePop(); SYNQUENZER.vox2.set({lm: 'm'}); }); await sleep(200);
  await p.evaluate(s => { SYNQUENZER.selectSlot(s, 0); SYNQUENZER.rec(); }, st);
  await p.waitForFunction(() => SYNQUENZER.g10j.info().take, null, {timeout: 8000}).catch(() => {}); await sleep(300);
  const t1 = await p.evaluate(() => SYNQUENZER.vox2.info());
  ok(t1.sing && t1.gains[5] === 0, 'Befund 1: zuletzt „Hören“ getippt, aber ein Take läuft → „Beim Singen“ gilt (MELODIE-Knoten ' + t1.gains[5] + ')');
  await p.evaluate(() => SYNQUENZER.rec()); await sleep(800);
  await p.evaluate(() => SYNQUENZER.vox2.set({lm: 'm'})); await sleep(300);
  const t2 = await p.evaluate(() => ({v: SYNQUENZER.vox2.info(), mic: recMicOn(), pl: R.playing}));
  ok(t2.mic && t2.pl && !t2.v.sing && t2.v.gains[st] === 0 && t2.v.gains[5] === 1, 'Befund 1: nach dem Take (🎤 an, es spielt) „Hören: Melodie“ → STIMME-Knoten 0, MELODIE 1');
  for (const lm of ['g', 'm']) { await p.evaluate(lm => SYNQUENZER.vox2.set({lm}), lm); await sleep(150); }
  const kw = await p.evaluate(() => ['g', 'm'].map(lm => { SYNQUENZER.vox2.set({lm}); renderGrid(); const e = UI.heads[stimmeT()].sb; return [e.textContent, e.scrollWidth, e.clientWidth]; }));
  ok(kw.every(k => k[1] <= k[2] + 1), 'Befund 7 hochkant: Kopf-Text passt: ' + kw.map(k => '„' + k[0] + '“ ' + k[1] + '/' + k[2] + ' px').join(', '));
  ok(!H.errs.length, 'Befund 1: keine Konsolenfehler ' + JSON.stringify(H.errs.slice(0, 2)));
  await p.evaluate(() => { SYNQUENZER.stop(); SYNQUENZER.vox2.set({lm: 'b', sm: 'beg'}); });
  await H.ctx.close();
}
// Befund 7 quer: die Zeile fehlt dort – der Kopf der stillen Spur ist gedimmt
{
  const H = await open(br, APP, {width: 926, height: 428}), p = H.p;
  const inj = await setup(p, true), st = inj.track;
  await p.evaluate(st => { SYNQUENZER.play(); SYNQUENZER.launchScene(0); SYNQUENZER.vox2.set({lm: 'm'}); const pg = MX.pages ? MX.pages.findIndex(q => q.includes(st)) : -1; if (pg >= 0) setTrackBank(pg); }, st); await sleep(900);   // quer: STIMME liegt auf der 2. Spur-Seite
  const q = await p.evaluate(st => { const H = UI.heads[st], M = UI.heads[5]; return {st: H.el.classList.contains('vox2q'), mel: M.el.classList.contains('vox2q'), nm: H.nm.offsetWidth, op: getComputedStyle(H.nm).opacity}; }, st);
  ok(q.st && !q.mel && q.nm > 0 && +q.op < .6, `Befund 7 quer: „Hören: Melodie“ → STIMME-Kopf gedimmt (Name sichtbar, Deckkraft ${q.op}), MELODIE nicht`);
  await p.screenshot({path: OUT + '/vox2p-matrix-gedimmt-quer.png'});
  await p.evaluate(() => { SYNQUENZER.stop(); SYNQUENZER.vox2.set({lm: 'b'}); });
  await H.ctx.close();
}
// Befund 2: MELODIE gewählt – die Taste klingt wie in der Basis, nur der Clip schweigt
{
  const res = {};
  for (const [file, tag] of [[BASE, 'basis'], [APP, 'vox2']]) {
    const H = await open(br, file, {width: 428, height: 926}), p = H.p;
    await setup(p, true);
    if (tag === 'vox2') await p.evaluate(() => SYNQUENZER.vox2.set({lm: 'g'}));
    // erst nur die Taste (Clip-Noten leer bis auf eine leise, der Clip nennt weiter den Take – wie die Prüfer-Sonde p11)
    const keep = await p.evaluate(() => { const c = SYNQUENZER.getClip(5, 0), n = c.notes; c.notes = [{t: 15.5, d: .25, n: 40, v: .05}]; SYNQUENZER.setClip(5, 0, c); return n; });
    await p.evaluate(() => { SYNQUENZER.play(); SYNQUENZER.launchScene(0); }); await sleep(1500);
    await p.evaluate(() => { R.selT = 5; }); await sleep(600);
    const k = await keyDb(p);
    await p.evaluate(n => { const c = SYNQUENZER.getClip(5, 0); c.notes = n; SYNQUENZER.setClip(5, 0, c); }, keep); await sleep(1200);
    const Lc = await LEVELS(p);
    const inf = tag === 'vox2' ? await p.evaluate(() => SYNQUENZER.vox2.info()) : null;
    await p.evaluate(() => { R.selT = 0; }); await sleep(400);
    const inf2 = tag === 'vox2' ? await p.evaluate(() => SYNQUENZER.vox2.info()) : null, L2 = await LEVELS(p);
    res[tag] = {clip: Lc.tr[5], key: k, sel: inf && inf.selMute, g5: inf && inf.gains[5], g5b: inf2 && inf2.gains[5], sel2: inf2 && inf2.selMute, after: L2.tr[5], errs: H.errs};
    await H.ctx.close();
  }
  const a = res.vox2, b = res.basis;
  ok(Math.abs(a.key - b.key) < 3 && a.key > -30, `Befund 2: „Abhören: Gesang“, MELODIE gewählt: gespielte Taste ${a.key} dB (Basis ${b.key} dB)`);
  ok(a.clip < SILENT && a.sel === 5 && a.g5 === 1, `Befund 2: der Clip der gewählten MELODIE schweigt trotzdem (${a.clip} dB, Knoten ${a.g5}, nur Clip still)`);
  ok(a.sel2 === -1 && a.g5b === 0 && a.after < SILENT, `Befund 2: andere Spur gewählt → MELODIE wieder am Knoten still (${a.g5b}), ${a.after} dB`);
  ok(!a.errs.length, 'Befund 2: keine Konsolenfehler ' + JSON.stringify(a.errs.slice(0, 2)));
}
// Befunde 3, 5, 6, 8: ROLLE mit dem Finger (hochkant + quer), Vergleich mit der Basis
async function rollP(file, vp) {
  const ctx = await br.newContext({viewport: {width: vp.width, height: vp.height}, hasTouch: true, isMobile: true, deviceScaleFactor: 1}), p = await ctx.newPage(), errs = [];
  p.on('pageerror', e => errs.push(String(e))); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  await p.goto('file://' + file); await p.waitForFunction(() => window.SYNQUENZER && SYNQUENZER.version); await sleep(400);
  const cdp = await ctx.newCDPSession(p); await setup(p, false);
  await p.evaluate(() => { SYNQUENZER.selectSlot(5, 0); SYNQUENZER.openRoll(5, 0); }); await sleep(600);
  await p.evaluate(() => { SYNQUENZER.rollApi().fitView('clip'); SYNQUENZER.rollApi().setGrid('1/4'); }); await sleep(200);
  const bn = b => p.evaluate(b => SYNQUENZER.rollApi()._barNum(b), b), lp = () => p.evaluate(() => SYNQUENZER.rollApi().state.loop), set = (a, b) => p.evaluate(([a, b]) => SYNQUENZER.rollApi().setLoop(a, b), [a, b]);
  const T = async b => { const q = await bn(b); await ttap(cdp, q.x, q.y); await sleep(220); };
  const o = {};
  await T(1); await T(2); o.l23 = await lp(); await T(1); o.clr = await lp();
  await set(1, 2); await sleep(80); await T(3); o.l24 = await lp();
  const geo = await p.evaluate(() => { const r = SYNQUENZER.rollApi().el.ruler.getBoundingClientRect(), V = SYNQUENZER.rollApi().state.view; return {x: r.left, y: r.top, h: r.height, ppb: V.ppb, x0: V.x0}; });
  // Befund 6: Bereich 3–4 bis zum Clip-Ende, am Ende einen Takt nach links = Länge 3
  await set(2, 3); await sleep(150);
  const xEnd = geo.x + (16 - geo.x0) * geo.ppb, y = geo.y + geo.h / 2;
  await tdrag(cdp, tline(xEnd, y, xEnd - 4.3 * geo.ppb, y, 12)); await sleep(300);
  o.len = await p.evaluate(() => SYNQUENZER.getClip(5, 0).len);
  await p.evaluate(() => { SYNQUENZER.undo(); SYNQUENZER.rollApi().fitView('clip'); }); await sleep(250);
  if (file === APP) {
    await set(1, 3); await sleep(150);
    let inf = await p.evaluate(() => SYNQUENZER.rollApi().vx2.info());
    const tabs = await p.evaluate(() => [...document.querySelectorAll('.pr-vx2t')].filter(t => !t.hidden).map(t => { const r = t.getBoundingClientRect(); return {l: r.left, t: r.top, w: r.width, h: r.height}; }));
    o.tabs = tabs; o.hit = tabs.length === 2 && tabs.every(t => t.w >= 44 && Math.abs(t.t - (geo.y + geo.h)) < 1.5 && geo.h + t.h >= 44);
    // Befund 5: Griff A 12 px unter dem Lineal fassen, einen Schlag nach rechts
    const gx = geo.x + inf.grips[0], yb = geo.y + geo.h + 12;
    await tdrag(cdp, tline(gx, yb, gx + geo.ppb, yb, 8)); await sleep(150);
    o.a = (await p.evaluate(() => SYNQUENZER.rollApi().vx2.info())).txt;
    // Griff B liegt am Clip-Ende: an der Lasche 3 Schläge nach links
    inf = await p.evaluate(() => SYNQUENZER.rollApi().vx2.info());
    const gb = geo.x + inf.grips[1];
    await tdrag(cdp, tline(gb, yb, gb - geo.ppb * 3, yb, 10)); await sleep(150);
    o.b = (await p.evaluate(() => SYNQUENZER.rollApi().vx2.info())).txt; o.len2 = await p.evaluate(() => SYNQUENZER.getClip(5, 0).len);
    // Befund 3: ein Tipp auf die Lasche löscht nichts, zeigt den Bereich
    await ttap(cdp, gb - geo.ppb * 3, yb); await sleep(150); o.tabTap = (await p.evaluate(() => SYNQUENZER.rollApi().vx2.info()) || {}).txt;
    await sleep(1300);
    o.btn = await p.evaluate(() => { const b = [...document.querySelectorAll('.pr-bar button.loopb')].find(x => !x.hidden && x.offsetParent); return b ? {t: b.textContent, w: b.getBoundingClientRect().width} : null; });
    await p.screenshot({path: OUT + '/vox2p-rolle-lasche-' + vp.n + '.png'});
    await set(1, 2); await sleep(100);
    o.btnWhole = await p.evaluate(() => { const b = [...document.querySelectorAll('.pr-bar button.loopb')].find(x => !x.hidden && x.offsetParent); return b ? b.textContent : null; });
  }
  o.errs = errs; await ctx.close(); return o;
}
for (const vp of [{width: 428, height: 926, n: 'hochkant'}, {width: 926, height: 428, n: 'quer'}]) {
  const a = await rollP(APP, vp), b = await rollP(BASE, vp), J = JSON.stringify;
  ok(J(a.l23) === J(b.l23) && J(a.clr) === J(b.clr) && J(a.l24) === J(b.l24) && J(a.l24) === J({a: 1, b: 3}), `Befund 3 ${vp.n}: Taktnummern mit dem Finger wie 4.49.1: Takt 2 → 3 = ${J(a.l23)}, nochmal 2 = ${J(a.clr)}, 2–3 + Takt 4 = ${J(a.l24)}`);
  ok(a.len === 3 && b.len === 3, `Befund 6 ${vp.n}: Bereich bis zum Clip-Ende, Clip-Ende einen Takt nach links → Länge ${a.len} (Basis ${b.len})`);
  ok(a.hit, `Befund 5 ${vp.n}: zwei Laschen unter dem Lineal, je 44 px breit, Lineal + Lasche ${a.tabs && a.tabs[0] ? Math.round(26 + a.tabs[0].h) : '?'} px hoch`);
  ok(a.a === 'ab 2.2 bis 5.1' && a.b === 'ab 2.2 bis 4.2' && a.len2 === 4 && a.tabTap === 'ab 2.2 bis 4.2', `Befund 5 ${vp.n}: 12 px unter dem Lineal gefasst: ${a.a} → an der Lasche am Clip-Ende: ${a.b} (Länge bleibt ${a.len2}); Tipp auf die Lasche lässt den Bereich`);
  ok(a.btn && a.btn.t === 'Zuschneiden 2.2–4.2' && a.btnWhole === 'Zuschneiden', `Befund 8 ${vp.n}: nach 1,3 s steht fest „${a.btn && a.btn.t}“ (ganze Takte: „${a.btnWhole}“)`);
  ok(!a.errs.length && !b.errs.length, `ROLLE ${vp.n}: keine Konsolenfehler ` + JSON.stringify(a.errs.concat(b.errs).slice(0, 2)));
}
// Befund 4: erst Löschen / Lücke, dann An Platz und ROLLE-Zuschneiden – der Bezug bleibt; ↶ holt die alte Kennung zurück
for (const gap of [false, true]) {
  const H = await open(br, APP, {width: 428, height: 926}), p = H.p, inj = await setup(p, false), st = inj.track, nm = gap ? 'Lücke' : 'Löschen';
  await p.evaluate(s => SYNQUENZER.wpOpen({t: s, s: 0}), st); await sleep(500);
  await p.evaluate(() => SYNQUENZER.vx1Sel(0.5, 1.0)); const ok1 = await p.evaluate(g => SYNQUENZER.vx1Cut(g), gap); await sleep(250);
  const c1 = await p.evaluate(s => ({a: SYNQUENZER.getClip(s, 0).audio.take, m: SYNQUENZER.getClip(5, 0).take, u: SYNQUENZER.undoInfo().top}), st);
  ok(ok1 && c1.a !== inj.id && c1.m === c1.a && c1.u.items.length === 3, `Befund 4 ${nm}: neuer Take, der MELODIE-Clip zeigt mit (${c1.m === c1.a}), ein Undo-Schritt mit ${c1.u.items.length} Teilen`);
  const tone = gap ? [2.5, 6.5] : [2.0, 6.0];
  await p.evaluate(t => { SYNQUENZER.vox2.set({rs: 'schlag', tgt: 0}); SYNQUENZER.vx1Sel(t[0], t[1]); }, tone); await sleep(80);
  const pl = await p.evaluate(() => SYNQUENZER.vox2.place()), c2 = await p.evaluate(() => ({last: SYNQUENZER.vox2.info().last, m: SYNQUENZER.getClip(5, 0).notes.map(n => n.t)}));
  ok(pl && c2.last.mel === 5 && c2.m[0] < 4, `Befund 4 ${nm}: danach An Platz – die MELODIE rückt mit (Noten ab ${c2.m[0]})`);
  await p.evaluate(() => { SYNQUENZER.undo(); SYNQUENZER.wpClose(); }); await sleep(200);
  await p.evaluate(() => { SYNQUENZER.selectSlot(5, 0); SYNQUENZER.openRoll(5, 0); }); await sleep(500);
  await p.evaluate(() => { SYNQUENZER.rollApi().vx2.set(5, 13); SYNQUENZER.rollApi().cropToLoop(); }); await sleep(250);
  const c3 = await p.evaluate(s => ({u: SYNQUENZER.undoInfo().top.label, sl: SYNQUENZER.getClip(s, 0).len, ml: SYNQUENZER.getClip(5, 0).len}), st);
  ok(/Gesang folgt/.test(c3.u) && c3.sl === c3.ml, `Befund 4 ${nm}: danach ROLLE-Zuschneiden „${c3.u}“, STIMME ${c3.sl} = MELODIE ${c3.ml} Takte`);
  await p.evaluate(() => { SYNQUENZER.undo(); SYNQUENZER.undo(); }); await sleep(250);
  const c4 = await p.evaluate(s => ({a: SYNQUENZER.getClip(s, 0).audio.take, m: SYNQUENZER.getClip(5, 0).take}), st);
  ok(c4.a === inj.id && c4.m === inj.id, `Befund 4 ${nm}: ↶ des Schnitts holt beide auf die alte Kennung zurück`);
  // Hinweis, wenn die Melodie nicht mitrückt
  const why = await p.evaluate(id => { const t = SYNQUENZER.takes()[id]; const f = S.takes[id].follow; S.takes[id].follow = false; const w = vox2MelWhy(0, id); S.takes[id].follow = f; return w; }, inj.id);
  ok(/bleibt/.test(why), `Befund 4 ${nm}: Hinweis, wenn die Melodie nicht mitrückt: „${why}“`);
  ok(!H.errs.length, `Befund 4 ${nm}: keine Konsolenfehler ` + JSON.stringify(H.errs.slice(0, 2)));
  await H.ctx.close();
}
// Befund 9: Song-Melodie „Als Clip“ nimmt die genauen Ränder; ganze Takte wie in der Basis
{
  const run = async (file, fine) => {
    const H = await open(br, file, {width: 428, height: 926}), p = H.p; await setup(p, false);
    await p.evaluate(() => { SYNQUENZER.songFromChain([{scene: 0, bars: 4}]); setSongView(true); }); await sleep(300);
    const r = await p.evaluate(async fine => {
      const s = S.song, t = s.melodyTrack, notes = []; for (let b = 0; b < 16; b++) notes.push({t: b, d: .9, n: 60 + (b % 5), v: .9});
      if (!s.mel) s.mel = {}; s.mel[t] = Object.assign({}, s.mel[t] || {}, {notes});
      SYNQUENZER.openMelody(); await new Promise(r => setTimeout(r, 600));
      if (fine) ED.roll.vx2.set(5, 13); else ED.roll.setLoop(1, 3);
      const before = S.tracks[t].clips.map(c => !!c); melodyToClip();
      const si = S.tracks[t].clips.findIndex((c, i) => c && !before[i]), c = si >= 0 ? S.tracks[t].clips[si] : null;
      return c ? {len: c.len, notes: c.notes.map(n => [n.t, n.d]), n: c.notes.length} : null;
    }, fine);
    const e = H.errs; await H.ctx.close(); return {r, e};
  };
  const f = await run(APP, true), w = await run(APP, false), wb = await run(BASE, false);
  ok(f.r && f.r.len === 2 && f.r.n === 8 && f.r.notes[0][0] === 0 && f.r.notes[7][0] === 7, `Befund 9: „Als Clip“ bei „ab 2.2 bis 4.2“ → ${f.r && f.r.len} Takte, ${f.r && f.r.n} Noten ab 1.1`);
  ok(JSON.stringify(w.r) === JSON.stringify(wb.r), `Befund 9: ganze Takte 2–4 → wie Basis 4.49.1 (${w.r && w.r.len} Takte, ${w.r && w.r.n} Noten)`);
  ok(!f.e.length && !w.e.length, 'Befund 9: keine Konsolenfehler ' + JSON.stringify(f.e.concat(w.e).slice(0, 2)));
}

// ================= D: Regeln =================
console.log('— D: Regeln');
{
  const src = fs.readFileSync(APP, 'utf8');
  const bad = ['Korg', 'microKORG', 'RADIAS', 'DWGS', 'Kodamo', 'Mask1', 'Nord', 'Kompakt', 'Clavia'].filter(w => src.includes(w));
  ok(!bad.length, 'Markenwörter: ' + (bad.length ? bad.join(', ') : '0'));
  ok((src.match(/MS 2000/g) || []).length === 1, '„MS 2000“ genau 1×');
  ok((src.match(/  live: true,/g) || []).length === 1, '„  live: true,“ genau 1×');
  const blk = src.slice(src.indexOf('/* ===== VOX2-BEGIN'), src.indexOf('/* VOX2-END */'));
  ok(blk.length > 1000 && !/[\u{1F300}-\u{1FAFF}]/u.test(blk.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/[^\n]*/g, '')), 'VOX2-Block: keine Emojis im Code (nur gezeichnete Formen)');
}
await br.close();
console.log(fail ? `FEHLER: ${fail} (OK ${okN})` : `ALLE OK (${okN})`);
process.exit(fail ? 1 : 0);
