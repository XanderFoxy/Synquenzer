// QA musiker: Demo, Szene 1 läuft durch: Take 1 (● REC mit 🎤), dann Take 2 als Overdub ohne Stopp; wann klingt Take 2, wie laut je Durchgang
// node n4-vs-p-qam-od.mjs [app...]
import {open, micOn, sleep, waitBeat, idle, b64, APP, BASE, mysing} from './n4-vs-p-qa-h.mjs';
const files = process.argv.slice(2).length ? process.argv.slice(2) : [BASE, APP];
const beat = p => p.evaluate(() => { const c = SYNQUENZER.vsClock(); return (c.now - c.outLat - c.start) / c.spb; });
for (const f of files) {
  const H = await open({file: f, viewport: {width: 390, height: 844}, touch: true, mobile: true}), p = H.p;
  await p.evaluate(() => { SYNQUENZER.loadDemo(); SYNQUENZER.setMetronome(false); });
  const sr = await micOn(p, 'wired');
  const bpm = await p.evaluate(() => S.bpm), spb = 60 / bpm;
  await p.evaluate(() => { SYNQUENZER.setRecOptions({countIn: 0, length: 4}); SYNQUENZER.selectSlot(5, 0); SYNQUENZER.launchScene(0); });
  await p.waitForFunction(() => SYNQUENZER.vsClock().playing);
  const y1 = mysing(16 * spb + .5, sr, -34, 3).y, y2 = mysing(16 * spb + .5, sr, -22, 8, {oct: -1}).y;
  await p.evaluate(([b1]) => { const c = SYNQUENZER.vsClock(); window.__fake.play(b1, c.start + 4 * c.spb - 0.04); }, [b64(y1)]);
  await waitBeat(p, 3.6); await p.evaluate(() => SYNQUENZER.rec());
  await waitBeat(p, 21);
  await p.waitForFunction(() => { const st = SYNQUENZER.tkInfo().stimme; const c = st >= 0 && SYNQUENZER.getClip(st, 0); return !!(c && c.audio) && !SYNQUENZER.vsInfo().busy; }, null, {timeout: 60000, polling: 50});
  const r1 = await p.evaluate(() => { const r = SYNQUENZER.vsResult && SYNQUENZER.vsResult(); if (r && SYNQUENZER.vsResultOk) SYNQUENZER.vsResultOk(); return !!r; });
  const t1 = await p.evaluate(() => { const st = SYNQUENZER.tkInfo().stimme, c = SYNQUENZER.getClip(st, 0); return {st, id: c && c.audio && c.audio.take, len: c && c.len}; });
  // nächster Durchgang (Schleife 16 Schläge ab dem STIMME-Clip): Take 2 einen Durchgang später
  const b = await beat(p), S0 = Math.ceil((b + 2) / 16) * 16 + 4 * 0;   // Taktgrenze
  await p.evaluate(([b2, at]) => { const c = SYNQUENZER.vsClock(); window.__fake.play(b2, c.start + at * c.spb - 0.04); }, [b64(y2), S0]);
  await waitBeat(p, S0 - 0.4); await p.evaluate(() => { SYNQUENZER.selectSlot(5, 0); SYNQUENZER.rec(); });
  await waitBeat(p, S0 + 14);
  const log = await p.evaluate(async st => { const out = []; let last = '';
    for (let k = 0; k < 2000; k++) { const c = SYNQUENZER.vsClock(), b = (c.now - c.outLat - c.start) / c.spb; const src = SYNQUENZER.tkInfo().src.filter(r => r.i === st).map(r => r.take.slice(-4) + '@' + ((r.start - c.start) / c.spb).toFixed(2) + '-' + ((r.end - c.start) / c.spb).toFixed(2)).join(' ');
      if (src !== last) { out.push(b.toFixed(2) + ' | ' + src); last = src; } if (out.length > 30 || k > 1500) break; if (b > 999) break; await new Promise(r => setTimeout(r, 10)); if (out.length && b > parseFloat(out[0]) + 24) break; }
    return out; }, t1.st);
  await p.waitForFunction(() => !SYNQUENZER.vsInfo().busy && !SYNQUENZER.tkInfo().pend.length, null, {timeout: 60000});
  const t2 = await p.evaluate(() => { const st = SYNQUENZER.tkInfo().stimme, c = SYNQUENZER.getClip(st, 0); return {id: c && c.audio && c.audio.take, len: c && c.len, alt: c && c.audio && (c.audio.alt || []).map(a => a.take)}; });
  console.log(await p.evaluate(() => SYNQUENZER.version), 'Ergebnisblatt', r1, 'Take1', t1.id, 'Take2', JSON.stringify(t2), 'S0', S0);
  for (const l of log) console.log('   ', l);
  await p.evaluate(st => window.__cap('v', AU.tracks[st].cut), t1.st);
  const b0 = Math.ceil(((await beat(p)) + 1) / 16) * 16;
  await waitBeat(p, b0 + 32.5);
  const lu = await p.evaluate(([b0, spb]) => { const c = SYNQUENZER.vsClock(), C = window.__capGet('v'), sr = window.__ctx.sampleRate, o = [];
    for (let k = 0; k < 2; k++) { const a = Math.round((c.start + c.outLat + (b0 + 16 * k) * spb - C.t0) * sr), n = Math.round(16 * spb * sr); o.push(window.__L.lufs([C.L.subarray(a, a + n), C.R.subarray(a, a + n)], sr).lufs); } return o; }, [b0, spb]);
  console.log('  Durchgänge danach (LUFS STIMME-Ausgang):', JSON.stringify(lu));
  if (await p.evaluate(() => !!SYNQUENZER.vpInfo)) console.log('  vpInfo', JSON.stringify(await p.evaluate(() => { const v = SYNQUENZER.vpInfo(); return {runs: v.runs, sync: v.sync, gated: v.gated, deferred: v.deferred, maxMs: v.maxMs, err: v.err, takes: Object.fromEntries(Object.entries(v.takes).map(([k, x]) => [k.slice(-4), x.heard && [x.heard.lufs, x.heard.gDb, x.heard.lim]]))}; })));
  await p.evaluate(() => SYNQUENZER.stop());
  console.log('  Konsole:', JSON.stringify(H.errs.slice(0, 3)));
  await H.br.close();
}
