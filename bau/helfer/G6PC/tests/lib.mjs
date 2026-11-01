// G6+c Tests: App öffnen (Datei aus APP oder ../index.html), synthetischer Gesang auf STIMME, v2-Chor aus Stil-Daten (nur Testdaten)
import { createRequire } from 'module';
const { chromium } = createRequire(import.meta.url)('playwright');
import { fileURLToPath } from 'url';
import path from 'path';
const HERE = path.dirname(fileURLToPath(import.meta.url));
export const APP = process.env.APP || path.join(HERE, '..', 'index.html');
export async function open(o = {}) {
  const b = await chromium.launch({args: ['--autoplay-policy=no-user-gesture-required']});
  const p = await b.newPage({viewport: {width: o.w || 390, height: o.h || 844}});
  const errs = []; p.on('pageerror', e => errs.push('PAGEERR ' + String(e))); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  await p.goto('file://' + APP); await p.waitForTimeout(1200);
  await p.mouse.click(5, 300);
  await p.waitForFunction(() => window.SynthHost && SynthHost.state !== 'loading' && AU.ctx, null, {timeout: 15000}).catch(() => {});
  await p.waitForTimeout(300);
  return {b, p, errs};
}
// Gesang: C-Dur-Melodie (je Note 1 Schlag bei 120 BPM), Obertöne mit Vibrato ±25 ct, kurze Rausch-Konsonanten
export async function demo(p, o = {}) {
  return p.evaluate(async (o) => {
    const A = SYNQUENZER; A.setMetronome && A.setMetronome(false);
    S.bpm = 120; const sr = o.sr || 48000, mel = [60, 62, 64, 65, 67, 65, 64, 62], nb = sr * 0.5, n = nb * mel.length, pcm = new Array(n); let ph = 0, seed = 7;
    const rnd = () => ((seed = (seed * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff) * 2 - 1;
    for (let k = 0; k < n; k++) {
      const j = (k / nb) | 0, t = (k % nb) / sr, f = 440 * Math.pow(2, (mel[j] - 69) / 12) * Math.pow(2, 25 / 1200 * Math.sin(2 * Math.PI * 5.5 * k / sr));
      ph += 2 * Math.PI * f / sr; let y = 0; for (let h = 1; h <= 8; h++) y += Math.sin(h * ph) / h * (h === 2 || h === 3 ? 1.3 : 1);
      const env = Math.min(1, t * 40, (0.5 - t) * 40), cons = t < 0.03 ? rnd() * 0.25 : 0;
      pcm[k] = Math.round(6000 * (t < 0.03 ? cons : y * env));
    }
    const r = await A.tkInject({pcm, sr, scene: 0, len: 2});
    A.selectTrack && A.selectTrack(r.track); R.selS = 0;
    return r;
  }, o);
}
// v2-Chor aus Stil-Daten (Testdaten nach Spec-Tabelle G6+d; iv aus einfacher Regel – die echten Regeln baut G6+b/G6+d)
export const STY = {
  '80': {grp: {below: 8, hp: 180, mid: -3, midF: 400, air: 3, sib: -12, rev: .75, pre: '1/32', dly: .12}, v: [['uni', 0, 1, 0, [[16, -8, -1], [29, 9, 1]]], ['st+2', 0, .7, -1, [[12, -6, -1], [24, 8, 1]]], ['oct+1', 0, .4, -4, [[20, -5, -1], [33, 7, 1]]]]},
  pop: {grp: {below: 9, hp: 200, mid: -2, midF: 350, air: 4, sib: -60, rev: .35, pre: '1/64', dly: .18}, v: [['uni', 0, 1, 0, [[8, -4, -1], [15, 5, 1]]], ['st+2', 0, .6, -2, [[10, -5, -1], [18, 6, 1]]], ['oct-1', 0, .3, -7, [[8, -4, -1], [15, 5, 1]]]]},
  gospel: {grp: {below: 6, hp: 120, mid: -1, midF: 300, air: 2, sib: -12, rev: .5, pre: '1/32', dly: 0}, v: [['ch+1', -.45, .25, 0, [[9, -10, -1], [21, 5, 0], [34, 12, 1]]], ['ch-1', .45, .25, 0, [[11, -10, -1], [23, 5, 0], [36, 12, 1]]], ['ch-2', 0, .35, -1, [[13, -10, -1], [25, 5, 0], [38, 12, 1]]]]},
  barber: {grp: {below: 4, hp: 70, mid: 0, midF: 400, air: 1, sib: -6, rev: .2, pre: '1/64', dly: 0}, v: [['ch+1', -.3, 0, -1, [[0, 0, 0]]], ['ch-1', .3, 0, 0, [[0, 0, 0]]], ['root-', 0, 0, 1, [[0, 0, 0]]]]},
  rock: {grp: {below: 5, hp: 250, mid: 2, midF: 1500, air: 0, sib: -12, rev: .2, pre: 'aus', dly: 0}, v: [['uni', 0, .8, 0, [[17, -14, -1], [28, 12, 1], [41, -19, -.5], [52, 17, .5]]], ['oct-1', 0, .6, -3, [[17, -14, -1], [28, 12, 1], [41, -19, -.5], [52, 17, .5]]]]},
  ballade: {grp: {below: 10, hp: 150, mid: -2, midF: 300, air: -2, sib: -60, rev: .85, pre: '1/16', dly: .2}, v: [['st+2', -.35, .35, -1, [[20, -6, -1], [35, 7, 1]]], ['st-5', .35, .35, -2, [[20, -6, -1], [35, 7, 1]]]]},
  disco: {grp: {below: 7, hp: 300, mid: -2, midF: 500, air: 5, sib: -18, rev: .5, pre: '1/32', dly: .15}, v: [['oct+1', -.5, .3, 0, [[10, -7, -1], [18, 7, 1]]], ['st+2/o+1', .5, .3, -2, [[10, -7, -1], [18, 7, 1]]]]},
  wave: {grp: {below: 9, hp: 80, mid: -2, midF: 2500, air: -3, sib: -12, rev: .6, pre: '1/32', dly: .25}, v: [['oct-1', -.4, 0, 0, [[25, -5, 0]]], ['st-4', .4, 0, -2, [[28, 5, 0]]]]},
  bg: {grp: {below: 9, hp: 180, mid: -2, midF: 400, air: 2, sib: -12, rev: .5, pre: '1/32', dly: .1}, v: [['free', -.6, .15, 0, [[12, -6, -1], [24, 8, 1]]]]}
};
export async function putStyle(p, name) {
  return p.evaluate(async ({name, st}) => {
    const r = {t: stimmeT(), s: 0}, x = tkRef(r), a = x.a, b = g6Lead(a);
    for (let n = 0; n < 400 && !b; n++) await new Promise(q => setTimeout(q, 25));
    const L = g6Lead(a), A = await g2Call({op: 'an', key: 'h:' + a.take + '@' + wpBid(L), x: L.getChannelData(0), sr: L.sampleRate});
    const notes = (A.notes || []).filter(n => n.t1 > a.in && n.t0 < a.out), key = g2KeyAt(r);
    const f = (rule, p) => { const [base, oc] = rule.split('/o'), o = oc ? 12 * +oc : 0; const tri = g6Chord(p, key, null);
      if (base === 'uni' || base === 'free') return o; if (base.startsWith('oct')) return 12 * +base.slice(3) + o; if (base.startsWith('st')) return g6Step(p, +base.slice(2), key) - p + o;
      if (base === 'ch+1') return g6Above(p, tri) - p; if (base === 'ch-1') return g6Below(p, tri) - p; if (base === 'ch-2') return g6Below(g6Below(p, tri), tri) - p;
      if (base === 'root-') { const bb = g6Below(p, tri); let q = bb - 1; while ((((q % 12) + 12) % 12) !== tri[0] || q > bb - 3) q--; return q - p; } return 0; };
    const chor = {v: 2, style: name, grp: Object.assign({}, st.grp), voices: st.v.map(([rule, pan, w, db, dbl], k) => ({lane: 'c' + (k + 1), rule, pan, w, db, dbl: dbl.map(([ms, ct, pp]) => ({ms, ct, p: pp})),
      n: notes.map(n => ({t0: n.t0, t1: n.t1, m: n.m, d: 0, iv: f(rule, Math.round(n.m))}))}))};
    const ok = SYNQUENZER.g6pPut(r, chor), w = await SYNQUENZER.g6pWait(r);
    return {ok, w, notes: notes.length, voices: chor.voices.length};
  }, {name, st: STY[name]});
}
// Lautheit aus dem Abgriff (Lead / Chor) bei einmal Abspielen des Clips
export async function playTap(p, ms) {
  return p.evaluate(async (ms) => {
    const A = SYNQUENZER, sleep = q => new Promise(r => setTimeout(r, q));
    A.launchScene(0); A.play(); await sleep(60); A.g6pTap(true); await sleep(1500); const mid = SYNQUENZER.g6pInfoC(); await sleep((ms || 4300) - 1500); const T = A.g6pTap(false); A.stop(); await sleep(200);
    const lu = (L, R) => g6pcLufs([L, R], T.sr), rms = x => { let s = 0; for (const y of x) s += y * y; return 10 * Math.log10(s / Math.max(1, x.length) + 1e-30); };
    return {mid, Ll: lu(T.L[0], T.L[1]), Lc: lu(T.C[0], T.C[1]), Hc: rms(T.H), peakC: T.C[0].reduce((m, y) => Math.max(m, Math.abs(y)), 0), live: SYNQUENZER.g6pInfoC(), n: T.L[0].length};
  }, ms);
}
