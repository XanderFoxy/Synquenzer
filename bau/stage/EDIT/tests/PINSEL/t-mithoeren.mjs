// PINSEL C: Mithören – nur Abhören (Song-JSON unverändert, tr.mute unverändert), Pegel der ausgenommenen Spuren 0,
// [Ohne Drums], [Alle ab], gemerkt pro Clip, Schließen = alles wieder 1; Melodie-Editor; Speichern/Laden
import {open, ok, sleep, clipRoll, done, failed, canon} from './lib.mjs';
const H = await open(428, 926);
const D = f => H.E(f);
await D(() => { window.SYNQUENZER.play(); }); await sleep(600);
const proj = () => D(() => window.SYNQUENZER.state().project).then(canon);
const info = () => D(() => window.SYNQUENZER.mpListen());
const mutes = () => D(() => JSON.stringify(window.SYNQUENZER.state().project.tracks.map(t => !!t.mute)));
await clipRoll(H, null);
const nt = await D(() => window.SYNQUENZER.state().project.tracks.length);
const drum = await D(() => window.SYNQUENZER.state().project.tracks.map((t, i) => (t.kind === 'drum' ? i : -1)).filter(i => i >= 0));
const p0 = await proj(), m0 = await mutes(), u0 = await D(() => window.SYNQUENZER.gestures().undo);
await H.tapBtn('.pr-bar button', 'Mithören');
const chips = await D(() => [...document.querySelectorAll('.pr-bar button[data-mp-t]')].filter(b => b.offsetWidth).map(b => ({t: +b.dataset.mpT, txt: b.textContent, cls: b.className})));
ok(chips.length === nt, `Mithören-Leiste: ein Chip je Spur (${chips.length}/${nt})`);
ok(chips.find(c => c.t === 0).cls.includes('mpfix'), 'bearbeitete Spur fest an');
ok(await D(() => [...document.querySelectorAll('.pr .pra button')].filter(b => b.offsetWidth).every(b => b.classList.contains('mpb'))), 'Aktionsleiste zeigt nur die Mithören-Leiste');
// Alle ab → nur der bearbeitete Clip
await H.tapBtn('.pr-bar button', 'Alle ab'); await sleep(150);
let i = await info();
ok(JSON.stringify(i.off) === JSON.stringify([...Array(nt).keys()].filter(k => k !== 0)), 'Alle ab: alle anderen Spuren ausgenommen ' + JSON.stringify(i.off));
ok(i.gains.every((g, k) => (k === 0 ? g === 1 : g === 0)), 'Alle ab: Pegel anderer Spuren 0, eigene 1 ' + JSON.stringify(i.gains));
// drei antippen (z. B. nur 3)
const pick = chips.filter(c => c.t !== 0).slice(0, 3);
for (const c of pick) await H.tapBtn('.pr-bar button', c.txt);
await sleep(150); i = await info();
ok(JSON.stringify(i.off) === JSON.stringify([...Array(nt).keys()].filter(k => k !== 0 && !pick.some(c => c.t === k))), 'drei Spuren wieder an: ' + pick.map(c => c.txt).join(' '));
ok(i.gains.every((g, k) => (k === 0 || pick.some(c => c.t === k) ? g === 1 : g === 0)), 'Pegel folgen der Wahl ' + JSON.stringify(i.gains));
// Ohne Drums
await H.tapBtn('.pr-bar button', 'Ohne Drums'); await sleep(150); i = await info();
ok(JSON.stringify(i.off) === JSON.stringify(drum), 'Ohne Drums: nur Drums ausgenommen ' + JSON.stringify(i.off));
ok(await D(() => document.querySelector('.pr-bar button.mpb[title^="Mithören"]').classList.contains('mplit')), '[Mithören] leuchtet, solange Spuren ausgenommen sind');
// Song unverändert
ok(await proj() === p0, 'Song-JSON unverändert');
ok(await mutes() === m0, 'tr.mute unverändert');
ok(await D(() => window.SYNQUENZER.gestures().undo) === u0, 'kein Undo-Schritt durch Mithören');
await H.tapBtn('.pr-bar button', 'Fertig');
ok(await D(() => [...document.querySelectorAll('.pr .pra button')].some(b => b.offsetWidth && b.textContent === 'Legato')), 'Fertig: Aktionsleiste wieder da');
// Schließen: alles klingt, Wiederöffnen: gemerkt
await D(() => window.SYNQUENZER.closeRoll()); await sleep(200); i = await info();
ok(i.gains.every(g => g === 1), 'Editor zu: alle Pegel 1 ' + JSON.stringify(i.gains));
await D(() => window.SYNQUENZER.openRoll(0, 0)); await sleep(300); i = await info();
ok(JSON.stringify(i.off) === JSON.stringify(drum) && i.gains.every((g, k) => (drum.includes(k) ? g === 0 : g === 1)), 'Wiederöffnen: Wahl für diesen Clip gemerkt');
// ein anderer Clip (Spur 1) hat seine eigene Wahl (leer)
await D(() => { window.SYNQUENZER.closeRoll(); window.SYNQUENZER.setClip(1, 0, {len: 1, key: {root: 0, scale: 'ionian', src: 'user'}, notes: [{t: 0, d: 1, n: 60, v: .8}]}); window.SYNQUENZER.openRoll(1, 0); }); await sleep(300);
i = await info();
ok(i.off.length === 0 && i.gains.every(g => g === 1), 'anderer Clip: eigene Wahl (alles an)');
// Melodie-Editor: eigene Wahl über die Leiste
const hasSong = await D(() => { try { window.SYNQUENZER.openMelody(); return !!window.SYNQUENZER.rollApi(); } catch (e) { return false; } });
if (hasSong) {
  await sleep(300);
  await H.tapBtn('.pr-bar button', 'Mithören'); await H.tapBtn('.pr-bar button', 'Alle ab'); await sleep(150); i = await info();
  ok(i.key && i.key.startsWith('m:') && i.off.length === nt - 1, 'Melodie-Editor: Mithören wirkt (' + i.key + ')');
  await D(() => window.SYNQUENZER.closeRoll()); await sleep(150);
} else console.log('  (kein Song im Demo: Melodie-Editor übersprungen)');
// Speichern / Laden: kein Mithören im Projekt (Transport steht, damit nichts weiterläuft)
await D(() => window.SYNQUENZER.stop()); await sleep(300);
const pA = await proj();
ok(!/mpG|mpL|mpListen/.test(pA), 'Projekt enthält nichts vom Mithören');
await D(() => window.SYNQUENZER.save()); await sleep(400); await D(() => window.SYNQUENZER.load()); await sleep(800);
ok(await proj() === pA, 'Speichern → Laden deep-equal');
await D(() => window.SYNQUENZER.stop());
await done(H, 'Mithören');
process.exit(failed() ? 1 : 0);
