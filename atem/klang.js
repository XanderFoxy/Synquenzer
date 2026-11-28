// Atem 0.2.3 – „Klang & Vagus“ (#klang): bildhafte Erklärung mit Evidenz-Ampel, Klang-Atem (Klangteppich, der mit dem Atem geht,
// optional binaurale Beats / isochrone Pulse), Wege zu den passenden Übungen, Summ-Atmung mit Mikrofon (#klang/summen, summ-mikro.js)
// und Selbsthypnose/Körperreise mit Systemstimme (#klang/hypnose/<id>, hypnose.js). Lädt erst beim Öffnen. Nichts wird gesendet.
import { RHYTHMEN, BEATS, TRAEGER, TIEF, HOCH, erzeugeKlang } from './klang-motor.js';

// ---------- Quellen dieser Seite (eigene Kurzfassung; „suche“ = Link führt zur Titelsuche in der Literaturdatenbank) ----------
const PM = (t) => 'https://pubmed.ncbi.nlm.nih.gov/?term=' + encodeURIComponent(t);
export const KQ = {
  breit2018: { kurz: 'Breit u. a. 2018', art: 'Übersicht', jahr: 2018, link: 'https://www.frontiersin.org/articles/10.3389/fpsyt.2018.00044/full', titel: 'Vagus nerve as modulator of the brain–gut axis (Front Psychiatry)' },
  laborde2022: { kurz: 'Laborde u. a. 2022', art: 'Meta-Analyse, 223 Studien', jahr: 2022, link: 'https://doi.org/10.1016/j.neubiorev.2022.104711', titel: 'Effects of voluntary slow breathing on heart rate and heart rate variability' },
  lehrer2014: { kurz: 'Lehrer & Gevirtz 2014', art: 'Übersicht', jahr: 2014, link: 'https://doi.org/10.3389/fpsyg.2014.00756', titel: 'Heart rate variability biofeedback: how and why does it work?' },
  grossman2007: { kurz: 'Grossman & Taylor 2007', art: 'Übersicht', jahr: 2007, link: PM('Toward understanding respiratory sinus arrhythmia: relations to cardiac vagal tone, evolution and biobehavioral functions'), titel: 'Atem-Herz-Welle und „Vagustonus“: Atemtiefe und -tempo beeinflussen die Messung', suche: true },
  fincham2023: { kurz: 'Fincham u. a. 2023', art: 'Meta-Analyse, 12 Studien, 785 Personen', jahr: 2023, link: 'https://doi.org/10.1038/s41598-022-27247-y', titel: 'Effect of breathwork on stress and mental health' },
  dewitte2020: { kurz: 'de Witte u. a. 2020', art: 'Übersicht + 2 Meta-Analysen', jahr: 2020, link: 'https://pubmed.ncbi.nlm.nih.gov/31167611/', titel: 'Effects of music interventions on stress-related outcomes' },
  balban2023: { kurz: 'Balban u. a. 2023', art: 'Studie, 108 Personen', jahr: 2023, link: 'https://doi.org/10.1016/j.xcrm.2022.100895', titel: 'Brief structured respiration practices enhance mood and reduce physiological arousal' },
  weitzberg2002: { kurz: 'Weitzberg & Lundberg 2002', art: 'Messstudie, 10 Personen', jahr: 2002, link: 'https://pubmed.ncbi.nlm.nih.gov/12119224/', titel: 'Humming greatly increases nasal nitric oxide' },
  garcia2019: { kurz: 'Garcia-Argibay u. a. 2019', art: 'Meta-Analyse', jahr: 2019, link: PM('Efficacy of binaural auditory beats in cognition, anxiety, and pain perception: a meta-analysis'), titel: 'Binaurale Beats: Gedächtnis, Aufmerksamkeit, Angst, Schmerz', suche: true },
  ingendoh2023: { kurz: 'Ingendoh u. a. 2023', art: 'Systematische Übersicht', jahr: 2023, link: PM('Binaural beats to entrain the brain? A systematic review of the effects of binaural beat stimulation on brain oscillatory activity'), titel: 'Ziehen binaurale Beats die Hirnwellen mit? Ergebnisse widersprüchlich', suche: true },
  calamassi2019: { kurz: 'Calamassi & Pomponi 2019', art: 'Pilotstudie', jahr: 2019, link: PM('Music tuned to 440 Hz versus 432 Hz and the health effects: a double-blind cross-over pilot study'), titel: '432 Hz gegen 440 Hz – kleine Pilotstudie', suche: true },
  barratt2022: { kurz: 'Barratt u. a. 2022', art: 'Umfrage', jahr: 2022, link: PM('Who uses digital drugs? An international survey of binaural beat consumers'), titel: 'Wer nutzt „digitale Drogen“? (Umfrage, keine Wirkungsstudie)', suche: true },
  wolf2021: { kurz: 'Wolf u. a. 2021', art: 'Meta-Analyse', jahr: 2021, link: 'https://doi.org/10.1111/psyp.13933', titel: 'Reizung des Vagus am Ohr hebt die Herzratenvariabilität nicht' },
  valentine2019: { kurz: 'Valentine u. a. 2019', art: 'Meta-Analyse', jahr: 2019, link: PM('The efficacy of hypnosis as a treatment for anxiety: a meta-analysis'), titel: 'Hypnose gegen Angst (meist mit Therapeut)', suche: true }
};

