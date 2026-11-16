/* Satzwerft: gemeinsame Teile der Stationen (übernommen aus der Chancenbucht, auf das Nötige gekürzt 16.11.2026).
   Klassisches Skript, legt window.SA.teile an. Genutzt von js/station-rahmen.js und js/logbuch.js.
   Enthält nur Darstellung und Bedienhilfen, keine Fachlogik: Kopf, Aufklapper, Stufenwahl, Rundenende mit Stempel, Dialog, Fokus.
   Regeln: echte Knöpfe, Fokus in Dialoge hinein und zurück, keine style-Attribute, Texte durch esc(). */
(() => {
  'use strict';
  const SA = window.SA = window.SA || {};
  const C = () => SA.config;
  const ST = () => SA.stand;
  const STUFENNAME = { leicht: 'leicht', mittel: 'mittel', knifflig: 'knifflig' };

  const PFEIL = '<button type="button" class="pfeil-knopf" data-aktion="start" aria-label="Zurück zur Startseite"><svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M15 5l-7 7 7 7"/></svg></button>';

  /* Kopf einer Station: Zurück, h1, Unterzeile, Wörter, Hilfe. praefix = data-Attribut der Station (fk, gr …) */
  function kopf(ctx, { titel, unterzeile, praefix, werkzeug = true }) {
    return `<header class="kopf kopf--station">
        <div class="kopf__reihe">
          ${PFEIL}
          <div class="kopf__mitte">
            <h1>${ctx.esc(titel)}</h1>
            ${unterzeile ? `<p class="unterzeile">${ctx.esc(unterzeile).replace(/(Aufgabe \d+ von \d+)/, '<span class="zusammen">$1</span>')}</p>` : ''}
          </div>
          <div class="kopf__werkzeug">${werkzeug ? `
            <button type="button" class="knopf glas-knopf werkzeug-knopf" data-${praefix}="woerter" aria-haspopup="dialog">Wörter</button>
            <button type="button" class="knopf glas-knopf werkzeug-knopf hilfe-knopf" data-${praefix}="hilfe" aria-haspopup="dialog">${ctx.rioKlein}<span>Hilfe</span></button>` : ''}
          </div>
        </div>
      </header>`;
  }

  /* Aufklapper (So geht's, Am Tisch) */
  function aufklapper(ctx, { klasse, titel, schritte, notiz, offen }) {
    return `
      <details class="papier ${klasse}"${offen ? ' open' : ''}>
        <summary><h2>${ctx.esc(titel)}</h2></summary>
        <ol>${schritte.map(s => `<li>${ctx.esc(s)}</li>`).join('')}</ol>
        ${notiz ? `<p class="leise">${ctx.esc(notiz)}</p>` : ''}
      </details>`;
  }

  /* Stufenwahl: Empfehlung = erste Stufe ohne Stempel */
  const empfohlen = id => C().stufen.find(st => !ST().hatStempel(id, st)) || 'knifflig';
  const erstesMal = id => C().stufen.every(st => !ST().runden(id, st));
  function stufenListe(ctx, id, praefix) {
    const emp = empfohlen(id);
    return `
      <section class="papier" aria-labelledby="h-stufe">
        <h2 id="h-stufe">Wähle eine Stufe</h2>
        <ul class="stufen-liste">
          ${C().stufen.map(st => `
            <li><button type="button" class="knopf stufe-knopf${st === emp ? ' stufe-knopf--empfohlen' : ''}" data-${praefix}="stufe" data-stufe="${st}">
              <span class="stufe-knopf__name">${ctx.esc(STUFENNAME[st])}</span>
              <span class="stufe-knopf__info">${ST().hatStempel(id, st) ? '<span class="stempel-punkt stempel-punkt--voll" aria-hidden="true"></span> Stempel geschafft' : '<span class="stempel-punkt" aria-hidden="true"></span> Noch kein Stempel'}${st === emp ? ' · empfohlen' : ''}</span>
            </button></li>`).join('')}
        </ul>
      </section>`;
  }

  /* Rundenende: Stempel geben (ab stempelAb geschafften), Text, Knöpfe. Gibt { html, text, fehler } zurück. */
  function rundenende(ctx, { id, praefix, stufe, geschafft, anzahl, stempelSvg, gespeichertFehler }) {
    const ab = C().runde.stempelAb;
    const hatteSchon = ST().hatStempel(id, stufe);
    let neu = false, fehler = gespeichertFehler;
    if (geschafft >= ab && !hatteSchon) {
      if (!ST().istVorschau && ST().stempelGeben(id, stufe) === false) fehler = true;
      neu = true;
    }
    const naechste = C().stufen[C().stufen.indexOf(stufe) + 1];
    let text;
    if (geschafft >= ab && neu) text = `Runde geschafft. Du bekommst einen Stempel für die Stufe ${STUFENNAME[stufe]}.`;
    else if (geschafft >= ab) text = 'Runde geschafft. Diesen Stempel hast du schon. Jede Runde übt trotzdem.';
    else text = `Du hast ${geschafft} von ${anzahl} geschafft. Für den Stempel brauchst du ${ab}. Probier noch eine Runde, die Aufgaben sind dann neu.`;
    const weiter = naechste && geschafft >= ab;
    /* B13: Das Rundenende ist der Höhepunkt: großer Stempel auf Papier im Glasfeld, Rio daneben, ein Hauptknopf */
    const haupt = weiter ? { stufe: naechste, text: `Weiter: Stufe ${STUFENNAME[naechste]}` } : { stufe, text: `Noch einmal: Stufe ${STUFENNAME[stufe]}` };
    const html = `
      <section class="rundenende${geschafft >= ab ? ' rundenende--geschafft' : ''}" aria-labelledby="h-ende">
        <h2 id="h-ende" class="nurvorlesen">Rundenende</h2>
        <div class="stempel-gross${geschafft >= ab || hatteSchon ? ' stempel-gross--voll' : ''}${neu ? ' stempel-gross--neu' : ''}" aria-hidden="true">${stempelSvg}</div>
        <div class="rundenende__satz">${ctx.rioKlein}<p class="rundenende__text">${ctx.esc(text)}</p></div>
        <p class="knopfreihe knopfreihe--mitte">
          <button type="button" class="knopf haupt rundenende__haupt" data-${praefix}="stufe" data-stufe="${haupt.stufe}">${ctx.esc(haupt.text)}</button>
        </p>
        <p class="knopfreihe knopfreihe--mitte rundenende__weitere">
          ${weiter ? `<button type="button" class="knopf knopf--klein" data-${praefix}="stufe" data-stufe="${stufe}">Noch einmal: Stufe ${ctx.esc(STUFENNAME[stufe])}</button>` : ''}
          <button type="button" class="knopf knopf--klein" data-${praefix}="stufen">Andere Stufe</button>
          <button type="button" class="knopf knopf--klein" data-aktion="start">Zur Startseite</button>
        </p>
      </section>`;
    return { html, text, fehler };
  }
  /* Stempelrahmen (Doppelkreis) um ein eigenes Motiv */
  const stempel = motiv => `<svg class="stempel-bild" viewBox="0 0 100 100" focusable="false"><circle class="stempel__rand" cx="50" cy="50" r="44"/><circle class="stempel__rand stempel__rand--innen" cx="50" cy="50" r="36"/>${motiv}</svg>`;

  /* ---------- Dialog (ein gemeinsamer <dialog>) ----------
     Achtung: titel läuft durch esc(), inhalt und knoepfe sind HTML. Dort nur feste oder mit esc() entschärfte Texte einsetzen, nie Vorname, Stand oder Adresse. */
  let opener = null, beiTipp = null;
  function dialog(ctx, { titel, inhalt, knoepfe, tipp }) {
    let d = document.getElementById('station-dialog');
    if (!d) {
      d = document.createElement('dialog');
      d.id = 'station-dialog';
      d.className = 'dialog';
      d.setAttribute('aria-labelledby', 'station-dialog-titel');
      document.body.appendChild(d);
      d.addEventListener('close', () => { if (opener && document.contains(opener)) opener.focus(); opener = null; });
      d.addEventListener('click', e => {
        const b = e.target.closest('[data-dialog]');
        if (!b) return;
        if (b.dataset.dialog === 'zu') d.close();
        if (b.dataset.dialog === 'tipp' && beiTipp) beiTipp();
      });
    }
    beiTipp = tipp || null;
    d.innerHTML = `<h2 id="station-dialog-titel">${ctx.esc(titel)}</h2>${inhalt}<p class="knopfreihe">${knoepfe}</p>`;
    if (!d.open) { opener = document.activeElement; d.showModal(); }
    const erster = d.querySelector('[data-dialog="tipp"]:not([disabled]), [data-dialog="zu"]');
    if (erster) erster.focus();
    return d;
  }
  /* Gestufte Tipps. liste: alle Tipps, bis: Index des letzten gezeigten, erlaubt: wie viele gerade erlaubt sind */
  function tippDialog(ctx, { liste, bis, erlaubt, fertig, weiter }) {
    const zu = '<button type="button" class="knopf haupt" data-dialog="zu">Ich probiere es</button>';
    if (fertig) return dialog(ctx, { titel: 'Tipp von Rio', inhalt: `<div class="tipp">${ctx.rioKlein}<p>Du hast es schon geschafft. Tippe auf Weiter.</p></div>`, knoepfe: zu });
    const mehr = bis < erlaubt - 1;
    const wartet = !mehr && erlaubt < liste.length;
    return dialog(ctx, {
      titel: 'Tipp von Rio',
      inhalt: `<div class="tipp">${ctx.rioKlein}<ol class="tipp-liste">${liste.slice(0, bis + 1).map(t => `<li>${ctx.esc(t)}</li>`).join('')}</ol></div>${wartet ? '<p class="leise">Probier es einmal. Danach habe ich noch einen Tipp.</p>' : ''}`,
      knoepfe: `${mehr ? '<button type="button" class="knopf" data-dialog="tipp">Noch ein Tipp</button>' : ''}${zu}`,
      tipp: weiter
    });
  }
  function fokus(ctx, sel) {
    const el = ctx.app.querySelector(sel);
    if (el && !el.disabled) el.focus({ preventScroll: false });
  }

  SA.teile = { PFEIL, STUFENNAME, kopf, aufklapper, empfohlen, erstesMal, stufenListe, rundenende, stempel, dialog, tippDialog, fokus };
})();
