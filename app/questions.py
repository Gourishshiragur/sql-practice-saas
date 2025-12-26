QUESTIONS = {
    "easy": [
        {"qid": "E1", "text": "Select all columns from employees", "expected_sql": "SELECT * FROM employees"},
        {"qid": "E2", "text": "Get employee names and salaries", "expected_sql": "SELECT name, salary FROM employees"},
        {"qid": "E3", "text": "Find employees in IT department", "expected_sql": "SELECT * FROM employees WHERE department = 'IT'"},
        {"qid": "E4", "text": "List unique departments", "expected_sql": "SELECT DISTINCT department FROM employees"},
        {"qid": "E5", "text": "Employees with salary > 50000", "expected_sql": "SELECT * FROM employees WHERE salary > 50000"},
        {"qid": "E6", "text": "Order employees by salary desc", "expected_sql": "SELECT * FROM employees ORDER BY salary DESC"},
        {"qid": "E7", "text": "Count employees", "expected_sql": "SELECT COUNT(*) FROM employees"},
        {"qid": "E8", "text": "Employees hired after 2020", "expected_sql": "SELECT * FROM employees WHERE hire_date > '2020-01-01'"},
        {"qid": "E9", "text": "Top 5 salaries", "expected_sql": "SELECT * FROM employees ORDER BY salary DESC LIMIT 5"},
        {"qid": "E10", "text": "Employees with NULL manager", "expected_sql": "SELECT * FROM employees WHERE manager_id IS NULL"}
    ],

    "medium": [
        {"qid": "M1", "text": "Avg salary per department", "expected_sql": "SELECT department, AVG(salary) FROM employees GROUP BY department"},
        {"qid": "M2", "text": "Count employees per department", "expected_sql": "SELECT department, COUNT(*) FROM employees GROUP BY department"},
        {"qid": "M3", "text": "Departments with >5 employees", "expected_sql": "SELECT department FROM employees GROUP BY department HAVING COUNT(*) > 5"},
        {"qid": "M4", "text": "Max salary per department", "expected_sql": "SELECT department, MAX(salary) FROM employees GROUP BY department"},
        {"qid": "M5", "text": "Join employees & departments", "expected_sql": "SELECT e.*, d.dept_name FROM employees e JOIN departments d ON e.department = d.dept_id"},
        {"qid": "M6", "text": "Salary above department avg", "expected_sql": "SELECT * FROM employees e WHERE salary > (SELECT AVG(salary) FROM employees WHERE department = e.department)"},
        {"qid": "M7", "text": "Second highest salary", "expected_sql": "SELECT MAX(salary) FROM employees WHERE salary < (SELECT MAX(salary) FROM employees)"},
        {"qid": "M8", "text": "Employees hired last 2 years", "expected_sql": "SELECT * FROM employees WHERE hire_date >= CURRENT_DATE - INTERVAL '2 years'"},
        {"qid": "M9", "text": "Total salary per dept", "expected_sql": "SELECT department, SUM(salary) FROM employees GROUP BY department"},
        {"qid": "M10", "text": "Employees without department", "expected_sql": "SELECT * FROM employees e LEFT JOIN departments d ON e.department=d.dept_id WHERE d.dept_id IS NULL"}
    ],

    "hard": [
        {"qid": "H1", "text": "Rank salary by department", "expected_sql": "SELECT *, RANK() OVER(PARTITION BY department ORDER BY salary DESC) FROM employees"},
        {"qid": "H2", "text": "Top 2 salaries per dept", "expected_sql": "SELECT * FROM (SELECT *, DENSE_RANK() OVER(PARTITION BY department ORDER BY salary DESC) r FROM employees) t WHERE r<=2"},
        {"qid": "H3", "text": "Running salary total", "expected_sql": "SELECT hire_date, SUM(salary) OVER(ORDER BY hire_date) FROM employees"},
        {"qid": "H4", "text": "Company avg salary higher", "expected_sql": "SELECT * FROM employees WHERE salary > (SELECT AVG(salary) FROM employees)"},
        {"qid": "H5", "text": "Nth highest salary", "expected_sql": "SELECT DISTINCT salary FROM employees ORDER BY salary DESC LIMIT 1 OFFSET 2"},
        {"qid": "H6", "text": "Duplicate salaries", "expected_sql": "SELECT salary FROM employees GROUP BY salary HAVING COUNT(*)>1"},
        {"qid": "H7", "text": "Employees without hike", "expected_sql": "SELECT * FROM employees e WHERE NOT EXISTS (SELECT 1 FROM salary_history s WHERE s.emp_id=e.id)"},
        {"qid": "H8", "text": "Find gaps in IDs", "expected_sql": "SELECT id+1 FROM employees e WHERE NOT EXISTS (SELECT 1 FROM employees WHERE id=e.id+1)"},
        {"qid": "H9", "text": "Pivot salaries", "expected_sql": "SELECT SUM(CASE WHEN department='IT' THEN salary END) IT FROM employees"},
        {"qid": "H10", "text": "Highest salary per dept", "expected_sql": "SELECT department, MAX(salary) FROM employees GROUP BY department"}
    ]
}
