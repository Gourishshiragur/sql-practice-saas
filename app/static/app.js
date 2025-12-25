const TOTAL_QUESTIONS = 10;

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


console.log("✅ app.js loaded");

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
    incrementProgress();

    out.innerHTML = `
      <p class="ok">✅ Correct</p>
      ${renderTable(data.cols, data.rows)}
    `;
  } else if (data.status === "wrong") {
    incrementProgress();

    out.innerHTML = `
      <p class="bad">❌ Wrong</p>
      <h4>Correct Query</h4>
      <pre>${data.expected_sql}</pre>
      ${renderTable(data.cols, data.rows)}
    `;
  } else {
    out.innerHTML = `<p class="bad">${data.message}</p>`;
  }
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

  out.innerHTML = `
    <h4>Correct Query</h4>
    <pre>${data.expected_sql}</pre>
    ${renderTable(data.cols, data.rows)}
  `;
}

function clearUI() {
  document.getElementById("sql").value = "";
  document.getElementById("output").innerHTML = "";
}
document.addEventListener("DOMContentLoaded", updateProgress);
