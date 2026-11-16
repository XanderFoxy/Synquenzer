// Mischpult 0.1 – ablauf.js: die Durchläufe 0–4 (KONZEPT C.3) über alle Kern-Module. Kein DOM; läuft im render-worker.js und in Node.
// Rechnen in Stücken (2^17 Proben) mit mitgeführtem Zustand: Ergebnis bitgleich zum Rechnen am Stück (Test T5).
import { lesKopf, lesStuecke, WavSchreiber24, STUECK } from './wav.js';
import { SpurAnalyse, merkmaleKlein, schnellblick, entscheide, GESANG, STUFEN, ZIELE, maxA } from './analyse.js';
import { Mischer, Raum, sendDbFuer } from './mix.js';
import { planeMaster, MasterKette, klangAbstand } from './master.js';
import { Lautheit, TruePeak, ClipZaehler, Korrelation, Bq2, bqKoeff, ampel, pdb, db, lin } from './messen.js';
import { IMP1 } from './dsp/imp1.js';
import { rezeptJson, rezeptText } from './rezept.js';
import { zipAusBlobs, textEintrag } from './zip.js';

export const VERSION = '0.1.1';
const TERZ_BAND = [9, 23]; // Terzbänder 200 Hz … 5 kHz (Raum-Rückweg)

function abbruch(signal) { if (signal && (signal.aborted || signal.abgebrochen)) { const e = new Error('abgebrochen'); e.abgebrochen = true; throw e; } }
const pause = () => new Promise(r => setTimeout(r, 0));

