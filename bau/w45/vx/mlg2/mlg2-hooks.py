# MLG2: einzeilige Haken (Kennung MLG2) – wird von apply.py ausgeführt (src, rep)
src = rep(src, "\n  let s = null;\n  try { s = await xlaCall({op: 'open',",
          "\n  let s = null;\n  if (typeof mlg2Keep === 'function') mlg2Keep(c, ab);   /* MLG2: Kopie für die Klänge (die Datei geht gleich an den Worker) */\n  try { s = await xlaCall({op: 'open',")
a = "  c.sum = s; c.st = 'fertig';\n"
src = rep(src, a, a + "  if (typeof mlg2Open === 'function') mlg2Open(c);   /* MLG2: Synth-Klänge der Datei lesen (Wahl „Klänge aus der DAW übernehmen“) */\n")
a = "  h += xlaTpHtml(c, B);                                       // Schritt 2: Transponieren (Halbton | Noten fest)\n"
src = rep(src, a, a + "  if (typeof mlg2Html === 'function') h += mlg2Html(c, B);   /* MLG2: Klang – Klänge aus der DAW | Werksklänge */\n")
a = "  if (a === 'tph' || a === 'tpf') { c.tp = a === 'tpf' ? 'fest' : 'halbton'; xlaChanged(c); return; }   // Schritt 2\n"
src = rep(src, a, a + "  if ((a === 'mlg2on' || a === 'mlg2off') && typeof mlg2Tap === 'function') { mlg2Tap(c, a === 'mlg2on'); return; }   /* MLG2 */\n")
a = "  await xlaYield();                                       // jeder Schritt eine eigene Aufgabe: keine Long Task (LT1)\n"
src = rep(src, a, a + "  if (typeof mlg2Prep === 'function') { try { await mlg2Prep(c, res); } catch (e) { logErr(e); } }   /* MLG2: Klänge + Spur-EQ vorab (eine Spur je Aufgabe) */\n")
a = "    t.sound = xlaSound(r.sound, drum);\n"
src = rep(src, a, a + "    if (typeof mlg2Track === 'function') mlg2Track(c, i, t);   /* MLG2: Klang aus der DAW + Spur-EQ */\n")
a = "  if (div && typeof ECHO_DIVS !== 'undefined' && ECHO_DIVS.includes(div)) { p.fxBus.echo.divL = p.fxBus.echo.divR = div; }   // Delay des Synths → Projekt-Echo (Notenwert)\n"
src = rep(src, a, a + "  if (typeof mlg2Echo === 'function') mlg2Echo(c, p);   /* MLG2: Projekt-Echo wie der Synth (st) */\n")
a = "  if (typeof mlgFoot === 'function') mlgFoot(foot, t);   /* MLG1: Klang aus DAW-Datei übernehmen (nur Synth-Spuren) */\n"
src = rep(src, a, a + "  if (typeof mlg2Foot === 'function') mlg2Foot(foot, t);   /* MLG2: ↳ EQ wie in der DAW */\n")
