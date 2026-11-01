/* ND-P (Paket North-Platte): Block sq-ndp-src wird beim ersten Öffnen ausgewertet (Muster sq-mk-src); hier nur Laden, Öffnen und die
   Instrument-Wahl. ndpChoose: alle Pads auf Quelle MD_NAME mit dem Programm ihrer Rolle (MDX.roleProg), ein Undo. */
const NDPL = {loaded: false, ms: 0, err: null};   // NDP
function ndpLoad() {   // NDP
  if (NDPL.loaded && typeof NDP !== 'undefined') return NDP;
  const t0 = performance.now(), src = document.getElementById('sq-ndp-src');
  try {
    if (!src) throw new Error('sq-ndp-src fehlt');
    const sc = document.createElement('script'); sc.textContent = src.textContent; document.head.appendChild(sc); sc.remove();
    if (typeof NDP === 'undefined') throw new Error('NDP nicht geladen');
    NDPL.loaded = true;
  } catch (e) { NDPL.err = String(e && e.message || e); logErr(e); }
  NDPL.ms = performance.now() - t0;
  return typeof NDP !== 'undefined' ? NDP : null;
}
// die Platte gehört zum Drum-Editor: er wird geöffnet (Drum-Spur gewählt), die Platte liegt darüber; ✕ führt zurück
function ndpOpen(o) {   // NDP
  const tr = S.tracks[DRUM_T]; if (!tr || tr.kind !== 'drum' || !drumSnd() || drumSnd().engine !== 'drum') { toast(MD_NAME + '-Platte: nur für ein Drum-Kit'); return false; }
  if (R.selT !== DRUM_T || R.editor !== 'drum' || !EL.drumSheet.classList.contains('open')) { selectTrack(DRUM_T); openEditor(); }
  const M = ndpLoad(); if (!M) { toast(MD_NAME + '-Platte konnte nicht geladen werden'); return false; }
  const fresh = !AU.ctx; ensureAudio(); mdBoot();          // im Tipp (iOS: Audio nur in einer Geste)
  if (fresh) { requestAnimationFrame(() => { if (R.editor === 'drum') M.open(o); }); return true; }   // der erste Audio-Start ist eine eigene Aufgabe
  return M.open(o);
}
function ndpClose() { return typeof NDP !== 'undefined' && NDPL.loaded ? NDP.close() : false; }   // NDP
const ndpIsOpen = () => typeof NDP !== 'undefined' && NDPL.loaded && NDP.isOpen();   // NDP
// Instrument-Wahl „MD_NAME“: jedes Pad, das noch die Drum-Stimme spielt, bekommt Quelle md mit dem Programm seiner Rolle
// (Mono-Gruppe und Dynamik-Kurve bleiben beim Kanal); Pads, die schon MD_NAME spielen, bleiben wie sie sind. Ein Undo.
function ndpChoose() {   // NDP
  const snd = drumSnd(); if (!snd || snd.engine !== 'drum') return 0;
  const ids = DRUM_VOICES.filter(v => !mdIsSrc(v.id)).map(v => v.id); if (!ids.length) return 0;
  soundEdit(DRUM_T, MD_NAME + ' – alle Pads', () => {
    for (const id of ids) {
      const st = mdSlotMk(id), keep = {mMono: st.mMono, mCrv: st.mCrv};
      Object.assign(st, mdFirstProgram(id)); if (isNum(keep.mMono)) st.mMono = keep.mMono; if (keep.mCrv) st.mCrv = keep.mCrv;
      st.src = 'md';
    }
    if (!snd.p.md) snd.p.md = MDN.kitInit();
    for (const id of ids) drumChanged(id);
    mdBoot();
  });
  toast(MD_NAME + ': ' + ids.length + ' Pads mit Rollen-Programm', {label: 'Rückgängig', fn: () => undo()});
  if (R.editor === 'drum' && EL.drumSheet.classList.contains('open') && !ndpIsOpen()) safeRebuild(buildDrumEd);
  return ids.length;
}
// Kopf-Knopf im Drum-Editor (wie die Engine-Taste der Synth-Spuren): wählt MD_NAME (falls nötig) und öffnet die Platte
function ndpHeadKey() {   // NDP
  const all = DRUM_VOICES.every(v => mdIsSrc(v.id));
  const b = el('button', 'hb rb ndpk' + (all ? ' on' : ''), `<i class="led"></i><span>${esc(MD_NAME)}</span>`);
  b.setAttribute('aria-label', MD_NAME + '-Platte öffnen' + (all ? '' : ' (alle Pads auf ' + MD_NAME + ')'));
  b.title = MD_NAME + ' als Instrument: alle Pads auf ' + MD_NAME + ', Platte öffnen';
  onTap(b, () => { if (!DRUM_VOICES.every(v => mdIsSrc(v.id))) ndpChoose(); ndpOpen(); });
  return b;
}
