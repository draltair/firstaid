# First AId

App web personale per il Pronto Soccorso: algoritmi, calcolatori e numeri utili.
Uso personale, condivisa solo con persone di fiducia. Non approvata da ASL, Regione o Ministero.

## Struttura

```
index.html              # homepage e sezioni (griglia di card)
style.css               # tema scuro
app.js                  # navigazione tra sezioni
calculators-engine.js   # motore calcolatori: legge data/calcolatori/*.json
ega.js                  # algoritmo EGA: legge data/ega/algoritmo.json
resus.js                # Arrest Coach (timer, log) — dosaggi ancora da esternalizzare
data/                   # una cartella per dominio, un file JSON per voce
  calcolatori/           # heart, curb65, gcs, hasbled, nihss...
  ega/                   # soglie e formule di compenso
  rianimazione/          # config AHA (non ancora collegata a resus.js)
  antibiotici/ procedure/ sedazione/ pdta/ rubrica/ cartella/
  dimissione/ moduli/ percorsi/ docs-asl/ turni/ formazione/ riunioni/
schema/                  # regole di validazione dei file JSON
```

## Regola per ogni voce dati

Ogni file JSON in `data/` ha `fonte`, `verifica` e `versione` compilati.
Nessuna dose o soglia clinica senza una fonte verificabile. Il codice (`*.js`)
non contiene numeri clinici: li legge sempre da `data/`.

## Prossimi passi noti

- `resus.js` e le stringhe in `index.html` (adrenalina 1 mg, amiodarone 300/150 mg)
  contengono ancora dosaggi scritti a mano: vanno collegati a
  `data/rianimazione/arrest-coach-config.json`, che ha già la fonte AHA.
- Molte sezioni del menu (Antibiotici, Procedure, Sedazione, PDTA...) non hanno
  ancora contenuti: mostrano "in caricamento".
