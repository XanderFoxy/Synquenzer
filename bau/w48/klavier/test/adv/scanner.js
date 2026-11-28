
(function () {
  'use strict';

  /* ---------- kleine Helfer ---------- */
  var $ = function (s) { return document.querySelector(s); };
  function kinder(el, n) { if (!el) return []; var r = []; for (var i = 0; i < el.children.length; i++) if (el.children[i].nodeName === n) r.push(el.children[i]); return r; }
  function kind(el, n) { return kinder(el, n)[0] || null; }
  function txt(el, n) { var k = kind(el, n); return k ? k.textContent.trim() : ''; }
  function zahl(el, n, d) { var v = parseFloat(txt(el, n)); return isFinite(v) ? v : d; }
  function summe(s) { var t = 0; String(s || '').split('+').forEach(function (x) { var v = parseInt(x, 10); if (v > 0) t += v; }); return t; }
  function h(tag, cls, text) { var e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; }
  function svgIcon(d, vb) { var ns = 'http://www.w3.org/2000/svg'; var s = document.createElementNS(ns, 'svg'); s.setAttribute('viewBox', vb || '0 0 16 16'); s.setAttribute('aria-hidden', 'true'); var p = document.createElementNS(ns, 'path'); p.setAttribute('class', 'k'); p.setAttribute('d', d); s.appendChild(p); return s; }
  function lies(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function schreib(k, v) { try { if (v == null) localStorage.removeItem(k); else localStorage.setItem(k, v); } catch (e) { /* egal */ } }
  var bewegungAus = false; try { bewegungAus = matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) { }

  var MAX_SEITEN = 20, LANGE_KANTE = 1600, SPEICHER = 'notenscanner.letztes', NAMEN_KEY = 'notenscanner.namen';
  var XML_KOPF = '<?xml version="1.0" encoding="UTF-8" standalone="no"?>\n<!DOCTYPE score-partwise PUBLIC "-//Recordare//DTD MusicXML 4.0 Partwise//EN" "http://www.musicxml.org/dtds/partwise.dtd">\n';

  var S = {
    seiten: [], laufzeit: 'pruefe', sample: null, downloads: null, bildOk: false, tiers: null, maxBytes: 0,
    gesperrt: '', laeuft: false, ctl: null, stopp: false, uhr: 0,
    ergebnis: null, namen: lies(NAMEN_KEY) === 'int' ? 'int' : 'de', tempo: 90, tempoEigen: false, nameEigen: false
  };
  var naechsteId = 1;

  /* ---------- Toast ---------- */
  var toastZeit = 0;
  function toast(t) { var el = $('#toast'); el.textContent = t; el.hidden = false; el.style.animation = 'none'; void el.offsetWidth; el.style.animation = ''; clearTimeout(toastZeit); toastZeit = setTimeout(function () { el.hidden = true; }, 3600); }

  /* ---------- Laufzeit ---------- */
  function hinweis(t) { $('#laufzeitText').textContent = t || ''; $('#laufzeitHinweis').hidden = !t; }
  function starte() {
    var c = window.claude;
    var hatClaude = !!(c && typeof c.use === 'function');
    if (!hatClaude) { S.laufzeit = 'lokal'; zeigeLaufzeit(); return; }
    S.laufzeit = 'pruefe'; zeigeLaufzeit();
    Promise.all([
      Promise.resolve().then(function () { return c.use('sample'); }).catch(function () { return null; }),
      Promise.resolve().then(function () { return c.use('downloads'); }).catch(function () { return null; })
    ]).then(function (r) {
      S.sample = r[0] || null; S.downloads = r[1] || null;
      if (!S.sample) return null;
      return Promise.resolve().then(function () { return S.sample.limits(); }).then(function (lim) {
        S.bildOk = !!(lim && lim.images); S.tiers = (lim && lim.modelTiers) || null; S.maxBytes = (lim && lim.images && lim.images.maxInputBytes) || 0;
      }).catch(function () { S.bildOk = false; });
    }).then(function () { S.laufzeit = 'da'; zeigeLaufzeit(); });
  }
  function erkennungMoeglich() { return S.laufzeit === 'da' && !!S.sample && S.bildOk && !S.gesperrt; }
  var SPERR_TEXT = {
    not_granted: 'Du hast der Seite die Nutzung von Claude nicht erlaubt. Die Erkennung bleibt aus, bis du die Seite neu öffnest.',
    sampling_disabled: 'Claude ist für dieses Konto gerade nicht verfügbar. Die Erkennung bleibt aus.',
    images_unavailable: 'In dieser Ansicht können keine Bilder an Claude geschickt werden. Die Erkennung bleibt aus.'
  };
  function zeigeLaufzeit() {
    var t = '';
    if (S.laufzeit === 'lokal') t = 'Lokal geöffnet: Die Erkennung läuft nur, wenn die Seite in Claude geöffnet ist. Das Beispiel und das Speichern funktionieren auch hier.';
    else if (S.laufzeit === 'da' && !S.sample) t = 'Die Erkennung ist in dieser Ansicht nicht verfügbar. Öffne die Seite in Claude (angemeldet), um Noten zu erkennen.';
    else if (S.laufzeit === 'da' && !S.bildOk) t = SPERR_TEXT.images_unavailable;
    else if (S.gesperrt) t = SPERR_TEXT[S.gesperrt] || 'Die Erkennung ist in dieser Ansicht nicht verfügbar.';
    hinweis(t);
    zeigeSchritt2(); zeigeSeiten(); zeigeSpeichern();
  }

  /* ---------- Bilder vorbereiten ---------- */
  function bereiteBild(file) {
    return new Promise(function (res, rej) {
      var url = URL.createObjectURL(file); var img = new Image();
      img.onload = function () {
        try {
          var w = img.naturalWidth, hh = img.naturalHeight; if (!w || !hh) throw new Error('leer');
          var f = Math.min(1, LANGE_KANTE / Math.max(w, hh)); var cw = Math.max(1, Math.round(w * f)), ch = Math.max(1, Math.round(hh * f));
          var c = document.createElement('canvas'); c.width = cw; c.height = ch;
          var ctx = c.getContext('2d'); ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, cw, ch); ctx.drawImage(img, 0, 0, cw, ch);
          c.toBlob(function (b) { URL.revokeObjectURL(url); c.width = 0; c.height = 0; if (b) res({ blob: b, w: cw, h: ch }); else rej(new Error('blob')); }, 'image/jpeg', 0.85);
        } catch (e) { URL.revokeObjectURL(url); rej(e); }
      };
      img.onerror = function () { URL.revokeObjectURL(url); rej(new Error('decode')); };
      img.src = url;
    });
  }
  var bildKette = Promise.resolve();
  function fuegeDateienHinzu(files) {
    var bilder = Array.prototype.filter.call(files || [], function (f) { return /^image\//.test(f.type) || /\.(jpe?g|png|webp|gif|heic|heif)$/i.test(f.name || ''); });
    if (!bilder.length) { toast('Bitte ein Bild wählen (Foto, JPEG oder PNG).'); return; }
    bilder.forEach(function (f) {
      if (S.seiten.length >= MAX_SEITEN) { toast('Höchstens ' + MAX_SEITEN + ' Seiten auf einmal.'); return; }
      var p = { id: naechsteId++, status: 'bereite', blob: null, url: '', doc: null, takte: 0, meldung: '', fortschritt: '' };
      S.seiten.push(p);
      bildKette = bildKette.then(function () {
        return bereiteBild(f).then(function (r) { p.blob = r.blob; p.url = URL.createObjectURL(r.blob); p.status = 'neu'; },
          function () { p.status = 'fehler'; p.kaputt = true; p.meldung = 'Dieses Bild lässt sich nicht öffnen. Bitte als JPEG oder PNG versuchen.'; })
          .then(function () { zeigeSeiten(); zeigeSchritt2(); });
      });
    });
    zeigeSeiten(); zeigeSchritt2();
  }

  /* ---------- Seiten anzeigen ---------- */
  var STATUS_TEXT = { bereite: 'wird vorbereitet', neu: 'bereit', liest: 'wird gelesen', fertig: '', leer: 'keine Noten erkannt', fehler: 'Fehler' };
  function pillenText(p) {
    if (p.status === 'fertig') return p.takte + (p.takte === 1 ? ' Takt' : ' Takte') + (p.gekuerzt ? ' · gekürzt' : '');
    if (p.status === 'liest') return p.fortschritt || 'wird gelesen';
    return STATUS_TEXT[p.status] || '';
  }
  function zeigeSeiten() {
    var gitter = $('#seitenGitter'), n = S.seiten.length;
    $('#ablage').hidden = n > 0; gitter.hidden = n === 0;
    $('#seitenZahl').textContent = n ? (n === 1 ? '1 Seite' : n + ' Seiten') : '';
    gitter.textContent = '';
    S.seiten.forEach(function (p, i) {
      var nr = i + 1;
      var fig = h('figure', 'karte' + (p.status === 'liest' ? ' liest' : ''));
      var bild = h('button', 'bild'); bild.type = 'button'; bild.setAttribute('aria-label', 'Seite ' + nr + ' groß ansehen');
      if (p.url) { var img = h('img'); img.src = p.url; img.alt = ''; img.decoding = 'async'; bild.appendChild(img); }
      else bild.appendChild(h('span', 'leer-bild', p.kaputt ? 'Bild nicht lesbar' : 'wird vorbereitet …'));
      bild.appendChild(h('span', 'scan'));
      bild.addEventListener('click', function () { if (p.url) zeigeLupe(p.url, 'Seite ' + nr); });
      fig.appendChild(bild);
      var weg = h('button', 'mini weg'); weg.type = 'button'; weg.setAttribute('aria-label', 'Seite ' + nr + ' entfernen');
      weg.appendChild(svgIcon('M4 4L12 12M12 4L4 12')); weg.disabled = p.status === 'liest';
      weg.addEventListener('click', function () { entferneSeite(p); });
      fig.appendChild(weg);
      if (i > 0 && !S.laeuft) {
        var vor = h('button', 'mini vor'); vor.type = 'button'; vor.setAttribute('aria-label', 'Seite ' + nr + ' eine Stelle nach vorn');
        vor.appendChild(svgIcon('M10 3L5 8L10 13'));
        vor.addEventListener('click', function () { verschiebe(p); });
        fig.appendChild(vor);
      }
      var cap = h('figcaption', 'unterschrift');
      cap.appendChild(h('b', null, 'Seite ' + nr));
      var cls = p.status === 'fertig' && p.gekuerzt ? 'gekuerzt' : p.status;
      var pille = h('span', 'pille ' + cls); pille.appendChild(h('i')); var pt = h('span', null, pillenText(p)); pille.appendChild(pt);
      cap.appendChild(pille); p.pillenEl = pt;
      if (p.meldung) cap.appendChild(h('span', 'meldung', p.meldung));
      if (erkennungMoeglich() && !S.laeuft && p.blob && (p.status === 'fertig' || p.status === 'fehler' || p.status === 'leer')) {
        var nochmal = h('button', 'text-knopf', 'Nochmal lesen'); nochmal.type = 'button'; nochmal.style.justifySelf = 'start';
        nochmal.addEventListener('click', function () { leseEinzeln(p); });
        cap.appendChild(nochmal);
      }
      fig.appendChild(cap);
      gitter.appendChild(fig);
    });
    $('#zufuegenBtn').hidden = !(n > 0 && n < MAX_SEITEN);
    $('#schritt1').classList.toggle('erledigt', S.seiten.some(function (p) { return !!p.blob; }));
  }
  function entferneSeite(p) {
    var i = S.seiten.indexOf(p); if (i < 0 || p.status === 'liest') return;
    S.seiten.splice(i, 1); if (p.url) setTimeout(function () { URL.revokeObjectURL(p.url); }, 1000);
    zeigeSeiten(); zeigeSchritt2(); aktualisiereErgebnis();
  }
  function verschiebe(p) {
    var i = S.seiten.indexOf(p); if (i < 1 || S.laeuft) return;
    S.seiten.splice(i, 1); S.seiten.splice(i - 1, 0, p);
    zeigeSeiten(); aktualisiereErgebnis();
  }
  function waehle() { $('#dateiIn').click(); }
  function ablageZiel(el) {
    el.addEventListener('dragover', function (e) { e.preventDefault(); el.classList.add('ueber'); });
    el.addEventListener('dragleave', function () { el.classList.remove('ueber'); });
    el.addEventListener('drop', function (e) { e.preventDefault(); el.classList.remove('ueber'); if (e.dataTransfer && e.dataTransfer.files) fuegeDateienHinzu(e.dataTransfer.files); });
  }

  /* ---------- Schritt 2 ---------- */
  function offeneSeiten() { return S.seiten.filter(function (p) { return p.blob && p.status !== 'fertig' && p.status !== 'liest'; }); }
  function zeigeSchritt2() {
    var btn = $('#scanBtn'), txtEl = $('#scanText');
    var moeglich = erkennungMoeglich();
    btn.hidden = !(S.laufzeit === 'pruefe' || moeglich);
    $('#kostenHinweis').hidden = !moeglich;
    $('#stopBtn').hidden = !S.laeuft;
    if (S.laufzeit === 'pruefe') { btn.disabled = true; txtEl.textContent = 'Verbinde …'; return; }
    var offen = offeneSeiten().length;
    if (S.laeuft) { btn.disabled = true; txtEl.textContent = 'Wird gelesen …'; }
    else if (!S.seiten.length) { btn.disabled = true; txtEl.textContent = 'Noten erkennen'; }
    else if (!offen) { btn.disabled = true; txtEl.textContent = 'Alle Seiten gelesen'; }
    else { btn.disabled = false; txtEl.textContent = offen === 1 ? (S.seiten.length === 1 ? 'Noten erkennen' : '1 Seite erkennen') : offen + ' Seiten erkennen'; }
    if (!moeglich && !S.laeuft) { var st = $('#scanStatus'); if (!st.classList.contains('fehler')) st.textContent = S.laufzeit === 'pruefe' ? '' : 'Die Erkennung ist hier nicht möglich – siehe Hinweis oben. Das Beispiel unten zeigt, wie ein Ergebnis aussieht.'; }
    $('#schritt2').classList.toggle('erledigt', S.seiten.length > 0 && S.seiten.every(function (p) { return p.status === 'fertig'; }));
  }
  function status(t, istFehler) { var el = $('#scanStatus'); el.textContent = t || ''; el.classList.toggle('fehler', !!istFehler); }

  /* ---------- Anweisung an Claude ---------- */
  function endZustand(doc) {
    var z = { fifths: undefined, mode: '', time: '', clef: {} };
    kinder(kinder(doc.documentElement, 'part')[0], 'measure').forEach(function (m) { leseZustand(z, m); });
    return z;
  }
  function baueAnweisung(nr, gesamt, vorher) {
    var L = [
      'You transcribe a photo of printed piano sheet music into MusicXML. The image is page ' + nr + ' of ' + gesamt + ' of one piece.',
      '',
      'Reply with exactly this and nothing else:',
      '<musicxml>',
      '<score-partwise version="4.0"> ... </score-partwise>',
      '</musicxml>',
      'If the image shows no sheet music you can read, reply exactly: <keine-noten/>',
      '',
      'Structure:',
      '- <part-list> with one <score-part id="P1"><part-name>Klavier</part-name></score-part>, and one <part id="P1">. The piano is ONE part with two staves (<staves>2</staves>): staff 1 = upper staff, staff 2 = lower staff. Never split the hands into two parts. If the music has only one staff per system, use <staves>1</staves>.',
      '- Number the measures 1, 2, 3 ... in reading order across all systems of this page. An incomplete first measure (pickup) gets number="0" implicit="yes".',
      '- Measure 1 starts with <attributes>: <divisions>24</divisions>, <key> (<fifths>, and <mode> if clear), <time> (<beats>, <beat-type>), <staves>, <clef number="1"> and <clef number="2"> (<sign>, <line>). Later <attributes> only where key, time or clef change.',
      '- In each measure write all notes of staff 1, then <backup><duration>...</duration></backup> back to the measure start, then all notes of staff 2. Voice 1 for staff 1, voice 5 for staff 2; a second voice in a staff gets its own <backup> and voice 2 (or 6).',
      '- Durations with divisions 24: whole 96, half 48, quarter 24, eighth 12, 16th 6, 32nd 3. A dot adds half the value (dotted quarter 36). Triplets take 2/3 (eighth triplet 8, quarter triplet 16, 16th triplet 4).',
      '- Every <note> has, in this order: <chord/> (for the 2nd and further notes of a chord), <pitch> (<step>, <alter> whenever the sounding pitch is sharp or flat: apply the key signature and the accidentals valid in the measure, <octave> with middle C = C4) or <rest/>, <duration>, <tie> if tied, <voice>, <type>, <dot/> if dotted, <accidental> only where one is printed, <time-modification> for tuplets, <staff>, <notations> if needed. A whole-measure rest is <rest measure="yes"/> with the full measure duration.',
      '- Ties: <tie type="start"/> / <tie type="stop"/> plus <notations><tied type="start"/></notations> / <tied type="stop"/>. Triplets: <time-modification><actual-notes>3</actual-notes><normal-notes>2</normal-notes></time-modification> plus <tuplet type="start"/> and <tuplet type="stop"/> in <notations>.',
      '- Fingering only where a finger number is printed next to a note: <notations><technical><fingering>3</fingering></technical></notations>.',
      '- Only if printed on the page: the title as <work><work-title>, tempo words or a metronome mark as <direction> (with <sound tempo="..."/> only when a number is printed), dynamics.',
      '- Keep it compact: no <!DOCTYPE>, <defaults>, <credit>, <print>, <identification>, <beam>, <stem>, no layout or position attributes.',
      '',
      'Honesty comes first:',
      '- Transcribe only what is printed. Never guess, complete or invent notes, rhythms, fingerings or markings.',
      '- If any part of a measure is not clearly legible (blurred, cut off, covered, too small), output that measure empty with only this comment inside, for example: <measure number="7"><!-- unleserlich --></measure>. A clearly legible key, time or clef change in that measure may stay in its <attributes>. Use no other comments.',
      '- Durations of every voice in a measure should add up to the time signature (pickup excepted). If they do not, re-read the measure; if it is still unclear, mark it unleserlich.'
    ];
    if (vorher) {
      L.push('', 'Context: the previous page ended with key fifths=' + (vorher.fifths === undefined ? 'unknown' : vorher.fifths) + (vorher.time ? ', time ' + vorher.time : '') + '. Later pages usually print no time signature: if none is printed on this page, still put that time signature into the <attributes> of measure 1. Take the key from the key signature printed at the start of the systems.');
    }
    return L.join('\n');
  }

  /* ---------- Antwort auswerten ---------- */
  function extrahiere(text) {
    var t = String(text || '');
    if (/<keine-noten\s*\/?>/i.test(t) && !/<score-partwise/i.test(t)) return { keine: true };
    var m = t.match(/<musicxml>([\s\S]*?)(<\/musicxml>|$)/i);
    var inner = (m ? m[1] : t).replace(/```[a-z]*\s*/gi, '');
    var s = inner.search(/<score-partwise[\s>]/i);
    if (s < 0) return { fehler: 'In der Antwort war keine MusicXML.' };
    inner = inner.slice(s);
    var e = inner.lastIndexOf('</score-partwise>'), gekuerzt = false;
    if (e < 0) {
      var lm = inner.lastIndexOf('</measure>');
      if (lm < 0) return { fehler: 'Die Antwort brach ab, bevor ein Takt fertig war.' };
      inner = inner.slice(0, lm + 10) + '\n</part>\n</score-partwise>'; gekuerzt = true;
    } else inner = inner.slice(0, e + 17);
    inner = inner.replace(/<!DOCTYPE[^>]*>/gi, '').replace(/&(?!(?:amp|lt|gt|quot|apos|#\d+|#x[0-9a-fA-F]+);)/g, '&amp;');
    return { xml: inner, gekuerzt: gekuerzt };
  }
  function pruefeXml(xml) {
    var doc;
    try { doc = new DOMParser().parseFromString(String(xml).replace(/<!DOCTYPE[^>]*>/gi, ''), 'application/xml'); } catch (e) { return { fehler: 'Die MusicXML ließ sich nicht lesen.' }; }
    if (doc.getElementsByTagName('parsererror').length) return { fehler: 'Die MusicXML ist fehlerhaft aufgebaut.' };
    var root = doc.documentElement;
    if (!root || root.nodeName !== 'score-partwise') return { fehler: 'Die Antwort ist keine MusicXML im erwarteten Format.' };
    var parts = kinder(root, 'part');
    if (!parts.length || !kinder(parts[0], 'measure').length) return { fehler: 'In der MusicXML stehen keine Takte.' };
    var mehr = parts.length > 1;
    for (var i = 1; i < parts.length; i++) root.removeChild(parts[i]);
    var pl = kind(root, 'part-list');
    if (pl) {
      var sps = kinder(pl, 'score-part');
      for (var j = 1; j < sps.length; j++) pl.removeChild(sps[j]);
      parts[0].setAttribute('id', (sps[0] && sps[0].getAttribute('id')) || 'P1');
      if (!sps[0]) { var sp0 = doc.createElement('score-part'); sp0.setAttribute('id', 'P1'); var pn0 = doc.createElement('part-name'); pn0.textContent = 'Klavier'; sp0.appendChild(pn0); pl.appendChild(sp0); parts[0].setAttribute('id', 'P1'); }
    } else {
      pl = doc.createElement('part-list'); var sp = doc.createElement('score-part'); sp.setAttribute('id', 'P1');
      var pn = doc.createElement('part-name'); pn.textContent = 'Klavier'; sp.appendChild(pn); pl.appendChild(sp);
      root.insertBefore(pl, parts[0]); parts[0].setAttribute('id', 'P1');
    }
    root.setAttribute('version', '4.0');
    return { doc: doc, mehrereParts: mehr };
  }

  /* ---------- Seiten zusammenführen ---------- */
  function leseZustand(z, m) {
    kinder(m, 'attributes').forEach(function (a) {
      var k = kind(a, 'key'); if (k && kind(k, 'fifths')) { z.fifths = zahl(k, 'fifths', 0); z.mode = txt(k, 'mode'); }
      var t = kind(a, 'time'); if (t && txt(t, 'beats')) z.time = txt(t, 'beats') + '/' + txt(t, 'beat-type');
      kinder(a, 'clef').forEach(function (c) { z.clef[c.getAttribute('number') || '1'] = txt(c, 'sign') + txt(c, 'line'); });
    });
  }
  function entferneDoppelte(m, z) {
    kinder(m, 'attributes').forEach(function (a) {
      var k = kind(a, 'key'); if (k && z.fifths !== undefined && kind(k, 'fifths') && zahl(k, 'fifths', 0) === z.fifths) a.removeChild(k);
      var t = kind(a, 'time'); if (t && z.time && z.time === txt(t, 'beats') + '/' + txt(t, 'beat-type')) a.removeChild(t);
      kinder(a, 'clef').forEach(function (c) { if (z.clef[c.getAttribute('number') || '1'] === txt(c, 'sign') + txt(c, 'line')) a.removeChild(c); });
      if (!a.children.length) m.removeChild(a);
    });
  }
  function fuegeZusammen(liste) {
    var basis = liste[0].doc.cloneNode(true), root = basis.documentElement, part = kinder(root, 'part')[0];
    var z = { fifths: undefined, mode: '', time: '', clef: {} };
    var ms = kinder(part, 'measure'); ms.forEach(function (m) { leseZustand(z, m); });
    var ranges = [{ seite: liste[0].nr, url: liste[0].url, von: 0, bis: ms.length - 1 }], zaehler = ms.length;
    liste.slice(1).forEach(function (s) {
      var quelle = kinder(kinder(s.doc.documentElement, 'part')[0], 'measure');
      quelle.forEach(function (m, i) {
        var neu = basis.importNode(m, true);
        if (i === 0) {
          entferneDoppelte(neu, z); neu.removeAttribute('implicit');
          var pr = basis.createElement('print'); pr.setAttribute('new-page', 'yes'); neu.insertBefore(pr, neu.firstChild);
        }
        leseZustand(z, neu);
        part.appendChild(basis.createTextNode('\n'));
        part.appendChild(neu);
      });
      ranges.push({ seite: s.nr, url: s.url, von: zaehler, bis: zaehler + quelle.length - 1 });
      zaehler += quelle.length;
    });
    var nummer = 1;
    kinder(part, 'measure').forEach(function (m, i) {
      if (i === 0 && m.getAttribute('implicit') === 'yes') { m.setAttribute('number', '0'); return; }
      m.setAttribute('number', String(nummer++));
    });
    return { doc: basis, ranges: ranges };
  }

  /* ---------- Noten lesen (Namen, Dauern) ---------- */
  var STUFE = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
  var DE_STAMM = { C: 'c', D: 'd', E: 'e', F: 'f', G: 'g', A: 'a', B: 'h' };
  var DE_B = { C: 'ces', D: 'des', E: 'es', F: 'fes', G: 'ges', A: 'as', B: 'b' };
  var DE_BB = { C: 'ceses', D: 'deses', E: 'eses', F: 'feses', G: 'geses', A: 'asas', B: 'heses' };
  function tonName(p) {
    var step = txt(p, 'step').toUpperCase(), alter = Math.round(zahl(p, 'alter', 0)), oct = zahl(p, 'octave', 4) | 0;
    if (!(step in STUFE)) return null;
    var n = alter === 0 ? DE_STAMM[step] : alter > 0 ? DE_STAMM[step] + (alter > 1 ? 'isis' : 'is') : alter === -1 ? DE_B[step] : DE_BB[step];
    var de = oct >= 3 ? n + new Array(oct - 2).join("'") : n.charAt(0).toUpperCase() + n.slice(1) + new Array(Math.max(0, 2 - oct) + 1).join(',');
    var zeichen = alter > 0 ? (alter > 1 ? '♯♯' : '♯') : alter < 0 ? (alter < -1 ? '♭♭' : '♭') : '';
    return { de: de, int: step + zeichen + oct, midi: (oct + 1) * 12 + STUFE[step] + alter };
  }
  var TYP_VIERTEL = { maxima: 32, long: 16, breve: 8, whole: 4, half: 2, quarter: 1, eighth: 0.5, '16th': 0.25, '32nd': 0.125, '64th': 0.0625 };
  var TYP_TEXT = { breve: '2', whole: '1', half: '1/2', quarter: '1/4', eighth: '1/8', '16th': '1/16', '32nd': '1/32', '64th': '1/64' };
  function notenDauer(n, div, taktDiv) {
    var d = kind(n, 'duration'); if (d) { var v = parseFloat(d.textContent); if (isFinite(v) && v >= 0) return v; }
    var r = kind(n, 'rest'); if (r && r.getAttribute('measure') === 'yes') return taktDiv;
    var q = TYP_VIERTEL[txt(n, 'type')]; if (!q) return r ? taktDiv : 0;
    var f = 1, add = 0.5; kinder(n, 'dot').forEach(function () { f += add; add /= 2; });
    var tm = kind(n, 'time-modification'); if (tm) { var a = zahl(tm, 'actual-notes', 1), no = zahl(tm, 'normal-notes', 1); if (a > 0) f *= no / a; }
    return q * f * div;
  }
  function wertText(n, dauer, div) {
    var r = kind(n, 'rest'); if (r && r.getAttribute('measure') === 'yes') return 'ganzer Takt';
    var typ = txt(n, 'type'), dots = kinder(n, 'dot').length;
    if (TYP_TEXT[typ]) return TYP_TEXT[typ] + new Array(dots + 1).join('.');
    var q = div ? dauer / div : 0, tab = { 4: '1', 3: '1/2.', 2: '1/2', 1.5: '1/4.', 1: '1/4', 0.75: '1/8.', 0.5: '1/8', 0.25: '1/16', 0.125: '1/32' };
    return tab[q] || (Math.round(q * 100) / 100 + ' V.');
  }
  function hatUnleserlich(m) {
    var w = m.ownerDocument.createTreeWalker(m, 128 /* SHOW_COMMENT */);
    while (w.nextNode()) if (/unleserlich|illegible|unreadable/i.test(w.currentNode.nodeValue || '')) return true;
    return false;
  }
  function bogenStart(n) {
    if (kinder(n, 'tie').some(function (t) { return t.getAttribute('type') === 'start'; })) return true;
    return kinder(n, 'notations').some(function (no) { return kinder(no, 'tied').some(function (t) { return t.getAttribute('type') === 'start'; }); });
  }
  function fingersaetze(n) {
    var r = [];
    kinder(n, 'notations').forEach(function (no) { kinder(no, 'technical').forEach(function (te) { kinder(te, 'fingering').forEach(function (f) { var v = f.textContent.trim(); if (v) r.push(v); }); }); });
    return r;
  }
  function analysiere(doc) {
    var root = doc.documentElement, part = kinder(root, 'part')[0], ms = kinder(part, 'measure');
    var A = { takte: [], titel: '', tempo: 0, fifths: null, mode: '', beats: 0, beatType: 0, zeitWechsel: false, staves: 1, unleserlich: [], auffaellig: [], noten: 0 };
    var w = kind(root, 'work'); A.titel = (w && txt(w, 'work-title')) || txt(root, 'movement-title') || '';
    var div = 1, beats = 4, bt = 4;
    ms.forEach(function (m, idx) {
      var t = { idx: idx, nr: m.getAttribute('number') || String(idx + 1), systeme: {}, unleserlich: hatUnleserlich(m), auffaellig: '', noten: 0 };
      var laenge = {}, letztes = {}, hatEvents = false;
      for (var ci = 0; ci < m.children.length; ci++) {
        var c = m.children[ci], n = c.nodeName;
        if (n === 'attributes') {
          var d = zahl(c, 'divisions', 0); if (d > 0) div = d;
          var st = zahl(c, 'staves', 0); if (st > A.staves) A.staves = Math.min(4, st);
          var k = kind(c, 'key'); if (k && kind(k, 'fifths') && A.fifths === null) { A.fifths = zahl(k, 'fifths', 0); A.mode = txt(k, 'mode'); }
          var ti = kind(c, 'time');
          if (ti) { var b = summe(txt(ti, 'beats')), y = parseInt(txt(ti, 'beat-type'), 10); if (b > 0 && y > 0) { if (A.beats && (A.beats !== b || A.beatType !== y)) A.zeitWechsel = true; if (!A.beats) { A.beats = b; A.beatType = y; } beats = b; bt = y; } }
        } else if (n === 'direction' || n === 'sound') {
          var snd = n === 'sound' ? c : kind(c, 'sound'); var tp = snd ? parseFloat(snd.getAttribute('tempo')) : NaN;
          if (tp > 0 && !A.tempo) A.tempo = Math.round(tp);
        } else if (n === 'note') {
          if (kind(c, 'grace') || kind(c, 'cue')) continue;
          var staff = Math.max(1, zahl(c, 'staff', 1) | 0), voice = txt(c, 'voice') || '1';
          var akkord = !!kind(c, 'chord'), rest = kind(c, 'rest'), pitch = kind(c, 'pitch');
          var taktDiv = beats * 4 / bt * div, dauer = notenDauer(c, div, taktDiv), ton = pitch ? tonName(pitch) : null, fs = fingersaetze(c), ev;
          if (ton) ton.finger = fs;
          if (akkord && letztes[staff]) { ev = letztes[staff]; if (ton) ev.toene.push(ton); }
          else {
            ev = { pause: !!rest, toene: ton ? [ton] : [], wert: wertText(c, dauer, div), triole: !!kind(c, 'time-modification'), finger: [], bogen: false };
            (t.systeme[staff] = t.systeme[staff] || []).push(ev); letztes[staff] = ev; hatEvents = true;
            var key = staff + '/' + voice; laenge[key] = (laenge[key] || 0) + dauer;
          }
          if (!ton) Array.prototype.push.apply(ev.finger, fs); if (bogenStart(c)) ev.bogen = true;
          if (!rest) { t.noten++; A.noten++; }
        }
      }
      if (!t.unleserlich && hatEvents) {
        var soll = beats * 4 / bt * div, proSystem = {};
        Object.keys(laenge).forEach(function (kk) { var s = kk.split('/')[0]; proSystem[s] = Math.max(proSystem[s] || 0, laenge[kk]); });
        var rand = idx === 0 || idx === ms.length - 1 || m.getAttribute('implicit') === 'yes';
        var falsch = Object.keys(proSystem).filter(function (s) { var v = proSystem[s]; return Math.abs(v - soll) > div / 100 && !(rand && v < soll); });
        if (falsch.length) {
          var wo = falsch.length > 1 ? 'in beiden Systemen' : (falsch[0] === '1' ? 'im oberen System' : 'im unteren System');
          t.auffaellig = 'Die Notenwerte ' + wo + ' passen nicht zum ' + beats + '/' + bt + '-Takt – bitte prüfen.';
        }
      }
      if (t.unleserlich) A.unleserlich.push(t); else if (t.auffaellig) A.auffaellig.push(t);
      A.takte.push(t);
    });
    if (!A.beats) { A.beats = 4; A.beatType = 4; A.ohneTakt = true; }
    return A;
  }
  var DUR = { '-7': 'Ces', '-6': 'Ges', '-5': 'Des', '-4': 'As', '-3': 'Es', '-2': 'B', '-1': 'F', '0': 'C', '1': 'G', '2': 'D', '3': 'A', '4': 'E', '5': 'H', '6': 'Fis', '7': 'Cis' };
  var MOLL = { '-7': 'as', '-6': 'es', '-5': 'b', '-4': 'f', '-3': 'c', '-2': 'g', '-1': 'd', '0': 'a', '1': 'e', '2': 'h', '3': 'fis', '4': 'cis', '5': 'gis', '6': 'dis', '7': 'ais' };
  function tonartText(f, mode) {
    if (f === null || !(String(f) in DUR)) return 'unbekannt';
    if (mode === 'minor') return MOLL[f] + '-Moll';
    if (mode === 'major') return DUR[f] + '-Dur';
    return DUR[f] + '-Dur / ' + MOLL[f] + '-Moll';
  }

  /* ---------- MIDI schreiben (Format 1) ---------- */
  function midiNr(p) { var s = txt(p, 'step').toUpperCase(); if (!(s in STUFE)) return -1; return (zahl(p, 'octave', 4) + 1) * 12 + STUFE[s] + Math.round(zahl(p, 'alter', 0)); }
  function vlq(n) { n = Math.max(0, Math.round(n)); var b = [n & 0x7f]; while ((n = Math.floor(n / 128)) > 0) b.unshift((n & 0x7f) | 0x80); return b; }
  function textMeta(typ, s) { var b = Array.prototype.slice.call(new TextEncoder().encode(s)); return [0xFF, typ].concat(vlq(b.length), b); }
  function spurBytes(events) {
    events.sort(function (a, b) { return a.tick - b.tick || a.ord - b.ord; });
    var out = [], last = 0;
    events.forEach(function (e) { var d = vlq(e.tick - last); for (var i = 0; i < d.length; i++) out.push(d[i]); for (var j = 0; j < e.bytes.length; j++) out.push(e.bytes[j]); last = e.tick; });
    out.push(0, 0xFF, 0x2F, 0x00);
    return out;
  }
  function baueMidi(doc, bpmWunsch, titel) {
    var TPQ = 480, part = kinder(doc.documentElement, 'part')[0], ms = kinder(part, 'measure');
    var div = 1, beats = 4, bt = 4, takt0 = 0, maxStaff = 1;
    var noten = [], meta = [], tempi = [], boegen = {};
    function ticks(d) { return Math.round(d * TPQ / div); }
    ms.forEach(function (m) {
      var cur = 0, max = 0, letzterStart = 0, inhalt = false;
      for (var ci = 0; ci < m.children.length; ci++) {
        var c = m.children[ci];
        switch (c.nodeName) {
          case 'attributes': {
            var dv = zahl(c, 'divisions', 0); if (dv > 0) div = dv;
            var st = zahl(c, 'staves', 0); if (st > maxStaff) maxStaff = Math.min(4, st);
            var t = kind(c, 'time');
            if (t) { var b = summe(txt(t, 'beats')), y = parseInt(txt(t, 'beat-type'), 10); if (b > 0 && y > 0) { beats = b; bt = y; meta.push({ tick: takt0 + cur, art: 'zeit', b: b, bt: y }); } }
            var k = kind(c, 'key'); if (k && kind(k, 'fifths')) meta.push({ tick: takt0 + cur, art: 'tonart', f: Math.max(-7, Math.min(7, zahl(k, 'fifths', 0) | 0)), moll: txt(k, 'mode') === 'minor' });
            break;
          }
          case 'direction': case 'sound': {
            var snd = c.nodeName === 'sound' ? c : kind(c, 'sound'); var tp = snd ? parseFloat(snd.getAttribute('tempo')) : NaN;
            if (tp > 0) tempi.push({ tick: takt0 + cur, bpm: tp });
            break;
          }
          case 'backup': cur = Math.max(0, cur - ticks(zahl(c, 'duration', 0))); break;
          case 'forward': cur += ticks(zahl(c, 'duration', 0)); if (cur > max) max = cur; inhalt = true; break;
          case 'note': {
            if (kind(c, 'grace') || kind(c, 'cue')) break;
            var akkord = !!kind(c, 'chord'), dur = ticks(notenDauer(c, div, beats * 4 / bt * div));
            var start = akkord ? letzterStart : cur;
            if (!akkord) { letzterStart = cur; cur += dur; if (cur > max) max = cur; }
            inhalt = true;
            var p = kind(c, 'pitch'); if (!p || dur <= 0) break;
            var nr = midiNr(p); if (nr < 0 || nr > 127) break;
            var staff = Math.max(1, Math.min(4, zahl(c, 'staff', 1) | 0)); if (staff > maxStaff) maxStaff = staff;
            var typen = kinder(c, 'tie').map(function (x) { return x.getAttribute('type'); });
            kinder(c, 'notations').forEach(function (no) { kinder(no, 'tied').forEach(function (x) { typen.push(x.getAttribute('type')); }); });
            var tStart = typen.indexOf('start') >= 0, tStop = typen.indexOf('stop') >= 0, sk = staff + ':' + nr, abs = takt0 + start, ev;
            if (tStop && boegen[sk]) { ev = boegen[sk]; ev.ende = Math.max(ev.ende, abs + dur); }
            else { ev = { staff: staff, nr: nr, start: abs, ende: abs + dur }; noten.push(ev); }
            if (tStart) boegen[sk] = ev; else delete boegen[sk];
            break;
          }
        }
      }
      var soll = Math.round(beats * 4 / bt * TPQ);
      takt0 += (inhalt && max > 0) ? max : soll;
    });
    var bpm = Math.max(20, Math.min(300, bpmWunsch || 90));
    if (!tempi.length) tempi = [{ tick: 0, bpm: bpm }];
    else { var faktor = bpm / tempi[0].bpm; if (tempi[0].tick > 0) tempi.unshift({ tick: 0, bpm: tempi[0].bpm }); tempi.forEach(function (x) { x.bpm *= faktor; }); }
    var spuren = [];
    var e0 = [{ tick: 0, ord: 0, bytes: textMeta(0x03, titel || 'Noten') }];
    tempi.forEach(function (x) { var us = Math.round(60000000 / x.bpm); e0.push({ tick: x.tick, ord: 1, bytes: [0xFF, 0x51, 0x03, (us >> 16) & 255, (us >> 8) & 255, us & 255] }); });
    meta.forEach(function (x) {
      if (x.art === 'zeit') { var dd = Math.round(Math.log(x.bt) / Math.LN2); if (Math.pow(2, dd) === x.bt && x.b < 256) e0.push({ tick: x.tick, ord: 2, bytes: [0xFF, 0x58, 0x04, x.b, dd, 24, 8] }); }
      else e0.push({ tick: x.tick, ord: 3, bytes: [0xFF, 0x59, 0x02, x.f & 0xFF, x.moll ? 1 : 0] });
    });
    spuren.push(spurBytes(e0));
    var NAMEN = { 1: 'Klavier oben', 2: 'Klavier unten', 3: 'Klavier System 3', 4: 'Klavier System 4' };
    for (var s = 1; s <= maxStaff; s++) {
      var ch = (s - 1) & 15, ev = [{ tick: 0, ord: 0, bytes: textMeta(0x03, NAMEN[s]) }, { tick: 0, ord: 1, bytes: [0xC0 | ch, 0] }];
      noten.forEach(function (n) { if (n.staff !== s) return; ev.push({ tick: n.start, ord: 3, bytes: [0x90 | ch, n.nr, 76] }); ev.push({ tick: n.ende, ord: 2, bytes: [0x80 | ch, n.nr, 0] }); });
      spuren.push(spurBytes(ev));
    }
    var laenge = 14; spuren.forEach(function (t) { laenge += 8 + t.length; });
    var out = new Uint8Array(laenge), dv2 = new DataView(out.buffer), o = 0;
    function str(s) { for (var i = 0; i < 4; i++) out[o++] = s.charCodeAt(i); }
    str('MThd'); dv2.setUint32(o, 6); o += 4; dv2.setUint16(o, 1); o += 2; dv2.setUint16(o, spuren.length); o += 2; dv2.setUint16(o, TPQ); o += 2;
    spuren.forEach(function (t) { str('MTrk'); dv2.setUint32(o, t.length); o += 4; out.set(t, o); o += t.length; });
    return out;
  }

  /* ---------- ZIP (ohne Kompression) ---------- */
  var CRC = (function () { var t = new Uint32Array(256); for (var n = 0; n < 256; n++) { var c = n; for (var k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1; t[n] = c >>> 0; } return t; })();
  function crc32(b) { var c = 0xFFFFFFFF; for (var i = 0; i < b.length; i++) c = CRC[(c ^ b[i]) & 255] ^ (c >>> 8); return (c ^ 0xFFFFFFFF) >>> 0; }
  function zip(dateien) {
    var enc = new TextEncoder(), teile = [], zentral = [], offset = 0, d = new Date();
    var zeit = (d.getHours() << 11) | (d.getMinutes() << 5) | (d.getSeconds() >> 1), datum = ((d.getFullYear() - 1980) << 9) | ((d.getMonth() + 1) << 5) | d.getDate();
    dateien.forEach(function (f) {
      var name = enc.encode(f.name), crc = crc32(f.data), gr = f.data.length;
      var lh = new DataView(new ArrayBuffer(30));
      lh.setUint32(0, 0x04034b50, true); lh.setUint16(4, 20, true); lh.setUint16(6, 0x0800, true); lh.setUint16(8, 0, true);
      lh.setUint16(10, zeit, true); lh.setUint16(12, datum, true); lh.setUint32(14, crc, true); lh.setUint32(18, gr, true); lh.setUint32(22, gr, true);
      lh.setUint16(26, name.length, true); lh.setUint16(28, 0, true);
      teile.push(new Uint8Array(lh.buffer), name, f.data);
      var cd = new DataView(new ArrayBuffer(46));
      cd.setUint32(0, 0x02014b50, true); cd.setUint16(4, 20, true); cd.setUint16(6, 20, true); cd.setUint16(8, 0x0800, true); cd.setUint16(10, 0, true);
      cd.setUint16(12, zeit, true); cd.setUint16(14, datum, true); cd.setUint32(16, crc, true); cd.setUint32(20, gr, true); cd.setUint32(24, gr, true);
      cd.setUint16(28, name.length, true); cd.setUint16(30, 0, true); cd.setUint16(32, 0, true); cd.setUint16(34, 0, true); cd.setUint16(36, 0, true);
      cd.setUint32(38, 0, true); cd.setUint32(42, offset, true);
      zentral.push(new Uint8Array(cd.buffer), name);
      offset += 30 + name.length + gr;
    });
    var zg = 0; zentral.forEach(function (z) { zg += z.length; });
    var ende = new DataView(new ArrayBuffer(22));
    ende.setUint32(0, 0x06054b50, true); ende.setUint16(8, dateien.length, true); ende.setUint16(10, dateien.length, true); ende.setUint32(12, zg, true); ende.setUint32(16, offset, true);
    return new Blob(teile.concat(zentral, [new Uint8Array(ende.buffer)]), { type: 'application/zip' });
  }

  /* ---------- Erkennen ---------- */
  var FEHLER_TEXT = {
    image_rejected: 'Dieses Bild wurde nicht angenommen. Versuche ein anderes Foto.',
    refused: 'Claude hat diese Seite nicht bearbeitet. Versuche ein anderes Foto.',
    empty_completion: 'Keine Antwort bekommen. Versuche ein schärferes Foto.',
    prompt_too_large: 'Die Anfrage war zu groß.',
    session_expired: 'Bitte melde dich bei Claude neu an und tippe dann noch einmal.',
    invalid_request: 'Die Anfrage war fehlerhaft (bitte melden).',
    transform_error: 'Das Bild ließ sich nicht vorbereiten. Versuche ein anderes Foto.'
  };
  var HALT_CODES = { not_granted: 1, sampling_disabled: 1, not_declared: 1, capability_disabled: 1, capability_removed: 1, images_unavailable: 1, rate_limited: 1, session_expired: 1, queue_overflow: 1 };
  function tickeUhr() {
    clearInterval(S.uhr);
    S.uhr = setInterval(function () {
      var p = S.seiten.filter(function (x) { return x.status === 'liest'; })[0];
      if (!p || !p.pillenEl || p.hatText) return;
      var sek = Math.round((Date.now() - p.start) / 1000);
      p.fortschritt = 'liest … ' + Math.floor(sek / 60) + ':' + ('0' + (sek % 60)).slice(-2);
      p.pillenEl.textContent = p.fortschritt;
    }, 1000);
  }
  function leseSeite(p, neu) {
    var ctl = new AbortController(); S.ctl = ctl;
    var idx = S.seiten.indexOf(p), vorherige = null;
    for (var i = idx - 1; i >= 0; i--) if (S.seiten[i].doc) { vorherige = S.seiten[i]; break; }
    var anweisung = baueAnweisung(idx + 1, S.seiten.length, vorherige ? endZustand(vorherige.doc) : null);
    var tier = (!S.tiers || S.tiers.indexOf('complex') >= 0) ? 'complex' : 'default';
    p.alterStatus = p.status; p.status = 'liest'; p.hatText = false; p.start = Date.now(); p.fortschritt = 'liest …'; p.meldung = '';
    zeigeSeiten();
    var opts = {
      images: [p.blob], modelTier: tier, signal: ctl.signal,
      onText: function (u) {
        var n = (u.text.match(/<\/measure>/g) || []).length; p.hatText = true;
        p.fortschritt = n ? n + (n === 1 ? ' Takt' : ' Takte') + ' …' : 'schreibt …';
        if (p.pillenEl) p.pillenEl.textContent = p.fortschritt;
      }
    };
    if (neu) opts.cache = false;
    if (S.maxBytes && p.blob.size > S.maxBytes) { p.status = 'fehler'; p.meldung = 'Das Bild ist zu groß für Claude.'; return Promise.resolve('weiter'); }
    return Promise.resolve().then(function () { return S.sample(anweisung, opts); }).then(function (r) {
      verarbeite(p, r.text, r.truncated); return 'weiter';
    }, function (e) {
      var code = (e && e.code) || 'upstream_error';
      if (code === 'cancelled') { p.status = p.doc ? 'fertig' : 'neu'; p.meldung = ''; return 'halt'; }
      p.status = p.doc ? 'fertig' : 'fehler';
      if (code === 'not_granted' || code === 'sampling_disabled' || code === 'not_declared' || code === 'capability_disabled' || code === 'capability_removed') {
        S.gesperrt = SPERR_TEXT[code] ? code : 'sampling_disabled'; p.meldung = ''; if (!p.doc) p.status = 'neu'; zeigeLaufzeit(); return 'halt';
      }
      if (code === 'images_unavailable') { S.bildOk = false; p.meldung = ''; if (!p.doc) p.status = 'neu'; zeigeLaufzeit(); return 'halt'; }
      if (code === 'rate_limited') {
        var t = e.reason === 'usage_limit' ? 'Dein Claude-Nutzungslimit ist erreicht. Versuche es später noch einmal.' : 'Gerade zu viele Anfragen. Warte eine Minute und tippe dann noch einmal.';
        p.meldung = t; status(t, true); return 'halt';
      }
      p.meldung = FEHLER_TEXT[code] || 'Die Verbindung ist abgebrochen. Tippe auf „Nochmal lesen“.';
      return HALT_CODES[code] ? 'halt' : 'weiter';
    }).then(function (r) { if (S.ctl === ctl) S.ctl = null; return r; });
  }
  function verarbeite(p, text, truncated) {
    var x = extrahiere(text);
    if (x.keine) { p.status = 'leer'; p.meldung = 'Auf diesem Bild wurden keine lesbaren Noten gefunden.'; return; }
    if (x.fehler) { p.status = p.doc ? 'fertig' : 'fehler'; p.meldung = x.fehler + ' Tippe auf „Nochmal lesen“.'; return; }
    var r = pruefeXml(x.xml);
    if (r.fehler) { p.status = p.doc ? 'fertig' : 'fehler'; p.meldung = r.fehler + ' Tippe auf „Nochmal lesen“.'; return; }
    p.doc = r.doc; p.takte = kinder(kinder(r.doc.documentElement, 'part')[0], 'measure').length; p.status = 'fertig';
    p.gekuerzt = !!(x.gekuerzt || truncated); p.mehrereParts = r.mehrereParts;
    p.meldung = p.gekuerzt ? 'Die Antwort wurde zu lang und endet nach dem ' + p.takte + '. Takt dieser Seite. Tipp: die Seite in zwei Fotos teilen.' : '';
  }
  function erkenneAlle() {
    if (S.laeuft || !erkennungMoeglich()) return;
    var liste = offeneSeiten(); if (!liste.length) return;
    S.laeuft = true; S.stopp = false; status('');
    zeigeSchritt2(); tickeUhr();
    var i = 0;
    function naechste() {
      if (S.stopp || i >= liste.length) return fertig();
      var p = liste[i++];
      if (S.seiten.indexOf(p) < 0 || !p.blob) return naechste();
      status('Seite ' + (S.seiten.indexOf(p) + 1) + ' von ' + S.seiten.length + ' wird gelesen.');
      return leseSeite(p, false).then(function (r) { zeigeSeiten(); aktualisiereErgebnis(); if (r === 'halt') S.stopp = true; return naechste(); });
    }
    function fertig() {
      S.laeuft = false; clearInterval(S.uhr); zeigeSeiten(); zeigeSchritt2();
      var el = $('#scanStatus');
      if (!el.classList.contains('fehler')) {
        var ok = S.seiten.filter(function (p) { return p.status === 'fertig'; }).length;
        status(ok ? (ok === S.seiten.length ? 'Fertig. Prüfe jetzt die Takte unten.' : ok + ' von ' + S.seiten.length + ' Seiten gelesen.') : (S.stopp ? 'Angehalten.' : 'Keine Seite konnte gelesen werden.'), !ok && !S.stopp);
        if (ok && S.ergebnis && !bewegungAus) $('#schritt3').scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
    naechste();
  }
  function leseEinzeln(p) {
    if (S.laeuft || !erkennungMoeglich()) return;
    S.laeuft = true; S.stopp = false; status('Seite ' + (S.seiten.indexOf(p) + 1) + ' wird neu gelesen.');
    zeigeSchritt2(); tickeUhr();
    leseSeite(p, true).then(function () {
      S.laeuft = false; clearInterval(S.uhr); zeigeSeiten(); zeigeSchritt2(); aktualisiereErgebnis();
      if (!$('#scanStatus').classList.contains('fehler')) status(p.status === 'fertig' ? 'Seite ' + (S.seiten.indexOf(p) + 1) + ' neu gelesen.' : '');
    });
  }

  /* ---------- Ergebnis ---------- */
  function aktualisiereErgebnis() {
    var fertige = S.seiten.filter(function (p) { return p.status === 'fertig' && p.doc; });
    if (fertige.length) {
      var r = fuegeZusammen(fertige.map(function (p) { return { doc: p.doc, nr: S.seiten.indexOf(p) + 1, url: p.url }; }));
      setzeErgebnis(r.doc, r.ranges, 'scan');
      var warn = [];
      fertige.forEach(function (p) {
        var nr = S.seiten.indexOf(p) + 1, rg = r.ranges.filter(function (x) { return x.seite === nr; })[0], letzter = rg && S.ergebnis.analyse.takte[rg.bis];
        if (p.gekuerzt) warn.push('Seite ' + nr + ' wurde nur bis Takt ' + (letzter ? letzter.nr : p.takte) + ' gelesen, weil die Antwort zu lang wurde. Der Rest der Seite fehlt – teile sie in zwei Fotos und lies sie neu.');
        if (p.mehrereParts) warn.push('Seite ' + nr + ' kam mit mehreren Stimmen-Teilen zurück. Übernommen wurde nur der erste – bitte „Nochmal lesen“.');
      });
      S.seiten.forEach(function (p, i) { if (p.status === 'fehler' || p.status === 'leer') warn.push('Seite ' + (i + 1) + ' fehlt im Ergebnis (' + (p.status === 'leer' ? 'keine Noten erkannt' : 'Fehler') + ').'); });
      S.ergebnis.seitenWarnungen = warn;
      zeigeErgebnis();
      speichereLokal();
    } else if (S.ergebnis && S.ergebnis.quelle === 'scan') { S.ergebnis = null; zeigeErgebnis(); }
  }
  function serialisiere(doc) { return XML_KOPF + new XMLSerializer().serializeToString(doc.documentElement) + '\n'; }
  function heute() { var d = new Date(); return d.getDate() + '.' + (d.getMonth() + 1) + '.' + d.getFullYear(); }
  function setzeErgebnis(doc, ranges, quelle, zeit) {
    var A = analysiere(doc);
    S.ergebnis = { doc: doc, xml: serialisiere(doc), ranges: ranges, analyse: A, quelle: quelle, zeit: zeit || Date.now(), seitenWarnungen: [] };
    if (!S.nameEigen) $('#nameIn').value = A.titel || ('Noten ' + heute());
    if (!S.tempoEigen) { S.tempo = A.tempo || 90; $('#tempoIn').value = S.tempo; }
    $('#xmlText').hidden = true;
    zeigeErgebnis();
  }
  function speichereLokal() {
    if (!S.ergebnis || S.ergebnis.quelle !== 'scan') return;
    if (S.ergebnis.xml.length > 2500000) return;
    schreib(SPEICHER, JSON.stringify({ xml: S.ergebnis.xml, name: $('#nameIn').value, zeit: Date.now(), ranges: S.ergebnis.ranges.map(function (r) { return { seite: r.seite, von: r.von, bis: r.bis }; }) }));
  }
  function ladeGespeichertes() {
    var raw = lies(SPEICHER); if (!raw) return;
    try {
      var o = JSON.parse(raw), r = pruefeXml(o.xml); if (!r.doc) return;
      setzeErgebnis(r.doc, o.ranges, 'gespeichert', o.zeit);
      if (o.name) { $('#nameIn').value = o.name; }
    } catch (e) { /* kaputt: ignorieren */ }
  }
  function fakt(label, wert) { var f = h('div', 'fakt'); f.appendChild(h('small', null, label)); f.appendChild(h('b', null, wert)); return f; }
  function warnZeile(text, takte, rot) {
    var w = h('div', 'warnung' + (rot ? ' rot' : '')); w.appendChild(h('span', null, text));
    if (takte && takte.length) {
      var l = h('div', 'sprung-liste');
      takte.slice(0, 40).forEach(function (t) { var b = h('button', 'sprung', t.nr); b.type = 'button'; b.setAttribute('aria-label', 'Zu Takt ' + t.nr); b.addEventListener('click', function () { springe(t.idx); }); l.appendChild(b); });
      w.appendChild(l);
    }
    return w;
  }
  function springe(idx) {
    var el = document.getElementById('takt-' + idx); if (!el) return;
    el.scrollIntoView({ behavior: bewegungAus ? 'auto' : 'smooth', block: 'center' });
    el.classList.remove('blink'); void el.offsetWidth; el.classList.add('blink');
  }
  function zeigeErgebnis() {
    var E = S.ergebnis;
    $('#leer').hidden = !!E; $('#ergebnis').hidden = !E;
    $('#schritt3').classList.toggle('erledigt', !!E && E.quelle === 'scan');
    if (!E) return;
    var A = E.analyse;
    var banner = $('#banner');
    if (E.quelle === 'beispiel') { banner.hidden = false; $('#bannerText').textContent = 'Beispiel: eine selbst geschriebene kleine Übung, nicht aus einem Foto erkannt. So sieht ein Ergebnis aus – Takt 3 zeigt, wie eine unleserliche Stelle markiert wird.'; $('#bannerBtn').textContent = 'Beispiel schließen'; }
    else if (E.quelle === 'gespeichert') { var d = new Date(E.zeit); banner.hidden = false; $('#bannerText').textContent = 'Letztes Ergebnis vom ' + d.getDate() + '.' + (d.getMonth() + 1) + '., ' + d.getHours() + ':' + ('0' + d.getMinutes()).slice(-2) + ' Uhr. Die Fotos selbst werden nicht aufgehoben.'; $('#bannerBtn').textContent = 'Verwerfen'; }
    else banner.hidden = true;
    var f = $('#fakten'); f.textContent = '';
    f.appendChild(fakt('Takte', String(A.takte.length)));
    f.appendChild(fakt('Taktart', A.ohneTakt ? 'fehlt' : A.beats + '/' + A.beatType + (A.zeitWechsel ? ' …' : '')));
    f.appendChild(fakt('Tonart', tonartText(A.fifths, A.mode)));
    f.appendChild(fakt('Systeme', String(A.staves)));
    if (E.ranges && E.ranges.length > 1) f.appendChild(fakt('Seiten', String(E.ranges.length)));
    var w = $('#warnungen'); w.textContent = '';
    if (A.unleserlich.length) w.appendChild(warnZeile(A.unleserlich.length === 1 ? '1 Takt ist als unleserlich markiert und leer. Trage ihn aus dem Original nach:' : A.unleserlich.length + ' Takte sind als unleserlich markiert und leer. Trage sie aus dem Original nach:', A.unleserlich));
    if (A.auffaellig.length) w.appendChild(warnZeile((A.auffaellig.length === 1 ? '1 Takt' : A.auffaellig.length + ' Takte') + ' mit Notenwerten, die nicht zur Taktart passen – vermutlich verlesen:', A.auffaellig));
    if (A.ohneTakt) w.appendChild(warnZeile('Keine Taktart erkannt. Für MIDI wird 4/4 angenommen.', null));
    (E.seitenWarnungen || []).forEach(function (t) { w.appendChild(warnZeile(t, null, true)); });
    if (!A.unleserlich.length && !A.auffaellig.length && A.noten && E.quelle === 'scan' && !(E.seitenWarnungen || []).length) {
      var ok = h('div', 'warnung'); ok.style.background = 'var(--gut-weich)'; ok.appendChild(h('span', null, 'Keine unleserlichen oder auffälligen Takte. Vergleiche trotzdem kurz mit dem Original.')); w.appendChild(ok);
    }
    $('#tempoHerkunft').textContent = A.tempo ? 'In den Noten steht Tempo ' + A.tempo + '. Ändern wirkt nur auf die MIDI-Datei.' : 'In den Noten steht keine Metronomzahl. Das Tempo wirkt nur auf die MIDI-Datei.';
    zeigeSpeichern();
    zeigeTakte();
  }
  function zeigeSpeichern() {
    var lokal = S.laufzeit === 'lokal', da = !!S.downloads;
    $('#speicherKnoepfe').hidden = !(lokal || da);
    $('#speicherHinweis').textContent = lokal ? 'Lokal geöffnet: Die Dateien werden direkt als .musicxml und .mid gespeichert.'
      : da ? 'In Claude kommt jede Datei als ZIP, weil Claude .musicxml und .mid nicht direkt speichert. Auf dem iPhone die ZIP in der Dateien-App antippen – dann liegt die Datei daneben.'
        : S.laufzeit === 'pruefe' ? 'Speichern wird vorbereitet …' : 'Speichern ist in dieser Ansicht nicht verfügbar. Kopiere stattdessen den MusicXML-Text.';
  }
  function zeichenChip(ev) {
    var c = h('span', 'z' + (ev.pause ? ' pause' : '') + (ev.bogen ? ' bogen' : '') + (ev.triole ? ' triole' : ''));
    var namen = h('span', 'namen');
    if (ev.pause) namen.appendChild(h('b', null, 'Pause'));
    else if (!ev.toene.length) namen.appendChild(h('b', null, '×'));
    else ev.toene.slice().sort(function (a, b) { return b.midi - a.midi; }).forEach(function (t) {
      var b = h('b', null, S.namen === 'de' ? t.de : t.int);
      if (t.finger && t.finger.length) { var fi = h('span', 'fi', t.finger.join(' ')); fi.title = 'Fingersatz'; b.appendChild(fi); }
      namen.appendChild(b);
    });
    c.appendChild(namen); c.appendChild(h('i', null, ev.wert + (ev.triole ? ' · 3' : '')));
    if (ev.triole) c.title = 'Triole';
    return c;
  }
  function taktKarte(t, A) {
    var art = h('article', 'takt' + (t.unleserlich ? ' ist-unleserlich' : t.auffaellig ? ' ist-auffaellig' : ''));
    art.id = 'takt-' + t.idx; art.setAttribute('aria-label', 'Takt ' + t.nr);
    art.appendChild(h('div', 'takt-nr', t.nr));
    var sp = h('div', 'spuren');
    if (t.unleserlich) sp.appendChild(h('p', 'takt-hinweis', 'Unleserlich – bitte im Original nachsehen.'));
    else {
      var nummern = []; for (var s = 1; s <= A.staves; s++) nummern.push(s);
      Object.keys(t.systeme).forEach(function (k) { k = +k; if (nummern.indexOf(k) < 0) nummern.push(k); });
      nummern.forEach(function (s) {
        var row = h('div', 'spur');
        if (nummern.length > 1) row.appendChild(h('span', 'spur-name', s === 1 ? 'oben' : s === 2 ? 'unten' : 'Sys. ' + s));
        var z = h('div', 'zeichen'), evs = t.systeme[s] || [];
        if (!evs.length) z.appendChild(h('span', 'nichts', 'leer'));
        evs.forEach(function (ev) { z.appendChild(zeichenChip(ev)); });
        row.appendChild(z); sp.appendChild(row);
      });
      if (t.auffaellig) sp.appendChild(h('p', 'takt-hinweis', t.auffaellig));
    }
    art.appendChild(sp);
    return art;
  }
  function zeigeTakte() {
    var box = $('#takte'), E = S.ergebnis, A = E.analyse; box.textContent = '';
    var ranges = (E.ranges && E.ranges.length) ? E.ranges : [{ seite: 1, von: 0, bis: A.takte.length - 1 }];
    var frag = document.createDocumentFragment();
    ranges.forEach(function (r) {
      if (!A.takte[r.von] || !A.takte[r.bis]) return;
      var kopf = h('div', 'seiten-kopf');
      kopf.appendChild(h('h4', null, ranges.length > 1 || r.url ? 'Seite ' + r.seite : 'Alle Takte'));
      kopf.appendChild(h('span', 'klein', 'Takte ' + A.takte[r.von].nr + '–' + A.takte[r.bis].nr));
      if (r.url && S.seiten.some(function (p) { return p.url === r.url; })) {
        var b = h('button', 'text-knopf', 'Original ansehen'); b.type = 'button';
        b.addEventListener('click', function () { zeigeLupe(r.url, 'Seite ' + r.seite); }); kopf.appendChild(b);
      }
      frag.appendChild(kopf);
      var g = h('div', 'takt-gitter');
      for (var i = r.von; i <= r.bis; i++) g.appendChild(taktKarte(A.takte[i], A));
      frag.appendChild(g);
    });
    box.appendChild(frag);
  }

  /* ---------- Speichern ---------- */
  function dateiname() {
    var n = ($('#nameIn').value || '').replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue').replace(/Ä/g, 'Ae').replace(/Ö/g, 'Oe').replace(/Ü/g, 'Ue').replace(/ß/g, 'ss');
    try { n = n.normalize('NFD').replace(/[\u0300-\u036f]/g, ''); } catch (e) { }
    n = n.replace(/[^\x20-\x7e]+/g, '').replace(/[\\/:*?"<>|\u0000-\u001f]+/g, '-').replace(/\s+/g, ' ').trim().slice(0, 60);
    return n || 'Noten';
  }
  function ladeLokal(name, blob) {
    var a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name; a.hidden = true;
    document.body.appendChild(a); a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 4000);
  }
  var DL_TEXT = {
    declined: 'Nicht gespeichert.',
    rate_limited: 'Es ist schon ein Speichern-Fenster offen. Schließe es zuerst.',
    host_unavailable: 'Diese App kann keine Dateien speichern. Öffne die Seite im Browser oder am Computer.',
    too_large: 'Die Datei ist zu groß zum Speichern.',
    rejected_extension: 'Dieses Dateiformat lässt Claude hier nicht zu.',
    extension_not_enabled: 'Dieses Dateiformat ist hier gerade gesperrt.'
  };
  function speichere(art) {
    var E = S.ergebnis; if (!E) return;
    var base = dateiname(), datei, daten;
    try {
      if (art === 'xml') { datei = base + '.musicxml'; daten = new TextEncoder().encode(E.xml); }
      else { datei = base + '.mid'; daten = baueMidi(E.doc, S.tempo, base); }
    } catch (e) { toast('Die Datei ließ sich nicht erzeugen.'); return; }
    if (S.laufzeit === 'lokal') {
      ladeLokal(datei, new Blob([daten], { type: art === 'xml' ? 'application/vnd.recordare.musicxml+xml' : 'audio/midi' }));
      toast('Gespeichert: ' + datei); return;
    }
    if (!S.downloads) { toast('Speichern ist in dieser Ansicht nicht verfügbar.'); return; }
    var zipName = base + (art === 'xml' ? ' MusicXML' : ' MIDI') + '.zip';
    Promise.resolve().then(function () { return S.downloads.save({ filename: zipName, data: zip([{ name: datei, data: daten }]) }); }).then(function (r) {
      toast(r && r.status === 'delivered' ? 'Übergeben.' : 'Gespeichert: ' + zipName);
    }, function (e) {
      var code = (e && e.code) || 'unavailable';
      if (DL_TEXT[code]) { toast(DL_TEXT[code]); if (code === 'host_unavailable') { S.downloads = null; zeigeSpeichern(); } return; }
      if (code === 'bad_request' || code === 'transform_error') { toast('Speichern hat nicht geklappt.'); return; }
      S.downloads = null; zeigeSpeichern(); toast('Speichern ist in dieser Ansicht nicht verfügbar.');
    });
  }
  function kopiere() {
    var E = S.ergebnis; if (!E) return;
    var ta = $('#xmlText');
    function zeigeFeld() { ta.value = E.xml; ta.hidden = false; ta.focus(); ta.select(); toast('Markiert – jetzt kopieren.'); }
    try {
      var pr = navigator.clipboard && navigator.clipboard.writeText(E.xml);
      if (pr && pr.then) pr.then(function () { toast('MusicXML-Text kopiert.'); }, zeigeFeld); else zeigeFeld();
    } catch (e) { zeigeFeld(); }
  }

  /* ---------- Lupe ---------- */
  var lupeVorher = null;
  function zeigeLupe(url, titel) {
    lupeVorher = document.activeElement;
    $('#lupeImg').src = url; $('#lupeTitel').textContent = titel || 'Original';
    var l = $('#lupe'); l.classList.remove('gross'); $('#lupeGross').textContent = 'Größer'; l.hidden = false; $('#lupeZu').focus();
  }
  function schliesseLupe() { $('#lupe').hidden = true; $('#lupeImg').removeAttribute('src'); if (lupeVorher && lupeVorher.focus) lupeVorher.focus(); }

  /* ---------- Beispiel (selbst geschrieben) ---------- */
  function n(step, oct, dur, typ, staff, x) {
    x = x || {};
    var s = '<note>' + (x.chord ? '<chord/>' : '') + (step ? '<pitch><step>' + step + '</step><octave>' + oct + '</octave></pitch>' : '<rest/>') + '<duration>' + dur + '</duration>';
    if (x.tie) s += '<tie type="' + x.tie + '"/>';
    s += '<voice>' + (staff === 1 ? 1 : 5) + '</voice><type>' + typ + '</type>';
    if (x.trip) s += '<time-modification><actual-notes>3</actual-notes><normal-notes>2</normal-notes></time-modification>';
    s += '<staff>' + staff + '</staff>';
    var no = '';
    if (x.tie) no += '<tied type="' + x.tie + '"/>';
    if (x.tup) no += '<tuplet type="' + x.tup + '"/>';
    if (x.f) no += '<technical><fingering>' + x.f + '</fingering></technical>';
    if (no) s += '<notations>' + no + '</notations>';
    return s + '</note>';
  }
  function beispielXml() {
    var b = '<backup><duration>96</duration></backup>';
    return '<score-partwise version="4.0"><work><work-title>Beispiel Übung in C</work-title></work>' +
      '<part-list><score-part id="P1"><part-name>Klavier</part-name></score-part></part-list><part id="P1">' +
      '<measure number="1"><attributes><divisions>24</divisions><key><fifths>0</fifths><mode>major</mode></key><time><beats>4</beats><beat-type>4</beat-type></time><staves>2</staves><clef number="1"><sign>G</sign><line>2</line></clef><clef number="2"><sign>F</sign><line>4</line></clef></attributes>' +
      '<direction placement="above"><direction-type><words>Ruhig</words></direction-type><staff>1</staff><sound tempo="80"/></direction>' +
      n('C', 4, 24, 'quarter', 1, { f: 1 }) + n('D', 4, 24, 'quarter', 1, { f: 2 }) + n('E', 4, 24, 'quarter', 1, { f: 3 }) + n('F', 4, 24, 'quarter', 1, { f: 4 }) + b +
      n('C', 3, 96, 'whole', 2, { f: 5 }) + n('E', 3, 96, 'whole', 2, { chord: 1, f: 3 }) + n('G', 3, 96, 'whole', 2, { chord: 1, f: 1 }) + '</measure>' +
      '<measure number="2">' + n('G', 4, 48, 'half', 1, { f: 5, tie: 'start' }) + n('G', 4, 24, 'quarter', 1, { tie: 'stop' }) + n(null, 0, 24, 'quarter', 1) + b +
      n('G', 2, 48, 'half', 2, { f: 5 }) + n('C', 3, 48, 'half', 2, { f: 1 }) + '</measure>' +
      '<measure number="3"><!-- unleserlich --></measure>' +
      '<measure number="4">' + n('E', 4, 8, 'eighth', 1, { trip: 1, tup: 'start', f: 3 }) + n('D', 4, 8, 'eighth', 1, { trip: 1, f: 2 }) + n('C', 4, 8, 'eighth', 1, { trip: 1, tup: 'stop', f: 1 }) +
      n('D', 4, 24, 'quarter', 1, { f: 2 }) + n('C', 4, 48, 'half', 1, { f: 1 }) + b + n('C', 3, 96, 'whole', 2, { f: 5 }) + '</measure>' +
      '</part></score-partwise>';
  }
  function zeigeBeispiel() {
    var r = pruefeXml(beispielXml()); if (!r.doc) return;
    var f = fuegeZusammen([{ doc: r.doc, nr: 1, url: '' }]);
    S.nameEigen = false; S.tempoEigen = false;
    setzeErgebnis(f.doc, f.ranges, 'beispiel');
    $('#ergebnis').scrollIntoView({ behavior: bewegungAus ? 'auto' : 'smooth', block: 'start' });
  }

  /* ---------- Ereignisse ---------- */
  $('#ablage').addEventListener('click', waehle); ablageZiel($('#ablage'));
  $('#zufuegenBtn').addEventListener('click', waehle); ablageZiel($('#zufuegenBtn'));
  $('#dateiIn').addEventListener('change', function (e) { var fs = e.target.files; if (fs && fs.length) fuegeDateienHinzu(fs); e.target.value = ''; });
  document.addEventListener('paste', function (e) {
    var fs = e.clipboardData && e.clipboardData.files; if (!fs || !fs.length) return;
    if (Array.prototype.some.call(fs, function (f) { return /^image\//.test(f.type); })) { e.preventDefault(); fuegeDateienHinzu(fs); }
  });
  $('#scanBtn').addEventListener('click', erkenneAlle);
  $('#stopBtn').addEventListener('click', function () { S.stopp = true; if (S.ctl) S.ctl.abort(); status('Wird angehalten …'); });
  $('#beispielBtn').addEventListener('click', zeigeBeispiel);
  $('#bannerBtn').addEventListener('click', function () {
    if (S.ergebnis && S.ergebnis.quelle === 'gespeichert') schreib(SPEICHER, null);
    S.ergebnis = null; S.nameEigen = false; S.tempoEigen = false; aktualisiereErgebnis(); zeigeErgebnis();
  });
  $('#xmlBtn').addEventListener('click', function () { speichere('xml'); });
  $('#midiBtn').addEventListener('click', function () { speichere('midi'); });
  $('#kopierBtn').addEventListener('click', kopiere);
  $('#nameIn').addEventListener('input', function () { S.nameEigen = true; });
  $('#nameIn').addEventListener('change', speichereLokal);
  function setzeTempo(v) { v = Math.round(+v); if (!isFinite(v)) return; S.tempo = Math.max(30, Math.min(240, v)); S.tempoEigen = true; $('#tempoIn').value = S.tempo; }
  $('#tempoIn').addEventListener('change', function (e) { setzeTempo(e.target.value); });
  $('#tempoMinus').addEventListener('click', function () { setzeTempo(S.tempo - 5); });
  $('#tempoPlus').addEventListener('click', function () { setzeTempo(S.tempo + 5); });
  function namenStil(st) {
    S.namen = st; schreib(NAMEN_KEY, st);
    $('#namenDe').setAttribute('aria-pressed', String(st === 'de')); $('#namenInt').setAttribute('aria-pressed', String(st === 'int'));
    if (S.ergebnis) zeigeTakte();
  }
  $('#namenDe').addEventListener('click', function () { namenStil('de'); });
  $('#namenInt').addEventListener('click', function () { namenStil('int'); });
  $('#lupeZu').addEventListener('click', schliesseLupe);
  $('#lupeGross').addEventListener('click', function () { var l = $('#lupe'); l.classList.toggle('gross'); this.textContent = l.classList.contains('gross') ? 'Kleiner' : 'Größer'; });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !$('#lupe').hidden) schliesseLupe(); });

  namenStil(S.namen);
  ladeGespeichertes();
  zeigeSeiten(); zeigeErgebnis();
  starte();
})();