// ---------- Evidenz-Ampel (gruen = belegt, gelb = unsicher, rot = nicht belegt) ----------
const AMPEL = [
  ['gruen', 'Langsam atmen', 'Unter 10 Zügen pro Minute wird die Herz-Welle größer – während und kurz nach dem Üben.', ['laborde2022', 'lehrer2014'], 'gut belegt'],
  ['gruen', 'Regelmäßig üben', 'Atemübungen über Wochen: etwas weniger Stress (kleine bis mittlere Wirkung).', ['fincham2023'], 'teils belegt'],
  ['gruen', 'Ruhige Musik', 'Musik hören senkt in vielen Studien Stress-Werte und Anspannung.', ['dewitte2020'], 'teils belegt'],
  ['gelb', 'Seufzer-Atmung', 'Eine gute Studie: 5 Minuten täglich hoben die Stimmung. Mehr Studien sind nötig.', ['balban2023']],
  ['gelb', 'Summen', 'Macht das Ausatmen von selbst lang. In der Nase steigt ein Botenstoff stark an – ob das nützt, ist offen.', ['weitzberg2002']],
  ['gelb', 'Binaurale Beats', 'Kleine Effekte auf Angst und Schmerz in einer Meta-Analyse, aber uneinheitliche Studien. Dass das Gehirn den Takt „übernimmt“, zeigte nur ein Teil der Studien.', ['garcia2019', 'ingendoh2023']],
  ['gelb', 'Isochrone Pulse', 'Kaum gute Studien. Wirkung unklar – als ruhiger Klang kann es trotzdem angenehm sein.', []],
  ['rot', '432 Hz, „Heilfrequenzen“', 'Dass 432 Hz, 528 Hz oder „Solfeggio-Töne“ heilen oder Zellen reparieren, ist nicht belegt. Zu 432 Hz gibt es nur wenige, sehr kleine Studien.', ['calamassi2019']],
  ['rot', '„Digitale Drogen“ aus Tönen', 'Töne, die einen Rausch auslösen sollen: keine Belege. Eine Umfrage zeigt nur, dass manche es ausprobieren.', ['barratt2022']],
  ['rot', '„Vagus-Reset“ in Sekunden', 'Nicht belegt. Messbar sind Änderungen für Minuten. Elektrische Reizung am Ohr hob die Herz-Welle in einer Meta-Analyse nicht.', ['wolf2021']]
];
const AMPEL_W = { gruen: 'belegt', gelb: 'unsicher', rot: 'nicht belegt' };

// ---------- Zeichnungen (eigene SVG, keine Emoji) ----------
const SV = (inhalt, vb = '0 0 24 24', cls = '') => `<svg class="${cls}" viewBox="${vb}" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">${inhalt}</svg>`;
const ICO = {
  welle: '<path d="M2 12c2.5-5 5-5 7.5 0s5 5 7.5 0 3.5-4 5-2"/>',
  lang: '<path d="M3 12h15"/><path d="m14 8 4 4-4 4"/><path d="M3 8v8"/>',
  summen: '<path d="M7 9.5c0-2.8 2.2-5 5-5s5 2.2 5 5v3c0 2.8-2.2 5-5 5s-5-2.2-5-5z"/><path d="M9.5 13.5h5"/><path d="M19.5 9c1 1.8 1 4.2 0 6M4.5 9c-1 1.8-1 4.2 0 6"/>',
  seufzer: '<path d="M4 15c2-6 4-6 5-2 1 3 2 3 3 1"/><path d="M12 14c2.5 0 5.5 1 8 3"/>',
  kopfhoerer: '<path d="M4 15v-3a8 8 0 0 1 16 0v3"/><rect x="3" y="14" width="4" height="7" rx="1.6"/><rect x="17" y="14" width="4" height="7" rx="1.6"/>',
  ohr: '<path d="M8 9a5 5 0 0 1 10 0c0 3-3 4-3 7a3 3 0 0 1-5.5 1.6"/><path d="M11 10a2 2 0 0 1 4 0c0 1.5-1.5 2-1.5 3.5"/>',
  mikro: '<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5.5 11a6.5 6.5 0 0 0 13 0M12 17.5V21M8.5 21h7"/>',
  mond: '<path d="M19 15.5A8 8 0 0 1 8.5 5a8 8 0 1 0 10.5 10.5z"/>',
  koerper: '<circle cx="12" cy="4.5" r="2"/><path d="M12 7v7M7 10l5-2 5 2M9 21l3-7 3 7"/>',
  liegen: '<circle cx="5" cy="12" r="2"/><path d="M8 13h12M8 13l3-3h5l4 3M3 17h18"/>',
  halten: '<circle cx="12" cy="12" r="8"/><path d="M12 7.5V12l3 2"/>',
  pause: '<path d="M9 6v12M15 6v12"/>', play: '<path d="M8 5l11 7-11 7z"/>', zu: '<path d="M6 6l12 12M18 6L6 18"/>', weiter: '<path d="m9 6 6 6-6 6"/>'
};
const ico = (n, cls = 'kl-ico') => SV(ICO[n] || '', '0 0 24 24', cls);
// Figur mit Vagus-Leitung: Gehirn → Hals → Herz/Lunge → Bauch; Knoten leuchten nacheinander von unten nach oben auf („meldet nach oben“)
const FIGUR = `<svg class="kl-figur" viewBox="0 0 200 236" aria-hidden="true">
  <defs><linearGradient id="kl-vg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" style="stop-color:var(--kl-v1)"/><stop offset="1" style="stop-color:var(--kl-v2)"/></linearGradient></defs>
  <g class="kl-koerper"><circle cx="100" cy="40" r="25"/><path d="M89 63c0 9-2 14-10 18l-22 8c-11 4-17 14-17 28v119h120V117c0-14-6-24-17-28l-22-8c-8-4-10-9-10-18"/></g>
  <g class="kl-nerv"><path class="kl-nerv-hof" d="M100 52c-3 16-6 32-8 50-2 16-4 28 0 42 4 14 8 26 10 44 2 12 10 18 18 22"/>
    <path d="M100 52c-3 16-6 32-8 50-2 16-4 28 0 42 4 14 8 26 10 44 2 12 10 18 18 22"/><path d="M92 106c10-5 20-3 26 5M92 106c-10-5-20-3-26 5M91 124c-6 2-10 6-10 12"/></g>
  <g class="kl-knoten"><circle class="k3" cx="100" cy="44" r="6"/><circle class="k2" cx="81" cy="138" r="6"/><circle class="k1" cx="112" cy="196" r="6"/></g>
  <g class="kl-schrift"><text x="132" y="36">Gehirn</text><text x="22" y="142">Herz</text><text x="128" y="214">Bauch</text></g></svg>`;
// Atem und Puls im Gleichtakt (Atem-Herz-Welle): 2 Atemzüge im Bild, die Linie braucht 20 s (= 10 s je Zug = 6 Züge pro Minute; Prüfung: vorher 10 s = 12/min), nur transform
const WELLE = (() => { let a = 'M0 75', p = 'M0 ' + (52 - 18 * Math.sin(-Math.PI / 2 - 0.35)).toFixed(1); for (let x = 4; x <= 300; x += 4) { const w = Math.sin((x / 150) * Math.PI * 2 - Math.PI / 2); a += ` L${x} ${(45 - 30 * w).toFixed(1)}`; p += ` L${x} ${(52 - 18 * Math.sin((x / 150) * Math.PI * 2 - Math.PI / 2 - 0.35)).toFixed(1)}`; } return `<svg class="kl-welle" viewBox="0 0 300 92" aria-hidden="true"><path class="kl-w-atem" d="${a}"/><path class="kl-w-puls" d="${p}"/><g class="kl-w-jetzt"><line x1="0" y1="4" x2="0" y2="90"/></g></svg>`; })();

