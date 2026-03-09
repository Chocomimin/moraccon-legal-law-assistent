import axios from "axios";

const API_URL = "http://127.0.0.1:8000/generate";

export async function askLegalAssistant(message, maxTokens = 120) {
  try {
    const res = await axios.post(API_URL, {
      text: message,
      max_new_tokens: maxTokens
    }, { timeout: 60000 });
    return res.data.generated_text;
  } catch (err) {
    console.error("API error:", err);
    throw new Error("Could not contact backend");
  }
}
