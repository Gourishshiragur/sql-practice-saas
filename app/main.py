from dotenv import load_dotenv
from fastapi import FastAPI, Request, Form
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from app.questions import QUESTIONS
from app.routes.tools import router as tools_router

load_dotenv()

# =========================
# APP SETUP
# =========================
app = FastAPI()

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
# SQL CHECK
# =========================
@app.post("/run")
def run_query(user_sql: str = Form(...), qid: str = Form(...)):
    for level in QUESTIONS:
        for q in QUESTIONS[level]:
            if q["qid"] == qid:
                correct = q["expected_sql"].strip().lower() == user_sql.strip().lower()
                return {
                    "status": "correct" if correct else "wrong",
                    "expected_sql": q["expected_sql"],
                    "cols": q["result"]["cols"],
                    "rows": q["result"]["rows"],
                }
    return {"status": "error"}

@app.post("/show-answer")
def show_answer(qid: str = Form(...)):
    for level in QUESTIONS:
        for q in QUESTIONS[level]:
            if q["qid"] == qid:
                return {
                    "expected_sql": q["expected_sql"],
                    "cols": q["result"]["cols"],
                    "rows": q["result"]["rows"],
                }
    return {"status": "error"}

# =========================
# TABLES
# =========================
@app.get("/tables")
def tables():
    return {
        "employees": {
            "columns": ["id", "name", "department", "salary", "hire_date"],
            "rows": [
                [1, "Alice", "IT", 60000, "2021-03-01"],
                [2, "Bob", "HR", 45000, "2020-07-15"],
                [3, "Charlie", "IT", 70000, "2019-11-20"],
            ],
        }
    }

@app.get("/health")
def health():
    return {"status": "ok"}

# =========================
# AI ROUTER
# =========================
app.include_router(tools_router)
