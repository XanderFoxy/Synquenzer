// ND4-01 (Regel 28): neue Version gegen die alte (vs-base-B.html, 4.23.0) – ohne Modell-Pad bleibt alles bitgleich.
//  (a) Demo-Projekt, INIT Drums, alle Werks-Kits: normierter Drum-Sound (JSON) und slotParams aller 12 Pads deep-equal;
//      Projekt-Rundreise (projectFileObj -> parseAny) gleich in beiden Builds und gleich dem Original
//  (b) Offline-Render je Kit (DrumSynth.hit über kitBus + Strips im OfflineAudioContext, Math.random geseedet): bitgleich
//  (c) ohne Modell-Pad: kein addModule mit 'synq-md' (Hook auf AudioWorklet.prototype.addModule), MDX.adds 0, MDX.st 'off'
//      nach ensureAudio und 2 s Demo-Wiedergabe
//  (d) Seitengröße neu − alt ≤ 100 KB
// Aufruf: NODE_PATH=/opt/node-tools/node_modules node md4-golden.mjs <neu.html> <alt.html>
import {createRequire} from 'module'; import fs from 'fs';
const {chromium} = createRequire(import.meta.url)('playwright');
const NEW = process.argv[2] || new URL('../index.html', import.meta.url).pathname;
const OLD = process.argv[3] || '/home/user/Synquenzer/bau/werkzeug/vs-base-B.html';
const b = await chromium.launch({args: ['--autoplay-policy=no-user-gesture-required']});
const checks = {}; const ok = (k, v, info) => { checks[k] = info === undefined ? !!v : {ok: !!v, ...info}; };

async function open(file) {
  const p = await b.newPage({viewport: {width: 390, height: 844}}); const errs = [];
  p.on('pageerror', e => errs.push(String(e))); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  await p.addInitScript(() => {
    // geseedeter Zufall (nur für die Renders; __seed setzt ihn zurück)
    const R0 = Math.random; let s = 0, on = false;
    window.__seed = v => { s = v >>> 0; on = true; }; window.__unseed = () => { on = false; };
    Math.random = () => { if (!on) return R0(); s = (Math.imul(s, 1664525) + 1013904223) >>> 0; return s / 4294967296; };
    // Modul-Log: jede addModule-URL und ob ihr Quelltext den Prozessor 'synq-md' registriert
    window.__adds = [];
    const o = AudioWorklet.prototype.addModule;
    AudioWorklet.prototype.addModule = function (u) {
      const e = {u: String(u).slice(0, 40), md: null}; window.__adds.push(e);
      try {
        const us = String(u);
        if (us.startsWith('data:')) { const i = us.indexOf(','); const body = us.slice(i + 1); const txt = /;base64/.test(us.slice(0, i)) ? atob(body) : decodeURIComponent(body); e.md = /synq-md/.test(txt); }
        else fetch(us).then(r => r.text()).then(t => { e.md = /synq-md/.test(t); }).catch(() => { e.md = 'unlesbar'; });
      } catch (err) { e.md = 'fehler'; }
      return o.apply(this, arguments);
    };
  });
  await p.goto('file://' + file); await p.waitForFunction(() => window.SYNQUENZER && window.SYNQUENZER.version, null, {timeout: 30000}); await p.waitForTimeout(800);
  return {p, errs};
}
const A = await open(NEW), B = await open(OLD);
const KITS = ['__demo', 'INIT Drums', ...await A.p.evaluate(() => KIT_NAMES)];

