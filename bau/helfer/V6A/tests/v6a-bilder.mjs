// V6A Bildschirmfotos: [◆] im Kopf von MS-2000-Platte und FM-Editor (hoch/quer). Aufruf: node v6a-bilder.mjs <Ordner/>
import { open, setup } from './v6a-lib.mjs';
const OUT = process.argv[2];
for (const [name, vp] of [['hoch', { width: 390, height: 844 }], ['quer', { width: 844, height: 390 }]]) {
  const { b, p, errs } = await open(null, { vp });
  const t = await setup(p);
  for (const eng of ['mk', 'fm']) {
    await p.evaluate(([t, eng]) => { const Q = SYNQUENZER; Q.setEngine(t, eng); Q.v6aSetState(t, 1, {p: {cutoff: 500}}); Q.selectTrack(t); Q.selectSlot(t, 1); Q.launchScene(1); Q.openEditor(); }, [t, eng]);
    await p.waitForTimeout(900);
    const bb = await p.evaluate(() => { const x = document.querySelector('#synthSheet .v6ab'); if (!x) return null; const q = x.getBoundingClientRect(); return {x: q.x, y: q.y, w: q.width, h: q.height, vis: !!x.offsetParent, cls: x.className}; });
    console.log(name, eng, JSON.stringify(bb), errs.slice(0, 2));
    await p.screenshot({ path: OUT + `ed-${eng}-${name}.png` });
    await p.evaluate(() => { closeEditor(); SYNQUENZER.stop(); });
  }
  await b.close();
}
