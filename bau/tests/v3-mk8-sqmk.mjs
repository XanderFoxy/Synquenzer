// MK8: loads the always-loaded AM part (SQMK: normMk, init) of an app file into Node (no DOM)
import fs from 'fs';
export function loadSQMK(file) {
  const s = fs.readFileSync(file, 'utf8'), a = s.indexOf("const MK_LABEL = 'MS 2000';"), b = s.indexOf('})(typeof window', a);
  const src = s.slice(a, s.indexOf('\n', b) + 1).replace("})(typeof window !== 'undefined' ? window : globalThis);", '})(G);');
  const G = {}; new Function('G', src.replace("const MK_LABEL", "var MK_LABEL"))(G); return G.SQMK;
}
