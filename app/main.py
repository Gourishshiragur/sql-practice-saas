from fastapi import FastAPI, Request, Form
from fastapi.responses import HTMLResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates

from app.questions import QUESTIONS

app = FastAPI()

# -----------------------------
# STATIC & TEMPLATES
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
# RUN QUERY (DEMO LOGIC)
# -----------------------------
@app.post("/run")
def run_query(
    user_sql: str = Form(...),
    qid: str = Form(...)
):
    for level in QUESTIONS:
        for q in QUESTIONS[level]:
            if q["qid"] == qid:
                expected = q["expected_sql"]
                is_correct = expected.lower() in user_sql.lower()

                return {
                    "status": "correct" if is_correct else "wrong",
                    "expected_sql": expected,
                    "cols": ["Result"],
                    "rows": [["Query executed successfully (demo)"]],
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
                    "rows": [["Correct query output (demo)"]],
                }

    return JSONResponse(
        status_code=400,
        content={"message": "Invalid question id"},
    )

# -----------------------------
# AVAILABLE TABLES (SQL-EDITOR STYLE)
# -----------------------------
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
        },
        "departments": {
            "columns": ["dept_id", "dept_name"],
            "rows": [
                [10, "IT"],
                [20, "HR"],
                [30, "Finance"],
            ],
        },
    }

# -----------------------------
# HEALTH CHECK
# -----------------------------
@app.get("/health")
def health():
    return {"status": "ok"}
