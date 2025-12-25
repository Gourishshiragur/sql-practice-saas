import sqlite3

DB = "employees.db"

def get_connection():
    return sqlite3.connect(DB, check_same_thread=False)

def init_db():
    conn = get_connection()
    cur = conn.cursor()

    cur.execute("""
    CREATE TABLE IF NOT EXISTS employees (
        id INTEGER,
        name TEXT,
        department TEXT,
        salary INTEGER
    )
    """)

    cur.execute("DELETE FROM employees")

    cur.executemany(
        "INSERT INTO employees VALUES (?, ?, ?, ?)",
        [
            (1, "Alice", "IT", 70000),
            (2, "Bob", "HR", 50000),
            (3, "Charlie", "IT", 80000),
            (4, "David", "Finance", 60000),
            (5, "Eva", "HR", 55000)
        ]
    )

    conn.commit()
    conn.close()
