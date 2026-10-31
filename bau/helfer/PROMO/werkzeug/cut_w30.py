from edit import *
W_ = (255, 255, 255)
total = build('werbung-30s', [(0, 2), (18, 22), (22, 28), (42, 44)], [
  {'src': 'vv', 'bars': 2, 'pos': 'bot', 'text': [('SYNQUENZER', 104, YEL), ('80er-Synthpop – komplett am iPhone gebaut', 54, W_)]},
  {'src': 'klang', 'bars': 1, 'text': [('Synths drehen', 78, W_)]},
  {'src': 'drums', 'bars': 1, 'text': [('Drums bauen', 78, W_)]},
  {'src': 'rec', 'bars': 1, 'text': [('Clips einspielen', 78, W_)]},
  {'src': 'song', 'bars': 1, 'text': [('Song anordnen', 78, W_)]},
  {'src': 'vv', 'bars': 2, 'pos': 'bot', 'text': [('Alles in einer App.', 84, YEL), ('Jeder Ton aus den eigenen Klangerzeugern', 50, W_)]},
  {'src': 'vv3-1', 'bars': 2, 'pos': 'bot', 'text': [('Analog · FM · Vocoder · Drums', 66, W_)]},
  {'src': 'vv3-4', 'bars': 1, 'pos': 'bot', 'text': [('Gated-Snare wie 1984', 66, W_)]},
  {'src': 'video', 'bars': 1, 'text': [('Als Video teilen – direkt aus der App', 64, W_)]},
  {'src': 'vvm', 'bars': 2, 'pos': 'bot', 'text': [('SYNQUENZER', 104, YEL), ('Synth & Sequenzer im Browser · Link in der Bio', 50, W_)]},
])
print('total', total)
