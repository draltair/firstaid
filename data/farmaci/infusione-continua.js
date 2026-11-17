/**
 * Database Farmaci in Infusione Continua (Basato su Spieghini 4.0)
 * Supporta calcolo dinamico in base al peso con output in mL/h e mcg/Kg/min (o mcg/Kg/h)
 */

const databaseFarmaciInfusione = {
    noradrenalina: {
        nome: "Noradrenalina",
        indicazione: "Shock vasodilatatorio / Settico",
        fiale: "2 mg / 1 mL",
        diluizione: "8 fiale + 42 mL G5% o SF",
        concentrazioneMgMl: 0.32, // 16 mg in 50 mL = 320 mcg/mL
        unitaMisuraDose: "mcg/Kg/min",
        defaultDose: 0.1,
        minDose: 0.05,
        maxDose: 1.0,
        stepDose: 0.05,
        // Formula: mL/h = (Dose mcg/Kg/min * Peso Kg * 60) / Concentrazione mcg/mL (320)
        calcolaMlH: (peso, doseMcgKgMin) => (doseMcgKgMin * peso * 60) / 320,
        calcolaDose: (peso, mlH) => (mlH * 320) / (peso * 60)
    },
    adrenalina: {
        nome: "Adrenalina (Infusione Continua)",
        indicazione: "Stato di shock / Arresto / Bradiaritmie",
        fiale: "1 mg / 1 mL[cite: 5]",
        diluizione: "3 fiale + 47 mL SF o G5%[cite: 5]",
        concentrazioneMgMl: 0.06, // 3 mg in 50 mL = 60 mcg/mL[cite: 5]
        unitaMisuraDose: "mcg/Kg/min",
        defaultDose: 0.05,
        minDose: 0.01,
        maxDose: 0.5,
        stepDose: 0.01,
        calcolaMlH: (peso, doseMcgKgMin) => (doseMcgKgMin * peso * 60) / 60,
        calcolaDose: (peso, mlH) => (mlH * 60) / (peso * 60)
    },
    urapidil: {
        nome: "Urapidil (Ebrantil)",
        indicazione: "Emergenza Ipertensiva",
        fiale: "50 mg / 10 mL[cite: 4]",
        diluizione: "1 fiala + 30 mL SF o G5% (Pompa siringa)[cite: 4]",
        concentrazioneMgMl: 1.25, // 50 mg in 40 mL = 1.25 mg/mL (o 5 mg/mL puro)
        unitaMisuraDose: "mcg/Kg/min",
        defaultDose: 5.0,
        minDose: 2.5,
        maxDose: 10.0,
        stepDose: 0.5,
        calcolaMlH: (peso, doseMcgKgMin) => (doseMcgKgMin * peso * 60) / 1250, // convertendo in mcg/min / mcg/mL
        calcolaDose: (peso, mlH) => (mlH * 1250) / (peso * 60)
    },
    propofol: {
        nome: "Propofol (Diprivan 1%)",
        indicazione: "Sedazione in Area Critica / RSI",
        fiale: "500 mg / 50 mL (1%)[cite: 7]",
        diluizione: "Puro (10 mg/mL)[cite: 7]",
        concentrazioneMgMl: 10, 
        unitaMisuraDose: "mg/Kg/h",
        defaultDose: 1.5,
        minDose: 0.3,
        maxDose: 4.0,
        stepDose: 0.1,
        // Formula: mL/h = (Dose mg/Kg/h * Peso Kg) / Concentrazione mg/mL (10)
        calcolaMlH: (peso, doseMgKgH) => (doseMgKgH * peso) / 10,
        calcolaDose: (peso, mlH) => (mlH * 10) / peso
    },
    midazolam: {
        nome: "Midazolam (Ipnovel)",
        indicazione: "Sedazione / Mantenimento",
        fiale: "50 mg / 10 mL",
        diluizione: "50 mg + 40 mL SF (Concentrazione 1 mg/mL)",
        concentrazioneMgMl: 1.0,
        unitaMisuraDose: "mg/Kg/h",
        defaultDose: 0.1,
        minDose: 0.03,
        maxDose: 0.2,
        stepDose: 0.01,
        calcolaMlH: (peso, doseMgKgH) => (doseMgKgH * peso) / 1.0,
        calcolaDose: (peso, mlH) => (mlH * 1.0) / peso
    },
    fentanil: {
        nome: "Fentanil",
        indicazione: "Analgesia in Area Critica",
        fiale: "0.1 mg / 2 mL[cite: 6]",
        diluizione: "5 fiale (0.5 mg) + 45 mL SF (Concentrazione 10 mcg/mL)[cite: 7]",
        concentrazioneMgMl: 0.01, // 10 mcg/mL
        unitaMisuraDose: "mcg/Kg/h",
        defaultDose: 1.0,
        minDose: 0.7,
        maxDose: 10.0,
        stepDose: 0.1,
        calcolaMlH: (peso, doseMcgKgH) => (doseMcgKgH * peso) / 10,
        calcolaDose: (peso, mlH) => (mlH * 10) / peso
    },
    dexmedetomidina: {
        nome: "Dexmedetomidina (Dexdor)",
        indicazione: "Sedazione (NIV / TI)",
        fiale: "200 mcg / 2 mL",
        diluizione: "400 mcg (4 mL) + 46 mL SF (Concentrazione 8 mcg/mL)[cite: 7]",
        concentrazioneMgMl: 0.008, // 8 mcg/mL
        unitaMisuraDose: "mcg/Kg/h",
        defaultDose: 0.7,
        minDose: 0.2,
        maxDose: 1.4,
        stepDose: 0.1,
        calcolaMlH: (peso, doseMcgKgH) => (doseMcgKgH * peso) / 8,
        calcolaDose: (peso, mlH) => (mlH * 8) / peso
    }
};
