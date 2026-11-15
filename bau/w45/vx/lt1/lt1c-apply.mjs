// LT1 Schritt c (Prüfer-Befund 1): Take im Leerlauf vorbereiten – setzt Block-Zusatz + 4 Haken in index.html
import fs from 'node:fs';
const f = process.argv[2]; let s = fs.readFileSync(f, 'utf8');
const rep = (a, b) => { const n = s.split(a).length - 1; if (n !== 1) throw new Error('nicht eindeutig (' + n + '): ' + a.slice(0, 80)); s = s.replace(a, () => b); };
const ADD = `/* Prüfer-Befund 1 (lange Lieder): bei 3 Minuten kostet das Ablegen vor allem den Take aus PCM – Kopie ab Song-Takt 0 (~11 ms),
   AudioBuffer füllen (~35 ms), Stücke für den Speicher kopieren (~21 ms), alles in derselben Aufgabe. Sobald die Analyse fertig ist
   (Blatt offen, kein Dehnen nötig), bereitet LT1 Kopie und AudioBuffer im Leerlauf in Scheiben von ≤ ~6 ms vor; die Speicher-Stücke
   werden erst beim Schreiben kopiert (Stück für Stück). Passt beim Ablegen etwas nicht (anderes Audio, Versatz, Rate, noch nicht
   fertig), läuft der alte Weg. Gleiche Werte: dieselbe Rechnung (pcm[i] * (1 / 32767)) in dieselbe Puffer-Art wie tkToBuffer. */
function lt1PreDrop() { const p = LT1.pre; LT1.pre = null; if (p && p.tm) clearTimeout(p.tm); }
function lt1PreStart(c) {   // Haken in imp1Run nach „fertig“
  lt1PreDrop();
  try {
    if (!c || !c.pcm || !(c.sr > 0) || !tkAudioOk() || !imp1Pop()) return;
    const q = c.bpm / nx1ImpTarget(c); if (!(Math.abs(q - 1) < 1e-4 || q < .5 || q > 2 || !c.x)) return;   // wird gedehnt (nx1ImpView) → anderes Audio
    const src = c.pcm, sr = c.sr, off = Math.round(imp1Geo(c).org * sr), s0 = Math.min(Math.max(0, off), src.length), d0 = Math.max(0, -off), m = src.length - s0, n = d0 + m;
    const pre = LT1.pre = {c, src, sr, off, n, pcm: null, buf: null, d: null, i: 0, f: 0, ok: false, tm: 0}, K = 1 / 32767;
    const step = () => {
      pre.tm = 0; if (LT1.pre !== pre) return;
      if (IMP1.cur !== c || c.st !== 'fertig' || c.pcm !== src || !imp1Pop()) { lt1PreDrop(); return; }   // Blatt zu / neue Datei: freigeben
      const t0 = performance.now();
      try {
        if (pre.ok) {}
        else if (!pre.pcm) pre.pcm = new Int16Array(n);   // = imp1Take: subarray(off) bzw. Stille davor, dann .slice()
        else if (pre.i < m) { while (pre.i < m && performance.now() - t0 < 6) { const e = Math.min(m, pre.i + 262144); pre.pcm.set(src.subarray(s0 + pre.i, s0 + e), d0 + pre.i); pre.i = e; } }
        else if (!pre.buf) {   // = tkToBuffer
          let b = null; try { b = new AudioBuffer({length: Math.max(1, n), numberOfChannels: 1, sampleRate: sr}); } catch (e) { try { b = AU.ctx ? AU.ctx.createBuffer(1, Math.max(1, n), sr) : null; } catch (e2) { b = null; } }
          if (!b) { lt1PreDrop(); return; } pre.buf = b; pre.d = b.getChannelData(0);
        } else { const d = pre.d, pc = pre.pcm; while (pre.f < n && performance.now() - t0 < 6) { const e = Math.min(n, pre.f + 131072); for (let i = pre.f; i < e; i++) d[i] = pc[i] * K; pre.f = e; } if (pre.f >= n) { pre.ok = true; pre.d = null; LT1.preOk = (LT1.preOk || 0) + 1; } }
      } catch (e) { lt1PreDrop(); return; }
      pre.tm = setTimeout(step, pre.ok ? 1000 : 0);   // fertig: liegt bereit, solange das Blatt offen ist (jede Sekunde nachsehen)
    };
    pre.tm = setTimeout(step, 0);
  } catch (e) { lt1PreDrop(); }
}
function lt1Take(c) {   // Haken oben in imp1Take: dasselbe wie imp1Take, nur mit der vorbereiteten Kopie; null = alter Weg
  const pre = LT1.pre; lt1PreDrop();
  if (!pre || !pre.ok || !pre.buf || pre.c !== c || pre.src !== c.pcm || pre.sr !== c.sr) return null;
  const G = imp1Geo(c); if (Math.round(G.org * c.sr) !== pre.off) return null;
  LT1.use = pre;
  let r; try { r = tkAddPcmTake(pre.pcm, c.sr, 'import'); } finally { LT1.use = null; }
  const m = S.takes[r.id];
  m.route = 'datei'; m.name = c.name; m.imp = {bpm: c.bpm, ts: c.ts, t1: c.t1 - G.org};   // = imp1Take
  LT1.preHit = (LT1.preHit || 0) + 1;
  return r.id;
}
function lt1PreBuf(pcm, sr) { const u = LT1.use; if (!u || u.pcm !== pcm || u.sr !== sr || !u.buf) return null; const b = u.buf; u.buf = null; return b; }   // Haken in tkToBuffer
function lt1StoreJobs(pcm, chunks) {   // Haken in tkStore: nur für die vorbereitete Kopie (niemand sonst hält oder ändert sie) – Stück erst beim Schreiben kopieren
  const u = LT1.use; if (!u || u.pcm !== pcm) return null;
  return chunks.map((k, i) => () => kv.aput(k, pcm.slice(i * TK_CHUNK, Math.min(pcm.length, (i + 1) * TK_CHUNK)).buffer));
}
/* LT1-END */`;
rep('/* LT1-END */', ADD);
rep(`  c.st = 'fertig'; c.sel = 0; imp1Paint();\n  return r;\n`, `  c.st = 'fertig'; c.sel = 0; imp1Paint();\n  if (typeof lt1PreStart === 'function') lt1PreStart(c);   /* LT1: Take im Leerlauf vorbereiten */\n  return r;\n`);
rep(`function imp1Take(c) {\n`, `function imp1Take(c) {\n  if (typeof lt1Take === 'function') { const id = lt1Take(c); if (id) return id; }   /* LT1: im Leerlauf vorbereiteter Take */\n`);
rep(`function tkToBuffer(pcm, sr) {\n  let b = null;\n`, `function tkToBuffer(pcm, sr) {\n  if (typeof lt1PreBuf === 'function') { const q = lt1PreBuf(pcm, sr); if (q) return q; }   /* LT1: schon gefüllt */\n  let b = null;\n`);
rep(`  const jobs = chunks.map((k, i) => { const a = pcm.subarray(i * TK_CHUNK, Math.min(pcm.length, (i + 1) * TK_CHUNK)); const ab = a.slice().buffer; return () => kv.aput(k, ab); });\n`,
    `  const jobs = (typeof lt1StoreJobs === 'function' && lt1StoreJobs(pcm, chunks)) || chunks.map((k, i) => { const a = pcm.subarray(i * TK_CHUNK, Math.min(pcm.length, (i + 1) * TK_CHUNK)); const ab = a.slice().buffer; return () => kv.aput(k, ab); });   /* LT1 */\n`);
fs.writeFileSync(f, s);
console.log('ok', s.length);
