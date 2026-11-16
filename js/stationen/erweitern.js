/* Satzwerft: Station „Ersetzen und erweitern“ (Klasse 4).
   leicht:   ein Satzglied durch ein anderes ersetzen, das auf dieselbe Frage antwortet.
   mittel:   den Satz um ein Satzglied erweitern, das auf eine bestimmte Frage antwortet.
   knifflig: erweitern und danach so umstellen, dass das neue Satzglied vorn steht.
   Auswahl aus drei Satzgliedern, genau eins passt (Test in tools/test/satz-test.js). Kein freier Text. */
(() => {
  'use strict';
  const SA = window.SA;
  const Z = () => SA.satz;
  const zit = t => `„${t}“`;
  const gesuchtFrage = a => Z().fragewort(a.art === 'ersetzen' ? a.satz.glieder[a.stelle] : a.ziel);
  const passt = (a, o) => { const g = a.art === 'ersetzen' ? a.satz.glieder[a.stelle] : a.ziel; return o.r === g.r && (o.f || '') === (g.f || ''); };
  /* Der Satz nach dem Ersetzen */
  const ersetzt = (a, o) => ({ id: a.id + '-e', glieder: a.satz.glieder.map((g, i) => i === a.stelle ? Object.assign({}, g, { t: o.t }) : g) });
  const neuIndex = a => a.ergebnis.glieder.findIndex(g => g.t === a.ziel.t);

  SA.stationBauen({
    id: 'erweitern', praefix: 'ew',
    titel: 'Ersetzen und erweitern', kurz: 'Sätze verändern',
    intro: 'Hier tauschst du Satzglieder aus oder machst Sätze länger.',
    soGehts: ['Lies den Satz und die Frage.', 'Wähle das Satzglied, das auf die Frage antwortet.', 'Bei knifflig stellst du den neuen Satz danach noch um.'],
    amTisch: { titel: 'Am Tisch: Satz-Baukasten', schritte: [
      'Legt einen kurzen Satz aus Kärtchen: „Der Hund schläft.“',
      'Legt daneben Kärtchen mit Antworten auf Wann? und Wo?',
      'Macht den Satz länger. Dann tauscht ein Satzglied aus.',
      'Stellt den langen Satz um. Wie viele Möglichkeiten findet ihr?'], notiz: 'Material: Kärtchen in zwei Farben, Stift.' },
    motiv: '<rect class="stempel__kachel" x="16" y="40" width="22" height="14" rx="3"/><rect class="stempel__kachel" x="42" y="40" width="22" height="14" rx="3"/><path class="stempel__plus" d="M76 40v14M69 47h14"/>',
    woerter: ['satzglied', 'subjekt', 'zeit', 'ort', 'wem', 'wen'],
    start: a => ({ phase: 'waehlen', wahl: -1, falsch: [], reihe: null, ohnePruefen: true }),
    zeichne(a, s, ort, api) {
      const esc = api.esc;
      if (s.phase === 'umstellen') {
        const k = neuIndex(a);
        ort.insertAdjacentHTML('beforeend', `
          <h2 id="ew-frage" class="frage">Stell den neuen Satz um.</h2>
          <p class="auftrag">${esc(zit(a.ziel.t))} soll ganz vorn stehen.</p>
          <div class="satzbuehne" id="ew-feld"></div>`);
        SA.kacheln.reihe(ort.querySelector('#ew-feld'), {
          satz: a.ergebnis, reihe: s.reihe, gesperrt: s.fertig, rollen: { [k]: a.ziel.r },
          aenderung: neu => { s.reihe = neu; api.ansagen('Dein Satz: ' + SA.kacheln.leseZeile(a.ergebnis, neu)); }
        });
        return;
      }
      const titel = a.art === 'ersetzen' ? `Tausch ${zit(Z().gliedText(a.satz, a.stelle, a.stelle))} aus.` : 'Mach den Satz länger.';
      const auftrag = a.art === 'ersetzen' ? `Welches Satzglied antwortet auch auf „${gesuchtFrage(a)}“?` : `Welches Satzglied antwortet auf „${gesuchtFrage(a)}“?`;
      ort.insertAdjacentHTML('beforeend', `
        <h2 id="ew-frage" class="frage">${esc(titel)}</h2>
        <div class="satzbuehne" id="ew-feld"></div>
        <p class="auftrag">${esc(auftrag)}</p>
        <div class="antworten antworten--reihe" role="group" aria-label="Satzglieder zur Auswahl">
          ${a.reihenfolge.map(i => { const o = a.optionen[i]; const r = s.fertig && passt(a, o); return `<button type="button" class="knopf antwort-knopf kachel-antwort${r ? ' ist-richtig' : ''}${s.falsch.includes(i) ? ' ist-falsch' : ''}" data-ew="option" data-i="${i}"${s.fertig || s.falsch.includes(i) ? ' disabled' : ''}>${esc(o.t)}</button>`; }).join('')}
        </div>`);
      /* Nach dem Lösen steht der neue Satz als Kärtchen da, das neue Satzglied mit seiner Rolle */
      const satz = !s.fertig ? a.satz : a.art === 'ersetzen' ? ersetzt(a, a.optionen[0]) : a.ergebnis;
      const neu = !s.fertig ? -1 : a.art === 'ersetzen' ? a.stelle : neuIndex(a);
      SA.kacheln.markieren(ort.querySelector('#ew-feld'), { satz, reihe: Z().grund(satz), fest: neu >= 0 && satz.glieder[neu].r !== 'sonstiges' ? { [neu]: satz.glieder[neu].r } : {}, gesperrt: true });
      if (a.art === 'ersetzen' && !s.fertig) { const b = ort.querySelector(`#ew-feld [data-glied="${a.stelle}"]`); if (b) b.classList.add('kachel--austausch'); }
    },
    bedienen(was, b, a, s, api) {
      if (was !== 'option' || !a || s.fertig) return false;
      s.wahl = Number(b.dataset.i);
      api.pruefen();
      return true;
    },
    pruefe(a, s) {
      if (s.phase === 'umstellen') {
        const k = neuIndex(a);
        const r = Z().bewerte(a.ergebnis, s.reihe);
        if (r.ok && s.reihe[0] === k) return { ok: true, text: `Genau. ${zit(Z().text(a.ergebnis, s.reihe))}` };
        if (r.ok) return { ok: false, sanft: true, text: `Das stimmt auch. Stell jetzt ${zit(a.ziel.t)} ganz nach vorn.` };
        if (r.grund === 'gleich') return { ok: false, sanft: true, text: `Stell ${zit(a.ziel.t)} ganz nach vorn.` };
        if (r.grund === 'verb') return { ok: false, text: `Lies den Satz laut. ${zit(r.verb)} gehört an die zweite Stelle.` };
        if (r.grund === 'teil2') return { ok: false, text: `${zit(r.teil)} gehört ans Ende.` };
        return { ok: false, sanft: true, text: 'Das kann man sagen, es klingt aber ungewohnt. Probier eine andere Reihenfolge.' };
      }
      const o = a.optionen[s.wahl];
      if (!o) return null;
      if (passt(a, o)) {
        const satz = a.art === 'ersetzen' ? Z().text(ersetzt(a, o)) : Z().text(a.ergebnis);
        if (a.umstellen) {
          s.phase = 'umstellen';
          s.reihe = Z().grund(a.ergebnis);
          s.ohnePruefen = false;
          return { ok: true, weiter: true, text: `Genau. ${zit(satz)} Jetzt kommt das Umstellen.` };
        }
        return { ok: true, text: `Genau. ${zit(satz)}` };
      }
      s.falsch.push(s.wahl);
      return { ok: false, text: `${zit(o.t)} antwortet auf „${Z().fragewort(o)}“. Gesucht ist: ${gesuchtFrage(a)}` };
    },
    loesung(a, s) {
      if (s.phase === 'umstellen') {
        const k = neuIndex(a);
        s.reihe = Z().erlaubteReihenfolgen(a.ergebnis).find(r => r[0] === k).slice();
        return `So kann es heißen: ${zit(Z().text(a.ergebnis, s.reihe))}`;
      }
      return `Richtig ist ${zit(a.art === 'ersetzen' ? a.optionen[0].t : a.ziel.t)}. Es antwortet auf „${gesuchtFrage(a)}“.`;
    },
    fachwort: a => a.art === 'ersetzen' ? 'Du hast ein Satzglied ersetzt. Der Satz bleibt vollständig.' : 'Du hast den Satz um ein Satzglied erweitert.',
    tipps(a, s) {
      if (s.phase === 'umstellen') return [`Nimm ${zit(a.ziel.t)} und stell es ganz nach vorn.`, `${zit(a.ergebnis.glieder[1].t)} bleibt an der zweiten Stelle.`];
      return [`Frag bei jedem Kärtchen: Antwortet es auf „${gesuchtFrage(a)}“?`, 'Zeit und Ort sind verschiedene Fragen: Wann? ist nicht Wo?', 'Setz das Kärtchen im Kopf in den Satz ein. Klingt der Satz richtig?'];
    }
  });
})();
