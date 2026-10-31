from edit import *
W_ = (255, 255, 255)
# audio: Haken, Strophe 4, Strophe-2 4, Aufbau 4, Drop 8, Drop-2 8, Schluss  = 32 Takte + Ausklang
total = build('werbung-60s', [(0, 2), (2, 6), (10, 14), (18, 22), (22, 30), (34, 42), (42, 44)], [
  {'src': 'vv', 'bars': 2, 'pos': 'bot', 'text': [('SYNQUENZER', 104, YEL), ('Synthesizer · Sequenzer · Song – am iPhone', 52, W_)]},
  {'src': 'matrix', 'bars': 2, 'text': [('Clips starten – live im Takt', 70, W_)]},
  {'src': 'vvm', 'bars': 2, 'pos': 'bot', 'text': [('8 Spuren × 8 Szenen', 76, W_)]},
  {'src': 'klang', 'bars': 2, 'text': [('Analog-Synth: Filter drehen', 70, W_)]},
  {'src': 'fm', 'bars': 2, 'text': [('FM-Klänge mit 6 Operatoren', 70, W_)]},
  {'src': 'drums', 'bars': 2, 'text': [('Drum-Maschine mit eigenen Kits', 66, W_)]},
  {'src': 'vv3-4', 'bars': 2, 'pos': 'bot', 'text': [('Aufbau …', 80, YEL)]},
  {'src': 'vv', 'bars': 2, 'pos': 'mid', 'text': [('DROP', 140, YEL)]},
  {'src': 'vv3-1', 'bars': 2, 'pos': 'bot', 'text': [('Innenleben live: FM-Algorithmus', 60, W_)]},
  {'src': 'rec', 'bars': 2, 'text': [('Melodie einspielen – als Clip', 66, W_)]},
  {'src': 'vv3-5', 'bars': 2, 'pos': 'bot', 'text': [('Lead mit Echo', 76, W_)]},
  {'src': 'song', 'bars': 2, 'text': [('Song bauen: Teile, Spuren, Akkorde', 62, W_)]},
  {'src': 'vvs', 'bars': 2, 'pos': 'bot', 'text': [('Der ganze Song im Blick', 70, W_)]},
  {'src': 'vv', 'bars': 2, 'pos': 'bot', 'text': [('Vocoder: die App singt „Synquenzer“', 60, YEL)]},
  {'src': 'video', 'bars': 2, 'text': [('Video direkt aus der App – 9:16', 64, W_)]},
  {'src': 'vvm', 'bars': 2, 'pos': 'bot', 'text': [('SYNQUENZER', 104, YEL), ('Läuft im Browser am iPhone · Link in der Bio', 50, W_)]},
])
print('total', total)
