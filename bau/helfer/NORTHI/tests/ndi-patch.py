#!/usr/bin/env python3
# NDI-Patch: R-4300 -> bau/helfer/NORTHI/index.html (jede Ersetzung genau 1x)
import sys
SRC, DST = sys.argv[1], sys.argv[2]
s = open(SRC, encoding='utf-8').read()

def rep(old, new, cnt=1):
    global s
    n = s.count(old)
    if n != cnt:
        raise SystemExit('Anker %dx statt %dx: %r' % (n, cnt, old[:120]))
    s = s.replace(old, new)

# ---------------------------------------------------------------- CSS
rep("/* NDSTAGE: alle Tasten der North-Seiten >= 44 px",
"""/* NDI-CSS-BEGIN */
/* Instrument-Schalter Drums | North im Kopf des Drum-Editors (wie VA | FM | WT im Synth-Kopf), Trefferfläche >= 44 px */
#drumSheet .sh-head .seg.ndiinst{margin-left:2px;flex:none;gap:3px}
#drumSheet .sh-head .seg.ndiinst button{position:relative;min-width:50px;padding:0 7px;font-size:12px;z-index:1}
#drumSheet .sh-head .seg.ndiinst button::before{content:'';position:absolute;left:0;right:0;top:-6px;bottom:-6px}
#drumSheet .sh-head .seg.ndiinst.ndimix button{color:var(--dim,#9aa)}
#drumSheet .sh-head .seg.ndiinst.ndimix button[data-ndi="md"]::after{content:'';position:absolute;right:3px;top:3px;width:5px;height:5px;border-radius:50%;background:var(--amber,#e9a83a)}
@media (orientation:landscape){#drumSheet .sh-head .seg.ndiinst button::before{top:-4px;bottom:-8px}}
@media (orientation:portrait) and (max-width:389px){#drumSheet .sh-head .seg.ndiinst button{min-width:44px;padding:0 4px;font-size:11px}}
/* Kit-Browser: North-Zeilen, die nicht laden (grau mit Grund) bzw. deren Engine hier nicht läuft (Grund in Bernstein) */
.brow.ndioff .bmain b,.brow.ndioff .bmain span,.brow.ndioff .bpv,.brow.ndioff .beng{opacity:.45}
.brow.ndioff .bmain span.ndiwhy,.brow.ndiwarn .bmain span{opacity:1;color:var(--amber,#e9a83a)}
.plist.ndinorth{border-top:1px solid rgba(255,255,255,.12);margin-top:6px;padding-top:6px}
/* Hinweis „Neue Version – Tippen zum Laden“: klein, an der Stelle der Hinweise, blockiert nichts */
.ndiupd{position:fixed;left:50%;top:calc(env(safe-area-inset-top) + 58px);transform:translateX(-50%);z-index:69;display:flex;width:max-content;box-sizing:border-box;align-items:center;gap:2px;max-width:calc(100vw - 24px);
  border-radius:8px;background:rgba(20,22,26,.96);border:1px solid var(--amber,#e9a83a);box-shadow:0 6px 18px rgba(0,0,0,.5)}
.ndiupd button{min-height:44px;background:none;border:0;color:var(--amber,#e9a83a);font:700 13px/1.2 var(--font-ui);touch-action:manipulation}
.ndiupd .ndiupd-go{padding:0 6px 0 12px;text-align:left;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;min-width:0}
.ndiupd .ndiupd-x{min-width:44px;color:var(--dim,#9aa);font-size:14px}
/* NDI-CSS-END */
/* NDSTAGE: alle Tasten der North-Seiten >= 44 px""")

# ---------------------------------------------------------------- Lade-Diagnose vor dem ND1-Block
rep("""<script>
/* ND1 ===== drum model engine (Nachtrag 6)""",
"""<script>/* NDI: Lade-Diagnose der Drum-Synthese North. Wirft der folgende ND1/ND3-Block (Syntax oder Laufzeit), bleibt der Grund hier stehen
   (Menü → Version, Kit-Browser „North lädt nicht: …“). Bewusst schlicht gehalten, damit dieser Teil selbst überall läuft. */
window.NDI_BOOT = {st: 'vor', err: null};
window.NDI_BOOT.on = function (e) { var B = window.NDI_BOOT; if (B.st !== 'ok' && !B.err) B.err = String((e && e.message) || 'Skriptfehler').replace(/^Uncaught /, '') + (e && e.lineno ? ' (Zeile ' + e.lineno + ')' : ''); };
window.addEventListener('error', window.NDI_BOOT.on);
const MD_NAME = 'North';   // NDI: der Name steht hier (nicht im ND1-Block): fällt der Block aus, bleiben Menü, Hilfe und Editor-Texte heil
</script>
<script>
/* ND1 ===== drum model engine (Nachtrag 6)""")

