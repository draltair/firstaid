// Motore dei calcolatori. I dati (items, punteggi, interpretazione, fonte) vivono in
// data/calcolatori/<id>.json — questo file non contiene nessun numero clinico.

const scoreCache = {};

async function caricaScore(key) {
    let cfg = scoreCache[key];
    if (!cfg) {
        try {
            const res = await fetch(`data/calcolatori/${key}.json`);
            if (!res.ok) throw new Error('not found');
            const voce = await res.json();
            cfg = voce.contenuto;
            cfg._titolo = voce.titolo;
            cfg._fonte = voce.fonte;
            scoreCache[key] = cfg;
        } catch (e) {
            alert('Score non ancora caricato: ' + key);
            return;
        }
    }

    document.getElementById('score-title').innerText = cfg._titolo;
    document.getElementById('score-desc').innerText =
        (cfg.ambito || '') + (cfg._fonte ? ' — Fonte: ' + cfg._fonte.nome + (cfg._fonte.anno ? ' (' + cfg._fonte.anno + ')' : '') : '');

    let html = "";
    cfg.items.forEach((it, idx) => {
        html += `<div class="score-row"><label>${it.label}</label><select id="sc-opt-${idx}" data-key="${key}" onchange="calcolaScoreCorrente('${key}')">`;
        it.opzioni.forEach(o => { html += `<option value="${o.punti}">${o.testo} (${o.punti})</option>`; });
        html += `</select></div>`;
    });
    document.getElementById('score-inputs').innerHTML = html;
    document.getElementById('score-container').style.display = 'block';
    calcolaScoreCorrente(key);
}

function calcolaScoreCorrente(key) {
    const cfg = scoreCache[key];
    if (!cfg) return;
    let tot = 0;
    cfg.items.forEach((it, idx) => {
        const sel = document.getElementById(`sc-opt-${idx}`);
        if (sel) tot += parseInt(sel.value) || 0;
    });
    document.getElementById('score-total').innerText = tot;

    const fascia = (cfg.interpretazione || []).find(f => tot >= f.min && (f.max === null || tot <= f.max));
    document.getElementById('score-interpretation').innerText = fascia ? fascia.testo : '—';
}
