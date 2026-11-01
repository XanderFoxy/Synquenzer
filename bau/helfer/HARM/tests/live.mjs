// HARM: Live-Tastatur-Transposition (TRANSPONIEREN) über der laufenden Szene – Akkorde mitten im Takt gedrückt
// liefert: timeline (Wechsel-Beats), Noten-Log der Szene, Stimmen nach Stopp
export const LIVE_JS = `(() => {
  const sl = ms => new Promise(r => setTimeout(r, ms));
  window.__harmLive = async (presses, o = {}) => {
    const Q = window.SYNQUENZER;
    Q.setKbMode('transpose'); Q.play(); Q.launchScene(0);
    const beatNow = () => t2b(nowT());
    await sl(150); Q.clearLog();
    for (const pr of presses) {
      while (beatNow() < pr.beat) await sl(4);
      const ks = pr.keys;
      pr.t0 = +beatNow().toFixed(3);
      if (pr.midi) { ks.forEach(k => onMidiMsg({data: [0x90, k, 100]})); await sl(o.hold || 120); ks.forEach(k => onMidiMsg({data: [0x80, k, 0]})); }   // MIDI-Eingang: derselbe Weg wie ein Gerät (onMidiMsg)
      else { for (const k of ks) Q.keyOn(k); await sl(o.hold || 120); for (const k of ks) Q.keyOff(k); }
      pr.pressedAt = +beatNow().toFixed(3);
      const tl = Q.timeline(), e = tl[tl.length - 1]; pr.entry = e ? {beat: e.beat, name: e.name} : null;   // der Wechsel, den dieser Druck geplant hat
    }
    while (beatNow() < (o.until || 32)) await sl(10);
    const log = Q.noteLog(4096), tl = Q.timeline();
    Q.stop(); await sl(o.tail || 900);
    const vo = (typeof VOICES !== 'undefined') ? VOICES.filter(v => !v.dead).length : -1;
    Q.resetCarrier(); Q.setKbMode('play');
    return {log, tl: tl.map(e => ({beat: e.beat, name: e.name, shift: e.shift})), voices: vo, presses};
  };
  return 1;
})()`;
// Akkord-Töne (C4-Lage) für keyOn: Grundton + Terz + Quinte
export const KEYS = {Am: [57, 60, 64], F: [53, 57, 60], C: [60, 64, 67], G: [55, 59, 62], Dm: [50, 53, 57], E: [52, 56, 59], Em: [52, 55, 59]};