rep("const MD_NAME = 'North';\nconst MDX = (() => {", "// NDI: const MD_NAME = 'North' steht im Lade-Diagnose-Skript davor\nconst MDX = (() => {")
rep("""window.MDX = MDX;
/* ND3 =====""", """window.MDX = MDX;
if (window.NDI_BOOT) window.NDI_BOOT.st = 'mdx';   // NDI: Engine-Teil gelaufen
/* ND3 =====""")

rep("""(function () {
  const C = (cat, name, o) => Object.assign({mName: name, mCat: cat}, o);""",
"""(function () { try {   // NDI: ein Fehler in den Kit-Daten lässt MDX stehen und wird gemeldet (nicht still leer)
  const C = (cat, name, o) => Object.assign({mName: name, mCat: cat}, o);""")

rep("""  MDX.CATS = ['bd', 'Sn', 'to', 'HH', 'Cy', 'Pc', 'Be', 'Tu', 'Ef'];
})();
/* /ND1 /ND3 */""",
"""  MDX.CATS = ['bd', 'Sn', 'to', 'HH', 'Cy', 'Pc', 'Be', 'Tu', 'Ef'];
} catch (e) { MDX.kitErr = 'Kit-Daten: ' + String((e && e.message) || e); if (window.NDI_BOOT && !window.NDI_BOOT.err) window.NDI_BOOT.err = MDX.kitErr; } })();   // NDI
if (window.NDI_BOOT && window.NDI_BOOT.st === 'mdx' && !window.NDI_BOOT.err) window.NDI_BOOT.st = 'ok';   // NDI
/* /ND1 /ND3 */""")

# ---------------------------------------------------------------- Kit-Fabrik (Hauptskript)
rep("""const MD_KIT_FACTORY = (typeof MDX !== 'undefined' && MDX.kits ? MDX.kits : []).map(k => {
  const R = (DrumKits.KITS && DrumKits.KITS['Rom Pop']) || {}, slots = {};""",
"""// NDI: Zustand der Engine beim Start. window.MDX statt typeof MDX: wirft der ND1-Block zur Laufzeit, stünde die Konstante in der TDZ und
// typeof würfe hier (die ganze App stünde). Fehlt etwas, bleiben die North-Kits als graue Zeilen mit Grund stehen – nie still weg.
const NDI_NM = typeof MD_NAME === 'string' ? MD_NAME : 'North';
const NDI_KIT_NAMES = ['Fell & Holz', 'Modell-Analog', 'Gestimmt', 'Schräg'];   // NDI: Rückfall-Namen (= MDX.kits) für die grauen Zeilen
const NDI = (() => {
  const B = window.NDI_BOOT || {st: 'vor', err: null}; try { if (B.on) window.removeEventListener('error', B.on); } catch (e) {}
  const M = window.MDX || null; let why = null;
  if (!M) why = B.err || 'Engine-Block nicht ausgeführt';
  else if (!Array.isArray(M.kits) || !M.kits.length) why = M.kitErr || B.err || 'Kit-Daten fehlen';
  return {M, why, boot: B.st, kitErr: []};
})();
const MD_KIT_FACTORY = (NDI.M && Array.isArray(NDI.M.kits) ? NDI.M.kits : []).map(k => { try {   // NDI: je Kit abgesichert
  const R = (DrumKits.KITS && DrumKits.KITS['Rom Pop']) || {}, slots = {};""")

