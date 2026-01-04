from fastapi import APIRouter
from pydantic import BaseModel
from groq import Groq
import os
import logging

router = APIRouter(prefix="/tools")
logging.basicConfig(level=logging.INFO)

# ======================
# Request model
# ======================
class ChatRequest(BaseModel):
    message: str

# ======================
# AI Chat Endpoint
# ======================
@router.post("/ai/chat")
def ai_chat(req: ChatRequest):
    user_text = req.message.strip()

    if not user_text:
        return "Please say or type something 🙂"

    api_key = os.getenv("GROQ_API_KEY")
    if not api_key:
        return "AI is not configured yet."

    system_prompt = """
You are an AI mentor embedded inside a SQL Practice web application.

- Always reply in clear, simple ENGLISH.
- Help users understand SQL queries and concepts.
- Keep responses short and practical.
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
        return reply or "Sure 🙂 I can help you."

    except Exception as e:
        logging.error(f"❌ Groq error: {e}")
        return "Sorry 😕 I am unable to respond right now."
