# Teil 1: CSS + HTML der Werkstatt 2 (Zwiebel, Dehnen, Master-Zeile, Prüfstellen-Tab)
R = []  # (alt, neu)

# --- CSS
R.append(("#buehne{position:relative;height:clamp(300px,42vh,450px);",
          "#buehne{position:relative;height:calc(clamp(300px,42vh,450px) + var(--zusatz,0px));"))
R.append((""".schicht{display:inline-flex;align-items:center;gap:6px;min-height:40px;padding:0 10px;border-radius:20px;font-size:14px}
.schicht i{width:12px;height:12px;border-radius:50%;display:inline-block;background:var(--c);opacity:.35;border:2px solid var(--c)}
.schicht[aria-pressed=true]{background:var(--band2);border-color:var(--c)}
.schicht[aria-pressed=true] i{opacity:1}""",
""".schicht{display:inline-flex;align-items:center;gap:6px;min-height:40px;padding:0 10px;border-radius:20px;font-size:14px}
.schicht i{width:12px;height:12px;border-radius:50%;display:inline-block;background:var(--c);opacity:.35;border:2px solid var(--c)}
.schicht[aria-pressed=true]{background:var(--band2);border-color:var(--c)}
.schicht[aria-pressed=true] i{opacity:1}
/* Zwiebel-Legende: Punkt = zeigen/verbergen, Name = diese Schicht hören */
.zw{display:inline-flex;align-items:stretch;border:1px solid var(--lin2);border-radius:20px;overflow:hidden;min-height:40px;background:var(--bar)}
.zw.an{border-color:var(--c)}
.zw button{border:0;border-radius:0;min-height:40px;background:transparent;font-size:14px}
.zw .zAug{min-width:36px;width:36px;padding:0;display:inline-flex;align-items:center;justify-content:center;border-right:1px solid var(--lin2)}
.zw .zAug i{width:12px;height:12px;border-radius:50%;display:inline-block;background:var(--c);opacity:.3;border:2px solid var(--c)}
.zw.an .zAug{background:var(--band2)}.zw.an .zAug i{opacity:1}
.zw .zHoer{min-width:44px;padding:0 10px 0 8px;display:inline-flex;align-items:center;gap:5px}
.zw .zHoer[aria-pressed=true]{background:var(--fg);color:var(--bg)}
.zw .zHoer svg{width:12px;height:12px;fill:currentColor;flex:0 0 auto}
#staffelLeiste label{display:flex;align-items:center;gap:8px;flex:1 1 200px;min-width:0;font-size:14px}
#staffel{flex:1 1 auto;min-width:90px;height:36px;margin:0;accent-color:var(--gold);background:transparent}
#staffel::-webkit-slider-thumb{width:30px;height:30px}
#staffelWert{font-size:12.5px;color:var(--mut);min-width:84px;text-align:right}
#fassung{margin:0 0 8px;background:var(--band1);border:1px solid var(--lin);border-radius:10px;padding:4px 6px;flex-wrap:nowrap}
#fassung .titel{min-width:0}
#bMaster{background:var(--gold);color:var(--goldfg);border-color:var(--gold)}
#bMaster svg{fill:currentColor;stroke:none}
#segMaster button{min-width:46px;padding:0 8px}
#masterZeit{font:600 13px ui-monospace,Menlo,monospace;min-width:40px;text-align:center;color:var(--mut)}
#lMaster{display:inline-flex;align-items:center;justify-content:center;min-height:44px;padding:0 12px;border-radius:10px;border:1px solid var(--lin2);background:var(--bar);color:var(--fg);font:600 14px -apple-system,system-ui,sans-serif;text-decoration:none;white-space:nowrap;margin-left:auto}
.filter{display:flex;gap:6px;flex-wrap:wrap;margin:4px 0 2px}
.filter button{min-height:36px;font-size:13.5px;border-radius:18px;padding:0 12px}
.filter button[aria-pressed=true]{background:var(--fg);color:var(--bg);border-color:var(--fg)}
.zeile .was .knoepfe{margin-top:4px}
.zeile .was .knoepfe button{min-height:36px;font-size:13.5px;padding:0 10px}
.marke.s3{border-color:var(--rot);color:var(--rot)}.marke.s2{border-color:var(--warn);color:var(--warn)}
.zeile.pz{align-items:flex-start;padding:8px 0}
.zeile.pz .wann{padding-top:12px}
#bVorher{font-size:13.5px;padding:0 9px;flex:0 0 auto}"""))
R.append(("""  .schicht{padding:0 7px;font-size:13px}""",
          """  .schicht{padding:0 7px;font-size:13px}
  .zw .zHoer{padding:0 7px 0 5px;font-size:13px}.zw .zAug{min-width:32px;width:32px}
  #fassung{order:0;margin:0 0 2px;flex-wrap:wrap;padding:2px 4px}#masterZeit{display:none}#lMaster{padding:0 8px;font-size:13px}
  #staffelLeiste{order:6}#staffelWert{display:none}"""))
