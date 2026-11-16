/* Satzwerft: Station „Satzglieder trennen“ (Klasse 3).
   Das Kind setzt Striche zwischen die Satzglieder. Geprüft gegen die Zerlegung im Datensatz (genau eine).
   Rückmeldung konkret: welcher Strich fehlt, welche Wörter zusammenbleiben. Die Umstellprobe hilft im Tipp. */
(() => {
  'use strict';
  const SA = window.SA;
  const Z = () => SA.satz;
  const zit = t => `„${t}“`;

  SA.stationBauen({
    id: 'trennen', praefix: 'tr',
    titel: 'Satzglieder trennen', kurz: 'Striche setzen',
    intro: 'Hier setzt du Striche zwischen die Satzglieder. Wörter, die beim Umstellen zusammenbleiben, gehören zusammen.',
    soGehts: ['Lies den Satz.', 'Tippe zwischen zwei Wörter, um einen Strich zu setzen. Noch einmal tippen nimmt ihn weg.', 'Prüf mit der Umstellprobe im Kopf: Was wandert zusammen?'],
    amTisch: { titel: 'Am Tisch: Satz zerschneiden', schritte: [
      'Schreib einen Satz auf einen Papierstreifen.',
      'Schneide ihn in Satzglieder. Wörter, die zusammengehören, bleiben auf einem Stück.',
      'Leg die Stücke in eine neue Reihenfolge. Klingt der Satz noch richtig?',
      'Tauscht die Stücke mit eurem Partner und prüft gegenseitig.'], notiz: 'Material: Papierstreifen, Schere, Stift.' },
    motiv: '<path class="stempel__linie" d="M20 52h60"/><path class="stempel__strich" d="M40 36v26M62 36v26"/>',
    woerter: ['satzglied', 'umstellprobe'],
    start: () => ({ striche: [], markiert: null }),
    zeichne(a, s, ort) {
      ort.insertAdjacentHTML('beforeend', `
        <h2 id="tr-frage" class="frage">Welche Wörter bleiben zusammen?</h2>
        <p class="auftrag">Setz einen Strich zwischen zwei Satzglieder.</p>
        <div class="satzbuehne" id="tr-feld"></div>`);
      SA.kacheln.trennen(ort.querySelector('#tr-feld'), {
        satz: a.satz, striche: s.striche, gesperrt: s.fertig, markiert: s.markiert,
        aenderung: neu => { s.striche = neu; s.markiert = null; }
      });
    },
    pruefe(a, s) {
      const w = Z().woerter(a.satz);
      if (!s.striche.length) return { ok: false, sanft: true, text: 'Setz zuerst mindestens einen Strich.' };
      const r = Z().pruefeTrennung(a.satz, s.striche);
      if (r.ok) return { ok: true, text: `Genau. Der Satz hat ${a.satz.glieder.length} Satzglieder.` };
      /* Beim ersten Fehlversuch nur sagen, was fehlt oder zu viel ist, nicht wo (sonst verrät die Rückmeldung die Lösung) */
      if (!s.versuche) {
        s.markiert = null;
        const teile = [];
        if (r.fehlend.length) teile.push(r.fehlend.length === 1 ? 'Es fehlt noch ein Strich.' : `Es fehlen noch ${r.fehlend.length} Striche.`);
        if (r.zuviel.length) teile.push(r.zuviel.length === 1 ? 'Ein Strich trennt Wörter, die zusammenbleiben.' : `${r.zuviel.length} Striche trennen Wörter, die zusammenbleiben.`);
        return { ok: false, text: teile.join(' ') + ' Probier die Umstellprobe im Kopf.' };
      }
      s.markiert = { fehlend: [], zuviel: r.zuviel.slice(0, 1) };
      if (r.zuviel.length) { const k = r.zuviel[0]; return { ok: false, text: `${zit(w[k].wort)} und ${zit(w[k + 1].wort)} bleiben beim Umstellen zusammen. Dazwischen gehört kein Strich.` }; }
      const k = r.fehlend[0];
      s.markiert = { fehlend: [k], zuviel: [] };
      return { ok: false, text: `Zwischen ${zit(w[k].wort)} und ${zit(w[k + 1].wort)} fehlt noch ein Strich.` };
    },
    loesung(a, s) {
      s.striche = Z().grenzen(a.satz);
      s.markiert = null;
      return 'So sind die Satzglieder getrennt: ' + a.satz.glieder.map((g, i) => Z().gliedText(a.satz, i, i)).join(' | ') + '.';
    },
    fachwort: () => 'Jedes Stück zwischen zwei Strichen ist ein Satzglied.',
    tipps(a) {
      const um = Z().erlaubteReihenfolgen(a.satz)[1];
      return [
        'Ein Satzglied kann ein Wort sein oder mehrere Wörter.',
        `Probier die Umstellprobe: ${zit(Z().text(a.satz, um))} Was ist zusammen gewandert?`,
        `Der Satz hat ${a.satz.glieder.length} Satzglieder. Du brauchst also ${a.satz.glieder.length - 1} Striche.`
      ];
    }
  });
})();
