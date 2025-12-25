from fastapi import FastAPI, Request, Form
from fastapi.responses import HTMLResponse, JSONResponse
from fastapi.templating import Jinja2Templates
from fastapi.staticfiles import StaticFiles
import random

from app.db import init_db, get_connection
from app.questions import QUESTIONS

app = FastAPI()

app.mount("/static", StaticFiles(directory="app/static"), name="static")
templates = Jinja2Templates(directory="app/templates")

@app.on_event("startup")
def startup():
    init_db()

def run_sql(sql):
    conn = get_connection()
    cur = conn.cursor()
    cur.execute(sql)
    rows = cur.fetchall()
    cols = [d[0] for d in cur.description]
    conn.close()
    return cols, rows

def get_question(level):
    pool = [q for q in QUESTIONS if q["level"] == level]
    return random.choice(pool)


@app.get("/", response_class=HTMLResponse)
def home(request: Request, level: str = "easy"):
    q = get_question(level)
    return templates.TemplateResponse(
        "index.html",
        {"request": request, "q": q, "level": level}
    )

@app.post("/run")
def run_query(user_sql: str = Form(...), qid: int = Form(...)):
    q = next(x for x in QUESTIONS if x["id"] == qid)

    try:
        cols_u, rows_u = run_sql(user_sql)
        cols_e, rows_e = run_sql(q["expected_sql"])

        structure_ok = all(
            k in user_sql.lower() for k in q["required_keywords"]
        )

        if rows_u == rows_e and structure_ok:
            return JSONResponse({
                "status": "correct",
                "cols": cols_u,
                "rows": rows_u
            })

        return JSONResponse({
            "status": "wrong",
            "expected_sql": q["expected_sql"],
            "cols": cols_e,
            "rows": rows_e
        })

    except Exception as e:
        return JSONResponse({
            "status": "error",
            "message": str(e)
        })

@app.post("/show-answer")
def show_answer(qid: int = Form(...)):
    q = next(x for x in QUESTIONS if x["id"] == qid)
    cols, rows = run_sql(q["expected_sql"])

    return JSONResponse({
        "expected_sql": q["expected_sql"],
        "cols": cols,
        "rows": rows
    })
