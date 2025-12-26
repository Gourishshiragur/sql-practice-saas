from fastapi import FastAPI, Request, Form
from fastapi.responses import HTMLResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates

from app.questions import QUESTIONS

app = FastAPI()

# -----------------------------
# STATIC & TEMPLATES (FIXED PATHS)
# -----------------------------
app.mount("/static", StaticFiles(directory="app/static"), name="static")
templates = Jinja2Templates(directory="app/templates")

# -----------------------------
# HOME PAGE
# -----------------------------
@app.get("/", response_class=HTMLResponse)
def home(
    request: Request,
    level: str = "easy",
    last_qid: str | None = None
):
    questions = QUESTIONS[level]

    # find next question index (no repeat)
    if last_qid:
        qids = [q["qid"] for q in questions]
        try:
            index = qids.index(last_qid) + 1
        except ValueError:
            index = 0
    else:
        index = 0

    if index >= len(questions):
        index = 0

    q = questions[index]

    return templates.TemplateResponse(
        "index.html",
        {
            "request": request,
            "level": level,
            "q": {
                "id": q["qid"],
                "question": q["text"],
                "hint": "Write the correct SQL query",
                "number": index + 1,
                "total": len(questions),
            },
        },
    )

# -----------------------------
# META (TOTAL QUESTIONS PER LEVEL)
# -----------------------------
@app.get("/meta")
def meta():
    return {k: len(v) for k, v in QUESTIONS.items()}

# -----------------------------
# RUN QUERY
# -----------------------------
@app.post("/run")
def run_query(
    user_sql: str = Form(...),
    qid: str = Form(...)
):
    # Demo validation logic
    for level in QUESTIONS:
        for q in QUESTIONS[level]:
            if q["qid"] == qid:
                expected = q["expected_sql"]
                is_correct = expected.lower() in user_sql.lower()

                return {
                    "status": "correct" if is_correct else "wrong",
                    "expected_sql": expected,
                    "cols": ["Result"],
                    "rows": [["Query executed (demo result)"]],
                }

    return JSONResponse(
        status_code=400,
        content={"status": "error", "message": "Invalid question id"},
    )

# -----------------------------
# SHOW ANSWER
# -----------------------------
@app.post("/show-answer")
def show_answer(qid: str = Form(...)):
    for level in QUESTIONS:
        for q in QUESTIONS[level]:
            if q["qid"] == qid:
                return {
                    "expected_sql": q["expected_sql"],
                    "cols": ["Result"],
                    "rows": [["Correct query result (demo)"]],
                }

    return JSONResponse(
        status_code=400,
        content={"message": "Invalid question id"},
    )

# -----------------------------
# AVAILABLE TABLES (RIGHT PANEL)
# -----------------------------
@app.get("/tables")
def tables():
    return {
        "employees": ["id", "name", "department", "salary", "hire_date"],
        "departments": ["dept_id", "dept_name"],
    }

# -----------------------------
# HEALTH CHECK
# -----------------------------
@app.get("/health")
def health():
    return {"status": "ok"}
