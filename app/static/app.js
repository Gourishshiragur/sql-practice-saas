console.log("✅ app.js loaded");

const TOTAL_QUESTIONS = 10;

/* -----------------------------
   LEVEL HELPERS
----------------------------- */
function getLevel() {
  return new URLSearchParams(window.location.search).get("level") || "easy";
}

function answeredKey() {
  return "answered_" + getLevel();
}

function correctKey() {
  return "correct_" + getLevel();
}

function getSet(key) {
  try {
    return new Set(JSON.parse(sessionStorage.getItem(key) || "[]"));
  } catch {
    return new Set();
  }
}

function saveSet(key, set) {
  sessionStorage.setItem(key, JSON.stringify([...set]));
}

/* -----------------------------
   PROGRESS + ACCURACY
----------------------------- */
function updateProgress() {
  const answered = getSet(answeredKey());
  const correct = getSet(correctKey());

  const progressBar = document.getElementById("progressBar");
  const progressText = document.getElementById("progressText");
  const accuracyText = document.getElementById("accuracyText");

  if (progressBar) {
    progressBar.style.width =
      Math.min((answered.size / TOTAL_QUESTIONS) * 100, 100) + "%";
  }

  if (progressText) {
    progressText.innerText = `Progress: ${answered.size} / ${TOTAL_QUESTIONS}`;
  }

  if (accuracyText) {
    const accuracy =
      answered.size === 0
        ? 0
        : Math.round((correct.size / answered.size) * 100);

    accuracyText.innerText =
      `Accuracy: ${accuracy}% (${correct.size} correct)`;
  }
}

function markAnswered(qid, isCorrect) {
  const answered = getSet(answeredKey());
  const correct = getSet(correctKey());

  if (!answered.has(qid) && answered.size < TOTAL_QUESTIONS) {
    answered.add(qid);
    saveSet(answeredKey(), answered);
  }

  if (isCorrect) {
    correct.add(qid);
    saveSet(correctKey(), correct);
  }

  updateProgress();
}

document.addEventListener("DOMContentLoaded", updateProgress);

/* -----------------------------
   TABLE RENDER (SQL STYLE)
----------------------------- */
function renderTable(cols, rows) {
  let html = "<table><tr>";
  cols.forEach(c => html += `<th>${c}</th>`);
  html += "</tr>";

  rows.forEach(r => {
    html += "<tr>";
    r.forEach(v => html += `<td>${v}</td>`);
    html += "</tr>";
  });

  html += "</table>";
  return html;
}

/* -----------------------------
   RUN QUERY
----------------------------- */
async function runQuery() {
  const qid = document.getElementById("qid").value;
  const sql = document.getElementById("sql").value;
  const out = document.getElementById("output");

  out.innerHTML = "⏳ Running...";

  const res = await fetch("/run", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ qid, user_sql: sql })
  });

  const data = await res.json();
  const isCorrect = data.status === "correct";

  markAnswered(qid, isCorrect);

  out.innerHTML = `
    <p>${isCorrect ? "✅ Correct" : "❌ Wrong"}</p>
    <pre>${data.expected_sql}</pre>
    ${renderTable(data.cols, data.rows)}
  `;
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

  // show answer ≠ correct
  markAnswered(qid, false);

  out.innerHTML = `
    <h4>Correct Query</h4>
    <pre>${data.expected_sql}</pre>
    ${renderTable(data.cols, data.rows)}
  `;
}

/* -----------------------------
   SHOW AVAILABLE TABLES
----------------------------- */
let tablesVisible = false;

async function toggleTables() {
  const panel = document.getElementById("tablePanel");
  const info = document.getElementById("tableInfo");

  if (!tablesVisible) {
    const res = await fetch("/tables");
    const data = await res.json();

    let html = "";
    for (const [table, obj] of Object.entries(data)) {
      html += `<h5>${table}</h5>`;
      html += renderTable(obj.columns, obj.rows);
    }

    info.innerHTML = html;
    panel.style.display = "block";
  } else {
    panel.style.display = "none";
  }

  tablesVisible = !tablesVisible;
}
