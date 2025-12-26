QUESTIONS = {

    # ---------------- EASY (10) ----------------
    "easy": [
        {
            "qid": "E1",
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
            "qid": "E2",
            "text": "List all departments",
            "expected_sql": "SELECT dept_name FROM departments",
            "result": {
                "cols": ["dept_name"],
                "rows": [["IT"], ["HR"], ["Finance"]],
            },
        },
        {
            "qid": "E3",
            "text": "Show all employee names",
            "expected_sql": "SELECT name FROM employees",
            "result": {
                "cols": ["name"],
                "rows": [["Alice"], ["Bob"], ["Charlie"]],
            },
        },
        {
            "qid": "E4",
            "text": "Show all employee salaries",
            "expected_sql": "SELECT salary FROM employees",
            "result": {
                "cols": ["salary"],
                "rows": [[60000], [45000], [70000]],
            },
        },
        {
            "qid": "E5",
            "text": "Show employee names from IT department",
            "expected_sql": "SELECT name FROM employees WHERE department = 'IT'",
            "result": {
                "cols": ["name"],
                "rows": [["Alice"], ["Charlie"]],
            },
        },
        {
            "qid": "E6",
            "text": "Show employees with salary greater than 50000",
            "expected_sql": "SELECT name FROM employees WHERE salary > 50000",
            "result": {
                "cols": ["name"],
                "rows": [["Alice"], ["Charlie"]],
            },
        },
        {
            "qid": "E7",
            "text": "Count total employees",
            "expected_sql": "SELECT COUNT(*) FROM employees",
            "result": {
                "cols": ["count"],
                "rows": [[3]],
            },
        },
        {
            "qid": "E8",
            "text": "Show distinct departments",
            "expected_sql": "SELECT DISTINCT department FROM employees",
            "result": {
                "cols": ["department"],
                "rows": [["IT"], ["HR"]],
            },
        },
        {
            "qid": "E9",
            "text": "Show employees ordered by salary",
            "expected_sql": "SELECT name, salary FROM employees ORDER BY salary",
            "result": {
                "cols": ["name", "salary"],
                "rows": [
                    ["Bob", 45000],
                    ["Alice", 60000],
                    ["Charlie", 70000],
                ],
            },
        },
        {
            "qid": "E10",
            "text": "Show top paid employee",
            "expected_sql": "SELECT name, salary FROM employees ORDER BY salary DESC LIMIT 1",
            "result": {
                "cols": ["name", "salary"],
                "rows": [["Charlie", 70000]],
            },
        },
    ],

    # ---------------- MEDIUM (10) ----------------
    "medium": [
        {
            "qid": "M1",
            "text": "Find average salary of employees",
            "expected_sql": "SELECT AVG(salary) FROM employees",
            "result": {
                "cols": ["avg_salary"],
                "rows": [[58333]],
            },
        },
        {
            "qid": "M2",
            "text": "Find total salary per department",
            "expected_sql": "SELECT department, SUM(salary) FROM employees GROUP BY department",
            "result": {
                "cols": ["department", "total_salary"],
                "rows": [
                    ["IT", 130000],
                    ["HR", 45000],
                ],
            },
        },
        {
            "qid": "M3",
            "text": "Count employees per department",
            "expected_sql": "SELECT department, COUNT(*) FROM employees GROUP BY department",
            "result": {
                "cols": ["department", "count"],
                "rows": [
                    ["IT", 2],
                    ["HR", 1],
                ],
            },
        },
        {
            "qid": "M4",
            "text": "Show departments having more than one employee",
            "expected_sql": "SELECT department FROM employees GROUP BY department HAVING COUNT(*) > 1",
            "result": {
                "cols": ["department"],
                "rows": [["IT"]],
            },
        },
        {
            "qid": "M5",
            "text": "Join employees with departments",
            "expected_sql": "SELECT name, dept_name FROM employees JOIN departments ON department = dept_name",
            "result": {
                "cols": ["name", "dept_name"],
                "rows": [
                    ["Alice", "IT"],
                    ["Bob", "HR"],
                    ["Charlie", "IT"],
                ],
            },
        },
        {
            "qid": "M6",
            "text": "Find max salary",
            "expected_sql": "SELECT MAX(salary) FROM employees",
            "result": {
                "cols": ["max_salary"],
                "rows": [[70000]],
            },
        },
        {
            "qid": "M7",
            "text": "Find min salary",
            "expected_sql": "SELECT MIN(salary) FROM employees",
            "result": {
                "cols": ["min_salary"],
                "rows": [[45000]],
            },
        },
        {
            "qid": "M8",
            "text": "Find employees hired after 2020",
            "expected_sql": "SELECT name FROM employees WHERE hire_date > '2020-01-01'",
            "result": {
                "cols": ["name"],
                "rows": [["Alice"]],
            },
        },
        {
            "qid": "M9",
            "text": "Order employees by hire date",
            "expected_sql": "SELECT name, hire_date FROM employees ORDER BY hire_date",
            "result": {
                "cols": ["name", "hire_date"],
                "rows": [
                    ["Charlie", "2019-11-20"],
                    ["Bob", "2020-07-15"],
                    ["Alice", "2021-03-01"],
                ],
            },
        },
        {
            "qid": "M10",
            "text": "Find second highest salary",
            "expected_sql": "SELECT salary FROM employees ORDER BY salary DESC LIMIT 1 OFFSET 1",
            "result": {
                "cols": ["salary"],
                "rows": [[60000]],
            },
        },
    ],

    # ---------------- HARD (10) ----------------
    "hard": [
        {
            "qid": "H1",
            "text": "Find employees earning above average salary",
            "expected_sql": "SELECT name FROM employees WHERE salary > (SELECT AVG(salary) FROM employees)",
            "result": {
                "cols": ["name"],
                "rows": [["Alice"], ["Charlie"]],
            },
        },
        {
            "qid": "H2",
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
            "qid": "H3",
            "text": "Find department with highest total salary",
            "expected_sql": "SELECT department FROM employees GROUP BY department ORDER BY SUM(salary) DESC LIMIT 1",
            "result": {
                "cols": ["department"],
                "rows": [["IT"]],
            },
        },
        {
            "qid": "H4",
            "text": "Find employees without department",
            "expected_sql": "SELECT name FROM employees WHERE department IS NULL",
            "result": {
                "cols": ["name"],
                "rows": [],
            },
        },
        {
            "qid": "H5",
            "text": "Find duplicate departments",
            "expected_sql": "SELECT department FROM employees GROUP BY department HAVING COUNT(*) > 1",
            "result": {
                "cols": ["department"],
                "rows": [["IT"]],
            },
        },
        {
            "qid": "H6",
            "text": "Calculate cumulative salary",
            "expected_sql": "SELECT name, SUM(salary) OVER (ORDER BY hire_date) FROM employees",
            "result": {
                "cols": ["name", "cumulative_salary"],
                "rows": [
                    ["Charlie", 70000],
                    ["Bob", 115000],
                    ["Alice", 175000],
                ],
            },
        },
        {
            "qid": "H7",
            "text": "Get latest hired employee",
            "expected_sql": "SELECT name FROM employees ORDER BY hire_date DESC LIMIT 1",
            "result": {
                "cols": ["name"],
                "rows": [["Alice"]],
            },
        },
        {
            "qid": "H8",
            "text": "Find employees earning same salary",
            "expected_sql": "SELECT name FROM employees GROUP BY salary HAVING COUNT(*) > 1",
            "result": {
                "cols": ["name"],
                "rows": [],
            },
        },
        {
            "qid": "H9",
            "text": "Find median salary",
            "expected_sql": "SELECT AVG(salary) FROM (SELECT salary FROM employees ORDER BY salary LIMIT 2 OFFSET 1)",
            "result": {
                "cols": ["median_salary"],
                "rows": [[60000]],
            },
        },
        {
            "qid": "H10",
            "text": "Find department-wise highest salary",
            "expected_sql": "SELECT department, MAX(salary) FROM employees GROUP BY department",
            "result": {
                "cols": ["department", "max_salary"],
                "rows": [
                    ["IT", 70000],
                    ["HR", 45000],
                ],
            },
        },
    ],
}