R.append(("#transport{order:1}#zugLeiste{order:2}#zugLeiste2{order:3}#hoerLeiste{order:4}#schichtLeiste{order:5}#tonLeiste{order:6}#bereichsleiste{order:7}#sende{order:8}",
          "#transport{order:1}#zugLeiste{order:2}#zugLeiste2{order:3}#hoerLeiste{order:4}#schichtLeiste{order:5}#tonLeiste{order:7}#bereichsleiste{order:8}#sende{order:9}"))

# --- HTML
R.append(("""<main id="werk">""",
"""<div id="fassung" class="leiste" role="group" aria-label="Ganze Fassung hören und laden">
  <span class="titel">Master</span>
  <button id="bMaster" class="rund" aria-label="Master abspielen"><svg viewBox="0 0 24 24"><path id="iMaster" d="M7 4.5v15l12.5-7.5z"/></svg></button>
  <div class="seg" id="segMaster" role="group" aria-label="Fassung"><button data-m="v10" aria-pressed="false">v10</button><button data-m="v11" aria-pressed="true">v11</button></div>
  <span id="masterZeit">0:00</span>
  <a id="lMaster" href="../projekt11/The-Wall_A_v11.mp3" download="The-Wall_A_v11.mp3" aria-label="v11 als MP3 laden">v11 laden</a>
  <audio id="aV10" preload="none" src="../projekt10/The-Wall_A_v10_Club.mp3"></audio>
  <audio id="aV11" preload="none" src="../projekt11/The-Wall_A_v11.mp3"></audio>
</div>
<main id="werk">"""))
R.append(("""<button id="bSilbeWeg" hidden>↺ wie Ende</button></div>""",
          """<button id="bSilbeWeg" hidden>↺ wie Ende</button><button id="bVorher" hidden aria-label="Vorher und nachher vergleichen">A/B vorher</button></div>"""))
R.append(("""    <div class="leiste" id="schichtLeiste" role="group" aria-label="Schichten"></div>
    <div class="leiste" id="tonLeiste">
      <button id="bMusik" class="schalt" aria-pressed="false">Musik</button>
      <button id="bKlick" class="schalt" aria-pressed="false">Klick</button>
    </div>""",
"""    <div class="leiste" id="schichtLeiste" role="group" aria-label="Schichten"></div>
    <div class="leiste" id="staffelLeiste"><label for="staffel"><span class="titel">Zwiebel</span><input type="range" id="staffel" min="0" max="1" step="0.05" value="0" aria-label="Staffelung der Schichten"><span id="staffelWert">übereinander</span></label></div>
    <div class="leiste" id="tonLeiste">
      <button id="bMusik" class="schalt" aria-pressed="false">Musik</button>
      <button id="bKlick" class="schalt" aria-pressed="false">Klick</button>
      <button id="bDehnen" class="schalt" aria-pressed="true">Dehnen</button>
      <button id="bVorspiel" class="schalt" aria-pressed="true">Vorspielen</button>
    </div>"""))
R.append(("""    <button id="tabA" role="tab" aria-selected="false">Was geändert wurde<b id="anzA"></b></button>
    <button id="tabH" role="tab" aria-selected="false">Hilfe</button>""",
"""    <button id="tabA" role="tab" aria-selected="false">Was geändert wurde<b id="anzA"></b></button>
    <button id="tabP" role="tab" aria-selected="false">Prüfstellen<b id="anzP"></b></button>
    <button id="tabH" role="tab" aria-selected="false">Hilfe</button>"""))
R.append(("""  <div id="listeA" class="liste" hidden></div>""",
          """  <div id="listeA" class="liste" hidden></div>
  <div id="listeP" class="liste" hidden></div>"""))
