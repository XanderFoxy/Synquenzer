// debug: take end with arp on – which clip notes reach the arp's held set and when
import {open, sleep} from './v3-qa-gmk5-tl.mjs';
const T = await open({viewport: {width: 390, height: 844}}); const {p, E, errs} = T;
const log = (...a) => console.log(...a);
const TR = 2;
await E(() => { SYNQUENZER.setMetronome && SYNQUENZER.setMetronome(false); });
await E(t => { SYNQUENZER.setEngine(t, 'mk'); }, TR); await sleep(800);
await E(t => { const Q = SYNQUENZER; Q.selectTrack(t[0]); Q.mkSet(t[0], 'arp.on', t[1]); Q.mkSet(t[0], 'arp.res', 1); }, [TR, process.argv[2] === 'off' ? 0 : 1]);
await E(() => { window.__st = []; const os = window.scheduleTrack; window.scheduleTrack = function (i, from, to, late) { if (i === 2 && audBeat() > 7) window.__st.push([+from.toFixed(3), +to.toFixed(3), !!late, +audBeat().toFixed(3), new Error().stack.split('\n').slice(2, 4).map(x => x.trim().slice(3, 40)).join(' < ')]); return os.apply(this, arguments); }; window.__cl = []; const o = ARPC.clip; ARPC.clip = function (i, out, n, key, vel, t, dur, src) { window.__cl.push([i, out, +t2b(t).toFixed(3), +(dur / spb()).toFixed(3), +audBeat().toFixed(3)]); return o.apply(this, arguments); }; });
await E(t => SYNQUENZER.tapSlot(t, 2), TR); await sleep(300);
const waitBeat = b => p.waitForFunction(b => audBeat() >= b, b, {timeout: 20000, polling: 2});
await T.tapSel('#bRec', 50);
await p.waitForFunction(() => SYNQUENZER.runtime().rec.state === 'recording', null, {timeout: 8000, polling: 5});
await waitBeat(-0.03); await T.holdKeys([0, 4, 7]); await waitBeat(1.85); await T.releaseKeys();
await waitBeat(2 - 0.03); await T.holdKeys([2, 5, 9]); await waitBeat(3.85); await T.releaseKeys();
await waitBeat(4 - 0.03); await T.holdKeys([4, 7, 11]); await waitBeat(7.85); await T.releaseKeys();
await waitBeat(8.15); await T.tapSel('#bRec', 50);
log('● at', (await E(() => audBeat())).toFixed(3));
for (let k = 0; k < 6; k++) { await sleep(150); log(JSON.stringify(await E(t => ({b: +audBeat().toFixed(3), info: ARPC.info(t), rec: SYNQUENZER.runtime().rec.state, slot: R.slot[t], cs: R.cstart[t], iv: (function () { try { return null; } catch (e) { return null; } })()}), TR))); }
await waitBeat(10.5);
log('sched calls', JSON.stringify(await E(() => window.__st.filter(x => x[0] < 10.2))));
log('clip calls', JSON.stringify(await E(() => window.__cl.filter(x => x[2] > 6))));
log('noteLog', JSON.stringify(await E(() => SYNQUENZER.noteLog(300).filter(e => e.track === 2 && e.beat > 7.5).map(e => [+e.beat.toFixed(3), e.src, e.out]))));
await E(() => SYNQUENZER.stop());
log('errs', JSON.stringify(errs));
await T.br.close();
