import {kq, lufs, sung, rmsDbF, truePeakDb} from './n4-vs-p-lib.mjs';
const sr = 48000, x = sung(120, sr, -28).y;
let t = performance.now(); for (let r = 0; r < 3; r++) kq(x, sr); console.log('kq 120 s', ((performance.now() - t) / 3).toFixed(1), 'ms');
console.log(lufs([x], sr), 'rms', rmsDbF(x), 'tp', truePeakDb([x]));
// 1 kHz sine at -20 dBFS → expect -23.01 LUFS mono? (BS.1770: 0 dBFS sine 997Hz mono = -3.01 LUFS)
const s = new Float32Array(sr * 5); for (let i = 0; i < s.length; i++) s[i] = 0.1 * Math.sin(2 * Math.PI * 997 * i / sr); console.log('sine -20 dBFS peak:', lufs([s], sr).lufs, '(soll -23.01)', 'stereo', lufs([s, s], sr).lufs, '(soll -20.0)');
