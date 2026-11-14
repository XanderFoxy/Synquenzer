import { chromium } from '/opt/node-tools/node_modules/playwright/index.mjs';
const b = await chromium.launch(); const p = await b.newPage({viewport: {width: 428, height: 926}});
const errs = []; p.on('pageerror', e => errs.push(String(e)));
await p.goto('file://' + process.argv[2]); await p.waitForTimeout(1500);
const r = await p.evaluate(() => ({nt: S.tracks.length, tr: S.tracks.map((t, i) => [i, t.name, t.kind, t.clips.map((c, s) => c ? s + ':' + c.len + ':' + c.notes.length : null).filter(Boolean).join(' '), t.clips.find(Boolean) ? JSON.stringify(t.clips.find(Boolean).notes.slice(0, 6)) : '']), DRUM_T, NS: NS(), bpm: S.bpm, ts: S.ts, song: !!S.song, w: typeof window.__imp1}));
console.log(JSON.stringify(r, null, 0)); console.log(errs);
await b.close();
