# KSM2 – Stand (fertig, Umfang ehrlich unten)
Bau: `python3 apply.py <eingang> <ausgang>` (Eingang 4.90.0 md5 a23eefd7ac3f52251e5bc881f1de4628; Ausgang hier `index.html`, md5 941cc0f750f8273b0bd63143fb236681).
Quellen: `block.js` (Hauptskript, /* KSM2-BEGIN */ vor `function lkNoteX(i,clip,nt,rb){`), `block-bm.js` (Bit-Mask-Worklet-Vorlage BM_WK, ASCII, vor `class BmProc extends AudioWorkletProcessor{`).
Haken (je feste Trefferzahl 1): lkNoteX – KSM-Locks (LKT[k].ksm) bei wt/mk/bm gehen an `ksm2Put` (vorher: wt verworfen wegen nat:'nein', mk/bm schon an lkFamOk gescheitert);
nativer spawnVoice nach `NativeVoice.source` → `ksm2NatPe` (nur wenn PL.ksm2Pe); sq-bm-src `if(lk)bm1On(o,lk);` → zusätzlich `ksm2Bm(o,lk)`;
BM_WK: 'on' trägt `kx:ksm2Kx(x)`, Stimmstart/takeKey setzen v.kx, `deltas` überschreibt H[1] (Tonh.-Hk.-Start) bei kx.pe, envStep je Stimme mit `ksm2E` (A/D/R über Umkehr von TX).
Transport: WT als nat-Lock (aA…fR in Sekunden = Schläge·60/BPM; ksm2Ma/Md/Mr, ksm2Pe); MS-Platte als echte MS-Lock-Paare `mk.t.{0,1}.e2|e1.a|d|r` (Wert 0…127 über Umkehr von atk/dec);
Bit Mask als Merker-Paare −7745 (Tonh.-Hk.), −7746…−7748 (Amp A/D/R), −7752…−7754 (Filter A/D/R).

## Kern-Test
`kern-ksm2.cjs` – `node kern-ksm2.cjs <neu.html> [basis.html]` (eigener Temp-Server 9300–9399, version.json 4.90.0). Gegen andere Fassung: erste Datei = Kandidat, zweite = Vergleich.
Je Engine (WT nativ über spawnVoice in OfflineAudioContext, MS-Platte über SynthHost.track, Bit Mask über bmTrack) und je Lock (18 Schlüssel) über den echten Weg lkNoteX → Kern: dB-Unterschied
zum Render ohne Lock; ohne Lock Hash (WT: auf 1e-5 gerundet, weil der native Release-Schluss in 4.90 wie neu um ~−90 dB schwankt). Ausgabe `kern-ksm2.out`.
Ergebnis neu: WT ksAa −6.7, ksAd −23.4, ksAr −11.3, ksFa −9.8, ksFd −22.2, ksFr −39.7, ksPe −0.6, ksMa +2.8, ksMd +3.3 dB (Hk.-2-Locks gegen ksPe allein); MS-Platte ksAa −5.4, ksAd −25.6, ksAr −13.8,
ksFa +1.0, ksFd −31.3, ksFr −24.9; Bit Mask ksAa +0.6, ksAd −17.1, ksAr −10.7, ksFa −4.0, ksFd −18.0, ksFr −41.9, ksPe +3.5. Alle übrigen Locks: unverändert (wie gewollt).
Ohne Lock: WT a6e862a8eecd0502, MS 7266bd777266bd77, BM 5c624375c62437 – identisch neu/basis. Basis (4.90): alle Locks bei WT/MS/BM ohne Wirkung. Konsole ohne Fehler.
Pflicht (`pflicht.out`): doppelt.js neu [], „MS 2000“ 1×, „  live: true,“ 1×, verbotene Zahlen 0×, Marker KSM2 je 2× (Haupt + BM).
`probe-wt.cjs` – Hilfsprobe: WT-Offline-Render dreimal (zeigt Pan-Zähler/Release-Jitter).

## Grenzen / ausgelassen (Kern hat den Parameter nicht)
- Filter 2 (Cutoff/Reso/Menge/Anteil) und LFO-Raster/Glätten: bei WT, MS-Platte und Bit Mask kein zweites Filter bzw. kein Raster → Locks bleiben stumm.
- MS-Platte: keine eigene Tonh.-Hk. (nur über PATCH) und keine dritte Hüllkurve → ksPe, ksMa/Md/Mr ausgelassen. Locks gelten für beide Timbres; Werte gerundet auf 0…127.
- Bit Mask: keine Hk. 2 → ksMa/Md/Mr ausgelassen; Para-/Mono-Gemeinschafts-Hüllkurven (Modus para/moly) und Mono-Tastenstapel-Rückkehr übernehmen die TAKT-Locks nicht.
- WT: Hk.-2-Release wirkt nur bei Hk.-2-Sustain > 0; Legato-Fortsetzung übernimmt die Tonh.-Hk. nicht neu.
- Routen auf die neuen Ziele (pe, f2*, ras*, takt): WT rechnet Modulation nur spurweit (LFO auf Tonhöhe/Cutoff), MS-Platte und Bit Mask haben eigene Mod-Matrizen → ohne Wirkung (Render = 4.90).
- Locks nur über lkNoteX/lkToN getestet, nicht per Fingertipp im Lock-Modus (die KS-Regler sind bei diesen Engines nicht sichtbar/inaktiv; Locks entstehen auf VA/FM und bleiben beim Engine-Wechsel).
