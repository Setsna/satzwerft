/* Satzwerft: der Satzpool. Alle Sätze selbst geschrieben, nichts aus Zebra übernommen.
   Von Ingo geprüft am 16.11.2026 (Ausgaben/Satzprüfung.md). Neue Sätze vor dem Einbau wieder von Ingo prüfen lassen.
   Klassisches Skript, legt window.SA.saetze an. Braucht SA.satz.

   Kurzschreibweise (js/satz.js, aus()): Text|Rolle
     S Subjekt · P Prädikat (gebeugt) · P2 zweiter Prädikatteil · Z Zeitbestimmung (Z:oft, Z:lange) ·
     O Ortsbestimmung (O:her, O:hin) · D Wem-Ergänzung · A Wen-Ergänzung · X anderes Satzglied
   Grundreihenfolge: Subjekt, gebeugtes Verb, Rest, zweiter Prädikatteil am Ende.
   Regeln für die Auswahl (CLAUDE.md, Fachliche Regeln):
   - Subjekt und Wen-Ergänzung sehen nie gleich aus (keine Sätze wie „Die Katze jagt die Maus“).
   - Keine Fürwörter (ihm, es) als Satzglied, keine Sätze mit „sein“ oder „haben“ als Vollverb.
   - Subjekt in der Einzahl, damit die Frage „Wer oder was …?“ zum Verb passt.
   - Glieder wie „laut“ oder „hoch“ sind X (anderes Satzglied) und werden nie als Fehler gewertet. */
