QUESTIONS = [

# =========================
# EASY
# =========================
{
    "id": 1,
    "level": "easy",
    "question": "Get all employees",
    "hint": "Use SELECT * FROM employees",
    "expected_sql": "SELECT * FROM employees",
    "required_keywords": ["select", "from employees"],
    "explanation": "Basic SELECT query to fetch all rows."
},
{
    "id": 2,
    "level": "easy",
    "question": "Employees from IT department",
    "hint": "Use WHERE department = 'IT'",
    "expected_sql": "SELECT * FROM employees WHERE department = 'IT'",
    "required_keywords": ["where", "department"],
    "explanation": "Filtering rows using WHERE clause."
},

# =========================
# MEDIUM
# =========================
{
    "id": 3,
    "level": "medium",
    "question": "Average salary per department",
    "hint": "Use GROUP BY department",
    "expected_sql": "SELECT department, AVG(salary) FROM employees GROUP BY department",
    "required_keywords": ["group by", "avg"],
    "explanation": "GROUP BY aggregates rows per department."
},
{
    "id": 4,
    "level": "medium",
    "question": "Employees earning more than department average salary",
    "hint": "Use a subquery",
    "expected_sql": """
        SELECT *
        FROM employees e
        WHERE salary >
          (SELECT AVG(salary)
           FROM employees
           WHERE department = e.department)
    """,
    "required_keywords": ["select", "avg", "where"],
    "explanation": "Correlated subquery compares each employee with department average."
},

# =========================
# HARD – WINDOW FUNCTIONS
# =========================
{
    "id": 5,
    "level": "hard",
    "question": "Assign row number to employees ordered by salary (highest first)",
    "hint": "Use ROW_NUMBER() OVER (ORDER BY salary DESC)",
    "expected_sql": """
        SELECT *,
               ROW_NUMBER() OVER (ORDER BY salary DESC) AS rn
        FROM employees
    """,
    "required_keywords": ["row_number", "over", "order by"],
    "explanation": "ROW_NUMBER assigns a unique rank to rows based on ordering."
},
{
    "id": 6,
    "level": "hard",
    "question": "Assign row number partitioned by department",
    "hint": "Use PARTITION BY department",
    "expected_sql": """
        SELECT *,
               ROW_NUMBER() OVER (
                   PARTITION BY department
                   ORDER BY salary DESC
               ) AS rn
        FROM employees
    """,
    "required_keywords": ["row_number", "partition by", "over"],
    "explanation": "PARTITION BY resets numbering per department."
},
{
    "id": 7,
    "level": "hard",
    "question": "Rank employees by salary with gaps",
    "hint": "Use RANK()",
    "expected_sql": """
        SELECT *,
               RANK() OVER (ORDER BY salary DESC) AS rnk
        FROM employees
    """,
    "required_keywords": ["rank", "over"],
    "explanation": "RANK assigns same rank for ties and leaves gaps."
},
{
    "id": 8,
    "level": "hard",
    "question": "Rank employees by salary without gaps",
    "hint": "Use DENSE_RANK()",
    "expected_sql": """
        SELECT *,
               DENSE_RANK() OVER (ORDER BY salary DESC) AS drnk
        FROM employees
    """,
    "required_keywords": ["dense_rank", "over"],
    "explanation": "DENSE_RANK does not skip ranks when ties occur."
},
{
    "id": 9,
    "level": "hard",
    "question": "Find highest paid employee in each department",
    "hint": "Use ROW_NUMBER + PARTITION BY",
    "expected_sql": """
        SELECT *
        FROM (
            SELECT *,
                   ROW_NUMBER() OVER (
                       PARTITION BY department
                       ORDER BY salary DESC
                   ) AS rn
            FROM employees
        )
        WHERE rn = 1
    """,
    "required_keywords": ["row_number", "partition by", "over"],
    "explanation": "Window functions allow top-N per group without GROUP BY."
},
{
    "id": 10,
    "level": "hard",
    "question": "Find second highest salary overall",
    "hint": "Use DENSE_RANK",
    "expected_sql": """
        SELECT *
        FROM (
            SELECT *,
                   DENSE_RANK() OVER (ORDER BY salary DESC) AS drnk
            FROM employees
        )
        WHERE drnk = 2
    """,
    "required_keywords": ["dense_rank", "over"],
    "explanation": "DENSE_RANK avoids missing ranks when salaries repeat."
},
{
    "id": 11,
    "level": "hard",
    "question": "Compare salary with previous employee",
    "hint": "Use LAG()",
    "expected_sql": """
        SELECT name,
               salary,
               salary - LAG(salary) OVER (ORDER BY salary DESC) AS diff
        FROM employees
    """,
    "required_keywords": ["lag", "over"],
    "explanation": "LAG accesses previous row values without joins."
},
{
    "id": 12,
    "level": "hard",
    "question": "Running total of salaries",
    "hint": "Use SUM() OVER",
    "expected_sql": """
        SELECT name,
               salary,
               SUM(salary) OVER (
                   ORDER BY salary
                   ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
               ) AS running_total
        FROM employees
    """,
    "required_keywords": ["sum", "over"],
    "explanation": "Running totals are a classic window function use case."
},
{
    "id": 13,
    "level": "hard",
    "question": "Percentage contribution of each employee salary",
    "hint": "Use SUM() OVER()",
    "expected_sql": """
        SELECT name,
               salary,
               salary * 100.0 / SUM(salary) OVER () AS percentage
        FROM employees
    """,
    "required_keywords": ["sum", "over"],
    "explanation": "OVER() without PARTITION applies to full dataset."
}

]