rep("""    p: slots, md: k.md, fx: {drive: 0, chorus: {mode: 'off', mix: 1, rate: 1, depth: 1}, rev: 0, dly: 0, vol: .85, pan: 0}};
});
DRUM_FACTORY.push(...MD_KIT_FACTORY);
const MD_KIT_NAMES = MD_KIT_FACTORY.map(k => k.name);""",
"""    p: slots, md: k.md, fx: {drive: 0, chorus: {mode: 'off', mix: 1, rate: 1, depth: 1}, rev: 0, dly: 0, vol: .85, pan: 0}};
} catch (e) { NDI.kitErr.push((k && k.name || 'Kit') + ': ' + String((e && e.message) || e)); return null; } }).filter(Boolean);   // NDI
DRUM_FACTORY.push(...MD_KIT_FACTORY);
const MD_KIT_NAMES = MD_KIT_FACTORY.map(k => k.name);
// NDI: North-Kits, die nicht gebaut werden konnten – stehen grau mit Grund in Liste, Blättern und Reiter North (nicht ladbar)
const NDI_OFF = NDI_KIT_NAMES.filter(n => !MD_KIT_NAMES.includes(n)).map(n => ({id: kitId(n), name: n, cat: 'drums', engine: 'drum', ndiOff: true}));
if (NDI_OFF.length && !NDI.why) NDI.why = NDI.kitErr[0] || 'Kit-Daten unvollständig';
// NDI: „North leer“ – alle 12 Pads North mit INIT-Programmen, Kit-Effekte neutral; Drum-Felder = Rom Pop (Rückfall wie bei den North-Kits)
const NDI_LEER = (() => {
  const base = {id: kitId('North leer'), name: 'North leer', cat: 'drums', engine: 'drum', ev: 1, base: null, demo: 'drums', ref: NDI_NM + ' · alle 12 Pads, INIT-Programme',
    tip: 'Leeres ' + NDI_NM + '-Kit: jedes Pad ist ein ' + NDI_NM + '-Kanal mit INIT SOUND, ohne Hall und Echo. Von hier aus baust du dein eigenes ' + NDI_NM + '-Kit (Drum-Editor SOUND).'};
  if (NDI.why) return Object.assign(base, {ndiOff: true});
  try {
    const R = (DrumKits.KITS && DrumKits.KITS['Rom Pop']) || {}, slots = {};
    for (const id of NDI.M.ORDER) slots[id] = Object.assign(JSON.parse(JSON.stringify(R[id] || {})), {md: Object.assign({}, NDI.M.INIT, {src: 'md'})});
    return Object.assign(base, {p: slots, md: NDI.M.normKit(Object.assign({}, NDI.M.KIT0)), fx: {drive: 0, chorus: {mode: 'off', mix: 1, rate: 1, depth: 1}, rev: 0, dly: 0, vol: .85, pan: 0}});
  } catch (e) { NDI.kitErr.push('North leer: ' + String((e && e.message) || e)); return Object.assign(base, {ndiOff: true}); }
})();""")

rep("""const FACTORY_BY_ID = new Map(FACTORY.concat(DRUM_FACTORY, INIT_SYNTH, [INIT_KIT]).map(f => [f.id, f]));""",
"""const FACTORY_BY_ID = new Map(FACTORY.concat(DRUM_FACTORY, INIT_SYNTH, [INIT_KIT]).map(f => [f.id, f]));
if (!NDI_LEER.ndiOff) FACTORY_BY_ID.set(NDI_LEER.id, NDI_LEER);   // NDI: „North leer“ ladbar (nicht im Reiter Kits, nur unter North)""")

# ---------------------------------------------------------------- kitSound: „North leer“ per Name
rep("""    || MD_KIT_NAMES.find(k => k.toLowerCase() === s.toLowerCase()) || null;   // NDSTAGE: North-Kits per Name""",
"""    || MD_KIT_NAMES.find(k => k.toLowerCase() === s.toLowerCase()) || (!NDI_LEER.ndiOff && s.toLowerCase() === NDI_LEER.name.toLowerCase() ? NDI_LEER.name : null) || null;   // NDSTAGE: North-Kits per Name (NDI: + North leer)""")

# ---------------------------------------------------------------- Blättern ‹ ›
rep("""function kitList() { const own = LIB.ok ? LIB.lib.all().filter(s => s.engine === 'drum') : []; return KIT_NAMES.concat(MD_KIT_NAMES).map(n => ({id: kitId(n), name: n})).concat(own.map(u => ({id: u.id, name: u.name}))); }
function stepKit(dir) {
  const L = kitList(), cur = drumSnd().origin, k = L.findIndex(x => x.id === cur);
  const nx = L[((k < 0 ? (dir > 0 ? -1 : 0) : k) + dir + L.length) % L.length];
  soundEdit(DRUM_T, 'Kit ' + nx.name, () => loadKit(nx.id));
}""",
"""// NDI: North-Kits, die nicht laden, stehen mit off: true in der Liste (nach den geladenen North-Kits)
function kitList() { const own = LIB.ok ? LIB.lib.all().filter(s => s.engine === 'drum') : []; return KIT_NAMES.concat(MD_KIT_NAMES).map(n => ({id: kitId(n), name: n})).concat(NDI_OFF.map(k => ({id: k.id, name: k.name, off: true})), own.map(u => ({id: u.id, name: u.name}))); }
function stepKit(dir) {
  const L = kitList(), cur = drumSnd().origin, k = L.findIndex(x => x.id === cur);
  // NDI: ein grauer North-Platz wird beim Blättern genannt (Hinweis mit Grund) und übersprungen – nie still
  let i = k < 0 ? (dir > 0 ? -1 : 0) : k, nx = null; const skip = [];
  for (let n = 0; n < L.length; n++) { i = (i + dir + L.length) % L.length; if (!L[i].off) { nx = L[i]; break; } skip.push(L[i].name); }
  if (!nx) { toast(NDI_NM + ' lädt nicht: ' + NDI.why); return; }
  soundEdit(DRUM_T, 'Kit ' + nx.name, () => loadKit(nx.id));
  if (skip.length) toast('„' + skip.join('“, „') + '“ übersprungen – ' + NDI_NM + ' lädt nicht: ' + NDI.why);
}""")

