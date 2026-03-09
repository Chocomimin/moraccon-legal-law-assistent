EMBED_MODEL = "sentence-transformers/paraphrase-multilingual-mpnet-base-v2"
CHROMA_PATH = "data/chroma"
PDF_FOLDER = "data/pdfs"
TEXT_FOLDER = "data/text"
CHUNK_FOLDER = "data/chunks"
LAW_DOMAINS = {
    "penal_code": {
        "files": ["Morocco-Penal-Code-2018-English.txt"],
        "description": "Crimes, murder, theft, punishment, homicide, assault, fraud"
    },
    "family_law": {
        "files": ["Moudawana.txt"],
        "description": "Marriage, divorce, inheritance, family law"
    },
    "constitution": {
        "files": ["Morocco-Constitution.txt"],
        "description": "Fundamental rights, freedom, equality, constitution"
    },
    "civil_procedure": {
        "files": ["Morocco_civproc.txt", "Morocco_civproc(english).txt"],
        "description": "Courts, trials, appeals, procedures"
    }
}
