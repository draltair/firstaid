// Motore dei calcolatori — interfaccia ad accordion. I dati (items, punteggi,
// interpretazione, fonte) vivono in data/calcolatori/<id>.json.

const scoreCache = {};
let calcAccordionInit = false;

async function inizializzaCalcolatori() {
    if (calcAccordionInit) return;
    calcAccordionInit = true;

    const container = document.getElementById('calc-accordion');
    if (!container) return;

    try {
        const res = await fetch('data/calcolatori/index.json');
        const data = await res.json();

        container.innerHTML = '';
        data.items.forEach(item => {
            const wrap = document.createElement('div');
            wrap.className = 'accordion-item';
            wrap.innerHTML =
                `<button type="button" class="accordion-header" data-key="${item.id}">` +
                `<span>${item.titolo}${item.sottotitolo ? ' <small>&middot; ' + item.sottotitolo + '</small>' : ''}</span>` +
                `<span class="accordion-caret">⌄</span>` +
                `</button>` +
                `<div class="accordion-body" id="accbody-${item.id}" style="display:none;"></div>`;
            container.appendChild(wrap);
        });

        container.querySelectorAll('.accordion-header').forEach(btn => {
            btn.addEventListener('click', () => toggleAccordion(btn.getAttribute('data-key')));
        });
    } catch (e) {
        container.innerHTML = '<p style="color:var(--text-muted);">Impossibile caricare l\'elenco dei calcolatori.</p>';
        console.error(e);
    }
}

async function toggleAccordion(key) {
    const body = document.getElementById('accbody-' + key);
    const header = document.querySelector(`.accordion-header[data-key="${key}"]`);
    const eraAperto = body.style.display !== 'none';

    // Chiude sempre tutti gli altri pannelli (un solo score aperto alla volta)
    document.querySelectorAll('.accordion-body').forEach(b => { b.style.display = 'none'; });
    document.querySelectorAll('.accordion-header').forEach(h => h.classList.remove('open'));

    if (eraAperto) return; // era già aperto: il click lo richiude e basta

    body.style.display = 'block';
    header.classList.add('open');
    await renderScoreInBody(key, body);
}

async function renderScoreInBody(key, body) {
    let cfg = scoreCache[key];
    if (!cfg) {
        try {
            const res = await fetch(`data/calcolatori/${key}.json`);
            if (!res.ok) throw new Error('not found');
            const voce = await res.json();
            cfg = voce.contenuto;
            cfg._fonte = voce.fonte;
            scoreCache[key] = cfg;
        } catch (e) {
            body.innerHTML = '<p style="color:var(--danger); font-size:0.85rem;">Impossibile caricare questo score.</p>';
            return;
        }
    }

    let html = `<p style="color:var(--text-muted); font-size:0.78rem; margin:0 0 12px;">` +
        `${cfg.ambito || ''}${cfg._fonte ? ' — Fonte: ' + cfg._fonte.nome + (cfg._fonte.anno ? ' (' + cfg._fonte.anno + ')' : '') : ''}</p>`;

    cfg.items.forEach((it, idx) => {
        html += `<div class="score-row"><label>${it.label}</label><select id="sc-${key}-${idx}" onchange="calcolaScoreCorrente('${key}')">`;
        it.opzioni.forEach(o => { html += `<option value="${o.punti}">${o.testo} (${o.punti})</option>`; });
        html += `</select></div>`;
    });

    html += `<div class="result-display">` +
        `<div style="font-size: 0.8rem; color: var(--text-muted);">Punteggio Totale: <strong id="tot-${key}" style="font-size: 1.1rem; color: var(--text-main);">0</strong></div>` +
        `<div id="interp-${key}" style="margin-top: 4px; font-weight: 600; color: var(--primary); font-size: 0.85rem;">Seleziona i parametri.</div>` +
        `</div>`;

    body.innerHTML = html;
    calcolaScoreCorrente(key);
}

function calcolaScoreCorrente(key) {
    const cfg = scoreCache[key];
    if (!cfg) return;
    let tot = 0;
    cfg.items.forEach((it, idx) => {
        const sel = document.getElementById(`sc-${key}-${idx}`);
        if (sel) tot += parseFloat(sel.value) || 0;
    });
    const totEl = document.getElementById('tot-' + key);
    if (totEl) totEl.innerText = tot;

    const fascia = (cfg.interpretazione || []).find(f => tot >= f.min && (f.max === null || tot <= f.max));
    const interpEl = document.getElementById('interp-' + key);
    if (interpEl) interpEl.innerText = fascia ? fascia.testo : '—';
}
