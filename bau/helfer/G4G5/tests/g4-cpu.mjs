// G4-04 CPU: Demo-Projekt + Gesangs-Take in Szene 0 spielt je 3 min mit Effekten „aus“ und „Gesang Synthpop“;
// CPU-Zeit aller Chromium-Prozesse (CDP SystemInfo.getProcessInfo) je Sekunde Laufzeit. node g4-cpu.mjs [sek] [app]
import {open, sleep, APP, voice} from './h.mjs';
const SEC = +(process.argv[2] || 180), FILE = process.argv[3] || APP;
const i16 = x => Array.from(x, v => Math.max(-32768, Math.min(32767, Math.round(v * 32767))));
const H = await open({file: FILE}), p = H.p, cdp = await H.ctx.browser().newBrowserCDPSession();
await p.evaluate(() => { SYNQUENZER.loadDemo(); SYNQUENZER.setMetronome(false); SYNQUENZER.play(); SYNQUENZER.stop(); }); await sleep(300);
const sr = await p.evaluate(() => window.__ctx.sampleRate), bpm = await p.evaluate(() => S.bpm);
const r = await p.evaluate(([pc, sr]) => SYNQUENZER.tkInject({pcm: pc, sr, scene: 0, len: 4}), [i16(voice(4, bpm, sr, -28, {voice: 'female'})), sr]);
const cpu = async () => { const i = await cdp.send('SystemInfo.getProcessInfo'); return i.processInfo.reduce((a, x) => a + x.cpuTime, 0); };
const res = {};
for (const mode of ['aus', 'Gesang Synthpop', 'aus ', 'Gesang Synthpop ']) {
  await p.evaluate(m => { if (m.trim() === 'aus') SYNQUENZER.g4Off(); else SYNQUENZER.g4Preset(); }, mode);
  for (let k = 0; k < 4; k++) { await p.evaluate(id => SYNQUENZER.g4Played(id), r.id); await sleep(150); await p.evaluate(() => SYNQUENZER.g4Wait(30000)); }
  const pl = await p.evaluate(id => SYNQUENZER.g4Played(id), r.id);
  await p.evaluate(() => SYNQUENZER.launchScene(0)); await sleep(2000);
  const c0 = await cpu(), t0 = Date.now(); await sleep(SEC * 1000 / 2); const c1 = await cpu(), t1 = Date.now();
  await p.evaluate(() => SYNQUENZER.stop()); await sleep(500);
  const v = (c1 - c0) / ((t1 - t0) / 1000) * 100; (res[mode.trim()] = res[mode.trim()] || []).push(v);
  console.log(`  ${mode.trim().padEnd(16)} ${(SEC / 2)} s: CPU ${v.toFixed(2)} % (G4-Fassung klingt: ${pl.g4})`);
}
const avg = a => a.reduce((x, y) => x + y, 0) / a.length, d = avg(res['Gesang Synthpop']) - avg(res['aus']);
console.log((d <= 3 ? '✓ ' : '✗ ') + `G4-04 CPU ${SEC} s je Fassung (2 × ${SEC / 2} s abwechselnd): aus ${avg(res['aus']).toFixed(2)} %, „Gesang Synthpop“ ${avg(res['Gesang Synthpop']).toFixed(2)} % → ${d >= 0 ? '+' : ''}${d.toFixed(2)} % (Soll ≤ +3); Rechnen je Take einmalig ${JSON.stringify(await p.evaluate(() => SYNQUENZER.g4Info().last && {ms: SYNQUENZER.g4Info().last.ms, how: SYNQUENZER.g4Info().last.how}))}`);
if (H.errs.length) console.log('✗ Konsolenfehler', H.errs.slice(0, 2));
await H.br.close(); process.exit(d <= 3 ? 0 : 1);
