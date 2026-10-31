from edit import *
W_ = (255, 255, 255)
# audio: Haken, Strophe 4, Strophe-2 4, Aufbau 4, Drop 8, Break 4, Drop-2 4, Schluss = 32 Takte + Ausklang
total = build('ki-60s', [(0, 2), (2, 6), (10, 14), (18, 22), (22, 30), (30, 34), (34, 38), (42, 44)], [
  {'src': 'matrix', 'bars': 2, 'text': [('Eine KI hat mir einen kompletten Musik-Sequenzer gebaut …', 66, W_)]},
  {'src': 'matrix', 'off': 4.1, 'bars': 2, 'text': [('… mit Synthesizern, spielbar am iPhone.', 64, W_), ('Und damit mache ich jetzt das hier:', 52, YEL)]},
  {'src': 'klang', 'bars': 2, 'text': [('Synth-Klänge drehen', 72, W_)]},
  {'src': 'fm', 'bars': 2, 'text': [('FM-Synthese, 6 Operatoren', 70, W_)]},
  {'src': 'drums', 'bars': 2, 'text': [('Drums programmieren', 72, W_)]},
  {'src': 'rec', 'bars': 2, 'text': [('Clips aufnehmen – mit dem Finger', 66, W_)]},
  {'src': 'vv3-4', 'bars': 2, 'pos': 'bot', 'text': [('Und jetzt hör hin …', 76, YEL)]},
  {'src': 'vv', 'bars': 2, 'pos': 'mid', 'text': [('Das hat eine KI gebaut.', 92, YEL)]},
  {'src': 'vv3-1', 'bars': 2, 'pos': 'bot', 'text': [('Gebaut mit der KI Claude.', 76, W_)]},
  {'src': 'vvm', 'bars': 2, 'pos': 'bot', 'text': [('Kein Programmierer.', 80, W_), ('Nur Ideen.', 80, YEL)]},
  {'src': 'song', 'bars': 2, 'text': [('Song bauen: Teile, Spuren, Akkorde', 62, W_)]},
  {'src': 'vv', 'bars': 2, 'pos': 'bot', 'text': [('Gesang? Ein Vocoder.', 70, YEL), ('Die App singt „Synquenzer“.', 56, W_)]},
  {'src': 'vvs', 'bars': 2, 'pos': 'bot', 'text': [('Jeder Ton kommt aus der App selbst.', 62, W_)]},
  {'src': 'vv', 'bars': 2, 'pos': 'bot', 'text': [('Was mit KI jetzt möglich ist.', 76, YEL)]},
  {'src': 'video', 'bars': 2, 'text': [('Video exportieren – fertig zum Posten.', 62, W_)]},
  {'src': 'vvm', 'bars': 2, 'pos': 'bot', 'text': [('SYNQUENZER', 104, YEL), ('Gebaut mit Claude · Link in der Bio', 52, W_)]},
])
print('total', total)
