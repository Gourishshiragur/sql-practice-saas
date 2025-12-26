QUESTIONS = {
    "easy": [
        {
            "qid": f"E{i}",
            "text": f"Easy question {i}",
            "expected_sql": "SELECT name, salary FROM employees",
            "result": {
                "cols": ["name", "salary"],
                "rows": [
                    ["Alice", 60000],
                    ["Bob", 45000],
                    ["Charlie", 70000],
                ],
            },
        }
        for i in range(1, 11)
    ],
    "medium": [
        {
            "qid": f"M{i}",
            "text": f"Medium question {i}",
            "expected_sql": "SELECT department, AVG(salary) FROM employees GROUP BY department",
            "result": {
                "cols": ["department", "avg_salary"],
                "rows": [
                    ["IT", 65000],
                    ["HR", 45000],
                ],
            },
        }
        for i in range(1, 11)
    ],
    "hard": [
        {
            "qid": f"H{i}",
            "text": f"Hard question {i}",
            "expected_sql": "SELECT e.name, d.dept_name FROM employees e JOIN departments d ON e.department = d.dept_name",
            "result": {
                "cols": ["name", "dept_name"],
                "rows": [
                    ["Alice", "IT"],
                    ["Bob", "HR"],
                ],
            },
        }
        for i in range(1, 11)
    ],
}
