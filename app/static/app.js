const TOTAL_QUESTIONS = 10;

/* -----------------------------
   PROGRESS BAR (FIXED)
----------------------------- */
function getAnsweredSet() {
  const stored = sessionStorage.getItem("answeredQids");
  return stored ? new Set(JSON.parse(stored)) : new Set();
}

function saveAnsweredSet(set) {
  sessionStorage.setItem("answeredQids", JSON.stringify([...set]));
}

function updateProgress() {
  const answered = getAnsweredSet();
  const count = Math.min(answered.size, TOTAL_QUESTIONS);

  const percent = (count / TOTAL_QUESTIONS) * 100;

  const bar = document.getElementById("progressBar");
  const text = document.getElementById("progressText");

  if (bar) bar.style.width = percent + "%";
  if (text) text.innerText = `Progress: ${count} / ${TOTAL_QUESTIONS}`;
}

function markAnswered(qid) {
  const answered = getAnsweredSet();

  if (answered.has(qid)) {
    return false; // already counted
  }

  if (answered.size >= TOTAL_QUESTIONS) {
    return false; // progress full
  }

  answered.add(qid);
  saveAnsweredSet(answered);
  updateProgress();
  return true;
}

document.addEventListener("DOMContentLoaded", updateProgress);

/* -----------------------------
   TABLE RENDERER
----------------------------- */
function renderResultTable(cols, rows) {
  let html = "<table><tr>";
  cols.forEach(c => html += `<th>${c}</th>`);
  html += "</tr>";

  if (!rows || rows.length === 0) {
    html += `<tr><td colspan="${cols.length}">No data</td></tr>`;
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
    out.innerHTML = "<p class='bad'>Please write a SQL query</p>";
    return;
  }

  out.innerHTML = "⏳ Running...";

  const res = await fetch("/run", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ user_sql: sql, qid })
  });

  const data = await res.json();

  // ✅ progress counted ONLY ONCE per question
  markAnswered(qid);

  out.innerHTML = `
    <p>${data.status === "correct" ? "✅ Correct" : "❌ Wrong"}</p>
    <pre>${data.expected_sql}</pre>
    ${renderResultTable(data.cols, data.rows)}
  `;
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

  // ✅ progress counted ONLY ONCE per question
  markAnswered(qid);

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
