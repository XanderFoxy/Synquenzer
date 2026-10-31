import json, subprocess, sys, os
from PIL import Image, ImageDraw, ImageFont
BAR = 4 * 60 / 118
W, H, FPS = 1080, 1920, 30
SEG1 = json.load(open('rec-seg.json')); SEG2 = json.load(open('rec2-seg.json'))
UI = {  # name -> (file, start)
  'matrix': ('rec-ui.mp4', SEG1['matrix']['a'] + 1.0), 'fm': ('rec-ui.mp4', SEG1['fm']['a'] + 1.2),
  'drums': ('rec-ui.mp4', SEG1['drums']['a'] + 0.3), 'rec': ('rec-ui.mp4', SEG1['rec']['a'] + 1.6),
  'song': ('rec-ui.mp4', SEG1['song']['a'] + 0.9), 'klang': ('rec2-ui.mp4', SEG2['klang']['a'] + 0.2),
  'video': ('rec2-ui.mp4', SEG2['video']['a'] + 1.4)}
F7, F6 = 'barlow700.ttf', 'barlow600.ttf'
YEL = (255, 196, 46)
def run(c): subprocess.run(c, check=True)
def textpng(path, lines, pos):
  """lines: list of (text, size, color); pos 'top' | 'bot' | 'mid'"""
  im = Image.new('RGBA', (W, H), (0, 0, 0, 0)); d = ImageDraw.Draw(im)
  L = []
  for t, s, col in lines:
    f = ImageFont.truetype(F7 if s >= 60 else F6, s)
    # wrap to max width 860
    words, cur, rows = t.split(' '), '', []
    for w in words:
      nx = (cur + ' ' + w).strip()
      if d.textlength(nx, font=f) > 860 and cur: rows.append(cur); cur = w
      else: cur = nx
    rows.append(cur)
    for r in rows: L.append((r, f, col, s))
  hgt = sum(int(s * 1.18) for _, _, _, s in L); pad = 26
  y0 = {'top': 270, 'mid': 760, 'bot': 1650 - hgt - 2 * pad}[pos]
  wmax = max(d.textlength(r, font=f) for r, f, _, _ in L)
  x0 = 70 if pos != 'mid' else (W - 150 - wmax) // 2 + 40
  bx = Image.new('RGBA', (W, H), (0, 0, 0, 0)); bd = ImageDraw.Draw(bx)
  bd.rounded_rectangle([x0 - pad, y0 - pad, x0 + wmax + pad, y0 + hgt + pad // 2], radius=22, fill=(10, 12, 18, 205))
  im = Image.alpha_composite(bx, im); d = ImageDraw.Draw(im)
  y = y0
  for r, f, col, s in L:
    d.text((x0, y), r, font=f, fill=col + (255,)); y += int(s * 1.18)
  im.save(path)
def shot(i, sh, songmap, T, D, out):
  kind = sh['src']; pieces = []
  vf_full = f'scale={W}:{H}:force_original_aspect_ratio=increase,crop={W}:{H},fps={FPS},setsar=1'
  if kind.startswith('vv'):  # synced to song time; split at audio segment boundaries
    f = {'vv': 'vv-auto.mp4', 'vvs': 'vv-song.mp4', 'vvm': 'vv-matrix.mp4'}.get(kind) or kind + '.mp4'
    off = 18 * BAR if kind.startswith('vv3') else 0
    t = T
    while t < T + D - 1e-6:
      st, en = songmap(t)
      e = min(T + D, en); pieces.append((f, st - off, e - t)); t = e
    vf = vf_full
  else:
    f, st = UI[kind]; st += sh.get('off', 0); pieces.append((f, st, D)); vf = None
  parts = []
  for k, (f, st, d) in enumerate(pieces):
    p = f'ed/p{i}_{k}.mp4'
    if vf: run(['ffmpeg', '-v', 'error', '-y', '-ss', f'{max(0, st):.4f}', '-i', f, '-t', f'{d:.4f}', '-vf', vf, '-an', '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '16', p])
    else:  # phone mockup on a blurred backdrop
      mk = 'drawbox=x=30:y=372:w=262:h=44:color=0x161a22@1:t=fill,' if kind == 'matrix' else ''
      fc = (f'[0:v]{mk}fps={FPS},split[a][b];[a]scale={W}:{H}:force_original_aspect_ratio=increase,crop={W}:{H},boxblur=30:3,eq=brightness=-0.32:saturation=0.8[bg];'
            f'[b]scale=-2:1236,pad=iw+12:ih+12:6:6:color=0x3a4150[fg];[bg][fg]overlay=(W-w)/2-45:422,setsar=1')
      run(['ffmpeg', '-v', 'error', '-y', '-ss', f'{st:.4f}', '-i', f, '-t', f'{d:.4f}', '-filter_complex', fc, '-an', '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '16', p])
    parts.append(p)
  base = f'ed/s{i}_base.mp4'
  if len(parts) > 1:
    open('ed/l.txt', 'w').write(''.join(f"file '{os.path.basename(x)}'\n" for x in parts))
    run(['ffmpeg', '-v', 'error', '-y', '-f', 'concat', '-safe', '0', '-i', 'ed/l.txt', '-c', 'copy', base])
  else: os.replace(parts[0], base)
  if sh.get('text'):
    tp = f'ed/t{i}.png'; textpng(tp, sh['text'], sh.get('pos', 'top' if kind in UI else 'bot'))
    run(['ffmpeg', '-v', 'error', '-y', '-i', base, '-loop', '1', '-i', tp, '-filter_complex', f'[1:v]format=rgba,fade=in:st=0:d=0.12:alpha=1[t];[0:v][t]overlay=0:0:shortest=1,trim=duration={D:.4f}', '-an', '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '16', '-r', str(FPS), out])
  else:
    run(['ffmpeg', '-v', 'error', '-y', '-i', base, '-vf', f'trim=duration={D:.4f}', '-an', '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '16', '-r', str(FPS), out])
def build(name, segs, shots):
  """segs: list of (bar_from, bar_to) of the song; last one gets the tail. shots: list of dicts with 'bars' (output length in bars)"""
  # audio
  outb = []; acc = 0
  for a, b in segs: outb.append((acc, acc + (b - a), a)); acc += b - a
  tail = 2.16
  total = acc * BAR + tail
  def songmap(t):
    for k, (o0, o1, a) in enumerate(outb):
      last = k == len(outb) - 1
      if last or t < o1 * BAR - 1e-6: return a * BAR + (t - o0 * BAR), (total if last else o1 * BAR)
  # audio pieces with 12 ms crossfades
  af = []; ins = []
  for k, (a, b) in enumerate(segs):
    st = a * BAR; d = (b - a) * BAR + (tail if k == len(segs) - 1 else 0.012)
    ins += ['-ss', f'{st:.5f}', '-t', f'{d:.5f}', '-i', 'master.wav']
  n = len(segs); cur = '[0:a]'
  for k in range(1, n):
    o = f'[x{k}]'; af.append(f'{cur}[{k}:a]acrossfade=d=0.012:c1=tri:c2=tri{o}'); cur = o
  run(['ffmpeg', '-v', 'error', '-y'] + ins + ['-filter_complex', ';'.join(af) if af else '[0:a]anull[x]', '-map', cur if af else '[x]', '-c:a', 'pcm_s16le', f'ed/{name}-a.wav'])
  # loudness to -14 LUFS, TP -1.5
  J = subprocess.run(['ffmpeg', '-hide_banner', '-i', f'ed/{name}-a.wav', '-af', 'loudnorm=I=-14:TP=-1.5:LRA=11:print_format=json', '-f', 'null', '-'], capture_output=True, text=True).stderr
  j = json.loads(J[J.rindex('{'):J.rindex('}') + 1])
  run(['ffmpeg', '-v', 'error', '-y', '-i', f'ed/{name}-a.wav', '-af', f"loudnorm=I=-14:TP=-1.5:LRA=11:measured_I={j['input_i']}:measured_TP={j['input_tp']}:measured_LRA={j['input_lra']}:measured_thresh={j['input_thresh']}:offset={j['target_offset']}:linear=true,aresample=48000", '-ar', '48000', '-c:a', 'pcm_s16le', f'ed/{name}-an.wav'])
  # video shots
  T = 0; files = []
  for i, sh in enumerate(shots):
    D = sh['bars'] * BAR
    if i == len(shots) - 1: D = total - T
    out = f'ed/{name}-{i:02d}.mp4'; shot(f'{name}{i}', sh, songmap, T, D, out); files.append(out); T += D
  assert abs(T - total) < 0.05, (T, total)
  open('ed/c.txt', 'w').write(''.join(f"file '{os.path.basename(x)}'\n" for x in files))
  run(['ffmpeg', '-v', 'error', '-y', '-f', 'concat', '-safe', '0', '-i', 'ed/c.txt', '-i', f'ed/{name}-an.wav', '-map', '0:v', '-map', '1:a',
       '-c:v', 'libx264', '-profile:v', 'high', '-pix_fmt', 'yuv420p', '-preset', 'medium', '-crf', '19', '-r', str(FPS), '-g', '60',
       '-c:a', 'aac', '-b:a', '192k', '-ar', '48000', '-shortest', '-movflags', '+faststart', f'out/{name}.mp4'])
  return total
