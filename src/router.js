// Router minimo per First AId. Nessuna dipendenza esterna.
// Logica: #/<sezione>            -> lista voci di data/<sezione>/index.json
//         #/<sezione>/<id>       -> dettaglio da data/<sezione>/<id>.json
//         (hash vuoto)           -> mostra la homepage (menu), nasconde la vista sezione

(function () {
  const homeIntro = document.querySelector('.intro');
  const homeMenu = document.getElementById('menu');
  let sectionView = document.getElementById('section-view');

  if (!sectionView) {
    sectionView = document.createElement('div');
    sectionView.id = 'section-view';
    sectionView.style.display = 'none';
    sectionView.style.maxWidth = '720px';
    sectionView.style.margin = '0 auto';
    sectionView.style.padding = '4px 20px 40px';
    const footerEl = document.querySelector('footer');
    if (footerEl && footerEl.parentNode) {
      footerEl.parentNode.insertBefore(sectionView, footerEl);
    } else {
      document.body.appendChild(sectionView);
    }
  }

  function showHome() {
    if (homeIntro) homeIntro.style.display = '';
    if (homeMenu) homeMenu.style.display = '';
    sectionView.style.display = 'none';
    sectionView.innerHTML = '';
  }

  function showSection() {
    if (homeIntro) homeIntro.style.display = 'none';
    if (homeMenu) homeMenu.style.display = 'none';
    sectionView.style.display = '';
  }

  function backLink() {
    return '<a href="#/" style="display:inline-block;margin-bottom:14px;color:#2f5d4f;text-decoration:none;">&larr; Home</a>';
  }

  function renderNotReady(sezione) {
    showSection();
    sectionView.innerHTML =
      backLink() +
      '<div style="background:#faf9f6;border:1px solid #e3e0d7;border-radius:16px;padding:18px 20px;">' +
      '<strong>' + sezione + '</strong>' +
      '<p style="color:#5b5e58;margin-top:8px;">Questa sezione non ha ancora contenuti caricati.</p>' +
      '</div>';
  }

  function renderList(sezione, items) {
    showSection();
    let html = backLink() + '<h2 style="margin-bottom:12px;">' + sezione + '</h2>';
    html += '<div style="display:flex;flex-direction:column;gap:10px;">';
    items.forEach(function (item) {
      html +=
        '<a href="#/' + sezione + '/' + item.id + '" style="display:block;background:#faf9f6;border:1px solid #e3e0d7;border-radius:14px;padding:14px 16px;text-decoration:none;color:#20231f;">' +
        '<strong style="display:block;">' + item.titolo + '</strong>' +
        (item.sottotitolo ? '<span style="display:block;font-size:13px;color:#5b5e58;">' + item.sottotitolo + '</span>' : '') +
        '</a>';
    });
    html += '</div>';
    sectionView.innerHTML = html;
  }

  function renderDettaglioGenerico(voce) {
    showSection();
    let html = backLink() + '<h2 style="margin-bottom:4px;">' + voce.titolo + '</h2>';

    // Caso speciale: Glasgow Coma Scale e simili con "componenti"
    if (voce.contenuto && voce.contenuto.componenti) {
      html += '<p style="color:#5b5e58;margin-top:0;">' + (voce.contenuto.ambito || '') + ' &middot; range ' + (voce.contenuto.range || '') + '</p>';
      voce.contenuto.componenti.forEach(function (comp) {
        html += '<div style="margin:16px 0;"><strong>' + comp.voce + '</strong><ul style="margin:6px 0 0;padding-left:18px;">';
        comp.punteggi.forEach(function (p) {
          html += '<li>' + p.punti + ' &mdash; ' + p.descrizione + '</li>';
        });
        html += '</ul></div>';
      });
      if (voce.contenuto.note_interpretazione) {
        html += '<p style="color:#5b5e58;">' + voce.contenuto.note_interpretazione + '</p>';
      }
    } else if (voce.contenuto) {
      // Fallback generico: mostra il contenuto come coppie chiave/valore
      html += '<pre style="white-space:pre-wrap;background:#faf9f6;border:1px solid #e3e0d7;border-radius:12px;padding:14px;font-size:13px;">' +
        JSON.stringify(voce.contenuto, null, 2) + '</pre>';
    }

    if (voce.fonte) {
      html += '<p style="font-size:12px;color:#5b5e58;margin-top:18px;">Fonte: ' + voce.fonte.nome +
        (voce.fonte.anno ? ' (' + voce.fonte.anno + ')' : '') + '</p>';
    }
    if (voce.verifica && voce.verifica.data_verifica) {
      html += '<p style="font-size:12px;color:#5b5e58;">Verificato il ' + voce.verifica.data_verifica +
        ' &middot; prossima revisione ' + voce.verifica.prossima_revisione + '</p>';
    }

    sectionView.innerHTML = html;
  }

  function route() {
    const hash = window.location.hash; // es: "#/calcolatori/glasgow-coma-scale"
    if (!hash || hash === '#/' || hash === '#') {
      showHome();
      return;
    }

    const parts = hash.replace('#/', '').split('/').filter(Boolean);
    const sezione = parts[0];
    const id = parts[1];

    if (!id) {
      // Vista lista sezione
      fetch('data/' + sezione + '/index.json')
        .then(function (r) { if (!r.ok) throw new Error('no index'); return r.json(); })
        .then(function (data) { renderList(sezione, data.items || []); })
        .catch(function () { renderNotReady(sezione); });
    } else {
      // Vista dettaglio voce
      fetch('data/' + sezione + '/' + id + '.json')
        .then(function (r) { if (!r.ok) throw new Error('no item'); return r.json(); })
        .then(function (data) { renderDettaglioGenerico(data); })
        .catch(function () { renderNotReady(sezione + '/' + id); });
    }
  }

  window.addEventListener('hashchange', route);
  window.addEventListener('DOMContentLoaded', route);
})();
