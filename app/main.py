from fastapi import FastAPI, Request, Form
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates

from app.questions import QUESTIONS
from app.routes.tools import router as tools_router
from app.db import get_connection   # make sure this exists
from app.db import init_db
# =========================
# APP SETUP
# =========================
app = FastAPI()

init_db()  # database recreated on startup

app.mount("/static", StaticFiles(directory="app/static"), name="static")

templates = Jinja2Templates(directory="app/templates")

# =========================
# HOME PAGE
# =========================
@app.get("/", response_class=HTMLResponse)
def home(request: Request, level: str = "easy", q_index: int = 0):
    questions = QUESTIONS[level]
    q_index = max(0, min(q_index, len(questions) - 1))
    q = questions[q_index]

    return templates.TemplateResponse(
        "index.html",
        {
            "request": request,
            "level": level,
            "q_index": q_index,
            "q": {
                "id": q["qid"],
                "question": q["text"],
                "hint": "Write the correct SQL query",
                "number": q_index + 1,
                "total": len(questions),
            },
        },
    )

# =========================
# TABLES (ONLY ONE API)
# =========================
@app.get("/tables")
def tables():
    conn = get_connection()
    cur = conn.cursor()

    result = {}

    cur.execute("SELECT name FROM sqlite_master WHERE type='table'")
    tables = [t[0] for t in cur.fetchall()]

    for table in tables:
        cur.execute(f"PRAGMA table_info({table})")
        cols = [c[1] for c in cur.fetchall()]

        cur.execute(f"SELECT * FROM {table}")
        rows = cur.fetchall()

        result[table] = {
            "columns": cols,
            "rows": rows
        }

    conn.close()
    return result

# =========================
# SQL CHECK
# =========================
@app.post("/run")
def run_query(user_sql: str = Form(...), qid: str = Form(...)):
    conn = get_connection()
    cur = conn.cursor()

    for level in QUESTIONS:
        for q in QUESTIONS[level]:
            if q["qid"] == qid:
                correct = q["expected_sql"].strip().lower() == user_sql.strip().lower()

                # ✅ Always run expected SQL on DB for display
                cur.execute(q["expected_sql"])
                rows = cur.fetchall()

                conn.close()
                return {
                    "status": "correct" if correct else "wrong",
                    "expected_sql": q["expected_sql"],
                    "cols": q["result"]["cols"],
                    "rows": rows
                }

    conn.close()
    return {"status": "error"}


@app.post("/show-answer")
def show_answer(qid: str = Form(...)):
    conn = get_connection()
    cur = conn.cursor()

    for level in QUESTIONS:
        for q in QUESTIONS[level]:
            if q["qid"] == qid:
                cur.execute(q["expected_sql"])
                rows = cur.fetchall()

                conn.close()
                return {
                    "expected_sql": q["expected_sql"],
                    "cols": q["result"]["cols"],
                    "rows": rows
                }

    conn.close()
    return {"status": "error"}


# =========================
# HEALTH
# =========================
@app.get("/health")
def health():
    return {"status": "ok"}

# =========================
# AI ROUTER
# =========================
app.include_router(tools_router)
