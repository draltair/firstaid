function apriSezione(id) {
    document.getElementById('main-grid-view').style.display = 'none';
    document.querySelector('.search-container').style.display = 'none';
    document.querySelectorAll('.view-section').forEach(el => el.classList.remove('active'));

    if (id === 'rianimazione') {
        document.getElementById('view-rianimazione').classList.add('active');
        resus.start();
    } else if (id === 'egaview') {
        document.getElementById('view-egaview').classList.add('active');
    } else if (id === 'calcolatori') {
        document.getElementById('view-calcolatori').classList.add('active');
    } else {
        document.getElementById('view-generica').classList.add('active');
        document.getElementById('gen-title').innerText = id.toUpperCase();
        document.getElementById('gen-desc').innerText = "Protocolli e schemi specifici in caricamento.";
    }
}

function chiudiSezioni() {
    document.querySelectorAll('.view-section').forEach(el => el.classList.remove('active'));
    document.getElementById('main-grid-view').style.display = 'grid';
    document.querySelector('.search-container').style.display = 'block';
    resus.pause();
}

function filtraCard(query) {
    const cards = document.querySelectorAll('#main-grid-view .card');
    cards.forEach(card => {
        const text = card.innerText.toLowerCase();
        card.style.display = text.includes(query.toLowerCase()) ? 'block' : 'none';
    });
}

function avviaAnalisiEGA() {
    const input = {
        ph: parseFloat(document.getElementById('ega-ph').value),
        paco2: parseFloat(document.getElementById('ega-paco2').value),
        hco3: parseFloat(document.getElementById('ega-hco3').value),
        na: parseFloat(document.getElementById('ega-na').value),
        cl: parseFloat(document.getElementById('ega-cl').value),
        k: parseFloat(document.getElementById('ega-k').value) || 0,
        lat: parseFloat(document.getElementById('ega-lat').value),
        pao2: parseFloat(document.getElementById('ega-pao2').value),
        fio2: parseFloat(document.getElementById('ega-fio2').value),
        usaK: document.getElementById('ega-usak').checked
    };

    if ([input.ph, input.paco2, input.hco3].filter(v => !isNaN(v)).length < 2) {
        alert("Inserisci almeno due parametri tra pH, PaCO₂ e HCO₃⁻.");
        return;
    }

    const risultato = calcolaEGA(input);
    document.getElementById('ega-textarea').value = risultato;
    document.getElementById('ega-report').style.display = 'block';
}

function copiaTestoEGA() {
    const textarea = document.getElementById('ega-textarea');
    textarea.select();
    document.execCommand('copy');
    alert("Referto EGA copiato negli appunti!");
}

function copiaResusLog() {
    const logItems = resus.state.eventiLog.map(ev => `[${ev.time}] ${ev.text}`).join('\n');
    const reportCompleto = `=== REPORT RIANIMAZIONE ACLS ===\nDurata Totale: ${resus.formatTime(resus.totalSeconds)}\nShock Totali: ${resus.state.shockCount}\nAdrenalina: ${resus.state.adrenalinaCount} mg\nAmiodarone: ${resus.state.amiodaroneTotal} mg\n\nCRONOLOGIA EVENTI:\n${logItems}`;

    navigator.clipboard.writeText(reportCompleto).then(() => {
        alert("Report di rianimazione copiato negli appunti!");
    });
}
