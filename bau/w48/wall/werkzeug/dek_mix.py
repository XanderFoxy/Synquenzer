# Musik der Werkstatt 2 (mix-00..09, v11 ohne Gesang) lokal dekodieren -> roh/mix-w2.npy (mono, 48 kHz)
import json, sys, numpy as np
sys.path.insert(0, __import__('os').path.dirname(__file__))
from dekodiere import stem, R, OUT
stems = json.load(open(R + '/werkstatt2/daten/stems.json'))
np.save(OUT + '/mix-w2.npy', stem('mix', stems))
