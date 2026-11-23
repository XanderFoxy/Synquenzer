# Wendet p1 + p2 auf die Original-Seite an (jede Ersetzung muss genau einmal passen) und setzt die Daten-Kennungen.
import hashlib, sys, os
H = os.path.dirname(os.path.abspath(__file__))
ZIEL = H + '/../../repo/the-wall/werkstatt2/'
s = open(H + '/index.orig.html', encoding='utf-8').read()
R = []
for f in ['p1_css_html.py', 'p2_js.py']:
    g = {}; exec(open(H + '/' + f, encoding='utf-8').read(), g); R += g['R']
for i, (a, b) in enumerate(R):
    n = s.count(a)
    if n != 1: sys.exit('Ersetzung %d passt %d-mal: %r' % (i, n, a[:120]))
    s = s.replace(a, b)
# listen(): Teil „Was geändert wurde“ + Prüfstellen
a0 = s.index("  let h='';\n  if(LIED.pruefstellen.length)")
e = "$('anzA').textContent=AEND?' '+(AEND.length+LIED.pruefstellen.length):'';\n}"
a1 = s.index(e) + len(e)
neu = r"""  const RANG={v11:0,v10:1,v7:2},f=Z.aendFilter;
  let h='<div class="filter" role="group" aria-label="Fassung">'+[['alle','Neueste zuerst'],['v11','v11'],['v10','v10'],['v7','v7']].map(([k,n])=>'<button data-f="'+k+'" aria-pressed="'+(f===k)+'">'+n+'</button>').join('')+'</div>';
  if(AEND){const L2=AEND.filter(a=>f==='alle'||a.fassung===f).sort((a,b)=>((RANG[a.fassung]??3)-(RANG[b.fassung]??3))||a.zeit_s-b.zeit_s);
    h+=L2.map(a=>'<div class="zeile">'+(a.ganz?'<span class="wann">ganzes<br>Lied</span>':'<button data-hin="'+a.zeit_s+'"'+(a.bis_s?' data-bis="'+a.bis_s+'"':'')+'>Hin</button><span class="wann">'+esc(tpos(a.zeit_s))+'<br><small>'+esc(mmss(a.zeit_s))+'</small></span>')+
      '<span class="was">'+esc(a.was)+' <span class="marke">'+esc(a.fassung)+'</span>'+(a.beleg==='Beschreibung'?' <span class="marke">laut Beschreibung</span>':'')+
      (a.master?'<span class="knoepfe"><button data-master="'+a.zeit_s+'">v10 ↔ v11 im Master</button></span>':'')+'</span></div>').join('')||'<p class="leer">Keine Einträge.</p>'}
  else h+='<p class="leer">Liste lädt …</p>';
  $('listeA').innerHTML=h;$('anzA').textContent=AEND?' '+AEND.length:'';
  let hp='<p class="leer">Liste lädt …</p>';
  if(PRUEF)hp=PRUEF.stellen.length?'<p class="leer">Hier könnte ich Fehler gemacht haben: gemessen (v11 gegen deine Aufnahme), nicht gehört. Deutlichste zuerst.</p>'+
    PRUEF.stellen.slice().sort((a,b)=>b.schwere-a.schwere||a.zeit_s-b.zeit_s).map(p=>'<div class="zeile pz" data-p="'+esc(p.id)+'"><button data-tu="hin">Hin</button><span class="wann">'+esc(tpos(p.zeit_s))+'<br><small>'+esc(mmss(p.zeit_s))+'</small></span><span class="was"><b>'+esc(p.titel)+'</b> <span class="marke s'+p.schwere+'">'+esc(SCHWERE[p.schwere]||'')+'</span> <span class="marke">'+esc(p.art)+'</span><br>'+esc(p.was)+
      '<span class="knoepfe"><button data-tu="ab">A/B</button><button data-tu="notiz">Als Notiz</button></span></span></div>').join(''):'<p class="leer">Keine Prüfstellen.</p>';
  $('listeP').innerHTML=hp;$('anzP').textContent=PRUEF&&PRUEF.stellen.length?' '+PRUEF.stellen.length:'';
}"""
s = s[:a0] + neu + s[a1:]
hs = lambda p: hashlib.md5(open(ZIEL + p, 'rb').read()).hexdigest()[:8]
s = s.replace('@AEND@', hs('daten/aenderungen.json')).replace('@PRUEF@', hs('daten/pruefstellen.json'))
open(ZIEL + 'index.html', 'w', encoding='utf-8').write(s)
print('ok', len(R), 'Ersetzungen,', len(s), 'Zeichen')
