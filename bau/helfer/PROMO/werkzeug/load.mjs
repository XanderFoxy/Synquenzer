// loads the demo project into an open app page (with the voice take restored)
import fs from 'fs';
export async function loadDemo(p) {
  const voc = fs.readFileSync(new URL('./voc48.raw', import.meta.url)).toString('base64');
  const proj = fs.readFileSync(new URL('./demo-synthie-track.json', import.meta.url), 'utf8');
  return p.evaluate(async ([j, voc]) => { const W = ms => new Promise(r => setTimeout(r, ms));
    try { const m = mkLoad(); if (m && m.then) await m; } catch (e) {} for (let i = 0; i < 50 && !FACTORY_BY_ID.has('f-mk-h14'); i++) await W(100);
    const o = JSON.parse(j); switchProject(projFromFile(o), {}); await W(600);
    const id = Object.keys(S.takes || {})[0]; const raw = Uint8Array.from(atob(voc), c => c.charCodeAt(0));
    const r = tkAddPcmTake(new Int16Array(raw.buffer), 48000, 'import', id); await r.stored; await W(200);
    return {nt: NT(), take: id, song: !!S.song, bars: S.song && S.song.bars}; }, [proj, voc]);
}
