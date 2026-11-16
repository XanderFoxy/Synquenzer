# NST1 – Inventar „Je Note weiterschalten“ (nur gelesen, Basis rel-4780/index.html = 4.78.0)

Zeilennummern beziehen sich auf `rel-4780/index.html` (114 431 Zeilen). Nichts wurde geändert.

## 0. Ergebnis in einem Satz

**Teilweise vorhanden.** Der *Transport* „eigene Oszillator-Werte je Note“ existiert vollständig (I2b Je-Stimme-Werte,
Klasse n wirkt genau beim Stimmstart = klickfrei), ebenso Muster-Logik (Arp/SEQ-Reihenfolgen) und Zufall je Note (Quelle
„Zufall“). **Es fehlt nur der Schrittzähler „jede neue Note = nächster Schritt“** mit Muster je Oszillator (hoch / runter /
gegenläufig / Ping-Pong / Spreizen / Zufall / fest) und die Bedienung dafür.

## 1. Was es schon gibt (in Richtung der Idee)

| Baustein | Wo (Zeilen) | Zeitgesteuert oder je Note? | Bezug zur Idee |
|---|---|---|---|
| **I2b Je-Stimme-Werte (Noten-Locks)** – Paare [Platz, Wert] reisen mit jeder Note in den Worklet | Platz-Listen PVA 14355, PVM 14356, PV_A/PV_M 14357, Klassen b/n 14358-14372; Haupt-Thread LKT 29529-29560, lkFamOk 29880, lkVoiceOk 29889, lkNoteX 29892-29915 | **je Note** (aber nur aus gespeicherten Clip-Locks) | **Kern-Transport für NST1.** VA: o1w/o2w/o3w (Welle, Klasse n), o1oct..o3oct, o1semi/o2semi/o3semi (Klasse n), fine/pw/lvl (Klasse b), o2sync, uni*, FM6 `fm6.ops.k.coarse` (Ratio, n) / fine/det (b), fmx-Graph ebenso; MS 2000 (Raum M): o1.c1/c2, o2.semi, o2.tune, mix.o1/o2, trans/tune … |
| Saite von Je-Note-Welle ausgenommen | kf2LkFix 106826-106832 (LKT o1w vals 0..3) | – | Welle je Note = Säge/Puls/Dreieck/Sinus |
| **PL1 Parameter-Locks (Bedienung)** | Kopf 89464-89484, PL1_QK 89485, pl1Wr 89798 | je Schritt/Note, **manuell** | Welle je Note ist heute schon *von Hand* möglich (Lock-Modus), aber kein Muster/Automatik |
| **I2c Reihen (lanes)** je Clip | lkNoteX-Teil 29900-29912, LNS 29921, lnEnd 29955, Worklet lbEvM 15084 / lbPrep 16802 | **Zeit** (Raster 1/32…1/4) | Vorbild für Zustand je Spur + Rücknahme bei Neu-Planung |
| **MS 2000 Mod-Sequenzer (MK6)** 3×16 Schritte, Ziele u. a. OSZ1 STEUER 1/2, OSZ2 HALBTON/FEIN, MIXER | Labels sqtg 9248-9252, sqty/sqrun 9253, KEY SYNC `ks` aus/Timbre/Stimme 9228, Kern 14991-15030, sqPrep 15185, sqAdv 15223 | **Zeit** (AUFL. 1/48…1/1, Schläge); KEY SYNC Stimme = jede Note startet bei Schritt 1 | Kein Weiterschalten je Note. Reihenfolge-Erzeugung (Vorwärts/Rückwärts/Wechsel 1/2) 15188-15189 als Muster-Vorlage nutzbar |
| MS 2000 Wellen-Sequenz (SEQ auf STEUER 2 der Speicherwelle) | mkSeqWaves 30881, mkwFeed 30879 | Zeit | 64 Speicherwellen durchschalten geht schon zeitlich; je Note bräuchte NST1 dasselbe Vorladen (M.wv.need) |
| **Arp-Muster** Auf/Ab/Wechsel 1/2/Zufall (wiederholbar)/Akkord/**Treppe** | MS-Arp 6824-6843 (Treppe 6843), BM-Arp 7109-7117, Texte ATYP_T 9310 | je Arp-Schritt (Tonhöhen) | Muster-Logik wiederverwendbar; Arp-Noten laufen über spawnVoice → würden NST1 je Arp-Note weiterschalten |
| **JAM1 Bedingungen / Durchlauf-Zähler / Zufall festhalten** | 91879-91900 | je Clip-Durchlauf | Saat-Idee (clip.dv.s) für reproduzierbaren Zufall in Song/Video |
| **Mod-Matrix VA/FM** Quellen LFO1/2, Hk2, Anschlag, Filt.-Hk, Tonhöhe, **Zufall (je Note)**, Mod-Rad, Lautst.-Hk | MOD_SRC 28415, MOD_DST 28421 (Ziele: Tonhöhe, Osz2-Tonhöhe, PW, Anteil Osz1-3, Rauschen, Uni-Verstimm., Filter, Amp, Pan, FM Helligkeit, Op1-6) ; Worklet src[S_RND]=v.rnd 17191 | „Zufall“ = **je Note neu, aber nur stetig + zufällig** | Nur stetige Ziele; keine Welle, kein Ratio-Raster, keine Reihenfolge |
| LFO je Note neu (Retrig / KEY SYNC Stimme), S&H je Zyklus | l1retrig/l2retrig (Worklet 17075), S&H 17168-17169, MS LFO ks 9352 | Zeit, Start je Note | LFO „durch Oszillator-Bausteine“ = vorhanden für stetige Ziele (PW, Anteil, Tonhöhe Osz 2, FM-Op-Pegel) |
| S&H in der Tonart (KF1) | KF1-Kopf 105838-105855 | Zeit | – |
| Analog-Zufall je Note (`analog`) | startVoice 17072-17073 (dP, dC, dO je Osz) | je Note, winzig | – |
| Stimmen-Panorama abwechselnd | nativ voicePan 31979 (4er-Ping-Pong je Note!), Worklet v.idx%2 17074 (je Stimmplatz) | je Note / Platz | Kleinstes vorhandenes „Ping-Pong je Note“ |
| Unison/Spread | PD o1uni.. 28335, uniDet/uniMix/uniWidth/spread (PVA) | fest | – |
| Wellen VA | PD `o1w o2w o3w` 0..4 28327, WAVE_NAME 28404 (Säge, Puls, Dreieck, Sinus, Saite) | – | 3 Oszillatoren = „Mitte/Breite/Tiefe“-Verbund passt 1:1 |
| Verhältnisse | FM2 `fm2.ratio` [.5,1,1.41,2,3,3.5,4,5,7] 28385; FM6 coarse 0..31 45277; WT `wt.pos` 28382 | – | Ratio-Treppe je Note (FM2/FM6), Wavetable-Position je Note (WT) |

## 2. Wo Note-On je Stimme verarbeitet wird

Haupt-Thread (alle Synth-Wege laufen durch **eine** Stelle):
- `spawnVoice` 32010; Abzweige: MTX3 32013, SPK7 32015, PERC 32016, **MS 2000 → spawnWkVoice 32018**, Bit Mask 32021, VA/FM6 Worklet 32030, sonst nativ.
- Native Sicht der Note-Werte: `const PL = o.lkP ? lkNatView(P, o.lkP) : P` **32023** (FM2/WT/Fallback: Werte gelten ab Notenstart).
- `spawnWkVoice` 31958; **`E.on(v.id, out, vel, t0, from, o.mask || 0, o.lk || null)` 31972** (einziger Weg in den Worklet). Akkord-Gruppierung (35 ms, gs.grpT) 31965-31968.
- `E.on` baut das Ereignis `[t, 1, id, note, vel, from, d, 0, nPaare, Paare…]` 25905. Max. 16 Paare (Haupt-Thread kappt bei 32 Zahlen 29900, Worklet `Math.min(16, …)` 16811).
- Aufrufer: Clip `spawnClipVoice` 32090 (lx aus lkNoteX 33334), Live 36557 / 39524, Melodie 33871, MS-Arp 6969/6989, Vorschau 48744 (src 'preview'), Vorhören 32593 u. a.
- **Neu-Planung:** `cancelTrackFrom` 33422 (FILL R.j1F 92147, Arp-Rewind 44435, Clip-Edits) bricht schon gesetzte Stimmen ab → ein Zähler beim Spawn muss hier zurückgenommen werden (wie `lnEnd`, ARPC.cancelFrom). Transport: startTransport 34682, stop 34704.

Worklet `'dirigent-analog'` (AnalogCore 16415):
- enqueue 16519; **kill (Typ 4) löscht noch wartende Ereignisse der ID** 16521-16524 (abgebrochene Noten starten nie); Note mit Paaren → lkPrep 16531/16789 (Tabellen einmalig im Nachrichtenweg, keine Zuweisung in process()).
- runEvents 17083: MS 2000 17088 → MkCore.noteOn 16364 → MkTim.noteOn 15361 → start 15339 → lkStartM 15044 (Raum M).
- VA/FM: 17092 `lkEv` → noteOn 17101 → startVoice 17060 → **lkStart 16808** (Paare in v.pv, Klasse n gilt ab Notenstart) → lkView 16827 (eigene Sicht VP + abgeleiteter Satz D, u. a. D.oW = Welle je Stimme 17026).
- Mono/Legato: monoOn 17125 → **lkLegato 17132 / 16863**: Klasse b gleitet 5 ms (LK_RM 14357, lkRamp 16871), **Klasse n (Welle, Fußlage, HT) springt hart** → bei Legato mögliches Knacken (prüfen; ggf. markierte Mini-Blende im Worklet).
- Mod-Quellen je Stimme pro Steuer-Block: 17190-17191.

## 3. Klickfrei umschalten (vorhanden)

- VA strukturelle Schlüssel XF_KEYS 14011 (o1w..o3w, uni, sync, ftype, sub…): bei klingenden Stimmen Dip 96+96 Samples (XF_D 14012) bzw. 30-ms-Leistungs-Blende SXF_N 14014 (setReq 16537, sxMix 16592).
- MS 2000: MK_STRUCT 14989 (o1.w, o2.w, o2.mod, f.type, a.gate) → structXf 15480 / sxMix 15492; je Stimme eigener `v.st` (setStruct 15155).
- Je-Note-Werte der Klasse n brauchen **keine** Blende (neue Stimme, Hüllkurve startet bei 0) – außer Legato (s. o.).
- Lock-Kosten: lkOn wird per lkOnChk 16942 wieder aus; Stimmen mit eigenem Satz rechnen deriveInto je Notenstart (keine Zuweisung). CPU mit 8 Stimmen × Paare messen.

## 4. Lücken (was NST1 bauen müsste)

1. Schrittzähler je Spur (und je Ziel/Oszillator), getrieben von **jeder neuen Note** (Live, Clip, Song, Arp, Melodie; nicht Vorschau), Akkord = ein Schritt (35-ms-Gruppe wie Glide 31965) oder je Stimme gespreizt – Entscheidung.
2. Muster: hoch, runter, hoch-runter (Ping-Pong), Treppe, Zufall (Saat → Song/Video gleich), fest; **Verbund 2-3 Osz.: gegenläufig / versetzt / Spreizen** („Mitte/Breite/Tiefe“, nie deckungsgleich).
3. Rücknahme bei `cancelTrackFrom` 33422, Rücksetzen bei startTransport 34682 / stop 34704 (sonst springt der Zähler bei FILL/Arp-Neuplanung).
4. Zusammenführen mit vorhandenen Noten-Locks: **Lock schlägt NST1** (wie „Lock schlägt Reihe“ 17061); Grenze 16 Paare.
5. MS 2000: Welle o1.w/o2.w ist **nicht** im Raum M (PVM 14356) → Phase 1 dort STEUER 1/2, OSZ2 HALBTON/FEIN, MIXER; Welle je Note wäre ein PV-Layout-Anhang (eingefroren, nur hinten anhängen 29526-29527) + Worklet – Phase 2. Speicherwelle über STEUER 2 braucht Vorladen (mkwFeed 30879).
6. Bit Mask: kein Lock-Weg (lkFamOk 29880 → false) – außen vor.
7. Speichern: neues Feld nur additiv im Klang (z. B. `sound.nst`), ohne Feld bitgleich wie 4.78.0.

## 5. Bester Andockpunkt

**Technik (Haupt-Thread, ohne Worklet-Änderung):** ein einzeiliger Haken in `spawnVoice` direkt nach 32014 (snd0 bekannt, vor allen
Engine-Abzweigen), der aus dem NST1-Zustand der Spur die Paare des nächsten Schritts erzeugt und mit `o.lk` (Worklet, über
LKT[...].wi) bzw. `o.lkP` (nativ FM2/WT) zusammenführt. Damit laufen VA, FM6/fmx, MS 2000 (Raum M), FM2, WT, Live, Clip, Song,
Video-Render und Arp ohne zweiten Kern über den erprobten I2b-Weg. Dazu einzeilige Haken in `cancelTrackFrom` 33422 (Rücknahme),
`startTransport` 34682 / `stop` 34704 (Neustart der Muster). Worklet nur, falls Legato-Wellensprung (lkLegato 16863) hörbar knackt
(markierter Mini-Haken, Klasse-n-Wechsel per vorhandenem XF-Dip).

**Bedienung (on the fly, vorhandener Stil):**
1. **Long-Press auf einen Regler** (Picker openPicker 43930, Quellen-Chips PICK_MAIN/PICK_MORE 43532, LP_MS 450 ms 43387):
   ein zusätzlicher Chip „Je Note“ neben LFO/Hüllk./Zufall → kleines Blatt: Muster ↑ ↓ ↕ Zufall Fest · Bereich/Werte ·
   „mit Osz 2/3: gleich │ gegenläufig │ spreizen“. Gilt für HT, Fein, PW, Anteil (pageOsc 45010), FM2-Ratio (45198), FM6 Grob (45277).
2. **Welle/Fußlage** sind Segmente ohne Long-Press (makeSeg 44042, lgrp 'Welle' in pageOsc 45013-45016) → NST1 hängt dort per
   Einzeiler einen Long-Press bzw. eine kleine LED „je Note“ an (sichtbare Änderung → im Funk vorschlagen).
3. **Übersicht:** MOD-Seite Quellen-Leiste (pageMod 48268, 8 Chips) + K1 Mod-Übersicht (48424) zeigen „Je Note → Osz 2 Welle · ↕“
   mit ✕. Kopfzeile (44835-44873: Name, A/B, Sichern, Würfel, ◎, ⋯, Hören, Oszilloskop) ist voll – höchstens Eintrag im ⋯-Menü.
4. MS-2000-Platte: eigene SEQ-Seiten (9330, 9541) – Phase 2.

## 6. Recherche-Notiz (aus Fachwissen, nicht web-geprüft)

- Modular: Schrittsequenzer bzw. sequentieller Umschalter, **vom Tastatur-Gate weitergeschaltet** = genau „jede Note ein Schritt“ (klassisch).
- Yamaha Motif/Montage: XA-Control „Cycle“/„Random“ schaltet Elemente (Layer) je Note reihum bzw. zufällig.
- Sampler: Round-Robin (je Note nächste Aufnahme).
- Serum u. a.: „NoteOn Random“-Quellen (Zufall je Note) – entspricht unserer Quelle „Zufall“.
- Korg Wavestation/wavestate: Wellen-Sequenzen zeitgesteuert (mit Key Sync) – entspricht MS 2000 SEQ auf Speicherwelle.
- Elektron: Parameter-Locks / Trig-Bedingungen – entspricht PL1 / JAM1.
- **Mehrere Oszillatoren gleichzeitig mit eigenen, gegenläufigen Je-Note-Mustern als Ein-Griff-Funktion** ist in gängigen Synths
  nicht als Standardfunktion bekannt → eine neue Kombination bekannter Bausteine.