// ---------- Stil (nur diese Seite; Farben über die App-Token, hell/dunkel) ----------
const CSS = `
.kl{--kl-gruen:#3fe08f;--kl-gelb:#ffcf5c;--kl-rot:#ff8f7e;--kl-v1:#9befff;--kl-v2:#ffcf5c}
:root[data-thema="hell"] .kl{--kl-gruen:#12864f;--kl-gelb:#8a5d00;--kl-rot:#b23a2a;--kl-v1:#0b7a92;--kl-v2:#a24f15}
.kl-ico{width:24px;height:24px;flex:none}
.kl-held{position:relative;display:grid;grid-template-columns:118px 1fr;gap:4px 14px;align-items:center;background:radial-gradient(120% 90% at 20% 30%,#1b2f4a 0%,#0b1020 70%);border-radius:var(--r3,28px);padding:16px 18px 16px 8px;color:#eef2f6;overflow:hidden}
:root[data-thema="hell"] .kl-held{background:radial-gradient(120% 90% at 20% 30%,#dff3f7 0%,#f5f1ea 75%);color:var(--t1)}
.kl-held h2{margin:2px 0 6px;font:var(--f-titel)}.kl-held p{margin:0;font:var(--f-klein);color:inherit;opacity:.88}.kl-held .ueber{color:var(--kl-v1);margin:0}
.kl-figur{width:118px;height:auto;display:block}
.kl-koerper{fill:rgba(150,170,255,.08);stroke:#5b6bc0;stroke-width:1.5}:root[data-thema="hell"] .kl-koerper{fill:rgba(11,122,146,.06);stroke:#8a8174}
.kl-nerv path{fill:none;stroke:url(#kl-vg);stroke-width:3;stroke-linecap:round}.kl-nerv .kl-nerv-hof{stroke-width:11;opacity:.22;animation:kl-atmen 10s ease-in-out infinite}
.kl-knoten circle{fill:var(--kl-v2);opacity:.35;transform-box:fill-box;transform-origin:center;animation:kl-knoten 4s ease-in-out infinite}
.kl-knoten .k1{animation-delay:0s}.kl-knoten .k2{animation-delay:.6s}.kl-knoten .k3{animation-delay:1.2s;fill:var(--kl-v1)}
.kl-schrift text{font:600 19px var(--font);fill:currentColor;opacity:.85}
@keyframes kl-knoten{0%,100%{opacity:.3;transform:scale(.8)}25%{opacity:1;transform:scale(1.25)}50%{opacity:.4;transform:scale(.9)}}
@keyframes kl-atmen{0%,100%{opacity:.12}50%{opacity:.38}}
.kl-wege{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px;margin:12px 0}
.kl-weg{background:var(--fl1);border-radius:var(--r2,20px);padding:12px 10px;display:flex;flex-direction:column;gap:6px;min-height:118px;color:var(--t1);text-decoration:none}
.kl-weg .kl-ico{color:var(--ein);width:28px;height:28px}.kl-weg b{font:var(--f-klein);font-weight:650;line-height:1.2}.kl-weg small{font:var(--f-mini);color:var(--t2)}
.kl-pkt{display:inline-block;width:10px;height:10px;border-radius:50%;flex:none;background:var(--kl-gruen)}.kl-pkt.gelb{background:var(--kl-gelb)}.kl-pkt.rot{background:var(--kl-rot)}.kl-pkt.leer{background:var(--fl3)}
.kl-wellen-karte{background:var(--fl1);border-radius:var(--r2,20px);padding:12px 16px;margin:12px 0}
.kl-welle{width:100%;height:auto;display:block;overflow:visible}.kl-w-atem{fill:none;stroke:var(--ein);stroke-width:3}.kl-w-puls{fill:none;stroke:var(--aus);stroke-width:2;stroke-dasharray:5 5}
.kl-w-jetzt line{stroke:var(--t3);stroke-width:1.5}.kl-w-jetzt{animation:kl-lauf 20s linear infinite}
@keyframes kl-lauf{from{transform:translateX(0)}to{transform:translateX(300px)}}
.kl-legende{display:flex;flex-wrap:wrap;gap:4px 14px;font:var(--f-mini);color:var(--t2);margin:4px 0 2px}.kl-legende i{display:inline-block;width:16px;height:3px;border-radius:2px;background:var(--ein);vertical-align:3px;margin-inline-end:6px}.kl-legende i.p{background:var(--aus)}
.kl-spiel{background:linear-gradient(160deg,color-mix(in srgb,var(--ein) 16%,var(--fl1)) 0%,var(--fl1) 55%);border-radius:var(--r3,28px);padding:16px;margin:12px 0}
.kl-spiel-kopf{display:flex;gap:12px;align-items:center}.kl-spiel-kopf h2{margin:0}.kl-spiel-kopf p{margin:2px 0 0;font:var(--f-klein);color:var(--t2)}
.kl-spiel-sym{width:52px;height:52px;border-radius:16px;background:var(--fl2);display:flex;align-items:center;justify-content:center;color:var(--ein);flex:none}.kl-spiel-sym svg{width:34px;height:34px}
.kl-lbl{display:flex;align-items:center;gap:8px;font:var(--f-mini);letter-spacing:var(--ls-ueber);text-transform:uppercase;color:var(--t3);margin:14px 0 4px}
.kl .seg{margin:0}.kl .seg.vier{grid-template-columns:repeat(4,minmax(0,1fr))}.kl .seg .chip{padding:0 4px;line-height:1.1;white-space:normal}.kl .seg .chip small{display:block;font:var(--f-mini);font-size:11px;color:var(--t3);margin-top:2px}
.kl-unsicher{display:inline-flex;align-items:center;gap:5px;text-transform:none;letter-spacing:0;background:color-mix(in srgb,var(--kl-gelb) 18%,transparent);color:var(--t1);border-radius:999px;padding:2px 9px;font:var(--f-mini)}
.kl-beat{margin-top:6px}.kl-reihe{display:flex;justify-content:space-between;gap:8px}.kl-beat[hidden]{display:none}
.kl-tipp{display:flex;gap:10px;align-items:flex-start;background:var(--hinweis-bg);border-radius:var(--r1,12px);padding:10px 12px;margin:8px 0;font:var(--f-klein);color:var(--t2)}.kl-tipp .kl-ico{color:var(--t2)}
.kl-start{margin-top:12px}
.kl-ampel{background:var(--fl1);border-radius:var(--r2,20px);padding:4px 14px;margin:8px 0}
.kl-a{border-bottom:1px solid var(--linie);padding:10px 0}.kl-a:last-child{border-bottom:0}
.kl-a summary{list-style:none;display:flex;gap:10px;align-items:center;min-height:44px;cursor:pointer;color:var(--t1)}.kl-a summary::-webkit-details-marker{display:none}
.kl-a summary b{flex:1;font:var(--f-kopf);font-size:17px}.kl-a summary small{font:var(--f-mini);color:var(--t2);white-space:nowrap}.kl-a summary .sym-auf{width:18px;height:18px;color:var(--t3);transition:transform var(--t-ui,180ms)}
.kl-a[open] summary .sym-auf{transform:rotate(90deg)}.kl-a p{margin:4px 0 6px 20px;font:var(--f-klein);color:var(--t2)}.kl-a .kl-q{margin-left:20px}
.kl-q{font:var(--f-mini);color:var(--t3)}.kl-q a{color:var(--ein);display:inline-flex;align-items:center;min-height:44px}
.kl-legende-a{display:flex;gap:14px;flex-wrap:wrap;font:var(--f-mini);color:var(--t2);margin:2px 0 6px}.kl-legende-a span{display:inline-flex;align-items:center;gap:6px}
.kl-kacheln{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px;margin:8px 0}
.kl-k{background:var(--fl1);border-radius:var(--r2,20px);padding:14px 12px;display:flex;flex-direction:column;gap:6px;min-height:120px;color:var(--t1);text-decoration:none;position:relative}
.kl-k .kl-ico{width:30px;height:30px;color:var(--ein)}.kl-k b{font:var(--f-klein);font-weight:650;line-height:1.2}.kl-k small{font:var(--f-mini);color:var(--t2)}
.kl-k .kl-marke{position:absolute;top:10px;inset-inline-end:10px;font:var(--f-mini);font-size:11px;background:var(--fl2);color:var(--t2);border-radius:999px;padding:1px 8px}
.kl-k.hyp .kl-ico{color:var(--lila,#c79bff)}
.kl-k:active,.kl-weg:active{transform:scale(.97)}
.kl-quellen{font:var(--f-klein)}.kl-quellen li{margin:4px 0}.kl-quellen small{color:var(--t3)}
@media (orientation:landscape){.kl-raster{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:0 22px;align-items:start}}
@media (min-width:700px) and (orientation:portrait){.kl-raster{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:0 20px;align-items:start}.kl-held{grid-template-columns:140px 1fr}.kl-figur{width:140px}}
@media (max-width:380px){.kl-held{grid-template-columns:96px 1fr}.kl-figur{width:96px}.kl-wege{grid-template-columns:1fr}.kl-weg{min-height:0;flex-direction:row;align-items:center}}
/* Spieler */
.kl-spieler{position:fixed;inset:0;z-index:40;background:radial-gradient(110% 80% at 50% 40%,#13233a 0%,#0b1020 70%);color:#eef2f6;display:grid;grid-template-rows:auto 1fr auto auto;padding:calc(8px + env(safe-area-inset-top,0px)) calc(16px + env(safe-area-inset-right,0px)) calc(12px + env(safe-area-inset-bottom,0px)) calc(16px + env(safe-area-inset-left,0px));--ein:#5ad2ea;--aus:#f4a261;--t2:#b0bccb;--t3:#8f9cac;--fl2:#1d2734;--fl1:#151d27;--linie:#2e3b4c;--rahmen:#6b7d94}
.kl-sp-kopf{display:flex;align-items:center;gap:8px;min-height:48px}.kl-sp-kopf .knopf-ico{color:#eef2f6}.kl-sp-titel{flex:1;text-align:center;font:var(--f-kopf);font-size:17px}.kl-sp-rest{min-width:44px;text-align:end;font:var(--f-klein);color:var(--t2);font-variant-numeric:tabular-nums}
.kl-sp-mitte{display:flex;align-items:center;justify-content:center;min-height:0}
.kl-orb{position:relative;width:min(78vw,46vh,340px);aspect-ratio:1;display:flex;align-items:center;justify-content:center}
.kl-orb i{position:absolute;inset:0;border-radius:50%;will-change:transform,opacity}
.kl-hof{background:radial-gradient(closest-side,rgba(90,210,234,.55),rgba(90,210,234,0) 100%)}
.kl-kern{background:radial-gradient(circle at 40% 35%,#9befff 0%,#3aa7c4 45%,#1d4f73 100%);box-shadow:0 0 0 1px rgba(155,239,255,.25) inset}
.kl-orb.aus .kl-kern{background:radial-gradient(circle at 40% 35%,#ffd2a8 0%,#e08a4a 50%,#6b3a26 100%)}.kl-orb.aus .kl-hof{background:radial-gradient(closest-side,rgba(244,162,97,.5),rgba(244,162,97,0) 100%)}
.kl-orb-text{position:relative;text-align:center;color:#06151c;pointer-events:none}.kl-orb-text b{display:block;font:var(--f-phase);font-size:40px}.kl-orb-text span{font:200 44px/1 var(--font);font-variant-numeric:tabular-nums}
.kl-orb.aus .kl-orb-text{color:#1a0e05}
.kl-sp-info{display:flex;justify-content:center;flex-wrap:wrap;gap:6px;min-height:28px;margin:6px 0}.kl-sp-info span{font:var(--f-mini);background:rgba(255,255,255,.08);border-radius:999px;padding:4px 10px;color:var(--t2)}
.kl-sp-unten{display:grid;grid-template-columns:1fr auto 1fr;align-items:center;gap:10px}
.kl-sp-pause{width:80px;height:80px;border-radius:50%;border:1.5px solid var(--rahmen);background:var(--fl2);color:#eef2f6;display:flex;align-items:center;justify-content:center}.kl-sp-pause svg{width:30px;height:30px}
.kl-sp-laut{display:flex;align-items:center;gap:6px;color:var(--t2)}.kl-sp-laut input{width:100%;min-height:44px;accent-color:var(--ein)}
.kl-sp-ton{justify-self:start;min-height:44px;border-radius:999px;border:1.5px solid #ffcf5c;color:#ffcf5c;background:transparent;padding:0 14px;font:var(--f-klein)}.kl-sp-ton[hidden]{display:none}
.kl-sp-blatt{position:absolute;inset:0;display:flex;align-items:flex-end;background:rgba(5,8,16,.55)}.kl-sp-blatt[hidden]{display:none}
.kl-sp-blatt>div{width:100%;background:#151d27;border-radius:28px 28px 0 0;padding:20px calc(20px + env(safe-area-inset-right,0px)) calc(20px + env(safe-area-inset-bottom,0px)) calc(20px + env(safe-area-inset-left,0px));display:flex;flex-direction:column;gap:10px;animation:kl-hoch var(--t-blatt,280ms) var(--kurve,ease)}
.kl-sp-blatt h2{margin:0 0 4px}.kl-sp-blatt p{margin:0;color:var(--t2)}
@keyframes kl-hoch{from{transform:translateY(30px);opacity:0}to{transform:none;opacity:1}}
@media (orientation:landscape){.kl-spieler{grid-template-columns:1fr minmax(220px,300px);grid-template-rows:auto 1fr auto;column-gap:20px}.kl-sp-kopf{grid-column:1/-1}.kl-sp-mitte{grid-row:2/4}.kl-orb{width:min(42vw,68vh,320px)}.kl-sp-info{grid-column:2;align-self:end}.kl-sp-unten{grid-column:2;grid-template-columns:auto 1fr;align-self:start}.kl-sp-unten .kl-sp-ton{grid-column:1/-1}}
@media (prefers-reduced-motion:reduce){.kl-nerv .kl-nerv-hof,.kl-knoten circle,.kl-w-jetzt{animation:none}}
`;
let stilDa = false;
const stil = () => { if (stilDa) return; stilDa = true; const s = document.createElement('style'); s.id = 'stil-klang'; s.textContent = CSS; document.head.appendChild(s); };