# ---------------------------------------------------------------- Kit-Browser: Reiter North
rep("""const DCATS2 = [['kits', 'Kits', 'Kits'], ['ekits', 'Eigene', 'Eigene Kits'], ['dinit', 'Init', 'Init']];""",
"""const DCATS2 = [['kits', 'Kits', 'Kits'], ['ekits', 'Eigene', 'Eigene Kits'], ['dinit', 'Init', 'Init'], ['north', NDI_NM, NDI_NM]];   // NDI: Reiter North (hinten: nichts verschoben)
// NDI: North im Kit-Browser – die 4 North-Kits (graue, wenn sie nicht laden), „North leer“, eigene gesicherte Kits mit North-Pads
const ndiIsNorthKit = s => !!(s && s.p && s.p.slots && typeof s.p.slots === 'object' && Object.keys(s.p.slots).some(id => { const x = s.p.slots[id]; return !!(x && x.md && x.md.src === 'md'); }));
const ndiIsNorthRec = r => !!r && (MD_KIT_NAMES.includes(r.name) && r.id === kitId(r.name) || r.id === NDI_LEER.id);
function ndiNorthList() { const own = (LIB.ok ? LIB.lib.all() : []).filter(s => s.engine === 'drum' && ndiIsNorthKit(s)); return MD_KIT_FACTORY.concat(NDI_OFF, [NDI_LEER], own); }
// Zustand für Menü und Zeilen: {st: 'ok' | 'load' | 'off', why, line}
function ndiStatus() {
  if (NDI.why) return {st: 'off', why: NDI.why, line: 'nicht verfügbar (' + NDI.why + ')'};
  if (UI.forceNative) return {st: 'off', why: 'Worklet abgeschaltet', line: 'nicht verfügbar (Worklet abgeschaltet – Pads spielen ihre Drum-Stimme)'};
  const c = AU.ctx;
  if (typeof AudioWorkletNode !== 'function' || (c && !c.audioWorklet)) return {st: 'off', why: 'AudioWorklet fehlt', line: 'nicht verfügbar (AudioWorklet fehlt – Pads spielen ihre Drum-Stimme)'};
  let i = {}; try { i = NDI.M.info(); } catch (e) {}
  if (MDS.st === 'failed' || i.state === 'failed') { const w = i.err || 'Modul lädt nicht'; return {st: 'off', why: w, line: 'nicht verfügbar (' + w + ')'}; }
  if (MDS.st === 'loading' || i.state === 'loading') return {st: 'load', why: null, line: 'lädt …'};
  return {st: 'ok', why: null, line: 'bereit · ' + MD_KIT_FACTORY.length + ' Kits, ' + ((NDI.M.progs || []).length) + ' Programme' + (i.state === 'ready' ? ' · Engine geladen (' + (i.how || '?') + ', ' + (i.loadMs | 0) + ' ms)' : (c ? ' · Engine lädt beim ersten ' + NDI_NM + '-Pad' : ' · Engine startet mit dem ersten Tippen'))};
}
// Unterzeile einer Kit-Zeile: graue North-Plätze nennen den Grund; läuft die Engine hier nicht, steht er hinter der Beschreibung
function ndiRef(f, ref) {
  if (f.ndiOff) return NDI_NM + ' lädt nicht: ' + NDI.why;
  if (f.engine === 'drum' && (ndiIsNorthRec(f) || (f.id && f.id.startsWith('u-') && ndiIsNorthKit(f)))) { const s = ndiStatus(); if (s.st === 'off') return ref + ' · ' + NDI_NM + ' lädt nicht: ' + s.why + ' (spielt Drum-Stimmen)'; }
  return ref;
}
const ndiRowCls = f => (f.ndiOff ? ' ndioff' : f.engine === 'drum' && ndiIsNorthRec(f) && ndiStatus().st === 'off' ? ' ndiwarn' : '');
// „North · Drum-Synthese“ in den Instrument-Listen: wählt die Drum-Spur und öffnet ihre Kits im Reiter North (lädt nichts von selbst)
function ndiGoNorth() { closePop(); selectTrack(DRUM_T); openBrowser(DRUM_T, 'north'); }
const NDI_ENTRY_H = '<div class="plist ndinorth"><button class="rb" data-nd="1"><b>' + NDI_NM + ' · Drum-Synthese</b></button></div>';""")