(() => {
  'use strict';
  const SA = window.SA = window.SA || {};
  const a = (...x) => SA.satz.aus(...x);

  /* Klasse 3, leicht: drei Satzglieder */
  const leicht = [
    a('l01', ['der Delfin|S', 'schwimmt|P', 'im Hafen|O']),
    a('l02', ['die Möwe|S', 'kreischt|P', 'laut|X']),
    a('l03', ['Tom|S', 'malt|P', 'ein Schiff|A']),
    a('l04', ['der Wind|S', 'weht|P', 'stark|X']),
    a('l05', ['die Sonne|S', 'scheint|P', 'heute|Z']),
    a('l06', ['Mia|S', 'liest|P', 'ein Buch|A']),
    a('l07', ['der Hund|S', 'bellt|P', 'am Strand|O']),
    a('l08', ['das Boot|S', 'schaukelt|P', 'im Wasser|O']),
    a('l09', ['Ben|S', 'baut|P', 'eine Burg|A']),
    a('l10', ['der Kapitän|S', 'lacht|P', 'laut|X']),
    a('l11', ['Lina|S', 'trinkt|P', 'einen Saft|A']),
    a('l12', ['die Katze|S', 'schläft|P', 'auf dem Sofa|O']),
    a('l13', ['der Regen|S', 'fällt|P', 'leise|X']),
    a('l14', ['der Zug|S', 'kommt|P', 'morgen|Z']),
    a('l15', ['das Mädchen|S', 'hilft|P', 'dem Fischer|D'])
  ];

  /* Klasse 3, mittel: vier Satzglieder */
  const mittel = [
    a('m01', ['Lea|S', 'spielt|P', 'heute|Z', 'im Garten|O']),
    a('m02', ['der Delfin|S', 'springt|P', 'am Morgen|Z', 'aus dem Wasser|O:her']),
    a('m03', ['Opa|S', 'repariert|P', 'am Sonntag|Z', 'das Boot|A']),
    a('m04', ['der Fischer|S', 'fängt|P', 'im Hafen|O', 'einen Fisch|A']),
    a('m05', ['Mia|S', 'schreibt|P', 'ihrer Oma|D', 'einen Brief|A']),
    a('m06', ['der Bus|S', 'hält|P', 'jeden Tag|Z:oft', 'vor der Schule|O']),
    a('m07', ['Tim|S', 'isst|P', 'mittags|Z', 'eine Suppe|A']),
    a('m08', ['die Lehrerin|S', 'erzählt|P', 'den Kindern|D', 'einen Witz|A']),
    a('m09', ['der Hund|S', 'wartet|P', 'geduldig|X', 'vor der Tür|O']),
    a('m10', ['Paul|S', 'trägt|P', 'im Winter|Z', 'eine Mütze|A']),
    a('m11', ['das Schiff|S', 'fährt|P', 'am Abend|Z', 'nach Taipei|O:hin']),
    a('m12', ['die Ente|S', 'schwimmt|P', 'langsam|X', 'zum Ufer|O:hin']),
    a('m13', ['Lena|S', 'gießt|P', 'jeden Morgen|Z:oft', 'die Blumen|A']),
    a('m14', ['der Koch|S', 'backt|P', 'heute|Z', 'einen Kuchen|A']),
    a('m15', ['Oma|S', 'strickt|P', 'im Sessel|O', 'einen Schal|A'])
  ];

  /* Klasse 3, knifflig: Prädikat aus zwei Teilen, nur trennbare Verben (wie Zebra 3) */
  const knifflig = [
    a('k01', ['der Bus|S', 'fährt|P', 'gleich|Z', 'ab|P2']),
    a('k02', ['Tom|S', 'ruft|P', 'am Abend|Z', 'seinen Opa|A', 'an|P2']),
    a('k03', ['der Delfin|S', 'taucht|P', 'im Hafen|O', 'auf|P2']),
    a('k04', ['Mia|S', 'räumt|P', 'heute|Z', 'ihr Zimmer|A', 'auf|P2']),
    a('k05', ['das Schiff|S', 'legt|P', 'am Morgen|Z', 'im Hafen|O', 'an|P2']),
    a('k06', ['der Hund|S', 'läuft|P', 'am Morgen|Z', 'weg|P2']),
    a('k07', ['Ben|S', 'packt|P', 'seine Tasche|A', 'ein|P2']),
    a('k08', ['der Opa|S', 'macht|P', 'das Fenster|A', 'auf|P2']),
    a('k09', ['der Kapitän|S', 'holt|P', 'den Anker|A', 'ein|P2']),
    a('k10', ['Paul|S', 'zieht|P', 'im Flur|O', 'seine Jacke|A', 'an|P2']),
    a('k11', ['die Sonne|S', 'geht|P', 'am Abend|Z', 'unter|P2']),
    a('k12', ['der Zug|S', 'kommt|P', 'um acht Uhr|Z', 'an|P2']),
    a('k13', ['Lea|S', 'lädt|P', 'am Freitag|Z', 'ihren Freund|A', 'ein|P2']),
    a('k14', ['die Lampe|S', 'geht|P', 'am Abend|Z', 'an|P2']),
    a('k15', ['die Lehrerin|S', 'liest|P', 'den Kindern|D', 'einen Brief|A', 'vor|P2'])
  ];

  /* Klasse 4, knifflig: Perfekt und Modalverb als zweiteiliges Prädikat (erst in Zebra 4) */
  const knifflig4 = [
    a('p01', ['Ben|S', 'hat|P', 'gestern|Z', 'im Meer|O', 'gebadet|P2']),
    a('p02', ['die Möwe|S', 'hat|P', 'am Strand|O', 'einen Fisch|A', 'gefangen|P2']),
    a('p03', ['der Kapitän|S', 'ist|P', 'am Montag|Z', 'nach Hause|O:hin', 'gefahren|P2']),
    a('p04', ['Lina|S', 'kann|P', 'im Meer|O', 'schwimmen|P2']),
    a('p05', ['Opa|S', 'hat|P', 'im Garten|O', 'einen Baum|A', 'gepflanzt|P2']),
    a('p06', ['das Kind|S', 'will|P', 'morgen|Z', 'einen Apfel|A', 'essen|P2']),
    a('p07', ['der Vater|S', 'hat|P', 'seiner Tochter|D', 'ein Fahrrad|A', 'geschenkt|P2']),
    a('p08', ['der Delfin|S', 'ist|P', 'am Abend|Z', 'aus dem Hafen|O:her', 'geschwommen|P2'])
  ];

  /* Klasse 4: weitere Sätze für Bestimmungen und Ergänzungen */
  const klasse4 = [
    a('v01', ['der Hund|S', 'schläft|P', 'den ganzen Tag|Z:lange', 'im Korb|O']),
    a('v02', ['der Zug|S', 'fährt|P', 'um neun Uhr|Z', 'nach Tainan|O:hin']),
    a('v03', ['der Vogel|S', 'fliegt|P', 'am Morgen|Z', 'aus dem Nest|O:her']),
    a('v04', ['der Delfin|S', 'schwimmt|P', 'zwei Stunden|Z:lange', 'im Meer|O']),
    a('v05', ['der Hahn|S', 'kräht|P', 'jeden Morgen|Z:oft', 'auf dem Zaun|O']),
    a('v06', ['Paul|S', 'geht|P', 'am Nachmittag|Z', 'in den Park|O:hin']),
    a('v07', ['der Vater|S', 'schenkt|P', 'seinem Sohn|D', 'einen Ball|A']),
    a('v08', ['Mia|S', 'gibt|P', 'dem Hund|D', 'einen Knochen|A']),
    a('v09', ['der Opa|S', 'zeigt|P', 'dem Enkel|D', 'den Leuchtturm|A']),
    a('v10', ['der Ball|S', 'gehört|P', 'dem Jungen|D']),
    a('v11', ['Ben|S', 'bringt|P', 'der Lehrerin|D', 'ein Bild|A']),
    a('v12', ['Tim|S', 'antwortet|P', 'dem Kapitän|D']),
    a('v13', ['der Junge|S', 'dankt|P', 'dem Arzt|D']),
    a('v14', ['Lena|S', 'sucht|P', 'ihren Schlüssel|A']),
    a('v15', ['der Bäcker|S', 'backt|P', 'am Morgen|Z', 'ein Brot|A']),
    a('v16', ['die Oma|S', 'kauft|P', 'dem Baby|D', 'einen Hut|A']),
    a('v17', ['Ben|S', 'schickt|P', 'heute|Z', 'seiner Tante|D', 'eine Karte|A']),
    a('v18', ['der Fischer|S', 'verkauft|P', 'am Hafen|O', 'einem Koch|D', 'einen Fisch|A']),
    a('v19', ['die Ärztin|S', 'gibt|P', 'morgen|Z', 'dem Kind|D', 'einen Verband|A']),
    a('v20', ['der Koch|S', 'schneidet|P', 'in der Küche|O', 'den Käse|A'])
  ];

  const alle = [...leicht, ...mittel, ...knifflig, ...knifflig4, ...klasse4];
  const nachId = Object.fromEntries(alle.map(s => [s.id, s]));
  SA.saetze = { leicht, mittel, knifflig, knifflig4, klasse4, alle, nachId };
})();
