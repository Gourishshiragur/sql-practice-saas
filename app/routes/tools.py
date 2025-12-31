from fastapi import APIRouter
from pydantic import BaseModel
from groq import Groq
import os
import logging

router = APIRouter(prefix="/ai")
logging.basicConfig(level=logging.INFO)

# 🔎 DEBUG (KEEP FOR NOW – remove later if needed)
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
        return "Please say or type something 🙂"

    api_key = os.getenv("GROQ_API_KEY")
    if not api_key:
        return "AI is not configured yet."

    # ✅ ENGLISH-ONLY SYSTEM PROMPT (FINAL)
    system_prompt = """
You are an AI mentor embedded inside a SQL Practice web application.

ABOUT THIS WEBSITE:
- This website helps users practice SQL interview questions.
- Users answer one SQL question at a time.
- They can run SQL queries to check correctness.
- If they click "I don't know", the correct SQL and result table are shown.
- "Show Tables" displays available tables with sample data.
- There is a built-in AI assistant (you) for help and guidance.

HOW TO RESPOND:
- Always reply in clear, simple ENGLISH only.
- Use a friendly Indian English tone.
- Explain SQL concepts step by step when needed.
- If asked how to use the website, explain it clearly.
- Keep answers short, practical, and helpful.
- Do NOT mention that you are an AI model.
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
