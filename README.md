# First AId

App web personale per il Pronto Soccorso: algoritmi, calcolatori e numeri utili.
Uso personale, condivisa solo con persone di fiducia. Non approvata da ASL, Regione o Ministero.

## Struttura

```
index.html          # homepage dell'app
data/                # una cartella per sezione del menu, un file JSON per voce
  rianimazione/
  calcolatori/
  antibiotici/
  procedure/
  sedazione/
  pdta/
  rubrica/
  cartella/
  dimissione/
  moduli/
  percorsi/
  docs-asl/
  turni/            # contenuti da proteggere
  formazione/
  riunioni/         # contenuti da proteggere
schema/              # regole di validazione dei file JSON
src/                 # codice dell'app (da popolare)
```

## Regola per ogni voce

Ogni file JSON in `data/` deve avere `fonte`, `verifica` e `versione` compilati.
Nessuna dose o soglia clinica senza una fonte verificabile (scheda tecnica, linea guida,
protocollo aziendale). Lo schema in `schema/voce-base.schema.json` descrive i campi obbligatori.

## Aggiornare una voce

1. Apri o crea il file JSON nella cartella giusta.
2. Aggiorna `contenuto`.
3. Aggiorna `verifica.data_verifica` e `verifica.prossima_revisione`.
4. Alza `versione` di 1.
5. Commit con un messaggio che dice cosa è cambiato e perché.
