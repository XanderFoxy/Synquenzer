import numpy as np, soundfile as sf, json, sys
sys.path.insert(0,'/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/wall-v12/bau')
from dsp import maske, SR
B='/tmp/claude-0/-home-user-Deutsch-Mit-Xander/9f6e2ea9-5438-5564-bb39-64bc754f0143/scratchpad/wall-v12/bau/'; ST=B+'stimmen/'; P=B+'plan/'
N=266*SR; plan=json.load(open(P+'plan.json'))
def lade(n): return sf.read(ST+n+'.wav')[0][:N]
src=open(B+'mix_v12.py').read(); i=src.index('def zusammensetzen'); j=src.index('g_ober =')
exec(src[i:j])
fen_c=plan['chor_fenster']; OYE=tuple(plan['oye'])
g_ober=maske(plan['ober_gate'],N,0.025)*maske(fen_c,N,0.1)*(1-maske([OYE],N,0.03))
g_unter=maske(plan['unter_gate'],N,0.03)*maske(fen_c,N,0.1)*(1-maske([OYE],N,0.03))
sf.write(ST+'ober.wav',zusammensetzen(P+'ober.txt',{3.0:lade('lead_p3'),4.0:lade('lead_p4'),5.0:lade('lead_p5')},g_ober).astype(np.float32),SR,subtype='FLOAT')
sf.write(ST+'unter.wav',zusammensetzen(P+'unter.txt',{-3.0:lade('lead_m3'),-4.0:lade('lead_m4')},g_unter).astype(np.float32),SR,subtype='FLOAT')
