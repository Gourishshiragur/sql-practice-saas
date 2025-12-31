from fastapi import APIRouter
from pydantic import BaseModel
from groq import Groq
import os
import logging

router = APIRouter(prefix="/ai")
logging.basicConfig(level=logging.INFO)

# 🔎 DEBUG (safe to remove later)
print("🔥 GROQ_API_KEY from tools.py:", os.getenv("GROQ_API_KEY"))

# ======================
# Request model
# ======================
class ChatRequest(BaseModel):
    message: str

# ======================
# AI Chat Endpoint
# ======================
@router.post("/chat")
def chat(req: ChatRequest):
    user_text = req.message.strip()

    if not user_text:
        return "ದಯವಿಟ್ಟು ಏನಾದರೂ ಹೇಳಿ 🙂"

    api_key = os.getenv("GROQ_API_KEY")
    if not api_key:
        return "AI is not configured yet."

    # ✅ WEBSITE-AWARE SYSTEM PROMPT
    system_prompt = """
You are an AI mentor embedded inside a SQL Practice web application.

ABOUT THIS WEBSITE:
- This website is designed to practice SQL questions.
- Users see one SQL question at a time.
- Users write SQL queries and click the "Run" button to validate their answer.
- If the user clicks "I don't know", the correct SQL query and result are shown.
- "Show Tables" displays available database tables with sample data.
- User progress and accuracy are tracked automatically.
- There is a built-in AI assistant (you) for help, hints, and guidance.

HOW TO ANSWER:
- If the user asks "How to use this website", explain the above clearly.
- If the user asks SQL questions, explain SQL concepts simply.
- If the user asks general questions, answer naturally.
- If the user speaks in Kannada → reply in Kannada.
- If the user speaks in Hindi → reply in Hindi.
- Otherwise reply in English.
- Be short, friendly, and practical.
- Do NOT say you are just an AI model.
"""

    try:
        logging.info(f"🧠 User: {user_text}")

        client = Groq(api_key=api_key)

        completion = client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_text}
            ],
            temperature=0.7,
            max_tokens=300
        )

        reply = completion.choices[0].message.content.strip()
        return reply or "ಸರಿ 🙂 ನಾನು ಸಹಾಯ ಮಾಡಬಹುದು."

    except Exception as e:
        logging.error(f"❌ Groq error: {e}")
        return "ಕ್ಷಮಿಸಿ 😕 ಈಗ ಉತ್ತರಿಸಲು ಸಾಧ್ಯವಾಗುತ್ತಿಲ್ಲ."
