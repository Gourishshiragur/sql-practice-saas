const TOTAL_QUESTIONS = 10;

/* -----------------------------
   PROGRESS BAR
----------------------------- */
function updateProgress() {
  let count = sessionStorage.getItem("progressCount");
  count = count ? parseInt(count) : 0;

  const percent = Math.min((count / TOTAL_QUESTIONS) * 100, 100);

  document.getElementById("progressBar").style.width = percent + "%";
  document.getElementById("progressText").innerText =
    `Progress: ${count} / ${TOTAL_QUESTIONS}`;
}

function incrementProgress() {
  let count = sessionStorage.getItem("progressCount");
  count = count ? parseInt(count) : 0;
  sessionStorage.setItem("progressCount", count + 1);
  updateProgress();
}

document.addEventListener("DOMContentLoaded", updateProgress);

/* -----------------------------
   TABLE RENDERER
----------------------------- */
function renderResultTable(cols, rows) {
  if (!cols || !rows) return "";

  let html = "<table><tr>";
  cols.forEach(c => html += `<th>${c}</th>`);
  html += "</tr>";

  if (rows.length === 0) {
    html += `<tr><td colspan="${cols.length}">No rows</td></tr>`;
  } else {
    rows.forEach(r => {
      html += "<tr>";
      r.forEach(v => html += `<td>${v}</td>`);
      html += "</tr>";
    });
  }

  html += "</table>";
  return html;
}

/* -----------------------------
   RUN QUERY (FIXED)
----------------------------- */
async function runQuery() {
  const sql = document.getElementById("sql").value.trim();
  const qid = document.getElementById("qid").value;
  const out = document.getElementById("output");

  if (!sql) {
    out.innerHTML = "<p class='bad'>Please write a query</p>";
    return;
  }

  out.innerHTML = "⏳ Running...";

  const res = await fetch("/run", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ user_sql: sql, qid })
  });

  const data = await res.json();

  incrementProgress();

  if (data.status === "correct") {
    out.innerHTML = `
      <p class="ok">✅ Correct</p>
      <pre>${data.expected_sql}</pre>
      ${renderResultTable(data.cols, data.rows)}
    `;
  } else {
    out.innerHTML = `
      <p class="bad">❌ Wrong</p>
      <h4>Correct Query</h4>
      <pre>${data.expected_sql}</pre>
      ${renderResultTable(data.cols, data.rows)}
    `;
  }
}

/* -----------------------------
   SHOW ANSWER (FIXED)
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

  incrementProgress();

  out.innerHTML = `
    <h4>Correct Query</h4>
    <pre>${data.expected_sql}</pre>
    ${renderResultTable(data.cols, data.rows)}
  `;
}

/* -----------------------------
   TABLE TOGGLE (UNCHANGED)
----------------------------- */
let tablesVisible = false;

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

async function loadTableInfo() {
  const res = await fetch("/tables");
  const data = await res.json();

  let html = "";
  for (const name in data) {
    html += `<h4>${name}</h4>`;
    html += renderResultTable(data[name].columns, data[name].rows);
    html += "<br>";
  }

  document.getElementById("tableInfo").innerHTML = html;
}
