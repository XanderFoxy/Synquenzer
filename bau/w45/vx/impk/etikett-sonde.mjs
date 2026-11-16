// IMPK-Sonde: Etikett der Band-Töne beim Akkordwechsel in mehreren Lagen (Figur × Wechsel × Start) – zählt noteLog src „clip“ auf Ziel-Spuren
import { chromium } from '/opt/node-tools/node_modules/playwright/index.mjs';
const f = process.argv[2], br = await chromium.launch({args: ['--autoplay-policy=no-user-gesture-required']});
const p = await br.newPage({viewport: {width: 428, height: 926}}); await p.goto('file://' + f); await p.waitForTimeout(1500);
const r = await p.evaluate(async () => {
  const wait = ms => new Promise(r => setTimeout(r, ms)), until = async b => { const t0 = performance.now(); while (performance.now() - t0 < 30000) { if (R.playing && AU.ctx && audBeat() >= b) return; await wait(8); } };
  const chord = async (ns, hold) => { ns.forEach((n, k) => inputDown(n, 'bk' + k, .8)); await wait(hold || 90); ns.forEach((n, k) => inputUp('bk' + k)); };
  const out = []; ensureAudio(); await wait(300); SYNQUENZER.setBpm(110); const Bg = SYNQUENZER.beg1;
  for (const fig of ['auto', 'stab', 'pad', 'arp']) for (const chg of ['beat', 'bar']) for (const scene of [false, true]) {
    Bg.fig(fig); Bg.chg(chg); Bg.open(); await wait(150); const tg = Bg.state().tg, T = [tg.dr, tg.bs, tg.cp]; clearLog();
    if (scene) { launchScene(0); await until(1.1); } await chord([60, 64, 67], 150);
    for (const [b, c] of [[3.3, [57, 60, 64]], [5.8, [53, 57, 60]], [7.45, [55, 59, 62]], [9.9, [60, 64, 67]]]) { await until(b); await chord(c, 150); }
    await until(12.5); const L = noteLog(4096).filter(e => e.beat != null && T.includes(e.track) && e.src !== 'retune');
    SYNQUENZER.stop(); await wait(400); Bg.close(); await wait(250);
    out.push(fig + '/' + chg + (scene ? '/Szene' : '') + ': clip ' + L.filter(e => e.src === 'clip').length + ' beg ' + L.filter(e => e.src === 'beg').length + ' ' + [...new Set(L.map(e => e.src))].join(','));
  }
  return out;
});
console.log(r.join('\n')); await br.close();
