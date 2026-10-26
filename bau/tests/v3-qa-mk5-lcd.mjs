// QA FP-TOUCH MK5: the LCD texts of ARP A / B and the ARP / step keys in the narrowest formats: nothing cut off
import { chromium } from 'playwright';
const FILE = process.argv[2] || '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/mk-br-MK5/index.html';
const b = await chromium.launch({executablePath: '/opt/pw-browsers/chromium-1243/chrome-linux64/chrome', args: ['--autoplay-policy=no-user-gesture-required']});
for (const [w, h] of [[320, 568], [375, 667], [390, 844], [667, 375], [844, 390]]) {
  const ctx = await b.newContext({viewport: {width: w, height: h}, hasTouch: true, isMobile: true}); const p = await ctx.newPage();
  await p.goto('file://' + FILE); await p.waitForFunction(() => window.SYNQUENZER && SYNQUENZER.storage().booted, null, {timeout: 20000});
  const r = await p.evaluate(async () => {
    const Q = SYNQUENZER; ensureAudio(); Q.setEngine(0, 'mk'); Q.selectTrack(0); Q.openEditor(); await new Promise(r => setTimeout(r, 600));
    const res = []; const L = () => ED.lcd;
    const chk = tag => { const e = L(); if (!e) return; const full = e._full ? e._full.join(' | ') : ''; const shown = e.innerText.replace(/\s+/g, ' ');
      const lv = e.querySelector('.lv'); const cut = lv && (lv.scrollWidth > lv.clientWidth + 1 || lv.scrollHeight > lv.clientHeight + 1); const r = e.getBoundingClientRect();
      if (cut || r.right > innerWidth + .5) res.push(tag + ' :: ' + shown + (cut ? ' [abgeschnitten]' : '') + ' :: voll: ' + full); };
    const set = (k, v) => { mkSetP(0, 'arp.' + k, v, false); };
    MKUI.setWahl(2, 7); await new Promise(r => setTimeout(r, 50)); chk('ARP A Wahl');
    for (const [k, vs] of [['res', [0, 5]], ['gate', [0, 37, 100]], ['type', [0, 2, 3, 4, 5]], ['range', [1, 4]]]) for (const v of vs) { set(k, v); const d = MKUI.KN[{res: 'arpRes', gate: 'arpGate', type: 'arpTyp', range: 'arpOct'}[k]]; MKUI.lcdOf(d); chk('A ' + k + '=' + v); }
    MKUI.setWahl(2, 8); await new Promise(r => setTimeout(r, 50)); chk('ARP B Wahl');
    for (const [k, vs] of [['latch', [0, 1]], ['swing', [-100, -50, 0, 63]], ['ks', [0, 1]], ['last', [1, 8]], ['tgt', [0, 1, 2]]]) for (const v of vs) { set(k, v); const d = MKUI.KN[{latch: 'arpLat', swing: 'arpSw', ks: 'arpKs', last: 'arpLen', tgt: 'arpTgt'}[k]]; MKUI.lcdOf(d); chk('B ' + k + '=' + v); }
    MKUI.arpKey(); chk('ARP key 1'); MKUI.arpKey(); chk('ARP key off'); MKUI.arpKey(); chk('ARP key on 2');
    set('last', 4); MKUI.stepKey(6); chk('step over'); MKUI.stepKey(1); chk('step 2');
    return {lcdW: L() && L().getBoundingClientRect().width, res};
  });
  console.log(w + 'x' + h, 'LCD ' + Math.round(r.lcdW) + ' px'); for (const x of r.res) console.log('  ' + x);
  await ctx.close();
}
await b.close();
