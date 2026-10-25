// independent repro: scene placed as a part loses its clips (sceneChunk lanes emptied in place)
import { openVp, mk, SETUP } from './v3-qa-v2e-lib.mjs';
const out = {};
{
  const {b, p, errs, cdp} = await openVp('P1');
  const T = mk(p, cdp), {E} = T;
  await E(SETUP(false));
  out.apiScene0 = await E(() => JSON.stringify({clips: S.tracks.map(t => !!t.clips[0]), sc: sceneChunk(0).lanes, ref: refChunk(partRef('S1')).lanes, len: sceneChunk(0).len}));
  // empty song, touch path [＋ Teil einsetzen ▾] → Szene 1 → ▶
  await E(() => { const Q = window.SYNQUENZER; Q.setSong({bars: 0, lanes: [[], [], [], [], [], []], carrier: [], mel: {}, marks: []}); Q.songView(true); });
  await p.waitForTimeout(400);
  const kt = await E(() => { const b = [...document.querySelectorAll('.sv-empty button')].find(x => x.textContent.includes('Teil einsetzen')); if (!b || !b.offsetWidth) return null; const r = b.getBoundingClientRect(); return {x: r.x + r.width / 2, y: r.y + r.height / 2, t: b.textContent}; });
  out.emptyBtn = kt;
  if (kt) {
    await T.tap(kt.x, kt.y);
    out.emptyList = await E(() => [...document.querySelectorAll('#popLayer .pop button')].filter(b => b.offsetWidth).map(b => b.textContent.trim()));
    await T.tapPop('Szene 1');
    out.emptySong = await E(() => { const s = window.SYNQUENZER.song(); return JSON.stringify({bars: s.bars, lanes: s.lanes, marks: s.marks}); });
    await E(() => { const Q = window.SYNQUENZER; Q.setBpm(240); Q.clearLog(); Q.songPlay(0); });
    await p.waitForTimeout(2500);
    out.emptyLog = await E(() => window.SYNQUENZER.noteLog(200).filter(n => n.beat != null).map(n => n.track + ':' + n.out));
    await E(() => window.SYNQUENZER.songPlay(false));
    // control: same scene played directly as a scene (the clips exist and sound)
    await p.waitForTimeout(300);
  }
  out.errs1 = errs.slice(0, 5);
  await b.close();
}
{
  // song from 5.5 after Einfügen, touch: STROPHE mark → Ersetzen durch ▾ → Szene 1 → play
  const {b, p, errs, cdp} = await openVp('P1');
  const T = mk(p, cdp), {E} = T;
  await E(SETUP(true)); await E(() => window.SYNQUENZER.songView(true)); await p.waitForTimeout(400);
  out.before = await E(() => { const s = window.SYNQUENZER.song(); return JSON.stringify({bars: s.bars, lanes: s.lanes, marks: s.marks.map(m => [m.id, m.a, m.len, m.part, m.name])}); });
  // find the STROPHE mark (part P1) at bar index 2 and tap it on the ruler
  const L = await E(() => window.SYNQUENZER.svLayoutInfo());
  out.layoutKeys = Object.keys(L);
  await T.tapCv(3 * 36 + 10, 9);
  out.sheet = await T.pop();
  out.sheetTxt = await E(() => { const p = document.querySelector('#popLayer .pop'); return p ? p.textContent.replace(/\s+/g, ' ').slice(0, 300) : null; });
  const rp = await E(() => { const b = document.querySelector('#popLayer .pop [data-a="repl"]'); if (!b) return null; const r = b.getBoundingClientRect(); return {x: r.x + r.width / 2, y: r.y + r.height / 2, t: b.textContent}; });
  out.replBtn = rp;
  if (rp) {
    await T.tap(rp.x, rp.y);
    out.replList = await E(() => [...document.querySelectorAll('#popLayer .pop button[data-r]')].map(b => b.dataset.r + ':' + b.textContent.trim()));
    await T.tapPop('Szene 1');
    out.after = await E(() => { const s = window.SYNQUENZER.song(); return JSON.stringify({bars: s.bars, lanes: s.lanes, marks: s.marks.map(m => [m.id, m.a, m.len, m.part, m.name])}); });
    await E(() => { if (UI.pop) closePop(); });
    // play and collect per-bar notes
    await E(() => { const Q = window.SYNQUENZER; Q.setBpm(300); Q.clearLog(); Q.songPlay(0); });
    await p.waitForFunction(v => { const s = window.SYNQUENZER.runtime().song; return s.beat != null && s.beat >= v; }, 4 * 4 - .4, {timeout: 60000, polling: 10});
    const r = await E(() => ({log: window.SYNQUENZER.noteLog(4000), st: R.songPlay && R.songPlay.startBeat}));
    await E(() => window.SYNQUENZER.songPlay(false));
    const st = r.st != null ? r.st : 0, bars = Array.from({length: 4}, () => ({}));
    for (const n of r.log) { if (n.beat == null) continue; const bar = Math.floor((n.beat - st) / 4 + 1e-6); if (bar < 0 || bar >= 4) continue; (bars[bar][n.track] = bars[bar][n.track] || []).push(n.out); }
    out.heard = bars.map(o => JSON.stringify(o));
  }
  out.errs2 = errs.slice(0, 5);
  await b.close();
}
for (const k in out) console.log(k, typeof out[k] === 'string' ? out[k] : JSON.stringify(out[k]));
