import { open, SONG } from './lib.mjs';
const sels = process.argv.slice(2), depth = +(process.env.D || 4);
const {b, p, errs} = await open();
await p.evaluate(s => SYNQUENZER.setSong(s), SONG);
if (process.env.TR) { await p.evaluate(() => { SYNQUENZER.songSetChord(2, 'F'); setKbMode('transpose'); SYNQUENZER.songPlay(0); }); await p.waitForTimeout(4800); }
if (process.env.SONGV) { await p.evaluate(() => SYNQUENZER.songView(true)); await p.waitForTimeout(400); }
const r = await p.evaluate(([sels, depth]) => { const o = []; const walk = (e, d) => { const r = e.getBoundingClientRect(); if (r.width && d < depth) { const cs = getComputedStyle(e); o.push([d, e.tagName, '#' + e.id, '.' + String(e.className).slice(0, 30), Math.round(r.x), Math.round(r.y), Math.round(r.width), Math.round(r.height), JSON.stringify(e.children.length ? '' : e.textContent.slice(0, 20)), cs.backgroundColor + '|' + cs.backgroundImage.slice(0, 70), cs.color, cs.font.slice(0, 60), cs.borderTopColor + ' ' + cs.borderTopWidth + ' r' + cs.borderRadius, 'op' + cs.opacity].join(' ')); } for (const c of e.children) walk(c, d + 1); };
  for (const s of sels) walk(document.querySelector(s), 0); return o; }, [sels, depth]);
console.log(r.join('\n')); console.log(errs); await b.close();
