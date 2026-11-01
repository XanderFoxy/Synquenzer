import {launch} from './n5-k-blib.mjs';
for (const [w, h] of [[390, 844], [375, 667], [844, 390]]) for (const id of ['f-moog-bass', 'f-mk-d05']) {
  const {b, p} = await launch({viewport: {width: w, height: h}, touch: true, mobile: true, dpr: 2});
  await p.evaluate(async () => { mkLoad(); for (let i = 0; i < 60 && !mkLoaded(); i++) await new Promise(r => setTimeout(r, 100)); });
  await p.evaluate(id => { loadPreset(3, id); selectTrack(3); ED.tab = id.startsWith('f-mk') ? 'geraet' : 'osc'; openEditor(); }, id); await p.waitForTimeout(500);
  await p.evaluate(() => { SYNQUENZER.k1Open(3); document.querySelector('.pop.k1pop .k1x').click(); }); await p.waitForTimeout(100);
  console.log(w + 'x' + h, id, JSON.stringify(await p.evaluate(() => { const T = document.getElementById('toast'), bt = [...T.querySelectorAll('button')].find(x => x.getBoundingClientRect().width > 0), R = e => { const q = e.getBoundingClientRect(); return [q.left, q.top, q.right, q.bottom].map(v => +v.toFixed(1)); };
    const r = bt.getBoundingClientRect(), cx = r.left + r.width / 2, col = []; for (let y = Math.floor(r.top) - 14; y <= r.bottom + 14; y++) { T.style.visibility = ''; const e = document.elementFromPoint(cx, y); col.push(y + ':' + (e === bt ? 'B' : e ? (e.tagName + '.' + e.className).slice(0, 18) : '-')); }
    // what lies under the toast button without it
    bt.style.pointerEvents = 'none'; const under = []; for (let y = Math.floor(r.top) - 8; y <= r.bottom + 8; y += 2) { const e = document.elementFromPoint(cx, y); under.push(y + ':' + (e ? (e.tagName + '.' + e.className).slice(0, 18) : '-')); } bt.style.pointerEvents = '';
    return {cls: T.className, toast: R(T), btn: R(bt), col: col.filter(s => !/:B$/.test(s)).join(' '), under: under.join(' ')}; })));
  await b.close();
}
