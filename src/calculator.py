import os
import json
from typing import Dict, Any, Optional

class ClinicalCalculator:
    def __init__(self, schema_data: Dict[str, Any]):
        """Inizializza il calcolatore con i dati di una specifica scala clinica."""
        self.schema = schema_data
        self.calculator_id = schema_data.get("id")
        self.title = schema_data.get("title")
        self.description = schema_data.get("description")
        
        # Mappa le categorie per chiave (es. 'eyes', 'verbal', 'motor')
        self.categories = {cat["key"]: cat for cat in schema_data.get("categories", [])}
        self.selections: Dict[str, int] = {}

    def select_item(self, category_key: str, score: int) -> None:
        """Seleziona un punteggio per una categoria e valida l'input."""
        if category_key not in self.categories:
            raise ValueError(f"Categoria '{category_key}' non trovata nello schema.")
        
        valid_scores = [item["score"] for item in self.categories[category_key]["items"]]
        if score not in valid_scores:
            raise ValueError(f"Punteggio {score} non valido per '{category_key}'. Ammessi: {valid_scores}")
        
        self.selections[category_key] = score

    def reset(self) -> None:
        self.selections.clear()

    def is_complete(self) -> bool:
        return set(self.categories.keys()).issubset(set(self.selections.keys()))

    def compute_score(self) -> Optional[int]:
        if not self.is_complete():
            return None
        return sum(self.selections.values())


def load_calculator_from_file(file_path: str) -> ClinicalCalculator:
    """Funzione di utilità per caricare un calcolatore da un file JSON specifico."""
    with open(file_path, 'r', encoding='utf-8') as f:
        data = json.load(f)
    return ClinicalCalculator(data)


def load_all_calculators(directory_path: str = "data/calcolatori") -> Dict[str, ClinicalCalculator]:
    """
    Scansiona la cartella data/calcolatori/ e carica tutti i file JSON 
    restituendo un dizionario { id_calcolatore: oggetto_ClinicalCalculator }.
    """
    calculators = {}
    if not os.path.exists(directory_path):
        return calculators

    for filename in os.listdir(directory_path):
        if filename.endswith(".json"):
            file_path = os.path.join(directory_path, filename)
            try:
                calc = load_calculator_from_file(file_path)
                calculators[calc.calculator_id] = calc
            except Exception as e:
                print(f"Errore nel caricamento del file {filename}: {e}")
                
    return calculators
