// IMPK: Streuung von C2 (gleiche Lage zweimal je Datei) – Töne ohne Etikett vergleichen
import { chromium } from '/opt/node-tools/node_modules/playwright/index.mjs';
const files = process.argv.slice(2), br = await chromium.launch({args: ['--autoplay-policy=no-user-gesture-required']}), res = {};
for (const f of files) for (let k = 0; k < 2; k++) {
  const p = await br.newPage({viewport: {width: 428, height: 926}}); await p.goto('file://' + f); await p.waitForTimeout(1500);
  const r = await p.evaluate(async () => {
    const wait = ms => new Promise(r => setTimeout(r, ms)), until = async b => { const t0 = performance.now(); while (performance.now() - t0 < 30000) { if (R.playing && AU.ctx && audBeat() >= b) return; await wait(8); } };
    const chord = async (ns, hold) => { ns.forEach((n, k) => inputDown(n, 'bk' + k, .8)); await wait(hold || 90); ns.forEach((n, k) => inputUp('bk' + k)); };
    ensureAudio(); await wait(300); SYNQUENZER.setBpm(110); const Bg = SYNQUENZER.beg1, all = [];
    for (const fig of ['stab', 'arp']) { Bg.fig(fig); Bg.chg('beat'); Bg.open(); await wait(200); const tg = Bg.state().tg, T = [tg.dr, tg.bs, tg.cp]; clearLog(); await chord([60, 64, 67], 150);
      for (const [b, c] of [[3.3, [57, 60, 64]], [5.8, [53, 57, 60]], [7.45, [55, 59, 62]], [9.9, [60, 64, 67]]]) { await until(b); await chord(c, 150); }
      await until(12.5); const L = noteLog(4096).filter(e => e.beat != null && e.beat < 12 && T.includes(e.track) && e.src !== 'retune');
      SYNQUENZER.stop(); await wait(600); Bg.close(); await wait(300); all.push(...L.map(e => fig + ' ' + e.track + ':' + e.out + '@' + e.beat.toFixed(2) + ' ' + e.src)); }
    return all; });
  res[f.split('/').pop() + k] = r; await p.close();
}
const keys = Object.keys(res), strip = a => a.map(x => x.replace(/ (beg|clip)$/, '')).sort();
for (const k of keys) console.log(k, res[k].length, 'clip', res[k].filter(x => / clip$/.test(x)).length);
for (let i = 1; i < keys.length; i++) { const a = strip(res[keys[0]]), b = strip(res[keys[i]]), sa = new Set(a), sb = new Set(b); console.log(keys[0], 'vs', keys[i], 'nur links', a.filter(x => !sb.has(x)).slice(0, 6).join(' | '), '· nur rechts', b.filter(x => !sa.has(x)).slice(0, 6).join(' | ')); }
await br.close();