// (a) Daten: normierter Sound + slotParams aller Pads + Projekt-Rundreise
const data = P => P.p.evaluate(kits => {
  const out = {};
  for (const k of kits) {
    const snd = k === '__demo' ? demoProject().tracks[DRUM_T].sound : kitSound(k);
    applyDrumSound(deep(snd));
    const sp = {}; for (const v of DRUM_VOICES) sp[v.id] = slotParams(v.id);
    out[k] = JSON.stringify({snd: SQStore.normalizeSound(drumSnd()), sp});
  }
  // zurück zum Demo-Projekt, dann Rundreise der Projektdatei
  switchProject(demoProject(), {first: true});
  const f = JSON.stringify(projectFileObj(S, true, false)), r = parseAny(f);
  const clean = o => { const x = JSON.parse(JSON.stringify(o)); return x; };
  const orig = clean(JSON.parse(serializeProject())), back = r.ok ? clean(r.project) : null;
  // Rundreise: Spuren (inkl. Drum-Sound und Clips) gleich dem Original
  const rt = back ? JSON.stringify(back.tracks) === JSON.stringify(orig.tracks) && JSON.stringify(back.tracks[DRUM_T].sound) === JSON.stringify(orig.tracks[DRUM_T].sound) : false;
  const noUid = (k, v) => (k === 'uid' ? undefined : v);   // Spur-uid ist zufällig je Ladevorgang
  out.__file = JSON.stringify(JSON.parse(f).project.tracks, noUid);
  out.__rt = rt; out.__back = back ? JSON.stringify(back.tracks, noUid) : null;
  return out;
}, KITS);
const da = await data(A), db = await data(B);
const dataDiff = KITS.filter(k => da[k] !== db[k]);
ok('a_kits_deepEqual', !dataDiff.length, {n: KITS.length, diff: dataDiff});
ok('a_roundtrip_new', da.__rt); ok('a_roundtrip_old', db.__rt);
ok('a_file_tracks_equal', da.__file === db.__file && da.__back === db.__back);

// (b) Offline-Render je Kit, bitgleich
// M-NULL: dry = Strips ohne Faltungshall, full = mit kitBus (ROOM/GATE). Chromium rendert offline NICHT bitgenau reproduzierbar
// (Oszillator-detune/AudioParam-Vektorpfade, je Lauf ±1 ulp; auch alt gegen alt in derselben Seite, gemessen −120 … −155 dB).
// Darum: Maßstab ≤ −90 dB (Spec: „höchstens ≤ −90 dB mit Begründung“), dazu 2 Versuche je Kit, ob ein Paar bitgleich ist,
// und der Boden alt gegen alt zum Vergleich.
const render = (P, k, mode) => P.p.evaluate(async ([k, mode]) => {
  const snd = k === '__demo' ? demoProject().tracks[DRUM_T].sound : kitSound(k);
  applyDrumSound(deep(snd));
  window.__seed(12345);
  const sr = 48000, sec = 4, oc = new OfflineAudioContext(2, sec * sr, sr);
  const Bf = DrumSynth.buildBuffers(oc), kit = drumKit();
  let mkStrip;
  if (mode === 'full') {
    const K = DrumSynth.kitBus(oc, Bf, oc.destination);
    if (Math.abs(kit.gate - K.gateLen) > .005) K.setGate(kit.gate, kit.gateLvl); else K.gateRet.gain.value = kit.gateLvl;
    K.roomRet.gain.value = kit.room; mkStrip = () => K.strip();
  } else { const bus = oc.createGain(), dr = oc.createGain(), dg = oc.createGain(); bus.connect(oc.destination); mkStrip = () => DrumSynth.strip(oc, bus, dr, dg); }
  const strips = {}; for (const v of DRUM_VOICES) { strips[v.id] = mkStrip(); strips[v.id].set(slotParams(v.id)); }
  const hit = (id, vel, t, acc, lk) => { const P0 = slotParams(id), Pp = lk ? DrumSeq.lockParams(P0, lk) : P0; DrumSynth.hit(oc, Bf, strips[id].in, Pp, vel, t, {accent: acc ? accentAmt(kit.accent) : 0}); };
  DRUM_VOICES.forEach((v, i) => hit(v.id, .9, .05 + i * .2, 0, null));            // jedes Pad einmal
  DRUM_VOICES.forEach((v, i) => hit(v.id, .5, 2.5 + i * .05, i % 2, i % 3 === 0 ? {tune: 3, dec: 1.5} : null));   // leise, Akzent, Locks
  const buf = await oc.startRendering(); window.__unseed();
  const enc = a => { const u = new Uint8Array(a.buffer.slice(0)); let s = ''; for (let i = 0; i < u.length; i += 8192) s += String.fromCharCode.apply(null, u.subarray(i, i + 8192)); return btoa(s); };
  return [enc(buf.getChannelData(0)), enc(buf.getChannelData(1))];
}, [k, mode]);
const dec = s => new Float32Array(Buffer.from(s, 'base64').buffer.slice(0));
const cmp = (p, q) => {
  let diff = 0, s = 0, r = 0, pk = 0;
  for (let c = 0; c < 2; c++) { const x = p[c], y = q[c]; for (let i = 0; i < x.length; i++) { if (x[i] !== y[i]) diff++; const d = x[i] - y[i]; s += d * d; r += y[i] * y[i]; pk = Math.max(pk, Math.abs(y[i])); } }
  return {diff, dB: s === 0 ? -Infinity : 10 * Math.log10(s / Math.max(r, 1e-30)), pk};
};
const fmt = x => ({diff: x.diff, dB: x.dB === -Infinity ? '-inf' : +x.dB.toFixed(1), pk: +x.pk.toFixed(3)});
const rows = []; let allOk = true;
for (const mode of ['dry', 'full']) for (const k of KITS) {
  let best = null, bit = false; const olds = [];
  for (let t = 0; t < 2 && !bit; t++) {
    const a = (await render(A, k, mode)).map(dec), o = (await render(B, k, mode)).map(dec);
    const c = cmp(a, o); if (!best || c.dB < best.dB) best = c; if (c.diff === 0) bit = true;
    olds.push(o);
  }
  const floor = olds.length > 1 ? cmp(olds[0], olds[1]) : null;
  const good = best.pk > 1e-3 && (bit || best.dB <= -90);
  if (!good) allOk = false;
  rows.push(mode + ' ' + k + ': ' + (bit ? 'bitgleich' : fmt(best).dB + ' dB') + (floor ? ' (alt/alt ' + fmt(floor).dB + ')' : ''));
}
ok('b_offline_mnull', allOk, {kits: rows});