rep("""function brList(t, sc) {
  const tr = S.tracks[t]; if (!tr) return [];
  if (tr.kind === 'drum') return BR.cat === 'ekits' ? (LIB.ok ? LIB.lib.all() : []).filter(s => s.engine === 'drum') : BR.cat === 'dinit' ? [INIT_KIT] : DRUM_FACTORY;""",
"""function brList(t, sc) {
  const tr = S.tracks[t]; if (!tr) return [];
  if (tr.kind === 'drum') return BR.cat === 'ekits' ? (LIB.ok ? LIB.lib.all() : []).filter(s => s.engine === 'drum') : BR.cat === 'dinit' ? [INIT_KIT] : BR.cat === 'north' ? ndiNorthList() : DRUM_FACTORY.concat(NDI_OFF);   // NDI""")

rep("""function openBrowser(t) {
  if (t == null) t = R.selT;""", """function openBrowser(t, ndiCat) {   // NDI: ndiCat = Reiter beim Öffnen (z. B. 'north')
  if (t == null) t = R.selT;""")

rep("""  if (tr.kind === 'drum') BR.cat = rec && rec.id && rec.id.startsWith('u-') ? 'ekits' : rec && rec.id === INIT_KIT.id ? 'dinit' : 'kits';""",
"""  if (tr.kind === 'drum') BR.cat = DCATS2.some(c => c[0] === ndiCat) ? ndiCat : rec && rec.id && rec.id.startsWith('u-') ? 'ekits' : rec && rec.id === INIT_KIT.id ? 'dinit' : ndiIsNorthRec(rec) ? 'north' : 'kits';   // NDI: North-Kit offen = Reiter North""")

# Zeilen: Klasse und Unterzeile
rep("""    const nv = SQStore.isForeign(f), ref = nv ? SQStore.NV_NAME : own ? (f.engine === 'drum' ? 'Eigenes Kit' + (f.p && f.p.base ? ' · aus ' + f.p.base : '') : f.bank && window.MKF ? MKF.label(f.bank, f.slot) + ' · eigener Klang' : ROLE_LABEL[soundRole(f)] || CAT_LABEL[f.cat] || 'Eigene') : (f.ref || '');
    h += `<div class="brow${loaded ? ' cur' : ''}${open ? ' open' : ''}" data-id="${esc(f.id)}" data-engine="${esc(engKey(f.engine))}">` +""",
"""    const nv = SQStore.isForeign(f), ref = ndiRef(f, nv ? SQStore.NV_NAME : own ? (f.engine === 'drum' ? 'Eigenes Kit' + (f.p && f.p.base ? ' · aus ' + f.p.base : '') : f.bank && window.MKF ? MKF.label(f.bank, f.slot) + ' · eigener Klang' : ROLE_LABEL[soundRole(f)] || CAT_LABEL[f.cat] || 'Eigene') : (f.ref || ''));   // NDI: ndiRef
    h += `<div class="brow${loaded ? ' cur' : ''}${open ? ' open' : ''}${ndiRowCls(f)}" data-id="${esc(f.id)}" data-engine="${esc(engKey(f.engine))}">` +   // NDI: ndiRowCls""")

rep("""      `<button class="bmain" data-act="load" aria-label="${esc(f.name)} laden"><b>${esc(f.name)}</b>${f.kp && !own && ref.includes(' · ') ?""",
"""      `<button class="bmain" data-act="load" aria-label="${esc(f.name)} laden"><b>${esc(f.name)}</b>${f.ndiOff ? `<span class="ndiwhy">${esc(ref)}</span>` : f.kp && !own && ref.includes(' · ') ?""")

rep("""      `<span class="beng">${nv ? 'NEU' : ENGINE_LABEL[f.engine] || 'VA'}</span>` +""",
"""      `<span class="beng">${nv ? 'NEU' : f.engine === 'drum' && (f.ndiOff || ndiIsNorthRec(f)) ? 'NORTH' : ENGINE_LABEL[f.engine] || 'VA'}</span>` +   // NDI: North-Zeilen""")

# brTap: graue Zeile antippen = Grund
rep("""  const rec = id ? (FACTORY_BY_ID.get(id) || (LIB.ok ? LIB.lib.get(id) : null)) : null;
  if (act === 'load' && rec) brLoad(rec);""",
"""  const rec = id ? (FACTORY_BY_ID.get(id) || (LIB.ok ? LIB.lib.get(id) : null)) : null;
  if (!rec && id && (NDI_OFF.some(k => k.id === id) || (NDI_LEER.ndiOff && id === NDI_LEER.id)) && (act === 'load' || act === 'pv' || act === 'info')) { toast(NDI_NM + ' lädt nicht: ' + NDI.why); return; }   // NDI
  if (act === 'load' && rec) brLoad(rec);""")

