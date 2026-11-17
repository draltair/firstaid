function aggiornaCalcoloFarmaco() {
    const key = document.getElementById('farmaco-select').value;
    const farmaco = databaseFarmaciInfusione[key];
    const peso = parseFloat(document.getElementById('farmaco-peso').value) || 70;

    if (!farmaco) return;

    document.getElementById('info-farmaco-titolo').innerText = farmaco.nome + " — " + farmaco.indicazione;
    document.getElementById('info-farmaco-diluizione').innerText = "Diluizione standard: " + farmaco.diluizione;

    const range = document.getElementById('farmaco-dose-range');
    range.min = farmaco.minDose;
    range.max = farmaco.maxDose;
    range.step = farmaco.stepDose;
    
    if (parseFloat(range.value) < farmaco.minDose || parseFloat(range.value) > farmaco.maxDose) {
        range.value = farmaco.defaultDose;
        document.getElementById('farmaco-dose-input').value = farmaco.defaultDose;
    }

    document.getElementById('unita-misura-label').innerText = farmaco.unitaMisuraDose;

    const doseCorrente = parseFloat(document.getElementById('farmaco-dose-input').value) || farmaco.defaultDose;
    const mlH = farmaco.calcolaMlH(peso, doseCorrente);

    document.getElementById('risultato-mlh').innerText = mlH.toFixed(1) + " mL/h";
    document.getElementById('risultato-dose').innerText = doseCorrente.toFixed(2) + " " + farmaco.unitaMisuraDose;
}

function sincronizzaSliderDose(val) {
    document.getElementById('farmaco-dose-input').value = val;
    aggiornaCalcoloFarmaco();
}

function sincronizzaInputDose(val) {
    document.getElementById('farmaco-dose-range').value = val;
    aggiornaCalcoloFarmaco();
}
