import { open } from './v3-v2d-pw.mjs';
const APP = process.argv[2];
const {b, p, errs} = await open({width: 390, height: 844}, APP);
const r = await p.evaluate(async () => {
  const Q = window.SYNQUENZER;
  const out = {version: Q.version, keys: Object.keys(Q).sort()};
  out.hasMkLabel = typeof MK_LABEL !== 'undefined';
  out.engineBtns = [...document.querySelectorAll('button,[role=button]')].map(e => e.textContent.trim()).filter(t => /MS ?2000|MS 2K/i.test(t));
  out.bodyHasMS2000 = /MS 2000/.test(document.documentElement.outerHTML);
  // MK0-01 probe: unknown engine sound through serialize/parse
  try {
    const txt = Q.serialize();
    const o = JSON.parse(txt);
    out.format = o.format;
    const t = o.project.tracks.find(t => t.sound && t.sound.engine && t.sound.engine !== 'drum');
    if (t) {
      out.trackEngineBefore = t.sound.engine;
      t.sound = {engine: 'xyz', name: 'Fremd', p: {a: 1, b: [1,2,3]}, mods: [{x: 1}], fx: {q: 2}};
      const loadFn = Q.loadProject || Q.load || Q.parse || Q.deserialize;
      out.loadFnName = loadFn ? Object.keys(Q).find(k => Q[k] === loadFn) : null;
      if (loadFn) {
        await loadFn(JSON.stringify(o));
        const o2 = JSON.parse(Q.serialize());
        const t2 = o2.project.tracks.find(x => x.id === t.id) || o2.project.tracks[o.project.tracks.indexOf(t)];
        out.soundAfter = t2 && t2.sound;
      }
    }
  } catch (e) { out.err = String(e); }
  return out;
});
console.log(JSON.stringify(r, null, 1));
console.log('errs', errs.filter(e => !/font|net::|Failed to load/.test(e)));
await b.close();
