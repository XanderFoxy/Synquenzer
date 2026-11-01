// QA K1: late notes around opening the editor (+ the Mod-Übersicht on K) while the demo plays with Synth 2 = MS 2000 Hauchlead
import {open, sleep} from './n5-k-qa-lib.mjs';
const FILE = process.env.F, TAG = FILE ? 'base' : 'K', MODS = process.argv[2] !== 'nomods';
const out = [];
for (let rep = 0; rep < 3; rep++) {
  const T = await open({vp: [390, 844], file: FILE}); const {p, E} = T;
  await E(async () => { const Q = SYNQUENZER; Q.play(); Q.stop(); Q.setMetronome(false); Q.setBpm(120); mkLoad(); for (let i = 0; i < 80 && !mkLoaded(); i++) await new Promise(r => setTimeout(r, 100)); Q.setEngine(1, 'mk'); loadPreset(1, 'f-mk-d05');
    window.__late = []; window.__lt = []; new PerformanceObserver(l => { for (const e of l.getEntries()) window.__lt.push([Math.round(e.duration), Math.round(e.startTime)]); }).observe({entryTypes: ['longtask']});
    const o = window.logNote; window.logNote = function (e) { const r = o.apply(this, arguments); try { if (e && e.time != null) { const d = e.time - AU.ctx.currentTime; if (d < 0.003) window.__late.push([+(d * 1000).toFixed(1), e.track]); } } catch (_) {} return r; }; });
  const s1 = (await T.find('button.scn', /^▶\s*1/))[0]; await T.tap(s1.cx, s1.cy, 300);
  await p.waitForFunction(() => audBeat() >= 12.3, null, {timeout: 60000, polling: 10});
  const pn = await E(() => performance.now());
  const th = (await T.find('.th', /^SYNTH 3/i))[0]; await T.tap(th.cx, th.cy, 250); await T.tapSel('button', /^KLANG$/, 900);
  if (TAG === 'K' && MODS) { const m = (await T.find('#synthSheet .edm'))[0]; await T.tap(m.cx, m.cy, 350); const mi = (await T.find('.pop button', /^Modulationen/))[0]; await T.tap(mi.cx, mi.cy, 450); }
  await p.waitForFunction(() => audBeat() >= 28, null, {timeout: 60000, polling: 10});
  const r = await E(pn => ({late: window.__late, lt: window.__lt.filter(x => x[1] >= pn - 50).map(x => x[0])}), pn);
  out.push(r); console.log(TAG + (MODS ? '' : ' nomods'), 'rep', rep, JSON.stringify(r));
  await T.b.close();
}
