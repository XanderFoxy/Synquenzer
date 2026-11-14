import sys
p = sys.argv[1]
s = open(p, encoding='utf-8').read()
R = [
 ("  if (UI.toastActs) hideToast();\n  buildRoll();\n  setSheetOpen(true); UI.dirty.all = true;\n  return true;\n}\nfunction vx1rBuild() {",
  "  if (UI.toastActs) hideToast();\n  buildRoll();\n  setSheetOpen(true); UI.dirty.all = true;\n  const at = r.vox && VX1E.at && VX1E.at.vox === r.vox ? VX1E.at.bar : null; VX1E.at = null;\n  if (at != null) vx1rShowBar(r.vox, at);                            // Song: an der getippten Stelle\n  return true;\n}\nfunction vx1rBuild() {"),
 ("Object.assign(window.__vx1, {\n  open: r => vx1rOpen(r),",
  r"""/* ---------- Schritt 4: Zugänge, Speichern, Guide ----------
   Matrix: openRoll (✎, Clip-Blatt „✎ Bearbeiten“, Toasts, Guide) öffnet für einen STIMME-Clip mit Audio den Gesang-Editor – wie bei Instrumenten.
   Ohne Audio auf dem Gerät (Claude-App, Take fehlt) bleibt es beim Takes-Blatt. Song: Gesang-Block antippen → Takes-Blatt → [✎ Bearbeiten]
   (erster Knopf im Abschnitt Bearbeiten) öffnet den Editor an der getippten Stelle. Wiedergabe: jede Änderung läuft über wpAfter → wpSwitch
   (Fassungswechsel mit Überblendung während ▶) bzw. g2After – Matrix und Song hören dieselbe Fassung. Speichern: alle Gesang-Daten sind Felder
   in S.takes (an, vd, warp 'hybrid', pitch) → .json und Container; das Audio liegt nur im Container (ZIP), darum nach „Als Datei sichern“ mit
   Gesang ein Hinweis mit [Mit Audio sichern]. */
function vx1rCan(r) { if (!tkAudioOk()) return false; const x = tkRef(vx1rRef(r)); return !!(x && x.a && S.takes && S.takes[x.a.take] && !TK.missing.has(x.a.take)); }
function vx1rAt(vox, bar) { VX1E.at = {vox, bar}; }
function vx1rTkBtn(x) {
  const off = !x || !x.a || TK.missing.has(x.a.take);
  return '<button class="mbtn rb tk-vx1r" data-a="vx1r" title="Gesang wie Noten bearbeiten" aria-label="Gesang wie Noten bearbeiten"' + (off ? ' disabled' : '') + '>✎ Bearbeiten</button>';
}
// Song: der Editor zeigt den getippten Takt (sobald die Fläche gemessen ist)
function vx1rShowBar(vox, bar) {
  const v = S.song && S.song.vox && S.song.vox.find(z => z.id === vox); if (!v) return;
  const b = Math.max(0, barBeat(bar) - barBeat(v.bar)); let k = 0;
  const go = () => { if (!vx1rOpenNow() || !ED.rollAt.vox) return; const f = ED.roll.fol(); if (f.W > 0 && f.ppb > 0) { ED.roll.showPage(b); VX1E.shown = b; return; } if (++k < 40) requestAnimationFrame(go); };
  requestAnimationFrame(go);
}
// „Als Datei sichern“ (.json) mit Gesang: das Audio liegt nur im Container
function vx1rJsonHint() {
  try { if (!tkAudioOk() || !tkUsedIds().length) return; VX1E.hint = Date.now(); setTimeout(() => toast('Gesang-Audio ist nicht in der .json', {label: 'Mit Audio sichern', fn: () => va1BoxSave()}), 1600); } catch (e) { logErr(e); }
}
(function vx1rGuide() {
  try {
    const L = ui1Entries(); if (L.some(x => x.id === 'vx1rroll')) return;
    const go = () => { ui1Home(); setSongView(false); const st = stimmeT(); if (st < 0) { toast('Erst eine STIMME-Spur: ■ einer Spur halten › ＋ STIMME-Spur'); return false; } const s = S.tracks[st].clips.findIndex(c => c && c.audio); if (s < 0) { toast('Erst Gesang aufnehmen – dann den STIMME-Clip ✎'); return false; } if (!vx1rCan({t: st, s})) { selectSlot(st, s); return tkSheet({t: st, s}) !== false; } return vx1rOpen({t: st, s}); };
    L.push({id: 'vx1rroll', n: 'Gesang bearbeiten wie Noten', w: 'STIMME-Clip › ✎ · Song: Gesang antippen › ✎ Bearbeiten',
      d: 'Jede Silbe ist ein Stück auf ihrer Tonhöhe. Ziehen = verschieben (die Anker-Linie rastet am Raster, der Anschwung liegt davor), hoch/runter = Tonhöhe, Quant. mit Stärke.',
      s: 'gesang vocal stimme bearbeiten noten rolle transient anker einsatz quantisieren silbe tonhoehe verschieben schneiden dehnen konsonant', go, q: () => (vx1rOpenNow() ? ED.roll.el.main : null)});
  } catch (e) {}
})();
Object.assign(window.__vx1, {
  can: r => vx1rCan(r), at: () => (VX1E.shown == null ? null : VX1E.shown), hint: () => VX1E.hint || 0,
  open: r => vx1rOpen(r),"""),
]
for a, b in R:
    n = s.count(a)
    if n != 1: print('MISS', n, a[:80]); sys.exit(1)
    s = s.replace(a, b)
open(p, 'w', encoding='utf-8').write(s)
print('ok')
