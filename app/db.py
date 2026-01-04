import sqlite3

DB = "employees.db"

def get_connection():
    return sqlite3.connect(DB, check_same_thread=False)

def init_db():
    import os
    if os.path.exists(DB):
        os.remove(DB)

    conn = get_connection()
    cur = conn.cursor()

    cur.execute("""
    CREATE TABLE employees (
        id INTEGER,
        name TEXT,
        department TEXT,
        salary INTEGER,
        hire_date TEXT
    )
    """)

    cur.executemany(
        "INSERT INTO employees VALUES (?, ?, ?, ?, ?)",
        [
            (1, "Alice", "IT", 70000, "2022-01-15"),
            (2, "Bob", "HR", 50000, "2021-06-10"),
            (3, "Charlie", "IT", 80000, "2020-09-01"),
            (4, "David", "Finance", 60000, "2019-11-20"),
            (5, "Eva", "HR", 55000, "2023-02-05"),
        ]
    )

    conn.commit()
    conn.close()
