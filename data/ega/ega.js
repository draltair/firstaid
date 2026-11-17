// Algoritmo EGA. Soglie e formule di compenso vivono in data/ega/algoritmo.json (con fonte).
// Questo file contiene solo la logica di classificazione, nessun numero clinico scritto qui dentro.

let EGA_DATA = null;

(async function caricaDatiEGA() {
    try {
        const res = await fetch('data/ega/algoritmo.json');
        const voce = await res.json();
        EGA_DATA = voce.contenuto;
    } catch (e) {
        console.error('Impossibile caricare data/ega/algoritmo.json', e);
    }
})();

function calcolaEGA(input) {
    if (!EGA_DATA) {
        return "Dati di riferimento EGA non ancora caricati. Riprova tra un istante.";
    }

    const { ph, paco2, hco3, na, cl, k, lat, pao2, fio2, usaK } = input;
    const norm = EGA_DATA.range_normali;
    const comp = EGA_DATA.formule_compenso;

    let righe = [];
    righe.push("=== REFERTO ANALISI EMOGASANALITICA ===");
    righe.push(`Valori -> pH: ${isNaN(ph) ? '--' : ph}, PaCO2: ${isNaN(paco2) ? '--' : paco2} mmHg, HCO3: ${isNaN(hco3) ? '--' : hco3} mmol/L`);
    righe.push("");

    // --- 1. Classificazione indipendente delle due componenti (corregge il bug della diagnosi mista) ---
    let respDir = 'normale';
    if (!isNaN(paco2)) {
        if (paco2 > norm.paco2_mmHg.max) respDir = 'acidosi';
        else if (paco2 < norm.paco2_mmHg.min) respDir = 'alcalosi';
    }
    let metDir = 'normale';
    if (!isNaN(hco3)) {
        if (hco3 < norm.hco3_mmolL.min) metDir = 'acidosi';
        else if (hco3 > norm.hco3_mmolL.max) metDir = 'alcalosi';
    }

    let phDir = 'normale';
    if (!isNaN(ph)) {
        if (ph < norm.ph.min) phDir = 'acidemia';
        else if (ph > norm.ph.max) phDir = 'alcalemia';
    }

    // --- 2. Logica di classificazione: le due componenti sono valutate ENTRAMBE, non in sequenza con priorità ---
    if (respDir === 'normale' && metDir === 'normale') {
        righe.push(phDir === 'normale'
            ? "• Nessun disturbo acido-base rilevabile con i parametri forniti."
            : "• pH alterato ma PaCO2 e HCO3 nella norma: valori incoerenti, ricontrollare il prelievo.");
    } else if (respDir !== 'normale' && metDir !== 'normale' && respDir === metDir) {
        // Stesso segno su entrambe le componenti -> disturbo misto, inequivocabile
        righe.push(`• DISTURBO MISTO: acidosi/alcalosi respiratoria E metabolica dello stesso segno (${respDir} respiratoria + ${metDir} metabolica).`);
        righe.push("  Entrambe le componenti spingono il pH nella stessa direzione: non si tratta di compenso.");
    } else if (respDir !== 'normale' && metDir !== 'normale' && respDir !== metDir) {
        // Segni opposti -> combinazione, possibile pH quasi normale per effetto di cancellazione
        righe.push(`• Componente respiratoria (${respDir}) e metabolica (${metDir}) di segno opposto.`);
        righe.push("  Puo trattarsi di due disturbi primari opposti (es. acidosi metabolica + alcalosi respiratoria) oppure di un compenso: valutare il contesto clinico, non solo i numeri.");
    } else if (respDir !== 'normale') {
        // Solo la componente respiratoria è alterata -> disturbo respiratorio primario, verifica compenso metabolico
        const f = respDir === 'acidosi' ? comp.acidosi_respiratoria_acuta : comp.alcalosi_respiratoria_acuta;
        const fCronica = respDir === 'acidosi' ? comp.acidosi_respiratoria_cronica : comp.alcalosi_respiratoria_cronica;
        righe.push(`• Disturbo primario: ${respDir === 'acidosi' ? 'Acidosi' : 'Alcalosi'} Respiratoria`);
        if (!isNaN(hco3)) {
            const deltaPaco2 = (paco2 - 40) / 10;
            const attesoAcuto = respDir === 'acidosi' ? 24 + 1 * deltaPaco2 : 24 - 2 * (-deltaPaco2);
            const attesoCronico = respDir === 'acidosi' ? 24 + 3.5 * deltaPaco2 : 24 - 5 * (-deltaPaco2);
            righe.push(`  HCO3 atteso se acuto: ~${attesoAcuto.toFixed(1)} mmol/L · se cronico: ~${attesoCronico.toFixed(1)} mmol/L. Rilevato: ${hco3} mmol/L.`);
            righe.push(`  (${f.nome}; vedi fonte specifica nel file dati)`);
        }
    } else if (metDir !== 'normale') {
        // Solo la componente metabolica è alterata -> disturbo metabolico primario, verifica compenso respiratorio
        if (metDir === 'acidosi') {
            righe.push("• Disturbo primario: Acidosi Metabolica");
            if (!isNaN(paco2) && !isNaN(hco3)) {
                const atteso = (1.5 * hco3) + 8;
                const diff = paco2 - atteso;
                const esito = Math.abs(diff) <= 2 ? "Compenso respiratorio adeguato." : diff > 2 ? "PaCO2 più alta dell'atteso: sovrapposta acidosi respiratoria." : "PaCO2 più bassa dell'atteso: sovrapposta alcalosi respiratoria.";
                righe.push(`  ${comp.acidosi_metabolica.nome}: PaCO2 attesa = ${atteso.toFixed(1)} mmHg (±2). Rilevata: ${paco2} mmHg. (${esito})`);
            }
        } else {
            righe.push("• Disturbo primario: Alcalosi Metabolica");
            if (!isNaN(paco2) && !isNaN(hco3)) {
                const atteso = 40 + 0.7 * (hco3 - 24);
                const diff = paco2 - atteso;
                const esito = Math.abs(diff) <= 1.5 ? "Compenso respiratorio adeguato." : diff > 1.5 ? "PaCO2 più alta dell'atteso: sovrapposta acidosi respiratoria." : "PaCO2 più bassa dell'atteso: sovrapposta alcalosi respiratoria.";
                righe.push(`  ${comp.alcalosi_metabolica.nome}: PaCO2 attesa = ${atteso.toFixed(1)} mmHg (±1.5). Rilevata: ${paco2} mmHg. (${esito})`);
            }
        }
    }

    // --- Anion gap ---
    if (!isNaN(na) && !isNaN(cl) && !isNaN(hco3)) {
        const ag = usaK ? (na + k) - (cl + hco3) : na - (cl + hco3);
        const agNorm = usaK ? norm.anion_gap_normale_con_k : norm.anion_gap_normale_senza_k;
        const evalAG = ag > (agNorm + 2) ? "Anion Gap ELEVATO" : ag < (agNorm - 2) ? "Anion Gap ridotto" : "Anion Gap normale";
        righe.push(`• Anion Gap: ${ag.toFixed(1)} mmol/L (norma ~${agNorm} ±2) -> ${evalAG}`);
    }

    // --- Lattati ---
    if (!isNaN(lat)) {
        righe.push(`• Lattati: ${lat} mmol/L (${lat > norm.lattati_mmolL_soglia ? "Iperlattatemia" : "Nella norma"})`);
    }

    // --- P/F ratio con classificazione di Berlino ---
    if (!isNaN(pao2) && !isNaN(fio2)) {
        const f = fio2 > 1 ? fio2 / 100 : fio2;
        const pf = pao2 / f;
        const fascia = EGA_DATA.pf_ratio_classificazione_berlino.fasce.find(fa => pf >= fa.min && (fa.max === null || pf <= fa.max));
        righe.push(`• Rapporto P/F: ${pf.toFixed(0)} -> ${fascia ? fascia.testo : '—'} (classificazione di Berlino, ARDS)`);
    }

    return righe.join('\n');
}
