from fastapi import FastAPI, Request, Form
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates

from app.questions import QUESTIONS

app = FastAPI()

app.mount("/static", StaticFiles(directory="app/static"), name="static")
templates = Jinja2Templates(directory="app/templates")


@app.get("/", response_class=HTMLResponse)
def home(request: Request, level: str = "easy", last_qid: str | None = None):
    questions = QUESTIONS[level]
    qids = [q["qid"] for q in questions]

    # current index logic (UNCHANGED BEHAVIOR)
    if last_qid and last_qid in qids:
        index = qids.index(last_qid) + 1
    else:
        index = 0

    if index >= len(questions):
        index = len(questions) - 1

    q = questions[index]

    # ✅ ADDITION: previous question id
    prev_qid = qids[index - 1] if index > 0 else None

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
            "prev_qid": prev_qid,  # 👈 NEW (safe)
        },
    )


@app.post("/run")
def run_query(user_sql: str = Form(...), qid: str = Form(...)):
    for level in QUESTIONS:
        for q in QUESTIONS[level]:
            if q["qid"] == qid:
                correct = q["expected_sql"].lower() == user_sql.strip().lower()
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


@app.get("/health")
def health():
    return {"status": "ok"}