// (c) ohne Modell-Pad kein Modul 'synq-md': Demo laden, Audio an, 2 s spielen
const live = async P => {
  await P.p.evaluate(() => { switchProject(demoProject(), {first: true}); ensureAudio(); });
  await P.p.waitForTimeout(600);
  await P.p.evaluate(() => { SYNQUENZER.launchScene ? SYNQUENZER.launchScene(0) : 0; SYNQUENZER.play(); });
  await P.p.waitForTimeout(2000);
  return P.p.evaluate(async () => {
    const hits = typeof HITS !== 'undefined' ? HITS.length : -1, playing = R.playing;
    SYNQUENZER.stop(); await new Promise(r => setTimeout(r, 400));
    return {adds: window.__adds.map(e => ({u: e.u, md: e.md})), mdx: typeof MDX === 'object' ? {adds: MDX.adds, st: MDX.st, node: !!MDX.node} : null, playing, hits, log: (typeof noteLog === 'function' ? 0 : 0)};
  });
};
const la = await live(A), lb = await live(B);
const mdA = la.adds.filter(e => e.md === true), mdB = lb.adds.filter(e => e.md === true);
ok('c_no_md_module', !mdA.length && la.mdx && la.mdx.adds === 0 && la.mdx.st === 'off' && !la.mdx.node && la.playing,
  {adds: la.adds.length, mdAdds: mdA.length, mdx: la.mdx, playing: la.playing, unread: la.adds.filter(e => e.md !== true && e.md !== false).length});
ok('c_same_modules_as_old', la.adds.length === lb.adds.length && !mdB.length, {neu: la.adds.length, alt: lb.adds.length});

// (d) Seitengröße
const dsz = fs.statSync(NEW).size - fs.statSync(OLD).size;
ok('d_size_delta_le_100KB', dsz <= 100 * 1024, {delta: dsz});

ok('no_page_errors', !A.errs.length && !B.errs.length, {neu: A.errs.slice(0, 3), alt: B.errs.slice(0, 3)});
const pass = Object.values(checks).every(v => v === true || (v && v.ok === true));
console.log(JSON.stringify({test: 'md4-golden', id: 'ND4-01', pass, checks}));
await b.close();
process.exit(pass ? 0 : 1);
