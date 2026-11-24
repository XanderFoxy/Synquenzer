// muster – Querverbindungen zwischen Ästen über Module hinweg (für „Weiter springen“). Der Zusammenbau ergänzt.
// Schlüssel und Ziele sind Ast-IDs '<modulid>.<schlüssel>' mit den Schlüsseln der Vorlage 0.2.1. Verbindungen gelten in
// beide Richtungen. IDs, die es (noch) nicht gibt, lässt die Sammlung still weg. RIASEC als 'interessen.R' … 'interessen.C':
// Die Sammlung findet auch Schreibweisen wie 'interessen.riasec-a' oder 'interessen.a' (gleicher letzter Teil).
export const VERBINDUNGEN = {
  // Persönlichkeit (bigfive)
  'bigfive.offenheit': ['muster.neugier_denken', 'muster.ungewissheit', 'muster.werte_wandel', 'interessen.A', 'interessen.I', 'spiel.offenheit'],
  'bigfive.gewissenhaftigkeit': ['muster.gewohnheiten', 'muster.kontrolle', 'muster.entscheiden', 'interessen.C', 'training.ziele', 'training.fokus', 'spiel.gewissenhaftigkeit'],
  'bigfive.extraversion': ['muster.naehe', 'muster.werte_ich_wir', 'muster.kommunikation', 'interessen.E', 'interessen.S', 'spiel.extraversion'],
  'bigfive.vertraeglichkeit': ['muster.konflikt', 'muster.grenzen', 'muster.werte_ich_wir', 'interessen.ehrlichkeit', 'interessen.S', 'spiel.vertraeglichkeit'],
  'bigfive.stabilitaet': ['muster.stress', 'muster.gefuehle', 'muster.selbstmitgefuehl', 'muster.kontrolle', 'training.gefuehle', 'spiel.stabilitaet'],
  // Interessen, Rhythmus, Ehrlichkeit
  'interessen.rhythmus': ['muster.gewohnheiten', 'muster.stress', 'training.gesundheit', 'training.fokus'],
  'interessen.ehrlichkeit': ['muster.werte_ich_wir', 'muster.grenzen', 'muster.sinn', 'bigfive.vertraeglichkeit'],
  'interessen.R': ['muster.neugier_denken', 'muster.sinn'],
  'interessen.I': ['muster.neugier_denken', 'muster.denkfallen', 'muster.ungewissheit'],
  'interessen.A': ['muster.sinn', 'muster.ungewissheit', 'muster.gefuehle'],
  'interessen.S': ['muster.werte_ich_wir', 'muster.kommunikation', 'muster.naehe'],
  'interessen.E': ['muster.kontrolle', 'muster.entscheiden', 'muster.werte_wandel'],
  'interessen.C': ['muster.gewohnheiten', 'muster.ungewissheit', 'muster.werte_wandel'],
  // Text-Spiegel (Waagen der Vorlage)
  'textspiegel.zeit': ['muster.werte_wandel', 'muster.sinn'],
  'textspiegel.haltung': ['muster.entscheiden', 'muster.kontrolle', 'muster.stress'],
  'textspiegel.gefuehl': ['muster.gefuehle', 'muster.selbstmitgefuehl', 'muster.stress'],
  'textspiegel.wer': ['muster.werte_ich_wir', 'muster.naehe', 'muster.kommunikation'],
  // Training (Übungsgruppen der Vorlage)
  'training.fokus': ['muster.gewohnheiten', 'muster.stress', 'interessen.rhythmus'],
  'training.ziele': ['muster.kontrolle', 'muster.lernen', 'muster.sinn'],
  'training.gewohnheiten': ['muster.gewohnheiten', 'muster.kontrolle'],
  'training.lernen': ['muster.lernen', 'muster.neugier_denken', 'muster.denkfallen'],
  'training.gefuehle': ['muster.gefuehle', 'muster.selbstmitgefuehl', 'muster.stress'],
  'training.gesundheit': ['muster.stress', 'muster.gewohnheiten', 'interessen.rhythmus'],
  'training.andere': ['muster.kommunikation', 'muster.grenzen', 'muster.konflikt', 'muster.naehe'],
  'training.wachsen': ['muster.lernen', 'muster.werte_wandel', 'muster.sinn'],
  // Was passt (Abschnitte der Vorlage)
  'passt.arbeit': ['muster.werte_ich_wir', 'muster.sinn', 'interessen.rhythmus'],
  'passt.staerken': ['muster.lernen', 'muster.sinn'],
  'passt.wachstum': ['muster.lernen', 'muster.werte_wandel'],
  // Denkweise untereinander (zusätzlich zu den eigenen verwandt-Listen)
  'muster.kontrolle': ['muster.selbstmitgefuehl', 'muster.gewohnheiten'],
  'muster.sinn': ['muster.gefuehle'],
  'muster.entscheiden': ['muster.stress']
};
