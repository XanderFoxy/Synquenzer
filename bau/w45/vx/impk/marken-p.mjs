// Pruefer IMPK: Markenwoerter index vs basis, MS 2000, live: true, Emoji in IMPK-Bloecken
import fs from 'node:fs';
const [fi, fb] = process.argv.slice(2), H = fs.readFileSync(fi, 'utf8'), HB = fs.readFileSync(fb, 'utf8');
const cnt = (s, w) => s.split(w).length - 1;
const words = ['Korg', 'microKORG', 'RADIAS', 'DWGS', 'Kodamo', 'Mask1', 'Nord', 'Kompakt', 'Clavia', 'Elektron', 'iPhone', 'TikTok', 'Safari', 'Claude', 'Apple', 'Google', 'Ableton', 'Roland', 'Yamaha', 'Spotify'];
console.log('Marken', JSON.stringify(words.map(w => [w, cnt(H, w), cnt(HB, w)]).filter(x => x[1] !== x[2])));
console.log('MS 2000', cnt(H, 'MS 2000'), '| ^  live: true,', H.split('\n').filter(l => /^  live: true,/.test(l)).length);
const blk = []; const re = /IMPK-BEGIN[\s\S]*?IMPK-END/g; let m; while ((m = re.exec(H))) blk.push(m[0]);
const all = blk.join('\n') + H.split('\n').filter(l => l.includes('IMPK') && !l.includes('IMPK-')).join('\n');
console.log('IMPK-Bloecke', blk.length, 'Emoji/Bildzeichen', JSON.stringify(all.match(/[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}]/gu) || []));
