// QF1 Mess-Durchlauf: alle Editor-Seiten, Blätter und Popups quer (und hochkant zur Kontrolle);
// meldet jedes sichtbare Element, dessen Unterkante abgeschnitten ist und das nicht per Finger-Scroll erreichbar ist.
// node qf1-mess.mjs <index.html> <out.json> [vp-filter] [view-filter]   (Fotos: QF1_SHOTS=dir)
import {createRequire} from 'module'; const {chromium} = createRequire('/opt/node-tools/node_modules/')('playwright');
import fs from 'fs'; import path from 'path';
const FILE = path.resolve(process.argv[2]), OUT = process.argv[3] || '/dev/stdout';
const VPF = process.argv[4] || '', VF = process.argv[5] || '';
const LIB = fs.readFileSync(new URL('./qf1-lib.js', import.meta.url), 'utf8');
const SHOTS = process.env.QF1_SHOTS || '';
const VPS = [[926, 428], [926, 370], [844, 390], [667, 375], [428, 926]].filter(([w, h]) => !VPF || VPF.split(',').includes(w + 'x' + h));
const ROOTS_ED = ['#synthSheet.open', '#drumSheet.open', '#popLayer .pop', '#clipSheet.open', '#rollSheet.open', '#sndSheet.open', '#qSheet.open', '#wpSheet.open'];
const res = {};
const b = await chromium.launch();
for (const [w, h] of VPS) {
  const ctx = await b.newContext({viewport: {width: w, height: h}, hasTouch: true, isMobile: true, deviceScaleFactor: 1});
  await ctx.addInitScript(LIB);
  const p = await ctx.newPage();
  const errs = []; p.on('pageerror', e => errs.push(String(e)));
  await p.goto('file://' + FILE); await p.waitForTimeout(1800);
  await p.evaluate(() => { try { document.querySelectorAll('.pop').forEach(x => x.remove()); closePop(); } catch (e) {} });
  const key = w + 'x' + h; const R_ = res[key] = {};
  const settle = (ms = 140) => p.evaluate(ms => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(() => setTimeout(r, ms)))), ms);
  const scan = async (name, roots) => {
    if (VF && !name.includes(VF)) return;
    await settle();
    const L = await p.evaluate(r => window.__qf1Scan(r), roots || ROOTS_ED);
    R_[name] = L;
    if (SHOTS && L.length) await p.screenshot({path: path.join(SHOTS, ('vor-' + key + '-' + name).replace(/[^a-zA-Z0-9äöüÄÖÜ_.-]+/g, '_') + '.png')});
  };
  const ev = (fn, arg) => p.evaluate(fn, arg);
  // ---------- Synth-Editor: jede Klangerzeugung, jeder Reiter, jeder Unter-Reiter ----------
  for (const eng of ['analog', 'fm6', 'wt', 'fm2', 'mk', 'north', 'bm']) {
    if (VF && !('synth:' + eng).includes(VF) && !VF.startsWith('synth:' + eng)) { if (!VF.startsWith('synth')) {} }
    const ok = await ev(eng => { try { closePop(); closeEditor(); selectTrack(0);
      if (eng === 'fm2') { const s = deep(S.tracks[0].sound); setEngineOf(s, 'fm6'); s.engine = 'fm2'; s.p.fm2 = s.p.fm2 || FM2_DEF(); S.tracks[0].sound = s; }
      else setEngine(0, eng);
      ED.tab = null; openEditor(); return S.tracks[0].sound.engine; } catch (e) { return 'ERR ' + e.message; } }, eng);
    await settle(300);
    const tabs = await ev(() => [...document.querySelectorAll('#synthSheet .sh-tabs .tab')].map(b => b.dataset.tab));
    for (const tb of tabs) {
      await ev(tb => { const b = document.querySelector('#synthSheet .sh-tabs .tab[data-tab="' + tb + '"]'); if (b) b.click(); }, tb);
      await settle(200);
      const subs = await ev(() => [...document.querySelectorAll('#synthSheet .sh-subs .stab')].map(b => b.dataset.sub));
      if (!subs.length) await scan(`synth:${eng}(${ok}):${tb}`);
      for (const sb of subs) {
        await ev(sb => { const b = document.querySelector('#synthSheet .sh-subs .stab[data-sub="' + sb + '"]'); if (b) b.click(); }, sb);
        await settle(200);
        await scan(`synth:${eng}(${ok}):${tb}:${sb}`);
      }
    }
  }
  await ev(() => { closePop(); closeEditor(); });
  R_._errs = errs;
  await ctx.close();
}
await b.close();
fs.writeFileSync(OUT, JSON.stringify(res, null, 1));
for (const k in res) { const n = Object.entries(res[k]).filter(([v, L]) => v[0] !== '_' && L.length); console.log(k, 'Ansichten mit Befund:', n.length, 'Fehler:', (res[k]._errs || []).length); for (const [v, L] of n) console.log('  ', v, L.length, L.slice(0, 4).map(x => x.kind + ' ' + x.el + ' ↧' + x.cut + ' (' + x.by + ')').join(' | ')); }
