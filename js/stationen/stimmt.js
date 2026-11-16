/* Satzwerft: Station „Kann das stimmen?“ (Klasse 3).
   Rio behauptet etwas über Satzglieder, das Kind prüft es. Eine Antwort je Behauptung, danach steht immer die Begründung
   mit einem Beispielsatz. Geschafft heißt: im ersten Versuch richtig (bei zwei Knöpfen wäre ein zweiter Versuch geraten). */
(() => {
  'use strict';
  const SA = window.SA;

  SA.stationBauen({
    id: 'stimmt', praefix: 'st',
    titel: 'Kann das stimmen?', kurz: 'Rio prüfen',
    intro: 'Ich sage manchmal Dinge über Sätze. Manche stimmen, manche nicht. Prüf mich!',
    soGehts: ['Lies, was Rio sagt.', 'Probier es im Kopf an einem Satz aus.', 'Entscheide: Stimmt das oder stimmt das nicht?'],
    amTisch: { titel: 'Am Tisch: Rio spielen', schritte: [
      'Ein Kind denkt sich eine Behauptung über Sätze aus, die stimmt oder nicht stimmt.',
      'Die anderen prüfen sie mit einem Beispielsatz und der Umstellprobe.',
      'Wer recht hat, erklärt es mit dem Satz.',
      'Sammelt die besten Behauptungen auf einem Plakat.'], notiz: 'Material: Heft oder Plakat, Stifte.' },
    motiv: '<circle class="stempel__lupe" cx="44" cy="46" r="16"/><path class="stempel__lupe" d="M56 58l12 12"/><path class="stempel__haken" d="M36 46l6 6 10-12"/>',
    woerter: ['satzglied', 'umstellprobe', 'subjekt', 'praedikat'],
    rueckOben: true,
    hilfeStart: 'Wähle eine Stufe. Bei jeder Behauptung kannst du mich um einen Tipp bitten.',
    start: () => ({ antwort: null, ohnePruefen: true }),
    zeichne(a, s, ort, api) {
      const esc = api.esc;
      const knoepfe = [[true, 'Das stimmt.'], [false, 'Das stimmt nicht.']];
      ort.insertAdjacentHTML('beforeend', `
        <div class="rio-aussage">${api.ctx.rioKlein}<div><p class="nurvorlesen">Rio sagt:</p><p class="aussage" id="st-frage">„${esc(a.behauptung)}“</p></div></div>
        <h2 class="frage-klein">Kann das stimmen?</h2>
        <div class="antworten antworten--zwei" role="group" aria-label="Antworten">
          ${knoepfe.map(([w, t]) => `<button type="button" class="knopf antwort-knopf${s.fertig && w === a.stimmt ? ' ist-richtig' : ''}${s.antwort === w && w !== a.stimmt ? ' ist-falsch' : ''}" data-st="antwort" data-w="${w}"${s.fertig ? ' disabled' : ''}>${esc(t)}</button>`).join('')}
        </div>
        ${s.fertig ? `<div class="erklaerung"><p>${esc(a.warum)}</p><p class="beispiel"><span class="ausgang__wort">Beispiel:</span> ${esc(a.beispiel)}</p></div>` : ''}`);
    },
    bedienen(was, b, a, s, api) {
      if (was !== 'antwort' || !a || s.fertig) return false;
      s.antwort = b.dataset.w === 'true';
      api.pruefen();
      return true;
    },
    pruefe(a, s) {
      if (s.antwort === null) return null;
      if (s.antwort === a.stimmt) return { ok: true, text: a.stimmt ? 'Richtig, das stimmt.' : 'Richtig, das stimmt nicht.' };
      return { ok: false, endgueltig: true, text: a.stimmt ? 'Nicht ganz. Das stimmt doch.' : 'Nicht ganz. Das stimmt nicht.' };
    },
    loesung: a => a.stimmt ? 'Das stimmt.' : 'Das stimmt nicht.',
    tipps: a => ['Such dir einen Satz und probier es aus.', `Probier es an diesem Satz: „${a.beispiel}“`, 'Denk an die Umstellprobe: Was bleibt zusammen?']
  });
})();
