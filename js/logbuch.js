/* Satzwerft: Werftbuch mit Stempel-Tafel, „Das kann ich schon“ und Urkunde (übernommen aus dem Logbuch der Chancenbucht).
   Klassisches Skript, legt window.SA.logbuch an. Braucht SA.config, SA.stand, SA.teile, SA.stationen (stempelSvg), SA.urkunde.
   Texte von Ingo freigegeben am 16.11.2026 (Dateien/Beispiele-Entwuerfe/werftbuch-erwachsene-urkunde.md).
   Gelesen wird nur stempel. Keine Zahlen, keine Zeit (wie Chancenbucht).
   Urkunde (Ingo, 16.11.2026): sobald alle Stationen von Klasse 3 in leicht und mittel geschafft sind; sind auch alle
   Stationen von Klasse 4 geschafft, nennt die Urkunde alle sieben.
   Der Vorname kommt nur über textContent auf die Seite und nur in die Urkunde auf dem Gerät. */
(() => {
  'use strict';
  const SA = window.SA = window.SA || {};
  const C = () => SA.config;
  const ST = () => SA.stand;
  const T = () => SA.teile;
  const URKUNDE_STUFEN = ['leicht', 'mittel'];

  const SAETZE = {
    umstellen: { leicht: 'Ich kann einen Satz umstellen. Die Wörter eines Satzglieds bleiben zusammen.', mittel: 'Ich stelle auch lange Sätze um. Das Verb bleibt das zweite Satzglied.', knifflig: 'Ich bilde Fragen und stelle Sätze mit zweiteiligem Prädikat um.' },
    trennen: { leicht: 'Ich trenne die Satzglieder mit Strichen.', mittel: 'Ich finde Satzglieder aus mehreren Wörtern.', knifflig: 'Ich trenne auch lange Sätze sicher.' },
    finden: { leicht: 'Ich finde Prädikat und Subjekt mit Fragen.', mittel: 'Ich finde das Subjekt, auch wenn es nicht vorn steht.', knifflig: 'Ich finde Prädikate aus zwei Teilen.' },
    bestimmungen: { leicht: 'Ich finde die Zeitbestimmung oder die Ortsbestimmung.', mittel: 'Ich finde Zeit und Ort im selben Satz.', knifflig: 'Ich kenne auch Wie oft?, Wie lange?, Woher? und Wohin?.' },
    ergaenzungen: { leicht: 'Ich finde die Wen-Ergänzung.', mittel: 'Ich finde die Wem-Ergänzung.', knifflig: 'Ich unterscheide Wem- und Wen-Ergänzung.' },
    erweitern: { leicht: 'Ich ersetze ein Satzglied durch ein passendes.', mittel: 'Ich mache Sätze mit einem Satzglied länger.', knifflig: 'Ich erweitere Sätze und stelle sie danach um.' },
    stimmt: { leicht: 'Ich prüfe Behauptungen über Satzglieder.', mittel: 'Ich weiß, dass das Subjekt nicht immer vorn steht.', knifflig: 'Ich erkläre Behauptungen über zweiteilige Prädikate.' }
  };

  const anzahlStempel = () => ST().SCHLUESSEL.filter(k => { const [s, st] = k.split(':'); return ST().hatStempel(s, st); }).length;
  const urkundeStationen = () => { const alle = C().stationen; const fehltIn = l => l.some(s => URKUNDE_STUFEN.some(st => !ST().hatStempel(s.id, st))); const k3 = alle.filter(s => s.klasse === 3); return fehltIn(k3) || fehltIn(alle) ? k3 : alle; };
  const fehlend = () => urkundeStationen().flatMap(s => URKUNDE_STUFEN.filter(st => !ST().hatStempel(s.id, st)).map(st => `${s.name} (${st})`));
  const urkundeBereit = () => fehlend().length === 0;
  const verdienteSaetze = () => C().stationen.flatMap(s => C().stufen.filter(st => ST().hatStempel(s.id, st)).map(st => ({ station: s.id, stufe: st, satz: SAETZE[s.id][st] })));

  let ctx = null, urkundeUrl = null, urkundeDatei = null;
  function zeigen(c) {
    ctx = c;
    const esc = ctx.esc;
    const stationen = C().stationen;
    const motiv = id => (SA.stationen && SA.stationen[id] && SA.stationen[id].stempelSvg) ? SA.stationen[id].stempelSvg() : T().stempel('');
    const saetze = verdienteSaetze();
    const fehlt = fehlend();
    /* B14: Die Urkunde steht oben, sobald sie bereit ist; vorher unten mit dem, was noch fehlt */
    const urkundeHtml = `
      <section class="papier logbuch" aria-labelledby="lb-urkunde">
        <h2 id="lb-urkunde">Urkunde</h2>
        ${fehlt.length ? `<p>Die Urkunde gibt es, wenn du in jeder Station von Klasse 3 leicht und mittel geschafft hast.</p><p>Dir fehlen noch: ${esc(fehlt.join(', '))}.</p>`
          : `<p>Du hast leicht und mittel geschafft. Du kannst dir eine Urkunde machen.</p>
             <p class="knopfreihe"><button type="button" class="knopf haupt" data-lb="urkunde">Urkunde erstellen</button></p>
             <p id="lb-status" role="status"></p>
             <p class="knopfreihe" id="lb-fertig" hidden>
               <a class="knopf haupt" id="lb-ansehen" href="#" target="_blank" rel="noopener">Urkunde ansehen</a>
               <button type="button" class="knopf" data-lb="teilen" id="lb-teilen" hidden>Teilen</button>
             </p>
             <p class="leise">Die Urkunde macht das Gerät selbst. Sie wird nicht gespeichert und nicht verschickt.</p>`}
      </section>`;
    ctx.zeigen(`
      <header class="kopf kopf--station">
        <div class="kopf__reihe">
          ${T().PFEIL}
          <div class="kopf__mitte">
            <h1>Mein ${esc(C().buchName)}</h1>
            <p class="unterzeile">Hier steht, was du schon kannst.</p>
          </div>
          <div class="kopf__werkzeug"></div>
        </div>
      </header>
      ${fehlt.length ? '' : urkundeHtml}
      <section class="papier logbuch" aria-labelledby="lb-stempel">
        <h2 id="lb-stempel">Meine Stempel</h2>
        <ul class="logbuch__tafel">
          ${stationen.map(s => `
            <li class="logbuch__zeile">
              <h3 class="logbuch__station">${esc(s.name)}</h3>
              <ul class="logbuch__stempel" aria-label="${esc(s.name)}: ${C().stufen.map(st => `${st} ${ST().hatStempel(s.id, st) ? 'geschafft' : 'noch offen'}`).join(', ')}">
                ${C().stufen.map(st => `<li class="logbuch__stufe${ST().hatStempel(s.id, st) ? ' logbuch__stufe--voll' : ''}" aria-hidden="true">
                  <span class="logbuch__bild">${ST().hatStempel(s.id, st) ? motiv(s.id) : ''}</span>
                  <span class="logbuch__wort">${esc(st)}</span>
                </li>`).join('')}
              </ul>
              <button type="button" class="knopf logbuch__hin" data-aktion="station" data-id="${esc(s.id)}">Zur Station</button>
            </li>`).join('')}
        </ul>
      </section>
      <section class="papier logbuch" aria-labelledby="lb-kann">
        <h2 id="lb-kann">Das kann ich schon</h2>
        ${saetze.length ? `<ul class="logbuch__kann">${stationen.filter(s => saetze.some(x => x.station === s.id)).map(s => `
          <li><h3>${esc(s.name)}</h3><ul>${saetze.filter(x => x.station === s.id).map(x => `<li>${esc(x.satz)}</li>`).join('')}</ul></li>`).join('')}</ul>`
          : '<p>Hier stehen bald deine ersten Sätze. Such dir eine Station aus.</p>'}
      </section>
      ${fehlt.length ? urkundeHtml : ''}`, 'Mein ' + C().buchName);
  }

  async function urkundeErstellen(knopf) {
    if (!urkundeBereit()) return;
    const status = ctx.app.querySelector('#lb-status'), fertig = ctx.app.querySelector('#lb-fertig');
    const ansehen = ctx.app.querySelector('#lb-ansehen'), teilen = ctx.app.querySelector('#lb-teilen');
    knopf.disabled = true;
    status.textContent = 'Deine Urkunde wird gemacht …';
    try {
      const k = ST().aktiv();
      const r = await SA.urkunde.erstellen({
        name: (k && k.name) || 'Satzbauerin oder Satzbauer', datum: new Date(),
        stationen: urkundeStationen().map(s => ({ id: s.id, name: s.name })), stufen: C().stufen.slice(),
        hat: (id, st) => ST().hatStempel(id, st), saetze: verdienteSaetze().filter(x => urkundeStationen().some(s => s.id === x.station)),
        rioSrc: `bilder/rio-512.jpg?b=${C().bildStand}`,
        motiv: id => (SA.stationen && SA.stationen[id] && SA.stationen[id].stempelSvg) ? SA.stationen[id].stempelSvg() : null
      });
      if (urkundeUrl) URL.revokeObjectURL(urkundeUrl);
      urkundeUrl = URL.createObjectURL(r.blob);
      ansehen.href = urkundeUrl;
      ansehen.setAttribute('download', r.dateiname);
      urkundeDatei = typeof File === 'function' ? new File([r.blob], r.dateiname, { type: 'application/pdf' }) : null;
      teilen.hidden = !(urkundeDatei && navigator.canShare && navigator.canShare({ files: [urkundeDatei] }));
      fertig.hidden = false;
      status.textContent = 'Deine Urkunde ist fertig.';
      SA.urkunde.letzte = r;   /* nur für den Rauchtest */
      ansehen.focus();
    } catch (e) {
      status.textContent = 'Die Urkunde konnte gerade nicht gemacht werden. Versuch es noch einmal.';
    }
    knopf.disabled = false;
  }
  async function urkundeTeilen() {
    const status = ctx.app.querySelector('#lb-status');
    if (!urkundeDatei || !navigator.share) return;
    try { await navigator.share({ files: [urkundeDatei], title: 'Meine Urkunde' }); status.textContent = 'Geteilt.'; }
    catch (e) { if (!e || e.name !== 'AbortError') status.textContent = 'Teilen klappt hier gerade nicht. Tippe auf „Urkunde ansehen“.'; }
  }

  function bedienen(e) {
    const b = e.target.closest('[data-lb]');
    if (!b || b.disabled) return false;
    if (b.dataset.lb === 'urkunde') urkundeErstellen(b);
    else if (b.dataset.lb === 'teilen') urkundeTeilen();
    else return false;
    return true;
  }

  SA.logbuch = { SAETZE, URKUNDE_STUFEN, zeigen, bedienen, anzahlStempel, fehlend, urkundeBereit, verdienteSaetze };
})();
