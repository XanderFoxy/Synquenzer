// QA V2e t4: SCHLEIFE Teil hörbar (P1, touch), Teil einsetzen ▾ → Szene im leeren Song hörbar, Spurbank-Punkt (P3)
import { openVp, mk, SETUP, mkCheck } from './v3-qa-v2e-lib.mjs';
const {check, done} = mkCheck();
{
  const {b, p, errs, cdp} = await openVp('P1');
  const T = mk(p, cdp), {E} = T;
  await E(SETUP(true)); await E(() => window.SYNQUENZER.songView(true)); await p.waitForTimeout(300);
  await E(() => { const Q = window.SYNQUENZER; Q.setBpm(240); Q.clearLog(); Q.songPlay(0); });
  await p.waitForFunction(() => { const s = window.SYNQUENZER.runtime().song; return s.beat != null && s.beat >= 9; }, null, {timeout: 20000, polling: 10});
  // SCHLEIFE ▾ → Teil (playhead in STROPHE T3)
  await T.tapSel('#songView .sv-loop'); 
  const tb = await E(() => { const b = document.querySelector('#popLayer .pop [data-l="part"]'); if (!b) return null; const r = b.getBoundingClientRect(); return {x: r.x + r.width / 2, y: r.y + r.height / 2, t: b.textContent, dis: b.disabled}; });
  console.log('Teil button', JSON.stringify(tb));
  await T.tap(tb.x, tb.y, 100);
  const loop = await E(() => window.SYNQUENZER.song().loop);
  check('SCHLEIFE Teil bei laufendem Song in STROPHE → Schleife T3–6', loop.on && loop.a === 2 && loop.b === 6, loop);
  // listen until transport beat 60: the song beat must wrap back to 8 after 24, never reach bar 7
  const seen = []; const t0 = Date.now();
  while (Date.now() - t0 < 9000) { seen.push(await E(() => window.SYNQUENZER.runtime().song.beat)); await p.waitForTimeout(60); }
  const lg = await E(() => window.SYNQUENZER.noteLog(800).filter(n => n.beat != null && n.track === 0).map(n => n.out));
  await E(() => window.SYNQUENZER.songPlay(false)); await p.waitForTimeout(200);
  const max = Math.max(...seen.filter(x => x != null)), wraps = seen.filter((x, k) => k && x != null && seen[k - 1] != null && x < seen[k - 1] - 2).length;
  check('SCHLEIFE Teil hörbar: Song-Schlag bleibt in [8, 24), springt ≥ 2× zurück, kein REFRAIN-Bass (38)', max < 24 && wraps >= 2 && !lg.slice(-20).includes(38), [max, wraps, lg.slice(-20)]);
  check('0 Konsolenfehler (Schleife)', !errs.length, errs);
  await b.close();
}
{
  // empty song: [＋ Teil einsetzen ▾] → Szene 1 → song with scene 1 (bass 45, drums 36 audible)
  const {b, p, errs, cdp} = await openVp('P1');
  const T = mk(p, cdp), {E} = T;
  await E(SETUP(false)); await E(() => { const Q = window.SYNQUENZER; Q.setSong({bars: 0, lanes: [[], [], [], [], [], []], carrier: [], mel: {}, marks: []}); Q.songView(true); }); await p.waitForTimeout(400);
  const emp = await E(() => !document.querySelector('.sv-empty').hidden);
  const kt = await E(() => { const b = [...document.querySelectorAll('.sv-empty button')].find(x => x.textContent.includes('Teil einsetzen')); if (!b) return null; const r = b.getBoundingClientRect(); return {x: r.x + r.width / 2, y: r.y + r.height / 2}; });
  console.log('empty', emp, JSON.stringify(kt));
  if (kt) {
    await T.tap(kt.x, kt.y);
    const list = await E(() => [...document.querySelectorAll('#popLayer .pop button[data-r]')].map(b => b.dataset.r));
    console.log('list', JSON.stringify(list));
    await T.tapPop('Szene 1');
    const s = await E(() => window.SYNQUENZER.song());
    console.log('song after Szene 1', JSON.stringify({bars: s.bars, lanes: s.lanes, marks: s.marks}));
    await E(() => { const Q = window.SYNQUENZER; Q.setBpm(240); Q.clearLog(); Q.songPlay(0); });
    await p.waitForTimeout(1500);
    const lg = await E(() => window.SYNQUENZER.noteLog(100).filter(n => n.beat != null).map(n => n.track + ':' + n.out));
    await E(() => window.SYNQUENZER.songPlay(false));
    check('Leerer Song → [＋ Teil einsetzen ▾] → Szene 1 → Bass (45) und Drums (36) klingen', lg.includes('0:45') && lg.includes('4:36'), lg);
  }
  check('0 Konsolenfehler (leer)', !errs.length, errs);
  await b.close();
}
{
  // P3 Spurbank: a clip playing on the hidden page → dot on [▲▼]
  const {b, p, errs, cdp} = await openVp('P3');
  const T = mk(p, cdp), {E} = T;
  await E(SETUP(true));
  await E(() => { const Q = window.SYNQUENZER; Q.setClip(5, 0, {len: 1, key: {root: 9, scale: 'aeolian'}, notes: [{t: 0, d: 1, n: 72, v: .8}]}); const s = Q.song(); s.lanes[5] = [{bar: 0, slot: 0}]; Q.setSong(s); Q.songView(true); });
  await p.waitForTimeout(400);
  const i = await T.info();
  await E(() => { const Q = window.SYNQUENZER; Q.setBpm(120); Q.songPlay(0); }); await p.waitForTimeout(1500);
  const dot = await E(() => { const b = document.querySelector('#songView .sv-bank'); return {cls: b.className, rows: window.SYNQUENZER.svLayoutInfo().rows, slot5: R.slot[5]}; });
  await E(() => window.SYNQUENZER.songPlay(false));
  check('P3 Spurbank: MEL-Spur (Seite 2) spielt → Punkt auf [▲▼]', /dot/.test(dot.cls), dot);
  check('0 Konsolenfehler (P3)', !errs.length, errs);
  await b.close();
}
process.exit(done() ? 1 : 0);