# ---------------------------------------------------------------- Instrument-Listen
rep("""      p.innerHTML = '<h4>Andere Engine ansehen</h4><div class="plist breng">' + [['analog', 'VA'], ['fm6', 'FM'], ['wt', 'WT'], ['mk', MK_LABEL]].map(([e, l]) =>
        `<button class="rb${e === (BR.eng || e0) ? ' on' : ''}" data-e="${e}">${l}${e === e0 ? ' · Spur' : ''}</button>`).join('') + '</div><p class="small">Laden aus einer anderen Engine wechselt die Klangerzeugung der Spur (mit Rückgängig).</p>';
      guardTouch(p);""",
"""      p.innerHTML = '<h4>Andere Engine ansehen</h4><div class="plist breng">' + [['analog', 'VA'], ['fm6', 'FM'], ['wt', 'WT'], ['mk', MK_LABEL]].map(([e, l]) =>
        `<button class="rb${e === (BR.eng || e0) ? ' on' : ''}" data-e="${e}">${l}${e === e0 ? ' · Spur' : ''}</button>`).join('') + '</div>' + NDI_ENTRY_H + '<p class="small">Laden aus einer anderen Engine wechselt die Klangerzeugung der Spur (mit Rückgängig).</p>';   // NDI: + North
      guardTouch(p);
      onTap(p, () => ndiGoNorth(), 'button[data-nd]');   // NDI""")

rep("""    p.innerHTML = '<h4>Klangerzeugung</h4><div class="plist">' + [['analog', 'VA'], ['fm6', 'FM'], ['wt', 'WT'], ['mk', MK_LABEL]].map(([e, l]) => `<button class="rb${e === cur ? ' on' : ''}" data-e="${e}">${esc(l)}</button>`).join('') + '</div>';
    guardTouch(p);""",
"""    p.innerHTML = '<h4>Klangerzeugung</h4><div class="plist">' + [['analog', 'VA'], ['fm6', 'FM'], ['wt', 'WT'], ['mk', MK_LABEL]].map(([e, l]) => `<button class="rb${e === cur ? ' on' : ''}" data-e="${e}">${esc(l)}</button>`).join('') + '</div>' + NDI_ENTRY_H;   // NDI: + North
    guardTouch(p);
    onTap(p, () => ndiGoNorth(), 'button[data-nd]');   // NDI""")

rep("""      (!drum ? `<button class="rb" data-a="k1m"><b>Modulationen (${k1Mods(t).length})</b><small>jede aktive Modulation · Tipp = zum Regler, ✕ = löschen</small></button>` : '') +   // K1""",
"""      (!drum ? `<button class="rb" data-a="k1m"><b>Modulationen (${k1Mods(t).length})</b><small>jede aktive Modulation · Tipp = zum Regler, ✕ = löschen</small></button>` : '') +   // K1
      (!drum ? `<button class="rb" data-a="ndi"><b>${esc(NDI_NM)} · Drum-Synthese</b><small>Drum-Spur mit ${esc(NDI_NM)}: Kits im Reiter ${esc(NDI_NM)}</small></button>` : '') +   // NDI""")

rep("""    onTap(p, b => { closePop(); const a = b.dataset.a; if (a === 'init') initSound(t); else if (a === 'wia') wiaToggle(); else if (a === 'kbpos') kbVelPos(); else if (a === 'k1m') openK1Mods(anchor, t);\n""",
"""    onTap(p, b => { closePop(); const a = b.dataset.a; if (a === 'ndi') { ndiGoNorth(); return; } if (a === 'init') initSound(t); else if (a === 'wia') wiaToggle(); else if (a === 'kbpos') kbVelPos(); else if (a === 'k1m') openK1Mods(anchor, t);   // NDI: ndi\n""")

# ---------------------------------------------------------------- Drum-Editor-Kopf: Drums | North
rep("""  sheetButtons(F.r1, F.r2, true);
  const em = el('button', 'hb rb edm edmd', '⋯'); em.setAttribute('aria-label', 'Mehr: Init');""",
"""  sheetButtons(F.r1, F.r2, true);
  F.r1.insertBefore(ndiInstSeg(), F.r1.querySelector('.sh-title').nextSibling);   // NDI: Instrument-Schalter Drums | North
  const em = el('button', 'hb rb edm edmd', '⋯'); em.setAttribute('aria-label', 'Mehr: Init');""")

