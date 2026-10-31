from edit import *
W_ = (255, 255, 255)
total = build('ki-30s', [(0, 2), (10, 12), (20, 22), (22, 28), (42, 44)], [
  {'src': 'klang', 'bars': 2, 'text': [('Eine KI hat mir einen kompletten Musik-Sequenzer gebaut.', 68, W_), ('Mit Synthesizern. Spielbar am iPhone.', 50, YEL)]},
  {'src': 'fm', 'bars': 1, 'text': [('FM-Synth mit 6 Operatoren', 64, W_)]},
  {'src': 'drums', 'bars': 1, 'text': [('Drum-Maschine', 72, W_)]},
  {'src': 'rec', 'bars': 1, 'text': [('Clips aufnehmen', 72, W_)]},
  {'src': 'song', 'bars': 1, 'text': [('Song bauen', 72, W_)]},
  {'src': 'vv', 'bars': 2, 'pos': 'mid', 'text': [('Das hat eine KI gebaut.', 92, YEL)]},
  {'src': 'vv3-1', 'bars': 2, 'pos': 'bot', 'text': [('Kein Programmierer.', 80, W_), ('Nur Ideen.', 80, YEL)]},
  {'src': 'vv3-5', 'bars': 1, 'pos': 'bot', 'text': [('Gesang? Ein Vocoder singt mit.', 62, W_)]},
  {'src': 'video', 'bars': 1, 'text': [('Und das Video kommt direkt aus der App.', 60, W_)]},
  {'src': 'vvm', 'bars': 2, 'pos': 'bot', 'text': [('Was mit KI jetzt möglich ist.', 76, YEL), ('Gebaut mit der KI Claude · SYNQUENZER', 50, W_)]},
])
print('total', total)
