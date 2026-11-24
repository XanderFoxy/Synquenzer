import sys; sys.path.insert(0,'.')
from t_bild import *
import soundfile as sf
L13=lade_wav(ST13+'lead.wav'); E=lade_npy('ende'); O=lade_npy('original')
mk={'v13':[(t,'',  'r') for t in (104.0,104.75,106.125,106.75,108.0,108.75,110.0,112.0,112.75,114.0,114.75,115.375,116.0)]}
bild(103.7,111.2,[('E5dry',O),('v12',E),('v13',L13)],TC+'bild/v13_see.png',mk,titel='there is so much more to see: E5 trocken / v12 / v13 (rot = Ziel)')
bild(111.7,116.6,[('E5dry',O),('v12',E),('v13',L13)],TC+'bild/v13_hyp.png',mk,titel='are we hypnotised')
