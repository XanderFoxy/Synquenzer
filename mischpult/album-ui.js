// Mischpult 0.1 – Album-Modus (KONZEPT B). Wird erst beim Antippen von „Album“ geladen.
// Gespeichert werden je Song nur Merkmale und Plan (IndexedDB), nie Audio. Ziel und Eingriff gelten fürs ganze Album.
import { S, A, SEG, $, seite, seg, esc, zahl, ico, idb, kern, sag, balken, setzeBalken, waehle, hoeren, start, blatt, lade, fehler, groesse, ZIELE, EINGRIFF, ACC, wach, songVerlassen } from './ui.js';

export async function album() { await liste(); }
async function liste() {
  const alben = ((await idb('alben', 'alle')) || []).sort((a, b) => b.erstellt - a.erstellt);
  S.album = null; S.zeige = liste;
  seite({ titel: 'Album', zurueck: start, inhalt: `<p class="ruhig">Mehrere Songs bekommen denselben Klang und dieselbe Lautheit. Gespeichert werden nur kleine Merkmale, kein Audio.</p>
<label class="feld"><span>Neues Album</span><input type="text" id="albumname" placeholder="Name des Albums" autocomplete="off"></label>
${alben.length ? `<h2>Deine Alben</h2><div class="wege">${alben.map((a) => `<button type="button" class="weg" data-a="albumauf" data-id="${esc(a.id)}">${ico('album')}<span>${esc(a.name)}<small>${a.songIds.length} ${a.songIds.length === 1 ? 'Song' : 'Songs'}</small></span></button>`).join('')}</div>` : ''}`,
  fuss: `<button type="button" class="knopf1" data-a="albumneu">${ico('plus')}Album anlegen</button>` });
}
A.albumneu = async () => {
  const al = { id: 'album-' + Date.now().toString(36), name: $('#albumname')?.value.trim() || 'Mein Album', songIds: [], ziel: 'streaming', eingriff: 'mittel', bezug: null, ruhig: [], kurve10: null, erstellt: Date.now() };
  await idb('alben', 'put', al); await auf(al.id); sag('Album angelegt.');
};
A.albumauf = (b) => auf(b.dataset.id);
async function auf(id) {
  const al = await idb('alben', 'get', id); if (!al) return liste();
  S.album = { al, ang: null, waehle: (fs) => waehle(fs), nachSong, zurueck: uebersicht };
  await uebersicht();
}
const merke = () => idb('alben', 'put', S.album.al);
async function nachSong(id) {
  const al = S.album.al; if (!al.songIds.includes(id)) al.songIds.push(id);
  S.album.ang = null; await merke(); await uebersicht(); sag('Song ist im Album.');
}
async function songsLaden() { return (await Promise.all(S.album.al.songIds.map((id) => idb('songs', 'get', id)))).filter(Boolean); }
async function uebersicht() {
  if (!S.album) return liste();
  S.abh?.schliesse?.(); S.abh = null;
  const al = S.album.al, songs = await songsLaden(), ang = S.album.ang, alle = ((await idb('songs', 'alle')) || []).filter((x) => !al.songIds.includes(x.id) && x.merkmale);
  S.zeige = uebersicht;
  const zeile = (s, i) => {
    const x = ang?.songs.find((y) => y.id === s.id), da = !!S.songs[s.id], g = S.album.gemessen?.[s.id];
    // Prüfer-Befund 0.1: hier steht nur, was geplant ist (Ziel) – gemessene Werte erst nach dem Speichern.
    const text = g ? `gemessen: Lautheit ${zahl(g.lufs)} · Spitze ${zahl(g.tp, 1, true)} dB` : x ? `Ziel: Lautheit ${zahl(x.lufs)}${al.ruhig.includes(s.id) ? ' (ruhiger Song)' : ''} · Klang-Abstand jetzt ${zahl(x.vorher)} dB` : 'bereit';
    return `<li class="spur"><div class="sp-text"><span class="sp-name">${i + 1}. ${esc(s.name)}</span><span class="klein2">${text}${da ? '' : ' · Spuren noch einmal wählen'}</span>
${x ? `<span class="bahn" aria-hidden="true"><i class="f ge" style="width:${Math.min(100, x.vorher * 12)}%"></i></span>` : ''}</div>
<div class="sp-knoepfe"><button type="button" class="tg" data-a="bezug" data-id="${esc(s.id)}" aria-pressed="${al.bezug === s.id}" aria-label="Bezugs-Song" title="Bezugs-Song">${ico('stern')}</button><button type="button" class="tg" data-a="ruhig" data-id="${esc(s.id)}" aria-pressed="${al.ruhig.includes(s.id)}" aria-label="Ruhiger Song" title="Ruhiger Song">${ico('mond')}</button></div>
<div class="zeile ganz"><button type="button" class="knopf2" data-a="albumhoeren" data-id="${esc(s.id)}">${ico('play')}Anhören</button><button type="button" class="knopf2" data-a="albumraus" data-id="${esc(s.id)}" aria-label="${esc(s.name)} aus dem Album nehmen">${ico('zu')}Herausnehmen</button></div></li>`;
  };
  seite({ titel: esc(al.name), zurueck: liste, inhalt: `<p class="klein2">Songs hinzufügen → Album angleichen → Anhören → Album speichern</p>
<h2>Ziel fürs ganze Album</h2>${seg('aziel', ZIELE, al.ziel, 'Ziel fürs ganze Album')}<h2>Eingriff fürs ganze Album</h2>${seg('aeingriff', EINGRIFF, al.eingriff, 'Eingriff fürs ganze Album')}
<h2>Songs</h2>${songs.length ? `<ul class="liste">${songs.map(zeile).join('')}</ul><p class="klein2">${ico('stern')} Bezugs-Song: klingt so, wie das Album klingen soll. ${ico('mond')} Ruhiger Song: bleibt etwas leiser.</p>` : '<p class="ruhig">Noch keine Songs. Für jeden Song: Spuren wählen, Rollen prüfen, Mischen &amp; Mastern.</p>'}
<input type="file" id="wahl" class="sr-datei" multiple accept="${ACC}"><label for="wahl" class="knopf2 breit">${ico('plus')}Song hinzufügen</label>
${alle.length ? `<h2>Schon gemischte Songs</h2><div class="wege">${alle.map((x) => `<button type="button" class="weg" data-a="albumdazu" data-id="${esc(x.id)}">${ico('plus')}<span>${esc(x.name)}<small>Diesen Song zum Album</small></span></button>`).join('')}</div>` : ''}
${ang ? `<div class="karte"><p><span class="punkt gr" aria-hidden="true"></span>Plan steht. Beim Speichern bekommt jeder Song die Album-Kurve (höchstens ±2 dB je Band) und sein Lautheits-Ziel. Danach siehst du hier die gemessenen Werte.</p></div>` : ''}`,
  fuss: songs.length < 2 ? '<p class="klein2">Ab 2 Songs kannst du das Album angleichen.</p>' : ang ? `<button type="button" class="knopf1" data-a="albumspeichern">${ico('teilen')}Album speichern</button><p class="klein2">Nichts wird überschrieben.</p>` : `<button type="button" class="knopf1" data-a="angleichen">${ico('regler')}Album angleichen</button>` });
}
SEG.aziel = async (v) => { S.album.al.ziel = v; S.album.ang = null; await merke(); uebersicht(); };
SEG.aeingriff = async (v) => { S.album.al.eingriff = v; S.album.ang = null; await merke(); uebersicht(); };
A.bezug = async (b) => { const al = S.album.al; al.bezug = al.bezug === b.dataset.id ? null : b.dataset.id; S.album.ang = null; await merke(); uebersicht(); };
A.ruhig = async (b) => { const al = S.album.al, id = b.dataset.id; al.ruhig = al.ruhig.includes(id) ? al.ruhig.filter((x) => x !== id) : [...al.ruhig, id]; S.album.ang = null; await merke(); uebersicht(); };
A.albumdazu = (b) => nachSong(b.dataset.id);
A.albumraus = async (b) => { const al = S.album.al; al.songIds = al.songIds.filter((x) => x !== b.dataset.id); if (al.bezug === b.dataset.id) al.bezug = null; S.album.ang = null; await merke(); uebersicht(); sag('Aus dem Album genommen. Der Song selbst bleibt gespeichert.'); };
A.angleichen = async () => {
  const al = S.album.al, songs = await songsLaden(), K = await kern(); S.album.gemessen = null;
  S.album.ang = K.albumAngleichen(songs.map((s) => ({ id: s.id, name: s.name, merkmale: s.merkmale })), { ziel: al.ziel, eingriff: al.eingriff, bezug: al.bezug, ruhig: al.ruhig });
  al.kurve10 = S.album.ang.kurve; await merke(); await uebersicht(); sag('Album angeglichen.');
};
A.albumhoeren = (b) => {
  const x = S.songs[b.dataset.id];
  if (!x) return blatt(`<h2>Spuren noch einmal wählen</h2><p>Für diesen Song sind die Dateien nicht mehr geöffnet. Bitte die Spuren noch einmal wählen – deine Einstellungen sind dann wieder da.</p><input type="file" id="wahl" class="sr-datei" multiple accept="${ACC}"><label for="wahl" class="knopf1">${ico('plus')}Spuren wählen</label><button type="button" class="knopf2 breit" data-a="blattzu">Schließen</button>`);
  const al = S.album.al, alb = albumAuswahl(al, x.id);
  if (S.erg && S.erg !== x.erg) songVerlassen();
  Object.assign(S, { sitzung: x.sitzung, erg: x.erg, a: { ...x.a, ziel: al.ziel, eingriff: al.eingriff, ...(alb ? { album: alb } : {}) }, songId: x.id, verlauf: [], anfang: { ...x.a }, stellung: 'nachher', solo: null, stumm: new Set(), pos: 0 });
  S.abh?.schliesse?.(); S.abh = null;
  if (x.erg.frei) { seite({ titel: 'Song wird vorbereitet …', inhalt: `<p class="ruhig">Die Vorher-Fassung wird kurz neu gerechnet.</p>${balken('Vorbereiten')}` }); x.erg.wieder({ fortschritt: setzeBalken }).then(hoeren, fehler); } else hoeren();
};
A.albumspeichern = async () => {
  const al = S.album.al, songs = await songsLaden(), K = await kern(), da = songs.filter((s) => S.songs[s.id]), fehlt = songs.filter((s) => !S.songs[s.id]);
  seite({ titel: 'Album speichern', inhalt: `<p class="hinweis">Bitte die Seite offen lassen, bis der Balken voll ist.</p><p class="ruhig" id="songnr"></p>${balken('Album speichern')}`, fuss: '<button type="button" class="knopf2 breit" data-a="abbrechen">Abbrechen</button>' });
  const ab = new AbortController(); S.job = ab; wach(true); const dateien = [], gemessen = {};
  try {
    for (let i = 0; i < da.length; i++) {
      const s = da[i], x = S.songs[s.id], n = (s.zaehler || 0) + 1, b = (s.name || 'Song').replace(/[\\/:*?"<>|]+/g, '-'), z = n > 1 ? '-' + n : '';
      $('#songnr').textContent = `Song ${i + 1} von ${da.length}: ${s.name}`;
      const alb = albumAuswahl(al, s.id);
      const r = await K.speichere(x.sitzung, x.erg, { ...x.a, ziel: al.ziel, eingriff: al.eingriff, ...(alb ? { album: alb } : {}) }, { namen: { master: `${b}-Master${z}.wav`, instr: `${b}-Instrumental${z}.wav`, rezept: `${b}-Mischrezept${z}.txt` }, signal: ab.signal, fortschritt: (p) => setzeBalken((i + p) / da.length) });
      gemessen[s.id] = { lufs: r.messung.lufs, tp: r.messung.tp, ltas10: r.messung.ltas10 };
      if (x.erg !== S.erg) x.erg.freigeben?.();   // Speicher: nur die fertigen Dateien bleiben, die Abhör-Fassungen nicht
      await idb('songs', 'put', { ...s, zaehler: n }); dateien.push(...r.dateien);
    }
    S.album.gemessen = gemessen;
    dateien.push({ name: 'Album-Bericht.html', blob: new Blob([K.albumBericht(al, songs, S.album.ang, gemessen)], { type: 'text/html' }), typ: 'text/html' });
    S.album.fertig = { dateien, zip: null };
    seite({ titel: 'Album gespeichert', zurueck: uebersicht, inhalt: `${fehlt.length ? fehlt.map((s) => `<p class="hinweis">Song „${esc(s.name)}“: bitte die Spuren noch einmal wählen.</p>`).join('') : '<div class="karte"><p><span class="punkt gr" aria-hidden="true"></span>Alle Songs sind fertig.</p></div>'}
<ul class="dateien">${dateien.map((d) => `<li>${ico('datei')}<span>${esc(d.name)}</span><small>${groesse(d.blob.size)}</small></li>`).join('')}</ul><p class="klein2" id="linkzeile"></p>`,
    fuss: `<button type="button" class="knopf1" data-a="albumzip">${ico('teilen')}Album sichern (ZIP)</button>` });
  } catch (f) { if (ab.signal.aborted) uebersicht(); else fehler(f); } finally { S.job = null; wach(false); }
};
/** Album-Einstellung für einen Song: gemeinsame Kurve + Lautheits-Versatz (ruhiger Song −3 LU). */
function albumAuswahl(al, id) { if (!al.kurve10 && !al.ruhig.includes(id)) return null; return { kurve10: al.kurve10 || null, versatzLu: al.ruhig.includes(id) ? -3 : 0 }; }
A.albumzip = async () => { const f = S.album.fertig, K = await kern(); f.zip ||= await K.zip(f.dateien); lade(f.zip, (S.album.al.name || 'Album').replace(/[\\/:*?"<>|]+/g, '-') + '-Album.zip'); };