# Hilfe
R.append(("""      <li><b>Schichten</b> wie Zwiebelhaut: <span style="color:var(--c-orig)">Original</span> = deine Aufnahme an der Stelle, wo du gesungen hast. <span style="color:var(--c-rein)">gereinigt</span> = nach Klick-, Rausch- und Atmer-Reinigung. <span style="color:var(--c-tim)">Timing</span> = so lag es nach dem Verschieben. <span style="color:var(--c-ton)">Tonhöhe</span> = wie viel Cent korrigiert wurde. Ende = v11 (Timing wie v10). Neu = mit deinen Zügen.</li>""",
"""      <li><b>Schichten</b> wie Zwiebelhaut: <span style="color:var(--c-orig)">Original</span> = deine Aufnahme an der Stelle, wo du gesungen hast. <span style="color:var(--c-rein)">gereinigt</span> = nach Klick-, Rausch- und Atmer-Reinigung. <span style="color:var(--c-tim)">Timing</span> = so lag es nach dem Verschieben. <span style="color:var(--c-ton)">Tonhöhe</span> = wie viel Cent korrigiert wurde. Ende = v11 (Timing wie v10). Neu = mit deinen Zügen.</li>
      <li><b>Zwiebel:</b> der Regler „Zwiebel“ staffelt die Schichten von oben nach unten – ganz links liegen sie genau übereinander, ganz rechts getrennt untereinander. Kräftig gefärbt und mit Strich am oberen Rand = hier weicht die Schicht deutlich von der darüber ab (mehr als 5 dB), blass = deckungsgleich. Punkt antippen = Schicht zeigen/verbergen, Namen antippen = genau diese Schicht hören. Bei getrennten Schichten hörst du beim Antippen in einer Spur genau diese Schicht.</li>
      <li><b>Dehnen:</b> verschiebst du eine Silbe, wird das Stück davor und danach in der Länge gedehnt oder gestaucht – mit gleicher Tonhöhe, wie beim Time-Stretching. Du hörst es sofort, mit der Musik. „A/B vorher“ spielt die Stelle vor und nach dem letzten Zug. „Vorspielen“ aus = nach dem Loslassen nicht automatisch abspielen. „Dehnen“ aus = alte Vorschau mit Lücke und Kürzen.</li>
      <li><b>Raster:</b> die kräftigen Striche sind die Taktstriche (Taktnummer oben), die feinen die Schläge. Sie liegen genau auf den Schlägen der Musik (gemessen: Abweichung im Mittel 0 ms). „Klick“ spielt sie mit.</li>
      <li><b>Prüfstellen</b> (Reiter und orange Marken am Rand): Stellen, an denen meine Bearbeitung etwas verschlechtert haben könnte. „Hin“ spielt die Stelle in v11 im Kreis, „A/B“ wechselt zu deiner Aufnahme und zurück, „Als Notiz“ schreibt sie in deine Notiz.</li>
      <li><b>Master</b> (Zeile oben): v10 oder v11 komplett hören, beim Umschalten an derselben Stelle weiter. „v11 laden“ speichert die MP3.</li>"""))
R.append(("""      <li><b>Änderungen</b> (Streifen unten): blau = später als gesungen, rot = früher, die Zahl in ms. ✂︎ = hier wurde geschnitten. Orange ? = Prüfstelle: Ende weicht stark von der verschobenen Aufnahme ab. Antippen zeigt, was dort gemacht wurde.</li>""",
          """      <li><b>Änderungen</b> (Streifen unten): blau = später als gesungen, rot = früher, die Zahl in ms. ✂︎ = hier wurde geschnitten. Orange ? = Prüfstelle. Antippen zeigt, was dort gemacht wurde.</li>"""))
R.append(("""      <li><b>Hören:</b> beim Ziehen und Loslassen hörst du sofort das Stück, mit weichen Blenden. Was von der Silbe davor noch klingt, wird mit einer kurzen Blende gekürzt. Eine Lücke bleibt still – beim sauberen Neurechnen fülle ich sie wie in v10.</li>""",
          """      <li><b>Hören:</b> beim Ziehen und Loslassen hörst du sofort das Stück mit der Musik. Mit „Dehnen“ wird das Stück davor und danach gedehnt statt gekürzt; ohne „Dehnen“ bleibt eine Lücke still und die Silbe davor wird mit einer kurzen Blende gekürzt.</li>"""))
