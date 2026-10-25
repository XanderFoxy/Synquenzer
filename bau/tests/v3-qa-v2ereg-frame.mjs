// QA regression VS2: Claude-viewer-like sandboxed iframe (no same-origin: storage throws, no mic) base vs new
import { chromium } from 'playwright';
const D = '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/dirigent-test/';
const res = {};
for (const name of ['base', 'new']) for (const [vp, w, h] of [['P1', 390, 844], ['L1', 844, 390]]) {
  const br = await chromium.launch({executablePath: '/opt/pw-browsers/chromium-1243/chrome-linux64/chrome', args: ['--autoplay-policy=no-user-gesture-required', '--allow-file-access-from-files']});
  const pg = await br.newPage({viewport: {width: w, height: h}}); const errs = [];
  pg.on('pageerror', e => errs.push(String(e))); pg.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  await pg.goto('file://' + D + 'v3-qa-v2ereg/frame-' + name + '.html');
  await pg.waitForTimeout(500);
  const fr = pg.frames().find(f => f !== pg.mainFrame());
  await fr.waitForFunction(() => window.SYNQUENZER && window.SYNQUENZER.runtime, null, {timeout: 20000});
  await pg.waitForTimeout(1500);
  const r = await fr.evaluate(async () => { const Q = window.SYNQUENZER; const o = {};
    o.ls = (() => { try { localStorage.setItem('x', '1'); return 'ok'; } catch (e) { return 'throws'; } })();
    o.storage = Q.storage().mode;
    o.mic = [...document.querySelectorAll('button')].filter(b => /🎤/.test(b.textContent) && b.offsetParent).map(b => b.id || b.textContent);
    Q.newProject({init: true}); Q.setBpm(240); const K = {root: 9, scale: 'aeolian'};
    Q.setClip(0, 0, {len: 1, key: K, notes: [0, 1, 2, 3].map(t => ({t, d: .4, n: 57 + t, v: .8}))});
    Q.setClip(4, 0, {len: 1, key: K, notes: [{t: 0, d: .1, n: 36, v: .9}, {t: 2, d: .1, n: 38, v: .9}]});
    Q.clearLog(); Q.launchScene(0); Q.selectSlot(2, 0);
    const wb = b => new Promise(res => { const f = () => (Q.runtime().beat > b ? res() : setTimeout(f, 10)); f(); });
    await wb(3.9); for (let k = 0; k < 4; k++) { await wb(4 + k - .03); Q.tap(64 + k, 100); }
    await wb(8.3); o.fangMode = Q.runtime().fangMode; const b = document.getElementById(innerWidth > innerHeight ? 'bFangT' : 'bFang'); o.fangLabel = b.textContent; b.click();
    await new Promise(r => setTimeout(r, 200)); const c = Q.getClip(2, 0); o.fang = c && c.notes.map(n => n.n).join(',');
    Q.undo(); o.undo = Q.getClip(2, 0) === null;
    Q.setRecOptions({countIn: 0, length: 1, quantize: '1/16'}); Q.selectSlot(3, 0); Q.rec();
    const s = Math.ceil(Q.runtime().beat); for (let k = 0; k < 4; k++) { await wb(s + k + 4 - .02); Q.tap(60 + k, 100); }
    await wb(s + 14); o.rec = Q.getClip(3, 0) && Q.getClip(3, 0).notes.map(n => n.n).join(','); o.recState = Q.runtime().rec.state;
    o.vs = Q.vsInfo ? JSON.stringify(Q.vsInfo()).slice(0, 200) : null;
    o.vsFang = Q.vsFang ? Q.vsFang() : null;
    o.drums = Q.noteLog(4000).filter(n => n.track === 4).length;
    let got = []; window.claude = {use: async k => (k === 'downloads' ? {save: async ({filename, data}) => { got.push(filename + ':' + data.size + ':' + data.type); }} : null)};
    await Q.exportProject(); await new Promise(r => setTimeout(r, 600)); await Q.exportMidi({mode: 'scene', scene: 0}); await new Promise(r => setTimeout(r, 600));
    o.dl = got; o.saved = await Q.save().then(x => JSON.stringify(x).slice(0, 80), e => 'ERR ' + e);
    o.te = Q.tickErrors();
    return o; });
  await pg.screenshot({path: D + `v3-qa-v2ereg/frame-${name}-${vp}.png`});
  r.errs = errs.filter(e => !/Failed to load resource/.test(e)).slice(0, 5);
  res[name + vp] = r; await br.close();
}
for (const vp of ['P1', 'L1']) { const A = res['base' + vp], B = res['new' + vp]; for (const f of Object.keys(B)) { const s = JSON.stringify(A[f]) === JSON.stringify(B[f]); console.log(vp, f, s ? 'same' : 'DIFF', JSON.stringify(B[f]), s ? '' : ' base ' + JSON.stringify(A[f])); } }
