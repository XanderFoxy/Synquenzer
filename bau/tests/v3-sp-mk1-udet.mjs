// QA MK1: UNI-VERST. (t.0.udet) turned at a held unison note: per-voice detune and spectrum before / after
import {render, mkPatch} from './v3-mk1-node.mjs';
const p = mkPatch({asg: 2, udet: 0});
const r = render(p, [[0, 'on', 57, .8]], {sec: 2, at: [[0, {mkScope: true}], ...Array.from({length: 49}, (_, k) => [.3 + k * .02, {mkSet: {'t.0.udet': 2 * k + 3}}])]});
const sc = r.msgs.filter(m => m.mkScope && m.mkScope.voices.length);
const at = t => sc.find(m => m.mkScope.t >= t).mkScope.voices.map(v => v.udet);
console.log('udet 0 -> 99 over 1 s at a held unison note; voice detune (ct) at 0.2 s', JSON.stringify(at(.2)), 'at 1.8 s', JSON.stringify(at(1.8)), '; a NEW note with udet 99:', JSON.stringify(render(mkPatch({asg: 2, udet: 99}), [[0, 'on', 57, .8]], {sec: .3, at: [[0, {mkScope: true}]]}).msgs.filter(m => m.mkScope && m.mkScope.voices.length)[0].mkScope.voices.map(v => +v.udet.toFixed(1))));
