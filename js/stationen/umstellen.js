/* Satzwerft: Station „Umstellprobe“ (Klasse 3).
   Das Kind stellt die Satzglied-Kärtchen um. Jede erlaubte Reihenfolge zählt (js/satz.js, Verb-zweit-Regel).
   Knifflig: Prädikat aus zwei Teilen und Fragesätze ohne Fragewort.
   Erst probieren, dann das Fachwort: „Satzglied“ fällt erst nach dem Lösen. */
(() => {
  'use strict';
  const SA = window.SA;
  const Z = () => SA.satz;
  const zit = t => `„${t}“`;

  SA.stationBauen({
    id: 'umstellen', praefix: 'us',
    titel: 'Umstellprobe', kurz: 'Sätze umstellen',
    intro: 'Hier stellst du Sätze um. Die Wörter auf einem Kärtchen bleiben dabei immer zusammen.',
    soGehts: ['Lies den Satz.', 'Tippe ein Kärtchen an und dann die Stelle, wo es hin soll. Du kannst es auch ziehen.', 'Lies deinen neuen Satz laut. Klingt er richtig? Dann tippe auf Prüfen.'],
    amTisch: { titel: 'Am Tisch: Satz-Reihe', schritte: [
      'Schreibt einen Satz auf Kärtchen, ein Satzglied pro Kärtchen.',
      'Jedes Kind hält ein Kärtchen und stellt sich in eine Reihe vor die Klasse.',
      'Die Klasse sagt, wer den Platz wechseln soll. Danach lesen alle den neuen Satz.',
      'Welches Kind darf nie ganz vorn stehen, wenn es kein Fragesatz ist?'], notiz: 'Material: Papierstreifen, dicker Stift.' },
    motiv: '<rect class="stempel__kachel" x="20" y="54" width="26" height="13" rx="2"/><rect class="stempel__kachel" x="52" y="54" width="28" height="13" rx="2"/><path class="stempel__pfeil" d="M33 48C36 30 62 30 66 46M66 46l-6-2M66 46l2-6"/>',
    woerter: ['satzglied', 'umstellprobe', 'frage'],
    start: a => ({ reihe: Z().grund(a.satz) }),
    zeichne(a, s, ort, api) {
      const esc = api.esc;
      const frage = a.art === 'frage';
      ort.insertAdjacentHTML('beforeend', `
        <h2 id="us-frage" class="frage">${frage ? 'Mach aus dem Satz eine Frage.' : 'Stell den Satz um.'}</h2>
        <p class="auftrag">${frage ? 'Die Frage soll ohne Fragewort auskommen. Am Ende steht ein Fragezeichen.' : 'Ein anderes Kärtchen soll vorn stehen.'}</p>
        <div class="satzbuehne" id="us-feld"></div>`);
      void esc;
      SA.kacheln.reihe(ort.querySelector('#us-feld'), {
        satz: a.satz, reihe: s.reihe, art: a.art, gesperrt: s.fertig,
        aenderung: neu => { s.reihe = neu; api.ansagen('Dein Satz: ' + SA.kacheln.leseZeile(a.satz, neu)); }
      });
    },
    pruefe(a, s) {
      const b = Z().bewerte(a.satz, s.reihe, a.art);
      const satz = Z().text(a.satz, s.reihe, a.art);
      if (b.ok) return { ok: true, text: a.art === 'frage' ? `Genau. ${zit(satz)} ist eine Frage.` : `Genau. ${zit(satz)} Alle Kärtchen sind noch da, nur die Reihenfolge ist neu.` };
      if (b.grund === 'gleich') return { ok: false, sanft: true, text: 'Das ist noch der Satz vom Anfang. Stell ein anderes Kärtchen nach vorn.' };
      if (b.grund === 'verb') return { ok: false, text: a.art === 'frage' ? `Lies es laut. Bei dieser Frage kommt ${zit(b.verb)} ganz nach vorn.` : `Lies den Satz laut. ${zit(b.verb)} gehört an die zweite Stelle.` };
      if (b.grund === 'teil2') return { ok: false, text: `${zit(b.teil)} gehört ans Ende. Es gehört zu ${zit(a.satz.glieder[Z().finit(a.satz)].t)}.` };
      if (b.grund === 'ungewohnt') return { ok: false, sanft: true, text: 'Das kann man sagen, es klingt aber ungewohnt. Probier eine andere Reihenfolge.' };
      return { ok: false, text: 'Da stimmt etwas nicht. Probier es noch einmal.' };
    },
    loesung(a, s) {
      const r = Z().erlaubteReihenfolgen(a.satz, a.art);
      s.reihe = (a.art === 'frage' ? r[0] : r[1] || r[0]).slice();
      return `So kann es heißen: ${zit(Z().text(a.satz, s.reihe, a.art))}`;
    },
    fachwort: a => a.art === 'frage' ? 'Bei einer Frage ohne Fragewort steht das Verb vorn.' : 'Was beim Umstellen zusammenbleibt, heißt Satzglied. Du hast gerade die Umstellprobe gemacht.',
    tipps(a) {
      const v = a.satz.glieder[Z().finit(a.satz)].t;
      const z2 = Z().teil2(a.satz);
      if (a.art === 'frage') return ['Eine Frage wie „Spielst du mit?“ fängt mit dem Verb an.', `Welches Wort sagt, was passiert? Das kommt nach vorn.`, `Stell ${zit(v)} ganz nach vorn. Der Rest bleibt, wie er war.`];
      return [
        'Probier ein Kärtchen nach dem anderen ganz vorn aus.',
        `${zit(v)} bleibt an der zweiten Stelle.`,
        ...(z2 >= 0 ? [`${zit(a.satz.glieder[z2].t)} bleibt ganz am Ende.`] : []),
        'Lies deinen Satz laut. Wenn er richtig klingt, tippe auf Prüfen.'
      ];
    }
  });
})();
