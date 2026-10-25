// V2c′ Layout: Menü → Harmonie (neue Zeilen) in P1/P2/P3/L1/L2, Hauptansicht mit leuchtender Skala unter einem Träger
import { open } from './v3-v2d-pw.mjs';
import { mkCheck } from './v3-v2d-lib.mjs';
const {check, done} = mkCheck();
const VPS = {P1: [390, 844], P2: [375, 667], P3: [320, 568], L1: [844, 390], L2: [667, 375]};
const DIR = '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/dirigent-test/';
for (const [id, [w, h]] of Object.entries(VPS)) {
  const {b, p, errs} = await open({width: w, height: h}, undefined, true);
  // main view: e-minor clip under C (Eine Skala an) – the keyboard lights C-Dur
  await p.evaluate(async () => { const Q = window.SYNQUENZER; Q.newProject();
    Q.setClip(0, 0, {len: 1, key: {root: 4, scale: 'aeolian'}, notes: [64, 66, 67, 69, 71, 72, 74].map((n, i) => ({t: i * .5, d: .4, n, v: .8}))});
    Q.selectTrack(0); Q.play(); Q.launchScene(0); Q.setKbMode('transpose'); await Q.chord([60, 64, 67], 80); Q.setKbMode('play'); await new Promise(r => setTimeout(r, 400)); });
  await p.screenshot({path: DIR + `v3-v2c2-${id}-main.png`});
  const lay = await p.evaluate(async () => {
    const Q = window.SYNQUENZER; Q.stop(); openMenu(); await new Promise(r => setTimeout(r, 200));
    const sec = [...document.querySelectorAll('.msec')].find(s => s.querySelector('h3').textContent === 'Harmonie');
    const anchor = sec.querySelector('.mos'); anchor.scrollIntoView({block: 'start'}); await new Promise(r => setTimeout(r, 150));
    const rows = [...sec.querySelectorAll('.mrow')];
    const over = rows.filter(r => r.scrollWidth > r.clientWidth + 1).map(r => r.textContent.slice(0, 30));
    const btns = [...sec.querySelectorAll('.mos button, .mos-tr button, .mos ~ .mrow button')].map(b => b.getBoundingClientRect());
    const modus = rows.find(r => /^Modus/.test(r.textContent)), ref = Math.min(...[...modus.querySelectorAll('button')].map(b => b.getBoundingClientRect().height));
    return {over, docW: document.documentElement.scrollWidth, winW: innerWidth, minH: Math.min(...btns.map(r => r.height)), minW: Math.min(...btns.map(r => r.width)), refModus: ref};
  });
  await p.screenshot({path: DIR + `v3-v2c2-${id}-menu.png`});
  check(`${id} Menü → Harmonie: keine Zeile läuft über, kein waagrechtes Rollen, neue Knöpfe so hoch wie die Modus-Knöpfe (±1 px) und ≥ 40 px breit`, !lay.over.length && lay.docW <= lay.winW && lay.minH >= lay.refModus - 1 && lay.minW >= 40, lay);
  check(`${id} keine Konsolenfehler`, !errs.length, errs);
  await b.close();
}
process.exit(done() ? 1 : 0);