rep("""// SOUND: chips · [Modell ▾] [Sound laden ▾] · the model's 4–6 macros · Pegel, Panorama, Raum, Gate
function pageDrumSound(pg) {""",
"""// NDI: Instrument der Drum-Spur – 'drum' (kein Pad North), 'md' (alle 12 Pads North), 'mix' (einzelne Pads, SOUND → Quelle)
function ndiInstState() { const snd = drumSnd(); if (!snd || snd.engine !== 'drum') return 'drum'; let n = 0; for (const v of DRUM_VOICES) if (mdIsSrc(v.id)) n++; return n === 0 ? 'drum' : n === DRUM_VOICES.length ? 'md' : 'mix'; }
function ndiInstSeg() {
  const cur = ndiInstState(), s = el('div', 'seg eng ndiinst' + (cur === 'mix' ? ' ndimix' : ''));
  s.setAttribute('role', 'group'); s.setAttribute('aria-label', 'Instrument der Drum-Spur' + (cur === 'mix' ? ' (gemischt)' : ''));
  for (const [v, l, t] of [['drum', 'Drums', 'Instrument: Drums (Drum-Stimmen)'], ['md', NDI_NM, 'Instrument: ' + NDI_NM + ' (Drum-Synthese, alle Pads)']]) {
    const b = el('button', v === cur ? 'on' : '', esc(l)); b.dataset.ndi = v; b.title = t; b.setAttribute('aria-label', t); b.setAttribute('aria-pressed', String(v === cur)); s.appendChild(b);
  }
  if (cur === 'mix') s.title = 'Gemischt: einzelne Pads spielen ' + NDI_NM + ' (SOUND → Quelle)';
  onTap(s, b => ndiSetInstrument(b.dataset.ndi), 'button');
  return s;
}
// alle Pads auf eine Quelle: North = jedes Pad sein gemerktes Programm, sonst das Rollen-Programm (MDX.roleProg, wie [Quelle ▾]); ein Undo-Schritt
function ndiSetInstrument(src) {
  if (src !== 'md' && src !== 'drum') throw new Error('Unbekanntes Instrument: ' + src);
  if (ndiInstState() === src) return false;
  if (src === 'md' && NDI.why) { toast(NDI_NM + ' lädt nicht: ' + NDI.why); haptic('err'); return false; }
  const r = soundEdit(DRUM_T, 'Instrument ' + (src === 'md' ? NDI_NM : 'Drums'), () => { let ch = false; for (const v of DRUM_VOICES) ch = mdSetSrc(v.id, src) || ch; return ch; });
  if (R.editor === 'drum') safeRebuild(buildDrumEd);
  if (R.editor === 'browser' && isDrum(BR.t)) brRefresh();
  if (ED.lcd) lcdShow('Instrument', src === 'md' ? NDI_NM : 'Drums');
  toast('Alle Pads: ' + (src === 'md' ? NDI_NM + ' (Drum-Synthese)' : 'Drum-Stimme'), [{label: 'Rückgängig', fn: () => undo()}]);
  return r;
}
// SOUND: chips · [Modell ▾] [Sound laden ▾] · the model's 4–6 macros · Pegel, Panorama, Raum, Gate
function pageDrumSound(pg) {""")

# ---------------------------------------------------------------- Menü → Version: Zeile North
rep("""    ['Version', 'SYNQUENZER ' + VERSION],
    ['Speicher',""",
"""    ['Version', 'SYNQUENZER ' + VERSION + (NDU.v ? ' · neue Version ' + NDU.v + ' geladen (Hinweis oben antippen)' : '')],   // NDI
    ['North', ndiStatus().line],   // NDI: North: bereit / lädt / nicht verfügbar (Grund)
    ['Speicher',""")

