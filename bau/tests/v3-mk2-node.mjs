// MK2 Node helpers: mkTables from index.html (block MKT, the same text the app evaluates) and the stored waves as {mkw} messages
import fs from 'fs';
import {render, mkPatch, makeScope} from './v3-mk1-node.mjs';
const FILE = process.env.MK_FILE || new URL('../mk-wt/index.html', import.meta.url).pathname;
const cache = new Map();
export function mktab(file) {
  file = file || FILE; if (cache.has(file)) return cache.get(file);
  const s = fs.readFileSync(file, 'utf8'), a = s.indexOf('/*MKT{*/'), b = s.indexOf('/*}MKT*/');
  const T = a >= 0 ? new Function(s.slice(a, b) + '\n;return MKTAB;')() : null; cache.set(file, T); return T;
}
export function mkwMsgs(ns, file) { const T = mktab(file); return ns.map(n => [0, {mkw: T.wave(n)}]); }
// render with the stored waves ns available from the start (o.at gets them first)
export function renderW(pmk, events, o, ns) { o = Object.assign({}, o || {}); o.at = mkwMsgs(ns || [], o.file).concat(o.at || []); return render(pmk, events, o); }
export {render, mkPatch, makeScope};
