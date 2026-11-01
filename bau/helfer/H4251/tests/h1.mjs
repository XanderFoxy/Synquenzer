// H1 Abnahme H-01 … H-06: ● startet die Begleitung mit (Szene). node h1.mjs <index.html>
import {open, micOn, g10demo, closeAll, sleep, log, ovlStart, ovlStop, waitBeat, T} from './h-lib.mjs';
const FILE = process.argv[2], ok = T();
const perBar = L => { const m = {}; for (const e of L) { if (e.src === 'click' || e.track < 0) continue; const k = e.track + ':' + Math.floor(e.beat / 4 + 1e-9); m[k] = (m[k] || 0) + 1; } return m; };
const STI = p => p.evaluate(() => SYNQUENZER.tkInfo().stimme);
// Zustand „nichts belegt“ (Spec H1: R.slot −1; nach dem Laden setzt applyProject Szene 1, Z. 34851 – hier wie nach ■ aller Spuren)
const free = p => p.evaluate(() => { for (let i = 0; i < NT(); i++) { R.slot[i] = -1; R.pend[i] = null; } });
const done = p => p.waitForFunction(() => !SYNQUENZER.vsInfo().busy && !SYNQUENZER.tkInfo().pend.length && SYNQUENZER.tkInfo().writes === 0 && SYNQUENZER.rec && SYNQUENZER.runtime().rec.state === 'off', null, {timeout: 30000}).then(() => sleep(400));
async function take(p, scene, bars) {   // STIMME-Zelle der Szene, ● aus dem Stopp (Einzähler 1), nach `bars` Takten ● (Ende am Taktstrich)
  await p.evaluate(s => { SYNQUENZER.selectSlot(SYNQUENZER.tkInfo().stimme, s); SYNQUENZER.rec(); }, scene);
  await waitBeat(p, bars * 4 - 3.7); await p.evaluate(() => SYNQUENZER.rec()); await waitBeat(p, bars * 4 + .3); await done(p);
}
// H-01 frischer Start, alle R.slot −1
{
  const H = await open(FILE), p = H.p; await g10demo(p); await micOn(p); await free(p);
  const s0 = await p.evaluate(() => R.slot.slice()); await p.evaluate(() => SYNQUENZER.g10OutRms()); await ovlStart(p);
  const tk0 = await p.evaluate(() => Object.keys(SYNQUENZER.takes()).length);
  await take(p, 0, 4);
  const L = await log(p), pb = perBar(L), ov = await ovlStop(p);
  const r = await p.evaluate(() => ({rms: SYNQUENZER.g10OutRms(0, 12), takes: SYNQUENZER.takes(), clip: SYNQUENZER.getClip(SYNQUENZER.tkInfo().stimme, 0)}));
  const ci = L.filter(e => e.beat < -1e-6 && e.src !== 'click' && e.track >= 0);
  const need = [0, 1, 2, 4, 5], miss = []; for (const t of need) for (let b = 0; b < 4; b++) if (!pb[t + ':' + b]) miss.push(t + ':' + b);
  const ntk = Object.keys(r.takes).length;
  // Vergleich: dieselbe Szene ohne Aufnahme (▶ 1), gleiche Schläge
  await p.evaluate(() => { SYNQUENZER.stop(); SYNQUENZER.stop(); }); await sleep(1500);
  await p.evaluate(() => { SYNQUENZER.stimmeStop(); SYNQUENZER.setClip(SYNQUENZER.tkInfo().stimme, 0, null); }); await sleep(300);
  await p.evaluate(() => { for (let i = 0; i < NT(); i++) R.slot[i] = -1; SYNQUENZER.launchScene(0); }); await waitBeat(p, 12.2);
  const ref = await p.evaluate(() => SYNQUENZER.g10OutRms(0, 12));
  ok('H-01 alle R.slot −1 vor ●', s0.every(x => x === -1), JSON.stringify(s0));
  ok('H-01 M-BEGL Synth 1, Synth 2, Synth 3, Drums, Melodie je Takt ≥ 1 Note (Takt 1–4 = ganzer Take)', !miss.length, miss.length ? 'fehlt ' + miss.join(',') : '');
  ok('H-01 im Einzähler keine Clip-Noten (wie 4.25.0)', ci.length === 0, ci.length + ' Noten < 0');
  ok('H-01 g10OutRms ≥ −30 dBFS und ±1 dB zur Szene ohne Aufnahme', r.rms >= -30 && Math.abs(r.rms - ref) <= 1, r.rms.toFixed(1) + ' / ohne Aufnahme ' + ref.toFixed(1));
  ok('H-01 Take aufgenommen (neuer Eintrag in S.takes, Clip ≥ 4 Takte)', ntk === tk0 + 1 && r.clip && r.clip.audio && r.clip.len >= 4, 'Takes ' + tk0 + '→' + ntk + ' Länge ' + (r.clip && r.clip.len));
  ok('H-01 Overlay nennt Begleitung', ov.some(x => x.show && /Begleitung: Synth 1, Synth 2, Synth 3 \+2/.test(x.tgt)), (ov.find(x => x.show) || {}).tgt);
  ok('H-01 Konsole', !H.errs.length, H.errs.join(' | ').slice(0, 200));
  await H.close();
}
// H-02 ▶ Szene 2, ■, ● auf STIMME Szene 1
{
  const H = await open(FILE), p = H.p; await g10demo(p); await micOn(p);
  await p.evaluate(() => SYNQUENZER.launchScene(1)); await waitBeat(p, 4.5); await p.evaluate(() => SYNQUENZER.stop()); await sleep(600);
  const s0 = await p.evaluate(() => R.slot.slice()); await ovlStart(p);
  await p.evaluate(() => { SYNQUENZER.selectSlot(SYNQUENZER.tkInfo().stimme, 0); SYNQUENZER.rec(); }); await sleep(300);
  const s1 = await p.evaluate(() => R.slot.slice()); await waitBeat(p, 2); const ov = await ovlStop(p);
  await p.evaluate(() => { SYNQUENZER.rec(); }); await sleep(200); await p.evaluate(() => SYNQUENZER.stop());
  const exp = s0.map((x, i) => (x !== -1 ? x : i === 6 ? -1 : [5].includes(i) ? 0 : -1));
  ok('H-02 belegte Spuren bleiben auf Szene 2, nur leere bekommen Szene 1', JSON.stringify(s1.slice(0, 7)) === JSON.stringify(exp.slice(0, 7)), 'vor ' + JSON.stringify(s0) + ' nach ' + JSON.stringify(s1));
  const t = (ov.find(x => x.show) || {}).tgt || '';
  ok('H-02 M-OVL Namen', /Begleitung: Synth 1, Synth 2, Synth 3 \+2/.test(t), t);
  await H.close();
}
// H-03 MIDI-Aufnahme auf Synth 1 (🎤 aus) aus dem Stopp: R.slot der anderen unverändert
{
  const H = await open(FILE), p = H.p; await g10demo(p); await free(p);
  const s0 = await p.evaluate(() => R.slot.slice());
  await p.evaluate(() => { SYNQUENZER.selectSlot(3, 0); SYNQUENZER.rec(); }); await sleep(300);
  const s1 = await p.evaluate(() => R.slot.slice()); await p.evaluate(() => { SYNQUENZER.rec(); SYNQUENZER.stop(); });
  ok('H-03 MIDI-Take ohne 🎤: R.slot der anderen Spuren vorher = nachher', s0.every((x, i) => i === 3 || x === s1[i]), JSON.stringify(s0) + ' → ' + JSON.stringify(s1));
  await H.close();
}
// H-04 laufender Transport: R.slot aller anderen vor/nach ● gleich; H-05 Undo + R.slot nach ■
{
  const H = await open(FILE), p = H.p; await g10demo(p); await micOn(p);
  await p.evaluate(() => SYNQUENZER.launchScene(1)); await waitBeat(p, 1.2);
  const s0 = await p.evaluate(() => R.slot.slice());
  await p.evaluate(() => { SYNQUENZER.selectSlot(SYNQUENZER.tkInfo().stimme, 0); SYNQUENZER.rec(); }); await sleep(200);
  const s1 = await p.evaluate(() => R.slot.slice());
  await waitBeat(p, 4.2); await p.evaluate(() => SYNQUENZER.stop()); await sleep(800);
  ok('H-04 laufend: R.slot aller Spuren außer der Aufnahmespur gleich', s0.every((x, i) => i === 6 || x === s1[i]), JSON.stringify(s0) + ' → ' + JSON.stringify(s1));
  await H.close();
}
{
  const H = await open(FILE), p = H.p; await g10demo(p); await micOn(p); await free(p);
  const u0 = await p.evaluate(() => UNDO.length);
  await take(p, 0, 3);
  const r = await p.evaluate(() => ({u: UNDO.length, slot: R.slot.slice()}));
  await p.evaluate(() => SYNQUENZER.stop()); await sleep(800);
  const after = await p.evaluate(() => ({slot: R.slot.slice(), exp: S.tracks.map(t => (t.clips[0] ? 0 : -1))}));
  // Vergleich: ▶ 1 und ■
  ok('H-05 Aufnahme = genau 1 Undo-Schritt (recWithScene legt keinen an)', r.u === u0 + 1, u0 + ' → ' + r.u);
  ok('H-05 nach ■: R.slot wie nach ▶ 1', JSON.stringify(after.slot.slice(0, 7)) === JSON.stringify(after.exp.slice(0, 7)), JSON.stringify(after));
  await H.close();
}
// H-06 Szene ohne Clips → Overlay + Toast „Ohne Begleitung …“, Aufnahme läuft
{
  const H = await open(FILE), p = H.p; await g10demo(p); await micOn(p); await free(p); await ovlStart(p);
  const tk0 = await p.evaluate(() => Object.keys(SYNQUENZER.takes()).length);
  await take(p, 4, 3);
  const ov = await ovlStop(p), r = await p.evaluate(() => ({toasts: window.__toasts, takes: Object.keys(SYNQUENZER.takes()).length}));
  ok('H-06 Overlay „Ohne Begleitung – Szene 5 ist leer“', ov.some(x => x.show && x.tgt === 'Ohne Begleitung – Szene 5 ist leer'), (ov.find(x => x.show) || {}).tgt);
  ok('H-06 Toast', r.toasts.includes('Ohne Begleitung – Szene 5 ist leer'), JSON.stringify(r.toasts));
  ok('H-06 Aufnahme läuft trotzdem (Take angelegt)', r.takes === tk0 + 1, tk0 + '→' + r.takes);
  await H.close();
}
await closeAll(); process.exit(ok.sum() ? 1 : 0);