# ---------------------------------------------------------------- Update-Hinweis
rep("""// Menü → Info: „Worklet (blob)“ or „Kompatibel“ + the reason (§2.5)
function synthStatus() {""",
"""/* NDI: Hinweis auf eine neuere Fassung. Der Service-Worker startet die App nach 3 s aus dem Cache und legt die Antwort des Netzes danach
   in den Cache (sw.js unverändert). Die App liest selbst – ohne eigenen Netz-Zugriff – die Fassung der Seite im Cache 'synq-app-1'
   (nach dem Start, später noch zweimal, beim Zurückkommen in die App). Ist sie neuer als die laufende: kleiner Hinweis, ein Tipp sichert
   (wie beim Schließen) und lädt neu. Kopf-Merkmale der Antwort (ETag, Datum, Länge) sparen das erneute Lesen derselben Fassung. */
const NDU = {seen: '', v: null, shown: false, hide: false, busy: false, last: 0, el: null, n: 0};
function ndiVerCode(v) { const m = /^(\\d+)\\.(\\d+)\\.(\\d+)$/.exec(String(v || '')); return m ? +m[1] * 1e6 + +m[2] * 1e3 + +m[3] : 0; }
function ndiPageUrl() { return location.origin === CLOUD.origin && location.pathname.startsWith(CLOUD.path) ? CLOUD.origin + CLOUD.path : new URL('./', location.href).href; }
async function ndiUpdCheck(force) {
  if (NDU.busy || NDU.shown) return NDU.v;
  if (typeof caches === 'undefined' || !/^https?:$/.test(location.protocol)) return null;
  NDU.busy = true; NDU.last = Date.now(); NDU.n++;
  try {
    const ca = await caches.open('synq-app-1'), r = await ca.match(ndiPageUrl()); if (!r) return null;
    const key = ['etag', 'last-modified', 'content-length', 'date'].map(h => r.headers.get(h) || '').join('|');
    if (!force && key !== '|||' && key === NDU.seen) return null;
    NDU.seen = key;
    const m = /const VERSION = '(\\d+\\.\\d+\\.\\d+)'/.exec(await r.text()); if (!m) return null;
    if (ndiVerCode(m[1]) > ndiVerCode(VERSION)) { NDU.v = m[1]; ndiUpdShow(m[1]); }
    return m[1];
  } catch (e) { return null; } finally { NDU.busy = false; }
}
function ndiUpdShow(v) {
  if (NDU.shown || NDU.hide || !document.body) return; NDU.shown = true;
  const w = el('div', 'ndiupd'); w.setAttribute('role', 'status');
  const go = el('button', 'ndiupd-go', 'Neue Version ' + esc(v) + ' – Tippen zum Laden'), x = el('button', 'ndiupd-x', '✕');
  x.setAttribute('aria-label', 'Hinweis schließen');
  onTap(go, () => ndiUpdReload()); onTap(x, () => { NDU.hide = true; w.remove(); NDU.el = null; });
  w.append(go, x); document.body.appendChild(w); NDU.el = w;
}
// sichern wie beim Schließen (Rettungskopie + Schreiben, Verlauf, Online-Stand), dann neu laden; nie mitten in einer Aufnahme
function ndiUpdReload() {
  if ((typeof rec !== 'undefined' && rec && rec.state !== 'off') || R.songRec) { toast('Erst Aufnahme beenden – dann neu laden'); return false; }
  const go = NDU.el && NDU.el.querySelector('.ndiupd-go'); if (go) go.textContent = 'Wird gesichert …';
  try { histLeave(); } catch (e) {}
  try { if (typeof cloudFlushNow === 'function') cloudFlushNow(); } catch (e) {}
  const fin = () => { NDU.reload = true; try { (window.__ndiReload || (() => location.reload()))(); } catch (e) {} };
  Promise.race([saveNow(), new Promise(r => setTimeout(r, 2500))]).then(fin, fin);
  return true;
}
function ndiUpdInit() {
  if (typeof caches === 'undefined' || !/^https?:$/.test(location.protocol)) return;
  for (const ms of [4000, 25000, 90000]) setTimeout(() => ndiUpdCheck(), ms);
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible' && Date.now() - NDU.last > 20000) ndiUpdCheck(); });
}
ndiUpdInit();
// Menü → Info: „Worklet (blob)“ or „Kompatibel“ + the reason (§2.5)
function synthStatus() {""")

# ---------------------------------------------------------------- Test-API
rep("""  kits: () => kitList().map(k => ({id: k.id, name: k.name})), patterns: () => Object.keys(DRUM_PATTERNS),""",
"""  kits: () => kitList().map(k => Object.assign({id: k.id, name: k.name}, k.off ? {off: true} : {})), patterns: () => Object.keys(DRUM_PATTERNS),   // NDI: off = North lädt nicht
  ndiInstrument: v => (v == null ? ndiInstState() : ndiSetInstrument(v)), ndiStatus: () => ndiStatus(), ndiBoot: () => ({st: NDI.boot, why: NDI.why, kitErr: NDI.kitErr.slice()}),   // NDI
  ndiNorthList: () => ndiNorthList().map(k => Object.assign({id: k.id, name: k.name}, k.ndiOff ? {off: true} : {})), ndiUpdCheck: f => ndiUpdCheck(f), ndiUpd: () => ({v: NDU.v, shown: NDU.shown, n: NDU.n}), ndiGoNorth: () => ndiGoNorth(),   // NDI""")

rep("  openBrowser: t => openBrowser(t), closeBrowser: () => closeBrowser(false), applyBusHint: () => applyBusHint(),\n", "  openBrowser: (t, c) => openBrowser(t, c), closeBrowser: () => closeBrowser(false), applyBusHint: () => applyBusHint(),   // NDI: c = Reiter (z. B. 'north')\n")
rep("instead of „…“ (320 px)", "instead of „…“ (320 px) · NDI: graue North-Zeile nennt den Grund (span.ndiwhy)")
open(DST, 'w', encoding='utf-8').write(s)
print('ok', len(s))
