console.log("✅ app.js loaded");

const TOTAL_QUESTIONS = 10;

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
  return new Set(JSON.parse(sessionStorage.getItem(key) || "[]"));
}

function saveSet(key, set) {
  sessionStorage.setItem(key, JSON.stringify([...set]));
}

function updateProgress() {
  const answered = getSet(answeredKey());
  const correct = getSet(correctKey());

  document.getElementById("progressBar").style.width =
    Math.min((answered.size / TOTAL_QUESTIONS) * 100, 100) + "%";

  document.getElementById("progressText").innerText =
    `Progress: ${answered.size} / ${TOTAL_QUESTIONS}`;

  const accuracy =
    answered.size === 0 ? 0 : Math.round((correct.size / answered.size) * 100);

  document.getElementById("accuracyText").innerText =
    `Accuracy: ${accuracy}% (${correct.size} correct)`;
}

function markAnswered(qid, isCorrect) {
  const answered = getSet(answeredKey());
  const correct = getSet(correctKey());

  if (!answered.has(qid)) answered.add(qid);
  if (isCorrect) correct.add(qid);

  saveSet(answeredKey(), answered);
  saveSet(correctKey(), correct);

  updateProgress();
}

document.addEventListener("DOMContentLoaded", updateProgress);

function renderTable(cols, rows) {
  let html = "<table><tr>";
  cols.forEach(c => html += `<th>${c}</th>`);
  html += "</tr>";

  rows.forEach(r => {
    html += "<tr>";
    r.forEach(v => html += `<td>${v}</td>`);
    html += "</tr>";
  });

  return html + "</table>";
}

async function runQuery() {
  const qid = document.getElementById("qid").value;
  const sql = document.getElementById("sql").value;
  const out = document.getElementById("output");

  const res = await fetch("/run", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ qid, user_sql: sql })
  });

  const data = await res.json();
  const correct = data.status === "correct";

  markAnswered(qid, correct);

  out.innerHTML = `
    <p>${correct ? "✅ Correct" : "❌ Wrong"}</p>
    <pre>${data.expected_sql}</pre>
    ${renderTable(data.cols, data.rows)}
  `;
}

async function showAnswer() {
  const qid = document.getElementById("qid").value;
  const out = document.getElementById("output");

  const res = await fetch("/show-answer", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ qid })
  });

  const data = await res.json();

  markAnswered(qid, false);

  out.innerHTML = `
    <h4>Correct Query</h4>
    <pre>${data.expected_sql}</pre>
    ${renderTable(data.cols, data.rows)}
  `;
}

let tablesVisible = false;

async function toggleTables() {
  const panel = document.getElementById("tablePanel");
  const info = document.getElementById("tableInfo");

  if (!tablesVisible) {
    const res = await fetch("/tables");
    const data = await res.json();

    let html = "";
    for (const [name, t] of Object.entries(data)) {
      html += `<h4>${name}</h4>`;
      html += renderTable(t.columns, t.rows);
    }

    info.innerHTML = html;
    panel.style.display = "block";
  } else {
    panel.style.display = "none";
  }

  tablesVisible = !tablesVisible;
}