/** Gemeinsamer Anfang der Dateinamen als Song-Name. */
export function songName(namen) {
  const n = namen.map(x => String(x).replace(/\.[a-z0-9]{2,5}$/i, ''));
  if (!n.length) return 'Song';
  let p = n[0]; for (const x of n) while (!x.startsWith(p)) p = p.slice(0, -1);
  p = p.replace(/[\s_\-.(]+$/, '').trim();
  return p.length >= 2 ? p : 'Song';
}

export class Projekt {
  /** quellen: [{file, kopf}] (Köpfe aus lesKopf) */
  constructor(quellen, { stueck = STUECK, vormischImSpeicherMaxMB = 160 } = {}) {
    this.quellen = quellen; this.stueck = stueck; this.maxMB = vormischImSpeicherMaxMB;
    this.sr = quellen[0].kopf.sr; this.frames = Math.max(...quellen.map(q => q.kopf.frames));
    this.cache = { plan: new Map(), vm: new Map(), P: new Map() };
  }
  /** Durchlauf 0: Köpfe + Schnellblick + Prüfungen beim Laden (A.8). Wirft {code:'raten-verschieden'} bzw. meldet 'kein-wav' je Datei. */
  static async oeffne(files, opts = {}) {
    const quellen = [], fehler = [];
    for (const file of files) { try { quellen.push({ file, kopf: await lesKopf(file) }); } catch (e) { fehler.push({ name: file.name, code: e.message === 'kein-wav' ? 'kein-wav' : 'lesefehler' }); } }
    if (!quellen.length) { const e = new Error('keine-spuren'); e.fehler = fehler; throw e; }
    if (new Set(quellen.map(q => q.kopf.sr)).size > 1) { const e = new Error('raten-verschieden'); e.code = 'raten-verschieden'; throw e; }
    const p = new Projekt(quellen, opts);
    p.song = songName(quellen.map(q => q.kopf.name)); p.fehler = fehler; p.hinweise = [];
    const lmax = p.frames / p.sr;
    p.spuren = [];
    for (const q of quellen) {
      const sb = await schnellblick(q.file, q.kopf);
      p.spuren.push({ name: q.kopf.name, sr: q.kopf.sr, kanaele: q.kopf.ch, bits: q.kopf.bits, float: q.kopf.float, laengeS: +(q.kopf.frames / q.kopf.sr).toFixed(2), vorschlag: sb.vorschlag });
      if (lmax - q.kopf.frames / q.kopf.sr > 5) p.hinweise.push({ code: 'kuerzer', spur: q.kopf.name, satz: `Spur „${q.kopf.name}“ ist kürzer. Alle beginnen am Anfang – stimmt das?` });
    }
    return p;
  }
  _stroeme(start = 0, end = this.frames) { return this.quellen.map(q => lesStuecke(q.file, q.kopf, { frames: this.stueck, start, end })); }
  async *_stuecke(start, end, signal) {
    const its = this._stroeme(start, end);
    for (;;) {
      abbruch(signal);
      const r = await Promise.all(its.map(it => it.next()));
      if (r[0].done) return;
      yield { pos: r[0].value.pos, n: r[0].value.L.length, stuecke: r.map(x => x.value) };
    }
  }

  /**
   * Durchlauf 1 „Spuren anhören“: Merkmale je Spur, Vorher-Summe (Lautheit, Spitze, Übersteuerung), Tempo.
   * rollen: [{rolle, hauptsache, solassen}] in der Reihenfolge der Spuren.
   */
  async analysiere(rollen, { onFortschritt, signal } = {}) {
    const sr = this.sr, an = this.quellen.map(() => new SpurAnalyse(sr, this.frames));
    const vLu = new Lautheit(sr), vTp = new TruePeak(sr, 4), vCl = new ClipZaehler(), vKo = new Korrelation(sr), vAn = new SpurAnalyse(sr, this.frames);
    const fac = Math.max(1, Math.round(sr / 12000)), x12 = new Float32Array(Math.ceil(this.frames / fac));
    const tq = (() => { const i = rollen.findIndex(r => r.rolle === 'kick'); return i >= 0 ? i : rollen.findIndex(r => r.rolle === 'drumbus'); })();
    for await (const { pos, n, stuecke } of this._stuecke(0, this.frames, signal)) {
      const sL = new Float32Array(n), sR = new Float32Array(n);
      stuecke.forEach((s, k) => { an[k].feed(pos, s.L, s.R, n); for (let i = 0; i < n; i++) { sL[i] += s.L[i]; sR[i] += s.R[i]; } });
      vLu.feed(sL, sR); vTp.feed(sL, sR); vCl.feed(sL, sR); vKo.feed(sL, sR); vAn.feed(pos, sL, sR);
      const q = tq >= 0 ? stuecke[tq] : { L: sL, R: sR };
      for (let i = 0; i < n; i++) { const j = ((pos + i) / fac) | 0; x12[j] += 0.5 * (q.L[i] + q.R[i]) / fac; }
      onFortschritt?.({ teil: 'anhoeren', anteil: (pos + n) / this.frames }); await pause();
    }
    vTp.ende();
    this.merkmale = an.map(a => a.ende());
    const vm = vAn.ende();
    this.vorher = { lufs: +vLu.integriert().toFixed(2), tp: +vTp.spitzeDb.toFixed(2), spitze: +db(vCl.spitze).toFixed(2), clip: vCl.folgen, lra: +vLu.lra().toFixed(2), korr: +vKo.gesamt.toFixed(3), korrTief: +vKo.tief.toFixed(3), ltasOkt: vm.ltasOkt };
    this.vorher.plr = +(this.vorher.tp - this.vorher.lufs).toFixed(2);
    this.uebersicht = vm.uebersicht;
    let bpm = 120, ts = '4/4';
    try { const r = IMP1.analyse(x12, sr / fac, {}); if (r && r.ok && r.bpm > 40 && r.bpm < 240) { bpm = r.bpm; ts = r.ts || ts; } } catch (e) { /* Tempo bleibt 120 */ }
    this.bpm = bpm; this.ts = ts; this.rollen = rollen.map(r => ({ rolle: r.rolle, hauptsache: !!r.hauptsache, solassen: !!r.solassen, ...(r.aus ? { aus: true } : {}) }));
    this.cache.plan.clear(); this.cache.vm.clear(); this.cache.P.clear();
    // Prüfungen beim Laden, die die ganze Spur brauchen (A.8)
    const H = this.hinweise = (this.hinweise || []).filter(h => h.code === 'kuerzer');
    if (this.merkmale.length > 1 && this.merkmale.every(m => Math.abs(m.spitzeDb) <= 0.05)) H.push({ code: 'normalize', satz: 'Alle Spuren sind auf 0 dB hochgezogen – war „Normalize“ an? Dann stimmen die Verhältnisse nicht. Bitte noch mal exportieren, Normalize aus (Anleitung).' });
    this.merkmale.forEach((m, k) => {
      const nm = this.quellen[k].kopf.name;
      if (!this.quellen[k].kopf.float && m.clipFolgen > 0) H.push({ code: 'spur-uebersteuert', spur: nm, satz: `Spur „${nm}“ war beim Export schon zu laut (${m.clipFolgen} Stellen). Das Mischpult kann das nicht ganz reparieren. In der DAW den Fader dieser Spur −6 dB, dann noch mal.` });
      if (m.aktivitaet < 0.02) H.push({ code: 'fast-still', spur: nm, satz: `Spur „${nm}“ ist fast still – soll sie dabei sein?` });
    });
    if (this.vorher.tp > 0) H.push({ code: 'vorher-ueber-0', satz: 'Deine Spuren zusammen gehen über 0 dB – ohne Begrenzer würde das übersteuern. Das Ergebnis bleibt sicher unter der Grenze.' });
    return { vorher: this.vorher, bpm, ts, merkmale: this.merkmale.map(merkmaleKlein), hinweise: H };
  }

  /** Entscheidung (ms) – je Eingriff zwischengespeichert. */
  plan(eingriff = 'mittel') {
    const key = eingriff + JSON.stringify(this.rollen);
    if (this.cache.plan.has(key)) return this.cache.plan.get(key);
    const spuren = this.quellen.map((q, k) => ({ name: q.kopf.name, ...this.rollen[k] }));
    const plan = entscheide(spuren, this.merkmale, { eingriff, bpm: this.bpm, mixI: this.vorher.lufs });
    // Raum: Nachhall 2 Viertel (0,8–2,5 s), Pre-Delay ≥ 30 ms auf 1/64 bzw. 1/32 Note gerundet, Rückweg 200 Hz–5 kHz
    const viertel = 60 / this.bpm, pd = [viertel / 16, viertel / 8].find(x => x >= 0.03) || viertel / 8;
    plan.raum = { rt60S: Math.max(0.8, Math.min(2.5, 2 * viertel)), predelayMs: +(pd * 1000).toFixed(1), tpHz: 5000 };
    const sendNoetig = plan.spuren.some(ps => ps.send);
    const G = sendNoetig ? Raum.kalibrierung(this.sr, plan.raum) : 0;
    plan.spuren.forEach((ps, k) => {
      if (!ps.send) return;
      const lt = this.merkmale[k].ltasTerz; let a = 0, b = 0; lt.forEach((v, i) => { const p = Math.pow(10, v / 10); b += p; if (i >= TERZ_BAND[0] && i <= TERZ_BAND[1]) a += p; });
      ps.sendDb = +sendDbFuer(ps.send.zielLu, G, pdb(a / b)).toFixed(1); ps.send.raumGewinnDb = +G.toFixed(2);
    });
    plan.spuren.forEach((ps, k) => { if (this.rollen[k] && this.rollen[k].aus) ps.aus = true; }); // „nicht dabei“ (Oberfläche): Spur fällt aus der Summe
    plan.bpm = this.bpm; plan.ts = this.ts;
    this.cache.plan.set(key, plan); return plan;
  }

  /** Durchlauf 2 „Platz schaffen“: Vormischung (Plan der Stufe) → Pre-Master-Skalierung, Terz-/Oktav-LTAS, Glue-Pegel; Vormischung im Speicher (oder später neu rechnen). */
  async vormische(eingriff = 'mittel', { onFortschritt, signal, speicher } = {}) {
    const key = eingriff + JSON.stringify(this.rollen);
    if (this.cache.vm.has(key)) return this.cache.vm.get(key);
    const sr = this.sr, plan = this.plan(eingriff), mix = new Mischer(sr, plan, { pre: 1 });
    const an = new SpurAnalyse(sr, this.frames), hp = new Bq2(bqKoeff('hp', 80, sr)), blk = Math.round(sr / 10);
    let q = 0, c = 0; const rms = [];
    const imSpeicher = !speicher && this.frames * 8 / 1048576 <= this.maxMB, teile = [];
    for await (const { pos, n, stuecke } of this._stuecke(0, this.frames, signal)) {
      const { vL, vR } = mix.stueck(pos, stuecke, n);
      an.feed(pos, vL, vR, n);
      const a = Float32Array.from(vL), b = Float32Array.from(vR);
      if (imSpeicher) teile.push({ pos, L: a, R: b }); else if (speicher) await speicher.schreib(pos, a, b);
      const hl = Float32Array.from(vL), hr = Float32Array.from(vR); hp.run(hl, hr, n);
      for (let i = 0; i < n; i++) { q += 0.5 * (hl[i] * hl[i] + hr[i] * hr[i]); if (++c === blk) { rms.push(q / blk); q = 0; c = 0; } }
      onFortschritt?.({ teil: 'platz', anteil: (pos + n) / this.frames }); await pause();
    }
    const m = an.ende(), I = m.I, mx = maxA(rms, 1e-20), akt = rms.filter(x => x > mx * 1e-3).map(pdb).sort((a, b) => a - b);
    const p90 = akt.length ? akt[Math.floor(0.9 * (akt.length - 1))] : -30;
    const preDb = Math.min(-18 - I, -6 - m.spitzeDb);
    const vm = { sr, eingriff, plan, preDb: +preDb.toFixed(3), pre: lin(preDb), I: I + preDb, Iroh: I, spitzeRoh: m.spitzeDb, ltasOkt: m.ltasOkt.map(x => x + preDb), korrTief: m.korrTief, glueP90Db: p90 + preDb, teile: imSpeicher ? teile : null, speicher: speicher || null };
    while (this.cache.vm.size >= 1) { const k0 = this.cache.vm.keys().next().value; this.cache.vm.get(k0).teile = null; this.cache.vm.delete(k0); } // Speicher: höchstens 1 Vormischung (je 8 B/Probe)
    this.cache.vm.set(key, vm); return vm;
  }
  async *_vormischStrom(vm, signal) {
    const g = vm.pre;
    if (vm.teile) { for (const t of vm.teile) { abbruch(signal); const L = Float32Array.from(t.L), R = Float32Array.from(t.R); for (let i = 0; i < L.length; i++) { L[i] *= g; R[i] *= g; } yield { pos: t.pos, L, R }; } return; }
    if (vm.speicher) { for await (const t of vm.speicher.lies(this.stueck)) { abbruch(signal); const L = Float32Array.from(t.L), R = Float32Array.from(t.R); for (let i = 0; i < L.length; i++) { L[i] *= g; R[i] *= g; } yield { pos: t.pos, L, R }; } return; }
    const mix = new Mischer(this.sr, vm.plan, { pre: g });
    for await (const { pos, n, stuecke } of this._stuecke(0, this.frames, signal)) { const { vL, vR } = mix.stueck(pos, stuecke, n); yield { pos, L: Float32Array.from(vL), R: Float32Array.from(vR) }; }
  }
  /** Master über die Vormischung rechnen und messen (nur Voll). → {I, tp, stats} */
  async _masterMessung(vm, P, signal) {
    const k = new MasterKette(this.sr, P), lu = new Lautheit(this.sr), tp = new TruePeak(this.sr, 4); let skip = k.latenz;
    const nimm = (L, R) => { let a = 0; if (skip > 0) { a = Math.min(skip, L.length); skip -= a; } if (a < L.length) { const l = L.subarray(a), r = R.subarray(a); lu.feed(l, r); tp.feed(l, r); } };
    for await (const t of this._vormischStrom(vm, signal)) { k.process(t.L, t.R, null, null, t.L.length); nimm(t.L, t.R); await pause(); }
    const z = new Float32Array(k.latenz), z2 = new Float32Array(k.latenz); k.process(z, z2, null, null, k.latenz); nimm(z, z2); tp.ende();
    return { I: lu.integriert(), tp: tp.spitzeDb, stats: k.stats() };
  }
  /** Durchlauf 3 „Master einstellen“: Plan P + Gain-Sekante bis |I − Ziel| ≤ 0,2 LU (höchstens 4 Läufe). */
  async nachmesse(eingriff = 'mittel', ziel = 'streaming', { onFortschritt, signal } = {}) {
    const al = this.album || null, key = eingriff + ziel + JSON.stringify(this.rollen) + (al ? JSON.stringify(al) : '');
    if (this.cache.P.has(key)) return this.cache.P.get(key);
    const vm = await this.vormische(eingriff, { signal }), P = planeMaster(vm, { ziel, eingriff, albumKurve: al?.kurve10 || null });
    const Z = { ...ZIELE[ziel], lufs: ZIELE[ziel].lufs + (al?.versatzLu || 0) };   // Album: ruhiger Song bleibt um versatzLu leiser
    if (al) P.album = { kurve: !!al.kurve10, versatzLu: al.versatzLu || 0 };
    let g0 = P.gainDb, m0 = await this._masterMessung(vm, P, signal), laeufe = 1;
    onFortschritt?.({ teil: 'master', anteil: 0.3 });
    let g1 = g0 + (Z.lufs - m0.I), m1 = m0;
    while (Math.abs(m1.I - Z.lufs) > 0.2 && laeufe < 5) {
      P.gainDb = g1; m1 = await this._masterMessung(vm, P, signal); laeufe++;
      onFortschritt?.({ teil: 'master', anteil: Math.min(0.95, 0.3 + 0.2 * laeufe) });
      if (Math.abs(m1.I - Z.lufs) <= 0.2) break;
      const steig = Math.max(0.2, Math.min(1.2, (m1.I - m0.I) / ((g1 - g0) || 1e-6)));
      const g2 = g1 + (Z.lufs - m1.I) / steig; g0 = g1; m0 = m1; g1 = g2;
    }
    P.gainDb = +g1.toFixed(4); P.nachgemessen = { I: +m1.I.toFixed(2), tp: +m1.tp.toFixed(2), laeufe, ...m1.stats };
    onFortschritt?.({ teil: 'master', anteil: 1 });
    this.cache.P.set(key, P); return P;
  }
  /** Schritt 3 in einem: Analyse (falls nötig) → Vormischung → Master-Plan + Nachmessen. */
  async mischenUndMastern({ rollen, eingriff = 'mittel', ziel = 'streaming', onFortschritt, signal } = {}) {
    if (rollen || !this.merkmale) await this.analysiere(rollen || this.rollen, { onFortschritt, signal });
    await this.vormische(eingriff, { onFortschritt, signal });
    const P = await this.nachmesse(eingriff, ziel, { onFortschritt, signal });
    return this.zusammenfassung(eingriff, ziel, P);
  }
  zusammenfassung(eingriff, ziel, P) {
    const plan = this.plan(eingriff);
    return {
      song: this.song, sr: this.sr, laengeS: +(this.frames / this.sr).toFixed(2), bpm: this.bpm, ts: this.ts, eingriff, ziel, vorher: this.vorher,
      schaetzung: { lufs: P.nachgemessen?.I, tp: P.nachgemessen?.tp },
      spuren: plan.spuren.map(ps => ({ name: ps.name, rolle: ps.rolle, texte: ps.texte, pegelDb: ps.pegelDb, solassen: ps.solassen, hauptsache: ps.hauptsache })),
      master: { gainDb: P.gainDb, klang: P.klang, monoBassHz: P.monoBassHz, softclip: P.softclip, ceilingDbtp: P.ceilingDbtp, glue: P.glue, nachgemessen: P.nachgemessen },
      hinweise: this.hinweise,
    };
  }

  /**
   * Durchlauf 4 „Schreiben“: Stems → Spuren → Voll + Instrumental → Master-Kette (gleiche Gain-Kurven) → WAV 24 Bit + Endprüfung.
   * Bei Spitze über der Grenze: Grenze um Überschuss + 0,1 dB senken, neu (≤ 2×).
   * → {master:{name, blob, crc, size}, instr:{…}, rezept:{name, text, json}, messung, zip()}
   */
  async schreibe({ eingriff = 'mittel', ziel = 'streaming', song = this.song, zaehler = 1, onFortschritt, signal, senken = {} } = {}) {
    const sr = this.sr, plan = this.plan(eingriff), vm = await this.vormische(eingriff, { signal });
    const P = JSON.parse(JSON.stringify(await this.nachmesse(eingriff, ziel, { signal })));
    const Z = { ...ZIELE[ziel], lufs: ZIELE[ziel].lufs + (this.album?.versatzLu || 0) }; let erg;
    // Master und Instrumental teilen sich den Limiter (beide Detektoren, kleinere Verstärkung) – ein Überschuss wird für beide
    // gemeinsam nachgeführt. Gemessen wird genau (8×, 32 Abgriffe). Höchstens 3 Läufe.
    for (let versuch = 0; versuch < 3; versuch++) {
      erg = await this._rendere(plan, vm, P, { signal, onFortschritt, senken, versuch });
      if (erg.m.tp <= Z.tp_dbtp + 1e-9 && erg.i.tp <= Z.tp_dbtp + 1e-9) break;
      const ueber = Math.max(erg.m.tp, erg.i.tp) - Z.tp_dbtp; P.ceilingDbtp = +(P.ceilingDbtp - ueber - 0.05).toFixed(2); P.ceilingNachgefuehrt = (P.ceilingNachgefuehrt || 0) + 1;
    }
    const suf = zaehler > 1 ? '-' + zaehler : '';
    const nachher = { lufs: +erg.m.lufs.toFixed(2), tp: +erg.m.tp.toFixed(2), lra: +erg.m.lra.toFixed(2), plr: +(erg.m.tp - erg.m.lufs).toFixed(2), clip: erg.m.clip, korr: +erg.m.korr.toFixed(3), korrTief: +erg.m.korrTief.toFixed(3), monoVerlust: +erg.m.monoVerlust.toFixed(2), lrBalance: +erg.m.lrBalance.toFixed(2), dc: erg.m.dc, ltasOkt: erg.m.ltasOkt, ...erg.stats };
    const messung = { vorher: this.vorher, nachher, instrumental: { lufs: +erg.i.lufs.toFixed(2), tp: +erg.i.tp.toFixed(2), clip: erg.i.clip, gleichWieMaster: !plan.spuren.some(ps => GESANG.has(ps.rolle)) },
      klangAbstand: { vorher: +klangAbstand(this.vorher.ltasOkt).toFixed(2), nachher: +klangAbstand(erg.m.ltasOkt).toFixed(2) } };
    const pruefung = ampel(nachher, Z);
    const json = rezeptJson({ projekt: this, plan, P, messung, pruefung, eingriff, ziel, song, version: VERSION });
    const text = rezeptText(json);
    const master = { name: `${song}-Master${suf}.wav`, ...erg.master }, instr = { name: `${song}-Instrumental${suf}.wav`, ...erg.instr };
    const rz = textEintrag(`${song}-Mischrezept${suf}.txt`, text), rj = textEintrag('mischrezept.json', JSON.stringify(json, null, 1), 'application/json');
    return {
      master, instr, rezept: { name: rz.name, text, json, blob: rz.blob, crc: rz.crc, size: rz.size }, messung, pruefung, P,
      zip: () => ({ name: `${song}-Mischpult${suf}.zip`, blob: zipAusBlobs([master, instr, rz, rj]) }),
    };
  }
  async _rendere(plan, vm, P, { signal, onFortschritt, senken, versuch }) {
    const sr = this.sr, mix = new Mischer(sr, plan, { pre: vm.pre }), k = new MasterKette(sr, P);
    const mitGesang = plan.spuren.some(ps => GESANG.has(ps.rolle) && !ps.aus);   // ohne Gesang ist das Instrumental der Master selbst
    const wM = new WavSchreiber24(sr, this.frames, { seed: 1, senke: senken.master?.(versuch) }), wI = mitGesang ? new WavSchreiber24(sr, this.frames, { seed: 2, senke: senken.instr?.(versuch) }) : null;
    const mLu = new Lautheit(sr), mTp = new TruePeak(sr, 8), mCl = new ClipZaehler(), mKo = new Korrelation(sr), mMo = new Lautheit(sr), mAn = new SpurAnalyse(sr, this.frames);
    const iLu = new Lautheit(sr), iTp = new TruePeak(sr, 8), iCl = new ClipZaehler();
    let skip = k.latenz, aus = 0;
    const nimm = (vL, vR, iL, iR) => {
      let a = 0; if (skip > 0) { a = Math.min(skip, vL.length); skip -= a; }
      if (a >= vL.length) return;
      const l = vL.subarray(a), r = vR.subarray(a), il = iL ? iL.subarray(a) : l, ir = iR ? iR.subarray(a) : r;
      wM.schreib(l, r); wI?.schreib(il, ir);
      mLu.feed(l, r); mTp.feed(l, r); mCl.feed(l, r); mKo.feed(l, r); mAn.feed(aus, l, r);
      const mo = new Float32Array(l.length); for (let i = 0; i < l.length; i++) mo[i] = 0.5 * (l[i] + r[i]); mMo.feed(mo, mo);
      if (wI) { iLu.feed(il, ir); iTp.feed(il, ir); iCl.feed(il, ir); } aus += l.length;
    };
    for await (const { pos, n, stuecke } of this._stuecke(0, this.frames, signal)) {
      const { vL, vR, iL, iR } = mix.stueck(pos, stuecke, n);
      if (mitGesang) { k.process(vL, vR, iL, iR, n); nimm(vL, vR, iL, iR); } else { k.process(vL, vR, null, null, n); nimm(vL, vR, null, null); }
      onFortschritt?.({ teil: 'schreiben', anteil: (pos + n) / this.frames }); await pause();
    }
    const D = k.latenz, z = [new Float32Array(D), new Float32Array(D), new Float32Array(D), new Float32Array(D)];
    if (mitGesang) { k.process(z[0], z[1], z[2], z[3], D); nimm(z[0], z[1], z[2], z[3]); } else { k.process(z[0], z[1], null, null, D); nimm(z[0], z[1], null, null); }
    mTp.ende(); iTp.ende();
    const lufs = mLu.integriert(), mA = mAn.ende(), master = await wM.fertig();
    return {
      master, instr: wI ? await wI.fertig() : master, stats: k.stats(),
      m: { lufs, tp: mTp.spitzeDb, lra: mLu.lra(), clip: mCl.folgen, korr: mKo.gesamt, korrTief: mKo.tief, monoVerlust: mMo.integriert() - lufs, lrBalance: mCl.lrBalanceDb, dc: +mCl.dc.toExponential(2), ltasOkt: mA.ltasOkt },
      i: wI ? { lufs: iLu.integriert(), tp: iTp.spitzeDb, clip: iCl.folgen } : { lufs, tp: mTp.spitzeDb, clip: mCl.folgen },
    };
  }
}

/** Einzelne fertige Datei prüfen (A.7.1): Lautheit, Spitze 8×, Übersteuerung, LRA, PLR – stückweise. */
export async function pruefeDatei(file, { ziel = 'streaming', onFortschritt, signal } = {}) {
  const kopf = await lesKopf(file), sr = kopf.sr;
  const lu = new Lautheit(sr), tp = new TruePeak(sr, 8), cl = new ClipZaehler(), ko = new Korrelation(sr), an = new SpurAnalyse(sr, kopf.frames);
  for await (const s of lesStuecke(file, kopf)) { abbruch(signal); lu.feed(s.L, s.R); tp.feed(s.L, s.R); cl.feed(s.L, s.R); ko.feed(s.L, s.R); an.feed(s.pos, s.L, s.R); onFortschritt?.({ teil: 'pruefen', anteil: (s.pos + s.L.length) / kopf.frames }); await pause(); }
  tp.ende(); const m = an.ende();
  const mess = { lufs: +lu.integriert().toFixed(2), tp: +tp.spitzeDb.toFixed(2), clip: kopf.float ? 0 : cl.folgen, lra: +lu.lra().toFixed(2), korr: +ko.gesamt.toFixed(3), korrTief: +ko.tief.toFixed(3), lrBalance: +cl.lrBalanceDb.toFixed(2), dc: cl.dc, spitze: +db(cl.spitze).toFixed(2), ltasOkt: m.ltasOkt };
  mess.plr = +(mess.tp - mess.lufs).toFixed(2);
  const saetze = [];
  if (mess.tp > -0.5) saetze.push(`Spitze ${mess.tp > 0 ? '+' : ''}${mess.tp.toFixed(1).replace('.', ',')} dB: Diese Datei reicht bis an 0 dB oder darüber. So eine Datei zeigt die Videoschnitt-App als Rot, und beim Video-Export kann es verzerren.`);
  return { name: kopf.name, sr, laengeS: +(kopf.frames / sr).toFixed(2), messung: mess, pruefung: ampel(mess, ZIELE[ziel]), saetze, uebersicht: m.uebersicht };
}

/** Vorher-Summe als WAV (Abhören „Vorher“ / Rückfall mit <audio>): Summe der Stems, nur so weit gesenkt, dass nichts abgeschnitten wird. → {blob, gainDb} */
Projekt.prototype.vorherWav = async function ({ signal, onFortschritt } = {}) {
  const sp = this.vorher ? this.vorher.spitze : 0, gainDb = sp > -0.1 ? -(sp + 0.1) : 0, g = lin(gainDb);
  const w = new WavSchreiber24(this.sr, this.frames, { seed: 3 });
  for await (const { pos, n, stuecke } of this._stuecke(0, this.frames, signal)) {
    const L = new Float32Array(n), R = new Float32Array(n);
    for (const s of stuecke) for (let i = 0; i < n; i++) { L[i] += s.L[i] * g; R[i] += s.R[i] * g; }
    w.schreib(L, R); onFortschritt?.({ teil: 'vorher', anteil: (pos + n) / this.frames }); await pause();
  }
  const r = await w.fertig(); return { name: `${this.song}-Vorher.wav`, ...r, gainDb: +gainDb.toFixed(2) };
};
