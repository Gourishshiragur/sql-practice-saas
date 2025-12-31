from fastapi import APIRouter
from pydantic import BaseModel
from groq import Groq
import os
import logging
from dotenv import load_dotenv



router = APIRouter(prefix="/ai")
logging.basicConfig(level=logging.INFO)

# 🔎 DEBUG (KEEP FOR NOW)
print("🔥 GROQ_API_KEY from tools.py:", os.getenv("GROQ_API_KEY"))

class ChatRequest(BaseModel):
    message: str

@router.post("/chat")
def chat(req: ChatRequest):
    user_text = req.message.strip()

    if not user_text:
        return "ದಯವಿಟ್ಟು ಏನಾದರೂ ಹೇಳಿ 🙂"

    api_key = os.getenv("GROQ_API_KEY")
    if not api_key:
        return "AI is not configured yet."

    try:
        client = Groq(api_key=api_key)

        completion = client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[
                {
                    "role": "system",
                    "content": (
                        "You are a smart, friendly assistant. "
                        "Reply in the same language as the user. "
                        "Kannada → Kannada, Hindi → Hindi, else English."
                    )
                },
                {"role": "user", "content": user_text}
            ],
            temperature=0.7,
            max_tokens=300
        )

        reply = completion.choices[0].message.content.strip()
        return reply or "ಸರಿ 🙂 ನಾನು ಸಹಾಯ ಮಾಡಬಹುದು."

    except Exception as e:
        logging.error(f"Groq error: {e}")
        return "ಕ್ಷಮಿಸಿ 😕 ಈಗ ಉತ್ತರಿಸಲು ಸಾಧ್ಯವಾಗುತ್ತಿಲ್ಲ."
