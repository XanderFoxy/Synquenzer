// VS2 M-PLATZ: Ergebnis-Blatt, Mikro-Blatt (Stimme → Noten), FANG 🎤 in P1, P2, P3, L1, L2; Bilder
import {open, micOn, b64, resample} from './v3-vs2-h.mjs';
import {renderVoice} from './v3-vs2-corpus.mjs';
const S = '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/dirigent-test/';
const VP = {P1: [390, 844], P2: [375, 667], P3: [320, 568], L1: [844, 390], L2: [667, 375]};
let fail = 0; const ok = (c, m) => { console.log((c ? '✓ ' : '✗ ') + m); if (!c) fail++; };
const BPM = 200, SB = 60 / BPM;
const mel = [[0, 1, 57], [1, 1, 60], [2, 2, 64], [4, 1, 62], [5, 1, 60], [6, 2, 57]].map(([b, d, m], k) => ({on: 0.04 + b * SB, dur: d * SB, midi: m, legato: false, rest: k ? 0.1 : 0}));
const sig = renderVoice(mel, {voice: 'male', seed: 2, sigma: 10, vib: [20, 30], bpm: BPM});
for (const [nm, [w, h]] of Object.entries(VP)) {
  const H = await open({viewport: {width: w, height: h}, touch: true, mobile: true}); const p = H.p; const m = await micOn(H.p);
  await p.evaluate(bpm => SYNQUENZER.setBpm(bpm), BPM);
  const y = resample(sig.x, 16000, m.sr);
  await p.evaluate(b => { SYNQUENZER.play(); const c = SYNQUENZER.vsClock(); window.__fake.play(b, c.start - 0.04); }, b64(y));
  await p.waitForFunction(sb => { const c = SYNQUENZER.vsClock(); return (c.now - c.outLat - c.start) / c.spb >= 7.2; }, SB, {timeout: 20000});
  // FANG-Taste mit 🎤: passt in die Taste
  const fb = await p.evaluate(() => { const b = [document.getElementById('bFang'), document.getElementById('bFangT')].find(x => x && x.offsetParent); return b ? {txt: b.textContent, sw: b.scrollWidth, cw: b.clientWidth, sh: b.scrollHeight, ch: b.clientHeight, w: b.getBoundingClientRect().width, h: b.getBoundingClientRect().height} : null; });
  ok(fb && /🎤/.test(fb.txt) && fb.sw <= fb.cw + 1 && fb.sh <= fb.ch + 1, `${nm} FANG-Taste „${fb && fb.txt}“ ${fb && Math.round(fb.w)}×${fb && Math.round(fb.h)}, Text passt`);
  await p.screenshot({path: S + `v3-vs2-${nm}-fang.png`});
  // Tipp auf die FANG-Taste (wie der Finger)
  const sel = await p.evaluate(() => (document.getElementById('bFang').offsetParent ? '#bFang' : '#bFangT'));
  await p.tap(sel);
  await p.waitForFunction(() => !!document.querySelector('.pop.vsres'), null, {timeout: 15000}).catch(() => {});
  await p.waitForTimeout(250);
  const L = await p.evaluate(() => {
    const pop = document.querySelector('.pop.vsres'); if (!pop) return null; const r = pop.getBoundingClientRect(), vw = innerWidth, vh = innerHeight;
    const bs = [...pop.querySelectorAll('button')].map(b => { const q = b.getBoundingClientRect(); return {t: b.textContent.trim(), w: q.width, h: q.height, cut: b.scrollWidth > b.clientWidth + 1, in: q.left >= r.left - 1 && q.right <= r.right + 1 && q.bottom <= r.bottom + 1 && q.top >= r.top - 1}; });
    const cv = pop.querySelector('canvas').getBoundingClientRect();
    return {box: [r.left, r.top, r.width, r.height].map(Math.round), inView: r.left >= -1 && r.top >= -1 && r.right <= vw + 1 && r.bottom <= vh + 1, bs, scroll: pop.scrollHeight > pop.clientHeight + 1, cv: [cv.width, cv.height].map(Math.round), title: pop.querySelector('.fs-t').textContent, kb: (document.getElementById('kb').getBoundingClientRect().top)};
  });
  ok(!!L, `${nm} Ergebnis-Blatt offen nach Tipp auf FANG 🎤`);
  if (L) {
    ok(L.inView && !L.scroll, `${nm} Blatt im Bild ${JSON.stringify(L.box)}, ohne Rollen`);
    const small = L.bs.filter(b => b.h < 36 || b.w < 36), cut = L.bs.filter(b => b.cut), out = L.bs.filter(b => !b.in);
    ok(!small.length && !cut.length && !out.length, `${nm} ${L.bs.length} Knöpfe ≥ 36 px, nichts abgeschnitten (${small.map(b => b.t + ' ' + Math.round(b.w) + '×' + Math.round(b.h)).join(', ')}${cut.map(b => b.t).join(', ')}${out.map(b => b.t).join(', ')})`);
    ok(L.cv[1] >= 48, `${nm} Mini-Rolle ${L.cv.join('×')}, Kopf „${L.title}“`);
    if (w < h) ok(L.box[3] <= 270, `${nm} Blatt-Höhe ${L.box[3]} ≤ 270 px (wie FANG TEIL, Tastatur bleibt teils sichtbar)`);
    else ok(L.box[0] >= w - 300, `${nm} Querformat im Seitenfeld (x ${L.box[0]})`);
  }
  await p.screenshot({path: S + `v3-vs2-${nm}-blatt.png`});
  await p.evaluate(() => SYNQUENZER.vsResultOk());
  // Mikro-Blatt mit Quelle / Einrasten / Oktave sperren
  await p.evaluate(() => { SYNQUENZER.vsSet({src: 'inst'}); SYNQUENZER.stimmeSheet(true); });
  await p.waitForTimeout(200);
  const M = await p.evaluate(() => { const pop = document.querySelector('.pop.stpop'); if (!pop) return null; const r = pop.getBoundingClientRect(); const bs = [...pop.querySelectorAll('#vsSrc button, [data-vs]')].map(b => { const q = b.getBoundingClientRect(); return {t: b.textContent, h: q.height, w: q.width, cut: b.scrollWidth > b.clientWidth + 1}; }); return {inView: r.top >= -1 && r.bottom <= innerHeight + 1, sh: pop.scrollHeight, ch: pop.clientHeight, bs}; });
  ok(M && M.inView && M.bs.length === 4 && M.bs.every(b => b.h >= 44 && !b.cut), `${nm} Mikro-Blatt: Quelle + Einrasten + Oktave sperren (${M && M.bs.map(b => b.t + ' ' + Math.round(b.h)).join(' | ')}), ${M && M.sh > M.ch ? 'rollt (' + M.sh + '/' + M.ch + ')' : 'ohne Rollen'}`);
  await p.screenshot({path: S + `v3-vs2-${nm}-mikroblatt.png`});
  ok(!H.errs.length, `${nm} keine Konsolenfehler ${JSON.stringify(H.errs.slice(0, 2))}`);
  await H.br.close();
}
console.log(fail ? 'FAIL ' + fail : 'ALLE OK'); process.exit(fail ? 1 : 0);
