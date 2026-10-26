// vgmk567: the EDIT-WAHL 1 / 2 lists (tap on the selector) in synth and vocoder mode, rows + clipped text + ◎ dots. Usage: SYNQ_APP=<f> node vg567-wlists.mjs P|L
import {open, sleep, check, done} from './vg567-gmk5-tl.mjs';
const L = process.argv[2] === 'L';
const T = await open({viewport: L ? {width: 844, height: 390} : {width: 390, height: 844}}); const {p, E, errs} = T;
const clip = () => E(() => { const q = document.querySelector('#popLayer .pop'); if (!q) return ['no pop']; const out = []; const qr = q.getBoundingClientRect();
  if (qr.left < -1 || qr.right > innerWidth + 1 || qr.top < -1 || qr.bottom > innerHeight + 1) out.push('pop outside viewport ' + JSON.stringify([qr.left, qr.top, qr.right, qr.bottom]));
  for (const b of q.querySelectorAll('button, b, small, em')) { if (!b.getClientRects().length) continue; const cs = getComputedStyle(b); if (/hidden|clip/.test(cs.overflowX) && b.scrollWidth > b.clientWidth + 1) out.push('"' + b.textContent.trim().slice(0, 40) + '" sw ' + b.scrollWidth + ' > ' + b.clientWidth);
    const r = b.getBoundingClientRect(); const pb = b.closest('button') || q; const pr = pb.getBoundingClientRect(); if (b !== pb && (r.right > pr.right + 1 || r.left < pr.left - 1)) out.push('"' + b.textContent.trim().slice(0, 40) + '" sticks out of its row'); }
  return out; });
const rows = () => E(() => [...document.querySelectorAll('#popLayer .pop button')].filter(b => b.offsetWidth).map(b => b.innerText.replace(/\s+/g, ' ').trim()));
await T.openEd(0); await T.toMk(); await sleep(500);
// some edits so that ◎ has something to show: ARP TYP, SEQ AN, PATCH 1 INTENS.
await E(() => { for (const [k, v] of [['arp.type', 2], ['arp.steps', 251], ['t.0.seq.on', 1], ['t.0.p.0.i', 30], ['voc.chl.3', 40]]) try { SYNQUENZER.mkSet(0, k, v); } catch (e) {} });
const wia = await T.rectText('button', /^◎$/); if (wia) await T.tap(wia.cx, wia.cy, 400);
const res = {};
for (const mode of ['SYN', 'VOC']) {
  if (mode === 'VOC') { await E(() => SYNQUENZER.mkSet(0, 'mode', 3)); await sleep(400); await E(() => MKUI.render()); }
  for (const w of ['w1', 'w2']) {
    await T.closePop(); await sleep(300); await T.tapMk(w, 450);
    const r = await rows(), c = await clip(), dots = await E(() => [...document.querySelectorAll('#popLayer .pop button')].filter(b => b.offsetWidth).map(b => !!b.querySelector('.mwdot')));
    res[mode + ' ' + w] = {r, c, dots};
    await p.screenshot({path: '/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/vgmk567/merged/wlist-' + mode + '-' + w + (L ? '-L' : '-P') + '.png'});
    await T.closePop(); await sleep(400);
  }
}
for (const [k, v] of Object.entries(res)) { console.log('==', k, 'clipped', JSON.stringify(v.c)); v.r.forEach((x, i) => console.log('  ', v.dots[i] ? '●' : ' ', x)); }
check('W1 EDIT-WAHL lists: nothing clipped, inside the viewport', Object.values(res).every(v => !v.c.length), Object.fromEntries(Object.entries(res).map(([k, v]) => [k, v.c])));
check('W2 ◎ dots synth W2: PATCH 1, ARP A, ARP B, SEQ', JSON.stringify(res['SYN w2'].dots) === JSON.stringify([true, false, false, false, false, false, false, true, true, false, true]), res['SYN w2'].dots);
check('W3 ◎ dots vocoder W2: K-PEGEL A (channel 2), ARP A, ARP B, no SEQ dot', JSON.stringify(res['VOC w2'].dots) === JSON.stringify([true, false, false, false, false, false, false, true, true, false, false]), res['VOC w2'].dots);
check('W4 no console errors', !errs.length, errs.slice(0, 4));
await T.br.close(); done();
