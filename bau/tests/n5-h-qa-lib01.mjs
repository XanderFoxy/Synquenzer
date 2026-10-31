// QA copy of n5-h-lib.mjs: only the note() helper uses the app's note fields {n,t,d,v}
// VC2a test helpers (branch H): app launch + a gesture library over all undo kinds (used by n5-h-*.mjs)
import { chromium } from 'playwright';
export const APP = process.env.APP || '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/n5-br-H/index.html';
export const OUT = '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/dirigent-test';
export async function launch(o = {}) {
  const b = await chromium.launch({args: ['--autoplay-policy=no-user-gesture-required'].concat(o.args || [])});
  const ctx = await b.newContext({viewport: o.viewport || {width: 390, height: 844}, hasTouch: !!o.touch, isMobile: !!o.mobile, deviceScaleFactor: o.dpr || 1});
  if (o.init) await ctx.addInitScript(o.init);
  const p = await ctx.newPage();
  const errs = []; p.on('pageerror', e => errs.push(String(e))); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  await p.goto('file://' + APP); await p.waitForTimeout(o.wait || 2200);
  return {b, ctx, p, errs};
}
// installs window.__G: named gestures, each makes exactly one undo entry (checked by the caller)
export async function installGestures(p) {
  await p.evaluate(() => {
    const A = window.SYNQUENZER; let k = 0;
    const note = (i) => ({n: 60 + (i % 12), t: (i * 0.5) % 4, d: 0.5, v: 0.8});   // QA: valid note fields
    const G = {
      clip: () => { k++; const t = k % 4, s = (k >> 2) % 4; A.setClip(t, s, {len: 1, notes: [note(k), note(k + 3)]}); },
      clipDel: () => { k++; A.setClip(k % 4, 5, null); A.setClip(k % 4, 5, {len: 1, notes: [note(k)]}); },
      sound: () => { k++; const t = k % 4, s = A.getSound(t); s.p.cutoff = 400 + (k * 137) % 8000; A.setSound(t, s); },
      fx: () => { k++; setBusFx('hall.decay', 1 + (k % 7) * 0.5); },
      set: () => { k++; setSetting('kbVel', S.settings.kbVel === 'pos' ? 'fixed' : 'pos', 'Tastatur-Anschlag'); },
      part: () => { k++; A.setPart(1 + (k % 3), {name: 'T' + k}); },
      kit: () => { k++; setKit('gate', 0.2 + (k % 5) * 0.05); },
      song: () => { k++; A.setSong({bars: 4 + (k % 4), lanes: [], carrier: [{beat: 0, target: null}]}); },
      songChord: () => { k++; songSetChord(0, ['Am', 'F', 'C', 'G'][k % 4]); },
      track: () => { k++; A.addTrack(); },
      group: () => { k++; A.removeTrack(); },
      own: () => { k++; const id = window.__own; const m = ownModel(0, id); m.begin(); const c = m.getClip(); c.notes.push(note(k)); m.end(true, 'Note'); },
      mkslot: async () => { k++; await MKK.writeRec(MKK.rec(1, 1 + (k % 8)), 8, 1 + (k % 16), 'Test ' + k); },
      mkin: () => { k++; A.mkIn(0, 'e2', S.tracks[0].mkIn && S.tracks[0].mkIn.e2 ? null : 1); },
      takesGroup: async () => { k++; const pcm = Array.from({length: 4800}, (_, i) => Math.round(8000 * Math.sin(i / 10))); await A.tkInject({pcm, sr: 48000, scene: k % 4}); },
      takes: () => { k++; const id = Object.keys(S.takes || {})[0]; A.wpLyrics(id, 'la ' + k); },
      tflag: () => { k++; A.tkAddTrack(); },
      sel: () => { k++; if (k % 2) selectTrack(k % NT()); else selectSlot(k % NT(), (k >> 1) % NS()); },
    };
    window.__G = G;
    // setup for own / mkin / mkslot (not counted)
    window.__setup = async () => {
      A.songFromChain([{scene: 0, bars: 4}]); window.__own = makeOwn(0, 1);
      A.setEngine(0, 'mk'); mkLoad(); await A.libraryReady(); await MKK.decodeAll();
    };
  });
}
export const dataEvents = p => p.evaluate(() => { const c = HIST.cur; return c ? c.strs.map(s => JSON.parse(s)) : []; });
