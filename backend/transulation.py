from googletrans import Translator
from pathlib import Path

# Input and output file
input_file = "data/txts/Morocco_civproc.txt"
output_file = "data/txts/Morocco_civproc(english).txt"


translator = Translator()

# Read original text
with open(input_file, "r", encoding="utf-8") as f:
    text = f.read()

# Split text into chunks for translation (to avoid API limits)
chunk_size = 5000
chunks = [text[i:i+chunk_size] for i in range(0, len(text), chunk_size)]

translated_text = ""
for chunk in chunks:
    translated_text += translator.translate(chunk, src='fr', dest='en').text + "\n"

# Save translated text
with open(output_file, "w", encoding="utf-8") as f:
    f.write(translated_text)

print(f"Translation completed: {output_file}")
