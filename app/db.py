import sqlite3

DB = "employees.db"

def get_connection():
    return sqlite3.connect(DB, check_same_thread=False)

def init_db():
    conn = get_connection()
    cur = conn.cursor()

    # =========================
    # EMPLOYEES TABLE
    # =========================
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

    # =========================
    # DEPARTMENTS TABLE (NEW)
    # =========================
    cur.execute("""
    CREATE TABLE IF NOT EXISTS departments (
        id INTEGER,
        department TEXT
    )
    """)

    cur.execute("DELETE FROM departments")

    cur.executemany(
        "INSERT INTO departments VALUES (?, ?)",
        [
            (1, "IT"),
            (2, "HR"),
            (3, "Finance")
        ]
    )

    conn.commit()
    conn.close()

    print("✅ Database initialized with employees & departments")
if __name__ == "__main__":
    init_db()
