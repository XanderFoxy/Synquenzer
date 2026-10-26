import {launch, open} from './v3-qa8-lib.mjs';
const b = await launch(); const {page: p} = await open(b, 'P1');
const r = await p.evaluate(async () => { mkLoad(); await MKF.decodeAll(); const AT = ['UP', 'DOWN', 'ALT1', 'ALT2', 'RAND', 'TRIG'], DN = ['1/32', '1/24', '1/16', '1/12', '3/32', '1/8', '1/6', '3/16', '1/4', '1/3', '3/8', '1/2', '2/3', '3/4', '1/1'], RS = ['1/24', '1/16', '1/12', '1/8', '1/6', '1/4'];
  const o = []; for (let bk = 1; bk <= 8; bk++) for (let s = 1; s <= 16; s++) { const r = MKF.facRec(bk, s), m = r.p.mk, t0 = m.t[0], t1 = m.t[1];
    const tw = t => ['Säge', 'Puls', 'Dreieck', 'Sinus×', 'Stimmw', 'Speicherw', 'Rausch', 'Eingang'][t.o1.w] + '/' + ['Säge', 'Puls', 'Dreieck'][t.o2.w] + (t.mix.o2 ? '(' + t.mix.o2 + ')' : '(0)') + ' mod' + t.o2.mod + ' semi' + t.o2.semi + ' n' + t.mix.n + ' ft' + t.f.type + ' cut' + t.f.cut + ' res' + t.f.res + ' asg' + t.asg + ' udet' + t.udet + ' porta' + t.porta + ' dist' + t.a.dist;
    o.push(MKF.label(bk, s) + ' ' + r.name + ' | mode' + m.mode + ' | T1 ' + tw(t0) + (m.mode === 1 || m.mode === 2 ? ' | T2 ' + tw(t1) : '') + ' | arp ' + (m.arp.on ? AT[m.arp.type] + ' oct' + m.arp.range + ' ' + RS[m.arp.res] + ' tgt' + m.arp.tgt + ' sw' + m.arp.swing : '-') + ' | dly t' + m.dly.type + (m.dly.sync ? ' ' + DN[m.dly.note] : ' free') + ' dep' + m.dly.dep + ' | mfx t' + m.mfx.type + ' dep' + m.mfx.dep + ' | seq ' + [t0, t1].map(t => t.seq.on ? t.seq.q.filter(q => q.k).map(q => q.k).join(',') + '@' + t.seq.res : '-').join('/') + '\n   ⓘ ' + r.tip); }
  return o; });
console.log(r.join('\n'));
await b.close();
