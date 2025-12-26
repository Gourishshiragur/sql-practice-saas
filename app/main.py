from fastapi import FastAPI, Request, Form
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from questions import QUESTIONS

app = FastAPI()
app.mount("/static", StaticFiles(directory="static"), name="static")
templates = Jinja2Templates(directory="templates")

@app.get("/", response_class=HTMLResponse)
def home(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})

@app.get("/meta")
def meta():
    return {k: len(v) for k, v in QUESTIONS.items()}

@app.post("/question")
def get_question(level: str = Form(...), index: int = Form(...)):
    q = QUESTIONS[level][index]
    return {
        "qid": q["qid"],
        "text": q["text"],
        "number": index + 1,
        "total": len(QUESTIONS[level])
    }

@app.post("/run")
def run_query(user_sql: str = Form(...), level: str = Form(...), index: int = Form(...)):
    q = QUESTIONS[level][index]
    status = "correct" if q["expected_sql"].lower() in user_sql.lower() else "wrong"
    return {
        "status": status,
        "expected_sql": q["expected_sql"],
        "cols": ["sample"],
        "rows": [["Result shown here"]]
    }

@app.post("/show-answer")
def show_answer(level: str = Form(...), index: int = Form(...)):
    q = QUESTIONS[level][index]
    return {"expected_sql": q["expected_sql"], "cols": [], "rows": []}
