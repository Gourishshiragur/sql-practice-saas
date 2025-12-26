QUESTIONS = {

# ==================================================
# EASY – 10 QUESTIONS
# ==================================================
"easy": [
    {
        "qid": "E1",
        "text": "Select all employees",
        "expected_sql": "SELECT * FROM employees",
        "result": {
            "cols": ["id", "name", "department", "salary", "hire_date"],
            "rows": [
                [1, "Alice", "IT", 60000, "2021-03-01"],
                [2, "Bob", "HR", 45000, "2020-07-15"],
                [3, "Charlie", "IT", 70000, "2019-11-20"],
            ],
        },
    },
    {
        "qid": "E2",
        "text": "Select employee names only",
        "expected_sql": "SELECT name FROM employees",
        "result": {
            "cols": ["name"],
            "rows": [["Alice"], ["Bob"], ["Charlie"]],
        },
    },
    {
        "qid": "E3",
        "text": "Get employee names and salaries",
        "expected_sql": "SELECT name, salary FROM employees",
        "result": {
            "cols": ["name", "salary"],
            "rows": [
                ["Alice", 60000],
                ["Bob", 45000],
                ["Charlie", 70000],
            ],
        },
    },
    {
        "qid": "E4",
        "text": "Find employees in IT department",
        "expected_sql": "SELECT * FROM employees WHERE department = 'IT'",
        "result": {
            "cols": ["id", "name", "department", "salary", "hire_date"],
            "rows": [
                [1, "Alice", "IT", 60000, "2021-03-01"],
                [3, "Charlie", "IT", 70000, "2019-11-20"],
            ],
        },
    },
    {
        "qid": "E5",
        "text": "Find employees with salary greater than 50000",
        "expected_sql": "SELECT * FROM employees WHERE salary > 50000",
        "result": {
            "cols": ["id", "name", "department", "salary", "hire_date"],
            "rows": [
                [1, "Alice", "IT", 60000, "2021-03-01"],
                [3, "Charlie", "IT", 70000, "2019-11-20"],
            ],
        },
    },
    {
        "qid": "E6",
        "text": "Order employees by salary",
        "expected_sql": "SELECT * FROM employees ORDER BY salary",
        "result": {
            "cols": ["id", "name", "department", "salary", "hire_date"],
            "rows": [
                [2, "Bob", "HR", 45000, "2020-07-15"],
                [1, "Alice", "IT", 60000, "2021-03-01"],
                [3, "Charlie", "IT", 70000, "2019-11-20"],
            ],
        },
    },
    {
        "qid": "E7",
        "text": "Get unique departments",
        "expected_sql": "SELECT DISTINCT department FROM employees",
        "result": {
            "cols": ["department"],
            "rows": [["IT"], ["HR"]],
        },
    },
    {
        "qid": "E8",
        "text": "Count total employees",
        "expected_sql": "SELECT COUNT(*) FROM employees",
        "result": {
            "cols": ["count"],
            "rows": [[3]],
        },
    },
    {
        "qid": "E9",
        "text": "Find employees hired after 2020",
        "expected_sql": "SELECT * FROM employees WHERE hire_date > '2020-01-01'",
        "result": {
            "cols": ["id", "name", "department", "salary", "hire_date"],
            "rows": [
                [1, "Alice", "IT", 60000, "2021-03-01"],
                [2, "Bob", "HR", 45000, "2020-07-15"],
            ],
        },
    },
    {
        "qid": "E10",
        "text": "Get top 2 highest paid employees",
        "expected_sql": "SELECT * FROM employees ORDER BY salary DESC LIMIT 2",
        "result": {
            "cols": ["id", "name", "department", "salary", "hire_date"],
            "rows": [
                [3, "Charlie", "IT", 70000, "2019-11-20"],
                [1, "Alice", "IT", 60000, "2021-03-01"],
            ],
        },
    },
],

# ==================================================
# MEDIUM – 10 QUESTIONS
# ==================================================
"medium": [
    {
        "qid": "M1",
        "text": "Find average salary per department",
        "expected_sql": "SELECT department, AVG(salary) FROM employees GROUP BY department",
        "result": {
            "cols": ["department", "avg_salary"],
            "rows": [["IT", 65000], ["HR", 45000]],
        },
    },
    {
        "qid": "M2",
        "text": "Count employees per department",
        "expected_sql": "SELECT department, COUNT(*) FROM employees GROUP BY department",
        "result": {
            "cols": ["department", "count"],
            "rows": [["IT", 2], ["HR", 1]],
        },
    },
    {
        "qid": "M3",
        "text": "Find maximum salary in each department",
        "expected_sql": "SELECT department, MAX(salary) FROM employees GROUP BY department",
        "result": {
            "cols": ["department", "max_salary"],
            "rows": [["IT", 70000], ["HR", 45000]],
        },
    },
    {
        "qid": "M4",
        "text": "Departments having average salary above 50000",
        "expected_sql": "SELECT department FROM employees GROUP BY department HAVING AVG(salary) > 50000",
        "result": {
            "cols": ["department"],
            "rows": [["IT"]],
        },
    },
    {
        "qid": "M5",
        "text": "Find second highest salary",
        "expected_sql": "SELECT MAX(salary) FROM employees WHERE salary < (SELECT MAX(salary) FROM employees)",
        "result": {
            "cols": ["salary"],
            "rows": [[60000]],
        },
    },
    {
        "qid": "M6",
        "text": "List employees with department name using join",
        "expected_sql": "SELECT e.name, d.dept_name FROM employees e JOIN departments d ON e.department = d.dept_name",
        "result": {
            "cols": ["name", "dept_name"],
            "rows": [["Alice", "IT"], ["Bob", "HR"], ["Charlie", "IT"]],
        },
    },
    {
        "qid": "M7",
        "text": "Find employees whose salary is above department average",
        "expected_sql": "SELECT name FROM employees e WHERE salary > (SELECT AVG(salary) FROM employees WHERE department = e.department)",
        "result": {
            "cols": ["name"],
            "rows": [["Charlie"]],
        },
    },
    {
        "qid": "M8",
        "text": "Get earliest hired employee",
        "expected_sql": "SELECT * FROM employees ORDER BY hire_date LIMIT 1",
        "result": {
            "cols": ["id", "name", "department", "salary", "hire_date"],
            "rows": [[3, "Charlie", "IT", 70000, "2019-11-20"]],
        },
    },
    {
        "qid": "M9",
        "text": "Find total salary per department",
        "expected_sql": "SELECT department, SUM(salary) FROM employees GROUP BY department",
        "result": {
            "cols": ["department", "sum_salary"],
            "rows": [["IT", 130000], ["HR", 45000]],
        },
    },
    {
        "qid": "M10",
        "text": "List employees not in HR department",
        "expected_sql": "SELECT * FROM employees WHERE department <> 'HR'",
        "result": {
            "cols": ["id", "name", "department", "salary", "hire_date"],
            "rows": [
                [1, "Alice", "IT", 60000, "2021-03-01"],
                [3, "Charlie", "IT", 70000, "2019-11-20"],
            ],
        },
    },
],

# ==================================================
# HARD – 10 QUESTIONS
# ==================================================
"hard": [
    {
        "qid": "H1",
        "text": "Rank employees by salary",
        "expected_sql": "SELECT name, salary, RANK() OVER (ORDER BY salary DESC) FROM employees",
        "result": {
            "cols": ["name", "salary", "rank"],
            "rows": [
                ["Charlie", 70000, 1],
                ["Alice", 60000, 2],
                ["Bob", 45000, 3],
            ],
        },
    },
    {
        "qid": "H2",
        "text": "Find duplicate departments",
        "expected_sql": "SELECT department FROM employees GROUP BY department HAVING COUNT(*) > 1",
        "result": {
            "cols": ["department"],
            "rows": [["IT"]],
        },
    },
    {
        "qid": "H3",
        "text": "Get employee with highest salary per department",
        "expected_sql": "SELECT * FROM employees e WHERE salary = (SELECT MAX(salary) FROM employees WHERE department = e.department)",
        "result": {
            "cols": ["id", "name", "department", "salary", "hire_date"],
            "rows": [
                [3, "Charlie", "IT", 70000, "2019-11-20"],
                [2, "Bob", "HR", 45000, "2020-07-15"],
            ],
        },
    },
    {
        "qid": "H4",
        "text": "Find employees hired before department average hire date",
        "expected_sql": "SELECT * FROM employees",
        "result": {
            "cols": ["id", "name", "department", "salary", "hire_date"],
            "rows": [],
        },
    },
    {
        "qid": "H5",
        "text": "Calculate running total of salary",
        "expected_sql": "SELECT name, salary, SUM(salary) OVER (ORDER BY salary) FROM employees",
        "result": {
            "cols": ["name", "salary", "running_total"],
            "rows": [
                ["Bob", 45000, 45000],
                ["Alice", 60000, 105000],
                ["Charlie", 70000, 175000],
            ],
        },
    },
    {
        "qid": "H6",
        "text": "Find employee count using window function",
        "expected_sql": "SELECT name, COUNT(*) OVER () FROM employees",
        "result": {
            "cols": ["name", "count"],
            "rows": [["Alice", 3], ["Bob", 3], ["Charlie", 3]],
        },
    },
    {
        "qid": "H7",
        "text": "List employees earning above company average",
        "expected_sql": "SELECT * FROM employees WHERE salary > (SELECT AVG(salary) FROM employees)",
        "result": {
            "cols": ["id", "name", "department", "salary", "hire_date"],
            "rows": [
                [1, "Alice", "IT", 60000, "2021-03-01"],
                [3, "Charlie", "IT", 70000, "2019-11-20"],
            ],
        },
    },
    {
        "qid": "H8",
        "text": "Find employees with same salary",
        "expected_sql": "SELECT salary FROM employees GROUP BY salary HAVING COUNT(*) > 1",
        "result": {
            "cols": ["salary"],
            "rows": [],
        },
    },
    {
        "qid": "H9",
        "text": "Get employee details with department table",
        "expected_sql": "SELECT e.*, d.dept_name FROM employees e JOIN departments d ON e.department = d.dept_name",
        "result": {
            "cols": ["id", "name", "department", "salary", "hire_date", "dept_name"],
            "rows": [
                [1, "Alice", "IT", 60000, "2021-03-01", "IT"],
                [2, "Bob", "HR", 45000, "2020-07-15", "HR"],
                [3, "Charlie", "IT", 70000, "2019-11-20", "IT"],
            ],
        },
    },
    {
        "qid": "H10",
        "text": "Find highest paid employee",
        "expected_sql": "SELECT * FROM employees ORDER BY salary DESC LIMIT 1",
        "result": {
            "cols": ["id", "name", "department", "salary", "hire_date"],
            "rows": [[3, "Charlie", "IT", 70000, "2019-11-20"]],
        },
    },
],
}
