let tablesVisible = false;

/* -----------------------------
   TOGGLE TABLE PANEL
----------------------------- */
async function toggleTables() {
  const panel = document.getElementById("tablePanel");
  const left = document.getElementById("leftPanel");

  if (!tablesVisible) {
    panel.style.display = "block";
    left.style.width = "65%";
    panel.style.width = "35%";
    await loadTableInfo();
  } else {
    panel.style.display = "none";
    left.style.width = "100%";
  }

  tablesVisible = !tablesVisible;
}

/* -----------------------------
   LOAD TABLE DATA (SQL STYLE)
----------------------------- */
async function loadTableInfo() {
  const res = await fetch("/tables");
  const data = await res.json();

  let html = "";

  for (const tableName in data) {
    const table = data[tableName];

    html += `<h4>${tableName}</h4>`;
    html += `<table>`;
    html += `<tr>`;

    table.columns.forEach(col => {
      html += `<th>${col}</th>`;
    });

    html += `</tr>`;

    table.rows.forEach(row => {
      html += `<tr>`;
      row.forEach(cell => {
        html += `<td>${cell}</td>`;
      });
      html += `</tr>`;
    });

    html += `</table><br>`;
  }

  document.getElementById("tableInfo").innerHTML = html;
}

/* -----------------------------
   RUN QUERY
----------------------------- */
async function runQuery() {
  const sql = document.getElementById("sql").value;
  const qid = document.getElementById("qid").value;
  const out = document.getElementById("output");

  out.innerHTML = "⏳ Running...";

  const res = await fetch("/run", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ user_sql: sql, qid })
  });

  const data = await res.json();

  if (data.status === "correct") {
    out.innerHTML = `<p class="ok">✅ Correct</p>`;
  } else {
    out.innerHTML = `
      <p class="bad">❌ Wrong</p>
      <h4>Correct Query</h4>
      <pre>${data.expected_sql}</pre>
    `;
  }
}

/* -----------------------------
   SHOW ANSWER
----------------------------- */
async function showAnswer() {
  const qid = document.getElementById("qid").value;
  const out = document.getElementById("output");

  const res = await fetch("/show-answer", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ qid })
  });

  const data = await res.json();

  out.innerHTML = `
    <h4>Correct Query</h4>
    <pre>${data.expected_sql}</pre>
  `;
}