// ---------- Einstellungen (nur auf dem Gerät, atem.v1.klang) ----------
const STD = { rhythmus: 'r6', klang: 'meer', min: 5, laut: 0.45, beat: 'aus', band: 'theta', hz: 6, traeger: 'mittel', beatLaut: 0.5 };
const lies = (sp) => ({ ...STD, ...(sp.wert('klang', {}) || {}) });
const merke = (sp, teil) => sp.setzeWert('klang', { ...lies(sp), ...teil });
const beatVon = (e) => ({ art: e.beat, hz: e.hz, traeger: TRAEGER[e.traeger] || TRAEGER.mittel, laut: e.beatLaut });
const zahl = (x) => String(x).replace('.', ',');
const mmss = (s) => { s = Math.max(0, Math.ceil(s)); return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0'); };

// ---------- Einstieg ----------
export function zeige(c, teil, unter) {
  stil();
  if (teil === 'summen') { c.seite('Summ-Atmung', '<p class="leise">Lädt …</p>', 'mehr', 3); return import('./summ-mikro.js').then((m) => m.zeige(c), c.keinNetz); }
  if (teil === 'hypnose') { c.seite('Selbsthypnose', '<p class="leise">Lädt …</p>', 'mehr', 3); return import('./hypnose.js').then((m) => m.zeige(c, unter, { erzeugeKlang, RHYTHMEN, KQ, stil }), c.keinNetz); }
  return seite(c);
}
const quelle = (ids) => ids.length ? `<p class="kl-q">${ids.map((id) => KQ[id]).filter(Boolean).map((q) => `<a href="${q.link}" target="_blank" rel="noopener">${q.kurz}</a> · ${q.art}`).join(' · ')}</p>` : '';
const chips = (gruppe, liste, an) => liste.map(([k, n, u]) => `<button class="chip ${String(an) === String(k) ? 'an' : ''}" data-${gruppe}="${k}" aria-pressed="${String(an) === String(k)}">${n}${u ? `<small>${u}</small>` : ''}</button>`).join('');

function seite(c) {
  const { esc } = c, e = lies(c.speicher);
  const R = [['r6', '6/min', '5 · 5'], ['l46', 'Länger aus', '4 · 6'], ['seufzer', 'Seufzer', '2,5+1 · 7'], ['tief', 'Sehr ruhig', '5 · 7']];
  const aufZu = SV('<path d="m9 6 6 6-6 6"/>', '0 0 24 24', 'sym-auf');
  c.seite('Klang & Vagus', `<div class="kl"><div class="kl-raster"><div>
    <section class="kl-held"><span>${FIGUR}</span><div><span class="ueber">Dein Ruhe-Nerv</span><h2>Der Vagusnerv</h2>
      <p>Eine lange Leitung zwischen Gehirn, Herz und Bauch. Vor allem meldet er nach oben, wie es dem Körper geht – und er bremst das Herz.</p></div></section>
    <div class="kl-wege">
      <a class="kl-weg" href="#uebung/resonanz?v=6_min_gleich">${ico('welle')}<b>Langsam atmen</b><small><i class="kl-pkt"></i> etwa 6 Züge pro Minute</small></a>
      <a class="kl-weg" href="#uebung/lang_aus">${ico('lang')}<b>Länger ausatmen</b><small><i class="kl-pkt gelb"></i> beim Aus bremst das Herz</small></a>
      <a class="kl-weg" href="#klang/summen">${ico('summen')}<b>Summen</b><small><i class="kl-pkt gelb"></i> macht das Aus lang</small></a></div>
    <div class="kl-wellen-karte"><span class="ueber">Die Atem-Herz-Welle</span>${WELLE}
      <div class="kl-legende"><span><i></i>Atem</span><span><i class="p"></i>Puls</span></div>
      <p class="leise">Einatmen: Das Herz schlägt etwas schneller. Ausatmen: Der Vagus bremst es wieder. Bei etwa 6 Zügen pro Minute wird diese Welle am größten.</p>
      <p class="leise">Ehrlich gesagt: Die Welle (Herzratenvariabilität) hängt stark davon ab, wie tief und schnell du atmest. Sie ist ein Hinweis, kein direktes Maß für „Vagus-Stärke“.</p>${quelle(['lehrer2014', 'grossman2007', 'breit2018'])}</div>
    </div><div>
    <section class="kl-spiel" aria-label="Klang-Atem"><div class="kl-spiel-kopf"><span class="kl-spiel-sym">${SV(ICO.welle)}</span><div><span class="ueber">Klang-Atem</span><h2>Atmen mit Klang</h2><p>Der Klang schwillt beim Einatmen an und sinkt beim Ausatmen.</p></div></div>
      <span class="kl-lbl">Takt</span><div class="seg vier" role="group" aria-label="Takt">${chips('r', R, e.rhythmus)}</div>
      <span class="kl-lbl">Klang</span><div class="seg" role="group" aria-label="Klang">${chips('k', [['meer', 'Meer'], ['ton', 'Ton'], ['beides', 'Beides']], e.klang)}</div>
      <span class="kl-lbl">Dauer</span><div class="seg vier" role="group" aria-label="Dauer">${chips('m', [[3, '3 min'], [5, '5 min'], [10, '10 min'], [20, '20 min']], e.min)}</div>
      <span class="kl-lbl">Beats dazu <span class="kl-unsicher"><i class="kl-pkt gelb"></i>Wirkung unsicher</span></span>
      <div class="seg" role="group" aria-label="Beats">${chips('b', [['aus', 'Aus'], ['binaural', 'Binaural'], ['iso', 'Puls']], e.beat)}</div>
      <div class="kl-beat" id="kl-beat" ${e.beat === 'aus' ? 'hidden' : ''}>
        <div class="kl-tipp" id="kl-kh">${ico('kopfhoerer')}<span id="kl-kh-t"></span></div>
        <span class="kl-lbl">Bereich</span><div class="seg" role="group" aria-label="Beat-Bereich">${chips('band', Object.entries(BEATS).map(([k, b]) => [k, b.name, b.hz + ' Hz']), e.band)}</div>
        <label class="schieber"><span class="kl-reihe">Beat-Frequenz <b id="kl-hzw">${zahl(e.hz)} Hz</b></span><input type="range" min="1" max="20" step="0.5" value="${e.hz}" id="kl-hz" aria-label="Beat-Frequenz in Hertz"></label>
        <span class="kl-lbl">Grundton</span><div class="seg" role="group" aria-label="Grundton">${chips('tr', [['tief', 'Tief', '150 Hz'], ['mittel', 'Mittel', '220 Hz'], ['hell', 'Hell', '330 Hz']], e.traeger)}</div>
        <label class="schieber">Beat-Lautstärke <input type="range" min="0" max="1" step="0.05" value="${e.beatLaut}" id="kl-bl"></label>
        <p class="leise">Als Klangteppich angenehm. Dass Beats Gehirnwellen, Schlaf oder Stimmung zuverlässig verändern, ist nicht belegt.</p></div>
      <label class="schieber">Lautstärke <input type="range" min="0" max="1" step="0.05" value="${e.laut}" id="kl-laut"></label>
      <div class="kl-tipp">${ico('ohr')}<span>Leise beginnen. Die App blendet langsam ein und begrenzt Spitzen. Die Lautstärke deines Geräts kann sie nicht messen – stell sie so, dass du dich noch gut unterhalten könntest.</span></div>
      <button class="knopf haupt voll kl-start" id="kl-los">Starten · ${e.min} min</button></section>
    <span class="ueber" style="margin-top:20px">Was hilft – ehrlich</span>
    <div class="kl-legende-a"><span><i class="kl-pkt"></i>belegt</span><span><i class="kl-pkt gelb"></i>unsicher</span><span><i class="kl-pkt rot"></i>nicht belegt</span></div>
    <div class="kl-ampel">${AMPEL.map(([s, t, k, q, w]) => `<details class="kl-a"><summary><i class="kl-pkt ${s === 'gruen' ? '' : s}"></i><b>${esc(t)}</b><small>${w || AMPEL_W[s]}</small>${aufZu}</summary><p>${esc(k)}</p>${quelle(q)}</details>`).join('')}</div>
    <span class="ueber" style="margin-top:20px">Übungen dazu</span>
    <div class="kl-kacheln">
      <a class="kl-k" href="#uebung/resonanz?v=6_min_gleich">${ico('welle')}<b>Resonanz-Atmung 6/min</b><small>5 s ein · 5 s aus</small></a>
      <a class="kl-k" href="#uebung/seufzer">${ico('seufzer')}<b>Zyklisches Seufzen</b><small>2× ein, lang aus · 1–5 min</small></a>
      <a class="kl-k" href="#klang/summen">${ico('mikro')}<b>Summ-Atmung</b><small>Mikrofon zählt mit, wie lange du summst</small><span class="kl-marke">neu</span></a>
      <a class="kl-k" href="#uebung/vier_sieben_acht">${ico('halten')}<b>4-7-8</b><small>Halten nur, solange es angenehm ist</small><span class="kl-marke">Hinweis</span></a></div>
    <span class="ueber" style="margin-top:20px">Selbsthypnose und Körperreise</span>
    <div class="kl-kacheln">
      <a class="kl-k hyp" href="#klang/hypnose/anker">${ico('mond')}<b>Ruhe-Anker</b><small>Selbsthypnose · ca. 7 min</small><span class="kl-marke">neu</span></a>
      <a class="kl-k hyp" href="#klang/hypnose/koerper">${ico('koerper')}<b>Körperreise kurz</b><small>Systemstimme · ca. 4 min</small><span class="kl-marke">neu</span></a>
      <a class="kl-k hyp" href="#meditation/koerperreise">${ico('liegen')}<b>Körperreise im Liegen</b><small>Aufgenommene Stimme · 5–25 min</small></a></div>
    <details class="karte"><summary>Quellen dieser Seite</summary><ul class="kl-quellen">${Object.values(KQ).map((q) => `<li><a class="link" href="${q.link}" target="_blank" rel="noopener">${esc(q.kurz)}</a> <small>${esc(q.art)} · ${q.jahr}${q.suche ? ' · Link zur Titelsuche' : ''}</small><br><small>${esc(q.titel)}</small></li>`).join('')}</ul><p class="leise">Links brauchen Internet. Nur eigene Kurzfassungen, keine Texte übernommen.</p></details>
    <p class="mehr-fuss">Kein Ersatz für ärztlichen Rat. Bei Brustschmerz oder Atemnot: 112.</p></div></div></div>`, 'mehr', 2);
  binde(c);
}

function binde(c) {
  const i = document.getElementById('inhalt'), sp = c.speicher;
  const khText = () => { const e = lies(sp); const t = document.getElementById('kl-kh-t'); if (t) t.textContent = e.beat === 'binaural' ? 'Nur mit Kopfhörern: Links und rechts klingen zwei leicht verschiedene Töne, den Schlag bildet dein Gehör. Über den Lautsprecher hörst du nur ein leises Schweben. Nicht beim Autofahren.' : 'Puls: Ein Ton wird weich lauter und leiser. Hörbar auch ohne Kopfhörer. Nicht beim Autofahren.'; };
  khText();
  const los = () => { const k = document.getElementById('kl-los'); if (k) k.textContent = 'Starten · ' + lies(sp).min + ' min'; };
  i.onclick = (ev) => {
    const b = ev.target.closest('button'); if (!b) return;
    const d = b.dataset, mark = () => b.parentNode.querySelectorAll('.chip').forEach((x) => { x.classList.toggle('an', x === b); x.setAttribute('aria-pressed', x === b); });
    if (d.r) { merke(sp, { rhythmus: d.r }); mark(); }
    else if (d.k) { merke(sp, { klang: d.k }); mark(); }
    else if (d.m) { merke(sp, { min: +d.m }); mark(); los(); }
    else if (d.b) { merke(sp, { beat: d.b }); mark(); document.getElementById('kl-beat').hidden = d.b === 'aus'; khText(); }
    else if (d.band) { const hz = BEATS[d.band].hz; merke(sp, { band: d.band, hz }); mark(); document.getElementById('kl-hz').value = hz; document.getElementById('kl-hzw').textContent = zahl(hz) + ' Hz'; }
    else if (d.tr) { merke(sp, { traeger: d.tr }); mark(); }
    else if (b.id === 'kl-los') oeffneSpieler(c);   // im Tipp: der Ton entsteht hier (iOS)
  };
  const hz = document.getElementById('kl-hz');
  hz.oninput = () => { document.getElementById('kl-hzw').textContent = zahl(hz.value) + ' Hz'; };
  hz.onchange = () => { const v = +hz.value, band = Object.entries(BEATS).find(([, x]) => x.hz === v); merke(sp, { hz: v, band: band ? band[0] : '' }); i.querySelectorAll('[data-band]').forEach((x) => { const an = band && x.dataset.band === band[0]; x.classList.toggle('an', !!an); x.setAttribute('aria-pressed', !!an); }); };
  document.getElementById('kl-laut').onchange = (ev) => merke(sp, { laut: +ev.target.value });
  document.getElementById('kl-bl').onchange = (ev) => merke(sp, { beatLaut: +ev.target.value });
}

// ---------- Spieler (Vollbild wie die Übung; Ton entsteht im Start-Tipp) ----------
let offen = null;
export const laeuft = () => !!offen;
function oeffneSpieler(c) {
  if (offen) offen.zu(true);
  const sp = c.speicher, e = lies(sp), R = RHYTHMEN[e.rhythmus] || RHYTHMEN.r6, dauer = e.min * 60;
  const motor = erzeugeKlang({ rhythmus: R, klang: e.klang, laut: e.laut, beat: e.beat === 'aus' ? null : beatVon(e), beiStoerung: () => stoerung() });
  const ok = motor.start();   // vor jedem await, im Tipp
  const v = document.createElement('div'); v.className = 'kl-spieler'; v.setAttribute('role', 'dialog'); v.setAttribute('aria-label', 'Klang-Atem');
  const beatInfo = e.beat === 'aus' ? '' : `<span>${e.beat === 'binaural' ? 'Binaural' : 'Puls'} ${zahl(e.hz)} Hz · Wirkung unsicher</span>`;
  v.innerHTML = `<div class="kl-sp-kopf"><button class="knopf-ico" data-k="zu" aria-label="Beenden">${SV(ICO.zu)}</button><div class="kl-sp-titel">Klang-Atem · ${R.name}</div><span class="kl-sp-rest" id="kl-rest">${mmss(dauer)}</span></div>
    <div class="kl-sp-mitte"><div class="kl-orb" id="kl-orb"><i class="kl-hof"></i><i class="kl-kern"></i><div class="kl-orb-text"><b id="kl-wort">Ein</b><span id="kl-sek"></span></div></div></div>
    <div class="kl-sp-info"><span>${R.kurz}</span><span>${{ meer: 'Meer', ton: 'Ton', beides: 'Meer + Ton' }[e.klang]}</span>${beatInfo}</div>
    <div class="kl-sp-unten"><button class="kl-sp-ton" data-k="ton" hidden>Ton antippen</button><label class="kl-sp-laut" aria-label="Lautstärke">${SV(ICO.ohr, '0 0 24 24', 'kl-ico')}<input type="range" min="0" max="1" step="0.05" value="${e.laut}" id="kl-sp-laut"></label>
      <button class="kl-sp-pause" data-k="pause" aria-label="Pause">${SV(ICO.pause)}</button><span></span></div>
    <div class="kl-sp-blatt" hidden></div>`;
  document.body.appendChild(v); document.body.classList.add('in-sitzung'); if (c.tippSperre) c.tippSperre();
  const $ = (s) => v.querySelector(s), orb = $('#kl-orb'), kern = $('.kl-kern'), hof = $('.kl-hof'), wort = $('#kl-wort'), sek = $('#kl-sek'), rest = $('#kl-rest'), tonK = $('[data-k="ton"]'), blatt = $('.kl-sp-blatt');
  const ruhig = matchMedia('(prefers-reduced-motion: reduce)').matches, amp = ruhig ? 0.18 : 0.42;
  const WORT = { ein: 'Ein', ein2: 'Noch etwas', aus: 'Aus', halten_voll: 'Halten', halten_leer: 'Halten', ruhe: 'Gleich' };
  let zustand = ok ? 'laeuft' : 'pause', seitStart = performance.now(), vorher = 0, raf = 0, wake = null, lWort = '', lSek = -1, lRest = -1, lAus = null;
  const zeit = () => vorher + (zustand === 'laeuft' ? (performance.now() - seitStart) / 1000 : 0);
  async function holeWake() { try { if (navigator.wakeLock && document.visibilityState === 'visible' && !wake) { wake = await navigator.wakeLock.request('screen'); wake.addEventListener('release', () => { wake = null; }); } } catch { wake = null; } }
  const lasseWake = () => { try { if (wake) wake.release(); } catch {} wake = null; };
  function bild() {
    raf = 0; if (zustand !== 'laeuft') return;
    const j = motor.jetzt(), t = zeit();
    if (j) {
      const n = Math.max(0, Math.min(1, (j.pegel - TIEF) / (HOCH - TIEF)));
      kern.style.transform = `scale(${(1 - amp + amp * n).toFixed(4)})`; hof.style.transform = `scale(${(0.9 + 0.35 * n).toFixed(4)})`; hof.style.opacity = (0.25 + 0.75 * n).toFixed(3);
      const w = WORT[j.art] || '', s = Math.ceil(j.rest), aus = j.art === 'aus' || j.art === 'halten_leer';
      if (w !== lWort) { wort.textContent = w; lWort = w; } if (s !== lSek) { sek.textContent = s > 0 ? s : ''; lSek = s; } if (aus !== lAus) { orb.classList.toggle('aus', aus); lAus = aus; }
    }
    const r = Math.ceil(dauer - t); if (r !== lRest) { rest.textContent = mmss(r); lRest = r; }
    const steht = motor.zustand() !== 'running' && motor.zustand() !== 'kein'; tonK.hidden = !steht || t < 1;
    if (t >= dauer) { ende('fertig'); return; }
    raf = requestAnimationFrame(bild);
  }
  function zeigeBlatt(html) { blatt.innerHTML = '<div>' + html + '</div>'; blatt.hidden = false; if (c.tippSperre) c.tippSperre(); }
  function pause(warum) {
    if (zustand !== 'laeuft') return; vorher = zeit(); zustand = 'pause'; cancelAnimationFrame(raf); raf = 0; motor.stop(0.5); lasseWake();
    zeigeBlatt(`<h2>${warum === 'stoerung' ? 'Ton unterbrochen' : 'Pausiert'}</h2>${warum === 'stoerung' ? '<p>Das Gerät hat den Ton angehalten (z. B. Anruf oder Sperre). Ein Tipp holt ihn zurück.</p>' : ''}<button class="knopf haupt voll" data-k="weiter">Weiter</button><button class="knopf voll" data-k="ende">Beenden</button>`);
    $('[data-k="pause"]').innerHTML = SV(ICO.play);
  }
  function weiter() {   // im Tipp: neuer Kontext, Atem beginnt wieder mit „Ein“
    blatt.hidden = true; motor.start(); zustand = 'laeuft'; seitStart = performance.now(); motor.endeIn(dauer - zeit()); lWort = ''; holeWake(); $('[data-k="pause"]').innerHTML = SV(ICO.pause); if (!raf) raf = requestAnimationFrame(bild);
  }
  function stoerung() { if (zustand === 'laeuft') pause('stoerung'); }
  function ende(grund, ohneBlatt) {
    if (zustand === 'ende') return; const ist = Math.min(dauer, Math.round(zeit())); zustand = 'ende'; cancelAnimationFrame(raf); raf = 0; motor.stop(grund === 'fertig' ? 3 : 0.6); lasseWake();
    if (ist >= 30) try { sp.eintrag({ t: new Date().toISOString(), technik: R.technik, variante: R.variante || 'klang', plan_s: dauer, ist_s: ist, ende: grund === 'fertig' ? 'fertig' : 'gestoppt', quelle: 'klang', klang: e.klang, beat: e.beat === 'aus' ? null : e.beat + ' ' + e.hz }); } catch {}
    if (ohneBlatt) return;
    zeigeBlatt(`<h2>${grund === 'fertig' ? 'Fertig · ' + mmss(ist) : 'Beendet · ' + mmss(ist)}</h2><p>${ist >= 30 ? 'In deinem Fortschritt gezählt.' : 'Unter 30 Sekunden – nicht gezählt.'} Bleib noch einen Moment sitzen und atme normal.</p>
      <button class="knopf haupt voll" data-k="fertig">Fertig</button><button class="knopf voll" data-k="nochmal">Nochmal</button>`);
  }
  function zu(still) { if (zustand === 'laeuft' || zustand === 'pause') ende('gestoppt', true); cancelAnimationFrame(raf); motor.stop(still ? 0.05 : 0.4); lasseWake(); aufraeumen(); v.remove(); if (!document.querySelector('.kl-spieler, .md-spieler') && document.getElementById('sitzung').hidden) document.body.classList.remove('in-sitzung'); offen = null; }
  v.addEventListener('click', (ev) => {
    const b = ev.target.closest('[data-k]'); if (!b) return; const k = b.dataset.k;
    if (k === 'pause') { if (zustand === 'laeuft') pause(); else if (zustand === 'pause') weiter(); }
    else if (k === 'weiter') weiter();
    else if (k === 'ton') { motor.start(); motor.endeIn(dauer - zeit()); }   // hängender Ton: im Tipp neu anlegen (start() schließt den alten Kontext)
    else if (k === 'ende') ende('gestoppt');
    else if (k === 'zu') { if (zustand === 'laeuft' || zustand === 'pause') ende('gestoppt'); else zu(); }
    else if (k === 'fertig') zu();
    else if (k === 'nochmal') { zu(true); oeffneSpieler(c); }
  });
  $('#kl-sp-laut').oninput = (ev) => motor.laut(+ev.target.value);
  $('#kl-sp-laut').onchange = (ev) => merke(sp, { laut: +ev.target.value });
  const weg = () => { if (!location.hash.startsWith('#klang')) zu(true); };
  // Prüfung 0.2.3: verdeckt (Sperre/Hintergrund) läuft kein requestAnimationFrame – Atem bis zum Ende vorplanen (motor.sicht), Ende per Uhr
  const sicht = () => { if (zustand === 'laeuft') motor.sicht(); if (document.visibilityState === 'visible' && zustand === 'laeuft') { holeWake(); if (!raf) raf = requestAnimationFrame(bild); } };
  const uhr = setInterval(() => { if (zustand === 'laeuft' && zeit() >= dauer) ende('fertig'); }, 1000);
  addEventListener('hashchange', weg); document.addEventListener('visibilitychange', sicht);
  function aufraeumen() { clearInterval(uhr); removeEventListener('hashchange', weg); document.removeEventListener('visibilitychange', sicht); }
  offen = { zu };
  if (ok) motor.endeIn(dauer);   // Ausblenden zum Ende schon jetzt auf der Audio-Uhr (endet auch, wenn die Seite verdeckt ist)
  holeWake();
  if (!ok) zeigeBlatt('<h2>Kein Ton möglich</h2><p>Dieser Browser kann hier keinen Klang erzeugen. Nutze die Übungen – dort führt dich der Kreis auch ohne Ton.</p><button class="knopf haupt voll" data-k="fertig">Zurück</button>');
  else raf = requestAnimationFrame(bild);
}
