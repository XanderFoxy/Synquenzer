// QA regression V2e′: FANG TEIL by touch (sheet: Länge, name chip, ALS TEIL ✓; second catch: ＋ Ans Song-Ende), undo — base vs new
import { open, NEW, BASE } from './v3-qa-v2e2reg-pw.mjs';
const sleep = ms => new Promise(r => setTimeout(r, ms));
const tapText = async (p, sel, re) => { const c = await p.evaluate(([s, src]) => { const re = new RegExp(src); const b = [...document.querySelectorAll(s)].find(x => x.offsetWidth && re.test(x.textContent.trim())); if (!b) return null; const r = b.getBoundingClientRect(); return {x: r.left + r.width / 2, y: r.top + r.height / 2}; }, [sel, re.source]); if (!c) return false; await p.touchscreen.tap(c.x, c.y); return true; };
const tapEl = async (p, sel) => { const c = await p.evaluate(s => { const e = document.querySelector(s); const r = e.getBoundingClientRect(); return {x: r.left + r.width / 2, y: r.top + r.height / 2}; }, sel); await p.touchscreen.tap(c.x, c.y); };
const res = {};
for (const [name, file] of [['base', BASE], ['new', NEW]]) for (const [vp, w, h] of [['P1', 390, 844], ['L1', 844, 390]]) {
  const {b, p, errs} = await open({width: w, height: h}, file, true);
  const r = {};
  await p.evaluate(async () => { const Q = window.SYNQUENZER; await Q.loadDemo(); Q.setBpm(200); Q.setMetronome(false);
    Q.setPart(0, {name: 'Strophe', slots: [{s: 0}, {s: 0}, {s: 0}, -1, {s: 0}, -1], chords: {len: 1, ch: [{b: 0, tg: Q.parseChord('Am')}]}}); Q.launchScene(0); Q.setKbMode('transpose'); });
  await p.evaluate(([seq, b0]) => new Promise(res => { let k = 0; const Q = window.SYNQUENZER; const iv = setInterval(() => { const b = Q.runtime().beat; if (k < seq.length && b >= b0 + 4 * k + .03) { Q.chord([seq[k], seq[k] + 4, seq[k] + 7], 120); k++; } if (k >= seq.length) { clearInterval(iv); res(); } }, 3); }), [[57, 53, 48, 55, 57, 53, 48, 55], 4]);
  await p.waitForFunction(() => window.SYNQUENZER.runtime().beat >= 36.3, null, {polling: 5});
  await tapEl(p, w > h ? '#bFangT' : '#bFang'); await sleep(200);
  r.sheet = await p.evaluate(() => !!document.querySelector('.pop.fsheet'));
  let fp = await p.evaluate(() => window.SYNQUENZER.fangPart());
  r.fp0 = fp && {len: fp.len, end: fp.end, chords: fp.clips, endText: fp.endText};
  r.len2 = await tapText(p, '.pop.fsheet .fs-len button', /^2$/); await sleep(100);
  r.nm = await tapText(p, '.pop.fsheet .fs-nm button', /^Strophe/); await sleep(100);
  r.dup = await p.evaluate(() => [...document.querySelectorAll('.pop.fsheet .fs-nm button')].map(b => b.textContent.trim()));
  r.ok = await tapText(p, '.pop.fsheet button', /ALS TEIL/); await sleep(200);
  r.parts = await p.evaluate(() => window.SYNQUENZER.parts().filter(Boolean).map(x => x.name + ':' + x.len + ':' + JSON.stringify(x.lanes || x.slots).length));
  r.keys = await p.evaluate(() => [...document.querySelectorAll('.pk')].filter(k => k.offsetWidth).map(k => k.textContent.trim()));
  r.sheetAfter = await p.evaluate(() => !!document.querySelector('.pop.fsheet'));
  // second catch → ＋ Ans Song-Ende
  const b1 = await p.evaluate(() => window.SYNQUENZER.runtime().beat);
  const t2 = Math.ceil(b1 / 4) * 4 + 8 + .3;
  await p.waitForFunction(x => window.SYNQUENZER.runtime().beat >= x, t2, {polling: 5});
  await tapEl(p, w > h ? '#bFangT' : '#bFang'); await sleep(200);
  r.sheet2 = await p.evaluate(() => !!document.querySelector('.pop.fsheet'));
  r.end = await tapText(p, '.pop.fsheet button', /Song-Ende|＋ Song/); await sleep(250);
  r.song = await p.evaluate(() => { const s = window.SYNQUENZER.song(); return s && {bars: s.bars, marks: (s.marks || []).length, lanes: s.lanes.map(l => l.length)}; });
  r.u = await p.evaluate(() => window.SYNQUENZER.undoInfo());
  await p.evaluate(() => window.SYNQUENZER.undo()); await sleep(100);
  r.songUndo = await p.evaluate(() => { const s = window.SYNQUENZER.song(); return s ? s.bars : null; });
  r.errs = errs.slice(); r.te = await p.evaluate(() => window.SYNQUENZER.tickErrors());
  res[name + vp] = r; await b.close();
}
for (const vp of ['P1', 'L1']) for (const k of Object.keys(res['new' + vp])) { const A = JSON.stringify(res['base' + vp][k]), B = JSON.stringify(res['new' + vp][k]); console.log(vp, k, A === B ? 'same ' + B.slice(0, 400) : 'DIFF new ' + B.slice(0, 500) + '\n      base ' + A.slice(0, 500)); }
