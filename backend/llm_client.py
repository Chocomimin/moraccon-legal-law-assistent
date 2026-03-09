import requests

OLLAMA_URL = "http://localhost:11434/api/generate"
MODEL = "qwen2.5:3b"

def ask_local_llm(prompt: str) -> str:
    payload = {
        "model": MODEL,
        "prompt": prompt,
        "stream": False
    }

    try:
        res = requests.post(OLLAMA_URL, json=payload, timeout=60)
        res.raise_for_status()
    except Exception as e:
        return "Local LLM error: " + str(e)

    data = res.json()
    return data.get("response", "")
