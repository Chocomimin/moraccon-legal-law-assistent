from PyPDF2 import PdfReader
from pathlib import Path

PDF_DIR = Path("C:/Users/saisa/OneDrive/Desktop/legal-assistant/backend/data/pdfs")
OUTPUT_DIR = Path("C:/Users/saisa/OneDrive/Desktop/legal-assistant/backend/data/txts")
OUTPUT_DIR.mkdir(exist_ok=True)

for pdf_file in PDF_DIR.glob("*.pdf"):
    reader = PdfReader(pdf_file)
    text = ""
    for page in reader.pages:
        page_text = page.extract_text()
        if page_text:
            text += page_text + "\n"

    txt_file = OUTPUT_DIR / (pdf_file.stem + ".txt")
    with open(txt_file, "w", encoding="utf-8") as f:
        f.write(text)

    print(f"Saved text: {txt_file}")
