// QA: which ■ counts at finger-down? top transport #bPlay vs song view ■ SONG (.sv-play); tie case (time rule), take ab T3
import { openT, down, up, center, waitSong, mk, SETUP } from './v3-qa2d2-lib.mjs';
const {check, done} = mk();
const {b, p, errs, cdp} = await openT({width: 390, height: 844});
for (const [sel, view] of [['#bPlay', true], ['#bPlay', false], ['.sv-play', true]]) {
  for (const [fd, hold] of [[13.6, 260], [13.0, 60]]) {
    await p.evaluate(SETUP(false));
    await p.evaluate(v => { window.SYNQUENZER.songView(v); }, view); await p.waitForTimeout(300);
    await p.evaluate(() => window.SYNQUENZER.songRecFrom({from: 2, mode: 'over', targets: {clips: false, chords: true, notes: false}, preroll: 1}));
    await waitSong(p, fd);
    const c = await center(p, sel);
    const t0 = await p.evaluate(() => window.SYNQUENZER.runtime().song.beat);
    await down(cdp, c.x, c.y); await p.waitForTimeout(hold); await up(cdp); await p.waitForTimeout(250);
    const le = await p.evaluate(() => window.SYNQUENZER.runtime().song.lastEnd);
    check(`${sel} (${view ? 'song view' : 'clip view'}) down at ${t0.toFixed(2)} (f ${(t0 / 4 - 3).toFixed(2)}), held ${hold} ms → endBar 3 expected`, le && le.endBar === 3, le);
    await p.evaluate(() => { const Q = window.SYNQUENZER; if (Q.runtime().song.rec) Q.songRecEnd(); Q.songPlay(false); Q.stop(); }); await p.waitForTimeout(250);
  }
}
check('0 console errors', !errs.length, errs);
await b.close(); process.exit(done() ? 1 : 0);
